import db from "../Drizzle/db";
import { orders, orderItems, products } from "../Drizzle/schema";
import { eq, desc, sql, count, max } from "drizzle-orm";

export const ordersService = {
  getAll: async () => {
    return await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)]
    });
  },

  getById: async (id: string) => {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) throw new Error("Invalid order ID");
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, orderId)
    });
    if (!order) return null;
    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, orderId)
    });
    return { ...order, items };
  },

  getByUser: async (userId: number) => {
    return await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)]
    });
  },

  getByRef: async (ref: string) => {
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderRef, ref)
    });
    if (!order) return null;
    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, order.orderId)
    });
    return { ...order, items };
  },

  getStats: async () => {
    const totalOrders = await db.select({ count: count() }).from(orders);
    const totalRevenue = await db.select({ sum: sql`SUM(total)` }).from(orders);
    const pendingOrders = await db.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
    return {
      totalOrders: Number(totalOrders[0]?.count || 0),
      totalRevenue: Number(totalRevenue[0]?.sum || 0),
      pendingOrders: Number(pendingOrders[0]?.count || 0)
    };
  },

  generateOrderRef: async () => {
    const result = await db.select({ maxRef: max(orders.orderRef) }).from(orders);
    const lastRef = result[0]?.maxRef || "NJ-2026-0000";
    const parts = lastRef.split("-");
    const year = parts[1] || "2026";
    const lastNumber = parseInt(parts[2] || "0", 10);
    const newNumber = lastNumber + 1;
    return `NJ-${year}-${String(newNumber).padStart(4, '0')}`;
  },

  create: async (data: any) => {
    if (!data.items || data.items.length === 0) {
      throw new Error("Order must have at least one item");
    }
    const orderRef = await ordersService.generateOrderRef();
    const [order] = await db.insert(orders).values({
      orderRef,
      userId: data.userId || null,
      guestEmail: data.guestEmail || null,
      guestPhone: data.guestPhone || null,
      total: String(data.total),
      subtotal: String(data.subtotal),
      tax: String(data.tax || 0),
      status: data.status || "pending",
      paymentStatus: data.paymentStatus || "pending",
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      deliveryNotes: data.deliveryNotes || null,
      pickupStationId: data.pickupStationId || null,
      pickupLocationId: data.pickupLocationId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    for (const item of data.items) {
      const product = await db.query.products.findFirst({
        where: eq(products.productId, item.productId)
      });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      await db.insert(orderItems).values({
        orderId: order.orderId,
        productId: item.productId,
        variantId: item.variantId || null,
        productName: item.productName,
        productSku: item.productSku || null,
        price: String(item.price),
        quantity: item.quantity,
        total: String(item.price * item.quantity),
        attributes: item.attributes || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await db.update(products).set({
        stock: sql`${products.stock} - ${item.quantity}`
      }).where(eq(products.productId, item.productId));
    }
    const result = await ordersService.getById(String(order.orderId));
    return result;
  },

  updateStatus: async (id: string, status: string) => {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) throw new Error("Invalid order ID");
    const [updated] = await db.update(orders).set({
      status: status as any,
      updatedAt: new Date()
    }).where(eq(orders.orderId, orderId)).returning();
    return updated || null;
  },

  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) throw new Error("Invalid order ID");
    const [updated] = await db.update(orders).set({
      paymentStatus: paymentStatus as any,
      updatedAt: new Date()
    }).where(eq(orders.orderId, orderId)).returning();
    return updated || null;
  },

  cancel: async (id: string) => {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) throw new Error("Invalid order ID");
    const order = await db.query.orders.findFirst({
      where: eq(orders.orderId, orderId)
    });
    if (!order) throw new Error("Order not found");
    if (order.status === "delivered") throw new Error("Cannot cancel delivered order");
    const [updated] = await db.update(orders).set({
      status: "cancelled",
      updatedAt: new Date()
    }).where(eq(orders.orderId, orderId)).returning();
    return updated || null;
  },

  delete: async (id: string) => {
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) throw new Error("Invalid order ID");
    await db.delete(orderItems).where(eq(orderItems.orderId, orderId));
    const [deleted] = await db.delete(orders).where(eq(orders.orderId, orderId)).returning();
    return deleted || null;
  }
};