// src/pages/ProductionSections/FlatteningSection/FlatteningView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiEdit2, FiPrinter, FiDownload,
  FiCalendar, FiClock, FiUser, FiPackage,
  FiTarget, FiTrendingUp, FiDatabase,
  FiBox, FiLayers, FiMonitor, FiHash,
  FiCheckCircle, FiAlertCircle, FiX
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './FlatteningView.css';

const FlatteningView = ({ onClose, isModal = true }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetDetails, setTargetDetails] = useState(null);
  const [itemDetails, setItemDetails] = useState(null);

  useEffect(() => {
    if (id) {
      fetchRecordDetails();
    }
  }, [id]);

  const fetchRecordDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch record
      const { data: recordData, error: recordError } = await supabase
        .from('flatteningsection')
        .select('*')
        .eq('id', id)
        .single();

      if (recordError) throw recordError;

      setRecord(recordData);

      // Fetch target details
      if (recordData.targets_id) {
        const { data: targetData } = await supabase
          .from('targets')
          .select('*')
          .eq('targets_id', recordData.targets_id)
          .single();

        setTargetDetails(targetData || {});
      }

      // Fetch item details
      if (recordData.item_code) {
        const { data: itemData } = await supabase
          .from('items')
          .select('*')
          .eq('item_code', recordData.item_code)
          .single();

        setItemDetails(itemData || {});
      }

    } catch (error) {
      console.error('Error fetching record:', error);
      setError('Failed to load record details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(record, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `flattening_record_${id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleEdit = () => {
    if (isModal && onClose) {
      onClose();
    }
    navigate(`/production-sections/flattening/edit/${id}`);
  };

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate('/production-sections/flattening');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return '#27ae60';
    if (efficiency >= 80) return '#f39c12';
    if (efficiency >= 70) return '#e67e22';
    return '#e74c3c';
  };

  const getEfficiencyStatus = (efficiency) => {
    if (efficiency >= 90) return 'Excellent';
    if (efficiency >= 80) return 'Good';
    if (efficiency >= 70) return 'Average';
    return 'Below Target';
  };

  if (loading) {
    return (
      <div className="flattening-view-overlay" onClick={handleClose}>
        <div className="flattening-view-container" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Record Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flattening-view-overlay" onClick={handleClose}>
        <div className="flattening-view-container" onClick={(e) => e.stopPropagation()}>
          <div className="error-container">
            <FiAlertCircle size={50} color="#e74c3c" />
            <h3>Error Loading Record</h3>
            <p>{error || 'Record not found'}</p>
            <button className="back-btn" onClick={handleClose}>
              <FiArrowLeft /> Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flattening-view-overlay" onClick={handleClose}>
      <div className="flattening-view-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="view-header">
          <div className="header-content">
            <div className="header-icon">
              <FiPackage />
            </div>
            <div className="header-text">
              <h1>FLATTENING PRODUCTION RECORD</h1>
              <p>Viewing detailed information of production record</p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        {/* Record Info Bar */}
        <div className="record-info-bar">
          <div className="info-item">
            <FiDatabase /> Record ID: <span>#{id}</span>
          </div>
          <div className="info-item">
            <FiCalendar /> Date: <span>{formatDate(record.created_at)}</span>
          </div>
          <div className="info-item">
            <FiClock /> Time: <span>{formatTime(record.created_at)}</span>
          </div>
          <div className="info-item">
            <FiCheckCircle /> Status: <span style={{ color: '#27ae60' }}>Completed</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="view-content">
          
          {/* Section 1: Production Summary */}
          <div className="content-section summary-section">
            <div className="section-header">
              <h2><FiTrendingUp /> Production Summary</h2>
            </div>
            
            <div className="summary-grid">
              <div className="summary-card">
                <div className="card-icon" style={{ background: '#3498db' }}>
                  <FiTarget />
                </div>
                <div className="card-content">
                  <h3>Target ID</h3>
                  <p className="card-value">{record.targets_id || 'N/A'}</p>
                  <p className="card-label">Production Target</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{ background: '#2ecc71' }}>
                  <FiPackage />
                </div>
                <div className="card-content">
                  <h3>Item Code</h3>
                  <p className="card-value">{record.item_code || 'N/A'}</p>
                  <p className="card-label">Production Item</p>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-icon" style={{ background: '#9b59b6' }}>
                  <FiUser />
                </div>
                <div className="card-content">
                  <h3>Operator</h3>
                  <p className="card-value">{record.operator_name || 'N/A'}</p>
                  <p className="card-label">Machine Operator</p>
                </div>
              </div>

              <div className="summary-card efficiency-card" style={{ 
                borderColor: getEfficiencyColor(record.efficiency),
                background: getEfficiencyColor(record.efficiency) + '15'
              }}>
                <div className="card-icon" style={{ 
                  background: getEfficiencyColor(record.efficiency) 
                }}>
                  <FiTrendingUp />
                </div>
                <div className="card-content">
                  <h3>Efficiency</h3>
                  <p className="card-value" style={{ color: getEfficiencyColor(record.efficiency) }}>
                    {record.efficiency?.toFixed(1) || '0'}%
                  </p>
                  <p className="card-label">{getEfficiencyStatus(record.efficiency || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Production Details */}
          <div className="details-grid">
            
            {/* Left Column: Target & Machine */}
            <div className="detail-column">
              <div className="detail-section">
                <div className="section-header">
                  <h3><FiTarget /> Target & Machine Details</h3>
                </div>
                
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="detail-label">Target ID:</span>
                    <span className="detail-value">{record.targets_id || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Machine ID:</span>
                    <span className="detail-value">{record.machine_id || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Machine No:</span>
                    <span className="detail-value">{record.machine_no || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Shift:</span>
                    <span className="detail-value">
                      {record.shift_name} ({record.shift_code})
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Target Quantity:</span>
                    <span className="detail-value" style={{ color: '#27ae60' }}>
                      {targetDetails?.target_qty || 'N/A'} {targetDetails?.uom || record.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Item Details */}
            <div className="detail-column">
              <div className="detail-section">
                <div className="section-header">
                  <h3><FiBox /> Item Details</h3>
                </div>
                
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="detail-label">Item Code:</span>
                    <span className="detail-value">{record.item_code || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Item Name:</span>
                    <span className="detail-value">{record.item_name || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Coil Size:</span>
                    <span className="detail-value">{record.coil_size || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Material Type:</span>
                    <span className="detail-value">{record.material_type || 'N/A'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Production Quantity:</span>
                    <span className="detail-value" style={{ 
                      color: '#3498db', 
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {record.production_quantity?.toFixed(2)} {record.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Production Metrics */}
            <div className="detail-column">
              <div className="detail-section">
                <div className="section-header">
                  <h3><FiTrendingUp /> Production Metrics</h3>
                </div>
                
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="detail-label">Production Date:</span>
                    <span className="detail-value">{formatDate(record.created_at)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Production Time:</span>
                    <span className="detail-value">{formatTime(record.created_at)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Updated At:</span>
                    <span className="detail-value">
                      {record.updated_at ? formatDate(record.updated_at) : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Section:</span>
                    <span className="detail-value">{record.section_name || 'Flattening'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Database Table:</span>
                    <span className="detail-value" style={{ 
                      fontFamily: 'monospace',
                      color: '#9b59b6'
                    }}>
                      flatteningsection
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Remarks */}
          {record.remarks && (
            <div className="remarks-section">
              <div className="section-header">
                <h3><FiLayers /> Remarks & Notes</h3>
              </div>
              
              <div className="remarks-content">
                <p>{record.remarks}</p>
              </div>
            </div>
          )}

          {/* Section 4: Additional Info */}
          <div className="additional-info">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Created By:</span>
                <span className="info-value">System</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {record.updated_at ? formatTime(record.updated_at) : 'N/A'}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Record Status:</span>
                <span className="info-value" style={{ color: '#27ae60' }}>
                  <FiCheckCircle /> Active
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Data Source:</span>
                <span className="info-value">Supabase Database</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="view-actions">
          <div className="action-buttons-left">
            <button className="action-btn back-btn" onClick={handleClose}>
              <FiArrowLeft /> Back to List
            </button>
          </div>
          
          <div className="action-buttons-right">
            <button className="action-btn print-btn" onClick={handlePrint}>
              <FiPrinter /> Print
            </button>
            
            <button className="action-btn export-btn" onClick={handleExport}>
              <FiDownload /> Export
            </button>
            
            <button className="action-btn edit-btn" onClick={handleEdit}>
              <FiEdit2 /> Edit Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlatteningView;