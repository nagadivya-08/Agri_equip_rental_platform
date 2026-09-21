import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ReviewForm from '../components/ReviewForm';
import Spinner from '../components/Spinner';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionNotice, setActionNotice] = useState(null);
  const [activeReviewBooking, setActiveReviewBooking] = useState(null);

  const fetchOwnerBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/owner');
      setBookings(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load booking requests'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const handleConfirm = async (bookingId) => {
    setActionLoading(bookingId);
    setActionNotice(null);
    try {
      const res = await api.patch(`/bookings/${bookingId}/confirm`);
      const autoRejected = res.data.autoRejectedCount || 0;
      let msg = 'Booking approved! Status is now Awaiting Payment from renter.';
      if (autoRejected > 0) {
        msg += ` ${autoRejected} overlapping pending booking(s) were automatically rejected.`;
      }
      toast.success(msg);
      setActionNotice({ type: 'success', text: msg });
      fetchOwnerBookings();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to confirm booking';
      toast.error(errMsg);
      setActionNotice({
        type: 'error',
        text: errMsg,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    const confirmReject = window.confirm(
      'Are you sure you want to reject this booking request?'
    );
    if (!confirmReject) return;

    setActionLoading(bookingId);
    setActionNotice(null);
    try {
      await api.patch(`/bookings/${bookingId}/reject`);
      toast.success('Booking request rejected');
      setActionNotice({
        type: 'success',
        text: 'Booking request rejected',
      });
      fetchOwnerBookings();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to reject booking';
      toast.error(errMsg);
      setActionNotice({
        type: 'error',
        text: errMsg,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (bookingId) => {
    setActionLoading(bookingId);
    setActionNotice(null);
    try {
      await api.patch(`/bookings/${bookingId}/complete`);
      toast.success('Booking marked as completed. Equipment availability restored.');
      setActionNotice({
        type: 'success',
        text: 'Booking marked as completed. Equipment availability restored.',
      });
      fetchOwnerBookings();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to mark as completed';
      toast.error(errMsg);
      setActionNotice({
        type: 'error',
        text: errMsg,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking?'
    );
    if (!confirmCancel) return;

    setActionLoading(bookingId);
    setActionNotice(null);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      setActionNotice({
        type: 'success',
        text: 'Booking cancelled successfully',
      });
      fetchOwnerBookings();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to cancel booking';
      toast.error(errMsg);
      setActionNotice({
        type: 'error',
        text: errMsg,
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Spinner message="Loading incoming equipment booking requests..." />
      </div>
    );
  }

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
    return Math.round(Math.abs((e - s) / (1000 * 60 * 60 * 24))) + 1;
  };

  const hasEndDatePassed = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) <= new Date();
  };

  const formatStatusLabel = (status) => {
    if (status === 'awaiting_payment') return 'AWAITING PAYMENT';
    return status.toUpperCase();
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const awaitingCount = bookings.filter((b) => b.status === 'awaiting_payment').length;
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  if (loading) {
    return (
      <div className="owner-bookings-page">
        <div className="page-container">
          <div className="loading-container">
            <p>Loading incoming equipment bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="owner-bookings-page">
      <div className="page-container">
        <div className="page-header-row">
        <div>
          <h1 className="page-title">Equipment Booking Requests</h1>
          <p className="page-subtitle">
            Manage incoming rental reservations, approvals, payments, and completions
          </p>
        </div>
        <Link to="/my-listings" className="btn-secondary">
          ← View My Listings
        </Link>
      </div>

      {actionNotice && (
        <div
          className={`notice-banner ${
            actionNotice.type === 'success' ? 'success-banner' : 'warning-banner'
          }`}
        >
          {actionNotice.type === 'success' ? '✅' : '⚠️'} {actionNotice.text}
        </div>
      )}

      {error && (
        <div className="notice-banner warning-banner">
          ⚠️ {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="admin-filter-bar">
        <button
          className={`filter-chip ${statusFilter === 'all' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All Requests ({bookings.length})
        </button>
        <button
          className={`filter-chip ${statusFilter === 'pending' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          Pending Action ({pendingCount})
        </button>
        <button
          className={`filter-chip ${statusFilter === 'awaiting_payment' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('awaiting_payment')}
        >
          Awaiting Payment ({awaitingCount})
        </button>
        <button
          className={`filter-chip ${statusFilter === 'confirmed' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('confirmed')}
        >
          Active / Confirmed ({confirmedCount})
        </button>
        <button
          className={`filter-chip ${statusFilter === 'completed' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('completed')}
        >
          Completed ({completedCount})
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">📥</span>
          <h3>No Booking Requests Found</h3>
          <p>
            {statusFilter === 'all'
              ? 'No one has booked your equipment listings yet.'
              : `No bookings currently matching the status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => {
            const equip = booking.equipmentId || {};
            const renter = booking.renterId || {};
            const thumb =
              equip.images && equip.images.length > 0
                ? getFullImageUrl(equip.images[0])
                : null;
            const days = calculateDays(booking.startDate, booking.endDate);
            const isPending = booking.status === 'pending';
            const isAwaitingPayment = booking.status === 'awaiting_payment';
            const isConfirmed = booking.status === 'confirmed';
            const canComplete = isConfirmed && hasEndDatePassed(booking.endDate);
            const canCancel = isPending || isAwaitingPayment || isConfirmed;

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

                  <div className="booking-meta-grid">
                    <div className="meta-block">
                      <span className="meta-label">Renter Information</span>
                      <span className="meta-value">
                        👤 {renter.name || 'Anonymous Renter'}
                        {renter.phone && (
                          <div>
                            📞 <a href={`tel:${renter.phone}`}>{renter.phone}</a>
                          </div>
                        )}
                        {renter.email && <div>✉️ {renter.email}</div>}
                      </span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">Rental Duration</span>
                      <span className="meta-value">
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                        <span className="days-badge">({days} {days === 1 ? 'day' : 'days'})</span>
                      </span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">Total Rental Value</span>
                      <span className="meta-value price-highlight">
                        ₹{booking.totalPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">Request Date</span>
                      <span className="meta-value">
                        {formatDate(booking.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Awaiting Payment Notice for Owner */}
                  {isAwaitingPayment && (
                    <div className="owner-payment-notice">
                      <span className="owner-notice-icon">⏳</span>
                      <div>
                        <strong>Awaiting Renter Payment:</strong>
                        <p>
                          You approved this booking. The renter must complete online payment
                          before equipment handover. Do not release equipment until status changes
                          to CONFIRMED.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="booking-footer-actions">
                    {isPending && (
                      <div className="action-buttons-group">
                        <button
                          onClick={() => handleConfirm(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="btn-confirm-action"
                        >
                          {actionLoading === booking._id ? 'Approving...' : '✓ Approve Request'}
                        </button>
                        <button
                          onClick={() => handleReject(booking._id)}
                          disabled={actionLoading === booking._id}
                          className="btn-reject-action"
                        >
                          ✗ Reject Request
                        </button>
                      </div>
                    )}

                    {canComplete && (
                      <button
                        onClick={() => handleComplete(booking._id)}
                        disabled={actionLoading === booking._id}
                        className="btn-complete-action"
                      >
                        {actionLoading === booking._id ? 'Updating...' : '🏁 Mark as Completed'}
                      </button>
                    )}

                    {booking.status === 'completed' && (
                      <button
                        onClick={() => setActiveReviewBooking(booking)}
                        className="btn-leave-review"
                      >
                        ⭐ Rate & Review Renter
                      </button>
                    )}

                    {isConfirmed && !canComplete && (
                      <span className="booking-confirmed-hint">
                        ✅ Payment received. Machinery ready for rental handover. Can be marked completed after {formatDate(booking.endDate)}.
                      </span>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={actionLoading === booking._id}
                        className="btn-cancel-booking"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal for Owner */}
      {activeReviewBooking && (
        <ReviewForm
          booking={activeReviewBooking}
          onSuccess={() => {
            setActiveReviewBooking(null);
            setActionNotice({
              type: 'success',
              text: 'Thank you! Your feedback for this renter has been submitted.',
            });
            fetchOwnerBookings();
          }}
          onCancel={() => setActiveReviewBooking(null)}
        />
      )}
      </div>
    </div>
  );
};

export default OwnerBookings;
