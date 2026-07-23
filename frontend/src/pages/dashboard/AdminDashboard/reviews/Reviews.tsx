import { useState, useEffect, useMemo } from 'react';
import { Check, X, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { reviewsAPI, type Review } from '../../../../Features/reviews/reviewsAPI';
import './Reviews.css';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsAPI.getAll();
      if (res.success) setReviews(res.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showToast('error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApprove = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await reviewsAPI.approve(id);
      if (res.success) {
        setReviews(reviews.map(r => r.reviewId === id ? { ...r, status: 'approved' } : r));
        showToast('success', 'Review approved successfully');
      } else {
        showToast('error', 'Failed to approve review');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      showToast('error', 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      const res = await reviewsAPI.reject(id);
      if (res.success) {
        setReviews(reviews.filter(r => r.reviewId !== id));
        showToast('success', 'Review rejected and removed');
      } else {
        showToast('error', 'Failed to reject review');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      showToast('error', 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = useMemo(() => {
    let filtered = reviews;
    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.comment.toLowerCase().includes(q) ||
        (r.user?.fullName?.toLowerCase().includes(q)) ||
        r.title?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [reviews, filter, searchQuery]);

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="reviews-loading">
        <div className="reviews-loader"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="reviews-page">
      {/* Toast notification */}
      {toast && (
        <div className={`reviews-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="reviews-header">
        <div>
          <h2>Customer Reviews</h2>
          <p className="reviews-subtitle">
            {pendingCount > 0 ? (
              <span className="pending-badge">{pendingCount} pending</span>
            ) : (
              'All reviews are moderated'
            )}
          </p>
        </div>
        <div className="reviews-actions">
          <div className="reviews-search">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="reviews-filter">
            <Filter size={16} className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value as StatusFilter)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="reviews-grid">
        {filteredReviews.length === 0 ? (
          <div className="reviews-empty">
            <span>📭</span>
            <p>No reviews match your criteria</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.reviewId} className={`review-card status-${review.status}`}>
              <div className="review-card-header">
                <div className="review-user-info">
                  <span className="review-user-name">{review.user?.fullName || 'Anonymous'}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="review-rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              {review.title && <h4 className="review-title">{review.title}</h4>}
              <p className="review-comment">{review.comment}</p>
              <div className="review-card-footer">
                <span className={`review-status status-${review.status}`}>
                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                </span>
                {review.status === 'pending' && (
                  <div className="review-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(review.reviewId)}
                      disabled={actionLoading === review.reviewId}
                    >
                      {actionLoading === review.reviewId ? '...' : <Check size={16} />} Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleReject(review.reviewId)}
                      disabled={actionLoading === review.reviewId}
                    >
                      {actionLoading === review.reviewId ? '...' : <X size={16} />} Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}