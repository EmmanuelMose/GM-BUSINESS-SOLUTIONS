import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: 'customer' | 'admin' | 'staff';
  isActive: boolean;
  isVerified: boolean;
  avatarPhoto: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewUser = {
  fullName: string;
  email: string;
  phone?: string | null;
  password: string;
  role?: User['role'];
};

const api = axios.create({ baseURL: ApiDomain });

export const usersAPI = {
  getMe: (): Promise<{ success: boolean; data: User }> =>
    api.get('/users/me').then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: User }> =>
    api.get(`/users/${id}`).then(res => res.data),
  update: (id: number, data: Partial<NewUser>): Promise<{ success: boolean; data: User }> =>
    api.put(`/users/${id}`, data).then(res => res.data),
  getAll: (): Promise<{ success: boolean; data: User[] }> =>
    api.get('/users').then(res => res.data),
  search: (query: string): Promise<{ success: boolean; data: User[] }> =>
    api.get(`/users/search?q=${encodeURIComponent(query)}`).then(res => res.data),
  create: (data: NewUser): Promise<{ success: boolean; data: User }> =>
    api.post('/users', data).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: User; message: string }> =>
    api.delete(`/users/${id}`).then(res => res.data),
  toggleStatus: (id: number): Promise<{ success: boolean; data: User; message: string }> =>
    api.patch(`/users/${id}/toggle-status`).then(res => res.data),
  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/users/bulk-delete', { ids }).then(res => res.data),
};