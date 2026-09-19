import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register for AgriRent</h2>
        <p className="auth-subtitle">Create an account as an Equipment Owner or Renter</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
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
            <label htmlFor="email">Email Address *</label>
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
            <label htmlFor="password">Password *</label>
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
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="e.g. +1 555-0199"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="renter">Renter (I want to rent equipment)</option>
              <option value="owner">Owner (I want to list my equipment)</option>
            </select>
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
