// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUsers, FiDollarSign, FiPackage, FiTrendingUp, 
  FiActivity, FiBriefcase, FiSearch, FiSettings,
  FiChevronRight, FiDatabase, FiClock, FiSun,
  FiMoon, FiBarChart2, FiCalendar, FiBell,
  FiLogOut, FiHome, FiUser, FiMessageSquare
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Get theme colors based on current theme
  const getThemeColor = (lightColor, darkColor) => {
    return theme === "dark" ? darkColor : lightColor;
  };

  const departments = [
    { 
      id: 1,
      name: "HR", 
      fullName: "HR Department",
      color: "#4f46e5", 
      path: "/hr",
      stats: { 
        employees: "1,248", 
        growth: "+12%", 
        vacancies: "8"
      },
      description: "Manage employees, recruitment, payroll, and HR operations.",
      icon: <FiUsers />
    },
    { 
      id: 2,
      name: "Finance", 
      fullName: "Finance Department",
      color: "#059669", 
      path: "/finance",
      stats: { 
        revenue: "₹42.8M", 
        growth: "+8.5%", 
        expenses: "₹18.2M"
      },
      description: "Financial planning, accounting, budgeting, and reporting.",
      icon: <FiDollarSign />
    },
    { 
      id: 3,
      name: "Production", 
      fullName: "Production Department",
      color: "#d97706", 
      path: "/production/daily-report",
      stats: { 
        output: "48.2K", 
        growth: "+15%", 
        efficiency: "92%"
      },
      description: "Manufacturing operations, production planning, and quality control.",
      icon: <FiPackage />
    },
    { 
      id: 4,
      name: "Sales", 
      fullName: "Sales Department",
      color: "#dc2626", 
      path: "/sales",
      stats: { 
        orders: "342", 
        growth: "+5%", 
        revenue: "₹28.5M"
      },
      description: "Sales strategies, customer relations, and revenue generation.",
      icon: <FiTrendingUp />
    },
    { 
      id: 5,
      name: "IT", 
      fullName: "IT Department",
      color: "#7c3aed", 
      path: "/it",
      stats: { 
        uptime: "99.8%", 
        tickets: "42", 
        projects: "8"
      },
      description: "IT infrastructure, software development, and technical support.",
      icon: <FiDatabase />
    },
    { 
      id: 6,
      name: "Logistics", 
      fullName: "Logistics Department",
      color: "#0891b2", 
      path: "/logistics",
      stats: { 
        shipments: "128", 
        delivered: "122", 
        pending: "6"
      },
      description: "Supply chain management, transportation, and distribution.",
      icon: <FiClock />
    },
  ];

  const productionModules = [
    {
      id: 1,
      name: "Daily Production Report",
      path: "/production/daily-report",
      icon: <FiCalendar />,
      color: "#d97706",
      description: "View and generate daily production reports"
    },
    {
      id: 2,
      name: "Machine Monitoring",
      path: "/production/machines",
      icon: <FiSettings />,
      color: "#dc2626",
      description: "Monitor machine status and performance"
    },
    {
      id: 3,
      name: "Quality Control",
      path: "/production/quality",
      icon: <FiBarChart2 />,
      color: "#059669",
      description: "Quality checks and inspection reports"
    },
    {
      id: 4,
      name: "Production Planning",
      path: "/production/planning",
      icon: <FiTrendingUp />,
      color: "#4f46e5",
      description: "Production schedules and planning"
    }
  ];

  const quickStats = [
    { 
      id: 1,
      label: "Total Employees", 
      value: "1,248", 
      change: "+12%", 
      icon: <FiUsers />, 
      color: "#4f46e5",
      trend: "up"
    },
    { 
      id: 2,
      label: "Active Orders", 
      value: "342", 
      change: "+5%", 
      icon: <FiTrendingUp />, 
      color: "#dc2626",
      trend: "up"
    },
    { 
      id: 3,
      label: "Monthly Revenue", 
      value: "₹42.8M", 
      change: "+8.5%", 
      icon: <FiDollarSign />, 
      color: "#059669",
      trend: "up"
    },
    { 
      id: 4,
      label: "Production Output", 
      value: "48.2K", 
      change: "+15%", 
      icon: <FiPackage />, 
      color: "#d97706",
      trend: "up"
    },
    { 
      id: 5,
      label: "System Uptime", 
      value: "99.8%", 
      change: "+0.2%", 
      icon: <FiDatabase />, 
      color: "#7c3aed",
      trend: "up"
    },
    { 
      id: 6,
      label: "On-time Delivery", 
      value: "95%", 
      change: "+3%", 
      icon: <FiClock />, 
      color: "#0891b2",
      trend: "up"
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "Ahmed Khan",
      action: "approved production report",
      department: "Production",
      time: "10 min ago",
      icon: <FiPackage />
    },
    {
      id: 2,
      user: "Sara Ahmed",
      action: "updated sales forecast",
      department: "Sales",
      time: "25 min ago",
      icon: <FiTrendingUp />
    },
    {
      id: 3,
      user: "Ali Raza",
      action: "processed payroll",
      department: "HR",
      time: "1 hour ago",
      icon: <FiUsers />
    },
    {
      id: 4,
      user: "Admin",
      action: "system backup completed",
      department: "IT",
      time: "2 hours ago",
      icon: <FiDatabase />
    }
  ];

  const handleDepartmentClick = (department) => {
    navigate(department.path);
  };

  const handleProductionModuleClick = (module) => {
    navigate(module.path);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  const notifications = [
    { id: 1, text: "New production report ready", time: "5 min ago", read: false },
    { id: 2, text: "System maintenance scheduled", time: "1 hour ago", read: true },
    { id: 3, text: "New employee joined", time: "2 hours ago", read: true },
  ];

  return (
    <div 
      className="dashboard-wrapper"
      style={{
        backgroundColor: getThemeColor("#f9fafb", "#111827"),
        color: getThemeColor("#1f2937", "#f3f4f6")
      }}
    >
      {/* Main Content - NO SIDEBAR */}
      <div className="main-content">
        {/* Top Header */}
        <header 
          className="main-header"
          style={{
            backgroundColor: getThemeColor("#ffffff", "#1f2937"),
            borderBottom: `1px solid ${getThemeColor("#e5e7eb", "#374151")}`
          }}
        >
          <div className="header-left">
            <div className="header-logo">
              <div className="header-logo-icon">
                <div 
                  className="pwi-logo"
                  style={{
                    backgroundColor: "#d97706",
                    color: "white"
                  }}
                >
                  PWI
                </div>
              </div>
              <div className="header-logo-text">
                <h1 style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}>
                  Pakistan Wire Industries
                </h1>
                <p style={{ color: getThemeColor("#6b7280", "#9ca3af") }}>
                  Enterprise Resource Planning System
                </p>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div 
              className="search-box"
              style={{
                backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                borderColor: getThemeColor("#e5e7eb", "#4b5563")
              }}
            >
              <FiSearch 
                className="search-icon" 
                style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search departments, reports, or users..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  backgroundColor: "transparent",
                  color: getThemeColor("#1f2937", "#f3f4f6")
                }}
              />
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                style={{
                  backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                  color: getThemeColor("#6b7280", "#9ca3af"),
                  borderColor: getThemeColor("#e5e7eb", "#4b5563")
                }}
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>

              <div className="notification-wrapper">
                <button
                  className="notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                    color: getThemeColor("#6b7280", "#9ca3af"),
                    borderColor: getThemeColor("#e5e7eb", "#4b5563")
                  }}
                >
                  <FiBell />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="notification-badge">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div 
                    className="notifications-dropdown"
                    style={{
                      backgroundColor: getThemeColor("#ffffff", "#1f2937"),
                      borderColor: getThemeColor("#e5e7eb", "#374151"),
                      color: getThemeColor("#1f2937", "#f3f4f6")
                    }}
                  >
                    <div className="notifications-header">
                      <h4>Notifications</h4>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="close-notifications"
                      >
                        ×
                      </button>
                    </div>
                    <div className="notifications-list">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        >
                          <div className="notification-text">{notification.text}</div>
                          <div 
                            className="notification-time"
                            style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                          >
                            {notification.time}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="user-info">
                <div 
                  className="user-avatar"
                  style={{ backgroundColor: "#4f46e5", color: "white" }}
                >
                  AU
                </div>
                <div className="user-details">
                  <div 
                    className="user-name"
                    style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                  >
                    Admin User
                  </div>
                  <div 
                    className="user-role"
                    style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                  >
                    System Administrator
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div 
          className="navigation-tabs"
          style={{
            backgroundColor: getThemeColor("#ffffff", "#1f2937"),
            borderBottom: `1px solid ${getThemeColor("#e5e7eb", "#374151")}`
          }}
        >
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
              style={{
                color: activeTab === "overview" ? "#d97706" : getThemeColor("#6b7280", "#9ca3af"),
                borderBottomColor: activeTab === "overview" ? "#d97706" : "transparent"
              }}
            >
              <FiHome className="tab-icon" />
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
              onClick={() => setActiveTab("departments")}
              style={{
                color: activeTab === "departments" ? "#d97706" : getThemeColor("#6b7280", "#9ca3af"),
                borderBottomColor: activeTab === "departments" ? "#d97706" : "transparent"
              }}
            >
              <FiBriefcase className="tab-icon" />
              Departments
            </button>
            <button
              className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
              style={{
                color: activeTab === "reports" ? "#d97706" : getThemeColor("#6b7280", "#9ca3af"),
                borderBottomColor: activeTab === "reports" ? "#d97706" : "transparent"
              }}
            >
              <FiBarChart2 className="tab-icon" />
              Reports
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="dashboard-main">
          {activeTab === "overview" && (
            <>
              {/* Quick Stats Grid */}
              <section className="stats-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                    >
                      <FiActivity className="title-icon" />
                      Quick Overview
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                    >
                      Real-time system metrics
                    </span>
                  </div>
                </div>
                
                <div className="stats-grid">
                  {quickStats.map((stat) => (
                    <div 
                      key={stat.id} 
                      className="stat-card"
                      style={{
                        backgroundColor: getThemeColor("#ffffff", "#1f2937"),
                        borderColor: getThemeColor("#e5e7eb", "#374151")
                      }}
                    >
                      <div className="stat-content">
                        <div 
                          className="stat-icon" 
                          style={{ backgroundColor: stat.color }}
                        >
                          {stat.icon}
                        </div>
                        <div className="stat-info">
                          <div 
                            className="stat-value"
                            style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                          >
                            {stat.value}
                          </div>
                          <div 
                            className="stat-label"
                            style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                          >
                            {stat.label}
                          </div>
                          <div className="stat-change" style={{ color: stat.color }}>
                            {stat.change}
                            <span className={`trend-arrow ${stat.trend}`}>
                              {stat.trend === "up" ? "↑" : "↓"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Activities */}
              <section className="activities-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                    >
                      <FiClock className="title-icon" />
                      Recent Activities
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                    >
                      Latest system activities
                    </span>
                  </div>
                </div>
                
                <div 
                  className="activities-list"
                  style={{
                    backgroundColor: getThemeColor("#ffffff", "#1f2937"),
                    borderColor: getThemeColor("#e5e7eb", "#374151")
                  }}
                >
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div 
                        className="activity-icon"
                        style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                      >
                        {activity.icon}
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                          <span 
                            className="activity-user"
                            style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                          >
                            {activity.user}
                          </span>
                          <span 
                            className="activity-action"
                            style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                          >
                            {activity.action}
                          </span>
                        </div>
                        <div className="activity-meta">
                          <span 
                            className="activity-department"
                            style={{
                              backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                              color: getThemeColor("#6b7280", "#9ca3af")
                            }}
                          >
                            {activity.department}
                          </span>
                          <span 
                            className="activity-time"
                            style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                          >
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "departments" && (
            <>
              {/* Department Quick Access */}
              <section className="quick-access-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                    >
                      <FiBriefcase className="title-icon" />
                      Quick Access
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                    >
                      Click to navigate directly
                    </span>
                  </div>
                </div>
                
                <div className="department-buttons-grid">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      className="department-button"
                      style={{ 
                        backgroundColor: dept.color,
                        color: "white"
                      }}
                      onClick={() => handleDepartmentClick(dept)}
                    >
                      <div className="dept-button-icon">{dept.icon}</div>
                      <span className="dept-button-text">{dept.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Departments Grid */}
              <section className="departments-grid-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                    >
                      <FiBriefcase className="title-icon" />
                      All Departments
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                    >
                      Detailed department information
                    </span>
                  </div>
                </div>
                
                <div className="departments-grid">
                  {departments.map((dept) => (
                    <div 
                      key={dept.id} 
                      className="department-card"
                      onClick={() => handleDepartmentClick(dept)}
                      style={{
                        backgroundColor: getThemeColor("#ffffff", "#1f2937"),
                        borderColor: getThemeColor("#e5e7eb", "#374151")
                      }}
                    >
                      <div className="dept-header">
                        <div 
                          className="dept-icon" 
                          style={{ backgroundColor: dept.color }}
                        >
                          {dept.icon}
                        </div>
                        <h4 
                          className="dept-name"
                          style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                        >
                          {dept.fullName}
                        </h4>
                      </div>
                      <p 
                        className="dept-desc"
                        style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                      >
                        {dept.description}
                      </p>
                      <div className="dept-stats">
                        {Object.entries(dept.stats).map(([key, value], idx) => (
                          <div key={idx} className="dept-stat">
                            <span 
                              className="stat-key"
                              style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                            >
                              {key}
                            </span>
                            <span 
                              className="stat-val"
                              style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button 
                        className="dept-btn" 
                        style={{ backgroundColor: dept.color }}
                      >
                        Access <FiChevronRight />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Production Modules Section */}
              <section className="production-modules-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                    >
                      <FiPackage className="title-icon" />
                      Production Modules
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                    >
                      Production department specific features
                    </span>
                  </div>
                </div>
                
                <div className="modules-grid">
                  {productionModules.map((module) => (
                    <div 
                      key={module.id} 
                      className="module-card"
                      onClick={() => handleProductionModuleClick(module)}
                      style={{
                        backgroundColor: getThemeColor("#ffffff", "#1f2937"),
                        borderColor: getThemeColor("#e5e7eb", "#374151")
                      }}
                    >
                      <div className="module-header">
                        <div 
                          className="module-icon" 
                          style={{ backgroundColor: module.color }}
                        >
                          {module.icon}
                        </div>
                        <h4 
                          className="module-name"
                          style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                        >
                          {module.name}
                        </h4>
                      </div>
                      <p 
                        className="module-desc"
                        style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                      >
                        {module.description}
                      </p>
                      <button 
                        className="module-btn" 
                        style={{ backgroundColor: module.color }}
                      >
                        Open <FiChevronRight />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === "reports" && (
            <section className="reports-section">
              <div className="section-header">
                <div className="section-title-wrapper">
                  <h3 
                    className="section-title"
                    style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                  >
                    <FiBarChart2 className="title-icon" />
                    Reports & Analytics
                  </h3>
                  <span 
                    className="section-subtitle"
                    style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                  >
                    Generate and view system reports
                  </span>
                </div>
              </div>
              
              <div className="reports-grid">
                {departments.map((dept) => (
                  <div 
                    key={dept.id} 
                    className="report-card"
                    style={{
                      backgroundColor: getThemeColor("#ffffff", "#1f2937"),
                      borderColor: getThemeColor("#e5e7eb", "#374151")
                    }}
                  >
                    <div className="report-header">
                      <div 
                        className="report-icon" 
                        style={{ backgroundColor: dept.color }}
                      >
                        {dept.icon}
                      </div>
                      <div>
                        <h4 
                          className="report-dept"
                          style={{ color: getThemeColor("#1f2937", "#f3f4f6") }}
                        >
                          {dept.name} Reports
                        </h4>
                        <p 
                          className="report-desc"
                          style={{ color: getThemeColor("#6b7280", "#9ca3af") }}
                        >
                          {dept.description}
                        </p>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button 
                        className="report-btn"
                        style={{
                          backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                          color: getThemeColor("#1f2937", "#f3f4f6"),
                          borderColor: getThemeColor("#e5e7eb", "#4b5563")
                        }}
                      >
                        <FiBarChart2 /> View Reports
                      </button>
                      <button 
                        className="report-btn primary"
                        style={{ backgroundColor: dept.color }}
                      >
                        <FiCalendar /> Generate Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;