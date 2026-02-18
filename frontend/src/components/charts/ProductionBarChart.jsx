// src/components/charts/ProductionBarChart.jsx
import React, { useMemo } from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';

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
  data = [],
  labels = [],
  colors = null,
  height = 300,
  unit = '',
  showLegend = true,
  showGrid = true,
  horizontal = false,
  stacked = false,
  showValues = false,
  borderRadius = 8,
  barThickness = 'flex',
  maxBarThickness = 40,
  showStats = true,  // نیا prop - stats دکھانا ہے یا نہیں
}) => {

  const { isDarkMode } = useTheme();

  /* --------------------------
     Helpers
  -------------------------- */

  const getCssVar = (name) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  };

  const indigoPalette = {
    light: [
      '#1A237E','#283593','#303F9F','#3949AB','#3F51B5',
      '#5C6BC0','#7986CB','#9FA8DA','#C5CAE9','#E8EAF6'
    ],
    dark: [
      '#E3F2FD','#BBDEFB','#90CAF9','#64B5F6','#42A5F5',
      '#2196F3','#1E88E5','#1976D2','#1565C0','#0D47A1'
    ]
  };

  const defaultData = [120, 190, 150, 220, 180, 250];
  const defaultLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const chartValues = data.length ? data : defaultData;
  const chartLabels = labels.length ? labels : defaultLabels;

  /* --------------------------
     Colors (Memoized)
  -------------------------- */

  const barColors = useMemo(() => {
    if (colors) return colors;

    const palette = isDarkMode
      ? indigoPalette.dark
      : indigoPalette.light;

    return chartValues.map((_, i) => palette[i % palette.length]);
  }, [colors, isDarkMode, chartValues]);

  const borderColors = useMemo(() => {
    return isDarkMode
      ? barColors.map(c => `${c}80`)
      : barColors;
  }, [barColors, isDarkMode]);

  /* --------------------------
     Statistics (Memoized)
  -------------------------- */

  const stats = useMemo(() => {
    const total = chartValues.reduce((a, b) => a + b, 0);
    const max = Math.max(...chartValues);
    const min = Math.min(...chartValues);
    const avg = total / chartValues.length;

    return { total, max, min, avg };
  }, [chartValues]);

  /* --------------------------
     Chart Data
  -------------------------- */

  const chartData = useMemo(() => {
    const datasets = [
      {
        label: `Production ${unit ? `(${unit})` : ''}`,
        data: chartValues,
        backgroundColor: barColors,
        borderColor: borderColors,
        borderWidth: isDarkMode ? 1.5 : 1,
        borderRadius,
        borderSkipped: false,
        barThickness,
        maxBarThickness,
      },
    ];

    if (stacked && data.length) {
      datasets.push({
        label: `Target ${unit ? `(${unit})` : ''}`,
        data: chartValues.map(v => Math.round(v * 0.8)),
        backgroundColor: isDarkMode
          ? 'rgba(144,202,249,0.3)'
          : 'rgba(197,202,233,0.5)',
        borderColor: isDarkMode ? '#90CAF9' : '#C5CAE9',
        borderWidth: 1,
        borderRadius,
        borderSkipped: false,
      });
    }

    return { labels: chartLabels, datasets };
  }, [
    chartLabels,
    chartValues,
    barColors,
    borderColors,
    unit,
    isDarkMode,
    stacked,
    data.length,
    borderRadius,
    barThickness,
    maxBarThickness
  ]);

  /* --------------------------
     Options
  -------------------------- */

  const maxValue = Math.max(...chartValues);
  const stepSize = Math.max(1, Math.ceil(maxValue / 5));

  const options = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: showLegend, 
        position: 'top',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#1f2937'
        }
      },
      title: {
        display: !!title,
        text: title,
        color: isDarkMode ? '#e5e7eb' : '#1f2937'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#e5e7eb' : '#1f2937',
        bodyColor: isDarkMode ? '#d1d5db' : '#4b5563',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = context.parsed[
              horizontal ? 'x' : 'y'
            ];
            const label = context.dataset.label || '';
            return `${label}: ${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
          }
        }
      },
    },
    scales: {
      x: {
        stacked,
        grid: { 
          display: horizontal ? false : showGrid,
          color: isDarkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        stacked,
        beginAtZero: true,
        grid: { 
          display: !horizontal ? showGrid : false,
          color: isDarkMode ? '#374151' : '#e5e7eb'
        },
        ticks: {
          stepSize,
          callback: (val) => val.toLocaleString(),
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
  };

  /* --------------------------
     Render
  -------------------------- */

  return (
    <div
      style={{
        position: 'relative',
        height: `${height}px`,
        width: '100%',
      }}
    >
      {/* Stats Box - صرف اس وقت دکھے گا جب showStats = true ہو */}
      {data.length > 0 && showStats && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            gap: 20,
            zIndex: 10,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontSize: '13px'
          }}
        >
          <div>
            <strong style={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}>Total:</strong>{' '}
            <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
              {stats.total.toLocaleString()}{unit ? ` ${unit}` : ''}
            </span>
          </div>
          <div>
            <strong style={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}>Avg:</strong>{' '}
            <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
              {Math.round(stats.avg).toLocaleString()}{unit ? ` ${unit}` : ''}
            </span>
          </div>
          <div>
            <strong style={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}>Max:</strong>{' '}
            <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
              {stats.max.toLocaleString()}{unit ? ` ${unit}` : ''}
            </span>
          </div>
        </div>
      )}

      <Bar data={chartData} options={options} />

      {data.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            fontSize: '14px',
            borderRadius: '8px'
          }}
        >
          No production data available
        </div>
      )}
    </div>
  );
};

export default ProductionBarChart;