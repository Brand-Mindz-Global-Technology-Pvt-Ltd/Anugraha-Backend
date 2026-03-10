import express from "express";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  exportOrders,
} from "../Controllers/adminordercontroller.js";
const router = express.Router();
router.get("/export", exportOrders);
router.get("/", getAllOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/status", updateOrderStatus);
router.post("/:orderId/cancel", cancelOrder);

export default router;
