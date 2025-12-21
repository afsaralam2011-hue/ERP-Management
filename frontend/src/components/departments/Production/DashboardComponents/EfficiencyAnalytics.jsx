// src/components/departments/Production/DashboardComponents/EfficiencyAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiTarget,
  FiBarChart2,
  FiPieChart,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';

const EfficiencyAnalytics = ({ data, loading, error }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // Default data structure
  const defaultData = {
    overallEfficiency: 86.4,
    yesterdayEfficiency: 88.2,
    trend: '+1.8%',
    isTrendUp: true,
    
    distribution: [
      { range: '90-100%', percentage: 40, color: '#10b981', count: 8 },
      { range: '80-89%', percentage: 30, color: '#3b82f6', count: 6 },
      { range: '70-79%', percentage: 15, color: '#f59e0b', count: 3 },
      { range: 'Below 70%', percentage: 15, color: '#ef4444', count: 3 }
    ],
    
    dailyEfficiency: [
      { day: 'Mon', efficiency: 85.2 },
      { day: 'Tue', efficiency: 87.8 },
      { day: 'Wed', efficiency: 84.5 },
      { day: 'Thu', efficiency: 88.2 },
      { day: 'Fri', efficiency: 86.4 },
      { day: 'Sat', efficiency: 89.1 },
      { day: 'Sun', efficiency: 82.3 }
    ],
    
    sections: [
      { name: 'Flattening', efficiency: 92.5, trend: '+2.1%' },
      { name: 'Spiral', efficiency: 88.7, trend: '+1.2%' },
      { name: 'PVC Coating', efficiency: 85.3, trend: '-0.5%' },
      { name: 'Cutting', efficiency: 95.1, trend: '+3.2%' },
      { name: 'Packing', efficiency: 93.8, trend: '+1.8%' },
      { name: 'Finished Goods', efficiency: 97.2, trend: '+4.1%' }
    ],
    
    metrics: {
      avgDowntime: '2.1%',
      qualityRate: '96.7%',
      oee: '84.3%',
      utilization: '92.5%'
    }
  };

  const efficiencyData = data || defaultData;

  const handleExport = () => {
    // Export functionality
    console.log('Exporting efficiency data...');
  };

  const handleRefresh = () => {
    // Refresh data
    console.log('Refreshing efficiency data...');
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            margin: '0 auto 15px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#64748b' }}>Loading efficiency analytics...</p>
        </div>
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
        border: '1px solid #fee2e2'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
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
            <FiAlertCircle />
          </div>
          <p style={{ color: '#dc2626', marginBottom: '15px' }}>Failed to load efficiency data</p>
          <button
            onClick={handleRefresh}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <FiRefreshCw size={14} />
            Retry
          </button>
        </div>
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiActivity size={20} />
            </div>
            Efficiency Analytics
          </h3>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: '14px',
            marginLeft: '52px'
          }}>
            Detailed analysis of production efficiency across all sections
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setTimeRange('day')}
              style={{
                background: timeRange === 'day' ? '#10b981' : 'transparent',
                color: timeRange === 'day' ? 'white' : '#64748b',
                border: `1px solid ${timeRange === 'day' ? '#10b981' : '#e2e8f0'}`,
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Day
            </button>
            <button
              onClick={() => setTimeRange('week')}
              style={{
                background: timeRange === 'week' ? '#10b981' : 'transparent',
                color: timeRange === 'week' ? 'white' : '#64748b',
                border: `1px solid ${timeRange === 'week' ? '#10b981' : '#e2e8f0'}`,
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              style={{
                background: timeRange === 'month' ? '#10b981' : 'transparent',
                color: timeRange === 'month' ? 'white' : '#64748b',
                border: `1px solid ${timeRange === 'month' ? '#10b981' : '#e2e8f0'}`,
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Month
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExport}
              style={{
                background: 'transparent',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
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
              <FiDownload size={14} />
              Export
            </button>
            
            <button
              onClick={handleRefresh}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#059669';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiRefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Efficiency Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Overall Efficiency */}
        <div style={{
          background: '#f0fdf4',
          padding: '25px',
          borderRadius: '12px',
          border: '2px solid #10b981',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#047857',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <FiTarget size={16} />
            Overall Efficiency
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#065f46',
            marginBottom: '10px'
          }}>
            {efficiencyData.overallEfficiency}%
          </div>
          <div style={{
            fontSize: '14px',
            color: '#64748b'
          }}>
            Current Period Average
          </div>
        </div>

        {/* Yesterday's Efficiency */}
        <div style={{
          background: '#f8fafc',
          padding: '25px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#475569',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <FiActivity size={16} />
            Yesterday's Efficiency
          </div>
          <div style={{
            fontSize: '40px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '10px'
          }}>
            {efficiencyData.yesterdayEfficiency}%
          </div>
          <div style={{
            fontSize: '14px',
            color: efficiencyData.isTrendUp ? '#10b981' : '#ef4444',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            {efficiencyData.isTrendUp ? 
              <FiTrendingUp size={16} /> : 
              <FiTrendingDown size={16} />
            }
            {efficiencyData.trend} from previous day
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}>
          <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '5px'
            }}>
              OEE
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b'
            }}>
              {efficiencyData.metrics.oee}
            </div>
          </div>
          
          <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '5px'
            }}>
              Utilization
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b'
            }}>
              {efficiencyData.metrics.utilization}
            </div>
          </div>
          
          <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '5px'
            }}>
              Downtime
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#ef4444'
            }}>
              {efficiencyData.metrics.avgDowntime}
            </div>
          </div>
          
          <div style={{
            background: '#f8fafc',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '5px'
            }}>
              Quality Rate
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#10b981'
            }}>
              {efficiencyData.metrics.qualityRate}
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Distribution */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{
          margin: '0 0 15px 0',
          fontSize: '16px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FiPieChart size={16} />
          Efficiency Distribution
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {efficiencyData.distribution.map((item, index) => (
            <div 
              key={index}
              style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: `4px solid ${item.color}`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {item.range}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: item.color
                }}>
                  {item.percentage}%
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
                  {item.count} sections
                </div>
                <div style={{
                  width: '80px',
                  height: '6px',
                  background: '#e2e8f0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background: item.color,
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Efficiency Chart */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{
          margin: '0 0 15px 0',
          fontSize: '16px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FiBarChart2 size={16} />
          Daily Efficiency Trend ({timeRange})
        </h4>
        
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          height: '200px',
          gap: '20px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          {efficiencyData.dailyEfficiency.map((day, index) => (
            <div 
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{
                width: '30px',
                height: `${(day.efficiency / 100) * 150}px`,
                background: day.efficiency >= 85 ? 
                           'linear-gradient(to top, #10b981, #34d399)' :
                           day.efficiency >= 80 ? 
                           'linear-gradient(to top, #f59e0b, #fbbf24)' :
                           'linear-gradient(to top, #ef4444, #f87171)',
                borderRadius: '6px 6px 0 0',
                marginBottom: '10px',
                transition: 'height 0.3s ease'
              }} />
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600'
              }}>
                {day.day}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#94a3b8',
                marginTop: '4px'
              }}>
                {day.efficiency}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections Performance */}
      <div>
        <h4 style={{
          margin: '0 0 15px 0',
          fontSize: '16px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FiActivity size={16} />
          Section-wise Efficiency
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {efficiencyData.sections.map((section, index) => (
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
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.transform = 'translateY(0)';
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
                  fontSize: '20px',
                  fontWeight: '700',
                  color: section.efficiency >= 90 ? '#10b981' : 
                         section.efficiency >= 85 ? '#f59e0b' : '#ef4444'
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
                  Trend: 
                  <span style={{
                    color: section.trend.startsWith('+') ? '#10b981' : '#ef4444',
                    fontWeight: '600',
                    marginLeft: '5px'
                  }}>
                    {section.trend}
                  </span>
                </div>
                <div style={{
                  width: '100px',
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
                                 section.efficiency >= 85 ? '#f59e0b' : '#ef4444',
                      borderRadius: '3px'
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EfficiencyAnalytics;