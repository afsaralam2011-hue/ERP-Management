// src/pages/departments/FinancePage.jsx
import React, { useState } from "react";
import { 
  FiDollarSign, FiTrendingUp, FiTrendingDown, 
  FiPieChart, FiFileText, FiCreditCard,
  FiCalendar, FiBarChart2, FiDownload
} from "react-icons/fi";

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("monthly");

  const financialStats = [
    { label: "Total Revenue", value: "₹42.8M", change: "+8.5%", icon: <FiTrendingUp />, color: "#10b981", trend: "up" },
    { label: "Total Expenses", value: "₹18.2M", change: "+3.2%", icon: <FiTrendingDown />, color: "#ef4444", trend: "down" },
    { label: "Net Profit", value: "₹24.6M", change: "+12.3%", icon: <FiDollarSign />, color: "#3b82f6", trend: "up" },
    { label: "Cash Flow", value: "₹8.4M", change: "+5.7%", icon: <FiPieChart />, color: "#8b5cf6", trend: "up" },
  ];

  const recentTransactions = [
    { id: 1, date: "2024-01-15", description: "Raw Material Purchase", amount: "₹2,450,000", type: "expense", category: "Production" },
    { id: 2, date: "2024-01-14", description: "Client Payment - ABC Corp", amount: "₹3,800,000", type: "income", category: "Sales" },
    { id: 3, date: "2024-01-13", description: "Employee Salaries", amount: "₹1,250,000", type: "expense", category: "HR" },
    { id: 4, date: "2024-01-12", description: "Equipment Maintenance", amount: "₹450,000", type: "expense", category: "Production" },
    { id: 5, date: "2024-01-11", description: "Export Order Payment", amount: "₹5,200,000", type: "income", category: "Sales" },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <FiBarChart2 /> },
    { id: "transactions", label: "Transactions", icon: <FiFileText /> },
    { id: "budget", label: "Budget", icon: <FiCreditCard /> },
    { id: "reports", label: "Reports", icon: <FiDownload /> },
    { id: "forecast", label: "Forecast", icon: <FiCalendar /> },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "24px"
      }}>
        {financialStats.map((stat, index) => (
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
                color: stat.trend === "up" ? "#10b981" : "#ef4444",
                background: stat.trend === "up" ? "#d1fae5" : "#fee2e2",
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

      {/* Time Range Filter */}
      <div style={{
        background: "white",
        padding: "16px 24px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Financial Dashboard</h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748b" }}>Monitor financial performance and transactions</p>
        </div>
        
        <div style={{ display: "flex", gap: "8px" }}>
          {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: "8px 16px",
                background: timeRange === range ? "#3b82f6" : "#f8fafc",
                border: timeRange === range ? "none" : "1px solid #e2e8f0",
                color: timeRange === range ? "white" : "#475569",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "capitalize"
              }}
            >
              {range}
            </button>
          ))}
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
          {activeTab === "overview" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Recent Transactions</h3>
                <button style={{
                  padding: "8px 16px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <FiDownload /> Export Report
                </button>
              </div>
              
              <div style={{
                overflow: "auto",
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Date</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Description</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Category</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Type</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(transaction => (
                      <tr key={transaction.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>{transaction.date}</td>
                        <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#1e293b" }}>{transaction.description}</td>
                        <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>{transaction.category}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            background: transaction.type === "income" ? "#d1fae5" : "#fee2e2",
                            color: transaction.type === "income" ? "#059669" : "#dc2626"
                          }}>
                            {transaction.type === "income" ? "Income" : "Expense"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "600", color: transaction.type === "income" ? "#059669" : "#dc2626" }}>
                          {transaction.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: "#1e293b" }}>All Transactions</h3>
              <p style={{ color: "#64748b", fontSize: "14px" }}>
                View and manage all financial transactions.
              </p>
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
          {['Generate Financial Report', 'Process Invoices', 'Approve Expenses', 'Manage Budget', 'Tax Calculation', 'Audit Logs'].map((action, i) => (
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

export default FinancePage;