import { Request, Response } from "express";
import { reviewsService } from "./reviews.service";

const getParam = (param: string | string[] | undefined): string | null => {
  if (!param) return null;
  if (Array.isArray(param)) return param[0] || null;
  return param;
};

export const getAllReviewsController = async (_req: Request, res: Response) => {
  try {
    const data = await reviewsService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getPendingReviewsController = async (_req: Request, res: Response) => {
  try {
    const data = await reviewsService.getPending();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getReviewByIdController = async (req: Request, res: Response) => {
  try {
    const idParam = getParam(req.params.id);
    if (!idParam) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }
    const data = await reviewsService.getById(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getProductReviewsController = async (req: Request, res: Response) => {
  try {
    const productIdParam = getParam(req.params.productId);
    if (!productIdParam) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const productId = parseInt(productIdParam, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const data = await reviewsService.getByProduct(productId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getUserReviewsController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await reviewsService.getByUser(userId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createReviewController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { productId, orderId, rating, title, comment, photos } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product ID, rating and comment are required"
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }
    const data = await reviewsService.create({
      userId,
      productId,
      orderId,
      rating,
      title,
      comment,
      photos
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const approveReviewController = async (req: Request, res: Response) => {
  try {
    const idParam = getParam(req.params.id);
    if (!idParam) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }
    const data = await reviewsService.approve(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, message: "Review approved successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const rejectReviewController = async (req: Request, res: Response) => {
  try {
    const idParam = getParam(req.params.id);
    if (!idParam) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }
    const data = await reviewsService.reject(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, message: "Review rejected successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const markReviewHelpfulController = async (req: Request, res: Response) => {
  try {
    const idParam = getParam(req.params.id);
    if (!idParam) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }
    const data = await reviewsService.markHelpful(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, message: "Marked as helpful", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteReviewController = async (req: Request, res: Response) => {
  try {
    const idParam = getParam(req.params.id);
    if (!idParam) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }
    const data = await reviewsService.delete(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.json({ success: true, message: "Review deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteReviewsController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of review IDs to delete"
      });
    }
    const data = await reviewsService.bulkDelete(ids);
    res.json({
      success: true,
      message: `Successfully deleted ${data.success.length} reviews`,
      data
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};