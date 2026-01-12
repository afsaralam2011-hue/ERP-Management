/**
 * ---------------------------------------------------------
 * File: Sidebar.jsx
 * Path: src/components/common/Sidebar.jsx
 * Description:
 *  Theme-based professional sidebar navigation
 * ---------------------------------------------------------
 */

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
  FiMenu,
} from "react-icons/fi";

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  const departments = [
    { name: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "HR Department", icon: <FiUsers />, path: "/hr" },
    { name: "Finance Department", icon: <FiDollarSign />, path: "/finance" },
    { name: "Production Department", icon: <FiPackage />, path: "/production" },
    { name: "Sales Department", icon: <FiTrendingUp />, path: "/sales" },
    { name: "IT Department", icon: <FiCpu />, path: "/it" },
    { name: "Logistics Department", icon: <FiTruck />, path: "/logistics" },
  ];

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: open ? "12px 16px" : "12px",
    borderRadius: "10px",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    color: isActive ? "var(--text)" : "var(--text)",
    background: isActive
      ? "var(--primary)"
      : "transparent",
    transition: "all 0.25s ease",
  });

  return (
    <aside
      style={{
        width: open ? "260px" : "72px",
        background: "var(--dark)",
        color: "var(--text)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          padding: "0 20px",
        }}
      >
        {open && (
          <div>
            <div style={{ fontWeight: 700 }}>Pakistan</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Wire Industries
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "var(--secondary)",
            border: "none",
            color: "var(--text)",
            width: 36,
            height: 36,
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          {open ? <FiChevronLeft /> : <FiMenu />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: open ? "16px" : "16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {departments.map((item) => (
          <NavLink key={item.name} to={item.path} style={linkStyle}>
            {item.icon}
            {open && <span>{item.name}</span>}
          </NavLink>
        ))}

        <div style={{ marginTop: "auto" }}>
          <NavLink to="/settings" style={linkStyle}>
            <FiSettings />
            {open && <span>Settings</span>}
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
