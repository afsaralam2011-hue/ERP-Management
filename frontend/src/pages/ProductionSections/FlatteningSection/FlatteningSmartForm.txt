// ========================================================
// FILE: FlatteningSmartForm.jsx
// PURPOSE: Smart Multi-Machine Production Entry with Shift Filter
// VERSION: 2.0 - Mobile Friendly & Shift Based
// ========================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiX, FiClock,
  FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiTrendingUp, FiRefreshCw,
  FiArrowLeft, FiCpu, FiZap, FiPackage
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './FlatteningForm.css';
import './FlatteningSmartForm.css';

const FlatteningSmartForm = ({ onClose, isModal = true }) => {
  const navigate = useNavigate();
  
  // Main states
  const [selectedShift, setSelectedShift] = useState('');
  const [shifts, setShifts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machineData, setMachineData] = useState({});
  
  // Common states
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
        
        // Fetch shifts from database
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .order('shift_code');
        
        // Fetch targets
        const { data: targetsData, error: targetsError } = await supabase
          .from('targets')
          .select('*');
        
        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*');
        
        if (shiftsError) console.error('Shifts error:', shiftsError);
        if (targetsError) console.error('Targets error:', targetsError);
        if (itemsError) console.error('Items error:', itemsError);
        
        setShifts(shiftsData || []);
        setTargets(targetsData || []);
        setItems(itemsData || []);
        
      } catch (error) {
        console.error('Data fetch error:', error);
        setError('Data loading failed');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // ==================== HANDLE SHIFT SELECTION ====================
  const handleShiftSelect = (shiftId) => {
    setSelectedShift(shiftId);
    
    if (!shiftId) {
      setMachines([]);
      setMachineData({});
      return;
    }
    
    // Filter targets for selected shift
    const shiftTargets = targets.filter(target => 
      target.shift_code === shiftId || target.shift_id === shiftId
    );
    
    // Extract unique machines from these targets
    const uniqueMachines = [...new Set(shiftTargets.map(t => ({
      machine_id: t.machine_id || t.machine,
      machine_no: t.machine_no || t.machine_number
    })))].filter(m => m.machine_id);
    
    // Initialize machine data
    const initialMachineData = {};
    uniqueMachines.forEach(machine => {
      // Find target for this machine in selected shift
      const machineTarget = shiftTargets.find(t => 
        (t.machine_id === machine.machine_id || t.machine === machine.machine_id) &&
        (t.shift_code === shiftId || t.shift_id === shiftId)
      );
      
      initialMachineData[machine.machine_id] = {
        machine_id: machine.machine_id,
        machine_no: machine.machine_no,
        targets_id: machineTarget?.targets_id || '',
        target_qty: machineTarget?.target_qty || 0,
        unit: machineTarget?.unit || 'Kg',
        shift_code: shiftId,
        items: [{ id: 1, item_code: '', quantity: '', efficiency: 0 }],
        operator_name: '',
        remarks: ''
      };
    });
    
    setMachines(uniqueMachines);
    setMachineData(initialMachineData);
  };

  // ==================== HANDLE MACHINE INPUTS ====================
  const handleMachineItemChange = (machineId, itemId, field, value) => {
    setMachineData(prev => {
      const updated = { ...prev };
      const machine = updated[machineId];
      
      if (!machine) return prev;
      
      // Find and update the specific item
      const updatedItems = machine.items.map(item => {
        if (item.id === itemId) {
          const newItem = { ...item, [field]: value };
          
          // Auto-fill item details if item_code changes
          if (field === 'item_code' && value) {
            const selectedItem = items.find(i => i.item_code === value);
            if (selectedItem) {
              newItem.item_name = selectedItem.item_name;
              newItem.unit = selectedItem.unit || 'Kg';
            }
          }
          
          // Calculate efficiency if quantity changes
          if (field === 'quantity') {
            const qty = parseFloat(value) || 0;
            const targetQty = machine.target_qty || 0;
            const efficiency = targetQty > 0 ? (qty / targetQty) * 100 : 0;
            newItem.efficiency = Math.min(100, parseFloat(efficiency.toFixed(1)));
          }
          
          return newItem;
        }
        return item;
      });
      
      updated[machineId] = { ...machine, items: updatedItems };
      return updated;
    });
  };

  const handleAddItem = (machineId) => {
    setMachineData(prev => {
      const updated = { ...prev };
      const machine = updated[machineId];
      
      if (!machine) return prev;
      
      const newId = machine.items.length > 0 
        ? Math.max(...machine.items.map(i => i.id)) + 1 
        : 1;
      
      updated[machineId] = {
        ...machine,
        items: [
          ...machine.items,
          { id: newId, item_code: '', quantity: '', efficiency: 0 }
        ]
      };
      
      return updated;
    });
  };

  const handleRemoveItem = (machineId, itemId) => {
    setMachineData(prev => {
      const updated = { ...prev };
      const machine = updated[machineId];
      
      if (!machine || machine.items.length <= 1) return prev;
      
      updated[machineId] = {
        ...machine,
        items: machine.items.filter(item => item.id !== itemId)
      };
      
      return updated;
    });
  };

  // ==================== CALCULATIONS ====================
  const calculateMachineTotal = (machineId) => {
    const machine = machineData[machineId];
    if (!machine) return 0;
    
    return machine.items.reduce((total, item) => {
      return total + (parseFloat(item.quantity) || 0);
    }, 0);
  };

  const calculateOverallTotal = () => {
    return Object.keys(machineData).reduce((total, machineId) => {
      return total + calculateMachineTotal(machineId);
    }, 0);
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const errors = {};
    
    if (!selectedShift) {
      errors.shift = 'Please select a shift';
    }
    
    Object.keys(machineData).forEach(machineId => {
      const machine = machineData[machineId];
      
      if (!machine.operator_name?.trim()) {
        errors[`operator_${machineId}`] = 'Operator name is required';
      }
      
      machine.items.forEach((item, index) => {
        if (!item.item_code) {
          errors[`item_${machineId}_${item.id}`] = 'Item is required';
        }
        
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors[`quantity_${machineId}_${item.id}`] = 'Valid quantity is required';
        }
      });
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all required fields');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      const allRecords = [];
      
      Object.keys(machineData).forEach(machineId => {
        const machine = machineData[machineId];
        
        machine.items.forEach(item => {
          const selectedItem = items.find(i => i.item_code === item.item_code);
          
          allRecords.push({
            section_name: 'Flattening',
            targets_id: machine.targets_id,
            machine_id: machine.machine_id,
            machine_no: machine.machine_no,
            item_code: item.item_code,
            item_name: selectedItem?.item_name || '',
            operator_name: machine.operator_name,
            production_quantity: parseFloat(item.quantity) || 0,
            unit: selectedItem?.unit || 'Kg',
            efficiency: item.efficiency,
            shift_code: machine.shift_code,
            target_qty: machine.target_qty,
            remarks: machine.remarks || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      });
      
      const { error: insertError } = await supabase
        .from('flatteningsection')
        .insert(allRecords);
      
      if (insertError) throw insertError;
      
      setSuccess(`✅ ${allRecords.length} records saved for ${machines.length} machines`);
      
      setTimeout(() => {
        navigate('/production-sections/flattening');
      }, 2000);
      
    } catch (error) {
      console.error('Save error:', error);
      setError('Save failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== UI HELPERS ====================
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return '#27ae60';
    if (efficiency >= 80) return '#f39c12';
    if (efficiency >= 70) return '#e67e22';
    return '#e74c3c';
  };

  const handleBackClick = () => {
    navigate('/production-sections/flattening');
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flattening-modal-overlay" onClick={handleBackClick}>
        <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Smart Production Form...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="flattening-modal-overlay smart-form-overlay" onClick={handleBackClick}>
      <div className="flattening-modal-container smart-form-container" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="modal-header smart-header">
          <div className="header-content">
            <div className="header-icon">
              <FiZap />
            </div>
            <div className="header-text">
              <h1>SMART PRODUCTION ENTRY</h1>
              <p>
                <FiClock /> Select Shift → Enter Production → Save All
                {isMobile && <span className="mobile-indicator">📱</span>}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="back-button"
              onClick={handleBackClick}
            >
              <FiArrowLeft /> {!isMobile && 'BACK'}
            </button>
            <button className="close-button" onClick={handleBackClick}>
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
        <form onSubmit={handleSubmit} className="smart-form">
          
          {/* STEP 1: SHIFT SELECTION */}
          <div className="step-section">
            <div className="step-title">
              <span className="step-number">1</span>
              <span className="step-text">SELECT SHIFT</span>
            </div>
            
            <div className="shifts-container">
              {shifts.map(shift => (
                <button
                  key={shift.id || shift.shift_code}
                  type="button"
                  className={`shift-card ${selectedShift === (shift.shift_code || shift.id) ? 'selected' : ''}`}
                  onClick={() => handleShiftSelect(shift.shift_code || shift.id)}
                >
                  <div className="shift-code">{shift.shift_code || shift.code}</div>
                  <div className="shift-name">{shift.shift_name || shift.name}</div>
                  <div className="shift-time">
                    {shift.start_time} - {shift.end_time}
                  </div>
                </button>
              ))}
            </div>
            
            {validationErrors.shift && (
              <div className="error-text">{validationErrors.shift}</div>
            )}
          </div>

          {/* STEP 2: MACHINES (Only show if shift selected) */}
          {selectedShift && machines.length > 0 && (
            <div className="step-section">
              <div className="step-title">
                <span className="step-number">2</span>
                <span className="step-text">
                  ENTER PRODUCTION ({machines.length} Machines)
                </span>
              </div>
              
              <div className="machines-grid">
                {machines.map(machine => {
                  const machineId = machine.machine_id;
                  const data = machineData[machineId] || {};
                  const totalProduction = calculateMachineTotal(machineId);
                  
                  return (
                    <div key={machineId} className="machine-row">
                      
                      {/* MACHINE HEADER */}
                      <div className="machine-header-row">
                        <div className="machine-info">
                          <FiCpu />
                          <span className="machine-name">M/C: {machine.machine_no}</span>
                          <span className="target-info">
                            Target: {data.target_qty || 0} {data.unit}
                          </span>
                        </div>
                        <div className="machine-total">
                          Total: <strong>{totalProduction.toFixed(1)}</strong> {data.unit}
                        </div>
                      </div>
                      
                      {/* ITEMS TABLE */}
                      <div className="items-table-compact">
                        <table>
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Qty</th>
                              <th>Unit</th>
                              <th>Eff%</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.items?.map(item => (
                              <tr key={item.id}>
                                <td>
                                  <select
                                    value={item.item_code}
                                    onChange={(e) => handleMachineItemChange(machineId, item.id, 'item_code', e.target.value)}
                                    className={`item-select-tiny ${validationErrors[`item_${machineId}_${item.id}`] ? 'error' : ''}`}
                                  >
                                    <option value="">--</option>
                                    {items.map(itm => (
                                      <option key={itm.item_code} value={itm.item_code}>
                                        {itm.item_code}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                
                                <td>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleMachineItemChange(machineId, item.id, 'quantity', e.target.value)}
                                    step="0.1"
                                    min="0"
                                    className={`qty-input-tiny ${validationErrors[`quantity_${machineId}_${item.id}`] ? 'error' : ''}`}
                                    placeholder="0.0"
                                  />
                                </td>
                                
                                <td className="unit-tiny">
                                  {item.unit || 'Kg'}
                                </td>
                                
                                <td className="efficiency-tiny" style={{ color: getEfficiencyColor(item.efficiency) }}>
                                  {item.efficiency}%
                                </td>
                                
                                <td className="action-tiny">
                                  {data.items.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(machineId, item.id)}
                                      className="remove-btn-tiny"
                                      title="Remove"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        <button
                          type="button"
                          onClick={() => handleAddItem(machineId)}
                          className="add-item-btn-tiny"
                        >
                          <FiPlus /> Add Item
                        </button>
                      </div>
                      
                      {/* OPERATOR & REMARKS */}
                      <div className="machine-footer">
                        <div className="operator-input-compact">
                          <label>Operator:</label>
                          <input
                            type="text"
                            value={data.operator_name || ''}
                            onChange={(e) => setMachineData(prev => ({
                              ...prev,
                              [machineId]: { ...prev[machineId], operator_name: e.target.value }
                            }))}
                            className={validationErrors[`operator_${machineId}`] ? 'error' : ''}
                            placeholder="Name"
                          />
                          {validationErrors[`operator_${machineId}`] && (
                            <div className="error-small">{validationErrors[`operator_${machineId}`]}</div>
                          )}
                        </div>
                        
                        <div className="remarks-input-compact">
                          <label>Remarks:</label>
                          <input
                            type="text"
                            value={data.remarks || ''}
                            onChange={(e) => setMachineData(prev => ({
                              ...prev,
                              [machineId]: { ...prev[machineId], remarks: e.target.value }
                            }))}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY & SUBMIT */}
          {selectedShift && machines.length > 0 && (
            <div className="step-section final-step">
              <div className="step-title">
                <span className="step-number">3</span>
                <span className="step-text">REVIEW & SUBMIT</span>
              </div>
              
              <div className="summary-card">
                <div className="summary-row">
                  <div className="summary-label">
                    <FiClock /> Selected Shift:
                  </div>
                  <div className="summary-value">
                    {shifts.find(s => s.shift_code === selectedShift)?.shift_name || selectedShift}
                  </div>
                </div>
                
                <div className="summary-row">
                  <div className="summary-label">
                    <FiCpu /> Active Machines:
                  </div>
                  <div className="summary-value">
                    {machines.length} machines
                  </div>
                </div>
                
                <div className="summary-row">
                  <div className="summary-label">
                    <FiPackage /> Total Items:
                  </div>
                  <div className="summary-value">
                    {Object.keys(machineData).reduce((total, machineId) => {
                      return total + (machineData[machineId]?.items?.length || 0);
                    }, 0)} items
                  </div>
                </div>
                
                <div className="summary-row total-row">
                  <div className="summary-label">
                    <FiTrendingUp /> Total Production:
                  </div>
                  <div className="summary-value total-value">
                    {calculateOverallTotal().toFixed(1)} Kg
                  </div>
                </div>
              </div>
              
              {/* ACTION BUTTONS */}
              <div className="action-buttons-compact">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShift('');
                    setMachines([]);
                    setMachineData({});
                    setValidationErrors({});
                  }}
                  className="btn btn-reset"
                  disabled={saving}
                >
                  <FiRefreshCw /> Change Shift
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-submit"
                >
                  {saving ? (
                    <>
                      <div className="btn-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave /> Save All Data
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* NO SHIFT SELECTED MESSAGE */}
          {!selectedShift && (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <h3>Select a Shift First</h3>
              <p>Choose a shift from above to see available machines</p>
            </div>
          )}

          {/* NO MACHINES IN SHIFT */}
          {selectedShift && machines.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🤔</div>
              <h3>No Machines Found</h3>
              <p>No machines are assigned to this shift in the targets</p>
              <button
                type="button"
                onClick={() => setSelectedShift('')}
                className="btn btn-secondary"
              >
                Select Different Shift
              </button>
            </div>
          )}
        </form>

        {/* MOBILE FLOATING BUTTON */}
        {isMobile && selectedShift && machines.length > 0 && (
          <div className="mobile-floating-submit">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="floating-save-btn"
            >
              {saving ? 'Saving...' : `Save ${machines.length} Machines`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlatteningSmartForm;