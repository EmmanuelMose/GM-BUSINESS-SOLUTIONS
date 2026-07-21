import { useState, useEffect } from 'react';
import { inquiriesAPI, type Inquiry } from '../../../../Features/inquiries/inquiriesAPI';
import './ViewInquiries.css';

export default function ViewInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const res = await inquiriesAPI.getAll();
        if (res.success) setInquiries(res.data);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      const res = await inquiriesAPI.markRead(id);
      if (res.success) {
        setInquiries(inquiries.map(i => i.inquiryId === id ? { ...i, status: 'read' } : i));
      }
    } catch (error) {
      console.error('Error marking inquiry as read:', error);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading inquiries...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>View Inquiries</h2>
      </div>

      <div className="inquiries-list">
        {inquiries.length === 0 ? (
          <div className="empty-state">No inquiries found</div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.inquiryId} className={`inquiry-card ${inquiry.status === 'unread' ? 'unread' : ''}`}>
              <div className="inquiry-header">
                <div className="inquiry-sender">
                  <span className="inquiry-name">{inquiry.name}</span>
                  <span className="inquiry-email">{inquiry.email}</span>
                </div>
                <div className="inquiry-meta">
                  <span className={`status-badge status-${inquiry.status}`}>
                    {inquiry.status}
                  </span>
                  <span className="inquiry-date">{new Date(inquiry.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <p className="inquiry-message">{inquiry.message}</p>
              {inquiry.phone && <p className="inquiry-phone">📞 {inquiry.phone}</p>}
              {inquiry.status === 'unread' && (
                <div className="inquiry-actions">
                  <button className="mark-read-btn" onClick={() => handleMarkRead(inquiry.inquiryId)}>
                    Mark as Read
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}