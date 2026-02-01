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
  isPositive = true
}) => {
  const cardContent = (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      border: `1px solid ${color}20`,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = `0 20px 40px ${color}15, 0 4px 8px rgba(0, 0, 0, 0.05)`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
    }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: `${color}05`,
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            {Icon && <Icon size={24} />}
          </div>
          
          <div style={{
            padding: '6px 12px',
            background: isPositive ? '#d1fae5' : '#fee2e2',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            color: isPositive ? '#059669' : '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>{isPositive ? '↑' : '↓'}</span>
            {change}
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '500',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </h3>
          
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '12px',
            lineHeight: '1'
          }}>
            {loading ? (
              <div style={{
                width: '100px',
                height: '32px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite',
                borderRadius: '6px'
              }}></div>
            ) : (
              value
            )}
          </div>

          {description && (
            <p style={{
              margin: '0',
              fontSize: '13px',
              color: '#94a3b8',
              lineHeight: '1.5'
            }}>
              {description}
            </p>
          )}
        </div>

        {/* Bottom Link */}
        {link && link !== '#' && (
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{
              fontSize: '13px',
              color: '#94a3b8',
              fontStyle: 'italic'
            }}>
              Click to view details
            </span>
            <span style={{
              fontSize: '20px',
              color: color,
              transition: 'transform 0.3s'
            }}>
              →
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (link && link !== '#') {
    return (
      <Link to={link} style={{ textDecoration: 'none', display: 'block' }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default StatCard;