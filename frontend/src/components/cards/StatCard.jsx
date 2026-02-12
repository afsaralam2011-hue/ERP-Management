// src/components/cards/StatCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext'; // ✅ تھیم کنٹیکسٹ

const StatCard = ({ 
  title,
  value,
  icon: Icon,
  color,
  change = '+0%',
  description = '',
  link = '#',
  loading = false,
  isPositive = true,
}) => {
  
  // ✅ تھیم کنٹیکسٹ سے ڈارک موڈ حاصل کریں
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
    
    // Status
    success: isDarkMode ? 'var(--color-success)' : 'var(--color-success)',
    warning: isDarkMode ? 'var(--color-warning)' : 'var(--color-warning)',
    error: isDarkMode ? 'var(--color-error)' : 'var(--color-error)',
    info: isDarkMode ? 'var(--color-info)' : 'var(--color-info)',
    
    // Actions
    hover: isDarkMode ? 'var(--color-hover)' : 'var(--color-hover)',
    selected: isDarkMode ? 'var(--color-selected)' : 'var(--color-selected)',
    focus: isDarkMode ? 'var(--color-focus)' : 'var(--color-focus)',
    
    // Icons
    icon: isDarkMode ? 'var(--color-icon)' : 'var(--color-icon)',
    iconSecondary: isDarkMode ? 'var(--color-icon-secondary)' : 'var(--color-icon-secondary)',
    iconMuted: isDarkMode ? 'var(--color-icon-muted)' : 'var(--color-icon-muted)',
  };

  // ✅ تھیم کے مطابق کارڈ بیک گراؤنڈ
  const getCardBackground = () => {
    if (isDarkMode) {
      return `linear-gradient(145deg, ${primaryColor}08 0%, ${themeColors.card} 100%)`;
    }
    return `linear-gradient(145deg, ${themeColors.card} 0%, ${primaryColor}05 100%)`;
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

  // ✅ تھیم کے مطابق کارڈ شیڈو
  const getCardShadow = () => {
    if (isDarkMode) {
      return 'var(--shadow-lg)';
    }
    return 'var(--shadow-md)';
  };

  // ✅ تھیم کے مطابق ہوور شیڈو
  const getHoverShadow = () => {
    if (isDarkMode) {
      return `var(--shadow-xl), 0 0 30px ${primaryColor}20`;
    }
    return `var(--shadow-xl), 0 0 30px ${primaryColor}15`;
  };

  const cardContent = (
    <div
      style={{
        background: getCardBackground(),
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-xl)',
        border: getCardBorder(),
        boxShadow: getCardShadow(),
        transition: 'all var(--transition-base)',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: link && link !== '#' ? 'pointer' : 'default',
        backdropFilter: isDarkMode ? 'blur(4px)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (link && link !== '#') {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = getHoverShadow();
          e.currentTarget.style.borderColor = `${primaryColor}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (link && link !== '#') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = getCardShadow();
          e.currentTarget.style.borderColor = isDarkMode ? `${primaryColor}30` : `${primaryColor}20`;
        }
      }}
    >
      {/* Background Pattern - تھیم کے مطابق */}
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

      {/* Decorative Corner - تھیم کے مطابق */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: `linear-gradient(135deg, transparent 50%, ${primaryColor}15 50%)`,
          borderBottomLeftRadius: 'var(--radius-xl)',
          zIndex: 0,
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
          {/* Icon Container - تھیم کے مطابق */}
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
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (link && link !== '#') {
                e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
              }
            }}
            onMouseLeave={(e) => {
              if (link && link !== '#') {
                e.currentTarget.style.transform = 'scale(1) rotate(0)';
              }
            }}
          >
            {Icon && <Icon size={28} />}
          </div>

          {/* Change Badge - تھیم کے مطابق */}
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
              border: isDarkMode
                ? `1px solid ${isPositive ? themeColors.success + '40' : themeColors.error + '40'}`
                : 'none',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {isPositive ? '↑' : '↓'}
            </span>
            {change}
          </div>
        </div>

        {/* Content */}
        <div>
          {/* Title - تھیم کے مطابق */}
          <h3
            style={{
              margin: '0 0 var(--spacing-sm) 0',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: themeColors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {title}
          </h3>

          {/* Value - تھیم کے مطابق */}
          <div
            style={{
              fontSize: 'var(--font-size-4xl)',
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
              value
            )}
          </div>

          {/* Description - تھیم کے مطابق */}
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

        {/* Bottom Link - تھیم کے مطابق */}
        {link && link !== '#' && (
          <div
            style={{
              marginTop: 'var(--spacing-lg)',
              paddingTop: 'var(--spacing-md)',
              borderTop: `1px solid ${themeColors.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: themeColors.textMuted,
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Click to view details
            </span>
            <span
              style={{
                fontSize: '20px',
                color: primaryColor,
                transition: 'transform var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isDarkMode
                  ? `${primaryColor}20`
                  : `${primaryColor}10`,
              }}
            >
              →
            </span>
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