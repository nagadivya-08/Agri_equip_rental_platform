const ReviewsList = ({ reviews = [], averageRating = 0, count = 0 }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return (
      <span className="stars-display" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= rating ? 'star-lit' : 'star-dim'}>
            ★
          </span>
        ))}
      </span>
    );
  };

  return (
    <div className="reviews-section-card">
      <div className="reviews-header-bar">
        <h3>User Ratings & Verified Reviews</h3>
        {count > 0 && (
          <div className="rating-summary-pill">
            <span className="rating-num-big">★ {averageRating}</span>
            <span className="rating-count-term">({count} {count === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="reviews-empty-state">
          <span className="empty-reviews-icon">💬</span>
          <p>No reviews submitted for this machinery yet.</p>
          <span className="empty-reviews-hint">
            Renters who complete a booking can rate and leave feedback here.
          </span>
        </div>
      ) : (
        <div className="reviews-items-container">
          {reviews.map((rev) => (
            <div key={rev._id} className="review-single-card">
              <div className="review-top-meta">
                <div className="reviewer-info">
                  <span className="reviewer-avatar">
                    👤
                  </span>
                  <div>
                    <strong className="reviewer-name">
                      {rev.reviewerId?.name || 'Verified Farmer'}
                    </strong>
                    <span className="review-post-date">{formatDate(rev.createdAt)}</span>
                  </div>
                </div>
                <div className="review-stars-box">
                  {renderStars(rev.rating)}
                  <span className="rating-digit">({rev.rating}/5)</span>
                </div>
              </div>

              {rev.comment ? (
                <p className="review-comment-body">"{rev.comment}"</p>
              ) : (
                <p className="review-comment-empty">No written comment provided.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
