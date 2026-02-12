// components/charts/MaterialFlowChart.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FiTrendingUp, FiTrendingDown, FiActivity, 
  FiFilter, FiCalendar, FiDownload,
  FiPieChart, FiBarChart2, FiLineChart
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area,
  ComposedChart, ReferenceLine
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../supabaseClient';
import './MaterialFlowChart.css';

const MaterialFlowChart = ({ dateRange, materialType, section = 'spiral' }) => {
  // ✅ تھیم کنٹیکسٹ سے ڈارک موڈ حاصل کریں
  const { isDarkMode } = useTheme();
  
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('composed'); // 'line', 'bar', 'area', 'composed'
  const [timeRange, setTimeRange] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [showBalance, setShowBalance] = useState(true);
  const [showEfficiency, setShowEfficiency] = useState(true);
  const [metrics, setMetrics] = useState(['production', 'consumption']);
  
  // ✅ CSS Variables سے کلرز حاصل کریں
  const getCssVar = useCallback((varName) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }, []);

  // ✅ تھیم کے مطابق کلرز
  const themeColors = useMemo(() => ({
    // Backgrounds
    background: isDarkMode ? 'var(--color-background)' : 'var(--color-background)',
    surface: isDarkMode ? 'var(--color-surface)' : 'var(--color-surface)',
    card: isDarkMode ? 'var(--color-card-bg)' : 'var(--color-card-bg)',
    paper: isDarkMode ? 'var(--color-paper)' : 'var(--color-paper)',
    
    // Text
    textPrimary: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
    textSecondary: isDarkMode ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)',
    textTertiary: isDarkMode ? 'var(--color-text-tertiary)' : 'var(--color-text-tertiary)',
    textMuted: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
    
    // Borders
    border: isDarkMode ? 'var(--color-border)' : 'var(--color-border)',
    borderLight: isDarkMode ? 'var(--color-border-light)' : 'var(--color-border-light)',
    divider: isDarkMode ? 'var(--color-divider)' : 'var(--color-divider)',
    
    // Status
    success: isDarkMode ? 'var(--color-success)' : 'var(--color-success)',
    warning: isDarkMode ? 'var(--color-warning)' : 'var(--color-warning)',
    error: isDarkMode ? 'var(--color-error)' : 'var(--color-error)',
    info: isDarkMode ? 'var(--color-info)' : 'var(--color-info)',
    
    // Chart Colors - Indigo/Navy Spectrum
    production: isDarkMode ? '#64B5F6' : '#303F9F', // Indigo 700
    consumption: isDarkMode ? '#F06292' : '#C2185B', // Pink 700
    balance: isDarkMode ? '#4FC3F7' : '#0288D1', // Light Blue 700
    efficiency: isDarkMode ? '#BA68C8' : '#7B1FA2', // Purple 700
    target: isDarkMode ? '#FFB74D' : '#F57C00', // Orange 700
    
    // Grid
    gridLine: isDarkMode ? 'rgba(227, 242, 253, 0.08)' : 'rgba(26, 35, 126, 0.08)',
    axisLine: isDarkMode ? 'rgba(227, 242, 253, 0.2)' : 'rgba(26, 35, 126, 0.2)',
  }), [isDarkMode]);

  // ✅ تھیم کے مطابق CSS Variables کو resolve کریں
  const resolvedColors = useMemo(() => {
    const resolved = {};
    Object.keys(themeColors).forEach(key => {
      let value = themeColors[key];
      if (typeof value === 'string' && value.startsWith('var(')) {
        const varName = value.replace('var(', '').replace(')', '');
        value = getCssVar(varName) || value;
      }
      resolved[key] = value;
    });
    return resolved;
  }, [themeColors, getCssVar]);

  // ✅ تھیم کے مطابق چارٹ اسٹائلز
  const chartStyles = useMemo(() => ({
    container: {
      background: resolvedColors.card,
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-lg)',
      border: `1px solid ${resolvedColors.borderLight}`,
      boxShadow: isDarkMode ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      transition: 'all var(--transition-base)',
    },
    header: {
      color: resolvedColors.textPrimary,
      borderBottom: `1px solid ${resolvedColors.divider}`,
      paddingBottom: 'var(--spacing-md)',
      marginBottom: 'var(--spacing-lg)',
    },
    subtitle: {
      color: resolvedColors.textSecondary,
      fontSize: 'var(--font-size-sm)',
      marginTop: 'var(--spacing-xs)',
    },
    controlGroup: {
      background: resolvedColors.surface,
      border: `1px solid ${resolvedColors.borderLight}`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-xs)',
    },
    controlSelect: {
      background: resolvedColors.paper,
      color: resolvedColors.textPrimary,
      border: `1px solid ${resolvedColors.borderLight}`,
      padding: 'var(--spacing-sm) var(--spacing-md)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: '500',
      outline: 'none',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
    },
    statCard: {
      background: resolvedColors.paper,
      border: `1px solid ${resolvedColors.borderLight}`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-md)',
      transition: 'all var(--transition-base)',
    },
    statValue: {
      color: resolvedColors.textPrimary,
      fontSize: 'var(--font-size-2xl)',
      fontWeight: 'var(--font-weight-bold)',
      lineHeight: 1.2,
    },
    statLabel: {
      color: resolvedColors.textMuted,
      fontSize: 'var(--font-size-xs)',
      marginBottom: 'var(--spacing-xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontWeight: '600',
    },
    button: {
      background: `linear-gradient(135deg, ${resolvedColors.production} 0%, ${resolvedColors.info} 100%)`,
      color: '#FFFFFF',
      border: 'none',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-sm)',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-sm)',
      transition: 'all var(--transition-fast)',
    },
    chartGrid: {
      stroke: resolvedColors.gridLine,
      strokeDasharray: '3 3',
    },
    axis: {
      stroke: resolvedColors.axisLine,
      fontSize: 'var(--font-size-xs)',
      fontWeight: '500',
    },
    tooltip: {
      background: resolvedColors.paper,
      border: `1px solid ${resolvedColors.borderLight}`,
      color: resolvedColors.textPrimary,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-md)',
      boxShadow: isDarkMode ? 'var(--shadow-lg)' : 'var(--shadow-md)',
    }
  }), [resolvedColors, isDarkMode]);

  // ✅ ڈیٹا لوڈ کریں
  useEffect(() => {
    loadChartData();
  }, [dateRange, materialType, timeRange, section]);

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
        .eq('section', 'flattening')
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
        .eq('section', section)
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .groupBy(groupBy)
        .order('date', { ascending: true });

      // Query for target data
      const { data: targetData } = await supabase
        .from('production_targets')
        .select(`
          ${dateField} as date,
          SUM(target_quantity) as target
        `)
        .eq('section', section)
        .gte('created_at', `${dateRange.start}T00:00:00`)
        .lte('created_at', `${dateRange.end}T23:59:59`)
        .groupBy(groupBy)
        .order('date', { ascending: true });

      // Combine data
      const productionMap = new Map();
      const consumptionMap = new Map();
      const targetMap = new Map();
      
      productionData?.forEach(item => {
        productionMap.set(item.date, parseFloat(item.production?.toFixed(2) || 0));
      });
      
      consumptionData?.forEach(item => {
        consumptionMap.set(item.date, parseFloat(item.consumption?.toFixed(2) || 0));
      });

      targetData?.forEach(item => {
        targetMap.set(item.date, parseFloat(item.target?.toFixed(2) || 0));
      });
      
      // Get all unique dates
      const allDates = new Set([
        ...Array.from(productionMap.keys()),
        ...Array.from(consumptionMap.keys()),
        ...Array.from(targetMap.keys())
      ]);
      
      // Format data for chart
      const formattedData = Array.from(allDates)
        .sort()
        .map(date => {
          const production = productionMap.get(date) || 0;
          const consumption = consumptionMap.get(date) || 0;
          const target = targetMap.get(date) || production * 1.1;
          const balance = production - consumption;
          const efficiency = production > 0 ? (consumption / production) * 100 : 0;
          const utilization = target > 0 ? (production / target) * 100 : 0;
          
          return {
            date: formatDate(date, timeRange),
            rawDate: date,
            production,
            consumption,
            target: parseFloat(target.toFixed(2)),
            balance: parseFloat(balance.toFixed(2)),
            efficiency: parseFloat(efficiency.toFixed(1)),
            utilization: parseFloat(utilization.toFixed(1)),
          };
        });
      
      setChartData(formattedData);
      
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ تاریخ فارمیٹ کریں
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
        return `W${Math.ceil(date.getDate() / 7)}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit' 
        });
      default:
        return date.toLocaleDateString();
    }
  };

  // ✅ کسٹم ٹولٹپ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: resolvedColors.paper,
          border: `1px solid ${resolvedColors.borderLight}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-md)',
          boxShadow: isDarkMode ? 'var(--shadow-lg)' : 'var(--shadow-md)',
          minWidth: '250px',
        }}>
          <div style={{
            fontWeight: '600',
            marginBottom: 'var(--spacing-sm)',
            borderBottom: `1px solid ${resolvedColors.divider}`,
            paddingBottom: 'var(--spacing-sm)',
            color: resolvedColors.textPrimary,
            fontSize: 'var(--font-size-sm)',
          }}>
            {label}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)' }}>
            {payload.map((entry, index) => {
              if (!entry || !entry.value) return null;
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-xs)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                  }}>
                    <span 
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '4px',
                        backgroundColor: entry.color,
                      }}
                    />
                    <span style={{
                      fontWeight: '500',
                      color: resolvedColors.textSecondary,
                    }}>
                      {entry.name}:
                    </span>
                  </div>
                  <span style={{
                    fontWeight: '600',
                    color: entry.color,
                  }}>
                    {entry.value.toLocaleString()}
                    {entry.name.includes('Efficiency') || entry.name.includes('Utilization') ? '%' : ' Kg'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // ✅ ڈیٹا ایکسپورٹ کریں
  const exportChartData = () => {
    const csvContent = [
      ['Date', 'Production (Kg)', 'Consumption (Kg)', 'Target (Kg)', 'Balance (Kg)', 'Efficiency (%)', 'Utilization (%)'],
      ...chartData.map(item => [
        item.date,
        item.production,
        item.consumption,
        item.target,
        item.balance,
        item.efficiency,
        item.utilization
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `material-flow-${section}-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ✅ سٹیٹس کیلکولیٹ کریں
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const totalProduction = chartData.reduce((sum, item) => sum + item.production, 0);
    const totalConsumption = chartData.reduce((sum, item) => sum + item.consumption, 0);
    const totalTarget = chartData.reduce((sum, item) => sum + item.target, 0);
    const avgEfficiency = chartData.reduce((sum, item) => sum + item.efficiency, 0) / chartData.length;
    const avgUtilization = chartData.reduce((sum, item) => sum + item.utilization, 0) / chartData.length;
    
    return {
      totalProduction: parseFloat(totalProduction.toFixed(2)),
      totalConsumption: parseFloat(totalConsumption.toFixed(2)),
      totalTarget: parseFloat(totalTarget.toFixed(2)),
      avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
      avgUtilization: parseFloat(avgUtilization.toFixed(1)),
      netBalance: parseFloat((totalProduction - totalConsumption).toFixed(2)),
      items: chartData.length,
      trend: chartData.length > 1 ? 
        ((chartData[chartData.length - 1].production - chartData[0].production) / chartData[0].production * 100).toFixed(1) : 0
    };
  }, [chartData]);

  // ✅ چارٹ رینڈر کریں
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          color: resolvedColors.textSecondary,
          background: resolvedColors.surface,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-xl)',
        }}>
          <FiActivity size={48} style={{
            color: resolvedColors.textMuted,
            marginBottom: 'var(--spacing-md)',
          }} />
          <h4 style={{
            color: resolvedColors.textPrimary,
            marginBottom: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-lg)',
          }}>
            No Data Available
          </h4>
          <p style={{
            color: resolvedColors.textSecondary,
            fontSize: 'var(--font-size-sm)',
            textAlign: 'center',
            maxWidth: '400px',
          }}>
            Select a different date range or section to view material flow data
          </p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartStyles.chartGrid.stroke} 
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke={resolvedColors.axisLine}
            tick={{ fill: resolvedColors.textSecondary, fontSize: 11 }}
            axisLine={{ stroke: resolvedColors.axisLine }}
            tickLine={{ stroke: resolvedColors.axisLine }}
          />
          <YAxis 
            yAxisId="left"
            stroke={resolvedColors.axisLine}
            tick={{ fill: resolvedColors.textSecondary, fontSize: 11 }}
            axisLine={{ stroke: resolvedColors.axisLine }}
            tickLine={{ stroke: resolvedColors.axisLine }}
            tickFormatter={(value) => `${value.toLocaleString()} Kg`}
            label={{
              value: 'Quantity (Kg)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: resolvedColors.textSecondary, fontSize: 11 }
            }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke={resolvedColors.axisLine}
            tick={{ fill: resolvedColors.textSecondary, fontSize: 11 }}
            axisLine={{ stroke: resolvedColors.axisLine }}
            tickLine={{ stroke: resolvedColors.axisLine }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: 'var(--spacing-md)',
              color: resolvedColors.textSecondary,
            }}
          />
          
          <Bar 
            yAxisId="left"
            dataKey="production" 
            name="Production" 
            fill={resolvedColors.production} 
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
          <Bar 
            yAxisId="left"
            dataKey="consumption" 
            name="Consumption" 
            fill={resolvedColors.consumption} 
            radius={[4, 4, 0, 0]}
            barSize={30}
          />
          
          {showBalance && (
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="balance" 
              name="Balance" 
              stroke={resolvedColors.balance} 
              strokeWidth={2}
              dot={{ r: 4, fill: resolvedColors.balance }}
              activeDot={{ r: 6 }}
            />
          )}
          
          {showEfficiency && (
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="efficiency" 
              name="Efficiency" 
              stroke={resolvedColors.efficiency} 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: resolvedColors.efficiency }}
            />
          )}
          
          <ReferenceLine 
            yAxisId="right"
            y={85} 
            stroke={resolvedColors.success} 
            strokeDasharray="3 3"
            label={{
              value: 'Target 85%',
              position: 'right',
              fill: resolvedColors.success,
              fontSize: 11
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '500px',
        background: resolvedColors.card,
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${resolvedColors.borderLight}`,
        padding: 'var(--spacing-xl)',
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `3px solid ${resolvedColors.borderLight}`,
          borderTop: `3px solid ${resolvedColors.production}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 'var(--spacing-lg)',
        }}></div>
        <p style={{
          color: resolvedColors.textSecondary,
          fontSize: 'var(--font-size-base)',
          margin: 0,
        }}>
          Loading material flow data...
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
      {/* ===== چارٹ ہیڈر ===== */}
      <div className="chart-header" style={chartStyles.header}>
        <div className="header-left">
          <h3 style={{ 
            color: resolvedColors.textPrimary,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            fontSize: 'var(--font-size-lg)',
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${resolvedColors.production} 0%, ${resolvedColors.info} 100%)`,
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FiActivity size={18} color="white" />
            </div>
            Material Flow Analysis
          </h3>
          <p className="chart-subtitle" style={chartStyles.subtitle}>
            {section === 'spiral' ? 'Spiral Section' : 'Flattening Section'} - Production vs Consumption over time
          </p>
        </div>
        
        <div className="header-right">
          <div className="chart-controls" style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {/* Time Range Selector */}
            <div className="control-group" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              background: resolvedColors.surface,
              border: `1px solid ${resolvedColors.borderLight}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2px',
            }}>
              <button
                onClick={() => setTimeRange('daily')}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  background: timeRange === 'daily' ? resolvedColors.production : 'transparent',
                  color: timeRange === 'daily' ? 'white' : resolvedColors.textSecondary,
                  border: 'none',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange('weekly')}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  background: timeRange === 'weekly' ? resolvedColors.production : 'transparent',
                  color: timeRange === 'weekly' ? 'white' : resolvedColors.textSecondary,
                  border: 'none',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  background: timeRange === 'monthly' ? resolvedColors.production : 'transparent',
                  color: timeRange === 'monthly' ? 'white' : resolvedColors.textSecondary,
                  border: 'none',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Monthly
              </button>
            </div>

            {/* Toggle Options */}
            <div className="control-group" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              background: resolvedColors.surface,
              border: `1px solid ${resolvedColors.borderLight}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2px',
            }}>
              <button
                onClick={() => setShowBalance(!showBalance)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  background: showBalance ? resolvedColors.balance : 'transparent',
                  color: showBalance ? 'white' : resolvedColors.textSecondary,
                  border: 'none',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Balance
              </button>
              <button
                onClick={() => setShowEfficiency(!showEfficiency)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-md)',
                  background: showEfficiency ? resolvedColors.efficiency : 'transparent',
                  color: showEfficiency ? 'white' : resolvedColors.textSecondary,
                  border: 'none',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Efficiency
              </button>
            </div>
            
            {/* Export Button */}
            <button 
              className="btn-export-chart"
              onClick={exportChartData}
              disabled={chartData.length === 0}
              style={{
                ...chartStyles.button,
                opacity: chartData.length === 0 ? 0.5 : 1,
                cursor: chartData.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <FiDownload size={14} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ===== سٹیٹس کارڈز ===== */}
      {stats && (
        <div className="chart-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <div className="stat-card" style={chartStyles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{
                width: '48px',
                height: '48px',
                background: `${resolvedColors.production}15`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: resolvedColors.production,
                fontSize: '24px',
              }}>
                <FiTrendingUp />
              </div>
              <div style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                background: stats.trend > 0 ? `${resolvedColors.success}15` : `${resolvedColors.error}15`,
                borderRadius: 'var(--radius-full)',
                color: stats.trend > 0 ? resolvedColors.success : resolvedColors.error,
                fontSize: 'var(--font-size-xs)',
                fontWeight: '600',
              }}>
                {stats.trend > 0 ? '↑' : '↓'} {Math.abs(stats.trend)}%
              </div>
            </div>
            <div className="stat-content" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="stat-label" style={chartStyles.statLabel}>
                Total Production
              </div>
              <div className="stat-value" style={chartStyles.statValue}>
                {stats.totalProduction.toLocaleString()} <span style={{ fontSize: 'var(--font-size-sm)', color: resolvedColors.textMuted }}>Kg</span>
              </div>
              <div className="stat-trend" style={{
                color: resolvedColors.textMuted,
                fontSize: 'var(--font-size-xs)',
                marginTop: 'var(--spacing-xs)',
              }}>
                vs Target: {stats.totalTarget.toLocaleString()} Kg
              </div>
            </div>
          </div>
          
          <div className="stat-card" style={chartStyles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-icon" style={{
                width: '48px',
                height: '48px',
                background: `${resolvedColors.consumption}15`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: resolvedColors.consumption,
                fontSize: '24px',
              }}>
                <FiTrendingDown />
              </div>
            </div>
            <div className="stat-content" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="stat-label" style={chartStyles.statLabel}>
                Total Consumption
              </div>
              <div className="stat-value" style={chartStyles.statValue}>
                {stats.totalConsumption.toLocaleString()} <span style={{ fontSize: 'var(--font-size-sm)', color: resolvedColors.textMuted }}>Kg</span>
              </div>
              <div className="stat-trend" style={{
                color: resolvedColors.textMuted,
                fontSize: 'var(--font-size-xs)',
                marginTop: 'var(--spacing-xs)',
              }}>
                {((stats.totalConsumption / stats.totalProduction) * 100).toFixed(1)}% of production
              </div>
            </div>
          </div>
          
          <div className="stat-card" style={chartStyles.statCard}>
            <div className="stat-icon" style={{
              width: '48px',
              height: '48px',
              background: `${resolvedColors.efficiency}15`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: resolvedColors.efficiency,
              fontSize: '24px',
            }}>
              <FiActivity />
            </div>
            <div className="stat-content" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="stat-label" style={chartStyles.statLabel}>
                Avg Efficiency
              </div>
              <div className="stat-value" style={{
                ...chartStyles.statValue,
                color: stats.avgEfficiency >= 85 ? resolvedColors.success :
                       stats.avgEfficiency >= 70 ? resolvedColors.warning : resolvedColors.error
              }}>
                {stats.avgEfficiency}%
              </div>
              <div className="stat-trend" style={{
                color: resolvedColors.textMuted,
                fontSize: 'var(--font-size-xs)',
                marginTop: 'var(--spacing-xs)',
              }}>
                Target: 85%
              </div>
            </div>
          </div>
          
          <div className="stat-card" style={chartStyles.statCard}>
            <div className="stat-icon" style={{
              width: '48px',
              height: '48px',
              background: `${resolvedColors.balance}15`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: resolvedColors.balance,
              fontSize: '24px',
            }}>
              <FiTrendingUp />
            </div>
            <div className="stat-content" style={{ marginTop: 'var(--spacing-md)' }}>
              <div className="stat-label" style={chartStyles.statLabel}>
                Net Balance
              </div>
              <div className="stat-value" style={{
                ...chartStyles.statValue,
                color: stats.netBalance >= 0 ? resolvedColors.success : resolvedColors.error
              }}>
                {stats.netBalance.toLocaleString()} <span style={{ fontSize: 'var(--font-size-sm)', color: resolvedColors.textMuted }}>Kg</span>
              </div>
              <div className="stat-trend" style={{
                color: resolvedColors.textMuted,
                fontSize: 'var(--font-size-xs)',
                marginTop: 'var(--spacing-xs)',
              }}>
                {stats.netBalance >= 0 ? 'Surplus' : 'Deficit'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== مین چارٹ ===== */}
      <div className="chart-container" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {renderChart()}
      </div>

      {/* ===== سیکنڈری چارٹ (Utilization) ===== */}
      {chartData.length > 0 && (
        <div className="secondary-chart" style={{
          background: resolvedColors.surface,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-md)',
          border: `1px solid ${resolvedColors.borderLight}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
          }}>
            <h4 style={{
              color: resolvedColors.textPrimary,
              margin: 0,
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
            }}>
              Target Utilization Trend
            </h4>
            <span style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              background: `${resolvedColors.success}15`,
              borderRadius: 'var(--radius-full)',
              color: resolvedColors.success,
              fontSize: 'var(--font-size-xs)',
              fontWeight: '600',
            }}>
              Avg: {stats?.avgUtilization || 0}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={resolvedColors.success} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={resolvedColors.success} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={chartStyles.chartGrid.stroke} 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke={resolvedColors.axisLine}
                tick={{ fill: resolvedColors.textSecondary, fontSize: 10 }}
                axisLine={{ stroke: resolvedColors.axisLine }}
                tickLine={{ stroke: resolvedColors.axisLine }}
              />
              <YAxis 
                stroke={resolvedColors.axisLine}
                tick={{ fill: resolvedColors.textSecondary, fontSize: 10 }}
                axisLine={{ stroke: resolvedColors.axisLine }}
                tickLine={{ stroke: resolvedColors.axisLine }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="utilization" 
                name="Utilization" 
                stroke={resolvedColors.success} 
                strokeWidth={2}
                fill="url(#utilizationGradient)"
                dot={{ r: 2, fill: resolvedColors.success }}
              />
              <ReferenceLine 
                y={85} 
                stroke={resolvedColors.success} 
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <style>{`
        .material-flow-chart {
          transition: all var(--transition-base);
        }
        
        .btn-export-chart:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: ${isDarkMode ? 'var(--shadow-lg)' : 'var(--shadow-md)'};
          filter: brightness(1.1);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: ${isDarkMode ? 'var(--shadow-lg)' : 'var(--shadow-md)'};
          border-color: ${resolvedColors.production}40;
        }
        
        .control-select:hover,
        .control-select:focus {
          border-color: ${resolvedColors.production} !important;
        }
        
        .control-select:focus {
          box-shadow: 0 0 0 3px ${resolvedColors.production}20;
        }
      `}</style>
    </div>
  );
};

export default MaterialFlowChart;