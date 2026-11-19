import mongoose from "mongoose";
import OfflineOrder from "../Models/OfflineOrder.js";
import Product from "../Models/Product.js";

const isNonNegativeNumber = (value) => {
    if (
        (typeof value !== "number" && typeof value !== "string") ||
        (typeof value === "string" && value.trim() === "")
    ) {
        return false;
    }

    const number = Number(value);
    return Number.isFinite(number) && number >= 0;
};

/* GET ALL OFFLINE ORDERS */
export const getOfflineOrders = async (req, res) => {
    try {
        const orders = await OfflineOrder.find().sort({ createdAt: -1 });

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todaysOrders = await OfflineOrder.find({
            createdAt: {
                $gte: todayStart,
                $lte: todayEnd,
            },
        });

        const todaysSales = todaysOrders
            .filter((order) => order.status === "completed")
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

        const completed = await OfflineOrder.countDocuments({
            status: "completed",
        });

        const pending = await OfflineOrder.countDocuments({
            status: "pending",
        });

        return res.status(200).json({
            success: true,
            data: orders,
            summary: {
                todaysSales,
                completed,
                pending,
            },
        });
    } catch (error) {
        console.error("Get offline orders error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch offline orders",
        });
    }
};

/* CREATE OFFLINE ORDER */
export const createOfflineOrder = async (req, res) => {
    try {
        const {
            customerName,
            salesperson,
            itemsSold,
            items,
            totalAmount,
            paymentMethod,
            status,
        } = req.body;

        if (!salesperson?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Salesperson is required",
            });
        }

        if (items === undefined && !itemsSold?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Items sold is required",
            });
        }

        let orderItems;
        let savedItemsSold;
        let savedTotalAmount;

        if (items !== undefined) {
            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one product item is required",
                });
            }

            orderItems = [];

            for (const item of items) {
                if (
                    !mongoose.Types.ObjectId.isValid(item?.productId) ||
                    !Number.isInteger(item?.qty) ||
                    item.qty < 1 ||
                    !isNonNegativeNumber(item?.price)
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Each product item requires a valid product, non-negative selling price, and positive whole-number quantity",
                    });
                }

                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(400).json({
                        success: false,
                        message: "Product not found",
                    });
                }

                const costPriceSnapshot =
                    Number.isFinite(product.costPrice) && product.costPrice >= 0
                        ? product.costPrice
                        : undefined;

                orderItems.push({
                    productId: product._id,
                    name: product.name,
                    price: Number(item.price),
                    ...(costPriceSnapshot === undefined
                        ? {}
                        : { costPriceSnapshot }),
                    qty: item.qty,
                });
            }

            savedTotalAmount = orderItems.reduce(
                (sum, item) => sum + item.price * item.qty,
                0
            );
            if (!Number.isFinite(savedTotalAmount)) {
                return res.status(400).json({
                    success: false,
                    message: "Product item total is invalid",
                });
            }

            savedItemsSold = orderItems
                .map((item) => `${item.name} x${item.qty}`)
                .join(", ");
        } else {
            if (!isNonNegativeNumber(totalAmount)) {
                return res.status(400).json({
                    success: false,
                    message: "Valid non-negative total amount is required",
                });
            }

            savedTotalAmount = Number(totalAmount);
            savedItemsSold = itemsSold.trim();
        }

        if (!Number.isFinite(savedTotalAmount) || savedTotalAmount < 0) {
            return res.status(400).json({
                success: false,
                message: "Valid non-negative total amount is required",
            });
        }

        const orderId = `OFF-${Date.now()}`;

        const order = await OfflineOrder.create({
            orderId,
            customerName: customerName?.trim() || "Walk-in Customer",
            salesperson: salesperson.trim(),
            itemsSold: savedItemsSold,
            ...(orderItems ? { items: orderItems } : {}),
            totalAmount: savedTotalAmount,
            paymentMethod: paymentMethod || "cash",
            status: status || "completed",
        });

        return res.status(201).json({
            success: true,
            message: "Offline sale created successfully",
            data: order,
        });
    } catch (error) {
        console.error("Create offline order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create offline order",
        });
    }
};

/* UPDATE OFFLINE ORDER */
export const updateOfflineOrder = async (req, res) => {
    try {
        const order = await OfflineOrder.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Offline order not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Offline order updated successfully",
            data: order,
        });
    } catch (error) {
        console.error("Update offline order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update offline order",
        });
    }
};

/* DELETE OFFLINE ORDER */
export const deleteOfflineOrder = async (req, res) => {
    try {
        const order = await OfflineOrder.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Offline order not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Offline order deleted successfully",
        });
    } catch (error) {
        console.error("Delete offline order error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete offline order",
        });
    }
};