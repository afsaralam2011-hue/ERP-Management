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
// Reusable Stats Component
// ----------------------
const ChartStats = ({ stats, unit, isDarkMode }) => (
  <div
    style={{
      position: 'absolute',
      top: 10,
      right: 10,
      display: 'flex',
      gap: 20,
      zIndex: 10
    }}
  >
    {['max', 'avg', 'trend'].map((key) => {
      let label = key.toUpperCase();
      let value = stats[key];
      let color = 'inherit';

      if (key === 'trend') {
        color = value >= 0 ? 'green' : 'red';
        value = `${value >= 0 ? '↑' : '↓'} ${Math.abs(value).toLocaleString()}${unit}`;
      } else {
        value = `${Math.round(value).toLocaleString()}${unit}`;
      }

      return (
        <div key={key} style={{ textAlign: 'center', color }}>
          <div style={{ fontSize: 10, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
        </div>
      );
    })}
  </div>
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
  showStats = true,
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
    return { max, min, avg, trend };
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
        labels: { color: isDarkMode ? 'white' : 'black' }
      },
      title: { display: !!title, text: title },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}${unit ? ` ${unit}` : ''}`
        }
      },
    },
    scales: {
      x: { grid: { display: showGrid, color: gridColor } },
      y: {
        beginAtZero: true,
        grid: { display: showGrid, color: gridColor },
        ticks: { stepSize, callback: v => v.toLocaleString() }
      }
    },
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 800 },
  }), [showLegend, title, unit, showGrid, gridColor, stepSize, isDarkMode]);

  // ----------------------
  // Render
  // ----------------------
  return (
    <div style={{ position: 'relative', height: `${height}px`, width: '100%' }}>
      {showStats && chartValues.length > 0 && <ChartStats stats={stats} unit={unit} isDarkMode={isDarkMode} />}
      <Line data={chartData} options={options} />
      {chartValues.length === 0 && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No production data available</div>}
    </div>
  );
};

export default ProductionLineChart;
