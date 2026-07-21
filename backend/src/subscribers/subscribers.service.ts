import db from "../Drizzle/db";
import { subscribers } from "../Drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";

interface Subscriber {
  subscriberId: number;
  email: string;
  name: string | null;
  isActive: boolean;
  unsubscribedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NewSubscriber {
  email: string;
  name?: string | null;
}

export const subscribersService = {
  getAll: async (): Promise<Subscriber[]> => {
    return await db.query.subscribers.findMany({
      orderBy: [desc(subscribers.createdAt)]
    });
  },

  getActive: async (): Promise<Subscriber[]> => {
    return await db.query.subscribers.findMany({
      where: eq(subscribers.isActive, true),
      orderBy: [desc(subscribers.createdAt)]
    });
  },

  getById: async (id: string): Promise<Subscriber | null> => {
    const subscriberId = parseInt(id, 10);
    if (isNaN(subscriberId)) {
      throw new Error("Invalid subscriber ID");
    }
    const result = await db.query.subscribers.findFirst({
      where: eq(subscribers.subscriberId, subscriberId)
    });
    return result || null;
  },

  getByEmail: async (email: string): Promise<Subscriber | null> => {
    const result = await db.query.subscribers.findFirst({
      where: eq(subscribers.email, email)
    });
    return result || null;
  },

  subscribe: async (data: NewSubscriber): Promise<Subscriber> => {
    const existing = await db.query.subscribers.findFirst({
      where: eq(subscribers.email, data.email)
    });

    if (existing) {
      if (existing.isActive) {
        throw new Error("Email already subscribed");
      }
      const [updated] = await db.update(subscribers)
        .set({
          isActive: true,
          unsubscribedAt: null,
          updatedAt: new Date()
        })
        .where(eq(subscribers.subscriberId, existing.subscriberId))
        .returning();
      return updated!;
    }

    const [created] = await db.insert(subscribers)
      .values({
        email: data.email,
        name: data.name || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return created!;
  },

  unsubscribe: async (email: string): Promise<Subscriber | null> => {
    const existing = await db.query.subscribers.findFirst({
      where: eq(subscribers.email, email)
    });

    if (!existing) {
      throw new Error("Subscriber not found");
    }

    const [updated] = await db.update(subscribers)
      .set({
        isActive: false,
        unsubscribedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(subscribers.subscriberId, existing.subscriberId))
      .returning();

    return updated || null;
  },

  delete: async (id: string): Promise<Subscriber | null> => {
    const subscriberId = parseInt(id, 10);
    if (isNaN(subscriberId)) {
      throw new Error("Invalid subscriber ID");
    }

    const [deleted] = await db.delete(subscribers)
      .where(eq(subscribers.subscriberId, subscriberId))
      .returning();

    return deleted || null;
  },

  bulkDelete: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> => {
    const results = {
      success: [] as number[],
      failed: [] as { id: number; reason: string }[]
    };

    for (const id of ids) {
      try {
        await subscribersService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
};