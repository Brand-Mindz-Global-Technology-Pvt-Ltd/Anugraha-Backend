import express from "express";
import {
  getSalesSummary,
  getCustomerSatisfaction,
  getVolumeService,
  getRevenue,
  getTopProducts,
} from "../Controllers/dashboardcontroller.js";

const router = express.Router();

router.get("/sales-summary", getSalesSummary);
router.get("/customer-satisfaction", getCustomerSatisfaction);
router.get("/volume-service", getVolumeService);
router.get("/revenue", getRevenue);
router.get("/top-products", getTopProducts);

export default router;
