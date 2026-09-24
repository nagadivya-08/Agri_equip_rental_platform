import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch administration metrics'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <div className="admin-page-header">
        <div>
          <h2>🛡️ Admin Moderation Center</h2>
          <p className="page-subtitle">
            Platform overview, listing approvals, user moderation, and metrics
          </p>
        </div>
        <button onClick={fetchStats} className="btn-secondary" title="Refresh Statistics">
          🔄 Refresh
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <Loader
          message="Loading platform metrics..."
          submessage="Analyzing machinery transactions & system metrics..."
        />
      ) : stats ? (
        <>
          {/* Urgent Alert Banner for Open Community Reports */}
          {stats.reports?.open > 0 && (
            <div className="notice-banner warning-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span>🚩 Attention: <strong>{stats.reports.open} community {stats.reports.open === 1 ? 'report requires' : 'reports require'} administrative review</strong>.</span>
              <Link to="/admin/reports" className="btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                Review Reports Queue →
              </Link>
            </div>
          )}

          {/* Metrics Overview Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">👥</span>
              <div className="stat-content">
                <span className="stat-number">{stats.users.total}</span>
                <span className="stat-title">Total Registered Users</span>
                <div className="stat-subtags">
                  <span className="subtag subtag-owner">{stats.users.owners} Owners</span>
                  <span className="subtag subtag-renter">{stats.users.renters} Renters</span>
                  <span className="subtag subtag-admin">{stats.users.admins || 0} Admins</span>
                  {stats.users.banned > 0 && (
                    <span className="subtag subtag-banned">{stats.users.banned} Banned</span>
                  )}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">⏳</span>
              <div className="stat-content">
                <span className="stat-number stat-pending-num">{stats.equipment.pending}</span>
                <span className="stat-title">Pending Listings Review</span>
                <p className="stat-subtext">Requires immediate admin verification</p>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div className="stat-content">
                <span className="stat-number stat-approved-num">{stats.equipment.approved}</span>
                <span className="stat-title">Approved Marketplace Items</span>
                <p className="stat-subtext">Currently live and rentable by farmers</p>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">🚜</span>
              <div className="stat-content">
                <span className="stat-number">{stats.equipment.total}</span>
                <span className="stat-title">Total Equipment Submissions</span>
                <div className="stat-subtags">
                  <span className="subtag subtag-rejected">{stats.equipment.rejected} Rejected</span>
                </div>
              </div>
            </div>

            {/* Total Bookings Breakdown Card */}
            <div className="stat-card">
              <span className="stat-icon">📅</span>
              <div className="stat-content">
                <span className="stat-number">{stats.bookings?.total || 0}</span>
                <span className="stat-title">Total Bookings Recorded</span>
                <div className="stat-subtags">
                  <span className="subtag subtag-confirmed">{stats.bookings?.confirmed || 0} Confirmed</span>
                  <span className="subtag subtag-pending">{stats.bookings?.pending || 0} Pending</span>
                  <span className="subtag subtag-completed">{stats.bookings?.completed || 0} Completed</span>
                  {stats.bookings?.cancelled > 0 && (
                    <span className="subtag subtag-cancelled">{stats.bookings?.cancelled} Cancelled</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="admin-actions-section">
            <h3>Administrative Modules</h3>
            <div className="admin-modules-grid">
              <Link to="/admin/pending" className="admin-module-card module-pending">
                <span className="module-icon">📋</span>
                <div className="module-info">
                  <h4>Pending Approvals ({stats.equipment.pending})</h4>
                  <p>Inspect newly uploaded equipment, inspect photos, approve or provide rejection feedback.</p>
                </div>
                <span className="module-arrow">→</span>
              </Link>

              <Link to="/admin/listings" className="admin-module-card">
                <span className="module-icon">🚜</span>
                <div className="module-info">
                  <h4>All Equipment Listings ({stats.equipment.total})</h4>
                  <p>Comprehensive overview of all equipment across pending, approved, and rejected statuses.</p>
                </div>
                <span className="module-arrow">→</span>
              </Link>

              <Link to="/admin/users" className="admin-module-card">
                <span className="module-icon">👥</span>
                <div className="module-info">
                  <h4>User Management ({stats.users.total})</h4>
                  <p>View registered accounts, verify roles, and suspend/unban suspicious actors.</p>
                </div>
                <span className="module-arrow">→</span>
              </Link>

              <Link to="/admin/reports" className="admin-module-card module-reports">
                <span className="module-icon">🚩</span>
                <div className="module-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4>Community Reports & Flags</h4>
                    {stats.reports?.open > 0 && (
                      <span
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          borderRadius: '12px',
                          padding: '2px 8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        ⚠️ {stats.reports.open} {stats.reports.open === 1 ? 'report needs' : 'reports need'} review
                      </span>
                    )}
                  </div>
                  <p>Investigate user complaints, dismiss false flags, or remove fraudulent listings.</p>
                </div>
                <span className="module-arrow">→</span>
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
