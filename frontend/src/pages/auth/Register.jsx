// File: src/pages/auth/Register.jsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiUser,
  FiArrowRight,
  FiAlertCircle,
  FiCheckCircle
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

// Colors for floating PWI text
const colors = [
  "#FA5C5C",
  "#FD8A6B",
  "#FBEF76",
  "#FF0087",
  "#FFD41D",
  "#6AECE1",
  "#FFFFFF"
];

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [floatingPWI, setFloatingPWI] = useState([]);

  // Generate 25 floating PWI items
  useEffect(() => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      text: "PWI",
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 100, // percentage
      y: Math.random() * 100,
      rotate: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      rotateSpeed: (Math.random() - 0.5) * 0.5
    }));
    setFloatingPWI(items);
  }, []);

  // Animate floating PWI
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingPWI((prev) =>
        prev.map((item) => {
          let newX = item.x + item.speedX;
          let newY = item.y + item.speedY;
          let newRotate = item.rotate + item.rotateSpeed;

          if (newX > 100) newX = 0;
          if (newX < 0) newX = 100;
          if (newY > 100) newY = 0;
          if (newY < 0) newY = 100;

          return {
            ...item,
            x: newX,
            y: newY,
            rotate: newRotate
          };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Full name is required");
      return;
    }

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
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name,
            role: "user"
          }
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(
        "Account created successfully. Please check your email to verify your account."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2500);
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-bg">
      {/* Floating PWI texts */}
      {floatingPWI.map((item) => (
        <div
          key={item.id}
          className="floating-pwi"
          style={{
            color: item.color,
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `rotate(${item.rotate}deg)`
          }}
        >
          {item.text}
        </div>
      ))}

      <div className="erp-login-card glass">
        {/* Logo + Company Name */}
        <div className="erp-brand-inline">
          <img src="/images/logo.png" alt="PWI" />
          <span>Pakistan Wire Industries</span>
        </div>

        <h2 className="erp-title">Create Account</h2>
        <p className="erp-subtitle">
          Join Pakistan Wire Industries ERP
        </p>

        {error && (
          <div className="erp-error">
            <FiAlertCircle /> {error}
          </div>
        )}

        {success && (
          <div className="erp-error success">
            <FiCheckCircle /> {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="erp-form">
          <div className="erp-input">
            <FiUser />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="erp-input">
            <FiMail />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="erp-input">
            <FiLock />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="erp-input">
            <FiLock />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button className="erp-login-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
            <FiArrowRight />
          </button>
        </form>

        <div className="erp-register">
          Already have an account?
          <Link to="/login"> Sign In</Link>
        </div>

        <div className="erp-footer">
          © {new Date().getFullYear()} Pakistan Wire Industries • ERP v2.0
        </div>
      </div>
    </div>
  );
}
