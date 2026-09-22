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
                  <h4>Community Reports & Flags</h4>
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
