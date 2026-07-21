import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { inquiriesAPI } from '../../Features/inquiries/inquiriesAPI';
import './AccountContent.css';

const TABS = [
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'location', label: 'Store Location', icon: '📍' },
  { id: 'policy', label: 'Delivery & Pickup', icon: '🚚' },
  { id: 'support', label: 'Support & Contact', icon: '💬' },
];

export default function AccountContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<{ success: boolean; message: string }>({ success: false, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const setTab = (tab: string) => setSearchParams({ tab });

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setSubmitting(true);
    try {
      const res = await inquiriesAPI.create({
          name: contactName, email: contactEmail, message: contactMessage,
          productId: null,
          phone: null,
          subject: null
      });
      setContactStatus({ success: true, message: res.message || 'Thank you! Your message has been sent.' });
      setContactName(''); setContactEmail(''); setContactMessage('');
    } catch (error: any) {
      setContactStatus({ success: false, message: error.message || 'Failed to send.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="account-content">
      <div className="container">
        <div className="account-grid">
          <aside className="account-sidebar">
            <h2 className="account-sidebar-title">My Account</h2>
            <nav className="account-nav">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setTab(tab.id)} className={`account-nav-item ${activeTab === tab.id ? 'active' : ''}`}>
                  <span className="account-nav-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="account-main">
            {activeTab === 'orders' && (
              <section>
                <div className="account-section-header">
                  <h2 className="account-section-title">Track Orders</h2>
                  <p className="account-section-sub">Review the status of your current and past orders.</p>
                </div>
                <div className="account-empty">
                  <div className="account-empty-icon">📦</div>
                  <p className="account-empty-text">You have no active orders placed under this session.</p>
                  <p className="account-empty-sub">For enquiries regarding an M-Pesa order, please call us directly.</p>
                  <Link to="/" className="btn-primary account-empty-btn">Start Shopping</Link>
                </div>
              </section>
            )}

            {activeTab === 'location' && (
              <section>
                <div className="account-section-header">
                  <h2 className="account-section-title">Store Location (Kakamega)</h2>
                  <p className="account-section-sub">Visit our retail shop for physical support, browsing, or order pickup.</p>
                </div>
                <div className="account-location-grid">
                  <div className="account-card">
                    <h3 className="account-card-title">Address</h3>
                    <p className="account-card-text">Naoja Ventures<br />Lurambi, Kakamega Town<br />Opposite Bamboo Hotel / Lounge<br />Kenya</p>
                    <div className="account-card-contact"><p className="account-label">Contact Info</p><p className="account-card-text">Phone: <strong>0704812343</strong></p></div>
                  </div>
                  <div className="account-card">
                    <h3 className="account-card-title">Shop Working Hours</h3>
                    <div className="account-hours">
                      <p><span>Sunday - Thursday:</span> <strong>8:30 AM - 8:00 PM</strong></p>
                      <p><span>Friday:</span> <strong>8:30 AM - 3:00 PM</strong></p>
                      <p className="account-hours-closed"><span>Saturday:</span> <strong>Closed</strong></p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'policy' && (
              <section>
                <div className="account-section-header">
                  <h2 className="account-section-title">Fulfillment Policy</h2>
                  <p className="account-section-sub">Review rates, timings, and instructions for deliveries and pickups.</p>
                </div>
                <div className="account-location-grid">
                  <div className="account-card">
                    <div className="account-policy-icon"><span>🚚</span><h3>Delivery Information</h3></div>
                    <ul className="account-policy-list">
                      <li>• We deliver within Kakamega town and surrounding neighborhoods (Lurambi, Kefinco, Amalemba, Joyland, Milimani).</li>
                      <li>• Delivery fee is flat <strong>KSh 150</strong>. Orders <strong>above KSh 600</strong> qualify for <strong>Free Delivery</strong>.</li>
                      <li>• Delivery hours: Sunday-Friday, 8:30 AM - 4:00 PM.</li>
                      <li>• Orders before 4:00 PM are delivered same-day. Orders after 4:00 PM go out the next morning.</li>
                    </ul>
                  </div>
                  <div className="account-card">
                    <div className="account-policy-icon"><span>📍</span><h3>Store Pickups</h3></div>
                    <ul className="account-policy-list">
                      <li>• You can place an order and pick it up physically from our Lurambi store opposite Bamboo.</li>
                      <li>• Pickups are ready within <strong>1 to 2 hours</strong> of ordering during business hours.</li>
                      <li>• Pickup is completely free of charge.</li>
                      <li>• Please bring your order name and M-Pesa reference message to the counter for verification.</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'support' && (
              <section>
                <div className="account-section-header">
                  <h2 className="account-section-title">Support &amp; Inquiries</h2>
                  <p className="account-section-sub">Contact us regarding orders, brand partnerships, or general technical support.</p>
                </div>
                <div className="account-support-grid">
                  <div className="account-support-left">
                    <div className="account-support-box">
                      <h4 className="account-support-box-title">Direct Support lines</h4>
                      <p className="account-support-box-sub">Our phone support is open 8:30am-8:00pm (Sunday-Thursday).</p>
                      <div className="account-support-links">
                        <p>📞 Phone: <a href="tel:0704812343" className="account-support-link">0704812343</a></p>
                        <p>💬 WhatsApp: <a href="https://wa.me/254704812343" target="_blank" rel="noopener noreferrer" className="account-support-link">0704812343</a></p>
                        <p>✉️ Email: <a href="mailto:enquiries@naojaventures.com" className="account-support-link">enquiries@naojaventures.com</a></p>
                      </div>
                    </div>
                    <div className="account-support-box">
                      <h4 className="account-support-box-title">Warranty Policy</h4>
                      <p className="account-support-box-sub">All electrical supplies (cables, breakers, solar) and electronics sold at Naoja Ventures have official manufacturer warranties. Please retain invoice receipts for verification.</p>
                    </div>
                  </div>
                  <div className="account-form">
                    <h3 className="account-form-title">Send an Inquiry</h3>
                    <p className="account-form-sub">Have a question or request? Send us a message and we'll reply via email.</p>
                    {contactStatus.message && (
                      <div className={`account-status ${contactStatus.success ? 'success' : 'error'}`}>
                        {contactStatus.success && <span className="account-status-icon">✓</span>}
                        <span>{contactStatus.message}</span>
                      </div>
                    )}
                    <form onSubmit={handleContact} className="account-form-group">
                      <div className="account-form-row">
                        <div><label className="account-label">Your Name</label><input type="text" required className="account-input" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Enter your name" /></div>
                        <div><label className="account-label">Email Address</label><input type="email" required className="account-input" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="name@example.com" /></div>
                      </div>
                      <div><label className="account-label">Message</label><textarea rows={4} required className="account-textarea" value={contactMessage} onChange={e => setContactMessage(e.target.value)} placeholder="How can we help you?" /></div>
                      <button type="submit" className="btn-primary btn-full" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
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