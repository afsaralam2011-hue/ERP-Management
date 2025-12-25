import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUsers, FiDollarSign, FiPackage, FiTrendingUp, 
  FiActivity, FiBriefcase, FiSearch,
  FiChevronRight, FiDatabase, FiClock
} from "react-icons/fi";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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
      description: "Manage employees, recruitment, payroll, and HR operations."
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
      description: "Financial planning, accounting, budgeting, and reporting."
    },
    { 
      id: 3,
      name: "Production", 
      fullName: "Production Department",
      color: "#d97706", 
      path: "/production",
      stats: { 
        output: "48.2K", 
        growth: "+15%", 
        efficiency: "92%"
      },
      description: "Manufacturing operations, production planning, and quality control."
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
      description: "Sales strategies, customer relations, and revenue generation."
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
      description: "IT infrastructure, software development, and technical support."
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
      description: "Supply chain management, transportation, and distribution."
    },
  ];

  const quickStats = [
    { 
      id: 1,
      label: "Total Employees", 
      value: "1,248", 
      change: "+12%", 
      icon: <FiUsers />, 
      color: "#4f46e5"
    },
    { 
      id: 2,
      label: "Active Orders", 
      value: "342", 
      change: "+5%", 
      icon: <FiTrendingUp />, 
      color: "#dc2626"
    },
    { 
      id: 3,
      label: "Monthly Revenue", 
      value: "₹42.8M", 
      change: "+8.5%", 
      icon: <FiDollarSign />, 
      color: "#059669"
    },
    { 
      id: 4,
      label: "Production Output", 
      value: "48.2K", 
      change: "+15%", 
      icon: <FiPackage />, 
      color: "#d97706"
    },
    { 
      id: 5,
      label: "System Uptime", 
      value: "99.8%", 
      change: "+0.2%", 
      icon: <FiDatabase />, 
      color: "#7c3aed"
    },
    { 
      id: 6,
      label: "On-time Delivery", 
      value: "95%", 
      change: "+3%", 
      icon: <FiClock />, 
      color: "#0891b2"
    },
  ];

  const handleDepartmentClick = (department) => {
    navigate(department.path);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Main Content - NO SIDEBAR */}
      <div className="main-content">
        {/* Top Header */}
        <header className="main-header">
          <div className="header-left">
            <div className="header-logo">
              <div className="header-logo-icon">
                <div className="pwi-logo">PWI</div>
              </div>
              <div className="header-logo-text">
                <h1>Pakistan Wire Industries</h1>
                <p>Enterprise Resource Planning System</p>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="search-box">
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
            <div className="user-info">
              <div className="user-avatar">AU</div>
              <div className="user-details">
                <div className="user-name">Admin User</div>
                <div className="user-role">System Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Department Buttons Row - Header ke neeche */}
        <div className="department-buttons-row">
          {departments.map((dept) => (
            <button
              key={dept.id}
              className="department-button"
              style={{ backgroundColor: dept.color }}
              onClick={() => handleDepartmentClick(dept)}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        <main className="dashboard-main">
          {/* Quick Stats Grid */}
          <section className="stats-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h3 className="section-title">
                  <FiActivity className="title-icon" />
                  Quick Overview
                </h3>
                <span className="section-subtitle">Real-time system metrics</span>
              </div>
            </div>
            
            <div className="stats-grid">
              {quickStats.map((stat) => (
                <div 
                  key={stat.id} 
                  className="stat-card"
                >
                  <div className="stat-content">
                    <div className="stat-icon" style={{ backgroundColor: stat.color }}>
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
          </section>

          {/* Departments Grid */}
          <section className="departments-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h3 className="section-title">
                  <FiBriefcase className="title-icon" />
                  Departments
                </h3>
                <span className="section-subtitle">Manage and monitor all departments</span>
              </div>
            </div>
            
            <div className="departments-grid">
              {departments.map((dept) => (
                <div 
                  key={dept.id} 
                  className="department-card"
                  onClick={() => handleDepartmentClick(dept)}
                >
                  <div className="dept-header">
                    <div className="dept-icon" style={{ backgroundColor: dept.color }}>
                      {dept.name.charAt(0)}
                    </div>
                    <h4 className="dept-name">{dept.fullName}</h4>
                  </div>
                  <p className="dept-desc">{dept.description}</p>
                  <div className="dept-stats">
                    {Object.entries(dept.stats).map(([key, value], idx) => (
                      <div key={idx} className="dept-stat">
                        <span className="stat-key">{key}</span>
                        <span className="stat-val">{value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="dept-btn" style={{ backgroundColor: dept.color }}>
                    Access <FiChevronRight />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;