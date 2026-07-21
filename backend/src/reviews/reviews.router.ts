import { Router } from "express";
import {
  getAllReviewsController,
  getPendingReviewsController,
  getReviewByIdController,
  getProductReviewsController,
  getUserReviewsController,
  createReviewController,
  approveReviewController,
  rejectReviewController,
  markReviewHelpfulController,
  deleteReviewController,
  bulkDeleteReviewsController
} from "./reviews.controller";

const reviewsRouter = Router();

reviewsRouter.get("/", getAllReviewsController);
reviewsRouter.get("/pending", getPendingReviewsController);
reviewsRouter.get("/product/:productId", getProductReviewsController);
reviewsRouter.get("/user", getUserReviewsController);
reviewsRouter.get("/:id", getReviewByIdController);
reviewsRouter.post("/", createReviewController);
reviewsRouter.patch("/:id/approve", approveReviewController);
reviewsRouter.patch("/:id/reject", rejectReviewController);
reviewsRouter.patch("/:id/helpful", markReviewHelpfulController);
reviewsRouter.delete("/:id", deleteReviewController);
reviewsRouter.post("/bulk-delete", bulkDeleteReviewsController);

export default reviewsRouter;