import express from "express";
import {
  changeAdminPassword,
  getAdminProfile,
  updateAdminProfile,
  AdminProfile,
} from "../Controllers/adminprofile.js";
import { authmiddleware } from "../Middlewares/auth/authmiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.put("/:adminId/change-password", authmiddleware, changeAdminPassword);
router.get("/:adminId/profile", authmiddleware, getAdminProfile);

router.put(
  "/:adminId/profile",
  authmiddleware,
  upload("profile").single("profileImage"),
  updateAdminProfile
);

router.get("/:adminId/getprofile", AdminProfile);
export default router;
