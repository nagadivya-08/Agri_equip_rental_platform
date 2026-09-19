import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AdminAllListings = () => {
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const url =
        statusFilter && statusFilter !== 'all'
          ? `/admin/listings?status=${statusFilter}`
          : '/admin/listings';
      const res = await api.get(url);
      setListings(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch equipment listings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

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
          <h2>🚜 All Platform Equipment Listings</h2>
          <p className="page-subtitle">
            Master overview of all equipment submitted to AgriRent
          </p>
        </div>

        {/* Filter by Status */}
        <div className="admin-filter-box">
          <label htmlFor="status-select">Filter by Status:</label>
          <select
            id="status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <div className="loading-container">
          <p>Loading equipment catalog...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">📭</span>
          <h3>No Listings Found</h3>
          <p>No equipment matches the selected status filter.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Equipment Name</th>
                <th>Type</th>
                <th>Price / Day</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Rejection Reason</th>
                <th>Date Listed</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((item) => {
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
                      <strong>
                        {item.status === 'approved' ? (
                          <Link to={`/equipment/${item._id}`} className="table-link">
                            {item.name} ↗
                          </Link>
                        ) : (
                          item.name
                        )}
                      </strong>
                      <p className="table-subtext">📍 {item.locationName || 'Location not specified'}</p>
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
                      <span className={`status-badge-inline status-${item.status}`}>
                        {item.status === 'pending' && '⏳ Pending'}
                        {item.status === 'approved' && '✅ Approved'}
                        {item.status === 'rejected' && '❌ Rejected'}
                      </span>
                    </td>
                    <td>
                      <div><strong>{item.ownerId?.name || 'Unknown'}</strong></div>
                      <div className="table-subtext">{item.ownerId?.email}</div>
                      <div className="table-subtext">{item.ownerId?.phone ? `📞 ${item.ownerId.phone}` : ''}</div>
                    </td>
                    <td>
                      {item.status === 'rejected' && item.rejectionReason ? (
                        <span className="rejection-note" title={item.rejectionReason}>
                          ⚠️ {item.rejectionReason}
                        </span>
                      ) : (
                        <span className="table-subtext">—</span>
                      )}
                    </td>
                    <td className="table-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAllListings;
