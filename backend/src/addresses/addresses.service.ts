import db from "../Drizzle/db";
import { addresses } from "../Drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

interface Address {
  addressId: number;
  userId: number;
  firstName: string;
  lastName: string;
  phonePrefix: string | null;
  phoneNumber: string;
  additionalPhone: string | null;
  email: string | null;
  county: string;
  town: string;
  area: string | null;
  landmark: string | null;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  googleMapsLink: string | null;
  deliveryInstructions: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NewAddress {
  userId: number;
  firstName: string;
  lastName: string;
  phonePrefix?: string | null;
  phoneNumber: string;
  additionalPhone?: string | null;
  email?: string | null;
  county: string;
  town: string;
  area?: string | null;
  landmark?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googleMapsLink?: string | null;
  deliveryInstructions?: string | null;
  isDefault?: boolean;
}

export const addressesService = {
  getByUser: async (userId: number): Promise<Address[]> => {
    return await db.query.addresses.findMany({
      where: and(eq(addresses.userId, userId), eq(addresses.isActive, true)),
      orderBy: [desc(addresses.isDefault), desc(addresses.createdAt)]
    });
  },

  getById: async (id: string, userId: number): Promise<Address | null> => {
    const addressId = parseInt(id, 10);
    if (isNaN(addressId)) {
      throw new Error("Invalid address ID");
    }
    const result = await db.query.addresses.findFirst({
      where: and(eq(addresses.addressId, addressId), eq(addresses.userId, userId), eq(addresses.isActive, true))
    });
    return result || null;
  },

  getDefault: async (userId: number): Promise<Address | null> => {
    const result = await db.query.addresses.findFirst({
      where: and(eq(addresses.userId, userId), eq(addresses.isDefault, true), eq(addresses.isActive, true))
    });
    return result || null;
  },

  create: async (data: NewAddress): Promise<Address> => {
    if (data.isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, data.userId));
    }

    const [created] = await db.insert(addresses).values({
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      phonePrefix: data.phonePrefix || "+254",
      phoneNumber: data.phoneNumber,
      additionalPhone: data.additionalPhone || null,
      email: data.email || null,
      county: data.county,
      town: data.town,
      area: data.area || null,
      landmark: data.landmark || null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      postalCode: data.postalCode || null,
      latitude: data.latitude ? data.latitude.toString() : null,
      longitude: data.longitude ? data.longitude.toString() : null,
      googleMapsLink: data.googleMapsLink || null,
      deliveryInstructions: data.deliveryInstructions || null,
      isDefault: data.isDefault || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return created!;
  },

  update: async (id: string, userId: number, data: Partial<NewAddress>): Promise<Address | null> => {
    const addressId = parseInt(id, 10);
    if (isNaN(addressId)) {
      throw new Error("Invalid address ID");
    }

    const existing = await db.query.addresses.findFirst({
      where: and(eq(addresses.addressId, addressId), eq(addresses.userId, userId))
    });

    if (!existing) {
      throw new Error("Address not found");
    }

    if (data.isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    }

    const [updated] = await db.update(addresses).set({
      ...data,
      latitude: data.latitude !== undefined ? (data.latitude ? data.latitude.toString() : null) : undefined,
      longitude: data.longitude !== undefined ? (data.longitude ? data.longitude.toString() : null) : undefined,
      updatedAt: new Date()
    }).where(eq(addresses.addressId, addressId)).returning();

    return updated || null;
  },

  setDefault: async (id: string, userId: number): Promise<Address | null> => {
    const addressId = parseInt(id, 10);
    if (isNaN(addressId)) {
      throw new Error("Invalid address ID");
    }

    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));

    const [updated] = await db.update(addresses).set({ isDefault: true }).where(eq(addresses.addressId, addressId)).returning();

    return updated || null;
  },

  delete: async (id: string, userId: number): Promise<Address | null> => {
    const addressId = parseInt(id, 10);
    if (isNaN(addressId)) {
      throw new Error("Invalid address ID");
    }

    const [deleted] = await db.delete(addresses).where(and(eq(addresses.addressId, addressId), eq(addresses.userId, userId))).returning();

    return deleted || null;
  },

  getFormattedAddress: (address: Address): string => {
    const parts = [];
    if (address.firstName || address.lastName) {
      parts.push(`${address.firstName} ${address.lastName}`.trim());
    }
    if (address.addressLine1) parts.push(address.addressLine1);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.area) parts.push(address.area);
    if (address.town || address.county) parts.push(`${address.town} - ${address.county}`.trim());
    if (address.phoneNumber) parts.push(`${address.phonePrefix || '+254'} ${address.phoneNumber}`);
    return parts.join(" | ");
  },

  getDeliverySummary: (address: Address): any => {
    return {
      fullName: `${address.firstName} ${address.lastName}`.trim(),
      phone: `${address.phonePrefix || '+254'} ${address.phoneNumber}`,
      location: `${address.area ? address.area + ' | ' : ''}${address.town} - ${address.county}`,
      address: `${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}`,
      landmark: address.landmark || null,
      instructions: address.deliveryInstructions || null
    };
  }
};