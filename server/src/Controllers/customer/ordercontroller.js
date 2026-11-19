
import { createHash } from "crypto";
import mongoose from "mongoose";
import Order from "../../Models/Order.js";
import Cart from "../../Models/cart.js";
import Product from "../../Models/Product.js";
import Address from "../../Models/Address.js";
import {
  assertPhonePeConfigured,
  createPhonePePayment,
  getPhonePeAccessToken,
  getPhonePeOrderStatus,
  PhonePeApiError,
} from "../../Services/phonepeService.js";

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
  const products = new Map();

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

    products.set(String(product._id), product);
  }

  return { ok: true, products };
};

const getCostPriceSnapshot = (product) =>
  Number.isFinite(product?.costPrice) && product.costPrice >= 0
    ? product.costPrice
    : undefined;

const shapeItems = (items, productsById = new Map()) =>
  items.map((item) => {
    const costPriceSnapshot = getCostPriceSnapshot(
      productsById.get(String(item.productId))
    );

    return {
      productId: item.productId,
      name: item.name,
      price: item.price,
      qty: item.qty,
      color: item.color || null,
      size: item.size || null,
      image: item.image || null,
      slug: item.slug || null,
      ...(costPriceSnapshot === undefined ? {} : { costPriceSnapshot }),
    };
  });

const postOrderCleanup = async (items, customerId) => {
  await Promise.all(
    items.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.qty },
      })
    )
  );

  await Cart.findOneAndUpdate(
    { customer: customerId },
    { $set: { items: [] } }
  );
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toPaise = (amount) => {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const paise = Math.round(amount * 100);
  return Number.isSafeInteger(paise) &&
    Math.abs(amount * 100 - paise) < 0.000001
    ? paise
    : null;
};

const getConfiguredShippingFee = () => {
  const configuredFee = process.env.SHIPPING_FEE?.trim();
  if (!configuredFee || !/^\d+(?:\.\d{1,2})?$/.test(configuredFee)) {
    throw new PhonePeApiError(
      "PhonePe payment configuration error: SHIPPING_FEE must be set to a non-negative INR amount with up to two decimal places.",
      503
    );
  }

  const shippingFee = Number(configuredFee);
  const shippingFeeInPaise = Math.round(shippingFee * 100);
  if (
    !Number.isFinite(shippingFee) ||
    !Number.isSafeInteger(shippingFeeInPaise) ||
    shippingFee * 100 !== shippingFeeInPaise
  ) {
    throw new PhonePeApiError(
      "PhonePe payment configuration error: SHIPPING_FEE must be a valid INR amount.",
      503
    );
  }

  return shippingFee;
};

const isSamePhonePeRequest = (order, shippingAddressId, items, shipping) =>
  String(order.shippingAddress) === String(shippingAddressId) &&
  order.shipping === shipping &&
  order.items.length === items.length &&
  order.items.every(
    (savedItem, index) =>
      String(savedItem.productId) === String(items[index].productId) &&
      savedItem.qty === items[index].qty &&
      savedItem.color === (items[index].color || null) &&
      savedItem.size === (items[index].size || null)
  );

const createPhonePePurchaseKey = (shippingAddressId, items) => {
  const quantities = new Map();
  for (const item of items) {
    const key = JSON.stringify([
      String(item.productId),
      item.color || null,
      item.size || null,
    ]);
    quantities.set(key, (quantities.get(key) || 0) + item.qty);
  }

  const purchase = [...quantities.entries()]
    .map(([item, qty]) => [JSON.parse(item), qty])
    .sort((left, right) =>
      JSON.stringify(left[0]).localeCompare(JSON.stringify(right[0]))
    );

  return createHash("sha256")
    .update(JSON.stringify([String(shippingAddressId), purchase]))
    .digest("hex");
};

const phonePeCartItemKey = (productId, color, size) =>
  JSON.stringify([String(productId), color || null, size || null]);

const phonePeOrderResponse = (order) => ({
  orderId: order.orderId,
  merchantOrderId: order.payment.phonepeMerchantOrderId,
  orderStatus: order.orderStatus,
  paymentStatus: order.payment.status,
  checkoutUrl: order.payment.phonepeRedirectUrl,
});

const respondWithExistingPhonePeCheckout = (res, order) => {
  if (
    order.payment.phonepeInitiationStatus === "ready" &&
    order.payment.phonepeRedirectUrl
  ) {
    return res.status(200).json({
      success: true,
      message: "PhonePe checkout already initialized.",
      data: phonePeOrderResponse(order),
    });
  }

  return res.status(409).json({
    success: false,
    message:
      "A PhonePe order for this purchase already exists, but its checkout URL is not available. Verify the existing payment before retrying.",
    data: phonePeOrderResponse(order),
  });
};

class PhonePeFulfillmentError extends Error {}

