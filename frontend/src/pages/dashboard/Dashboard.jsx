// src/pages/dashboard/Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUsers, FiDollarSign, FiPackage, FiTrendingUp, 
  FiCpu, FiTruck, FiActivity, FiCalendar, 
  FiHome, FiBarChart2, FiSettings,
  FiChevronRight, FiAward, FiShield,
  FiBell, FiSearch, FiFileText, FiTarget,
  FiChevronLeft
} from "react-icons/fi";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSidebarItem, setActiveSidebarItem] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  
  const sidebarRef = useRef(null);
  const mainContentRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle mouse enter - open sidebar
  const handleMouseEnter = () => {
    if (!isMobile && !sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  // Handle mouse leave - close sidebar
  const handleMouseLeave = () => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // User information
  const userInfo = {
    name: "Admin User",
    role: "System Administrator",
    initials: "AU"
  };

  // Sidebar Navigation Items
  const sidebarItems = [
    { name: "Dashboard", icon: <FiHome />, path: "/dashboard" },
    { name: "Analytics", icon: <FiBarChart2 />, path: "/analytics" },
    { name: "Reports", icon: <FiFileText />, path: "/reports" },
    { name: "Calendar", icon: <FiCalendar />, path: "/calendar" },
    { name: "Targets", icon: <FiTarget />, path: "/targets" },
    { name: "Achievements", icon: <FiAward />, path: "/achievements" },
    { name: "Security", icon: <FiShield />, path: "/security" },
    { name: "Settings", icon: <FiSettings />, path: "/settings" },
  ];

  // All Departments
  const departments = [
    { 
      name: "HR Department", 
      icon: <FiUsers />, 
      color: "#4f46e5", 
      path: "/hr",
      stats: { employees: "248", growth: "+12%", vacancies: "8" },
      description: "Manage employees, recruitment, payroll, and HR operations."
    },
    { 
      name: "Finance Department", 
      icon: <FiDollarSign />, 
      color: "#10b981", 
      path: "/finance",
      stats: { revenue: "₹42.8M", growth: "+8.5%", expenses: "₹18.2M" },
      description: "Financial planning, accounting, budgeting, and reporting."
    },
    { 
      name: "Production Department", 
      icon: <FiPackage />, 
      color: "#f59e0b", 
      path: "/production",
      stats: { output: "48.2K", growth: "+15%", efficiency: "92%" },
      description: "Manufacturing operations, production planning, and quality control."
    },
    { 
      name: "Sales Department", 
      icon: <FiTrendingUp />, 
      color: "#ef4444", 
      path: "/sales",
      stats: { orders: "342", growth: "+5%", revenue: "₹28.5M" },
      description: "Sales strategies, customer relations, and revenue generation."
    },
    { 
      name: "IT Department", 
      icon: <FiCpu />, 
      color: "#8b5cf6", 
      path: "/it",
      stats: { uptime: "99.8%", tickets: "42", projects: "8" },
      description: "IT infrastructure, software development, and technical support."
    },
    { 
      name: "Logistics Department", 
      icon: <FiTruck />, 
      color: "#06b6d4", 
      path: "/logistics",
      stats: { shipments: "128", delivered: "122", pending: "6" },
      description: "Supply chain management, transportation, and distribution."
    },
  ];

  // Quick Stats
  const quickStats = [
    { 
      label: "Total Employees", 
      value: "1,248", 
      change: "+12%", 
      icon: <FiUsers />, 
      color: "#4f46e5"
    },
    { 
      label: "Active Orders", 
      value: "342", 
      change: "+5%", 
      icon: <FiTrendingUp />, 
      color: "#ef4444"
    },
    { 
      label: "Monthly Revenue", 
      value: "₹42.8M", 
      change: "+8.5%", 
      icon: <FiDollarSign />, 
      color: "#10b981"
    },
    { 
      label: "Production Output", 
      value: "48.2K", 
      change: "+15%", 
      icon: <FiPackage />, 
      color: "#f59e0b"
    },
  ];

  // Event Handlers
  const handleDepartmentClick = (department) => {
    navigate(department.path);
  };

  const handleSidebarItemClick = (item) => {
    setActiveSidebarItem(item.name);
    navigate(item.path);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        style={{
          width: sidebarOpen ? "280px" : "80px",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo Section */}
        <div
          className="sidebar-header"
          onClick={() => !sidebarOpen && setSidebarOpen(true)}
          style={{ cursor: !sidebarOpen ? 'pointer' : 'default' }}
        >
          <div className="sidebar-logo">
            {/* Logo - Always visible */}
            <div className="sidebar-logo-icon">
              PWI
            </div>
            
            {/* Company Name - Only visible when sidebar is open */}
            {sidebarOpen && (
              <div className="sidebar-logo-text">
                <div className="sidebar-logo-title">ERP System</div>
                <div className="sidebar-logo-subtitle">Dashboard</div>
              </div>
            )}
          </div>

          {/* Toggle Button - Only visible when sidebar is open */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="sidebar-toggle-btn"
              title="Collapse Menu"
            >
              <FiChevronLeft />
            </button>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="sidebar-content">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`sidebar-item ${activeSidebarItem === item.name ? "active" : ""}`}
              onClick={() => handleSidebarItemClick(item)}
              title={!sidebarOpen ? item.name : ""}
            >
              <div className="sidebar-item-icon">{item.icon}</div>
              <span className="sidebar-item-label">{item.name}</span>
              {!sidebarOpen && (
                <div className="sidebar-tooltip">{item.name}</div>
              )}
            </button>
          ))}
        </div>

        {/* Sidebar Footer - Empty now (Logout removed) */}
        <div className="sidebar-footer"></div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={mainContentRef}
        className="main-content"
        style={{
          marginLeft: sidebarOpen ? "280px" : "80px",
          width: sidebarOpen ? "calc(100% - 280px)" : "calc(100% - 80px)",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            {/* Header Logo - Pakistan Wire Industries */}
            <div className="header-logo">
              <div className="header-logo-icon">
                PWI
              </div>
              <div className="header-logo-text">
                <h1 className="header-title">Pakistan Wire Industries</h1>
                <p className="header-subtitle">Enterprise Resource Planning System</p>
              </div>
            </div>

            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search departments, reports, or users..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="header-right">
            <button className="action-button" title="Notifications">
              <FiBell />
              <span className="notification-badge"></span>
            </button>
            <button className="action-button" title="Settings">
              <FiSettings />
            </button>
            <div className="user-info">
              <div className="user-avatar">{userInfo.initials}</div>
              <div className="user-details">
                <div className="user-name">{userInfo.name}</div>
                <div className="user-role">{userInfo.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-container">
          {/* Quick Stats Section */}
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">
                <FiActivity className="title-icon" />
                Quick Overview
              </h2>
              <span className="section-subtitle">Real-time system metrics</span>
            </div>
            <div className="stats-grid">
              {quickStats.map((stat, index) => (
                <div 
                  key={index} 
                  className="stat-card"
                  style={{ 
                    borderTop: `4px solid ${stat.color}` 
                  }}
                >
                  <div className="stat-content">
                    <div 
                      className="stat-icon"
                      style={{ 
                        background: `${stat.color}15`,
                        color: stat.color
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div className="stat-info">
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                      <div className="stat-change" style={{ color: stat.color }}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments Section */}
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">
                <FiUsers className="title-icon" />
                Departments
              </h2>
              <button className="view-all-btn">
                View All <FiChevronRight />
              </button>
            </div>
            <div className="departments-container">
              {departments.map((dep, index) => (
                <div 
                  key={index} 
                  className="dept-card"
                  onClick={() => handleDepartmentClick(dep)}
                  style={{ 
                    borderLeft: `4px solid ${dep.color}` 
                  }}
                >
                  <div className="dept-header">
                    <div 
                      className="dept-icon"
                      style={{ 
                        background: dep.color,
                        color: "white"
                      }}
                    >
                      {dep.icon}
                    </div>
                    <h3 className="dept-name">{dep.name}</h3>
                  </div>
                  <p className="dept-desc">{dep.description}</p>
                  <div className="dept-stats">
                    {Object.entries(dep.stats).map(([key, value], idx) => (
                      <div key={idx} className="dept-stat">
                        <span className="stat-key">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <span className="stat-val">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="dept-btn">
                    Access Department <FiChevronRight />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;