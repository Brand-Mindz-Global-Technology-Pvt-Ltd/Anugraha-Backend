import express from "express";
import {
  getWishlist,
  toggleWishlist,
  removeProductFromWishlist,
  clearWishlist
} from "../../Controllers/customer/wishlistcontroller.js";


const router = express.Router();

/* ───────── WISHLIST ───────── */
router.get("/get-wishlist", getWishlist);
router.post("/add-wishlist", toggleWishlist);
router.delete("/remove-product", removeProductFromWishlist);
router.delete("/clear", clearWishlist);

export default router;
