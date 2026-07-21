import db from "../Drizzle/db";
import { reviews, products, users } from "../Drizzle/schema";
import { eq, desc, and, count, avg, sql } from "drizzle-orm";

interface NewReview {
  userId: number;
  productId: number;
  orderId?: number | null;
  rating: number;
  title?: string | null;
  comment: string;
  photos?: string[];
}

export const reviewsService = {
  getByProduct: async (productId: number): Promise<any[]> => {
    const reviewsList = await db.query.reviews.findMany({
      where: and(
        eq(reviews.productId, productId),
        eq(reviews.status, "approved")
      ),
      orderBy: [desc(reviews.createdAt)]
    });

    const reviewsWithUser = await Promise.all(
      reviewsList.map(async (review) => {
        const user = await db.query.users.findFirst({
          where: eq(users.userId, review.userId)
        });
        return {
          ...review,
          user: user ? { fullName: user.fullName } : null
        };
      })
    );

    return reviewsWithUser;
  },

  getAll: async (): Promise<any[]> => {
    return await db.query.reviews.findMany({
      orderBy: [desc(reviews.createdAt)]
    });
  },

  getPending: async (): Promise<any[]> => {
    return await db.query.reviews.findMany({
      where: eq(reviews.status, "pending"),
      orderBy: [desc(reviews.createdAt)]
    });
  },

  getById: async (id: string): Promise<any | null> => {
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw new Error("Invalid review ID");
    }
    const result = await db.query.reviews.findFirst({
      where: eq(reviews.reviewId, reviewId)
    });
    return result || null;
  },

  getByUser: async (userId: number): Promise<any[]> => {
    return await db.query.reviews.findMany({
      where: eq(reviews.userId, userId),
      orderBy: [desc(reviews.createdAt)]
    });
  },

  create: async (data: NewReview): Promise<any> => {
    const [created] = await db.insert(reviews)
      .values({
        userId: data.userId,
        productId: data.productId,
        orderId: data.orderId || null,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        photos: data.photos || [],
        status: "pending",
        isVerified: false,
        helpfulCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    await reviewsService.updateProductRating(data.productId);

    return created!;
  },

  approve: async (id: string): Promise<any | null> => {
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw new Error("Invalid review ID");
    }

    const [updated] = await db.update(reviews)
      .set({
        status: "approved",
        updatedAt: new Date()
      })
      .where(eq(reviews.reviewId, reviewId))
      .returning();

    if (updated) {
      await reviewsService.updateProductRating(updated.productId);
    }

    return updated || null;
  },

  reject: async (id: string): Promise<any | null> => {
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw new Error("Invalid review ID");
    }

    const [updated] = await db.update(reviews)
      .set({
        status: "rejected",
        updatedAt: new Date()
      })
      .where(eq(reviews.reviewId, reviewId))
      .returning();

    return updated || null;
  },

  markHelpful: async (id: string): Promise<any | null> => {
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw new Error("Invalid review ID");
    }

    const [updated] = await db.update(reviews)
      .set({
        helpfulCount: sql`${reviews.helpfulCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(reviews.reviewId, reviewId))
      .returning();

    return updated || null;
  },

  updateProductRating: async (productId: number): Promise<void> => {
    const result = await db
      .select({
        avgRating: avg(reviews.rating),
        reviewCount: count(reviews.reviewId)
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.productId, productId),
          eq(reviews.status, "approved")
        )
      );

    const avgRating = result[0]?.avgRating || 0;
    const reviewCount = Number(result[0]?.reviewCount || 0);

    await db.update(products)
      .set({
        rating: avgRating.toString(),
        reviewCount: reviewCount,
        updatedAt: new Date()
      })
      .where(eq(products.productId, productId));
  },

  delete: async (id: string): Promise<any | null> => {
    const reviewId = parseInt(id, 10);
    if (isNaN(reviewId)) {
      throw new Error("Invalid review ID");
    }

    const existing = await db.query.reviews.findFirst({
      where: eq(reviews.reviewId, reviewId)
    });

    const [deleted] = await db.delete(reviews)
      .where(eq(reviews.reviewId, reviewId))
      .returning();

    if (deleted && existing) {
      await reviewsService.updateProductRating(existing.productId);
    }

    return deleted || null;
  },

  bulkDelete: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> => {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };

    for (const id of ids) {
      try {
        await reviewsService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
};