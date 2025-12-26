// ========================================================
// FILE: FlatteningSmartForm.jsx (SECTION SPECIFIC)
// ========================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiX, FiClock, FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiTrendingUp, FiRefreshCw, FiArrowLeft, FiCpu, FiZap, FiPackage
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './FlatteningForm.css';
import './FlatteningSmartForm.css';

const FlatteningSmartForm = () => {
  const navigate = useNavigate();
  
  // CURRENT SECTION - یہی وہ سیکشن ہے جس میں ہم ہیں
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

  // ==================== FETCH DATA (SECTION SPECIFIC) ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. شفٹس لوڈ کریں
        const { data: shiftsData } = await supabase
          .from('shifts')
          .select('*')
          .order('shift_code');
        
        // 2. ٹارگٹس لوڈ کریں (صرف CURRENT_SECTION کے لیے)
        const { data: targetsData } = await supabase
          .from('targets')
          .select('*')
          .eq('section_name', CURRENT_SECTION); // صرف Flattening سیکشن
        
        console.log(`📊 Loaded Targets for ${CURRENT_SECTION}:`, targetsData);
        console.log(`🔍 Filter: section_name = '${CURRENT_SECTION}'`);
        
        // 3. صرف CURRENT_SECTION کی مشینیں نکالیں
        const machineSet = new Set();
        const uniqueMachines = [];
        
        targetsData?.forEach(target => {
          // صرف وہی ٹارگٹ جو CURRENT_SECTION کے ہوں
          if (target.section_name === CURRENT_SECTION) {
            const machineNo = target.machine_no || target.machine_number;
            if (machineNo && !machineSet.has(machineNo)) {
              machineSet.add(machineNo);
              uniqueMachines.push({
                machine_no: machineNo,
                machine_id: target.machine_id || target.machine,
                section_name: target.section_name
              });
            }
          }
        });
        
        console.log(`🔧 ${CURRENT_SECTION} Section Machines:`, uniqueMachines);
        
        // 4. آئٹمز لوڈ کریں
        const { data: itemsData } = await supabase
          .from('items')
          .select('*')
          .order('item_code');
        
        setShifts(shiftsData || []);
        setTargets(targetsData || []);
        setMachines(uniqueMachines);
        setItems(itemsData || []);
        
      } catch (error) {
        console.error('❌ Data fetch error:', error);
        setError('Data loading failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [CURRENT_SECTION]);

  // ==================== GET TARGET (SECTION SPECIFIC) ====================
  const getTargetForMachine = (machineNo, shiftCode) => {
    if (!machineNo || !shiftCode) {
      console.log('⚠️ Missing machineNo or shiftCode:', { machineNo, shiftCode });
      return null;
    }
    
    console.log(`🔍 Searching ${CURRENT_SECTION} target for:`, { 
      machineNo, 
      shiftCode,
      section: CURRENT_SECTION 
    });
    
    // درست فارمولا: مشین نمبر + شفٹ + سیکشن
    const target = targets.find(t => {
      // 1. سیکشن میچ ہو (سب سے پہلے)
      if (t.section_name !== CURRENT_SECTION) {
        return false;
      }
      
      // 2. مشین نمبر میچ ہو
      const machineMatch = 
        (t.machine_no === machineNo) || 
        (t.machine_number === machineNo) ||
        (t.machine_id === machineNo);
      
      // 3. شفٹ میچ ہو
      const shiftMatch = 
        (t.shift_code === shiftCode) || 
        (t.shift === shiftCode) ||
        (t.shift_id === shiftCode);
      
      return machineMatch && shiftMatch;
    });
    
    if (target) {
      console.log('✅ Target found for', CURRENT_SECTION, ':', {
        machine_no: target.machine_no,
        shift_code: target.shift_code,
        section_name: target.section_name,
        target_qty: target.target_qty
      });
    } else {
      console.log('❌ No target found for', CURRENT_SECTION, ':', { machineNo, shiftCode });
    }
    
    return target;
  };

  // ==================== HANDLE SHIFT SELECTION ====================
  const handleShiftSelect = (shiftCode) => {
    console.log(`🔄 ${CURRENT_SECTION} - Shift selected:`, shiftCode);
    setSelectedShift(shiftCode);
    
    if (!shiftCode) {
      setMachineData({});
      return;
    }
    
    // صرف CURRENT_SECTION کی مشینوں کے لیے ٹارگٹ نکالیں
    const initialMachineData = {};
    
    machines.forEach(machine => {
      // صرف CURRENT_SECTION کی مشینیں ہی پراسس کریں
      if (machine.section_name === CURRENT_SECTION) {
        const target = getTargetForMachine(machine.machine_no, shiftCode);
        
        if (target) {
          initialMachineData[machine.machine_no] = {
            machine_id: target.machine_id || target.machine || '',
            machine_no: target.machine_no || target.machine_number || machine.machine_no,
            targets_id: target.targets_id || target.id || '',
            target_qty: parseFloat(target.target_qty || target.quantity || target.qty || 0),
            unit: target.uom || target.unit || 'Kg',
            shift_code: target.shift_code || target.shift || shiftCode,
            shift_name: target.shift_name || shifts.find(s => s.shift_code === shiftCode)?.shift_name || '',
            items: [{ id: 1, item_code: '', quantity: '', unit: 'Kg', efficiency: 0 }],
            operator_name: '',
            remarks: '',
            section_name: target.section_name || CURRENT_SECTION
          };
        } else {
          // اگر ٹارگٹ نہ ملے
          initialMachineData[machine.machine_no] = {
            machine_id: machine.machine_id || '',
            machine_no: machine.machine_no,
            targets_id: '',
            target_qty: 0,
            unit: 'Kg',
            shift_code: shiftCode,
            shift_name: shifts.find(s => s.shift_code === shiftCode)?.shift_name || '',
            items: [{ id: 1, item_code: '', quantity: '', unit: 'Kg', efficiency: 0 }],
            operator_name: '',
            remarks: '',
            section_name: CURRENT_SECTION
          };
        }
      }
    });
    
    setMachineData(initialMachineData);
    console.log(`📊 ${CURRENT_SECTION} Machine Data:`, initialMachineData);
  };

  // باقی کوڈ اسی طرح رہے گا، بس CURRENT_SECTION کا استعمال کریں گے

  // ==================== CALCULATE SECTION TOTALS ====================
  const calculateSectionTotal = () => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      const machine = machineData[machineNo];
      if (machine.section_name === CURRENT_SECTION) {
        if (machine.items) {
          return total + machine.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
        }
      }
      return total;
    }, 0);
  };

  const calculateSectionItems = () => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      const machine = machineData[machineNo];
      if (machine.section_name === CURRENT_SECTION && machine.items) {
        return total + machine.items.length;
      }
      return total;
    }, 0);
  };

  const calculateSectionMachines = () => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      const machine = machineData[machineNo];
      if (machine.section_name === CURRENT_SECTION) {
        return total + 1;
      }
      return total;
    }, 0);
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ویلڈیشن
    const errors = {};
    if (!selectedShift) {
      errors.shift = 'Please select a shift';
    }
    
    Object.keys(machineData).forEach(machineNo => {
      const machine = machineData[machineNo];
      
      // صرف CURRENT_SECTION کی مشینیں ویلڈیٹ کریں
      if (machine.section_name === CURRENT_SECTION) {
        if (!machine.operator_name?.trim()) {
          errors[`operator_${machineNo}`] = `Operator name required for Machine ${machineNo}`;
        }
        
        machine.items.forEach((item, index) => {
          if (!item.item_code) {
            errors[`item_${machineNo}_${index}`] = `Item required for Machine ${machineNo}`;
          }
          if (!item.quantity || parseFloat(item.quantity) <= 0) {
            errors[`qty_${machineNo}_${index}`] = `Valid quantity required for Machine ${machineNo}`;
          }
        });
      }
    });
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
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
        
        // صرف CURRENT_SECTION کے ریکارڈز سیو کریں
        if (machine.section_name === CURRENT_SECTION) {
          machine.items.forEach((item, index) => {
            if (item.item_code && item.quantity) {
              const selectedItem = items.find(i => i.item_code === item.item_code);
              
              allRecords.push({
                section_name: CURRENT_SECTION, // ✅ یہاں CURRENT_SECTION استعمال کریں
                targets_id: machine.targets_id,
                machine_id: machine.machine_id,
                machine_no: machine.machine_no,
                item_code: item.item_code,
                item_name: selectedItem?.item_name || '',
                coil_size: selectedItem?.coil_size || '',
                material_type: selectedItem?.material_type || '',
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
        }
      });
      
      if (allRecords.length === 0) {
        throw new Error(`No valid records to save for ${CURRENT_SECTION}`);
      }
      
      console.log(`💾 Saving ${CURRENT_SECTION} records:`, allRecords);
      
      const { error: insertError } = await supabase
        .from('flatteningsection')
        .insert(allRecords);
      
      if (insertError) throw insertError;
      
      setSuccess(`✅ ${CURRENT_SECTION} Success! ${allRecords.length} records saved for ${calculateSectionMachines()} machines`);
      
      setTimeout(() => {
        navigate(`/production-sections/${CURRENT_SECTION.toLowerCase()}`);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Save error:', error);
      setError(`${CURRENT_SECTION} Save failed: ` + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== UI RENDER ====================
  if (loading) {
    return (
      <div className="flattening-modal-overlay" onClick={() => navigate('/production-sections/flattening')}>
        <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading {CURRENT_SECTION} Production Form...</p>
            <div className="loading-details">
              <p>📊 Loading {CURRENT_SECTION} targets...</p>
              <p>🔧 Processing {CURRENT_SECTION} machines...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flattening-modal-overlay smart-form-overlay" onClick={() => navigate('/production-sections/flattening')}>
      <div className="flattening-modal-container smart-form-container">
        
        {/* HEADER */}
        <div className="modal-header smart-header">
          <div className="header-content">
            <div className="header-icon">
              <FiZap />
            </div>
            <div className="header-text">
              <h1>{CURRENT_SECTION.toUpperCase()} PRODUCTION ENTRY</h1>
              <p>
                <FiPackage /> {CURRENT_SECTION} Section | 
                <FiClock /> {shifts.length} Shifts | 
                <FiCpu /> {machines.length} Machines
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button className="back-button" onClick={() => navigate('/production-sections/flattening')}>
              <FiArrowLeft /> BACK
            </button>
            <button className="close-button" onClick={() => navigate('/production-sections/flattening')}>
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
              <span className="step-subtext">({shifts.length} shifts available for {CURRENT_SECTION})</span>
            </div>
            
            <div className="shifts-container">
              {shifts.map(shift => (
                <button
                  key={shift.id || shift.shift_code}
                  type="button"
                  className={`shift-card ${selectedShift === shift.shift_code ? 'selected' : ''}`}
                  onClick={() => handleShiftSelect(shift.shift_code)}
                >
                  <div className="shift-code">{shift.shift_code}</div>
                  <div className="shift-name">{shift.shift_name}</div>
                  <div className="shift-time">
                    {shift.start_time} - {shift.end_time}
                  </div>
                  <div className="shift-targets">
                    Targets: {targets.filter(t => 
                      (t.shift_code === shift.shift_code || t.shift === shift.shift_code) && 
                      (t.section_name === CURRENT_SECTION)
                    ).length}
                  </div>
                </button>
              ))}
            </div>
            
            {validationErrors.shift && (
              <div className="error-text">{validationErrors.shift}</div>
            )}
          </div>

          {/* STEP 2: PRODUCTION ENTRY */}
          {selectedShift && machines.length > 0 && (
            <div className="step-section">
              <div className="step-title">
                <span className="step-number">2</span>
                <span className="step-text">
                  ENTER {CURRENT_SECTION.toUpperCase()} PRODUCTION
                  <span className="machine-count">({calculateSectionMachines()} MACHINES)</span>
                </span>
              </div>
              
              <div className="section-info-banner">
                <div className="info-item">
                  <span>Current Section:</span>
                  <strong>{CURRENT_SECTION}</strong>
                </div>
                <div className="info-item">
                  <span>Targets Filter:</span>
                  <code>section_name = '{CURRENT_SECTION}'</code>
                </div>
                <div className="info-item">
                  <span>Selected Shift:</span>
                  <strong>{selectedShift}</strong>
                </div>
              </div>
              
              <div className="machines-grid">
                {machines.map(machine => {
                  // صرف CURRENT_SECTION کی مشینیں دکھائیں
                  if (machine.section_name !== CURRENT_SECTION) {
                    return null;
                  }
                  
                  const machineNo = machine.machine_no;
                  const data = machineData[machineNo] || {};
                  const target = getTargetForMachine(machineNo, selectedShift);
                  const totalProduction = data.items ? 
                    data.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0) : 0;
                  
                  return (
                    <div key={machineNo} className="machine-card">
                      
                      {/* MACHINE HEADER */}
                      <div className="machine-header">
                        <div className="machine-title">
                          <FiCpu />
                          <span className="machine-name">{CURRENT_SECTION} M/C: {machineNo}</span>
                          {target ? (
                            <span className="target-info success">
                              ✅ Target: {target.target_qty || 0} {target.uom || 'Kg'}
                            </span>
                          ) : (
                            <span className="target-info warning">
                              ⚠️ No target found for {CURRENT_SECTION}
                            </span>
                          )}
                        </div>
                        <div className="machine-stats">
                          <span className="stat-label">Production:</span>
                          <span className="stat-value">{totalProduction.toFixed(1)} Kg</span>
                        </div>
                      </div>
                      
                      {/* ITEMS TABLE */}
                      <div className="items-table">
                        <table>
                          <thead>
                            <tr>
                              <th>ITEM CODE</th>
                              <th>QUANTITY (Kg)</th>
                              <th>UNIT</th>
                              <th>EFFICIENCY</th>
                              <th>ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.items?.map((item, index) => (
                              <tr key={item.id}>
                                <td>
                                  <select
                                    value={item.item_code}
                                    onChange={(e) => setMachineData(prev => {
                                      const updated = { ...prev };
                                      const machine = updated[machineNo];
                                      if (!machine) return prev;
                                      
                                      const updatedItems = machine.items.map((it, idx) => {
                                        if (idx === index) {
                                          const newItem = { ...it, item_code: e.target.value };
                                          const selectedItem = items.find(i => i.item_code === e.target.value);
                                          if (selectedItem) {
                                            newItem.unit = selectedItem.unit || 'Kg';
                                          }
                                          return newItem;
                                        }
                                        return it;
                                      });
                                      
                                      updated[machineNo] = { ...machine, items: updatedItems };
                                      return updated;
                                    })}
                                    className={`item-select ${validationErrors[`item_${machineNo}_${index}`] ? 'error' : ''}`}
                                  >
                                    <option value="">-- SELECT --</option>
                                    {items.map(itm => (
                                      <option key={itm.item_code} value={itm.item_code}>
                                        {itm.item_code} - {itm.item_name?.substring(0, 20)}
                                      </option>
                                    ))}
                                  </select>
                                  {validationErrors[`item_${machineNo}_${index}`] && (
                                    <div className="error-small">{validationErrors[`item_${machineNo}_${index}`]}</div>
                                  )}
                                </td>
                                
                                <td>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => setMachineData(prev => {
                                      const updated = { ...prev };
                                      const machine = updated[machineNo];
                                      if (!machine) return prev;
                                      
                                      const quantity = parseFloat(e.target.value) || 0;
                                      const targetQty = machine.target_qty || 0;
                                      const efficiency = targetQty > 0 ? (quantity / targetQty) * 100 : 0;
                                      
                                      const updatedItems = machine.items.map((it, idx) => {
                                        if (idx === index) {
                                          return { 
                                            ...it, 
                                            quantity: e.target.value,
                                            efficiency: Math.min(100, parseFloat(efficiency.toFixed(1)))
                                          };
                                        }
                                        return it;
                                      });
                                      
                                      updated[machineNo] = { ...machine, items: updatedItems };
                                      return updated;
                                    })}
                                    step="0.01"
                                    min="0"
                                    className={`qty-input ${validationErrors[`qty_${machineNo}_${index}`] ? 'error' : ''}`}
                                    placeholder="0.00"
                                  />
                                  {validationErrors[`qty_${machineNo}_${index}`] && (
                                    <div className="error-small">{validationErrors[`qty_${machineNo}_${index}`]}</div>
                                  )}
                                </td>
                                
                                <td className="unit-cell">
                                  {item.unit || 'Kg'}
                                </td>
                                
                                <td 
                                  className="efficiency-cell"
                                  style={{ 
                                    color: item.efficiency >= 90 ? '#27ae60' : 
                                           item.efficiency >= 80 ? '#f39c12' : 
                                           item.efficiency >= 70 ? '#e67e22' : '#e74c3c',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {item.efficiency}%
                                </td>
                                
                                <td className="action-cell">
                                  {data.items.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedItems = data.items.filter((_, idx) => idx !== index);
                                        setMachineData(prev => ({
                                          ...prev,
                                          [machineNo]: { ...prev[machineNo], items: updatedItems }
                                        }));
                                      }}
                                      className="remove-btn"
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
                          onClick={() => {
                            const newItems = [...(data.items || []), { 
                              id: Date.now(), 
                              item_code: '', 
                              quantity: '', 
                              unit: 'Kg', 
                              efficiency: 0 
                            }];
                            setMachineData(prev => ({
                              ...prev,
                              [machineNo]: { ...prev[machineNo], items: newItems }
                            }));
                          }}
                          className="add-item-btn"
                        >
                          <FiPlus /> ADD ITEM TO {CURRENT_SECTION}
                        </button>
                      </div>
                      
                      {/* OPERATOR & REMARKS */}
                      <div className="machine-footer">
                        <div className="operator-input">
                          <label>OPERATOR NAME:</label>
                          <input
                            type="text"
                            value={data.operator_name || ''}
                            onChange={(e) => setMachineData(prev => ({
                              ...prev,
                              [machineNo]: { ...prev[machineNo], operator_name: e.target.value }
                            }))}
                            className={`operator-input-field ${validationErrors[`operator_${machineNo}`] ? 'error' : ''}`}
                            placeholder="Enter operator name"
                          />
                          {validationErrors[`operator_${machineNo}`] && (
                            <div className="error-small">{validationErrors[`operator_${machineNo}`]}</div>
                          )}
                        </div>
                        
                        <div className="remarks-input">
                          <label>REMARKS:</label>
                          <input
                            type="text"
                            value={data.remarks || ''}
                            onChange={(e) => setMachineData(prev => ({
                              ...prev,
                              [machineNo]: { ...prev[machineNo], remarks: e.target.value }
                            }))}
                            className="remarks-input-field"
                            placeholder={`${CURRENT_SECTION} remarks...`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SUMMARY & SAVE */}
          {selectedShift && calculateSectionMachines() > 0 && (
            <div className="step-section final-step">
              <div className="step-title">
                <span className="step-number">3</span>
                <span className="step-text">{CURRENT_SECTION.toUpperCase()} SUMMARY</span>
              </div>
              
              <div className="summary-card section-summary">
                <div className="summary-header">
                  <h3>{CURRENT_SECTION} SECTION REPORT</h3>
                  <div className="section-badge">{CURRENT_SECTION}</div>
                </div>
                
                <div className="summary-row">
                  <div className="summary-label">
                    <FiClock /> SELECTED SHIFT:
                  </div>
                  <div className="summary-value">
                    {shifts.find(s => s.shift_code === selectedShift)?.shift_name || selectedShift}
                  </div>
                </div>
                
                <div className="summary-row">
                  <div className="summary-label">
                    <FiCpu /> {CURRENT_SECTION} MACHINES:
                  </div>
                  <div className="summary-value">
                    {calculateSectionMachines()} machines
                  </div>
                </div>
                
                <div className="summary-row">
                  <div className="summary-label">
                    <FiPackage /> TOTAL ITEMS:
                  </div>
                  <div className="summary-value">
                    {calculateSectionItems()} items
                  </div>
                </div>
                
                <div className="summary-row total-row">
                  <div className="summary-label">
                    <FiTrendingUp /> {CURRENT_SECTION.toUpperCase()} PRODUCTION:
                  </div>
                  <div className="summary-value total-value">
                    {calculateSectionTotal().toFixed(2)} Kg
                  </div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShift('');
                    setMachineData({});
                    setValidationErrors({});
                    setError('');
                    setSuccess('');
                  }}
                  className="btn btn-reset"
                  disabled={saving}
                >
                  <FiRefreshCw /> CHANGE SHIFT
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-submit"
                >
                  {saving ? (
                    <>
                      <div className="btn-spinner"></div>
                      SAVING {CURRENT_SECTION}...
                    </>
                  ) : (
                    <>
                      <FiSave /> SAVE {CURRENT_SECTION.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* EMPTY STATES */}
          {!selectedShift && (
            <div className="empty-state">
              <div className="empty-icon">
                <FiPackage size={48} />
              </div>
              <h3>WELCOME TO {CURRENT_SECTION.toUpperCase()}</h3>
              <p>Select a shift to start production entry for {CURRENT_SECTION} section</p>
              <div className="empty-stats">
                <div className="stat">
                  <span className="stat-number">{machines.filter(m => m.section_name === CURRENT_SECTION).length}</span>
                  <span className="stat-label">{CURRENT_SECTION} Machines</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{targets.length}</span>
                  <span className="stat-label">{CURRENT_SECTION} Targets</span>
                </div>
              </div>
            </div>
          )}

          {selectedShift && calculateSectionMachines() === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔧</div>
              <h3>NO {CURRENT_SECTION.toUpperCase()} MACHINES</h3>
              <p>No machines are assigned to {selectedShift} shift in {CURRENT_SECTION} section</p>
              <button
                type="button"
                onClick={() => setSelectedShift('')}
                className="btn btn-secondary"
              >
                SELECT DIFFERENT SHIFT
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default FlatteningSmartForm;