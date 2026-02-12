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
  pointStyle = 'circle'
}) => {
  
  // ✅ تھیم کنٹیکسٹ سے ڈارک موڈ حاصل کریں
  const { isDarkMode } = useTheme();
  
  // ✅ CSS Variables سے کلرز حاصل کریں
  const getCssVar = (varName) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  // ✅ تھیم کے مطابق پرائمری کلر (انڈیگو/نیوی سپیکٹرم)
  const primaryColor = lineColor || (isDarkMode ? 'var(--color-icon)' : 'var(--color-primary)');
  const resolvedPrimaryColor = primaryColor.startsWith('var') 
    ? getCssVar(primaryColor.replace('var(', '').replace(')', '')) 
    : primaryColor;

  // ✅ تھیم کے مطابق سیکنڈری کلر
  const secondaryColor = isDarkMode 
    ? 'var(--color-icon-secondary)' 
    : 'var(--color-secondary)';
  const resolvedSecondaryColor = getCssVar(secondaryColor.replace('var(', '').replace(')', '')) || '#5C6BC0';

  // ✅ تھیم کے مطابق CSS Variables
  const themeColors = {
    // Backgrounds
    background: isDarkMode ? 'var(--color-background)' : 'var(--color-background)',
    surface: isDarkMode ? 'var(--color-surface)' : 'var(--color-surface)',
    card: isDarkMode ? 'var(--color-card-bg)' : 'var(--color-card-bg)',
    paper: isDarkMode ? 'var(--color-paper)' : 'var(--color-paper)',
    
    // Text
    textPrimary: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
    textSecondary: isDarkMode ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)',
    textTertiary: isDarkMode ? 'var(--color-text-tertiary)' : 'var(--color-text-tertiary)',
    textMuted: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
    
    // Borders
    border: isDarkMode ? 'var(--color-border)' : 'var(--color-border)',
    borderLight: isDarkMode ? 'var(--color-border-light)' : 'var(--color-border-light)',
    divider: isDarkMode ? 'var(--color-divider)' : 'var(--color-divider)',
    
    // Grid
    gridLine: isDarkMode ? 'rgba(227, 242, 253, 0.1)' : 'rgba(26, 35, 126, 0.1)',
    
    // Status
    success: isDarkMode ? 'var(--color-success)' : 'var(--color-success)',
    warning: isDarkMode ? 'var(--color-warning)' : 'var(--color-warning)',
    error: isDarkMode ? 'var(--color-error)' : 'var(--color-error)',
    info: isDarkMode ? 'var(--color-info)' : 'var(--color-info)',
    
    // Icons
    icon: isDarkMode ? 'var(--color-icon)' : 'var(--color-icon)',
    iconSecondary: isDarkMode ? 'var(--color-icon-secondary)' : 'var(--color-icon-secondary)',
  };

  // ✅ تھیم کے مطابق fill color
  const getFillColor = () => {
    if (fillColor) return fillColor;
    
    if (isDarkMode) {
      return `${resolvedPrimaryColor}20`; // 12% opacity in dark mode
    }
    return `${resolvedPrimaryColor}15`; // 8% opacity in light mode
  };

  // ✅ تھیم کے مطابق گرڈ لائنز
  const getGridColor = () => {
    if (!showGrid) return 'transparent';
    return themeColors.gridLine;
  };

  // ✅ Default data
  const defaultData = [120, 190, 150, 220, 180, 250, 300];
  const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ✅ تھیم کے مطابق چارٹ ڈیٹا
  const chartData = {
    labels: labels.length > 0 ? labels : defaultLabels,
    datasets: [
      {
        label: `Production${unit ? ` (${unit})` : ''}`,
        data: data.length > 0 ? data : defaultData,
        borderColor: resolvedPrimaryColor,
        backgroundColor: getFillColor(),
        borderWidth: isDarkMode ? 2.5 : 2,
        tension: tension,
        fill: true,
        pointBackgroundColor: isDarkMode ? resolvedPrimaryColor : 'white',
        pointBorderColor: resolvedPrimaryColor,
        pointBorderWidth: isDarkMode ? 2 : 1.5,
        pointRadius: isDarkMode ? 4 : 3.5,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: isDarkMode ? 'white' : resolvedPrimaryColor,
        pointHoverBorderColor: resolvedPrimaryColor,
        pointStyle: pointStyle,
      },
    ],
  };

  // ✅ اگر زیادہ ڈیٹا ہے تو دوسرا ڈیٹاسیٹ شامل کریں (example)
  if (data.length > 0 && data.some(val => val > 500)) {
    chartData.datasets.push({
      label: `Target${unit ? ` (${unit})` : ''}`,
      data: data.map(val => Math.round(val * 1.1)),
      borderColor: resolvedSecondaryColor,
      backgroundColor: 'transparent',
      borderWidth: isDarkMode ? 1.5 : 1,
      borderDash: [5, 5],
      tension: tension,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: resolvedSecondaryColor,
      pointHoverBorderColor: resolvedSecondaryColor,
    });
  }

  // ✅ تھیم کے مطابق آپشنز
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: showStats && data.length > 0 ? 50 : 20,
        bottom: 20,
        left: 10,
        right: 20
      }
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        align: 'end',
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'line',
          boxWidth: 8,
          boxHeight: 8,
          font: {
            size: 12,
            family: getCssVar('--font-family') || "'Inter', sans-serif",
            weight: '500'
          },
          color: isDarkMode ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)',
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: '600',
          family: getCssVar('--font-family') || "'Inter', sans-serif"
        },
        color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
        padding: {
          bottom: 25
        },
        align: 'start'
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode 
          ? 'var(--color-surface)' 
          : 'var(--color-paper)',
        titleColor: isDarkMode 
          ? 'var(--color-text-primary)' 
          : 'var(--color-text-primary)',
        bodyColor: isDarkMode 
          ? 'var(--color-text-secondary)' 
          : 'var(--color-text-secondary)',
        titleFont: {
          size: 13,
          weight: '600',
          family: getCssVar('--font-family') || "'Inter', sans-serif"
        },
        bodyFont: {
          size: 12,
          family: getCssVar('--font-family') || "'Inter', sans-serif"
        },
        padding: 12,
        cornerRadius: 8,
        borderColor: isDarkMode 
          ? 'var(--color-border)' 
          : 'var(--color-border-light)',
        borderWidth: 1,
        displayColors: true,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            const label = context.dataset.label || 'Production';
            return `${label}: ${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: showGrid,
          color: getGridColor(),
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: true,
          lineWidth: 1,
        },
        ticks: {
          color: isDarkMode ? 'var(--color-text-tertiary)' : 'var(--color-text-tertiary)',
          font: {
            size: 11,
            family: getCssVar('--font-family') || "'Inter', sans-serif",
            weight: '400'
          },
          padding: 8,
          maxRotation: 45,
          minRotation: 0
        },
        border: {
          color: isDarkMode ? 'var(--color-border)' : 'var(--color-border)',
          width: 1
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: showGrid,
          color: getGridColor(),
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: true,
          lineWidth: 1,
        },
        ticks: {
          color: isDarkMode ? 'var(--color-text-tertiary)' : 'var(--color-text-tertiary)',
          font: {
            size: 11,
            family: getCssVar('--font-family') || "'Inter', sans-serif",
            weight: '400'
          },
          padding: 8,
          stepSize: Math.ceil(Math.max(...(data.length > 0 ? data : defaultData)) / 5),
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        border: {
          color: isDarkMode ? 'var(--color-border)' : 'var(--color-border)',
          width: 1
        },
        title: {
          display: !!unit,
          text: unit,
          color: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
          font: {
            size: 11,
            family: getCssVar('--font-family') || "'Inter', sans-serif",
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
      duration: 800,
      easing: 'easeOutQuart'
    },
    elements: {
      line: {
        cubicInterpolationMode: 'monotone'
      },
      point: {
        hoverBorderWidth: 2
      }
    },
    hover: {
      mode: 'index',
      intersect: false
    }
  };

  // ✅ Statistics calculation
  const chartDataValues = data.length > 0 ? data : defaultData;
  const maxValue = Math.max(...chartDataValues);
  const minValue = Math.min(...chartDataValues);
  const averageValue = chartDataValues.reduce((a, b) => a + b, 0) / chartDataValues.length;
  const lastValue = chartDataValues[chartDataValues.length - 1];
  const firstValue = chartDataValues[0];
  const trend = lastValue - firstValue;
  const trendPercentage = firstValue !== 0 ? ((trend / firstValue) * 100).toFixed(1) : 0;

  return (
    <div style={{ 
      position: 'relative',
      height: `${height}px`,
      width: '100%',
      background: isDarkMode ? 'var(--color-card-bg)' : 'var(--color-card-bg)',
      borderRadius: 'var(--radius-xl)',
      padding: 'var(--spacing-lg)',
      border: `1px solid ${isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)'}`,
      boxShadow: isDarkMode 
        ? 'var(--shadow-lg)' 
        : 'var(--shadow-md)',
      transition: 'all var(--transition-base)',
    }}>
      
      {/* ✅ Stats Summary - تھیم کے مطابق */}
      {showStats && data.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'var(--spacing-md)',
          right: 'var(--spacing-lg)',
          display: 'flex',
          gap: 'var(--spacing-lg)',
          zIndex: 10,
          background: isDarkMode 
            ? 'var(--color-surface)' 
            : 'var(--color-paper)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-full)',
          border: `1px solid ${isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)'}`,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
              marginBottom: '2px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Max
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '700',
              color: resolvedPrimaryColor,
            }}>
              {maxValue.toLocaleString()}{unit}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
              marginBottom: '2px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Avg
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '700',
              color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
            }}>
              {Math.round(averageValue).toLocaleString()}{unit}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
              marginBottom: '2px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Trend
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '700',
              color: trend >= 0 
                ? (isDarkMode ? 'var(--color-success)' : 'var(--color-success)')
                : (isDarkMode ? 'var(--color-error)' : 'var(--color-error)'),
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toLocaleString()}{unit}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Chart Container */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}>
        <Line data={chartData} options={options} />
      </div>

      {/* ✅ No Data Message */}
      {data.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '500',
          background: isDarkMode ? 'var(--color-surface)' : 'var(--color-paper)',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          borderRadius: 'var(--radius-full)',
          border: `1px solid ${isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)'}`,
          zIndex: 5
        }}>
          No production data available
        </div>
      )}

      {/* ✅ CSS Variables Animation */}
      <style>{`
        .chart-container {
          transition: all var(--transition-base);
        }
      `}</style>
    </div>
  );
};

export default ProductionLineChart;