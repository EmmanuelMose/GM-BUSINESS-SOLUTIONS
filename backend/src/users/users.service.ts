import db from "../Drizzle/db";
import { users } from "../Drizzle/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: "customer" | "admin" | "staff";
  isActive: boolean;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpiresAt: Date | null;
  avatarPhoto: string | null;
  lastLogin: Date | null;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NewUser {
  fullName: string;
  email: string;
  phone?: string | null;
  password: string;
  role?: "customer" | "admin" | "staff";
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    return await db.query.users.findMany({
      orderBy: [desc(users.createdAt)]
    });
  },

  getById: async (id: string): Promise<User | null> => {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID");
    }
    const result = await db.query.users.findFirst({
      where: eq(users.userId, userId)
    });
    return result || null;
  },

  getByEmail: async (email: string): Promise<User | null> => {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    return result || null;
  },

  search: async (searchTerm: string): Promise<User[]> => {
    return await db.query.users.findMany({
      where: or(
        like(users.fullName, `%${searchTerm}%`),
        like(users.email, `%${searchTerm}%`),
        like(users.phone, `%${searchTerm}%`)
      ),
      orderBy: [desc(users.createdAt)]
    });
  },

  create: async (data: NewUser): Promise<User> => {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email)
    });

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [created] = await db.insert(users)
      .values({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        passwordHash: hashedPassword,
        role: data.role || "customer",
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return created!;
  },

  update: async (id: string, data: Partial<NewUser>): Promise<User | null> => {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID");
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.userId, userId)
    });

    if (!existing) {
      throw new Error("User not found");
    }

    if (data.email) {
      const conflict = await db.query.users.findFirst({
        where: and(
          eq(users.email, data.email),
          eq(users.userId, userId)
        )
      });
      if (conflict && conflict.userId !== userId) {
        throw new Error("Email already in use");
      }
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    const [updated] = await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.userId, userId))
      .returning();

    return updated || null;
  },

  delete: async (id: string): Promise<User | null> => {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID");
    }

    const [deleted] = await db.delete(users)
      .where(eq(users.userId, userId))
      .returning();

    return deleted || null;
  },

  toggleStatus: async (id: string): Promise<User | null> => {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error("Invalid user ID");
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.userId, userId)
    });

    if (!existing) {
      throw new Error("User not found");
    }

    const [updated] = await db.update(users)
      .set({
        isActive: !existing.isActive,
        updatedAt: new Date()
      })
      .where(eq(users.userId, userId))
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
        await usersService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
};