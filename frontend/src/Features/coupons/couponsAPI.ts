import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Coupon {
  couponId: number;
  code: string;
  description: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscount: string | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  appliesTo: any;
  createdAt: string;
  updatedAt: string;
}

export type NewCoupon = Omit<Coupon, 'couponId' | 'usedCount' | 'createdAt' | 'updatedAt'>;

export interface ValidateCouponResponse {
  success: boolean;
  data: {
    coupon: Coupon;
    discount: number;
    finalTotal: number;
  };
}

const api = axios.create({ baseURL: ApiDomain });

export const couponsAPI = {
  getAll: (): Promise<{ success: boolean; data: Coupon[] }> =>
    api.get('/coupons').then(res => res.data),
  getActive: (): Promise<{ success: boolean; data: Coupon[] }> =>
    api.get('/coupons/active').then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Coupon }> =>
    api.get(`/coupons/${id}`).then(res => res.data),
  validate: (code: string, orderTotal: number): Promise<ValidateCouponResponse> =>
    api.post('/coupons/validate', { code, orderTotal }).then(res => res.data),
  create: (data: NewCoupon): Promise<{ success: boolean; data: Coupon }> =>
    api.post('/coupons', data).then(res => res.data),
  update: (id: number, data: Partial<NewCoupon>): Promise<{ success: boolean; data: Coupon }> =>
    api.put(`/coupons/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Coupon; message: string }> =>
    api.delete(`/coupons/${id}`).then(res => res.data),
  toggleStatus: (id: number): Promise<{ success: boolean; data: Coupon; message: string }> =>
    api.patch(`/coupons/${id}/toggle-status`).then(res => res.data),
  bulkDelete: (ids: number[]): Promise<{ success: boolean; message: string; data: { success: number[]; failed: { id: number; reason: string }[] } }> =>
    api.post('/coupons/bulk-delete', { ids }).then(res => res.data),
};