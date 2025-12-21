import { useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail, FiArrowRight, FiUserPlus } from "react-icons/fi";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
        rememberMe
      });

      if (rememberMe) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.open('https://accounts.google.com', '_blank');
  };

  const handleMicrosoftLogin = () => {
    window.open('https://login.microsoftonline.com', '_blank');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">

        {/* Book Spine Effect */}
        <div className="book-spine"></div>

        {/* Left Panel - Login Form */}
        <div className="login-left-panel">
          <div className="login-content">

            {/* Logo Section - Logo and text SIDE BY SIDE */}
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
                <div className="logo-fallback">
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

              {/* Error Message */}
              {error && (
                <div className="error-container">
                  <div className="error-icon">!</div>
                  <div className="error-message">{error}</div>
                </div>
              )}

              {/* Login Form - NO LABELS */}
              <form onSubmit={handleLogin} className="login-form">

                {/* Email Input - NO LABEL */}
                <div className="form-group">
                  <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      placeholder="Enter your email"
                      onChange={(e) => setEmail(e.target.value)}
                      className="login-input"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Input - NO LABEL */}
                <div className="form-group">
                  <div className="form-label-row">
                    <div></div> {/* Empty div for spacing */}
                    <Link to="/forgot-password" className="forgot-password">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      placeholder="Enter your password"
                      onChange={(e) => setPassword(e.target.value)}
                      className="login-input"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="password-toggle"
                      disabled={loading}
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Submit */}
                <div className="form-bottom">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      className="remember-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">Keep me signed in</span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-button"
                  >
                    {loading ? (
                      <>
                        <div className="button-spinner"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <FiArrowRight className="button-icon" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Social Login - ABOVE REGISTER */}
              <div className="social-login">
                <button
                  type="button"
                  className="social-button google"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24">
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
                >
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#7FBA00" />
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>

              {/* Register Section - BELOW SOCIAL LOGIN */}
              <div className="register-section">
                <div className="register-icon">
                  <FiUserPlus />
                </div>
                <div className="register-content">
                  <p className="register-text">New to PWI ERP?</p>
                  <Link to="/register" className="register-button">
                    Create Account
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="login-footer">
              <p>© 2024 All rights reserved</p>
              <p className="footer-version">ERP System v2.0</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Features */}
        <div className="login-right-panel">
          <div className="right-content">

            {/* Welcome Section */}
            <div className="welcome-section-right">
              <h1 className="welcome-title-right">Manufacturing Excellence</h1>
              <p className="welcome-subtitle-right">Optimize your production workflow</p>
            </div>

            {/* Features List */}
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">⚙️</div>
                <div className="feature-content">
                  <h3>Production Control</h3>
                  <p>Real-time manufacturing monitoring</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">📈</div>
                <div className="feature-content">
                  <h3>Business Analytics</h3>
                  <p>Data-driven decision making</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🔐</div>
                <div className="feature-content">
                  <h3>Secure Access</h3>
                  <p>Enterprise-grade security</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <div className="feature-content">
                  <h3>Cloud Platform</h3>
                  <p>Access anywhere, anytime</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="stats-section">
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
              <h4 className="company-title">Pakistan Wire Industries</h4>
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