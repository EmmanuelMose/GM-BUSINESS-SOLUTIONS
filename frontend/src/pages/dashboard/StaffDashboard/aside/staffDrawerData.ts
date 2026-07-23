import { type ReactNode } from 'react';

export interface DrawerItem {
  id: string;
  name: string;
  icon: ReactNode;
  link: string;
}

export const staffDrawerData: DrawerItem[] = [
  { id: 'dashboard', name: 'Overview', icon: '📊', link: 'staffdashboard' },
  { id: 'products', name: 'Products', icon: '📦', link: 'products' },
  { id: 'categories', name: 'Categories', icon: '📂', link: 'categories' },
  { id: 'orders', name: 'Orders', icon: '📋', link: 'orders' },
  { id: 'reviews', name: 'Reviews', icon: '⭐', link: 'reviews' },
  { id: 'coupons', name: 'Coupons', icon: '🏷️', link: 'coupons' },
  { id: 'inquiries', name: 'Inquiries', icon: '💬', link: 'inquiries' },
  { id: 'pickup-stations', name: 'Pickup Stations', icon: '📍', link: 'pickup-stations' },
  { id: 'logout', name: 'Log Out', icon: '🚪', link: 'logout' },
];