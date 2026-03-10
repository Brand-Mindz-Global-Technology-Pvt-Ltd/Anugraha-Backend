import Product from "../Models/Product.js";
import Category from "../Models/Category.js";

export const getInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      subCategory,
      status,
    } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (status === "Low") query.stock = { $lte: 10 };
    if (status === "Medium") query.stock = { $gt: 10, $lte: 100 };
    if (status === "High") query.stock = { $gt: 100 };

    const data = await Product.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: Number(page),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      status: "active",
      parentId: null,
    })
      .select("name slug")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const exportInventoryCSV = async (req, res) => {
  try {
    const { search = "", category = "", status = "" } = req.query;

    const query = {};

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    // Category
    if (category) {
      query.category = category;
    }

    // Stock Status
    if (status === "Low") query.stock = { $lt: 100 };
    if (status === "Medium") query.stock = { $gte: 100, $lt: 200 };
    if (status === "High") query.stock = { $gte: 200 };

    const products = await Product.find(query)
      .select("name category subCategory price stock")
      .lean();

    // CSV Header
    let csv = "Name,Category,SubCategory,Price,Stock,Status\n";

    products.forEach((p) => {
      const stockStatus =
        p.stock < 100 ? "Low" : p.stock < 200 ? "Medium" : "High";

      csv += `"${p.name}","${p.category}","${p.subCategory}",${p.price},${p.stock},"${stockStatus}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventory-export.csv"
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ success: false, message: "Export failed" });
  }
};




