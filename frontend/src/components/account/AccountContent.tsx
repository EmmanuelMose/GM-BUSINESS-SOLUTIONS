import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Menu, X, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { inquiriesAPI } from '../../Features/inquiries/inquiriesAPI';
import { ordersAPI } from '../../Features/orders/ordersAPI';
import { pickupStationsAPI, type PickupStation, type PickupLocation } from '../../Features/pickupStations/pickupStationsAPI';
import ProfileForm from './ProfileForm';
import './AccountContent.css';

const TABS = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'orders', label: 'My Orders', icon: '📦' },
  { id: 'pickup', label: 'Pickup Stations', icon: '📍' },
  { id: 'policy', label: 'Fulfillment Policy', icon: '📋' },
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
  const [pickupStations, setPickupStations] = useState<PickupStation[]>([]);
  const [pickupLocations, setPickupLocations] = useState<Record<number, PickupLocation[]>>({});
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

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

  useEffect(() => {
    if (activeTab === 'pickup') {
      const fetchPickupStations = async () => {
        setLoadingPickup(true);
        try {
          const res = await pickupStationsAPI.getAllStations();
          if (res.success) {
            const activeStations = res.data.filter((s: PickupStation) => s.isActive);
            setPickupStations(activeStations);
            
            const locationsMap: Record<number, PickupLocation[]> = {};
            for (const station of activeStations) {
              const locRes = await pickupStationsAPI.getLocations(station.stationId);
              if (locRes.success) {
                locationsMap[station.stationId] = locRes.data.filter((l: PickupLocation) => l.isActive);
              }
            }
            setPickupLocations(locationsMap);
          }
        } catch (error) {
          console.error('Error fetching pickup stations:', error);
        } finally {
          setLoadingPickup(false);
        }
      };
      fetchPickupStations();
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

  const toggleStationLocations = (stationId: number) => {
    setSelectedStationId(selectedStationId === stationId ? null : stationId);
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
                            <div className="account-order-actions">
                              <Link to={`/track-order?ref=${order.orderRef}`} className="btn-primary account-track-btn">
                                Track Order
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'pickup' && (
              <section className="fade-in">
                <div className="account-section-header">
                  <h2 className="account-section-title">Pickup Stations</h2>
                  <p className="account-section-sub">Find a pickup station near you. All stations are open Sunday - Thursday 8:30 AM - 8:00 PM and Friday 8:30 AM - 3:00 PM.</p>
                </div>
                {loadingPickup ? (
                  <div className="account-loading">Loading pickup stations...</div>
                ) : pickupStations.length === 0 ? (
                  <div className="account-empty">
                    <div className="account-empty-icon">📍</div>
                    <p className="account-empty-text">No pickup stations available</p>
                    <p className="account-empty-sub">Check back later for stations near you.</p>
                  </div>
                ) : (
                  <div className="pickup-stations-grid">
                    {pickupStations.map((station) => (
                      <div key={station.stationId} className="pickup-station-card slide-up">
                        <div className="pickup-station-header" onClick={() => toggleStationLocations(station.stationId)}>
                          <div className="pickup-station-info">
                            <h3 className="pickup-station-name">{station.name}</h3>
                            <p className="pickup-station-location">
                              <MapPin size={14} />
                              {station.town}, {station.county}
                            </p>
                          </div>
                          <button className="pickup-station-expand">
                            {selectedStationId === station.stationId ? '−' : '+'}
                          </button>
                        </div>
                        <div className="pickup-station-details">
                          <div className="pickup-station-address">
                            <p><strong>Address:</strong> {station.address}</p>
                            {station.phone && (
                              <p><Phone size={14} /> <a href={`tel:${station.phone}`}>{station.phone}</a></p>
                            )}
                            {station.email && (
                              <p><Mail size={14} /> <a href={`mailto:${station.email}`}>{station.email}</a></p>
                            )}
                          </div>
                          <div className="pickup-station-hours">
                            <Clock size={14} />
                            <span>Sun - Thu: 8:30 AM - 8:00 PM | Fri: 8:30 AM - 3:00 PM</span>
                          </div>
                          {pickupLocations[station.stationId]?.length > 0 && (
                            <div className={`pickup-station-locations ${selectedStationId === station.stationId ? 'expanded' : ''}`}>
                              <p className="pickup-locations-title">📍 Pickup Locations:</p>
                              {pickupLocations[station.stationId].map((location) => (
                                <div key={location.locationId} className="pickup-location-item">
                                  <div className="pickup-location-info">
                                    <strong>{location.name}</strong>
                                    <p>{location.address}</p>
                                    {location.landmark && <p className="pickup-location-landmark">Landmark: {location.landmark}</p>}
                                    {location.phone && <p>📞 {location.phone}</p>}
                                  </div>
                                  <span className="pickup-location-status active">✓ Available</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'policy' && (
              <section className="fade-in">
                <div className="account-section-header">
                  <h2 className="account-section-title">Fulfillment Policy</h2>
                  <p className="account-section-sub">Everything you need to know about pickup, delivery, returns, and more.</p>
                </div>
                <div className="policy-grid">
                  <div className="policy-card slide-up">
                    <div className="policy-card-header">
                      <span className="policy-icon">📍</span>
                      <h3 className="policy-card-title">Pickup Information</h3>
                    </div>
                    <div className="policy-card-body">
                      <ul className="policy-list">
                        <li><strong>Ready Time:</strong> Orders are ready for pickup within <span className="highlight">1-2 hours</span> during business hours.</li>
                        <li><strong>Cost:</strong> Pickup is <span className="highlight">completely free</span>.</li>
                        <li><strong>What to Bring:</strong> Your order reference number and valid ID.</li>
                        <li><strong>Operating Hours:</strong> Sunday – Thursday 8:30 AM – 8:00 PM, Friday 8:30 AM – 3:00 PM.</li>
                        <li><strong>Closed:</strong> Saturdays and public holidays.</li>
                        <li><strong>Locations:</strong> Over 50 pickup stations across Kenya.</li>
                        <li><strong>Holding Period:</strong> Orders are held for <span className="highlight">7 days</span> from the date of arrival.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="policy-card slide-up">
                    <div className="policy-card-header">
                      <span className="policy-icon">🚚</span>
                      <h3 className="policy-card-title">Delivery Information</h3>
                    </div>
                    <div className="policy-card-body">
                      <ul className="policy-list">
                        <li><strong>Coverage:</strong> Nationwide delivery via our trusted courier partners.</li>
                        <li><strong>Delivery Fees:</strong> <span className="highlight">Free delivery</span> on orders ≥ KSh 600. Standard fee of KSh 150 applies for orders below KSh 600.</li>
                        <li><strong>Same-Day Dispatch:</strong> Orders placed before <span className="highlight">4:00 PM</span> are dispatched same-day.</li>
                        <li><strong>Delivery Time:</strong> 1-3 business days for major towns, 3-5 business days for remote areas.</li>
                        <li><strong>Tracking:</strong> Track your order using your order reference number.</li>
                        <li><strong>Delivery Hours:</strong> Sunday – Thursday 8:30 AM – 4:00 PM, Friday 8:30 AM – 3:00 PM.</li>
                        <li><strong>No Delivery:</strong> Saturdays and public holidays.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="policy-card slide-up">
                    <div className="policy-card-header">
                      <span className="policy-icon">🔄</span>
                      <h3 className="policy-card-title">Returns & Refunds</h3>
                    </div>
                    <div className="policy-card-body">
                      <ul className="policy-list">
                        <li><strong>Return Window:</strong> Returns accepted within <span className="highlight">14 days</span> of purchase.</li>
                        <li><strong>Condition:</strong> Items must be in original condition with all accessories and packaging.</li>
                        <li><strong>Proof of Purchase:</strong> Order confirmation or receipt required.</li>
                        <li><strong>Refund Time:</strong> Refunds processed within <span className="highlight">5-7 business days</span> after return approval.</li>
                        <li><strong>Return Methods:</strong> Return in-person at any pickup station or via courier (at your cost).</li>
                        <li><strong>Non-Returnable Items:</strong> Software, digital products, and opened electronics.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="policy-card slide-up">
                    <div className="policy-card-header">
                      <span className="policy-icon">⚡</span>
                      <h3 className="policy-card-title">Warranty & Support</h3>
                    </div>
                    <div className="policy-card-body">
                      <ul className="policy-list">
                        <li><strong>Warranty Period:</strong> All products come with a <span className="highlight">1-year official manufacturer warranty</span>.</li>
                        <li><strong>Coverage:</strong> Manufacturing defects, battery issues, and software faults.</li>
                        <li><strong>Not Covered:</strong> Physical damage, water damage, unauthorized repairs, and accessories.</li>
                        <li><strong>Warranty Claim:</strong> Visit any pickup station with your product and proof of purchase.</li>
                        <li><strong>Support Hours:</strong> Sunday – Thursday 8:30 AM – 8:00 PM.</li>
                        <li><strong>Contact:</strong> Call <a href="tel:0704812343" className="policy-link">0704 812 343</a> or email <a href="mailto:support@gmnex.com" className="policy-link">support@gmnex.com</a></li>
                      </ul>
                    </div>
                  </div>

                  <div className="policy-card slide-up">
                    <div className="policy-card-header">
                      <span className="policy-icon">💳</span>
                      <h3 className="policy-card-title">Payment Methods</h3>
                    </div>
                    <div className="policy-card-body">
                      <ul className="policy-list">
                        <li><span className="highlight">M-Pesa</span> – Till Number: <strong>4149288</strong></li>
                        <li><span className="highlight">Visa</span> – All major credit and debit cards accepted.</li>
                        <li><span className="highlight">Airtel Money</span> – Pay conveniently with Airtel Money.</li>
                        <li><strong>Secure Payments:</strong> All transactions are encrypted and secure.</li>
                        <li><strong>Payment Confirmation:</strong> You'll receive a confirmation email after successful payment.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="policy-card slide-up">
                    <div className="policy-card-header">
                      <span className="policy-icon">❓</span>
                      <h3 className="policy-card-title">Frequently Asked Questions</h3>
                    </div>
                    <div className="policy-card-body">
                      <ul className="policy-list">
                        <li><strong>Can I change my pickup station after ordering?</strong> Yes, contact support within 2 hours of placing your order.</li>
                        <li><strong>What if I miss my pickup time?</strong> Your order will be held for 7 days. Contact support to reschedule.</li>
                        <li><strong>Do you deliver outside Kenya?</strong> Currently, we only deliver within Kenya.</li>
                        <li><strong>How do I track my order?</strong> Use the "Track Order" button in your Account → My Orders.</li>
                        <li><strong>Can I cancel my order?</strong> Yes, if the order hasn't been processed yet. Contact support immediately.</li>
                        <li><strong>What if I receive a faulty product?</strong> Contact support within 24 hours for a replacement or repair.</li>
                      </ul>
                    </div>
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
                        <p>📞 <a href="tel:0704812343" className="account-support-link">0704 812 343</a></p>
                        <p>💬 <a href="https://wa.me/254704812343" target="_blank" rel="noopener noreferrer" className="account-support-link">0704 812 343</a></p>
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