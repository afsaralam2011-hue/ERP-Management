// components/charts/InventoryTrendChart.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, FiTrendingDown, FiBarChart2,
  FiFilter, FiGrid, FiRefreshCw
} from 'react-icons/fi';
import {
  ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts';
import { supabase } from '../../supabaseClient';
import './InventoryTrendChart.css';

const InventoryTrendChart = ({ data }) => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('material'); // 'material' or 'time'
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      processTrendData();
      // Default select all materials
      setSelectedMaterials(data.map(item => item.item_code));
    }
  }, [data, viewType]);

  const processTrendData = () => {
    if (viewType === 'material') {
      // Group by material
      const materialGroups = {};
      
      data.forEach(item => {
        if (!materialGroups[item.material_type]) {
          materialGroups[item.material_type] = {
            production: 0,
            consumption: 0,
            items: 0
          };
        }
        
        materialGroups[item.material_type].production += item.production_kg;
        materialGroups[item.material_type].consumption += item.consumption_kg;
        materialGroups[item.material_type].items += 1;
      });
      
      const formattedData = Object.keys(materialGroups).map(material => {
        const group = materialGroups[material];
        const balance = group.production - group.consumption;
        const efficiency = group.production > 0 ? (group.consumption / group.production) * 100 : 0;
        
        return {
          name: material,
          production: parseFloat(group.production.toFixed(2)),
          consumption: parseFloat(group.consumption.toFixed(2)),
          balance: parseFloat(balance.toFixed(2)),
          efficiency: parseFloat(efficiency.toFixed(2)),
          items: group.items
        };
      });
      
      setTrendData(formattedData);
    } else {
      // Time-based view (using provided data structure)
      const formattedData = data.map(item => ({
        name: item.item_code,
        production: item.production_kg,
        consumption: item.consumption_kg,
        balance: item.balance_kg,
        efficiency: parseFloat(item.efficiency_percent),
        status: item.status
      }));
      
      setTrendData(formattedData);
    }
    
    setLoading(false);
  };

  const handleMaterialToggle = (materialCode) => {
    setSelectedMaterials(prev => {
      if (prev.includes(materialCode)) {
        return prev.filter(code => code !== materialCode);
      } else {
        return [...prev, materialCode];
      }
    });
  };

  const filteredData = trendData.filter(item => 
    viewType === 'material' || selectedMaterials.includes(item.name)
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="trend-tooltip">
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
                  {typeof entry.value === 'number' 
                    ? entry.value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })
                    : entry.value}
                  {entry.name.includes('Efficiency') && '%'}
                  {!entry.name.includes('Efficiency') && ' Kg'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NORMAL': return '#2ecc71';
      case 'LOW': return '#f39c12';
      case 'CRITICAL': return '#e74c3c';
      case 'OUT_OF_STOCK': return '#c0392b';
      default: return '#95a5a6';
    }
  };

  const calculateAverages = () => {
    if (filteredData.length === 0) return null;
    
    const avgProduction = filteredData.reduce((sum, item) => sum + item.production, 0) / filteredData.length;
    const avgConsumption = filteredData.reduce((sum, item) => sum + item.consumption, 0) / filteredData.length;
    const avgEfficiency = filteredData.reduce((sum, item) => sum + item.efficiency, 0) / filteredData.length;
    
    return {
      avgProduction: parseFloat(avgProduction.toFixed(2)),
      avgConsumption: parseFloat(avgConsumption.toFixed(2)),
      avgEfficiency: parseFloat(avgEfficiency.toFixed(2))
    };
  };

  const averages = calculateAverages();

  if (loading) {
    return (
      <div className="trend-loading">
        <div className="loading-spinner"></div>
        <p>Loading trend data...</p>
      </div>
    );
  }

  return (
    <div className="inventory-trend-chart">
      {/* ہیڈر */}
      <div className="trend-header">
        <div className="header-left">
          <h3><FiBarChart2 /> Inventory Trends</h3>
          <p className="trend-subtitle">
            {viewType === 'material' ? 'Material Type Analysis' : 'Item-wise Performance'}
          </p>
        </div>
        
        <div className="header-right">
          <div className="trend-controls">
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewType === 'material' ? 'active' : ''}`}
                onClick={() => setViewType('material')}
              >
                <FiGrid /> By Material
              </button>
              <button
                className={`toggle-btn ${viewType === 'time' ? 'active' : ''}`}
                onClick={() => setViewType('time')}
              >
                <FiBarChart2 /> By Item
              </button>
            </div>
            
            <button 
              className="btn btn-refresh"
              onClick={processTrendData}
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* مٹیریل سلیکٹر (آئٹم ویو کے لیے) */}
      {viewType === 'time' && data && data.length > 0 && (
        <div className="material-selector">
          <div className="selector-header">
            <h4>Select Materials to Display:</h4>
            <div className="selector-actions">
              <button
                className="btn-select-all"
                onClick={() => setSelectedMaterials(data.map(item => item.item_code))}
              >
                Select All
              </button>
              <button
                className="btn-clear"
                onClick={() => setSelectedMaterials([])}
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="material-chips">
            {data.map((item, index) => (
              <div
                key={index}
                className={`material-chip ${selectedMaterials.includes(item.item_code) ? 'selected' : ''}`}
                onClick={() => handleMaterialToggle(item.item_code)}
                style={{
                  borderColor: selectedMaterials.includes(item.item_code) 
                    ? getStatusColor(item.status) 
                    : '#ddd'
                }}
              >
                <div 
                  className="chip-status" 
                  style={{ 
                    backgroundColor: getStatusColor(item.status),
                    opacity: selectedMaterials.includes(item.item_code) ? 1 : 0.5
                  }}
                />
                <span className="chip-code">{item.item_code}</span>
                <span className="chip-name">{item.item_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ایوریجز */}
      {averages && (
        <div className="trend-averages">
          <div className="average-card">
            <div className="average-icon">
              <FiTrendingUp />
            </div>
            <div className="average-content">
              <div className="average-label">Avg Production</div>
              <div className="average-value">
                {averages.avgProduction.toLocaleString()} Kg
              </div>
            </div>
          </div>
          
          <div className="average-card">
            <div className="average-icon">
              <FiTrendingDown />
            </div>
            <div className="average-content">
              <div className="average-label">Avg Consumption</div>
              <div className="average-value">
                {averages.avgConsumption.toLocaleString()} Kg
              </div>
            </div>
          </div>
          
          <div className="average-card">
            <div className="average-icon">
              <FiBarChart2 />
            </div>
            <div className="average-content">
              <div className="average-label">Avg Efficiency</div>
              <div className="average-value" style={{
                color: averages.avgEfficiency >= 80 ? '#2ecc71' : 
                       averages.avgEfficiency >= 60 ? '#f39c12' : '#e74c3c'
              }}>
                {averages.avgEfficiency.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مین چارٹ */}
      <div className="trend-chart-container">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                stroke="#7f8c8d"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                yAxisId="left"
                stroke="#7f8c8d"
                fontSize={12}
                tickFormatter={(value) => `${value.toLocaleString()} Kg`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#7f8c8d"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* پروڈکشن بار (بلیو) */}
              <Bar 
                yAxisId="left"
                dataKey="production" 
                name="Production (Kg)" 
                fill="#3498db" 
                radius={[4, 4, 0, 0]}
                barSize={viewType === 'material' ? 40 : 30}
              />
              
              {/* کنسمپشن بار (ریڈ) */}
              <Bar 
                yAxisId="left"
                dataKey="consumption" 
                name="Consumption (Kg)" 
                fill="#e74c3c" 
                radius={[4, 4, 0, 0]}
                barSize={viewType === 'material' ? 40 : 30}
              />
              
              {/* بیلنس لائن (گرین) */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="balance" 
                name="Balance (Kg)" 
                stroke="#2ecc71" 
                strokeWidth={3}
                dot={{ r: 5 }}
                strokeDasharray="5 5"
              />
              
              {/* ایفیشنسی لائن (پرپل) */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="efficiency" 
                name="Efficiency (%)" 
                stroke="#9b59b6" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              
              {/* زیرو ریفرنس لائن */}
              <ReferenceLine 
                yAxisId="left"
                y={0} 
                stroke="#95a5a6" 
                strokeDasharray="3 3" 
              />
              
              {/* 100% ایفیشنسی لائن */}
              {viewType === 'time' && (
                <ReferenceLine 
                  yAxisId="right"
                  y={100} 
                  stroke="#f39c12" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: '100% Target', 
                    position: 'right',
                    fill: '#f39c12',
                    fontSize: 12
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-trend-data">
            <div className="empty-trend">
              <FiBarChart2 size={64} />
              <h4>No Trend Data Available</h4>
              <p>
                {viewType === 'time' 
                  ? 'Select materials to view trends' 
                  : 'No material data available for the selected period'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ٹرینڈ سمری */}
      {filteredData.length > 0 && (
        <div className="trend-summary">
          <div className="summary-item">
            <span className="summary-label">Total Items:</span>
            <span className="summary-value">{filteredData.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Data Range:</span>
            <span className="summary-value">
              {filteredData.length} {viewType === 'material' ? 'Material Types' : 'Items'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">View Type:</span>
            <span className="summary-value">
              {viewType === 'material' ? 'Material Groups' : 'Individual Items'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTrendChart;