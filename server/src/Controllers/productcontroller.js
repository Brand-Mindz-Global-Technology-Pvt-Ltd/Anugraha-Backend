import Product from "../Models/Product.js";
import Category from "../Models/Category.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../Config/s3.js";
import { ENV } from "../Config/env.js";

/* 🔹 SLUG GENERATOR (SAFE) */
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
        } = req.body;

        const adminId = req.user.id;

        /* ---------- BASIC VALIDATION ---------- */
        if (!name) {
            return res.status(400).json({ message: "Product name required" });
        }

        /* ---------- IMAGES ---------- */
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }

        const images = req.files.map((file) => file.location);

        /* ---------- SAFE PARSING ---------- */
        let parsedRams = [];
        let parsedSizes = [];

        try {
            parsedRams = rams ? JSON.parse(rams) : [];
            parsedSizes = sizes ? JSON.parse(sizes) : [];
        } catch (e) {
            return res.status(400).json({ message: "Invalid RAM or Size format" });
        }

        /* ---------- CREATE PRODUCT ---------- */
        const product = await Product.create({
            name,
            slug: generateSlug(name), // ✅ FIXED (was missing)
            description,

            price: price ? Number(price) : undefined,
            oldPrice: oldPrice ? Number(oldPrice) : undefined,
            stock: stock ? Number(stock) : undefined,
            discount: discount ? Number(discount) : undefined,

            brand,
            category,
            subCategory,

            rams: parsedRams,
            sizes: parsedSizes,

            weight: {
                value: weightValue ? Number(weightValue) : undefined,
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

        res.json({
            success: true,
            data: categories,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};


export const getSubCategories = async (req, res) => {
    try {
        const { categorySlug } = req.params;

        // 1️⃣ Find parent category
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

        // 2️⃣ Find subcategories using parentId
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


// controllers/product.controller.js
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

        // 🔥 SAFETY GUARD
        const body = req.body || {};
        console.log("BODY:", req.body);
        console.log("FILES:", req.files);


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

        /* ---------- PARSE EXISTING IMAGES ---------- */
        let keptImages = [];

        if (existingImages) {
            try {
                keptImages = JSON.parse(existingImages);
            } catch {
                return res.status(400).json({ message: "Invalid existingImages" });
            }
        }


        /* ---------- DELETE REMOVED IMAGES FROM S3 ---------- */
        /* ---------- DELETE REMOVED IMAGES FROM S3 ---------- */
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

