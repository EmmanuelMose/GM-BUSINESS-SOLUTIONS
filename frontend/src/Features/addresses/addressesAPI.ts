import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Address {
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
  pickupStation: string | null;
  pickupStationAddress: string | null;
  pickupStationPhone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  googleMapsLink: string | null;
  deliveryInstructions: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  formatted?: string;
}

export type NewAddress = Omit<Address, 'addressId' | 'userId' | 'createdAt' | 'updatedAt' | 'isActive'> & {
  userId?: number;
};

const api = axios.create({ baseURL: ApiDomain });

export const addressesAPI = {
  getMyAddresses: (): Promise<{ success: boolean; data: Address[] }> =>
    api.get('/addresses').then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Address }> =>
    api.get(`/addresses/${id}`).then(res => res.data),
  getDefault: (): Promise<{ success: boolean; data: Address | null }> =>
    api.get('/addresses/default').then(res => res.data),
  create: (data: NewAddress): Promise<{ success: boolean; data: Address; message: string }> =>
    api.post('/addresses', data).then(res => res.data),
  update: (id: number, data: Partial<NewAddress>): Promise<{ success: boolean; data: Address; message: string }> =>
    api.put(`/addresses/${id}`, data).then(res => res.data),
  setDefault: (id: number): Promise<{ success: boolean; data: Address; message: string }> =>
    api.patch(`/addresses/${id}/default`).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Address; message: string }> =>
    api.delete(`/addresses/${id}`).then(res => res.data),
  getSummary: (id: number): Promise<{ success: boolean; data: any }> =>
    api.get(`/addresses/${id}/summary`).then(res => res.data),
};