// src/components/departments/Production/DashboardComponents/ProductionCards.jsx
import React from 'react';
import { 
  FiPackage, 
  FiActivity, 
  FiClock, 
  FiCheckCircle,
  FiCalendar,
  FiTarget,
  FiTrendingUp,
  FiTrendingDown,
  FiBarChart2,
  FiPercent
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ProductionCards = ({ 
  stats = null, 
  loading = false, 
  onCardClick = null 
}) => {
  const navigate = useNavigate();

  // Default stats data
  const defaultStats = [
    { 
      id: 1,
      label: "Daily Output", 
      value: "2,850", 
      change: "+15%", 
      icon: <FiPackage />, 
      color: "#f59e0b",
      description: "Units produced today",
      isPositive: true,
      link: "/production/today-output"
    },
    { 
      id: 2,
      label: "Efficiency", 
      value: "92%", 
      change: "+3%", 
      icon: <FiActivity />, 
      color: "#10b981",
      description: "Overall production efficiency",
      isPositive: true,
      link: "/production/efficiency"
    },
    { 
      id: 3,
      label: "Downtime", 
      value: "2%", 
      change: "-1%", 
      icon: <FiClock />, 
      color: "#ef4444",
      description: "Machine downtime percentage",
      isPositive: false,
      link: "/production/downtime"
    },
    { 
      id: 4,
      label: "Quality Pass", 
      value: "98.5%", 
      change: "+0.5%", 
      icon: <FiCheckCircle />, 
      color: "#3b82f6",
      description: "Quality inspection pass rate",
      isPositive: true,
      link: "/production/quality"
    },
    { 
      id: 5,
      label: "Last Day Production", 
      value: "385", 
      change: "+5%", 
      icon: <FiCalendar />, 
      color: "#8b5cf6",
      description: "Yesterday's total production",
      isPositive: true,
      link: "/production/analytics/last-day",
      isYesterday: true
    },
    { 
      id: 6,
      label: "Last Day Efficiency", 
      value: "88.2%", 
      change: "+1.8%", 
      icon: <FiTarget />, 
      color: "#ec4899",
      description: "Yesterday's average efficiency",
      isPositive: true,
      link: "/production/analytics/last-day",
      isYesterday: true
    },
  ];

  const cardsData = stats || defaultStats;

  const handleCardClick = (card) => {
    if (onCardClick) {
      onCardClick(card);
    } else if (card.link) {
      navigate(card.link);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              minHeight: '180px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: '#f1f5f9',
                borderRadius: '12px',
                animation: 'pulse 1.5s infinite'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  height: '12px',
                  background: '#f1f5f9',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  animation: 'pulse 1.5s infinite'
                }} />
                <div style={{
                  height: '8px',
                  width: '60%',
                  background: '#f1f5f9',
                  borderRadius: '4px',
                  animation: 'pulse 1.5s infinite'
                }} />
              </div>
            </div>
            <div style={{
              height: '32px',
              background: '#f1f5f9',
              borderRadius: '6px',
              marginBottom: '12px',
              animation: 'pulse 1.5s infinite'
            }} />
            <div style={{
              height: '16px',
              width: '80%',
              background: '#f1f5f9',
              borderRadius: '4px',
              animation: 'pulse 1.5s infinite'
            }} />
          </div>
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    }}>
      {cardsData.map((card) => (
        <div 
          key={card.id}
          onClick={() => handleCardClick(card)}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid #e2e8f0',
            position: 'relative',
            borderTop: card.isYesterday ? '4px solid' : 'none',
            borderTopColor: card.isYesterday ? card.color : 'transparent',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = card.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          {/* Yesterday badge */}
          {card.isYesterday && (
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              background: card.color,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 1
            }}>
              {card.label.includes('Production') ? <FiBarChart2 size={10} /> : <FiPercent size={10} />}
              Yesterday
            </div>
          )}

          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '15px' 
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: `${card.color}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                fontSize: '24px'
              }}>
                {card.icon}
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: card.isPositive ? '#10b981' : '#ef4444',
                background: card.isPositive ? '#d1fae5' : '#fee2e2',
                padding: '5px 12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {card.isPositive ? 
                  <FiTrendingUp size={14} /> : 
                  <FiTrendingDown size={14} />
                }
                {card.change}
              </span>
            </div>
            
            <div style={{ 
              fontSize: '32px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '5px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '5px'
            }}>
              {card.value}
              {card.label.includes('Efficiency') && !card.label.includes('Last Day') && (
                <span style={{ 
                  fontSize: '16px', 
                  fontWeight: 'normal', 
                  color: '#64748b',
                  marginLeft: '4px'
                }}>
                  efficiency
                </span>
              )}
            </div>
            
            <div style={{ 
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '8px'
            }}>
              {card.label}
            </div>
          </div>

          <div style={{ 
            fontSize: '14px',
            color: '#64748b',
            lineHeight: '1.4',
            marginTop: 'auto',
            paddingTop: '10px',
            borderTop: '1px solid #f1f5f9'
          }}>
            {card.description}
          </div>

          {/* Hover indicator */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '3px',
            background: card.color,
            borderRadius: '0 0 12px 12px',
            transform: 'scaleX(0)',
            transition: 'transform 0.3s ease',
            transformOrigin: 'left'
          }} 
          className="card-hover-indicator"
          />
        </div>
      ))}

      <style>{`
        .card-hover-indicator {
          transform: scaleX(0);
        }
        div[onMouseEnter] div.card-hover-indicator {
          transform: scaleX(1);
        }
      `}</style>
    </div>
  );
};

export default ProductionCards;