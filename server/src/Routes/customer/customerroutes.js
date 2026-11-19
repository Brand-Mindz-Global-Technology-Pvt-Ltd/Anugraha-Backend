import express from "express";
import customerAuthMiddleware from "../../Middlewares/auth/customerAuthMiddleware.js";
import {
  createCustomer,
  getAllCustomers,
  loginCustomer,
  googleLoginCustomer,
  forgotPassword,
  resetPassword,
  getCustomerProfile,
  updateCustomerProfile,
  updateCustomerStatus,
  exportCustomers,
} from "../../Controllers/customer/customercontroller.js";

import {
  getPublicProducts,
  getPublicSingleProduct,
  getPublicCategoriesWithSubCategories,
  searchProducts,
} from "../../Controllers/customer/productcontroller.js";

const router = express.Router();
// Admin routes 
router.post("/create", createCustomer);
router.get("/get-all", getAllCustomers);
router.post("/login", loginCustomer);
router.post("/google-login", googleLoginCustomer);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.patch("/:id/status", updateCustomerStatus);
router.get("/export", exportCustomers);
// customer routes 
router.get("/products", getPublicProducts);
router.get("/products/:slug/:id", getPublicSingleProduct);
router.get("/categories", getPublicCategoriesWithSubCategories);
router.get('/products/search', searchProducts);
router.get("/profile", customerAuthMiddleware, getCustomerProfile);
router.put("/profile", customerAuthMiddleware, updateCustomerProfile);

export default router;
