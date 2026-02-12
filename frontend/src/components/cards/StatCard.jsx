import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const StatCard = ({ 
  title,
  value,
  icon,  // 👈 یہاں Icon نہیں، صرف icon رکھیں
  color,
  change = '+0%',
  description = '',
  link = '#',
  loading = false,
  isPositive = true,
  unit = '', // 👈 unit prop بھی شامل کریں
  trend = 'stable', // 👈 trend prop بھی شامل کریں
  size = 'medium', // 👈 size prop بھی شامل کریں
}) => {
  
  const { isDarkMode } = useTheme();
  
  // ✅ CSS Variables سے کلرز حاصل کریں
  const getCssVar = (varName) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };

  // ✅ تھیم کے مطابق پرائمری کلر
  const primaryColor = color || (isDarkMode ? '#60A5FA' : '#1E40AF');
  
  // ✅ تھیم کے مطابق CSS Variables
  const themeColors = {
    textPrimary: isDarkMode ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
    textSecondary: isDarkMode ? 'var(--color-text-secondary)' : 'var(--color-text-secondary)',
    textMuted: isDarkMode ? 'var(--color-text-muted)' : 'var(--color-text-muted)',
    divider: isDarkMode ? 'var(--color-border)' : 'var(--color-border-light)',
  };

  // ✅ تھیم کے مطابق کارڈ بیک گراؤنڈ
  const getCardBackground = () => {
    if (isDarkMode) {
      return `linear-gradient(145deg, ${primaryColor}08 0%, var(--color-card) 100%)`;
    }
    return `linear-gradient(145deg, var(--color-card) 0%, ${primaryColor}05 100%)`;
  };

  // ✅ تھیم کے مطابق آئیکن بیک گراؤنڈ
  const getIconBackground = () => {
    if (isDarkMode) {
      return `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}CC 100%)`;
    }
    return `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}E6 100%)`;
  };

  // ✅ تھیم کے مطابق چینج بیج بیک گراؤنڈ
  const getChangeBadgeBackground = () => {
    if (isPositive) {
      return isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)';
    }
    return isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
  };

  // ✅ تھیم کے مطابق چینج بیج ٹیکسٹ کلر
  const getChangeBadgeColor = () => {
    if (isPositive) {
      return isDarkMode ? '#34D399' : '#059669';
    }
    return isDarkMode ? '#F87171' : '#DC2626';
  };

  // ✅ تھیم کے مطابق کارڈ بارڈر
  const getCardBorder = () => {
    if (isDarkMode) {
      return `1px solid ${primaryColor}30`;
    }
    return `1px solid ${primaryColor}20`;
  };

  // ✅ سائز کے مطابق اسٹائلز
  const getSizeStyles = () => {
    switch(size) {
      case 'large':
        return {
          padding: 'var(--spacing-xl)',
          iconSize: 32,
          titleFont: 'var(--font-size-base)',
          valueFont: 'var(--font-size-5xl)',
        };
      case 'small':
        return {
          padding: 'var(--spacing-md)',
          iconSize: 20,
          titleFont: 'var(--font-size-xs)',
          valueFont: 'var(--font-size-2xl)',
        };
      default:
        return {
          padding: 'var(--spacing-lg)',
          iconSize: 28,
          titleFont: 'var(--font-size-sm)',
          valueFont: 'var(--font-size-4xl)',
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const cardContent = (
    <div
      style={{
        background: getCardBackground(),
        padding: sizeStyles.padding,
        borderRadius: 'var(--radius-xl)',
        border: getCardBorder(),
        boxShadow: 'var(--shadow-md)',
        transition: 'all 0.3s ease',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: link && link !== '#' ? 'pointer' : 'default',
        backdropFilter: isDarkMode ? 'blur(4px)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (link && link !== '#') {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
          e.currentTarget.style.borderColor = `${primaryColor}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (link && link !== '#') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = isDarkMode ? `${primaryColor}30` : `${primaryColor}20`;
        }
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'absolute',
          top: isDarkMode ? '-60px' : '-50px',
          right: isDarkMode ? '-60px' : '-50px',
          width: '180px',
          height: '180px',
          background: `radial-gradient(circle, ${primaryColor}10 0%, transparent 70%)`,
          borderRadius: '50%',
          zIndex: 0,
          filter: isDarkMode ? 'blur(30px)' : 'blur(20px)',
          opacity: isDarkMode ? 0.5 : 0.3,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          {/* Icon Container - 👈 FIXED: اب icon کو براہ راست render کریں */}
          <div
            style={{
              width: '56px',
              height: '56px',
              background: getIconBackground(),
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: isDarkMode
                ? `0 8px 16px ${primaryColor}30, inset 0 2px 4px rgba(255, 255, 255, 0.2)`
                : `0 8px 16px ${primaryColor}20, inset 0 2px 4px rgba(255, 255, 255, 0.5)`,
            }}
          >
            {icon} {/* 👈 FIXED: Icon نہیں، براہ راست icon render کریں */}
          </div>

          {/* Change Badge */}
          {change && (
            <div
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                background: getChangeBadgeBackground(),
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: getChangeBadgeColor(),
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {isPositive ? '↑' : '↓'}
              </span>
              {change}
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <h3
            style={{
              margin: '0 0 var(--spacing-sm) 0',
              fontSize: sizeStyles.titleFont,
              fontWeight: 'var(--font-weight-semibold)',
              color: themeColors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </h3>

          <div
            style={{
              fontSize: sizeStyles.valueFont,
              fontWeight: 'var(--font-weight-bold)',
              color: themeColors.textPrimary,
              marginBottom: 'var(--spacing-sm)',
              lineHeight: 1,
            }}
          >
            {loading ? (
              <div
                style={{
                  width: '120px',
                  height: '40px',
                  background: isDarkMode
                    ? 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-border) 50%, var(--color-surface) 75%)'
                    : 'linear-gradient(90deg, var(--color-surface) 25%, var(--color-border-light) 50%, var(--color-surface) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'loading 1.5s infinite',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            ) : (
              `${value} ${unit}`
            )}
          </div>

          {description && (
            <p
              style={{
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: themeColors.textSecondary,
                lineHeight: 'var(--line-height-relaxed)',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Trend Indicator */}
        {trend && trend !== 'stable' && (
          <div
            style={{
              marginTop: 'var(--spacing-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              fontSize: 'var(--font-size-xs)',
              color: trend === 'up' ? '#10B981' : '#EF4444',
            }}
          >
            {trend === 'up' ? '↑' : '↓'} 
            {trend === 'up' ? 'Increasing' : 'Decreasing'}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );

  if (link && link !== '#') {
    return (
      <Link
        to={link}
        style={{
          textDecoration: 'none',
          display: 'block',
          height: '100%',
        }}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default StatCard;