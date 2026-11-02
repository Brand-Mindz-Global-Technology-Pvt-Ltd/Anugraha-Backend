import express from "express";

import {
    getOfflineOrders,
    createOfflineOrder,
    updateOfflineOrder,
    deleteOfflineOrder,
} from "../Controllers/offlineordercontroller.js";

const router = express.Router();

router.get("/", getOfflineOrders);
router.post("/", createOfflineOrder);
router.put("/:id", updateOfflineOrder);
router.delete("/:id", deleteOfflineOrder);

export default router;