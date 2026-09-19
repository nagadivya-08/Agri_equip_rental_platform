import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/admin/reports?status=${statusFilter}`);
      setReports(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load reports queue'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleDismiss = async (reportId) => {
    setActionLoading(reportId);
    setActionMessage(null);
    try {
      const res = await api.patch(`/admin/reports/${reportId}/dismiss`);
      const msg = res.data.message || 'Report dismissed.';
      toast.success(msg);
      setActionMessage({
        type: 'success',
        text: msg,
      });
      fetchReports();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to dismiss report.';
      toast.error(errMsg);
      setActionMessage({
        type: 'error',
        text: errMsg,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveAndRemove = async (reportId, listingName) => {
    const confirmAction = window.confirm(
      `Are you sure you want to resolve this report and REMOVE listing "${listingName}" from the marketplace?`
    );
    if (!confirmAction) return;

    setActionLoading(reportId);
    setActionMessage(null);
    try {
      const res = await api.patch(`/admin/reports/${reportId}/resolve`, {
        action: 'remove_listing',
      });
      const msg = res.data.message || 'Report resolved and listing removed.';
      toast.success(msg);
      setActionMessage({
        type: 'success',
        text: msg,
      });
      fetchReports();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to resolve report.';
      toast.error(errMsg);
      setActionMessage({
        type: 'error',
        text: errMsg,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveOnly = async (reportId) => {
    setActionLoading(reportId);
    setActionMessage(null);
    try {
      const res = await api.patch(`/admin/reports/${reportId}/resolve`);
      const msg = res.data.message || 'Report marked as reviewed.';
      toast.success(msg);
      setActionMessage({
        type: 'success',
        text: msg,
      });
      fetchReports();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to resolve report.';
      toast.error(errMsg);
      setActionMessage({
        type: 'error',
        text: errMsg,
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-container">
      <div className="admin-page-header">
        <div>
          <h2>🚩 Community Reports & Listing Moderation</h2>
          <p className="page-subtitle">
            Review user-reported listings, investigate violations, and enforce trust & safety
          </p>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin" className="btn-secondary">
            ← Admin Center
          </Link>
          <button onClick={fetchReports} className="btn-secondary" title="Refresh Reports">
            🔄 Refresh
          </button>
        </div>
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

      {error && <div className="notice-banner warning-banner">⚠️ {error}</div>}

      {/* Filter Tabs */}
      <div className="admin-filter-bar">
        <button
          className={`filter-chip ${statusFilter === 'open' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('open')}
        >
          Open Reports
        </button>
        <button
          className={`filter-chip ${statusFilter === 'all' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All Reports
        </button>
        <button
          className={`filter-chip ${statusFilter === 'reviewed' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('reviewed')}
        >
          Reviewed / Resolved
        </button>
        <button
          className={`filter-chip ${statusFilter === 'dismissed' ? 'filter-active' : ''}`}
          onClick={() => setStatusFilter('dismissed')}
        >
          Dismissed
        </button>
      </div>

      {loading ? (
        <Spinner message="Loading reported listings queue..." />
      ) : reports.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">🛡️</span>
          <h3>No Reports Found</h3>
          <p>There are no listings matching the "{statusFilter}" report filter.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reported Equipment</th>
                <th>Reported By</th>
                <th>Violation Reason</th>
                <th>Date Filed</th>
                <th>Report Status</th>
                <th>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const equip = report.listingId || {};
                const reporter = report.reporterId || {};
                const thumb =
                  equip.images && equip.images.length > 0
                    ? getFullImageUrl(equip.images[0])
                    : null;
                const isOpen = report.status === 'open';

                return (
                  <tr key={report._id} className={isOpen ? 'row-report-open' : ''}>
                    {/* Equipment Details */}
                    <td>
                      <div className="table-equip-cell">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={equip.name || 'Listing'}
                            className="table-equip-thumb"
                          />
                        ) : (
                          <div className="table-thumb-placeholder">🚜</div>
                        )}
                        <div>
                          <strong>
                            {equip._id ? (
                              <Link to={`/equipment/${equip._id}`} className="table-link">
                                {equip.name || 'Listing'}
                              </Link>
                            ) : (
                              equip.name || 'Removed Listing'
                            )}
                          </strong>
                          <span className="table-subtext">
                            📍 {equip.locationName || 'Unknown location'}
                          </span>
                          {equip.status && (
                            <span className={`listing-status-tag status-${equip.status}`}>
                              Listing Status: {equip.status.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Reporter Info */}
                    <td>
                      <strong>{reporter.name || 'Anonymous User'}</strong>
                      {reporter.email && (
                        <div className="table-subtext">✉️ {reporter.email}</div>
                      )}
                    </td>

                    {/* Reason */}
                    <td>
                      <span className="report-reason-pill">{report.reason}</span>
                    </td>

                    {/* Date */}
                    <td>
                      <span className="table-date">{formatDate(report.createdAt)}</span>
                    </td>

                    {/* Report Status */}
                    <td>
                      <span className={`status-badge-inline status-${report.status}`}>
                        {report.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      {isOpen ? (
                        <div className="table-actions-stack">
                          <button
                            onClick={() =>
                              handleResolveAndRemove(report._id, equip.name || 'Equipment')
                            }
                            disabled={actionLoading === report._id}
                            className="btn-resolve-remove"
                            title="Reject listing from marketplace and mark report as reviewed"
                          >
                            🚫 Resolve & Remove Listing
                          </button>
                          <div className="table-sub-actions">
                            <button
                              onClick={() => handleResolveOnly(report._id)}
                              disabled={actionLoading === report._id}
                              className="btn-resolve-only"
                              title="Mark report as reviewed without altering listing"
                            >
                              ✓ Mark Reviewed
                            </button>
                            <button
                              onClick={() => handleDismiss(report._id)}
                              disabled={actionLoading === report._id}
                              className="btn-dismiss-report"
                              title="Dismiss report as invalid"
                            >
                              ✕ Dismiss
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="table-action-resolved">
                          {report.status === 'reviewed' ? '✅ Action Concluded' : '⚪ Dismissed'}
                        </span>
                      )}
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

export default AdminReports;
