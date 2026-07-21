import { Request, Response } from "express";
import { wishlistService } from "./wishlist.service";

export const getWishlistController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await wishlistService.getByUser(userId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const addToWishlistController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    const data = await wishlistService.add(userId, productId);
    res.status(201).json({ success: true, message: "Added to wishlist", data });
  } catch (e: any) {
    const status = e.message.includes("already") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const removeFromWishlistController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const productIdParam = req.params.productId;
    if (!productIdParam || typeof productIdParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const productId = parseInt(productIdParam, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const data = await wishlistService.remove(userId, productId);
    if (!data) {
      return res.status(404).json({ success: false, message: "Item not found in wishlist" });
    }
    res.json({ success: true, message: "Removed from wishlist", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const clearWishlistController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    await wishlistService.clear(userId);
    res.json({ success: true, message: "Wishlist cleared successfully" });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const checkWishlistController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const productIdParam = req.params.productId;
    if (!productIdParam || typeof productIdParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const productId = parseInt(productIdParam, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const data = await wishlistService.isInWishlist(userId, productId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};