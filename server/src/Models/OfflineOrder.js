import mongoose from "mongoose";

const offlineOrderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true,
        },

        customerName: {
            type: String,
            required: true,
            trim: true,
            default: "Walk-in Customer",
        },

        salesperson: {
            type: String,
            required: true,
            trim: true,
        },

        itemsSold: {
            type: String,
            required: true,
            trim: true,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "card", "upi", "card_cash", "advance"],
            default: "cash",
        },

        status: {
            type: String,
            enum: ["completed", "pending"],
            default: "completed",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("OfflineOrder", offlineOrderSchema);