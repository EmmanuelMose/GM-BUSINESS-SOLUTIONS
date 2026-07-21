import { useEffect, useState } from 'react';
import { ordersAPI } from '../../../../Features/orders/ordersAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import { inquiriesAPI } from '../../../../Features/inquiries/inquiriesAPI';
import { adminsAPI } from '../../../../Features/admins/adminsAPI';
import './StaffDashboardOverview.css';

export default function StaffDashboardOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    pendingInquiries: 0,
    totalRevenue: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, usersRes, inquiriesRes, adminsRes] = await Promise.all([
          ordersAPI.getAll(),
          usersAPI.getAll(),
          inquiriesAPI.getAll(),
          adminsAPI.getAll(),
        ]);

        const orders = ordersRes.success ? ordersRes.data : [];
        const users = usersRes.success ? usersRes.data : [];
        const inquiries = inquiriesRes.success ? inquiriesRes.data : [];
        const admins = adminsRes.success ? adminsRes.data : [];

        const totalRevenue = orders.reduce((sum: number, order: any) => {
          return sum + (order.paymentStatus === 'paid' || order.status === 'delivered' ? parseFloat(order.total) : 0);
        }, 0);

        setStats({
          totalOrders: orders.length,
          totalUsers: users.length,
          pendingInquiries: inquiries.filter((i: any) => i.status === 'unread').length,
          totalRevenue: totalRevenue,
          totalAdmins: admins.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="staff-loading">Loading dashboard...</div>;
  }

  return (
    <div className="staff-dashboard-overview">
      <div className="staff-stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingInquiries}</span>
            <span className="stat-label">Pending Inquiries</span>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">KSh {stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🛡️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalAdmins}</span>
            <span className="stat-label">Total Admins</span>
          </div>
        </div>
      </div>
    </div>
  );
}