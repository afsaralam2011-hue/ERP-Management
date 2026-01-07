import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FiEye, 
  FiEyeOff, 
  FiLock, 
  FiMail, 
  FiArrowRight, 
  FiUserPlus,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiShield,
  FiTrendingUp,
  FiCloud,
  FiUsers,
  FiDollarSign
} from "react-icons/fi";
import { createClient } from '@supabase/supabase-js';
import "./Login.css";

// سپر بیس کلائنٹ
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});

// سلائیڈ ڈیٹا
const slidesData = [
  {
    id: 1,
    title: "Production Excellence",
    description: "Streamline your manufacturing process",
    icon: <FiHome />,
    color: "#3B82F6"
  },
  {
    id: 2,
    title: "Business Analytics",
    description: "Data-driven insights for decision making",
    icon: <FiTrendingUp />,
    color: "#10B981"
  },
  {
    id: 3,
    title: "Enterprise Security",
    description: "Bank-level security for your data",
    icon: <FiShield />,
    color: "#8B5CF6"
  },
  {
    id: 4,
    title: "Cloud Platform",
    description: "Access your ERP anytime, anywhere",
    icon: <FiCloud />,
    color: "#F59E0B"
  }
];

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const slideIntervalRef = useRef(null);
  const navigate = useNavigate();
  const mobileContentRef = useRef(null);

  // موبائل ڈیوائس چیک کریں
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // سلائیڈ آٹو پلے
  useEffect(() => {
    if (autoSlide && isMobile) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slidesData.length);
      }, 3000);
    }
    
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [autoSlide, isMobile]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name] || errors.general) {
      setErrors({});
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setErrors({ general: "Email and password are required" });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ general: "Invalid email format" });
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (error) {
        console.error("Login error:", error);
        setErrors({ general: "Invalid email or password" });
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
      setErrors({ general: "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin(e);
    }
  };

  // سلائیڈ کنٹرولز
  const nextSlide = () => {
    setAutoSlide(false);
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    setTimeout(() => setAutoSlide(true), 5000);
  };

  const prevSlide = () => {
    setAutoSlide(false);
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
    setTimeout(() => setAutoSlide(true), 5000);
  };

  const goToSlide = (index) => {
    setAutoSlide(false);
    setCurrentSlide(index);
    setTimeout(() => setAutoSlide(true), 5000);
  };

  // موبائل کے لیے UI
  if (isMobile) {
    return (
      <div className="mobile-login-page">
        {/* Top Slider Section - Compact */}
        <div className="mobile-slider-section">
          <div className="mobile-slider-container">
            <div 
              className="mobile-slider-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slidesData.map((slide, index) => (
                <div key={slide.id} className="mobile-slide">
                  <div 
                    className="mobile-slide-icon"
                    style={{ backgroundColor: slide.color }}
                  >
                    {slide.icon}
                  </div>
                  <div className="mobile-slide-content">
                    <h3>{slide.title}</h3>
                    <p>{slide.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Slider Controls */}
            <button className="mobile-slider-prev" onClick={prevSlide}>
              <FiChevronLeft />
            </button>
            <button className="mobile-slider-next" onClick={nextSlide}>
              <FiChevronRight />
            </button>
            
            {/* Slider Dots */}
            <div className="mobile-slider-dots">
              {slidesData.map((_, index) => (
                <button
                  key={index}
                  className={`mobile-slider-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Compact Header with Logo */}
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

        {/* Compact Welcome */}
        <div className="mobile-welcome">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {/* Scrollable Content Area */}
        <div className="mobile-scrollable-content" ref={mobileContentRef}>
          {/* Login Form */}
          <div className="mobile-login-card">
            {errors.general && (
              <div className="mobile-error">
                <FiAlertCircle />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="mobile-login-form">
              <div className="mobile-input-group">
                <FiMail className="mobile-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Email Address"
                  disabled={loading}
                  required
                />
              </div>

              <div className="mobile-input-group">
                <div className="mobile-password-header">
                  <Link to="/forgot-password" className="mobile-forgot-password">
                    Forgot Password?
                  </Link>
                </div>
                <FiLock className="mobile-input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Password"
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

              <button
                type="submit"
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
            </form>

            {/* Register Section */}
            <div className="mobile-register-section">
              <div className="mobile-register-icon">
                <FiUserPlus />
              </div>
              <div className="mobile-register-content">
                <p>New to PWI ERP?</p>
                <Link to="/register" className="mobile-register-button">
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="mobile-footer">
            <p>&copy; {new Date().getFullYear()} All rights reserved</p>
            <p>ERP System v2.0</p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop View (وہی رہے گا)
  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        {/* Book Spine - Desktop only */}
        <div className="book-spine">
          <div className="book-spine-line"></div>
          <div className="book-pages">
            <div className="book-page"></div>
            <div className="book-page"></div>
            <div className="book-page"></div>
            <div className="book-page"></div>
          </div>
        </div>

        {/* Left Panel */}
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
                <div className="error-container">
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
                      onKeyPress={handleKeyPress}
                      className={`login-input ${errors.email ? 'input-error' : ''}`}
                      disabled={loading}
                      required
                      placeholder=" "
                    />
                    <label htmlFor="email" className="floating-label">
                      Email Address
                    </label>
                  </div>
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
                      onKeyPress={handleKeyPress}
                      className={`login-input ${errors.password ? 'input-error' : ''}`}
                      disabled={loading}
                      required
                      placeholder=" "
                    />
                    <label htmlFor="password" className="floating-label">
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

        {/* Right Panel */}
        <div className="login-right-panel">
          <div className="right-content">
            <div className="pwi-title-container">
              <h1 className="pwi-main-title">Pakistan Wire Industries</h1>
              <p className="pwi-subtitle">Enterprise Resource Planning System</p>
            </div>
            
            {/* Desktop Slider */}
            <div className="desktop-slider">
              <div className="desktop-slider-track">
                {slidesData.map((slide, index) => (
                  <div 
                    key={slide.id} 
                    className={`desktop-slide ${index === currentSlide ? 'active' : ''}`}
                    style={{ 
                      backgroundColor: `${slide.color}15`,
                      borderLeft: `4px solid ${slide.color}`
                    }}
                  >
                    <div 
                      className="desktop-slide-icon"
                      style={{ color: slide.color }}
                    >
                      {slide.icon}
                    </div>
                    <div className="desktop-slide-content">
                      <h3>{slide.title}</h3>
                      <p>{slide.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="desktop-slider-dots">
                {slidesData.map((_, index) => (
                  <button
                    key={index}
                    className={`desktop-slider-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    style={{ 
                      backgroundColor: index === currentSlide ? slidesData[currentSlide].color : '#CBD5E1'
                    }}
                  />
                ))}
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