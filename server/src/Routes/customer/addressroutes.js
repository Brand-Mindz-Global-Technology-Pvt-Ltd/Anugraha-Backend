import express from "express";
import {
  createAddress,
  getCustomerAddresses,
  updateAddress,
  deleteAddress,
} from "../../Controllers/customer/addresscontroller.js";

const router = express.Router();
router.post("/craete-address", createAddress);
router.get("/:customerId", getCustomerAddresses);
router.put("/:customerId/:id", updateAddress);
router.delete("/:customerId/:id", deleteAddress);

export default router;