const finalizePhonePePayment = async (order, transactionId) => {
  const session = await mongoose.startSession();
  let finalizedOrder;

  try {
    await session.withTransaction(async () => {
      const currentOrder = await Order.findById(order._id).session(session);
      if (!currentOrder) throw new Error("PhonePe order no longer exists.");

      if (currentOrder.payment.status === "captured") {
        finalizedOrder = currentOrder;
        return;
      }

      if (currentOrder.payment.status !== "pending") {
        throw new Error("PhonePe order is no longer payable.");
      }

      if (currentOrder.orderStatus !== "pending") {
        throw new PhonePeFulfillmentError(
          "PhonePe order is no longer awaiting payment."
        );
      }

      for (const item of currentOrder.items) {
        const stockUpdate = await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty } },
          { session }
        );

        if (stockUpdate.modifiedCount !== 1) {
          throw new PhonePeFulfillmentError(
            `Insufficient stock for "${item.name}" after payment.`
          );
        }
      }

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: currentOrder._id,
          "payment.status": "pending",
          orderStatus: { $ne: "cancelled" },
        },
        {
          $set: {
            "payment.status": "captured",
            "payment.paidAt": new Date(),
            "payment.phonepeTransactionId": transactionId || null,
            "payment.phonepeInventoryDeducted": true,
            orderStatus: "confirmed",
          },
        },
        { new: true, session }
      );

      if (!updatedOrder) {
        throw new PhonePeFulfillmentError(
          "PhonePe order changed during payment finalization."
        );
      }

      const cart = await Cart.findOne({
        customer: currentOrder.customerId,
      }).session(session);
      if (cart) {
        const remainingOrderQty = new Map();
        for (const item of currentOrder.items) {
          const key = phonePeCartItemKey(
            item.productId,
            item.color,
            item.size
          );
          remainingOrderQty.set(
            key,
            (remainingOrderQty.get(key) || 0) + item.qty
          );
        }

        cart.items = cart.items.filter((cartItem) => {
          const key = phonePeCartItemKey(
            cartItem.product,
            cartItem.color,
            cartItem.size
          );
          const purchaseQty = remainingOrderQty.get(key) || 0;
          if (!purchaseQty) return true;

          const removedQty = Math.min(cartItem.quantity, purchaseQty);
          cartItem.quantity -= removedQty;
          remainingOrderQty.set(key, purchaseQty - removedQty);
          return cartItem.quantity > 0;
        });
        await cart.save({ session });
      }

      finalizedOrder = updatedOrder;
    });

    return { order: finalizedOrder, fulfillmentPending: false };
  } catch (error) {
    if (!(error instanceof PhonePeFulfillmentError)) throw error;

    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, "payment.status": "pending" },
      {
        $set: {
          "payment.status": "captured",
          "payment.paidAt": new Date(),
          "payment.phonepeTransactionId": transactionId || null,
          "payment.phonepeInventoryDeducted": false,
        },
      },
      { new: true }
    );

    const currentOrder =
      paidOrder || (await Order.findById(order._id));
    if (!currentOrder) throw new Error("PhonePe order no longer exists.");

    return {
      order: currentOrder,
      fulfillmentPending: !currentOrder.payment.phonepeInventoryDeducted,
    };
  } finally {
    await session.endSession();
  }
};

