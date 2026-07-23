import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { ordersAPI } from '../../../../Features/orders/ordersAPI';
import { productsAPI } from '../../../../Features/products/productsAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Order = {
  orderId: number;
  orderRef: string;
  total: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items?: any[];
};

type Product = {
  productId: number;
  name: string;
  price: string;
  stock: number;
  status: string;
};

type User = {
  userId: number;
  createdAt: string;
};

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    lowStock: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          ordersAPI.getAll(),
          productsAPI.getAll(),
          usersAPI.getAll(),
        ]);

        const ordersData = ordersRes.success ? ordersRes.data : [];
        const productsData = productsRes.success ? productsRes.data : [];
        const usersData = usersRes.success ? usersRes.data : [];

        setOrders(ordersData);
        setProducts(productsData);
        setUsers(usersData);

        const paidOrders = ordersData.filter(
          (o: any) => o.paymentStatus === 'paid' || o.status === 'delivered'
        );
        const totalRevenue = paidOrders.reduce(
          (sum: number, o: any) => sum + parseFloat(o.total),
          0
        );
        const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

        setStats({
          totalOrders: ordersData.length,
          totalRevenue,
          totalProducts: productsData.length,
          totalUsers: usersData.length,
          pendingOrders: ordersData.filter((o: any) => o.status === 'pending').length,
          lowStock: productsData.filter((p: any) => p.status === 'low_stock').length,
          averageOrderValue: avgOrderValue,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Chart Data Helpers ---

  const getLastDays = (days: number) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const revenueByDay = useMemo(() => {
    const days = getLastDays(30);
    const revenueMap: Record<string, number> = {};
    days.forEach((d) => (revenueMap[d] = 0));

    orders.forEach((order) => {
      if (order.paymentStatus === 'paid' || order.status === 'delivered') {
        const day = order.createdAt.split('T')[0];
        if (revenueMap[day] !== undefined) {
          revenueMap[day] += parseFloat(order.total);
        }
      }
    });

    return {
      labels: days.map((d) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })),
      values: days.map((d) => revenueMap[d]),
    };
  }, [orders]);

  const orderStatusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    return {
      labels: Object.keys(statusCounts).map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
      values: Object.values(statusCounts),
    };
  }, [orders]);

  const paymentStatusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.paymentStatus] = (statusCounts[o.paymentStatus] || 0) + 1;
    });
    return {
      labels: Object.keys(statusCounts).map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
      values: Object.values(statusCounts),
    };
  }, [orders]);

  const topProducts = useMemo(() => {
    // Simple: assume we can get items from orders. If not available, fallback to most expensive products.
    const productSales: Record<number, { name: string; totalSold: number; revenue: number }> = {};
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const id = item.productId;
          if (!productSales[id]) {
            productSales[id] = { name: item.productName || `Product ${id}`, totalSold: 0, revenue: 0 };
          }
          productSales[id].totalSold += item.quantity;
          productSales[id].revenue += parseFloat(item.total);
        });
      }
    });
    // If no items, use products with highest price * stock as proxy
    if (Object.keys(productSales).length === 0) {
      products.slice(0, 10).forEach((p) => {
        productSales[p.productId] = {
          name: p.name,
          totalSold: 0,
          revenue: parseFloat(p.price) * p.stock,
        };
      });
    }
    const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
    return sorted.slice(0, 5);
  }, [orders, products]);

  const userGrowth = useMemo(() => {
    const days = getLastDays(30);
    const userMap: Record<string, number> = {};
    days.forEach((d) => (userMap[d] = 0));

    users.forEach((u) => {
      const day = u.createdAt.split('T')[0];
      if (userMap[day] !== undefined) {
        userMap[day] += 1;
      }
    });

    // Cumulative sum
    let cumulative = 0;
    const cumulativeValues = days.map((d) => {
      cumulative += userMap[d];
      return cumulative;
    });

    return {
      labels: days.map((d) => new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })),
      values: cumulativeValues,
    };
  }, [users]);

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0b6b3a', titleColor: '#fff', bodyColor: '#fff' },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#6b7280' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', maxTicksLimit: 10 },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#374151', font: { size: 12 } } },
      tooltip: { backgroundColor: '#0b6b3a', titleColor: '#fff', bodyColor: '#fff' },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#0b6b3a', titleColor: '#fff', bodyColor: '#fff' },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#6b7280' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280' },
      },
    },
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="analytics-loader"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <p className="analytics-subtitle">Real-time insights into your store performance</p>
      </div>

      {/* KPI Cards */}
      <div className="analytics-stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-content">
            <span className="stat-card-value">KSh {stats.totalRevenue.toLocaleString()}</span>
            <span className="stat-card-label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-card-icon">📋</div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats.totalOrders}</span>
            <span className="stat-card-label">Total Orders</span>
          </div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-card-icon">📦</div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats.totalProducts}</span>
            <span className="stat-card-label">Products</span>
          </div>
        </div>
        <div className="stat-card stat-card-warning">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats.totalUsers}</span>
            <span className="stat-card-label">Users</span>
          </div>
        </div>
        <div className="stat-card stat-card-danger">
          <div className="stat-card-icon">⏳</div>
          <div className="stat-card-content">
            <span className="stat-card-value">{stats.pendingOrders}</span>
            <span className="stat-card-label">Pending Orders</span>
          </div>
        </div>
        <div className="stat-card stat-card-secondary">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-content">
            <span className="stat-card-value">KSh {Math.round(stats.averageOrderValue).toLocaleString()}</span>
            <span className="stat-card-label">Avg Order Value</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        <div className="chart-card chart-card-large">
          <div className="chart-card-header">
            <h3>Revenue Trend (Last 30 Days)</h3>
            <span className="chart-badge">KSh {stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="chart-container">
            <Line
              data={{
                labels: revenueByDay.labels,
                datasets: [
                  {
                    label: 'Revenue',
                    data: revenueByDay.values,
                    borderColor: '#0b6b3a',
                    backgroundColor: 'rgba(11, 107, 58, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: '#0b6b3a',
                  },
                ],
              }}
              options={lineOptions}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Order Status</h3>
          </div>
          <div className="chart-container">
            <Pie
              data={{
                labels: orderStatusDistribution.labels,
                datasets: [
                  {
                    data: orderStatusDistribution.values,
                    backgroundColor: [
                      '#f59e0b',
                      '#3b82f6',
                      '#8b5cf6',
                      '#16a34a',
                      '#dc2626',
                      '#6b7280',
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
              options={pieOptions}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Payment Status</h3>
          </div>
          <div className="chart-container">
            <Doughnut
              data={{
                labels: paymentStatusDistribution.labels,
                datasets: [
                  {
                    data: paymentStatusDistribution.values,
                    backgroundColor: [
                      '#f59e0b',
                      '#16a34a',
                      '#dc2626',
                      '#6b7280',
                    ],
                    borderWidth: 0,
                  },
                ],
              }}
              options={pieOptions}
            />
          </div>
        </div>

        <div className="chart-card chart-card-large">
          <div className="chart-card-header">
            <h3>User Growth (Cumulative)</h3>
          </div>
          <div className="chart-container">
            <Line
              data={{
                labels: userGrowth.labels,
                datasets: [
                  {
                    label: 'Total Users',
                    data: userGrowth.values,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointBackgroundColor: '#3b82f6',
                  },
                ],
              }}
              options={lineOptions}
            />
          </div>
        </div>

        <div className="chart-card chart-card-large">
          <div className="chart-card-header">
            <h3>Top 5 Products by Revenue</h3>
          </div>
          <div className="chart-container">
            <Bar
              data={{
                labels: topProducts.map((p) => p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name),
                datasets: [
                  {
                    label: 'Revenue',
                    data: topProducts.map((p) => Math.round(p.revenue)),
                    backgroundColor: [
                      '#0b6b3a',
                      '#1a8a4a',
                      '#2aa85a',
                      '#3bc66a',
                      '#4ce47a',
                    ],
                    borderRadius: 4,
                  },
                ],
              }}
              options={barOptions}
            />
          </div>
        </div>
      </div>

      <div className="analytics-footer">
        <p>Data updated in real-time • {new Date().toLocaleString('en-KE')}</p>
      </div>
    </div>
  );
}