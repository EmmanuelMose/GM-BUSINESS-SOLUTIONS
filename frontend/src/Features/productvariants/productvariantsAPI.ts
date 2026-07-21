import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface ProductVariant {
  variantId: number;
  productId: number;
  name: string;
  sku: string | null;
  price: string;
  stock: number;
  attributes: any;
  featuredPhoto: string | null;
  galleryPhotos: string[];
  createdAt: string;
  updatedAt: string;
}

export type NewProductVariant = Omit<ProductVariant, 'variantId' | 'createdAt' | 'updatedAt'>;

const api = axios.create({ baseURL: ApiDomain });

export const productVariantsAPI = {
  getAll: (): Promise<{ success: boolean; data: ProductVariant[] }> =>
    api.get('/product-variants').then(res => res.data),
  getByProduct: (productId: number): Promise<{ success: boolean; data: ProductVariant[] }> =>
    api.get(`/product-variants/product/${productId}`).then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: ProductVariant }> =>
    api.get(`/product-variants/${id}`).then(res => res.data),
  getBySku: (sku: string): Promise<{ success: boolean; data: ProductVariant }> =>
    api.get(`/product-variants/sku/${sku}`).then(res => res.data),
  search: (query: string): Promise<{ success: boolean; data: ProductVariant[] }> =>
    api.get(`/product-variants/search?q=${encodeURIComponent(query)}`).then(res => res.data),
  create: (data: NewProductVariant): Promise<{ success: boolean; data: ProductVariant }> =>
    api.post('/product-variants', data).then(res => res.data),
  update: (id: number, data: Partial<NewProductVariant>): Promise<{ success: boolean; data: ProductVariant }> =>
    api.put(`/product-variants/${id}`, data).then(res => res.data),
  updateStock: (id: number, stock: number): Promise<{ success: boolean; data: ProductVariant; message: string }> =>
    api.patch(`/product-variants/${id}/stock`, { stock }).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: ProductVariant; message: string }> =>
    api.delete(`/product-variants/${id}`).then(res => res.data),
  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/product-variants/bulk-delete', { ids }).then(res => res.data),
};