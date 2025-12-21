// src/pages/departments/HRPage.jsx
import React, { useState } from "react";
import { 
  FiUsers, FiUserPlus, FiFileText, FiDollarSign, 
  FiCalendar, FiTrendingUp, FiSettings, FiSearch,
  FiEdit, FiTrash2, FiEye, FiDownload
} from "react-icons/fi";

const HRPage = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const employees = [
    { 
      id: 1, 
      name: "Ahmed Khan", 
      email: "ahmed.khan@pwi.com", 
      department: "Production", 
      position: "Production Manager", 
      status: "Active", 
      joinDate: "2022-01-15",
      salary: "₹85,000"
    },
    { 
      id: 2, 
      name: "Sara Ali", 
      email: "sara.ali@pwi.com", 
      department: "Finance", 
      position: "Senior Accountant", 
      status: "Active", 
      joinDate: "2021-03-22",
      salary: "₹65,000"
    },
    { 
      id: 3, 
      name: "Usman Malik", 
      email: "usman.malik@pwi.com", 
      department: "Sales", 
      position: "Sales Executive", 
      status: "Active", 
      joinDate: "2023-05-10",
      salary: "₹55,000"
    },
    { 
      id: 4, 
      name: "Fatima Noor", 
      email: "fatima.noor@pwi.com", 
      department: "HR", 
      position: "HR Officer", 
      status: "Active", 
      joinDate: "2020-08-30",
      salary: "₹60,000"
    },
    { 
      id: 5, 
      name: "Bilal Ahmed", 
      email: "bilal.ahmed@pwi.com", 
      department: "IT", 
      position: "IT Engineer", 
      status: "Leave", 
      joinDate: "2019-11-05",
      salary: "₹70,000"
    },
    { 
      id: 6, 
      name: "Zainab Kareem", 
      email: "zainab.kareem@pwi.com", 
      department: "Logistics", 
      position: "Logistics Coordinator", 
      status: "Active", 
      joinDate: "2022-12-18",
      salary: "₹50,000"
    },
  ];

  const stats = [
    { label: "Total Employees", value: "248", change: "+12%", icon: <FiUsers />, color: "#4f46e5" },
    { label: "New Hires (Monthly)", value: "18", change: "+5%", icon: <FiUserPlus />, color: "#10b981" },
    { label: "On Leave", value: "8", change: "-2%", icon: <FiCalendar />, color: "#f59e0b" },
    { label: "Avg Salary", value: "₹45,000", change: "+8%", icon: <FiDollarSign />, color: "#ef4444" },
  ];

  const tabs = [
    { id: "employees", label: "Employees", icon: <FiUsers /> },
    { id: "recruitment", label: "Recruitment", icon: <FiUserPlus /> },
    { id: "payroll", label: "Payroll", icon: <FiDollarSign /> },
    { id: "attendance", label: "Attendance", icon: <FiCalendar /> },
    { id: "reports", label: "Reports", icon: <FiFileText /> },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ];

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditEmployee = (employee) => {
    // Edit functionality
    console.log("Edit employee:", employee);
  };

  const handleDeleteEmployee = (employeeId) => {
    // Delete functionality
    console.log("Delete employee:", employeeId);
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        marginBottom: "24px"
      }}>
        {stats.map((stat, index) => (
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

      {/* Search and Add Section */}
      <div style={{
        background: "white",
        padding: "20px 24px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "300px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <FiSearch style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "#94a3b8" 
            }} />
            <input
              type="text"
              placeholder="Search employees by name, department, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px 16px 10px 40px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                width: "100%",
                background: "#f8fafc",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "10px 20px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#2563eb";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#3b82f6";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <FiUserPlus /> Add Employee
          </button>
          
          <button
            style={{
              padding: "10px 20px",
              background: "#f8fafc",
              color: "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
            onMouseLeave={(e) => e.target.style.background = "#f8fafc"}
          >
            <FiDownload /> Export Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px"
      }}>
        <div style={{ 
          display: "flex", 
          borderBottom: "1px solid #e2e8f0",
          padding: "0 20px",
          overflowX: "auto"
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "16px 20px",
                background: activeTab === tab.id ? "#f1f5f9" : "transparent",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid #3b82f6" : "none",
                color: activeTab === tab.id ? "#3b82f6" : "#64748b",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ padding: "24px" }}>
          {activeTab === "employees" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Employee List</h3>
                <span style={{ fontSize: "14px", color: "#64748b" }}>{filteredEmployees.length} Employees Found</span>
              </div>
              
              <div style={{
                overflow: "auto",
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>ID</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Name</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Email</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Department</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Position</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Status</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Salary</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(emp => (
                      <tr key={emp.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>{emp.id}</td>
                        <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{emp.name}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>{emp.email}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>{emp.department}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>{emp.position}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            background: emp.status === "Active" ? "#d1fae5" : "#fef3c7",
                            color: emp.status === "Active" ? "#059669" : "#d97706"
                          }}>
                            {emp.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: "#059669" }}>
                          {emp.salary}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button 
                              onClick={() => handleViewEmployee(emp)}
                              style={{
                                padding: "6px 12px",
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <FiEye size={14} /> View
                            </button>
                            <button 
                              onClick={() => handleEditEmployee(emp)}
                              style={{
                                padding: "6px 12px",
                                background: "#f59e0b",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <FiEdit size={14} /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "recruitment" && (
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#1e293b" }}>Recruitment Dashboard</h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                Manage job postings, applications, and hiring process.
              </p>
              <div style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                border: "1px dashed #e2e8f0"
              }}>
                <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", margin: 0 }}>
                  Recruitment module coming soon...
                </p>
              </div>
            </div>
          )}

          {activeTab === "payroll" && (
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#1e293b" }}>Payroll Management</h3>
              <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                Process salaries, generate payslips, and manage deductions.
              </p>
              <div style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                border: "1px dashed #e2e8f0"
              }}>
                <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", margin: 0 }}>
                  Payroll module coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: "#1e293b" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
          {[
            'Generate HR Report', 
            'Process Payroll', 
            'Schedule Interviews', 
            'Update Policies', 
            'Performance Review', 
            'Training Schedule'
          ].map((action, i) => (
            <button
              key={action}
              style={{
                padding: "12px",
                background: i === 0 ? "#3b82f610" : "#f8fafc",
                border: i === 0 ? "1px solid #3b82f630" : "1px solid #e2e8f0",
                borderRadius: "8px",
                color: i === 0 ? "#3b82f6" : "#475569",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.2s",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = i === 0 ? "#3b82f610" : "#f8fafc"}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRPage;