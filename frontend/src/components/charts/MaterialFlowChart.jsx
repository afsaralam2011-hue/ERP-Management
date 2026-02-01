// components/charts/MaterialFlowChart.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, FiTrendingDown, FiActivity, 
  FiFilter, FiCalendar, FiDownload
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { supabase } from '../../supabaseClient';
import './MaterialFlowChart.css';

const MaterialFlowChart = ({ dateRange, materialType }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'area'
  const [timeRange, setTimeRange] = useState('daily'); // 'daily', 'weekly', 'monthly'
  
  // CSS Variables سے رنگ حاصل کرنے کے لیے
  const getThemeColor = (colorName) => {
    if (typeof document === 'undefined') return '#000000';
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${colorName}`)
      .trim();
    return color || '#000000';
  };

  // Theme colors
  const themeColors = {
    background: getThemeColor('background'),
    surface: getThemeColor('surface'),
    textPrimary: getThemeColor('text-primary'),
    textSecondary: getThemeColor('text-secondary'),
    border: getThemeColor('border'),
    primary: getThemeColor('primary'),
    success: getThemeColor('success'),
    warning: getThemeColor('warning'),
    error: getThemeColor('error'),
    info: getThemeColor('info'),
    production: '#3498db', // Production color
    consumption: '#e74c3c', // Consumption color
    balance: '#2ecc71',     // Balance color
    efficiency: '#9b59b6'   // Efficiency color
  };

  // Check if dark mode
  const isDarkMode = () => {
    if (typeof document === 'undefined') return false;
    return document.body.classList.contains('dark-mode') || 
           document.body.classList.contains('theme-dark');
  };

  // Chart styling based on theme
  const chartStyles = {
    container: {
      background: themeColors.surface,
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${themeColors.border}`,
      boxShadow: isDarkMode() ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease'
    },
    header: {
      color: themeColors.textPrimary,
      borderBottom: `1px solid ${themeColors.border}`,
      paddingBottom: '15px',
      marginBottom: '20px'
    },
    subtitle: {
      color: themeColors.textSecondary,
      fontSize: '14px',
      marginTop: '5px'
    },
    controlGroup: {
      background: themeColors.background,
      border: `1px solid ${themeColors.border}`,
      borderRadius: '6px'
    },
    controlSelect: {
      background: themeColors.background,
      color: themeColors.textPrimary,
      border: `1px solid ${themeColors.border}`,
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    statCard: {
      background: themeColors.surface,
      border: `1px solid ${themeColors.border}`,
      borderRadius: '10px',
      padding: '15px',
      transition: 'all 0.3s ease'
    },
    statValue: {
      color: themeColors.textPrimary,
      fontSize: '24px',
      fontWeight: '700'
    },
    statLabel: {
      color: themeColors.textSecondary,
      fontSize: '13px',
      marginBottom: '5px'
    },
    button: {
      background: themeColors.primary,
      color: themeColors.textPrimary,
      border: `1px solid ${themeColors.primary}`,
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    chartGrid: {
      stroke: isDarkMode() ? '#333333' : '#e0e0e0'
    },
    axis: {
      stroke: isDarkMode() ? '#7f8c8d' : '#7f8c8d',
      fontSize: '12px'
    },
    tooltip: {
      background: themeColors.surface,
      border: `1px solid ${themeColors.border}`,
      color: themeColors.textPrimary,
      borderRadius: '8px',
      padding: '12px'
    }
  };

  useEffect(() => {
    loadChartData();
  }, [dateRange, materialType, timeRange]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      
      // Build query based on time range
      let dateField = 'created_at::date';
      let groupBy = 'DATE(created_at)';
      
      if (timeRange === 'weekly') {
        dateField = "DATE_TRUNC('week', created_at)::date";
        groupBy = "DATE_TRUNC('week', created_at)";
      } else if (timeRange === 'monthly') {
        dateField = "DATE_TRUNC('month', created_at)::date";
        groupBy = "DATE_TRUNC('month', created_at)";
      }

      // Query for production data (Flattening)
      const { data: productionData } = await supabase
        .from('inventory_ledger')
        .select(`
          ${dateField} as date,
          SUM(quantity_kg) as production
        `)
        .eq('transaction_type', 'PRODUCTION')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .groupBy(groupBy)
        .order('date', { ascending: true });

      // Query for consumption data (Spiral)
      const { data: consumptionData } = await supabase
        .from('inventory_ledger')
        .select(`
          ${dateField} as date,
          SUM(quantity_kg) as consumption
        `)
        .eq('transaction_type', 'CONSUMPTION')
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .groupBy(groupBy)
        .order('date', { ascending: true });

      // Combine data
      const productionMap = new Map();
      const consumptionMap = new Map();
      
      productionData?.forEach(item => {
        productionMap.set(item.date, item.production || 0);
      });
      
      consumptionData?.forEach(item => {
        consumptionMap.set(item.date, item.consumption || 0);
      });
      
      // Get all unique dates
      const allDates = new Set([
        ...Array.from(productionMap.keys()),
        ...Array.from(consumptionMap.keys())
      ]);
      
      // Format data for chart
      const formattedData = Array.from(allDates)
        .sort()
        .map(date => {
          const production = productionMap.get(date) || 0;
          const consumption = consumptionMap.get(date) || 0;
          const balance = production - consumption;
          const efficiency = production > 0 ? (consumption / production) * 100 : 0;
          
          return {
            date: formatDate(date, timeRange),
            rawDate: date,
            production: parseFloat(production.toFixed(2)),
            consumption: parseFloat(consumption.toFixed(2)),
            balance: parseFloat(balance.toFixed(2)),
            efficiency: parseFloat(efficiency.toFixed(2))
          };
        });
      
      setChartData(formattedData);
      
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString, range) => {
    const date = new Date(dateString);
    
    switch (range) {
      case 'daily':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      case 'weekly':
        const weekStart = new Date(date);
        const weekEnd = new Date(date);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.getDate()}-${weekEnd.getDate()} ${weekStart.toLocaleDateString('en-US', { month: 'short' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
      default:
        return date.toLocaleDateString();
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: themeColors.surface,
          border: `1px solid ${themeColors.border}`,
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: themeColors.textPrimary,
          maxWidth: '300px'
        }}>
          <div style={{
            fontWeight: '600',
            marginBottom: '8px',
            borderBottom: `1px solid ${themeColors.border}`,
            paddingBottom: '8px',
            color: themeColors.textPrimary
          }}>
            <strong>{label}</strong>
          </div>
          <div style={{ fontSize: '14px' }}>
            {payload.map((entry, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <span 
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: entry.color
                  }}
                />
                <span style={{
                  fontWeight: '500',
                  color: themeColors.textSecondary,
                  minWidth: '120px'
                }}>
                  {entry.name}:
                </span>
                <span style={{
                  fontWeight: '600',
                  color: themeColors.textPrimary
                }}>
                  {entry.value.toLocaleString()}
                  {entry.name.includes('Efficiency') ? '%' : ' Kg'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const exportChartData = () => {
    const csvContent = [
      ['Date', 'Production (Kg)', 'Consumption (Kg)', 'Balance (Kg)', 'Efficiency (%)'],
      ...chartData.map(item => [
        item.date,
        item.production,
        item.consumption,
        item.balance,
        item.efficiency
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-flow-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const calculateStats = () => {
    if (chartData.length === 0) return null;
    
    const totalProduction = chartData.reduce((sum, item) => sum + item.production, 0);
    const totalConsumption = chartData.reduce((sum, item) => sum + item.consumption, 0);
    const avgEfficiency = chartData.reduce((sum, item) => sum + item.efficiency, 0) / chartData.length;
    
    return {
      totalProduction,
      totalConsumption,
      avgEfficiency: parseFloat(avgEfficiency.toFixed(2)),
      netBalance: totalProduction - totalConsumption,
      items: chartData.length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        background: themeColors.surface,
        borderRadius: '12px',
        border: `1px solid ${themeColors.border}`,
        padding: '40px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `3px solid ${themeColors.border}`,
          borderTop: `3px solid ${themeColors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{
          color: themeColors.textSecondary,
          fontSize: '16px',
          margin: 0
        }}>
          Loading chart data...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="material-flow-chart" style={chartStyles.container}>
      {/* چارٹ ہیڈر */}
      <div className="chart-header" style={chartStyles.header}>
        <div className="header-left">
          <h3 style={{ 
            color: themeColors.textPrimary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '20px'
          }}>
            <FiActivity style={{ color: themeColors.primary }} />
            Material Flow Analysis
          </h3>
          <p className="chart-subtitle" style={chartStyles.subtitle}>
            Production vs Consumption over time
          </p>
        </div>
        
        <div className="header-right">
          <div className="chart-controls" style={{
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div className="control-group" style={chartStyles.controlGroup}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: themeColors.textSecondary,
                marginRight: '8px'
              }}>
                <FiCalendar /> Time Range:
              </label>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={chartStyles.controlSelect}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="control-group" style={chartStyles.controlGroup}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: themeColors.textSecondary,
                marginRight: '8px'
              }}>
                <FiFilter /> Chart Type:
              </label>
              <select 
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                style={chartStyles.controlSelect}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
              </select>
            </div>
            
            <button 
              className="btn btn-export-chart"
              onClick={exportChartData}
              disabled={chartData.length === 0}
              style={{
                ...chartStyles.button,
                opacity: chartData.length === 0 ? 0.6 : 1,
                cursor: chartData.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <FiDownload /> Export
            </button>
          </div>
        </div>
      </div>

      {/* اسٹیٹس کارڈز */}
      {stats && (
        <div className="chart-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div className="stat-card" style={chartStyles.statCard}>
            <div className="stat-icon production" style={{
              width: '40px',
              height: '40px',
              background: '#3498db20',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3498db',
              fontSize: '20px',
              marginBottom: '15px'
            }}>
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-label" style={chartStyles.statLabel}>
                Total Production
              </div>
              <div className="stat-value" style={chartStyles.statValue}>
                {stats.totalProduction.toLocaleString()} Kg
              </div>
              <div className="stat-trend" style={{
                color: themeColors.textSecondary,
                fontSize: '12px',
                marginTop: '5px'
              }}>
                From Flattening Section
              </div>
            </div>
          </div>
          
          <div className="stat-card" style={chartStyles.statCard}>
            <div className="stat-icon consumption" style={{
              width: '40px',
              height: '40px',
              background: '#e74c3c20',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e74c3c',
              fontSize: '20px',
              marginBottom: '15px'
            }}>
              <FiTrendingDown />
            </div>
            <div className="stat-content">
              <div className="stat-label" style={chartStyles.statLabel}>
                Total Consumption
              </div>
              <div className="stat-value" style={chartStyles.statValue}>
                {stats.totalConsumption.toLocaleString()} Kg
              </div>
              <div className="stat-trend" style={{
                color: themeColors.textSecondary,
                fontSize: '12px',
                marginTop: '5px'
              }}>
                By Spiral Section
              </div>
            </div>
          </div>
          
          <div className="stat-card" style={chartStyles.statCard}>
            <div className="stat-icon efficiency" style={{
              width: '40px',
              height: '40px',
              background: '#9b59b620',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9b59b6',
              fontSize: '20px',
              marginBottom: '15px'
            }}>
              <FiActivity />
            </div>
            <div className="stat-content">
              <div className="stat-label" style={chartStyles.statLabel}>
                Avg Efficiency
              </div>
              <div className="stat-value" style={{
                ...chartStyles.statValue,
                color: stats.avgEfficiency >= 80 ? themeColors.success : 
                       stats.avgEfficiency >= 60 ? themeColors.warning : themeColors.error
              }}>
                {stats.avgEfficiency}%
              </div>
              <div className="stat-trend" style={{
                color: themeColors.textSecondary,
                fontSize: '12px',
                marginTop: '5px'
              }}>
                Material Utilization
              </div>
            </div>
          </div>
          
          <div className="stat-card" style={chartStyles.statCard}>
            <div className="stat-icon balance" style={{
              width: '40px',
              height: '40px',
              background: '#2ecc7120',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2ecc71',
              fontSize: '20px',
              marginBottom: '15px'
            }}>
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-label" style={chartStyles.statLabel}>
                Net Balance
              </div>
              <div className="stat-value" style={{
                ...chartStyles.statValue,
                color: stats.netBalance >= 0 ? themeColors.success : themeColors.error
              }}>
                {stats.netBalance.toLocaleString()} Kg
              </div>
              <div className="stat-trend" style={{
                color: themeColors.textSecondary,
                fontSize: '12px',
                marginTop: '5px'
              }}>
                Available Stock
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مین چارٹ */}
      <div className="chart-container" style={{ marginBottom: '30px' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartStyles.chartGrid.stroke} 
                />
                <XAxis 
                  dataKey="date" 
                  stroke={chartStyles.axis.stroke}
                  fontSize={chartStyles.axis.fontSize}
                  tick={{ fill: themeColors.textSecondary }}
                />
                <YAxis 
                  stroke={chartStyles.axis.stroke}
                  fontSize={chartStyles.axis.fontSize}
                  tickFormatter={(value) => `${value.toLocaleString()} Kg`}
                  tick={{ fill: themeColors.textSecondary }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  wrapperStyle={chartStyles.tooltip}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="production" 
                  name="Production (Kg)" 
                  stroke={themeColors.production} 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  name="Consumption (Kg)" 
                  stroke={themeColors.consumption} 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  name="Balance (Kg)" 
                  stroke={themeColors.balance} 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartStyles.chartGrid.stroke} 
                />
                <XAxis 
                  dataKey="date" 
                  stroke={chartStyles.axis.stroke}
                  fontSize={chartStyles.axis.fontSize}
                  tick={{ fill: themeColors.textSecondary }}
                />
                <YAxis 
                  stroke={chartStyles.axis.stroke}
                  fontSize={chartStyles.axis.fontSize}
                  tickFormatter={(value) => `${value.toLocaleString()} Kg`}
                  tick={{ fill: themeColors.textSecondary }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  wrapperStyle={chartStyles.tooltip}
                />
                <Legend />
                <Bar 
                  dataKey="production" 
                  name="Production (Kg)" 
                  fill={themeColors.production} 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="consumption" 
                  name="Consumption (Kg)" 
                  fill={themeColors.consumption} 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartStyles.chartGrid.stroke} 
                />
                <XAxis 
                  dataKey="date" 
                  stroke={chartStyles.axis.stroke}
                  fontSize={chartStyles.axis.fontSize}
                  tick={{ fill: themeColors.textSecondary }}
                />
                <YAxis 
                  stroke={chartStyles.axis.stroke}
                  fontSize={chartStyles.axis.fontSize}
                  tickFormatter={(value) => `${value.toLocaleString()} Kg`}
                  tick={{ fill: themeColors.textSecondary }}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  wrapperStyle={chartStyles.tooltip}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  name="Production (Kg)" 
                  stroke={themeColors.production} 
                  fill={themeColors.production}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  name="Consumption (Kg)" 
                  stroke={themeColors.consumption} 
                  fill={themeColors.consumption}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="no-chart-data" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            color: themeColors.textSecondary
          }}>
            <div className="empty-chart" style={{
              textAlign: 'center'
            }}>
              <FiActivity size={64} style={{
                color: themeColors.textSecondary,
                opacity: 0.5,
                marginBottom: '20px'
              }} />
              <h4 style={{
                color: themeColors.textPrimary,
                marginBottom: '10px'
              }}>
                No Data Available
              </h4>
              <p style={{
                color: themeColors.textSecondary,
                fontSize: '14px'
              }}>
                Select a different date range to view material flow data
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ایفیشنسی چارٹ (ثانوی) */}
      {chartData.length > 0 && (
        <div className="secondary-chart" style={{
          background: themeColors.surface,
          borderRadius: '8px',
          padding: '20px',
          border: `1px solid ${themeColors.border}`,
          marginTop: '20px'
        }}>
          <h4 style={{
            color: themeColors.textPrimary,
            margin: '0 0 15px 0',
            fontSize: '16px'
          }}>
            Material Efficiency Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartStyles.chartGrid.stroke} 
              />
              <XAxis 
                dataKey="date" 
                stroke={chartStyles.axis.stroke}
                fontSize="10px"
                tick={{ fill: themeColors.textSecondary }}
              />
              <YAxis 
                stroke={chartStyles.axis.stroke}
                fontSize="10px"
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: themeColors.textSecondary }}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Efficiency']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={chartStyles.tooltip}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                name="Efficiency (%)" 
                stroke={themeColors.efficiency} 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`
        .material-flow-chart {
          transition: all 0.3s ease;
        }
        
        .btn-export-chart:hover:not(:disabled) {
          background: ${themeColors.primary} !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .control-select:hover {
          border-color: ${themeColors.primary} !important;
        }
        
        .control-select:focus {
          border-color: ${themeColors.primary} !important;
          box-shadow: 0 0 0 3px ${themeColors.primary}20;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        
        /* Dark mode specific styles */
        body.dark-mode .chart-stats,
        body.theme-dark .chart-stats {
          color: ${themeColors.textPrimary};
        }
        
        body.dark-mode .stat-card,
        body.theme-dark .stat-card {
          background: ${themeColors.surface};
          border-color: ${themeColors.border};
        }
        
        body.dark-mode .control-select,
        body.theme-dark .control-select {
          background: ${themeColors.background};
          color: ${themeColors.textPrimary};
          border-color: ${themeColors.border};
        }
        
        body.dark-mode .btn-export-chart,
        body.theme-dark .btn-export-chart {
          background: ${themeColors.primary};
          color: ${themeColors.textPrimary};
        }
      `}</style>
    </div>
  );
};

export default MaterialFlowChart;