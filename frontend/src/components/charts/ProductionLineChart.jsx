// src/components/charts/ProductionLineChart.jsx
import React, { useMemo } from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';

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

// ----------------------
// Main Component
// ----------------------
const ProductionLineChart = ({
  title = 'Production Trends',
  data = [],
  labels = [],
  fillColor = null,
  lineColor,
  height = 300,
  unit = '',
  showStats = true,      // نیا prop - stats دکھانا ہے یا نہیں
  showLegend = true,
  showGrid = true,
  tension = 0.4,
  pointStyle = 'circle',
  showValues = false,
}) => {
  const { isDarkMode } = useTheme();

  const getCssVar = (name) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  };

  const chartValues = data.length ? data : [120, 190, 150, 220, 180, 250, 300];
  const chartLabels = labels.length ? labels : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // ----------------------
  // Colors
  // ----------------------
  const resolvedPrimaryColor = useMemo(() => {
    const color = lineColor || (isDarkMode ? 'var(--color-icon)' : 'var(--color-primary)');
    return color.startsWith('var') ? getCssVar(color.replace(/var\(|\)/g, '')) : color;
  }, [lineColor, isDarkMode]);

  const resolvedSecondaryColor = useMemo(() => {
    const color = isDarkMode ? 'var(--color-icon-secondary)' : 'var(--color-secondary)';
    return getCssVar(color.replace(/var\(|\)/g, '')) || '#5C6BC0';
  }, [isDarkMode]);

  const computedFillColor = useMemo(() => fillColor || `${resolvedPrimaryColor}${isDarkMode ? '20' : '15'}`, [
    fillColor, resolvedPrimaryColor, isDarkMode
  ]);

  const gridColor = showGrid
    ? isDarkMode
      ? 'rgba(227,242,253,0.1)'
      : 'rgba(26,35,126,0.1)'
    : 'transparent';

  // ----------------------
  // Stats Calculation
  // ----------------------
  const stats = useMemo(() => {
    const total = chartValues.reduce((a, b) => a + b, 0);
    const avg = total / chartValues.length;
    const max = Math.max(...chartValues);
    const min = Math.min(...chartValues);
    const trend = chartValues[chartValues.length - 1] - chartValues[0];
    return { max, min, avg, trend, total };
  }, [chartValues]);

  // ----------------------
  // Chart Data
  // ----------------------
  const chartData = useMemo(() => {
    const datasets = [
      {
        label: `Production${unit ? ` (${unit})` : ''}`,
        data: chartValues,
        borderColor: resolvedPrimaryColor,
        backgroundColor: computedFillColor,
        borderWidth: 2,
        tension,
        fill: true,
        pointBackgroundColor: isDarkMode ? resolvedPrimaryColor : 'white',
        pointBorderColor: resolvedPrimaryColor,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle,
      }
    ];

    if (chartValues.some(v => v > 500)) {
      datasets.push({
        label: `Target${unit ? ` (${unit})` : ''}`,
        data: chartValues.map(v => Math.round(v * 1.1)),
        borderColor: resolvedSecondaryColor,
        borderDash: [5, 5],
        fill: false,
        tension,
        pointRadius: 0
      });
    }

    return { labels: chartLabels, datasets };
  }, [chartValues, chartLabels, resolvedPrimaryColor, resolvedSecondaryColor, computedFillColor, tension, pointStyle, unit, isDarkMode]);

  // ----------------------
  // Chart Options
  // ----------------------
  const maxValue = Math.max(...chartValues);
  const stepSize = Math.max(1, Math.ceil(maxValue / 5));

  const options = useMemo(() => ({
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
          label: (ctx) => {
            const label = ctx.dataset.label || '';
            return `${label}: ${ctx.parsed.y.toLocaleString()}${unit ? ` ${unit}` : ''}`;
          }
        }
      },
    },
    scales: {
      x: { 
        grid: { 
          display: showGrid, 
          color: gridColor 
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: { 
          display: showGrid, 
          color: gridColor 
        },
        ticks: { 
          stepSize, 
          callback: v => v.toLocaleString(),
          color: isDarkMode ? '#9ca3af' : '#6b7280'
        }
      }
    },
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 800 },
  }), [showLegend, title, unit, showGrid, gridColor, stepSize, isDarkMode]);

  // ----------------------
  // Render Stats Box
  // ----------------------
  const renderStats = () => {
    if (!showStats || chartValues.length === 0) return null;

    return (
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
        {/* Total */}
        <div>
          <strong style={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}>Total:</strong>{' '}
          <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
            {stats.total.toLocaleString()}{unit ? ` ${unit}` : ''}
          </span>
        </div>

        {/* Average */}
        <div>
          <strong style={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}>Avg:</strong>{' '}
          <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
            {Math.round(stats.avg).toLocaleString()}{unit ? ` ${unit}` : ''}
          </span>
        </div>

        {/* Max */}
        <div>
          <strong style={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}>Max:</strong>{' '}
          <span style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>
            {stats.max.toLocaleString()}{unit ? ` ${unit}` : ''}
          </span>
        </div>

        {/* Trend */}
        <div>
          <strong style={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}>Trend:</strong>{' '}
          <span style={{ 
            color: stats.trend >= 0 
              ? (isDarkMode ? '#34d399' : '#10b981') 
              : (isDarkMode ? '#f87171' : '#ef4444'),
            fontWeight: 600
          }}>
            {stats.trend >= 0 ? '↑' : '↓'} {Math.abs(stats.trend).toLocaleString()}{unit ? ` ${unit}` : ''}
          </span>
        </div>
      </div>
    );
  };

  // ----------------------
  // Render
  // ----------------------
  return (
    <div style={{ position: 'relative', height: `${height}px`, width: '100%' }}>
      {/* Stats Box - صرف اس وقت دکھے گا جب showStats = true ہو */}
      {renderStats()}

      {/* Chart */}
      <Line data={chartData} options={options} />

      {/* Empty State */}
      {chartValues.length === 0 && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          fontSize: '14px',
          borderRadius: '8px'
        }}>
          No production data available
        </div>
      )}
    </div>
  );
};

export default ProductionLineChart;