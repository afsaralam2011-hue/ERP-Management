import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FiEye, 
  FiEyeOff, 
  FiLock, 
  FiMail, 
  FiArrowRight,
  FiAlertCircle
} from "react-icons/fi";
import { createClient } from '@supabase/supabase-js';
import "./Login.css";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const navigate = useNavigate();
  const formRef = useRef(null);

  // موبائل ڈیوائس چیک کریں
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Remember Me ایمیل
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
          rememberMe: true
        }));
      } catch (err) {
        console.log("No saved user found");
      }
    }
  }, []);

  // HTML5 built-in validation کے ساتھ فارم والیڈیشن
  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: ""
    };
    let hasError = false;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      hasError = true;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      hasError = true;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      hasError = true;
    }

    setErrors(newErrors);
    return !hasError;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // فیلڈ پر توجہ دینے پر خامی چھپائیں
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // HTML5 validation چیک کریں
    if (!validateForm()) {
      // Focus on first error field
      if (errors.email) {
        emailInputRef.current?.focus();
      } else if (errors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }
    
    setLoading(true);
    setErrors({ email: "", password: "", general: "" });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (error) {
        console.error("Login error:", error);
        
        if (error.message.includes("Invalid")) {
          setErrors({ 
            general: "Invalid email or password",
            email: "",
            password: ""
          });
        } else {
          setErrors({ 
            general: error.message,
            email: "",
            password: ""
          });
        }
        return;
      }
      
      if (data?.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.email.split('@')[0],
          role: 'user'
        };
        
        if (formData.rememberMe) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", data.session.access_token);
        } else {
          sessionStorage.setItem("user", JSON.stringify(userData));
          sessionStorage.setItem("token", data.session.access_token);
        }
        
        navigate("/dashboard", { replace: true });
      }
      
    } catch (err) {
      console.error("Login failed:", err);
      setErrors({ 
        general: "Login failed. Please try again.",
        email: "",
        password: ""
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin(e);
    }
  };

  // فیلڈ پر توجہ دینے پر خامی چھپائیں
  const handleInputFocus = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }
  };

  // Form submission with HTML5 validation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Check HTML5 validity
    const form = formRef.current;
    if (!form.checkValidity()) {
      // Show custom error messages
      validateForm();
      return;
    }
    
    handleLogin(e);
  };

  // موبائل کے لیے UI
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
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {/* Mobile Login Form - صرف ایک فارم */}
        <div className="mobile-login-content">
          <div className="mobile-login-card">
            {errors.general && (
              <div className="mobile-error">
                <FiAlertCircle />
                <span>{errors.general}</span>
              </div>
            )}

            <form 
              id="mobile-login-form"
              ref={formRef}
              onSubmit={handleFormSubmit} 
              className="mobile-login-form"
              noValidate
            >
              <div className="mobile-input-group">
                <label>Email</label>
                <div className="mobile-input-wrapper">
                  <FiMail className="mobile-input-icon" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleInputFocus('email')}
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

              <div className="mobile-input-group">
                <div className="mobile-password-header">
                  <label>Password</label>
                  <Link to="/forgot-password" className="mobile-forgot-password">
                    Forgot Password?
                  </Link>
                </div>
                <div className="mobile-input-wrapper">
                  <FiLock className="mobile-input-icon" />
                  <input
                    ref={passwordInputRef}
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleInputFocus('password')}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="mobile-password-toggle"
                    disabled={loading}
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="mobile-field-error">
                    <FiAlertCircle className="mobile-error-icon" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className="mobile-remember">
                <label>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>
            </form>

            {/* Mobile Register Link */}
            <div className="mobile-register-section">
              <p className="mobile-register-text">
                Don't have an account?{" "}
                <Link to="/register" className="mobile-register-link">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section with Login Button and Footer */}
        <div className="mobile-fixed-bottom">
          <button
            type="submit"
            form="mobile-login-form"
            disabled={loading}
            className="mobile-login-button"
          >
            {loading ? (
              <>
                <div className="mobile-spinner"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight />
              </>
            )}
          </button>

          {/* Mobile Footer */}
          <div className="mobile-footer">
            <p>&copy; {new Date().getFullYear()} All rights reserved</p>
            <p>ERP System v2.0</p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop View - صرف ایک کام کرنے والا فارم
  return (
    <div className="new-login-page">
      <div className="new-login-container">
        {/* Left Panel - Registration Section */}
        <div className="new-left-panel">
          <div className="new-left-content">
            <h1 className="new-registration-title"># Registration</h1>
            
            <div className="new-welcome-section">
              <h2 className="new-welcome-title">Welcome Back!</h2>
              <p className="new-welcome-text">Although there are thousands?</p>
            </div>
            
            <div className="new-hello-section">
              <h2 className="new-hello-title">Hello, Welcome!</h2>
              <p className="new-hello-text">Don't have an account?</p>
            </div>
            
            <Link to="/register" className="new-register-button">
              Register
            </Link>
          </div>
        </div>

        {/* Right Panel - Login Section */}
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

            {/* Login Form Section - صرف ایک فارم */}
            <div className="new-login-forms-section">
              {/* Main Login Form */}
              <div className="new-login-form-container">
                <div className="new-login-form-title">Login</div>
                
                {errors.general && (
                  <div className="new-error-container" role="alert">
                    <FiAlertCircle className="new-error-icon" />
                    <div className="new-error-message">{errors.general}</div>
                  </div>
                )}

                <form 
                  ref={formRef}
                  onSubmit={handleFormSubmit} 
                  className="new-login-form"
                  noValidate
                >
                  <div className="new-form-group">
                    <label className="new-form-label">Email</label>
                    <div className="new-input-wrapper">
                      <FiMail className="new-input-icon" />
                      <input
                        ref={emailInputRef}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleInputFocus('email')}
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

                  <div className="new-form-group">
                    <div className="new-form-label-row">
                      <label className="new-form-label">Password</label>
                      <Link to="/forgot-password" className="new-forgot-password">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="new-input-wrapper">
                      <FiLock className="new-input-icon" />
                      <input
                        ref={passwordInputRef}
                        type={showPass ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => handleInputFocus('password')}
                        onKeyPress={handleKeyPress}
                        className={`new-login-input ${errors.password ? 'new-input-error' : ''}`}
                        disabled={loading}
                        required
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="new-password-toggle"
                        disabled={loading}
                      >
                        {showPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="new-field-error">
                        <FiAlertCircle className="new-error-icon-small" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className="new-form-bottom">
                    <label className="new-checkbox-label">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        className="new-remember-checkbox"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <span className="new-checkbox-custom"></span>
                      <span className="new-checkbox-text">Remember me</span>
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="new-login-submit-button"
                    >
                      {loading ? (
                        <>
                          <div className="new-button-spinner"></div>
                          <span>Logging in...</span>
                        </>
                      ) : (
                        <>
                          <span>Login</span>
                          <FiArrowRight className="new-button-icon" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Register Link */}
              <div className="new-register-link-section">
                <p className="new-register-link-text">
                  Don't have an account?{" "}
                  <Link to="/register" className="new-register-link">
                    Create Account
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