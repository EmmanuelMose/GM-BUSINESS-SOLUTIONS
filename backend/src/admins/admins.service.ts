// src/admins/admins.service.ts
import db from "../Drizzle/db";
import { admins, users } from "../Drizzle/schema";
import { eq, desc } from "drizzle-orm";

interface Admin {
  adminId: number;
  userId: number | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NewAdmin {
  userId: number;
  email: string;
}

export const adminsService = {
  getAll: async (): Promise<Admin[]> => {
    return await db.query.admins.findMany({
      orderBy: [desc(admins.createdAt)]
    });
  },

  getById: async (id: string): Promise<Admin | null> => {
    const adminId = parseInt(id, 10);
    if (isNaN(adminId)) throw new Error("Invalid admin ID");
    const result = await db.query.admins.findFirst({
      where: eq(admins.adminId, adminId)
    });
    return result || null;
  },

  getByUser: async (userId: number): Promise<Admin | null> => {
    const result = await db.query.admins.findFirst({
      where: eq(admins.userId, userId)
    });
    return result || null;
  },

  getByEmail: async (email: string): Promise<Admin | null> => {
    const result = await db.query.admins.findFirst({
      where: eq(admins.email, email)
    });
    return result || null;
  },

  create: async (data: NewAdmin): Promise<Admin> => {
    const existing = await db.query.admins.findFirst({
      where: eq(admins.userId, data.userId)
    });
    if (existing) throw new Error("User is already an admin");

    const user = await db.query.users.findFirst({
      where: eq(users.userId, data.userId)
    });
    if (!user) throw new Error("User not found");
    if (user.email !== data.email) throw new Error("Email does not match user's email");

    const [created] = await db.insert(admins)
      .values({
        userId: data.userId,
        email: data.email,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    await db.update(users)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(users.userId, data.userId));

    return created;
  },

  delete: async (id: string): Promise<Admin | null> => {
    const adminId = parseInt(id, 10);
    if (isNaN(adminId)) throw new Error("Invalid admin ID");
    const existing = await db.query.admins.findFirst({
      where: eq(admins.adminId, adminId)
    });
    if (!existing) throw new Error("Admin not found");

    if (existing.userId !== null) {
      await db.update(users)
        .set({ role: "customer", updatedAt: new Date() })
        .where(eq(users.userId, existing.userId));
    }

    const [updated] = await db.update(admins)
      .set({ userId: null, updatedAt: new Date() })
      .where(eq(admins.adminId, adminId))
      .returning();

    return updated || null;
  },

  bulkDelete: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> => {
    const results = { success: [] as number[], failed: [] as { id: number; reason: string }[] };
    for (const id of ids) {
      try {
        await adminsService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }
    return results;
  }
};