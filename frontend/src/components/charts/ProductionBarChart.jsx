// src/components/charts/ProductionBarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProductionBarChart = ({ 
  title = 'Production Output',
  data,
  labels,
  colors = null,
  height = 300,
  darkMode = false,
  unit = 'Kg'
}) => {
  const getThemeColor = (colorName) => {
    if (typeof document === 'undefined') return '#000000';
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${colorName}`)
      .trim();
    return color || '#000000';
  };

  const themeColors = {
    textPrimary: getThemeColor('text-primary') || (darkMode ? '#7986CB' : '#1A237E'),
    textSecondary: getThemeColor('text-secondary') || (darkMode ? '#9FA8DA' : '#283593'),
    border: getThemeColor('border'),
    primary: getThemeColor('primary'),
    background: getThemeColor('background'),
  };

  const indigoColors = [
    '#1A237E', '#283593', '#303F9F', '#3949AB', 
    '#3F51B5', '#5C6BC0', '#7986CB', '#9FA8DA'
  ];

  const barColors = colors || indigoColors;

  const chartData = {
    labels: labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: `Production (${unit})`,
        data: data || [120, 190, 150, 220, 180, 250],
        backgroundColor: barColors,
        borderColor: barColors.map(color => color),
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 13, family: "'Inter', sans-serif" },
          color: themeColors.textSecondary,
        }
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 18, weight: '600', family: "'Inter', sans-serif" },
        color: themeColors.textPrimary,
        padding: { bottom: 25, top: 10 }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: themeColors.textPrimary,
        bodyColor: themeColors.textSecondary,
        titleFont: { size: 14, family: "'Inter', sans-serif", weight: '600' },
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        padding: 16,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString() + ' ' + unit;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: themeColors.textSecondary,
          font: { size: 12, family: "'Inter', sans-serif", weight: '500' }
        },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: themeColors.textSecondary,
          font: { size: 12, family: "'Inter', sans-serif", weight: '500' },
          callback: function(value) {
            return value.toLocaleString() + ' ' + unit;
          }
        },
        border: { display: false }
      },
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      height: `${height}px`,
      width: '100%'
    }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProductionBarChart;