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
  
  // ✅ تھیم کنٹیکسٹ سے ڈارک موڈ حاصل کریں
  const { isDarkMode } = useTheme();
  
  // ✅ CSS Variables سے کلرز حاصل کریں
  const getCssVar = (varName) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  // ✅ تھیم کے مطابق پرائمری کلر (انڈیگو/نیوی سپیکٹرم)
  const primaryColor = isDarkMode ? 'var(--color-icon)' : 'var(--color-primary)';
  const resolvedPrimaryColor = getCssVar(primaryColor.replace('var(', '').replace(')', '')) || (isDarkMode ? '#64B5F6' : '#303F9F');
  
  const secondaryColor = isDarkMode ? 'var(--color-icon-secondary)' : 'var(--color-secondary)';
  const resolvedSecondaryColor = getCssVar(secondaryColor.replace('var(', '').replace(')', '')) || (isDarkMode ? '#5C6BC0' : '#1976D2');

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
    gridLine: isDarkMode ? 'rgba(227, 242, 253, 0.08)' : 'rgba(26, 35, 126, 0.08)',
    
    // Status
    success: isDarkMode ? 'var(--color-success)' : 'var(--color-success)',
    warning: isDarkMode ? 'var(--color-warning)' : 'var(--color-warning)',
    error: isDarkMode ? 'var(--color-error)' : 'var(--color-error)',
    info: isDarkMode ? 'var(--color-info)' : 'var(--color-info)',
  };

  // ✅ انڈیگو/نیوی کلر پیلیٹ - تھیم کے مطابق
  const indigoPalette = {
    light: [
      '#1A237E', // 900
      '#283593', // 800
      '#303F9F', // 700
      '#3949AB', // 600
      '#3F51B5', // 500
      '#5C6BC0', // 400
      '#7986CB', // 300
      '#9FA8DA', // 200
      '#C5CAE9', // 100
      '#E8EAF6', // 50
    ],
    dark: [
      '#E3F2FD', // 50
      '#BBDEFB', // 100
      '#90CAF9', // 200
      '#64B5F6', // 300
      '#42A5F5', // 400
      '#2196F3', // 500
      '#1E88E5', // 600
      '#1976D2', // 700
      '#1565C0', // 800
      '#0D47A1', // 900
    ]
  };

  // ✅ تھیم کے مطابق بار کلرز
  const getBarColors = () => {
    if (colors) return colors;
    
    const palette = isDarkMode ? indigoPalette.dark : indigoPalette.light;
    const dataLength = data.length || 6;
    
    // اگر ڈیٹا زیادہ ہے تو کلرز کو ریپیٹ کریں
    return Array.from({ length: dataLength }, (_, i) => 
      palette[i % palette.length]
    );
  };

  const barColors = getBarColors();

  // ✅ تھیم کے مطابق بار بارڈر کلرز
  const getBorderColors = () => {
    if (isDarkMode) {
      return barColors.map(color => color + '80'); // 50% opacity for dark mode
    }
    return barColors.map(color => color); // Full color for light mode
  };

  // ✅ Default data
  const defaultData = [120, 190, 150, 220, 180, 250];
  const defaultLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  // ✅ تھیم کے مطابق چارٹ ڈیٹا
  const chartData = {
    labels: labels.length > 0 ? labels : defaultLabels,
    datasets: [
      {
        label: `Production (${unit})`,
        data: data.length > 0 ? data : defaultData,
        backgroundColor: barColors,
        borderColor: getBorderColors(),
        borderWidth: isDarkMode ? 1.5 : 1,
        borderRadius: borderRadius,
        borderSkipped: false,
        barPercentage: 0.8,
        categoryPercentage: 0.9,
        barThickness: barThickness,
        maxBarThickness: maxBarThickness,
      },
    ],
  };

  // ✅ اگر stacked ہے تو دوسرا ڈیٹاسیٹ شامل کریں (example)
  if (stacked && data.length > 0) {
    chartData.datasets.push({
      label: `Target (${unit})`,
      data: data.map(val => Math.round(val * 0.8)),
      backgroundColor: isDarkMode 
        ? 'rgba(144, 202, 249, 0.3)' 
        : 'rgba(197, 202, 233, 0.5)',
      borderColor: isDarkMode ? '#90CAF9' : '#C5CAE9',
      borderWidth: 1,
      borderRadius: borderRadius,
      borderSkipped: false,
      barPercentage: 0.8,
      categoryPercentage: 0.9,
    });
  }

  // ✅ تھیم کے مطابق گرڈ کلر
  const getGridColor = () => {
    if (!showGrid) return 'transparent';
    return themeColors.gridLine;
  };

  // ✅ تھیم کے مطابق آپشنز
  const options = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
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
          pointStyle: 'rectRounded',
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
          bottom: 25,
          top: 10
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
            let label = context.dataset.label || '';
            let value = context.parsed[horizontal ? 'x' : 'y'];
            if (label) label += ': ';
            if (value !== null) {
              label += value.toLocaleString() + ' ' + unit;
            }
            return label;
          }
        }
      },
      // ✅ Values on bars
      datalabels: showValues ? {
        display: true,
        color: isDarkMode ? 'var(--color-text-primary)' : 'white',
        anchor: 'end',
        align: 'top',
        offset: 4,
        font: {
          weight: '600',
          size: 11,
          family: getCssVar('--font-family') || "'Inter', sans-serif"
        },
        formatter: (value) => value.toLocaleString()
      } : { display: false }
    },
    scales: {
      x: {
        stacked: stacked,
        grid: {
          display: horizontal ? false : showGrid,
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
            weight: '500'
          },
          padding: 8,
          maxRotation: 45,
          minRotation: 0
        },
        border: {
          color: isDarkMode ? 'var(--color-border)' : 'var(--color-border)',
          width: 0.5
        }
      },
      y: {
        stacked: stacked,
        beginAtZero: true,
        grid: {
          display: !horizontal ? showGrid : false,
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
            weight: '500'
          },
          padding: 8,
          stepSize: Math.ceil(Math.max(...(data.length > 0 ? data : defaultData)) / 5),
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        border: {
          color: isDarkMode ? 'var(--color-border)' : 'var(--color-border)',
          width: 0.5
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
    hover: {
      mode: 'index',
      intersect: false
    }
  };

  // ✅ Statistics calculation
  const chartDataValues = data.length > 0 ? data : defaultData;
  const totalValue = chartDataValues.reduce((a, b) => a + b, 0);
  const maxValue = Math.max(...chartDataValues);
  const minValue = Math.min(...chartDataValues);
  const averageValue = totalValue / chartDataValues.length;

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
      {data.length > 0 && (
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
              Total
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '700',
              color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
            }}>
              {totalValue.toLocaleString()}{unit}
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
              Average
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '700',
              color: resolvedSecondaryColor,
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
              Max
            </div>
            <div style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '700',
              color: isDarkMode ? 'var(--color-success)' : 'var(--color-success)',
            }}>
              {maxValue.toLocaleString()}{unit}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Chart Container */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        marginTop: data.length > 0 ? '40px' : '0',
      }}>
        <Bar data={chartData} options={options} />
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
    </div>
  );
};

export default ProductionBarChart;