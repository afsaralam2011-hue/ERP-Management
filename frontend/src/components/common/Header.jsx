// src/components/common/Header.jsx
import React from "react";
import { FiSearch, FiBell, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Header({ 
  title = "ERP Dashboard", 
  subtitle = "Welcome to Pakistan Wire Industries ERP System"
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    
    // Clear session storage
    sessionStorage.clear();
    
    // Directly redirect to login page
    navigate("/login");
  };

  return (
    <div style={{
      background: "white",
      padding: "20px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #e2e8f0",
      position: "sticky",
      top: 0,
      zIndex: 100,
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      width: "100%",
      boxSizing: "border-box",
      flexWrap: "nowrap",
      gap: "20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    }}>
      
      {/* LEFT SIDE - Title */}
      <div style={{ 
        minWidth: "220px",
        flexShrink: 0
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: "22px",
          fontWeight: "700",
          color: "#1e293b",
          lineHeight: "1.2"
        }}>
          {title}
        </h1>
        <p style={{ 
          margin: "3px 0 0 0", 
          fontSize: "13px",
          color: "#64748b",
          lineHeight: "1.3"
        }}>
          {subtitle}
        </p>
      </div>
      
      {/* CENTER - Search Bar */}
      <div style={{ 
        flex: 1,
        maxWidth: "500px",
        minWidth: "300px"
      }}>
        <div style={{ position: "relative" }}>
          <FiSearch style={{ 
            position: "absolute", 
            left: "14px", 
            top: "50%", 
            transform: "translateY(-50%)", 
            color: "#94a3b8",
            fontSize: "18px"
          }} />
          <input
            type="text"
            placeholder="Search departments, reports, or users..."
            style={{
              padding: "11px 20px 11px 45px",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "15px",
              width: "100%",
              background: "#f8fafc",
              outline: "none",
              transition: "all 0.3s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>
      
      {/* RIGHT SIDE - All Controls */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "15px",
        marginLeft: "auto",
        flexShrink: 0
      }}>
        
        {/* Notification Bell */}
        <button 
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            fontSize: "22px",
            cursor: "pointer",
            position: "relative",
            padding: "10px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "46px",
            height: "46px"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#f1f5f9";
            e.target.style.color = "#3b82f6";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#64748b";
          }}
          title="Notifications"
        >
          <FiBell />
          <span style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "#ef4444",
            color: "white",
            fontSize: "11px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold"
          }}>
            3
          </span>
        </button>
        
        {/* Settings */}
        <button 
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            fontSize: "22px",
            cursor: "pointer",
            padding: "10px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "46px",
            height: "46px"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#f1f5f9";
            e.target.style.color = "#3b82f6";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#64748b";
          }}
          title="Settings"
        >
          <FiSettings />
        </button>

        {/* User Profile */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          padding: "8px 16px",
          borderRadius: "10px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          margin: "0 5px",
          minWidth: "160px"
        }}>
          <div style={{
            width: "38px",
            height: "38px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "15px"
          }}>
            AU
          </div>
          <div>
            <div style={{ 
              fontSize: "14px", 
              color: "#1e293b", 
              fontWeight: "600",
              lineHeight: "1.3"
            }}>
              Admin User
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#64748b",
              lineHeight: "1.3"
            }}>
              Administrator
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            border: "none",
            color: "white",
            fontSize: "14px",
            cursor: "pointer",
            padding: "10px 18px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "600",
            height: "46px",
            whiteSpace: "nowrap"
          }}
          title="Logout"
        >
          <FiLogOut style={{ fontSize: "18px" }} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}