export const initiatePhonePePayment = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      shippingAddressId,
      items,
      subtotal: requestedSubtotal,
      totalAmount: requestedTotal,
      idempotencyKey,
    } = req.body || {};

    if (
      !isValidObjectId(customerId) ||
      !isValidObjectId(shippingAddressId) ||
      !Array.isArray(items) ||
      items.length === 0 ||
      typeof idempotencyKey !== "string" ||
      !/^[A-Za-z0-9._:-]{16,100}$/.test(idempotencyKey)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid shippingAddressId, items, and 16-100 character idempotencyKey are required.",
      });
    }

    const shipping = getConfiguredShippingFee();

    const address = await Address.exists({
      _id: shippingAddressId,
      customerId,
    });
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Shipping address not found for this customer.",
      });
    }

    const normalizedItems = [];
    for (const item of items) {
      if (
        !item?.productId ||
        !isValidObjectId(item.productId) ||
        !Number.isInteger(item.qty) ||
        item.qty < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Each item needs a valid productId and positive integer qty.",
        });
      }
      normalizedItems.push({
        productId: item.productId,
        qty: item.qty,
        color: item.color || null,
        size: item.size || null,
      });
    }

    const phonepePurchaseKey = createPhonePePurchaseKey(
      shippingAddressId,
      normalizedItems
    );

    const existingOrder = await Order.findOne({
      customerId,
      "payment.method": "phonepe",
      "payment.phonepeIdempotencyKey": idempotencyKey,
    });

    if (existingOrder) {
      if (
        !isSamePhonePeRequest(
          existingOrder,
          shippingAddressId,
          normalizedItems,
          shipping
        )
      ) {
        return res.status(409).json({
          success: false,
          message: "Idempotency key was already used for a different order.",
        });
      }

      if (existingOrder.payment.status === "captured") {
        return res.status(200).json({
          success: true,
          message: "PhonePe payment is already verified.",
          data: phonePeOrderResponse(existingOrder),
        });
      }

      if (
        existingOrder.payment.phonepeInitiationStatus === "ready" &&
        existingOrder.payment.phonepeRedirectUrl
      ) {
        return res.status(200).json({
          success: true,
          message: "PhonePe checkout already initialized.",
          data: phonePeOrderResponse(existingOrder),
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "This payment attempt is still being initialized or needs status verification. Do not start another attempt with this key.",
        data: phonePeOrderResponse(existingOrder),
      });
    }

    const activePurchaseOrder = await Order.findOne({
      customerId,
      "payment.method": "phonepe",
      "payment.status": "pending",
      "payment.phonepePurchaseKey": phonepePurchaseKey,
    });
    if (activePurchaseOrder) {
      return respondWithExistingPhonePeCheckout(res, activePurchaseOrder);
    }

    const products = [];
    const requestedQuantities = new Map();
    for (const item of normalizedItems) {
      const productId = String(item.productId);
      requestedQuantities.set(
        productId,
        (requestedQuantities.get(productId) || 0) + item.qty
      );

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }
      if (!Number.isFinite(product.price) || product.price < 0) {
        return res.status(400).json({
          success: false,
          message: `Product has an invalid price: ${product.name}`,
        });
      }
      if (item.color && product.colors?.length && !product.colors.includes(item.color)) {
        return res.status(400).json({
          success: false,
          message: `Invalid color for "${product.name}".`,
        });
      }
      if (item.size && product.sizes?.length && !product.sizes.includes(item.size)) {
        return res.status(400).json({
          success: false,
          message: `Invalid size for "${product.name}".`,
        });
      }
      products.push({ product, item });
    }

    for (const { product } of products) {
      const requestedQty = requestedQuantities.get(String(product._id));
      if (product.stock < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${product.name}". Available: ${product.stock}.`,
        });
      }
    }

    const orderItems = products.map(({ product, item }) => {
      const costPriceSnapshot = getCostPriceSnapshot(product);

      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        ...(costPriceSnapshot === undefined ? {} : { costPriceSnapshot }),
        qty: item.qty,
        color: item.color,
        size: item.size,
        image: product.images?.[0] || null,
        slug: product.slug || null,
      };
    });
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
    const totalAmount = subtotal + shipping;
    const amountInPaise = toPaise(totalAmount);

    if (
      amountInPaise === null ||
      toPaise(subtotal) === null ||
      (requestedSubtotal !== undefined &&
        (!Number.isFinite(requestedSubtotal) ||
          Math.abs(requestedSubtotal - subtotal) > 0.001)) ||
      (requestedTotal !== undefined &&
        (!Number.isFinite(requestedTotal) ||
          Math.abs(requestedTotal - totalAmount) > 0.001))
    ) {
      return res.status(400).json({
        success: false,
        message: "Order subtotal or total does not match server-calculated prices.",
      });
    }

    assertPhonePeConfigured();
    const accessToken = await getPhonePeAccessToken();
    const orderId = generateOrderId();

    let order;
    try {
      order = await Order.create({
        orderId,
        customerId,
        shippingAddress: shippingAddressId,
        items: orderItems,
        subtotal,
        shipping,
        totalAmount,
        payment: {
          method: "phonepe",
          status: "pending",
          phonepeMerchantOrderId: orderId,
          phonepeIdempotencyKey: idempotencyKey,
          phonepePurchaseKey,
          phonepeInitiationStatus: "initiating",
        },
        orderStatus: "pending",
      });
    } catch (error) {
      if (error.code === 11000) {
        const racedIdempotencyOrder = await Order.findOne({
          customerId,
          "payment.method": "phonepe",
          "payment.phonepeIdempotencyKey": idempotencyKey,
        });
        if (racedIdempotencyOrder) {
          if (
            racedIdempotencyOrder.payment.status === "pending" &&
            racedIdempotencyOrder.payment.phonepePurchaseKey ===
              phonepePurchaseKey
          ) {
            return respondWithExistingPhonePeCheckout(
              res,
              racedIdempotencyOrder
            );
          }

          return res.status(409).json({
            success: false,
            message: "Idempotency key was already used for a different order.",
          });
        }

        const racedPurchaseOrder = await Order.findOne({
          customerId,
          "payment.method": "phonepe",
          "payment.status": "pending",
          "payment.phonepePurchaseKey": phonepePurchaseKey,
        });
        if (racedPurchaseOrder) {
          return respondWithExistingPhonePeCheckout(res, racedPurchaseOrder);
        }
      }
      throw error;
    }

    try {
      const payment = await createPhonePePayment(accessToken, {
        merchantOrderId: order.payment.phonepeMerchantOrderId,
        amount: amountInPaise,
      });

      order.payment.phonepeOrderId = payment.orderId || null;
      order.payment.phonepeRedirectUrl = payment.redirectUrl;
      order.payment.phonepeInitiationStatus = "ready";
      await order.save();

      return res.status(201).json({
        success: true,
        message: "PhonePe checkout initialized.",
        data: phonePeOrderResponse(order),
      });
    } catch (error) {
      const initiationFailed =
        error instanceof PhonePeApiError &&
        error.statusCode >= 400 &&
        error.statusCode < 500;
      order.payment.phonepeInitiationStatus = initiationFailed
        ? "failed"
        : "unknown";
      if (initiationFailed) order.payment.status = "failed";
      await order.save();

      console.error("[initiatePhonePePayment]", error.message);
      return res.status(initiationFailed ? 502 : 503).json({
        success: false,
        message: initiationFailed
          ? "PhonePe rejected the payment request."
          : "PhonePe payment initialization could not be confirmed. Verify status before retrying.",
        data: phonePeOrderResponse(order),
      });
    }
  } catch (error) {
    console.error("[initiatePhonePePayment]", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 503
          ? error.message
          : "Unable to initialize PhonePe checkout.",
    });
  }
};

