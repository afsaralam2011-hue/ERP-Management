import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../api/axios";
import { 
  FiEye, 
  FiEyeOff, 
  FiLock, 
  FiMail, 
  FiArrowRight, 
  FiUserPlus,
  FiAlertCircle 
} from "react-icons/fi";
import "./Login.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const res = await axios.post("/api/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      // Store authentication data
      if (formData.rememberMe) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Login failed. Please check your credentials.";
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Social login handlers (placeholder - implement proper OAuth)
  const handleGoogleLogin = () => {
    // This should redirect to backend OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  const handleMicrosoftLogin = () => {
    // This should redirect to backend OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/microsoft`;
  };

  // Handle Enter key for form submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        {/* Book Spine Effect - Hidden on mobile */}
        <div className="book-spine" aria-hidden="true"></div>

        {/* Left Panel - Login Form */}
        <div className="login-left-panel">
          <div className="login-content">
            {/* Logo Section */}
            <div className="logo-section">
              <div className="logo-container">
                <img
                  src="/images/logoA.png"
                  alt="PWI Logo"
                  className="company-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="logo-fallback" aria-hidden="true">
                  <span className="logo-text">PWI</span>
                </div>
              </div>
              <div className="company-info">
                <h1 className="company-name">Pakistan Wire Industries</h1>
                <p className="company-tagline">Enterprise Resource Planning</p>
              </div>
            </div>

            {/* Welcome Back Section */}
            <div className="welcome-section-left">
              <h2 className="welcome-title">Welcome Back</h2>
              <p className="welcome-subtitle">Sign in to your account</p>
            </div>

            {/* Login Card */}
            <div className="login-card">
              {/* General Error Message */}
              {errors.general && (
                <div 
                  className="error-container" 
                  role="alert"
                  aria-live="assertive"
                >
                  <FiAlertCircle className="error-icon" />
                  <div className="error-message">{errors.general}</div>
                </div>
              )}

              {/* Login Form */}
              <form 
                onSubmit={handleLogin} 
                className="login-form"
                noValidate
                aria-label="Login form"
              >
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email" className="visually-hidden">
                    Email Address
                  </label>
                  <div className="input-wrapper">
                    <FiMail className="input-icon" aria-hidden="true" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      placeholder="Enter your email"
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className={`login-input ${errors.email ? 'input-error' : ''}`}
                      disabled={loading}
                      aria-label="Email address"
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <div 
                      id="email-error" 
                      className="field-error"
                      role="alert"
                    >
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="password" className="visually-hidden">
                      Password
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="forgot-password"
                      aria-label="Forgot password"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" aria-hidden="true" />
                    <input
                      id="password"
                      name="password"
                      type={showPass ? "text" : "password"}
                      value={formData.password}
                      placeholder="Enter your password"
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className={`login-input ${errors.password ? 'input-error' : ''}`}
                      disabled={loading}
                      aria-label="Password"
                      aria-required="true"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="password-toggle"
                      disabled={loading}
                      aria-label={showPass ? "Hide password" : "Show password"}
                      aria-pressed={showPass}
                    >
                      {showPass ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div 
                      id="password-error" 
                      className="field-error"
                      role="alert"
                    >
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Remember Me & Submit */}
                <div className="form-bottom">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      className="remember-checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={loading}
                      aria-label="Keep me signed in"
                    />
                    <span className="checkbox-custom" aria-hidden="true"></span>
                    <span className="checkbox-text">Keep me signed in</span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-button"
                    aria-label={loading ? "Signing in..." : "Sign in"}
                  >
                    {loading ? (
                      <>
                        <div className="button-spinner" aria-hidden="true"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <FiArrowRight className="button-icon" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Social Login */}
              <div className="social-login">
                <p className="social-login-text" aria-label="Or sign in with">
                  <span>Or sign in with</span>
                </p>
                <div className="social-buttons">
                  <button
                    type="button"
                    className="social-button google"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    aria-label="Sign in with Google"
                  >
                    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    className="social-button microsoft"
                    onClick={handleMicrosoftLogin}
                    disabled={loading}
                    aria-label="Sign in with Microsoft"
                  >
                    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#7FBA00" />
                    </svg>
                    <span>Microsoft</span>
                  </button>
                </div>
              </div>

              {/* Register Section */}
              <div className="register-section">
                <div className="register-icon" aria-hidden="true">
                  <FiUserPlus />
                </div>
                <div className="register-content">
                  <p className="register-text">New to PWI ERP?</p>
                  <Link 
                    to="/register" 
                    className="register-button"
                    aria-label="Create new account"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="login-footer">
              <p>&copy; {new Date().getFullYear()} All rights reserved</p>
              <p className="footer-version">ERP System v2.0</p>
            </footer>
          </div>
        </div>

        {/* Right Panel - Features */}
        <div className="login-right-panel" aria-label="System features">
          <div className="right-content">
            {/* Welcome Section */}
            <div className="welcome-section-right">
              <h2 className="welcome-title-right">Manufacturing Excellence</h2>
              <p className="welcome-subtitle-right">Optimize your production workflow</p>
            </div>

            {/* Features List */}
            <div className="features-list" role="list">
              <div className="feature-item" role="listitem">
                <div className="feature-icon" aria-hidden="true">⚙️</div>
                <div className="feature-content">
                  <h3>Production Control</h3>
                  <p>Real-time manufacturing monitoring</p>
                </div>
              </div>

              <div className="feature-item" role="listitem">
                <div className="feature-icon" aria-hidden="true">📈</div>
                <div className="feature-content">
                  <h3>Business Analytics</h3>
                  <p>Data-driven decision making</p>
                </div>
              </div>

              <div className="feature-item" role="listitem">
                <div className="feature-icon" aria-hidden="true">🔐</div>
                <div className="feature-content">
                  <h3>Secure Access</h3>
                  <p>Enterprise-grade security</p>
                </div>
              </div>

              <div className="feature-item" role="listitem">
                <div className="feature-icon" aria-hidden="true">🚀</div>
                <div className="feature-content">
                  <h3>Cloud Platform</h3>
                  <p>Access anywhere, anytime</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-section" role="complementary">
              <div className="stat-item">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">500+</div>
                <div className="stat-label">Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>

            {/* Company Info */}
            <div className="company-section">
              <h3 className="company-title">Pakistan Wire Industries</h3>
              <p className="company-description">
                Leading manufacturer of quality wires with decades of industry expertise
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}