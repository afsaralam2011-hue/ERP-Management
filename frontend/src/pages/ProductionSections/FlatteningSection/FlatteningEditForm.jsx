// src/pages/ProductionSections/FlatteningSection/FlatteningEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiX, FiTarget, FiPackage,
  FiUser, FiEdit2, FiClipboard, FiSettings,
  FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiList, FiTrendingUp,
  FiCalendar, FiClock, FiDatabase
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './FlatteningForm.css';

const FlatteningEditForm = ({ onClose, isModal = true }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get record ID from URL

  const [targetData, setTargetData] = useState({
    targets_id: '',
    machine_id: '',
    machine_no: '',
    shift_code: '',
    shift_name: '',
    target_qty: 0,
    unit: 'Kg'
  });

  const [itemsList, setItemsList] = useState([
    { 
      id: 1, 
      item_code: '', 
      item_name: '',
      coil_size: '',
      material_type: '',
      production_quantity: '', 
      unit: 'Kg',
      efficiency: 0
    }
  ]);

  const [operatorName, setOperatorName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [totalProduction, setTotalProduction] = useState(0);
  const [overallEfficiency, setOverallEfficiency] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldStatus, setFieldStatus] = useState({});
  const [recordDate, setRecordDate] = useState('');
  const [recordTime, setRecordTime] = useState('');

  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAllData();
    if (id) {
      fetchRecordData();
      setIsEditing(true);
    }
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [itemsRes, targetsRes] = await Promise.all([
        supabase.from('items').select('*').eq('is_active', true).order('item_name'),
        supabase.from('targets').select('*').eq('is_active', true).order('targets_id')
      ]);
      
      setItems(itemsRes.data || []);
      setTargets(targetsRes.data || []);
    } catch (error) {
      setError('Data loading failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flatteningsection')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        // Parse date and time
        const date = new Date(data.created_at);
        setRecordDate(date.toLocaleDateString());
        setRecordTime(date.toLocaleTimeString());

        // Set target data
        setTargetData({
          targets_id: data.targets_id || '',
          machine_id: data.machine_id || '',
          machine_no: data.machine_no || '',
          shift_code: data.shift_code || '',
          shift_name: data.shift_name || '',
          target_qty: 0, // Will be fetched from targets
          unit: data.unit || 'Kg'
        });

        // Set items list (single item for edit)
        setItemsList([
          {
            id: 1,
            item_code: data.item_code || '',
            item_name: data.item_name || '',
            coil_size: data.coil_size || '',
            material_type: data.material_type || '',
            production_quantity: data.production_quantity || '',
            unit: data.unit || 'Kg',
            efficiency: data.efficiency || 0
          }
        ]);

        setOperatorName(data.operator_name || '');
        setRemarks(data.remarks || '');
        setTotalProduction(parseFloat(data.production_quantity) || 0);
        setOverallEfficiency(parseFloat(data.efficiency) || 0);

        // Fetch target quantity from targets table
        if (data.targets_id) {
          const { data: targetData } = await supabase
            .from('targets')
            .select('target_qty')
            .eq('targets_id', data.targets_id)
            .single();

          if (targetData) {
            setTargetData(prev => ({
              ...prev,
              target_qty: parseFloat(targetData.target_qty) || 0
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      setError('Failed to load record data');
    } finally {
      setLoading(false);
    }
  };

  // Get field border class based on status
  const getFieldClass = (fieldName, value) => {
    if (!value || value.toString().trim() === '') {
      return 'empty-required';
    }
    return 'filled-valid';
  };

  const handleTargetChange = (e) => {
    const selectedTargetsId = e.target.value;
    
    const newStatus = { ...fieldStatus };
    if (selectedTargetsId) {
      newStatus.targets_id = 'filled-valid';
    } else {
      newStatus.targets_id = 'empty-required';
    }
    setFieldStatus(newStatus);

    if (!selectedTargetsId) {
      setTargetData({
        targets_id: '',
        machine_id: '',
        machine_no: '',
        shift_code: '',
        shift_name: '',
        target_qty: 0,
        unit: 'Kg'
      });
      setTotalProduction(0);
      setOverallEfficiency(0);
      return;
    }

    const target = targets.find(t => t.targets_id === selectedTargetsId);
    
    if (target) {
      const newTargetData = {
        targets_id: target.targets_id,
        machine_id: target.machine_id || '',
        machine_no: target.machine_no || '',
        shift_code: target.shift_code || '',
        shift_name: target.shift_name || '',
        target_qty: parseFloat(target.target_qty) || 0,
        unit: target.uom || 'Kg'
      };
      
      setTargetData(newTargetData);
      
      // Update items efficiency with new target
      const updatedItems = itemsList.map(item => {
        if (item.production_quantity) {
          const quantityNum = parseFloat(item.production_quantity) || 0;
          const efficiency = newTargetData.target_qty > 0 
            ? (quantityNum / newTargetData.target_qty) * 100
            : 0;
          
          return {
            ...item,
            efficiency: Math.min(100, parseFloat(efficiency.toFixed(2)))
          };
        }
        return item;
      });
      
      setItemsList(updatedItems);
      
      // Update overall efficiency
      if (totalProduction > 0) {
        const efficiency = (totalProduction / newTargetData.target_qty) * 100;
        setOverallEfficiency(Math.min(100, parseFloat(efficiency.toFixed(2))));
      }
    }
  };

  const handleItemChange = (id, itemCode) => {
    const updatedItems = itemsList.map(item => {
      if (item.id === id) {
        const selectedItem = items.find(i => i.item_code === itemCode);
        if (selectedItem) {
          const newStatus = { ...fieldStatus };
          newStatus[`item_${id}`] = 'filled-valid';
          setFieldStatus(newStatus);
          
          return {
            ...item,
            item_code: itemCode,
            item_name: selectedItem.item_name || '',
            coil_size: selectedItem.coil_size || '',
            material_type: selectedItem.material_type || '',
            unit: selectedItem.unit || 'Kg'
          };
        }
      }
      return item;
    });
    
    setItemsList(updatedItems);
  };

  const handleQuantityChange = (id, quantity) => {
    const quantityNum = parseFloat(quantity) || 0;
    
    const updatedItems = itemsList.map(item => {
      if (item.id === id) {
        const newStatus = { ...fieldStatus };
        if (quantity && quantity.trim() !== '') {
          newStatus[`quantity_${id}`] = 'filled-valid';
        } else {
          newStatus[`quantity_${id}`] = 'empty-required';
        }
        setFieldStatus(newStatus);
        
        const efficiency = targetData.target_qty > 0 
          ? (quantityNum / targetData.target_qty) * 100
          : 0;
          
        return { 
          ...item, 
          production_quantity: quantity,
          efficiency: Math.min(100, parseFloat(efficiency.toFixed(2)))
        };
      }
      return item;
    });
    
    setItemsList(updatedItems);
    
    const total = updatedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.production_quantity) || 0);
    }, 0);
    
    setTotalProduction(total);
    
    if (targetData.target_qty > 0) {
      const overallEff = (total / targetData.target_qty) * 100;
      setOverallEfficiency(Math.min(100, parseFloat(overallEff.toFixed(2))));
    }
  };

  const handleOperatorChange = (value) => {
    const newStatus = { ...fieldStatus };
    if (value && value.trim() !== '') {
      newStatus.operator_name = 'filled-valid';
    } else {
      newStatus.operator_name = 'empty-required';
    }
    setFieldStatus(newStatus);
    setOperatorName(value);
  };

  const handleRemarksChange = (value) => {
    const newStatus = { ...fieldStatus };
    if (value && value.trim() !== '') {
      newStatus.remarks = 'filled-valid';
    } else {
      newStatus.remarks = '';
    }
    setFieldStatus(newStatus);
    setRemarks(value);
  };

  const validateForm = () => {
    const errors = {};
    const newFieldStatus = {};
    
    if (!targetData.targets_id) {
      errors.targets_id = 'Target ID is required';
      newFieldStatus.targets_id = 'empty-required';
    } else {
      newFieldStatus.targets_id = 'filled-valid';
    }
    
    if (!operatorName.trim()) {
      errors.operator_name = 'Operator name is required';
      newFieldStatus.operator_name = 'empty-required';
    } else {
      newFieldStatus.operator_name = 'filled-valid';
    }
    
    itemsList.forEach((item, index) => {
      if (!item.item_code) {
        errors[`item_${item.id}`] = `Item ${index + 1} is required`;
        newFieldStatus[`item_${item.id}`] = 'empty-required';
      } else {
        newFieldStatus[`item_${item.id}`] = 'filled-valid';
      }
      
      if (!item.production_quantity || parseFloat(item.production_quantity) <= 0) {
        errors[`quantity_${item.id}`] = `Valid quantity for item ${index + 1} is required`;
        newFieldStatus[`quantity_${item.id}`] = 'empty-required';
      } else {
        newFieldStatus[`quantity_${item.id}`] = 'filled-valid';
      }
    });

    setFieldStatus(newFieldStatus);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all required fields');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing && id) {
        // UPDATE existing record
        const updateData = {
          targets_id: targetData.targets_id,
          machine_id: targetData.machine_id,
          machine_no: targetData.machine_no,
          item_code: itemsList[0].item_code,
          item_name: itemsList[0].item_name,
          coil_size: itemsList[0].coil_size,
          material_type: itemsList[0].material_type,
          operator_name: operatorName.trim(),
          production_quantity: parseFloat(itemsList[0].production_quantity),
          unit: itemsList[0].unit,
          efficiency: itemsList[0].efficiency,
          shift_code: targetData.shift_code,
          shift_name: targetData.shift_name,
          remarks: remarks?.trim() || '',
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('flatteningsection')
          .update(updateData)
          .eq('id', id);

        if (updateError) throw updateError;

        setSuccess('Record updated successfully!');
      } else {
        // CREATE new record
        const records = itemsList.map(item => ({
          section_name: 'Flattening',
          targets_id: targetData.targets_id,
          machine_id: targetData.machine_id,
          machine_no: targetData.machine_no,
          item_code: item.item_code,
          item_name: item.item_name,
          coil_size: item.coil_size,
          material_type: item.material_type,
          operator_name: operatorName.trim(),
          production_quantity: parseFloat(item.production_quantity),
          unit: item.unit,
          efficiency: item.efficiency,
          shift_code: targetData.shift_code,
          shift_name: targetData.shift_name,
          remarks: remarks?.trim() || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('flatteningsection')
          .insert(records);

        if (insertError) throw insertError;

        setSuccess(`${records.length} record(s) saved successfully!`);
      }
      
      setTimeout(() => {
        if (isModal && onClose) {
          onClose();
        } else {
          navigate('/production-sections/flattening');
        }
      }, 1500);

    } catch (error) {
      console.error('Save error:', error);
      setError(isEditing ? 'Update failed: ' : 'Save failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (isEditing && id) {
      fetchRecordData(); // Reset to original values
    } else {
      setTargetData({
        targets_id: '',
        machine_id: '',
        machine_no: '',
        shift_code: '',
        shift_name: '',
        target_qty: 0,
        unit: 'Kg'
      });
      setItemsList([
        { 
          id: 1, 
          item_code: '', 
          item_name: '',
          coil_size: '',
          material_type: '',
          production_quantity: '', 
          unit: 'Kg',
          efficiency: 0
        }
      ]);
      setOperatorName('');
      setRemarks('');
      setTotalProduction(0);
      setOverallEfficiency(0);
      setRecordDate('');
      setRecordTime('');
    }
    setValidationErrors({});
    setFieldStatus({});
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate('/production-sections/flattening');
    }
  };

  if (loading) {
    return (
      <div className="flattening-modal-overlay" onClick={handleClose}>
        <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{isEditing ? 'Loading Record...' : 'Loading Form...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flattening-modal-overlay" onClick={handleClose}>
      <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              {isEditing ? <FiEdit2 /> : <FiPackage />}
            </div>
            <div className="header-text">
              <h1>{isEditing ? 'EDIT FLATTENING RECORD' : 'NEW FLATTENING PRODUCTION'}</h1>
              <p>
                <FiDatabase /> {isEditing ? 'Editing existing record' : 'Create new production entry'}
              </p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <FiX />
          </button>
        </div>

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

        {/* Record Info Section for Edit Mode */}
        {isEditing && (recordDate || recordTime) && (
          <div className="record-info-section">
            <div className="record-info-grid">
              <div className="record-info-item">
                <FiCalendar /> Record Date: <span>{recordDate}</span>
              </div>
              <div className="record-info-item">
                <FiClock /> Record Time: <span>{recordTime}</span>
              </div>
              <div className="record-info-item">
                <FiDatabase /> Record ID: <span>#{id}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="target-section">
            <div className="section-title">
              <FiTarget /> TARGET & MACHINE DETAILS
            </div>
            <div className="target-grid">
              
              <div className="selection-box">
                <label className="selection-label required">
                  <FiTarget /> TARGET ID
                </label>
                <select
                  value={targetData.targets_id}
                  onChange={handleTargetChange}
                  className={`form-select ${fieldStatus.targets_id || getFieldClass('targets_id', targetData.targets_id)}`}
                >
                  <option value="">-- SELECT TARGET --</option>
                  {targets.map(target => (
                    <option key={target.targets_id} value={target.targets_id}>
                      {target.targets_id}
                    </option>
                  ))}
                </select>
                {validationErrors.targets_id && (
                  <span className="error-text">{validationErrors.targets_id}</span>
                )}
              </div>

              <div className="selection-box">
                <label className="selection-label">MACHINE ID</label>
                <input
                  type="text"
                  value={targetData.machine_id}
                  readOnly
                  className="selection-input readonly"
                />
              </div>

              <div className="selection-box">
                <label className="selection-label">MACHINE NO</label>
                <input
                  type="text"
                  value={targetData.machine_no}
                  readOnly
                  className="selection-input readonly"
                />
              </div>

              <div className="selection-box">
                <label className="selection-label">SHIFT CODE</label>
                <input
                  type="text"
                  value={targetData.shift_code}
                  readOnly
                  className="selection-input readonly"
                />
              </div>

              <div className="selection-box target-qty-box">
                <label className="selection-label">TARGET QTY & UNIT</label>
                <div className="target-qty-value">
                  {targetData.target_qty.toFixed(2)} {targetData.unit}
                </div>
              </div>

              <div className="selection-box efficiency-box">
                <label className="selection-label">
                  <FiTrendingUp /> EFFICIENCY
                </label>
                <div className="efficiency-value">
                  {overallEfficiency.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div className="items-section">
            <div className="items-header">
              <div className="section-title-secondary">
                <FiList /> ITEMS PRODUCTION
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={addItemRow}
                  className="add-item-btn"
                >
                  <FiPlus /> ADD ITEM
                </button>
              )}
            </div>

            <table className="items-table">
              <thead>
                <tr>
                  <th>ITEM CODE</th>
                  <th>ITEM NAME</th>
                  <th>COIL SIZE</th>
                  <th>MATERIAL TYPE</th>
                  <th>QUANTITY</th>
                  <th>UNIT</th>
                  <th>EFFICIENCY</th>
                  {!isEditing && <th>ACTION</th>}
                </tr>
              </thead>
              <tbody>
                {itemsList.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <select
                        value={item.item_code}
                        onChange={(e) => handleItemChange(item.id, e.target.value)}
                        className={`item-select ${fieldStatus[`item_${item.id}`] || getFieldClass('item_code', item.item_code)}`}
                      >
                        <option value="">-- SELECT ITEM --</option>
                        {items.map(itm => (
                          <option key={itm.id} value={itm.item_code}>
                            {itm.item_code} - {itm.item_name}
                          </option>
                        ))}
                      </select>
                      {validationErrors[`item_${item.id}`] && (
                        <div className="error-text">{validationErrors[`item_${item.id}`]}</div>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.item_name}
                        readOnly
                        className="item-input readonly"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.coil_size}
                        readOnly
                        className="item-input readonly"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.material_type}
                        readOnly
                        className="item-input readonly"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.production_quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        step="0.01"
                        min="0"
                        className={`item-input quantity-input ${fieldStatus[`quantity_${item.id}`] || getFieldClass('quantity', item.production_quantity)}`}
                        placeholder="0.00"
                      />
                      {validationErrors[`quantity_${item.id}`] && (
                        <div className="error-text">{validationErrors[`quantity_${item.id}`]}</div>
                      )}
                    </td>
                    <td className="unit-cell">
                      {item.unit}
                    </td>
                    <td className="efficiency-cell" style={{
                      color: item.efficiency >= 90 ? '#27ae60' : 
                             item.efficiency >= 80 ? '#f39c12' : 
                             item.efficiency >= 70 ? '#f39c12' : '#e74c3c',
                    }}>
                      {item.efficiency.toFixed(1)}%
                    </td>
                    {!isEditing && (
                      <td style={{ textAlign: 'center' }}>
                        {itemsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(item.id)}
                            className="remove-item-btn"
                            title="Remove Item"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bottom-section">
            <div className="operator-row">
              <div className="form-group">
                <label className="form-label required" style={{ color: '#2ecc71' }}>
                  <FiUser /> OPERATOR NAME
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => handleOperatorChange(e.target.value)}
                  className={`item-input ${fieldStatus.operator_name || getFieldClass('operator_name', operatorName)}`}
                  placeholder="Enter operator name"
                />
                {validationErrors.operator_name && (
                  <span className="error-text">{validationErrors.operator_name}</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ color: '#3498db' }}>
                  <FiClipboard /> REMARKS
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => handleRemarksChange(e.target.value)}
                  className={`form-textarea ${fieldStatus.remarks || ''}`}
                  placeholder="Enter any additional notes or remarks..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="actions-section">
            <div className="total-info">
              TOTAL PRODUCTION: <span>{totalProduction.toFixed(2)} {targetData.unit}</span>
            </div>
            
            <div className="action-buttons">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-reset"
              >
                <FiSettings /> {isEditing ? 'RESET' : 'CLEAR'}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-cancel"
              >
                <FiX /> CANCEL
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="btn btn-submit"
              >
                {saving ? (
                  <>
                    <div className="loading-spinner" style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderWidth: '2px',
                      margin: '0'
                    }}></div>
                    {isEditing ? 'UPDATING...' : 'SAVING...'}
                  </>
                ) : (
                  <>
                    <FiSave /> {isEditing ? 'UPDATE RECORD' : `SAVE (${itemsList.length} ITEM${itemsList.length > 1 ? 'S' : ''})`}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlatteningEditForm;