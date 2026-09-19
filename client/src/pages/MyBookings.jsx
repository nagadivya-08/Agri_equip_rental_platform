import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load your bookings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayNow = async (booking) => {
    if (!window.Razorpay) {
      setActionMessage({
        type: 'error',
        text: 'Razorpay checkout SDK could not be loaded. Please check your internet connection.',
      });
      return;
    }

    setActionLoading(booking._id);
    setActionMessage(null);

    try {
      // 1. Create Razorpay order on backend
      const res = await api.post('/payments/create-order', {
        bookingId: booking._id,
      });

      const { orderId, amount, currency, keyId } = res.data;

      // 2. Open Razorpay Checkout modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Agri-Equipment Rental Platform',
        description: `Rental payment for ${booking.equipmentId?.name || 'Equipment'}`,
        order_id: orderId,
        handler: async function (response) {
          setActionLoading(booking._id);
          try {
            // 3. Verify signature on backend
            const verifyRes = await api.post('/payments/verify', {
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setActionMessage({
              type: 'success',
              text:
                verifyRes.data.message ||
                'Payment successful! Your equipment booking is now confirmed.',
            });
            fetchBookings();
          } catch (verifyErr) {
            setActionMessage({
              type: 'error',
              text:
                verifyErr.response?.data?.message ||
                'Payment verification failed. Please contact support.',
            });
          } finally {
            setActionLoading(null);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#15803d',
        },
        modal: {
          ondismiss: function () {
            setActionLoading(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (failResponse) {
        setActionMessage({
          type: 'error',
          text:
            failResponse.error?.description ||
            'Payment failed. Please try again or use another payment method.',
        });
        setActionLoading(null);
      });

      rzp.open();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          err.message ||
          'Failed to initialize payment order. Please ensure Razorpay keys are configured in server/.env.',
      });
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking request?'
    );
    if (!confirmCancel) return;

    setActionLoading(bookingId);
    setActionMessage(null);
    try {
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      setActionMessage({
        type: 'success',
        text: res.data.message || 'Booking cancelled successfully',
      });
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      setActionMessage({
        type: 'error',
        text:
          err.response?.data?.message ||
          err.message ||
          'Failed to cancel booking',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.round(Math.abs((e - s) / (1000 * 60 * 60 * 24))) + 1;
    return diff;
  };

  const formatStatusLabel = (status) => {
    if (status === 'awaiting_payment') return 'AWAITING PAYMENT';
    return status.toUpperCase();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <p>Loading your rental bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">
            Track and manage your agricultural equipment rental reservations & payments
          </p>
        </div>
        <Link to="/equipment" className="btn-primary">
          + Explore More Equipment
        </Link>
      </div>

      {actionMessage && (
        <div
          className={`notice-banner ${
            actionMessage.type === 'success' ? 'success-banner' : 'warning-banner'
          }`}
        >
          {actionMessage.type === 'success' ? '✅' : '⚠️'} {actionMessage.text}
        </div>
      )}

      {error && (
        <div className="notice-banner warning-banner">
          ⚠️ {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">📅</span>
          <h3>No Bookings Found</h3>
          <p>You haven't requested or rented any equipment yet.</p>
          <Link to="/equipment" className="btn-primary">
            Browse Equipment Catalog
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const equip = booking.equipmentId || {};
            const thumb =
              equip.images && equip.images.length > 0
                ? getFullImageUrl(equip.images[0])
                : null;
            const days = calculateDays(booking.startDate, booking.endDate);
            const isAwaitingPayment = booking.status === 'awaiting_payment';
            const canCancel = ['pending', 'awaiting_payment', 'confirmed'].includes(
              booking.status
            );

            return (
              <div key={booking._id} className="booking-card-item">
                <div className="booking-card-media">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={equip.name || 'Equipment'}
                      className="booking-thumbnail"
                    />
                  ) : (
                    <div className="booking-thumbnail-placeholder">🚜</div>
                  )}
                </div>

                <div className="booking-card-content">
                  <div className="booking-header-line">
                    <span className="detail-type-pill">
                      {equip.type ? equip.type.toUpperCase() : 'EQUIPMENT'}
                    </span>
                    <div className="status-badges-cluster">
                      <span className={`status-badge status-${booking.status}`}>
                        {formatStatusLabel(booking.status)}
                      </span>
                      {booking.paymentStatus === 'paid' && (
                        <span className="payment-paid-badge">PAID ✅</span>
                      )}
                    </div>
                  </div>

                  <h3 className="booking-equip-title">
                    {equip._id ? (
                      <Link to={`/equipment/${equip._id}`}>{equip.name}</Link>
                    ) : (
                      equip.name || 'Equipment'
                    )}
                  </h3>

                  <p className="booking-location">
                    📍 {equip.locationName || 'Location not specified'}
                  </p>

                  <div className="booking-meta-grid">
                    <div className="meta-block">
                      <span className="meta-label">Rental Duration</span>
                      <span className="meta-value">
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                        <span className="days-badge">({days} {days === 1 ? 'day' : 'days'})</span>
                      </span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">Total Cost</span>
                      <span className="meta-value price-highlight">
                        ₹{booking.totalPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">Booking Placed</span>
                      <span className="meta-value">
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>

                    {booking.ownerId && (
                      <div className="meta-block">
                        <span className="meta-label">Owner Contact</span>
                        <span className="meta-value">
                          {booking.ownerId.name}{' '}
                          {booking.ownerId.phone && `(${booking.ownerId.phone})`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Payment Alert Banner for Awaiting Payment */}
                  {isAwaitingPayment && (
                    <div className="awaiting-payment-banner">
                      <span className="awaiting-payment-icon">💡</span>
                      <div>
                        <strong>Owner Approved!</strong>
                        <p>
                          Your reservation request was accepted. Please complete the online
                          payment to confirm the rental and secure the machine.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="booking-footer-actions">
                    <div className="booking-left-action-group">
                      {isAwaitingPayment && (
                        <button
                          onClick={() => handlePayNow(booking)}
                          disabled={actionLoading === booking._id}
                          className="btn-pay-now"
                        >
                          {actionLoading === booking._id
                            ? 'Opening Razorpay...'
                            : `💳 Pay Now • ₹${booking.totalPrice?.toLocaleString('en-IN')}`}
                        </button>
                      )}

                      {canCancel && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="btn-cancel-booking"
                        >
                          {actionLoading === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}

                      {booking.status === 'completed' && (
                        <button
                          onClick={() => setActiveReviewBooking(booking)}
                          className="btn-leave-review"
                        >
                          ⭐ Leave a Review
                        </button>
                      )}
                    </div>

                    {booking.status === 'confirmed' && (
                      <span className="booking-confirmed-hint">
                        🎉 Booking confirmed & paid! The owner is expecting you for the rental.
                        {booking.razorpayPaymentId && (
                          <span className="payment-id-tag">
                            Ref: {booking.razorpayPaymentId}
                          </span>
                        )}
                      </span>
                    )}

                    {booking.status === 'completed' && (
                      <span className="booking-completed-hint">
                        🏁 Rental completed! You can share your review and feedback above.
                      </span>
                    )}

                    {booking.status === 'rejected' && (
                      <span className="booking-rejected-hint">
                        This booking was declined or overridden by a conflicting confirmation.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {activeReviewBooking && (
        <ReviewForm
          booking={activeReviewBooking}
          onSuccess={() => {
            setActiveReviewBooking(null);
            setActionMessage({
              type: 'success',
              text: 'Thank you! Your review has been published.',
            });
            fetchBookings();
          }}
          onCancel={() => setActiveReviewBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;
