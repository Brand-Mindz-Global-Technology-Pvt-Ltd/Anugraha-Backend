// routes/orderRoutes.js
import express from "express";
import {
  createCodOrder,
  initiateOnlinePayment,
  verifyAndSaveOnlineOrder,
  initiatePhonePePayment,
  verifyPhonePePayment,
  markCodDelivered,
  getOrdersByCustomer,
  getOrderById,
  cancelOrder,
} from "../../Controllers/customer/ordercontroller.js";
import customerAuthMiddleware from "../../Middlewares/auth/customerAuthMiddleware.js";

const router = express.Router();


router.post("/cod/create", createCodOrder);

/* ── Online (Razorpay) ───────────────────────── */
router.post("/online/initiate", initiateOnlinePayment);
router.post("/online/verify", verifyAndSaveOnlineOrder);

/* ── PhonePe Standard Checkout ───────────────── */
router.post("/phonepe/initiate", customerAuthMiddleware, initiatePhonePePayment);
router.post("/phonepe/verify", customerAuthMiddleware, verifyPhonePePayment);

/* ── Admin / delivery agent ─────────────────── */
router.patch("/:orderId/cod-delivered", markCodDelivered);

/* ── Customer ────────────────────────────────── */
router.get("/customer/:customerId", getOrdersByCustomer);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);

export default router;
