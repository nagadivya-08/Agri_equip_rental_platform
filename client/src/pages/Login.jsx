import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThreeAgriculturalBackground from '../components/ThreeAgriculturalBackground';
import SpecularButton from '../components/SpecularButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      toast.error('Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('👋 Welcome back! Logged in successfully.');
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <ThreeAgriculturalBackground />
      <div className="auth-container">
        <div className="auth-card auth-card-glass">
          <h2>{t('auth.welcomeBack') || 'Login to AgriRent'}</h2>
          <p className="auth-subtitle">
            {t('auth.loginSubtitle') || 'Welcome back! Access your equipment dashboard.'}
          </p>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">{t('auth.email') || 'Email Address'}</label>
              <input
                id="email"
                type="email"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('auth.password') || 'Password'}</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="forgot-password-link-wrapper">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
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
              {submitting ? (t('common.loading') || 'Logging in...') : (t('auth.loginBtn') || 'Sign In')}
            </SpecularButton>
          </form>

          <p className="auth-switch">
            {t('auth.dontHaveAccount') || "Don't have an account?"}{' '}
            <Link to="/register">{t('auth.registerHere') || 'Register here'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
