import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  FiLock, 
  FiCheck, 
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiArrowLeft
} from "react-icons/fi";
import { createClient } from '@supabase/supabase-js';
import "./ResetPassword.css";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  
  const [showPass, setShowPass] = useState({
    password: false,
    confirmPassword: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if token is present in URL
  useEffect(() => {
    const checkToken = async () => {
      const hash = location.hash;
      
      // Supabase token comes in hash, e.g.: #access_token=xyz&refresh_token=abc
      if (!hash || !hash.includes('access_token')) {
        setIsValidToken(false);
        setErrors({ general: "Invalid or expired reset link. Please request a new password reset." });
      }
    };
    
    checkToken();
  }, [location]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: "" }));
    }
    if (success) {
      setSuccess("");
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPass(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!isValidToken) {
      setErrors({ general: "Invalid or expired reset link. Please request a new password reset." });
      return;
    }
    
    setLoading(true);
    setErrors({});
    setSuccess("");

    try {
      console.log("Attempting to reset password...");
      
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error("Password reset error:", error);
        setErrors({ 
          general: error.message || "Failed to reset password. Please try again.",
          password: "",
          confirmPassword: ""
        });
        return;
      }

      // Show success message
      setSuccess("Password has been reset successfully! Redirecting to login...");
      
      // Clear form
      setFormData({
        password: "",
        confirmPassword: ""
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);

    } catch (err) {
      console.error("Unexpected error:", err);
      setErrors({ 
        general: "An unexpected error occurred. Please try again.",
        password: "",
        confirmPassword: ""
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // MOBILE VIEW
  if (isMobile) {
    return (
      <div className="mobile-login-page">
        {/* Mobile Header with Logo */}
        <div className="mobile-header">
          <div className="mobile-logo-container">
            <img
              src="/images/logoA.png"
              alt="PWI Logo"
              className="mobile-company-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="mobile-logo-fallback" aria-hidden="true">
              <span className="mobile-logo-text">PWI</span>
            </div>
            <div className="mobile-company-info">
              <h1 className="mobile-company-name">Pakistan Wire Industries</h1>
              <p className="mobile-company-tagline">Enterprise Resource Planning</p>
            </div>
          </div>
        </div>

        {/* Mobile Welcome */}
        <div className="mobile-welcome">
          <h2>Reset Password</h2>
          <p>Create your new password</p>
        </div>

        {/* Mobile Reset Password Form */}
        <div className="mobile-login-card">
          <div className="mobile-back-link">
            <button 
              onClick={() => navigate("/login")}
              className="mobile-back-button"
            >
              <FiArrowLeft />
              Back to Login
            </button>
          </div>

          {!isValidToken && errors.general ? (
            <div className="mobile-error">
              <FiAlertCircle />
              <span>{errors.general}</span>
              <div style={{ marginTop: "15px" }}>
                <Link to="/forgot-password" className="mobile-forgot-password">
                  Request New Reset Link
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errors.general && (
                <div className="mobile-error">
                  <FiAlertCircle />
                  <span>{errors.general}</span>
                </div>
              )}

              {success && (
                <div className="mobile-success">
                  <FiCheck />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mobile-login-form" noValidate>
                <div className="mobile-input-group">
                  <label>New Password</label>
                  <div className="mobile-input-wrapper">
                    <FiLock className="mobile-input-icon" />
                    <input
                      name="password"
                      type={showPass.password ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter new password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="mobile-password-toggle"
                      disabled={loading}
                    >
                      {showPass.password ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mobile-field-error">
                      <FiAlertCircle className="mobile-error-icon" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                <div className="mobile-input-group">
                  <label>Confirm New Password</label>
                  <div className="mobile-input-wrapper">
                    <FiLock className="mobile-input-icon" />
                    <input
                      name="confirmPassword"
                      type={showPass.confirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Confirm new password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="mobile-password-toggle"
                      disabled={loading}
                    >
                      {showPass.confirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="mobile-field-error">
                      <FiAlertCircle className="mobile-error-icon" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isValidToken}
                  className="mobile-login-button"
                >
                  {loading ? (
                    <>
                      <div className="mobile-spinner"></div>
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <FiCheck />
                    </>
                  )}
                </button>
              </form>

              {/* Password Requirements */}
              <div className="mobile-password-requirements">
                <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                  <strong>Password must contain:</strong>
                </p>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                  <div style={{ 
                    width: "12px", 
                    height: "12px", 
                    borderRadius: "50%", 
                    backgroundColor: formData.password.length >= 6 ? "#4CAF50" : "#ccc",
                    marginRight: "8px"
                  }}></div>
                  <span style={{ fontSize: "12px", color: "#666" }}>At least 6 characters</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mobile Footer */}
        <div className="mobile-footer">
          <p>&copy; {new Date().getFullYear()} All rights reserved</p>
          <p>ERP System v2.0</p>
        </div>
      </div>
    );
  }

  // DESKTOP VIEW
  return (
    <div className="new-login-page">
      <div className="new-login-container">
        {/* Left Panel */}
        <div className="new-left-panel">
          <div className="new-left-content">
            <h1 className="new-registration-title"># Reset Password</h1>
            
            <div className="new-welcome-section">
              <h2 className="new-welcome-title">Welcome Back!</h2>
              <p className="new-welcome-text">Although there are thousands?</p>
            </div>
            
            <div className="new-hello-section">
              <h2 className="new-hello-title">Hello, Welcome!</h2>
              <p className="new-hello-text">Remember your password?</p>
            </div>
            
            <Link to="/login" className="new-register-button">
              Login
            </Link>
          </div>
        </div>

        {/* Right Panel */}
        <div className="new-right-panel">
          <div className="new-right-content">
            {/* PWI Header */}
            <div className="new-pwi-header">
              <div className="new-pwi-logo-container">
                <img
                  src="/images/logoA.png"
                  alt="PWI Logo"
                  className="new-pwi-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="new-pwi-logo-fallback" aria-hidden="true">
                  <span className="new-pwi-logo-text">PWI</span>
                </div>
              </div>
              <div className="new-pwi-info">
                <h1 className="new-pwi-name">Pakistan Wire Industries</h1>
                <p className="new-pwi-tagline">Enterprise Resource Planning</p>
              </div>
            </div>

            {/* Reset Password Form Section */}
            <div className="new-login-forms-section">
              {/* Main Reset Password Form */}
              <div className="new-login-form-container">
                <div className="new-forgot-header">
                  <button 
                    onClick={() => navigate("/login")}
                    className="new-forgot-back-button"
                  >
                    <FiArrowLeft />
                    Back to Login
                  </button>
                  <h2 className="new-login-form-title">Reset Password</h2>
                  <p className="new-forgot-subtitle">
                    Enter your new password below.
                  </p>
                </div>
                
                {!isValidToken && errors.general ? (
                  <div className="new-error-container" role="alert">
                    <FiAlertCircle className="new-error-icon" />
                    <div className="new-error-message">{errors.general}</div>
                    <div style={{ marginTop: "15px" }}>
                      <Link to="/forgot-password" className="new-forgot-password">
                        Request New Reset Link
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {errors.general && (
                      <div className="new-error-container" role="alert">
                        <FiAlertCircle className="new-error-icon" />
                        <div className="new-error-message">{errors.general}</div>
                      </div>
                    )}

                    {success && (
                      <div className="new-success-container">
                        <FiCheck className="new-success-icon" />
                        <div className="new-success-message">{success}</div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="new-login-form" noValidate>
                      <div className="new-form-group">
                        <label className="new-form-label">New Password</label>
                        <div className="new-input-wrapper">
                          <FiLock className="new-input-icon" />
                          <input
                            name="password"
                            type={showPass.password ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            className={`new-login-input ${errors.password ? 'new-input-error' : ''}`}
                            disabled={loading}
                            required
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('password')}
                            className="new-password-toggle"
                            disabled={loading}
                          >
                            {showPass.password ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {errors.password && (
                          <div className="new-field-error">
                            <FiAlertCircle className="new-error-icon-small" />
                            <span>{errors.password}</span>
                          </div>
                        )}
                      </div>

                      <div className="new-form-group">
                        <label className="new-form-label">Confirm New Password</label>
                        <div className="new-input-wrapper">
                          <FiLock className="new-input-icon" />
                          <input
                            name="confirmPassword"
                            type={showPass.confirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onKeyPress={handleKeyPress}
                            className={`new-login-input ${errors.confirmPassword ? 'new-input-error' : ''} ${
                              formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? 'new-input-success' : ''
                            }`}
                            disabled={loading}
                            required
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                            className="new-password-toggle"
                            disabled={loading}
                          >
                            {showPass.confirmPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                          {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <FiCheck className="new-password-match-icon" />
                          )}
                        </div>
                        {errors.confirmPassword && (
                          <div className="new-field-error">
                            <FiAlertCircle className="new-error-icon-small" />
                            <span>{errors.confirmPassword}</span>
                          </div>
                        )}
                      </div>

                      {/* Password Requirements */}
                      <div className="new-password-requirements">
                        <p style={{ fontSize: "13px", color: "#666", marginBottom: "10px", fontWeight: "500" }}>
                          <strong>Password must contain:</strong>
                        </p>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                          <div style={{ 
                            width: "14px", 
                            height: "14px", 
                            borderRadius: "50%", 
                            backgroundColor: formData.password.length >= 6 ? "#4CAF50" : "#ddd",
                            marginRight: "10px"
                          }}></div>
                          <span style={{ fontSize: "13px", color: "#666" }}>At least 6 characters</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !isValidToken}
                        className="new-login-submit-button"
                      >
                        {loading ? (
                          <>
                            <div className="new-button-spinner"></div>
                            <span>Resetting Password...</span>
                          </>
                        ) : (
                          <>
                            <span>Reset Password</span>
                            <FiCheck className="new-button-icon" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="new-login-footer">
              <p>&copy; {new Date().getFullYear()} Pakistan Wire Industries. All rights reserved.</p>
              <p>ERP System v2.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}