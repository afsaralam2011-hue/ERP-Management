import { useState } from "react";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight, FiCheck } from "react-icons/fi";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
        overflow: "hidden",
        fontSize: "14px" // سب کا بیس فونٹ سائز
      }}
    >
      {/* LEFT REGISTER BOX */}
      <div
        style={{
          width: "50%",
          background: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "24px", // کم کیا: 40px سے 24px
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Background Pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          zIndex: 0
        }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: "340px", margin: "0 auto", width: "100%" }}>
          {/* LOGO */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{
              width: "70px", // کم کیا: 100px سے 70px
              height: "70px", // کم کیا: 100px سے 70px
              background: "white",
              borderRadius: "12px", // کم کیا: 16px سے 12px
              margin: "0 auto 15px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
              padding: "8px",
              overflow: "hidden"
            }}>
              {/* لوگو تصویر */}
              <img 
                src="/images/logo.png" 
                alt="PWI Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  parent.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; border-radius: 8px; font-size: 22px; font-weight: bold;">PWI</div>';
                }}
              />
            </div>
            
            <div style={{ marginBottom: "5px" }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: "18px", // کم کیا: 22px سے 18px
                fontWeight: "700", 
                color: "#1e293b",
                lineHeight: "1.2"
              }}>
                Pakistan Wire Industries
              </h1>
            </div>
            <p style={{ 
              margin: 0, 
              fontSize: "12px", // کم کیا: 14px سے 12px
              color: "#64748b",
              letterSpacing: "0.2px"
            }}>
              Pvt. Limited - ERP System
            </p>
          </div>

          <h2 style={{ 
            marginBottom: "16px", // کم کیا: 20px سے 16px
            fontSize: "18px", // کم کیا: 22px سے 18px
            fontWeight: "600", 
            color: "#1e293b",
            textAlign: "center"
          }}>
            Create Account
          </h2>

          {error && (
            <div style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "8px 12px", // کم کیا
              borderRadius: "6px", // کم کیا
              marginBottom: "15px", // کم کیا
              fontSize: "12px", // کم کیا
              display: "flex",
              alignItems: "center",
              gap: "6px", // کم کیا
              border: "1px solid #fecaca"
            }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#dc2626", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>!</div>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: "#d1fae5",
              color: "#059669",
              padding: "8px 12px", // کم کیا
              borderRadius: "6px", // کم کیا
              marginBottom: "15px", // کم کیا
              fontSize: "12px", // کم کیا
              display: "flex",
              alignItems: "center",
              gap: "6px", // کم کیا
              border: "1px solid #a7f3d0"
            }}>
              <FiCheck style={{ fontSize: "14px" }} /> {/* کم کیا */}
              {success}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "15px" }}> {/* کم کیا */}
              <label style={{ 
                display: "block", 
                marginBottom: "5px", // کم کیا
                fontSize: "12px", // کم کیا
                fontWeight: "500", 
                color: "#475569" 
              }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "12px", // کم کیا
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "14px" // کم کیا
                }}>
                  <FiUser />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px", // کم کیا
                    borderRadius: "8px", // کم کیا
                    border: "1px solid #e2e8f0",
                    fontSize: "13px", // کم کیا
                    background: "white",
                    transition: "all 0.2s",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}> {/* کم کیا */}
              <label style={{ 
                display: "block", 
                marginBottom: "5px", // کم کیا
                fontSize: "12px", // کم کیا
                fontWeight: "500", 
                color: "#475569" 
              }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "12px", // کم کیا
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "14px" // کم کیا
                }}>
                  <FiMail />
                </div>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px", // کم کیا
                    borderRadius: "8px", // کم کیا
                    border: "1px solid #e2e8f0",
                    fontSize: "13px", // کم کیا
                    background: "white",
                    transition: "all 0.2s",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}> {/* کم کیا */}
              <label style={{ 
                display: "block", 
                marginBottom: "5px", // کم کیا
                fontSize: "12px", // کم کیا
                fontWeight: "500", 
                color: "#475569" 
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "12px", // کم کیا
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "14px" // کم کیا
                }}>
                  <FiLock />
                </div>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px", // کم کیا
                    borderRadius: "8px", // کم کیا
                    border: "1px solid #e2e8f0",
                    fontSize: "13px", // کم کیا
                    background: "white",
                    transition: "all 0.2s",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}> {/* کم کیا */}
              <label style={{ 
                display: "block", 
                marginBottom: "5px", // کم کیا
                fontSize: "12px", // کم کیا
                fontWeight: "500", 
                color: "#475569" 
              }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "12px", // کم کیا
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "14px" // کم کیا
                }}>
                  <FiLock />
                </div>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px", // کم کیا
                    borderRadius: "8px", // کم کیا
                    border: password === confirmPassword && confirmPassword ? "1px solid #10b981" : "1px solid #e2e8f0",
                    fontSize: "13px", // کم کیا
                    background: "white",
                    transition: "all 0.2s",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = password === confirmPassword && confirmPassword ? "#10b981" : "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                  disabled={loading}
                />
                {password === confirmPassword && confirmPassword && (
                  <div style={{
                    position: "absolute",
                    right: "12px", // کم کیا
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#10b981",
                    fontSize: "14px" // کم کیا
                  }}>
                    <FiCheck />
                  </div>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            <div style={{
              background: "#f8fafc",
              padding: "10px", // کم کیا
              borderRadius: "6px", // کم کیا
              marginBottom: "18px", // کم کیا
              fontSize: "11px", // کم کیا
              color: "#64748b"
            }}>
              <div style={{ marginBottom: "5px", fontWeight: "500", color: "#475569" }}>
                Password Requirements:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "10px", // کم کیا
                    height: "10px", // کم کیا
                    borderRadius: "50%",
                    background: password.length >= 6 ? "#10b981" : "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "6px", // کم کیا
                    color: "white"
                  }}>
                    {password.length >= 6 ? "✓" : ""}
                  </div>
                  <span>At least 6 characters</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "10px", // کم کیا
                    height: "10px", // کم کیا
                    borderRadius: "50%",
                    background: password === confirmPassword && confirmPassword ? "#10b981" : "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "6px", // کم کیا
                    color: "white"
                  }}>
                    {password === confirmPassword && confirmPassword ? "✓" : ""}
                  </div>
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px", // کم کیا
                border: "none",
                background: loading ? "#94a3b8" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "white",
                borderRadius: "8px", // کم کیا
                fontSize: "13px", // کم کیا
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px", // کم کیا
                boxShadow: loading ? "none" : "0 6px 15px rgba(59, 130, 246, 0.3)" // کم کیا
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 10px 20px rgba(59, 130, 246, 0.4)"; // کم کیا
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 15px rgba(59, 130, 246, 0.3)"; // کم کیا
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "14px", // کم کیا
                    height: "14px", // کم کیا
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <FiArrowRight />
                </>
              )}
            </button>

            {/* Terms & Conditions */}
            <div style={{ marginTop: "15px", display: "flex", alignItems: "flex-start" }}>
              <input
                type="checkbox"
                id="terms"
                style={{
                  marginRight: "6px", // کم کیا
                  width: "12px", // کم کیا
                  height: "12px", // کم کیا
                  accentColor: "#3b82f6",
                  marginTop: "2px"
                }}
              />
              <label htmlFor="terms" style={{ fontSize: "11px", color: "#64748b", cursor: "pointer", lineHeight: "1.3" }}>
                I agree to the <Link to="/terms" style={{ color: "#3b82f6", fontWeight: "500", textDecoration: "none" }}>Terms & Conditions</Link> and <Link to="/privacy" style={{ color: "#3b82f6", fontWeight: "500", textDecoration: "none" }}>Privacy Policy</Link>
              </label>
            </div>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0" }}> {/* کم کیا */}
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            <span style={{ padding: "0 10px", fontSize: "11px", color: "#94a3b8" }}>Already have an account?</span>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
          </div>

          {/* Login Link */}
          <p style={{ textAlign: "center", fontSize: "12px", color: "#64748b" }}>
            Already registered?{" "}
            <Link
              to="/login"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontWeight: "600",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.color = "#1d4ed8"}
              onMouseLeave={(e) => e.target.style.color = "#3b82f6"}
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          position: "absolute", 
          bottom: "10px", // کم کیا
          left: "0", 
          right: "0", 
          textAlign: "center", 
          fontSize: "10px", // کم کیا
          color: "#94a3b8",
          padding: "0 24px" // کم کیا
        }}>
          <p>© 2024 Pakistan Wire Industries Pvt. LTD. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div
        style={{
          width: "50%",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
          padding: "24px", // کم کیا: 30px سے 24px
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative Elements */}
        <div style={{
          position: "absolute",
          top: "-60px", // کم کیا
          right: "-60px", // کم کیا
          width: "200px", // کم کیا
          height: "200px", // کم کیا
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.1)",
          filter: "blur(25px)" // کم کیا
        }} />
        <div style={{
          position: "absolute",
          bottom: "-60px", // کم کیا
          left: "-60px", // کم کیا
          width: "200px", // کم کیا
          height: "200px", // کم کیا
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.1)",
          filter: "blur(25px)" // کم کیا
        }} />
        
        <div style={{ position: "relative", zIndex: 1, maxWidth: "450px", margin: "0 auto" }}>
          <h1 style={{ 
            fontSize: "26px", // کم کیا: 32px سے 26px
            fontWeight: "700", 
            lineHeight: "1.2",
            marginBottom: "12px", // کم کیا
            background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Pakistan Wire Industries
          </h1>
          
          <p style={{ 
            fontSize: "22px", // کم کیا: 28px سے 22px
            fontWeight: "600", 
            lineHeight: "1.2",
            marginBottom: "12px", // کم کیا
            color: "#cbd5e1"
          }}>
            ERP System
          </p>
          
          <p style={{ 
            fontSize: "13px", // کم کیا: 15px سے 13px
            lineHeight: "1.4", // کم کیا
            color: "#94a3b8",
            marginBottom: "24px" // کم کیا
          }}>
            Welcome to our comprehensive Enterprise Resource Planning system. 
            Join us to streamline your business operations and enhance productivity.
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}> {/* کم کیا */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}> {/* کم کیا */}
              <div style={{
                width: "28px", // کم کیا
                height: "28px", // کم کیا
                background: "rgba(59, 130, 246, 0.2)",
                borderRadius: "6px", // کم کیا
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px" // کم کیا
              }}>
                🏭
              </div>
              <div>
                <h3 style={{ margin: "0 0 3px 0", fontSize: "12px", fontWeight: "600" }}>Production Management</h3>
                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Streamline manufacturing processes</p>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}> {/* کم کیا */}
              <div style={{
                width: "28px", // کم کیا
                height: "28px", // کم کیا
                background: "rgba(59, 130, 246, 0.2)",
                borderRadius: "6px", // کم کیا
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px" // کم کیا
              }}>
                📊
              </div>
              <div>
                <h3 style={{ margin: "0 0 3px 0", fontSize: "12px", fontWeight: "600" }}>Real-time Analytics</h3>
                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Data-driven decisions with insights</p>
              </div>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}> {/* کم کیا */}
              <div style={{
                width: "28px", // کم کیا
                height: "28px", // کم کیا
                background: "rgba(59, 130, 246, 0.2)",
                borderRadius: "6px", // کم کیا
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px" // کم کیا
              }}>
                🔒
              </div>
              <div>
                <h3 style={{ margin: "0 0 3px 0", fontSize: "12px", fontWeight: "600" }}>Enterprise Security</h3>
                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>Bank-level security for data</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Company Info */}
        <div style={{ 
          position: "absolute", 
          bottom: "20px", // کم کیا
          left: "24px", // کم کیا
          right: "24px", // کم کیا
          paddingTop: "12px", // کم کیا
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: "0 0 3px 0", fontSize: "12px", fontWeight: "600" }}>Pakistan Wire Industries Pvt. LTD</h3>
              <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8" }}>Leading Manufacturer Since 1995</p>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b" }}>
              ERP System v2.0
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input:disabled {
            background-color: #f8fafc !important;
            cursor: not-allowed;
          }
          
          button:disabled {
            cursor: not-allowed !important;
          }
        `}
      </style>
    </div>
  );
}