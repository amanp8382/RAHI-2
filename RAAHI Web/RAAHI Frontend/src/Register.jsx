import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './styles/auth.css';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const passwordChecks = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password)
});

const Register = () => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '', details: [] });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const checks = useMemo(() => passwordChecks(formData.password), [formData.password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatus({ type: '', message: '', details: [] });
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) nextErrors.firstName = 'First name is required.';
    else if (formData.firstName.trim().length < 2) nextErrors.firstName = 'First name must be at least 2 characters.';

    if (!formData.lastName.trim()) nextErrors.lastName = 'Last name is required.';
    else if (formData.lastName.trim().length < 2) nextErrors.lastName = 'Last name must be at least 2 characters.';

    if (!formData.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) nextErrors.email = 'Enter a valid email address.';

    if (!checks.length || !checks.uppercase || !checks.lowercase || !checks.number) {
      nextErrors.password = 'Password must be 8+ characters and include uppercase, lowercase, and a number.';
    }

    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.';
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const result = await register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password
    });

    if (!result.success) {
      setStatus({
        type: 'error',
        message: result.error || 'Registration failed.',
        details: result.details || []
      });
      return;
    }

    setStatus({
      type: 'success',
      message: result.message || 'Account created successfully.',
      details: []
    });

    setTimeout(() => {
      navigate('/profile-setup');
    }, 900);
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-copy">
          <p className="auth-eyebrow">RAAHI</p>
          <h1>Create Your Account</h1>
          <p className="auth-subtitle">Start with your basic details. You can complete travel preferences and your profile photo in the next step.</p>
          <div className="auth-tip-list">
            <div>Tourist-first onboarding</div>
            <div>Secure password requirements</div>
            <div>Profile completion right after signup</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form-header">
            <h2>Register</h2>
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>

          {status.message && (
            <div className={`auth-alert auth-alert-${status.type}`}>
              <p>{status.message}</p>
              {status.details?.length > 0 && (
                <ul>
                  {status.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="auth-grid">
            <div className="auth-field">
              <label htmlFor="firstName">First Name</label>
              <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} disabled={isLoading} />
              {errors.firstName && <span className="auth-error">{errors.firstName}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="lastName">Last Name</label>
              <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} disabled={isLoading} />
              {errors.lastName && <span className="auth-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={isLoading} />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-password-row">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} disabled={isLoading} />
              <button type="button" className="auth-toggle" onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {errors.password && <span className="auth-error">{errors.password}</span>}
            <div className="password-checklist">
              <span className={checks.length ? 'valid' : ''}>8+ chars</span>
              <span className={checks.uppercase ? 'valid' : ''}>Uppercase</span>
              <span className={checks.lowercase ? 'valid' : ''}>Lowercase</span>
              <span className={checks.number ? 'valid' : ''}>Number</span>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-password-row">
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} />
              <button type="button" className="auth-toggle" onClick={() => setShowConfirmPassword((prev) => !prev)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
            </div>
            {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
          </div>

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
