import dotenv from "dotenv";
import mongoose from "mongoose";
import mysql from "mysql2/promise";

import Admin from "../src/Models/admin.js";
import Category from "../src/Models/Category.js";
import Product from "../src/Models/Product.js";

dotenv.config();

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const runMigration = async () => {
  let mysqlConnection;

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Connect to old MySQL database using existing environment settings
    mysqlConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("MySQL connected");

    // Find the admin account that already exists in MongoDB
    const admin = await Admin.findOne({ isDeleted: { $ne: true } });

    if (!admin) {
      throw new Error("No admin found in MongoDB. Please log in/register first.");
    }

    // Read categories from MySQL
    const [oldCategories] = await mysqlConnection.query(
      "SELECT * FROM categories ORDER BY id"
    );

    const categoryMap = new Map();

    for (const oldCategory of oldCategories) {
      const slug = slugify(oldCategory.name);

      let category = await Category.findOne({
        adminId: admin._id,
        slug,
      });

      if (!category) {
        category = await Category.create({
          adminId: admin._id,
          name: oldCategory.name,
          slug,
          status: "active",
        });
      }

      categoryMap.set(Number(oldCategory.id), category);
    }

    console.log(`Categories migrated/available: ${categoryMap.size}`);

    // Read products from MySQL
    const [oldProducts] = await mysqlConnection.query(
      "SELECT * FROM products ORDER BY id"
    );

    let productCount = 0;

    for (const oldProduct of oldProducts) {
      const productId =
        oldProduct.sku?.trim() || `OLD-${oldProduct.id}`;

      const slug = slugify(oldProduct.name);

      const category = categoryMap.get(Number(oldProduct.category_id));

      // Avoid creating duplicate products when the script is run again
      let product = await Product.findOne({
        adminId: admin._id,
        productId,
      });

      if (!product) {
        product = await Product.create({
          adminId: admin._id,
          name: oldProduct.name,
          slug: `${slug}-${oldProduct.id}`,
          description: oldProduct.description || "",
          price: Number(oldProduct.price) || 0,
          stock: Number(oldProduct.stock) || 0,
          productId,
          category: category?.name || "",
          images: oldProduct.image ? [oldProduct.image] : [],
          brand: oldProduct.supplier || "",
        });
      }

      productCount++;
    }

    console.log(`Products migrated/available: ${productCount}`);
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
    }

    await mongoose.disconnect();
  }
};

runMigration();