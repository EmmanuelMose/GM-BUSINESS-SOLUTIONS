import db from "../Drizzle/db";
import { products, wishlist } from "../Drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

interface WishlistItem {
  wishlistId: number;
  userId: number;
  productId: number;
  createdAt: Date;
}

export const wishlistService = {
  getByUser: async (userId: number): Promise<any[]> => {
    const items = await db.query.wishlist.findMany({
      where: eq(wishlist.userId, userId),
      orderBy: [desc(wishlist.createdAt)]
    });

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await db.query.products.findFirst({
          where: eq(products.productId, item.productId)
        });
        return {
          ...item,
          product
        };
      })
    );

    return itemsWithProducts;
  },

  getById: async (id: string, userId: number): Promise<any | null> => {
    const wishlistId = parseInt(id, 10);
    if (isNaN(wishlistId)) {
      throw new Error("Invalid wishlist ID");
    }

    const item = await db.query.wishlist.findFirst({
      where: and(
        eq(wishlist.wishlistId, wishlistId),
        eq(wishlist.userId, userId)
      )
    });

    if (!item) return null;

    const product = await db.query.products.findFirst({
      where: eq(products.productId, item.productId)
    });

    return {
      ...item,
      product
    };
  },

  add: async (userId: number, productId: number): Promise<WishlistItem> => {
    const existing = await db.query.wishlist.findFirst({
      where: and(
        eq(wishlist.userId, userId),
        eq(wishlist.productId, productId)
      )
    });

    if (existing) {
      throw new Error("Product already in wishlist");
    }

    const [created] = await db.insert(wishlist)
      .values({
        userId,
        productId,
        createdAt: new Date()
      })
      .returning();

    return created!;
  },

  remove: async (userId: number, productId: number): Promise<WishlistItem | null> => {
    const [deleted] = await db.delete(wishlist)
      .where(
        and(
          eq(wishlist.userId, userId),
          eq(wishlist.productId, productId)
        )
      )
      .returning();

    return deleted || null;
  },

  clear: async (userId: number): Promise<void> => {
    await db.delete(wishlist)
      .where(eq(wishlist.userId, userId));
  },

  isInWishlist: async (userId: number, productId: number): Promise<boolean> => {
    const item = await db.query.wishlist.findFirst({
      where: and(
        eq(wishlist.userId, userId),
        eq(wishlist.productId, productId)
      )
    });
    return !!item;
  }
};