import express from "express";
import {
    uploadSliderImage,
    getSliderImages,
    deleteSliderImage
} from "../Controllers/slidercontroller.js";
import { authmiddleware } from "../Middlewares/auth/authmiddleware.js"
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/upload", authmiddleware, upload("sliderImage").single("image"), uploadSliderImage);
router.get("/", authmiddleware, getSliderImages);

router.delete(
    "/:id",
    authmiddleware,
    deleteSliderImage
);


export default router;

