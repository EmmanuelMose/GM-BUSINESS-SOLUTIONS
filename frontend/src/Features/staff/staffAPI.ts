import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Staff {
  staffId: number;
  userId: number | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type NewStaff = {
  userId: number;
  email: string;
};

const api = axios.create({ baseURL: ApiDomain });

export const staffAPI = {
  getAll: (): Promise<{ success: boolean; data: Staff[] }> =>
    api.get('/staff').then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Staff }> =>
    api.get(`/staff/${id}`).then(res => res.data),
  create: (data: NewStaff): Promise<{ success: boolean; data: Staff }> =>
    api.post('/staff', data).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Staff; message: string }> =>
    api.delete(`/staff/${id}`).then(res => res.data),
  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/staff/bulk-delete', { ids }).then(res => res.data),
};