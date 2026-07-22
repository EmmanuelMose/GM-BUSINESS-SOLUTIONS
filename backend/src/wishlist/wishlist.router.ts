import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getWishlistController,
  addToWishlistController,
  removeFromWishlistController,
  clearWishlistController,
  checkWishlistController
} from "./wishlist.controller";

const wishlistRouter = Router();

wishlistRouter.use(authenticate);

wishlistRouter.get("/", getWishlistController);
wishlistRouter.post("/", addToWishlistController);
wishlistRouter.delete("/clear", clearWishlistController);
wishlistRouter.delete("/:productId", removeFromWishlistController);
wishlistRouter.get("/check/:productId", checkWishlistController);

export default wishlistRouter;