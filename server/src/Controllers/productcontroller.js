import Product from "../Models/Product.js";
import Category from "../Models/Category.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../Config/s3.js";
import { ENV } from "../Config/env.js";


const generateSlug = (name) => {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")    
        .replace(/(^-|-$)/g, "");

    return `${base}-${Math.floor(1000 + Math.random() * 9000)}`; 
};

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            productId,
            description,
            price,
            oldPrice,
            stock,
            brand,
            discount,
            category,
            subCategory,
            rams,
            sizes,
            colors,
            weightValue,
            weightUnit,
            rating,
        } = req.body;

        const adminId = req.user.id;

        /* ---------- BASIC VALIDATION ---------- */
        if (!name) {
            return res.status(400).json({ message: "Product name required" });
        }

        if (!productId) {
            return res.status(400).json({ message: "Product ID required" });
        }

        /* ---------- PREVENT DUPLICATE PRODUCT ID ---------- */
        const existing = await Product.findOne({ productId });
        if (existing) {
            return res.status(400).json({ message: "Product ID already exists" });
        }

        /* ---------- IMAGES ---------- */
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        const images = req.files.map((file) => file.location);

        /* ---------- SAFE PARSING ---------- */
        let parsedRams = [];
        let parsedSizes = [];
        let parsedColors = [];

        try {
            parsedRams = rams ? JSON.parse(rams) : [];
            parsedSizes = sizes ? JSON.parse(sizes) : [];
            parsedColors = colors ? JSON.parse(colors) : [];
        } catch {
            return res.status(400).json({ message: "Invalid array format" });
        }

        /* ---------- CREATE PRODUCT ---------- */
        const product = await Product.create({
            productId,
            name,
            slug: generateSlug(name),
            description,
            price: price ? Number(price) : 0,
            oldPrice: oldPrice ? Number(oldPrice) : 0,
            stock: stock ? Number(stock) : 0,
            discount: discount ? Number(discount) : 0,
            brand,
            category,
            subCategory,
            rams: parsedRams,
            sizes: parsedSizes,
            colors: parsedColors,
            weight: {
                value: weightValue ? Number(weightValue) : 0,
                unit: weightUnit,
            },
            rating: rating ? Number(rating) : 1,
            images,
            adminId,
        });

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (err) {
        console.error("Create Product Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            parentId: null,
            status: "active",
        }).select("name slug");

        const lastProduct = await Product.findOne({
            productId: { $exists: true },
        })
            .sort({ productId: -1 })
            .select("productId");

        let next = 1;

        if (lastProduct?.productId) {
            next = Number(lastProduct.productId.split("-")[1]) + 1;
        }

        const nextProductId = `PROD-${String(next).padStart(4, "0")}`;


        res.json({
            success: true,
            data: categories,
            productId: nextProductId, 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getSubCategories = async (req, res) => {
    try {
        const { categorySlug } = req.params;

        const parentCategory = await Category.findOne({
            slug: categorySlug,
            parentId: null,
            status: "active",
        });

        if (!parentCategory) {
            return res.status(404).json({
                message: "Parent category not found",
            });
        }

        const subCategories = await Category.find({
            parentId: parentCategory._id,
            status: "active",
        }).select("name slug");

        res.json({
            success: true,
            data: subCategories,
        });
    } catch (err) {
        console.error("Get SubCategories Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 8,
            category,
            subCategory,
            search,
        } = req.query;

        /* ================= FILTER ================= */
        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (subCategory) {
            filter.subCategory = subCategory;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
            ];
        }

        /* ================= PAGINATION ================= */
        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),

            Product.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / Number(limit));

        res.json({
            success: true,
            data: products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages,
            },
        });
    } catch (err) {
        console.error("Get products error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ success: true, message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};

export const getSingleProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true, data: product });
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const {
            name,
            description,
            price,
            oldPrice,
            stock,
            brand,
            discount,
            category,
            subCategory,
            rams,
            sizes,
            weightValue,
            weightUnit,
            rating,
            existingImages,
        } = body;

        /* ---------- FIND PRODUCT ---------- */
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let keptImages = [];

        if (existingImages) {
            try {
                keptImages = JSON.parse(existingImages);
            } catch {
                return res.status(400).json({ message: "Invalid existingImages" });
            }
        }

        const removedImages = product.images.filter(
            (img) => !keptImages.includes(img)
        );

        for (const imageUrl of removedImages) {
            try {
                const key = decodeURIComponent(
                    new URL(imageUrl).pathname.substring(1)
                );

                await s3.send(
                    new DeleteObjectCommand({
                        Bucket: ENV.AWS_BUCKET_NAME,
                        Key: key,
                    })
                );
                console.log('Delete successfully')
            } catch (err) {
                console.error("S3 delete failed:", imageUrl, err.message);
            }
        }


        /* ---------- NEW IMAGE UPLOAD ---------- */
        let newImages = [];

        if (req.files && req.files.length > 0) {
            newImages = req.files.map((file) => file.location);
        }

        /* ---------- SAFE PARSING ---------- */
        let parsedRams = product.rams || [];
        let parsedSizes = product.sizes || [];

        try {
            if (rams) parsedRams = JSON.parse(rams);
            if (sizes) parsedSizes = JSON.parse(sizes);
        } catch (err) {
            return res.status(400).json({ message: "Invalid RAM or Size format" });
        }

        /* ---------- UPDATE FIELDS ---------- */
        if (name) {
            product.name = name;
            product.slug = generateSlug(name);
        }

        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = Number(price);
        if (oldPrice !== undefined) product.oldPrice = Number(oldPrice);
        if (stock !== undefined) product.stock = Number(stock);
        if (discount !== undefined) product.discount = Number(discount);

        if (brand !== undefined) product.brand = brand;
        if (category !== undefined) product.category = category;
        if (subCategory !== undefined) product.subCategory = subCategory;

        product.rams = parsedRams;
        product.sizes = parsedSizes;

        product.weight = {
            value:
                weightValue !== undefined
                    ? Number(weightValue)
                    : product.weight?.value,
            unit: weightUnit || product.weight?.unit,
        };

        if (rating !== undefined) product.rating = Number(rating);

        /* ---------- FINAL IMAGE SET ---------- */
        product.images = [...keptImages, ...newImages];

        await product.save();

        res.json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (err) {
        console.error("Update Product Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const bulkUploadProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid products data",
      });
    }

    const adminId = req.user?.id; 

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const lastProduct = await Product.findOne({})
      .sort({ productId: -1 })
      .select("productId");

    let lastNumber = 0;

    if (lastProduct?.productId) {
      const match = lastProduct.productId.match(/\d+/);
      if (match) {
        lastNumber = parseInt(match[0], 10);
      }
    }

    const formattedProducts = products.map((item, index) => {
      const newNumber = lastNumber + index + 1;

      return {
        name: item.name?.trim(),
        slug: generateSlug(item.name),
        productId: `PRD${String(newNumber).padStart(5, "0")}`,
        description: item.description || "",
        price: Number(item.price),
        oldPrice: Number(item.oldPrice) || 0,
        stock: Number(item.stock),
        brand: item.brand,
        category: item.category,
        subCategory: item.subCategory || "",
        adminId: adminId,   
      };
    });

    const insertedProducts = await Product.insertMany(formattedProducts);

    return res.status(201).json({
      success: true,
      insertedCount: insertedProducts.length,
    });

  } catch (error) {
    console.error("Bulk Upload Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message, // show real error for debugging
    });
  }
};


