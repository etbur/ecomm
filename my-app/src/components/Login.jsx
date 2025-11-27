import React, { useState } from 'react';
import styles from './Login.module.css';

const Login = ({ onLogin, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the real token from backend
        localStorage.setItem('token', data.token);
        
        // Call onLogin with the actual user data and token from backend
        onLogin(data.user, data.token);
      } else {
        setErrors({ general: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCenter}>
        <div className={styles.loginCard}>
          {/* Header Section */}
          <div className={styles.loginHeader}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🔐</span>
              <span className={styles.logoText}>AuthApp</span>
            </div>
            <h1 className={styles.loginTitle}>Welcome Back</h1>
            <p className={styles.loginSubtitle}>Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {errors.general && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {errors.general}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Phone Number
              </label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                  placeholder="Enter your Phone"
                />
                <span className={styles.inputIcon}>📧</span>
              </div>
              {errors.email && (
                <span className={styles.fieldError}>
                  {errors.email}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Password
              </label>
              <div className={styles.inputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Enter your password"
                />
                <span className={styles.inputIcon}>🔒</span>
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span className={styles.fieldError}>
                  {errors.password}
                </span>
              )}
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" className={styles.checkbox} />
                <span className={styles.checkboxLabel}>Remember me</span>
              </label>
              <button type="button" className={styles.forgotPassword}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className={`${styles.loginButton} ${isLoading ? styles.loading : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  Signing In...
                </>
              ) : (
                <>
                  <span className={styles.buttonIcon}>🚀</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerText}>or continue with</span>
          </div>

          {/* Social Login */}
          <div className={styles.socialLogin}>
            <button type="button" className={styles.socialButton}>
              <span className={styles.socialIcon}>📱</span>
              Google
            </button>
            <button type="button" className={styles.socialButton}>
              <span className={styles.socialIcon}>🔵</span>
              Facebook
            </button>
          </div>

          {/* Footer */}
          <div className={styles.loginFooter}>
            <p className={styles.footerText}>
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                className={styles.switchButton}
              >
                Sign up now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;