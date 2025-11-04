import React, { useState, useEffect } from 'react';
import './Signup.css';

const Signup = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [referralValidating, setReferralValidating] = useState(false);
  const [referralValid, setReferralValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors while typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset referral validation if typing in referral field
    if (name === 'referralCode') {
      setReferralValid(null);
    }
  };

  // Real-time referral code validation
  useEffect(() => {
    const validateReferral = async () => {
      if (!formData.referralCode) return;

      setReferralValidating(true);
      try {
        // Simulate API call - replace with actual endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock validation - replace with actual API call
        const isValid = formData.referralCode.length >= 6; // Simple mock validation
        setReferralValid(isValid);

        if (!isValid) {
          setErrors(prev => ({ ...prev, referralCode: 'Invalid referral code' }));
        } else {
          setErrors(prev => ({ ...prev, referralCode: '' }));
        }
      } catch (err) {
        setErrors(prev => ({ ...prev, referralCode: 'Error validating referral code' }));
        setReferralValid(false);
      } finally {
        setReferralValidating(false);
      }
    };

    const timeout = setTimeout(validateReferral, 500);
    return () => clearTimeout(timeout);
  }, [formData.referralCode]);

  // Form validation before submit
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.referralCode) {
      newErrors.referralCode = 'Referral code is required';
    } else if (referralValid === false) {
      newErrors.referralCode = 'Invalid referral code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the real token from backend
        localStorage.setItem('token', data.token);
        
        // Call onSignup with the actual user data from backend
        onSignup(data.user, data.token);
      } else {
        setErrors({ general: data.message || 'Signup failed' });
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="signup-container">
      <div className="signup-center">
        <div className="signup-card">
          {/* Header Section */}
          <div className="signup-header">
            <div className="logo">
              <span className="logo-icon">🔐</span>
              <span className="logo-text">Shopiy</span>
            </div>
            <p className="signup-subtitle">Join us today and start earning</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="signup-form">
            {errors.general && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {errors.general}
              </div>
            )}

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="input-container">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  placeholder="Enter your username"
                />
                <span className="input-icon"></span>
              </div>
              {errors.username && (
                <span className="field-error">
                  {errors.username}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                />
                <span className="input-icon"></span>
              </div>
              {errors.email && (
                <span className="field-error">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Create a password"
                />
                <span className="input-icon"></span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span className="field-error">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm your password"
                />
                <span className="input-icon"></span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Referral Code Field */}
            <div className="form-group">
              <label htmlFor="referralCode" className="form-label">
                Referral Code *
              </label>
              <div className="input-container">
                <input
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className={`form-input ${errors.referralCode ? 'input-error' : ''}`}
                  placeholder="Enter referral code"
                />
                <span className="input-icon"></span>
              </div>
              
              {/* Referral Validation Status */}
              {referralValidating && (
                <div className="referral-status validating">
                  <span>⏳</span>
                  Validating referral code...
                </div>
              )}
              
              {referralValid === true && !referralValidating && (
                <div className="referral-status valid">
                  <span>✅</span>
                  Referral code is valid!
                </div>
              )}
              
              {referralValid === false && !referralValidating && (
                <div className="referral-status invalid">
                  <span>❌</span>
                  Invalid referral code
                </div>
              )}
              
              {errors.referralCode && (
                <span className="field-error">
                  {errors.referralCode}
                </span>
              )}
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className={`signup-button ${isLoading || referralValid !== true ? 'disabled' : ''}`}
              disabled={isLoading || referralValid !== true}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="signup-footer">
            <p className="footer-text">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="switch-button"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;