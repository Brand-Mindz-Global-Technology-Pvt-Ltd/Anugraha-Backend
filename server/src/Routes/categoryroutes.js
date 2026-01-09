import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../Controllers/categorycontroller.js";
import { authmiddleware } from "../Middlewares/auth/authmiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post(
  "/:adminId/create-category",
  upload("category").single("image"),
  authmiddleware,
  createCategory
);
router.get("/:adminId/get-category", authmiddleware, getCategories);
router.put(
  "/:adminId/update/:id",
  upload("category").single("image"),
  authmiddleware,
  updateCategory
);
router.delete("/:adminId/delete/:id", authmiddleware, deleteCategory);

export default router;
