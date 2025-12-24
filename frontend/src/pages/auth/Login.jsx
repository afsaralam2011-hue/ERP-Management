import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FiEye, 
  FiEyeOff, 
  FiLock, 
  FiMail, 
  FiArrowRight, 
  FiUserPlus,
  FiAlertCircle 
} from "react-icons/fi";
import WelcomeHandwriting from "../../components/WelcomeHandwriting";
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
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });
  const navigate = useNavigate();

  const shouldFloatLabel = (field) => {
    return formData[field] || isFocused[field];
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      console.log("Login attempt with:", formData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser = {
        id: 1,
        name: "Test User",
        email: formData.email,
        role: "admin"
      };
      
      const mockToken = "mock-jwt-token-for-testing";
      
      if (formData.rememberMe) {
        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(mockUser));
      } else {
        sessionStorage.setItem("token", mockToken);
        sessionStorage.setItem("user", JSON.stringify(mockUser));
      }
      
      navigate("/dashboard", { replace: true });
      
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ general: "Login failed. Please check your credentials." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  const handleMicrosoftLogin = () => {
    console.log("Microsoft login clicked");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  useEffect(() => {
    const rememberedUser = localStorage.getItem("user");
    if (rememberedUser) {
      try {
        const user = JSON.parse(rememberedUser);
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
          rememberMe: true
        }));
      } catch (error) {
        console.error("Error parsing user from storage:", error);
      }
    }
  }, []);

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="book-spine">
          <div className="book-spine-line"></div>
          <div className="book-pages">
            <div className="book-page"></div>
            <div className="book-page"></div>
            <div className="book-page"></div>
            <div className="book-page"></div>
          </div>
        </div>

        <div className="login-left-panel">
          <div className="login-content">
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

            <div className="welcome-section-left">
              <h2 className="welcome-title">Welcome Back</h2>
              <p className="welcome-subtitle">Sign in to your account</p>
            </div>

            <div className="login-card">
              {errors.general && (
                <div className="error-container" role="alert">
                  <FiAlertCircle className="error-icon" />
                  <div className="error-message">{errors.general}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form" noValidate>
                <div className="form-group floating-label-group">
                  <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={() => handleBlur('email')}
                      onKeyPress={handleKeyPress}
                      className={`login-input ${errors.email ? 'input-error' : ''}`}
                      disabled={loading}
                      required
                    />
                    <label 
                      htmlFor="email" 
                      className={`floating-label ${shouldFloatLabel('email') ? 'floating-label-float' : ''}`}
                    >
                      Email Address
                    </label>
                  </div>
                  {errors.email && (
                    <div className="field-error">
                      {errors.email}
                    </div>
                  )}
                </div>

                <div className="form-group floating-label-group">
                  <div className="form-label-row">
                    <Link to="/forgot-password" className="forgot-password">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      id="password"
                      name="password"
                      type={showPass ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus('password')}
                      onBlur={() => handleBlur('password')}
                      onKeyPress={handleKeyPress}
                      className={`login-input ${errors.password ? 'input-error' : ''}`}
                      disabled={loading}
                      required
                    />
                    <label 
                      htmlFor="password" 
                      className={`floating-label ${shouldFloatLabel('password') ? 'floating-label-float' : ''}`}
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="password-toggle"
                      disabled={loading}
                    >
                      {showPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="field-error">
                      {errors.password}
                    </div>
                  )}
                </div>

                <div className="form-bottom">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      className="remember-checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={loading}
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

              <div className="social-login">
                <p className="social-login-text">
                  <span>Or sign in with</span>
                </p>
                <div className="social-buttons">
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
              </div>

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

            <footer className="login-footer">
              <p>&copy; {new Date().getFullYear()} All rights reserved</p>
              <p className="footer-version">ERP System v2.0</p>
            </footer>
          </div>
        </div>

        <div className="login-right-panel">
          <div className="right-content">
            <div className="pwi-title-container">
              <h1 className="pwi-main-title">Pakistan Wire Industries</h1>
              <p className="pwi-subtitle">Enterprise Resource Planning System</p>
            </div>
            
            {/* Welcome Handwriting (Continuous Loop) */}
            <div className="handwriting-effect-container">
              <WelcomeHandwriting />
            </div>
            
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

            <div className="stats-section">
              <div className="stat-item">
                <div className="stat-value">99.9%</div>
                <div className="stat-label">UPTIME</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">500+</div>
                <div className="stat-label">USERS</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">24/7</div>
                <div className="stat-label">SUPPORT</div>
              </div>
            </div>

            <div className="company-info-section">
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