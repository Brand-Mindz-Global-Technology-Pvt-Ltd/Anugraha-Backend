import express from "express";
import {
  createProduct,
  getCategories,
  getSubCategories,
  getProducts,
  deleteProduct,
  getSingleProduct,
  updateProduct,
  bulkUploadProducts,
} from "../Controllers/productcontroller.js";
import upload from "../utils/upload.js";
import { authmiddleware } from "../Middlewares/auth/authmiddleware.js";

const router = express.Router();

/* CREATE PRODUCT */
router.post(
  "/",
  authmiddleware,
  upload("product").array("images", 4),
  createProduct,
);

/* CATEGORIES */
router.get("/categories", getCategories);
router.get("/categories/:categorySlug/subcategories", getSubCategories);

/* LIST */
router.get("/product-list", authmiddleware, getProducts);

/* SINGLE / DELETE / UPDATE */
router.get("/:id", authmiddleware, getSingleProduct);
router.delete("/:id", authmiddleware, deleteProduct);
router.put(
  "/:id", // ✅ FIXED
  authmiddleware,
  upload("product").array("images", 4),
  updateProduct,
);

router.post("/bulk-upload", authmiddleware, bulkUploadProducts);
export default router;
