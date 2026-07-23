import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../../../Features/products/productsAPI';
import { ordersAPI } from '../../../../Features/orders/ordersAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import { inquiriesAPI } from '../../../../Features/inquiries/inquiriesAPI';
import './AdminDashboardOverview.css';

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingInquiries: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, ordersRes, usersRes, inquiriesRes] = await Promise.all([
          productsAPI.getAll(),
          ordersAPI.getAll(),
          usersAPI.getAll(),
          inquiriesAPI.getAll(),
        ]);

        const products = productsRes.success ? productsRes.data : [];
        const orders = ordersRes.success ? ordersRes.data : [];
        const users = usersRes.success ? usersRes.data : [];
        const inquiries = inquiriesRes.success ? inquiriesRes.data : [];

        const totalRevenue = orders.reduce((sum: number, order: any) => {
          return sum + (order.paymentStatus === 'paid' || order.status === 'delivered' ? parseFloat(order.total) : 0);
        }, 0);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalUsers: users.length,
          pendingInquiries: inquiries.filter((i: any) => i.status === 'unread').length,
          totalRevenue: totalRevenue,
        });

        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-overview">
      <div className="dashboard-welcome">
        <h2>Dashboard Overview</h2>
        <p>Welcome back! Here's what's happening with your store today.</p>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Total Products</span>
            <span className="stat-change">+12% this month</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">Total Orders</span>
            <span className="stat-change">+8% this month</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Total Users</span>
            <span className="stat-change">+15% this month</span>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingInquiries}</span>
            <span className="stat-label">Pending Inquiries</span>
            <span className="stat-change">-3% this month</span>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">KSh {stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Total Revenue</span>
            <span className="stat-change">+22% this month</span>
          </div>
        </div>
      </div>

      <div className="dashboard-recent">
        <div className="dashboard-section-header">
          <div>
            <h3>Recent Orders</h3>
            <p className="dashboard-section-sub">Latest 5 orders placed by customers</p>
          </div>
          <Link to="/admin/orders" className="view-all">View All →</Link>
        </div>
        <div className="recent-orders-table">
          <table>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">No recent orders</td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.orderId}>
                    <td className="order-ref">{order.orderRef}</td>
                    <td>{order.guestEmail || order.userId || 'Guest'}</td>
                    <td className="order-total">KSh {parseFloat(order.total).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/admin/orders`} className="view-link">View</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-quick-actions">
        <div className="quick-actions-header">
          <h3>Quick Actions</h3>
          <p>Common tasks to manage your store</p>
        </div>
        <div className="quick-actions-grid">
          <Link to="/admin/products/create" className="quick-action-card">
            <span className="quick-action-icon">➕</span>
            <span className="quick-action-label">Add Product</span>
          </Link>
          <Link to="/admin/categories/create" className="quick-action-card">
            <span className="quick-action-icon">📂</span>
            <span className="quick-action-label">Add Category</span>
          </Link>
          <Link to="/admin/coupons/create" className="quick-action-card">
            <span className="quick-action-icon">🏷️</span>
            <span className="quick-action-label">Create Coupon</span>
          </Link>
          <Link to="/admin/orders" className="quick-action-card">
            <span className="quick-action-icon">📋</span>
            <span className="quick-action-label">View Orders</span>
          </Link>
        </div>
      </div>
    </div>
  );
}