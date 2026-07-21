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
  getBankDetailsController,
  processBankTransferController,
  processCardPaymentController,
  processCashPaymentController,
  refundPaymentController,
  failPaymentController,
  getPaymentStatsController,
  deletePaymentController
} from "./payment.controller";

const paymentsRouter = Router();

paymentsRouter.get("/", getAllPaymentsController);
paymentsRouter.get("/stats", getPaymentStatsController);
paymentsRouter.get("/order/:orderId", getPaymentsByOrderController);
paymentsRouter.get("/transaction/:ref", getPaymentByTransactionController);
paymentsRouter.get("/bank-details", getBankDetailsController);
paymentsRouter.get("/:id", getPaymentByIdController);
paymentsRouter.post("/", createPaymentController);

paymentsRouter.post("/:id/mpesa/initiate", initiateMpesaPaymentController);
paymentsRouter.get("/:id/mpesa/status", queryMpesaStatusController);
paymentsRouter.post("/mpesa/callback", mpesaCallbackController);

paymentsRouter.patch("/:id/bank-transfer", processBankTransferController);
paymentsRouter.patch("/:id/card", processCardPaymentController);
paymentsRouter.patch("/:id/cash", processCashPaymentController);
paymentsRouter.patch("/:id/refund", refundPaymentController);
paymentsRouter.patch("/:id/fail", failPaymentController);
paymentsRouter.delete("/:id", deletePaymentController);

export default paymentsRouter;