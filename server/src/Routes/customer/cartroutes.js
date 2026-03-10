import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem
} from "../../Controllers/customer/cartcontroller.js";
const router = express.Router();

router.get("/get-cart",  getCart);
router.post("/add-cart",  addToCart);
router.put("/update-cart",  updateCartItem);
router.delete("/remove-cart", removeCartItem);



export default router;
