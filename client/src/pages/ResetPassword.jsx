import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ThreeAgriculturalBackground from '../components/ThreeAgriculturalBackground';
import SpecularButton from '../components/SpecularButton';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter a new password.');
      toast.error('Please enter a new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      toast.error('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      const msg =
        res.data?.message ||
        'Password reset successfully! You can now log in with your new password.';
      setSuccessMessage(msg);
      toast.success(msg, { duration: 4000 });

      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Your password has been successfully reset. Please log in with your new password.',
          },
        });
      }, 2500);
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reset password. The token may be invalid or expired.';
      setError(errMsg);
      toast.error(errMsg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <ThreeAgriculturalBackground />
      <div className="auth-container">
        <div className="auth-card auth-card-glass">
          <div className="auth-header-icon" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>
            🔒
          </div>
          <h2 style={{ textAlign: 'center' }}>Set New Password</h2>
          <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            Choose a strong password with at least 6 characters for your AgriRent account.
          </p>

          {error && (
            <div className="notice-banner warning-banner" style={{ marginBottom: '1.25rem' }}>
              <p>⚠️ {error}</p>
              {error.toLowerCase().includes('token') && (
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/forgot-password" className="btn-secondary" style={{ display: 'inline-block', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    Request New Reset Link →
                  </Link>
                </div>
              )}
            </div>
          )}

          {successMessage ? (
            <div className="notice-banner success-banner" style={{ textAlign: 'center', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>✅</div>
              <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>Success!</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                {successMessage}
              </p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.75rem', opacity: 0.85 }}>
                Redirecting to login page in a moment...
              </p>
              <div style={{ marginTop: '1rem' }}>
                <Link to="/login" className="btn-primary" style={{ display: 'inline-block', padding: '0.5rem 1.25rem', textDecoration: 'none' }}>
                  Go to Login Now →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    required
                    minLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-new-password">Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <SpecularButton
                type="submit"
                size="md"
                radius={12}
                tint="#059669"
                tintOpacity={0.92}
                textColor="#ffffff"
                lineColor="#34d399"
                baseColor="#047857"
                intensity={1.5}
                shineSize={18}
                shineFade={45}
                thickness={1.5}
                followMouse
                disabled={submitting}
                className="w-full-btn"
              >
                {submitting ? 'Updating Password...' : 'Save New Password'}
              </SpecularButton>
            </form>
          )}

          <p className="auth-switch" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Remembered your credentials? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
