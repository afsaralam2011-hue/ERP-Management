// src/components/charts/ProductionLineChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProductionLineChart = ({ 
  title = 'Production Trends',
  data = [],
  labels = [],
  fillColor = null, // ✅ تھیم کے مطابق ہوگا
  lineColor = '#3b82f6',
  height = 300,
  darkMode = false, // ✅ تھیم سپورٹ
  unit = '' // ✅ اضافی unit prop
}) => {
  
  // ✅ تھیم کے مطابق رنگ حاصل کرنے کا فنکشن
  const getColor = (colorName) => {
    if (typeof document === 'undefined') return '#000000';
    return getComputedStyle(document.documentElement).getPropertyValue(`--color-${colorName}`).trim() || 
          (darkMode ? '#FFFFFF' : '#000000');
  };

  // ✅ تھیم کے مطابق CSS Variables
  const themeColors = {
    background: darkMode ? '#1e1e1e' : '#ffffff',
    textPrimary: darkMode ? '#ffffff' : '#1e293b',
    textSecondary: darkMode ? '#94a3b8' : '#64748b',
    surface: darkMode ? '#2d2d2d' : '#f8fafc',
    border: darkMode ? '#404040' : '#e2e8f0',
    gridLine: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.5)',
  };

  // ✅ Default data
  const defaultData = [120, 190, 150, 220, 180, 250, 300];
  const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ✅ تھیم کے مطابق fill color
  const themeFillColor = fillColor || (darkMode 
    ? (lineColor + '20') // Dark mode میں ہلکا fill
    : (lineColor + '10') // Light mode میں ہلکا fill
  );

  const chartData = {
    labels: labels.length > 0 ? labels : defaultLabels,
    datasets: [
      {
        label: `Production${unit ? ` (${unit})` : ''}`,
        data: data.length > 0 ? data : defaultData,
        borderColor: lineColor,
        backgroundColor: themeFillColor,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: lineColor,
        pointBorderColor: darkMode ? '#1e1e1e' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: darkMode ? '#ffffff' : lineColor,
        pointHoverBorderColor: lineColor,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'line',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: themeColors.textSecondary,
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: '600',
          family: "'Inter', sans-serif"
        },
        color: themeColors.textPrimary,
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(30, 41, 59, 0.95)',
        titleColor: darkMode ? '#f8fafc' : '#ffffff',
        bodyColor: darkMode ? '#f8fafc' : '#ffffff',
        titleFont: {
          size: 13,
          weight: '600'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        borderColor: darkMode ? '#404040' : 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const label = context.dataset.label || 'Production';
            return `${label}: ${value.toLocaleString()}`;
          },
          title: function(tooltipItems) {
            return tooltipItems[0].label || '';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: themeColors.gridLine,
          drawBorder: false,
        },
        ticks: {
          color: themeColors.textSecondary,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          padding: 8
        },
        border: {
          color: themeColors.border
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: themeColors.gridLine,
          drawBorder: false,
        },
        ticks: {
          color: themeColors.textSecondary,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          padding: 8,
          callback: function(value) {
            return value.toLocaleString() + (unit ? ` ${unit}` : '');
          }
        },
        border: {
          color: themeColors.border
        },
        title: {
          display: !!unit,
          text: unit,
          color: themeColors.textSecondary,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    elements: {
      line: {
        cubicInterpolationMode: 'monotone'
      }
    }
  };

  // ✅ گراف کے اوپر value display کے لیے
  const maxValue = Math.max(...(data.length > 0 ? data : defaultData));
  const minValue = Math.min(...(data.length > 0 ? data : defaultData));
  const averageValue = (data.length > 0 ? data : defaultData).reduce((a, b) => a + b, 0) / (data.length > 0 ? data.length : defaultData.length);

  return (
    <div style={{ 
      position: 'relative',
      height: `${height}px`,
      width: '100%',
      background: themeColors.background,
      borderRadius: '12px',
      padding: '20px',
      border: `1px solid ${themeColors.border}`,
      boxShadow: darkMode 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
        : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      {/* ✅ اضافی انفارمیشن dark mode کے لیے */}
      {darkMode && data.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '20px',
          display: 'flex',
          gap: '15px',
          zIndex: 1
        }}>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: '11px',
              color: themeColors.textSecondary,
              marginBottom: '2px'
            }}>
              Max
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: lineColor
            }}>
              {maxValue.toLocaleString()}
            </div>
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: '11px',
              color: themeColors.textSecondary,
              marginBottom: '2px'
            }}>
              Avg
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: themeColors.textPrimary
            }}>
              {Math.round(averageValue).toLocaleString()}
            </div>
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              fontSize: '11px',
              color: themeColors.textSecondary,
              marginBottom: '2px'
            }}>
              Min
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#10b981'
            }}>
              {minValue.toLocaleString()}
            </div>
          </div>
        </div>
      )}
      
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProductionLineChart;