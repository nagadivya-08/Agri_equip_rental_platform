import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import ReputationSummary from '../components/ReputationSummary';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Quick stats state for renter
  const [stats, setStats] = useState({
    activeCount: 0,
    completedCount: 0,
    totalCount: 0,
    loading: true,
  });

  // Owner stats state
  const [ownerStats, setOwnerStats] = useState({
    activeListings: 0,
    pendingRequests: 0,
    totalEarnings: 0,
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

    if (user?.role === 'owner') {
      // 1. Fetch listings and bookings to compute stats
      Promise.all([
        api.get('/equipment/my').catch(() => ({ data: { data: [] } })),
        api.get('/bookings/owner').catch(() => ({ data: { data: [] } })),
      ]).then(([equipRes, bookingsRes]) => {
        const myEquip = equipRes.data.data || [];
        const myBookings = bookingsRes.data.data || [];

        const activeListings = myEquip.filter((e) => e.status === 'approved').length;
        const pendingRequests = myBookings.filter((b) => b.status === 'pending').length;
        const totalEarnings = myBookings
          .filter((b) => ['confirmed', 'completed'].includes(b.status))
          .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

        setOwnerStats({
          activeListings,
          pendingRequests,
          totalEarnings,
          loading: false,
        });
      });
    }
  }, [user]);

  // If redirected with an unauthorized message
  const redirectMessage = location.state?.message;

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h2>Welcome, {user?.name}!</h2>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/profile" className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.88rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              👤 Edit Profile
            </Link>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
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

        {/* Quick Stats Section for Owners */}
        {user?.role === 'owner' && (
          <div className="dashboard-stats-section">
            <h3>Machinery Rental Summary</h3>
            {ownerStats.loading ? (
              <div className="stats-loading">Loading your equipment statistics...</div>
            ) : (
              <div className="dashboard-stats-grid">
                <div className="stat-card stat-active">
                  <div className="stat-icon">🚜</div>
                  <div className="stat-content">
                    <span className="stat-value">{ownerStats.activeListings}</span>
                    <span className="stat-label">Active / Approved Listings</span>
                  </div>
                </div>
                <div className="stat-card stat-pending">
                  <div className="stat-icon">📥</div>
                  <div className="stat-content">
                    <span className="stat-value">{ownerStats.pendingRequests}</span>
                    <span className="stat-label">Pending Booking Requests</span>
                  </div>
                </div>
                <div className="stat-card stat-total">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <span className="stat-value">
                      ₹{ownerStats.totalEarnings.toLocaleString('en-IN')}
                    </span>
                    <span className="stat-label">Total Earnings (Confirmed & Paid)</span>
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
              <>
                <Link to="/my-bookings" className="action-card action-primary">
                  <span className="action-icon">📅</span>
                  <div className="action-info">
                    <h4>My Bookings</h4>
                    <p>View confirmed dates, status, and receipts</p>
                  </div>
                </Link>
                <Link to="/equipment" className="action-card">
                  <span className="action-icon">🚜</span>
                  <div className="action-info">
                    <h4>Browse Equipment</h4>
                    <p>Explore tractors, harvesters, and tools for rent</p>
                  </div>
                </Link>
              </>
            )}

            {/* Common Profile Action */}
            <Link to="/profile" className="action-card">
              <span className="action-icon">👤</span>
              <div className="action-info">
                <h4>Edit Profile</h4>
                <p>Update personal info, phone, and change password</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Owner Reputation / Reviews Received Section */}
        {user?.role === 'owner' && (
          <ReputationSummary
            userId={user?._id}
            title="⭐ My Reputation & Reviews Received"
            subtitle="Feedback and star ratings submitted by farmers and renters who hired your equipment"
          />
        )}

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
      </div>
    </div>
  );
};

export default Dashboard;
