// src/staff/staff.service.ts
import db from "../Drizzle/db";
import { staff, users } from "../Drizzle/schema";
import { eq, desc } from "drizzle-orm";

interface Staff {
  staffId: number;
  userId: number | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NewStaff {
  userId: number;
  email: string;
}

export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    return await db.query.staff.findMany({
      orderBy: [desc(staff.createdAt)]
    });
  },

  getById: async (id: string): Promise<Staff | null> => {
    const staffId = parseInt(id, 10);
    if (isNaN(staffId)) throw new Error("Invalid staff ID");
    const result = await db.query.staff.findFirst({
      where: eq(staff.staffId, staffId)
    });
    return result || null;
  },

  getByUser: async (userId: number): Promise<Staff | null> => {
    const result = await db.query.staff.findFirst({
      where: eq(staff.userId, userId)
    });
    return result || null;
  },

  getByEmail: async (email: string): Promise<Staff | null> => {
    const result = await db.query.staff.findFirst({
      where: eq(staff.email, email)
    });
    return result || null;
  },

  create: async (data: NewStaff): Promise<Staff> => {
    const existing = await db.query.staff.findFirst({
      where: eq(staff.userId, data.userId)
    });
    if (existing) throw new Error("User is already a staff member");

    const user = await db.query.users.findFirst({
      where: eq(users.userId, data.userId)
    });
    if (!user) throw new Error("User not found");
    if (user.email !== data.email) throw new Error("Email does not match user's email");

    const [created] = await db.insert(staff)
      .values({
        userId: data.userId,
        email: data.email,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    await db.update(users)
      .set({ role: "staff", updatedAt: new Date() })
      .where(eq(users.userId, data.userId));

    return created;
  },

  delete: async (id: string): Promise<Staff | null> => {
    const staffId = parseInt(id, 10);
    if (isNaN(staffId)) throw new Error("Invalid staff ID");
    const existing = await db.query.staff.findFirst({
      where: eq(staff.staffId, staffId)
    });
    if (!existing) throw new Error("Staff not found");

    if (existing.userId !== null) {
      await db.update(users)
        .set({ role: "customer", updatedAt: new Date() })
        .where(eq(users.userId, existing.userId));
    }

    const [updated] = await db.update(staff)
      .set({ userId: null, updatedAt: new Date() })
      .where(eq(staff.staffId, staffId))
      .returning();

    return updated || null;
  },

  bulkDelete: async (ids: number[]): Promise<{ success: number[]; failed: { id: number; reason: string }[] }> => {
    const results = { success: [] as number[], failed: [] as { id: number; reason: string }[] };
    for (const id of ids) {
      try {
        await staffService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }
    return results;
  }
};