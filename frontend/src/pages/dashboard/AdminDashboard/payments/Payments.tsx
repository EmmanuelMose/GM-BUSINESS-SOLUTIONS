import { useState, useEffect } from 'react';
import { Eye, Trash2, Search, Filter, Download } from 'lucide-react';
import { paymentsAPI, type Payment } from '../../../../Features/payments/paymentsAPI';
import './Payments.css';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
  });

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await paymentsAPI.getAll();
        if (res.success) {
          setPayments(res.data);
          setFilteredPayments(res.data);
          calculateStats(res.data);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const calculateStats = (data: Payment[]) => {
    const totalAmount = data.reduce((sum, p) => {
      return p.paymentStatus === 'paid' ? sum + parseFloat(p.amount) : sum;
    }, 0);

    setStats({
      total: data.length,
      totalAmount: totalAmount,
      paid: data.filter(p => p.paymentStatus === 'paid').length,
      pending: data.filter(p => p.paymentStatus === 'pending').length,
      failed: data.filter(p => p.paymentStatus === 'failed').length,
      refunded: data.filter(p => p.paymentStatus === 'refunded').length,
    });
  };

  useEffect(() => {
    let filtered = payments;

    if (search) {
      filtered = filtered.filter(p =>
        p.paymentId.toString().includes(search) ||
        p.orderId.toString().includes(search) ||
        (p.transactionReference && p.transactionReference.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.paymentStatus === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [search, statusFilter, payments]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    setDeleting(id);
    try {
      const res = await paymentsAPI.delete(id);
      if (res.success) {
        const updated = payments.filter(p => p.paymentId !== id);
        setPayments(updated);
        calculateStats(updated);
      } else {
        alert('Failed to delete payment');
      }
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      alert(error.response?.data?.message || 'Failed to delete payment');
    } finally {
      setDeleting(null);
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      paid: 'status-paid',
      failed: 'status-failed',
      refunded: 'status-refunded',
    };
    return classes[status] || 'status-pending';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      paid: '✅',
      failed: '❌',
      refunded: '↩️',
    };
    return icons[status] || '📊';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="page-loading">Loading payments</div>;
  }

  return (
    <div className="payments-page">
      <div className="page-header">
        <h2>Payments</h2>
        <div className="page-actions">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Payment ID, Order ID, or Transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-wrapper">
            <Filter size={16} className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <button className="btn-export" title="Export Payments">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="payments-stats-grid">
        <div className="stat-card total">
          <span className="stat-icon">💰</span>
          <div className="stat-info">
            <span className="stat-value">KSh {stats.totalAmount.toLocaleString()}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
        <div className="stat-card paid">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{stats.paid}</span>
            <span className="stat-label">Paid</span>
          </div>
        </div>
        <div className="stat-card pending">
          <span className="stat-icon">⏳</span>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card failed">
          <span className="stat-icon">❌</span>
          <div className="stat-info">
            <span className="stat-value">{stats.failed}</span>
            <span className="stat-label">Failed</span>
          </div>
        </div>
        <div className="stat-card refunded">
          <span className="stat-icon">↩️</span>
          <div className="stat-info">
            <span className="stat-value">{stats.refunded}</span>
            <span className="stat-label">Refunded</span>
          </div>
        </div>
        <div className="stat-card total">
          <span className="stat-icon">📊</span>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Payments</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Order Ref</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  {search || statusFilter !== 'all'
                    ? 'No payments match your filters'
                    : 'No payments found'}
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.paymentId}>
                  <td className="payment-id">#{payment.paymentId}</td>
                  <td className="order-ref">#{payment.orderId}</td>
                  <td className="payment-amount">
                    KSh {parseFloat(payment.amount).toLocaleString()}
                  </td>
                  <td>
                    <span className="method-badge method-mpesa">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(payment.paymentStatus)}`}>
                      {getStatusIcon(payment.paymentStatus)} {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="payment-date">{formatDate(payment.createdAt)}</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewDetails(payment)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(payment.paymentId)}
                      disabled={deleting === payment.paymentId}
                      title="Delete Payment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-item">
                  <span className="modal-label">Payment ID</span>
                  <span className="modal-value">#{selectedPayment.paymentId}</span>
                </div>
                <div className="modal-item">
                  <span className="modal-label">Order ID</span>
                  <span className="modal-value">#{selectedPayment.orderId}</span>
                </div>
                <div className="modal-item">
                  <span className="modal-label">Amount</span>
                  <span className="modal-value">KSh {parseFloat(selectedPayment.amount).toLocaleString()}</span>
                </div>
                <div className="modal-item">
                  <span className="modal-label">Method</span>
                  <span className="modal-value method-mpesa">{selectedPayment.paymentMethod}</span>
                </div>
                <div className="modal-item">
                  <span className="modal-label">Status</span>
                  <span className={`modal-status ${getStatusBadgeClass(selectedPayment.paymentStatus)}`}>
                    {selectedPayment.paymentStatus}
                  </span>
                </div>
                <div className="modal-item">
                  <span className="modal-label">Date</span>
                  <span className="modal-value">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                {selectedPayment.transactionReference && (
                  <div className="modal-item full-width">
                    <span className="modal-label">Transaction Reference</span>
                    <span className="modal-value transaction-ref">{selectedPayment.transactionReference}</span>
                  </div>
                )}
                {selectedPayment.mpesaReceiptNumber && (
                  <div className="modal-item full-width">
                    <span className="modal-label">M-Pesa Receipt</span>
                    <span className="modal-value">{selectedPayment.mpesaReceiptNumber}</span>
                  </div>
                )}
                {selectedPayment.mpesaPhoneNumber && (
                  <div className="modal-item">
                    <span className="modal-label">Phone Number</span>
                    <span className="modal-value">{selectedPayment.mpesaPhoneNumber}</span>
                  </div>
                )}
                {selectedPayment.paymentResponse && (
                  <div className="modal-item full-width">
                    <span className="modal-label">Response</span>
                    <span className="modal-value response-text">
                      {JSON.stringify(selectedPayment.paymentResponse, null, 2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}