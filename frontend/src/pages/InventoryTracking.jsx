// src/pages/InventoryTracking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, FiFilter, FiDownload, FiCalendar, 
  FiRefreshCw, FiBarChart2, FiAlertTriangle,
  FiArrowLeft, FiHome, FiPrinter, FiUsers
} from 'react-icons/fi';
import InventoryDashboard from '../../components/InventoryDashboard';
import MaterialBalanceReport from '../../components/MaterialBalanceReport';
import InventoryAlerts from '../../components/InventoryAlerts';
import MaterialFlowChart from '../../components/charts/MaterialFlowChart';
import './InventoryTracking.css';

const InventoryTracking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filterMaterial, setFilterMaterial] = useState('all');

  const handleBack = () => {
    navigate('/production-sections');
  };

  const handleExport = () => {
    // Export functionality
    const exportData = {
      dateRange,
      filterMaterial,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-data-${dateRange.start}-${dateRange.end}.json`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiBarChart2 /> },
    { id: 'balance', label: 'Balance Report', icon: <FiPackage /> },
    { id: 'alerts', label: 'Alerts', icon: <FiAlertTriangle /> },
    { id: 'flow', label: 'Material Flow', icon: <FiUsers /> }
  ];

  return (
    <div className="inventory-tracking-page">
      {/* Header */}
      <div className="inventory-header">
        <div className="header-left">
          <button className="btn-back" onClick={handleBack}>
            <FiArrowLeft /> Back to Sections
          </button>
          <div className="page-title">
            <h1><FiPackage /> Material Inventory Tracking</h1>
            <p className="page-subtitle">Track material flow between Flattening & Spiral sections</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-controls">
            <div className="date-controls">
              <FiCalendar />
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="date-input"
              />
              <span>to</span>
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="date-input"
              />
            </div>
            
            <select 
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Materials</option>
              <option value="MS">Mild Steel</option>
              <option value="SS">Stainless Steel</option>
              <option value="GI">Galvanized Iron</option>
            </select>
            
            <button className="btn btn-secondary" onClick={handleExport}>
              <FiDownload /> Export
            </button>
            
            <button className="btn btn-secondary" onClick={handlePrint}>
              <FiPrinter /> Print
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            <InventoryDashboard />
          </div>
        )}
        
        {activeTab === 'balance' && (
          <div className="balance-tab">
            <MaterialBalanceReport 
              dateRange={dateRange}
              materialType={filterMaterial !== 'all' ? filterMaterial : null}
            />
          </div>
        )}
        
        {activeTab === 'alerts' && (
          <div className="alerts-tab">
            <InventoryAlerts />
          </div>
        )}
        
        {activeTab === 'flow' && (
          <div className="flow-tab">
            <div className="flow-header">
              <h2>Material Flow Analysis</h2>
              <p>Visual representation of material movement between sections</p>
            </div>
            <MaterialFlowChart 
              dateRange={dateRange}
              materialType={filterMaterial}
            />
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="page-footer">
        <div className="footer-stats">
          <div className="stat-item">
            <span className="stat-label">Last Updated:</span>
            <span className="stat-value">{new Date().toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Data Range:</span>
            <span className="stat-value">{dateRange.start} to {dateRange.end}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Filters:</span>
            <span className="stat-value">
              {filterMaterial === 'all' ? 'All Materials' : filterMaterial}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTracking;