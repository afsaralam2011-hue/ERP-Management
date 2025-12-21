// src/components/departments/Production/SectionCards/SpiralCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, ArrowRight, Settings } from 'lucide-react';
import './cards.css';

const SpiralCard = ({ data }) => {
  const defaultData = {
    sectionName: 'Spiral',
    dailyTarget: 8500,
    dailyOutput: 8200,
    efficiency: 96.5,
    status: 'operational',
    alerts: 1,
    downtime: '15 min',
    trend: 'up',
    trendPercentage: 1.2,
    lastUpdated: '11:30 AM',
    targetAchievement: 96.5,
    machineUtilization: 88,
    sectionType: 'spiral',
    qualityRate: '98.2%',
    oee: '89.3%'
  };

  const cardData = data || defaultData;

  const getAchievementColor = (achievement) => {
    if (achievement >= 95) return 'high';
    if (achievement >= 85) return 'medium';
    return 'low';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'status-operational';
      case 'maintenance':
        return 'status-maintenance';
      case 'downtime':
        return 'status-downtime';
      case 'idle':
        return 'status-idle';
      default:
        return 'status-operational';
    }
  };

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="section-card spiral-card">
      <div className="card-header">
        <div className="section-title">
          <div className="section-icon">
            <div className="icon-placeholder">
              <Settings size={20} />
            </div>
          </div>
          <h3>{cardData.sectionName} Section</h3>
        </div>
        <div className={`section-status ${getStatusColor(cardData.status)}`}>
          <span className="status-dot"></span>
          {cardData.status}
        </div>
      </div>

      <div className="card-metrics">
        <div className="metric-row">
          <div className="metric-item">
            <div className="metric-label">Daily Target</div>
            <div className="metric-value">
              {formatNumber(cardData.dailyTarget)} units
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Output</div>
            <div className="metric-value output-value">
              {formatNumber(cardData.dailyOutput)} units
            </div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-item">
            <div className="metric-label">Efficiency</div>
            <div className="metric-value efficiency-value">
              <span className={`efficiency-percentage ${getAchievementColor(cardData.efficiency)}`}>
                {cardData.efficiency}%
              </span>
              {cardData.trend === 'up' ? (
                <TrendingUp className="trend-icon up" size={16} />
              ) : (
                <TrendingDown className="trend-icon down" size={16} />
              )}
              <span className={`trend-percentage ${cardData.trend}`}>
                {cardData.trendPercentage}%
              </span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">OEE</div>
            <div className="achievement-bar">
              <div 
                className="achievement-fill"
                style={{ width: `${cardData.oee.replace('%', '')}%` }}
              ></div>
              <span className="achievement-text">
                {cardData.oee}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-alerts">
        {cardData.alerts > 0 && (
          <div className="alert-item">
            <AlertTriangle className="alert-icon" size={16} />
            <span className="alert-count">{cardData.alerts} alerts</span>
          </div>
        )}
        <div className="downtime-item">
          <Clock className="downtime-icon" size={16} />
          <span className="downtime-text">Downtime: {cardData.downtime}</span>
        </div>
      </div>

      <div className="utilization-section">
        <div className="utilization-label">Machine Utilization</div>
        <div className="utilization-bar">
          <div 
            className="utilization-fill"
            style={{ width: `${cardData.machineUtilization}%` }}
          ></div>
          <span className="utilization-text">
            {cardData.machineUtilization}%
          </span>
        </div>
      </div>

      <div className="quality-section">
        <div className="quality-label">Quality Rate</div>
        <div className="quality-bar">
          <div 
            className="quality-fill"
            style={{ width: `${cardData.qualityRate.replace('%', '')}%` }}
          ></div>
          <span className="quality-text">
            {cardData.qualityRate}
          </span>
        </div>
      </div>

      <div className="last-updated">
        <Clock size={12} />
        <span>Updated: {cardData.lastUpdated}</span>
      </div>

      <div className="card-actions">
        <Link 
          to="/production/spiral" 
          className="view-details-btn"
        >
          View Details
          <ArrowRight size={16} />
        </Link>
        <button className="quick-actions-btn">
          Quick Actions
        </button>
      </div>
    </div>
  );
};

export default SpiralCard;