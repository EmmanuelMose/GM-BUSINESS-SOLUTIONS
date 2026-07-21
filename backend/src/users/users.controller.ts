import { Request, Response } from "express";
import { usersService } from "./users.service";

export const getAllUsersController = async (_req: Request, res: Response) => {
  try {
    const data = await usersService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const data = await usersService.getById(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const searchUsersController = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }
    const searchTerm = Array.isArray(q) ? q[0] : q;
    const data = await usersService.search(searchTerm as string);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const data = await usersService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const data = await usersService.update(idParam, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already in use") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const data = await usersService.delete(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const toggleUserStatusController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const data = await usersService.toggleStatus(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      message: `User ${data.isActive ? 'activated' : 'deactivated'} successfully`,
      data
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteUsersController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of user IDs to delete"
      });
    }
    const data = await usersService.bulkDelete(ids);
    res.json({
      success: true,
      message: `Successfully deleted ${data.success.length} users`,
      data
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};