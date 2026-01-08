// File: src/pages/auth/Login.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle
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

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      if (data?.session) {
        const storage = remember ? localStorage : sessionStorage;

        storage.setItem("token", data.session.access_token);
        storage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.email.split("@")[0],
            role: "user"
          })
        );

        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Colors for background PWI elements
  const bgColors = ["#FA5C5C", "#FD8A6B", "#FBEF76", "#FF0087", "#FFD41D", "#6AECE1", "#FFFFFF"];
  const numTexts = 25;
  const bgTexts = Array.from({ length: numTexts }, (_, i) => ({
    id: i,
    color: bgColors[i % bgColors.length],
    style: {
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 90}%`,
      animationDuration: `${5 + Math.random() * 10}s`,
      fontSize: `${14 + Math.random() * 20}px`,
      transform: `rotate(${Math.random() * 360}deg)`
    }
  }));

  return (
    <div className="erp-bg">
      {/* Background floating PWI texts */}
      {bgTexts.map((txt) => (
        <span
          key={txt.id}
          className="bg-pwi"
          style={{ ...txt.style, color: txt.color }}
        >
          PWI
        </span>
      ))}

      <div className="erp-login-card glass">
        {/* LOGO + NAME (SINGLE LINE) */}
        <div className="erp-brand-inline">
          <img src="/images/logo.png" alt="PWI" />
          <span>Pakistan Wire Industries</span>
        </div>

        <h2 className="erp-title">Welcome Back</h2>
        <p className="erp-subtitle">Sign in to your ERP account</p>

        {error && (
          <div className="erp-error">
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="erp-form">
          <div className="erp-input">
            <FiMail />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="erp-input">
            <FiLock />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="erp-row">
            <label className="erp-check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>

            <Link to="/forgot-password" className="erp-link">
              Forgot password?
            </Link>
          </div>

          <button className="erp-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
            <FiArrowRight />
          </button>
        </form>

        <div className="erp-register">
          New here?
          <Link to="/register"> Create Account</Link>
        </div>

        <div className="erp-footer">
          © {new Date().getFullYear()} Pakistan Wire Industries • ERP v2.0
        </div>
      </div>
    </div>
  );
}
