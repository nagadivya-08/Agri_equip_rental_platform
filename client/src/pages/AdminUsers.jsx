import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [togglingId, setTogglingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [banWarning, setBanWarning] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch user directory'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (user) => {
    if (user._id === currentUser?._id) {
      toast.error('You cannot ban your own administrator account.');
      return;
    }

    const actionName = user.banned ? 'unban' : 'ban';
    const confirmPrompt = window.confirm(
      `Are you sure you want to ${actionName} user "${user.name}" (${user.email})?`
    );
    if (!confirmPrompt) return;

    setTogglingId(user._id);
    try {
      let noticeMsg = '';
      if (user.banned) {
        await api.patch(`/admin/users/${user._id}/unban`);
        noticeMsg = `User "${user.name}" has been unbanned.`;
        toast.success(`✅ ${noticeMsg}`);
        setActionNotice(`✅ ${noticeMsg}`);
      } else {
        const res = await api.patch(`/admin/users/${user._id}/ban`);
        const autoCancelled = res.data?.autoCancelledCount || 0;
        const confirmedBookings = res.data?.confirmedBookingsCount || 0;

        if (confirmedBookings > 0) {
          noticeMsg = `User "${user.name}" has been banned. ${autoCancelled} unfinalized booking(s) were cancelled. This user still has ${confirmedBookings} confirmed, paid booking(s) needing manual follow-up.`;
          setActionNotice(`⚠️ ${noticeMsg}`);
          setBanWarning({
            userName: user.name,
            userEmail: user.email,
            autoCancelledCount: autoCancelled,
            confirmedBookingsCount: confirmedBookings,
          });
          toast.error(
            `⚠️ ${user.name} banned. ${confirmedBookings} confirmed paid booking(s) require manual admin attention!`,
            { duration: 7000 }
          );
        } else {
          noticeMsg = autoCancelled > 0
            ? `User "${user.name}" has been banned. ${autoCancelled} unfinalized booking(s) were cancelled.`
            : `User "${user.name}" has been banned.`;
          toast.success(`🚫 ${noticeMsg}`);
          setActionNotice(`🚫 ${noticeMsg}`);
        }
      }

      // Update state locally
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, banned: !u.banned } : u))
      );

      if (!banWarning) {
        setTimeout(() => setActionNotice(''), 6000);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${actionName} user`;
      toast.error(errMsg);
    } finally {
      setTogglingId(null);
    }
  };

  // Filtered users by search query and role
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term));

    let matchesRole = true;
    if (roleFilter === 'owner') matchesRole = u.role === 'owner';
    else if (roleFilter === 'renter') matchesRole = u.role === 'renter';
    else if (roleFilter === 'admin') matchesRole = u.role === 'admin';
    else if (roleFilter === 'banned') matchesRole = u.banned === true;
    else if (roleFilter === 'active') matchesRole = !u.banned;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-container">
      <div className="admin-page-header">
        <div>
          <div className="breadcrumb-nav">
            <Link to="/admin">← Admin Dashboard</Link>
          </div>
          <h2>👥 Registered Users Directory</h2>
          <p className="page-subtitle">
            Manage user accounts, roles, and platform permissions
          </p>
        </div>
        <button onClick={fetchUsers} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {/* Search & Role Filter Toolbar */}
      <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ flex: '1', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="🔍 Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="user-role-filter" className="admin-filter-label">
            Filter Directory:
          </label>
          <select
            id="user-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">All Accounts ({users.length})</option>
            <option value="owner">Owners Only</option>
            <option value="renter">Renters Only</option>
            <option value="admin">Administrators Only</option>
            <option value="banned">Banned Accounts</option>
            <option value="active">Active Accounts</option>
          </select>
        </div>
      </div>

      {actionNotice && (
        <div className="notice-banner success-banner">{actionNotice}</div>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <Spinner message="Loading user directory..." />
      ) : users.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">👥</span>
          <h3>No Users Found</h3>
          <p>No registered user accounts found in the database.</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">🔍</span>
          <h3>No Matching Users</h3>
          <p>No user accounts match "{searchTerm}" with the selected filter.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
            }}
            className="btn-secondary"
            style={{ marginTop: '0.75rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact Info</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Joined</th>
                <th>Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id} className={u.banned ? 'row-banned' : ''}>
                  <td>
                    <strong>{u.name}</strong>
                    {u.role === 'admin' && (
                      <span className="admin-badge-inline">Admin</span>
                    )}
                  </td>
                  <td>
                    <div>{u.email}</div>
                    <div className="table-subtext">{u.phone ? `📞 ${u.phone}` : 'No phone'}</div>
                  </td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>
                      {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                  </td>
                  <td>
                    {u.banned ? (
                      <span className="status-badge-inline status-rejected">
                        🚫 Banned
                      </span>
                    ) : (
                      <span className="status-badge-inline status-approved">
                        ✅ Active
                      </span>
                    )}
                  </td>
                  <td className="table-date">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {u._id === currentUser?._id ? (
                      <span className="protected-admin-tag" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.35)' }}>
                        Current Admin (You)
                      </span>
                    ) : u.role === 'admin' ? (
                      <span className="protected-admin-tag">Protected Admin</span>
                    ) : (
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={u.banned ? 'btn-unban' : 'btn-ban'}
                        disabled={togglingId === u._id}
                      >
                        {togglingId === u._id ? 'Processing...' : u.banned ? '🔓 Unban User' : '🚫 Ban User'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Warning Modal When Banned User Still Has Confirmed Paid Bookings */}
      {banWarning && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '540px', border: '2px solid #f59e0b', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f59e0b', borderBottom: '1px solid rgba(245, 158, 11, 0.25)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.6rem' }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Active Confirmed Bookings Attention</h3>
            </div>
            <div className="modal-body ban-modal-body">
              <p className="ban-modal-desc">
                Account for <strong>{banWarning.userName}</strong> ({banWarning.userEmail}) has been successfully set to <strong>Banned</strong>.
              </p>
              
              <div className="ban-cancelled-badge">
                <span>✓</span>
                <span>
                  <strong>{banWarning.autoCancelledCount}</strong> unfinalized (pending / awaiting payment) booking(s) were automatically cancelled.
                </span>
              </div>

              <div className="ban-warning-alert-card">
                <div className="ban-alert-title">
                  <span>🚨</span> Action Required: {banWarning.confirmedBookingsCount} Confirmed Booking(s) Untouched
                </div>
                <p className="ban-alert-desc">
                  This user still has <strong>{banWarning.confirmedBookingsCount} confirmed, paid booking(s)</strong>. These were intentionally <em>not</em> auto-cancelled to prevent automated refund and rental disputes.
                </p>
                <p className="ban-alert-action">
                  👉 Please navigate to the booking moderation panel to review and manually handle these confirmed commitments.
                </p>
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
              <button
                onClick={() => setBanWarning(null)}
                className="btn-primary"
                style={{ padding: '0.55rem 1.4rem', fontWeight: 600 }}
              >
                Understood, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
