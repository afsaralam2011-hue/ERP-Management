// src/components/cards/StatCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ 
  title,
  value,
  icon: Icon,
  color = '#3b82f6',
  change = '+0%',
  description = '',
  link = '#',
  loading = false,
  isPositive = true,
  darkMode = false // ✅ تھیم سپورٹ
}) => {
  
  // ✅ تھیم کے مطابق رنگ حاصل کرنے کا فنکشن
  const getColor = (colorName) => {
    if (typeof document === 'undefined') return '#000000';
    return getComputedStyle(document.documentElement).getPropertyValue(`--color-${colorName}`).trim() || 
          (darkMode ? '#FFFFFF' : '#000000');
  };

  // ✅ تھیم کے مطابق CSS Variables
  const themeColors = {
    background: darkMode ? '#1e1e1e' : '#ffffff',
    textPrimary: darkMode ? '#ffffff' : '#1e293b',
    textSecondary: darkMode ? '#94a3b8' : '#64748b',
    surface: darkMode ? '#2d2d2d' : '#f8fafc',
    border: darkMode ? '#404040' : '#e2e8f0',
    success: darkMode ? '#10b981' : '#059669',
    error: darkMode ? '#ef4444' : '#dc2626',
    warning: darkMode ? '#f59e0b' : '#d97706',
    info: darkMode ? '#3b82f6' : '#1d4ed8',
    hover: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  };

  // ✅ تھیم کے مطابق card background gradient
  const getCardBackground = () => {
    if (darkMode) {
      return `linear-gradient(145deg, ${color}10 0%, ${themeColors.surface} 100%)`;
    } else {
      return `linear-gradient(145deg, ${themeColors.background} 0%, ${color}05 100%)`;
    }
  };

  // ✅ تھیم کے مطابق icon background
  const getIconBackground = () => {
    if (darkMode) {
      return `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`;
    } else {
      return `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`;
    }
  };

  // ✅ تھیم کے مطابق change badge background
  const getChangeBadgeBackground = () => {
    if (isPositive) {
      return darkMode ? '#064e3b' : '#d1fae5';
    } else {
      return darkMode ? '#7f1d1d' : '#fee2e2';
    }
  };

  // ✅ تھیم کے مطابق change badge text color
  const getChangeBadgeColor = () => {
    if (isPositive) {
      return darkMode ? '#6ee7b7' : '#059669';
    } else {
      return darkMode ? '#fca5a5' : '#dc2626';
    }
  };

  const cardContent = (
    <div style={{
      background: getCardBackground(),
      padding: '24px',
      borderRadius: '16px',
      border: darkMode 
        ? `1px solid ${color}30`
        : `1px solid ${color}20`,
      boxShadow: darkMode 
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 10px -6px rgba(0, 0, 0, 0.2)'
        : '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -6px rgba(0, 0, 0, 0.02)',
      transition: 'all 0.3s ease',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      cursor: link && link !== '#' ? 'pointer' : 'default',
    }}
    onMouseEnter={(e) => {
      if (link && link !== '#') {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = darkMode 
          ? `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 20px ${color}40`
          : `0 25px 50px -12px ${color}20, 0 0 20px ${color}10`;
      }
    }}
    onMouseLeave={(e) => {
      if (link && link !== '#') {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = darkMode 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 4px 10px -6px rgba(0, 0, 0, 0.2)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 4px 10px -6px rgba(0, 0, 0, 0.02)';
      }
    }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: darkMode ? '-60px' : '-50px',
        right: darkMode ? '-60px' : '-50px',
        width: '180px',
        height: '180px',
        background: darkMode 
          ? `radial-gradient(circle, ${color}15 0%, transparent 70%)`
          : `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
        borderRadius: '50%',
        zIndex: 0,
        filter: darkMode ? 'blur(20px)' : 'blur(15px)',
        opacity: darkMode ? 0.6 : 0.4
      }}></div>

      {/* Decorative Corner */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '60px',
        height: '60px',
        background: darkMode 
          ? `linear-gradient(135deg, transparent 50%, ${color}30 50%)`
          : `linear-gradient(135deg, transparent 50%, ${color}15 50%)`,
        borderBottomLeftRadius: '16px',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: getIconBackground(),
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: darkMode 
              ? `0 10px 20px ${color}40, inset 0 2px 4px rgba(255, 255, 255, 0.1)`
              : `0 10px 20px ${color}30, inset 0 2px 4px rgba(255, 255, 255, 0.3)`,
            transition: 'all 0.3s ease'
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
          
          <div style={{
            padding: '8px 16px',
            background: getChangeBadgeBackground(),
            borderRadius: '24px',
            fontSize: '13px',
            fontWeight: '600',
            color: getChangeBadgeColor(),
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(10px)',
            border: darkMode 
              ? `1px solid ${isPositive ? themeColors.success + '40' : themeColors.error + '40'}`
              : 'none',
            boxShadow: darkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.1)'
              : '0 2px 4px rgba(0, 0, 0, 0.05)'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {isPositive ? '↑' : '↓'}
            </span>
            {change}
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: themeColors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            opacity: darkMode ? 0.8 : 1
          }}>
            {title}
          </h3>
          
          <div style={{
            fontSize: '36px',
            fontWeight: '800',
            color: themeColors.textPrimary,
            marginBottom: '12px',
            lineHeight: '1.1',
            background: darkMode 
              ? `linear-gradient(135deg, ${themeColors.textPrimary} 0%, ${color} 100%)`
              : `linear-gradient(135deg, ${themeColors.textPrimary} 0%, ${color} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            display: 'inline-block'
          }}>
            {loading ? (
              <div style={{
                width: '120px',
                height: '36px',
                background: darkMode 
                  ? 'linear-gradient(90deg, #2d2d2d 25%, #404040 50%, #2d2d2d 75%)'
                  : 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '8px'
              }}></div>
            ) : (
              value
            )}
          </div>

          {description && (
            <p style={{
              margin: '0',
              fontSize: '14px',
              color: themeColors.textSecondary,
              lineHeight: '1.5',
              opacity: darkMode ? 0.7 : 0.9
            }}>
              {description}
            </p>
          )}
        </div>

        {/* Bottom Link */}
        {link && link !== '#' && (
          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: darkMode 
              ? `1px solid ${themeColors.border}`
              : `1px solid ${themeColors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: darkMode ? 0.8 : 1
          }}>
            <span style={{
              fontSize: '13px',
              color: themeColors.textSecondary,
              fontStyle: 'italic',
              fontWeight: '500'
            }}>
              Click to view details
            </span>
            <span style={{
              fontSize: '22px',
              color: color,
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: darkMode 
                ? `${color}20`
                : `${color}10`,
            }}>
              →
            </span>
          </div>
        )}
      </div>

      {/* Loading Animation Style */}
      <style>{`
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .pulse {
          animation: pulse 2s infinite;
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
          height: '100%'
        }}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default StatCard;