import express from "express";
import {
  getCompanySettings,
  saveCompanySettings,
  getTerms,
  saveTerms,
  getPrivacy,
  savePrivacy,
  getCookie,
  saveCookie,
} from "../Controllers/settingcontroller.js";
import upload from "../utils/upload.js";

// Create router
const router = express.Router();

/* ======================================================
   COMPANY SETTINGS ROUTES
====================================================== */
router.get("/getcompany/:adminId", getCompanySettings);
router.post(
  "/postcompany/:adminId",
  upload("companyImage").single("logo"),
  saveCompanySettings,
);
router.get("/get-terms/:adminId", getTerms);
router.post("/post-terms/:adminId", saveTerms);

router.get("/get-privacy/:adminId", getPrivacy);
router.post("/post-privacy/:adminId", savePrivacy);

router.get("/get-cookie/:adminId", getCookie);
router.post("/post-cookie/:adminId", saveCookie);

export default router;
