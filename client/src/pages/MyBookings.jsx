import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

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
            Track and manage your agricultural equipment rental reservations
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
            const canCancel = ['pending', 'confirmed'].includes(booking.status);

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
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status.toUpperCase()}
                    </span>
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

                  <div className="booking-footer-actions">
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        disabled={actionLoading === booking._id}
                        className="btn-cancel-booking"
                      >
                        {actionLoading === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}

                    {booking.status === 'confirmed' && (
                      <span className="booking-confirmed-hint">
                        🎉 Booking confirmed! The owner is expecting you for the rental.
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
    </div>
  );
};

export default MyBookings;
