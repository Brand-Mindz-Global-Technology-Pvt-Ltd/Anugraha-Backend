import Order from "../Models/Order.js";

function buildFilter({ status, search }) {
  const filter = {};

  if (status && status !== "All") {
    filter.orderStatus = status;
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [{ orderId: regex }];

  }

  return filter;
}

function buildSort(sort) {
  switch (sort) {
    case "oldest":      return { createdAt: 1 };
    case "amount_high": return { totalAmount: -1 };
    case "amount_low":  return { totalAmount: 1 };
    case "newest":
    default:            return { createdAt: -1 };
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const {
      status = "All",
      search = "",
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const filter   = buildFilter({ status, search });
    const sortObj  = buildSort(sort);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .populate("customerId", "name email phone")
        .populate("shippingAddress")
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      orders,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("[getAllOrders]", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate("customerId", "name email phone")
      .populate("shippingAddress")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (err) {
    console.error("[getOrderById]", err);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

    if (!orderStatus || !VALID_STATUSES.includes(orderStatus)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Prevent updating a cancelled order
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Cannot update a cancelled order" });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      orderId: order.orderId,
      orderStatus: order.orderStatus,
    });
  } catch (err) {
    console.error("[updateOrderStatus]", err);
    return res.status(500).json({ message: "Failed to update order status" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { cancelReason = "" } = req.body;

    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (order.orderStatus === "delivered") {
      return res.status(400).json({ message: "Cannot cancel a delivered order" });
    }

    order.orderStatus  = "cancelled";
    order.cancelReason = cancelReason || "Cancelled by admin";
    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      cancelReason: order.cancelReason,
    });
  } catch (err) {
    console.error("[cancelOrder]", err);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};

export const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("customerId", "name email phone")
      .lean();

    // Build CSV rows
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Date",
      "Items",
      "Subtotal",
      "Shipping",
      "Total Amount",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Cancel Reason",
    ];

    const rows = orders.map((o) => {
      const itemsSummary = (o.items || [])
        .map((i) => `${i.name} x${i.qty}`)
        .join(" | ");

      return [
        o.orderId,
        o.customerId?.name || "",
        o.customerId?.email || "",
        new Date(o.createdAt).toLocaleDateString("en-IN"),
        itemsSummary,
        o.subtotal,
        o.shipping,
        o.totalAmount,
        o.payment?.method || "",
        o.payment?.status || "",
        o.orderStatus,
        o.cancelReason || "",
      ]
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="orders-${Date.now()}.csv"`
    );
    return res.status(200).send(csv);
  } catch (err) {
    console.error("[exportOrders]", err);
    return res.status(500).json({ message: "Export failed" });
  }
};