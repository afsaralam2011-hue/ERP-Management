import { useState } from "react";
import { supabase } from "../../supabaseClient";
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
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: 'user'
          }
        }
      });

      if (error) throw error;

      setSuccess("Account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
        fontSize: "14px",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
      }}
    >
      {/* Book Container */}
      <div style={{
        width: "95%",
        maxWidth: "1200px",
        height: "90vh",
        margin: "auto",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1)",
        display: "flex",
        overflow: "hidden",
        position: "relative"
      }}>
        
        {/* Book Spine */}
        <div style={{
          width: "50px",
          background: "linear-gradient(to bottom, #1e293b, #0f172a)",
          position: "relative"
        }}>
          {/* Spine lines */}
          <div style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "3px",
            background: "rgba(255,255,255,0.3)",
            borderRadius: "2px"
          }} />
          <div style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "3px",
            background: "rgba(255,255,255,0.3)",
            borderRadius: "2px"
          }} />
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "3px",
            background: "rgba(255,255,255,0.3)",
            borderRadius: "2px"
          }} />
          <div style={{
            position: "absolute",
            top: "65%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "3px",
            background: "rgba(255,255,255,0.3)",
            borderRadius: "2px"
          }} />
          <div style={{
            position: "absolute",
            top: "80%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "30px",
            height: "3px",
            background: "rgba(255,255,255,0.3)",
            borderRadius: "2px"
          }} />
          
          {/* Spine Title */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            color: "white",
            whiteSpace: "nowrap",
            fontSize: "16px",
            fontWeight: "600",
            letterSpacing: "3px",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>
            PWI ERP SYSTEM
          </div>
        </div>

        {/* LEFT REGISTER BOX */}
        <div
          style={{
            width: "50%",
            background: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Page Edge Effect */}
          <div style={{
            position: "absolute",
            right: "0",
            top: "0",
            bottom: "0",
            width: "2px",
            background: "linear-gradient(to bottom, transparent, #cbd5e1, transparent)",
            boxShadow: "inset -1px 0 2px rgba(0,0,0,0.1)"
          }} />
          
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
          
          <div style={{ position: "relative", zIndex: 1, maxWidth: "400px", margin: "0 auto", width: "100%" }}>
            {/* LOGO AND TITLE SIDE BY SIDE */}
            <div style={{ 
              textAlign: "center", 
              marginBottom: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px"
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                background: "white",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                border: "1px solid #e2e8f0",
                padding: "10px",
                overflow: "hidden",
                flexShrink: 0
              }}>
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
                    parent.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; border-radius: 10px; font-size: 28px; font-weight: bold;">PWI</div>';
                  }}
                />
              </div>
              
              <div style={{ textAlign: "left" }}>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: "24px",
                  fontWeight: "700", 
                  color: "#1e293b",
                  lineHeight: "1.2",
                  marginBottom: "5px"
                }}>
                  Pakistan Wire Industries
                </h1>
                <p style={{ 
                  margin: 0, 
                  fontSize: "14px",
                  color: "#64748b",
                  letterSpacing: "0.3px"
                }}>
                  Pvt. Limited - ERP System
                </p>
              </div>
            </div>

            <h2 style={{ 
              marginBottom: "25px",
              fontSize: "24px",
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
                padding: "15px 20px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "1px solid #fecaca"
              }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#dc2626", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>!</div>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: "#d1fae5",
                color: "#059669",
                padding: "15px 20px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "1px solid #a7f3d0"
              }}>
                <FiCheck style={{ fontSize: "18px" }} />
                {success}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500", 
                  color: "#475569" 
                }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    fontSize: "18px"
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
                      padding: "15px 15px 15px 50px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "15px",
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500", 
                  color: "#475569" 
                }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    fontSize: "18px"
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
                      padding: "15px 15px 15px 50px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "15px",
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

              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500", 
                  color: "#475569" 
                }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    fontSize: "18px"
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
                      padding: "15px 15px 15px 50px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "15px",
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

              <div style={{ marginBottom: "25px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500", 
                  color: "#475569" 
                }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                    fontSize: "18px"
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
                      padding: "15px 15px 15px 50px",
                      borderRadius: "10px",
                      border: password === confirmPassword && confirmPassword ? "1px solid #10b981" : "1px solid #e2e8f0",
                      fontSize: "15px",
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
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#10b981",
                      fontSize: "20px"
                    }}>
                      <FiCheck />
                    </div>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              <div style={{
                background: "#f8fafc",
                padding: "18px",
                borderRadius: "10px",
                marginBottom: "25px",
                fontSize: "14px",
                color: "#64748b",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ marginBottom: "10px", fontWeight: "500", color: "#475569", fontSize: "15px" }}>
                  Password Requirements:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: password.length >= 6 ? "#10b981" : "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      color: "white"
                    }}>
                      {password.length >= 6 ? "✓" : ""}
                    </div>
                    <span>At least 6 characters</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: password === confirmPassword && confirmPassword ? "#10b981" : "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
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
                  padding: "18px",
                  border: "none",
                  background: loading ? "#94a3b8" : "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  color: "white",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: loading ? "none" : "0 10px 25px rgba(59, 130, 246, 0.3)"
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 15px 30px rgba(59, 130, 246, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 10px 25px rgba(59, 130, 246, 0.3)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: "22px",
                      height: "22px",
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
              <div style={{ marginTop: "25px", display: "flex", alignItems: "flex-start" }}>
                <input
                  type="checkbox"
                  id="terms"
                  style={{
                    marginRight: "10px",
                    width: "18px",
                    height: "18px",
                    accentColor: "#3b82f6",
                    marginTop: "3px"
                  }}
                />
                <label htmlFor="terms" style={{ fontSize: "14px", color: "#64748b", cursor: "pointer", lineHeight: "1.4" }}>
                  I agree to the <Link to="/terms" style={{ color: "#3b82f6", fontWeight: "500", textDecoration: "none" }}>Terms & Conditions</Link> and <Link to="/privacy" style={{ color: "#3b82f6", fontWeight: "500", textDecoration: "none" }}>Privacy Policy</Link>
                </label>
              </div>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", margin: "30px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
              <span style={{ padding: "0 15px", fontSize: "14px", color: "#94a3b8" }}>Already have an account?</span>
              <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
            </div>

            {/* Login Link */}
            <p style={{ textAlign: "center", fontSize: "15px", color: "#64748b" }}>
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
            bottom: "20px",
            left: "0", 
            right: "0", 
            textAlign: "center", 
            fontSize: "12px",
            color: "#94a3b8",
            padding: "0 40px"
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
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Page Edge Effect */}
          <div style={{
            position: "absolute",
            left: "0",
            top: "0",
            bottom: "0",
            width: "2px",
            background: "linear-gradient(to bottom, transparent, #475569, transparent)",
            boxShadow: "inset 1px 0 2px rgba(0,0,0,0.2)"
          }} />
          
          {/* Decorative Elements */}
          <div style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            filter: "blur(40px)"
          }} />
          <div style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.1)",
            filter: "blur(40px)"
          }} />
          
          <div style={{ position: "relative", zIndex: 1, maxWidth: "500px", margin: "0 auto" }}>
            <h1 style={{ 
              fontSize: "36px",
              fontWeight: "700", 
              lineHeight: "1.2",
              marginBottom: "20px",
              background: "linear-gradient(135deg, #fff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Pakistan Wire Industries
            </h1>
            
            <p style={{ 
              fontSize: "28px",
              fontWeight: "600", 
              lineHeight: "1.2",
              marginBottom: "20px",
              color: "#cbd5e1"
            }}>
              ERP System
            </p>
            
            <p style={{ 
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#94a3b8",
              marginBottom: "40px"
            }}>
              Welcome to our comprehensive Enterprise Resource Planning system. 
              Join us to streamline your business operations and enhance productivity.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  🏭
                </div>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "white" }}>Production Management</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>Streamline manufacturing processes and optimize workflow</p>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  📊
                </div>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "white" }}>Real-time Analytics</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>Data-driven decisions with real-time insights and reports</p>
                </div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{
                  width: "50px",
                  height: "50px",
                  background: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px"
                }}>
                  🔒
                </div>
                <div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600", color: "white" }}>Enterprise Security</h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>Bank-level security protocols for your sensitive data</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Info */}
          <div style={{ 
            position: "absolute", 
            bottom: "30px",
            left: "40px",
            right: "40px",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", fontWeight: "600", color: "white" }}>Pakistan Wire Industries Pvt. LTD</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>Leading Manufacturer Since 1995</p>
              </div>
              <div style={{ fontSize: "14px", color: "#64748b" }}>
                ERP System v2.0
              </div>
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