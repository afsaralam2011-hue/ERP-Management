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
  fillColor = 'rgba(59, 130, 246, 0.1)',
  lineColor = '#3b82f6',
  height = 300
}) => {
  const defaultData = [120, 190, 150, 220, 180, 250, 300];
  const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const chartData = {
    labels: labels.length > 0 ? labels : defaultLabels,
    datasets: [
      {
        label: 'Production',
        data: data.length > 0 ? data : defaultData,
        borderColor: lineColor,
        backgroundColor: fillColor,
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: lineColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Production: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)'
        },
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      height: `${height}px`,
      width: '100%'
    }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ProductionLineChart;