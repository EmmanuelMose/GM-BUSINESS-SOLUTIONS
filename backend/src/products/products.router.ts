import { Router } from "express";
import {
  getAllProductsController,
  getActiveProductsController,
  getProductsByCategoryController,
  getFeaturedProductsController,
  getBestSellersController,
  getProductByIdController,
  getProductBySlugController,
  searchProductsController,
  filterProductsController,
  createProductController,
  updateProductController,
  deleteProductController,
  toggleFeaturedController,
  toggleBestSellerController,
  updateStockController,
  getLowStockProductsController,
  bulkDeleteProductsController
} from "./products.controller";

const productsRouter = Router();

productsRouter.get("/active", getActiveProductsController);
productsRouter.get("/featured", getFeaturedProductsController);
productsRouter.get("/bestsellers", getBestSellersController);
productsRouter.get("/low-stock", getLowStockProductsController);
productsRouter.get("/category/:categoryId", getProductsByCategoryController);
productsRouter.get("/slug/:slug", getProductBySlugController);
productsRouter.get("/search", searchProductsController);
productsRouter.get("/filter", filterProductsController);
productsRouter.get("/", getAllProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.post("/", createProductController);
productsRouter.put("/:id", updateProductController);
productsRouter.delete("/:id", deleteProductController);
productsRouter.patch("/:id/toggle-featured", toggleFeaturedController);
productsRouter.patch("/:id/toggle-bestseller", toggleBestSellerController);
productsRouter.patch("/:id/update-stock", updateStockController);
productsRouter.post("/bulk-delete", bulkDeleteProductsController);

export default productsRouter;