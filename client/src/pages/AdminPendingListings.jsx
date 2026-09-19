import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const AdminPendingListings = () => {
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Reject Modal State
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/listings/pending');
      setPendingListings(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch pending equipment listings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      await api.patch(`/admin/listings/${id}/approve`);
      setPendingListings((prev) => prev.filter((item) => item._id !== id));
      const msg = `"${name}" approved and published to marketplace.`;
      toast.success(msg);
      setActionMessage(`✅ ${msg}`);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to approve equipment';
      toast.error(errMsg);
    }
  };

  const openRejectModal = (item) => {
    setRejectingItem(item);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setRejectingItem(null);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    setProcessing(true);

    try {
      await api.patch(`/admin/listings/${rejectingItem._id}/reject`, {
        reason: rejectReason || 'Listing does not meet quality or safety standards.',
      });
      setPendingListings((prev) => prev.filter((item) => item._id !== rejectingItem._id));
      const msg = `"${rejectingItem.name}" has been rejected.`;
      toast.success(msg);
      setActionMessage(`❌ ${msg}`);
      closeRejectModal();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to reject equipment';
      toast.error(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  return (
    <div className="page-container">
      <div className="admin-page-header">
        <div>
          <div className="breadcrumb-nav">
            <Link to="/admin">← Admin Dashboard</Link>
          </div>
          <h2>⏳ Pending Equipment Approvals</h2>
          <p className="page-subtitle">
            Review equipment submitted by owners before publishing to the public marketplace
          </p>
        </div>
        <button onClick={fetchPending} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {actionMessage && (
        <div className="notice-banner success-banner">{actionMessage}</div>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <Spinner message="Loading pending equipment listings for review..." />
      ) : pendingListings.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">🎉</span>
          <h3>All Caught Up!</h3>
          <p>There are currently no equipment listings waiting for moderation.</p>
          <Link to="/admin" className="btn-primary">
            Return to Admin Dashboard
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Equipment Details</th>
                <th>Type</th>
                <th>Price / Day</th>
                <th>Owner Information</th>
                <th>Submitted</th>
                <th>Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingListings.map((item) => {
                const thumb =
                  item.images && item.images.length > 0
                    ? getImageUrl(item.images[0])
                    : null;
                return (
                  <tr key={item._id}>
                    <td className="table-thumb-cell">
                      {thumb ? (
                        <img src={thumb} alt={item.name} className="table-thumbnail" />
                      ) : (
                        <div className="table-thumbnail-placeholder">🚜</div>
                      )}
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      <p className="table-subtext">📍 {item.locationName || 'Unspecified location'}</p>
                      {item.description && (
                        <small className="table-desc-snippet" title={item.description}>
                          {item.description.length > 60
                            ? item.description.substring(0, 60) + '...'
                            : item.description}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className="detail-type-pill">
                        {item.type ? item.type.toUpperCase() : 'EQUIPMENT'}
                      </span>
                    </td>
                    <td>
                      <strong className="table-price">₹{item.pricePerDay}</strong>
                    </td>
                    <td>
                      <div><strong>{item.ownerId?.name || 'Unknown'}</strong></div>
                      <div className="table-subtext">{item.ownerId?.email}</div>
                      <div className="table-subtext">{item.ownerId?.phone ? `📞 ${item.ownerId.phone}` : ''}</div>
                    </td>
                    <td className="table-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => handleApprove(item._id, item.name)}
                          className="btn-approve"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(item)}
                          className="btn-reject"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Reject Equipment Listing</h3>
            <p>
              Are you sure you want to reject <strong>"{rejectingItem.name}"</strong>?
            </p>
            <div className="form-group">
              <label htmlFor="modal-reason">
                Rejection Reason (Will be communicated to owner):
              </label>
              <textarea
                id="modal-reason"
                rows="3"
                placeholder="e.g. Please provide clear images showing all sides of the equipment."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={closeRejectModal}
                className="btn-secondary"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="btn-reject"
                disabled={processing}
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingListings;
