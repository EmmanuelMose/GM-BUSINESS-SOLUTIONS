import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Review {
  reviewId: number;
  userId: number;
  productId: number;
  orderId: number | null;
  rating: number;
  title: string | null;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  photos: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: { fullName: string };
}

export type NewReview = Omit<Review, 'reviewId' | 'status' | 'isVerified' | 'helpfulCount' | 'createdAt' | 'updatedAt' | 'user'>;

const api = axios.create({ baseURL: ApiDomain });

export const reviewsAPI = {
  getByProduct: (productId: number): Promise<{ success: boolean; data: Review[] }> =>
    api.get(`/reviews/product/${productId}`).then(res => res.data),
  getMyReviews: (): Promise<{ success: boolean; data: Review[] }> =>
    api.get('/reviews/user').then(res => res.data),
  create: (data: NewReview): Promise<{ success: boolean; data: Review; message: string }> =>
    api.post('/reviews', data).then(res => res.data),
  markHelpful: (reviewId: number): Promise<{ success: boolean; data: Review; message: string }> =>
    api.patch(`/reviews/${reviewId}/helpful`).then(res => res.data),
  getAll: (): Promise<{ success: boolean; data: Review[] }> =>
    api.get('/reviews').then(res => res.data),
  getPending: (): Promise<{ success: boolean; data: Review[] }> =>
    api.get('/reviews/pending').then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Review }> =>
    api.get(`/reviews/${id}`).then(res => res.data),
  approve: (id: number): Promise<{ success: boolean; data: Review; message: string }> =>
    api.patch(`/reviews/${id}/approve`).then(res => res.data),
  reject: (id: number): Promise<{ success: boolean; data: Review; message: string }> =>
    api.patch(`/reviews/${id}/reject`).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Review; message: string }> =>
    api.delete(`/reviews/${id}`).then(res => res.data),
  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/reviews/bulk-delete', { ids }).then(res => res.data),
};