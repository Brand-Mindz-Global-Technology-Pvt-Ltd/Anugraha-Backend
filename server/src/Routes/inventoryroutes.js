import express from "express";
import {
  getInventory,
  getActiveCategories,
  exportInventoryCSV,
  updateStock,
} from "../Controllers/inventorycontroller.js";

const router = express.Router();

router.get("/products", getInventory);
router.get("/getcategory", getActiveCategories);
router.get("/export", exportInventoryCSV);

router.put("/:id/stock", updateStock);

export default router;