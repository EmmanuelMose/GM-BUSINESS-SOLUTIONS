import { Request, Response } from "express";
import { cartService } from "./cart.service";

export const getCartController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const items = await cartService.getByUser(userId);
    const total = await cartService.getTotal(userId);
    const count = await cartService.getCount(userId);
    res.json({ success: true, data: { items, total, count } });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const addToCartController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }
    const qty = quantity || 1;
    const data = await cartService.add(userId, productId, qty);
    res.status(201).json({ success: true, message: "Added to cart", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateCartController = async (req: Request, res: Response) => {
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
    const { quantity } = req.body;
    if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ success: false, message: "Valid quantity is required" });
    }
    const data = await cartService.updateQuantity(userId, productId, quantity);
    if (!data) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }
    res.json({ success: true, message: "Cart updated", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const removeFromCartController = async (req: Request, res: Response) => {
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
    const data = await cartService.remove(userId, productId);
    if (!data) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }
    res.json({ success: true, message: "Removed from cart", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const clearCartController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    await cartService.clear(userId);
    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};