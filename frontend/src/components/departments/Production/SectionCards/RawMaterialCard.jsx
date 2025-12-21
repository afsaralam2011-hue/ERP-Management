// src/components/departments/Production/SectionCards/RawMaterialCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, ArrowRight, Box, Truck } from 'lucide-react';
import './cards.css';

const RawMaterialCard = ({ data }) => {
  const defaultData = {
    sectionName: 'Raw Material',
    dailyTarget: 5000,
    dailyOutput: 4800,
    efficiency: 96.0,
    status: 'operational',
    alerts: 2,
    downtime: '25 min',
    trend: 'up',
    trendPercentage: 0.8,
    lastUpdated: '11:20 AM',
    targetAchievement: 96.0,
    machineUtilization: 78,
    sectionType: 'raw-material',
    stockLevel: '65%',
    materialQuality: '98.5%',
    reorderLevel: '30%'
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
    <div className="section-card raw-material-card">
      <div className="card-header">
        <div className="section-title">
          <div className="section-icon">
            <div className="icon-placeholder">
              <Box size={20} />
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
              {formatNumber(cardData.dailyTarget)} kg
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Output</div>
            <div className="metric-value output-value">
              {formatNumber(cardData.dailyOutput)} kg
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
            <div className="metric-label">Material Quality</div>
            <div className="achievement-bar">
              <div 
                className="achievement-fill"
                style={{ width: `${cardData.materialQuality.replace('%', '')}%` }}
              ></div>
              <span className="achievement-text">
                {cardData.materialQuality}
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
        <div className="utilization-label">Stock Level</div>
        <div className="utilization-bar">
          <div 
            className="utilization-fill"
            style={{ width: `${cardData.stockLevel.replace('%', '')}%` }}
          ></div>
          <span className="utilization-text">
            {cardData.stockLevel}
          </span>
        </div>
      </div>

      <div className="quality-section">
        <div className="quality-label">Reorder Level</div>
        <div className="quality-bar warning">
          <div 
            className="quality-fill"
            style={{ width: `${cardData.reorderLevel.replace('%', '')}%` }}
          ></div>
          <span className="quality-text">
            {cardData.reorderLevel}
          </span>
        </div>
      </div>

      <div className="last-updated">
        <Clock size={12} />
        <span>Updated: {cardData.lastUpdated}</span>
      </div>

      <div className="card-actions">
        <Link 
          to="/production/raw-material" 
          className="view-details-btn"
        >
          View Details
          <ArrowRight size={16} />
        </Link>
        <button className="quick-actions-btn">
          <Truck size={16} />
          Order Material
        </button>
      </div>
    </div>
  );
};

export default RawMaterialCard;