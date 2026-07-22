import { Request, Response } from "express";
import { pickupStationsService } from "./pickup-stations.service";

export const getAllStationsController = async (_req: Request, res: Response) => {
  try {
    const data = await pickupStationsService.getAllStations();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getActiveStationsController = async (_req: Request, res: Response) => {
  try {
    const data = await pickupStationsService.getActiveStations();
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getStationByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid station ID" });
    const data = await pickupStationsService.getStationById(id);
    if (!data) return res.status(404).json({ success: false, message: "Station not found" });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createStationController = async (req: Request, res: Response) => {
  try {
    const data = await pickupStationsService.createStation(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateStationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid station ID" });
    const data = await pickupStationsService.updateStation(id, req.body);
    if (!data) return res.status(404).json({ success: false, message: "Station not found" });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteStationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid station ID" });
    const data = await pickupStationsService.deleteStation(id);
    if (!data) return res.status(404).json({ success: false, message: "Station not found" });
    res.json({ success: true, message: "Station deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const toggleStationStatusController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid station ID" });
    const data = await pickupStationsService.toggleStationStatus(id);
    if (!data) return res.status(404).json({ success: false, message: "Station not found" });
    res.json({ success: true, message: `Station ${data.isActive ? 'activated' : 'deactivated'}`, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getLocationsByStationController = async (req: Request, res: Response) => {
  try {
    const stationId = parseInt(req.params.stationId as string, 10);
    if (isNaN(stationId)) return res.status(400).json({ success: false, message: "Invalid station ID" });
    const data = await pickupStationsService.getLocationsByStation(stationId);
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const getLocationByIdController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid location ID" });
    const data = await pickupStationsService.getLocationById(id);
    if (!data) return res.status(404).json({ success: false, message: "Location not found" });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const createLocationController = async (req: Request, res: Response) => {
  try {
    const data = await pickupStationsService.createLocation(req.body);
    res.status(201).json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const updateLocationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid location ID" });
    const data = await pickupStationsService.updateLocation(id, req.body);
    if (!data) return res.status(404).json({ success: false, message: "Location not found" });
    res.json({ success: true, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const deleteLocationController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid location ID" });
    const data = await pickupStationsService.deleteLocation(id);
    if (!data) return res.status(404).json({ success: false, message: "Location not found" });
    res.json({ success: true, message: "Location deleted successfully", data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};

export const toggleLocationStatusController = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid location ID" });
    const data = await pickupStationsService.toggleLocationStatus(id);
    if (!data) return res.status(404).json({ success: false, message: "Location not found" });
    res.json({ success: true, message: `Location ${data.isActive ? 'activated' : 'deactivated'}`, data });
  } catch (e: any) {
    res.status(400).json({ success: false, message: e.message });
  }
};