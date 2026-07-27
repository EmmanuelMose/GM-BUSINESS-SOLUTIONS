import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { ordersAPI } from '../Features/orders/ordersAPI';
import { pickupStationsAPI } from '../Features/pickupStations/pickupStationsAPI';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OrderTrackingPage.css';

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const refParam = searchParams.get('ref');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orderRef, setOrderRef] = useState(refParam || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState(false);
  const [pickupStation, setPickupStation] = useState<any>(null);
  const [pickupLocation, setPickupLocation] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=track-order');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (refParam && isAuthenticated) {
      handleTrackOrder(refParam);
    }
  }, [refParam, isAuthenticated]);

  const handleTrackOrder = async (ref: string) => {
    setLoading(true);
    setError('');
    setTracked(false);
    setOrder(null);

    try {
      const res = await ordersAPI.getByUserAndRef(ref.trim());
      if (res.success) {
        setOrder(res.data);
        setTracked(true);
        
        if (res.data.pickupLocationId) {
          try {
            const stationRes = await pickupStationsAPI.getStationById(res.data.pickupLocationId);
            if (stationRes.success) {
              setPickupStation(stationRes.data);
            }
          } catch (err) {
            console.error('Error fetching pickup station:', err);
          }
        }
        
        if (res.data.pickupLocationId) {
          try {
            const locRes = await pickupStationsAPI.getLocationById(res.data.pickupLocationId);
            if (locRes.success) {
              setPickupLocation(locRes.data);
            }
          } catch (err) {
            console.error('Error fetching pickup location:', err);
          }
        }
      } else {
        setError('Order not found. Please check your order reference.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRef.trim()) {
      setError('Please enter an order reference');
      return;
    }
    handleTrackOrder(orderRef.trim());
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Order Placed',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#16a34a',
      cancelled: '#dc2626',
      refunded: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="tracking-page">
        <div className="container">
          <div className="tracking-header">
            <h1 className="tracking-title">Track Your Order</h1>
            <p className="tracking-subtitle">Enter your order reference to track its status</p>
          </div>

          <div className="tracking-form-container">
            <form onSubmit={handleSubmit} className="tracking-form">
              <div className="tracking-input-group">
                <input
                  type="text"
                  className="tracking-input"
                  placeholder="Enter order reference (e.g., NJ-2026-0001)"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                />
                <button type="submit" className="tracking-btn" disabled={loading}>
                  {loading ? 'Tracking...' : 'Track Order'}
                </button>
              </div>
              {error && <div className="tracking-error">{error}</div>}
            </form>
          </div>

          {tracked && order && (
            <div className="tracking-result fade-in">
              <div className="tracking-order-header">
                <div>
                  <h2 className="tracking-order-ref">Order #{order.orderRef}</h2>
                  <p className="tracking-order-date">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-KE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="tracking-order-status">
                  <span 
                    className="tracking-status-badge"
                    style={{ background: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="tracking-progress">
                {statusSteps.map((step, idx) => {
                  const currentIdx = getStatusStep(order.status);
                  const isActive = idx <= currentIdx;
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <div key={step} className="tracking-progress-step">
                      <div 
                        className={`tracking-progress-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <div className="tracking-progress-content">
                        <span className="tracking-progress-label">{getStatusLabel(step)}</span>
                        {isCurrent && !isCancelled && (
                          <span className="tracking-progress-current">Current</span>
                        )}
                        {isCancelled && step === 'pending' && (
                          <span className="tracking-progress-cancelled">Cancelled</span>
                        )}
                      </div>
                      {idx < statusSteps.length - 1 && (
                        <div className={`tracking-progress-line ${isActive ? 'active' : ''}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {order.status === 'cancelled' && (
                <div className="tracking-cancelled-message">
                  <span>⚠️</span>
                  <p>This order has been cancelled.</p>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="tracking-delivered-message">
                  <span>✅</span>
                  <p>Your order has been delivered successfully!</p>
                </div>
              )}

              <div className="tracking-order-details">
                <div className="tracking-details-grid">
                  <div className="tracking-detail-item">
                    <span className="tracking-detail-label">Total Amount</span>
                    <span className="tracking-detail-value">KSh {parseFloat(order.total).toLocaleString()}</span>
                  </div>
                  <div className="tracking-detail-item">
                    <span className="tracking-detail-label">Payment Status</span>
                    <span className={`tracking-detail-value tracking-payment-${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="tracking-detail-item">
                    <span className="tracking-detail-label">Items</span>
                    <span className="tracking-detail-value">{order.items?.length || 0}</span>
                  </div>
                </div>
              </div>

              {(pickupStation || pickupLocation) && (
                <div className="tracking-pickup-info">
                  <h3 className="tracking-pickup-title">📍 Pickup Information</h3>
                  <div className="tracking-pickup-details">
                    {pickupStation && (
                      <div className="tracking-pickup-item">
                        <strong>Station:</strong> {pickupStation.name}
                        <p>{pickupStation.address}</p>
                        <p>{pickupStation.town}, {pickupStation.county}</p>
                        {pickupStation.phone && <p>📞 {pickupStation.phone}</p>}
                      </div>
                    )}
                    {pickupLocation && (
                      <div className="tracking-pickup-item">
                        <strong>Location:</strong> {pickupLocation.name}
                        <p>{pickupLocation.address}</p>
                        {pickupLocation.landmark && <p>Landmark: {pickupLocation.landmark}</p>}
                        {pickupLocation.phone && <p>📞 {pickupLocation.phone}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order.items && order.items.length > 0 && (
                <div className="tracking-items">
                  <h3 className="tracking-items-title">Order Items</h3>
                  <div className="tracking-items-list">
                    {order.items.map((item: any) => (
                      <div key={item.orderItemId} className="tracking-item">
                        <div className="tracking-item-info">
                          <span className="tracking-item-name">{item.productName}</span>
                          <span className="tracking-item-qty">× {item.quantity}</span>
                        </div>
                        <span className="tracking-item-price">KSh {parseFloat(item.total).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="tracking-help">
                <p>Need help with your order?</p>
                <Link to="/account?tab=support" className="tracking-help-link">Contact Support</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}