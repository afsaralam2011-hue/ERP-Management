import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiAlertCircle,
  FiStar
} from "react-icons/fi";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme state
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Floating text content - آپ کے words
  const floatingWords = [
    "PWI", "PAKISTAN WIRE INDUSTRIES", "Control Cable Division", 
    "CCD", "SPI", "Spoke Division", "ERP", "SYSTEM", 
    "MANAGEMENT", "DATA", "SECURE", "CLOUD", "AI"
  ];

  // Colors for DARK THEME - BRIGHT COLORS
  const darkThemeColors = [
    "#FF0000", // Red
    "#FF4500", // Orange Red
    "#FFA500", // Orange
    "#FFD700", // Gold
    "#FFFF00", // Yellow
    "#00FF00", // Green
    "#00FFFF", // Cyan
    "#0000FF", // Blue
    "#8A2BE2", // Blue Violet
    "#FF00FF", // Magenta
    "#FF1493", // Deep Pink
    "#00FA9A", // Spring Green
    "#1E90FF", // Dodger Blue
    "#FF69B4", // Hot Pink
    "#7CFC00"  // Lawn Green
  ];

  // Colors for LIGHT THEME - DARK COLORS  
  const lightThemeColors = [
    "#8B0000", // Dark Red
    "#B22222", // Firebrick
    "#CD5C5C", // Indian Red
    "#B8860B", // Dark Goldenrod
    "#DAA520", // Goldenrod
    "#006400", // Dark Green
    "#2E8B57", // Sea Green
    "#008B8B", // Dark Cyan
    "#000080", // Navy
    "#4B0082", // Indigo
    "#8B008B", // Dark Magenta
    "#800000", // Maroon
    "#556B2F", // Dark Olive Green
    "#483D8B", // Dark Slate Blue
    "#8B4513"  // Saddle Brown
  ];

  const [floatingItems, setFloatingItems] = useState([]);

  // Initialize floating items
  useEffect(() => {
    const colors = isDarkTheme ? darkThemeColors : lightThemeColors;
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      text: floatingWords[i % floatingWords.length],
      color: colors[i % colors.length],
      top: -20 - (Math.random() * 30), // TOP SE START (اوپر سے گرے)
      left: Math.random() * 100,
      size: 16 + Math.random() * 18,
      speed: 15 + Math.random() * 20,
      opacity: isDarkTheme ? 0.25 : 0.2,
    }));
    setFloatingItems(items);
  }, [isDarkTheme]);

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

<<<<<<< HEAD
  // Handle login
=======
  const toggleTheme = () => setTheme(prev => (prev === "dark" ? "light" : "dark"));

  const { login } = useAuth();

  // =========================
  // LOGIN
  // =========================
>>>>>>> de48dd99d82d0005078d2f34dac0bdbd9d3ade5d
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
        login(data.session.access_token, data.user, remember);
        navigate("/dashboard", { replace: true });
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`erp-bg ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Floating text background - TOP SE GRENE WALA (اوپر سے گرے) */}
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className="floating-item"
          style={{
            color: item.color,
            top: `${item.top}%`,
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.speed}s`,
            opacity: item.opacity,
            animationDelay: `${item.id * 0.5}s`,
            position: 'absolute',
            fontWeight: '900',
            zIndex: '1',
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow: `0 0 10px ${item.color}`
          }}
        >
          {item.text}
        </div>
      ))}

      {/* THEME TOGGLE */}
      <button className="theme-toggle" onClick={toggleTheme}>
        <FiStar className="theme-icon" />
      </button>

      {/* LOGIN CARD */}
      <div className="erp-login-card">
        <div className="erp-brand-inline">
          <img src="/assets/images/logo.png" alt="PWI" />
          <div className="company-text">
            <h3 className="company-name">Pakistan Wire Industries</h3>
            <p className="company-type">Private Limited</p>
          </div>
        </div>

        <h1 className="erp-title">Welcome to PWI ERP System</h1>
        <p className="erp-subtitle">Enterprise Resource Planning</p>

        {error && (
          <div className="erp-error">
            <FiAlertCircle className="error-icon" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="erp-form">
          <div className="erp-input">
            <FiMail className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="erp-input">
            <FiLock className="input-icon" />
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
              <span className="checkbox-text">Keep me signed in</span>
            </label>

            <Link to="/forgot-password" className="erp-link">
              Forgot password?
            </Link>
          </div>

          <button className="erp-login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
            <FiArrowRight className="btn-icon" />
          </button>
        </form>

        <div className="erp-register">
          <span className="register-text">New here?</span>
          <Link to="/register" className="register-link"> Create Account</Link>
        </div>

        <div className="erp-footer">
          © {new Date().getFullYear()} Pakistan Wire Industries
        </div>
      </div>
    </div>
  );
}