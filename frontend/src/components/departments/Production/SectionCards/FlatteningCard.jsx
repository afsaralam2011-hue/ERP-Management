// src/components/departments/Production/SectionCards/FlatteningCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import './cards.css';

const FlatteningCard = ({ data }) => {
  // Default data structure if none is provided
  const defaultData = {
    sectionName: 'Flattening',
    dailyTarget: 10000,
    dailyOutput: 8500,
    efficiency: 85,
    status: 'operational',
    alerts: 2,
    downtime: '45 min',
    trend: 'up',
    trendPercentage: 5,
    lastUpdated: '10:30 AM',
    targetAchievement: 85,
    machineUtilization: 78
  };

  const cardData = data || defaultData;

  // Calculate achievement color
  const getAchievementColor = (achievement) => {
    if (achievement >= 90) return 'high';
    if (achievement >= 75) return 'medium';
    return 'low';
  };

  // Calculate status color
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

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="section-card flattening-card">
      {/* Card Header */}
      <div className="card-header">
        <div className="section-title">
          <div className="section-icon">
            {/* You can use an SVG icon or image here */}
            <div className="icon-placeholder">
              <TrendingUp size={20} />
            </div>
          </div>
          <h3>{cardData.sectionName} Section</h3>
        </div>
        <div className={`section-status ${getStatusColor(cardData.status)}`}>
          <span className="status-dot"></span>
          {cardData.status}
        </div>
      </div>

      {/* Performance Metrics */}
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
            <div className="metric-label">Achievement</div>
            <div className="achievement-bar">
              <div 
                className="achievement-fill"
                style={{ width: `${cardData.targetAchievement}%` }}
              ></div>
              <span className="achievement-text">
                {cardData.targetAchievement}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Downtime */}
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

      {/* Machine Utilization */}
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

      {/* Last Updated */}
      <div className="last-updated">
        <Clock size={12} />
        <span>Updated: {cardData.lastUpdated}</span>
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        <Link 
          to="/production/flattening" 
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

export default FlatteningCard;