import { useState, useEffect } from 'react';
import { ordersAPI } from '../../../../Features/orders/ordersAPI';
import { productsAPI } from '../../../../Features/products/productsAPI';
import { inquiriesAPI } from '../../../../Features/inquiries/inquiriesAPI';
import './StaffDashboardOverview.css';

export default function StaffDashboardOverview() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    pendingInquiries: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes, inquiriesRes] = await Promise.all([
          ordersAPI.getAll(),
          productsAPI.getAll(),
          inquiriesAPI.getAll(),
        ]);

        const orders = ordersRes.success ? ordersRes.data : [];
        const products = productsRes.success ? productsRes.data : [];
        const inquiries = inquiriesRes.success ? inquiriesRes.data : [];

        const totalRevenue = orders.reduce((sum: number, order: any) => {
          return sum + (order.paymentStatus === 'paid' || order.status === 'delivered' ? parseFloat(order.total) : 0);
        }, 0);

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
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
    <div className="staff-dashboard-overview">
      <div className="dashboard-welcome">
        <h2>Staff Dashboard</h2>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">Total Orders</span>
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
      </div>

      <div className="dashboard-recent">
        <div className="dashboard-section-header">
          <div>
            <h3>Recent Orders</h3>
            <p className="dashboard-section-sub">Latest 5 orders placed</p>
          </div>
          <a href="/staff/orders" className="view-all">View All →</a>
        </div>
        <div className="recent-orders-table">
          <table>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="empty-state">No recent orders</td></tr>
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
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}