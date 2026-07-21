import { type ReactNode } from 'react';

export interface DrawerItem {
  id: string;
  name: string;
  icon: ReactNode;
  link: string;
}

export const staffDrawerData: DrawerItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: '📊',
    link: 'staffdashboard',
  },
  {
    id: 'manage-admins',
    name: 'Manage Admins',
    icon: '🛡️',
    link: 'manage-admins',
  },
  {
    id: 'view-orders',
    name: 'View Orders',
    icon: '📋',
    link: 'view-orders',
  },
  {
    id: 'view-inquiries',
    name: 'View Inquiries',
    icon: '💬',
    link: 'view-inquiries',
  },
  {
    id: 'logout',
    name: 'Log Out',
    icon: '🚪',
    link: 'logout',
  },
];