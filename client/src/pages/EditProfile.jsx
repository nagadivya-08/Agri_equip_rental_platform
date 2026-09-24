import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SpecularButton from '../components/SpecularButton';

const EditProfile = () => {
  const { user, updateUser } = useAuth();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Sync state if user loads/updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!name.trim()) {
      setProfileErrorMsg('Full Name cannot be empty.');
      toast.error('Full Name is required.');
      return;
    }

    setProfileSaving(true);
    try {
      const res = await api.patch('/auth/profile', {
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
      });

      const updatedUser = res.data.user;
      // Update AuthContext state immediately without requiring re-login
      if (updateUser && updatedUser) {
        updateUser(updatedUser);
      }

      const msg = res.data?.message || 'Profile updated successfully!';
      setProfileSuccessMsg(msg);
      toast.success(`✅ ${msg}`);
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update profile. Please try again.';
      setProfileErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      toast.error('Current password is required.');
      return;
    }

    if (!newPassword) {
      setPasswordErrorMsg('Please enter a new password.');
      toast.error('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      toast.error('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirm password do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      const msg = res.data?.message || 'Password changed successfully!';
      setPasswordSuccessMsg(msg);
      toast.success(`🔐 ${msg}`);
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(''), 4000);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to change password. Please check your current password.';
      setPasswordErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="page-container edit-profile-page" style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="breadcrumb-nav" style={{ marginBottom: '1rem' }}>
        <Link to="/dashboard" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0 }}>👤 Account & Profile Settings</h1>
        <p className="page-subtitle" style={{ color: 'var(--text-muted, #94a3b8)', marginTop: '0.4rem' }}>
          Manage your personal information, contact coordinates, and account security
        </p>
      </div>

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Profile Information Section */}
        <div className="dashboard-card profile-details-card" style={{ padding: '1.75rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📝</span> Personal Information
            </h3>
            <span className={`role-badge role-${user?.role || 'renter'}`} style={{ textTransform: 'uppercase', fontSize: '0.75rem', padding: '3px 8px' }}>
              {user?.role || 'renter'}
            </span>
          </div>

          {profileSuccessMsg && (
            <div className="notice-banner success-banner" style={{ marginBottom: '1rem' }}>
              ✅ {profileSuccessMsg}
            </div>
          )}

          {profileErrorMsg && (
            <div className="notice-banner warning-banner" style={{ marginBottom: '1rem' }}>
              ⚠️ {profileErrorMsg}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="user-email" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Email Address</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>🔒 Read-only (primary identifier)</span>
              </label>
              <input
                id="user-email"
                type="email"
                value={user?.email || ''}
                disabled
                readOnly
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'not-allowed',
                  opacity: 0.75,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-name">Full Name *</label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (profileErrorMsg) setProfileErrorMsg('');
                }}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="user-phone">Phone Number</label>
              <input
                id="user-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
              <small style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Used by farmers and renters to coordinate equipment pickups and handovers.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="user-location">Primary Location / Region</label>
              <input
                id="user-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, Maharashtra"
              />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <SpecularButton
                type="submit"
                size="md"
                radius={10}
                tint="#059669"
                tintOpacity={0.92}
                textColor="#ffffff"
                lineColor="#34d399"
                baseColor="#047857"
                intensity={1.4}
                shineSize={18}
                shineFade={45}
                thickness={1.5}
                followMouse
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </SpecularButton>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="dashboard-card password-card" style={{ padding: '1.75rem', borderRadius: '14px' }}>
          <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔐</span> Security & Password Change
            </h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Update your account password. You will need your current password to confirm this change.
            </p>
          </div>

          {passwordSuccessMsg && (
            <div className="notice-banner success-banner" style={{ marginBottom: '1rem' }}>
              ✅ {passwordSuccessMsg}
            </div>
          )}

          {passwordErrorMsg && (
            <div className="notice-banner warning-banner" style={{ marginBottom: '1rem' }}>
              ⚠️ {passwordErrorMsg}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="current-pw">Current Password *</label>
              <div className="password-input-wrapper">
                <input
                  id="current-pw"
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordErrorMsg) setPasswordErrorMsg('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="new-pw">New Password * (Min 6 characters)</label>
              <div className="password-input-wrapper">
                <input
                  id="new-pw"
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrorMsg) setPasswordErrorMsg('');
                  }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPw(!showNewPw)}
                  aria-label={showNewPw ? 'Hide password' : 'Show password'}
                >
                  {showNewPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-pw">Confirm New Password *</label>
              <div className="password-input-wrapper">
                <input
                  id="confirm-pw"
                  type={showConfirmPw ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrorMsg) setPasswordErrorMsg('');
                  }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <SpecularButton
                type="submit"
                size="md"
                radius={10}
                tint="#047857"
                tintOpacity={0.92}
                textColor="#ffffff"
                lineColor="#34d399"
                baseColor="#065f46"
                intensity={1.4}
                shineSize={18}
                shineFade={45}
                thickness={1.5}
                followMouse
                disabled={passwordSaving}
              >
                {passwordSaving ? 'Updating Password...' : 'Change Password'}
              </SpecularButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
