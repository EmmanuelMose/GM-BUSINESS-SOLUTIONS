
import { useState, useEffect } from 'react';
import { Eye, Trash2, Filter } from 'lucide-react';
import { ordersAPI, type Order } from '../../../../Features/orders/ordersAPI';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await ordersAPI.getAll();
        if (res.success) setOrders(res.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await ordersAPI.delete(id);
      if (res.success) {
        setOrders(orders.filter(o => o.orderId !== id));
      } else {
        alert('Failed to delete order');
      }
    } catch (error: any) {
      console.error('Error deleting order:', error);
      alert(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await ordersAPI.updateStatus(id, status as any);
      if (res.success) {
        setOrders(orders.map(o => o.orderId === id ? { ...o, status: status as any } : o));
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return <div className="page-loading">Loading orders</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Orders</h2>
        <div className="page-actions">
          <div className="filter-wrapper">
            <Filter size={16} className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  {filter === 'all' ? 'No orders found' : `No ${filter} orders found`}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td className="order-ref">{order.orderRef}</td>
                  <td>{order.guestEmail || order.userId || 'Guest'}</td>
                  <td className="order-total">KSh {parseFloat(order.total).toLocaleString()}</td>
                  <td>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                      className={`status-select status-${order.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge status-${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="action-btn view" title="View Order">
                      <Eye size={16} />
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(order.orderId)}
                      disabled={deleting === order.orderId}
                      title="Delete Order"
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
    </div>
  );
}