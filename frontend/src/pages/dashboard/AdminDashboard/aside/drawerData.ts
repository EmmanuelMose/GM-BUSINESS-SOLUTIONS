import { type ReactNode } from 'react';

export interface DrawerItem {
  id: string;
  name: string;
  icon: ReactNode;
  link: string;
}

export const adminDrawerData: DrawerItem[] = [
  { id: 'dashboard', name: 'Overview', icon: '📊', link: 'admindashboard' },
  { id: 'products', name: 'Products', icon: '📦', link: 'products' },
  { id: 'categories', name: 'Categories', icon: '📂', link: 'categories' },
  { id: 'orders', name: 'Orders', icon: '📋', link: 'orders' },
  { id: 'payments', name: 'Payments', icon: '💳', link: 'payments' },
  { id: 'reviews', name: 'Reviews', icon: '⭐', link: 'reviews' },
  { id: 'coupons', name: 'Coupons', icon: '🏷️', link: 'coupons' },
  { id: 'pickup-stations', name: 'Pickup Stations', icon: '📍', link: 'pickup-stations' },
  { id: 'manage-users', name: 'Manage Users', icon: '👤', link: 'manage-users' },
  { id: 'manage-staff', name: 'Manage Staff', icon: '👥', link: 'manage-staff' },
  { id: 'manage-admins', name: 'Manage Admins', icon: '🛡️', link: 'manage-admins' },
  { id: 'inquiries', name: 'Inquiries', icon: '💬', link: 'inquiries' },
  { id: 'analytics', name: 'Analytics', icon: '📈', link: 'analytics' },
  { id: 'reports', name: 'Reports', icon: '📄', link: 'reports' },
  { id: 'logout', name: 'Log Out', icon: '🚪', link: 'logout' },
];