import { useState, useEffect } from "react";
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
import { createClient } from '@supabase/supabase-js';
import "./Register.css";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

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
    setSuccess("");

    try {
      console.log("Registration attempt with:", formData.email);
      
      // Register user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim(),
            role: 'user'
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        console.error("Signup error:", authError);
        
        if (authError.message.includes("already registered")) {
          setErrors({ general: "This email is already registered. Please try logging in." });
        } else if (authError.message.includes("password")) {
          setErrors({ general: "Password is too weak. Please choose a stronger password." });
        } else if (authError.message.includes("rate limit")) {
          setErrors({ general: "Too many attempts. Please try again later." });
        } else {
          setErrors({ general: `Registration failed: ${authError.message}` });
        }
        return;
      }

      if (!authData.user) {
        setErrors({ general: "Registration failed. No user data received." });
        return;
      }

      // Create user profile
      try {
        await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.name.trim(),
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (profileErr) {
        console.warn("Profile creation warning:", profileErr);
      }

      // Show success message
      if (authData.session) {
        setSuccess("Account created successfully! Redirecting to dashboard...");
        
        const user = {
          id: authData.user.id,
          email: authData.user.email,
          name: formData.name.trim(),
          role: 'user'
        };
        
        localStorage.setItem("token", authData.session.access_token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("refresh_token", authData.session.refresh_token);
        
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1500);
        
      } else {
        setSuccess("Account created successfully! Please check your email to verify your account.");
        
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      }

    } catch (err) {
      console.error("Unexpected error:", err);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister(e);
    }
  };

  // MOBILE VIEW
  if (isMobile) {
    return (
      <div className="mobile-register-page">
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
          <h2>Create Account</h2>
          <p>Join PWI ERP System</p>
        </div>

        {/* Mobile Register Form */}
        <div className="mobile-register-card">
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

          <form onSubmit={handleRegister} className="mobile-register-form" noValidate>
            {/* Name Field */}
            <div className="mobile-input-group">
              <label>Full Name</label>
              <div className="mobile-input-wrapper">
                <FiUser className="mobile-input-icon" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
              </div>
              {errors.name && <div className="mobile-field-error">{errors.name}</div>}
            </div>

            {/* Email Field */}
            <div className="mobile-input-group">
              <label>Email</label>
              <div className="mobile-input-wrapper">
                <FiMail className="mobile-input-icon" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>
              {errors.email && <div className="mobile-field-error">{errors.email}</div>}
            </div>

            {/* Password Field */}
            <div className="mobile-input-group">
              <label>Password</label>
              <div className="mobile-input-wrapper">
                <FiLock className="mobile-input-icon" />
                <input
                  name="password"
                  type={showPass.password ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your password"
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
              {errors.password && <div className="mobile-field-error">{errors.password}</div>}
            </div>

            {/* Confirm Password Field */}
            <div className="mobile-input-group">
              <label>Confirm Password</label>
              <div className="mobile-input-wrapper">
                <FiLock className="mobile-input-icon" />
                <input
                  name="confirmPassword"
                  type={showPass.confirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Confirm your password"
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
              {errors.confirmPassword && <div className="mobile-field-error">{errors.confirmPassword}</div>}
            </div>

            {/* Terms & Conditions */}
            <div className="mobile-terms">
              <label>
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>
                  I agree to the{" "}
                  <Link to="/terms" className="mobile-terms-link">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="mobile-terms-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeTerms && <div className="mobile-field-error">{errors.agreeTerms}</div>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mobile-register-button"
            >
              {loading ? (
                <>
                  <div className="mobile-spinner"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mobile-login-link-container">
            <p className="mobile-login-text">
              Already have an account?{" "}
              <Link to="/login" className="mobile-login-link">
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

  // DESKTOP VIEW - New Improved Design
  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Panel - Registration Section */}
        <div className="left-panel">
          <div className="left-content">
            <h1 className="registration-title"># Registration</h1>
            
            <div className="welcome-section">
              <h2 className="welcome-title">Welcome Back!</h2>
              <p className="welcome-text">Although there are thousands?</p>
            </div>
            
            <div className="hello-section">
              <h2 className="hello-title">Hello, Welcome!</h2>
              <p className="hello-text">Don't have an account?</p>
            </div>
            
            <Link to="/login" className="login-redirect-button">
              Login
            </Link>
          </div>
        </div>

        {/* Right Panel - Registration Form */}
        <div className="right-panel">
          <div className="right-content">
            {/* PWI Header */}
            <div className="pwi-header">
              <div className="pwi-logo-container">
                <img
                  src="/images/logoA.png"
                  alt="PWI Logo"
                  className="pwi-logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="pwi-logo-fallback" aria-hidden="true">
                  <span className="pwi-logo-text">PWI</span>
                </div>
              </div>
              <div className="pwi-info">
                <h1 className="pwi-name">Pakistan Wire Industries</h1>
                <p className="pwi-tagline">Enterprise Resource Planning</p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="register-form-container">
              <div className="register-form-header">
                <h2>Registration</h2>
                <p>Create your account to continue</p>
              </div>
              
              {errors.general && (
                <div className="error-message">
                  <FiAlertCircle />
                  <span>{errors.general}</span>
                </div>
              )}

              {success && (
                <div className="success-message">
                  <FiCheck />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="register-form" noValidate>
                <div className="form-group">
                  <div className="input-group">
                    <FiUser className="input-icon" />
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Full Name"
                      disabled={loading}
                      required
                    />
                  </div>
                  {errors.name && <div className="field-error">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <FiMail className="input-icon" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Email Address"
                      disabled={loading}
                      required
                    />
                  </div>
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <FiLock className="input-icon" />
                    <input
                      name="password"
                      type={showPass.password ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="password-toggle"
                      disabled={loading}
                    >
                      {showPass.password ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && <div className="field-error">{errors.password}</div>}
                </div>

                <div className="form-group">
                  <div className="input-group">
                    <FiLock className="input-icon" />
                    <input
                      name="confirmPassword"
                      type={showPass.confirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Confirm Password"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="password-toggle"
                      disabled={loading}
                    >
                      {showPass.confirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
                </div>

                <div className="terms-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span className="checkmark"></span>
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
                  {errors.agreeTerms && <div className="field-error">{errors.agreeTerms}</div>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Register</span>
                      <FiArrowRight className="button-icon" />
                    </>
                  )}
                </button>
              </form>

              <div className="login-link">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" className="login-link-text">
                    Login here
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="register-footer">
              <p>&copy; {new Date().getFullYear()} Pakistan Wire Industries. All rights reserved.</p>
              <p>ERP System v2.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}