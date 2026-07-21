import { Request, Response } from "express";
import { addressesService } from "./addresses.service";

export const getUserAddressesController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await addressesService.getByUser(userId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getAddressByIdController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }
    const data = await addressesService.getById(idParam, userId);
    if (!data) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    res.json({ success: true, data: { ...data, formatted: addressesService.getFormattedAddress(data) } });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getDefaultAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await addressesService.getDefault(userId);
    if (data) {
      res.json({ success: true, data: { ...data, formatted: addressesService.getFormattedAddress(data) } });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await addressesService.create({ ...req.body, userId });
    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: { ...data, formatted: addressesService.getFormattedAddress(data) }
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }
    const data = await addressesService.update(idParam, userId, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    res.json({
      success: true,
      message: "Address updated successfully",
      data: { ...data, formatted: addressesService.getFormattedAddress(data) }
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const setDefaultAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }
    const data = await addressesService.setDefault(idParam, userId);
    if (!data) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    res.json({ success: true, message: "Default address set successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteAddressController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }
    const data = await addressesService.delete(idParam, userId);
    if (!data) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    res.json({ success: true, message: "Address deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getAddressSummaryController = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid address ID" });
    }
    const data = await addressesService.getById(idParam, userId);
    if (!data) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    res.json({ success: true, data: addressesService.getDeliverySummary(data) });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};