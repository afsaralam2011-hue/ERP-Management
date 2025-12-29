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
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <strong>{label}</strong>
          </div>
          <div className="tooltip-content">
            {payload.map((entry, index) => (
              <div key={index} className="tooltip-item">
                <span 
                  className="tooltip-dot" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="tooltip-label">{entry.name}:</span>
                <span className="tooltip-value">
                  {entry.value.toLocaleString()} Kg
                  {entry.name === 'Efficiency' && '%'}
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
      <div className="chart-loading">
        <div className="loading-spinner"></div>
        <p>Loading chart data...</p>
      </div>
    );
  }

  return (
    <div className="material-flow-chart">
      {/* چارٹ ہیڈر */}
      <div className="chart-header">
        <div className="header-left">
          <h3><FiActivity /> Material Flow Analysis</h3>
          <p className="chart-subtitle">
            Production vs Consumption over time
          </p>
        </div>
        
        <div className="header-right">
          <div className="chart-controls">
            <div className="control-group">
              <label><FiCalendar /> Time Range:</label>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="control-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="control-group">
              <label><FiFilter /> Chart Type:</label>
              <select 
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="control-select"
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
            >
              <FiDownload /> Export
            </button>
          </div>
        </div>
      </div>

      {/* اسٹیٹس کارڈز */}
      {stats && (
        <div className="chart-stats">
          <div className="stat-card">
            <div className="stat-icon production">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Production</div>
              <div className="stat-value">
                {stats.totalProduction.toLocaleString()} Kg
              </div>
              <div className="stat-trend">
                From Flattening Section
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon consumption">
              <FiTrendingDown />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Consumption</div>
              <div className="stat-value">
                {stats.totalConsumption.toLocaleString()} Kg
              </div>
              <div className="stat-trend">
                By Spiral Section
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon efficiency">
              <FiActivity />
            </div>
            <div className="stat-content">
              <div className="stat-label">Avg Efficiency</div>
              <div className="stat-value" style={{
                color: stats.avgEfficiency >= 80 ? '#2ecc71' : 
                       stats.avgEfficiency >= 60 ? '#f39c12' : '#e74c3c'
              }}>
                {stats.avgEfficiency}%
              </div>
              <div className="stat-trend">
                Material Utilization
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon balance">
              <FiTrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-label">Net Balance</div>
              <div className="stat-value" style={{
                color: stats.netBalance >= 0 ? '#2ecc71' : '#e74c3c'
              }}>
                {stats.netBalance.toLocaleString()} Kg
              </div>
              <div className="stat-trend">
                Available Stock
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مین چارٹ */}
      <div className="chart-container">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#7f8c8d"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#7f8c8d"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toLocaleString()} Kg`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="production" 
                  name="Production (Kg)" 
                  stroke="#3498db" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  name="Consumption (Kg)" 
                  stroke="#e74c3c" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  name="Balance (Kg)" 
                  stroke="#2ecc71" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#7f8c8d"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#7f8c8d"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toLocaleString()} Kg`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="production" 
                  name="Production (Kg)" 
                  fill="#3498db" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="consumption" 
                  name="Consumption (Kg)" 
                  fill="#e74c3c" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#7f8c8d"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#7f8c8d"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toLocaleString()} Kg`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="production" 
                  name="Production (Kg)" 
                  stroke="#3498db" 
                  fill="#3498db"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  name="Consumption (Kg)" 
                  stroke="#e74c3c" 
                  fill="#e74c3c"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="no-chart-data">
            <div className="empty-chart">
              <FiActivity size={64} />
              <h4>No Data Available</h4>
              <p>Select a different date range to view material flow data</p>
            </div>
          </div>
        )}
      </div>

      {/* ایفیشنسی چارٹ (ثانوی) */}
      {chartData.length > 0 && (
        <div className="secondary-chart">
          <h4>Material Efficiency Trend</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#7f8c8d"
                fontSize={10}
              />
              <YAxis 
                stroke="#7f8c8d"
                fontSize={10}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Efficiency']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                name="Efficiency (%)" 
                stroke="#9b59b6" 
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MaterialFlowChart;