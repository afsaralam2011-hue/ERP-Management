import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiUser,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiStar,
  FiShield,
} from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";
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
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkTheme(savedTheme === "dark");
    } else {
      // Default to dark theme
      setIsDarkTheme(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Full name is required");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: "user"
          },
          emailRedirectTo: `${window.location.origin}/verify-success`
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: userData.user.id,
          full_name: formData.name,
          email: formData.email,
          role: "user"
        });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setSuccess(
        "🎉 Account created successfully! Please check your email to verify your account."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`erp-bg ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Theme Toggle */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
      >
        <FiStar className="theme-icon" />
        <span className="theme-tooltip">
          {isDarkTheme ? "Light Mode" : "Dark Mode"}
        </span>
      </button>

      {/* REGISTER CARD */}
      <div className="register-card">
        {/* LOGO AND COMPANY NAME */}
        <div className="company-header">
          <div className="logo-wrapper">
            <img 
              src="/assets/images/logo.png" 
              alt="PWI Logo" 
              className="company-logo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/80/6AECE1/ffffff?text=PWI";
              }}
            />
          </div>
          <div className="company-details">
            <h1 className="company-name">Pakistan Wire Industries</h1>
            <p className="company-type">Private Limited</p>
            <p className="erp-title">Enterprise Resource Planning System</p>
          </div>
        </div>

        <div className="register-header">
          <div className="register-title">
            <h2>Create Account</h2>
            <p className="register-subtitle">Join Pakistan Wire Industries ERP System</p>
          </div>
          
          <div className="security-badge">
            <FiShield className="badge-icon" />
            <span>Enterprise Security</span>
          </div>
        </div>

        {error && (
          <div className="register-error">
            <FiAlertCircle className="error-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="register-success">
            <FiCheckCircle className="success-icon" />
            <div className="success-content">
              <span className="success-title">Account Created!</span>
              <span className="success-message">{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister} className="register-form">
          <div className="input-group">
            <label>
              <FiUser className="label-icon" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="input-group">
            <label>
              <FiMail className="label-icon" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="input-group">
            <label>
              <FiLock className="label-icon" />
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <div className="input-group">
            <label>
              <FiLock className="label-icon" />
              Confirm Password
            </label>
            <input
              type="password"
              name="confirm"
              placeholder="Re-enter your password"
              value={formData.confirm}
              onChange={handleChange}
              required
              className="register-input"
            />
          </div>

          <button 
            type="submit" 
            className="register-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <FiArrowRight className="arrow-icon" />
              </>
            )}
          </button>

          <div className="divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="login-link">
            <FiArrowRight className="link-arrow" />
            Sign in to existing account
          </Link>
        </form>

        <div className="register-footer">
          <p>© {new Date().getFullYear()} Pakistan Wire Industries Private Limited</p>
          <p className="version">ERP System v2.0 • Enhanced Security</p>
        </div>
      </div>
    </div>
  );
}