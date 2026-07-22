import { Router } from "express";
import {
  getAllPaymentsController,
  getPaymentByIdController,
  getPaymentsByOrderController,
  getPaymentByTransactionController,
  createPaymentController,
  initiateMpesaPaymentController,
  queryMpesaStatusController,
  mpesaCallbackController,
  getPaymentStatsController,
  deletePaymentController
} from "./payment.controller";

const paymentsRouter = Router();

paymentsRouter.get("/", getAllPaymentsController);
paymentsRouter.get("/stats", getPaymentStatsController);
paymentsRouter.get("/order/:orderId", getPaymentsByOrderController);
paymentsRouter.get("/transaction/:ref", getPaymentByTransactionController);
paymentsRouter.get("/:id", getPaymentByIdController);
paymentsRouter.post("/", createPaymentController);
paymentsRouter.post("/:id/mpesa/initiate", initiateMpesaPaymentController);
paymentsRouter.get("/:id/mpesa/status", queryMpesaStatusController);
paymentsRouter.post("/mpesa/callback", mpesaCallbackController);
paymentsRouter.delete("/:id", deletePaymentController);

export default paymentsRouter;