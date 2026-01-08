import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FiMail, 
  FiArrowRight, 
  FiAlertCircle,
  FiCheck,
  FiArrowLeft
} from "react-icons/fi";
import { createClient } from '@supabase/supabase-js';
import "./ForgotPassword.css";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    general: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear error for this field when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: "" }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: "" }));
    }
    if (success) {
      setSuccess("");
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {
      email: "",
      general: ""
    };
    let hasError = false;

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({ email: "", general: "" });
    setSuccess("");

    try {
      console.log("Password reset request for:", email);
      
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        setErrors({ 
          general: error.message,
          email: ""
        });
        return;
      }

      // Show success message
      setSuccess("Password reset instructions have been sent to your email. Please check your inbox.");
      
      // Clear form
      setEmail("");

    } catch (err) {
      console.error("Unexpected error:", err);
      setErrors({ 
        general: "An unexpected error occurred. Please try again.",
        email: ""
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
          <p>Enter your email to reset password</p>
        </div>

        {/* Mobile Forgot Password Form - صرف ایک فارم */}
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
              <label>Email Address</label>
              <div className="mobile-input-wrapper">
                <FiMail className="mobile-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>
              {errors.email && (
                <div className="mobile-field-error">
                  <FiAlertCircle className="mobile-error-icon" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mobile-login-button"
            >
              {loading ? (
                <>
                  <div className="mobile-spinner"></div>
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mobile-register-section">
            <p className="mobile-register-text">
              Remember your password?{" "}
              <Link to="/login" className="mobile-register-link">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="mobile-footer">
          <p>&copy; {new Date().getFullYear()} All rights reserved</p>
          <p>ERP System v2.0</p>
        </div>
      </div>
    );
  }

  // DESKTOP VIEW - New Design based on provided image
  return (
    <div className="new-login-page">
      <div className="new-login-container">
        {/* Left Panel - Login Section */}
        <div className="new-left-panel">
          <div className="new-left-content">
            <h1 className="new-registration-title"># Forgot Password</h1>
            
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

        {/* Right Panel - Forgot Password Form */}
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

            {/* Forgot Password Form Section - صرف ایک فارم */}
            <div className="new-login-forms-section">
              {/* Main Forgot Password Form */}
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
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>
                
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
                    <label className="new-form-label">Email Address</label>
                    <div className="new-input-wrapper">
                      <FiMail className="new-input-icon" />
                      <input
                        type="email"
                        value={email}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        className={`new-login-input ${errors.email ? 'new-input-error' : ''}`}
                        disabled={loading}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && (
                      <div className="new-field-error">
                        <FiAlertCircle className="new-error-icon-small" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="new-login-submit-button"
                  >
                    {loading ? (
                      <>
                        <div className="new-button-spinner"></div>
                        <span>Sending Instructions...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Instructions</span>
                        <FiArrowRight className="new-button-icon" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Login Link */}
              <div className="new-register-link-section">
                <p className="new-register-link-text">
                  Remember your password?{" "}
                  <Link to="/login" className="new-register-link">
                    Login here
                  </Link>
                </p>
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