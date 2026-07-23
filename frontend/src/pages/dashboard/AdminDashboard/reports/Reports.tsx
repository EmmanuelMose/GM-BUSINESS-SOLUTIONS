import { useState, useEffect, useMemo } from 'react';
import { Download, Printer, Calendar, RefreshCw, FileText, Package, Users, ShoppingBag, CreditCard } from 'lucide-react';
import { ordersAPI } from '../../../../Features/orders/ordersAPI';
import { productsAPI } from '../../../../Features/products/productsAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import { paymentsAPI } from '../../../../Features/payments/paymentsAPI';
import './Reports.css';

type ReportType = 'sales' | 'orders' | 'products' | 'users' | 'revenue';
type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface SalesReportItem {
  date: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
}

interface OrderReportItem {
  orderId: number;
  orderRef: string;
  customer: string;
  total: number;
  status: string;
  paymentStatus: string;
  date: string;
}

interface ProductReportItem {
  productId: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
  totalSold: number;
  revenue: number;
}

interface UserReportItem {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joined: string;
}

export default function Reports() {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [, setPayments] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, usersRes, paymentsRes] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
        usersAPI.getAll(),
        paymentsAPI.getAll().catch(() => ({ success: false, data: [] })),
      ]);

      const ordersData = ordersRes.success ? ordersRes.data : [];
      const productsData = productsRes.success ? productsRes.data : [];
      const usersData = usersRes.success ? usersRes.data : [];
      const paymentsData = paymentsRes.success ? paymentsRes.data : [];

      setOrders(ordersData);
      setProducts(productsData);
      setUsers(usersData);
      setPayments(paymentsData);

      // Calculate summary
      const paidOrders = ordersData.filter((o: any) => o.paymentStatus === 'paid' || o.status === 'delivered');
      const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + parseFloat(o.total), 0);
      const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

      setSummary({
        totalOrders: ordersData.length,
        totalRevenue,
        totalProducts: productsData.length,
        totalUsers: usersData.length,
        avgOrderValue,
        pendingOrders: ordersData.filter((o: any) => o.status === 'pending').length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Date filtering
  const getDateRange = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    let start = new Date(today);
    let end = new Date(now);

    switch (dateRange) {
      case 'today':
        start = today;
        break;
      case 'week':
        start = new Date(today);
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = new Date(today);
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start = new Date(today);
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start = new Date(today);
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { start, end };
  }, [dateRange, customStartDate, customEndDate]);

  const filterByDate = (items: any[], dateField: string) => {
    const { start, end } = getDateRange;
    return items.filter((item) => {
      const date = new Date(item[dateField]);
      return date >= start && date <= end;
    });
  };

  // Sales Report Data
  const salesData = useMemo((): SalesReportItem[] => {
    const filtered = filterByDate(orders, 'createdAt');

    const dailyMap: Record<string, { orders: number; revenue: number }> = {};
    filtered.forEach((order: any) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-KE');
      if (!dailyMap[date]) {
        dailyMap[date] = { orders: 0, revenue: 0 };
      }
      dailyMap[date].orders += 1;
      if (order.paymentStatus === 'paid' || order.status === 'delivered') {
        dailyMap[date].revenue += parseFloat(order.total);
      }
    });

    return Object.entries(dailyMap).map(([date, data]) => ({
      date,
      orders: data.orders,
      revenue: data.revenue,
      avgOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
    }));
  }, [orders, getDateRange]);

  // Order Report Data
  const orderReportData = useMemo((): OrderReportItem[] => {
    const filtered = filterByDate(orders, 'createdAt');
    return filtered.map((order: any) => ({
      orderId: order.orderId,
      orderRef: order.orderRef,
      customer: order.guestEmail || order.userId || 'Guest',
      total: parseFloat(order.total),
      status: order.status,
      paymentStatus: order.paymentStatus,
      date: new Date(order.createdAt).toLocaleDateString('en-KE'),
    }));
  }, [orders, getDateRange]);

  // Product Report Data
  const productReportData = useMemo((): ProductReportItem[] => {
    // If orders have items, calculate actual sales
    const productSales: Record<number, { totalSold: number; revenue: number }> = {};
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { totalSold: 0, revenue: 0 };
          }
          productSales[item.productId].totalSold += item.quantity;
          productSales[item.productId].revenue += parseFloat(item.total || item.price * item.quantity);
        });
      }
    });

    return products.map((product: any) => {
      const sales = productSales[product.productId] || { totalSold: 0, revenue: 0 };
      return {
        productId: product.productId,
        name: product.name,
        sku: product.sku || 'N/A',
        price: parseFloat(product.price),
        stock: product.stock,
        status: product.status,
        totalSold: sales.totalSold,
        revenue: sales.revenue,
      };
    });
  }, [products, orders]);

  // User Report Data
  const userReportData = useMemo((): UserReportItem[] => {
    // Calculate user spending from orders
    const userSpending: Record<number, { orders: number; spent: number }> = {};
    orders.forEach((order: any) => {
      if (order.userId && (order.paymentStatus === 'paid' || order.status === 'delivered')) {
        if (!userSpending[order.userId]) {
          userSpending[order.userId] = { orders: 0, spent: 0 };
        }
        userSpending[order.userId].orders += 1;
        userSpending[order.userId].spent += parseFloat(order.total);
      }
    });

    const filtered = filterByDate(users, 'createdAt');
    return filtered.slice(0, 100).map((user: any) => {
      const spending = userSpending[user.userId] || { orders: 0, spent: 0 };
      return {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || 'N/A',
        totalOrders: spending.orders,
        totalSpent: spending.spent,
        joined: new Date(user.createdAt).toLocaleDateString('en-KE'),
      };
    });
  }, [users, orders, getDateRange]);

  // Revenue Report Data (monthly aggregation)
  const revenueData = useMemo(() => {
    const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
    const filtered = orders.filter((o: any) => o.paymentStatus === 'paid' || o.status === 'delivered');
    const dateFiltered = filterByDate(filtered, 'createdAt');

    dateFiltered.forEach((order: any) => {
      const month = new Date(order.createdAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' });
      if (!monthlyMap[month]) {
        monthlyMap[month] = { revenue: 0, orders: 0 };
      }
      monthlyMap[month].revenue += parseFloat(order.total);
      monthlyMap[month].orders += 1;
    });

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }));
  }, [orders, getDateRange]);

  // Export to CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header] ?? '';
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      ),
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 800);
  };

  const handlePrint = () => {
    window.print();
  };

  const getCurrentReport = () => {
    switch (reportType) {
      case 'sales':
        return { data: salesData, columns: ['Date', 'Orders', 'Revenue', 'Avg Order Value'] };
      case 'orders':
        return { data: orderReportData, columns: ['Order Ref', 'Customer', 'Total', 'Status', 'Payment', 'Date'] };
      case 'products':
        return { data: productReportData, columns: ['Name', 'SKU', 'Price', 'Stock', 'Status', 'Sold', 'Revenue'] };
      case 'users':
        return { data: userReportData, columns: ['Name', 'Email', 'Phone', 'Orders', 'Spent', 'Joined'] };
      case 'revenue':
        return { data: revenueData, columns: ['Month', 'Orders', 'Revenue'] };
      default:
        return { data: [], columns: [] };
    }
  };

  const currentReport = getCurrentReport();

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="reports-loader"></div>
        <p>Loading reports data...</p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h2>Reports</h2>
          <p className="reports-subtitle">Generate and export detailed business reports</p>
        </div>
        <div className="reports-header-actions">
          <button className="btn-secondary" onClick={fetchAllData}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="reports-summary-grid">
        <div className="summary-card summary-card-primary">
          <div className="summary-card-icon">💰</div>
          <div className="summary-card-content">
            <span className="summary-card-value">KSh {summary.totalRevenue.toLocaleString()}</span>
            <span className="summary-card-label">Total Revenue</span>
          </div>
        </div>
        <div className="summary-card summary-card-success">
          <div className="summary-card-icon">📋</div>
          <div className="summary-card-content">
            <span className="summary-card-value">{summary.totalOrders}</span>
            <span className="summary-card-label">Total Orders</span>
          </div>
        </div>
        <div className="summary-card summary-card-info">
          <div className="summary-card-icon">📦</div>
          <div className="summary-card-content">
            <span className="summary-card-value">{summary.totalProducts}</span>
            <span className="summary-card-label">Products</span>
          </div>
        </div>
        <div className="summary-card summary-card-warning">
          <div className="summary-card-icon">👥</div>
          <div className="summary-card-content">
            <span className="summary-card-value">{summary.totalUsers}</span>
            <span className="summary-card-label">Users</span>
          </div>
        </div>
      </div>

      {/* Report Controls */}
      <div className="reports-controls">
        <div className="reports-controls-left">
          <div className="report-type-selector">
            <button
              className={`report-type-btn ${reportType === 'sales' ? 'active' : ''}`}
              onClick={() => setReportType('sales')}
            >
              <FileText size={16} /> Sales
            </button>
            <button
              className={`report-type-btn ${reportType === 'orders' ? 'active' : ''}`}
              onClick={() => setReportType('orders')}
            >
              <ShoppingBag size={16} /> Orders
            </button>
            <button
              className={`report-type-btn ${reportType === 'products' ? 'active' : ''}`}
              onClick={() => setReportType('products')}
            >
              <Package size={16} /> Products
            </button>
            <button
              className={`report-type-btn ${reportType === 'users' ? 'active' : ''}`}
              onClick={() => setReportType('users')}
            >
              <Users size={16} /> Users
            </button>
            <button
              className={`report-type-btn ${reportType === 'revenue' ? 'active' : ''}`}
              onClick={() => setReportType('revenue')}
            >
              <CreditCard size={16} /> Revenue
            </button>
          </div>
        </div>
        <div className="reports-controls-right">
          <div className="date-range-selector">
            <Calendar size={16} className="date-icon" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="date-select"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="date-input"
              />
              <span>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          )}
          <button className="btn-primary" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate'}
          </button>
          <button
            className="btn-primary btn-export"
            onClick={() => exportToCSV(currentReport.data, reportType)}
            disabled={currentReport.data.length === 0}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="reports-table-container">
        {currentReport.data.length === 0 ? (
          <div className="reports-empty">
            <span>📊</span>
            <p>No data available for the selected report and date range</p>
            <button className="btn-primary btn-sm" onClick={handleGenerate}>Generate Report</button>
          </div>
        ) : (
          <>
            <div className="reports-table-header">
              <h3>
                {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
              </h3>
              <span className="reports-count">{currentReport.data.length} records</span>
            </div>
            <div className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    {currentReport.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentReport.data.map((row: any, index: number) => (
                    <tr key={index}>
                      {Object.values(row).map((value: any, cellIndex: number) => {
                        // Format currency values
                        if (typeof value === 'number' && (currentReport.columns[cellIndex]?.includes('Revenue') ||
                          currentReport.columns[cellIndex]?.includes('Total') ||
                          currentReport.columns[cellIndex]?.includes('Spent') ||
                          currentReport.columns[cellIndex]?.includes('Price'))) {
                          return <td key={cellIndex}>KSh {value.toLocaleString()}</td>;
                        }
                        // Format status badges
                        if (currentReport.columns[cellIndex]?.includes('Status') || currentReport.columns[cellIndex]?.includes('Payment')) {
                          const statusClass = `status-${value}`;
                          return (
                            <td key={cellIndex}>
                              <span className={`report-status ${statusClass}`}>{value}</span>
                            </td>
                          );
                        }
                        return <td key={cellIndex}>{value}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}