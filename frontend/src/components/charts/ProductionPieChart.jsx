// src/components/charts/ProductionPieChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProductionPieChart = ({ 
  title = 'Production Distribution',
  data = [30, 25, 20, 15, 10],
  labels = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'],
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  height = 300,
  darkMode = false // ✅ تھیم سپورٹ
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
  };

  // ✅ اگر colors array خالی ہے تو default colors استعمال کریں
  const chartColors = colors.length > 0 ? colors : [
    getColor('primary') || '#3b82f6',
    getColor('success') || '#10b981',
    getColor('warning') || '#f59e0b',
    getColor('error') || '#ef4444',
    getColor('secondary') || '#8b5cf6',
    getColor('info') || '#06b6d4',
    getColor('accent') || '#ec4899'
  ];

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: chartColors,
        borderColor: darkMode 
          ? chartColors.map(color => color.replace('0.8', '1'))
          : '#ffffff',
        borderWidth: darkMode ? 3 : 2,
        hoverOffset: 20,
        hoverBackgroundColor: chartColors.map(color => 
          darkMode ? lightenColor(color, 20) : darkenColor(color, 10)
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          color: themeColors.textSecondary,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => {
              const value = datasets[0].data[i];
              const total = datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              
              return {
                text: `${label}: ${value.toLocaleString()} (${percentage}%)`,
                fillStyle: chartColors[i],
                strokeStyle: darkMode ? '#ffffff' : chartColors[i],
                lineWidth: 1,
                hidden: isNaN(datasets[0].data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                index: i
              };
            });
          }
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
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          },
          title: function(tooltipItems) {
            return tooltipItems[0].label || '';
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
      easing: 'easeOutQuart'
    },
    cutout: '60%',
    radius: '90%'
  };

  // ✅ رنگوں کو ہلکا کرنے کا فنکشن
  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  };

  // ✅ رنگوں کو گہرا کرنے کا فنکشن
  const darkenColor = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (
      0x1000000 +
      (R > 0 ? R : 0) * 0x10000 +
      (G > 0 ? G : 0) * 0x100 +
      (B > 0 ? B : 0)
    ).toString(16).slice(1);
  };

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
      <Pie data={chartData} options={options} />
      
      {/* ✅ اضافی انفارمیشن dark mode کے لیے */}
      {darkMode && data.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          <div style={{
            fontSize: '14px',
            color: themeColors.textSecondary,
            marginBottom: '4px'
          }}>
            Total
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: themeColors.textPrimary
          }}>
            {data.reduce((a, b) => a + b, 0).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPieChart;