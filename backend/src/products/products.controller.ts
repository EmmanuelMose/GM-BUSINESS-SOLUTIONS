import { Request, Response } from "express";
import { productsService } from "./products.service";

export const getAllProductsController = async (_req: Request, res: Response) => {
  try {
    const data = await productsService.getAll();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getActiveProductsController = async (_req: Request, res: Response) => {
  try {
    const data = await productsService.getActive();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getProductsByCategoryController = async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.categoryId;
    if (!categoryId || typeof categoryId !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }
    const data = await productsService.getByCategory(parseInt(categoryId, 10));
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getFeaturedProductsController = async (_req: Request, res: Response) => {
  try {
    const data = await productsService.getFeatured();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getBestSellersController = async (_req: Request, res: Response) => {
  try {
    const data = await productsService.getBestSellers();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getProductByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const data = await productsService.getById(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getProductBySlugController = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid slug" });
    }
    const data = await productsService.getBySlug(slug);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const searchProductsController = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }
    const searchTerm = Array.isArray(q) ? q[0] : q;
    if (!searchTerm) {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }
    const data = await productsService.search(searchTerm as string);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const filterProductsController = async (req: Request, res: Response) => {
  try {
    const data = await productsService.filter(req.query);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createProductController = async (req: Request, res: Response) => {
  try {
    const data = await productsService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const updateProductController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const data = await productsService.update(id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    const status = e.message.includes("already exists") ? 409 : 400;
    res.status(status).json({ success: false, message: e.message });
  }
};

export const deleteProductController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const data = await productsService.delete(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const toggleFeaturedController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const data = await productsService.toggleFeatured(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ 
      success: true, 
      message: `Product ${data.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const toggleBestSellerController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const data = await productsService.toggleBestSeller(id);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ 
      success: true, 
      message: `Product ${data.isBestSeller ? 'marked as best seller' : 'removed from best sellers'} successfully`,
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateStockController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    const { stock } = req.body;
    if (stock === undefined || typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ success: false, message: "Valid stock quantity is required" });
    }
    const data = await productsService.updateStock(id, stock);
    if (!data) {
      return res.status(404).json({ success: false, message: "Product not found" });
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

export const getLowStockProductsController = async (_req: Request, res: Response) => {
  try {
    const data = await productsService.getLowStock();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const bulkDeleteProductsController = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of product IDs to delete" 
      });
    }

    const data = await productsService.bulkDelete(ids);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${data.success.length} products`,
      data 
    });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};