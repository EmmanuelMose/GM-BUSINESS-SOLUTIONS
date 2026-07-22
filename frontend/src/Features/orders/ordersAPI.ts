import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number | null;
  variantId: number | null;
  productName: string;
  productSku: string | null;
  price: string;
  quantity: number;
  total: string;
  attributes: any;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  orderId: number;
  orderRef: string;
  userId: number | null;
  guestEmail: string | null;
  guestPhone: string | null;
  orderDate: string;
  total: string;
  subtotal: string;
  tax: string;
  shippingCost: string;
  discount: string;
  couponCode: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: any;
  billingAddress: any;
  deliveryNotes: string | null;
  deliveryDate: string | null;
  adminNotes: string | null;
  processedBy: number | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export type NewOrder = {
  items: {
    productId: number;
    variantId?: number;
    productName?: string;
    productSku?: string;
    price: number;
    quantity: number;
    attributes?: any;
  }[];
  total: number;
  subtotal: number;
  tax?: number;
  shippingCost?: number;
  discount?: number;
  couponCode?: string | null;
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  shippingAddress: any;
  billingAddress: any;
  deliveryNotes?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  userId?: number | null;
};

const api = axios.create({ baseURL: ApiDomain });

export const ordersAPI = {
  getMyOrders: (): Promise<{ success: boolean; data: Order[] }> =>
    api.get('/orders/user').then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Order }> =>
    api.get(`/orders/${id}`).then(res => res.data),
  getByRef: (ref: string): Promise<{ success: boolean; data: Order }> =>
    api.get(`/orders/ref/${ref}`).then(res => res.data),
  create: (data: NewOrder): Promise<{
    message: string; success: boolean; data: Order 
}> =>
    api.post('/orders', data).then(res => res.data),
  cancel: (id: number): Promise<{ success: boolean; data: Order; message: string }> =>
    api.patch(`/orders/${id}/cancel`).then(res => res.data),
  getAll: (): Promise<{ success: boolean; data: Order[] }> =>
    api.get('/orders').then(res => res.data),
  getStats: (): Promise<{ success: boolean; data: { totalOrders: number; totalRevenue: number; pendingOrders: number } }> =>
    api.get('/orders/stats').then(res => res.data),
  updateStatus: (id: number, status: Order['status']): Promise<{ success: boolean; data: Order; message: string }> =>
    api.patch(`/orders/${id}/status`, { status }).then(res => res.data),
  updatePaymentStatus: (id: number, paymentStatus: Order['paymentStatus']): Promise<{ success: boolean; data: Order; message: string }> =>
    api.patch(`/orders/${id}/payment`, { paymentStatus }).then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Order; message: string }> =>
    api.delete(`/orders/${id}`).then(res => res.data),
};