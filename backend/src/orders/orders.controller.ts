// src/orders/orders.controller.ts
import { Request, Response } from "express";
import { ordersService } from "./orders.service";

export const getAllOrdersController = async (_req: Request, res: Response) => {
  try {
    const data = await ordersService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getOrderByIdController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const data = await ordersService.getById(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getUserOrdersController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await ordersService.getByUser(userId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getOrderByRefController = async (req: Request, res: Response) => {
  try {
    const refParam = req.params.ref;
    if (!refParam || typeof refParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid order reference" });
    }
    const data = await ordersService.getByRef(refParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createOrderController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and must have at least one item",
      });
    }
    const data = await ordersService.create({
      ...req.body,
      userId: userId || null,
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    console.error("Order creation error:", e);
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateOrderStatusController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }
    const data = await ordersService.updateStatus(idParam, status);
    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: `Order status updated to ${status}`, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updatePaymentStatusController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const { paymentStatus } = req.body;
    if (!paymentStatus) {
      return res.status(400).json({ success: false, message: "Payment status is required" });
    }
    const data = await ordersService.updatePaymentStatus(idParam, paymentStatus);
    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: `Payment status updated to ${paymentStatus}`, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const cancelOrderController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const data = await ordersService.cancel(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order cancelled successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteOrderController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const data = await ordersService.delete(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getOrderStatsController = async (_req: Request, res: Response) => {
  try {
    const data = await ordersService.getStats();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};