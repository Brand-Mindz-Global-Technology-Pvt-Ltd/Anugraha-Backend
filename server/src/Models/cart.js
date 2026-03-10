
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      default: null,
    },
    nameSnapshot: String,
    imageSnapshot: String,
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true, 
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.index({ customer: 1 }, { unique: true });

export default mongoose.model("Cart", cartSchema);