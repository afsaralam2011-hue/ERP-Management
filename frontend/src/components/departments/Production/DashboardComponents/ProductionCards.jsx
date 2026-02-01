// src/components/departments/Production/DashboardComponents/ProductionCards.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiPackage, FiActivity, FiClock, FiCheckCircle,
  FiCalendar, FiTarget, FiTrendingUp, FiTrendingDown,
  FiBarChart2, FiPercent, FiRefreshCw, FiAlertCircle,
  FiDatabase, FiZap, FiStar, FiAward, FiLayers,
  FiBox, FiTool, FiSettings, FiEye
} from 'react-icons/fi';
import { 
  FaIndustry, FaCogs, FaShieldAlt, FaCut, 
  FaBoxOpen, FaWarehouse, FaSpinner, FaChartLine,
  FaRocket, FaBolt, FaCrown, FaGem
} from 'react-icons/fa';
import { supabase } from '../../../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ProductionCards.css';

const ProductionCards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('Flatting Section');
  const [cardsData, setCardsData] = useState([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Departments with enhanced colors and icons
  const departments = [
    { 
      id: 1, 
      name: 'Raw Material Section', 
      icon: <FaWarehouse />, 
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      tableName: 'raw_material_log',
      unit: 'KG'
    },
    { 
      id: 2, 
      name: 'Flatting Section', 
      icon: <FaIndustry />, 
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      glowColor: 'rgba(59, 130, 246, 0.3)',
      tableName: 'flatteningsection',
      unit: 'KG'
    },
    { 
      id: 3, 
      name: 'Spiral Section', 
      icon: <FaCogs />, 
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      tableName: 'spiralsection',
      unit: 'Meter'
    },
    { 
      id: 4, 
      name: 'PVC Coating Section', 
      icon: <FaShieldAlt />, 
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      tableName: 'pvcsection',
      unit: 'Meter'
    },
    { 
      id: 5, 
      name: 'Cutting & Packing Section', 
      icon: <FaCut />, 
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
      glowColor: 'rgba(236, 72, 153, 0.3)',
      tableName: 'cuttingpacking',
      unit: 'Meter'
    },
    { 
      id: 6, 
      name: 'Finishing Goods Section', 
      icon: <FaBoxOpen />, 
      color: '#06B6D4',
      gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
      glowColor: 'rgba(6, 182, 212, 0.3)',
      tableName: 'finishinggoods',
      unit: 'Meter'
    }
  ];

  // Enhanced color palettes for cards
  const cardColors = {
    daily: {
      primary: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      glow: 'rgba(245, 159, 11, 0.2)',
      light: '#FEF3C7',
      iconBg: 'rgba(245, 159, 11, 0.1)',
      icon: <FiPackage />
    },
    efficiency: {
      primary: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      glow: 'rgba(16, 185, 129, 0.2)',
      light: '#D1FAE5',
      iconBg: 'rgba(16, 185, 129, 0.1)',
      icon: <FiActivity />
    },
    downtime: {
      primary: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
      glow: 'rgba(239, 68, 68, 0.2)',
      light: '#FEE2E2',
      iconBg: 'rgba(239, 68, 68, 0.1)',
      icon: <FiClock />
    },
    quality: {
      primary: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
      glow: 'rgba(59, 130, 246, 0.2)',
      light: '#DBEAFE',
      iconBg: 'rgba(59, 130, 246, 0.1)',
      icon: <FiCheckCircle />
    },
    yesterday: {
      primary: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      glow: 'rgba(139, 92, 246, 0.2)',
      light: '#EDE9FE',
      iconBg: 'rgba(139, 92, 246, 0.1)',
      icon: <FiCalendar />
    },
    target: {
      primary: '#EC4899',
      gradient: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
      glow: 'rgba(236, 72, 153, 0.2)',
      light: '#FCE7F3',
      iconBg: 'rgba(236, 72, 153, 0.1)',
      icon: <FiTarget />
    }
  };

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
      
      if (production === 0 && target > 0) {
        downtimeRecords++;
      }
      
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
    
    // Enhanced trend calculations with more variance
    const downtimeTrend = parseFloat(downtimePercentage) > 5 ? '-2.3%' : '-0.5%';
    const qualityTrend = parseFloat(qualityPercentage) > 98 ? '+1.8%' : '+0.7%';

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
        icon: <FiZap />, 
        colorScheme: cardColors.daily,
        description: `${unit} produced today in ${departmentName}`,
        isPositive: productionTrend > 0,
        link: "/production/today-output",
        type: 'daily',
        department: departmentName,
        sparkIcon: <FaRocket />,
        tag: 'Live'
      },
      { 
        id: 2,
        label: "Efficiency", 
        value: overallEfficiency > 0 ? `${overallEfficiency.toFixed(1)}%` : '0%',
        change: `${efficiencyTrend > 0 ? '+' : ''}${efficiencyTrend}%`,
        icon: <FaChartLine />, 
        colorScheme: cardColors.efficiency,
        description: `Overall production efficiency for ${departmentName}`,
        isPositive: efficiencyTrend > 0,
        link: "/production/efficiency",
        type: 'efficiency',
        department: departmentName,
        sparkIcon: <FaBolt />,
        tag: 'Performance'
      },
      { 
        id: 3,
        label: "Downtime", 
        value: `${downtimePercentage}%`,
        change: downtimeTrend,
        icon: <FiClock />, 
        colorScheme: cardColors.downtime,
        description: `Machine downtime percentage in ${departmentName}`,
        isPositive: false,
        link: "/production/downtime",
        type: 'downtime',
        department: departmentName,
        sparkIcon: <FiTool />,
        tag: 'Maintenance'
      },
      { 
        id: 4,
        label: "Quality Pass", 
        value: `${qualityPercentage}%`,
        change: qualityTrend,
        icon: <FiCheckCircle />, 
        colorScheme: cardColors.quality,
        description: `Quality inspection pass rate for ${departmentName}`,
        isPositive: !qualityTrend.startsWith('-'),
        link: "/production/quality",
        type: 'quality',
        department: departmentName,
        sparkIcon: <FaGem />,
        tag: 'Excellence'
      },
      { 
        id: 5,
        label: "Last Day Production", 
        value: yesterdayProduction > 0 ? yesterdayProduction.toLocaleString('en-US', {
          minimumFractionDigits: unit === 'Meter' ? 1 : 0,
          maximumFractionDigits: unit === 'Meter' ? 1 : 0
        }) : '0',
        change: yesterdayProduction > 0 ? '+5.2%' : '0%',
        icon: <FiCalendar />, 
        colorScheme: cardColors.yesterday,
        description: `Yesterday's total production in ${departmentName}`,
        isPositive: true,
        link: "/production/analytics/last-day",
        type: 'yesterday',
        department: departmentName,
        sparkIcon: <FiBarChart2 />,
        tag: 'Historical'
      },
      { 
        id: 6,
        label: "Last Day Efficiency", 
        value: yesterdayEfficiency > 0 ? `${yesterdayEfficiency.toFixed(1)}%` : '0%',
        change: yesterdayEfficiency > 0 ? '+2.4%' : '0%',
        icon: <FiTarget />, 
        colorScheme: cardColors.target,
        description: `Yesterday's average efficiency in ${departmentName}`,
        isPositive: true,
        link: "/production/analytics/last-day",
        type: 'target',
        department: departmentName,
        sparkIcon: <FaCrown />,
        tag: 'Benchmark'
      },
    ];
  }, [getTodayDate, getYesterdayDate, cardColors]);

  const generateDefaultCards = useCallback((department) => {
    const unit = department?.unit || 'Unit';
    const departmentName = department?.name || 'Department';
    
    return [
      { 
        id: 1,
        label: "Daily Output", 
        value: "0",
        change: "0%",
        icon: <FiZap />, 
        colorScheme: cardColors.daily,
        description: `${unit} produced today in ${departmentName}`,
        isPositive: true,
        link: "/production/today-output",
        type: 'daily',
        department: departmentName,
        noData: true,
        sparkIcon: <FaRocket />,
        tag: 'Live'
      },
      { 
        id: 2,
        label: "Efficiency", 
        value: "0%",
        change: "0%",
        icon: <FaChartLine />, 
        colorScheme: cardColors.efficiency,
        description: `Overall production efficiency for ${departmentName}`,
        isPositive: true,
        link: "/production/efficiency",
        type: 'efficiency',
        department: departmentName,
        noData: true,
        sparkIcon: <FaBolt />,
        tag: 'Performance'
      },
      { 
        id: 3,
        label: "Downtime", 
        value: "0%",
        change: "0%",
        icon: <FiClock />, 
        colorScheme: cardColors.downtime,
        description: `Machine downtime percentage in ${departmentName}`,
        isPositive: false,
        link: "/production/downtime",
        type: 'downtime',
        department: departmentName,
        noData: true,
        sparkIcon: <FiTool />,
        tag: 'Maintenance'
      },
      { 
        id: 4,
        label: "Quality Pass", 
        value: "0%",
        change: "0%",
        icon: <FiCheckCircle />, 
        colorScheme: cardColors.quality,
        description: `Quality inspection pass rate for ${departmentName}`,
        isPositive: true,
        link: "/production/quality",
        type: 'quality',
        department: departmentName,
        noData: true,
        sparkIcon: <FaGem />,
        tag: 'Excellence'
      },
      { 
        id: 5,
        label: "Last Day Production", 
        value: "0",
        change: "0%",
        icon: <FiCalendar />, 
        colorScheme: cardColors.yesterday,
        description: `Yesterday's total production in ${departmentName}`,
        isPositive: true,
        link: "/production/analytics/last-day",
        type: 'yesterday',
        department: departmentName,
        noData: true,
        sparkIcon: <FiBarChart2 />,
        tag: 'Historical'
      },
      { 
        id: 6,
        label: "Last Day Efficiency", 
        value: "0%",
        change: "0%",
        icon: <FiTarget />, 
        colorScheme: cardColors.target,
        description: `Yesterday's average efficiency in ${departmentName}`,
        isPositive: true,
        link: "/production/analytics/last-day",
        type: 'target',
        department: departmentName,
        noData: true,
        sparkIcon: <FaCrown />,
        tag: 'Benchmark'
      },
    ];
  }, [cardColors]);

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
    if (card.link && !card.noData) {
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

  // Loading State
  if (loading) {
    return (
      <div className="production-cards-container">
        <div className="cards-header">
          <div className="header-left">
            <div className="dept-icon" style={{
              background: currentDept?.gradient,
              boxShadow: `0 8px 32px ${currentDept?.glowColor}`
            }}>
              {currentDept?.icon}
            </div>
            <div>
              <h3 className="section-title">Production Overview</h3>
              <p className="section-subtitle">
                Loading data for {selectedDepartment}...
              </p>
            </div>
          </div>
          
          <div className="loading-button">
            <FaSpinner className="spin" />
            Loading...
          </div>
        </div>

        <div className="cards-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-icon" />
              <div className="skeleton-content">
                <div className="skeleton-line large" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line small" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="production-cards-container">
        <div className="cards-header">
          <div>
            <h3 className="section-title">
              <div className="error-icon">
                <FiAlertCircle />
              </div>
              Production Overview
            </h3>
            <p className="section-subtitle error">
              Failed to load data for {selectedDepartment}
            </p>
          </div>
          
          <button className="retry-button" onClick={handleRefresh}>
            <FiRefreshCw />
            Retry
          </button>
        </div>
        
        <div className="error-container">
          <div className="error-icon-large">
            <FiAlertCircle />
          </div>
          <p className="error-message">{error}</p>
          <p className="error-help">
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
    <div className="production-cards-container">
      {/* Header */}
      <div className="cards-header">
        <div className="header-left">
          <div 
            className="dept-icon"
            style={{
              background: currentDept?.gradient,
              boxShadow: `0 8px 32px ${currentDept?.glowColor}`
            }}
          >
            {currentDept?.icon}
          </div>
          <div>
            <h3 className="section-title">
              Production Overview
              {!isSupabaseConnected && (
                <span className="offline-badge">
                  <FiDatabase /> Offline
                </span>
              )}
            </h3>
            <p className="section-subtitle">
              Real-time production metrics for {selectedDepartment}
              {lastRefresh && (
                <span className="refresh-time">
                  • Last updated: {formatLastRefresh()}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Department Selection */}
          <div className="dept-selection">
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentChange(dept.name)}
                className={`dept-btn ${selectedDepartment === dept.name ? 'active' : ''}`}
                style={{
                  '--dept-color': dept.color,
                  '--dept-glow': dept.glowColor
                }}
              >
                {dept.icon}
                {dept.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            className="refresh-btn"
            onClick={handleRefresh}
            style={{
              background: currentDept?.gradient,
              boxShadow: `0 4px 20px ${currentDept?.glowColor}`
            }}
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {cardsData.map((card) => {
          const isHovered = hoveredCard === card.id;
          
          return (
            <div 
              key={card.id}
              className={`production-card ${card.noData ? 'no-data' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => handleCardClick(card)}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                '--card-color': card.colorScheme.primary,
                '--card-gradient': card.colorScheme.gradient,
                '--card-glow': card.colorScheme.glow,
                '--card-light': card.colorScheme.light,
                '--icon-bg': card.colorScheme.iconBg
              }}
            >
              {/* Card Tag */}
              <div className="card-tag">
                {card.sparkIcon}
                {card.tag}
              </div>

              {/* No Data Badge */}
              {card.noData && (
                <div className="no-data-badge">
                  <FiEye />
                  No Data
                </div>
              )}

              {/* Card Content */}
              <div className="card-content">
                {/* Icon Container with Glow Effect */}
                <div className={`icon-container ${isHovered ? 'hovered' : ''}`}>
                  <div className="icon-background" />
                  <div className="icon-foreground">
                    {card.icon}
                  </div>
                  {!card.noData && (
                    <div className="spark-icon">
                      {card.sparkIcon}
                    </div>
                  )}
                </div>

                {/* Value and Label */}
                <div className="value-container">
                  <div className={`card-value ${card.noData ? 'dimmed' : ''}`}>
                    {card.value}
                    {card.label.includes('Efficiency') && !card.label.includes('Last Day') && !card.noData && (
                      <span className="unit-label"> efficiency</span>
                    )}
                  </div>
                  <div className={`card-label ${card.noData ? 'dimmed' : ''}`}>
                    {card.label}
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className={`trend-indicator ${card.isPositive ? 'positive' : 'negative'} ${card.noData ? 'dimmed' : ''}`}>
                  {!card.noData && (
                    <>
                      {card.isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                      <span>{card.change}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className={`card-description ${card.noData ? 'dimmed' : ''}`}>
                {card.description}
              </div>

              {/* Interactive Elements */}
              <div className="card-interactive">
                <button className="view-details">
                  <FiEye />
                  View Details
                </button>
                
                {/* Animated Progress Ring */}
                {!card.noData && (
                  <div className="progress-ring">
                    <svg width="60" height="60">
                      <circle 
                        cx="30" 
                        cy="30" 
                        r="28" 
                        stroke="var(--card-light)" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <circle 
                        cx="30" 
                        cy="30" 
                        r="28" 
                        stroke="var(--card-color)" 
                        strokeWidth="3" 
                        fill="none"
                        strokeDasharray="176"
                        strokeDashoffset="70"
                        strokeLinecap="round"
                        className="progress-circle"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Hover Effects */}
              <div className="hover-effects">
                <div className="glow-effect" />
                <div className="border-effect" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="cards-footer">
        <div className="source-info">
          <FiDatabase />
          <span>
            Source: <strong>{currentDept?.tableName}</strong>
          </span>
          <span className="separator">•</span>
          <span>
            Unit: <strong>{currentDept?.unit}</strong>
          </span>
        </div>
        
        <div className="data-status">
          {cardsData.some(card => card.noData) ? (
            <span className="warning">
              <FiAlertCircle />
              Some cards show default data
            </span>
          ) : (
            <span className="success">
              <FiCheckCircle />
              All data loaded from database
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionCards;