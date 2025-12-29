// components/InventoryAlerts.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiAlertTriangle, FiCheckCircle, FiXCircle, 
  FiBell, FiFilter, FiRefreshCw, FiClock,
  FiPackage, FiArrowRight, FiExternalLink
} from 'react-icons/fi';
import { supabase } from '../supabaseClient';
import './InventoryAlerts.css';

const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0
  });

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('inventory_alerts')
        .select(`
          *,
          material_master (
            item_code,
            item_name,
            material_type
          )
        `)
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      
      if (filter !== 'all') {
        query = query.eq('alert_level', filter.toUpperCase());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setAlerts(data || []);
      calculateStats(data || []);
      
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (alertsData) => {
    const stats = {
      total: alertsData.length,
      critical: alertsData.filter(a => a.alert_level === 'CRITICAL').length,
      warning: alertsData.filter(a => a.alert_level === 'WARNING').length,
      info: alertsData.filter(a => a.alert_level === 'INFO').length
    };
    setStats(stats);
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({
          resolved: true,
          resolved_by: 'System Admin',
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);
      
      if (error) throw error;
      
      // الرٹس ریفریش کریں
      loadAlerts();
      
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleResolveAll = async () => {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({
          resolved: true,
          resolved_by: 'System Admin',
          resolved_at: new Date().toISOString()
        })
        .eq('resolved', false);
      
      if (error) throw error;
      
      // الرٹس ریفریش کریں
      loadAlerts();
      
    } catch (error) {
      console.error('Error resolving all alerts:', error);
    }
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'CRITICAL':
        return <FiAlertTriangle className="alert-icon critical" />;
      case 'WARNING':
        return <FiAlertTriangle className="alert-icon warning" />;
      case 'INFO':
        return <FiBell className="alert-icon info" />;
      default:
        return <FiBell className="alert-icon" />;
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#e74c3c';
      case 'WARNING': return '#f39c12';
      case 'INFO': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="alerts-loading">
        <div className="loading-spinner"></div>
        <p>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="inventory-alerts">
      {/* ہیڈر */}
      <div className="alerts-header">
        <div className="header-left">
          <h2><FiAlertTriangle /> Inventory Alerts</h2>
          <p className="subtitle">Real-time notifications for inventory issues</p>
        </div>
        
        <div className="header-right">
          <div className="filter-controls">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Alerts ({stats.total})</option>
              <option value="critical">Critical ({stats.critical})</option>
              <option value="warning">Warning ({stats.warning})</option>
              <option value="info">Info ({stats.info})</option>
            </select>
            
            <button className="btn btn-refresh" onClick={loadAlerts}>
              <FiRefreshCw /> Refresh
            </button>
            
            <button className="btn btn-resolve-all" onClick={handleResolveAll}>
              <FiCheckCircle /> Resolve All
            </button>
          </div>
        </div>
      </div>

      {/* اسٹیٹس کارڈز */}
      <div className="alert-stats">
        <div className="stat-card total">
          <div className="stat-icon">
            <FiBell />
          </div>
          <div className="stat-content">
            <h3>Total Alerts</h3>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-subtext">Active notifications</div>
          </div>
        </div>
        
        <div className="stat-card critical">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <h3>Critical</h3>
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-subtext">Require immediate action</div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <h3>Warning</h3>
            <div className="stat-value">{stats.warning}</div>
            <div className="stat-subtext">Need attention soon</div>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">
            <FiBell />
          </div>
          <div className="stat-content">
            <h3>Information</h3>
            <div className="stat-value">{stats.info}</div>
            <div className="stat-subtext">For your reference</div>
          </div>
        </div>
      </div>

      {/* الرٹس لسٹ */}
      <div className="alerts-list">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div 
              key={alert.id} 
              className={`alert-item ${alert.alert_level.toLowerCase()}`}
              style={{ borderLeftColor: getAlertColor(alert.alert_level) }}
            >
              <div className="alert-icon-container">
                {getAlertIcon(alert.alert_level)}
              </div>
              
              <div className="alert-content">
                <div className="alert-header">
                  <h4 className="alert-title">{alert.alert_type.replace('_', ' ')}</h4>
                  <div className="alert-time">
                    <FiClock /> {formatTime(alert.created_at)}
                  </div>
                </div>
                
                <p className="alert-message">{alert.alert_message}</p>
                
                <div className="alert-meta">
                  {alert.material_master && (
                    <div className="meta-item">
                      <FiPackage />
                      <span className="material-info">
                        {alert.material_master.item_code} - {alert.material_master.item_name}
                      </span>
                      <span className="material-type">{alert.material_master.material_type}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="alert-actions">
                <button
                  className="btn-resolve"
                  onClick={() => handleResolveAlert(alert.id)}
                  title="Mark as resolved"
                >
                  <FiCheckCircle /> Resolve
                </button>
                
                <button
                  className="btn-view"
                  title="View details"
                  onClick={() => {
                    // View details functionality
                    console.log('View alert:', alert);
                  }}
                >
                  <FiExternalLink /> Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-alerts">
            <div className="no-alerts-icon">
              <FiCheckCircle size={64} />
            </div>
            <h3>No Active Alerts</h3>
            <p>All inventory levels are within normal range</p>
            <div className="no-alerts-stats">
              <div className="stat">
                <span className="stat-number">0</span>
                <span className="stat-label">Critical Alerts</span>
              </div>
              <div className="stat">
                <span className="stat-number">0</span>
                <span className="stat-label">Warning Alerts</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* فٹر */}
      <div className="alerts-footer">
        <div className="footer-info">
          <div className="info-item">
            <FiClock /> Last checked: {new Date().toLocaleTimeString()}
          </div>
          <div className="info-item">
            Auto-refresh in: <span className="countdown">30s</span>
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn btn-outline">
            <FiFilter /> Alert Settings
          </button>
          <button className="btn btn-outline">
            <FiArrowRight /> View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryAlerts;