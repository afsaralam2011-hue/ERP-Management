// ========================================================
// FILE: FlatteningEditForm.jsx
// PURPOSE: Edit Form for Flattening Section Records
// VERSION: 100% Complete - Edit Functionality
// ========================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiX, FiTarget, FiPackage,
  FiUser, FiEdit2, FiClipboard, FiSettings,
  FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiList, FiTrendingUp,
  FiDatabase, FiRefreshCw, FiInfo,
  FiArrowLeft, FiArrowRight, FiSearch,
  FiCalendar, FiClock, FiHash
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './FlatteningForm.css';

const FlatteningEditForm = ({ onClose, isModal = true }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get record ID from URL
  
  // States
  const [recordData, setRecordData] = useState({
    id: '',
    section_name: 'Flattening',
    targets_id: '',
    machine_id: '',
    machine_no: '',
    shift_code: '',
    shift_name: '',
    target_qty: 0,
    unit: 'Kg',
    item_code: '',
    item_name: '',
    coil_size: '',
    material_type: '',
    operator_name: '',
    production_quantity: '',
    efficiency: 0,
    remarks: '',
    created_at: '',
    updated_at: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [machines, setMachines] = useState([]);
  const [shifts, setShifts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldStatus, setFieldStatus] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // ==================== CHECK MOBILE ====================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch record data if ID exists
        if (id) {
          const { data: record, error: recordError } = await supabase
            .from('flatteningsection')
            .select('*')
            .eq('id', id)
            .single();
          
          if (recordError) throw recordError;
          
          if (record) {
            setRecordData(record);
            setOriginalData(record);
          }
        }
        
        // Fetch reference data
        const [itemsRes, targetsRes] = await Promise.all([
          supabase.from('items').select('*').order('item_name'),
          supabase.from('targets').select('*').order('id')
        ]);
        
        if (itemsRes.error) throw itemsRes.error;
        if (targetsRes.error) throw targetsRes.error;
        
        setItems(itemsRes.data || []);
        setTargets(targetsRes.data || []);
        
        // Extract unique machines and shifts from targets
        const uniqueMachines = [...new Set(targetsRes.data.map(t => t.machine_id || t.machine_no))];
        const uniqueShifts = [...new Set(targetsRes.data.map(t => t.shift_code || t.shift_name))];
        
        setMachines(uniqueMachines.filter(Boolean));
        setShifts(uniqueShifts.filter(Boolean));
        
      } catch (error) {
        console.error('❌ Data fetching error:', error);
        setError('Failed to load data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // ==================== HANDLE CHANGES ====================
  useEffect(() => {
    // Check if any field has changed
    const changed = Object.keys(recordData).some(key => 
      recordData[key] !== originalData[key]
    );
    setHasChanges(changed);
  }, [recordData, originalData]);

  const handleChange = (field, value) => {
    setRecordData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate efficiency if target_qty or production_quantity changes
      if (field === 'target_qty' || field === 'production_quantity') {
        const targetQty = field === 'target_qty' ? parseFloat(value) : parseFloat(prev.target_qty);
        const productionQty = field === 'production_quantity' ? parseFloat(value) : parseFloat(prev.production_quantity);
        
        if (targetQty > 0 && productionQty > 0) {
          const efficiency = (productionQty / targetQty) * 100;
          updated.efficiency = Math.min(100, parseFloat(efficiency.toFixed(2)));
        } else {
          updated.efficiency = 0;
        }
      }
      
      // Auto-fill item details when item_code changes
      if (field === 'item_code' && value) {
        const selectedItem = items.find(item => item.item_code === value);
        if (selectedItem) {
          updated.item_name = selectedItem.item_name || '';
          updated.coil_size = selectedItem.coil_size || '';
          updated.material_type = selectedItem.material_type || '';
          updated.unit = selectedItem.unit || 'Kg';
        }
      }
      
      // Auto-fill target details when targets_id changes
      if (field === 'targets_id' && value) {
        const selectedTarget = targets.find(target => 
          target.targets_id === value || target.id === value
        );
        if (selectedTarget) {
          updated.machine_id = selectedTarget.machine_id || '';
          updated.machine_no = selectedTarget.machine_no || '';
          updated.shift_code = selectedTarget.shift_code || '';
          updated.shift_name = selectedTarget.shift_name || '';
          updated.target_qty = parseFloat(selectedTarget.target_qty || 0);
        }
      }
      
      return updated;
    });
    
    // Update field status
    const newStatus = { ...fieldStatus };
    if (value !== undefined && value !== null && value.toString().trim() !== '') {
      newStatus[field] = 'filled-valid';
    } else if (field === 'operator_name' || field === 'item_code' || field === 'production_quantity') {
      newStatus[field] = 'empty-required';
    } else {
      newStatus[field] = '';
    }
    setFieldStatus(newStatus);
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const errors = {};
    const newFieldStatus = {};
    
    // Required fields validation
    const requiredFields = [
      'targets_id',
      'item_code', 
      'production_quantity',
      'operator_name'
    ];
    
    requiredFields.forEach(field => {
      if (!recordData[field] || recordData[field].toString().trim() === '') {
        errors[field] = `${field.replace('_', ' ').toUpperCase()} is required`;
        newFieldStatus[field] = 'empty-required';
      } else {
        newFieldStatus[field] = 'filled-valid';
      }
    });
    
    // Quantity validation
    if (recordData.production_quantity) {
      const qty = parseFloat(recordData.production_quantity);
      if (isNaN(qty) || qty <= 0) {
        errors.production_quantity = 'Valid quantity is required';
        newFieldStatus.production_quantity = 'empty-required';
      }
    }
    
    setFieldStatus(newFieldStatus);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all required fields correctly');
      return;
    }
    
    if (!hasChanges) {
      setSuccess('No changes detected');
      setTimeout(() => setSuccess(''), 2000);
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const updatedRecord = {
        ...recordData,
        updated_at: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('flatteningsection')
        .update(updatedRecord)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      setSuccess('✅ Record updated successfully!');
      setOriginalData(updatedRecord);
      setHasChanges(false);
      
      setTimeout(() => {
        if (isModal && onClose) {
          onClose();
        } else {
          navigate('/production-sections/flattening');
        }
      }, 1500);
      
    } catch (error) {
      console.error('❌ Update error:', error);
      setError('❌ Update failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== RESET FORM ====================
  const handleReset = () => {
    setRecordData(originalData);
    setValidationErrors({});
    setError('');
    setSuccess('');
    setHasChanges(false);
  };

  // ==================== DELETE RECORD ====================
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      const { error: deleteError } = await supabase
        .from('flatteningsection')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setSuccess('🗑️ Record deleted successfully! Redirecting...');
      
      setTimeout(() => {
        if (isModal && onClose) {
          onClose();
        } else {
          navigate('/production-sections/flattening');
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      setError('❌ Delete failed: ' + error.message);
      setSaving(false);
    }
  };

  // ==================== BACK NAVIGATION ====================
  const handleBackClick = () => {
    navigate('/production-sections/flattening');
  };

  // ==================== UI HELPERS ====================
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

  const getFieldClass = (fieldName, value) => {
    if (!value || value.toString().trim() === '') {
      return 'empty-required';
    }
    return 'filled-valid';
  };

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate('/production-sections/flattening');
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flattening-modal-overlay" onClick={handleClose}>
        <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Edit Form...</p>
            <div className="loading-details">
              <p>🔄 Loading record ID: {id}</p>
              <p>📊 Fetching reference data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="flattening-modal-overlay" onClick={handleClose}>
      <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon edit-icon">
              <FiEdit2 />
            </div>
            <div className="header-text">
              <h1>EDIT FLATTENING PRODUCTION</h1>
              <p>
                <FiHash /> Record ID: {id} | 
                <FiCalendar /> Created: {new Date(recordData.created_at).toLocaleDateString()} |
                {hasChanges && <span className="unsaved-changes"> • UNSAVED CHANGES</span>}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="back-button"
              onClick={handleBackClick}
              title="Back to Flattening Section"
            >
              <FiArrowLeft /> {!isMobile && 'BACK TO LIST'}
            </button>
            <button className="close-button" onClick={handleClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        {success && (
          <div className="message success">
            <FiCheck /> {success}
          </div>
        )}

        {error && (
          <div className="message error">
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          
          {/* RECORD INFO SECTION */}
          <div className="record-info-section">
            <div className="section-title">
              <FiInfo /> RECORD INFORMATION
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Record ID:</span>
                <span className="info-value">{id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {new Date(recordData.created_at).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">
                  {recordData.updated_at ? 
                    new Date(recordData.updated_at).toLocaleString() : 
                    'Never'
                  }
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value ${hasChanges ? 'status-unsaved' : 'status-saved'}`}>
                  {hasChanges ? 'Unsaved Changes' : 'Saved'}
                </span>
              </div>
            </div>
          </div>

          {/* TARGET & MACHINE SECTION */}
          <div className="target-section">
            <div className="section-title">
              <FiTarget /> TARGET & MACHINE DETAILS
            </div>
            
            <div className={`target-grid ${isMobile ? 'mobile-grid' : ''}`}>
              {/* Target Selection */}
              <div className="selection-box">
                <label className="selection-label required">
                  <FiTarget /> TARGET ID
                </label>
                <select
                  value={recordData.targets_id}
                  onChange={(e) => handleChange('targets_id', e.target.value)}
                  className={`form-select ${fieldStatus.targets_id || getFieldClass('targets_id', recordData.targets_id)}`}
                >
                  <option value="">-- SELECT TARGET --</option>
                  {targets.map(target => {
                    const displayId = target.targets_id || target.id;
                    const displayName = target.target_name || '';
                    return (
                      <option key={displayId} value={displayId}>
                        {displayId} {displayName ? `- ${displayName}` : ''}
                      </option>
                    );
                  })}
                </select>
                {validationErrors.targets_id && (
                  <span className="error-text">{validationErrors.targets_id}</span>
                )}
              </div>

              {/* Machine ID */}
              <div className="selection-box">
                <label className="selection-label">MACHINE ID</label>
                <input
                  type="text"
                  value={recordData.machine_id}
                  onChange={(e) => handleChange('machine_id', e.target.value)}
                  className="selection-input"
                />
              </div>

              {/* Machine No */}
              <div className="selection-box">
                <label className="selection-label">MACHINE NO</label>
                <input
                  type="text"
                  value={recordData.machine_no}
                  onChange={(e) => handleChange('machine_no', e.target.value)}
                  className="selection-input"
                />
              </div>

              {/* Shift */}
              <div className="selection-box">
                <label className="selection-label">SHIFT</label>
                <div className="shift-input-group">
                  <input
                    type="text"
                    value={recordData.shift_code}
                    onChange={(e) => handleChange('shift_code', e.target.value)}
                    className="shift-code-input"
                    placeholder="Code"
                  />
                  <input
                    type="text"
                    value={recordData.shift_name}
                    onChange={(e) => handleChange('shift_name', e.target.value)}
                    className="shift-name-input"
                    placeholder="Name"
                  />
                </div>
              </div>

              {/* Target Quantity */}
              <div className="selection-box target-qty-box">
                <label className="selection-label">TARGET QTY</label>
                <div className="target-qty-input-group">
                  <input
                    type="number"
                    value={recordData.target_qty}
                    onChange={(e) => handleChange('target_qty', parseFloat(e.target.value) || 0)}
                    step="0.01"
                    min="0"
                    className="target-qty-input"
                  />
                  <span className="unit-label">{recordData.unit}</span>
                </div>
              </div>

              {/* Efficiency Display */}
              <div className="selection-box efficiency-box">
                <label className="selection-label">
                  <FiTrendingUp /> EFFICIENCY
                </label>
                <div 
                  className="efficiency-value"
                  style={{ color: getEfficiencyColor(recordData.efficiency) }}
                >
                  {recordData.efficiency.toFixed(1)}%
                </div>
                <div className="efficiency-label">
                  {getEfficiencyStatus(recordData.efficiency)}
                </div>
              </div>
            </div>
          </div>

          {/* ITEM DETAILS SECTION */}
          <div className="item-details-section">
            <div className="section-title">
              <FiPackage /> ITEM DETAILS
            </div>
            
            <div className={`item-grid ${isMobile ? 'mobile-grid' : ''}`}>
              {/* Item Code */}
              <div className="form-group">
                <label className="form-label required">
                  <FiPackage /> ITEM CODE
                </label>
                <select
                  value={recordData.item_code}
                  onChange={(e) => handleChange('item_code', e.target.value)}
                  className={`form-select ${fieldStatus.item_code || getFieldClass('item_code', recordData.item_code)}`}
                >
                  <option value="">-- SELECT ITEM --</option>
                  {items.map(item => (
                    <option key={item.item_code} value={item.item_code}>
                      {item.item_code} - {item.item_name}
                    </option>
                  ))}
                </select>
                {validationErrors.item_code && (
                  <span className="error-text">{validationErrors.item_code}</span>
                )}
              </div>

              {/* Item Name */}
              <div className="form-group">
                <label className="form-label">ITEM NAME</label>
                <input
                  type="text"
                  value={recordData.item_name}
                  onChange={(e) => handleChange('item_name', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Coil Size */}
              <div className="form-group">
                <label className="form-label">COIL SIZE</label>
                <input
                  type="text"
                  value={recordData.coil_size}
                  onChange={(e) => handleChange('coil_size', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Material Type */}
              <div className="form-group">
                <label className="form-label">MATERIAL TYPE</label>
                <input
                  type="text"
                  value={recordData.material_type}
                  onChange={(e) => handleChange('material_type', e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Production Quantity */}
              <div className="form-group">
                <label className="form-label required">PRODUCTION QTY</label>
                <div className="quantity-input-group">
                  <input
                    type="number"
                    value={recordData.production_quantity}
                    onChange={(e) => handleChange('production_quantity', e.target.value)}
                    step="0.01"
                    min="0"
                    className={`form-input ${fieldStatus.production_quantity || getFieldClass('production_quantity', recordData.production_quantity)}`}
                  />
                  <span className="unit-label">{recordData.unit}</span>
                </div>
                {validationErrors.production_quantity && (
                  <span className="error-text">{validationErrors.production_quantity}</span>
                )}
              </div>
            </div>
          </div>

          {/* OPERATOR & REMARKS */}
          <div className="bottom-section">
            <div className={`operator-row ${isMobile ? 'mobile-operator' : ''}`}>
              {/* Operator Name */}
              <div className="form-group">
                <label className="form-label required">
                  <FiUser /> OPERATOR NAME
                </label>
                <input
                  type="text"
                  value={recordData.operator_name}
                  onChange={(e) => handleChange('operator_name', e.target.value)}
                  className={`form-input ${fieldStatus.operator_name || getFieldClass('operator_name', recordData.operator_name)}`}
                  placeholder="Enter operator name"
                />
                {validationErrors.operator_name && (
                  <span className="error-text">{validationErrors.operator_name}</span>
                )}
              </div>
              
              {/* Remarks */}
              <div className="form-group remarks-group">
                <label className="form-label">
                  <FiClipboard /> REMARKS
                </label>
                <textarea
                  value={recordData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  className="form-textarea"
                  placeholder="Enter any additional notes or remarks..."
                  rows={isMobile ? "2" : "3"}
                />
              </div>
            </div>
          </div>

          {/* FORM ACTIONS */}
          <div className="actions-section">
            <div className="change-indicator">
              {hasChanges ? (
                <div className="changes-detected">
                  <FiAlertCircle /> UNSAVED CHANGES DETECTED
                </div>
              ) : (
                <div className="no-changes">
                  <FiCheck /> NO CHANGES DETECTED
                </div>
              )}
            </div>
            
            <div className={`action-buttons ${isMobile ? 'mobile-buttons' : ''}`}>
              {/* DELETE BUTTON */}
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-delete"
                disabled={saving}
              >
                <FiTrash2 /> {!isMobile && 'DELETE'}
              </button>
              
              {/* RESET BUTTON */}
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-reset"
                disabled={!hasChanges || saving}
              >
                <FiRefreshCw /> {!isMobile && 'RESET'}
              </button>
              
              {/* CANCEL BUTTON */}
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-cancel"
                disabled={saving}
              >
                <FiX /> {!isMobile && 'CANCEL'}
              </button>
              
              {/* SAVE BUTTON */}
              <button
                type="submit"
                disabled={!hasChanges || saving}
                className="btn btn-submit"
              >
                {saving ? (
                  <>
                    <div className="btn-spinner"></div>
                    {!isMobile && 'SAVING...'}
                  </>
                ) : (
                  <>
                    <FiSave /> {!isMobile && 'SAVE CHANGES'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* DEBUG INFO */}
        <div className="database-info debug-info">
          <div className="info-header">
            <FiDatabase /> DATABASE INFORMATION
          </div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-title">RECORD ID</div>
              <div className="info-value">{id}</div>
              <div className="info-desc">Editing this record</div>
            </div>
            <div className="info-item">
              <div className="info-title">ITEMS</div>
              <div className="info-value">{items.length}</div>
              <div className="info-desc">Available items</div>
            </div>
            <div className="info-item">
              <div className="info-title">TARGETS</div>
              <div className="info-value">{targets.length}</div>
              <div className="info-desc">Available targets</div>
            </div>
            <div className="info-item">
              <div className="info-title">CHANGES</div>
              <div className="info-value">
                <span style={{ color: hasChanges ? '#f39c12' : '#27ae60' }}>
                  {hasChanges ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="info-desc">Unsaved changes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlatteningEditForm;