import { useState } from 'react';
import api from '../api/axios';

const ReviewForm = ({ booking, onSuccess, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/reviews', {
        bookingId: booking._id,
        rating,
        comment,
      });

      if (onSuccess) {
        onSuccess(res.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit your review. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const equipName = booking.equipmentId?.name || 'Equipment';

  return (
    <div className="modal-backdrop">
      <div className="modal-box review-modal-box">
        <div className="modal-header">
          <h3>⭐ Leave a Review</h3>
          {onCancel && (
            <button onClick={onCancel} className="modal-close-btn" type="button">
              ✕
            </button>
          )}
        </div>

        <p className="review-target-subtitle">
          Share your experience for <strong>{equipName}</strong>
        </p>

        {error && <div className="notice-banner warning-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="review-form">
          <div className="star-rating-picker">
            <label className="rating-label">Rating:</label>
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${isFilled ? 'star-filled' : 'star-empty'}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                );
              })}
              <span className="rating-text-hint">
                {rating === 5 && 'Outstanding (5/5)'}
                {rating === 4 && 'Very Good (4/5)'}
                {rating === 3 && 'Average (3/5)'}
                {rating === 2 && 'Below Expectations (2/5)'}
                {rating === 1 && 'Poor (1/5)'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="review-comment">Comments & Feedback:</label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the equipment condition, performance, and communication?"
              className="form-textarea"
            />
          </div>

          <div className="modal-actions">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting Review...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
