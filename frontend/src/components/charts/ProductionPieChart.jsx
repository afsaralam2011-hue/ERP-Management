// src/components/charts/ProductionPieChart.jsx
import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProductionPieChart = ({ 
  title, 
  labels, 
  data, 
  colors = ['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#ec4899', '#ef4444'],
  height = 300,
  darkMode = false
}) => {
  
  // 🔥 **Fix: Move darkenColor function to the top**
  const darkenColor = (color, percent = 20) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
  };

  const chartData = useMemo(() => {
    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors.map(color => 
            darkMode ? darkenColor(color, 10) : color
          ),
          borderColor: colors.map(color => 
            darkMode ? darkenColor(color, 30) : darkenColor(color, 20)
          ),
          borderWidth: 2,
          hoverBackgroundColor: colors.map(color => 
            darkMode ? darkenColor(color, 5) : darkenColor(color, -10)
          ),
          hoverBorderColor: colors.map(color => 
            darkMode ? darkenColor(color, 40) : darkenColor(color, 30)
          ),
          hoverBorderWidth: 3
        }
      ]
    };
  }, [labels, data, colors, darkMode]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: darkMode ? '#e5e7eb' : '#374151',
            font: {
              size: 13,
              family: "'Inter', sans-serif"
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          titleColor: darkMode ? '#e5e7eb' : '#111827',
          bodyColor: darkMode ? '#d1d5db' : '#374151',
          borderColor: darkMode ? '#4b5563' : '#d1d5db',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          boxPadding: 6,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '50%',
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1000
      }
    };
  }, [darkMode]);

  return (
    <div style={{ 
      position: 'relative',
      height: `${height}px`,
      width: '100%'
    }}>
      {title && (
        <div style={{ 
          marginBottom: '15px',
          padding: '0 10px'
        }}>
          <h3 style={{
            margin: '0',
            fontSize: '18px',
            fontWeight: '600',
            color: darkMode ? '#f3f4f6' : '#111827'
          }}>
            {title}
          </h3>
        </div>
      )}
      
      <div style={{ 
        position: 'relative',
        height: `${height - (title ? 40 : 0)}px`,
        width: '100%'
      }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ProductionPieChart;