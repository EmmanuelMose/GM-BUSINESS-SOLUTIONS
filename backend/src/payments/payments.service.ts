import db from "../Drizzle/db";
import { payments, orders } from "../Drizzle/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { mpesaService } from "../config/mpesa.config";
import bankConfig from "../config/bank.config";

interface Payment {
  paymentId: number;
  orderId: number;
  userId: number | null;
  amount: string;
  paymentMethod: "mpesa" | "cash" | "bank_transfer" | "card";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  transactionReference: string | null;
  mpesaReceiptNumber: string | null;
  mpesaPhoneNumber: string | null;
  mpesaTillNumber: string | null;
  bankReference: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
  paymentDate: Date | null;
  paymentResponse: any;
  notes: string | null;
  processedBy: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NewPayment {
  orderId: number;
  userId?: number | null;
  amount: number;
  paymentMethod: "mpesa" | "cash" | "bank_transfer" | "card";
  mpesaPhoneNumber?: string | null;
  mpesaTillNumber?: string | null;
  bankReference?: string | null;
  cardLastFour?: string | null;
  cardBrand?: string | null;
  notes?: string | null;
  processedBy?: number | null;
}

export const paymentService = {
  getAll: async (): Promise<Payment[]> => {
    return await db.query.payments.findMany({
      orderBy: [desc(payments.createdAt)]
    });
  },

  getById: async (id: string): Promise<Payment | null> => {
    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) {
      throw new Error("Invalid payment ID");
    }
    const result = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentId)
    });
    return result || null;
  },

  getByOrder: async (orderId: number): Promise<Payment[]> => {
    return await db.query.payments.findMany({
      where: eq(payments.orderId, orderId),
      orderBy: [desc(payments.createdAt)]
    });
  },

  getByUser: async (userId: number): Promise<Payment[]> => {
    return await db.query.payments.findMany({
      where: eq(payments.userId, userId),
      orderBy: [desc(payments.createdAt)]
    });
  },

  getByTransactionRef: async (ref: string): Promise<Payment | null> => {
    const result = await db.query.payments.findFirst({
      where: eq(payments.transactionReference, ref)
    });
    return result || null;
  },

  getByMpesaReceipt: async (receipt: string): Promise<Payment | null> => {
    const result = await db.query.payments.findFirst({
      where: eq(payments.mpesaReceiptNumber, receipt)
    });
    return result || null;
  },

  create: async (data: NewPayment): Promise<Payment> => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, data.orderId)
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const existing = await db.query.payments.findFirst({
      where: eq(payments.orderId, data.orderId)
    });

    if (existing) {
      throw new Error("Payment already exists for this order");
    }

    const [created] = await db.insert(payments)
      .values({
        orderId: data.orderId,
        userId: data.userId || null,
        amount: data.amount.toString(),
        paymentMethod: data.paymentMethod,
        paymentStatus: "pending",
        mpesaPhoneNumber: data.mpesaPhoneNumber || null,
        mpesaTillNumber: data.mpesaTillNumber || null,
        bankReference: data.bankReference || null,
        cardLastFour: data.cardLastFour || null,
        cardBrand: data.cardBrand || null,
        notes: data.notes || null,
        processedBy: data.processedBy || null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return created!;
  },

  initiateMpesaPayment: async (paymentId: string): Promise<any> => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) {
      throw new Error("Invalid payment ID");
    }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (!payment.mpesaPhoneNumber) {
      throw new Error("Phone number is required for M-Pesa payment");
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, payment.orderId)
    });

    if (!order) {
      throw new Error("Order not found");
    }

    try {
      const response = await mpesaService.stkPush(
        payment.mpesaPhoneNumber,
        parseFloat(payment.amount),
        order.orderRef,
        `Payment for order ${order.orderRef}`
      );

      const [updated] = await db.update(payments)
        .set({
          transactionReference: response.CheckoutRequestID,
          paymentResponse: response,
          updatedAt: new Date()
        })
        .where(eq(payments.paymentId, paymentIdNum))
        .returning();

      return {
        ...updated,
        checkoutRequestId: response.CheckoutRequestID,
        customerMessage: response.CustomerMessage,
        responseCode: response.ResponseCode
      };
    } catch (error: any) {
      await db.update(payments)
        .set({
          paymentStatus: "failed",
          notes: error.message,
          updatedAt: new Date()
        })
        .where(eq(payments.paymentId, paymentIdNum));

      throw new Error(error.message);
    }
  },

  queryMpesaStatus: async (paymentId: string): Promise<any> => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) {
      throw new Error("Invalid payment ID");
    }

    const payment = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (!payment.transactionReference) {
      throw new Error("No transaction reference found");
    }

    try {
      const response = await mpesaService.queryStkPush(payment.transactionReference);
      
      if (response.ResultCode === "0") {
        const [updated] = await db.update(payments)
          .set({
            paymentStatus: "paid",
            mpesaReceiptNumber: response.MpesaReceiptNumber,
            paymentDate: new Date(),
            paymentResponse: response,
            updatedAt: new Date()
          })
          .where(eq(payments.paymentId, paymentIdNum))
          .returning();

        await db.update(orders)
          .set({
            paymentStatus: "paid",
            updatedAt: new Date()
          })
          .where(eq(orders.orderId, payment.orderId));

        return updated;
      } else {
        const [updated] = await db.update(payments)
          .set({
            paymentStatus: "failed",
            paymentResponse: response,
            notes: response.ResultDesc || "Payment failed",
            updatedAt: new Date()
          })
          .where(eq(payments.paymentId, paymentIdNum))
          .returning();

        return updated;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  handleMpesaCallback: async (callbackData: any): Promise<void> => {
    try {
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

        await db.update(payments)
          .set({
            paymentStatus: "paid",
            mpesaReceiptNumber: mpesaReceiptNumber,
            mpesaPhoneNumber: phoneNumber || payment.mpesaPhoneNumber,
            paymentDate: new Date(),
            paymentResponse: callbackData,
            updatedAt: new Date()
          })
          .where(eq(payments.paymentId, payment.paymentId));

        await db.update(orders)
          .set({
            paymentStatus: "paid",
            updatedAt: new Date()
          })
          .where(eq(orders.orderId, payment.orderId));

        console.log(`Payment ${payment.paymentId} confirmed with receipt: ${mpesaReceiptNumber}`);
      } else {
        await db.update(payments)
          .set({
            paymentStatus: "failed",
            notes: resultDesc,
            paymentResponse: callbackData,
            updatedAt: new Date()
          })
          .where(eq(payments.paymentId, payment.paymentId));

        console.log(`Payment ${payment.paymentId} failed: ${resultDesc}`);
      }
    } catch (error: any) {
      console.error("Error handling M-Pesa callback:", error.message);
      throw error;
    }
  },

  getBankDetails: async (): Promise<any> => {
    return {
      bankName: bankConfig.bankName,
      accountName: bankConfig.accountName,
      accountNumber: bankConfig.accountNumber,
      bankCode: bankConfig.bankCode,
      branch: bankConfig.branch,
      swiftCode: bankConfig.swiftCode,
      instructions: bankConfig.instructions
    };
  },

  processBankTransfer: async (paymentId: string, bankReference: string, processedBy?: number): Promise<Payment | null> => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) {
      throw new Error("Invalid payment ID");
    }

    const existing = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });

    if (!existing) {
      throw new Error("Payment not found");
    }

    const [updated] = await db.update(payments)
      .set({
        bankReference: bankReference,
        paymentStatus: "paid",
        paymentDate: new Date(),
        processedBy: processedBy || null,
        updatedAt: new Date()
      })
      .where(eq(payments.paymentId, paymentIdNum))
      .returning();

    if (updated) {
      await db.update(orders)
        .set({
          paymentStatus: "paid",
          updatedAt: new Date()
        })
        .where(eq(orders.orderId, updated.orderId));
    }

    return updated || null;
  },

  processCardPayment: async (
    paymentId: string, 
    cardLastFour: string, 
    cardBrand: string, 
    transactionRef: string,
    processedBy?: number
  ): Promise<Payment | null> => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) {
      throw new Error("Invalid payment ID");
    }

    const existing = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });

    if (!existing) {
      throw new Error("Payment not found");
    }

    const [updated] = await db.update(payments)
      .set({
        cardLastFour: cardLastFour,
        cardBrand: cardBrand,
        transactionReference: transactionRef,
        paymentStatus: "paid",
        paymentDate: new Date(),
        processedBy: processedBy || null,
        updatedAt: new Date()
      })
      .where(eq(payments.paymentId, paymentIdNum))
      .returning();

    if (updated) {
      await db.update(orders)
        .set({
          paymentStatus: "paid",
          updatedAt: new Date()
        })
        .where(eq(orders.orderId, updated.orderId));
    }

    return updated || null;
  },

  processCashPayment: async (paymentId: string, processedBy: number): Promise<Payment | null> => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) {
      throw new Error("Invalid payment ID");
    }

    const existing = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });

    if (!existing) {
      throw new Error("Payment not found");
    }

    const [updated] = await db.update(payments)
      .set({
        paymentStatus: "paid",
        paymentDate: new Date(),
        processedBy: processedBy,
        updatedAt: new Date()
      })
      .where(eq(payments.paymentId, paymentIdNum))
      .returning();

    if (updated) {
      await db.update(orders)
        .set({
          paymentStatus: "paid",
          updatedAt: new Date()
        })
        .where(eq(orders.orderId, updated.orderId));
    }

    return updated || null;
  },

  refundPayment: async (paymentId: string, notes?: string): Promise<Payment | null> => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) {
      throw new Error("Invalid payment ID");
    }

    const existing = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });

    if (!existing) {
      throw new Error("Payment not found");
    }

    if (existing.paymentStatus !== "paid") {
      throw new Error("Only paid payments can be refunded");
    }

    const [updated] = await db.update(payments)
      .set({
        paymentStatus: "refunded",
        notes: notes || existing.notes || "Refunded",
        updatedAt: new Date()
      })
      .where(eq(payments.paymentId, paymentIdNum))
      .returning();

    if (updated) {
      await db.update(orders)
        .set({
          paymentStatus: "refunded",
          updatedAt: new Date()
        })
        .where(eq(orders.orderId, updated.orderId));
    }

    return updated || null;
  },

  failPayment: async (paymentId: string, notes?: string): Promise<Payment | null> => {
    const paymentIdNum = parseInt(paymentId, 10);
    if (isNaN(paymentIdNum)) {
      throw new Error("Invalid payment ID");
    }

    const existing = await db.query.payments.findFirst({
      where: eq(payments.paymentId, paymentIdNum)
    });

    if (!existing) {
      throw new Error("Payment not found");
    }

    const [updated] = await db.update(payments)
      .set({
        paymentStatus: "failed",
        notes: notes || existing.notes || "Payment failed",
        updatedAt: new Date()
      })
      .where(eq(payments.paymentId, paymentIdNum))
      .returning();

    if (updated) {
      await db.update(orders)
        .set({
          paymentStatus: "failed",
          updatedAt: new Date()
        })
        .where(eq(orders.orderId, updated.orderId));
    }

    return updated || null;
  },

  getStats: async (): Promise<any> => {
    const total = await db.select({ count: count() }).from(payments);
    const totalAmount = await db.select({ sum: sql`SUM(amount)` }).from(payments).where(eq(payments.paymentStatus, "paid"));
    const pending = await db.select({ count: count() }).from(payments).where(eq(payments.paymentStatus, "pending"));
    const paid = await db.select({ count: count() }).from(payments).where(eq(payments.paymentStatus, "paid"));
    const failed = await db.select({ count: count() }).from(payments).where(eq(payments.paymentStatus, "failed"));
    const refunded = await db.select({ count: count() }).from(payments).where(eq(payments.paymentStatus, "refunded"));

    const mpesa = await db.select({ count: count() }).from(payments).where(eq(payments.paymentMethod, "mpesa"));
    const cash = await db.select({ count: count() }).from(payments).where(eq(payments.paymentMethod, "cash"));
    const bankTransfer = await db.select({ count: count() }).from(payments).where(eq(payments.paymentMethod, "bank_transfer"));
    const card = await db.select({ count: count() }).from(payments).where(eq(payments.paymentMethod, "card"));

    return {
      total: Number(total[0]?.count || 0),
      totalAmount: Number(totalAmount[0]?.sum || 0),
      pending: Number(pending[0]?.count || 0),
      paid: Number(paid[0]?.count || 0),
      failed: Number(failed[0]?.count || 0),
      refunded: Number(refunded[0]?.count || 0),
      methods: {
        mpesa: Number(mpesa[0]?.count || 0),
        cash: Number(cash[0]?.count || 0),
        bankTransfer: Number(bankTransfer[0]?.count || 0),
        card: Number(card[0]?.count || 0)
      }
    };
  },

  delete: async (id: string): Promise<Payment | null> => {
    const paymentId = parseInt(id, 10);
    if (isNaN(paymentId)) {
      throw new Error("Invalid payment ID");
    }

    const [deleted] = await db.delete(payments)
      .where(eq(payments.paymentId, paymentId))
      .returning();

    return deleted || null;
  }
};