// src/components/common/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { 
  FiHome, 
  FiUsers, 
  FiDollarSign, 
  FiPackage, 
  FiTrendingUp, 
  FiCpu, 
  FiTruck,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiMenu
} from "react-icons/fi";

const Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeDept, setActiveDept] = useState(null);

  const departments = [
    { 
      name: "Dashboard", 
      icon: <FiHome />, 
      path: "/dashboard",
      color: "#3b82f6"
    },
    { 
      name: "HR Department", 
      icon: <FiUsers />, 
      path: "/hr",
      color: "#4f46e5"
    },
    { 
      name: "Finance Department", 
      icon: <FiDollarSign />, 
      color: "#10b981", 
      path: "/finance"
    },
    { 
      name: "Production Department", 
      icon: <FiPackage />, 
      color: "#f59e0b", 
      path: "/production"
    },
    { 
      name: "Sales Department", 
      icon: <FiTrendingUp />, 
      color: "#ef4444", 
      path: "/sales"
    },
    { 
      name: "IT Department", 
      icon: <FiCpu />, 
      color: "#8b5cf6", 
      path: "/it"
    },
    { 
      name: "Logistics Department", 
      icon: <FiTruck />, 
      color: "#06b6d4", 
      path: "/logistics"
    },
  ];

  const linkClass = ({ isActive }) => {
    return {
      width: "100%",
      padding: sidebarOpen ? "12px 16px" : "12px 0",
      background: isActive ? "#334155" : "transparent",
      border: "none",
      color: isActive ? "#ffffff" : "#cbd5e1",
      borderRadius: "8px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: sidebarOpen ? "flex-start" : "center",
      gap: "12px",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
      position: "relative",
      textDecoration: "none",
      boxSizing: "border-box"
    };
  };

  return (
    <div
      style={{
        width: sidebarOpen ? "260px" : "70px",
        background: "#1e293b",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
        zIndex: 10
      }}
    >
      {/* Logo & Toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          padding: sidebarOpen ? "24px" : "24px 0",
          borderBottom: "1px solid #334155",
          minHeight: "80px"
        }}
      >
        {sidebarOpen ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                background: "white",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #3b82f6",
                overflow: "hidden"
              }}>
                <img 
                  src="/images/logo.png" 
                  alt="PWI Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    padding: "5px"
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    parent.innerHTML = '<span style="font-size: 14px; font-weight: bold; color: #3b82f6">PWI</span>';
                  }}
                />
              </div>
              <div>
                <div style={{ 
                  fontWeight: "700", 
                  fontSize: "14px", 
                  color: "#ffffff",
                  lineHeight: "1.2"
                }}>
                  Pakistan
                </div>
                <div style={{ 
                  fontWeight: "600", 
                  fontSize: "12px", 
                  color: "#cbd5e1",
                  lineHeight: "1.2"
                }}>
                  Wire Industries
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "#334155",
                border: "none",
                color: "#cbd5e1",
                fontSize: "18px",
                cursor: "pointer",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#475569"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#334155"}
              title="Collapse Menu"
            >
              <FiChevronLeft />
            </button>
          </>
        ) : (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "#cbd5e1",
              fontSize: "24px",
              cursor: "pointer",
              padding: "10px",
              transition: "all 0.2s"
            }}
            title="Expand Menu"
          >
            <FiMenu />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div style={{ 
        padding: sidebarOpen ? "24px 16px" : "24px 8px", 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ 
            fontSize: "12px", 
            color: "#94a3b8", 
            fontWeight: "600",
            padding: sidebarOpen ? "0 16px 8px" : "0 0 8px",
            textAlign: sidebarOpen ? "left" : "center",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Main
          </div>
          <NavLink
            to="/dashboard"
            style={linkClass}
            onMouseEnter={(e) => {
              if (!e.currentTarget.className.includes('active')) {
                e.currentTarget.style.background = "#334155";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.className.includes('active')) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <FiHome style={{ fontSize: "18px" }} />
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ 
            fontSize: "12px", 
            color: "#94a3b8", 
            fontWeight: "600",
            padding: sidebarOpen ? "0 16px 8px" : "0 0 8px",
            textAlign: sidebarOpen ? "left" : "center",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Departments
          </div>
          {departments.map((dep) => (
            <NavLink
              key={dep.name}
              to={dep.path}
              style={linkClass}
              onMouseEnter={(e) => {
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = "#334155";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
              onClick={() => setActiveDept(dep.name)}
            >
              <span style={{ color: dep.color, fontSize: "18px" }}>
                {dep.icon}
              </span>
              {sidebarOpen && <span style={{ flex: 1, textAlign: "left" }}>{dep.name}</span>}
            </NavLink>
          ))}
        </div>

        <div style={{ marginTop: "auto" }}>
          <NavLink
            to="/settings"
            style={linkClass}
            onMouseEnter={(e) => {
              if (!e.currentTarget.className.includes('active')) {
                e.currentTarget.style.background = "#334155";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.className.includes('active')) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <FiSettings style={{ fontSize: "18px" }} />
            {sidebarOpen && <span>Settings</span>}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;