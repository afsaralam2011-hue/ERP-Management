import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiArrowRight,
  FiStar,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Theme state
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkTheme(savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    localStorage.setItem("theme", !isDarkTheme ? "dark" : "light");
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(
        "Password reset email sent. Please check your inbox."
      );
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`erp-bg ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* THEME TOGGLE */}
      <button className="theme-toggle" onClick={toggleTheme}>
        <FiStar className="theme-icon" />
      </button>

      {/* LOGIN CARD */}
      <div className="erp-login-card">
        {/* BRANDING */}
        <div className="erp-brand-inline">
          <img src="/assets/images/logo.png" alt="PWI" />
          <div className="company-text">
            <h3 className="company-name">Pakistan Wire Industries</h3>
            <p className="company-type">Private Limited</p>
          </div>
        </div>
        
        <h1 className="erp-title">Forgot Password</h1>
        <p className="erp-subtitle">Enter your email to reset your password</p>

        {error && (
          <div className="erp-error">
            <FiAlertCircle className="error-icon" /> {error}
          </div>
        )}

        {success && (
          <div className="erp-success">
            <FiCheckCircle className="success-icon" /> {success}
          </div>
        )}

        <form onSubmit={handleReset} className="erp-form">
          <div className="erp-input">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="erp-login-btn" disabled={loading}>
            {loading ? "Sending Email..." : "Send Reset Link"}
            <FiArrowRight className="btn-icon" />
          </button>
        </form>

        <div className="erp-register">
          <span className="register-text">Remember your password?</span>
          <Link to="/login" className="register-link">
            Back to Login
          </Link>
        </div>

        <div className="erp-footer">
          © {new Date().getFullYear()} Pakistan Wire Industries
        </div>
      </div>
    </div>
  );
}