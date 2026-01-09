import express from "express";
import {
  getInventory,
  getActiveCategories,
  exportInventoryCSV,
} from "../Controllers/inventorycontroller.js";

const router = express.Router();
router.get("/products", getInventory);
router.get("/getcategory", getActiveCategories);
router.get("/export", exportInventoryCSV);

export default router;
