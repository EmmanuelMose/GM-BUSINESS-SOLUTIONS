import { Request, Response } from "express";
import { inquiriesService } from "./inquiries.service";

export const getAllInquiriesController = async (_req: Request, res: Response) => {
  try {
    const data = await inquiriesService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getUnreadInquiriesController = async (_req: Request, res: Response) => {
  try {
    const data = await inquiriesService.getUnread();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getInquiryByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID" });
    }
    const data = await inquiriesService.getById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createInquiryController = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message, productId } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email and message are required" 
      });
    }
    const data = await inquiriesService.create({
      name,
      email,
      phone,
      subject,
      message,
      productId,
      userId: (req as any).user?.userId
    });
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const markInquiryReadController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID" });
    }
    const data = await inquiriesService.markRead(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, message: "Inquiry marked as read", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const replyInquiryController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { response } = req.body;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID" });
    }
    if (!response) {
      return res.status(400).json({ success: false, message: "Response message is required" });
    }
    const respondedBy = (req as any).user?.userId;
    if (!respondedBy) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await inquiriesService.reply(id, response, respondedBy);
    if (!data) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, message: "Reply sent successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const markInquiryResolvedController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID" });
    }
    const data = await inquiriesService.markResolved(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, message: "Inquiry marked as resolved", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteInquiryController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid inquiry ID" });
    }
    const data = await inquiriesService.delete(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, message: "Inquiry deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteInquiriesController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of inquiry IDs to delete" 
      });
    }
    const data = await inquiriesService.bulkDelete(ids);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${data.success.length} inquiries`,
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};