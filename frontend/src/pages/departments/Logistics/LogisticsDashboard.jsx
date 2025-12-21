// src/pages/departments/LogisticsPage.jsx
import React, { useState } from "react";
import { 
  FiTruck, FiPackage, FiClock, FiMapPin,
  FiCheckCircle, FiAlertCircle, FiDownload
} from "react-icons/fi";

const LogisticsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const logisticsStats = [
    { label: "Active Shipments", value: "128", change: "+15%", icon: <FiTruck />, color: "#06b6d4" },
    { label: "Delivered", value: "122", change: "+12%", icon: <FiPackage />, color: "#10b981" },
    { label: "On Time Rate", value: "95%", change: "+3%", icon: <FiClock />, color: "#3b82f6" },
    { label: "Pending", value: "6", change: "-2%", icon: <FiAlertCircle />, color: "#ef4444" },
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
        {logisticsStats.map((stat, index) => (
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

export default LogisticsPage;