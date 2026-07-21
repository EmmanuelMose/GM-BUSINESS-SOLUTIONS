import db from "../Drizzle/db";
import { products, cart } from "../Drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

interface CartItem {
  cartId: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export const cartService = {
  getByUser: async (userId: number): Promise<any[]> => {
    const items = await db.query.cart.findMany({
      where: eq(cart.userId, userId),
      orderBy: [desc(cart.createdAt)]
    });

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await db.query.products.findFirst({
          where: eq(products.productId, item.productId)
        });
        return {
          ...item,
          product,
          subtotal: product ? parseFloat(product.price) * item.quantity : 0
        };
      })
    );

    return itemsWithProducts;
  },

  getById: async (id: string, userId: number): Promise<any | null> => {
    const cartId = parseInt(id, 10);
    if (isNaN(cartId)) {
      throw new Error("Invalid cart ID");
    }

    const item = await db.query.cart.findFirst({
      where: and(
        eq(cart.cartId, cartId),
        eq(cart.userId, userId)
      )
    });

    if (!item) return null;

    const product = await db.query.products.findFirst({
      where: eq(products.productId, item.productId)
    });

    return {
      ...item,
      product,
      subtotal: product ? parseFloat(product.price) * item.quantity : 0
    };
  },

  add: async (userId: number, productId: number, quantity: number = 1): Promise<CartItem> => {
    const existing = await db.query.cart.findFirst({
      where: and(
        eq(cart.userId, userId),
        eq(cart.productId, productId)
      )
    });

    if (existing) {
      const [updated] = await db.update(cart)
        .set({
          quantity: existing.quantity + quantity,
          updatedAt: new Date()
        })
        .where(eq(cart.cartId, existing.cartId))
        .returning();

      return updated!;
    }

    const [created] = await db.insert(cart)
      .values({
        userId,
        productId,
        quantity,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return created!;
  },

  updateQuantity: async (userId: number, productId: number, quantity: number): Promise<CartItem | null> => {
    if (quantity <= 0) {
      return await cartService.remove(userId, productId);
    }

    const [updated] = await db.update(cart)
      .set({
        quantity,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(cart.userId, userId),
          eq(cart.productId, productId)
        )
      )
      .returning();

    return updated || null;
  },

  remove: async (userId: number, productId: number): Promise<CartItem | null> => {
    const [deleted] = await db.delete(cart)
      .where(
        and(
          eq(cart.userId, userId),
          eq(cart.productId, productId)
        )
      )
      .returning();

    return deleted || null;
  },

  clear: async (userId: number): Promise<void> => {
    await db.delete(cart)
      .where(eq(cart.userId, userId));
  },

  getTotal: async (userId: number): Promise<number> => {
    const items = await db.query.cart.findMany({
      where: eq(cart.userId, userId)
    });

    let total = 0;
    for (const item of items) {
      const product = await db.query.products.findFirst({
        where: eq(products.productId, item.productId)
      });
      if (product) {
        total += parseFloat(product.price) * item.quantity;
      }
    }

    return total;
  },

  getCount: async (userId: number): Promise<number> => {
    const items = await db.query.cart.findMany({
      where: eq(cart.userId, userId)
    });
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
};