import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ThreeAgriculturalBackground from '../components/ThreeAgriculturalBackground';
import SpecularButton from '../components/SpecularButton';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'renter',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error('Please fix the errors indicated in the form.');
      return;
    }

    setSubmitting(true);
    try {
      await register(formData);
      toast.success('🎉 Welcome to AgriRent! Your account has been created.');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);

      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const backendFieldMap = {};
        err.response.data.errors.forEach((e) => {
          backendFieldMap[e.field] = e.message;
        });
        setFieldErrors(backendFieldMap);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <ThreeAgriculturalBackground />
      <div className="auth-container">
        <div className="auth-card auth-card-glass">
          <h2>{t('auth.createAccount') || 'Register for AgriRent'}</h2>
          <p className="auth-subtitle">
            {t('auth.registerSubtitle') || 'Create an account as an Equipment Owner or Renter'}
          </p>

          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">{t('auth.fullName') || 'Full Name'} *</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                className={fieldErrors.name ? 'input-error' : ''}
                required
              />
              {fieldErrors.name && <span className="field-error-msg">{fieldErrors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('auth.email') || 'Email Address'} *</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="e.g. john@example.com"
                value={formData.email}
                onChange={handleChange}
                className={fieldErrors.email ? 'input-error' : ''}
                required
              />
              {fieldErrors.email && <span className="field-error-msg">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('auth.password') || 'Password'} *</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={fieldErrors.password ? 'input-error' : ''}
                required
              />
              {fieldErrors.password && <span className="field-error-msg">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t('auth.phone') || 'Phone Number'}</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">{t('auth.role') || 'Account Role'} *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="renter">{t('auth.roleFarmer') || 'Rent Equipment (Renter)'}</option>
                <option value="owner">{t('auth.roleOwner') || 'Owner (I want to list my equipment)'}</option>
              </select>
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
              {submitting ? (t('common.loading') || 'Registering...') : (t('auth.registerBtn') || 'Register')}
            </SpecularButton>
          </form>

          <p className="auth-switch">
            {t('auth.alreadyHaveAccount') || 'Already have an account?'}{' '}
            <Link to="/login">{t('auth.loginHere') || 'Log in here'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
