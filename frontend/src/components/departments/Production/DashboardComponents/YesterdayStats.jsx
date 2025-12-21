// src/components/departments/Production/DashboardComponents/YesterdayStats.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiPackage, 
  FiTrendingUp, 
  FiTrendingDown,
  FiBarChart2,
  FiClock,
  FiActivity,
  FiTarget,
  FiArrowRight,
  FiExternalLink
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const YesterdayStats = ({ data, loading, error }) => {
  const navigate = useNavigate();
  
  // Default data structure
  const defaultData = {
    date: '2025-12-15',
    totalProduction: 385,
    avgEfficiency: 88.2,
    sections: [
      { name: 'Flattening Section', production: 120, efficiency: 92 },
      { name: 'Spiral Section', production: 85, efficiency: 90 },
      { name: 'PVC Coating', production: 75, efficiency: 88 },
      { name: 'Cutting & Packing', production: 105, efficiency: 95 }
    ],
    comparison: {
      production: '+5%',
      efficiency: '+1.8%',
      isProductionUp: true,
      isEfficiencyUp: true
    },
    metrics: {
      bestSection: 'Flattening Section',
      worstSection: 'PVC Coating',
      totalHours: 24,
      downtime: '1.2 hours',
      avgQuality: '96.7%'
    }
  };

  const yesterdayData = data || defaultData;

  const handleViewDetails = () => {
    navigate('/production/analytics/last-day');
  };

  const handleCompare = () => {
    navigate('/production/analytics/compare');
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#8b5cf6',
          borderRadius: '50%',
          margin: '0 auto 15px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#64748b' }}>Yesterday's data loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #fee2e2',
        textAlign: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: '#fee2e2',
          borderRadius: '50%',
          margin: '0 auto 15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
          fontSize: '24px'
        }}>
          ⚠️
        </div>
        <p style={{ color: '#dc2626', marginBottom: '15px' }}>Error loading data</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
      marginBottom: '25px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiCalendar size={20} />
            </div>
            Yesterday's Production Analysis
          </h3>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: '14px',
            marginLeft: '52px'
          }}>
            Detailed breakdown of production performance for {yesterdayData.date}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleViewDetails}
            style={{
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#7c3aed';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#8b5cf6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FiExternalLink size={14} />
            View Details
          </button>
          
          <button
            onClick={handleCompare}
            style={{
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = '#e2e8f0';
            }}
          >
            <FiBarChart2 size={14} />
            Compare Days
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Production Card */}
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '10px',
          borderLeft: '4px solid #8b5cf6',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onClick={handleViewDetails}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px)';
          e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#ede9fe',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6'
            }}>
              <FiPackage size={20} />
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: yesterdayData.comparison.isProductionUp ? '#10b981' : '#ef4444',
              background: yesterdayData.comparison.isProductionUp ? '#d1fae5' : '#fee2e2',
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {yesterdayData.comparison.isProductionUp ? 
                <FiTrendingUp size={12} /> : 
                <FiTrendingDown size={12} />
              }
              {yesterdayData.comparison.production}
            </span>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '5px'
          }}>
            {yesterdayData.totalProduction}
            <span style={{
              fontSize: '14px',
              fontWeight: 'normal',
              color: '#64748b',
              marginLeft: '5px'
            }}>
              units
            </span>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Total Production
          </div>
        </div>

        {/* Average Efficiency Card */}
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '10px',
          borderLeft: '4px solid #ec4899',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onClick={handleViewDetails}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-3px)';
          e.target.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'none';
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#fce7f3',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ec4899'
            }}>
              <FiTarget size={20} />
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: yesterdayData.comparison.isEfficiencyUp ? '#10b981' : '#ef4444',
              background: yesterdayData.comparison.isEfficiencyUp ? '#d1fae5' : '#fee2e2',
              padding: '4px 10px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {yesterdayData.comparison.isEfficiencyUp ? 
                <FiTrendingUp size={12} /> : 
                <FiTrendingDown size={12} />
              }
              {yesterdayData.comparison.efficiency}
            </span>
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '5px'
          }}>
            {yesterdayData.avgEfficiency}%
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Average Efficiency
          </div>
        </div>

        {/* Best Section Card */}
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '10px',
          borderLeft: '4px solid #10b981',
          transition: 'all 0.3s'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#d1fae5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <FiTrendingUp size={20} />
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Best Performing Section
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                {yesterdayData.metrics.bestSection}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#94a3b8',
            fontStyle: 'italic'
          }}>
            Highest efficiency among all sections
          </div>
        </div>

        {/* Downtime Card */}
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '10px',
          borderLeft: '4px solid #f59e0b',
          transition: 'all 0.3s'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#fef3c7',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}>
              <FiClock size={20} />
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Total Downtime
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                {yesterdayData.metrics.downtime}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#94a3b8',
            fontStyle: 'italic'
          }}>
            Across all production lines
          </div>
        </div>
      </div>

      {/* Sections Breakdown */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{
          margin: '0 0 15px 0',
          fontSize: '16px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FiActivity size={16} />
          Section-wise Performance
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {yesterdayData.sections.map((section, index) => (
            <div 
              key={index}
              style={{
                background: '#f8fafc',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f1f5f9';
                e.target.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {section.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: section.efficiency >= 90 ? '#10b981' : 
                         section.efficiency >= 80 ? '#f59e0b' : '#ef4444'
                }}>
                  {section.efficiency}%
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  Production: {section.production} units
                </div>
                <div style={{
                  width: '60px',
                  height: '6px',
                  background: '#e2e8f0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      width: `${section.efficiency}%`,
                      height: '100%',
                      background: section.efficiency >= 90 ? '#10b981' : 
                                 section.efficiency >= 80 ? '#f59e0b' : '#ef4444',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div style={{
        padding: '15px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #bae6fd'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#0369a1'
        }}>
          <FiTarget size={16} />
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Performance Insight
            </div>
            <div style={{ fontSize: '13px' }}>
              Yesterday's overall efficiency improved by {yesterdayData.comparison.efficiency} compared to the previous day. 
              Total production volume was {yesterdayData.comparison.production} higher.
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animation */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default YesterdayStats;