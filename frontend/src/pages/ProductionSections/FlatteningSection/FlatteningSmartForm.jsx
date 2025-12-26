// ========================================================
// FILE: FlatteningSmartForm.jsx (CORRECTED VERSION)
// PURPOSE: Smart Production Entry for Flattening Section
// VERSION: 3.0 - Professional, Dark Theme, Mobile Optimized
// ========================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiClock, FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiTrendingUp, FiRefreshCw, FiArrowLeft, 
  FiCpu, FiPackage, FiUser, FiEdit3
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './FlatteningSmartForm.css';

const FlatteningSmartForm = () => {
  const navigate = useNavigate();
  
  // Constants
  const CURRENT_SECTION = 'Flattening';
  
  // States
  const [selectedShift, setSelectedShift] = useState('');
  const [shifts, setShifts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machineData, setMachineData] = useState({});
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
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [shiftsRes, targetsRes, itemsRes] = await Promise.all([
          supabase.from('shifts').select('*').order('shift_code'),
          supabase.from('targets').select('*').eq('section_name', CURRENT_SECTION),
          supabase.from('items').select('*').order('item_code')
        ]);

        if (shiftsRes.error) throw shiftsRes.error;
        if (targetsRes.error) throw targetsRes.error;
        if (itemsRes.error) throw itemsRes.error;

        const shiftsData = shiftsRes.data || [];
        const targetsData = targetsRes.data || [];
        const itemsData = itemsRes.data || [];

        // Get unique machines for current section - CORRECT FILTERING
        const machineSet = new Set();
        const uniqueMachines = [];

        targetsData.forEach(target => {
          const machineNo = target.machine_no || target.machine_number;
          if (machineNo && !machineSet.has(machineNo)) {
            machineSet.add(machineNo);
            uniqueMachines.push({
              machine_no: machineNo,
              machine_id: target.machine_id || target.machine,
              section_name: target.section_name
            });
          }
        });

        setShifts(shiftsData);
        setTargets(targetsData);
        setMachines(uniqueMachines);
        setItems(itemsData);

      } catch (error) {
        console.error('Data fetch error:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [CURRENT_SECTION]);

  // ==================== GET TARGET FOR MACHINE ====================
  const getTargetForMachine = (machineNo, shiftCode) => {
    if (!machineNo || !shiftCode) return null;

    return targets.find(target => {
      const machineMatch = 
        target.machine_no === machineNo || 
        target.machine_number === machineNo ||
        target.machine_id === machineNo;
      
      const shiftMatch = 
        target.shift_code === shiftCode || 
        target.shift === shiftCode;
      
      const sectionMatch = target.section_name === CURRENT_SECTION;
      
      return machineMatch && shiftMatch && sectionMatch;
    });
  };

  // ==================== HANDLE SHIFT SELECTION - FIXED ====================
  const handleShiftSelect = (shiftCode) => {
    setSelectedShift(shiftCode);
    setError('');
    setSuccess('');
    setValidationErrors({});

    if (!shiftCode) {
      setMachineData({});
      return;
    }

    const selectedShiftData = shifts.find(s => s.shift_code === shiftCode);
    const initialMachineData = {};

    // Get machines ONLY for this shift - FIXED FILTERING
    const machinesForThisShift = targets
      .filter(target => 
        (target.shift_code === shiftCode || target.shift === shiftCode) &&
        target.section_name === CURRENT_SECTION
      )
      .map(target => ({
        machine_no: target.machine_no || target.machine_number,
        machine_id: target.machine_id || target.machine,
        section_name: target.section_name
      }))
      .filter((machine, index, self) => 
        index === self.findIndex(m => m.machine_no === machine.machine_no)
      );

    machinesForThisShift.forEach(machine => {
      const target = getTargetForMachine(machine.machine_no, shiftCode);
      
      initialMachineData[machine.machine_no] = {
        machine_id: target?.machine_id || machine.machine_id || '',
        machine_no: machine.machine_no,
        targets_id: target?.targets_id || target?.id || '',
        target_qty: parseFloat(target?.target_qty || target?.quantity || 0),
        unit: target?.uom || target?.unit || 'Kg',
        shift_code: shiftCode,
        shift_name: selectedShiftData?.shift_name || shiftCode,
        items: [{ 
          id: Date.now(), 
          item_code: '', 
          item_name: '', 
          quantity: '', 
          unit: 'Kg', 
          efficiency: 0 
        }],
        operator_name: '',
        remarks: '',
        section_name: CURRENT_SECTION
      };
    });

    setMachineData(initialMachineData);
  };

  // ==================== HANDLE ITEM CHANGES ====================
  const handleItemChange = (machineNo, itemId, field, value) => {
    setMachineData(prev => {
      const updated = { ...prev };
      const machine = updated[machineNo];
      
      if (!machine) return prev;

      const updatedItems = machine.items.map(item => {
        if (item.id === itemId) {
          const newItem = { ...item, [field]: value };

          // Auto-fill item details when item_code changes
          if (field === 'item_code' && value) {
            const selectedItem = items.find(i => i.item_code === value);
            if (selectedItem) {
              newItem.item_name = selectedItem.item_name || '';
              newItem.unit = selectedItem.unit || 'Kg';
            }
          }

          // Calculate efficiency when quantity changes - FIXED FORMULA
          if (field === 'quantity') {
            const qty = parseFloat(value) || 0;
            const targetQty = machine.target_qty || 0;
            const efficiency = targetQty > 0 ? (qty / targetQty) * 100 : 0;
            newItem.efficiency = parseFloat(efficiency.toFixed(1));
          }

          return newItem;
        }
        return item;
      });

      updated[machineNo] = { ...machine, items: updatedItems };
      return updated;
    });
  };

  // ==================== ADD/REMOVE ITEMS ====================
  const addItem = (machineNo) => {
    setMachineData(prev => ({
      ...prev,
      [machineNo]: {
        ...prev[machineNo],
        items: [
          ...prev[machineNo].items,
          { 
            id: Date.now() + Math.random(),
            item_code: '',
            item_name: '',
            quantity: '',
            unit: 'Kg',
            efficiency: 0
          }
        ]
      }
    }));
  };

  const removeItem = (machineNo, itemId) => {
    setMachineData(prev => {
      const machine = prev[machineNo];
      if (!machine || machine.items.length <= 1) return prev;

      return {
        ...prev,
        [machineNo]: {
          ...machine,
          items: machine.items.filter(item => item.id !== itemId)
        }
      };
    });
  };

  // ==================== CALCULATIONS ====================
  const calculateMachineTotal = (machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || !machine.items) return 0;

    return machine.items.reduce((total, item) => {
      return total + (parseFloat(item.quantity) || 0);
    }, 0);
  };

  const calculateSectionTotal = () => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      return total + calculateMachineTotal(machineNo);
    }, 0);
  };

  const calculateTotalItems = () => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      return total + (machineData[machineNo]?.items?.length || 0);
    }, 0);
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const errors = {};

    if (!selectedShift) {
      errors.shift = 'Please select a shift';
    }

    Object.keys(machineData).forEach(machineNo => {
      const machine = machineData[machineNo];

      if (!machine.operator_name?.trim()) {
        errors[`operator_${machineNo}`] = 'Operator name is required';
      }

      machine.items.forEach((item, index) => {
        if (!item.item_code) {
          errors[`item_${machineNo}_${index}`] = 'Item selection is required';
        }
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors[`qty_${machineNo}_${index}`] = 'Valid quantity is required';
        }
      });
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== FORM SUBMISSION - FIXED ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix all validation errors');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const allRecords = [];

      Object.keys(machineData).forEach(machineNo => {
        const machine = machineData[machineNo];

        machine.items.forEach(item => {
          if (item.item_code && item.quantity) {
            const selectedItem = items.find(i => i.item_code === item.item_code);

            allRecords.push({
              section_name: CURRENT_SECTION,
              targets_id: machine.targets_id,
              machine_id: machine.machine_id,
              machine_no: machine.machine_no,
              item_code: item.item_code,
              item_name: selectedItem?.item_name || item.item_name || '',
              operator_name: machine.operator_name.trim(),
              production_quantity: parseFloat(item.quantity),
              unit: item.unit || 'Kg',
              efficiency: item.efficiency || 0,
              shift_code: machine.shift_code,
              shift_name: machine.shift_name,
              target_qty: machine.target_qty,
              remarks: machine.remarks || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        });
      });

      if (allRecords.length === 0) {
        throw new Error('No valid records to save');
      }

      const { error: insertError } = await supabase
        .from('flatteningsection')
        .insert(allRecords);

      if (insertError) throw insertError;

      setSuccess(`Success! ${allRecords.length} records saved for ${Object.keys(machineData).length} machines`);

      // Auto reset after save - FIXED
      setTimeout(() => {
        setSelectedShift('');
        setMachineData({});
        setValidationErrors({});
        setSuccess('');
        
        // Optional: navigate back
        // navigate('/production-sections/flattening');
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
    if (efficiency >= 90) return '#00ff88';
    if (efficiency >= 80) return '#ffcc00';
    if (efficiency >= 70) return '#ff9900';
    return '#ff4444';
  };

  const handleBackClick = () => {
    navigate('/production-sections/flattening');
  };

  // Get machines for current shift - FIXED
  const getMachinesForCurrentShift = () => {
    if (!selectedShift) return [];
    
    return targets
      .filter(target => 
        (target.shift_code === selectedShift || target.shift === selectedShift) &&
        target.section_name === CURRENT_SECTION
      )
      .map(target => ({
        machine_no: target.machine_no || target.machine_number,
        machine_id: target.machine_id || target.machine,
        section_name: target.section_name
      }))
      .filter((machine, index, self) => 
        index === self.findIndex(m => m.machine_no === machine.machine_no)
      );
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-container loading-modal">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h3>Loading Production Form</h3>
            <p>Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) handleBackClick();
    }}>
      <div className="modal-container smart-form-modal">
        
        {/* HEADER */}
        <div className="modal-header">
          <div className="header-left">
            <div className="header-icon">
              <FiEdit3 />
            </div>
            <div className="header-text">
              <h1>Flattening Production Entry</h1>
              <p className="header-subtitle">
                <FiPackage /> Smart entry form for production section
              </p>
            </div>
          </div>
          <div className="header-right">
            <button 
              className="btn btn-back"
              onClick={handleBackClick}
              title="Go back"
            >
              <FiArrowLeft /> {!isMobile && 'Back'}
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        {success && (
          <div className="alert alert-success">
            <FiCheck /> {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* FORM CONTENT */}
        <div className="form-content">
          
          {/* STEP 1: SHIFT SELECTION */}
          <div className="form-section">
            <div className="section-header">
              <div className="step-indicator">
                <span className="step-number">1</span>
                <span className="step-title">Select Shift</span>
              </div>
              <p className="section-description">
                Choose a shift to view available machines
              </p>
            </div>

            <div className="shifts-grid">
              {shifts.map(shift => (
                <button
                  key={shift.id}
                  type="button"
                  className={`shift-card ${selectedShift === shift.shift_code ? 'selected' : ''}`}
                  onClick={() => handleShiftSelect(shift.shift_code)}
                >
                  <span className="shift-code">{shift.shift_code}</span>
                  <span className="shift-name">{shift.shift_name}</span>
                  <span className="shift-time">{shift.start_time} - {shift.end_time}</span>
                </button>
              ))}
            </div>

            {validationErrors.shift && (
              <div className="validation-error">
                <FiAlertCircle /> {validationErrors.shift}
              </div>
            )}
          </div>

          {/* STEP 2: PRODUCTION ENTRY */}
          {selectedShift && (
            <div className="form-section">
              <div className="section-header">
                <div className="step-indicator">
                  <span className="step-number">2</span>
                  <span className="step-title">Enter Production</span>
                </div>
                <p className="section-description">
                  Fill production details for each machine
                </p>
              </div>

              <div className="machines-container">
                {getMachinesForCurrentShift().length > 0 ? (
                  getMachinesForCurrentShift().map(machine => {
                    const machineNo = machine.machine_no;
                    const data = machineData[machineNo] || {};
                    const target = getTargetForMachine(machineNo, selectedShift);
                    const totalProduction = calculateMachineTotal(machineNo);
                    
                    return (
                      <div key={machineNo} className="machine-card">
                        
                        {/* MACHINE HEADER */}
                        <div className="machine-card-header">
                          <div className="machine-info">
                            <FiCpu className="machine-icon" />
                            <div>
                              <h3>Machine {machineNo}</h3>
                              <div className="machine-meta">
                                <span className="meta-item">
                                  <FiClock /> Shift: {selectedShift}
                                </span>
                                {target && (
                                  <span className="meta-item target">
                                    <FiTrendingUp /> Target: {target.target_qty || 0} {target.uom || 'Kg'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="machine-total">
                            <span>Total Production:</span>
                            <strong>{totalProduction.toFixed(2)} Kg</strong>
                          </div>
                        </div>

                        {/* ITEMS TABLE */}
                        <div className="items-table-wrapper">
                          <table className="items-table">
                            <thead>
                              <tr>
                                <th>Item Code & Name</th>
                                <th>Quantity (Kg)</th>
                                <th>Efficiency</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.items?.map((item, index) => (
                                <tr key={item.id}>
                                  <td>
                                    <div className="item-select-wrapper">
                                      <select
                                        value={item.item_code}
                                        onChange={(e) => handleItemChange(machineNo, item.id, 'item_code', e.target.value)}
                                        className={`form-select ${validationErrors[`item_${machineNo}_${index}`] ? 'error' : ''}`}
                                        title="Select item"
                                      >
                                        <option value="">-- Select Item --</option>
                                        {items.map(itm => (
                                          <option key={itm.item_code} value={itm.item_code}>
                                            {itm.item_code} - {itm.item_name || 'Unnamed Item'}
                                          </option>
                                        ))}
                                      </select>
                                      {item.item_code && (
                                        <div className="item-name-display">
                                          <FiPackage /> {item.item_name || items.find(i => i.item_code === item.item_code)?.item_name || 'Unknown'}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  
                                  <td>
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'quantity', e.target.value)}
                                      step="0.01"
                                      min="0"
                                      className={`form-input ${validationErrors[`qty_${machineNo}_${index}`] ? 'error' : ''}`}
                                      placeholder="0.00"
                                      title="Enter quantity in Kg"
                                    />
                                  </td>
                                  
                                  <td>
                                    <div 
                                      className="efficiency-badge"
                                      style={{ 
                                        backgroundColor: getEfficiencyColor(item.efficiency) + '20', 
                                        color: getEfficiencyColor(item.efficiency),
                                        borderColor: getEfficiencyColor(item.efficiency) + '40'
                                      }}
                                      title={`Efficiency: ${item.efficiency}%`}
                                    >
                                      {item.efficiency}%
                                    </div>
                                  </td>
                                  
                                  <td>
                                    {data.items.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeItem(machineNo, item.id)}
                                        className="btn-icon btn-danger"
                                        title="Remove item"
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
                            onClick={() => addItem(machineNo)}
                            className="btn btn-outline"
                            title="Add new item"
                          >
                            <FiPlus /> Add Item
                          </button>
                        </div>

                        {/* OPERATOR DETAILS */}
                        <div className="machine-footer">
                          <div className="form-group">
                            <label className="form-label">
                              <FiUser /> Operator Name
                            </label>
                            <input
                              type="text"
                              value={data.operator_name || ''}
                              onChange={(e) => setMachineData(prev => ({
                                ...prev,
                                [machineNo]: { ...prev[machineNo], operator_name: e.target.value }
                              }))}
                              className={`form-input ${validationErrors[`operator_${machineNo}`] ? 'error' : ''}`}
                              placeholder="Enter operator name"
                              title="Enter operator name"
                            />
                            {validationErrors[`operator_${machineNo}`] && (
                              <div className="validation-error">
                                <FiAlertCircle /> {validationErrors[`operator_${machineNo}`]}
                              </div>
                            )}
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Remarks</label>
                            <input
                              type="text"
                              value={data.remarks || ''}
                              onChange={(e) => setMachineData(prev => ({
                                ...prev,
                                [machineNo]: { ...prev[machineNo], remarks: e.target.value }
                              }))}
                              className="form-input"
                              placeholder="Optional remarks"
                              title="Enter optional remarks"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <FiCpu size={64} />
                    </div>
                    <h3>No Machines Found</h3>
                    <p>No machines are available for the selected shift ({selectedShift})</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY & SUBMIT */}
          {selectedShift && getMachinesForCurrentShift().length > 0 && (
            <div className="form-section">
              <div className="section-header">
                <div className="step-indicator">
                  <span className="step-number">3</span>
                  <span className="step-title">Review & Save</span>
                </div>
                <p className="section-description">
                  Review your entries and save all data
                </p>
              </div>

              <div className="summary-card">
                <div className="summary-header">
                  <FiPackage />
                  <h3>Production Summary</h3>
                </div>
                
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Selected Shift</span>
                    <span className="summary-value">{selectedShift}</span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Total Machines</span>
                    <span className="summary-value">{getMachinesForCurrentShift().length}</span>
                  </div>
                  
                  <div className="summary-item">
                    <span className="summary-label">Total Items</span>
                    <span className="summary-value">{calculateTotalItems()}</span>
                  </div>
                  
                  <div className="summary-item total">
                    <span className="summary-label">Total Production</span>
                    <span className="summary-value">{calculateSectionTotal().toFixed(2)} Kg</span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShift('');
                    setMachineData({});
                    setValidationErrors({});
                    setError('');
                    setSuccess('');
                  }}
                  className="btn btn-secondary"
                  disabled={saving}
                  title="Change shift and reset form"
                >
                  <FiRefreshCw /> Change Shift
                </button>
                
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={saving}
                  title="Save all production data"
                >
                  {saving ? (
                    <>
                      <div className="spinner-small"></div>
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

          {/* EMPTY STATE - NO SHIFT SELECTED */}
          {!selectedShift && (
            <div className="empty-state">
              <div className="empty-icon">
                <FiClock size={64} />
              </div>
              <h3>Select a Shift to Begin</h3>
              <p>Choose a shift from the options above to start entering production data</p>
              <div className="empty-stats">
                <div className="stat">
                  <span className="stat-number">{shifts.length}</span>
                  <span className="stat-label">Shifts Available</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{machines.length}</span>
                  <span className="stat-label">Total Machines</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlatteningSmartForm;