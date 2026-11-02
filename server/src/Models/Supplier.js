import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        contactPerson: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            trim: true,
            default: "",
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Supplier", supplierSchema);