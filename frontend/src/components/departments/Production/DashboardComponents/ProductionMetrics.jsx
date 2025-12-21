// src/components/departments/Production/DashboardComponents/ProductionMetrics.jsx
import React from 'react';
import { FaIndustry, FaBox, FaCheckCircle, FaClock, FaChartLine, FaWarehouse, FaUsers, FaCogs } from 'react-icons/fa';
import './ProductionMetrics.css';

const ProductionMetrics = () => {
  // Production metrics cards data
  const metrics = [
    {
      id: 1,
      title: 'Total Production',
      value: '12,850',
      unit: 'tons',
      change: '+12.5%',
      isPositive: true,
      icon: <FaIndustry className="metrics-icon" />,
      color: '#3b82f6',
    },
    {
      id: 2,
      title: 'Orders Completed',
      value: '156',
      unit: 'orders',
      change: '+8.2%',
      isPositive: true,
      icon: <FaBox className="metrics-icon" />,
      color: '#10b981',
    },
    {
      id: 3,
      title: 'Quality Rate',
      value: '94.5%',
      unit: '',
      change: '+2.3%',
      isPositive: true,
      icon: <FaCheckCircle className="metrics-icon" />,
      color: '#f59e0b',
    },
    {
      id: 4,
      title: 'Avg. Production Time',
      value: '3.2',
      unit: 'days',
      change: '-0.5%',
      isPositive: false,
      icon: <FaClock className="metrics-icon" />,
      color: '#ef4444',
    },
  ];

  // Monthly production data
  const monthlyProduction = [
    { month: 'January', production: 4000, target: 4500 },
    { month: 'February', production: 3500, target: 4200 },
    { month: 'March', production: 5000, target: 4800 },
    { month: 'April', production: 4500, target: 4600 },
    { month: 'May', production: 4800, target: 4700 },
    { month: 'June', production: 5200, target: 5000 },
    { month: 'July', production: 5500, target: 5200 },
    { month: 'August', production: 5800, target: 5400 },
  ];

  // Machine status data
  const machineStatus = [
    { name: 'Flattening Machine 1', status: 'Running', efficiency: '92%', color: '#10b981' },
    { name: 'Flattening Machine 2', status: 'Running', efficiency: '88%', color: '#10b981' },
    { name: 'Flattening Machine 3', status: 'Down', efficiency: '0%', color: '#ef4444' },
    { name: 'Flattening Machine 4', status: 'Running', efficiency: '95%', color: '#10b981' },
    { name: 'Flattening Machine 5', status: 'Maintenance', efficiency: '0%', color: '#f59e0b' },
    { name: 'Flattening Machine 6', status: 'Running', efficiency: '90%', color: '#10b981' },
  ];

  // Quality data
  const qualityData = [
    { category: 'Excellent', percentage: 45, color: '#10b981' },
    { category: 'Good', percentage: 30, color: '#3b82f6' },
    { category: 'Average', percentage: 15, color: '#f59e0b' },
    { category: 'Poor', percentage: 10, color: '#ef4444' },
  ];

  return (
    <div className="production-metrics-container">
      <div className="metrics-header">
        <h2 className="metrics-title">Production Metrics Dashboard</h2>
        <p className="metrics-subtitle">Pakistan Wire Industries - Real-time Production Data</p>
      </div>
      
      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        {metrics.map((metric) => (
          <div key={metric.id} className="metrics-card" style={{ borderLeftColor: metric.color }}>
            <div className="metric-header">
              <h3 className="metric-title">{metric.title}</h3>
              <div className="metric-icon" style={{ color: metric.color }}>
                {metric.icon}
              </div>
            </div>
            <div className="metric-value">
              {metric.value} <span className="metric-unit">{metric.unit}</span>
            </div>
            <div className={`metric-change ${metric.isPositive ? 'positive' : 'negative'}`}>
              {metric.change} from last month
            </div>
          </div>
        ))}
      </div>

      {/* Production Data Section */}
      <div className="data-section">
        <div className="production-table-card">
          <h3 className="section-title">
            <FaChartLine className="section-icon" />
            Monthly Production vs Target
          </h3>
          <div className="table-container">
            <table className="production-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Actual Production</th>
                  <th>Production Target</th>
                  <th>Variance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlyProduction.map((item, index) => {
                  const variance = item.production - item.target;
                  const isMet = variance >= 0;
                  const variancePercent = ((variance / item.target) * 100).toFixed(1);
                  
                  return (
                    <tr key={index}>
                      <td className="month-cell">{item.month}</td>
                      <td className="production-cell">{item.production.toLocaleString()} tons</td>
                      <td className="target-cell">{item.target.toLocaleString()} tons</td>
                      <td className={`variance-cell ${isMet ? 'positive' : 'negative'}`}>
                        {isMet ? '+' : ''}{variance.toLocaleString()} tons ({isMet ? '+' : ''}{variancePercent}%)
                      </td>
                      <td className="status-cell">
                        <span className={`status-badge ${isMet ? 'status-met' : 'status-not-met'}`}>
                          {isMet ? 'Target Met ✓' : 'Target Not Met ✗'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine Status */}
        <div className="machine-status-card">
          <h3 className="section-title">
            <FaCogs className="section-icon" />
            Machine Status
          </h3>
          <div className="machine-grid">
            {machineStatus.map((machine, index) => (
              <div key={index} className="machine-card">
                <div className="machine-header">
                  <h4 className="machine-name">{machine.name}</h4>
                  <span className="machine-status-indicator" style={{ backgroundColor: machine.color }}></span>
                </div>
                <div className="machine-details">
                  <div className="machine-detail">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value" style={{ color: machine.color }}>{machine.status}</span>
                  </div>
                  <div className="machine-detail">
                    <span className="detail-label">Efficiency:</span>
                    <span className="detail-value">{machine.efficiency}</span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: machine.efficiency,
                      backgroundColor: machine.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Distribution */}
        <div className="quality-card">
          <h3 className="section-title">
            <FaCheckCircle className="section-icon" />
            Quality Distribution
          </h3>
          <div className="quality-content">
            <div className="quality-bars">
              {qualityData.map((item, index) => (
                <div key={index} className="quality-bar-item">
                  <div className="quality-bar-info">
                    <div className="quality-color" style={{ backgroundColor: item.color }}></div>
                    <span className="quality-category">{item.category}</span>
                    <span className="quality-percentage">{item.percentage}%</span>
                  </div>
                  <div className="quality-bar-wrapper">
                    <div 
                      className="quality-bar-fill" 
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="quality-summary">
              <div className="summary-stat">
                <span className="stat-label">Total Inspected:</span>
                <span className="stat-value">1,250 Units</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Acceptance Rate:</span>
                <span className="stat-value positive">94.5%</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Rejection Rate:</span>
                <span className="stat-value negative">5.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="summary-stat-card">
          <FaWarehouse className="summary-icon" style={{ color: '#3b82f6' }} />
          <div className="summary-content">
            <h4 className="summary-title">Raw Material Stock</h4>
            <p className="summary-value">850 tons</p>
            <p className="summary-change positive">+50 tons increase</p>
          </div>
        </div>
        <div className="summary-stat-card">
          <FaUsers className="summary-icon" style={{ color: '#10b981' }} />
          <div className="summary-content">
            <h4 className="summary-title">Active Staff</h4>
            <p className="summary-value">45/50</p>
            <p className="summary-change negative">5 absent</p>
          </div>
        </div>
        <div className="summary-stat-card">
          <FaCogs className="summary-icon" style={{ color: '#f59e0b' }} />
          <div className="summary-content">
            <h4 className="summary-title">Maintenance Required</h4>
            <p className="summary-value">2 Machines</p>
            <p className="summary-change warning">Scheduled in 3 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionMetrics;