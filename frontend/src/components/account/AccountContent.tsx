// src/components/account/AccountContent.tsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { inquiriesAPI } from '../../Features/inquiries/inquiriesAPI';
import { ordersAPI } from '../../Features/orders/ordersAPI';
import ProfileForm from './ProfileForm';
import './AccountContent.css';

const TABS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'orders', label: 'My Orders', icon: '📦' },
  { id: 'location', label: 'Our Offices', icon: '📍' },
  { id: 'policy', label: 'Fulfillment Policy', icon: '🚚' },
  { id: 'support', label: 'Support', icon: '💬' },
];

export default function AccountContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<{ success: boolean; message: string }>({ success: false, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const res = await ordersAPI.getMyOrders();
          if (res.success) setOrders(res.data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setSubmitting(true);
    try {
      const res = await inquiriesAPI.create({
        name: contactName,
        email: contactEmail,
        message: contactMessage,
        productId: null,
        phone: null,
        subject: null,
      });
      setContactStatus({ success: true, message: res.message || 'Thank you! Your message has been sent.' });
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (error: any) {
      setContactStatus({ success: false, message: error.message || 'Failed to send.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
      refunded: 'status-refunded',
    };
    return classes[status] || 'status-pending';
  };

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  return (
    <div className="account-content">
      <div className="container">
        <div className="account-grid">
          <button 
            className="account-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <aside className={`account-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="account-sidebar-header">
              <h2 className="account-sidebar-title">My Account</h2>
              <button 
                className="account-sidebar-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <nav className="account-nav">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`account-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <span className="account-nav-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="account-main">
            {activeTab === 'profile' && (
              <section className="fade-in">
                <div className="account-section-header">
                  <h2 className="account-section-title">My Profile</h2>
                  <p className="account-section-sub">Update your personal information</p>
                </div>
                <ProfileForm />
              </section>
            )}

            {activeTab === 'orders' && (
              <section className="fade-in">
                <div className="account-section-header">
                  <h2 className="account-section-title">My Orders</h2>
                  <p className="account-section-sub">Track your orders and view their status.</p>
                </div>
                {loadingOrders ? (
                  <div className="account-loading">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="account-empty">
                    <div className="account-empty-icon">📦</div>
                    <p className="account-empty-text">You have no orders yet.</p>
                    <p className="account-empty-sub">Start shopping to see your orders here.</p>
                    <Link to="/" className="btn-primary account-empty-btn">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="account-orders-list">
                    {orders.map((order) => (
                      <div key={order.orderId} className="account-order-card slide-up">
                        <div className="account-order-header" onClick={() => toggleOrderExpand(order.orderId)}>
                          <div className="account-order-ref">
                            <span className="account-order-ref-label">Order</span>
                            <strong>{order.orderRef}</strong>
                          </div>
                          <div className="account-order-meta">
                            <span className="account-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className={`account-order-status ${getStatusBadgeClass(order.status)}`}>
                              {order.status}
                            </span>
                            <button className="account-order-expand">
                              {expandedOrderId === order.orderId ? '−' : '+'}
                            </button>
                          </div>
                        </div>
                        {expandedOrderId === order.orderId && (
                          <div className="account-order-details slide-down">
                            <div className="account-order-progress">
                              {statusSteps.map((step, idx) => {
                                const currentIdx = statusSteps.indexOf(order.status);
                                const isActive = idx <= currentIdx;
                                return (
                                  <div key={step} className="account-progress-step">
                                    <div className={`account-progress-dot ${isActive ? 'active' : ''}`} />
                                    <span className="account-progress-label">{step}</span>
                                    {idx < statusSteps.length - 1 && (
                                      <div className={`account-progress-line ${isActive ? 'active' : ''}`} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="account-order-summary">
                              <p><strong>Total:</strong> KSh {parseFloat(order.total).toLocaleString()}</p>
                              <p><strong>Payment:</strong> {order.paymentStatus}</p>
                              <p><strong>Items:</strong> {order.items?.length || 0}</p>
                              <p><strong>Pickup Station:</strong> {order.pickupStationId ? 'Selected' : 'Not set'}</p>
                            </div>
                            <Link to={`/track-order?ref=${order.orderRef}`} className="btn-primary account-track-btn">
                              Track Order
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'location' && (
              <section className="fade-in">
                <div className="account-section-header">
                  <h2 className="account-section-title">Our Offices Nationwide</h2>
                  <p className="account-section-sub">Visit any of our branches across Kenya.</p>
                </div>
                <div className="account-location-grid">
                  <div className="account-card slide-up">
                    <h3 className="account-card-title">Nairobi</h3>
                    <p className="account-card-text">
                      Moi Avenue, 3rd Floor<br />
                      Opposite Nation Media<br />
                      Nairobi, Kenya
                    </p>
                    <div className="account-card-contact">
                      <p className="account-label">Contact</p>
                      <p className="account-card-text">📞 <strong>0704812343</strong></p>
                    </div>
                  </div>
                  <div className="account-card slide-up">
                    <h3 className="account-card-title">Mombasa</h3>
                    <p className="account-card-text">
                      Moi Avenue, Near Post Office<br />
                      Mombasa CBD, Kenya
                    </p>
                    <div className="account-card-contact">
                      <p className="account-label">Contact</p>
                      <p className="account-card-text">📞 <strong>0704812344</strong></p>
                    </div>
                  </div>
                  <div className="account-card slide-up">
                    <h3 className="account-card-title">Kisumu</h3>
                    <p className="account-card-text">
                      Oginga Odinga Road<br />
                      Opposite Kisumu Hotel<br />
                      Kisumu, Kenya
                    </p>
                    <div className="account-card-contact">
                      <p className="account-label">Contact</p>
                      <p className="account-card-text">📞 <strong>0704812345</strong></p>
                    </div>
                  </div>
                  <div className="account-card slide-up">
                    <h3 className="account-card-title">Working Hours</h3>
                    <div className="account-hours">
                      <p><span>Sunday – Thursday:</span> <strong>8:30 AM – 8:00 PM</strong></p>
                      <p><span>Friday:</span> <strong>8:30 AM – 3:00 PM</strong></p>
                      <p className="account-hours-closed"><span>Saturday:</span> <strong>Closed</strong></p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'policy' && (
              <section className="fade-in">
                <div className="account-section-header">
                  <h2 className="account-section-title">Fulfillment Policy</h2>
                  <p className="account-section-sub">Everything you need to know about pickup and delivery.</p>
                </div>
                <div className="account-location-grid">
                  <div className="account-card slide-up">
                    <div className="account-policy-icon">
                      <span>📍</span>
                      <h3>Pickup</h3>
                    </div>
                    <ul className="account-policy-list">
                      <li>• Pickup from any of our 50+ stations across Kenya.</li>
                      <li>• Orders ready within <strong>1–2 hours</strong> during business hours.</li>
                      <li>• Pickup is <strong>free</strong>.</li>
                      <li>• Bring your order reference and M-Pesa confirmation.</li>
                    </ul>
                  </div>
                  <div className="account-card slide-up">
                    <div className="account-policy-icon">
                      <span>🚚</span>
                      <h3>Delivery</h3>
                    </div>
                    <ul className="account-policy-list">
                      <li>• Nationwide delivery via partner couriers.</li>
                      <li>• Fees vary by location.</li>
                      <li>• Orders before 4:00 PM dispatched same-day.</li>
                      <li>• Track your order with your reference number.</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'support' && (
              <section className="fade-in">
                <div className="account-section-header">
                  <h2 className="account-section-title">Support</h2>
                  <p className="account-section-sub">We're here to help. Reach out anytime.</p>
                </div>
                <div className="account-support-grid">
                  <div className="account-support-left">
                    <div className="account-support-box slide-up">
                      <h4 className="account-support-box-title">Direct Support</h4>
                      <p className="account-support-box-sub">Available 8:30am–8:00pm (Sun–Thu).</p>
                      <div className="account-support-links">
                        <p>📞 <a href="tel:0704812343" className="account-support-link">0704812343</a></p>
                        <p>💬 <a href="https://wa.me/254704812343" target="_blank" rel="noopener noreferrer" className="account-support-link">0704812343</a></p>
                        <p>✉️ <a href="mailto:support@gmnex.com" className="account-support-link">support@gmnex.com</a></p>
                      </div>
                    </div>
                    <div className="account-support-box slide-up">
                      <h4 className="account-support-box-title">Warranty</h4>
                      <p className="account-support-box-sub">All products have official manufacturer warranties. Keep your receipt.</p>
                    </div>
                  </div>
                  <div className="account-form slide-up">
                    <h3 className="account-form-title">Send a Message</h3>
                    <p className="account-form-sub">We'll reply via email within 24 hours.</p>
                    {contactStatus.message && (
                      <div className={`account-status ${contactStatus.success ? 'success' : 'error'}`}>
                        <span>{contactStatus.message}</span>
                      </div>
                    )}
                    <form onSubmit={handleContact} className="account-form-group">
                      <div className="account-form-row">
                        <div>
                          <label className="account-label">Your Name</label>
                          <input
                            type="text"
                            required
                            className="account-input"
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="Enter your name"
                          />
                        </div>
                        <div>
                          <label className="account-label">Email</label>
                          <input
                            type="email"
                            required
                            className="account-input"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="name@example.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="account-label">Message</label>
                        <textarea
                          rows={4}
                          required
                          className="account-textarea"
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="How can we help?"
                        />
                      </div>
                      <button type="submit" className="btn-primary btn-full" disabled={submitting}>
                        {submitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}