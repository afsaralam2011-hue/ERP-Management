// ========================================================
// FILE: FlatteningSmartForm.jsx - 100% FINAL VERSION
// COMPLETELY FIXED - READY TO USE
// ========================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiClock, FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiTrendingUp, FiRefreshCw, FiArrowLeft, 
  FiCpu, FiPackage, FiUser, FiEdit3, FiChevronRight,
  FiChevronLeft, FiDownload, FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './FlatteningSmartForm.css';

const FlatteningSmartForm = () => {
  const navigate = useNavigate();
  const CURRENT_SECTION = 'Flattening';
  
  const [selectedShift, setSelectedShift] = useState('');
  const [shifts, setShifts] = useState([]);
  const [machineData, setMachineData] = useState({});
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activeMachineIndex, setActiveMachineIndex] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let autoSaveTimer;
    const saveDraft = async () => {
      if (selectedShift && Object.keys(machineData).length > 0) {
        try {
          const draftData = { shift: selectedShift, machineData, timestamp: new Date().toISOString() };
          localStorage.setItem(`flattening_draft_${selectedShift}`, JSON.stringify(draftData));
          setDraftSaved(true);
          setTimeout(() => setDraftSaved(false), 3000);
        } catch (err) {
          console.error('Draft save error:', err);
        }
      }
    };
    if (selectedShift) autoSaveTimer = setTimeout(saveDraft, 30000);
    return () => { if (autoSaveTimer) clearTimeout(autoSaveTimer); };
  }, [selectedShift, machineData]);

  const loadDraftForShift = useCallback((shiftCode) => {
    try {
      const draft = localStorage.getItem(`flattening_draft_${shiftCode}`);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.machineData) {
          setMachineData(parsedDraft.machineData);
          setSuccess('Previous draft loaded successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (err) {
      console.error('Draft load error:', err);
    }
  }, []);

  const normalizedTargets = useMemo(() => {
    return targets.map(target => ({
      id: target.targets_id || target.id,
      machine_no: target.machine_no || target.machine_number || target.machine_id,
      shift_code: target.shift_code || target.shift,
      section_name: target.section_name,
      target_qty: parseFloat(target.target_qty || target.quantity || 0),
      uom: target.uom || target.unit || 'Kg',
      rawData: target
    }));
  }, [targets]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [shiftsRes, targetsRes, itemsRes] = await Promise.all([
          supabase.from('shifts').select('*').order('shift_code'),
          supabase.from('targets').select('*').eq('section_name', CURRENT_SECTION),
          supabase.from('items').select('*').order('item_code')
        ]);
        if (shiftsRes.error) throw shiftsRes.error;
        if (targetsRes.error) throw targetsRes.error;
        if (itemsRes.error) throw itemsRes.error;
        setShifts(shiftsRes.data || []);
        setTargets(targetsRes.data || []);
        setItems(itemsRes.data || []);
      } catch (error) {
        console.error('Data fetch error:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [CURRENT_SECTION]);

  const getTargetForMachine = useCallback((machineNo, shiftCode) => {
    if (!machineNo || !shiftCode) return null;
    return normalizedTargets.find(target => {
      return target.machine_no === machineNo && 
             target.shift_code === shiftCode &&
             target.section_name === CURRENT_SECTION;
    });
  }, [normalizedTargets, CURRENT_SECTION]);

  const handleShiftSelect = (shiftCode) => {
    setSelectedShift(shiftCode);
    setActiveMachineIndex(0);
    setError('');
    setSuccess('');
    if (!shiftCode) {
      setMachineData({});
      return;
    }
    loadDraftForShift(shiftCode);
    const selectedShiftData = shifts.find(s => s.shift_code === shiftCode);
    const initialMachineData = {};
    const machinesForThisShift = normalizedTargets
      .filter(target => target.shift_code === shiftCode && target.section_name === CURRENT_SECTION)
      .map(target => ({
        machine_no: target.machine_no,
        machine_id: target.rawData.machine_id || target.machine_no,
        section_name: target.section_name
      }))
      .filter((machine, index, self) => index === self.findIndex(m => m.machine_no === machine.machine_no))
      .sort((a, b) => {
        const numA = parseInt(a.machine_no.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.machine_no.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
    if (!localStorage.getItem(`flattening_draft_${shiftCode}`)) {
      machinesForThisShift.forEach(machine => {
        const target = getTargetForMachine(machine.machine_no, shiftCode);
        initialMachineData[machine.machine_no] = {
          machine_id: target?.rawData?.machine_id || machine.machine_id || '',
          machine_no: machine.machine_no,
          targets_id: target?.id || target?.rawData?.targets_id || '',
          target_qty: target?.target_qty || 0,
          unit: target?.uom || 'Kg',
          shift_code: shiftCode,
          shift_name: selectedShiftData?.shift_name || shiftCode,
          items: [{ 
            id: Date.now(), 
            item_code: '', 
            item_name: '', 
            quantity: '', 
            unit: 'Kg',
            coil_size: '',
            material_type: ''
          }],
          operator_name: '',
          remarks: '',
          section_name: CURRENT_SECTION
        };
      });
      setMachineData(initialMachineData);
    }
  };

  const handleItemChange = (machineNo, itemId, field, value) => {
    setMachineData(prev => {
      const updated = { ...prev };
      const machine = updated[machineNo];
      if (!machine) return prev;
      const updatedItems = machine.items.map(item => {
        if (item.id === itemId) {
          const newItem = { ...item, [field]: value };
          if (field === 'item_code' && value) {
            const selectedItem = items.find(i => i.item_code === value);
            if (selectedItem) {
              newItem.item_name = selectedItem.item_name || '';
              newItem.unit = selectedItem.unit || 'Kg';
              newItem.coil_size = selectedItem.coil_size || '';
              newItem.material_type = selectedItem.material_type || '';
            }
          }
          return newItem;
        }
        return item;
      });
      updated[machineNo] = { ...machine, items: updatedItems };
      return updated;
    });
  };

  const handleBulkUpdate = (field, value) => {
    const updatedData = { ...machineData };
    Object.keys(updatedData).forEach(machineNo => {
      updatedData[machineNo] = {
        ...updatedData[machineNo],
        [field]: value
      };
    });
    setMachineData(updatedData);
  };

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
            coil_size: '',
            material_type: ''
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

  const calculateMachineTotal = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || !machine.items) return 0;
    return machine.items.reduce((total, item) => {
      return total + (parseFloat(item.quantity) || 0);
    }, 0);
  }, [machineData]);

  const calculateMachineEfficiency = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || machine.target_qty === 0) return 0;
    const totalProduction = calculateMachineTotal(machineNo);
    const efficiency = (totalProduction / machine.target_qty) * 100;
    return parseFloat(efficiency.toFixed(1));
  }, [machineData, calculateMachineTotal]);

  const calculateItemEfficiency = useCallback((itemQuantity, machineTarget) => {
    if (!itemQuantity || machineTarget === 0) return 0;
    const qty = parseFloat(itemQuantity) || 0;
    const efficiency = (qty / machineTarget) * 100;
    return parseFloat(efficiency.toFixed(1));
  }, []);

  const sectionTotal = useMemo(() => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      return total + calculateMachineTotal(machineNo);
    }, 0);
  }, [machineData, calculateMachineTotal]);

  const totalItems = useMemo(() => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      return total + (machineData[machineNo]?.items?.length || 0);
    }, 0);
  }, [machineData]);

  const totalTarget = useMemo(() => {
    if (!selectedShift) return 0;
    return normalizedTargets
      .filter(target => target.shift_code === selectedShift && target.section_name === CURRENT_SECTION)
      .reduce((total, target) => total + target.target_qty, 0);
  }, [selectedShift, normalizedTargets]);

  const totalEfficiency = useMemo(() => {
    if (totalTarget === 0) return 0;
    const efficiency = (sectionTotal / totalTarget) * 100;
    return parseFloat(efficiency.toFixed(1));
  }, [sectionTotal, totalTarget]);

  const getEfficiencyStatus = (eff) => {
    if (eff >= 70) {
      return {
        color: '#00ff88',
        icon: <FiArrowUp />,
        bgColor: 'rgba(0, 255, 136, 0.1)',
        borderColor: 'rgba(0, 255, 136, 0.3)'
      };
    } else {
      return {
        color: '#ff4444',
        icon: <FiArrowDown />,
        bgColor: 'rgba(255, 68, 68, 0.1)',
        borderColor: 'rgba(255, 68, 68, 0.3)'
      };
    }
  };

  const machinesForCurrentShift = useMemo(() => {
    if (!selectedShift) return [];
    return normalizedTargets
      .filter(target => target.shift_code === selectedShift && target.section_name === CURRENT_SECTION)
      .map(target => target.machine_no)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
  }, [selectedShift, normalizedTargets]);

  const nextMachine = () => {
    if (activeMachineIndex < machinesForCurrentShift.length - 1) {
      setActiveMachineIndex(activeMachineIndex + 1);
    }
  };

  const prevMachine = () => {
    if (activeMachineIndex > 0) {
      setActiveMachineIndex(activeMachineIndex - 1);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedShift) errors.shift = 'Please select a shift';
    Object.keys(machineData).forEach(machineNo => {
      const machine = machineData[machineNo];
      if (!machine.operator_name?.trim()) errors[`operator_${machineNo}`] = 'Operator name is required';
      machine.items.forEach((item, index) => {
        if (!item.item_code) errors[`item_${machineNo}_${index}`] = 'Item selection is required';
        if (!item.quantity || parseFloat(item.quantity) <= 0) errors[`qty_${machineNo}_${index}`] = 'Valid quantity is required';
        if (!item.coil_size?.trim()) errors[`coil_${machineNo}_${index}`] = 'Coil size is required';
        if (!item.material_type?.trim()) errors[`material_${machineNo}_${index}`] = 'Material type is required';
      });
    });
    return Object.keys(errors).length === 0;
  };

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
        const machineEfficiency = calculateMachineEfficiency(machineNo);
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
              efficiency: machineEfficiency,
              coil_size: item.coil_size || '',
              material_type: item.material_type || '',
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
      if (allRecords.length === 0) throw new Error('No valid records to save');
      const { error: insertError } = await supabase.from('flatteningsection').insert(allRecords);
      if (insertError) throw insertError;
      localStorage.removeItem(`flattening_draft_${selectedShift}`);
      setSuccess(`Success! ${allRecords.length} records saved for ${Object.keys(machineData).length} machines`);
      setTimeout(() => {
        setSelectedShift('');
        setMachineData({});
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      setError('Save failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    navigate('/production-sections/flattening');
  };

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

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleBackClick(); }}>
      <div className="modal-container smart-form-modal enhanced-form">
        <div className="modal-header enhanced-header">
          <div className="header-left">
            <div className="header-icon"><FiEdit3 /></div>
            <div className="header-text">
              <h1>Flattening Production Entry</h1>
              <p className="header-subtitle"><FiPackage /> Smart entry form for production section</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-actions">
              {draftSaved && (<span className="draft-saved-badge"><FiSave /> Draft Saved</span>)}
              {selectedShift && machinesForCurrentShift.length > 0 && (
                <div className="machine-nav-container">
                  <button type="button" onClick={prevMachine} disabled={activeMachineIndex === 0} className="btn-nav-header" title="Previous Machine"><FiChevronLeft /></button>
                  <div className="machine-header-display">
                    <span className="machine-header-number">M/C {machinesForCurrentShift[activeMachineIndex]}</span>
                    <span className="machine-header-counter">({activeMachineIndex + 1}/{machinesForCurrentShift.length})</span>
                  </div>
                  <button type="button" onClick={nextMachine} disabled={activeMachineIndex === machinesForCurrentShift.length - 1} className="btn-nav-header" title="Next Machine"><FiChevronRight /></button>
                </div>
              )}
              <button className="btn btn-back" onClick={handleBackClick} title="Go back"><FiArrowLeft /> {!isMobile && 'Back'}</button>
            </div>
          </div>
        </div>
        {success && (<div className="alert alert-success"><FiCheck /> {success}</div>)}
        {error && (<div className="alert alert-error"><FiAlertCircle /> {error}</div>)}
        <div className="form-layout">
          <div className="form-sidebar">
            <div className="sidebar-header"><FiClock /><h3>Select Shift</h3></div>
            <div className="shift-options">
              {shifts.slice(0, 3).map(shift => (
                <div key={shift.id} className={`shift-option ${selectedShift === shift.shift_code ? 'active' : ''}`} onClick={() => handleShiftSelect(shift.shift_code)}>
                  <div className="option-content">
                    <span className="option-code">Shift {shift.shift_code}</span>
                    <span className="option-name">{shift.shift_name}</span>
                    <span className="option-time">{shift.start_time} - {shift.end_time}</span>
                  </div>
                  <div className="option-status">
                    {selectedShift === shift.shift_code ? (<span className="status-active">Active</span>) : (<span className="status-inactive">Click to load</span>)}
                  </div>
                </div>
              ))}
            </div>
            {selectedShift && Object.keys(machineData).length > 0 && (
              <div className="bulk-operations">
                <div className="bulk-header"><FiTrendingUp /><h4>Bulk Operations</h4></div>
                <div className="bulk-controls">
                  <div className="form-group"><label className="form-label">Operator Name (All Machines)</label><input type="text" placeholder="Enter for all machines" onChange={(e) => handleBulkUpdate('operator_name', e.target.value)} className="form-input" /></div>
                  <div className="form-group"><label className="form-label">Remarks (All Machines)</label><input type="text" placeholder="Enter for all machines" onChange={(e) => handleBulkUpdate('remarks', e.target.value)} className="form-input" /></div>
                </div>
              </div>
            )}
            {selectedShift && (
              <div className="sidebar-stats">
                <div className="stat-item"><span className="stat-label">Machines</span><span className="stat-value">{machinesForCurrentShift.length}</span></div>
                <div className="stat-item"><span className="stat-label">Items</span><span className="stat-value">{totalItems}</span></div>
                <div className="stat-item"><span className="stat-label">Total Target</span><span className="stat-value">{totalTarget.toFixed(2)} Kg</span></div>
              </div>
            )}
          </div>
          <div className="form-main-content">
            {selectedShift && (<div className="shift-header"><div className="shift-title"><h2>Shift {selectedShift} Production</h2><span className="shift-badge">{shifts.find(s => s.shift_code === selectedShift)?.shift_name}</span></div></div>)}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="totals-line">
                <div className="totals-container">
                  <div className="total-item"><span className="total-label">Total Target:</span><span className="total-value">{totalTarget.toFixed(2)} Kg</span></div>
                  <div className="total-separator">|</div>
                  <div className="total-item"><span className="total-label">Total Production:</span><span className="total-value">{sectionTotal.toFixed(2)} Kg</span></div>
                  <div className="total-separator">|</div>
                  <div className="total-item">
                    <span className="total-label">Total Efficiency:</span>
                    <div className="total-efficiency-display">
                      <span className="total-efficiency-value" style={{ color: getEfficiencyStatus(totalEfficiency).color }}>{totalEfficiency}%</span>
                      <span className="total-efficiency-icon" style={{ color: getEfficiencyStatus(totalEfficiency).color }}>{getEfficiencyStatus(totalEfficiency).icon}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="production-entry">
                {machinesForCurrentShift.map((machineNo, index) => {
                  const data = machineData[machineNo] || {};
                  const target = getTargetForMachine(machineNo, selectedShift);
                  const machineEfficiency = calculateMachineEfficiency(machineNo);
                  const efficiencyStatus = getEfficiencyStatus(machineEfficiency);
                  
                  return (
                    <div key={machineNo} className={`machine-card ${index === activeMachineIndex ? 'active' : 'collapsed'}`} onClick={() => setActiveMachineIndex(index)}>
                      <div className="machine-card-header">
                        <div className="machine-info">
                          <FiCpu className="machine-icon" />
                          <div>
                            <h3>Machine {machineNo}</h3>
                            <div className="machine-meta">
                              <span className="meta-item"><FiClock /> Shift: {selectedShift}</span>
                              {target && (<span className={`meta-item target ${calculateMachineTotal(machineNo) >= target.target_qty ? 'target-met' : 'target-missed'}`}><FiTrendingUp /> Target: {target.target_qty || 0} {target.uom || 'Kg'}</span>)}
                            </div>
                          </div>
                        </div>
                        <div className="machine-stats-compact">
                          <div className="machine-stat-item">
                            <span className="stat-label-compact">Production:</span>
                            <strong className="stat-value-compact">{calculateMachineTotal(machineNo).toFixed(2)} Kg</strong>
                          </div>
                          <div className="machine-stat-item">
                            <span className="stat-label-compact">Efficiency:</span>
                            <div className="efficiency-box-compact" style={{ backgroundColor: efficiencyStatus.bgColor, color: efficiencyStatus.color, borderColor: efficiencyStatus.borderColor }}>
                              <span className="efficiency-value-compact">{machineEfficiency}%</span>
                              <span className="efficiency-icon-compact">{efficiencyStatus.icon}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index === activeMachineIndex && (
                        <>
                          <div className="items-table-wrapper">
                            <table className="items-table">
                              <thead>
                                <tr>
                                  <th className="col-add"></th>
                                  <th className="col-item">Item Code & Name</th>
                                  <th className="col-coil-material">Coil Size & Material Type</th>
                                  <th className="col-qty-eff">Quantity & Efficiency</th>
                                  <th className="col-actions"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.items?.map((item, itemIndex) => {
                                  const itemEff = calculateItemEfficiency(item.quantity, data.target_qty);
                                  const itemStatus = getEfficiencyStatus(itemEff);
                                  return (
                                    <tr key={item.id}>
                                      <td className="cell-add">
                                        {itemIndex === 0 && (<button type="button" onClick={() => addItem(machineNo)} className="btn-add-inline" title="Add item"><FiPlus /> Add</button>)}
                                      </td>
                                      <td className="cell-item">
                                        <div className="item-code-select"><select value={item.item_code} onChange={(e) => handleItemChange(machineNo, item.id, 'item_code', e.target.value)} className="form-select"><option value="">-- Select Item --</option>{items.map(itm => (<option key={itm.item_code} value={itm.item_code}>{itm.item_code} - {itm.item_name || 'Unnamed Item'}</option>))}</select></div>
                                        {item.item_code && (<div className="item-name-line">{item.item_name || items.find(i => i.item_code === item.item_code)?.item_name || 'Unknown'}</div>)}
                                      </td>
                                      <td className="cell-coil-material">
                                        <div className="coil-size-input"><input type="text" value={item.coil_size || ''} onChange={(e) => handleItemChange(machineNo, item.id, 'coil_size', e.target.value)} className="form-input" placeholder="Coil size" /></div>
                                        <div className="material-type-input"><input type="text" value={item.material_type || ''} onChange={(e) => handleItemChange(machineNo, item.id, 'material_type', e.target.value)} className="form-input" placeholder="Material type" /></div>
                                      </td>
                                      <td className="cell-qty-eff">
                                        <div className="quantity-input"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(machineNo, item.id, 'quantity', e.target.value)} step="0.01" min="0" className="form-input" placeholder="0.00" /></div>
                                        <div className="item-efficiency-display">
                                          <span className="item-efficiency-value" style={{ color: itemStatus.color }}>{itemEff}%</span>
                                          <span className="item-efficiency-icon" style={{ color: itemStatus.color }}>{itemStatus.icon}</span>
                                        </div>
                                      </td>
                                      <td className="cell-actions">
                                        {data.items.length > 1 && (<button type="button" onClick={() => removeItem(machineNo, item.id)} className="btn-icon btn-danger" title="Remove item"><FiTrash2 /></button>)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="operator-remarks-line">
                            <div className="form-group-inline"><label className="form-label-inline"><FiUser /> Operator:</label><input type="text" value={data.operator_name || ''} onChange={(e) => setMachineData(prev => ({ ...prev, [machineNo]: { ...prev[machineNo], operator_name: e.target.value } }))} className="form-input-inline" placeholder="Operator name" /></div>
                            <div className="form-group-inline"><label className="form-label-inline">Remarks:</label><input type="text" value={data.remarks || ''} onChange={(e) => setMachineData(prev => ({ ...prev, [machineNo]: { ...prev[machineNo], remarks: e.target.value } }))} className="form-input-inline" placeholder="Optional remarks" /></div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!selectedShift && (
              <div className="empty-state centered">
                <div className="empty-icon"><FiClock size={64} /></div>
                <h3>Select a Shift to Begin</h3>
                <p>Choose a shift from the sidebar to start entering production data</p>
                <div className="empty-stats">
                  <div className="stat"><span className="stat-number">{shifts.length}</span><span className="stat-label">Shifts Available</span></div>
                  <div className="stat"><span className="stat-number">{normalizedTargets.length}</span><span className="stat-label">Total Machines</span></div>
                </div>
              </div>
            )}
            {selectedShift && machinesForCurrentShift.length === 0 && (
              <div className="empty-state centered">
                <div className="empty-icon"><FiCpu size={64} /></div>
                <h3>No Machines Found</h3>
                <p>No machines are available for the selected shift ({selectedShift})</p>
                <button type="button" onClick={() => setSelectedShift('')} className="btn btn-outline"><FiRefreshCw /> Change Shift</button>
              </div>
            )}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="form-actions enhanced-actions">
                <div className="action-left">
                  <button type="button" onClick={() => { localStorage.removeItem(`flattening_draft_${selectedShift}`); setSelectedShift(''); setMachineData({}); setError(''); setSuccess(''); }} className="btn btn-secondary" disabled={saving} title="Change shift and reset form"><FiRefreshCw /> Change Shift</button>
                  <button type="button" onClick={() => { const dataStr = JSON.stringify(machineData, null, 2); navigator.clipboard.writeText(dataStr); setSuccess('Data copied to clipboard'); setTimeout(() => setSuccess(''), 2000); }} className="btn btn-outline" title="Copy data to clipboard"><FiDownload /> Copy Data</button>
                </div>
                <div className="action-right">
                  <button type="submit" onClick={handleSubmit} className="btn btn-primary save-btn" disabled={saving} title="Save all production data">
                    {saving ? (<><div className="spinner-small"></div>Saving...</>) : (<><FiSave /> Save All Data ({totalItems} Items)</>)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlatteningSmartForm;