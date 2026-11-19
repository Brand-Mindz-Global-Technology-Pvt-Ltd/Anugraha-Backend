import Product from "../Models/Product.js";
import Category from "../Models/Category.js";

const LOW_STOCK_THRESHOLD = 10;

/* ================= GET INVENTORY ================= */

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

    const baseQuery = {};

    if (search) {
      baseQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      baseQuery.category = category;
    }

    if (subCategory) {
      baseQuery.subCategory = subCategory;
    }

    const query = { ...baseQuery };

    if (status === "Low") {
      query.stock = { $lte: LOW_STOCK_THRESHOLD };
    }

    if (status === "Medium") {
      query.stock = { $gt: LOW_STOCK_THRESHOLD, $lte: 100 };
    }

    if (status === "High") {
      query.stock = { $gt: 100 };
    }

    const numericPage = Math.max(1, Number(page) || 1);
    const numericLimit = Math.max(1, Number(limit) || 10);

    const data = await Product.find(query)
      .limit(numericLimit)
      .skip((numericPage - 1) * numericLimit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(query);
    const lowStockCount = await Product.countDocuments({
      ...baseQuery,
      stock: { $lte: LOW_STOCK_THRESHOLD },
    });

    return res.status(200).json({
      success: true,
      data,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      lowStockCount,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / numericLimit),
        currentPage: numericPage,
      },
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory",
    });
  }
};

/* ================= GET ACTIVE CATEGORIES ================= */

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

/* ================= UPDATE STOCK ================= */

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const stockValue = Number(stock);

    if (!Number.isInteger(stockValue) || stockValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative whole number",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          stock: stockValue,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update stock error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update stock",
    });
  }
};

/* ================= EXPORT INVENTORY CSV ================= */

export const exportInventoryCSV = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      status = "",
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    // Existing export behavior preserved
    if (status === "Low") {
      query.stock = { $lt: 100 };
    }

    if (status === "Medium") {
      query.stock = {
        $gte: 100,
        $lt: 200,
      };
    }

    if (status === "High") {
      query.stock = { $gte: 200 };
    }

    const products = await Product.find(query)
      .select(
        "name productId category subCategory price stock"
      )
      .lean();

    let csv =
      "Name,SKU,Category,SubCategory,Price,Stock,Status\n";

    products.forEach((product) => {
      const stockStatus =
        product.stock < 100
          ? "Low"
          : product.stock < 200
            ? "Medium"
            : "High";

      const values = [
        product.name || "",
        product.productId || "",
        product.category || "",
        product.subCategory || "",
        product.price ?? 0,
        product.stock ?? 0,
        stockStatus,
      ];

      csv +=
        values
          .map((value) => {
            const text = String(value).replace(
              /"/g,
              '""'
            );

            return `"${text}"`;
          })
          .join(",") + "\n";
    });

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventory-export.csv"
    );

    return res.status(200).send(csv);
  } catch (error) {
    console.error("Export error:", error);

    return res.status(500).json({
      success: false,
      message: "Export failed",
    });
  }
};