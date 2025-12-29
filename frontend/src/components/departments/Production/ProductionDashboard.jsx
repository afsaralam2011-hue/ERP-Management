// src/components/departments/Production/ProductionDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  FiPackage, FiFolder, FiArrowRight, FiHome,
  FiSettings, FiFilter, FiRefreshCw, FiDownload,
  FiBarChart2, FiTrendingUp, FiCalendar, FiActivity,
  FiCheckCircle, FiClock, FiTarget
} from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom"; // Link شامل کیا

// Import new dashboard components
import ProductionCards from "./DashboardComponents/ProductionCards";
import ProductionCharts from "./DashboardComponents/ProductionCharts";
import ProductionMetrics from "./DashboardComponents/ProductionMetrics";
import YesterdayStats from "./DashboardComponents/YesterdayStats";
import EfficiencyAnalytics from "./DashboardComponents/EfficiencyAnalytics";

const ProductionDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const navigate = useNavigate();

  // Simulate data fetching
  useEffect(() => {
    const fetchDashboardData = () => {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockData = {
          // Cards data
          stats: [
            { 
              id: 1,
              label: "Daily Output", 
              value: "2,850", 
              change: "+15%", 
              icon: "FiPackage", 
              color: "#f59e0b",
              description: "Units produced today",
              isPositive: true,
              link: "/production/today-output"
            },
            { 
              id: 2,
              label: "Efficiency", 
              value: "92%", 
              change: "+3%", 
              icon: "FiActivity", 
              color: "#10b981",
              description: "Overall production efficiency",
              isPositive: true,
              link: "/production/efficiency"
            },
            { 
              id: 3,
              label: "Downtime", 
              value: "2%", 
              change: "-1%", 
              icon: "FiClock", 
              color: "#ef4444",
              description: "Machine downtime percentage",
              isPositive: false,
              link: "/production/downtime"
            },
            { 
              id: 4,
              label: "Quality Pass", 
              value: "98.5%", 
              change: "+0.5%", 
              icon: "FiCheckCircle", 
              color: "#3b82f6",
              description: "Quality inspection pass rate",
              isPositive: true,
              link: "/production/quality"
            },
            { 
              id: 5,
              label: "Last Day Production", 
              value: "385", 
              change: "+5%", 
              icon: "FiCalendar", 
              color: "#8b5cf6",
              description: "Yesterday's total production",
              isPositive: true,
              link: "/production/analytics/last-day",
              isYesterday: true
            },
            { 
              id: 6,
              label: "Last Day Efficiency", 
              value: "88.2%", 
              change: "+1.8%", 
              icon: "FiTarget", 
              color: "#ec4899",
              description: "Yesterday's average efficiency",
              isPositive: true,
              link: "/production/analytics/last-day",
              isYesterday: true
            }
          ],
          
          // Yesterday stats data
          yesterdayData: {
            date: '2025-12-15',
            totalProduction: 385,
            avgEfficiency: 88.2,
            sections: [
              { name: 'Flattening Section', production: 120, efficiency: 92 },
              { name: 'Spiral Section', production: 85, efficiency: 90 },
              { name: 'PVC Coating', production: 75, efficiency: 88 },
              { name: 'Cutting & Packing', production: 105, efficiency: 95 }
            ],
            comparison: {
              production: '+5%',
              efficiency: '+1.8%',
              isProductionUp: true,
              isEfficiencyUp: true
            },
            metrics: {
              bestSection: 'Flattening Section',
              worstSection: 'PVC Coating',
              totalHours: 24,
              downtime: '1.2 hours',
              avgQuality: '96.7%'
            }
          },
          
          // Efficiency analytics data
          efficiencyData: {
            overallEfficiency: 86.4,
            yesterdayEfficiency: 88.2,
            trend: '+1.8%',
            isTrendUp: true,
            
            distribution: [
              { range: '90-100%', percentage: 40, color: '#10b981', count: 8 },
              { range: '80-89%', percentage: 30, color: '#3b82f6', count: 6 },
              { range: '70-79%', percentage: 15, color: '#f59e0b', count: 3 },
              { range: 'Below 70%', percentage: 15, color: '#ef4444', count: 3 }
            ],
            
            dailyEfficiency: [
              { day: 'Mon', efficiency: 85.2 },
              { day: 'Tue', efficiency: 87.8 },
              { day: 'Wed', efficiency: 84.5 },
              { day: 'Thu', efficiency: 88.2 },
              { day: 'Fri', efficiency: 86.4 },
              { day: 'Sat', efficiency: 89.1 },
              { day: 'Sun', efficiency: 82.3 }
            ],
            
            sections: [
              { name: 'Flattening', efficiency: 92.5, trend: '+2.1%' },
              { name: 'Spiral', efficiency: 88.7, trend: '+1.2%' },
              { name: 'PVC Coating', efficiency: 85.3, trend: '-0.5%' },
              { name: 'Cutting', efficiency: 95.1, trend: '+3.2%' },
              { name: 'Packing', efficiency: 93.8, trend: '+1.8%' },
              { name: 'Finished Goods', efficiency: 97.2, trend: '+4.1%' }
            ],
            
            metrics: {
              avgDowntime: '2.1%',
              qualityRate: '96.7%',
              oee: '84.3%',
              utilization: '92.5%'
            }
          },
          
          // Charts data
          chartData: {
            productionByDay: [
              { day: 'Mon', production: 2850, target: 3000 },
              { day: 'Tue', production: 3200, target: 3000 },
              { day: 'Wed', production: 2750, target: 3000 },
              { day: 'Thu', production: 3100, target: 3000 },
              { day: 'Fri', production: 2950, target: 3000 },
              { day: 'Sat', production: 2650, target: 2500 },
              { day: 'Sun', production: 1850, target: 2000 }
            ],
            efficiencyDistribution: [
              { range: 'Excellent (90-100%)', value: 40, color: '#10b981' },
              { range: 'Good (80-89%)', value: 30, color: '#3b82f6' },
              { range: 'Average (70-79%)', value: 15, color: '#f59e0b' },
              { range: 'Poor (<70%)', value: 15, color: '#ef4444' }
            ],
            sectionPerformance: [
              { section: 'Flattening', efficiency: 92, production: 1250 },
              { section: 'Spiral', efficiency: 88, production: 850 },
              { section: 'PVC Coating', efficiency: 85, production: 750 },
              { section: 'Cutting', efficiency: 95, production: 1200 },
              { section: 'Packing', efficiency: 93, production: 1100 },
              { section: 'Finished Goods', efficiency: 97, production: 2000 }
            ]
          },
          
          // Metrics data
          metricsData: {
            records: [
              {
                id: 'PRD-001',
                section: 'Flattening',
                shift: 'Shift A',
                date: '2025-12-16',
                startTime: '08:00',
                endTime: '16:00',
                units: 120,
                efficiency: 92,
                quality: 98.5,
                status: 'completed',
                operator: 'John Doe',
                machine: 'FLT-001'
              },
              // ... more records
            ],
            summary: {
              totalRecords: 8,
              totalUnits: 900,
              avgEfficiency: 91.3,
              avgQuality: 98.4,
              completed: 6,
              inProgress: 1,
              pending: 1
            },
            sections: ['Flattening', 'Spiral', 'PVC Coating', 'Cutting', 'Packing', 'Finished Goods'],
            statusOptions: ['completed', 'in-progress', 'pending']
          },
          
          // Production lines data
          productionLines: [
            { 
              id: 1, 
              name: "Flattening Line", 
              status: "Running", 
              output: "1,250", 
              efficiency: "94%",
              section: "flattening"
            },
            { 
              id: 2, 
              name: "Spiral Line", 
              status: "Running", 
              output: "850", 
              efficiency: "90%",
              section: "spiral" 
            },
            { 
              id: 3, 
              name: "Galvanizing Line", 
              status: "Maintenance", 
              output: "0", 
              efficiency: "0%",
              section: "galvanizing"
            },
            { 
              id: 4, 
              name: "PVC Coating", 
              status: "Running", 
              output: "750", 
              efficiency: "92%",
              section: "pvc-coating"
            },
            { 
              id: 5, 
              name: "Cutting & Packing", 
              status: "Running", 
              output: "1,200", 
              efficiency: "95%",
              section: "cutting-packing"
            },
            { 
              id: 6, 
              name: "Finished Goods", 
              status: "Running", 
              output: "2,000", 
              efficiency: "97%",
              section: "finished-goods"
            },
          ]
        };
        
        setDashboardData(mockData);
        setLoading(false);
        setLastRefresh(new Date());
      }, 1000);
    };

    fetchDashboardData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // === Navigation functions ===
  const handleOpenProductionSections = () => {
    navigate('/production-sections');
  };

  const handleOpenSection = (sectionName) => {
    navigate(`/production-sections/${sectionName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleRefreshDashboard = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastRefresh(new Date());
    }, 500);
  };

  const handleExportDashboard = () => {
    console.log('Exporting dashboard data...');
    // Implement export logic here
  };

  const handleCardClick = (card) => {
    console.log('Card clicked:', card);
    if (card.link) {
      navigate(card.link);
    }
  };

  const handleViewRecord = (record) => {
    navigate(`/production/records/${record.id}`);
  };

  const handleEditRecord = (record) => {
    navigate(`/production/records/${record.id}/edit`);
  };

  const handleDeleteRecord = (record) => {
    if (window.confirm(`Are you sure you want to delete record ${record.id}?`)) {
      console.log('Deleting record:', record.id);
      // Implement delete logic here
    }
  };

  const handleExportData = (data) => {
    console.log('Exporting data:', data);
    // Implement export logic here
  };

  const handleChartExport = (chartType) => {
    console.log(`Exporting ${chartType} chart...`);
    // Implement chart export logic here
  };

  if (loading && !dashboardData) {
    return (
      <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100vh" }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '5px solid #e2e8f0',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>
            Loading Production Dashboard
          </h3>
          <p style={{ color: '#64748b' }}>
            Please wait while we load the latest production data...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header Section */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <h1 style={{ 
            margin: "0", 
            fontSize: "32px", 
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white"
            }}>
              <FiPackage size={28} />
            </div>
            Production Dashboard 1
          </h1>
          <p style={{ 
            margin: "10px 0 0 75px", 
            color: "#64748b",
            fontSize: "16px"
          }}>
            Real-time monitoring, analytics and management of production operations
          </p>
        </div>
        
        {/* Dashboard Controls */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            <FiCalendar size={14} />
            Last refresh: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          <button
            onClick={handleRefreshDashboard}
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e2e8f0';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f1f5f9';
            }}
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          
          <button
            onClick={handleExportDashboard}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2563eb';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#3b82f6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FiDownload size={16} />
            Export
          </button>
          
          {/* Daily Report Button */}
          <Link
            to="/production-reports/daily"
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s",
              textDecoration: "none",
              boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#7c3aed";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(139, 92, 246, 0.3)";
            }}
          >
            <FiBarChart2 size={16} />
            Daily Report
          </Link>
          
          <button
            onClick={handleOpenProductionSections}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.4)";
            }}
          >
            <FiFolder style={{ fontSize: "16px" }} />
            <span>Production Sections</span>
            <FiArrowRight style={{ fontSize: "14px" }} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '25px',
        background: '#f8fafc',
        padding: '8px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            background: activeTab === 'overview' ? '#3b82f6' : 'transparent',
            color: activeTab === 'overview' ? 'white' : '#64748b',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          <FiPackage style={{ marginRight: '8px' }} />
          Overview
        </button>
        
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            background: activeTab === 'analytics' ? '#8b5cf6' : 'transparent',
            color: activeTab === 'analytics' ? 'white' : '#64748b',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          <FiBarChart2 style={{ marginRight: '8px' }} />
          Analytics
        </button>
        
        <button
          onClick={() => setActiveTab('records')}
          style={{
            background: activeTab === 'records' ? '#2910b9ff' : 'transparent',
            color: activeTab === 'records' ? 'white' : '#64748b',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          <FiActivity style={{ marginRight: '8px' }} />
          Records
        </button>
        
        <button
          onClick={() => setActiveTab('sections')}
          style={{
            background: activeTab === 'sections' ? '#f59e0b' : 'transparent',
            color: activeTab === 'sections' ? 'white' : '#64748b',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          <FiSettings style={{ marginRight: '8px' }} />
          Sections
        </button>
      </div>

      {/* Main Dashboard Content */}
      <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
        {/* Production Cards - 6 Stats Cards */}
        <ProductionCards 
          stats={dashboardData?.stats}
          loading={loading}
          onCardClick={handleCardClick}
        />

        {/* Yesterday's Stats */}
        <YesterdayStats 
          data={dashboardData?.yesterdayData}
          loading={loading}
        />

        {/* Production Charts */}
        <ProductionCharts 
          chartData={dashboardData?.chartData}
          loading={loading}
          onExport={handleChartExport}
        />

        {/* Efficiency Analytics */}
        <EfficiencyAnalytics 
          data={dashboardData?.efficiencyData}
          loading={loading}
        />
      </div>

      {/* Analytics Tab Content */}
      <div style={{ display: activeTab === 'analytics' ? 'block' : 'none' }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '25px'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '24px', 
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FiBarChart2 size={24} />
            Advanced Analytics
          </h2>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>
            Detailed analytical views and reports for production performance
          </p>
          
          {/* Yesterday Stats in Analytics Tab */}
          <YesterdayStats 
            data={dashboardData?.yesterdayData}
            loading={loading}
          />
          
          {/* Efficiency Analytics in Analytics Tab */}
          <EfficiencyAnalytics 
            data={dashboardData?.efficiencyData}
            loading={loading}
          />
          
          {/* Production Charts in Analytics Tab */}
          <ProductionCharts 
            chartData={dashboardData?.chartData}
            loading={loading}
            onExport={handleChartExport}
          />
        </div>
      </div>

      {/* Records Tab Content */}
      <div style={{ display: activeTab === 'records' ? 'block' : 'none' }}>
        <ProductionMetrics 
          metricsData={dashboardData?.metricsData}
          loading={loading}
          onView={handleViewRecord}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
          onExport={handleExportData}
        />
      </div>

      {/* Sections Tab Content - Existing Production Lines Section */}
      <div style={{ display: activeTab === 'sections' ? 'block' : 'none' }}>
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div>
              <h2 style={{ 
                margin: "0 0 8px 0", 
                fontSize: "22px", 
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <FiActivity style={{ color: "#10b981" }} />
                Production Lines Status
              </h2>
              <p style={{ margin: "0", color: "#64748b", fontSize: "15px" }}>
                6 active production lines • Real-time monitoring
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={handleOpenProductionSections}
                style={{
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.2s ease"
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
                <FiFolder /> All Sections
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: "transparent",
                  color: "#64748b",
                  border: "2px solid #e2e8f0",
                  padding: "12px 24px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f8fafc";
                  e.target.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.borderColor = "#e2e8f0";
                }}
              >
                <FiHome /> Main Dashboard
              </button>
            </div>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
            gap: "20px" 
          }}>
            {dashboardData?.productionLines.map(line => (
              <div 
                key={line.id} 
                style={{
                  padding: "24px",
                  background: line.status === "Running" ? "#f0fdf4" : 
                             line.status === "Maintenance" ? "#fffbeb" : "#fef2f2",
                  borderRadius: "12px",
                  border: `2px solid ${line.status === "Running" ? "#10b981" : 
                          line.status === "Maintenance" ? "#f59e0b" : "#ef4444"}`,
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => handleOpenSection(line.section)}
              >
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  marginBottom: "20px" 
                }}>
                  <div>
                    <h3 style={{ 
                      margin: "0 0 8px 0", 
                      fontSize: "18px", 
                      color: "#1e293b",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}>
                      <div style={{
                        width: "12px",
                        height: "12px",
                        background: line.status === "Running" ? "#10b981" : 
                                   line.status === "Maintenance" ? "#f59e0b" : "#ef4444",
                        borderRadius: "50%"
                      }} />
                      {line.name}
                    </h3>
                    <p style={{ 
                      margin: "0", 
                      fontSize: "13px", 
                      color: "#64748b",
                      fontFamily: "monospace"
                    }}>
                      Line ID: PROD-{line.id.toString().padStart(3, '0')}
                    </p>
                  </div>
                  <span style={{
                    padding: "6px 16px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "600",
                    background: line.status === "Running" ? "#d1fae5" : 
                               line.status === "Maintenance" ? "#fef3c7" : "#fee2e2",
                    color: line.status === "Running" ? "#059669" : 
                          line.status === "Maintenance" ? "#d97706" : "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      background: line.status === "Running" ? "#059669" : 
                                 line.status === "Maintenance" ? "#d97706" : "#dc2626",
                      borderRadius: "50%",
                      animation: line.status === "Running" ? "pulse 1.5s infinite" : "none"
                    }} />
                    {line.status}
                  </span>
                </div>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "20px",
                  marginBottom: "20px"
                }}>
                  <div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#64748b", 
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <FiPackage size={16} /> Output
                    </div>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "#1e293b",
                      display: "flex",
                      alignItems: "baseline"
                    }}>
                      {line.output}
                      <span style={{ 
                        fontSize: "15px", 
                        fontWeight: "normal", 
                        color: "#64748b",
                        marginLeft: "6px"
                      }}>
                        units
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#64748b", 
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      <FiTrendingUp size={16} /> Efficiency
                    </div>
                    <div style={{ 
                      fontSize: "24px", 
                      fontWeight: "700", 
                      color: "#10b981" 
                    }}>
                      {line.efficiency}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "18px",
                  borderTop: "1px solid rgba(0, 0, 0, 0.1)"
                }}>
                  <span style={{
                    fontSize: "13px",
                    color: "#64748b",
                    fontStyle: "italic"
                  }}>
                    Click to view details
                  </span>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#3b82f6",
                    fontWeight: "500"
                  }}>
                    <span>View Section</span>
                    <FiArrowRight />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Production Report Card */}
      <div style={{
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        padding: "25px",
        borderRadius: "12px",
        border: "2px solid #4f46e5",
        marginTop: "20px",
        marginBottom: "20px",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%"
        }}></div>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          zIndex: 1
        }}>
          <div>
            <h3 style={{ 
              margin: "0 0 10px 0", 
              fontSize: "22px", 
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <FiBarChart2 size={24} />
              Daily Production Report
            </h3>
            <p style={{ 
              margin: "0", 
              opacity: "0.9",
              fontSize: "15px",
              lineHeight: "1.5"
            }}>
              View detailed daily production analysis, section-wise performance, 
              material consumption, and generate exportable reports.
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              to="/production-reports/daily"
              style={{
                background: "white",
                color: "#4f46e5",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.2s",
                textDecoration: "none",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-3px)";
                e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
              }}
            >
              <FiBarChart2 size={18} />
              View Full Report
            </Link>
            
            <button
              onClick={() => {
                // Quick view functionality
                console.log("Opening quick report view");
                navigate("/production-reports/daily");
              }}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.3)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <FiDownload size={18} />
              Export PDF
            </button>
          </div>
        </div>
        
        {/* Quick Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "20px",
          marginTop: "25px",
          position: "relative",
          zIndex: 1
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "15px",
            borderRadius: "8px",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ fontSize: "14px", opacity: "0.8", marginBottom: "8px" }}>
              Today's Output
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {dashboardData?.stats[0]?.value || "2,850"}
            </div>
          </div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "15px",
            borderRadius: "8px",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ fontSize: "14px", opacity: "0.8", marginBottom: "8px" }}>
              Efficiency
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#a5b4fc" }}>
              {dashboardData?.stats[1]?.value || "92%"}
            </div>
          </div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "15px",
            borderRadius: "8px",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ fontSize: "14px", opacity: "0.8", marginBottom: "8px" }}>
              Active Sections
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {dashboardData?.productionLines?.length || "6"}
            </div>
          </div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            padding: "15px",
            borderRadius: "8px",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ fontSize: "14px", opacity: "0.8", marginBottom: "8px" }}>
              Report Date
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
        padding: "25px",
        borderRadius: "12px",
        border: "2px solid #e2e8f0",
        marginTop: "20px"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "20px", 
          marginBottom: "20px" 
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "28px"
          }}>
            <FiFolder />
          </div>
          <div>
            <h3 style={{ 
              margin: "0 0 8px 0", 
              fontSize: "20px", 
              color: "#1e293b" 
            }}>
              Production Dashboard Overview
            </h3>
            <p style={{ 
              margin: "0", 
              color: "#64748b", 
              fontSize: "15px",
              lineHeight: "1.5"
            }}>
              This dashboard provides comprehensive monitoring of all production operations. 
              Use the tabs above to navigate between different views: Overview, Analytics, Records, and Sections.
            </p>
          </div>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px",
          marginTop: "25px"
        }}>
          <div style={{
            background: "white",
            padding: "18px",
            borderRadius: "10px",
            borderLeft: "4px solid #3b82f6",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              Current View
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              color: "#1e293b",
              textTransform: "capitalize"
            }}>
              {activeTab}
            </div>
          </div>
          
          <div style={{
            background: "white",
            padding: "18px",
            borderRadius: "10px",
            borderLeft: "4px solid #10b981",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              Total Records
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              color: "#1e293b"
            }}>
              {dashboardData?.metricsData?.summary.totalRecords || 0} records
            </div>
          </div>
          
          <div style={{
            background: "white",
            padding: "18px",
            borderRadius: "10px",
            borderLeft: "4px solid #8b5cf6",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              Last Updated
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              color: "#1e293b"
            }}>
              {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          
          <div style={{
            background: "white",
            padding: "18px",
            borderRadius: "10px",
            borderLeft: "4px solid #f59e0b",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              Auto Refresh
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              color: "#1e293b"
            }}>
              Every 5 minutes
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ProductionDashboard;