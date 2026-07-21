import { useState, useEffect } from 'react';
import { reviewsAPI, type Review } from '../../../../Features/reviews/reviewsAPI';
import './Reviews.css';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await reviewsAPI.getAll();
        if (res.success) setReviews(res.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const res = await reviewsAPI.approve(id);
      if (res.success) {
        setReviews(reviews.map(r => r.reviewId === id ? { ...r, status: 'approved' } : r));
      }
    } catch (error) {
      console.error('Error approving review:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await reviewsAPI.reject(id);
      if (res.success) {
        setReviews(reviews.filter(r => r.reviewId !== id));
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading reviews...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Reviews</h2>
      </div>

      <div className="reviews-grid">
        {reviews.length === 0 ? (
          <div className="empty-state">No reviews found</div>
        ) : (
          reviews.map((review) => (
            <div key={review.reviewId} className="review-card">
              <div className="review-header">
                <div className="review-user">
                  <span className="review-name">{review.user?.fullName || 'Anonymous'}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="review-rating">
                  {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
              <div className="review-footer">
                <span className={`status-badge status-${review.status}`}>
                  {review.status}
                </span>
                {review.status === 'pending' && (
                  <div className="review-actions">
                    <button className="approve-btn" onClick={() => handleApprove(review.reviewId)}>Approve</button>
                    <button className="reject-btn" onClick={() => handleReject(review.reviewId)}>Reject</button>
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