import { Request, Response } from "express";
import { paymentService } from "./payments.service";

export const getAllPaymentsController = async (_req: Request, res: Response) => {
  try {
    const data = await paymentService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getPaymentByIdController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid payment ID" });
    }
    const data = await paymentService.getById(idParam);
    if (!data) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getPaymentsByOrderController = async (req: Request, res: Response) => {
  try {
    const orderIdParam = req.params.orderId;
    if (!orderIdParam || typeof orderIdParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }
    const orderId = parseInt(orderIdParam, 10);
    if (isNaN(orderId)) return res.status(400).json({ success: false, message: "Invalid order ID format" });
    const data = await paymentService.getByOrder(orderId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getPaymentByTransactionController = async (req: Request, res: Response) => {
  try {
    const refParam = req.params.ref;
    if (!refParam || typeof refParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid transaction reference" });
    }
    const data = await paymentService.getByTransactionRef(refParam);
    if (!data) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createPaymentController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const data = await paymentService.create({
      ...req.body,
      userId: userId || null,
      processedBy: userId || null
    });
    res.status(201).json({ success: true, message: "Payment created successfully", data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const initiateMpesaPaymentController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid payment ID" });
    }
    const data = await paymentService.initiateMpesaPayment(idParam);
    res.json({
      success: true,
      message: "M-Pesa STK Push initiated successfully. Please check your phone for the prompt.",
      data
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const queryMpesaStatusController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid payment ID" });
    }
    const data = await paymentService.queryMpesaStatus(idParam);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const mpesaCallbackController = async (req: Request, res: Response) => {
  try {
    await paymentService.handleMpesaCallback(req.body);
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (e: any) {
    console.error("M-Pesa callback error:", e.message);
    res.status(200).json({ ResultCode: 1, ResultDesc: "Failed to process callback" });
  }
};

export const getPaymentStatsController = async (_req: Request, res: Response) => {
  try {
    const data = await paymentService.getStats();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deletePaymentController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid payment ID" });
    }
    const data = await paymentService.delete(idParam);
    if (!data) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, message: "Payment deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};