import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Subscriber {
  subscriberId: number;
  email: string;
  name: string | null;
  isActive: boolean;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const api = axios.create({ baseURL: ApiDomain });

export const subscribersAPI = {
  subscribe: (email: string, name?: string): Promise<{ success: boolean; data: Subscriber; message: string }> =>
    api.post('/subscribers/subscribe', { email, name }).then(res => res.data),
  unsubscribe: (email: string): Promise<{ success: boolean; data: Subscriber; message: string }> =>
    api.post('/subscribers/unsubscribe', { email }).then(res => res.data),
  getAll: (): Promise<{ success: boolean; data: Subscriber[] }> =>
    api.get('/subscribers').then(res => res.data),
  getActive: (): Promise<{ success: boolean; data: Subscriber[] }> =>
    api.get('/subscribers/active').then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Subscriber }> =>
    api.get(`/subscribers/${id}`).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Subscriber; message: string }> =>
    api.delete(`/subscribers/${id}`).then(res => res.data),
  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/subscribers/bulk-delete', { ids }).then(res => res.data),
};