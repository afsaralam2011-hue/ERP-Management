// ========================================================
// FILE: SpiralSmartForm.jsx
// PURPOSE: Smart Production Entry for Spiral Section
// VERSION: 1.1 - Professional Dark Theme with Header Navigation
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
import './SpiralSmartForm.css';

const SpiralSmartForm = () => {
  const navigate = useNavigate();
  
  // Constants
  const CURRENT_SECTION = 'Spiral';
  
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
  const [activeMachineIndex, setActiveMachineIndex] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);

  // ==================== CHECK MOBILE ====================
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==================== AUTO-SAVE DRAFT ====================
  useEffect(() => {
    let autoSaveTimer;
    
    const saveDraft = async () => {
      if (selectedShift && Object.keys(machineData).length > 0) {
        try {
          const draftData = {
            shift: selectedShift,
            machineData,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(`spiral_draft_${selectedShift}`, JSON.stringify(draftData));
          setDraftSaved(true);
          
          setTimeout(() => setDraftSaved(false), 3000);
        } catch (err) {
          console.error('Draft save error:', err);
        }
      }
    };

    if (selectedShift) {
      autoSaveTimer = setTimeout(saveDraft, 30000);
    }

    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [selectedShift, machineData]);

  // ==================== LOAD DRAFT ON SHIFT SELECT ====================
  const loadDraftForShift = useCallback((shiftCode) => {
    try {
      const draft = localStorage.getItem(`spiral_draft_${shiftCode}`);
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

  // ==================== NORMALIZE TARGETS DATA ====================
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

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // سب سے پہلے targets fetch کریں
        const targetsRes = await supabase
          .from('targets')
          .select('*')
          .eq('section_name', CURRENT_SECTION);

        if (targetsRes.error) throw targetsRes.error;

        const targetsData = targetsRes.data || [];

        // Targets سے unique shift codes نکالیں
        const uniqueShiftCodes = [...new Set(targetsData.map(t => t.shift_code))];
        
        // اب shifts fetch کریں جو targets میں موجود ہوں
        const shiftsRes = await supabase
          .from('shifts')
          .select('*')
          .in('shift_code', uniqueShiftCodes)
          .order('shift_code');

        // Items fetch کریں
        const itemsRes = await supabase
          .from('spiralitem')
          .select('*')
          .order('item_code');

        if (shiftsRes.error) throw shiftsRes.error;
        if (itemsRes.error) throw itemsRes.error;

        const shiftsData = shiftsRes.data || [];
        const itemsData = itemsRes.data || [];

        // Get unique machines for current section
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
  const getTargetForMachine = useCallback((machineNo, shiftCode) => {
    if (!machineNo || !shiftCode) return null;

    return normalizedTargets.find(target => {
      return target.machine_no === machineNo && 
             target.shift_code === shiftCode &&
             target.section_name === CURRENT_SECTION;
    });
  }, [normalizedTargets, CURRENT_SECTION]);

  // ==================== HANDLE SHIFT SELECTION ====================
  const handleShiftSelect = (shiftCode) => {
    setSelectedShift(shiftCode);
    setActiveMachineIndex(0);
    setError('');
    setSuccess('');
    setValidationErrors({});

    if (!shiftCode) {
      setMachineData({});
      return;
    }

    loadDraftForShift(shiftCode);

    const selectedShiftData = shifts.find(s => s.shift_code === shiftCode);
    const initialMachineData = {};

    // Get machines ONLY for this shift and sort by machine number
    const machinesForThisShift = normalizedTargets
      .filter(target => 
        target.shift_code === shiftCode &&
        target.section_name === CURRENT_SECTION
      )
      .map(target => ({
        machine_no: target.machine_no,
        machine_id: target.rawData.machine_id || target.machine_no,
        section_name: target.section_name
      }))
      .filter((machine, index, self) => 
        index === self.findIndex(m => m.machine_no === machine.machine_no)
      )
      .sort((a, b) => {
        const numA = parseInt(a.machine_no.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.machine_no.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

    // Only initialize if no draft loaded
    if (!localStorage.getItem(`spiral_draft_${shiftCode}`)) {
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
            raw_material_flatsize: '',
            material_type: '',
            wire_size: '',
            finishedproductname: '',
            production_quantity: '', 
            per_meter_wt: '',
            weight: '',
            unit: 'Kg', 
            efficiency: 0
          }],
          operator_name: '',
          users_name: '',
          remarks: '',
          section_name: CURRENT_SECTION
        };
      });

      setMachineData(initialMachineData);
    }
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
              newItem.raw_material_flatsize = selectedItem.raw_material_flatsize || '';
              newItem.material_type = selectedItem.material_type || '';
              newItem.wire_size = selectedItem.wire_size || '';
              newItem.finishedproductname = selectedItem.finishedproductname || '';
              newItem.per_meter_wt = selectedItem.per_meter_wt || '';
            }
          }

          // Calculate weight when production_quantity or per_meter_wt changes
          if ((field === 'production_quantity' || field === 'per_meter_wt') && 
              (newItem.production_quantity && newItem.per_meter_wt)) {
            const qty = parseFloat(newItem.production_quantity) || 0;
            const perMeterWt = parseFloat(newItem.per_meter_wt) || 0;
            newItem.weight = (qty * perMeterWt).toFixed(2);
          }

          // Calculate efficiency when weight changes
          if (field === 'weight' || field === 'production_quantity' || field === 'per_meter_wt') {
            const weight = parseFloat(newItem.weight) || 0;
            const targetQty = machine.target_qty || 0;
            const efficiency = targetQty > 0 ? (weight / targetQty) * 100 : 0;
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

  // ==================== BULK OPERATIONS ====================
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
            raw_material_flatsize: '',
            material_type: '',
            wire_size: '',
            finishedproductname: '',
            production_quantity: '', 
            per_meter_wt: '',
            weight: '',
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
  const calculateMachineTotal = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || !machine.items) return 0;

    return machine.items.reduce((total, item) => {
      return total + (parseFloat(item.weight) || 0);
    }, 0);
  }, [machineData]);

  // Calculate machine efficiency based on TOTAL weight vs machine target
  const calculateMachineEfficiency = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || machine.target_qty === 0) return 0;

    const totalWeight = calculateMachineTotal(machineNo);
    const machineEfficiency = (totalWeight / machine.target_qty) * 100;
    return parseFloat(machineEfficiency.toFixed(1));
  }, [machineData, calculateMachineTotal]);

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

  // ==================== CALCULATE TOTAL TARGET ====================
  const totalTarget = useMemo(() => {
    if (!selectedShift) return 0;
    
    return normalizedTargets
      .filter(target => 
        target.shift_code === selectedShift &&
        target.section_name === CURRENT_SECTION
      )
      .reduce((total, target) => {
        return total + target.target_qty;
      }, 0);
  }, [selectedShift, normalizedTargets]);

  // ==================== CALCULATE TOTAL EFFICIENCY ====================
  const totalEfficiency = useMemo(() => {
    if (totalTarget === 0) return 0;
    
    const totalWeight = sectionTotal;
    const totalEfficiencyValue = (totalWeight / totalTarget) * 100;
    return parseFloat(totalEfficiencyValue.toFixed(1));
  }, [sectionTotal, totalTarget]);

  // ==================== GET EFFICIENCY STATUS ====================
  const getEfficiencyStatus = (efficiency) => {
    if (efficiency >= 100) {
      return {
        text: 'Excellent',
        color: '#00ff88',
        icon: <FiArrowUp />,
        direction: 'up'
      };
    } else if (efficiency >= 90) {
      return {
        text: 'Good',
        color: '#4cc9f0',
        icon: <FiArrowUp />,
        direction: 'up'
      };
    } else if (efficiency >= 80) {
      return {
        text: 'Average',
        color: '#ffcc00',
        icon: null,
        direction: 'neutral'
      };
    } else {
      return {
        text: 'Below Target',
        color: '#ff4444',
        icon: <FiArrowDown />,
        direction: 'down'
      };
    }
  };

  // ==================== MACHINE NAVIGATION ====================
  const machinesForCurrentShift = useMemo(() => {
    if (!selectedShift) return [];
    return normalizedTargets
      .filter(target => 
        target.shift_code === selectedShift &&
        target.section_name === CURRENT_SECTION
      )
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
        if (!item.production_quantity || parseFloat(item.production_quantity) <= 0) {
          errors[`qty_${machineNo}_${index}`] = 'Valid production quantity is required';
        }
        if (!item.per_meter_wt || parseFloat(item.per_meter_wt) <= 0) {
          errors[`weight_${machineNo}_${index}`] = 'Per meter weight is required';
        }
        if (!item.raw_material_flatsize?.trim()) {
          errors[`flat_${machineNo}_${index}`] = 'Raw material flat size is required';
        }
        if (!item.material_type?.trim()) {
          errors[`material_${machineNo}_${index}`] = 'Material type is required';
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
          if (item.item_code && item.production_quantity) {
            const selectedItem = items.find(i => i.item_code === item.item_code);

            allRecords.push({
              section_name: CURRENT_SECTION,
              machine_id: machine.machine_id,
              machine_no: machine.machine_no,
              item_code: item.item_code,
              item_name: selectedItem?.item_name || item.item_name || '',
              raw_material_flatsize: item.raw_material_flatsize || '',
              material_type: item.material_type || '',
              wire_size: item.wire_size || '',
              finishedproductname: item.finishedproductname || '',
              operator_name: machine.operator_name.trim(),
              production_quantity: parseFloat(item.production_quantity) || 0,
              per_meter_wt: parseFloat(item.per_meter_wt) || 0,
              weight: parseFloat(item.weight) || 0,
              unit: item.unit || 'Kg',
              efficiency: item.efficiency || 0,
              users_name: machine.users_name || machine.operator_name.trim(),
              shift_code: machine.shift_code,
              shift_name: machine.shift_name,
              target_qty: machine.target_qty || 0,
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

      console.log('Saving records:', allRecords);

      const { error: insertError } = await supabase
        .from('spiralsection')
        .insert(allRecords);

      if (insertError) {
        console.error('Database error:', insertError);
        throw insertError;
      }

      localStorage.removeItem(`spiral_draft_${selectedShift}`);
      
      setSuccess(`Success! ${allRecords.length} records saved for ${Object.keys(machineData).length} machines`);

      setTimeout(() => {
        setSelectedShift('');
        setMachineData({});
        setValidationErrors({});
        setSuccess('');
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
    navigate('/production-sections/spiral');
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
      <div className="modal-container smart-form-modal enhanced-form">
        
        {/* HEADER */}
        <div className="modal-header enhanced-header">
          <div className="header-left">
            <div className="header-icon">
              <FiEdit3 />
            </div>
            <div className="header-text">
              <h1>Spiral Production Entry</h1>
              <p className="header-subtitle">
                <FiPackage /> Smart entry form for spiral section
              </p>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-actions">
              {draftSaved && (
                <span className="draft-saved-badge">
                  <FiSave /> Draft Saved
                </span>
              )}
              
              {/* MACHINE NAVIGATION IN HEADER */}
              {selectedShift && machinesForCurrentShift.length > 0 && (
                <div className="machine-navigation-header">
                  <button
                    type="button"
                    onClick={prevMachine}
                    disabled={activeMachineIndex === 0}
                    className="nav-btn-header"
                    title="Previous Machine"
                  >
                    <FiChevronLeft />
                  </button>
                  
                  <div className="nav-info-header">
                    <span className="nav-current-header">
                      <FiCpu /> Machine {machinesForCurrentShift[activeMachineIndex]}
                    </span>
                    <span className="nav-counter-header">
                      {activeMachineIndex + 1} / {machinesForCurrentShift.length}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={nextMachine}
                    disabled={activeMachineIndex === machinesForCurrentShift.length - 1}
                    className="nav-btn-header"
                    title="Next Machine"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
              
              <button 
                className="btn btn-back"
                onClick={handleBackClick}
                title="Go back"
              >
                <FiArrowLeft /> {!isMobile && 'Back'}
              </button>
            </div>
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

        {/* DETAILED ERROR DISPLAY */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="detailed-errors">
            <div className="errors-header">
              <FiAlertCircle />
              <span>Please fix the following errors:</span>
            </div>
            <ul className="errors-list">
              {Object.entries(validationErrors)
                .slice(0, 3)
                .map(([key, errorMsg]) => (
                  <li key={key}>{errorMsg}</li>
                ))}
              {Object.keys(validationErrors).length > 3 && (
                <li>...and {Object.keys(validationErrors).length - 3} more errors</li>
              )}
            </ul>
          </div>
        )}

        {/* FORM LAYOUT */}
        <div className="form-layout">
          
          {/* SIDEBAR - SHIFT SELECTION */}
          <div className="form-sidebar">
            <div className="sidebar-header">
              <FiClock />
              <h3>Select Shift</h3>
            </div>
            
            <div className="shift-options">
              {shifts.map(shift => (
                <div
                  key={shift.id}
                  className={`shift-option ${selectedShift === shift.shift_code ? 'active' : ''}`}
                  onClick={() => handleShiftSelect(shift.shift_code)}
                >
                  <div className="option-content">
                    <span className="option-code">Shift {shift.shift_code}</span>
                    <span className="option-name">{shift.shift_name}</span>
                    <span className="option-time">{shift.start_time} - {shift.end_time}</span>
                  </div>
                  <div className="option-status">
                    {selectedShift === shift.shift_code ? (
                      <span className="status-active">Active</span>
                    ) : (
                      <span className="status-inactive">Click to load</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* BULK OPERATIONS */}
            {selectedShift && Object.keys(machineData).length > 0 && (
              <div className="bulk-operations">
                <div className="bulk-header">
                  <FiDownload />
                  <h4>Bulk Operations</h4>
                </div>
                <div className="bulk-controls">
                  <div className="form-group">
                    <label className="form-label">Operator Name (All Machines)</label>
                    <input
                      type="text"
                      placeholder="Enter for all machines"
                      onChange={(e) => handleBulkUpdate('operator_name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">User Name (All Machines)</label>
                    <input
                      type="text"
                      placeholder="Enter for all machines"
                      onChange={(e) => handleBulkUpdate('users_name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remarks (All Machines)</label>
                    <input
                      type="text"
                      placeholder="Enter for all machines"
                      onChange={(e) => handleBulkUpdate('remarks', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUMMARY STATS */}
            {selectedShift && (
              <div className="sidebar-stats">
                <div className="stat-item">
                  <span className="stat-label">Machines</span>
                  <span className="stat-value">{machinesForCurrentShift.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Items</span>
                  <span className="stat-value">{totalItems}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Target</span>
                  <span className="stat-value">{totalTarget.toFixed(2)} Kg</span>
                </div>
              </div>
            )}
          </div>

          {/* MAIN CONTENT */}
          <div className="form-main-content">
            
            {/* SHIFT HEADER */}
            {selectedShift && (
              <div className="shift-header">
                <div className="shift-title">
                  <h2>Shift {selectedShift} Production</h2>
                  <span className="shift-badge">
                    {shifts.find(s => s.shift_code === selectedShift)?.shift_name}
                  </span>
                </div>
                
                {/* OVERALL SUMMARY - INLINE */}
                {machinesForCurrentShift.length > 0 && (
                  <div className="inline-summary">
                    <div className="summary-row">
                      <div className="summary-col">
                        <div className="summary-card-inline">
                          <div className="summary-icon">
                            <FiTrendingUp />
                          </div>
                          <div className="summary-content">
                            <span className="summary-label">Total Target</span>
                            <span className="summary-value">{totalTarget.toFixed(2)} Kg</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="summary-col">
                        <div className="summary-card-inline">
                          <div className="summary-icon">
                            <FiPackage />
                          </div>
                          <div className="summary-content">
                            <span className="summary-label">Total Weight</span>
                            <span className="summary-value">{sectionTotal.toFixed(2)} Kg</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="summary-col">
                        <div className="summary-card-inline">
                          <div className="summary-icon">
                            <FiTrendingUp />
                          </div>
                          <div className="summary-content">
                            <span className="summary-label">Total Efficiency</span>
                            <div className="efficiency-display-inline">
                              <span 
                                className="efficiency-value-inline"
                                style={{ color: getEfficiencyColor(totalEfficiency) }}
                              >
                                {totalEfficiency}%
                              </span>
                              {(() => {
                                const status = getEfficiencyStatus(totalEfficiency);
                                return (
                                  <div className="efficiency-status-inline">
                                    {status.icon && (
                                      <span className="efficiency-icon-inline" style={{ color: status.color }}>
                                        {status.icon}
                                      </span>
                                    )}
                                    <span className="efficiency-text-inline" style={{ color: status.color }}>
                                      {status.text}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTION ENTRY */}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="production-entry">
                {machinesForCurrentShift.map((machineNo, index) => {
                  const data = machineData[machineNo] || {};
                  const target = getTargetForMachine(machineNo, selectedShift);
                  const totalWeight = calculateMachineTotal(machineNo);
                  const machineEfficiency = calculateMachineEfficiency(machineNo);
                  
                  return (
                    <div 
                      key={machineNo} 
                      className={`machine-card ${index === activeMachineIndex ? 'active' : ''}`}
                      style={{ display: index === activeMachineIndex ? 'block' : 'none' }}
                    >
                      
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
                          <div className="machine-stats-row">
                            <div className="machine-stat">
                              <span className="stat-label">Total Weight:</span>
                              <strong>{totalWeight.toFixed(2)} Kg</strong>
                            </div>
                            <div className="machine-stat">
                              <span className="stat-label">Machine Efficiency:</span>
                              <div 
                                className="efficiency-badge"
                                style={{ 
                                  backgroundColor: getEfficiencyColor(machineEfficiency) + '20', 
                                  color: getEfficiencyColor(machineEfficiency),
                                  borderColor: getEfficiencyColor(machineEfficiency) + '40'
                                }}
                                title={`Machine Efficiency: ${machineEfficiency}%`}
                              >
                                {machineEfficiency}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ITEMS TABLE */}
                      <div className="items-table-wrapper">
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>Item Details</th>
                              <th>Raw Material</th>
                              <th>Production</th>
                              <th>Weight</th>
                              <th>Efficiency</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.items?.map((item, itemIndex) => (
                              <tr key={item.id}>
                                <td>
                                  <div className="item-select-wrapper">
                                    <select
                                      value={item.item_code}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'item_code', e.target.value)}
                                      className={`form-select ${validationErrors[`item_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
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
                                      <div className="item-details">
                                        <div className="item-name">
                                          <FiPackage /> {item.item_name || items.find(i => i.item_code === item.item_code)?.item_name || 'Unknown'}
                                        </div>
                                        {item.finishedproductname && (
                                          <div className="item-sub">
                                            Finished: {item.finishedproductname}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                
                                <td>
                                  <div className="raw-material-fields">
                                    <input
                                      type="text"
                                      value={item.raw_material_flatsize || ''}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'raw_material_flatsize', e.target.value)}
                                      className={`form-input small ${validationErrors[`flat_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      placeholder="Flat Size"
                                      title="Raw material flat size"
                                    />
                                    <input
                                      type="text"
                                      value={item.material_type || ''}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'material_type', e.target.value)}
                                      className={`form-input small ${validationErrors[`material_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      placeholder="Material Type"
                                      title="Material type"
                                    />
                                    {item.wire_size && (
                                      <input
                                        type="text"
                                        value={item.wire_size || ''}
                                        onChange={(e) => handleItemChange(machineNo, item.id, 'wire_size', e.target.value)}
                                        className="form-input small"
                                        placeholder="Wire Size"
                                        title="Wire size"
                                      />
                                    )}
                                  </div>
                                  {validationErrors[`flat_${machineNo}_${itemIndex}`] && (
                                    <div className="validation-error-small">
                                      <FiAlertCircle /> {validationErrors[`flat_${machineNo}_${itemIndex}`]}
                                    </div>
                                  )}
                                  {validationErrors[`material_${machineNo}_${itemIndex}`] && (
                                    <div className="validation-error-small">
                                      <FiAlertCircle /> {validationErrors[`material_${machineNo}_${itemIndex}`]}
                                    </div>
                                  )}
                                </td>
                                
                                <td>
                                  <div className="production-fields">
                                    <input
                                      type="number"
                                      value={item.production_quantity}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'production_quantity', e.target.value)}
                                      step="0.01"
                                      min="0"
                                      className={`form-input small ${validationErrors[`qty_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      placeholder="Qty"
                                      title="Production quantity"
                                    />
                                    <input
                                      type="number"
                                      value={item.per_meter_wt}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'per_meter_wt', e.target.value)}
                                      step="0.001"
                                      min="0"
                                      className={`form-input small ${validationErrors[`weight_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      placeholder="Per M Wt"
                                      title="Per meter weight"
                                    />
                                    <div className="calculated-weight">
                                      <span className="weight-label">Weight:</span>
                                      <span className="weight-value">{item.weight || '0.00'} Kg</span>
                                    </div>
                                  </div>
                                </td>
                                
                                <td>
                                  <div className="weight-display">
                                    <div className="weight-value-display">
                                      {item.weight || '0.00'} Kg
                                    </div>
                                    <div className="weight-unit">
                                      Total Weight
                                    </div>
                                  </div>
                                </td>
                                
                                <td>
                                  <div 
                                    className="efficiency-badge"
                                    style={{ 
                                      backgroundColor: getEfficiencyColor(item.efficiency) + '20', 
                                      color: getEfficiencyColor(item.efficiency),
                                      borderColor: getEfficiencyColor(item.efficiency) + '40'
                                    }}
                                    title={`Item Efficiency: ${item.efficiency}% (Based on machine target)`}
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
                        <div className="footer-grid">
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
                            <label className="form-label">
                              <FiUser /> User Name
                            </label>
                            <input
                              type="text"
                              value={data.users_name || ''}
                              onChange={(e) => setMachineData(prev => ({
                                ...prev,
                                [machineNo]: { ...prev[machineNo], users_name: e.target.value }
                              }))}
                              className="form-input"
                              placeholder="Enter user name"
                              title="Enter user name"
                            />
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
                    </div>
                  );
                })}
              </div>
            )}

            {/* EMPTY STATE - NO SHIFT SELECTED */}
            {!selectedShift && (
              <div className="empty-state centered">
                <div className="empty-icon">
                  <FiClock size={64} />
                </div>
                <h3>Select a Shift to Begin</h3>
                <p>Choose a shift from the sidebar to start entering production data</p>
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

            {/* NO MACHINES STATE */}
            {selectedShift && machinesForCurrentShift.length === 0 && (
              <div className="empty-state centered">
                <div className="empty-icon">
                  <FiCpu size={64} />
                </div>
                <h3>No Machines Found</h3>
                <p>No machines are available for the selected shift ({selectedShift})</p>
                <button
                  type="button"
                  onClick={() => setSelectedShift('')}
                  className="btn btn-outline"
                >
                  <FiRefreshCw /> Change Shift
                </button>
              </div>
            )}

            {/* SUBMIT BUTTONS */}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="form-actions enhanced-actions">
                <div className="action-left">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(`spiral_draft_${selectedShift}`);
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
                    type="button"
                    onClick={() => {
                      const dataStr = JSON.stringify(machineData, null, 2);
                      navigator.clipboard.writeText(dataStr);
                      setSuccess('Data copied to clipboard');
                      setTimeout(() => setSuccess(''), 2000);
                    }}
                    className="btn btn-outline"
                    title="Copy data to clipboard"
                  >
                    <FiDownload /> Copy Data
                  </button>
                </div>
                
                <div className="action-right">
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="btn btn-primary save-btn"
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
                        <FiSave /> Save All Data ({totalItems} Items)
                      </>
                    )}
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

export default SpiralSmartForm;