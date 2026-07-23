import { Request, Response } from "express";
import { categoriesService } from "./categories.service";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

export const getAllCategoriesController = async (_req: Request, res: Response) => {
  try {
    const data = await categoriesService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getActiveCategoriesController = async (_req: Request, res: Response) => {
  try {
    const data = await categoriesService.getActive();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getRootCategoriesController = async (_req: Request, res: Response) => {
  try {
    const data = await categoriesService.getRootCategories();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getSubcategoriesController = async (req: Request, res: Response) => {
  try {
    const parentId = req.params.parentId;
    if (!parentId || typeof parentId !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid parent ID" });
    }
    const data = await categoriesService.getSubcategories(parseInt(parentId, 10));
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getCategoryByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }
    const data = await categoriesService.getById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getCategoryBySlugController = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid slug" });
    }
    const data = await categoriesService.getBySlug(slug);
    if (!data) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const searchCategoriesController = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }
    const searchTerm = Array.isArray(q) ? q[0] : q;
    if (!searchTerm) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }
    const data = await categoriesService.search(searchTerm as string);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.photo = await uploadToCloudinary(req.file.buffer);
    }
    const data = await categoriesService.create(body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const updateCategoryController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }
    const body = { ...req.body };
    if (req.file) {
      body.photo = await uploadToCloudinary(req.file.buffer);
    }
    const data = await categoriesService.update(id, body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const deleteCategoryController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }
    const data = await categoriesService.delete(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const toggleCategoryStatusController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }
    const data = await categoriesService.toggleStatus(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({
      success: true,
      message: `Category ${data.isActive ? 'activated' : 'deactivated'} successfully`,
      data
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteCategoriesController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of category IDs to delete"
      });
    }
    const data = await categoriesService.bulkDelete(ids);
    res.json({
      success: true,
      message: `Successfully deleted ${data.success.length} categories`,
      data
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};