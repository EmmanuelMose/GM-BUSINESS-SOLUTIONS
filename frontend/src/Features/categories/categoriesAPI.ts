import axios from "axios";
import { ApiDomain } from "../../utils/APIDomain";

export interface Category {
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  photo: string | null;
  parentId: number | null;
  displayOrder: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
  subcategories?: Category[];
}

const api = axios.create({ baseURL: ApiDomain });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const categoriesAPI = {
  getAll: (): Promise<{ success: boolean; data: Category[] }> =>
    api.get('/categories').then(res => res.data),
  getActive: (): Promise<{ success: boolean; data: Category[] }> =>
    api.get('/categories/active').then(res => res.data),
  getRoot: (): Promise<{ success: boolean; data: Category[] }> =>
    api.get('/categories/root').then(res => res.data),
  getSubcategories: (parentId: number): Promise<{ success: boolean; data: Category[] }> =>
    api.get(`/categories/subcategories/${parentId}`).then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Category }> =>
    api.get(`/categories/${id}`).then(res => res.data),
  getBySlug: (slug: string): Promise<{ success: boolean; data: Category }> =>
    api.get(`/categories/slug/${slug}`).then(res => res.data),
  search: (query: string): Promise<{ success: boolean; data: Category[] }> =>
    api.get(`/categories/search?q=${encodeURIComponent(query)}`).then(res => res.data),
  create: (data: FormData): Promise<{ success: boolean; data: Category }> =>
    api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  update: (id: number, data: FormData): Promise<{ success: boolean; data: Category }> =>
    api.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Category }> =>
    api.delete(`/categories/${id}`).then(res => res.data),
  toggleStatus: (id: number): Promise<{ success: boolean; data: Category; message: string }> =>
    api.patch(`/categories/${id}/toggle-status`).then(res => res.data),
  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/categories/bulk-delete', { ids }).then(res => res.data),
};