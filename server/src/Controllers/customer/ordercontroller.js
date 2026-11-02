
import Order from "../../Models/Order.js";
import Cart from "../../Models/cart.js";
import Product from "../../Models/Product.js";

const generateOrderId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${date}-${rand}`;
};

const validateOrderBody = (body) => {
  const { customerId, shippingAddressId, items, totalAmount } = body;

  if (!customerId) return "customerId is required.";
  if (!shippingAddressId) return "shippingAddressId is required.";
  if (!Array.isArray(items) || items.length === 0)
    return "Order must have at least one item.";
  if (!totalAmount || totalAmount <= 0) return "Invalid totalAmount.";

  return null;
};

const checkStock = async (items) => {
  for (const item of items) {
    if (!item.productId) {
      return { ok: false, message: "Each item needs a productId." };
    }

    const product = await Product.findById(item.productId);

    if (!product) {
      return {
        ok: false,
        message: `Product not found: "${item.name}"`,
      };
    }

    if (product.stock < item.qty) {
      return {
        ok: false,
        message: `Not enough stock for "${product.name}". Available: ${product.stock}.`,
      };
    }
  }

  return { ok: true };
};

const shapeItems = (items) =>
  items.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: i.price,
    qty: i.qty,
    color: i.color || null,
    size: i.size || null,
    image: i.image || null,
    slug: i.slug || null,
  }));

const postOrderCleanup = async (items, customerId) => {
  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty },
      })
    )
  );

  await Cart.findOneAndUpdate(
    { customerId },
    { $set: { items: [] } }
  );
};

// Create Cash on Delivery order
export const createCodOrder = async (req, res) => {
  try {
    const err = validateOrderBody(req.body);

    if (err) {
      return res.status(400).json({
        success: false,
        message: err,
      });
    }

    const {
      customerId,
      shippingAddressId,
      items,
      subtotal = 0,
      shipping = 0,
      totalAmount,
    } = req.body;

    const stockCheck = await checkStock(items);

    if (!stockCheck.ok) {
      return res.status(400).json({
        success: false,
        message: stockCheck.message,
      });
    }

    const order = await Order.create({
      orderId: generateOrderId(),
      customerId,
      shippingAddress: shippingAddressId,
      items: shapeItems(items),
      subtotal,
      shipping,
      totalAmount,
      payment: {
        method: "cod",
        status: "pending",
        paidAt: null,
      },
      orderStatus: "confirmed",
    });

    await postOrderCleanup(items, customerId);

    return res.status(201).json({
      success: true,
      message: "Order placed! Pay cash when your order arrives.",
      data: {
        orderId: order.orderId,
        _id: order._id,
        orderStatus: order.orderStatus,
        totalAmount: order.totalAmount,
        paymentMethod: "cod",
        paymentStatus: order.payment.status,
      },
    });
  } catch (err) {
    console.error("[createCodOrder]", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server error.",
    });
  }
};

// Online payment disabled
export const initiateOnlinePayment = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Online payment is currently disabled.",
  });
};

// Online payment verification disabled
export const verifyAndSaveOnlineOrder = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Online payment is currently disabled.",
  });
};

// Mark COD order as delivered
export const markCodDelivered = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.payment.method !== "cod") {
      return res.status(400).json({
        success: false,
        message: "Not a COD order.",
      });
    }

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Already delivered.",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is cancelled.",
      });
    }

    order.orderStatus = "delivered";
    order.payment.status = "captured";
    order.payment.paidAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "COD order delivered. Cash collected.",
      data: {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        paymentStatus: order.payment.status,
      },
    });
  } catch (err) {
    console.error("[markCodDelivered]", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get orders by customer
export const getOrdersByCustomer = async (req, res) => {
  try {
    const orders = await Order.find({
      customerId: req.params.customerId,
    })
      .populate("shippingAddress")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    console.error("[getOrdersByCustomer]", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get order by order ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
    }).populate("shippingAddress");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("[getOrderById]", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Cancel order and restore stock
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const { orderId } = req.params;

    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        orderStatus: { $in: ["pending", "confirmed"] },
      },
      {
        $set: {
          orderStatus: "cancelled",
          cancelReason: reason?.trim() || "No reason provided",
          cancelledAt: new Date(),
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(400).json({
        success: false,
        message:
          "Order not found or cannot be cancelled (already processed).",
      });
    }

    await Promise.all(
      order.items.map((item) =>
        Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: +item.qty },
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully. Stock has been restored.",
      data: order,
    });
  } catch (error) {
    console.error("[cancelOrder]", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
