import { Router } from "express";
import {
  getAllCouponsController,
  getActiveCouponsController,
  getCouponByIdController,
  validateCouponController,
  createCouponController,
  updateCouponController,
  deleteCouponController,
  toggleCouponStatusController,
  bulkDeleteCouponsController
} from "./coupons.controller";

const couponsRouter = Router();

couponsRouter.get("/", getAllCouponsController);
couponsRouter.get("/active", getActiveCouponsController);
couponsRouter.get("/:id", getCouponByIdController);
couponsRouter.post("/validate", validateCouponController);
couponsRouter.post("/", createCouponController);
couponsRouter.put("/:id", updateCouponController);
couponsRouter.delete("/:id", deleteCouponController);
couponsRouter.patch("/:id/toggle-status", toggleCouponStatusController);
couponsRouter.post("/bulk-delete", bulkDeleteCouponsController);

export default couponsRouter;