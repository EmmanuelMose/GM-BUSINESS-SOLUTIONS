import db from "../Drizzle/db";
import { productVariants, products } from "../Drizzle/schema";
import { eq, desc, and, like, or } from "drizzle-orm";

interface ProductVariant {
  variantId: number;
  productId: number;
  name: string;
  sku: string | null;
  price: string;
  stock: number;
  attributes: any;
  featuredPhoto: string | null;
  galleryPhotos: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NewProductVariant {
  productId: number;
  name: string;
  sku?: string | null;
  price: number;
  stock?: number;
  attributes?: any;
  featuredPhoto?: string | null;
  galleryPhotos?: string[];
}

export const productVariantsService = {
  getAll: async (): Promise<ProductVariant[]> => {
    const results = await db.query.productVariants.findMany({
      orderBy: [desc(productVariants.createdAt)]
    });
    return results.map((item) => ({
      ...item,
      galleryPhotos: (item.galleryPhotos as string[]) || []
    }));
  },

  getById: async (id: string): Promise<ProductVariant | null> => {
    const variantId = parseInt(id, 10);
    if (isNaN(variantId)) {
      throw new Error("Invalid variant ID");
    }
    const result = await db.query.productVariants.findFirst({
      where: eq(productVariants.variantId, variantId)
    });
    if (!result) return null;
    return {
      ...result,
      galleryPhotos: (result.galleryPhotos as string[]) || []
    };
  },

  getByProduct: async (productId: number): Promise<ProductVariant[]> => {
    const results = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, productId),
      orderBy: [desc(productVariants.createdAt)]
    });
    return results.map((item) => ({
      ...item,
      galleryPhotos: (item.galleryPhotos as string[]) || []
    }));
  },

  getBySku: async (sku: string): Promise<ProductVariant | null> => {
    const result = await db.query.productVariants.findFirst({
      where: eq(productVariants.sku, sku)
    });
    if (!result) return null;
    return {
      ...result,
      galleryPhotos: (result.galleryPhotos as string[]) || []
    };
  },

  search: async (searchTerm: string): Promise<ProductVariant[]> => {
    const results = await db.query.productVariants.findMany({
      where: or(
        like(productVariants.name, `%${searchTerm}%`),
        like(productVariants.sku, `%${searchTerm}%`)
      ),
      orderBy: [desc(productVariants.createdAt)]
    });
    return results.map((item) => ({
      ...item,
      galleryPhotos: (item.galleryPhotos as string[]) || []
    }));
  },

  create: async (data: NewProductVariant): Promise<ProductVariant> => {
    const product = await db.query.products.findFirst({
      where: eq(products.productId, data.productId)
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (data.sku) {
      const existing = await db.query.productVariants.findFirst({
        where: eq(productVariants.sku, data.sku)
      });
      if (existing) {
        throw new Error("Variant with this SKU already exists");
      }
    }

    const [created] = await db.insert(productVariants)
      .values({
        productId: data.productId,
        name: data.name,
        sku: data.sku || null,
        price: data.price.toString(),
        stock: data.stock || 0,
        attributes: data.attributes || {},
        featuredPhoto: data.featuredPhoto || null,
        galleryPhotos: data.galleryPhotos || [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return {
      ...created,
      galleryPhotos: (created.galleryPhotos as string[]) || []
    };
  },

  update: async (id: string, data: Partial<NewProductVariant>): Promise<ProductVariant | null> => {
    const variantId = parseInt(id, 10);
    if (isNaN(variantId)) {
      throw new Error("Invalid variant ID");
    }

    const existing = await db.query.productVariants.findFirst({
      where: eq(productVariants.variantId, variantId)
    });

    if (!existing) {
      throw new Error("Variant not found");
    }

    if (data.sku) {
      const conflict = await db.query.productVariants.findFirst({
        where: and(
          eq(productVariants.sku, data.sku),
          eq(productVariants.variantId, variantId)
        )
      });
      if (conflict && conflict.variantId !== variantId) {
        throw new Error("Another variant with this SKU already exists");
      }
    }

    if (data.productId) {
      const product = await db.query.products.findFirst({
        where: eq(products.productId, data.productId)
      });
      if (!product) {
        throw new Error("Product not found");
      }
    }

    const updateData: any = { ...data };
    if (data.price) {
      updateData.price = data.price.toString();
    }

    const [updated] = await db.update(productVariants)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(productVariants.variantId, variantId))
      .returning();

    if (!updated) return null;

    return {
      ...updated,
      galleryPhotos: (updated.galleryPhotos as string[]) || []
    };
  },

  updateStock: async (id: string, stock: number): Promise<ProductVariant | null> => {
    const variantId = parseInt(id, 10);
    if (isNaN(variantId)) {
      throw new Error("Invalid variant ID");
    }

    const existing = await db.query.productVariants.findFirst({
      where: eq(productVariants.variantId, variantId)
    });

    if (!existing) {
      throw new Error("Variant not found");
    }

    const [updated] = await db.update(productVariants)
      .set({
        stock: stock,
        updatedAt: new Date()
      })
      .where(eq(productVariants.variantId, variantId))
      .returning();

    if (!updated) return null;

    return {
      ...updated,
      galleryPhotos: (updated.galleryPhotos as string[]) || []
    };
  },

  delete: async (id: string): Promise<ProductVariant | null> => {
    const variantId = parseInt(id, 10);
    if (isNaN(variantId)) {
      throw new Error("Invalid variant ID");
    }

    const existing = await db.query.productVariants.findFirst({
      where: eq(productVariants.variantId, variantId)
    });

    if (!existing) {
      throw new Error("Variant not found");
    }

    const [deleted] = await db.delete(productVariants)
      .where(eq(productVariants.variantId, variantId))
      .returning();

    if (!deleted) return null;

    return {
      ...deleted,
      galleryPhotos: (deleted.galleryPhotos as string[]) || []
    };
  },

  bulkDelete: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> => {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };

    for (const id of ids) {
      try {
        await productVariantsService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
};