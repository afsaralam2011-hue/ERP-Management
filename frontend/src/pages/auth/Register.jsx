import { useState } from "react"; // ✅ FIXED: Removed unused useEffect import
import { useNavigate, Link } from "react-router-dom";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiArrowRight, 
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  
  const [showPass, setShowPass] = useState({
    password: false,
    confirmPassword: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  
  const navigate = useNavigate();

  // Check if input has value or is focused for floating labels
  const shouldFloatLabel = (field) => {
    return formData[field] || isFocused[field];
  };

  // Handle focus
  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  // Handle blur
  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
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
    
    // Clear success message when user changes something
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
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
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
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Terms agreement validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      // Mock API call for testing
      console.log("Registration attempt with:", formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful registration
      setSuccess("Account created successfully! Redirecting to login...");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);

    } catch (err) {
      console.error("Registration error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.message?.includes("already registered")) {
        errorMessage = "This email is already registered. Please try logging in.";
      } else if (err.message?.includes("password")) {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (err.message?.includes("email")) {
        errorMessage = "Invalid email format. Please enter a valid email address.";
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key for form submission
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister(e);
    }
  };

  // Check password strength
  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    
    let strength = 0;
    if (formData.password.length >= 6) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;
    
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  // Get password strength color
  const getStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return '#ef4444';
      case 1: return '#ef4444';
      case 2: return '#f59e0b';
      case 3: return '#10b981';
      case 4: return '#10b981';
      default: return '#e2e8f0';
    }
  };

  // Calculate total strength bar width
  const strengthBarWidth = `${(passwordStrength / 4) * 100}%`;

  return (
    <div className="register-page-wrapper">
      <div className="register-container">
        {/* Book Spine Effect */}
        <div className="book-spine">
          <div className="book-spine-line"></div>
          <div className="book-pages">
            <div className="book-page"></div>
            <div className="book-page"></div>
            <div className="book-page"></div>
            <div className="book-page"></div>
          </div>
        </div>

        {/* Left Panel - Registration Form */}
        <div className="register-left-panel">
          <div className="register-content">
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

            {/* Welcome Section */}
            <div className="welcome-section-left">
              <h2 className="welcome-title">Create Account</h2>
              <p className="welcome-subtitle">Join PWI ERP System</p>
            </div>

            {/* Registration Card */}
            <div className="register-card">
              {/* General Error Message */}
              {errors.general && (
                <div className="error-container" role="alert">
                  <FiAlertCircle className="error-icon" />
                  <div className="error-message">{errors.general}</div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="success-container">
                  <FiCheck className="success-icon" />
                  <div className="success-message">{success}</div>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="register-form" noValidate>
                {/* Name Field */}
                <div className="form-group floating-label-group">
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      onBlur={() => handleBlur('name')}
                      onKeyPress={handleKeyPress}
                      className={`register-input ${errors.name ? 'input-error' : ''}`}
                      disabled={loading}
                      required
                    />
                    <label 
                      htmlFor="name" 
                      className={`floating-label ${shouldFloatLabel('name') ? 'floating-label-float' : ''}`}
                    >
                      Full Name
                    </label>
                  </div>
                  {errors.name && (
                    <div className="field-error">
                      {errors.name}
                    </div>
                  )}
                </div>

                {/* Email Field */}
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
                      className={`register-input ${errors.email ? 'input-error' : ''}`}
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

                {/* Password Field */}
                <div className="form-group floating-label-group">
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      id="password"
                      name="password"
                      type={showPass.password ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus('password')}
                      onBlur={() => handleBlur('password')}
                      onKeyPress={handleKeyPress}
                      className={`register-input ${errors.password ? 'input-error' : ''}`}
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
                      onClick={() => togglePasswordVisibility('password')}
                      className="password-toggle"
                      disabled={loading}
                    >
                      {showPass.password ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="field-error">
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="form-group floating-label-group">
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPass.confirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                      onKeyPress={handleKeyPress}
                      className={`register-input ${errors.confirmPassword ? 'input-error' : ''} ${
                        formData.password && formData.confirmPassword && formData.password === formData.confirmPassword ? 'input-success' : ''
                      }`}
                      disabled={loading}
                      required
                    />
                    <label 
                      htmlFor="confirmPassword" 
                      className={`floating-label ${shouldFloatLabel('confirmPassword') ? 'floating-label-float' : ''}`}
                    >
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="password-toggle"
                      disabled={loading}
                    >
                      {showPass.confirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                    {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <FiCheck className="password-match-icon" />
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <div className="field-error">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Password Strength Indicator */}
                <div className="password-strength-container">
                  <div className="password-strength-label">
                    Password Strength:
                    <span className="strength-text" style={{ color: getStrengthColor() }}>
                      {passwordStrength === 0 && " None"}
                      {passwordStrength === 1 && " Weak"}
                      {passwordStrength === 2 && " Fair"}
                      {passwordStrength === 3 && " Good"}
                      {passwordStrength === 4 && " Strong"}
                    </span>
                  </div>
                  
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{
                        width: strengthBarWidth,
                        backgroundColor: getStrengthColor()
                      }}
                    ></div>
                  </div>
                  
                  <div className="password-requirements">
                    <div className="requirement-item">
                      <div className={`requirement-check ${formData.password.length >= 6 ? 'met' : ''}`}>
                        {formData.password.length >= 6 ? "✓" : "•"}
                      </div>
                      <span>At least 6 characters</span>
                    </div>
                    <div className="requirement-item">
                      <div className={`requirement-check ${/[A-Z]/.test(formData.password) ? 'met' : ''}`}>
                        {/[A-Z]/.test(formData.password) ? "✓" : "•"}
                      </div>
                      <span>One uppercase letter</span>
                    </div>
                    <div className="requirement-item">
                      <div className={`requirement-check ${/[0-9]/.test(formData.password) ? 'met' : ''}`}>
                        {/[0-9]/.test(formData.password) ? "✓" : "•"}
                      </div>
                      <span>One number</span>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="terms-container">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      className="remember-checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="checkbox-text">
                      I agree to the{" "}
                      <Link to="/terms" className="terms-link">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="terms-link">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <div className="field-error">
                      {errors.agreeTerms}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="register-button"
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <FiArrowRight className="button-icon" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="divider">
                <span>Already have an account?</span>
              </div>

              {/* Login Link */}
              <div className="login-link-container">
                <p className="login-text">
                  Already registered?{" "}
                  <Link to="/login" className="login-link">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <footer className="register-footer">
              <p>&copy; {new Date().getFullYear()} All rights reserved</p>
              <p className="footer-version">ERP System v2.0</p>
            </footer>
          </div>
        </div>

        {/* Right Panel - Features */}
        <div className="register-right-panel">
          <div className="right-content">
            {/* Welcome Section */}
            <div className="welcome-section-right">
              <h2 className="welcome-title-right">Manufacturing Excellence</h2>
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
                  <h3>Enterprise Security</h3>
                  <p>Bank-level security protocols</p>
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

            {/* Stats Section */}
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