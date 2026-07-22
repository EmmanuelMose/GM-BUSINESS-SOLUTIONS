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

            // Only show modified support tab section
{activeTab === "support" && (
  <section>
    <div className="account-section-header">
      <h2 className="account-section-title">Support & Inquiries</h2>
      <p className="account-section-sub">Contact us regarding orders, partnerships, or technical support.</p>
    </div>
    <div className="account-support-grid">
      <div className="account-support-left">
        <div className="account-support-box">
          <h4>Direct Support</h4>
          <div className="account-support-links">
            <p>📞 Phone: <a href="tel:0704812343" className="account-support-link">0704812343</a></p>
            <p>💬 WhatsApp: <a href="https://wa.me/254704812343" target="_blank" rel="noopener noreferrer" className="account-support-link">0704812343</a></p>
            <p>✉️ Email: <a href="mailto:support@gmnex.com" className="account-support-link">support@gmnex.com</a></p>
          </div>
        </div>
        <div className="account-support-box">
          <h4>Warranty Policy</h4>
          <p>All products have official manufacturer warranties. Keep your receipt for claims.</p>
        </div>
      </div>
      <div className="account-form">
        <h3>Send an Inquiry</h3>
        <form onSubmit={handleContact} className="account-form-group">
          <input type="text" placeholder="Your Name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="account-input" required />
          <input type="email" placeholder="Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="account-input" required />
          <textarea rows={4} placeholder="Message" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="account-textarea" required />
          <button type="submit" className="btn-primary btn-full" disabled={submitting}>{submitting ? "Sending..." : "Send"}</button>
          {contactStatus.message && <div className={`account-status ${contactStatus.success ? "success" : "error"}`}>{contactStatus.message}</div>}
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