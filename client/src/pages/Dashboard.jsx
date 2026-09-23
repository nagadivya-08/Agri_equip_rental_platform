import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [adminTestResult, setAdminTestResult] = useState(null);
  const [testingAdmin, setTestingAdmin] = useState(false);

  // Quick stats state for renter
  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    totalCount: 0,
    loading: true,
  });

  useEffect(() => {
    if (user?.role === 'renter') {
      api
        .get('/bookings/my')
        .then((res) => {
          const bookings = res.data.data || [];
          const activeCount = bookings.filter((b) =>
            ['pending', 'awaiting_payment', 'confirmed'].includes(b.status)
          ).length;
          const completedCount = bookings.filter(
            (b) => b.status === 'completed'
          ).length;
          setStats({
            activeCount,
            completedCount,
            totalCount: bookings.length,
            loading: false,
          });
        })
        .catch(() => {
          setStats((prev) => ({ ...prev, loading: false }));
        });
    }
  }, [user]);

  // If redirected with an unauthorized message
  const redirectMessage = location.state?.message;

  const handleAdminTest = async () => {
    setTestingAdmin(true);
    setAdminTestResult(null);
    try {
      const response = await api.get('/auth/admin-test');
      setAdminTestResult({
        success: true,
        status: response.status,
        message: response.data.message,
      });
    } catch (err) {
      setAdminTestResult({
        success: false,
        status: err.response?.status || 500,
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to call admin-test endpoint',
      });
    } finally {
      setTestingAdmin(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h2>Welcome, {user?.name}!</h2>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>

        {redirectMessage && (
          <div className="notice-banner warning-banner">
            ⚠️ {redirectMessage}
          </div>
        )}

        {/* Quick Stats Section for Renters */}
        {user?.role === 'renter' && (
          <div className="dashboard-stats-section">
            <h3>Rental Summary</h3>
            {stats.loading ? (
              <div className="stats-loading">Loading your rental statistics...</div>
            ) : (
              <div className="dashboard-stats-grid">
                <div className="stat-card stat-active">
                  <div className="stat-icon">🔄</div>
                  <div className="stat-content">
                    <span className="stat-value">{stats.activeCount}</span>
                    <span className="stat-label">Active Rentals</span>
                  </div>
                </div>
                <div className="stat-card stat-completed">
                  <div className="stat-icon">🏁</div>
                  <div className="stat-content">
                    <span className="stat-value">{stats.completedCount}</span>
                    <span className="stat-label">Completed Rentals</span>
                  </div>
                </div>
                <div className="stat-card stat-total">
                  <div className="stat-icon">📦</div>
                  <div className="stat-content">
                    <span className="stat-value">{stats.totalCount}</span>
                    <span className="stat-label">Total Bookings</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Action Cards Based on Role */}
        <div className="dashboard-actions-section">
          <h3>Quick Actions</h3>
          <div className="dashboard-actions-grid">
            {user?.role === 'owner' && (
              <>
                <Link to="/add-equipment" className="action-card action-primary">
                  <span className="action-icon">➕</span>
                  <div className="action-info">
                    <h4>Add Equipment</h4>
                    <p>List a new machine for rent with photos & pricing</p>
                  </div>
                </Link>
                <Link to="/owner-bookings" className="action-card">
                  <span className="action-icon">📥</span>
                  <div className="action-info">
                    <h4>Booking Requests</h4>
                    <p>Approve, reject, or complete equipment rentals</p>
                  </div>
                </Link>
                <Link to="/my-listings" className="action-card">
                  <span className="action-icon">📋</span>
                  <div className="action-info">
                    <h4>My Listings</h4>
                    <p>View, edit, and track status of your equipment</p>
                  </div>
                </Link>
              </>
            )}

            {user?.role === 'renter' && (
              <Link to="/my-bookings" className="action-card action-primary">
                <span className="action-icon">📅</span>
                <div className="action-info">
                  <h4>My Bookings</h4>
                  <p>View confirmed dates, status, and receipts</p>
                </div>
              </Link>
            )}

            <Link to="/equipment" className="action-card">
              <span className="action-icon">🚜</span>
              <div className="action-info">
                <h4>Browse Equipment</h4>
                <p>Explore tractors, harvesters, and tools for rent</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="user-details-grid">
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user?.email}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Assigned Role:</span>
            <span className={`role-badge role-${user?.role}`}>
              {user?.role ? user.role.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{user?.phone || 'Not provided'}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Account Status:</span>
            <span className="detail-value">
              {user?.verified ? 'Verified ✅' : 'Standard Account'}
            </span>
          </div>
        </div>

        {/* Role verification test section */}
        <div className="admin-test-section">
          <h3>Role Authorization Test (GET /api/auth/admin-test)</h3>
          <p className="section-desc">
            Test route protected by <code>protect</code> and <code>authorizeRoles("admin")</code>.
            Non-admin roles should receive HTTP 403 Forbidden.
          </p>

          <button
            onClick={handleAdminTest}
            className="test-button"
            disabled={testingAdmin}
          >
            {testingAdmin ? 'Testing...' : 'Test Admin Route'}
          </button>

          {adminTestResult && (
            <div
              className={`test-result-box ${
                adminTestResult.success ? 'test-success' : 'test-failure'
              }`}
            >
              <p className="result-status">
                Status: <strong>{adminTestResult.status}</strong>{' '}
                {adminTestResult.success ? 'OK' : 'Forbidden / Denied'}
              </p>
              <p className="result-msg">{adminTestResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
