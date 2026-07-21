import db from "../Drizzle/db";
import { products, categories, productVariants, orderItems, reviews } from "../Drizzle/schema";
import { eq, like, or, and, count, asc, desc, between, gte, lte, ilike, sql } from "drizzle-orm";

interface Product {
  productId: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string;
  comparePrice: string | null;
  costPrice: string | null;
  stock: number;
  lowStockThreshold: number | null;
  status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  categoryId: number | null;
  featuredPhoto: string | null;
  sku: string | null;
  brand: string | null;
  brandPhoto: string | null;
  weight: string | null;
  dimensions: any;
  isFeatured: boolean;
  isBestSeller: boolean;
  views: number;
  rating: string | null;
  reviewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  galleryPhotos: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface NewProduct {
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  stock?: number;
  lowStockThreshold?: number | null;
  categoryId?: number | null;
  featuredPhoto?: string | null;
  sku?: string | null;
  brand?: string | null;
  brandPhoto?: string | null;
  weight?: number | null;
  dimensions?: any;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  galleryPhotos?: string[];
}

interface ProductWithCategory extends Product {
  categoryName?: string | null;
  categorySlug?: string | null;
  variants?: any[];
}

export const productsService = {
  getAll: async (): Promise<ProductWithCategory[]> => {
    const allProducts = await db.query.products.findMany({
      orderBy: [desc(products.createdAt)]
    });

    const productsWithCategory = await Promise.all(
      allProducts.map(async (product) => {
        let categoryName = null;
        let categorySlug = null;
        
        if (product.categoryId) {
          const category = await db.query.categories.findFirst({
            where: eq(categories.categoryId, product.categoryId)
          });
          if (category) {
            categoryName = category.name;
            categorySlug = category.slug;
          }
        }

        return {
          ...product,
          galleryPhotos: product.galleryPhotos as string[] || [],
          categoryName,
          categorySlug
        };
      })
    );

    return productsWithCategory;
  },

  getActive: async (): Promise<ProductWithCategory[]> => {
    const activeProducts = await db.query.products.findMany({
      where: eq(products.status, "in_stock"),
      orderBy: [desc(products.createdAt)]
    });

    const productsWithCategory = await Promise.all(
      activeProducts.map(async (product) => {
        let categoryName = null;
        let categorySlug = null;
        
        if (product.categoryId) {
          const category = await db.query.categories.findFirst({
            where: eq(categories.categoryId, product.categoryId)
          });
          if (category) {
            categoryName = category.name;
            categorySlug = category.slug;
          }
        }

        return {
          ...product,
          galleryPhotos: product.galleryPhotos as string[] || [],
          categoryName,
          categorySlug
        };
      })
    );

    return productsWithCategory;
  },

  getByCategory: async (categoryId: number): Promise<ProductWithCategory[]> => {
    const categoryProducts = await db.query.products.findMany({
      where: eq(products.categoryId, categoryId),
      orderBy: [desc(products.createdAt)]
    });

    const category = await db.query.categories.findFirst({
      where: eq(categories.categoryId, categoryId)
    });

    const productsWithCategory = categoryProducts.map((product) => ({
      ...product,
      galleryPhotos: product.galleryPhotos as string[] || [],
      categoryName: category?.name || null,
      categorySlug: category?.slug || null
    }));

    return productsWithCategory;
  },

  getFeatured: async (): Promise<ProductWithCategory[]> => {
    const featuredProducts = await db.query.products.findMany({
      where: and(
        eq(products.isFeatured, true),
        eq(products.status, "in_stock")
      ),
      orderBy: [desc(products.createdAt)],
      limit: 10
    });

    const productsWithCategory = await Promise.all(
      featuredProducts.map(async (product) => {
        let categoryName = null;
        let categorySlug = null;
        
        if (product.categoryId) {
          const category = await db.query.categories.findFirst({
            where: eq(categories.categoryId, product.categoryId)
          });
          if (category) {
            categoryName = category.name;
            categorySlug = category.slug;
          }
        }

        return {
          ...product,
          galleryPhotos: product.galleryPhotos as string[] || [],
          categoryName,
          categorySlug
        };
      })
    );

    return productsWithCategory;
  },

  getBestSellers: async (): Promise<ProductWithCategory[]> => {
    const bestSellers = await db.query.products.findMany({
      where: and(
        eq(products.isBestSeller, true),
        eq(products.status, "in_stock")
      ),
      orderBy: [desc(products.createdAt)],
      limit: 10
    });

    const productsWithCategory = await Promise.all(
      bestSellers.map(async (product) => {
        let categoryName = null;
        let categorySlug = null;
        
        if (product.categoryId) {
          const category = await db.query.categories.findFirst({
            where: eq(categories.categoryId, product.categoryId)
          });
          if (category) {
            categoryName = category.name;
            categorySlug = category.slug;
          }
        }

        return {
          ...product,
          galleryPhotos: product.galleryPhotos as string[] || [],
          categoryName,
          categorySlug
        };
      })
    );

    return productsWithCategory;
  },

  getById: async (id: string): Promise<ProductWithCategory | null> => {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    const result = await db.query.products.findFirst({
      where: eq(products.productId, productId)
    });

    if (!result) return null;

    let categoryName = null;
    let categorySlug = null;
    
    if (result.categoryId) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.categoryId, result.categoryId)
      });
      if (category) {
        categoryName = category.name;
        categorySlug = category.slug;
      }
    }

    const variants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, productId)
    });

    return {
      ...result,
      galleryPhotos: result.galleryPhotos as string[] || [],
      categoryName,
      categorySlug,
      variants
    };
  },

  getBySlug: async (slug: string): Promise<ProductWithCategory | null> => {
    const result = await db.query.products.findFirst({
      where: eq(products.slug, slug)
    });

    if (!result) return null;

    let categoryName = null;
    let categorySlug = null;
    
    if (result.categoryId) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.categoryId, result.categoryId)
      });
      if (category) {
        categoryName = category.name;
        categorySlug = category.slug;
      }
    }

    const variants = await db.query.productVariants.findMany({
      where: eq(productVariants.productId, result.productId)
    });

    return {
      ...result,
      galleryPhotos: result.galleryPhotos as string[] || [],
      categoryName,
      categorySlug,
      variants
    };
  },

  search: async (searchTerm: string): Promise<ProductWithCategory[]> => {
    const results = await db.query.products.findMany({
      where: or(
        ilike(products.name, `%${searchTerm}%`),
        ilike(products.description, `%${searchTerm}%`),
        ilike(products.shortDescription, `%${searchTerm}%`),
        ilike(products.brand, `%${searchTerm}%`)
      ),
      orderBy: [desc(products.createdAt)]
    });

    const productsWithCategory = await Promise.all(
      results.map(async (product) => {
        let categoryName = null;
        let categorySlug = null;
        
        if (product.categoryId) {
          const category = await db.query.categories.findFirst({
            where: eq(categories.categoryId, product.categoryId)
          });
          if (category) {
            categoryName = category.name;
            categorySlug = category.slug;
          }
        }

        return {
          ...product,
          galleryPhotos: product.galleryPhotos as string[] || [],
          categoryName,
          categorySlug
        };
      })
    );

    return productsWithCategory;
  },

  filter: async (filters: any): Promise<ProductWithCategory[]> => {
    const conditions = [];

    if (filters.categoryId) {
      conditions.push(eq(products.categoryId, parseInt(filters.categoryId, 10)));
    }

    if (filters.status) {
      conditions.push(eq(products.status, filters.status));
    }

    if (filters.minPrice && filters.maxPrice) {
      conditions.push(
        between(products.price, filters.minPrice, filters.maxPrice)
      );
    } else if (filters.minPrice) {
      conditions.push(gte(products.price, filters.minPrice));
    } else if (filters.maxPrice) {
      conditions.push(lte(products.price, filters.maxPrice));
    }

    if (filters.brand) {
      conditions.push(eq(products.brand, filters.brand));
    }

    if (filters.inStock) {
      conditions.push(gte(products.stock, 1));
    }

    if (filters.isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, filters.isFeatured === 'true'));
    }

    if (filters.isBestSeller !== undefined) {
      conditions.push(eq(products.isBestSeller, filters.isBestSeller === 'true'));
    }

    const results = await db.query.products.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: filters.sortBy === 'price' 
        ? filters.sortOrder === 'desc' 
          ? desc(products.price) 
          : asc(products.price)
        : filters.sortBy === 'rating'
        ? desc(products.rating)
        : filters.sortBy === 'name'
        ? asc(products.name)
        : desc(products.createdAt)
    });

    const productsWithCategory = await Promise.all(
      results.map(async (product) => {
        let categoryName = null;
        let categorySlug = null;
        
        if (product.categoryId) {
          const category = await db.query.categories.findFirst({
            where: eq(categories.categoryId, product.categoryId)
          });
          if (category) {
            categoryName = category.name;
            categorySlug = category.slug;
          }
        }

        return {
          ...product,
          galleryPhotos: product.galleryPhotos as string[] || [],
          categoryName,
          categorySlug
        };
      })
    );

    return productsWithCategory;
  },

  create: async (data: NewProduct): Promise<Product> => {
    const existing = await db.query.products.findFirst({
      where: or(
        eq(products.sku, data.sku || ''),
        eq(products.slug, data.slug)
      )
    });

    if (existing) {
      throw new Error("Product with this SKU or slug already exists");
    }

    if (data.categoryId) {
      const category = await db.query.categories.findFirst({
        where: eq(categories.categoryId, data.categoryId)
      });

      if (!category) {
        throw new Error("Category not found");
      }
    }

    const stock = data.stock || 0;
    let status: "in_stock" | "low_stock" | "out_of_stock" = "out_of_stock";
    const threshold = data.lowStockThreshold || 5;
    
    if (stock > 0 && stock <= threshold) {
      status = "low_stock";
    } else if (stock > 0) {
      status = "in_stock";
    }

    const [created] = await db.insert(products)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        shortDescription: data.shortDescription || null,
        price: data.price.toString(),
        comparePrice: data.comparePrice ? data.comparePrice.toString() : null,
        costPrice: data.costPrice ? data.costPrice.toString() : null,
        stock: stock,
        lowStockThreshold: data.lowStockThreshold || 5,
        status: status,
        categoryId: data.categoryId || null,
        featuredPhoto: data.featuredPhoto || null,
        sku: data.sku || null,
        brand: data.brand || null,
        brandPhoto: data.brandPhoto || null,
        weight: data.weight ? data.weight.toString() : null,
        dimensions: data.dimensions || null,
        isFeatured: data.isFeatured || false,
        isBestSeller: data.isBestSeller || false,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        galleryPhotos: data.galleryPhotos || [],
        views: 0,
        rating: "0",
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return {
      ...created,
      galleryPhotos: created.galleryPhotos as string[] || []
    };
  },

  update: async (id: string, data: Partial<NewProduct>): Promise<Product | null> => {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    const existing = await db.query.products.findFirst({
      where: eq(products.productId, productId)
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    if (data.sku || data.slug) {
      const conflicts = await db.query.products.findFirst({
        where: and(
          or(
            data.sku ? eq(products.sku, data.sku) : undefined,
            data.slug ? eq(products.slug, data.slug) : undefined
          ),
          eq(products.productId, productId)
        )
      });

      if (conflicts && conflicts.productId !== productId) {
        throw new Error("Another product with this SKU or slug already exists");
      }
    }

    if (data.categoryId !== undefined) {
      if (data.categoryId) {
        const category = await db.query.categories.findFirst({
          where: eq(categories.categoryId, data.categoryId)
        });

        if (!category) {
          throw new Error("Category not found");
        }
      }
    }

    const updateData: any = { ...data };
    
    if (data.stock !== undefined) {
      const stock = data.stock;
      const threshold = data.lowStockThreshold || existing.lowStockThreshold || 5;
      let status: "in_stock" | "low_stock" | "out_of_stock" = "out_of_stock";
      
      if (stock > 0 && stock <= threshold) {
        status = "low_stock";
      } else if (stock > 0) {
        status = "in_stock";
      }
      updateData.status = status;
    }

    const [updated] = await db.update(products)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(products.productId, productId))
      .returning();

    if (updated) {
      return {
        ...updated,
        galleryPhotos: updated.galleryPhotos as string[] || []
      };
    }

    return null;
  },

  delete: async (id: string): Promise<Product | null> => {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    const existing = await db.query.products.findFirst({
      where: eq(products.productId, productId)
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    const orderItemCount = await db
      .select({ count: count() })
      .from(orderItems)
      .where(eq(orderItems.productId, productId));

    if (Number(orderItemCount[0]?.count || 0) > 0) {
      throw new Error("Cannot delete product with existing orders");
    }

    await db.delete(productVariants)
      .where(eq(productVariants.productId, productId));

    await db.delete(reviews)
      .where(eq(reviews.productId, productId));

    const [deleted] = await db.delete(products)
      .where(eq(products.productId, productId))
      .returning();

    if (deleted) {
      return {
        ...deleted,
        galleryPhotos: deleted.galleryPhotos as string[] || []
      };
    }

    return null;
  },

  toggleFeatured: async (id: string): Promise<Product | null> => {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    const existing = await db.query.products.findFirst({
      where: eq(products.productId, productId)
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    const [updated] = await db.update(products)
      .set({
        isFeatured: !existing.isFeatured,
        updatedAt: new Date()
      })
      .where(eq(products.productId, productId))
      .returning();

    if (updated) {
      return {
        ...updated,
        galleryPhotos: updated.galleryPhotos as string[] || []
      };
    }

    return null;
  },

  toggleBestSeller: async (id: string): Promise<Product | null> => {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    const existing = await db.query.products.findFirst({
      where: eq(products.productId, productId)
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    const [updated] = await db.update(products)
      .set({
        isBestSeller: !existing.isBestSeller,
        updatedAt: new Date()
      })
      .where(eq(products.productId, productId))
      .returning();

    if (updated) {
      return {
        ...updated,
        galleryPhotos: updated.galleryPhotos as string[] || []
      };
    }

    return null;
  },

  updateStock: async (id: string, stock: number): Promise<Product | null> => {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    const existing = await db.query.products.findFirst({
      where: eq(products.productId, productId)
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    const threshold = existing.lowStockThreshold || 5;
    let status: "in_stock" | "low_stock" | "out_of_stock" = "out_of_stock";
    
    if (stock > 0 && stock <= threshold) {
      status = "low_stock";
    } else if (stock > 0) {
      status = "in_stock";
    }

    const [updated] = await db.update(products)
      .set({
        stock: stock,
        status: status,
        updatedAt: new Date()
      })
      .where(eq(products.productId, productId))
      .returning();

    if (updated) {
      return {
        ...updated,
        galleryPhotos: updated.galleryPhotos as string[] || []
      };
    }

    return null;
  },

  getLowStock: async (): Promise<ProductWithCategory[]> => {
    const lowStockProducts = await db.query.products.findMany({
      where: eq(products.status, "low_stock"),
      orderBy: [asc(products.stock)]
    });

    const productsWithCategory = await Promise.all(
      lowStockProducts.map(async (product) => {
        let categoryName = null;
        let categorySlug = null;
        
        if (product.categoryId) {
          const category = await db.query.categories.findFirst({
            where: eq(categories.categoryId, product.categoryId)
          });
          if (category) {
            categoryName = category.name;
            categorySlug = category.slug;
          }
        }

        return {
          ...product,
          galleryPhotos: product.galleryPhotos as string[] || [],
          categoryName,
          categorySlug
        };
      })
    );

    return productsWithCategory;
  },

  incrementViews: async (id: string): Promise<void> => {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new Error("Invalid product ID");
    }

    await db.update(products)
      .set({
        views: sql`${products.views} + 1`
      })
      .where(eq(products.productId, productId));
  },

  bulkDelete: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> => {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };

    for (const id of ids) {
      try {
        await productsService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
};