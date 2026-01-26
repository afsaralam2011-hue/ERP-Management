// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUsers, FiDollarSign, FiPackage, FiTrendingUp, 
  FiActivity, FiBriefcase, FiSearch, FiSettings,
  FiChevronRight, FiDatabase, FiClock, FiSun,
  FiMoon, FiBarChart2, FiCalendar, FiBell,
  FiLogOut, FiHome, FiUser, FiMessageSquare,
  FiTarget, FiCheckCircle, FiAlertCircle, FiPercent
} from "react-icons/fi";
import { 
  FaIndustry, FaWarehouse, FaCogs, FaShieldAlt, 
  FaCut, FaBoxOpen, FaWeightHanging, FaChartLine,
  FaTachometerAlt, FaBullseye, FaDatabase as FaDb,
  FaCalendarAlt, FaUserFriends, FaMoneyBillWave,
  FaTruck, FaWrench, FaClipboardCheck
} from "react-icons/fa";
 import { ThemeContext, useTheme } from '../../contexts/ThemeContext';
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [productionStats, setProductionStats] = useState({
    totalProduction: 0,
    totalTarget: 0,
    efficiency: 0,
    machines: 0,
    operators: 0,
    shifts: 0
  });

  // Get theme colors based on current theme
  const getThemeColor = (lightColor, darkColor) => {
    return theme === "dark" ? darkColor : lightColor;
  };

  const getCardBackground = () => {
    return getThemeColor("#ffffff", "#1f2937");
  };

  const getCardBorder = () => {
    return getThemeColor("#e5e7eb", "#374151");
  };

  const getTextColor = () => {
    return getThemeColor("#1f2937", "#f3f4f6");
  };

  const getMutedTextColor = () => {
    return getThemeColor("#6b7280", "#9ca3af");
  };

  // Fetch production data on component mount
  useEffect(() => {
    // Simulate API call to fetch production data
    const fetchProductionStats = async () => {
      try {
        // In real app, fetch from your API
        const mockStats = {
          totalProduction: 48200,
          totalTarget: 52000,
          efficiency: 92.7,
          machines: 24,
          operators: 86,
          shifts: 3
        };
        setProductionStats(mockStats);
      } catch (error) {
        console.error("Error fetching production stats:", error);
      }
    };

    fetchProductionStats();
  }, []);

  const departments = [
    { 
      id: 1,
      name: "HR", 
      fullName: "Human Resources",
      color: "#4f46e5", 
      path: "/hr",
      stats: { 
        employees: "1,248", 
        growth: "+12%", 
        vacancies: "8"
      },
      description: "Manage employees, recruitment, payroll, and HR operations.",
      icon: <FaUserFriends />
    },
    { 
      id: 2,
      name: "Finance", 
      fullName: "Finance & Accounts",
      color: "#059669", 
      path: "/finance",
      stats: { 
        revenue: "₹42.8M", 
        growth: "+8.5%", 
        expenses: "₹18.2M"
      },
      description: "Financial planning, accounting, budgeting, and reporting.",
      icon: <FaMoneyBillWave />
    },
    { 
      id: 3,
      name: "Production", 
      fullName: "Production Department",
      color: "#d97706", 
      path: "/production/daily-report",
      stats: { 
        output: `${(productionStats.totalProduction / 1000).toFixed(1)}K`, 
        efficiency: `${productionStats.efficiency.toFixed(1)}%`, 
        machines: productionStats.machines
      },
      description: "Manufacturing operations, production planning, and quality control.",
      icon: <FaIndustry />
    },
    { 
      id: 4,
      name: "Sales", 
      fullName: "Sales & Marketing",
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
      fullName: "Information Technology",
      color: "#7c3aed", 
      path: "/it",
      stats: { 
        uptime: "99.8%", 
        tickets: "42", 
        projects: "8"
      },
      description: "IT infrastructure, software development, and technical support.",
      icon: <FaDb />
    },
    { 
      id: 6,
      name: "Logistics", 
      fullName: "Logistics & Supply",
      color: "#0891b2", 
      path: "/logistics",
      stats: { 
        shipments: "128", 
        delivered: "122", 
        pending: "6"
      },
      description: "Supply chain management, transportation, and distribution.",
      icon: <FaTruck />
    },
  ];

  const productionModules = [
    {
      id: 1,
      name: "Daily Production Report",
      path: "/production/daily-report",
      icon: <FaCalendarAlt />,
      color: "#d97706",
      description: "View and generate daily production reports for all sections"
    },
    {
      id: 2,
      name: "Machine Monitoring",
      path: "/production/machines",
      icon: <FaCogs />,
      color: "#3b82f6",
      description: "Monitor machine status, performance and maintenance"
    },
    {
      id: 3,
      name: "Quality Control",
      path: "/production/quality",
      icon: <FaClipboardCheck />,
      color: "#10b981",
      description: "Quality checks, inspection reports and compliance"
    },
    {
      id: 4,
      name: "Production Planning",
      path: "/production/planning",
      icon: <FiTarget />,
      color: "#8b5cf6",
      description: "Production schedules, planning and resource allocation"
    },
    {
      id: 5,
      name: "Raw Material Management",
      path: "/production/raw-material",
      icon: <FaWarehouse />,
      color: "#f59e0b",
      description: "Raw material tracking, inventory and consumption"
    },
    {
      id: 6,
      name: "Maintenance & Repairs",
      path: "/production/maintenance",
      icon: <FaWrench />,
      color: "#ec4899",
      description: "Machine maintenance schedules and repair logs"
    }
  ];

  const quickStats = [
    { 
      id: 1,
      label: "Total Employees", 
      value: "1,248", 
      change: "+12%", 
      icon: <FaUserFriends />, 
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
      icon: <FaMoneyBillWave />, 
      color: "#059669",
      trend: "up"
    },
    { 
      id: 4,
      label: "Production Output", 
      value: `${(productionStats.totalProduction / 1000).toFixed(1)}K`, 
      change: "+15%", 
      icon: <FaIndustry />, 
      color: "#d97706",
      trend: "up"
    },
    { 
      id: 5,
      label: "System Uptime", 
      value: "99.8%", 
      change: "+0.2%", 
      icon: <FaDb />, 
      color: "#7c3aed",
      trend: "up"
    },
    { 
      id: 6,
      label: "On-time Delivery", 
      value: "95%", 
      change: "+3%", 
      icon: <FaTruck />, 
      color: "#0891b2",
      trend: "up"
    },
  ];

  const productionSections = [
    {
      id: 1,
      name: "Raw Material",
      color: "#f59e0b",
      icon: <FaWarehouse />,
      production: "12,450 KG",
      target: "15,000 KG",
      efficiency: "83%"
    },
    {
      id: 2,
      name: "Flatting",
      color: "#3b82f6",
      icon: <FaIndustry />,
      production: "8,750 KG",
      target: "10,000 KG",
      efficiency: "87.5%"
    },
    {
      id: 3,
      name: "Spiral",
      color: "#8b5cf6",
      icon: <FaCogs />,
      production: "15,280 M",
      target: "16,000 M",
      efficiency: "95.5%"
    },
    {
      id: 4,
      name: "PVC Coating",
      color: "#10b981",
      icon: <FaShieldAlt />,
      production: "14,560 M",
      target: "15,000 M",
      efficiency: "97.1%"
    },
    {
      id: 5,
      name: "Cutting & Packing",
      color: "#ec4899",
      icon: <FaCut />,
      production: "13,890 M",
      target: "14,500 M",
      efficiency: "95.8%"
    },
    {
      id: 6,
      name: "Finishing Goods",
      color: "#06b6d4",
      icon: <FaBoxOpen />,
      production: "13,450 M",
      target: "14,000 M",
      efficiency: "96.1%"
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "Ahmed Khan",
      action: "approved daily production report",
      department: "Production",
      time: "10 min ago",
      icon: <FaIndustry />
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
      action: "processed payroll for March",
      department: "HR",
      time: "1 hour ago",
      icon: <FaUserFriends />
    },
    {
      id: 4,
      user: "Admin",
      action: "completed system maintenance",
      department: "IT",
      time: "2 hours ago",
      icon: <FaDb />
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
    // Clear user session and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const notifications = [
    { id: 1, text: "New production report ready for review", time: "5 min ago", read: false, type: "production" },
    { id: 2, text: "System maintenance scheduled for tonight", time: "1 hour ago", read: true, type: "system" },
    { id: 3, text: "New employee joined - Ali Hassan", time: "2 hours ago", read: true, type: "hr" },
  ];

  return (
    <div 
      className="dashboard-wrapper"
      style={{
        backgroundColor: getThemeColor("#f9fafb", "#111827"),
        color: getTextColor()
      }}
    >
      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header 
          className="main-header"
          style={{
            backgroundColor: getCardBackground(),
            borderBottom: `1px solid ${getCardBorder()}`
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
                  <FaIndustry />
                </div>
              </div>
              <div className="header-logo-text">
                <h1 style={{ color: getTextColor() }}>
                  Pakistan Wire Industries
                </h1>
                <p style={{ color: getMutedTextColor() }}>
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
                borderColor: getCardBorder()
              }}
            >
              <FiSearch 
                className="search-icon" 
                style={{ color: getMutedTextColor() }}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Search departments, reports, or users..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                  backgroundColor: "transparent",
                  color: getTextColor()
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
                  color: getMutedTextColor(),
                  borderColor: getCardBorder()
                }}
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <FiSun /> : <FiMoon />}
              </button>

              <div className="notification-wrapper">
                <button
                  className="notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                    color: getMutedTextColor(),
                    borderColor: getCardBorder()
                  }}
                  title="Notifications"
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
                      backgroundColor: getCardBackground(),
                      borderColor: getCardBorder(),
                      color: getTextColor()
                    }}
                  >
                    <div className="notifications-header">
                      <h4 style={{ color: getTextColor() }}>Notifications</h4>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="close-notifications"
                        style={{ color: getMutedTextColor() }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="notifications-list">
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          style={{
                            borderBottom: `1px solid ${getCardBorder()}`
                          }}
                        >
                          <div 
                            className="notification-text"
                            style={{ color: getTextColor() }}
                          >
                            {notification.text}
                          </div>
                          <div 
                            className="notification-time"
                            style={{ color: getMutedTextColor() }}
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
                    style={{ color: getTextColor() }}
                  >
                    Admin User
                  </div>
                  <div 
                    className="user-role"
                    style={{ color: getMutedTextColor() }}
                  >
                    System Administrator
                  </div>
                </div>
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                  style={{
                    color: getMutedTextColor(),
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem",
                    borderRadius: "8px",
                    marginLeft: "0.5rem"
                  }}
                >
                  <FiLogOut />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div 
          className="navigation-tabs"
          style={{
            backgroundColor: getCardBackground(),
            borderBottom: `1px solid ${getCardBorder()}`
          }}
        >
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
              style={{
                color: activeTab === "overview" ? "#d97706" : getMutedTextColor(),
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
                color: activeTab === "departments" ? "#d97706" : getMutedTextColor(),
                borderBottomColor: activeTab === "departments" ? "#d97706" : "transparent"
              }}
            >
              <FiBriefcase className="tab-icon" />
              Departments
            </button>
            <button
              className={`tab-btn ${activeTab === "production" ? "active" : ""}`}
              onClick={() => setActiveTab("production")}
              style={{
                color: activeTab === "production" ? "#d97706" : getMutedTextColor(),
                borderBottomColor: activeTab === "production" ? "#d97706" : "transparent"
              }}
            >
              <FaIndustry className="tab-icon" />
              Production
            </button>
            <button
              className={`tab-btn ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
              style={{
                color: activeTab === "reports" ? "#d97706" : getMutedTextColor(),
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
                      style={{ color: getTextColor() }}
                    >
                      <FiActivity className="title-icon" />
                      Quick Overview
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getMutedTextColor() }}
                    >
                      Real-time system metrics and performance indicators
                    </span>
                  </div>
                </div>
                
                <div className="stats-grid">
                  {quickStats.map((stat) => (
                    <div 
                      key={stat.id} 
                      className="stat-card"
                      style={{
                        backgroundColor: getCardBackground(),
                        borderColor: getCardBorder()
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
                            style={{ color: getTextColor() }}
                          >
                            {stat.value}
                          </div>
                          <div 
                            className="stat-label"
                            style={{ color: getMutedTextColor() }}
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

              {/* Production Performance */}
              <section className="production-performance-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getTextColor() }}
                    >
                      <FaIndustry className="title-icon" />
                      Production Performance
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getMutedTextColor() }}
                    >
                      Real-time production metrics from all sections
                    </span>
                  </div>
                </div>
                
                <div className="production-stats-grid">
                  <div 
                    className="production-stat-card main"
                    style={{
                      backgroundColor: getCardBackground(),
                      borderColor: getCardBorder()
                    }}
                  >
                    <div className="production-stat-content">
                      <div className="production-stat-icon">
                        <FaChartLine style={{ color: "#d97706" }} />
                      </div>
                      <div className="production-stat-info">
                        <div 
                          className="production-stat-value"
                          style={{ color: getTextColor() }}
                        >
                          {productionStats.totalProduction.toLocaleString()}
                        </div>
                        <div 
                          className="production-stat-label"
                          style={{ color: getMutedTextColor() }}
                        >
                          Total Production
                        </div>
                        <div className="production-stat-sub">
                          <span style={{ color: "#d97706" }}>
                            Target: {productionStats.totalTarget.toLocaleString()}
                          </span>
                          <span style={{ color: productionStats.efficiency >= 90 ? "#10b981" : "#f59e0b" }}>
                            Efficiency: {productionStats.efficiency.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="production-stat-card"
                    style={{
                      backgroundColor: getCardBackground(),
                      borderColor: getCardBorder()
                    }}
                  >
                    <div className="production-stat-icon">
                      <FaCogs style={{ color: "#3b82f6" }} />
                    </div>
                    <div className="production-stat-info">
                      <div 
                        className="production-stat-value"
                        style={{ color: getTextColor() }}
                      >
                        {productionStats.machines}
                      </div>
                      <div 
                        className="production-stat-label"
                        style={{ color: getMutedTextColor() }}
                      >
                        Active Machines
                      </div>
                    </div>
                  </div>

                  <div 
                    className="production-stat-card"
                    style={{
                      backgroundColor: getCardBackground(),
                      borderColor: getCardBorder()
                    }}
                  >
                    <div className="production-stat-icon">
                      <FaUserFriends style={{ color: "#8b5cf6" }} />
                    </div>
                    <div className="production-stat-info">
                      <div 
                        className="production-stat-value"
                        style={{ color: getTextColor() }}
                      >
                        {productionStats.operators}
                      </div>
                      <div 
                        className="production-stat-label"
                        style={{ color: getMutedTextColor() }}
                      >
                        Operators
                      </div>
                    </div>
                  </div>

                  <div 
                    className="production-stat-card"
                    style={{
                      backgroundColor: getCardBackground(),
                      borderColor: getCardBorder()
                    }}
                  >
                    <div className="production-stat-icon">
                      <FiClock style={{ color: "#10b981" }} />
                    </div>
                    <div className="production-stat-info">
                      <div 
                        className="production-stat-value"
                        style={{ color: getTextColor() }}
                      >
                        {productionStats.shifts}
                      </div>
                      <div 
                        className="production-stat-label"
                        style={{ color: getMutedTextColor() }}
                      >
                        Active Shifts
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Activities */}
              <section className="activities-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getTextColor() }}
                    >
                      <FiClock className="title-icon" />
                      Recent Activities
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getMutedTextColor() }}
                    >
                      Latest system activities and updates
                    </span>
                  </div>
                </div>
                
                <div 
                  className="activities-list"
                  style={{
                    backgroundColor: getCardBackground(),
                    borderColor: getCardBorder()
                  }}
                >
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="activity-item"
                      style={{
                        borderBottom: `1px solid ${getCardBorder()}`
                      }}
                    >
                      <div 
                        className="activity-icon"
                        style={{ color: getMutedTextColor() }}
                      >
                        {activity.icon}
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                          <span 
                            className="activity-user"
                            style={{ color: getTextColor() }}
                          >
                            {activity.user}
                          </span>
                          <span 
                            className="activity-action"
                            style={{ color: getMutedTextColor() }}
                          >
                            {activity.action}
                          </span>
                        </div>
                        <div className="activity-meta">
                          <span 
                            className="activity-department"
                            style={{
                              backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                              color: getMutedTextColor()
                            }}
                          >
                            {activity.department}
                          </span>
                          <span 
                            className="activity-time"
                            style={{ color: getMutedTextColor() }}
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
                      style={{ color: getTextColor() }}
                    >
                      <FiBriefcase className="title-icon" />
                      Quick Access
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getMutedTextColor() }}
                    >
                      Click to navigate directly to any department
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
                      style={{ color: getTextColor() }}
                    >
                      <FiBriefcase className="title-icon" />
                      All Departments
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getMutedTextColor() }}
                    >
                      Detailed department information and access
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
                        backgroundColor: getCardBackground(),
                        borderColor: getCardBorder()
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
                          style={{ color: getTextColor() }}
                        >
                          {dept.fullName}
                        </h4>
                      </div>
                      <p 
                        className="dept-desc"
                        style={{ color: getMutedTextColor() }}
                      >
                        {dept.description}
                      </p>
                      <div className="dept-stats">
                        {Object.entries(dept.stats).map(([key, value], idx) => (
                          <div key={idx} className="dept-stat">
                            <span 
                              className="stat-key"
                              style={{ color: getMutedTextColor() }}
                            >
                              {key}
                            </span>
                            <span 
                              className="stat-val"
                              style={{ color: getTextColor() }}
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
            </>
          )}

          {activeTab === "production" && (
            <>
              {/* Production Overview */}
              <section className="production-overview-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getTextColor() }}
                    >
                      <FaIndustry className="title-icon" />
                      Production Overview
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getMutedTextColor() }}
                    >
                      Complete production department management and monitoring
                    </span>
                  </div>
                  <button
                    className="generate-report-btn"
                    onClick={() => navigate("/production/daily-report")}
                    style={{ backgroundColor: "#d97706", color: "white" }}
                  >
                    <FaCalendarAlt /> Generate Daily Report
                  </button>
                </div>

                {/* Production Sections Performance */}
                <div className="production-sections-grid">
                  <div className="section-header">
                    <h4 style={{ color: getTextColor() }}>
                      Production Sections Performance
                    </h4>
                    <span style={{ color: getMutedTextColor() }}>
                      Today's performance across all sections
                    </span>
                  </div>
                  
                  <div className="sections-performance-grid">
                    {productionSections.map((section) => (
                      <div 
                        key={section.id} 
                        className="section-performance-card"
                        style={{
                          backgroundColor: getCardBackground(),
                          borderColor: getCardBorder()
                        }}
                      >
                        <div className="section-performance-header">
                          <div 
                            className="section-icon"
                            style={{ backgroundColor: section.color }}
                          >
                            {section.icon}
                          </div>
                          <h5 style={{ color: getTextColor() }}>{section.name}</h5>
                        </div>
                        <div className="section-performance-stats">
                          <div className="section-stat">
                            <span style={{ color: getMutedTextColor() }}>Production</span>
                            <span style={{ color: getTextColor(), fontWeight: "600" }}>
                              {section.production}
                            </span>
                          </div>
                          <div className="section-stat">
                            <span style={{ color: getMutedTextColor() }}>Target</span>
                            <span style={{ color: getTextColor() }}>{section.target}</span>
                          </div>
                          <div className="section-stat">
                            <span style={{ color: getMutedTextColor() }}>Efficiency</span>
                            <span 
                              style={{ 
                                color: parseFloat(section.efficiency) >= 90 ? "#10b981" : 
                                       parseFloat(section.efficiency) >= 80 ? "#f59e0b" : "#ef4444",
                                fontWeight: "600"
                              }}
                            >
                              {section.efficiency}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Production Modules */}
              <section className="production-modules-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 
                      className="section-title"
                      style={{ color: getTextColor() }}
                    >
                      <FiPackage className="title-icon" />
                      Production Modules
                    </h3>
                    <span 
                      className="section-subtitle"
                      style={{ color: getMutedTextColor() }}
                    >
                      Access all production management features
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
                        backgroundColor: getCardBackground(),
                        borderColor: getCardBorder()
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
                          style={{ color: getTextColor() }}
                        >
                          {module.name}
                        </h4>
                      </div>
                      <p 
                        className="module-desc"
                        style={{ color: getMutedTextColor() }}
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
                    style={{ color: getTextColor() }}
                  >
                    <FiBarChart2 className="title-icon" />
                    Reports & Analytics
                  </h3>
                  <span 
                    className="section-subtitle"
                    style={{ color: getMutedTextColor() }}
                  >
                    Generate and view detailed system reports
                  </span>
                </div>
              </div>
              
              <div className="reports-grid">
                {departments.map((dept) => (
                  <div 
                    key={dept.id} 
                    className="report-card"
                    style={{
                      backgroundColor: getCardBackground(),
                      borderColor: getCardBorder()
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
                          style={{ color: getTextColor() }}
                        >
                          {dept.name} Reports
                        </h4>
                        <p 
                          className="report-desc"
                          style={{ color: getMutedTextColor() }}
                        >
                          {dept.description}
                        </p>
                      </div>
                    </div>
                    <div className="report-actions">
                      <button 
                        className="report-btn"
                        onClick={() => navigate(`${dept.path}/reports`)}
                        style={{
                          backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                          color: getTextColor(),
                          borderColor: getCardBorder()
                        }}
                      >
                        <FiBarChart2 /> View Reports
                      </button>
                      <button 
                        className="report-btn primary"
                        onClick={() => navigate(`${dept.path}/generate-report`)}
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