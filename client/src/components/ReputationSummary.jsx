import { useState, useEffect } from 'react';
import api from '../api/axios';

const ReputationSummary = ({
  userId,
  title = '⭐ Owner Reputation & Reviews',
  subtitle = 'Feedback and star ratings submitted by farmers and renters who hired equipment',
  compact = false,
}) => {
  const [data, setData] = useState({
    averageRating: 0,
    count: 0,
    reviews: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (!userId) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    let isMounted = true;
    setData((prev) => ({ ...prev, loading: true, error: '' }));

    api
      .get(`/users/${userId}/reviews`)
      .then((res) => {
        if (!isMounted) return;
        setData({
          averageRating: res.data?.averageRating || 0,
          count: res.data?.count || 0,
          reviews: res.data?.data || [],
          loading: false,
          error: '',
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load user reputation reviews:', err);
        setData({
          averageRating: 0,
          count: 0,
          reviews: [],
          loading: false,
          error: 'Could not load reviews at this time',
        });
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

    return (
      <span className="stars-cluster" aria-label={`${rating} out of 5 stars`}>
        {'★'.repeat(fullStars)}
        {hasHalf && '½'}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };

  return (
    <div className={`reputation-summary-component ${compact ? 'reputation-compact' : ''} owner-reputation-section`}>
      <div className="reputation-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: compact ? '1.1rem' : '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </h3>
          {subtitle && !compact && (
            <p className="section-desc" style={{ margin: '0.35rem 0 0 0', fontSize: '0.88rem', color: '#94a3b8' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Big Prominent Star Rating Badge */}
        <div className="reputation-summary-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.9rem', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.35)' }}>
          <span className="rep-stars" style={{ fontSize: compact ? '1.15rem' : '1.35rem', fontWeight: 800, color: '#facc15' }}>
            ★ {data.averageRating > 0 ? data.averageRating.toFixed(1) : '0.0'}
          </span>
          <span className="rep-count" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            ({data.count} {data.count === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {data.loading ? (
        <div className="stats-loading" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
          ⏳ Loading reputation feedback...
        </div>
      ) : data.error ? (
        <p className="error-text" style={{ fontSize: '0.85rem', color: '#f87171' }}>{data.error}</p>
      ) : data.reviews.length === 0 ? (
        <div className="empty-reviews-box" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
          <span className="empty-reviews-icon" style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.5rem' }}>🌾</span>
          <p style={{ margin: 0, fontWeight: 500, color: '#e2e8f0' }}>No reviews received yet.</p>
          <small style={{ color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
            {compact
              ? 'This owner has not received renter feedback yet.'
              : 'Once renters complete their equipment rental and submit feedback, their reviews and ratings will be showcased here.'}
          </small>
        </div>
      ) : (
        <div
          className="owner-reviews-list"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            maxHeight: compact ? '260px' : '420px',
            overflowY: 'auto',
            paddingRight: '0.35rem',
          }}
        >
          {data.reviews.map((rev) => (
            <div
              key={rev._id}
              className="owner-review-item-card"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
              }}
            >
              <div className="review-top-line" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <div className="reviewer-info" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#f1f5f9' }}>
                    👤 {rev.reviewerId?.name || 'Verified Renter'}
                  </strong>
                  {rev.equipmentId?.name && (
                    <span
                      className="reviewed-equipment-tag"
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      🚜 {rev.equipmentId.name}
                    </span>
                  )}
                </div>
                <div className="review-rating-stars" style={{ color: '#facc15', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {renderStars(rev.rating)}
                  <span className="rating-numeric" style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.2rem' }}>
                    {rev.rating}/5
                  </span>
                </div>
              </div>

              {rev.comment && (
                <p className="review-comment-text" style={{ margin: '0.35rem 0', fontSize: '0.88rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.45 }}>
                  "{rev.comment}"
                </p>
              )}

              <span className="review-date-tag" style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                {rev.createdAt
                  ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReputationSummary;
