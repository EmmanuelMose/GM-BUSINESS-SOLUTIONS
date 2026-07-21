import { Router } from "express";
import {
  getAllCategoriesController,
  getActiveCategoriesController,
  getRootCategoriesController,
  getSubcategoriesController,
  getCategoryByIdController,
  getCategoryBySlugController,
  searchCategoriesController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  toggleCategoryStatusController,
  bulkDeleteCategoriesController
} from "./categories.controller";

const categoriesRouter = Router();

categoriesRouter.get("/", getAllCategoriesController);
categoriesRouter.get("/active", getActiveCategoriesController);
categoriesRouter.get("/root", getRootCategoriesController);
categoriesRouter.get("/subcategories/:parentId", getSubcategoriesController);
categoriesRouter.get("/slug/:slug", getCategoryBySlugController);
categoriesRouter.get("/search", searchCategoriesController);
categoriesRouter.get("/:id", getCategoryByIdController);
categoriesRouter.post("/", createCategoryController);
categoriesRouter.put("/:id", updateCategoryController);
categoriesRouter.delete("/:id", deleteCategoryController);
categoriesRouter.patch("/:id/toggle-status", toggleCategoryStatusController);
categoriesRouter.post("/bulk-delete", bulkDeleteCategoriesController);

export default categoriesRouter;