// src/pages/ProductionSections/Production.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiPackage, FiArrowLeft, FiFolder, 
  FiEdit, FiEye, FiFileText,
  FiHome, FiGrid, FiArrowUpRight,
  FiArchive, FiColumns, FiLayers,
  FiScissors, FiCheckSquare, FiTrendingUp,
  FiBarChart2, FiCalendar, FiClock, FiFilter,
  FiDatabase, FiPrinter, FiDownload, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiActivity,
  FiCpu, FiZap, FiTool, FiBox, FiTarget,
  FiDollarSign, FiPercent, FiTrendingUp as FiTrendingUpIcon,
  FiTrendingDown, FiUsers, FiMap, FiPieChart,
  FiMenu, FiChevronRight as FiChevronRightIcon
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './Production.css';

// Mock data for demonstration
const Production = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('spiral');
  const [timeRange, setTimeRange] = useState('today');
  const [reportType, setReportType] = useState('summary');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Production Sections
  const sections = [
    { 
      id: 'raw-material',
      name: 'Raw Material Section', 
      description: 'Raw material storage and management',
      path: '/production-sections/raw-material',
      color: '#06b6d4',
      icon: FiArchive
    },
    { 
      id: 'flattening',
      name: 'Flattening Section', 
      description: 'Wire flattening and processing operations',
      path: '/production-sections/flattening',
      color: '#f59e0b',
      icon: FiPackage
    },
    { 
      id: 'spiral',
      name: 'Spiral Section', 
      description: 'Spiral binding production and assembly',
      path: '/production-sections/spiral',
      color: '#10b981',
      icon: FiColumns
    },
    { 
      id: 'pvc-coating',
      name: 'PVC Coating Section', 
      description: 'PVC coating application and finishing',
      path: '/production-sections/pvc-coating',
      color: '#8b5cf6',
      icon: FiLayers
    },
    { 
      id: 'cutting-packing',
      name: 'Cutting & Packing Section', 
      description: 'Final cutting, packaging and dispatch',
      path: '/production-sections/cutting-packing',
      color: '#3b82f6',
      icon: FiScissors
    },
    { 
      id: 'finished-goods',
      name: 'Finished Goods Section', 
      description: 'Finished products inventory and quality control',
      path: '/production-sections/finished-goods',
      color: '#ef4444',
      icon: FiCheckSquare
    },
  ];

  // Time ranges for reports
  const timeRanges = [
    { id: 'today', name: 'Today', icon: FiCalendar },
    { id: 'yesterday', name: 'Yesterday', icon: FiCalendar },
    { id: 'week', name: 'This Week', icon: FiCalendar },
    { id: 'month', name: 'This Month', icon: FiCalendar },
    { id: 'quarter', name: 'This Quarter', icon: FiCalendar },
    { id: 'year', name: 'This Year', icon: FiCalendar },
    { id: 'custom', name: 'Custom Range', icon: FiFilter },
  ];

  // Report types
  const reportTypes = [
    { id: 'summary', name: 'Summary', icon: FiBarChart2 },
    { id: 'daily', name: 'Daily Report', icon: FiCalendar },
    { id: 'weekly', name: 'Weekly Report', icon: FiTrendingUp },
    { id: 'monthly', name: 'Monthly Report', icon: FiTrendingUpIcon },
    { id: 'item-wise', name: 'Item-wise', icon: FiPackage },
    { id: 'machine-wise', name: 'Machine-wise', icon: FiTool },
    { id: 'operator-wise', name: 'Operator-wise', icon: FiUsers },
    { id: 'product-wise', name: 'Product-wise', icon: FiBox },
    { id: 'efficiency', name: 'Efficiency', icon: FiActivity },
    { id: 'comparative', name: 'Comparative', icon: FiTrendingUp },
  ];

  // Mock data for active section
  const [activeSectionData, setActiveSectionData] = useState({
    summary: {
      totalProduction: 12500,
      totalWeight: 8500,
      avgEfficiency: 85.5,
      totalRecords: 245,
      todayProduction: 1250,
      todayWeight: 850,
      todayEfficiency: 88.2,
    },
    daily: [
      { date: '2024-01-01', production: 1250, weight: 850, efficiency: 88.2 },
      { date: '2024-01-02', production: 1300, weight: 880, efficiency: 89.1 },
      { date: '2024-01-03', production: 1200, weight: 820, efficiency: 87.5 },
      { date: '2024-01-04', production: 1350, weight: 900, efficiency: 90.0 },
      { date: '2024-01-05', production: 1280, weight: 870, efficiency: 88.8 },
    ],
    itemWise: [
      { item: 'Spiral Pipe 1"', production: 3500, weight: 2400, efficiency: 89.5 },
      { item: 'Spiral Pipe 2"', production: 4200, weight: 2900, efficiency: 87.8 },
      { item: 'Spiral Pipe 3"', production: 2800, weight: 1900, efficiency: 86.2 },
      { item: 'Spiral Pipe 4"', production: 2000, weight: 1300, efficiency: 84.5 },
    ],
    machineWise: [
      { machine: 'Machine 1', production: 4500, efficiency: 90.2, downtime: '2h' },
      { machine: 'Machine 2', production: 4000, efficiency: 88.5, downtime: '3h' },
      { machine: 'Machine 3', production: 3500, efficiency: 87.1, downtime: '4h' },
      { machine: 'Machine 4', production: 500, efficiency: 82.3, downtime: '6h' },
    ],
    trends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      production: [1200, 1300, 1250, 1400, 1350, 1500],
      efficiency: [85, 86, 87, 88, 89, 90],
      weight: [800, 850, 820, 900, 870, 950],
    },
  });

  const activeSectionObj = sections.find(s => s.id === activeSection) || sections[2];

  // Handle section click
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Handle navigation to detail page
  const handleGoToDetail = () => {
    navigate(activeSectionObj.path);
  };

  // Handle export report
  const handleExportReport = () => {
    const csvContent = [
      ['Production Report', `${activeSectionObj.name} - ${timeRange}`],
      ['Generated on:', new Date().toLocaleString()],
      [],
      ['Metric', 'Value'],
      ['Total Production (M)', activeSectionData.summary.totalProduction],
      ['Total Weight (KG)', activeSectionData.summary.totalWeight],
      ['Average Efficiency (%)', activeSectionData.summary.avgEfficiency],
      ['Total Records', activeSectionData.summary.totalRecords],
      ["Today's Production", activeSectionData.summary.todayProduction],
      ["Today's Weight", activeSectionData.summary.todayWeight],
      ["Today's Efficiency", activeSectionData.summary.todayEfficiency],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSectionObj.id}-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle print report
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${activeSectionObj.name} Production Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 10px; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
          .summary-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
          .summary-value { font-size: 24px; font-weight: bold; color: #333; }
          .summary-label { font-size: 14px; color: #666; margin-top: 5px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #f8f9fa; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
          @media print { body { margin: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${activeSectionObj.name} Production Report</h1>
          <div>Time Range: ${timeRange} • Generated on: ${new Date().toLocaleString()}</div>
          <div>Generated by: Afsar</div>
        </div>
        
        <h3>Summary</h3>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-value">${activeSectionData.summary.totalProduction.toLocaleString()} M</div>
            <div class="summary-label">Total Production</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${activeSectionData.summary.totalWeight.toLocaleString()} KG</div>
            <div class="summary-label">Total Weight</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${activeSectionData.summary.avgEfficiency}%</div>
            <div class="summary-label">Average Efficiency</div>
          </div>
          <div class="summary-card">
            <div class="summary-value">${activeSectionData.summary.totalRecords}</div>
            <div class="summary-label">Total Records</div>
          </div>
        </div>
        
        ${reportType === 'item-wise' ? `
          <h3>Item-wise Production</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Production (M)</th>
                <th>Weight (KG)</th>
                <th>Efficiency (%)</th>
              </tr>
            </thead>
            <tbody>
              ${activeSectionData.itemWise.map(item => `
                <tr>
                  <td>${item.item}</td>
                  <td>${item.production.toLocaleString()}</td>
                  <td>${item.weight.toLocaleString()}</td>
                  <td>${item.efficiency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        
        ${reportType === 'machine-wise' ? `
          <h3>Machine-wise Production</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Production (M)</th>
                <th>Efficiency (%)</th>
                <th>Downtime</th>
              </tr>
            </thead>
            <tbody>
              ${activeSectionData.machineWise.map(machine => `
                <tr>
                  <td>${machine.machine}</td>
                  <td>${machine.production.toLocaleString()}</td>
                  <td>${machine.efficiency}</td>
                  <td>${machine.downtime}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        
        ${reportType === 'daily' ? `
          <h3>Daily Production (Last 5 Days)</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Production (M)</th>
                <th>Weight (KG)</th>
                <th>Efficiency (%)</th>
              </tr>
            </thead>
            <tbody>
              ${activeSectionData.daily.map(day => `
                <tr>
                  <td>${day.date}</td>
                  <td>${day.production.toLocaleString()}</td>
                  <td>${day.weight.toLocaleString()}</td>
                  <td>${day.efficiency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        
        <div class="footer">
          Generated on ${new Date().toLocaleString()} by Afsar<br/>
          Production Management System
        </div>
        
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Render different report types
  const renderReportContent = () => {
    switch (reportType) {
      case 'summary':
        return (
          <div className="report-summary">
            <div className="summary-grid">
              <div className="summary-card" style={{ borderColor: activeSectionObj.color }}>
                <div className="summary-icon" style={{ background: `${activeSectionObj.color}20` }}>
                  <FiPackage style={{ color: activeSectionObj.color }} />
                </div>
                <div className="summary-value">
                  {activeSectionData.summary.totalProduction.toLocaleString()} M
                </div>
                <div className="summary-label">Total Production</div>
              </div>
              
              <div className="summary-card" style={{ borderColor: activeSectionObj.color }}>
                <div className="summary-icon" style={{ background: `${activeSectionObj.color}20` }}>
                  <FiTarget style={{ color: activeSectionObj.color }} />
                </div>
                <div className="summary-value">
                  {activeSectionData.summary.totalWeight.toLocaleString()} KG
                </div>
                <div className="summary-label">Total Weight</div>
              </div>
              
              <div className="summary-card" style={{ borderColor: activeSectionObj.color }}>
                <div className="summary-icon" style={{ background: `${activeSectionObj.color}20` }}>
                  <FiActivity style={{ color: activeSectionObj.color }} />
                </div>
                <div className="summary-value">
                  {activeSectionData.summary.avgEfficiency}%
                </div>
                <div className="summary-label">Average Efficiency</div>
              </div>
              
              <div className="summary-card" style={{ borderColor: activeSectionObj.color }}>
                <div className="summary-icon" style={{ background: `${activeSectionObj.color}20` }}>
                  <FiDatabase style={{ color: activeSectionObj.color }} />
                </div>
                <div className="summary-value">
                  {activeSectionData.summary.totalRecords}
                </div>
                <div className="summary-label">Total Records</div>
              </div>
              
              <div className="summary-card" style={{ borderColor: activeSectionObj.color }}>
                <div className="summary-icon" style={{ background: `${activeSectionObj.color}20` }}>
                  <FiTrendingUpIcon style={{ color: activeSectionObj.color }} />
                </div>
                <div className="summary-value">
                  {activeSectionData.summary.todayProduction.toLocaleString()} M
                </div>
                <div className="summary-label">Today's Production</div>
              </div>
              
              <div className="summary-card" style={{ borderColor: activeSectionObj.color }}>
                <div className="summary-icon" style={{ background: `${activeSectionObj.color}20` }}>
                  <FiZap style={{ color: activeSectionObj.color }} />
                </div>
                <div className="summary-value">
                  {activeSectionData.summary.todayEfficiency}%
                </div>
                <div className="summary-label">Today's Efficiency</div>
              </div>
            </div>
          </div>
        );

      case 'item-wise':
        return (
          <div className="item-wise-report">
            <h3>Item-wise Production Analysis</h3>
            <div className="item-list">
              {activeSectionData.itemWise.map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <div className="item-icon" style={{ background: activeSectionObj.color }}>
                      <FiPackage size={14} />
                    </div>
                    <div className="item-name">{item.item}</div>
                  </div>
                  <div className="item-stats">
                    <div className="item-stat">
                      <span className="stat-value">{item.production.toLocaleString()} M</span>
                      <span className="stat-label">Production</span>
                    </div>
                    <div className="item-stat">
                      <span className="stat-value">{item.weight.toLocaleString()} KG</span>
                      <span className="stat-label">Weight</span>
                    </div>
                    <div className="item-stat">
                      <span className="stat-value">{item.efficiency}%</span>
                      <span className="stat-label">Efficiency</span>
                    </div>
                  </div>
                  <div className="item-progress">
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${(item.production / activeSectionData.itemWise.reduce((sum, i) => sum + i.production, 0)) * 100}%`,
                        background: activeSectionObj.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'machine-wise':
        return (
          <div className="machine-wise-report">
            <h3>Machine-wise Performance</h3>
            <div className="machine-grid">
              {activeSectionData.machineWise.map((machine, index) => (
                <div key={index} className="machine-card">
                  <div className="machine-header">
                    <div className="machine-icon" style={{ background: activeSectionObj.color }}>
                      <FiTool size={14} />
                    </div>
                    <div className="machine-name">{machine.machine}</div>
                  </div>
                  <div className="machine-stats">
                    <div className="machine-stat">
                      <div className="stat-value">{machine.production.toLocaleString()} M</div>
                      <div className="stat-label">Production</div>
                    </div>
                    <div className="machine-stat">
                      <div className="stat-value efficiency-high">{machine.efficiency}%</div>
                      <div className="stat-label">Efficiency</div>
                    </div>
                    <div className="machine-stat">
                      <div className="stat-value downtime">{machine.downtime}</div>
                      <div className="stat-label">Downtime</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'daily':
        return (
          <div className="daily-report">
            <h3>Daily Production Trends</h3>
            <div className="daily-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Production (M)</th>
                    <th>Weight (KG)</th>
                    <th>Efficiency (%)</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSectionData.daily.map((day, index) => (
                    <tr key={index}>
                      <td>{day.date}</td>
                      <td>{day.production.toLocaleString()}</td>
                      <td>{day.weight.toLocaleString()}</td>
                      <td>
                        <span className="efficiency-badge" style={{ background: day.efficiency > 85 ? '#10b98120' : '#ef444420', color: day.efficiency > 85 ? '#10b981' : '#ef4444' }}>
                          {day.efficiency}%
                        </span>
                      </td>
                      <td>
                        {index > 0 && (
                          <span className={`trend ${day.production > activeSectionData.daily[index - 1].production ? 'up' : 'down'}`}>
                            {day.production > activeSectionData.daily[index - 1].production ? '↗' : '↘'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return (
          <div className="default-report">
            <h3>Production Overview</h3>
            <p>Select a report type to view detailed analysis.</p>
          </div>
        );
    }
  };

  return (
    <div className="production-dashboard-container">
      {/* Database Status Banner */}
      <div className="database-status-banner">
        <FiDatabase size={16} />
        <span>Production Database Connected • Last Updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div 
          className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
          onMouseEnter={() => !sidebarCollapsed && setSidebarCollapsed(false)}
          onMouseLeave={() => sidebarCollapsed && setSidebarCollapsed(true)}
        >
          <div className="sidebar-header">
            <div className="sidebar-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
              <FiGrid size={20} />
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="sidebar-title">Production Sections</div>
                <button 
                  className="collapse-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarCollapsed(!sidebarCollapsed);
                  }}
                >
                  <FiChevronLeft size={16} />
                </button>
              </>
            )}
          </div>
          
          <div className="section-buttons">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => handleSectionClick(section.id)}
                style={activeSection === section.id ? { 
                  background: `${section.color}20`,
                  borderColor: section.color,
                  color: section.color
                } : {}}
                data-tooltip={section.name}
              >
                <div className="section-btn-icon" style={{ color: section.color }}>
                  <section.icon size={18} />
                </div>
                {!sidebarCollapsed && (
                  <div className="section-btn-text">
                    <div className="section-btn-name">{section.name}</div>
                    <div className="section-btn-desc">{section.description}</div>
                  </div>
                )}
                {activeSection === section.id && !sidebarCollapsed && (
                  <div className="active-indicator" style={{ background: section.color }} />
                )}
                {activeSection === section.id && sidebarCollapsed && (
                  <div className="active-dot" style={{ background: section.color }} />
                )}
              </button>
            ))}
          </div>
          
          {!sidebarCollapsed && (
            <div className="sidebar-footer">
              <div className="user-info">
                <div className="user-avatar">A</div>
                <div className="user-details">
                  <div className="user-name">Afsar</div>
                  <div className="user-role">Production Manager</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
          {/* Header */}
          <div className="content-header">
            <div>
              <div className="breadcrumb">
                <button onClick={() => navigate('/dashboard')} className="breadcrumb-btn">
                  <FiHome size={16} /> Dashboard
                </button>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">Production Dashboard</span>
              </div>
              <h1 className="page-title">
                <div className="title-icon" style={{ background: activeSectionObj.color }}>
                  <activeSectionObj.icon size={24} />
                </div>
                {activeSectionObj.name}
                <span className="title-sub">Production Analytics & Reports</span>
              </h1>
            </div>
            
            <div className="header-actions">
              <button onClick={handleGoToDetail} className="detail-btn" style={{ background: activeSectionObj.color }}>
                <FiEye size={16} /> Go to Detail Page
              </button>
              <button onClick={handleExportReport} className="export-btn">
                <FiDownload size={16} /> Export Report
              </button>
              <button onClick={handlePrintReport} className="print-btn">
                <FiPrinter size={16} /> Print
              </button>
              <button 
                className="sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <FiMenu size={20} />
              </button>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="time-range-selector">
            <div className="selector-header">
              <FiCalendar size={16} />
              <span>Select Time Range</span>
            </div>
            <div className="time-buttons">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  className={`time-btn ${timeRange === range.id ? 'active' : ''}`}
                  onClick={() => setTimeRange(range.id)}
                  style={timeRange === range.id ? { 
                    background: activeSectionObj.color,
                    borderColor: activeSectionObj.color
                  } : {}}
                >
                  <range.icon size={14} />
                  {range.name}
                </button>
              ))}
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="report-type-selector">
            <div className="selector-header">
              <FiBarChart2 size={16} />
              <span>Report Type</span>
            </div>
            <div className="report-buttons">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  className={`report-btn ${reportType === type.id ? 'active' : ''}`}
                  onClick={() => setReportType(type.id)}
                  style={reportType === type.id ? { 
                    background: activeSectionObj.color,
                    borderColor: activeSectionObj.color
                  } : {}}
                >
                  <type.icon size={14} />
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Report Content */}
          <div className="report-content">
            <div className="report-header">
              <h2>
                {activeSectionObj.name} {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
                <span className="report-subtitle">• {timeRange} • Generated by: Afsar</span>
              </h2>
              <div className="report-meta">
                <span className="meta-item">
                  <FiCalendar size={12} /> {new Date().toLocaleDateString()}
                </span>
                <span className="meta-item">
                  <FiClock size={12} /> {new Date().toLocaleTimeString()}
                </span>
                <span className="meta-item">
                  <FiDatabase size={12} /> Total Records: {activeSectionData.summary.totalRecords}
                </span>
              </div>
            </div>

            <div className="report-body">
              {renderReportContent()}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-card quick">
              <div className="stat-icon" style={{ background: activeSectionObj.color }}>
                <FiTrendingUp size={20} />
              </div>
              <div>
                <div className="stat-value">{activeSectionData.summary.todayProduction.toLocaleString()} M</div>
                <div className="stat-label">Today's Production</div>
              </div>
            </div>
            
            <div className="stat-card quick">
              <div className="stat-icon" style={{ background: activeSectionObj.color }}>
                <FiZap size={20} />
              </div>
              <div>
                <div className="stat-value">{activeSectionData.summary.todayEfficiency}%</div>
                <div className="stat-label">Today's Efficiency</div>
              </div>
            </div>
            
            <div className="stat-card quick">
              <div className="stat-icon" style={{ background: activeSectionObj.color }}>
                <FiTarget size={20} />
              </div>
              <div>
                <div className="stat-value">{activeSectionData.summary.todayWeight.toLocaleString()} KG</div>
                <div className="stat-label">Today's Weight</div>
              </div>
            </div>
            
            <div className="stat-card quick">
              <div className="stat-icon" style={{ background: activeSectionObj.color }}>
                <FiActivity size={20} />
              </div>
              <div>
                <div className="stat-value">{activeSectionData.summary.avgEfficiency}%</div>
                <div className="stat-label">Avg Efficiency</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-title">Production Analytics Dashboard</div>
            <div className="footer-subtitle">
              Active Section: {activeSectionObj.name} • Report Type: {reportType} • 
              Time Range: {timeRange} • Managed by: Afsar
            </div>
          </div>
          <div className="footer-right">
            <button onClick={() => window.location.reload()} className="refresh-btn">
              <FiRefreshCw size={14} /> Refresh Data
            </button>
            <div className="footer-info">
              <span className="info-item">
                <FiDatabase size={12} /> Database Connected
              </span>
              <span className="info-item">
                <FiClock size={12} /> {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Production;