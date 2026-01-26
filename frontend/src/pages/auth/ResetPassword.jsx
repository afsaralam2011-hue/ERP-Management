import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLock,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle,
  FiStar
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

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(true);
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
  };

  // ✅ Detect recovery session from email link
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setError("Invalid or expired reset link.");
        setLoading(false);
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess("Password updated successfully!");

      // Optional auto logout after reset
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`erp-bg ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
        <div className="erp-login-card">
          <div className="erp-brand-inline">
            <img src="/assets/images/logo.png" alt="PWI" />
            <div className="company-text">
              <h3 className="company-name">Pakistan Wire Industries</h3>
              <p className="company-type">Private Limited</p>
            </div>
          </div>
          <p className="loading-text">Checking reset link...</p>
        </div>
      </div>
    );
  }

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
        
        <h1 className="erp-title">Reset Your Password</h1>
        <p className="erp-subtitle">Create a new secure password</p>

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
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="erp-input">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button className="erp-login-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
            <FiArrowRight className="btn-icon" />
          </button>
        </form>

        <div className="erp-register">
          <span className="register-text">Remember your password?</span>
          <button 
            onClick={() => navigate("/login")} 
            className="register-link-btn"
          >
            Back to Login
          </button>
        </div>

        <div className="erp-footer">
          © {new Date().getFullYear()} Pakistan Wire Industries
        </div>
      </div>
    </div>
  );
}