export const verifyPhonePePayment = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { merchantOrderId } = req.body || {};

    if (
      !isValidObjectId(customerId) ||
      typeof merchantOrderId !== "string" ||
      !merchantOrderId
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid merchantOrderId is required.",
      });
    }

    const order = await Order.findOne({
      customerId,
      "payment.method": "phonepe",
      "payment.phonepeMerchantOrderId": merchantOrderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "PhonePe order not found.",
      });
    }

    if (order.payment.status === "captured") {
      return res.status(200).json({
        success: true,
        message: order.payment.phonepeInventoryDeducted
          ? "PhonePe payment is verified."
          : "Payment succeeded; order requires fulfillment review.",
        data: phonePeOrderResponse(order),
      });
    }

    if (order.payment.status === "failed") {
      return res.status(200).json({
        success: true,
        message: "PhonePe payment failed.",
        data: phonePeOrderResponse(order),
      });
    }

    const accessToken = await getPhonePeAccessToken();
    const providerStatus = await getPhonePeOrderStatus(
      accessToken,
      merchantOrderId
    );

    if (providerStatus.amount !== toPaise(order.totalAmount)) {
      return res.status(502).json({
        success: false,
        message: "PhonePe status amount does not match the stored order amount.",
      });
    }

    if (providerStatus.state === "FAILED") {
      order.payment.status = "failed";
      order.payment.phonepeInitiationStatus = "failed";
      await order.save();

      return res.status(200).json({
        success: true,
        message: "PhonePe payment failed.",
        data: phonePeOrderResponse(order),
      });
    }

    if (providerStatus.state !== "COMPLETED") {
      return res.status(200).json({
        success: true,
        message: "PhonePe payment is still pending.",
        data: phonePeOrderResponse(order),
      });
    }

    const completedPayment = providerStatus.paymentDetails?.find(
      (detail) => detail.state === "COMPLETED"
    );
    const result = await finalizePhonePePayment(
      order,
      completedPayment?.transactionId
    );

    return res.status(200).json({
      success: true,
      message: result.fulfillmentPending
        ? "Payment succeeded, but stock changed during checkout. Order needs fulfillment review."
        : "PhonePe payment verified and order confirmed.",
      data: phonePeOrderResponse(result.order),
    });
  } catch (error) {
    console.error("[verifyPhonePePayment]", error.message);
    return res.status(error.statusCode || 503).json({
      success: false,
      message:
        error.statusCode === 503
          ? error.message
          : "Unable to verify PhonePe payment. No payment success was assumed.",
    });
  }
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
      items: shapeItems(items, stockCheck.products),
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
        $or: [
          { "payment.method": { $ne: "phonepe" } },
          { "payment.status": "failed" },
        ],
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

    if (
      order.payment.method !== "phonepe" ||
      order.payment.phonepeInventoryDeducted
    ) {
      await Promise.all(
        order.items.map((item) =>
          Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: +item.qty },
          })
        )
      );
    }

    return res.status(200).json({
      success: true,
      message:
        order.payment.method === "phonepe" &&
        !order.payment.phonepeInventoryDeducted
          ? "Order cancelled successfully."
          : "Order cancelled successfully. Stock has been restored.",
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
