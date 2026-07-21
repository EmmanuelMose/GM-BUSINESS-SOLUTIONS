import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface Payment {
  paymentId: number;
  orderId: number;
  userId: number | null;
  amount: string;
  paymentMethod: 'mpesa' | 'cash' | 'bank_transfer' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionReference: string | null;
  mpesaReceiptNumber: string | null;
  mpesaPhoneNumber: string | null;
  mpesaTillNumber: string | null;
  bankReference: string | null;
  cardLastFour: string | null;
  cardBrand: string | null;
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
  paymentMethod: Payment['paymentMethod'];
  mpesaPhoneNumber?: string | null;
  mpesaTillNumber?: string | null;
  bankReference?: string | null;
  cardLastFour?: string | null;
  cardBrand?: string | null;
  notes?: string | null;
  processedBy?: number | null;
};

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  bankCode: string;
  branch: string;
  swiftCode: string;
  instructions: string;
}

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
  getBankDetails: (): Promise<{ success: boolean; data: BankDetails }> =>
    api.get('/payments/bank-details').then(res => res.data),
  processBankTransfer: (paymentId: number, bankReference: string): Promise<{ success: boolean; data: Payment; message: string }> =>
    api.patch(`/payments/${paymentId}/bank-transfer`, { bankReference }).then(res => res.data),
  processCardPayment: (paymentId: number, cardLastFour: string, cardBrand: string, transactionRef: string): Promise<{ success: boolean; data: Payment; message: string }> =>
    api.patch(`/payments/${paymentId}/card`, { cardLastFour, cardBrand, transactionRef }).then(res => res.data),
  processCashPayment: (paymentId: number): Promise<{ success: boolean; data: Payment; message: string }> =>
    api.patch(`/payments/${paymentId}/cash`).then(res => res.data),
  refundPayment: (paymentId: number, notes?: string): Promise<{ success: boolean; data: Payment; message: string }> =>
    api.patch(`/payments/${paymentId}/refund`, { notes }).then(res => res.data),
  failPayment: (paymentId: number, notes?: string): Promise<{ success: boolean; data: Payment; message: string }> =>
    api.patch(`/payments/${paymentId}/fail`, { notes }).then(res => res.data),
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