import { useState, useEffect } from 'react';
import { ordersAPI } from '../../../../Features/orders/ordersAPI';
import { productsAPI } from '../../../../Features/products/productsAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import './Analytics.css';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStock: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          ordersAPI.getAll(),
          productsAPI.getAll(),
          usersAPI.getAll(),
        ]);

        const orders = ordersRes.success ? ordersRes.data : [];
        const products = productsRes.success ? productsRes.data : [];
        const users = usersRes.success ? usersRes.data : [];

        const revenue = orders.reduce((sum: number, order: any) => {
          return sum + (order.paymentStatus === 'paid' || order.status === 'delivered' ? parseFloat(order.total) : 0);
        }, 0);

        setStats({
          totalOrders: orders.length,
          totalRevenue: revenue,
          totalProducts: products.length,
          totalUsers: users.length,
          pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
          lowStock: products.filter((p: any) => p.status === 'low_stock').length,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading analytics...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Analytics</h2>
      </div>
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-icon">📋</div>
          <div className="analytics-info">
            <span className="analytics-value">{stats.totalOrders}</span>
            <span className="analytics-label">Total Orders</span>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-icon">💰</div>
          <div className="analytics-info">
            <span className="analytics-value">KSh {stats.totalRevenue.toLocaleString()}</span>
            <span className="analytics-label">Total Revenue</span>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-icon">📦</div>
          <div className="analytics-info">
            <span className="analytics-value">{stats.totalProducts}</span>
            <span className="analytics-label">Total Products</span>
          </div>
        </div>
        <div className="analytics-card">
          <div className="analytics-icon">👥</div>
          <div className="analytics-info">
            <span className="analytics-value">{stats.totalUsers}</span>
            <span className="analytics-label">Total Users</span>
          </div>
        </div>
        <div className="analytics-card warning">
          <div className="analytics-icon">⏳</div>
          <div className="analytics-info">
            <span className="analytics-value">{stats.pendingOrders}</span>
            <span className="analytics-label">Pending Orders</span>
          </div>
        </div>
        <div className="analytics-card danger">
          <div className="analytics-icon">⚠️</div>
          <div className="analytics-info">
            <span className="analytics-value">{stats.lowStock}</span>
            <span className="analytics-label">Low Stock Items</span>
          </div>
        </div>
      </div>
      <div className="analytics-chart-placeholder">
        <p>📊 Sales Chart (Coming Soon)</p>
      </div>
    </div>
  );
}