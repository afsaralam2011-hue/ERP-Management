// src/pages/departments/ITPage.jsx
import React, { useState } from "react";
import { 
  FiCpu, FiServer, FiWifi, FiAlertTriangle,
  FiShield, FiDatabase, FiDownload
} from "react-icons/fi";

const ITPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const itStats = [
    { label: "System Uptime", value: "99.8%", change: "+0.2%", icon: <FiCpu />, color: "#10b981" },
    { label: "Active Tickets", value: "42", change: "-8%", icon: <FiAlertTriangle />, color: "#ef4444" },
    { label: "Network Status", value: "Stable", change: "Good", icon: <FiWifi />, color: "#3b82f6" },
    { label: "Security Score", value: "98/100", change: "+2", icon: <FiShield />, color: "#8b5cf6" },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "24px"
      }}>
        {itStats.map((stat, index) => (
          <div key={index} style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                background: `${stat.color}10`,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: stat.color,
                fontSize: "20px"
              }}>
                {stat.icon}
              </div>
              <span style={{
                fontSize: "13px",
                fontWeight: "600",
                color: stat.color,
                background: `${stat.color}10`,
                padding: "4px 10px",
                borderRadius: "12px"
              }}>
                {stat.change}
              </span>
            </div>
            <div style={{ 
              fontSize: "26px",
              fontWeight: "700",
              color: "#1e293b",
              marginBottom: "4px"
            }}>
              {stat.value}
            </div>
            <div style={{ 
              fontSize: "14px",
              color: "#64748b"
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ITPage;