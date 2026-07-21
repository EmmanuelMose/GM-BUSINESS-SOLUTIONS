import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface CartItem {
  cartId: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: any;
  subtotal: number;
}

export interface CartResponse {
  success: boolean;
  data: {
    items: CartItem[];
    total: number;
    count: number;
  };
}

const api = axios.create({ baseURL: ApiDomain });

export const cartAPI = {
  getCart: (): Promise<CartResponse> =>
    api.get('/cart').then(res => res.data),
  add: (productId: number, quantity: number = 1): Promise<{ success: boolean; message: string; data: CartItem }> =>
    api.post('/cart', { productId, quantity }).then(res => res.data),
  updateQuantity: (productId: number, quantity: number): Promise<{ success: boolean; message: string; data: CartItem }> =>
    api.patch(`/cart/${productId}`, { quantity }).then(res => res.data),
  remove: (productId: number): Promise<{ success: boolean; message: string; data: CartItem }> =>
    api.delete(`/cart/${productId}`).then(res => res.data),
  clear: (): Promise<{ success: boolean; message: string }> =>
    api.delete('/cart/clear').then(res => res.data),
};