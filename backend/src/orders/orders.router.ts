import { Router } from "express";
import {
  getAllOrdersController,
  getUserOrdersController,
  getOrderByIdController,
  getOrderByRefController,
  createOrderController,
  updateOrderStatusController,
  updatePaymentStatusController,
  cancelOrderController,
  deleteOrderController,
  getOrderStatsController
} from "./orders.controller";

const ordersRouter = Router();

ordersRouter.get("/", getAllOrdersController);
ordersRouter.get("/stats", getOrderStatsController);
ordersRouter.get("/user", getUserOrdersController);
ordersRouter.get("/ref/:ref", getOrderByRefController);
ordersRouter.get("/:id", getOrderByIdController);
ordersRouter.post("/", createOrderController);
ordersRouter.patch("/:id/status", updateOrderStatusController);
ordersRouter.patch("/:id/payment", updatePaymentStatusController);
ordersRouter.patch("/:id/cancel", cancelOrderController);
ordersRouter.delete("/:id", deleteOrderController);

export default ordersRouter;