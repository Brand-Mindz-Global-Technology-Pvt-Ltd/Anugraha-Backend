import express from "express";
import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getActiveSupplierCount,
} from "../Controllers/Suppliercontroller.js";

const router = express.Router();

router.get("/", getSuppliers);
router.post("/", createSupplier);
router.get("/active-count", getActiveSupplierCount);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

export default router;