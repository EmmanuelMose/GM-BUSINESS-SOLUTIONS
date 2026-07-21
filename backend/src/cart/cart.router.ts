import { Router } from "express";
import {
  getCartController,
  addToCartController,
  updateCartController,
  removeFromCartController,
  clearCartController
} from "./cart.controller";

const cartRouter = Router();

cartRouter.get("/", getCartController);
cartRouter.post("/", addToCartController);
cartRouter.patch("/:productId", updateCartController);
cartRouter.delete("/clear", clearCartController);
cartRouter.delete("/:productId", removeFromCartController);

export default cartRouter;