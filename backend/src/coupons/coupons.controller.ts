import { Request, Response } from "express";
import { couponsService } from "./coupons.service";

export const getAllCouponsController = async (_req: Request, res: Response) => {
  try {
    const data = await couponsService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getActiveCouponsController = async (_req: Request, res: Response) => {
  try {
    const data = await couponsService.getActive();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getCouponByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid coupon ID" });
    }
    const data = await couponsService.getById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const validateCouponController = async (req: Request, res: Response) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }
    if (!orderTotal || typeof orderTotal !== 'number') {
      return res.status(400).json({ success: false, message: "Valid order total is required" });
    }
    const result = await couponsService.validate(code, orderTotal);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    const discount = couponsService.calculateDiscount(result.coupon!, orderTotal);
    res.json({ 
      success: true, 
      data: { 
        coupon: result.coupon, 
        discount,
        finalTotal: orderTotal - discount
      } 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createCouponController = async (req: Request, res: Response) => {
  try {
    const data = await couponsService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const updateCouponController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid coupon ID" });
    }
    const data = await couponsService.update(id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const deleteCouponController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid coupon ID" });
    }
    const data = await couponsService.delete(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const toggleCouponStatusController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid coupon ID" });
    }
    const data = await couponsService.toggleStatus(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.json({ 
      success: true, 
      message: `Coupon ${data.isActive ? 'activated' : 'deactivated'} successfully`,
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteCouponsController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of coupon IDs to delete" 
      });
    }
    const data = await couponsService.bulkDelete(ids);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${data.success.length} coupons`,
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};