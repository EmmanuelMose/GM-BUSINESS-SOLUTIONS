import axios from 'axios';
import { ApiDomain } from '../../utils/APIDomain';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    role: 'customer' | 'admin' | 'staff';
    dashboard: 'admin' | 'staff' | 'customer';
    userId: number;
    email: string;
    fullName: string;
  };
  redirect: string;
}

export interface VerifyData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  password: string;
}

const api = axios.create({ baseURL: ApiDomain });

export const authAPI = {
  register: (data: RegisterData): Promise<{ success: boolean; message: string }> =>
    api.post('/auth/register', data).then(res => res.data),
  verify: (email: string, code: string): Promise<{ success: boolean; message: string }> =>
    api.post('/auth/verify', { email, code }).then(res => res.data),
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    api.post('/auth/login', credentials).then(res => res.data),
  forgotPassword: (email: string): Promise<{ success: boolean; message: string }> =>
    api.post('/auth/forgot-password', { email }).then(res => res.data),
  verifyResetCode: (email: string, code: string): Promise<{ success: boolean; message: string }> =>
    api.post('/auth/verify-reset-code', { email, code }).then(res => res.data),
  resetPassword: (email: string, password: string): Promise<{ success: boolean; message: string }> =>
    api.post('/auth/reset-password', { email, password }).then(res => res.data),
};