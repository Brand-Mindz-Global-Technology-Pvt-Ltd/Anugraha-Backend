import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
} from "../Controllers/authcontroller.js";
import { authLimiter } from "../Middlewares/auth/rateLimitmiddleware.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

export default router;
