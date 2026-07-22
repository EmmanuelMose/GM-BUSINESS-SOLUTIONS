import axios from "axios";
import { ApiDomain } from "../../utils/APIDomain";

export interface PickupStation {
  stationId: number;
  name: string;
  county: string;
  town: string;
  address: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupLocation {
  locationId: number;
  stationId: number;
  name: string;
  address: string;
  landmark: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const api = axios.create({ baseURL: ApiDomain });

export const pickupStationsAPI = {
  getAllStations: () => api.get("/pickup-stations").then((res) => res.data),
  getActive: () => api.get("/pickup-stations/active").then((res) => res.data),
  getStationById: (id: number) => api.get(`/pickup-stations/${id}`).then((res) => res.data),
  createStation: (data: any) => api.post("/pickup-stations", data).then((res) => res.data),
  updateStation: (id: number, data: any) => api.put(`/pickup-stations/${id}`, data).then((res) => res.data),
  deleteStation: (id: number) => api.delete(`/pickup-stations/${id}`).then((res) => res.data),
  toggleStationStatus: (id: number) => api.patch(`/pickup-stations/${id}/toggle-status`).then((res) => res.data),
  getLocations: (stationId: number) => api.get(`/pickup-stations/${stationId}/locations`).then((res) => res.data),
  getLocationById: (id: number) => api.get(`/pickup-stations/locations/${id}`).then((res) => res.data),
  createLocation: (data: any) => api.post("/pickup-stations/locations", data).then((res) => res.data),
  updateLocation: (id: number, data: any) => api.put(`/pickup-stations/locations/${id}`, data).then((res) => res.data),
  deleteLocation: (id: number) => api.delete(`/pickup-stations/locations/${id}`).then((res) => res.data),
  toggleLocationStatus: (id: number) => api.patch(`/pickup-stations/locations/${id}/toggle-status`).then((res) => res.data),
};