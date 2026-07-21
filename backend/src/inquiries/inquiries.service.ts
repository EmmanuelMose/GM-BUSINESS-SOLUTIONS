import db from "../Drizzle/db";
import { inquiries, users } from "../Drizzle/schema";
import { eq, desc, asc, and } from "drizzle-orm";

interface Inquiry {
  inquiryId: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "replied" | "resolved";
  productId: number | null;
  userId: number | null;
  adminResponse: string | null;
  respondedBy: number | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface NewInquiry {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  productId?: number | null;
  userId?: number | null;
}

export const inquiriesService = {
  getAll: async (): Promise<Inquiry[]> => {
    return await db.query.inquiries.findMany({
      orderBy: [desc(inquiries.createdAt)]
    });
  },

  getUnread: async (): Promise<Inquiry[]> => {
    return await db.query.inquiries.findMany({
      where: eq(inquiries.status, "unread"),
      orderBy: [desc(inquiries.createdAt)]
    });
  },

  getById: async (id: string): Promise<Inquiry | null> => {
    const inquiryId = parseInt(id, 10);
    if (isNaN(inquiryId)) {
      throw new Error("Invalid inquiry ID");
    }
    const result = await db.query.inquiries.findFirst({
      where: eq(inquiries.inquiryId, inquiryId)
    });
    return result || null;
  },

  getByUser: async (userId: number): Promise<Inquiry[]> => {
    return await db.query.inquiries.findMany({
      where: eq(inquiries.userId, userId),
      orderBy: [desc(inquiries.createdAt)]
    });
  },

  create: async (data: NewInquiry): Promise<Inquiry> => {
    const [created] = await db.insert(inquiries)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
        productId: data.productId || null,
        userId: data.userId || null,
        status: "unread",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return created!;
  },

  markRead: async (id: string): Promise<Inquiry | null> => {
    const inquiryId = parseInt(id, 10);
    if (isNaN(inquiryId)) {
      throw new Error("Invalid inquiry ID");
    }

    const [updated] = await db.update(inquiries)
      .set({
        status: "read",
        updatedAt: new Date()
      })
      .where(eq(inquiries.inquiryId, inquiryId))
      .returning();

    return updated || null;
  },

  reply: async (id: string, response: string, respondedBy: number): Promise<Inquiry | null> => {
    const inquiryId = parseInt(id, 10);
    if (isNaN(inquiryId)) {
      throw new Error("Invalid inquiry ID");
    }

    const [updated] = await db.update(inquiries)
      .set({
        adminResponse: response,
        respondedBy: respondedBy,
        respondedAt: new Date(),
        status: "replied",
        updatedAt: new Date()
      })
      .where(eq(inquiries.inquiryId, inquiryId))
      .returning();

    return updated || null;
  },

  markResolved: async (id: string): Promise<Inquiry | null> => {
    const inquiryId = parseInt(id, 10);
    if (isNaN(inquiryId)) {
      throw new Error("Invalid inquiry ID");
    }

    const [updated] = await db.update(inquiries)
      .set({
        status: "resolved",
        updatedAt: new Date()
      })
      .where(eq(inquiries.inquiryId, inquiryId))
      .returning();

    return updated || null;
  },

  delete: async (id: string): Promise<Inquiry | null> => {
    const inquiryId = parseInt(id, 10);
    if (isNaN(inquiryId)) {
      throw new Error("Invalid inquiry ID");
    }

    const [deleted] = await db.delete(inquiries)
      .where(eq(inquiries.inquiryId, inquiryId))
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
        await inquiriesService.delete(id.toString());
        results.success.push(id);
      } catch (error: any) {
        results.failed.push({ id, reason: error.message });
      }
    }

    return results;
  }
};