import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, unique: true, index: true },

        description: String,
        price: Number,
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
                enum: ["grams", "kgs", "liters", "meters", "pieces"],
            },
        },

        rating: { type: Number, min: 1, max: 5 },

        images: [String], // S3 URLs

        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);
