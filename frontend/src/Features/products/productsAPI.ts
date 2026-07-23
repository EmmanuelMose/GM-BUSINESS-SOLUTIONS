import axios from "axios";
import { ApiDomain } from "../../utils/APIDomain";

export interface Product {
  productId: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: string;
  comparePrice: string | null;
  costPrice: string | null;
  stock: number;
  lowStockThreshold: number | null;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  categoryId: number | null;
  featuredPhoto: string | null;
  sku: string | null;
  brand: string | null;
  brandPhoto: string | null;
  weight: string | null;
  dimensions: any;
  isFeatured: boolean;
  isBestSeller: boolean;
  views: number;
  rating: string | null;
  reviewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  galleryPhotos: string[];
  createdAt: string;
  updatedAt: string;
  categoryName?: string | null;
  categorySlug?: string | null;
  variants?: any[];
}

const api = axios.create({ baseURL: ApiDomain });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productsAPI = {
  getAll: (): Promise<{ success: boolean; data: Product[] }> =>
    api.get('/products').then(res => res.data),
  getActive: (): Promise<{ success: boolean; data: Product[] }> =>
    api.get('/products/active').then(res => res.data),
  getFeatured: (): Promise<{ success: boolean; data: Product[] }> =>
    api.get('/products/featured').then(res => res.data),
  getBestSellers: (): Promise<{ success: boolean; data: Product[] }> =>
    api.get('/products/bestsellers').then(res => res.data),
  getByCategory: (categoryId: number): Promise<{ success: boolean; data: Product[] }> =>
    api.get(`/products/category/${categoryId}`).then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Product }> =>
    api.get(`/products/${id}`).then(res => res.data),
  getBySlug: (slug: string): Promise<{ success: boolean; data: Product }> =>
    api.get(`/products/slug/${slug}`).then(res => res.data),
  search: (query: string): Promise<{ success: boolean; data: Product[] }> =>
    api.get(`/products/search?q=${encodeURIComponent(query)}`).then(res => res.data),
  filter: (filters: Record<string, any>): Promise<{ success: boolean; data: Product[] }> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return api.get(`/products/filter?${params}`).then(res => res.data);
  },
  create: (data: FormData): Promise<{ success: boolean; data: Product }> =>
    api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  update: (id: number, data: FormData): Promise<{ success: boolean; data: Product }> =>
    api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Product }> =>
    api.delete(`/products/${id}`).then(res => res.data),
  toggleFeatured: (id: number): Promise<{ success: boolean; data: Product; message: string }> =>
    api.patch(`/products/${id}/toggle-featured`).then(res => res.data),
  toggleBestSeller: (id: number): Promise<{ success: boolean; data: Product; message: string }> =>
    api.patch(`/products/${id}/toggle-bestseller`).then(res => res.data),
  updateStock: (id: number, stock: number): Promise<{ success: boolean; data: Product; message: string }> =>
    api.patch(`/products/${id}/update-stock`, { stock }).then(res => res.data),
  getLowStock: (): Promise<{ success: boolean; data: Product[] }> =>
    api.get('/products/low-stock').then(res => res.data),
  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/products/bulk-delete', { ids }).then(res => res.data),
};