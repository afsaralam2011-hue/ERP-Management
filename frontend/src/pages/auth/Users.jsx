import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiArrowRight,
  FiSun,
  FiMoon,
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
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.body.className = dark ? "dark" : "light";
  }, [dark]);

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
    <div className="erp-bg">
      <button className="theme-toggle" onClick={() => setDark(!dark)}>
        {dark ? <FiSun /> : <FiMoon />}
      </button>

      <div className="bg-particles">
        <span></span><span></span><span></span><span></span>
      </div>

      <div className="erp-login-card">
        {/* Branding */}
        <div className="erp-brand-inline">
          <img src="/images/logoA.png" alt="PWI" />
          <span>Pakistan Wire Industries</span>
        </div>

        <p className="erp-subtitle">
          Reset your account password
        </p>

        {error && (
          <div className="erp-error">
            <FiAlertCircle /> {error}
          </div>
        )}

        {success && (
          <div
            className="erp-error"
            style={{
              background: "rgba(34,197,94,0.2)",
              color: "#bbf7d0"
            }}
          >
            <FiCheckCircle /> {success}
          </div>
        )}

        <form onSubmit={handleReset} className="erp-form">
          <div className="erp-input">
            <FiMail />
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
            <FiArrowRight />
          </button>
        </form>

        <div className="erp-register">
          <Link to="/login">Back to Login</Link>
        </div>

        <div className="erp-footer">
          © {new Date().getFullYear()} Pakistan Wire Industries • ERP v2.0
        </div>
      </div>
    </div>
  );
}
