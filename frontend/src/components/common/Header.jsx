// src/components/common/Header.jsx
import React from "react";
import { FiSearch, FiBell, FiSettings } from "react-icons/fi";

export default function Header({ title = "ERP Dashboard", subtitle = "Welcome to Pakistan Wire Industries ERP System" }) {
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
      zIndex: 5,
      fontFamily: "'Segoe UI', 'Roboto', sans-serif"
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: "24px",
          fontWeight: "600",
          color: "#1e293b"
        }}>
          {title}
        </h1>
        <p style={{ 
          margin: "4px 0 0 0", 
          fontSize: "14px",
          color: "#64748b"
        }}>
          {subtitle}
        </p>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative" }}>
          <FiSearch style={{ 
            position: "absolute", 
            left: "12px", 
            top: "50%", 
            transform: "translateY(-50%)", 
            color: "#94a3b8" 
          }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              padding: "10px 16px 10px 40px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              width: "240px",
              background: "#f8fafc",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        
        <button style={{
          background: "transparent",
          border: "none",
          color: "#64748b",
          fontSize: "20px",
          cursor: "pointer",
          position: "relative",
          padding: "8px"
        }}>
          <FiBell />
          <span style={{
            position: "absolute",
            top: "0",
            right: "0",
            background: "#ef4444",
            color: "white",
            fontSize: "10px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            3
          </span>
        </button>
        
        <button style={{
          background: "transparent",
          border: "none",
          color: "#64748b",
          fontSize: "20px",
          cursor: "pointer",
          padding: "8px"
        }}>
          <FiSettings />
        </button>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px"
          }}>
            AK
          </div>
          <div>
            <div style={{ fontSize: "14px", color: "#1e293b", fontWeight: "500" }}>
              Admin User
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              Administrator
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}