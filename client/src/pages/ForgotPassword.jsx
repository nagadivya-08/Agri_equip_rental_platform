import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ThreeAgriculturalBackground from '../components/ThreeAgriculturalBackground';
import SpecularButton from '../components/SpecularButton';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setInfoMessage('');

    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      const msg =
        res.data?.message ||
        'If that email exists, a reset link has been sent.';
      setInfoMessage(msg);
      setSubmitted(true);
      toast.success(msg, { duration: 5000 });
    } catch (err) {
      // Security standard: Always display generic message regardless of error/outcome
      const genericMsg = 'If that email exists, a reset link has been sent.';
      setInfoMessage(genericMsg);
      setSubmitted(true);
      toast.success(genericMsg, { duration: 5000 });
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
            🔑
          </div>
          <h2 style={{ textAlign: 'center' }}>Reset Your Password</h2>
          <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            Enter your registered email address and we'll send you a secure link to reset your password.
          </p>

          {infoMessage ? (
            <div className="notice-banner success-banner" style={{ textAlign: 'center', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📬</div>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Password Reset Email Sent</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                {infoMessage}
              </p>
              <p style={{ fontSize: '0.82rem', marginTop: '0.75rem', opacity: 0.8 }}>
                Check your inbox and spam folder. The link will remain active for 1 hour.
              </p>
              <div style={{ marginTop: '1.25rem' }}>
                <Link to="/login" className="btn-secondary" style={{ display: 'inline-block', padding: '0.5rem 1.25rem', textDecoration: 'none' }}>
                  ← Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="e.g. farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
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
                {submitting ? 'Sending Reset Link...' : 'Send Reset Link'}
              </SpecularButton>
            </form>
          )}

          <p className="auth-switch" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            Remembered your password? <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
