// routes/orderRoutes.js
import express from "express";
import {
  createCodOrder,
  initiateOnlinePayment,
  verifyAndSaveOnlineOrder,
  markCodDelivered,
  getOrdersByCustomer,
  getOrderById,
  cancelOrder,
} from "../../Controllers/customer/ordercontroller.js";

const router = express.Router();


router.post("/cod/create", createCodOrder);

/* ── Online (Razorpay) ───────────────────────── */
router.post("/online/initiate", initiateOnlinePayment);
router.post("/online/verify", verifyAndSaveOnlineOrder);

/* ── Admin / delivery agent ─────────────────── */
router.patch("/:orderId/cod-delivered", markCodDelivered);

/* ── Customer ────────────────────────────────── */
router.get("/customer/:customerId", getOrdersByCustomer);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);

export default router;

