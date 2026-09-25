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
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resetUrl, setResetUrl] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setInfoMessage('');
    setPreviewUrl(null);
    setResetUrl(null);

    try {
      const res = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      const msg =
        res.data?.message ||
        'If that email exists, a reset link has been sent.';
      setInfoMessage(msg);
      setPreviewUrl(res.data?.previewUrl || null);
      setResetUrl(res.data?.resetUrl || null);
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
            <div className="notice-banner success-banner" style={{ textAlign: 'center', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📬</div>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>Password Reset Email Sent</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '0.75rem' }}>
                {infoMessage}
              </p>

              {/* Direct Reset Action (available when account exists in dev/test) */}
              {resetUrl && (
                <div style={{ margin: '1rem 0', padding: '0.85rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
                  <p style={{ fontSize: '0.85rem', color: '#a7f3d0', marginBottom: '0.6rem', fontWeight: 600 }}>
                    🚀 Direct Reset Link:
                  </p>
                  <a
                    href={resetUrl}
                    className="btn-primary"
                    style={{
                      display: 'inline-block',
                      padding: '0.55rem 1.4rem',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                    }}
                  >
                    🔑 Click Here to Reset Password Now
                  </a>
                </div>
              )}

              {/* Ethereal Mail Sandbox Preview */}
              {previewUrl && (
                <div style={{ margin: '0.85rem 0', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.12)', borderRadius: '8px', border: '1px dashed rgba(96, 165, 250, 0.5)' }}>
                  <p style={{ fontSize: '0.82rem', color: '#bfdbfe', marginBottom: '0.5rem' }}>
                    📧 <strong>Developer Mail Sandbox (Ethereal):</strong><br />
                    Since live Gmail SMTP is not configured in .env, email was captured in Ethereal Sandbox.
                  </p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ display: 'inline-block', padding: '0.4rem 1rem', fontSize: '0.82rem', textDecoration: 'none' }}
                  >
                    🔗 View Full Email in Ethereal Web Inbox
                  </a>
                </div>
              )}

              <p style={{ fontSize: '0.82rem', marginTop: '0.75rem', opacity: 0.85, color: '#e2e8f0' }}>
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
