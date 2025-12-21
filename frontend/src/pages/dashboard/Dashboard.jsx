// src/pages/dashboard/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUsers, FiDollarSign, FiPackage, FiTrendingUp, 
  FiCpu, FiTruck, FiActivity, FiCalendar, 
  FiLogOut, FiHome, FiBarChart2, FiSettings,
  FiChevronRight, FiAward, FiShield, FiGlobe,
  FiBell, FiSearch, FiUser
} from "react-icons/fi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState(null);

  // User information (replace with actual user data)
  const userInfo = {
    name: "Admin User",
    role: "System Administrator",
    initials: "AU"
  };

  const departments = [
    { 
      name: "HR Department", 
      icon: <FiUsers />, 
      color: "#4f46e5", 
      path: "/hr",
      stats: { employees: "248", growth: "+12%" },
      description: "Manage employees, recruitment, payroll, and HR operations."
    },
    { 
      name: "Finance Department", 
      icon: <FiDollarSign />, 
      color: "#10b981", 
      path: "/finance",
      stats: { revenue: "₹42.8M", growth: "+8.5%" },
      description: "Financial planning, accounting, budgeting, and reporting."
    },
    { 
      name: "Production Department", 
      icon: <FiPackage />, 
      color: "#f59e0b", 
      path: "/production",
      stats: { output: "48.2K", growth: "+15%" },
      description: "Manufacturing operations, production planning, and quality control."
    },
    { 
      name: "Sales Department", 
      icon: <FiTrendingUp />, 
      color: "#ef4444", 
      path: "/sales",
      stats: { orders: "342", growth: "+5%" },
      description: "Sales strategies, customer relations, and revenue generation."
    },
    { 
      name: "IT Department", 
      icon: <FiCpu />, 
      color: "#8b5cf6", 
      path: "/it",
      stats: { uptime: "99.8%", tickets: "42" },
      description: "IT infrastructure, software development, and technical support."
    },
    { 
      name: "Logistics Department", 
      icon: <FiTruck />, 
      color: "#06b6d4", 
      path: "/logistics",
      stats: { shipments: "128", delivered: "122" },
      description: "Supply chain management, transportation, and distribution."
    },
  ];

  const quickStats = [
    { label: "Total Employees", value: "1,248", change: "+12%", icon: <FiUsers />, color: "#4f46e5" },
    { label: "Monthly Revenue", value: "₹42.8M", change: "+8.5%", icon: <FiDollarSign />, color: "#10b981" },
    { label: "Production Output", value: "48.2K", change: "+15%", icon: <FiPackage />, color: "#f59e0b" },
    { label: "Active Orders", value: "342", change: "+5%", icon: <FiTrendingUp />, color: "#ef4444" },
  ];

  const recentActivities = [
    { time: "10:30 AM", activity: "Production report for Q1 generated", dept: "Production" },
    { time: "09:45 AM", activity: "New sales order received from ABC Corp", dept: "Sales" },
    { time: "Yesterday", activity: "Monthly financial audit completed", dept: "Finance" },
    { time: "2 days ago", activity: "IT infrastructure upgrade scheduled", dept: "IT" },
    { time: "3 days ago", activity: "New HR policies implemented", dept: "HR" },
  ];

  const handleDepartmentClick = (department) => {
    navigate(department.path);
  };

  // Logout Function
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div>
      {/* Header with Logo, User Info and Logout */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        padding: "20px 32px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px",
        borderBottom: "3px solid #3b82f6"
      }}>
        {/* Left: Logo and Company Name */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "20px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold"
            }}>
              ERP
            </div>
            <div>
              <h2 style={{ 
                margin: "0", 
                fontSize: "20px", 
                fontWeight: "700", 
                color: "#1e293b",
                lineHeight: "1.2"
              }}>
                Pakistan Wire Industries
              </h2>
              <p style={{ 
                margin: "4px 0 0 0", 
                fontSize: "13px", 
                color: "#64748b",
                fontWeight: "500"
              }}>
                Enterprise Resource Planning System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div style={{
          flex: 1,
          maxWidth: "400px",
          margin: "0 20px"
        }}>
          <div style={{
            position: "relative"
          }}>
            <input
              type="text"
              placeholder="Search across system..."
              style={{
                width: "100%",
                padding: "10px 16px 10px 42px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "14px",
                background: "#f8fafc",
                outline: "none",
                transition: "all 0.3s"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <FiSearch style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: "16px"
            }} />
          </div>
        </div>

        {/* Right: User Info, Notifications and Logout */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          {/* Notifications */}
          <button style={{
            background: "none",
            border: "none",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            fontSize: "18px",
            cursor: "pointer",
            transition: "all 0.3s",
            position: "relative"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#64748b";
          }}>
            <FiBell />
            <span style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              background: "#ef4444",
              borderRadius: "50%",
              border: "2px solid white"
            }}></span>
          </button>

          {/* Settings */}
          <button style={{
            background: "none",
            border: "none",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            fontSize: "18px",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#3b82f6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#64748b";
          }}>
            <FiSettings />
          </button>

          {/* User Info */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 12px",
            background: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            minWidth: "180px"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600",
              fontSize: "14px"
            }}>
              {userInfo.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#1e293b",
                lineHeight: "1.2"
              }}>
                {userInfo.name}
              </div>
              <div style={{
                fontSize: "12px",
                color: "#64748b",
                lineHeight: "1.2"
              }}>
                {userInfo.role}
              </div>
            </div>
            
            {/* Logout Button in User Info Section */}
            <button
              onClick={handleLogout}
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                fontSize: "16px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
              title="Logout"
            >
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>

      {/* Rest of the dashboard content remains the same */}
      {/* Quick Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "24px"
      }}>
        {quickStats.map((stat, index) => (
          <div key={index} style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
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

      {/* Departments Grid */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px"
      }}>
        <h3 style={{ 
          margin: "0 0 24px 0", 
          fontSize: "18px",
          fontWeight: "600",
          color: "#1e293b"
        }}>
          Departments
        </h3>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          {departments.map((dep) => (
            <div
              key={dep.name}
              onClick={() => handleDepartmentClick(dep)}
              style={{
                padding: "20px",
                background: "white",
                border: `2px solid ${dep.color}20`,
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s",
                textAlign: "center"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = dep.color;
                e.currentTarget.style.boxShadow = `0 15px 30px -5px ${dep.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = `${dep.color}20`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: "60px",
                height: "60px",
                background: `${dep.color}10`,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                color: dep.color,
                fontSize: "28px"
              }}>
                {dep.icon}
              </div>
              <h4 style={{ 
                margin: "0 0 8px 0", 
                fontSize: "16px",
                fontWeight: "600",
                color: "#1e293b"
              }}>
                {dep.name.replace(' Department', '')}
              </h4>
              <p style={{ 
                margin: 0, 
                fontSize: "12px",
                color: "#64748b",
                lineHeight: "1.4",
                marginBottom: "12px"
              }}>
                {dep.description.substring(0, 60)}...
              </p>
              <div style={{ 
                fontSize: "12px", 
                color: dep.color,
                fontWeight: "500"
              }}>
                Click to Access →
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px"
      }}>
        {/* Recent Activities */}
        <div style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e293b"
            }}>
              Recent Activities
            </h3>
            <span style={{ fontSize: "13px", color: "#64748b", cursor: "pointer" }}>
              View All
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {recentActivities.map((activity, index) => (
              <div key={index} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#64748b",
                  fontSize: "16px"
                }}>
                  <FiActivity />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: "0 0 4px 0", 
                    fontSize: "14px",
                    color: "#1e293b"
                  }}>
                    {activity.activity}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ 
                      fontSize: "12px", 
                      color: "#64748b" 
                    }}>
                      {activity.time}
                    </span>
                    <span style={{
                      fontSize: "11px",
                      color: "#475569",
                      background: "#f1f5f9",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontWeight: "500"
                    }}>
                      {activity.dept}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ 
            margin: "0 0 20px 0", 
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e293b"
          }}>
            System Status
          </h3>
          <div style={{ color: "#475569", lineHeight: "1.8" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
              <span>System Uptime</span>
              <span style={{ fontWeight: "600", color: "#10b981" }}>99.8%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
              <span>Active Users</span>
              <span style={{ fontWeight: "600", color: "#3b82f6" }}>142</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
              <span>Storage Used</span>
              <span style={{ fontWeight: "600", color: "#f59e0b" }}>72%</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #f1f5f9" }}>
              <span>Pending Tasks</span>
              <span style={{ fontWeight: "600", color: "#ef4444" }}>18</span>
            </div>
          </div>
          
          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "600", color: "#1e293b" }}>
              Upcoming Events
            </h4>
            <div style={{ color: "#475569", fontSize: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <FiCalendar style={{ color: "#8b5cf6" }} />
                <span>Quarterly Review - Tomorrow</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <FiCalendar style={{ color: "#06b6d4" }} />
                <span>Team Meeting - Dec 15</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FiCalendar style={{ color: "#f59e0b" }} />
                <span>System Maintenance - Dec 18</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;