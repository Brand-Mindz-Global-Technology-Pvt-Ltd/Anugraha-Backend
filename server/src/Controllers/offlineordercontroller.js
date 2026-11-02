import OfflineOrder from "../Models/OfflineOrder.js";

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

        if (!itemsSold?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Items sold is required",
            });
        }

        if (Number(totalAmount) < 0 || totalAmount === "") {
            return res.status(400).json({
                success: false,
                message: "Valid total amount is required",
            });
        }

        const orderId = `OFF-${Date.now()}`;

        const order = await OfflineOrder.create({
            orderId,
            customerName: customerName?.trim() || "Walk-in Customer",
            salesperson: salesperson.trim(),
            itemsSold: itemsSold.trim(),
            totalAmount: Number(totalAmount),
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