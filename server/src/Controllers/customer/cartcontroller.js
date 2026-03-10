import Cart from "../../Models/cart.js";
import Product from "../../Models/Product.js";

export const getCart = async (req, res) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID required",
      });
    }

    const cart = await Cart.findOne({ customer: customerId }).populate(
      "items.product",
      "name price images slug stock",
    );

    return res.status(200).json({
      success: true,
      data: cart || { items: [] },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { customerId, productId, quantity = 1, color = null } = req.body;

    if (!customerId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and Product ID are required",
      });
    }

    const parsedQuantity = Number(quantity);

    if (!parsedQuantity || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 🔥 CHECK STOCK AVAILABILITY
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    // 🔥 Validate color if product has colors
    if (product.colors?.length > 0) {
      if (!color) {
        return res.status(400).json({
          success: false,
          message: "Please select a color for this product",
        });
      }
      
      if (!product.colors.includes(color)) {
        return res.status(400).json({
          success: false,
          message: "Invalid color selection",
        });
      }
    }

    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      cart = new Cart({
        customer: customerId,
        items: [],
      });
    }

    const existingItem = cart.items.find((item) => {
      const isSameProduct = item.product.equals(product._id);
      
      if (product.colors?.length > 0) {
        return isSameProduct && item.color === color;
      }
      
      return isSameProduct && !item.color;
    });

    const currentCartQty = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentCartQty + parsedQuantity;

    if (totalQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock. You already have ${currentCartQty} in cart.`,
      });
    }

    if (existingItem) {
      existingItem.quantity += parsedQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: parsedQuantity,
        price: product.price,
        color: color || null, 
        nameSnapshot: product.name,
        imageSnapshot: product.images?.[0] || null,
      });
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      data: cart,
    });
  } catch (error) {
    console.error("Add To Cart Error:", error);
    return res.status(500).json({
      success: false,
      message: "Add to cart failed",
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { customerId, productId, quantity } = req.body;

    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { customerId, productId } = req.body;

    const cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed",
      data: cart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Remove failed",
    });
  }
};
