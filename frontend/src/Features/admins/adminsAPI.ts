import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Admin {
  adminId: number;
  userId: number | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type NewAdmin = {
  userId: number;
  email: string;
};

const api = axios.create({ baseURL: ApiDomain });

export const adminsAPI = {
  getAll: (): Promise<{ success: boolean; data: Admin[] }> =>
    api.get('/admins').then(res => res.data),

  getById: (id: number): Promise<{ success: boolean; data: Admin }> =>
    api.get(`/admins/${id}`).then(res => res.data),

  create: (data: NewAdmin): Promise<{ success: boolean; data: Admin; message?: string }> =>
    api.post('/admins', data).then(res => res.data),

  delete: (id: number): Promise<{ success: boolean; data: Admin; message: string }> =>
    api.delete(`/admins/${id}`).then(res => res.data),

  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/admins/bulk-delete', { ids }).then(res => res.data),
};