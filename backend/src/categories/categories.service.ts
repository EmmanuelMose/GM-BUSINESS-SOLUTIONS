import db from "../Drizzle/db";
import { categories, products } from "../Drizzle/schema";
import { eq, like, or, and, count, asc, isNull } from "drizzle-orm";

interface Category {
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  photo: string | null;
  parentId: number | null;
  displayOrder: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NewCategory {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  photo?: string | null;
  parentId?: number | null;
  displayOrder?: number | null;
  isActive?: boolean;
}

interface CategoryWithCount extends Category {
  productCount: number;
  subcategories?: Category[];
}

export const categoriesService = {
  // Get all categories with product counts
  getAll: async (): Promise<CategoryWithCount[]> => {
    const allCategories = await db.query.categories.findMany({
      orderBy: [asc(categories.displayOrder), asc(categories.name)]
    });

    const categoriesWithCounts = await Promise.all(
      allCategories.map(async (category) => {
        const productCount = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.categoryId, category.categoryId));
        
        return {
          ...category,
          productCount: Number(productCount[0]?.count || 0)
        };
      })
    );

    return categoriesWithCounts;
  },

  // Get active categories only for storefront
  getActive: async (): Promise<CategoryWithCount[]> => {
    const activeCategories = await db.query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: [asc(categories.displayOrder), asc(categories.name)]
    });

    const categoriesWithCounts = await Promise.all(
      activeCategories.map(async (category) => {
        const productCount = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.categoryId, category.categoryId));
        
        return {
          ...category,
          productCount: Number(productCount[0]?.count || 0)
        };
      })
    );

    return categoriesWithCounts;
  },

  // Get root categories (no parent)
  getRootCategories: async (): Promise<CategoryWithCount[]> => {
    const rootCategories = await db.query.categories.findMany({
      where: and(
        eq(categories.isActive, true),
        isNull(categories.parentId)
      ),
      orderBy: [asc(categories.displayOrder), asc(categories.name)]
    });

    const categoriesWithCounts = await Promise.all(
      rootCategories.map(async (category) => {
        const productCount = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.categoryId, category.categoryId));
        
        return {
          ...category,
          productCount: Number(productCount[0]?.count || 0)
        };
      })
    );

    return categoriesWithCounts;
  },

  // Get subcategories by parent ID
  getSubcategories: async (parentId: number): Promise<CategoryWithCount[]> => {
    const subcategories = await db.query.categories.findMany({
      where: and(
        eq(categories.isActive, true),
        eq(categories.parentId, parentId)
      ),
      orderBy: [asc(categories.displayOrder), asc(categories.name)]
    });

    const categoriesWithCounts = await Promise.all(
      subcategories.map(async (category) => {
        const productCount = await db
          .select({ count: count() })
          .from(products)
          .where(eq(products.categoryId, category.categoryId));
        
        return {
          ...category,
          productCount: Number(productCount[0]?.count || 0)
        };
      })
    );

    return categoriesWithCounts;
  },

  // Get category by ID
  getById: async (id: string): Promise<CategoryWithCount | null> => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      throw new Error("Invalid category ID");
    }

    const result = await db.query.categories.findFirst({
      where: eq(categories.categoryId, categoryId)
    });

    if (!result) return null;

    const productCount = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));

    const subcategories = await db.query.categories.findMany({
      where: and(
        eq(categories.parentId, categoryId),
        eq(categories.isActive, true)
      ),
      orderBy: [asc(categories.displayOrder), asc(categories.name)]
    });

    return {
      ...result,
      productCount: Number(productCount[0]?.count || 0),
      subcategories
    };
  },

  // Get category by slug
  getBySlug: async (slug: string): Promise<CategoryWithCount | null> => {
    const result = await db.query.categories.findFirst({
      where: eq(categories.slug, slug)
    });

    if (!result) return null;

    const productCount = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.categoryId, result.categoryId));

    return {
      ...result,
      productCount: Number(productCount[0]?.count || 0)
    };
  },

  // Search categories by name or description
  search: async (searchTerm: string): Promise<Category[]> => {
    return await db.query.categories.findMany({
      where: or(
        like(categories.name, `%${searchTerm}%`),
        like(categories.description, `%${searchTerm}%`)
      ),
      orderBy: [asc(categories.name)]
    });
  },

  // Create new category
  create: async (data: NewCategory): Promise<Category> => {
    const existing = await db.query.categories.findFirst({
      where: or(
        eq(categories.name, data.name),
        eq(categories.slug, data.slug)
      )
    });

    if (existing) {
      throw new Error("Category with this name or slug already exists");
    }

    if (data.parentId) {
      const parent = await db.query.categories.findFirst({
        where: eq(categories.categoryId, data.parentId)
      });

      if (!parent) {
        throw new Error("Parent category not found");
      }
    }

    const [created] = await db.insert(categories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || null,
        photo: data.photo || null,
        parentId: data.parentId || null,
        displayOrder: data.displayOrder !== undefined ? data.displayOrder : 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return created;
  },

  // Update category
  update: async (id: string, data: Partial<NewCategory>): Promise<Category | null> => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      throw new Error("Invalid category ID");
    }

    const existing = await db.query.categories.findFirst({
      where: eq(categories.categoryId, categoryId)
    });

    if (!existing) {
      throw new Error("Category not found");
    }

    if (data.name || data.slug) {
      const conflicts = await db.query.categories.findFirst({
        where: and(
          or(
            data.name ? eq(categories.name, data.name) : undefined,
            data.slug ? eq(categories.slug, data.slug) : undefined
          ),
          eq(categories.categoryId, categoryId)
        )
      });

      if (conflicts && conflicts.categoryId !== categoryId) {
        throw new Error("Another category with this name or slug already exists");
      }
    }

    if (data.parentId !== undefined) {
      if (data.parentId === categoryId) {
        throw new Error("Category cannot be its own parent");
      }

      if (data.parentId) {
        const parent = await db.query.categories.findFirst({
          where: eq(categories.categoryId, data.parentId)
        });

        if (!parent) {
          throw new Error("Parent category not found");
        }
      }
    }

    const [updated] = await db.update(categories)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(categories.categoryId, categoryId))
      .returning();

    return updated || null;
  },

  // Delete category
  delete: async (id: string): Promise<Category | null> => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      throw new Error("Invalid category ID");
    }

    const existing = await db.query.categories.findFirst({
      where: eq(categories.categoryId, categoryId)
    });

    if (!existing) {
      throw new Error("Category not found");
    }

    const productCount = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.categoryId, categoryId));

    if (Number(productCount[0]?.count || 0) > 0) {
      throw new Error("Cannot delete category with associated products");
    }

    const subcategoryCount = await db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.parentId, categoryId));

    if (Number(subcategoryCount[0]?.count || 0) > 0) {
      throw new Error("Cannot delete category with subcategories");
    }

    const [deleted] = await db.delete(categories)
      .where(eq(categories.categoryId, categoryId))
      .returning();

    return deleted || null;
  },

  // Toggle category active status
  toggleStatus: async (id: string): Promise<Category | null> => {
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      throw new Error("Invalid category ID");
    }

    const existing = await db.query.categories.findFirst({
      where: eq(categories.categoryId, categoryId)
    });

    if (!existing) {
      throw new Error("Category not found");
    }

    const [updated] = await db.update(categories)
      .set({
        isActive: !existing.isActive,
        updatedAt: new Date()
      })
      .where(eq(categories.categoryId, categoryId))
      .returning();

    return updated || null;
  },

  // Bulk delete categories
  bulkDelete: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> => {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };

    for (const id of ids) {
      try {
        await categoriesService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
};