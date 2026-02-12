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
  unit = 'Kg',
  showLegend = true,
  showGrid = true,
  horizontal = false,
  stacked = false,
  showValues = false,
  borderRadius = 8,
  barThickness = 'flex',
  maxBarThickness = 40,
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
        label: `Production (${unit})`,
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
        label: `Target (${unit})`,
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
      legend: { display: showLegend, position: 'top' },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed[
              horizontal ? 'x' : 'y'
            ];
            return `${context.dataset.label}: ${value.toLocaleString()} ${unit}`;
          }
        }
      },
    },
    scales: {
      x: {
        stacked,
        grid: { display: horizontal ? false : showGrid }
      },
      y: {
        stacked,
        beginAtZero: true,
        grid: { display: !horizontal ? showGrid : false },
        ticks: {
          stepSize,
          callback: (val) => val.toLocaleString()
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
      {data.length > 0 && (
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
          <div><strong>Total:</strong> {stats.total.toLocaleString()}{unit}</div>
          <div><strong>Avg:</strong> {Math.round(stats.avg).toLocaleString()}{unit}</div>
          <div><strong>Max:</strong> {stats.max.toLocaleString()}{unit}</div>
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
            justifyContent: 'center'
          }}
        >
          No production data available
        </div>
      )}
    </div>
  );
};

export default ProductionBarChart;
