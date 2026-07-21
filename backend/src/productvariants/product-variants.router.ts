import { Router } from "express";
import {
  getAllVariantsController,
  getVariantByIdController,
  getVariantsByProductController,
  getVariantBySkuController,
  searchVariantsController,
  createVariantController,
  updateVariantController,
  updateVariantStockController,
  deleteVariantController,
  bulkDeleteVariantsController
} from "./product-variants.controller";

const productVariantsRouter = Router();

productVariantsRouter.get("/", getAllVariantsController);
productVariantsRouter.get("/search", searchVariantsController);
productVariantsRouter.get("/product/:productId", getVariantsByProductController);
productVariantsRouter.get("/sku/:sku", getVariantBySkuController);
productVariantsRouter.get("/:id", getVariantByIdController);
productVariantsRouter.post("/", createVariantController);
productVariantsRouter.put("/:id", updateVariantController);
productVariantsRouter.patch("/:id/stock", updateVariantStockController);
productVariantsRouter.delete("/:id", deleteVariantController);
productVariantsRouter.post("/bulk-delete", bulkDeleteVariantsController);

export default productVariantsRouter;