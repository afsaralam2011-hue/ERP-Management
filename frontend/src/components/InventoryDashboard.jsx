// components/InventoryDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiPackage, FiTrendingUp, FiTrendingDown, FiAlertTriangle,
  FiRefreshCw, FiDownload, FiFilter, FiCalendar,
  FiBarChart2, FiCpu, FiArrowRight, FiCheckCircle,
  FiClock, FiUsers, FiShoppingCart, FiDollarSign,
  FiPercent, FiActivity, FiHome
} from 'react-icons/fi';
import InventoryService from '../services/inventoryService';
import MaterialFlowChart from './charts/MaterialFlowChart';
import InventoryTrendChart from './charts/InventoryTrendChart';
import InventoryAlerts from './InventoryAlerts';
import MaterialBalanceReport from './MaterialBalanceReport';
import './InventoryDashboard.css';

const InventoryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [activeView, setActiveView] = useState('overview');
  const [stats, setStats] = useState({
    totalProduction: 0,
    totalConsumption: 0,
    totalBalance: 0,
    totalEfficiency: 0,
    criticalItems: 0,
    lowItems: 0,
    totalAlerts: 0,
    totalMaterials: 0
  });

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get balance report
      const report = await InventoryService.getMaterialBalanceReport(dateRange);
      
      // Get alerts
      const { data: alerts } = await InventoryService.getAlerts();
      
      // Get summary
      const { data: summary } = await InventoryService.getDailySummary(dateRange);
      
      // Calculate stats
      const totalProduction = report.reduce((sum, item) => sum + item.production_kg, 0);
      const totalConsumption = report.reduce((sum, item) => sum + item.consumption_kg, 0);
      const totalBalance = totalProduction - totalConsumption;
      const totalEfficiency = totalProduction > 0 ? (totalConsumption / totalProduction) * 100 : 0;
      
      const criticalItems = report.filter(item => item.status === 'CRITICAL' || item.status === 'OUT_OF_STOCK').length;
      const lowItems = report.filter(item => item.status === 'LOW').length;
      
      setStats({
        totalProduction,
        totalConsumption,
        totalBalance,
        totalEfficiency: parseFloat(totalEfficiency.toFixed(2)),
        criticalItems,
        lowItems,
        totalAlerts: alerts?.length || 0,
        totalMaterials: report.length
      });
      
      setDashboardData({
        balanceReport: report,
        alerts: alerts || [],
        dailySummary: summary || []
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      stats,
      dateRange,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-dashboard-${dateRange.start}-${dateRange.end}.json`;
    link.click();
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 100) return '#00ff88';
    if (efficiency >= 90) return '#4cc9f0';
    if (efficiency >= 80) return '#ffcc00';
    return '#ff4444';
  };

  if (loading && !dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Inventory Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="inventory-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1><FiPackage /> Material Inventory Dashboard</h1>
          <p className="subtitle">Real-time tracking of material flow between Flattening & Spiral sections</p>
        </div>
        
        <div className="header-right">
          <div className="date-filter">
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
          
          <button className="btn btn-secondary" onClick={loadDashboardData}>
            <FiRefreshCw /> Refresh
          </button>
          
          <button className="btn btn-primary" onClick={handleExport}>
            <FiDownload /> Export
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card production-card">
          <div className="card-icon">
            <FiTrendingUp />
          </div>
          <div className="card-content">
            <h3>Total Production</h3>
            <div className="card-value">
              {stats.totalProduction.toFixed(2)} Kg
            </div>
            <div className="card-subtext">
              From Flattening Section
            </div>
          </div>
        </div>
        
        <div className="summary-card consumption-card">
          <div className="card-icon">
            <FiTrendingDown />
          </div>
          <div className="card-content">
            <h3>Total Consumption</h3>
            <div className="card-value">
              {stats.totalConsumption.toFixed(2)} Kg
            </div>
            <div className="card-subtext">
              By Spiral Section
            </div>
          </div>
        </div>
        
        <div className="summary-card balance-card">
          <div className="card-icon">
            <FiDollarSign />
          </div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <div className="card-value" style={{
              color: stats.totalBalance >= 0 ? '#2ecc71' : '#e74c3c'
            }}>
              {stats.totalBalance.toFixed(2)} Kg
            </div>
            <div className="card-subtext">
              Available Stock
            </div>
          </div>
        </div>
        
        <div className="summary-card efficiency-card">
          <div className="card-icon">
            <FiPercent />
          </div>
          <div className="card-content">
            <h3>Total Efficiency</h3>
            <div className="card-value" style={{
              color: getEfficiencyColor(stats.totalEfficiency)
            }}>
              {stats.totalEfficiency.toFixed(2)}%
            </div>
            <div className="card-subtext">
              Material Utilization
            </div>
          </div>
        </div>
        
        <div className="summary-card alerts-card">
          <div className="card-icon">
            <FiAlertTriangle />
          </div>
          <div className="card-content">
            <h3>Active Alerts</h3>
            <div className="card-value">
              {stats.totalAlerts}
            </div>
            <div className="card-subtext">
              {stats.criticalItems} Critical, {stats.lowItems} Low
            </div>
          </div>
        </div>
        
        <div className="summary-card materials-card">
          <div className="card-icon">
            <FiPackage />
          </div>
          <div className="card-content">
            <h3>Total Materials</h3>
            <div className="card-value">
              {stats.totalMaterials}
            </div>
            <div className="card-subtext">
              Unique Items
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <FiBarChart2 /> Overview
        </button>
        <button 
          className={`tab-btn ${activeView === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveView('alerts')}
        >
          <FiAlertTriangle /> Alerts ({stats.totalAlerts})
        </button>
        <button 
          className={`tab-btn ${activeView === 'report' ? 'active' : ''}`}
          onClick={() => setActiveView('report')}
        >
          <FiPackage /> Balance Report
        </button>
        <button 
          className={`tab-btn ${activeView === 'flow' ? 'active' : ''}`}
          onClick={() => setActiveView('flow')}
        >
          <FiActivity /> Material Flow
        </button>
        <button 
          className={`tab-btn ${activeView === 'trend' ? 'active' : ''}`}
          onClick={() => setActiveView('trend')}
        >
          <FiTrendingUp /> Trends
        </button>
      </div>
      
      {/* Dashboard Content */}
      <div className="dashboard-content">
        {activeView === 'overview' && (
          <div className="overview-content">
            <div className="chart-container">
              <MaterialFlowChart 
                dateRange={dateRange}
                data={dashboardData?.dailySummary}
              />
            </div>
            <div className="chart-container">
              <InventoryTrendChart 
                data={dashboardData?.balanceReport}
              />
            </div>
          </div>
        )}
        
        {activeView === 'alerts' && (
          <InventoryAlerts alerts={dashboardData?.alerts} />
        )}
        
        {activeView === 'report' && (
          <MaterialBalanceReport 
            report={dashboardData?.balanceReport} 
            dateRange={dateRange}
          />
        )}
        
        {activeView === 'flow' && (
          <div className="material-flow">
            <h3>Material Flow Analysis</h3>
            <div className="flow-stats">
              <div className="flow-stat">
                <span className="stat-label">Flattening Output:</span>
                <span className="stat-value">{stats.totalProduction.toFixed(2)} Kg</span>
              </div>
              <div className="flow-stat">
                <span className="stat-label">Spiral Input:</span>
                <span className="stat-value">{stats.totalConsumption.toFixed(2)} Kg</span>
              </div>
              <div className="flow-stat">
                <span className="stat-label">Material Efficiency:</span>
                <span className="stat-value" style={{ color: getEfficiencyColor(stats.totalEfficiency) }}>
                  {stats.totalEfficiency.toFixed(2)}%
                </span>
              </div>
              <div className="flow-stat">
                <span className="stat-label">Available Stock:</span>
                <span className="stat-value" style={{ color: stats.totalBalance >= 0 ? '#2ecc71' : '#e74c3c' }}>
                  {stats.totalBalance.toFixed(2)} Kg
                </span>
              </div>
            </div>
            <div className="flow-chart">
              <MaterialFlowChart 
                dateRange={dateRange}
                data={dashboardData?.dailySummary}
              />
            </div>
          </div>
        )}
        
        {activeView === 'trend' && (
          <div className="trend-view">
            <InventoryTrendChart data={dashboardData?.balanceReport} />
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-info">
          <div className="info-item">
            <FiClock /> Last Updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="info-item">
            <FiUsers /> Total Materials: {stats.totalMaterials}
          </div>
          <div className="info-item">
            <FiShoppingCart /> Items Need Reorder: {stats.lowItems + stats.criticalItems}
          </div>
          <div className="info-item">
            <FiHome /> Date Range: {dateRange.start} to {dateRange.end}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;