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
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  height = 300
}) => {
  const chartData = {
    labels: labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Production',
        data: data || [120, 190, 150, 220, 180, 250],
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 6,
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
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: '#64748b'
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
        color: '#1e293b',
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif"
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        border: {
          dash: [4, 4],
          display: false
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear'
      }
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