// src/staff/staff.controller.ts 
import { Request, Response } from "express";
import { staffService } from "./staff.service";

export const getAllStaffController = async (_req: Request, res: Response) => {
  try {
    const data = await staffService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getStaffByIdController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid staff ID" });
    }
    const data = await staffService.getById(idParam);
    if (!data) return res.status(404).json({ success: false, message: "Staff not found" });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createStaffController = async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ success: false, message: "userId and email are required" });
    }
    const data = await staffService.create({ userId, email });
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const deleteStaffController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid staff ID" });
    }
    const data = await staffService.delete(idParam);
    if (!data) return res.status(404).json({ success: false, message: "Staff not found" });
    res.json({ success: true, message: "Staff removed successfully (record kept)", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteStaffController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Provide array of staff IDs" });
    }
    const data = await staffService.bulkDelete(ids);
    res.json({ success: true, message: `Processed ${data.success.length} staff, ${data.failed.length} failed`, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};