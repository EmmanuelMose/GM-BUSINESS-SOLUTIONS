import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Payment {
  paymentId: number;
  orderId: number;
  userId: number | null;
  amount: string;
  paymentMethod: 'mpesa';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionReference: string | null;
  mpesaReceiptNumber: string | null;
  mpesaPhoneNumber: string | null;
  mpesaTillNumber: string | null;
  paymentDate: string | null;
  paymentResponse: any;
  notes: string | null;
  processedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export type NewPayment = {
  orderId: number;
  userId?: number | null;
  amount: number;
  paymentMethod: 'mpesa';
  mpesaPhoneNumber?: string | null;
  mpesaTillNumber?: string | null;
  notes?: string | null;
  processedBy?: number | null;
};

const api = axios.create({ baseURL: ApiDomain });

export const paymentsAPI = {
  getByOrder: (orderId: number): Promise<{ success: boolean; data: Payment[] }> =>
    api.get(`/payments/order/${orderId}`).then(res => res.data),
  create: (data: NewPayment): Promise<{ success: boolean; data: Payment; message: string }> =>
    api.post('/payments', data).then(res => res.data),
  initiateMpesa: (paymentId: number): Promise<{ success: boolean; data: Payment & { checkoutRequestId: string; customerMessage: string; responseCode: string }; message: string }> =>
    api.post(`/payments/${paymentId}/mpesa/initiate`).then(res => res.data),
  queryMpesaStatus: (paymentId: number): Promise<{ success: boolean; data: Payment }> =>
    api.get(`/payments/${paymentId}/mpesa/status`).then(res => res.data),
  getAll: (): Promise<{ success: boolean; data: Payment[] }> =>
    api.get('/payments').then(res => res.data),
  getById: (id: number): Promise<{ success: boolean; data: Payment }> =>
    api.get(`/payments/${id}`).then(res => res.data),
  getByTransaction: (ref: string): Promise<{ success: boolean; data: Payment }> =>
    api.get(`/payments/transaction/${ref}`).then(res => res.data),
  getStats: (): Promise<{ success: boolean; data: any }> =>
    api.get('/payments/stats').then(res => res.data),
  delete: (id: number): Promise<{ success: boolean; data: Payment; message: string }> =>
    api.delete(`/payments/${id}`).then(res => res.data),
};