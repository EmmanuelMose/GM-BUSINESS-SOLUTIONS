import db from "../Drizzle/db";
import { pickupStations, pickupLocations } from "../Drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const pickupStationsService = {
  getAllStations: async () => {
    return await db.query.pickupStations.findMany({
      orderBy: [desc(pickupStations.createdAt)]
    });
  },

  getActiveStations: async () => {
    return await db.query.pickupStations.findMany({
      where: eq(pickupStations.isActive, true)
    });
  },

  getStationById: async (id: number) => {
    return await db.query.pickupStations.findFirst({
      where: eq(pickupStations.stationId, id)
    });
  },

  createStation: async (data: any) => {
    const [created] = await db.insert(pickupStations).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return created;
  },

  updateStation: async (id: number, data: any) => {
    const [updated] = await db.update(pickupStations).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(pickupStations.stationId, id)).returning();
    return updated;
  },

  deleteStation: async (id: number) => {
    const [deleted] = await db.delete(pickupStations).where(eq(pickupStations.stationId, id)).returning();
    return deleted;
  },

  toggleStationStatus: async (id: number) => {
    const station = await db.query.pickupStations.findFirst({
      where: eq(pickupStations.stationId, id)
    });
    if (!station) throw new Error("Station not found");
    const [updated] = await db.update(pickupStations).set({
      isActive: !station.isActive,
      updatedAt: new Date()
    }).where(eq(pickupStations.stationId, id)).returning();
    return updated;
  },

  getLocationsByStation: async (stationId: number) => {
    return await db.query.pickupLocations.findMany({
      where: eq(pickupLocations.stationId, stationId)
    });
  },

  getLocationById: async (id: number) => {
    return await db.query.pickupLocations.findFirst({
      where: eq(pickupLocations.locationId, id)
    });
  },

  createLocation: async (data: any) => {
    const [created] = await db.insert(pickupLocations).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return created;
  },

  updateLocation: async (id: number, data: any) => {
    const [updated] = await db.update(pickupLocations).set({
      ...data,
      updatedAt: new Date()
    }).where(eq(pickupLocations.locationId, id)).returning();
    return updated;
  },

  deleteLocation: async (id: number) => {
    const [deleted] = await db.delete(pickupLocations).where(eq(pickupLocations.locationId, id)).returning();
    return deleted;
  },

  toggleLocationStatus: async (id: number) => {
    const loc = await db.query.pickupLocations.findFirst({
      where: eq(pickupLocations.locationId, id)
    });
    if (!loc) throw new Error("Location not found");
    const [updated] = await db.update(pickupLocations).set({
      isActive: !loc.isActive,
      updatedAt: new Date()
    }).where(eq(pickupLocations.locationId, id)).returning();
    return updated;
  }
};