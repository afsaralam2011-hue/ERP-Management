// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiDollarSign, FiPackage, FiTrendingUp,
  FiActivity, FiBriefcase, FiSearch, FiSettings,
  FiChevronRight, FiDatabase, FiClock, FiSun,
  FiMoon, FiBarChart2, FiCalendar, FiBell,
  FiLogOut, FiHome, FiUser, FiMessageSquare,
  FiTarget, FiCheckCircle, FiAlertCircle, FiPercent,
  FiGrid, FiFolder, FiLayers, FiBox, FiClipboard,
  FiTool, FiArchive, FiCheckSquare, FiScissors,
  FiShoppingCart, FiCpu, FiTruck
} from "react-icons/fi";
import { 
  FaIndustry, FaWarehouse, FaCogs, FaShieldAlt, 
  FaCut, FaBoxOpen, FaWeightHanging, FaChartLine,
  FaTachometerAlt, FaBullseye, FaDatabase as FaDb,
  FaCalendarAlt, FaUserFriends, FaMoneyBillWave,
  FaTruck as FaTruckIcon, FaWrench, FaClipboardCheck,
  FaHome
} from "react-icons/fa";
import { useTheme } from '../../contexts/ThemeContext';
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentTheme, mode, isDarkMode, isLightMode, setMode } = useTheme();
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

  // تھیم کلرز - FIXED: انڈیگو/نیوی بلیو کالرز کا استعمال
  const themeColors = {
    // Light theme colors (indigo/navy blue text)
    light: {
      background: currentTheme?.colors?.background || '#FFFFFF',
      surface: currentTheme?.colors?.surface || '#F5F5F5',
      textPrimary: currentTheme?.colors?.textPrimary || '#1A237E',        // Deep Indigo/Navy Blue
      textSecondary: currentTheme?.colors?.textSecondary || '#283593',    // Medium Indigo/Navy Blue
      textMuted: currentTheme?.colors?.textHint || '#5C6BC0',             // Light Indigo
      border: currentTheme?.colors?.border || '#E0E0E0',
      divider: currentTheme?.colors?.divider || '#EEEEEE',
      cardBg: currentTheme?.colors?.cardBackground || '#FFFFFF',
      hover: currentTheme?.colors?.hover || 'rgba(26, 35, 126, 0.04)',
      selected: currentTheme?.colors?.selected || 'rgba(25, 118, 210, 0.08)',
      focus: currentTheme?.colors?.focus || 'rgba(25, 118, 210, 0.12)',
      primary: currentTheme?.colors?.primary || '#1976D2',
      primaryLight: currentTheme?.colors?.primaryLight || '#BBDEFB',
      primaryDark: currentTheme?.colors?.primaryDark || '#0D47A1',
      secondary: currentTheme?.colors?.secondary || '#64B5F6',
      success: currentTheme?.colors?.success || '#4CAF50',
      warning: currentTheme?.colors?.warning || '#FF9800',
      error: currentTheme?.colors?.error || '#F44336',
      info: currentTheme?.colors?.info || '#2196F3',
    },
    // Dark theme colors (light blue/indigo text - NO BLACK)
    dark: {
      background: currentTheme?.colors?.background || '#121212',
      surface: currentTheme?.colors?.surface || '#1E1E1E',
      textPrimary: currentTheme?.colors?.textPrimary || '#E3F2FD',        // Light Blue/White
      textSecondary: currentTheme?.colors?.textSecondary || '#BBDEFB',    // Light Blue
      textMuted: currentTheme?.colors?.textHint || '#90A4AE',             // Blue-Grey
      border: currentTheme?.colors?.border || '#2D2D2D',
      divider: currentTheme?.colors?.divider || '#37474F',
      cardBg: currentTheme?.colors?.cardBackground || '#1E1E1E',
      hover: currentTheme?.colors?.hover || 'rgba(187, 222, 251, 0.08)',
      selected: currentTheme?.colors?.selected || 'rgba(144, 202, 249, 0.16)',
      focus: currentTheme?.colors?.focus || 'rgba(66, 165, 245, 0.12)',
      primary: currentTheme?.colors?.primary || '#90CAF9',
      primaryLight: currentTheme?.colors?.primaryLight || '#E3F2FD',
      primaryDark: currentTheme?.colors?.primaryDark || '#42A5F5',
      secondary: currentTheme?.colors?.secondary || '#64B5F6',
      success: currentTheme?.colors?.success || '#66BB6A',
      warning: currentTheme?.colors?.warning || '#FFB74D',
      error: currentTheme?.colors?.error || '#EF5350',
      info: currentTheme?.colors?.info || '#42A5F5',
    }
  };

  // تھیم کے مطابق کلرز حاصل کرنے کا فنکشن
  const getThemeColor = () => {
    return isDarkMode ? themeColors.dark : themeColors.light;
  };

  const colors = getThemeColor();

  // Fetch production data on component mount
  useEffect(() => {
    const fetchProductionStats = async () => {
      try {
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

  // All Departments with their sub-sections
  const departments = [
    {
      id: 1,
      name: "Dashboard",
      fullName: "Main Dashboard",
      color: colors.primary,
      path: "/dashboard",
      icon: <FaHome />,
      description: "System overview and quick access to all modules",
      subSections: []
    },
    {
      id: 2,
      name: "Production",
      fullName: "Production Dashboard",
      color: colors.success,
      path: "/dashboard/production",
      icon: <FaIndustry />,
      description: "Complete production management and monitoring",
      subSections: [
        {
          name: "New Production",
          path: "/production/new",
          icon: <FiGrid />
        },
        {
          name: "Production Department",
          path: "/production",
          icon: <FiGrid />
        },
        {
          name: "All Sections",
          path: "/production-sections",
          icon: <FiFolder />
        },
        {
          name: "Daily Production Report",
          path: "/production-reports/daily",
          icon: <FiActivity />
        },
        {
          name: "Raw Material Department",
          path: "/production-sections/raw-material",
          icon: <FiDatabase />,
          subItems: [
            { name: "Raw Material Section", path: "/production-sections/raw-material" },
            { name: "Raw Material Entry", path: "/production-sections/raw-material/new" },
            { name: "Material Received", path: "/production-sections/raw-material/material-received" },
            { name: "Material Issue", path: "/production-sections/raw-material/material-issue" },
            { name: "New Material Log", path: "/production-sections/raw-material/new-log" }
          ]
        },
        {
          name: "Flattening Department",
          path: "/production-sections/flattening",
          icon: <FiBox />,
          subItems: [
            { name: "Flattening Section", path: "/production-sections/flattening" },
            { name: "Flattening Production Entry", path: "/production-sections/flattening/smart-entry" },
            { name: "Flattening Inventory", path: "/flattening-inventory" },
            { name: "Flattening Ledger", path: "/flattening-ledger" },
            { name: "New Flattening Record", path: "/production-sections/flattening/new" }
          ]
        },
        {
          name: "Spiral Department",
          path: "/production-sections/spiral",
          icon: <FiLayers />,
          subItems: [
            { name: "Spiral Section", path: "/production-sections/spiral" },
            { name: "Spiral Production Entry", path: "/production-sections/spiral/smart-entry" },
            { name: "Spiral Smart Entry", path: "/production-sections/spiral/smart-entry" },
            { name: "New Spiral Record", path: "/production-sections/spiral/new" }
          ]
        },
        {
          name: "PVC Coating Department",
          path: "/production-sections/pvc-coating",
          icon: <FiPackage />,
          subItems: [
            { name: "PVC Coating Section", path: "/production-sections/pvc-coating" },
            { name: "PVC Smart Entry", path: "/production-sections/pvc-coating/smart-form" },
            { name: "PVC Production Entry", path: "/production-sections/pvc-coating/smart-form" },
            { name: "New PVC Record", path: "/production-sections/pvc-coating/new" }
          ]
        },
        {
          name: "Cutting Packing Section",
          path: "/dashboard/production",
          icon: <FiScissors />,
          subItems: [
            { name: "Cutting Packing Section", path: "/dashboard/production" },
            { name: "Cutting Packing Entry", path: "/dashboard/production" },
            { name: "Packing Inventory Reports", path: "/production-reports/daily" }
          ]
        },
        {
          name: "Finished Goods Section",
          path: "/dashboard/production",
          icon: <FiCheckSquare />,
          subItems: [
            { name: "Finished Goods Section", path: "/dashboard/production" },
            { name: "Finished Goods Inventory", path: "/production-reports/daily" }
          ]
        }
      ]
    },
    {
      id: 3,
      name: "HR",
      fullName: "Human Resources Department",
      color: "#8B5CF6",
      path: "/hr",
      icon: <FiUsers />,
      description: "Employee management, payroll, and HR operations",
      subSections: [
        { name: "Employees", path: "/hr/employees", icon: <FiUsers /> },
        { name: "Attendance", path: "/hr/attendance", icon: <FiClipboard /> },
        { name: "Payroll", path: "/hr/payroll", icon: <FiDollarSign /> },
        { name: "Leaves", path: "/hr/leaves", icon: <FiActivity /> }
      ]
    },
    {
      id: 4,
      name: "Finance",
      fullName: "Finance Department",
      color: "#F59E0B",
      path: "/finance",
      icon: <FiDollarSign />,
      description: "Financial planning, accounting, and reporting",
      subSections: [
        { name: "Accounts", path: "/finance/accounts", icon: <FiDollarSign /> },
        { name: "Invoices", path: "/finance/invoices", icon: <FiClipboard /> },
        { name: "Expenses", path: "/finance/expenses", icon: <FiActivity /> },
        { name: "Reports", path: "/finance/reports", icon: <FiDatabase /> }
      ]
    },
    {
      id: 5,
      name: "Sales",
      fullName: "Sales Department",
      color: "#EF4444",
      path: "/sales",
      icon: <FiShoppingCart />,
      description: "Sales strategies and customer relationship management",
      subSections: [
        { name: "Orders", path: "/sales/orders", icon: <FiShoppingCart /> },
        { name: "Customers", path: "/sales/customers", icon: <FiUsers /> },
        { name: "Invoices", path: "/sales/invoices", icon: <FiClipboard /> },
        { name: "Reports", path: "/sales/reports", icon: <FiDatabase /> }
      ]
    },
    {
      id: 6,
      name: "IT",
      fullName: "IT Department",
      color: "#06B6D4",
      path: "/it",
      icon: <FiCpu />,
      description: "IT infrastructure and technical support",
      subSections: [
        { name: "IT Support", path: "/it/support", icon: <FiTool /> },
        { name: "Assets", path: "/it/assets", icon: <FiDatabase /> },
        { name: "Network", path: "/it/network", icon: <FiActivity /> },
        { name: "Security", path: "/it/security", icon: <FiClipboard /> }
      ]
    },
    {
      id: 7,
      name: "Logistics",
      fullName: "Logistics Department",
      color: "#84CC16",
      path: "/logistics",
      icon: <FiTruck />,
      description: "Supply chain management and distribution",
      subSections: [
        { name: "Inventory", path: "/logistics/inventory", icon: <FiDatabase /> },
        { name: "Shipping", path: "/logistics/shipping", icon: <FiTruck /> },
        { name: "Suppliers", path: "/logistics/suppliers", icon: <FiUsers /> },
        { name: "Tracking", path: "/logistics/tracking", icon: <FiActivity /> }
      ]
    }
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
      color: colors.primary,
      description: "Monitor machine status, performance and maintenance"
    },
    {
      id: 3,
      name: "Quality Control",
      path: "/production/quality",
      icon: <FaClipboardCheck />,
      color: colors.success,
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
      icon: <FiUsers />,
      color: "#8B5CF6",
      trend: "up"
    },
    {
      id: 2,
      label: "Active Orders",
      value: "342",
      change: "+5%",
      icon: <FiShoppingCart />,
      color: "#EF4444",
      trend: "up"
    },
    {
      id: 3,
      label: "Monthly Revenue",
      value: "₹42.8M",
      change: "+8.5%",
      icon: <FiDollarSign />,
      color: "#F59E0B",
      trend: "up"
    },
    {
      id: 4,
      label: "Production Output",
      value: `${(productionStats.totalProduction / 1000).toFixed(1)}K`,
      change: "+15%",
      icon: <FiPackage />,
      color: colors.success,
      trend: "up"
    },
    {
      id: 5,
      label: "System Uptime",
      value: "99.8%",
      change: "+0.2%",
      icon: <FiCpu />,
      color: "#06B6D4",
      trend: "up"
    },
    {
      id: 6,
      label: "On-time Delivery",
      value: "95%",
      change: "+3%",
      icon: <FiTruck />,
      color: "#84CC16",
      trend: "up"
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
      icon: <FiUsers />
    },
    {
      id: 4,
      user: "Admin",
      action: "completed system maintenance",
      department: "IT",
      time: "2 hours ago",
      icon: <FiCpu />
    }
  ];

  const handleDepartmentClick = (department) => {
    navigate(department.path);
  };

  const handleSubSectionClick = (path, e) => {
    e.stopPropagation();
    navigate(path);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleTheme = () => {
    setMode(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="dashboard-wrapper" style={{ 
      backgroundColor: colors.background,
      color: colors.textPrimary
    }}>
      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="main-header" style={{ 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border
        }}>
          <div className="header-left">
            <div className="header-logo">
              <div className="header-logo-icon">
                <div className="pwi-logo" style={{ backgroundColor: colors.primary }}>
                  <FaIndustry style={{ color: 'white' }} />
                </div>
              </div>
              <div className="header-logo-text">
                <h1 style={{ color: colors.textPrimary }}>Pakistan Wire Industries</h1>
                <p style={{ color: colors.textSecondary }}>SPI & CCD Division - ERP System</p>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="search-box" style={{ 
              borderColor: colors.border,
              backgroundColor: colors.surface
            }}>
              <FiSearch className="search-icon" style={{ color: colors.textMuted }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search departments, reports, or users..."
                value={searchQuery}
                onChange={handleSearch}
                style={{ color: colors.textPrimary }}
              />
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.textMuted
                }}
              >
                {isDarkMode ? <FiSun /> : <FiMoon />}
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="navigation-tabs" style={{ 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border
        }}>
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
              style={{ color: colors.textSecondary }}
            >
              <FaHome className="tab-icon" />
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "departments" ? "active" : ""}`}
              onClick={() => setActiveTab("departments")}
              style={{ color: colors.textSecondary }}
            >
              <FiBriefcase className="tab-icon" />
              All Departments
            </button>
            <button
              className={`tab-btn ${activeTab === "production" ? "active" : ""}`}
              onClick={() => setActiveTab("production")}
              style={{ color: colors.textSecondary }}
            >
              <FaIndustry className="tab-icon" />
              Production
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
                    <h3 className="section-title" style={{ color: colors.textPrimary }}>
                      <FiActivity className="title-icon" />
                      Quick Overview
                    </h3>
                    <span className="section-subtitle" style={{ color: colors.textSecondary }}>
                      Real-time system metrics and performance indicators
                    </span>
                  </div>
                </div>

                <div className="stats-grid">
                  {quickStats.map((stat) => (
                    <div key={stat.id} className="stat-card" style={{ 
                      borderColor: colors.border,
                      backgroundColor: colors.cardBg
                    }}>
                      <div className="stat-content">
                        <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                          {stat.icon}
                        </div>
                        <div className="stat-info">
                          <div className="stat-value" style={{ color: colors.textPrimary }}>{stat.value}</div>
                          <div className="stat-label" style={{ color: colors.textSecondary }}>{stat.label}</div>
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

              {/* Departments Quick Access */}
              <section className="quick-access-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 className="section-title" style={{ color: colors.textPrimary }}>
                      <FiBriefcase className="title-icon" />
                      Departments Quick Access
                    </h3>
                    <span className="section-subtitle" style={{ color: colors.textSecondary }}>
                      Click any department to access its features
                    </span>
                  </div>
                </div>

                <div className="department-buttons-grid">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      className="department-button"
                      style={{ backgroundColor: dept.color }}
                      onClick={() => handleDepartmentClick(dept)}
                    >
                      <div className="dept-button-icon">{dept.icon}</div>
                      <span className="dept-button-text">{dept.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Recent Activities */}
              <section className="activities-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 className="section-title" style={{ color: colors.textPrimary }}>
                      <FiClock className="title-icon" />
                      Recent Activities
                    </h3>
                    <span className="section-subtitle" style={{ color: colors.textSecondary }}>
                      Latest system activities and updates
                    </span>
                  </div>
                </div>

                <div className="activities-list" style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.cardBg
                }}>
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item" style={{ 
                      borderBottomColor: colors.divider
                    }}>
                      <div className="activity-icon" style={{ color: colors.textMuted }}>
                        {activity.icon}
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                          <span className="activity-user" style={{ color: colors.textPrimary }}>
                            {activity.user}
                          </span>
                          <span className="activity-action" style={{ color: colors.textSecondary }}>
                            {activity.action}
                          </span>
                        </div>
                        <div className="activity-meta">
                          <span className="activity-department" style={{ 
                            backgroundColor: colors.surface,
                            color: colors.textSecondary
                          }}>
                            {activity.department}
                          </span>
                          <span className="activity-time" style={{ color: colors.textMuted }}>
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
            <section className="departments-grid-section">
              <div className="section-header">
                <div className="section-title-wrapper">
                  <h3 className="section-title" style={{ color: colors.textPrimary }}>
                    <FiBriefcase className="title-icon" />
                    All Departments
                  </h3>
                  <span className="section-subtitle" style={{ color: colors.textSecondary }}>
                    Click any department to access its modules and features
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
                      borderColor: colors.border,
                      backgroundColor: colors.cardBg
                    }}
                  >
                    <div className="dept-header">
                      <div className="dept-icon" style={{ backgroundColor: dept.color }}>
                        {dept.icon}
                      </div>
                      <div>
                        <h4 className="dept-name" style={{ color: colors.textPrimary }}>{dept.fullName}</h4>
                        <p className="dept-desc" style={{ color: colors.textSecondary }}>{dept.description}</p>
                      </div>
                    </div>
                    
                    {dept.subSections.length > 0 && (
                      <div className="dept-sub-sections">
                        <div className="sub-sections-title" style={{ color: colors.textMuted }}>
                          Available Sections:
                        </div>
                        <div className="sub-sections-grid">
                          {dept.subSections.map((section, idx) => (
                            <button
                              key={idx}
                              className="sub-section-btn"
                              onClick={(e) => handleSubSectionClick(section.path, e)}
                              style={{ 
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                color: colors.textPrimary
                              }}
                            >
                              {section.icon && <span className="sub-section-icon" style={{ color: dept.color }}>{section.icon}</span>}
                              <span className="sub-section-text">{section.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button
                      className="dept-btn"
                      style={{ backgroundColor: dept.color }}
                    >
                      Open {dept.name} Department
                      <FiChevronRight className="dept-btn-icon" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "production" && (
            <>
              {/* Production Overview */}
              <section className="production-overview-section">
                <div className="section-header">
                  <div className="section-title-wrapper">
                    <h3 className="section-title" style={{ color: colors.textPrimary }}>
                      <FaIndustry className="title-icon" />
                      Production Department
                    </h3>
                    <span className="section-subtitle" style={{ color: colors.textSecondary }}>
                      Complete production management and monitoring system
                    </span>
                  </div>
                  <button
                    className="generate-report-btn"
                    onClick={() => navigate("/production/daily-report")}
                  >
                    <FaCalendarAlt /> Generate Daily Report
                  </button>
                </div>

                {/* Production Department Main Card */}
                <div className="production-main-card">
                  <div
                    className="production-dept-card"
                    onClick={() => navigate("/dashboard/production")}
                    style={{ 
                      borderColor: colors.success,
                      backgroundColor: colors.cardBg
                    }}
                  >
                    <div className="dept-header">
                      <div className="dept-icon" style={{ backgroundColor: colors.success }}>
                        <FaIndustry />
                      </div>
                      <div>
                        <h4 className="dept-name" style={{ color: colors.textPrimary }}>Production Department</h4>
                        <p className="dept-desc" style={{ color: colors.textSecondary }}>
                          Complete production management system including all sections and departments
                        </p>
                      </div>
                    </div>
                    
                    <div className="dept-stats">
                      <div className="dept-stat" style={{ backgroundColor: colors.surface }}>
                        <div className="stat-label" style={{ color: colors.textMuted }}>Total Production</div>
                        <div className="stat-value" style={{ color: colors.textPrimary }}>
                          {productionStats.totalProduction.toLocaleString()}
                        </div>
                      </div>
                      <div className="dept-stat" style={{ backgroundColor: colors.surface }}>
                        <div className="stat-label" style={{ color: colors.textMuted }}>Efficiency</div>
                        <div className="stat-value" style={{ color: colors.success }}>
                          {productionStats.efficiency.toFixed(1)}%
                        </div>
                      </div>
                      <div className="dept-stat" style={{ backgroundColor: colors.surface }}>
                        <div className="stat-label" style={{ color: colors.textMuted }}>Active Machines</div>
                        <div className="stat-value" style={{ color: colors.textPrimary }}>
                          {productionStats.machines}
                        </div>
                      </div>
                    </div>
                    
                    <button className="dept-btn" style={{ backgroundColor: colors.success }}>
                      Open Production Dashboard
                      <FiChevronRight className="dept-btn-icon" />
                    </button>
                  </div>
                </div>

                {/* Production Modules */}
                <div className="production-modules-section" style={{ 
                  background: isDarkMode 
                    ? `linear-gradient(135deg, ${colors.success}20 0%, ${colors.success}10 100%)`
                    : `linear-gradient(135deg, ${colors.success}10 0%, ${colors.success}05 100%)`
                }}>
                  <div className="section-header">
                    <h3 className="section-title" style={{ color: colors.textPrimary }}>
                      <FiPackage className="title-icon" />
                      Production Tools & Reports
                    </h3>
                    <span className="section-subtitle" style={{ color: colors.textSecondary }}>
                      Additional production management features
                    </span>
                  </div>

                  <div className="modules-grid">
                    {productionModules.map((module) => (
                      <div
                        key={module.id}
                        className="module-card"
                        onClick={() => navigate(module.path)}
                        style={{ 
                          borderColor: colors.border,
                          backgroundColor: colors.cardBg
                        }}
                      >
                        <div className="module-header">
                          <div className="module-icon" style={{ backgroundColor: module.color }}>
                            {module.icon}
                          </div>
                          <h4 className="module-name" style={{ color: colors.textPrimary }}>{module.name}</h4>
                        </div>
                        <p className="module-desc" style={{ color: colors.textSecondary }}>{module.description}</p>
                        <button
                          className="module-btn"
                          style={{ backgroundColor: module.color }}
                        >
                          Open <FiChevronRight />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;