// src/admins/admins.controller.ts 
import { Request, Response } from "express";
import { adminsService } from "./admins.service";

export const getAllAdminsController = async (_req: Request, res: Response) => {
  try {
    const data = await adminsService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getAdminByIdController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid admin ID" });
    }
    const data = await adminsService.getById(idParam);
    if (!data) return res.status(404).json({ success: false, message: "Admin not found" });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createAdminController = async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ success: false, message: "userId and email are required" });
    }
    const data = await adminsService.create({ userId, email });
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const deleteAdminController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid admin ID" });
    }
    const data = await adminsService.delete(idParam);
    if (!data) return res.status(404).json({ success: false, message: "Admin not found" });
    res.json({ success: true, message: "Admin removed successfully (record kept)", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteAdminsController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Provide array of admin IDs" });
    }
    const data = await adminsService.bulkDelete(ids);
    res.json({ success: true, message: `Processed ${data.success.length} admins, ${data.failed.length} failed`, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};