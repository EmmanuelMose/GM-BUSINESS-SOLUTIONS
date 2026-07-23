import { useState, useEffect } from 'react';
import { paymentsAPI, type Payment } from '../../../../Features/payments/paymentsAPI';
import './Payments.css';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await paymentsAPI.getAll();
        if (res.success) setPayments(res.data);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading payments...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Payments</h2>
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
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">No payments found</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.paymentId}>
                  <td>{payment.paymentId}</td>
                  <td className="order-ref">#{payment.orderId}</td>
                  <td className="amount">KSh {parseFloat(payment.amount).toLocaleString()}</td>
                  <td>
                    <span className="method-badge method-mpesa">{payment.paymentMethod}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${payment.paymentStatus}`}>{payment.paymentStatus}</span>
                  </td>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}