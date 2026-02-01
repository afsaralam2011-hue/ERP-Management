// src/components/departments/Production/DashboardComponents/ProductionCharts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiDownload,
  FiRefreshCw,
  FiMaximize2,
  FiMinimize2,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  FaIndustry, 
  FaCogs, 
  FaShieldAlt, 
  FaCut, 
  FaBoxOpen, 
  FaWarehouse,
  FaDatabase,
  FaSpinner
} from 'react-icons/fa';
import { supabase } from '../../../../supabaseClient';

const ProductionCharts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('production');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Flatting Section');
  const [chartData, setChartData] = useState(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Departments array from ProductionMetrics.jsx with table names
  const departments = [
    { 
      id: 1, 
      name: 'Raw Material Section', 
      icon: <FaWarehouse />, 
      color: '#f59e0b', 
      tableName: 'raw_material_log',
      unit: 'KG'
    },
    { 
      id: 2, 
      name: 'Flatting Section', 
      icon: <FaIndustry />, 
      color: '#3b82f6', 
      tableName: 'flatteningsection',
      unit: 'KG'
    },
    { 
      id: 3, 
      name: 'Spiral Section', 
      icon: <FaCogs />, 
      color: '#8b5cf6', 
      tableName: 'spiralsection',
      unit: 'Meter'
    },
    { 
      id: 4, 
      name: 'PVC Coating Section', 
      icon: <FaShieldAlt />, 
      color: '#10b981', 
      tableName: 'pvcsection',
      unit: 'Meter'
    },
    { 
      id: 5, 
      name: 'Cutting & Packing Section', 
      icon: <FaCut />, 
      color: '#ec4899', 
      tableName: 'cuttingpacking',
      unit: 'Meter'
    },
    { 
      id: 6, 
      name: 'Finishing Goods Section', 
      icon: <FaBoxOpen />, 
      color: '#06b6d4', 
      tableName: 'finishinggoods',
      unit: 'Meter'
    }
  ];

  const getCurrentDepartment = useCallback(() => {
    return departments.find(dept => dept.name === selectedDepartment);
  }, [selectedDepartment]);

  const getLast7Days = useCallback(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: dayNames[date.getDay()],
        production: 0,
        target: 0
      });
    }
    
    return days;
  }, []);

  const calculateChartData = useCallback((records, department) => {
    if (!records || records.length === 0) {
      return generateDefaultChartData(department);
    }

    // Get last 7 days
    const last7Days = getLast7Days();
    
    // Group records by date
    const dailyMap = new Map();
    const efficiencyMap = new Map();
    const sectionMap = new Map();

    records.forEach(record => {
      if (!record.created_at) return;
      
      const date = new Date(record.created_at);
      const dateKey = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const production = parseFloat(record.production_quantity) || parseFloat(record.production) || 0;
      const target = parseFloat(record.target_qty) || parseFloat(record.target) || 0;
      const section = record.section_name || record.machine_no || record.machine_id || 'Unknown';
      
      // Update daily data
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { 
          day: dayName, 
          production: 0, 
          target: 0,
          date: dateKey
        });
      }
      const dayData = dailyMap.get(dateKey);
      dayData.production += production;
      dayData.target += target;
      
      // Update efficiency distribution
      if (target > 0) {
        const efficiency = (production / target) * 100;
        let efficiencyRange;
        
        if (efficiency >= 90) efficiencyRange = 'Excellent (90-100%)';
        else if (efficiency >= 80) efficiencyRange = 'Good (80-89%)';
        else if (efficiency >= 70) efficiencyRange = 'Average (70-79%)';
        else efficiencyRange = 'Poor (<70%)';
        
        if (!efficiencyMap.has(efficiencyRange)) {
          efficiencyMap.set(efficiencyRange, { count: 0, color: '' });
        }
        const rangeData = efficiencyMap.get(efficiencyRange);
        rangeData.count++;
      }
      
      // Update section data
      if (!sectionMap.has(section)) {
        sectionMap.set(section, { 
          production: 0, 
          target: 0,
          count: 0 
        });
      }
      const sectionData = sectionMap.get(section);
      sectionData.production += production;
      sectionData.target += target;
      sectionData.count++;
    });

    // Prepare production by day data
    const productionByDay = last7Days.map(day => {
      const dayData = dailyMap.get(day.date);
      if (dayData) {
        return {
          day: day.day,
          production: dayData.production,
          target: dayData.target || 1000, // Default target if not specified
          date: day.date
        };
      }
      return {
        day: day.day,
        production: 0,
        target: 1000, // Default target
        date: day.date
      };
    });

    // Prepare efficiency distribution
    const totalEntries = Array.from(efficiencyMap.values()).reduce((sum, data) => sum + data.count, 0);
    const efficiencyDistribution = [
      { 
        range: 'Excellent (90-100%)', 
        value: totalEntries > 0 ? Math.round((efficiencyMap.get('Excellent (90-100%)')?.count || 0) / totalEntries * 100) : 0,
        color: '#10b981' 
      },
      { 
        range: 'Good (80-89%)', 
        value: totalEntries > 0 ? Math.round((efficiencyMap.get('Good (80-89%)')?.count || 0) / totalEntries * 100) : 0,
        color: '#3b82f6' 
      },
      { 
        range: 'Average (70-79%)', 
        value: totalEntries > 0 ? Math.round((efficiencyMap.get('Average (70-79%)')?.count || 0) / totalEntries * 100) : 0,
        color: '#f59e0b' 
      },
      { 
        range: 'Poor (<70%)', 
        value: totalEntries > 0 ? Math.round((efficiencyMap.get('Poor (<70%)')?.count || 0) / totalEntries * 100) : 0,
        color: '#ef4444' 
      }
    ];

    // Calculate average efficiency for pie chart center
    const avgEfficiency = productionByDay.length > 0 ? 
      productionByDay.reduce((sum, day) => {
        const dayEfficiency = day.target > 0 ? (day.production / day.target) * 100 : 0;
        return sum + dayEfficiency;
      }, 0) / productionByDay.length : 0;

    // Prepare section performance data
    const sectionPerformance = Array.from(sectionMap.entries())
      .map(([section, data]) => {
        const efficiency = data.target > 0 ? (data.production / data.target) * 100 : 0;
        return {
          section,
          efficiency: efficiency.toFixed(1),
          production: data.production,
          target: data.target,
          entries: data.count
        };
      })
      .sort((a, b) => parseFloat(b.efficiency) - parseFloat(a.efficiency))
      .slice(0, 6); // Top 6 sections

    return {
      productionByDay,
      efficiencyDistribution,
      sectionPerformance,
      avgEfficiency: avgEfficiency.toFixed(1),
      totalRecords: records.length,
      department: department.name,
      unit: department.unit,
      hasData: true
    };
  }, [getLast7Days]);

  const generateDefaultChartData = useCallback((department) => {
    const unit = department?.unit || 'Unit';
    const departmentName = department?.name || 'Department';
    
    return {
      productionByDay: [
        { day: 'Mon', production: 0, target: 1000, date: '' },
        { day: 'Tue', production: 0, target: 1000, date: '' },
        { day: 'Wed', production: 0, target: 1000, date: '' },
        { day: 'Thu', production: 0, target: 1000, date: '' },
        { day: 'Fri', production: 0, target: 1000, date: '' },
        { day: 'Sat', production: 0, target: 1000, date: '' },
        { day: 'Sun', production: 0, target: 1000, date: '' }
      ],
      efficiencyDistribution: [
        { range: 'Excellent (90-100%)', value: 0, color: '#10b981' },
        { range: 'Good (80-89%)', value: 0, color: '#3b82f6' },
        { range: 'Average (70-79%)', value: 0, color: '#f59e0b' },
        { range: 'Poor (<70%)', value: 0, color: '#ef4444' }
      ],
      sectionPerformance: [],
      avgEfficiency: '0',
      totalRecords: 0,
      department: departmentName,
      unit: unit,
      hasData: false
    };
  }, []);

  const fetchChartData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase) {
        setError('Supabase client not configured');
        setIsSupabaseConnected(false);
        setChartData(generateDefaultChartData(getCurrentDepartment()));
        setLoading(false);
        return;
      }
      
      setIsSupabaseConnected(true);
      
      const currentDept = getCurrentDepartment();
      const tableName = currentDept?.tableName;
      
      if (!tableName) {
        setError('No table name found for department');
        setChartData(generateDefaultChartData(currentDept));
        setLoading(false);
        return;
      }
      
      // Fetch last 7 days of data
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const startDate = lastWeek.toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];
      
      const { data: chartRecords, error: chartError } = await supabase
        .from(tableName)
        .select('*')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false });
      
      if (chartError) {
        console.error('Error fetching chart data:', chartError);
        setError('Failed to fetch chart data');
        setChartData(generateDefaultChartData(currentDept));
        setLoading(false);
        return;
      }
      
      if (!chartRecords || chartRecords.length === 0) {
        setChartData(generateDefaultChartData(currentDept));
      } else {
        const calculatedData = calculateChartData(chartRecords, currentDept);
        setChartData(calculatedData);
      }
      
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('Error in fetchChartData:', err);
      setError('An unexpected error occurred');
      setChartData(generateDefaultChartData(getCurrentDepartment()));
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment, getCurrentDepartment, calculateChartData, generateDefaultChartData]);

  const handleExport = () => {
    if (!chartData || !chartData.hasData) {
      alert('No data available to export');
      return;
    }
    
    const exportData = {
      timestamp: new Date().toISOString(),
      department: chartData.department,
      chartType: activeChart,
      chartData: chartData,
      unit: chartData.unit
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `production-charts-${chartData.department}-${activeChart}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleRefresh = () => {
    fetchChartData();
  };

  const handleDepartmentChange = (deptName) => {
    setSelectedDepartment(deptName);
  };

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const currentDept = getCurrentDepartment();
  const data = chartData || generateDefaultChartData(currentDept);

  const maxProduction = Math.max(...data.productionByDay.map(d => d.production));
  const maxTarget = Math.max(...data.productionByDay.map(d => d.target));
  const chartMax = Math.max(maxProduction, maxTarget) || 1000;

  if (loading) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '25px',
        minHeight: '400px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <div style={{
            height: '24px',
            width: '200px',
            background: '#f1f5f9',
            borderRadius: '6px',
            animation: 'pulse 1.5s infinite'
          }} />
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                style={{
                  height: '32px',
                  width: '80px',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            ))}
          </div>
        </div>
        <div style={{
          height: '300px',
          background: '#f1f5f9',
          borderRadius: '8px',
          animation: 'pulse 1.5s infinite'
        }} />
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '25px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '20px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#fee2e2',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626'
              }}>
                <FiAlertCircle size={20} />
              </div>
              Production Analytics Charts
            </h3>
            <p style={{
              margin: '0',
              color: '#64748b',
              fontSize: '14px',
              marginLeft: '52px'
            }}>
              Failed to load chart data
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiRefreshCw size={14} />
            Retry
          </button>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#fee2e2',
            borderRadius: '50%',
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
            fontSize: '28px'
          }}>
            <FiAlertCircle />
          </div>
          <p style={{ color: '#dc2626', marginBottom: '10px', fontWeight: '600' }}>
            {error}
          </p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Please check your database connection and try again.
          </p>
        </div>
      </div>
    );
  }

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    return lastRefresh.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      background: 'white',
      padding: isExpanded ? '40px' : '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
      marginBottom: '25px',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: isExpanded ? '24px' : '20px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: isExpanded ? '50px' : '40px',
              height: isExpanded ? '50px' : '40px',
              background: `linear-gradient(135deg, ${currentDept?.color || '#3b82f6'} 0%, ${currentDept?.color || '#1d4ed8'}80 100%)`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              {currentDept?.icon || <FiBarChart2 size={isExpanded ? 24 : 20} />}
            </div>
            Production Analytics Charts
            {!isSupabaseConnected && (
              <span style={{
                fontSize: '12px',
                background: '#fee2e2',
                color: '#dc2626',
                padding: '4px 8px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginLeft: '10px'
              }}>
                <FaDatabase size={10} /> Offline
              </span>
            )}
          </h3>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: isExpanded ? '16px' : '14px',
            marginLeft: isExpanded ? '62px' : '52px'
          }}>
            {data.hasData ? 
              `Visual analysis of ${selectedDepartment} performance (Last 7 days)` : 
              `No chart data available for ${selectedDepartment}`
            }
            {lastRefresh && data.hasData && (
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#94a3b8' }}>
                • Updated: {formatLastRefresh()}
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Department Selection */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '6px',
            background: '#f8fafc',
            padding: '4px',
            borderRadius: '8px'
          }}>
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentChange(dept.name)}
                style={{
                  background: selectedDepartment === dept.name ? 
                    `${dept.color}15` : 'transparent',
                  color: selectedDepartment === dept.name ? dept.color : '#64748b',
                  border: `1px solid ${selectedDepartment === dept.name ? dept.color : '#e2e8f0'}`,
                  padding: '4px 8px',
                  borderRadius: '15px',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedDepartment !== dept.name) {
                    e.target.style.background = '#ffffff';
                    e.target.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDepartment !== dept.name) {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                {dept.icon}
                {dept.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Chart Type Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveChart('production')}
              style={{
                background: activeChart === 'production' ? (currentDept?.color || '#3b82f6') : 'transparent',
                color: activeChart === 'production' ? 'white' : '#64748b',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FiBarChart2 size={16} />
              Production
            </button>
            <button
              onClick={() => setActiveChart('efficiency')}
              style={{
                background: activeChart === 'efficiency' ? '#10b981' : 'transparent',
                color: activeChart === 'efficiency' ? 'white' : '#64748b',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FiPieChart size={16} />
              Efficiency
            </button>
            <button
              onClick={() => setActiveChart('sections')}
              style={{
                background: activeChart === 'sections' ? '#8b5cf6' : 'transparent',
                color: activeChart === 'sections' ? 'white' : '#64748b',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FiTrendingUp size={16} />
              Sections
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExport}
              disabled={!data.hasData}
              style={{
                background: !data.hasData ? '#e2e8f0' : 'transparent',
                color: !data.hasData ? '#94a3b8' : '#64748b',
                border: `1px solid ${!data.hasData ? '#e2e8f0' : '#e2e8f0'}`,
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: data.hasData ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                opacity: data.hasData ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (data.hasData) {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                if (data.hasData) {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#e2e8f0';
                }
              }}
            >
              <FiDownload size={16} />
              Export
            </button>
            
            <button
              onClick={handleRefresh}
              style={{
                background: currentDept?.color || '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
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
                e.target.style.background = currentDept?.color ? `${currentDept.color}cc` : '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = currentDept?.color || '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isExpanded ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isExpanded ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: isExpanded ? '40px' : '30px',
        marginTop: '20px',
        opacity: data.hasData ? 1 : 0.7
      }}>
        {/* Production Bar Chart */}
        {activeChart === 'production' && (
          <div style={{
            padding: isExpanded ? '30px' : '20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h4 style={{
                margin: '0',
                fontSize: '18px',
                color: data.hasData ? '#1e293b' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FiBarChart2 size={18} />
                Daily Production vs Target
              </h4>
              {!data.hasData && (
                <span style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  fontStyle: 'italic'
                }}>
                  No production data available
                </span>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              height: isExpanded ? '350px' : '250px',
              gap: '30px',
              padding: '20px'
            }}>
              {data.productionByDay.map((day, index) => (
                <div 
                  key={index}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    gap: '10px'
                  }}>
                    {/* Target Bar */}
                    <div style={{
                      width: '30px',
                      height: `${(day.target / chartMax) * (isExpanded ? 250 : 180)}px`,
                      background: '#e2e8f0',
                      borderRadius: '6px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        whiteSpace: 'nowrap'
                      }}>
                        Target: {day.target.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Production Bar */}
                    <div style={{
                      width: '30px',
                      height: `${(day.production / chartMax) * (isExpanded ? 250 : 180)}px`,
                      background: day.production >= day.target ? 
                                'linear-gradient(to top, #10b981, #34d399)' :
                                day.production > 0 ?
                                'linear-gradient(to top, #ef4444, #f87171)' :
                                '#e2e8f0',
                      borderRadius: '6px 6px 0 0',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: data.hasData ? '#1e293b' : '#94a3b8',
                        whiteSpace: 'nowrap'
                      }}>
                        {day.production.toLocaleString()} {data.unit}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    marginTop: '15px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: data.hasData ? '#475569' : '#cbd5e1'
                  }}>
                    {day.day}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: data.hasData ? '#94a3b8' : '#cbd5e1',
                    marginTop: '4px'
                  }}>
                    {day.target > 0 ? `${((day.production / day.target) * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(to top, #10b981, #34d399)',
                  borderRadius: '4px'
                }} />
                <span style={{ fontSize: '14px', color: '#64748b' }}>Production ({data.unit})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#e2e8f0',
                  borderRadius: '4px'
                }} />
                <span style={{ fontSize: '14px', color: '#64748b' }}>Target ({data.unit})</span>
              </div>
            </div>
          </div>
        )}

        {/* Efficiency Pie Chart */}
        {activeChart === 'efficiency' && (
          <div style={{
            padding: isExpanded ? '30px' : '20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              marginBottom: '20px'
            }}>
              <h4 style={{
                margin: '0',
                fontSize: '18px',
                color: data.hasData ? '#1e293b' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FiPieChart size={18} />
                Efficiency Distribution
              </h4>
              {!data.hasData && (
                <span style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  fontStyle: 'italic'
                }}>
                  No efficiency data available
                </span>
              )}
            </div>
            
            <div style={{
              width: isExpanded ? '300px' : '250px',
              height: isExpanded ? '300px' : '250px',
              borderRadius: '50%',
              background: data.hasData ? `conic-gradient(
                ${data.efficiencyDistribution[0].color} 0% ${data.efficiencyDistribution[0].value}%,
                ${data.efficiencyDistribution[1].color} ${data.efficiencyDistribution[0].value}% ${data.efficiencyDistribution[0].value + data.efficiencyDistribution[1].value}%,
                ${data.efficiencyDistribution[2].color} ${data.efficiencyDistribution[0].value + data.efficiencyDistribution[1].value}% ${data.efficiencyDistribution[0].value + data.efficiencyDistribution[1].value + data.efficiencyDistribution[2].value}%,
                ${data.efficiencyDistribution[3].color} ${data.efficiencyDistribution[0].value + data.efficiencyDistribution[1].value + data.efficiencyDistribution[2].value}% 100%
              )` : '#e2e8f0',
              position: 'relative',
              marginBottom: '30px'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isExpanded ? '150px' : '120px',
                height: isExpanded ? '150px' : '120px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  fontSize: isExpanded ? '32px' : '24px',
                  fontWeight: '700',
                  color: data.hasData ? '#1e293b' : '#cbd5e1'
                }}>
                  {data.avgEfficiency}%
                </div>
                <div style={{
                  fontSize: isExpanded ? '14px' : '12px',
                  color: data.hasData ? '#64748b' : '#cbd5e1'
                }}>
                  Avg Efficiency
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              width: '100%',
              maxWidth: '600px'
            }}>
              {data.efficiencyDistribution.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    opacity: data.hasData ? 1 : 0.7
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: data.hasData ? item.color : '#cbd5e1',
                    borderRadius: '4px'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: data.hasData ? '#1e293b' : '#cbd5e1'
                    }}>
                      {item.range}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: data.hasData ? '#64748b' : '#cbd5e1'
                    }}>
                      {item.value}% of entries
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: data.hasData ? item.color : '#cbd5e1'
                  }}>
                    {item.value}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections Performance Chart */}
        {activeChart === 'sections' && (
          <div style={{
            padding: isExpanded ? '30px' : '20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h4 style={{
                margin: '0',
                fontSize: '18px',
                color: data.hasData ? '#1e293b' : '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FiTrendingUp size={18} />
                Section Performance Comparison
                {data.sectionPerformance.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    ({data.sectionPerformance.length} sections)
                  </span>
                )}
              </h4>
              {!data.hasData && (
                <span style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  fontStyle: 'italic'
                }}>
                  No section data available
                </span>
              )}
            </div>
            
            {data.sectionPerformance.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {data.sectionPerformance.map((section, index) => (
                  <div 
                    key={index}
                    style={{
                      background: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (data.hasData) {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (data.hasData) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}>
                        {section.section}
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: parseFloat(section.efficiency) >= 90 ? '#10b981' : 
                               parseFloat(section.efficiency) >= 85 ? '#f59e0b' : '#ef4444'
                      }}>
                        {section.efficiency}%
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          height: '10px',
                          background: '#e2e8f0',
                          borderRadius: '5px',
                          overflow: 'hidden'
                        }}>
                          <div 
                            style={{
                              width: `${section.efficiency}%`,
                              height: '100%',
                              background: parseFloat(section.efficiency) >= 90 ? '#10b981' : 
                                         parseFloat(section.efficiency) >= 85 ? '#f59e0b' : '#ef4444',
                              borderRadius: '5px'
                            }}
                          />
                        </div>
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b',
                        minWidth: '80px',
                        textAlign: 'right'
                      }}>
                        {section.production.toLocaleString()} {data.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f1f5f9',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1'
              }}>
                <p style={{ color: '#64748b', marginBottom: '10px' }}>
                  No section performance data available
                </p>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  Production data may not have section information
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Source Info */}
      <div style={{
        marginTop: '25px',
        padding: '15px',
        background: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#64748b',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaDatabase size={14} />
          <div>
            <span style={{ fontWeight: '600' }}>Data Source: </span>
            <span>{currentDept?.tableName}</span>
            <span style={{ marginLeft: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Records: </span>
              <strong>{data.totalRecords}</strong>
            </span>
            <span style={{ marginLeft: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Unit: </span>
              <strong>{data.unit}</strong>
            </span>
          </div>
        </div>
        
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          {data.hasData ? 
            `Showing ${data.productionByDay.length} days of data` : 
            'Using default visualization (no data available)'
          }
        </div>
      </div>
    </div>
  );
};

export default ProductionCharts;