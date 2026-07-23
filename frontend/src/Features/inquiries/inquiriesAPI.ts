import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Inquiry {
  inquiryId: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'resolved';
  productId: number | null;
  userId: number | null;
  adminResponse: string | null;
  respondedBy: number | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewInquiry = Omit<Inquiry, 'inquiryId' | 'status' | 'userId' | 'adminResponse' | 'respondedBy' | 'respondedAt' | 'createdAt' | 'updatedAt'> & {
  userId?: number;
};

const api = axios.create({ baseURL: ApiDomain });

// INTERCEPTOR – attaches the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const inquiriesAPI = {
  create: (data: NewInquiry): Promise<{ success: boolean; data: Inquiry; message: string }> =>
    api.post('/inquiries', data).then(res => res.data),

  getMyInquiries: (): Promise<{ success: boolean; data: Inquiry[] }> =>
    api.get('/inquiries').then(res => res.data),

  getAll: (): Promise<{ success: boolean; data: Inquiry[] }> =>
    api.get('/inquiries').then(res => res.data),

  getUnread: (): Promise<{ success: boolean; data: Inquiry[] }> =>
    api.get('/inquiries/unread').then(res => res.data),

  getById: (id: number): Promise<{ success: boolean; data: Inquiry }> =>
    api.get(`/inquiries/${id}`).then(res => res.data),

  markRead: (id: number): Promise<{ success: boolean; data: Inquiry; message: string }> =>
    api.patch(`/inquiries/${id}/read`).then(res => res.data),

  reply: (id: number, response: string): Promise<{ success: boolean; data: Inquiry; message: string }> =>
    api.patch(`/inquiries/${id}/reply`, { response }).then(res => res.data),

  markResolved: (id: number): Promise<{ success: boolean; data: Inquiry; message: string }> =>
    api.patch(`/inquiries/${id}/resolve`).then(res => res.data),

  delete: (id: number): Promise<{ success: boolean; data: Inquiry; message: string }> =>
    api.delete(`/inquiries/${id}`).then(res => res.data),

  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/inquiries/bulk-delete', { ids }).then(res => res.data),
};