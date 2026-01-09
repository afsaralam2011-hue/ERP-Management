import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle,
  FiSun,
  FiMoon
} from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";
import "./Login.css";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // THEME HANDLING (Persistent)
  // =========================
  const [theme, setTheme] = useState("dark");

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Apply theme to document & save in localStorage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  // =========================
  // LOGIN
  // =========================
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
        return;
      }

      if (data?.session) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem("token", data.session.access_token);
        storage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard", { replace: true });
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // BACKGROUND PWI TEXTS
  // =========================
  const colors = ["#FA5C5C", "#FD8A6B", "#FBEF76", "#FF0087", "#FFD41D", "#6AECE1", "#FFFFFF"];
  const bgItems = Array.from({ length: 25 });

  return (
    <div className="erp-bg">
      {/* Floating PWI background */}
      {bgItems.map((_, i) => (
        <span
          key={i}
          className="bg-pwi"
          style={{
            color: colors[i % colors.length],
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            animationDuration: `${6 + Math.random() * 10}s`,
            fontSize: `${14 + Math.random() * 18}px`
          }}
        >
          PWI
        </span>
      ))}

      {/* THEME TOGGLE */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "dark" ? <FiSun className="theme-icon" /> : <FiMoon className="theme-icon" />}
      </button>

      {/* LOGIN CARD */}
      <div className="erp-login-card glass">
        <div className="erp-brand-inline">
          <img src="/images/logoA.png" alt="PWI" />
          <span>Pakistan Wire Industries</span>
        </div>

        <h2 className="erp-title">Welcome to PWI ERP System</h2>
        <p className="erp-subtitle">Enterprise Resource Planning</p>

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
              placeholder="Email"
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
          © {new Date().getFullYear()} Pakistan Wire Industries
        </div>
      </div>
    </div>
  );
}
