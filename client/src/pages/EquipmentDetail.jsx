import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReviewsList from '../components/ReviewsList';
import { getImageUrl } from '../utils/imageUrl';

const EquipmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReasonCategory, setReportReasonCategory] = useState('Fake listing');
  const [reportCustomReason, setReportCustomReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);

  // Booking & Availability state
  const [availability, setAvailability] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/equipment/${id}`);
      setEquipment(res.data.data);
      if (res.data.data.averageRating !== undefined) {
        setAverageRating(res.data.data.averageRating);
        setReviewsCount(res.data.data.reviewCount || 0);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load equipment details'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await api.get(`/equipment/${id}/availability`);
      setAvailability(res.data.data || []);
    } catch (err) {
      console.error('Failed to load equipment availability:', err);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get(`/equipment/${id}/reviews`);
      setReviews(res.data.data || []);
      setReviewsCount(res.data.count || 0);
      setAverageRating(res.data.averageRating || 0);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
    fetchAvailability();
    fetchReviews();
  }, [fetchDetail, fetchAvailability, fetchReviews]);

  const getFullImageUrl = (path) => {
    return getImageUrl(path);
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const daysCount = calculateDays(startDate, endDate);
  const totalPrice = daysCount * (equipment?.pricePerDay || 0);

  // Build exclusion intervals for react-datepicker from confirmed bookings
  const excludeIntervals = availability.map((item) => ({
    start: new Date(item.startDate),
    end: new Date(item.endDate),
  }));

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setBookingError('Please select both a start date and an end date.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const res = await api.post('/bookings', {
        equipmentId: id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      setBookingSuccess(
        res.data.message || 'Booking request submitted successfully! The owner will review it.'
      );
      setDateRange([null, null]);
      // Refresh availability
      fetchAvailability();
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setBookingError(
          err.response.data.message ||
          'Date conflict: This machine is already reserved or has a pending booking for the selected dates.'
        );
      } else {
        setBookingError(
          err.response?.data?.message ||
          err.message ||
          'Failed to place booking. Please try again.'
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to report this listing.');
      return;
    }

    const finalReason =
      reportReasonCategory === 'Other'
        ? reportCustomReason.trim()
        : reportReasonCategory + (reportCustomReason.trim() ? `: ${reportCustomReason.trim()}` : '');

    if (!finalReason) {
      alert('Please provide a reason for the report.');
      return;
    }

    setSubmittingReport(true);
    setReportMessage(null);

    try {
      await api.post('/reports', {
        listingId: id,
        reason: finalReason,
      });

      setReportMessage({
        type: 'success',
        text: 'Listing reported. Our moderation team will inspect this equipment.',
      });
      setTimeout(() => {
        setShowReportModal(false);
        setReportCustomReason('');
        setReportMessage(null);
      }, 2500);
    } catch (err) {
      setReportMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit report.',
      });
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <p>Loading equipment specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="page-container">
        <div className="empty-state-card">
          <span className="empty-icon">⚠️</span>
          <h3>Equipment Not Found</h3>
          <p>{error || 'The requested equipment listing could not be found.'}</p>
          <Link to="/equipment" className="btn-primary">
            ← Back to Browse Equipment
          </Link>
        </div>
      </div>
    );
  }

  const images = equipment.images && equipment.images.length > 0 ? equipment.images : [];
  const currentImage = images[activeImageIndex]
    ? getFullImageUrl(images[activeImageIndex])
    : null;

  return (
    <div className="page-container">
      <div className="breadcrumb-bar">
        <Link to="/equipment">← Back to All Equipment</Link>
        <button
          onClick={() => setShowReportModal(true)}
          className="btn-report-trigger"
          title="Report this listing to administrators"
        >
          🚩 Report Listing
        </button>
      </div>

      <div className="equipment-detail-layout">
        {/* Left Column: Image Gallery */}
        <div className="detail-gallery-col">
          <div className="main-image-viewport">
            {currentImage ? (
              <img
                src={currentImage}
                alt={equipment.name}
                className="detail-main-image"
              />
            ) : (
              <div className="detail-no-image">
                <span>🚜</span>
                <p>No photos uploaded for this equipment</p>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="detail-thumbnails-row">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`thumbnail-btn ${
                    activeImageIndex === idx ? 'thumbnail-active' : ''
                  }`}
                >
                  <img src={getFullImageUrl(img)} alt={`thumb-${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs, Owner Info & Booking Calendar */}
        <div className="detail-info-col">
          <div className="detail-header">
            <div className="detail-type-rating-line">
              <span className="detail-type-pill">
                {equipment.type ? equipment.type.toUpperCase() : 'EQUIPMENT'}
              </span>
              <div className="detail-rating-pill">
                {reviewsCount > 0 ? (
                  <>
                    <span className="rating-star-gold">★ {averageRating}</span>
                    <span className="rating-count-sub">
                      ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </>
                ) : (
                  <span className="rating-new-tag">★ No reviews yet</span>
                )}
              </div>
            </div>

            <h1 className="detail-title">{equipment.name}</h1>
            <p className="detail-location">
              📍 {equipment.locationName || 'Location not specified'}
            </p>
          </div>

          <div className="detail-price-box">
            <span className="price-big">₹{equipment.pricePerDay}</span>
            <span className="price-term">/ day</span>
            <span
              className={`availability-pill ${
                equipment.isAvailable ? 'avail-yes' : 'avail-no'
              }`}
            >
              {equipment.isAvailable ? 'Available for Rent' : 'Currently Unavailable'}
            </span>
          </div>

          <div className="detail-section">
            <h3>Equipment Description</h3>
            <p className="detail-description-text">
              {equipment.description || 'No description provided by owner.'}
            </p>
          </div>

          {/* Owner Details Card */}
          <div className="owner-card">
            <h3>Owner Contact Information</h3>
            <div className="owner-details">
              <p>
                <strong>Owner Name:</strong> {equipment.ownerId?.name || 'Verified Owner'}
              </p>
              <p>
                <strong>Contact Phone:</strong>{' '}
                {equipment.ownerId?.phone ? (
                  <a href={`tel:${equipment.ownerId.phone}`} className="phone-link">
                    📞 {equipment.ownerId.phone}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            </div>
          </div>

          {/* Booking Section */}
          <div className="booking-card">
            <h3 className="booking-card-title">📅 Reserve This Equipment</h3>

            {!equipment.isAvailable ? (
              <div className="booking-unavailable-msg">
                ⚠️ This machine is marked as currently unavailable by the owner.
              </div>
            ) : !user ? (
              <div className="booking-auth-prompt">
                <p>You need to be logged in with a <strong>Renter</strong> account to book this equipment.</p>
                <div className="booking-auth-buttons">
                  <Link to="/login" className="btn-primary">
                    Login to Book
                  </Link>
                  <Link to="/register" className="btn-secondary">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : user.role !== 'renter' ? (
              <div className="booking-role-notice">
                ℹ️ You are currently logged in as an <strong>{user.role}</strong>. Bookings can only be submitted by renter accounts.
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="datepicker-container">
                  <label className="datepicker-label">Select Rental Dates:</label>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => setDateRange(update)}
                    minDate={new Date()}
                    excludeDateIntervals={excludeIntervals}
                    isClearable={true}
                    placeholderText="Click to select start & end dates"
                    className="datepicker-input"
                    dateFormat="MMM d, yyyy"
                  />
                  <span className="datepicker-hint">
                    * Confirmed & reserved dates are disabled automatically.
                  </span>
                </div>

                {/* Live Price Calculation Box */}
                {startDate && endDate && (
                  <div className="price-calculation-card">
                    <div className="calc-row">
                      <span>Rate per Day:</span>
                      <strong>₹{equipment.pricePerDay}</strong>
                    </div>
                    <div className="calc-row">
                      <span>Duration:</span>
                      <strong>
                        {daysCount} {daysCount === 1 ? 'day' : 'days'}
                      </strong>
                    </div>
                    <div className="calc-divider" />
                    <div className="calc-row calc-total-row">
                      <span>Total Estimated Cost:</span>
                      <span className="calc-total-val">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {bookingError && (
                  <div className="notice-banner warning-banner booking-error-banner">
                    ⚠️ {bookingError}
                  </div>
                )}

                {/* Success Banner */}
                {bookingSuccess && (
                  <div className="notice-banner success-banner booking-success-banner">
                    <p>✅ {bookingSuccess}</p>
                    <Link to="/my-bookings" className="btn-view-bookings">
                      View My Bookings →
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!startDate || !endDate || bookingLoading || daysCount <= 0}
                  className="btn-book-now"
                >
                  {bookingLoading ? 'Processing Reservation...' : `Book Now • ₹${totalPrice.toLocaleString('en-IN')}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="detail-reviews-container">
        <ReviewsList
          reviews={reviews}
          averageRating={averageRating}
          count={reviewsCount}
        />
      </div>

      {/* Report Listing Modal */}
      {showReportModal && (
        <div className="modal-backdrop">
          <div className="modal-box report-modal-box">
            <div className="modal-header">
              <h3>🚩 Report Equipment Listing</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="modal-close-btn"
                type="button"
              >
                ✕
              </button>
            </div>

            <p className="report-modal-subtitle">
              Flagging <strong>{equipment.name}</strong> for moderator review.
            </p>

            {reportMessage && (
              <div
                className={`notice-banner ${
                  reportMessage.type === 'success' ? 'success-banner' : 'warning-banner'
                }`}
              >
                {reportMessage.type === 'success' ? '✅' : '⚠️'} {reportMessage.text}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="report-form">
              <div className="form-group">
                <label htmlFor="report-category">Reason for Report:</label>
                <select
                  id="report-category"
                  value={reportReasonCategory}
                  onChange={(e) => setReportReasonCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="Fake listing">Fake listing</option>
                  <option value="Misleading photos">Misleading photos</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="report-details">
                  {reportReasonCategory === 'Other'
                    ? 'Please specify details (required):'
                    : 'Additional details (optional):'}
                </label>
                <textarea
                  id="report-details"
                  rows={3}
                  value={reportCustomReason}
                  onChange={(e) => setReportCustomReason(e.target.value)}
                  placeholder="Explain what is suspicious or incorrect about this listing..."
                  className="form-textarea"
                  required={reportReasonCategory === 'Other'}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  disabled={submittingReport}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="btn-danger-action"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetail;
