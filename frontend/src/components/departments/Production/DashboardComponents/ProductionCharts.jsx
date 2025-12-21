// src/components/departments/Production/DashboardComponents/ProductionCharts.jsx
import React, { useState } from 'react';
import { 
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi';

const ProductionCharts = ({ 
  chartData = null,
  loading = false,
  onExport = null
}) => {
  const [activeChart, setActiveChart] = useState('production');
  const [isExpanded, setIsExpanded] = useState(false);

  // Default chart data
  const defaultData = {
    productionByDay: [
      { day: 'Mon', production: 2850, target: 3000 },
      { day: 'Tue', production: 3200, target: 3000 },
      { day: 'Wed', production: 2750, target: 3000 },
      { day: 'Thu', production: 3100, target: 3000 },
      { day: 'Fri', production: 2950, target: 3000 },
      { day: 'Sat', production: 2650, target: 2500 },
      { day: 'Sun', production: 1850, target: 2000 }
    ],
    efficiencyDistribution: [
      { range: 'Excellent (90-100%)', value: 40, color: '#10b981' },
      { range: 'Good (80-89%)', value: 30, color: '#3b82f6' },
      { range: 'Average (70-79%)', value: 15, color: '#f59e0b' },
      { range: 'Poor (<70%)', value: 15, color: '#ef4444' }
    ],
    sectionPerformance: [
      { section: 'Flattening', efficiency: 92, production: 1250 },
      { section: 'Spiral', efficiency: 88, production: 850 },
      { section: 'PVC Coating', efficiency: 85, production: 750 },
      { section: 'Cutting', efficiency: 95, production: 1200 },
      { section: 'Packing', efficiency: 93, production: 1100 },
      { section: 'Finished Goods', efficiency: 97, production: 2000 }
    ]
  };

  const data = chartData || defaultData;

  const handleExport = () => {
    if (onExport) {
      onExport(activeChart);
    } else {
      console.log(`Exporting ${activeChart} chart data...`);
      // Implement export logic here
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing chart data...');
    // Implement refresh logic here
  };

  const maxProduction = Math.max(...data.productionByDay.map(d => d.production));
  const maxTarget = Math.max(...data.productionByDay.map(d => d.target));

  if (loading) {
    return (
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        marginBottom: '25px',
        minHeight: '400px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <div style={{
            height: '24px',
            width: '200px',
            background: '#f1f5f9',
            borderRadius: '6px',
            animation: 'pulse 1.5s infinite'
          }} />
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                style={{
                  height: '32px',
                  width: '80px',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  animation: 'pulse 1.5s infinite'
                }}
              />
            ))}
          </div>
        </div>
        <div style={{
          height: '300px',
          background: '#f1f5f9',
          borderRadius: '8px',
          animation: 'pulse 1.5s infinite'
        }} />
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
      background: 'white',
      padding: isExpanded ? '40px' : '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
      marginBottom: '25px',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: isExpanded ? '24px' : '20px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: isExpanded ? '50px' : '40px',
              height: isExpanded ? '50px' : '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiBarChart2 size={isExpanded ? 24 : 20} />
            </div>
            Production Analytics Charts
          </h3>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: isExpanded ? '16px' : '14px',
            marginLeft: isExpanded ? '62px' : '52px'
          }}>
            Visual analysis of production performance and trends
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Chart Type Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setActiveChart('production')}
              style={{
                background: activeChart === 'production' ? '#3b82f6' : 'transparent',
                color: activeChart === 'production' ? 'white' : '#64748b',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FiBarChart2 size={16} />
              Production
            </button>
            <button
              onClick={() => setActiveChart('efficiency')}
              style={{
                background: activeChart === 'efficiency' ? '#10b981' : 'transparent',
                color: activeChart === 'efficiency' ? 'white' : '#64748b',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FiPieChart size={16} />
              Efficiency
            </button>
            <button
              onClick={() => setActiveChart('sections')}
              style={{
                background: activeChart === 'sections' ? '#8b5cf6' : 'transparent',
                color: activeChart === 'sections' ? 'white' : '#64748b',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FiTrendingUp size={16} />
              Sections
            </button>
          </div>

          {/* Action Buttons */}
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
              <FiDownload size={16} />
              Export
            </button>
            
            <button
              onClick={handleRefresh}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
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
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiRefreshCw size={16} />
              Refresh
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isExpanded ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isExpanded ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: isExpanded ? '40px' : '30px',
        marginTop: '20px'
      }}>
        {/* Production Bar Chart */}
        {activeChart === 'production' && (
          <div style={{
            padding: isExpanded ? '30px' : '20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiBarChart2 size={18} />
              Daily Production vs Target
            </h4>
            
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              height: isExpanded ? '350px' : '250px',
              gap: '30px',
              padding: '20px'
            }}>
              {data.productionByDay.map((day, index) => (
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    gap: '10px'
                  }}>
                    {/* Target Bar */}
                    <div style={{
                      width: '30px',
                      height: `${(day.target / maxTarget) * (isExpanded ? 250 : 180)}px`,
                      background: '#e2e8f0',
                      borderRadius: '6px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#64748b',
                        whiteSpace: 'nowrap'
                      }}>
                        Target: {day.target.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* Production Bar */}
                    <div style={{
                      width: '30px',
                      height: `${(day.production / maxProduction) * (isExpanded ? 250 : 180)}px`,
                      background: day.production >= day.target ? 
                                'linear-gradient(to top, #10b981, #34d399)' :
                                'linear-gradient(to top, #ef4444, #f87171)',
                      borderRadius: '6px 6px 0 0',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#1e293b',
                        whiteSpace: 'nowrap'
                      }}>
                        {day.production.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    marginTop: '15px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    {day.day}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginTop: '4px'
                  }}>
                    {((day.production / day.target) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '30px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'linear-gradient(to top, #10b981, #34d399)',
                  borderRadius: '4px'
                }} />
                <span style={{ fontSize: '14px', color: '#64748b' }}>Production</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#e2e8f0',
                  borderRadius: '4px'
                }} />
                <span style={{ fontSize: '14px', color: '#64748b' }}>Target</span>
              </div>
            </div>
          </div>
        )}

        {/* Efficiency Pie Chart */}
        {activeChart === 'efficiency' && (
          <div style={{
            padding: isExpanded ? '30px' : '20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <h4 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiPieChart size={18} />
              Efficiency Distribution
            </h4>
            
            <div style={{
              width: isExpanded ? '300px' : '250px',
              height: isExpanded ? '300px' : '250px',
              borderRadius: '50%',
              background: `conic-gradient(
                ${data.efficiencyDistribution[0].color} 0% ${data.efficiencyDistribution[0].value}%,
                ${data.efficiencyDistribution[1].color} ${data.efficiencyDistribution[0].value}% ${data.efficiencyDistribution[0].value + data.efficiencyDistribution[1].value}%,
                ${data.efficiencyDistribution[2].color} ${data.efficiencyDistribution[0].value + data.efficiencyDistribution[1].value}% ${data.efficiencyDistribution[0].value + data.efficiencyDistribution[1].value + data.efficiencyDistribution[2].value}%,
                ${data.efficiencyDistribution[3].color} ${data.efficiencyDistribution[0].value + data.efficiencyDistribution[1].value + data.efficiencyDistribution[2].value}% 100%
              )`,
              position: 'relative',
              marginBottom: '30px'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isExpanded ? '150px' : '120px',
                height: isExpanded ? '150px' : '120px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  fontSize: isExpanded ? '32px' : '24px',
                  fontWeight: '700',
                  color: '#1e293b'
                }}>
                  86.4%
                </div>
                <div style={{
                  fontSize: isExpanded ? '14px' : '12px',
                  color: '#64748b'
                }}>
                  Avg Efficiency
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              width: '100%',
              maxWidth: '600px'
            }}>
              {data.efficiencyDistribution.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: item.color,
                    borderRadius: '4px'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {item.range}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      {item.value}% of sections
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: item.color
                  }}>
                    {item.value}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections Performance Chart */}
        {activeChart === 'sections' && (
          <div style={{
            padding: isExpanded ? '30px' : '20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiTrendingUp size={18} />
              Section Performance Comparison
            </h4>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {data.sectionPerformance.map((section, index) => (
                <div 
                  key={index}
                  style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {section.section}
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
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: '10px',
                        background: '#e2e8f0',
                        borderRadius: '5px',
                        overflow: 'hidden'
                      }}>
                        <div 
                          style={{
                            width: `${section.efficiency}%`,
                            height: '100%',
                            background: section.efficiency >= 90 ? '#10b981' : 
                                       section.efficiency >= 85 ? '#f59e0b' : '#ef4444',
                            borderRadius: '5px'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b',
                      minWidth: '80px',
                      textAlign: 'right'
                    }}>
                      {section.production.toLocaleString()} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionCharts;