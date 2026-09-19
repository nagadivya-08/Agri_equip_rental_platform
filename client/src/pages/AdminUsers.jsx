import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionNotice, setActionNotice] = useState('');

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
    const actionName = user.banned ? 'unban' : 'ban';
    const confirmPrompt = window.confirm(
      `Are you sure you want to ${actionName} user "${user.name}" (${user.email})?`
    );
    if (!confirmPrompt) return;

    try {
      if (user.banned) {
        await api.patch(`/admin/users/${user._id}/unban`);
        setActionNotice(`✅ User "${user.name}" has been unbanned.`);
      } else {
        await api.patch(`/admin/users/${user._id}/ban`);
        setActionNotice(`🚫 User "${user.name}" has been banned.`);
      }

      // Update state locally
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, banned: !u.banned } : u))
      );

      setTimeout(() => setActionNotice(''), 4000);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        `Failed to ${actionName} user`
      );
    }
  };

  return (
    <div className="page-container">
      <div className="admin-page-header">
        <div>
          <div className="breadcrumb-nav">
            <Link to="/admin">← Admin Dashboard</Link>
          </div>
          <h2>👥 Platform User Management</h2>
          <p className="page-subtitle">
            Inspect all registered owners, renters, and administrator accounts
          </p>
        </div>
        <button onClick={fetchUsers} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {actionNotice && (
        <div className="notice-banner success-banner">{actionNotice}</div>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <div className="loading-container">
          <p>Loading registered users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">👥</span>
          <h3>No Users Found</h3>
          <p>No registered user accounts found in the database.</p>
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
              {users.map((u) => (
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
                    {u.role === 'admin' ? (
                      <span className="protected-admin-tag">Protected Admin</span>
                    ) : (
                      <button
                        onClick={() => handleToggleBan(u)}
                        className={u.banned ? 'btn-unban' : 'btn-ban'}
                      >
                        {u.banned ? '🔓 Unban User' : '🚫 Ban User'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
