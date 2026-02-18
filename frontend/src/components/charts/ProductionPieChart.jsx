// src/components/charts/ProductionPieChart.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { useTheme } from "../../contexts/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProductionPieChart = ({
  title = "Production Overview",
  labels = [],
  data = [],
  unit = "",
  height = 500,
  colors = null,
  showLegend = true,
  showPercentages = true,
  showValues = true,
  showTotal = true,
  innerRadius = "65%",
  showCenterTotal = true,
  showCenterGrowth = false,
  previousData = [],
  onSliceClick = null,
}) => {
  const { isDarkMode } = useTheme();
  const chartRef = useRef();

  /* -------------------- Time Filter -------------------- */
  const [range, setRange] = useState("Today");

  /* -------------------- Utilities -------------------- */

  const formatNumber = (n) => {
    if (n === null || n === undefined) return '0';
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  // اگر ڈیٹا نہ ہو تو خالی دکھائیں
  const resolvedLabels = labels.length ? labels : ['No Data'];
  const resolvedData = data.length ? data : [1]; // 100% ایک سلائس
  
  // کل ٹوٹل
  const totalCurrent = useMemo(
    () => resolvedData.reduce((a, b) => a + b, 0),
    [resolvedData]
  );

  // گروتھ کیلکولیشن
  const totalPrevious = useMemo(
    () => previousData.length ? previousData.reduce((a, b) => a + b, 0) : 0,
    [previousData]
  );

  const growth = totalPrevious > 0
    ? (((totalCurrent - totalPrevious) / totalPrevious) * 100).toFixed(1)
    : 0;

  /* -------------------- Animated Counter -------------------- */

  const [animatedTotal, setAnimatedTotal] = useState(0);

  useEffect(() => {
    if (totalCurrent === 0) {
      setAnimatedTotal(0);
      return;
    }
    
    let start = 0;
    const duration = 700;
    const step = totalCurrent / (duration / 16);

    const counter = setInterval(() => {
      start += step;
      if (start >= totalCurrent) {
        setAnimatedTotal(totalCurrent);
        clearInterval(counter);
      } else {
        setAnimatedTotal(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [totalCurrent]);

  /* -------------------- Professional Palette -------------------- */

  // وائبرنٹ کلرز - مختلف ڈیپارٹمنٹس کے لیے
  const vibrantPalette = [
    '#f59e0b', // Amber - Raw Material
    '#3b82f6', // Blue - Flattening
    '#8b5cf6', // Purple - Spiral
    '#10b981', // Green - PVC Coating
    '#ec4899', // Pink - Cutting & Packing
    '#06b6d4', // Cyan - Finishing Goods
    '#ef4444', // Red - Alert
    '#f97316', // Orange - Warning
    '#84cc16', // Lime - Success
    '#6366f1', // Indigo - Primary
  ];

  // ڈارک موڈ کے لیے ہلکے ورژن
  const darkPalette = [
    '#fbbf24', // Amber lighter
    '#60a5fa', // Blue lighter
    '#a78bfa', // Purple lighter
    '#34d399', // Green lighter
    '#f472b6', // Pink lighter
    '#22d3ee', // Cyan lighter
    '#f87171', // Red lighter
    '#fb923c', // Orange lighter
    '#a3e635', // Lime lighter
    '#818cf8', // Indigo lighter
  ];

  // کلرز منتخب کریں
  const getColors = useMemo(() => {
    if (colors) return colors;
    
    const basePalette = isDarkMode ? darkPalette : vibrantPalette;
    
    return resolvedData.map((_, i) => basePalette[i % basePalette.length]);
  }, [colors, isDarkMode, resolvedData]);

  /* -------------------- Border Colors -------------------- */
  
  const borderColors = useMemo(() => {
    return getColors.map(color => 
      isDarkMode ? `${color}CC` : `${color}FF`
    );
  }, [getColors, isDarkMode]);

  /* -------------------- Chart Data -------------------- */

  const chartData = useMemo(
    () => ({
      labels: resolvedLabels,
      datasets: [
        {
          label: "Production",
          data: resolvedData,
          backgroundColor: getColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 15,
        }
      ]
    }),
    [resolvedLabels, resolvedData, getColors, borderColors]
  );

  // اگر پچھلا ڈیٹا ہو تو دوسرا ڈیٹاسیٹ شامل کریں
  if (previousData.length && previousData.length === resolvedData.length) {
    chartData.datasets.push({
      label: "Previous",
      data: previousData,
      backgroundColor: getColors.map(c => `${c}40`),
      borderColor: getColors.map(c => `${c}80`),
      borderWidth: 1,
      borderDash: [5, 5],
    });
  }

  /* -------------------- Chart Options -------------------- */

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: innerRadius,
    radius: "90%",
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
      animateRotate: true,
      animateScale: true,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#1f2937',
          font: { size: 12, weight: '500' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#e5e7eb' : '#1f2937',
        bodyColor: isDarkMode ? '#d1d5db' : '#4b5563',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            let text = `${label}: ${formatNumber(value)}`;
            if (unit) text += ` ${unit}`;
            if (showPercentages) text += ` (${percentage}%)`;
            
            return text;
          }
        }
      }
    },
    onClick: (event, elements) => {
      if (onSliceClick && elements.length > 0) {
        const index = elements[0].index;
        onSliceClick({
          label: resolvedLabels[index],
          value: resolvedData[index],
          percentage: (resolvedData[index] / totalCurrent * 100).toFixed(1),
          index
        });
      }
    }
  };

  /* -------------------- Export PNG -------------------- */

  const exportPNG = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const url = chart.toBase64Image();
    const link = document.createElement("a");
    link.download = `production-chart-${range.toLowerCase()}.png`;
    link.href = url;
    link.click();
  };

  /* -------------------- Render Side Labels -------------------- */

  const renderSideLabels = () => {
    if (!resolvedData.length) return null;

    return (
      <div style={{
        width: '320px',
        marginLeft: '30px',
        overflowY: 'auto',
        maxHeight: '450px',
        paddingRight: '10px'
      }}>
        {resolvedLabels.map((label, i) => {
          const value = resolvedData[i];
          const percentage = totalCurrent > 0 ? (value / totalCurrent * 100).toFixed(1) : 0;
          const color = getColors[i % getColors.length];
          
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 15px',
                marginBottom: '8px',
                backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                borderRadius: '10px',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                transition: 'all 0.2s',
                cursor: onSliceClick ? 'pointer' : 'default',
              }}
              onClick={() => onSliceClick && onSliceClick({
                label, value, percentage, index: i
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Color Indicator */}
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  backgroundColor: color,
                }} />
                
                {/* Label */}
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isDarkMode ? '#e5e7eb' : '#1f2937',
                }}>
                  {label}
                </span>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                {/* Value */}
                <span style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                }}>
                  {formatNumber(value)}
                </span>
                
                {/* Unit & Percentage */}
                <div style={{
                  fontSize: '12px',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  marginTop: '2px'
                }}>
                  {unit && `${unit} • `}{percentage}%
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Total at bottom */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '15px',
          marginTop: '10px',
          backgroundColor: isDarkMode ? '#334155' : '#e2e8f0',
          borderRadius: '10px',
          fontWeight: '600',
        }}>
          <span>Total</span>
          <span>
            {formatNumber(totalCurrent)} {unit}
          </span>
        </div>
      </div>
    );
  };

  /* -------------------- UI -------------------- */

  return (
    <div
      style={{
        height: `${height}px`,
        width: '100%',
        background: isDarkMode ? '#0f172a' : '#ffffff',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: isDarkMode
          ? '0 20px 40px rgba(0,0,0,0.5)'
          : '0 20px 40px rgba(0,0,0,0.08)',
        border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px',
            color: isDarkMode ? '#f1f5f9' : '#0f172a'
          }}>
            {title}
          </h2>
          <div style={{ 
            fontSize: '14px', 
            color: isDarkMode ? '#94a3b8' : '#64748b',
            marginTop: '4px'
          }}>
            {range} Analysis • {resolvedData.length} {resolvedData.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Time Filter */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
              backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
              color: isDarkMode ? '#f1f5f9' : '#0f172a',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: '500'
            }}
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Week">This Week</option>
            <option value="Month">This Month</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportPNG}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
              backgroundColor: isDarkMode ? '#2563eb' : '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
            }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div style={{ 
        display: 'flex', 
        flex: 1,
        minHeight: 400,
        gap: '20px'
      }}>
        {/* Chart Container */}
        <div style={{ 
          flex: 1,
          position: 'relative',
          minWidth: 400,
          height: 400
        }}>
          <Pie 
            ref={chartRef} 
            data={chartData} 
            options={options}
          />

          {/* Center Info */}
          {showCenterTotal && totalCurrent > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                backgroundColor: isDarkMode ? '#0f172a80' : '#ffffff80',
                backdropFilter: 'blur(4px)',
                padding: '15px 25px',
                borderRadius: '50px',
                border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
              }}
            >
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700',
                color: isDarkMode ? '#f1f5f9' : '#0f172a',
                lineHeight: 1.2
              }}>
                {formatNumber(animatedTotal)}
              </div>
              
              {unit && (
                <div style={{ 
                  fontSize: '14px', 
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  marginTop: '4px',
                  fontWeight: '500'
                }}>
                  Total {unit}
                </div>
              )}

              {showCenterGrowth && previousData.length > 0 && (
                <div
                  style={{
                    fontSize: '14px',
                    marginTop: '8px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: growth >= 0 
                      ? (isDarkMode ? '#10b98120' : '#d1fae5')
                      : (isDarkMode ? '#ef444420' : '#fee2e2'),
                    color: growth >= 0 
                      ? (isDarkMode ? '#34d399' : '#059669')
                      : (isDarkMode ? '#f87171' : '#dc2626'),
                    fontWeight: '600',
                  }}
                >
                  {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Labels */}
        {renderSideLabels()}
      </div>
    </div>
  );
};

export default ProductionPieChart;