import Wishlist from "../../Models/Wishlist.js";
import mongoose from "mongoose";

export const getWishlist = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid customerId required"
      });
    }

    const wishlist = await Wishlist.findOne({ customer: customerId })
      .populate("products", "name price images slug");

    return res.status(200).json({
      success: true,
      data: wishlist || { products: [] }
    });

  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist"
    });
  }
};


export const toggleWishlist = async (req, res) => {
  try {
    const { customerId, productId } = req.body;

    if (
      !customerId ||
      !productId ||
      !mongoose.Types.ObjectId.isValid(customerId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid customerId and productId required"
      });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);

    let wishlist = await Wishlist.findOne({ customer: customerId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        customer: customerId,
        products: [productObjectId]
      });

      return res.status(200).json({
        success: true,
        message: "Added to wishlist"
      });
    }

    const exists = wishlist.products.some(
      (id) => id.toString() === productId
    );

    if (exists) {
      await Wishlist.updateOne(
        { customer: customerId },
        { $pull: { products: productObjectId } }
      );

      return res.status(200).json({
        success: true,
        message: "Removed from wishlist"
      });
    }

    await Wishlist.updateOne(
      { customer: customerId },
      { $addToSet: { products: productObjectId } }
    );

    return res.status(200).json({
      success: true,
      message: "Added to wishlist"
    });

  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Wishlist update failed"
    });
  }
};

export const removeProductFromWishlist = async (req, res) => {
  try {
    const { customerId, productId } = req.body;

    if (!customerId || !productId) {
      return res.status(400).json({
        success: false,
        message: "CustomerId and ProductId required",
      });
    }

    const wishlist = await Wishlist.findOne({ customer: customerId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (item) => item.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const clearWishlist = async (req, res) => {
  try {
    const { customerId } = req.body;

    const wishlist = await Wishlist.findOne({ customer: customerId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
