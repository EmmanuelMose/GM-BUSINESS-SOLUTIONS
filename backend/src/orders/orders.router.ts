import { Router } from "express";
import {
  getAllOrdersController,
  getUserOrdersController,
  getOrderByIdController,
  getOrderByRefController,
  getOrderByUserAndRefController,
  createOrderController,
  updateOrderStatusController,
  updatePaymentStatusController,
  cancelOrderController,
  deleteOrderController,
  getOrderStatsController
} from "./orders.controller";
import { authenticate } from "../middleware/auth.middleware";

const ordersRouter = Router();

ordersRouter.get("/", authenticate, getAllOrdersController);
ordersRouter.get("/stats", authenticate, getOrderStatsController);
ordersRouter.get("/user", authenticate, getUserOrdersController);
ordersRouter.get("/ref/:ref", getOrderByRefController);
ordersRouter.get("/user/ref/:ref", authenticate, getOrderByUserAndRefController);
ordersRouter.get("/:id", authenticate, getOrderByIdController);
ordersRouter.post("/", authenticate, createOrderController);
ordersRouter.patch("/:id/status", authenticate, updateOrderStatusController);
ordersRouter.patch("/:id/payment", authenticate, updatePaymentStatusController);
ordersRouter.patch("/:id/cancel", authenticate, cancelOrderController);
ordersRouter.delete("/:id", authenticate, deleteOrderController);

export default ordersRouter;