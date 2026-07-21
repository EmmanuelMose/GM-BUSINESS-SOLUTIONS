import db from "../Drizzle/db";
import { coupons } from "../Drizzle/schema";
import { eq, desc, and, gte, lte, or, isNull, sql } from "drizzle-orm";

interface Coupon {
  couponId: number;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscount: string | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  appliesTo: any;
  createdAt: Date;
  updatedAt: Date;
}

interface NewCoupon {
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  startDate: Date;
  endDate?: Date | null;
  isActive?: boolean;
  appliesTo?: any;
}

export const couponsService = {
  getAll: async (): Promise<Coupon[]> => {
    return await db.query.coupons.findMany({
      orderBy: [desc(coupons.createdAt)]
    });
  },

  getActive: async (): Promise<Coupon[]> => {
    const now = new Date();
    return await db.query.coupons.findMany({
      where: and(
        eq(coupons.isActive, true),
        lte(coupons.startDate, now),
        or(
          isNull(coupons.endDate),
          gte(coupons.endDate, now)
        )
      ),
      orderBy: [desc(coupons.createdAt)]
    });
  },

  getById: async (id: string): Promise<Coupon | null> => {
    const couponId = parseInt(id, 10);
    if (isNaN(couponId)) {
      throw new Error("Invalid coupon ID");
    }
    const result = await db.query.coupons.findFirst({
      where: eq(coupons.couponId, couponId)
    });
    return result || null;
  },

  getByCode: async (code: string): Promise<Coupon | null> => {
    const result = await db.query.coupons.findFirst({
      where: eq(coupons.code, code.toUpperCase())
    });
    return result || null;
  },

  validate: async (code: string, orderTotal: number): Promise<{ valid: boolean; message?: string; coupon?: Coupon }> => {
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.code, code.toUpperCase())
    });

    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }

    const now = new Date();

    if (!coupon.isActive) {
      return { valid: false, message: "Coupon is not active" };
    }

    if (new Date(coupon.startDate) > now) {
      return { valid: false, message: "Coupon has not started yet" };
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return { valid: false, message: "Coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    if (coupon.minOrderAmount && parseFloat(coupon.minOrderAmount) > orderTotal) {
      return { valid: false, message: `Minimum order amount of KSh ${coupon.minOrderAmount} required` };
    }

    return { valid: true, coupon };
  },

  calculateDiscount: (coupon: Coupon, orderTotal: number): number => {
    let discount = 0;

    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * parseFloat(coupon.discountValue)) / 100;
    } else if (coupon.discountType === 'fixed') {
      discount = parseFloat(coupon.discountValue);
    }

    if (coupon.maxDiscount) {
      discount = Math.min(discount, parseFloat(coupon.maxDiscount));
    }

    return Math.round(discount * 100) / 100;
  },

  create: async (data: NewCoupon): Promise<Coupon> => {
    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.code, data.code.toUpperCase())
    });

    if (existing) {
      throw new Error("Coupon code already exists");
    }

    const [created] = await db.insert(coupons)
      .values({
        code: data.code.toUpperCase(),
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue.toString(),
        minOrderAmount: data.minOrderAmount ? data.minOrderAmount.toString() : null,
        maxDiscount: data.maxDiscount ? data.maxDiscount.toString() : null,
        usageLimit: data.usageLimit || null,
        perUserLimit: data.perUserLimit || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        appliesTo: data.appliesTo || null,
        usedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return created!;
  },

  update: async (id: string, data: Partial<NewCoupon>): Promise<Coupon | null> => {
    const couponId = parseInt(id, 10);
    if (isNaN(couponId)) {
      throw new Error("Invalid coupon ID");
    }

    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.couponId, couponId)
    });

    if (!existing) {
      throw new Error("Coupon not found");
    }

    if (data.code) {
      const conflict = await db.query.coupons.findFirst({
        where: and(
          eq(coupons.code, data.code.toUpperCase()),
          eq(coupons.couponId, couponId)
        )
      });
      if (conflict && conflict.couponId !== couponId) {
        throw new Error("Coupon code already exists");
      }
    }

    const [updated] = await db.update(coupons)
      .set({
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
        discountValue: data.discountValue ? data.discountValue.toString() : undefined,
        minOrderAmount: data.minOrderAmount !== undefined ? (data.minOrderAmount ? data.minOrderAmount.toString() : null) : undefined,
        maxDiscount: data.maxDiscount !== undefined ? (data.maxDiscount ? data.maxDiscount.toString() : null) : undefined,
        updatedAt: new Date()
      })
      .where(eq(coupons.couponId, couponId))
      .returning();

    return updated || null;
  },

  incrementUsed: async (code: string): Promise<void> => {
    await db.update(coupons)
      .set({
        usedCount: sql`${coupons.usedCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(coupons.code, code.toUpperCase()));
  },

  delete: async (id: string): Promise<Coupon | null> => {
    const couponId = parseInt(id, 10);
    if (isNaN(couponId)) {
      throw new Error("Invalid coupon ID");
    }

    const [deleted] = await db.delete(coupons)
      .where(eq(coupons.couponId, couponId))
      .returning();

    return deleted || null;
  },

  toggleStatus: async (id: string): Promise<Coupon | null> => {
    const couponId = parseInt(id, 10);
    if (isNaN(couponId)) {
      throw new Error("Invalid coupon ID");
    }

    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.couponId, couponId)
    });

    if (!existing) {
      throw new Error("Coupon not found");
    }

    const [updated] = await db.update(coupons)
      .set({
        isActive: !existing.isActive,
        updatedAt: new Date()
      })
      .where(eq(coupons.couponId, couponId))
      .returning();

    return updated || null;
  },

  bulkDelete: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> => {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };

    for (const id of ids) {
      try {
        await couponsService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
};