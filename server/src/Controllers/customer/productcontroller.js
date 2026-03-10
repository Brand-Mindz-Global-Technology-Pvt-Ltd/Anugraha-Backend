import Product from "../../Models/Product.js";
import Category from "../../Models/Category.js";


export const getPublicProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subCategory,
      search,
      minPrice,
      maxPrice, 
      rating,
      sort = "newest",
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    /* SORTING */
    const sortMap = {
      newest: { createdAt: -1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
      rating: { rating: -1 },
    };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(
          "name slug price oldPrice discount rating images brand category subCategory stock"
        )
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Public Products Error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getPublicSingleProduct = async (req, res) => {
  try {
    const { slug, id } = req.params;

    const product = await Product.findOne({
      _id: id,
      slug,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    console.error("Get Single Product Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const getPublicCategoriesWithSubCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      parentId: null,
      status: "active",
    })
      .select("name slug")
      .sort({ name: 1 })
      .lean();

    const categoryIds = categories.map((cat) => cat._id);

    const subCategories = await Category.find({
      parentId: { $in: categoryIds },
      status: "active",
    })
      .select("name slug parentId")
      .lean();

    /* Map sub-categories to parent */
    const categoryMap = categories.map((cat) => ({
      ...cat,
      subCategories: subCategories.filter(
        (sub) => sub.parentId.toString() === cat._id.toString()
      ),
    }));

    res.json({
      success: true,
      data: categoryMap,
    });
  } catch (err) {
    console.error("Category + SubCategory Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const query = q.trim();

    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const searchRegex = new RegExp(escaped, "i");

    const products = await Product.find({
     $or: [
        { name: searchRegex },
        { slug: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex }
      ]
    })
      .select("name slug brand category subCategory price images _id")
      .lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Search failed"
    });
  }
};

