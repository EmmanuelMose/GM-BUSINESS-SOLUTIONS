import { Request, Response } from "express";
import { subscribersService } from "./subscribers.service";

export const getAllSubscribersController = async (_req: Request, res: Response) => {
  try {
    const data = await subscribersService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getActiveSubscribersController = async (_req: Request, res: Response) => {
  try {
    const data = await subscribersService.getActive();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getSubscriberByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid subscriber ID" });
    }
    const data = await subscribersService.getById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const subscribeController = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const data = await subscribersService.subscribe({ email, name });
    res.status(201).json({ 
      success: true, 
      message: "Subscribed successfully",
      data 
    });
  } catch (e: any) {
    const status = e.message.includes("already subscribed") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const unsubscribeController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const data = await subscribersService.unsubscribe(email);
    if (!data) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }
    res.json({ 
      success: true, 
      message: "Unsubscribed successfully",
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteSubscriberController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid subscriber ID" });
    }
    const data = await subscribersService.delete(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Subscriber not found" });
    }
    res.json({ success: true, message: "Subscriber deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteSubscribersController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of subscriber IDs to delete" 
      });
    }
    const data = await subscribersService.bulkDelete(ids);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${data.success.length} subscribers`,
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};