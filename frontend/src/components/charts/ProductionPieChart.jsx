// src/components/charts/ProductionPieChart.jsx
import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProductionPieChart = ({ 
  title,
  labels = [],
  data = [],
  colors = null,
  height = 300,
  cutout = '50%',
  showLegend = true,
  showPercentages = true,
  showValues = true,
  donut = true,
  unit = ''
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

  // ✅ تھیم کے مطابق کلرز
  const getPaletteColors = () => {
    const palette = isDarkMode ? indigoPalette.dark : indigoPalette.light;
    const dataLength = data.length || 6;
    
    // اگر صارف نے کلرز دیے ہیں تو وہ استعمال کریں
    if (colors && colors.length > 0) {
      return colors;
    }
    
    // ورنہ انڈیگو پیلیٹ سے کلرز لیں
    return Array.from({ length: dataLength }, (_, i) => 
      palette[i % palette.length]
    );
  };

  const paletteColors = getPaletteColors();

  // ✅ کلر کو ہلکا/گہرا کرنے کا فنکشن
  const adjustColor = (color, percent) => {
    if (!color || color === 'transparent') return color;
    
    try {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      const adjust = (channel) => {
        const value = channel + (channel * percent / 100);
        return Math.min(255, Math.max(0, Math.round(value)));
      };
      
      const newR = adjust(r).toString(16).padStart(2, '0');
      const newG = adjust(g).toString(16).padStart(2, '0');
      const newB = adjust(b).toString(16).padStart(2, '0');
      
      return `#${newR}${newG}${newB}`;
    } catch (err) {
      console.error('Error adjusting color:', err);
      return color;
    }
  };

  // ✅ ڈارک موڈ میں کلرز کو ایڈجسٹ کریں
  const getBackgroundColors = () => {
    return paletteColors.map(color => 
      isDarkMode ? adjustColor(color, 20) : color // Dark mode میں 20% ہلکا
    );
  };

  const getBorderColors = () => {
    return paletteColors.map(color => 
      isDarkMode ? adjustColor(color, 0) : adjustColor(color, -15) // Light mode میں 15% گہرا
    );
  };

  const getHoverBackgroundColors = () => {
    return paletteColors.map(color => 
      isDarkMode ? adjustColor(color, 30) : adjustColor(color, -10) // Hover effect
    );
  };

  const getHoverBorderColors = () => {
    return paletteColors.map(color => 
      isDarkMode ? adjustColor(color, 10) : adjustColor(color, -25) // Hover border
    );
  };

  // ✅ Default data
  const defaultLabels = ['Wire A', 'Wire B', 'Wire C', 'Wire D', 'Wire E', 'Wire F'];
  const defaultData = [30, 25, 20, 15, 10, 8];

  // ✅ Total calculation
  const totalValue = useMemo(() => {
    const values = data.length > 0 ? data : defaultData;
    return values.reduce((a, b) => a + b, 0);
  }, [data]);

  // ✅ تھیم کے مطابق چارٹ ڈیٹا
  const chartData = useMemo(() => {
    return {
      labels: labels.length > 0 ? labels : defaultLabels,
      datasets: [
        {
          data: data.length > 0 ? data : defaultData,
          backgroundColor: getBackgroundColors(),
          borderColor: getBorderColors(),
          borderWidth: isDarkMode ? 1.5 : 1,
          hoverBackgroundColor: getHoverBackgroundColors(),
          hoverBorderColor: getHoverBorderColors(),
          hoverBorderWidth: isDarkMode ? 2.5 : 2,
          borderAlign: 'center',
          borderRadius: 4,
        }
      ]
    };
  }, [labels, data, isDarkMode]);

  // ✅ تھیم کے مطابق آپشنز
  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: donut ? cutout : '0%',
      plugins: {
        legend: {
          display: showLegend,
          position: 'bottom',
          align: 'center',
          labels: {
            color: isDarkMode ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)',
            font: {
              size: 12,
              family: getCssVar('--font-family') || "'Inter', sans-serif",
              weight: '500'
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
          },
          rtl: false,
        },
        tooltip: {
          enabled: true,
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
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const dataset = context.dataset;
              const total = dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              
              let labelText = '';
              if (showValues) {
                labelText += `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
              }
              if (showPercentages) {
                if (labelText) labelText += ' ';
                labelText += `(${percentage}%)`;
              }
              return `${label}: ${labelText}`;
            }
          }
        },
        // ✅ Center text for donut chart
        ...(donut && {
          datalabels: {
            display: false
          },
          centerText: {
            display: true,
            text: totalValue.toLocaleString(),
            color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
            font: {
              size: 24,
              weight: '700',
              family: getCssVar('--font-family') || "'Inter', sans-serif"
            }
          }
        })
      },
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 800,
        easing: 'easeOutQuart',
      },
      layout: {
        padding: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        }
      },
      elements: {
        arc: {
          borderWidth: isDarkMode ? 1.5 : 1,
          borderRadius: 4,
        }
      }
    };
  }, [isDarkMode, donut, cutout, showLegend, showValues, showPercentages, totalValue, unit]);

  // ✅ Percentage calculation for summary
  const percentages = useMemo(() => {
    const values = data.length > 0 ? data : defaultData;
    const total = values.reduce((a, b) => a + b, 0);
    return values.map(value => total > 0 ? ((value / total) * 100).toFixed(1) : 0);
  }, [data]);

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
      
      {/* ✅ Title */}
      {title && (
        <div style={{ 
          marginBottom: 'var(--spacing-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h3 style={{
            margin: '0',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
          }}>
            {title}
          </h3>
          
          {/* ✅ Total Summary */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            background: isDarkMode ? 'var(--color-surface)' : 'var(--color-paper)',
            padding: 'var(--spacing-xs) var(--spacing-md)',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)'}`,
          }}>
            <span style={{
              fontSize: 'var(--font-size-xs)',
              color: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
              fontWeight: '500',
            }}>
              Total:
            </span>
            <span style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '700',
              color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
            }}>
              {totalValue.toLocaleString()}{unit}
            </span>
          </div>
        </div>
      )}
      
      {/* ✅ Chart Container */}
      <div style={{ 
        position: 'relative',
        height: `calc(100% - ${title ? 60 : 20}px)`,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 'var(--spacing-lg)',
      }}>
        
        {/* ✅ Pie Chart */}
        <div style={{
          position: 'relative',
          width: showLegend ? '60%' : '100%',
          height: '100%',
        }}>
          <Pie data={chartData} options={options} />
          
          {/* ✅ Center Text for Donut Chart */}
          {donut && data.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
              background: isDarkMode ? 'var(--color-card-bg)' : 'var(--color-card-bg)',
              padding: 'var(--spacing-md)',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)'}`,
              boxShadow: isDarkMode ? 'var(--shadow-md)' : 'var(--shadow-sm)',
            }}>
              <span style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                lineHeight: 1.2,
              }}>
                {totalValue.toLocaleString()}
              </span>
              {unit && (
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  color: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
                  marginTop: '2px',
                }}>
                  {unit}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* ✅ Custom Legend with Percentages */}
        {showLegend && data.length > 0 && (
          <div style={{
            width: '40%',
            height: '100%',
            overflowY: 'auto',
            paddingRight: 'var(--spacing-xs)',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
            }}>
              {(labels.length > 0 ? labels : defaultLabels).map((label, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    borderRadius: 'var(--radius-md)',
                    background: isDarkMode ? 'var(--color-surface)' : 'var(--color-paper)',
                    border: `1px solid ${isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)'}`,
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.background = isDarkMode ? 'var(--color-hover)' : 'var(--color-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = isDarkMode ? 'var(--color-surface)' : 'var(--color-paper)';
                  }}
                >
                  {/* Color Indicator */}
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '4px',
                    background: paletteColors[index % paletteColors.length],
                    border: `1px solid ${isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)'}`,
                  }} />
                  
                  {/* Label */}
                  <span style={{
                    flex: 1,
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '500',
                    color: isDarkMode ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {label}
                  </span>
                  
                  {/* Value */}
                  <span style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                  }}>
                    {(data.length > 0 ? data : defaultData)[index].toLocaleString()}
                  </span>
                  
                  {/* Percentage */}
                  <span style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    color: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
                    background: isDarkMode ? 'var(--color-surface)' : 'var(--color-paper)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)'}`,
                  }}>
                    {percentages[index]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default ProductionPieChart;