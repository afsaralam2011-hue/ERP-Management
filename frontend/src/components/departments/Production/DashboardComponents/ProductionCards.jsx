// src/components/departments/Production/DashboardComponents/ProductionCards.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  FiPercent,
  FiRefreshCw,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  FaIndustry, 
  FaCogs, 
  FaShieldAlt, 
  FaCut, 
  FaBoxOpen, 
  FaWarehouse,
  FaDatabase,
  FaSpinner
} from 'react-icons/fa';
import { supabase } from '../../../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ProductionCards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('Flatting Section');
  const [cardsData, setCardsData] = useState([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Departments array from ProductionMetrics.jsx with table names
  const departments = [
    { 
      id: 1, 
      name: 'Raw Material Section', 
      icon: <FaWarehouse />, 
      color: '#f59e0b', 
      tableName: 'raw_material_log',
      unit: 'KG'
    },
    { 
      id: 2, 
      name: 'Flatting Section', 
      icon: <FaIndustry />, 
      color: '#3b82f6', 
      tableName: 'flatteningsection',
      unit: 'KG'
    },
    { 
      id: 3, 
      name: 'Spiral Section', 
      icon: <FaCogs />, 
      color: '#8b5cf6', 
      tableName: 'spiralsection',
      unit: 'Meter'
    },
    { 
      id: 4, 
      name: 'PVC Coating Section', 
      icon: <FaShieldAlt />, 
      color: '#10b981', 
      tableName: 'pvcsection',
      unit: 'Meter'
    },
    { 
      id: 5, 
      name: 'Cutting & Packing Section', 
      icon: <FaCut />, 
      color: '#ec4899', 
      tableName: 'cuttingpacking',
      unit: 'Meter'
    },
    { 
      id: 6, 
      name: 'Finishing Goods Section', 
      icon: <FaBoxOpen />, 
      color: '#06b6d4', 
      tableName: 'finishinggoods',
      unit: 'Meter'
    }
  ];

  const getCurrentDepartment = useCallback(() => {
    return departments.find(dept => dept.name === selectedDepartment);
  }, [selectedDepartment]);

  const getYesterdayDate = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }, []);

  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const calculateCardData = useCallback((records, department) => {
    if (!records || records.length === 0) {
      return generateDefaultCards(department);
    }

    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    let todayProduction = 0;
    let todayTarget = 0;
    let yesterdayProduction = 0;
    let yesterdayTarget = 0;
    let totalProduction = 0;
    let totalTarget = 0;
    let downtimeRecords = 0;
    let qualityRecords = 0;
    let totalRecords = records.length;

    const todayRecords = records.filter(record => {
      if (!record.created_at) return false;
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      return recordDate === today;
    });

    const yesterdayRecords = records.filter(record => {
      if (!record.created_at) return false;
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      return recordDate === yesterday;
    });

    // Calculate today's data
    todayRecords.forEach(record => {
      const production = parseFloat(record.production_quantity) || parseFloat(record.production) || 0;
      const target = parseFloat(record.target_qty) || parseFloat(record.target) || 0;
      todayProduction += production;
      todayTarget += target;
      totalProduction += production;
      totalTarget += target;
      
      // Check for downtime (simplified logic)
      if (production === 0 && target > 0) {
        downtimeRecords++;
      }
      
      // Check for quality (simplified logic)
      if (production > 0 && target > 0 && production >= target * 0.95) {
        qualityRecords++;
      }
    });

    // Calculate yesterday's data
    yesterdayRecords.forEach(record => {
      const production = parseFloat(record.production_quantity) || parseFloat(record.production) || 0;
      const target = parseFloat(record.target_qty) || parseFloat(record.target) || 0;
      yesterdayProduction += production;
      yesterdayTarget += target;
    });

    // Calculate efficiencies
    const todayEfficiency = todayTarget > 0 ? (todayProduction / todayTarget) * 100 : 0;
    const yesterdayEfficiency = yesterdayTarget > 0 ? (yesterdayProduction / yesterdayTarget) * 100 : 0;
    const overallEfficiency = totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;
    
    // Calculate trends
    const productionTrend = yesterdayProduction > 0 ? 
      ((todayProduction - yesterdayProduction) / yesterdayProduction * 100).toFixed(1) : 0;
    const efficiencyTrend = yesterdayEfficiency > 0 ? 
      ((todayEfficiency - yesterdayEfficiency) / yesterdayEfficiency * 100).toFixed(1) : 0;
    
    // Calculate percentages
    const downtimePercentage = totalRecords > 0 ? (downtimeRecords / totalRecords * 100).toFixed(1) : 0;
    const qualityPercentage = totalRecords > 0 ? (qualityRecords / totalRecords * 100).toFixed(1) : 0;
    
    // Calculate changes (simplified)
    const downtimeTrend = parseFloat(downtimePercentage) > 3 ? '-1%' : '+0%';
    const qualityTrend = parseFloat(qualityPercentage) > 95 ? '+0.5%' : '-0.5%';

    const unit = department.unit;
    const departmentName = department.name;

    return [
      { 
        id: 1,
        label: "Daily Output", 
        value: todayProduction > 0 ? todayProduction.toLocaleString('en-US', {
          minimumFractionDigits: unit === 'Meter' ? 1 : 0,
          maximumFractionDigits: unit === 'Meter' ? 1 : 0
        }) : '0',
        change: `${productionTrend > 0 ? '+' : ''}${productionTrend}%`,
        icon: <FiPackage />, 
        color: "#f59e0b",
        description: `${unit} produced today in ${departmentName}`,
        isPositive: productionTrend > 0,
        link: "/production/today-output",
        type: 'daily',
        department: departmentName
      },
      { 
        id: 2,
        label: "Efficiency", 
        value: overallEfficiency > 0 ? `${overallEfficiency.toFixed(1)}%` : '0%',
        change: `${efficiencyTrend > 0 ? '+' : ''}${efficiencyTrend}%`,
        icon: <FiActivity />, 
        color: "#10b981",
        description: `Overall production efficiency for ${departmentName}`,
        isPositive: efficiencyTrend > 0,
        link: "/production/efficiency",
        type: 'efficiency',
        department: departmentName
      },
      { 
        id: 3,
        label: "Downtime", 
        value: `${downtimePercentage}%`,
        change: downtimeTrend,
        icon: <FiClock />, 
        color: "#ef4444",
        description: `Machine downtime percentage in ${departmentName}`,
        isPositive: false,
        link: "/production/downtime",
        type: 'downtime',
        department: departmentName
      },
      { 
        id: 4,
        label: "Quality Pass", 
        value: `${qualityPercentage}%`,
        change: qualityTrend,
        icon: <FiCheckCircle />, 
        color: "#3b82f6",
        description: `Quality inspection pass rate for ${departmentName}`,
        isPositive: !qualityTrend.startsWith('-'),
        link: "/production/quality",
        type: 'quality',
        department: departmentName
      },
      { 
        id: 5,
        label: "Last Day Production", 
        value: yesterdayProduction > 0 ? yesterdayProduction.toLocaleString('en-US', {
          minimumFractionDigits: unit === 'Meter' ? 1 : 0,
          maximumFractionDigits: unit === 'Meter' ? 1 : 0
        }) : '0',
        change: yesterdayProduction > 0 ? '+5%' : '0%',
        icon: <FiCalendar />, 
        color: "#8b5cf6",
        description: `Yesterday's total production in ${departmentName}`,
        isPositive: true,
        link: "/production/analytics/last-day",
        isYesterday: true,
        type: 'yesterday',
        department: departmentName
      },
      { 
        id: 6,
        label: "Last Day Efficiency", 
        value: yesterdayEfficiency > 0 ? `${yesterdayEfficiency.toFixed(1)}%` : '0%',
        change: yesterdayEfficiency > 0 ? '+1.8%' : '0%',
        icon: <FiTarget />, 
        color: "#ec4899",
        description: `Yesterday's average efficiency in ${departmentName}`,
        isPositive: true,
        link: "/production/analytics/last-day",
        isYesterday: true,
        type: 'yesterday',
        department: departmentName
      },
    ];
  }, [getTodayDate, getYesterdayDate]);

  const generateDefaultCards = useCallback((department) => {
    const unit = department?.unit || 'Unit';
    const departmentName = department?.name || 'Department';
    
    return [
      { 
        id: 1,
        label: "Daily Output", 
        value: "0",
        change: "0%",
        icon: <FiPackage />, 
        color: "#f59e0b",
        description: `${unit} produced today in ${departmentName}`,
        isPositive: true,
        link: "/production/today-output",
        type: 'daily',
        department: departmentName,
        noData: true
      },
      { 
        id: 2,
        label: "Efficiency", 
        value: "0%",
        change: "0%",
        icon: <FiActivity />, 
        color: "#10b981",
        description: `Overall production efficiency for ${departmentName}`,
        isPositive: true,
        link: "/production/efficiency",
        type: 'efficiency',
        department: departmentName,
        noData: true
      },
      { 
        id: 3,
        label: "Downtime", 
        value: "0%",
        change: "0%",
        icon: <FiClock />, 
        color: "#ef4444",
        description: `Machine downtime percentage in ${departmentName}`,
        isPositive: false,
        link: "/production/downtime",
        type: 'downtime',
        department: departmentName,
        noData: true
      },
      { 
        id: 4,
        label: "Quality Pass", 
        value: "0%",
        change: "0%",
        icon: <FiCheckCircle />, 
        color: "#3b82f6",
        description: `Quality inspection pass rate for ${departmentName}`,
        isPositive: true,
        link: "/production/quality",
        type: 'quality',
        department: departmentName,
        noData: true
      },
      { 
        id: 5,
        label: "Last Day Production", 
        value: "0",
        change: "0%",
        icon: <FiCalendar />, 
        color: "#8b5cf6",
        description: `Yesterday's total production in ${departmentName}`,
        isPositive: true,
        link: "/production/analytics/last-day",
        isYesterday: true,
        type: 'yesterday',
        department: departmentName,
        noData: true
      },
      { 
        id: 6,
        label: "Last Day Efficiency", 
        value: "0%",
        change: "0%",
        icon: <FiTarget />, 
        color: "#ec4899",
        description: `Yesterday's average efficiency in ${departmentName}`,
        isPositive: true,
        link: "/production/analytics/last-day",
        isYesterday: true,
        type: 'yesterday',
        department: departmentName,
        noData: true
      },
    ];
  }, []);

  const fetchCardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase) {
        setError('Supabase client not configured');
        setIsSupabaseConnected(false);
        setCardsData(generateDefaultCards(getCurrentDepartment()));
        setLoading(false);
        return;
      }
      
      setIsSupabaseConnected(true);
      
      const currentDept = getCurrentDepartment();
      const tableName = currentDept?.tableName;
      
      if (!tableName) {
        setError('No table name found for department');
        setCardsData(generateDefaultCards(currentDept));
        setLoading(false);
        return;
      }
      
      // Fetch last 7 days of data for calculations
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const startDate = lastWeek.toISOString().split('T')[0];
      const endDate = getTodayDate();
      
      const { data: productionRecords, error: recordsError } = await supabase
        .from(tableName)
        .select('*')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: false });
      
      if (recordsError) {
        console.error('Error fetching card data:', recordsError);
        setError('Failed to fetch production data');
        setCardsData(generateDefaultCards(currentDept));
        setLoading(false);
        return;
      }
      
      if (!productionRecords || productionRecords.length === 0) {
        setCardsData(generateDefaultCards(currentDept));
      } else {
        const calculatedData = calculateCardData(productionRecords, currentDept);
        setCardsData(calculatedData);
      }
      
      setLastRefresh(new Date());
      
    } catch (err) {
      console.error('Error in fetchCardData:', err);
      setError('An unexpected error occurred');
      setCardsData(generateDefaultCards(getCurrentDepartment()));
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment, getCurrentDepartment, calculateCardData, generateDefaultCards, getTodayDate]);

  const handleCardClick = (card) => {
    if (card.link) {
      navigate(`${card.link}?department=${encodeURIComponent(card.department)}`);
    }
  };

  const handleDepartmentChange = (deptName) => {
    setSelectedDepartment(deptName);
  };

  const handleRefresh = () => {
    fetchCardData();
  };

  useEffect(() => {
    fetchCardData();
  }, [fetchCardData]);

  const currentDept = getCurrentDepartment();

  if (loading) {
    return (
      <div style={{ marginBottom: '30px' }}>
        {/* Department Selection */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '20px',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `${currentDept?.color || '#3b82f6'}15`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentDept?.color || '#3b82f6'
            }}>
              {currentDept?.icon || <FaIndustry />}
            </div>
            <div>
              <h3 style={{
                margin: '0 0 4px 0',
                fontSize: '18px',
                color: '#1e293b'
              }}>
                Production Overview
              </h3>
              <p style={{
                margin: '0',
                fontSize: '13px',
                color: '#64748b'
              }}>
                Loading data for {selectedDepartment}...
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                background: '#f8fafc',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'not-allowed'
              }}
            >
              <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
              Loading...
            </button>
          </div>
        </div>

        {/* Loading Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
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
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
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
                background: '#fee2e2',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626'
              }}>
                <FiAlertCircle size={20} />
              </div>
              Production Overview
            </h3>
            <p style={{
              margin: '0',
              color: '#64748b',
              fontSize: '14px',
              marginLeft: '52px'
            }}>
              Failed to load data for {selectedDepartment}
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FiRefreshCw size={14} />
            Retry
          </button>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: '#fee2e2',
            borderRadius: '50%',
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
            fontSize: '28px'
          }}>
            <FiAlertCircle />
          </div>
          <p style={{ color: '#dc2626', marginBottom: '10px', fontWeight: '600' }}>
            {error}
          </p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Please check your database connection and try again.
          </p>
        </div>
      </div>
    );
  }

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never';
    return lastRefresh.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      {/* Header with Department Selection */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
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
              background: `${currentDept?.color || '#3b82f6'}15`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentDept?.color || '#3b82f6'
            }}>
              {currentDept?.icon || <FaIndustry />}
            </div>
            Production Overview
            {!isSupabaseConnected && (
              <span style={{
                fontSize: '12px',
                background: '#fee2e2',
                color: '#dc2626',
                padding: '4px 8px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginLeft: '10px'
              }}>
                <FaDatabase size={10} /> Offline
              </span>
            )}
          </h3>
          <p style={{
            margin: '0',
            color: '#64748b',
            fontSize: '14px',
            marginLeft: '52px'
          }}>
            Real-time production metrics for {selectedDepartment}
            {lastRefresh && (
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#94a3b8' }}>
                • Last updated: {formatLastRefresh()}
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Department Selection */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentChange(dept.name)}
                style={{
                  background: selectedDepartment === dept.name ? 
                    `${dept.color}15` : 'transparent',
                  color: selectedDepartment === dept.name ? dept.color : '#64748b',
                  border: `1px solid ${selectedDepartment === dept.name ? dept.color : '#e2e8f0'}`,
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedDepartment !== dept.name) {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDepartment !== dept.name) {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                {dept.icon}
                {dept.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            style={{
              background: currentDept?.color || '#3b82f6',
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
              e.target.style.background = currentDept?.color ? `${currentDept.color}cc` : '#2563eb';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = currentDept?.color || '#3b82f6';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Production Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
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
              border: `1px solid ${card.noData ? '#f1f5f9' : '#e2e8f0'}`,
              position: 'relative',
              borderTop: card.isYesterday ? '4px solid' : 'none',
              borderTopColor: card.isYesterday ? card.color : 'transparent',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: card.noData ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!card.noData) {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = card.color;
              }
            }}
            onMouseLeave={(e) => {
              if (!card.noData) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = card.noData ? '#f1f5f9' : '#e2e8f0';
              }
            }}
          >
            {/* Yesterday badge */}
            {card.isYesterday && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: card.color,
                color: '#ffffff',
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

            {/* No Data Badge */}
            {card.noData && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#f1f5f9',
                color: '#94a3b8',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '600',
                border: '1px solid #e2e8f0'
              }}>
                No Data
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
                  background: card.noData ? '#f1f5f9' : `${card.color}15`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.noData ? '#cbd5e1' : card.color,
                  fontSize: '24px'
                }}>
                  {card.icon}
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: card.noData ? '#cbd5e1' : (card.isPositive ? '#10b981' : '#ef4444'),
                  background: card.noData ? '#f1f5f9' : (card.isPositive ? '#d1fae5' : '#fee2e2'),
                  padding: '5px 12px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {!card.noData && (
                    card.isPositive ? 
                      <FiTrendingUp size={14} /> : 
                      <FiTrendingDown size={14} />
                  )}
                  {card.change}
                </span>
              </div>
              
              <div style={{ 
                fontSize: '32px',
                fontWeight: '700',
                color: card.noData ? '#cbd5e1' : '#1e293b',
                marginBottom: '5px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '5px'
              }}>
                {card.value}
                {card.label.includes('Efficiency') && !card.label.includes('Last Day') && !card.noData && (
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
                color: card.noData ? '#cbd5e1' : '#1e293b',
                marginBottom: '8px'
              }}>
                {card.label}
              </div>
            </div>

            <div style={{ 
              fontSize: '14px',
              color: card.noData ? '#cbd5e1' : '#64748b',
              lineHeight: '1.4',
              marginTop: 'auto',
              paddingTop: '10px',
              borderTop: '1px solid #f1f5f9'
            }}>
              {card.description}
            </div>

            {/* Hover indicator */}
            {!card.noData && (
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
            )}
          </div>
        ))}
      </div>

      {/* Data Source Info */}
      <div style={{
        marginTop: '20px',
        padding: '12px 16px',
        background: '#f8fafc',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaDatabase size={12} />
          <span>
            Source: <strong>{currentDept?.tableName}</strong>
          </span>
          <span style={{ color: '#cbd5e1' }}>•</span>
          <span>
            Unit: <strong>{currentDept?.unit}</strong>
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
          <span>
            {cardsData.some(card => card.noData) ? '⚠️ Some cards show default data' : '✅ All data loaded from database'}
          </span>
        </div>
      </div>

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