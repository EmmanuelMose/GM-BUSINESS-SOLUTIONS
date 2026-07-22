import db from "../Drizzle/db";
import { payments, orders } from "../Drizzle/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { mpesaService } from "../config/mpesa.config";

export const paymentService = {
  getAll: async () => {
    return await db.query.payments.findMany({
      orderBy: [desc(payments.createdAt)]
    });
  },

  getById: async (id: string) => {
    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) throw new Error("Invalid payment ID");
    const result = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentId)
    });
    return result || null;
  },

  getByOrder: async (orderId: number) => {
    return await db.query.payments.findMany({
      where: eq(payments.orderId, orderId),
      orderBy: [desc(payments.createdAt)]
    });
  },

  getByTransactionRef: async (ref: string) => {
    const result = await db.query.payments.findFirst({
      where: eq(payments.transactionReference, ref)
    });
    return result || null;
  },

  getByMpesaReceipt: async (receipt: string) => {
    const result = await db.query.payments.findFirst({
      where: eq(payments.mpesaReceiptNumber, receipt)
    });
    return result || null;
  },

  create: async (data: any) => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, data.orderId)
    });
    if (!order) throw new Error("Order not found");
    const existing = await db.query.payments.findFirst({
      where: eq(payments.orderId, data.orderId)
    });
    if (existing) throw new Error("Payment already exists for this order");
    const [created] = await db.insert(payments).values({
      orderId: data.orderId,
      userId: data.userId || null,
      amount: data.amount.toString(),
      paymentMethod: "mpesa",
      paymentStatus: "pending",
      mpesaPhoneNumber: data.mpesaPhoneNumber || null,
      mpesaTillNumber: process.env.MPESA_SHORT_CODE || null,
      notes: data.notes || null,
      processedBy: data.processedBy || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return created!;
  },

  initiateMpesaPayment: async (paymentId: string) => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) throw new Error("Invalid payment ID");
    const payment = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });
    if (!payment) throw new Error("Payment not found");
    if (!payment.mpesaPhoneNumber) throw new Error("Phone number is required");
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, payment.orderId)
    });
    if (!order) throw new Error("Order not found");
    const response = await mpesaService.stkPush(
      payment.mpesaPhoneNumber,
      parseFloat(payment.amount),
      order.orderRef,
      `Payment for order ${order.orderRef}`
    );
    await db.update(payments).set({
      transactionReference: response.CheckoutRequestID,
      paymentResponse: response,
      updatedAt: new Date()
    }).where(eq(payments.paymentId, paymentIdNum));
    return {
      ...payment,
      checkoutRequestId: response.CheckoutRequestID,
      customerMessage: response.CustomerMessage,
      responseCode: response.ResponseCode
    };
  },

  queryMpesaStatus: async (paymentId: string) => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) throw new Error("Invalid payment ID");
    const payment = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });
    if (!payment) throw new Error("Payment not found");
    if (!payment.transactionReference) throw new Error("No transaction reference found");
    const response = await mpesaService.queryStkPush(payment.transactionReference);
    if (response.ResultCode === "0") {
      const [updated] = await db.update(payments).set({
        paymentStatus: "paid",
        mpesaReceiptNumber: response.MpesaReceiptNumber,
        paymentDate: new Date(),
        paymentResponse: response,
        updatedAt: new Date()
      }).where(eq(payments.paymentId, paymentIdNum)).returning();
      await db.update(orders).set({
        paymentStatus: "paid",
        updatedAt: new Date()
      }).where(eq(orders.orderId, payment.orderId));
      return updated;
    } else {
      const [updated] = await db.update(payments).set({
        paymentStatus: "failed",
        paymentResponse: response,
        notes: response.ResultDesc || "Payment failed",
        updatedAt: new Date()
      }).where(eq(payments.paymentId, paymentIdNum)).returning();
      return updated;
    }
  },

  handleMpesaCallback: async (callbackData: any) => {
    const { Body } = callbackData;
    const { stkCallback } = Body;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    const payment = await db.query.payments.findFirst({
      where: eq(payments.transactionReference, checkoutRequestId)
    });
    if (!payment) {
      console.error(`Payment not found for CheckoutRequestID: ${checkoutRequestId}`);
      return;
    }
    if (resultCode === 0) {
      const mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item?.find(
        (item: any) => item.Name === "MpesaReceiptNumber"
      )?.Value;
      const phoneNumber = stkCallback.CallbackMetadata?.Item?.find(
        (item: any) => item.Name === "PhoneNumber"
      )?.Value;
      await db.update(payments).set({
        paymentStatus: "paid",
        mpesaReceiptNumber: mpesaReceiptNumber,
        mpesaPhoneNumber: phoneNumber || payment.mpesaPhoneNumber,
        paymentDate: new Date(),
        paymentResponse: callbackData,
        updatedAt: new Date()
      }).where(eq(payments.paymentId, payment.paymentId));
      await db.update(orders).set({
        paymentStatus: "paid",
        updatedAt: new Date()
      }).where(eq(orders.orderId, payment.orderId));
    } else {
      await db.update(payments).set({
        paymentStatus: "failed",
        notes: resultDesc,
        paymentResponse: callbackData,
        updatedAt: new Date()
      }).where(eq(payments.paymentId, payment.paymentId));
    }
  },

  getStats: async () => {
    const total = await db.select({ count: count() }).from(payments);
    const totalAmount = await db.select({ sum: sql`SUM(amount)` }).from(payments).where(eq(payments.paymentStatus, "paid"));
    const pending = await db.select({ count: count() }).from(payments).where(eq(payments.paymentStatus, "pending"));
    const paid = await db.select({ count: count() }).from(payments).where(eq(payments.paymentStatus, "paid"));
    const failed = await db.select({ count: count() }).from(payments).where(eq(payments.paymentStatus, "failed"));
    const refunded = await db.select({ count: count() }).from(payments).where(eq(payments.paymentStatus, "refunded"));
    return {
      total: Number(total[0]?.count || 0),
      totalAmount: Number(totalAmount[0]?.sum || 0),
      pending: Number(pending[0]?.count || 0),
      paid: Number(paid[0]?.count || 0),
      failed: Number(failed[0]?.count || 0),
      refunded: Number(refunded[0]?.count || 0)
    };
  },

  delete: async (id: string) => {
    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) throw new Error("Invalid payment ID");
    const [deleted] = await db.delete(payments).where(eq(payments.paymentId, paymentId)).returning();
    return deleted || null;
  }
};