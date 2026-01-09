import express from "express";
import {
    uploadBannerImage,
    getBannerImages,
    deleteBannerImage
} from "../Controllers/bannercontroller.js";
import { authmiddleware } from "../Middlewares/auth/authmiddleware.js"
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/upload/bannerimage", authmiddleware, upload("bannerImage").single("image"), uploadBannerImage);
router.get("/getbannerimage", authmiddleware, getBannerImages);

router.delete(
    "/bannerimage/:id",
    authmiddleware,
    deleteBannerImage
);


export default router;

