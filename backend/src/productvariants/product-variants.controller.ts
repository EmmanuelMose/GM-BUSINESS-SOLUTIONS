import { Request, Response } from "express";
import { productVariantsService } from "./product-variants.service";

export const getAllVariantsController = async (_req: Request, res: Response) => {
  try {
    const data = await productVariantsService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getVariantByIdController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid variant ID" });
    }
    const data = await productVariantsService.getById(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getVariantsByProductController = async (req: Request, res: Response) => {
  try {
    const productIdParam = req.params.productId;
    if (!productIdParam || typeof productIdParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const productId = parseInt(productIdParam, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }
    const data = await productVariantsService.getByProduct(productId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getVariantBySkuController = async (req: Request, res: Response) => {
  try {
    const skuParam = req.params.sku;
    if (!skuParam || typeof skuParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid SKU" });
    }
    const data = await productVariantsService.getBySku(skuParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const searchVariantsController = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }
    const searchTerm = Array.isArray(q) ? q[0] : q;
    const data = await productVariantsService.search(searchTerm as string);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createVariantController = async (req: Request, res: Response) => {
  try {
    const data = await productVariantsService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const updateVariantController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid variant ID" });
    }
    const data = await productVariantsService.update(idParam, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const updateVariantStockController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid variant ID" });
    }
    const { stock } = req.body;
    if (stock === undefined || typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ success: false, message: "Valid stock quantity is required" });
    }
    const data = await productVariantsService.updateStock(idParam, stock);
    if (!data) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }
    res.json({ 
      success: true, 
      message: `Stock updated to ${stock} successfully`,
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteVariantController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    if (!idParam || typeof idParam !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid variant ID" });
    }
    const data = await productVariantsService.delete(idParam);
    if (!data) {
      return res.status(404).json({ success: false, message: "Variant not found" });
    }
    res.json({ success: true, message: "Variant deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteVariantsController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of variant IDs to delete"
      });
    }
    const data = await productVariantsService.bulkDelete(ids);
    res.json({
      success: true,
      message: `Successfully deleted ${data.success.length} variants`,
      data
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};