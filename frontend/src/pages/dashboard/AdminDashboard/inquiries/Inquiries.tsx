import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Reply, CheckCircle, Mail, Phone, User, Calendar, X } from 'lucide-react';
import { inquiriesAPI, type Inquiry } from '../../../../Features/inquiries/inquiriesAPI';
import { useAuth } from '../../../../context/AuthContext';
import './Inquiries.css';

type StatusFilter = 'all' | 'unread' | 'read' | 'replied' | 'resolved';

export default function Inquiries() {
  useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await inquiriesAPI.getAll();
      if (res.success) setInquiries(res.data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      showToast('error', 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredInquiries = useMemo(() => {
    let filtered = inquiries;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(i => i.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.phone && i.phone.includes(q)) ||
        (i.subject && i.subject.toLowerCase().includes(q)) ||
        i.message.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [inquiries, filterStatus, searchQuery]);

  const handleMarkRead = async (id: number) => {
    try {
      const res = await inquiriesAPI.markRead(id);
      if (res.success) {
        setInquiries(inquiries.map(i => i.inquiryId === id ? { ...i, status: 'read' } : i));
        showToast('success', 'Inquiry marked as read');
      }
    } catch (error) {
      console.error('Error marking inquiry as read:', error);
      showToast('error', 'Failed to mark as read');
    }
  };

  const handleMarkResolved = async (id: number) => {
    try {
      const res = await inquiriesAPI.markResolved(id);
      if (res.success) {
        setInquiries(inquiries.map(i => i.inquiryId === id ? { ...i, status: 'resolved' } : i));
        showToast('success', 'Inquiry marked as resolved');
      }
    } catch (error) {
      console.error('Error marking inquiry as resolved:', error);
      showToast('error', 'Failed to mark as resolved');
    }
  };

  const handleReply = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyMessage('');
    setReplyModalOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) return;
    setSubmitting(true);
    try {
      const res = await inquiriesAPI.reply(selectedInquiry.inquiryId, replyMessage);
      if (res.success) {
        setInquiries(inquiries.map(i =>
          i.inquiryId === selectedInquiry.inquiryId
            ? { ...i, status: 'replied', adminResponse: replyMessage }
            : i
        ));
        showToast('success', 'Reply sent successfully');
        setReplyModalOpen(false);
        setSelectedInquiry(null);
        setReplyMessage('');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      showToast('error', 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      unread: '📩',
      read: '📖',
      replied: '✉️',
      resolved: '✅',
    };
    return icons[status] || '📩';
  };

  const getUnreadCount = () => {
    return inquiries.filter(i => i.status === 'unread').length;
  };

  if (loading) {
    return (
      <div className="inquiries-loading">
        <div className="inquiries-loader"></div>
        <p>Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div className="inquiries-page">
      {toast && (
        <div className={`inquiries-toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className="inquiries-header">
        <div>
          <h2>Customer Inquiries</h2>
          <p className="inquiries-subtitle">
            {getUnreadCount() > 0 ? (
              <span className="unread-badge">{getUnreadCount()} unread</span>
            ) : (
              'All inquiries are up to date'
            )}
          </p>
        </div>
      </div>

      <div className="inquiries-filters">
        <div className="inquiries-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="inquiries-filter">
          <Filter size={16} className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="inquiries-list">
        {filteredInquiries.length === 0 ? (
          <div className="inquiries-empty">
            <span>📭</span>
            <p>No inquiries match your criteria</p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <div key={inquiry.inquiryId} className={`inquiry-card status-${inquiry.status}`}>
              <div className="inquiry-card-header">
                <div className="inquiry-sender">
                  <div className="inquiry-name">
                    <User size={14} />
                    <span>{inquiry.name}</span>
                  </div>
                  <div className="inquiry-email">
                    <Mail size={12} />
                    <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                  </div>
                  {inquiry.phone && (
                    <div className="inquiry-phone">
                      <Phone size={12} />
                      <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>
                    </div>
                  )}
                </div>
                <div className="inquiry-meta">
                  <span className={`status-badge status-${inquiry.status}`}>
                    {getStatusIcon(inquiry.status)} {inquiry.status}
                  </span>
                  <span className="inquiry-date">
                    <Calendar size={12} />
                    {new Date(inquiry.createdAt).toLocaleString('en-KE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {inquiry.subject && (
                <h4 className="inquiry-subject">{inquiry.subject}</h4>
              )}
              <p className="inquiry-message">{inquiry.message}</p>

              {inquiry.adminResponse && (
                <div className="inquiry-response">
                  <strong>Admin Response:</strong>
                  <p>{inquiry.adminResponse}</p>
                  {inquiry.respondedAt && (
                    <span className="response-date">
                      Responded: {new Date(inquiry.respondedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              <div className="inquiry-card-footer">
                <div className="inquiry-actions">
                  {inquiry.status === 'unread' && (
                    <button
                      className="btn-read"
                      onClick={() => handleMarkRead(inquiry.inquiryId)}
                    >
                      <Mail size={14} /> Mark as Read
                    </button>
                  )}
                  {inquiry.status !== 'resolved' && inquiry.status !== 'replied' && (
                    <button
                      className="btn-reply"
                      onClick={() => handleReply(inquiry)}
                    >
                      <Reply size={14} /> Reply
                    </button>
                  )}
                  {inquiry.status !== 'resolved' && (
                    <button
                      className="btn-resolve"
                      onClick={() => handleMarkResolved(inquiry.inquiryId)}
                    >
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                </div>
                {inquiry.status === 'resolved' && (
                  <span className="resolved-badge">✓ Resolved</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {replyModalOpen && selectedInquiry && (
        <div className="modal-overlay" onClick={() => setReplyModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reply to Inquiry</h3>
              <button className="modal-close" onClick={() => setReplyModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="reply-info">
                <p><strong>From:</strong> {selectedInquiry.name}</p>
                <p><strong>Email:</strong> {selectedInquiry.email}</p>
                {selectedInquiry.subject && <p><strong>Subject:</strong> {selectedInquiry.subject}</p>}
                <p><strong>Message:</strong></p>
                <blockquote>{selectedInquiry.message}</blockquote>
              </div>
              <div className="reply-input-group">
                <label className="form-label">Your Reply</label>
                <textarea
                  className="reply-textarea"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  rows={5}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setReplyModalOpen(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleSubmitReply}
                disabled={submitting || !replyMessage.trim()}
              >
                {submitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}