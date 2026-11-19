import mongoose from "mongoose";

const offlineOrderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        costPriceSnapshot: {
            type: Number,
            min: 0,
        },
        qty: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: false }
);

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

        items: {
            type: [offlineOrderItemSchema],
            default: undefined,
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