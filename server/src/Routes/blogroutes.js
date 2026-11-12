import express from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";
import {
  createBlog,
  deleteBlog,
  getAdminBlogs,
  getPublishedBlogBySlug,
  getPublishedBlogs,
  updateBlog,
  updateBlogStatus,
} from "../Controllers/blogcontroller.js";
import { authmiddleware } from "../Middlewares/auth/authmiddleware.js";

const router = express.Router();
const uploadDirectory = path.join(process.cwd(), "uploads", "blogs");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedImageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) =>
      callback(null, `${randomUUID()}${allowedImageTypes.get(file.mimetype) || ""}`),
  }),
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(new Error("Only JPEG, PNG, WebP, GIF, and AVIF images are allowed"));
    }
    return callback(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
});
const blogImages = upload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "openGraphImage", maxCount: 1 },
]);
const parseBlogImages = (req, res, next) => {
  blogImages(req, res, (error) => {
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next();
  });
};

router.get("/admin", authmiddleware, getAdminBlogs);
router.post("/admin", authmiddleware, parseBlogImages, createBlog);
router.put("/admin/:id", authmiddleware, parseBlogImages, updateBlog);
router.patch("/admin/:id/status", authmiddleware, updateBlogStatus);
router.delete("/admin/:id", authmiddleware, deleteBlog);

router.get("/", getPublishedBlogs);
router.get("/:slug", getPublishedBlogBySlug);

export default router;
