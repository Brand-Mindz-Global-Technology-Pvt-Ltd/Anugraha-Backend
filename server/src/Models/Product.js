import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: String,
    price: Number,
    costPrice: { type: Number, min: 0 },
    oldPrice: Number,
    stock: Number,
    brand: String,
    discount: Number,
    category: String,
    subCategory: String,
    rams: [String],
    sizes: [String],
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: [
          "g",
          "kg",
          "L",
          "m",
          "pc",
          "mm",
          "cm",
          "in",
          "ft",
          "pac",
          "box",
          "dozen",
          "set",
        ],
      },
    },
    productId: {
      type: String,
      unique: true,
      required: true,
    },
    colors: [String],
    rating: { type: Number, min: 1, max: 5 },
    images: [String],
    lowStockAlert: {
      lastSentAt: { type: Date, default: null },
      lastAlertStock: { type: Number, default: null },
      outOfStockSent: { type: Boolean, default: false },
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
