// ========================================================
// FILE: SpiralSmartForm.jsx
// PURPOSE: Smart Production Entry - Navy Blue Theme + All Fixes
// VERSION: 5.0 - Navy Blue Theme, No Gaps, Auto User
// ========================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiClock, FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiRefreshCw, FiArrowLeft,
  FiCpu, FiPackage, FiEdit3, FiChevronRight,
  FiChevronLeft, FiArrowUp, FiArrowDown,
  FiTarget, FiBarChart2, FiXCircle, FiActivity
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
  const [currentUser, setCurrentUser] = useState('');

  // ==================== GET CURRENT USER ====================
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user.email.split('@')[0]);
        }
      } catch (err) {
        console.error('User fetch error:', err);
      }
    };

    getUser();
  }, []);

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
      uom: target.uom || target.unit || 'Meter',
      rawData: target
    }));
  }, [targets]);

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const targetsRes = await supabase
          .from('targets')
          .select('*')
          .eq('section_name', CURRENT_SECTION);

        if (targetsRes.error) throw targetsRes.error;
        const targetsData = targetsRes.data || [];

        const uniqueShiftCodes = [...new Set(targetsData.map(t => t.shift_code))];
        
        const shiftsRes = await supabase
          .from('shifts')
          .select('*')
          .in('shift_code', uniqueShiftCodes)
          .order('shift_code');

        const itemsRes = await supabase
          .from('spiralitem')
          .select('*')
          .order('item_code');

        if (shiftsRes.error) throw shiftsRes.error;
        if (itemsRes.error) throw itemsRes.error;

        const shiftsData = shiftsRes.data || [];
        const itemsData = itemsRes.data || [];

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

    if (!localStorage.getItem(`spiral_draft_${shiftCode}`)) {
      machinesForThisShift.forEach(machine => {
        const target = getTargetForMachine(machine.machine_no, shiftCode);
        
        initialMachineData[machine.machine_no] = {
          machine_id: target?.rawData?.machine_id || machine.machine_id || '',
          machine_no: machine.machine_no,
          targets_id: target?.id || target?.rawData?.targets_id || '',
          target_qty: target?.target_qty || 0,
          unit: target?.uom || 'Meter',
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
          users_name: currentUser,
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

          if ((field === 'production_quantity' || field === 'per_meter_wt') && 
              (newItem.production_quantity && newItem.per_meter_wt)) {
            const qty = parseFloat(newItem.production_quantity) || 0;
            const perMeterWt = parseFloat(newItem.per_meter_wt) || 0;
            newItem.weight = (qty * perMeterWt).toFixed(2);
          }

          if (field === 'production_quantity') {
            const productionQty = parseFloat(newItem.production_quantity) || 0;
            const targetQty = machine.target_qty || 0;
            const efficiency = targetQty > 0 ? (productionQty / targetQty) * 100 : 0;
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

  // ==================== CLEAR MACHINE DATA ====================
  const clearMachineData = (machineNo) => {
    setMachineData(prev => {
      const updated = { ...prev };
      const machine = updated[machineNo];
      
      if (!machine) return prev;

      updated[machineNo] = {
        ...machine,
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
        users_name: currentUser,
        remarks: ''
      };
      
      return updated;
    });
    
    setSuccess(`Machine ${machineNo} data cleared`);
    setTimeout(() => setSuccess(''), 3000);
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

  const calculateMachineProductionTotal = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || !machine.items) return 0;

    return machine.items.reduce((total, item) => {
      return total + (parseFloat(item.production_quantity) || 0);
    }, 0);
  }, [machineData]);

  const calculateMachineEfficiency = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || machine.target_qty === 0) return 0;

    const totalProduction = calculateMachineProductionTotal(machineNo);
    const machineEfficiency = (totalProduction / machine.target_qty) * 100;
    return parseFloat(machineEfficiency.toFixed(1));
  }, [machineData, calculateMachineProductionTotal]);

  const sectionTotal = useMemo(() => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      return total + calculateMachineTotal(machineNo);
    }, 0);
  }, [machineData, calculateMachineTotal]);

  const sectionProductionTotal = useMemo(() => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      return total + calculateMachineProductionTotal(machineNo);
    }, 0);
  }, [machineData, calculateMachineProductionTotal]);

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

  const totalEfficiency = useMemo(() => {
    if (totalTarget === 0) return 0;
    
    const totalProduction = sectionProductionTotal;
    const totalEfficiencyValue = (totalProduction / totalTarget) * 100;
    return parseFloat(totalEfficiencyValue.toFixed(1));
  }, [sectionProductionTotal, totalTarget]);

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

  // ==================== FORMAT NUMBER WITH COMMAS ====================
  const formatNumber = (num) => {
    const number = parseFloat(num) || 0;
    
    if (Number.isInteger(number)) {
      return number.toLocaleString('en-US');
    }
    
    const rounded = Math.round(number * 100) / 100;
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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

            const productionQty = parseFloat(item.production_quantity) || 0;
            const targetQty = machine.target_qty || 0;
            const itemEfficiency = targetQty > 0 ? (productionQty / targetQty) * 100 : 0;

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
              efficiency: parseFloat(itemEfficiency.toFixed(1)),
              users_name: machine.users_name || currentUser,
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
    if (efficiency >= 100) return '#00ff88';
    if (efficiency >= 90) return '#4cc9f0';
    if (efficiency >= 80) return '#ffcc00';
    return '#ff4444';
  };

  const handleBackClick = () => {
    navigate('/production-sections/spiral');
  };

  const totalMachinesCount = useMemo(() => {
    return machines.length;
  }, [machines]);

  // ==================== GET CURRENT MACHINE INFO ====================
  const getCurrentMachineInfo = useCallback(() => {
    if (!selectedShift || machinesForCurrentShift.length === 0) return null;
    
    const machineNo = machinesForCurrentShift[activeMachineIndex];
    const target = getTargetForMachine(machineNo, selectedShift);
    
    return {
      machineNo,
      targetQty: target?.target_qty || 0,
      targetUnit: target?.uom || 'Meter'
    };
  }, [selectedShift, machinesForCurrentShift, activeMachineIndex, getTargetForMachine]);

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="modal-overlay navy-overlay">
        <div className="modal-container loading-modal navy-modal">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h3>Loading Production Form</h3>
            <p>Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER - NAVY BLUE THEME ====================
  return (
    <div className="modal-overlay navy-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) handleBackClick();
    }}>
      <div className="modal-container smart-form-modal navy-theme">
        
        {/* HEADER - NAVY BLUE */}
        <div className="modal-header navy-header">
          <div className="final-header-content">
            <h1 className="final-main-title navy-title">Spiral Production Entry</h1>
            <p className="final-subtitle navy-subtitle">
              <FiPackage /> Smart entry form for spiral section
            </p>
          </div>
          
          <div className="final-header-actions">
            {draftSaved && (
              <span className="draft-saved-badge navy-draft-badge">
                <FiSave /> Draft Saved
              </span>
            )}
            
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="machine-navigation-header navy-machine-nav">
                <button
                  type="button"
                  onClick={prevMachine}
                  disabled={activeMachineIndex === 0}
                  className="nav-btn-header navy-nav-btn"
                  title="Previous Machine"
                >
                  <FiChevronLeft />
                </button>
                
                <div className="nav-info-header navy-nav-info">
                  <span className="nav-current-header navy-nav-current">
                    <FiCpu /> Machine {machinesForCurrentShift[activeMachineIndex]}
                  </span>
                  <span className="nav-counter-header navy-nav-counter">
                    {activeMachineIndex + 1} / {machinesForCurrentShift.length}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={nextMachine}
                  disabled={activeMachineIndex === machinesForCurrentShift.length - 1}
                  className="nav-btn-header navy-nav-btn"
                  title="Next Machine"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
            
            <button 
              className="btn btn-back navy-back-btn"
              onClick={handleBackClick}
              title="Go back"
            >
              <FiArrowLeft /> {!isMobile && 'Back'}
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        {success && (
          <div className="alert alert-success navy-alert">
            <FiCheck /> {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error navy-alert">
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* FORM LAYOUT - COMPACT NAVY */}
        <div className="form-layout navy-layout">
          
          {/* SIDEBAR - NAVY SCROLLABLE */}
          <div className="form-sidebar navy-sidebar scrollable-sidebar">
            <div className="sidebar-header navy-sidebar-header">
              <FiClock />
              <h3>Select Shift</h3>
            </div>
            
            <div className="shift-options navy-shift-options">
              {shifts.map(shift => (
                <div
                  key={shift.id}
                  className={`shift-option navy-shift-option ${selectedShift === shift.shift_code ? 'active' : ''}`}
                  onClick={() => handleShiftSelect(shift.shift_code)}
                >
                  <div className="option-content navy-option-content">
                    <span className="option-code navy-option-code">Shift {shift.shift_code}</span>
                    <span className="option-name navy-option-name">
                      {shift.shift_name === 'Day Shift' ? 'Day Shift' : 'Night Shift'}
                    </span>
                    <span className="option-time navy-option-time">{shift.start_time} - {shift.end_time}</span>
                  </div>
                  <div className="option-status navy-option-status">
                    {selectedShift === shift.shift_code ? (
                      <span className="status-active">Active</span>
                    ) : (
                      <span className="status-inactive">Click to load</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* BULK OPERATIONS - NO LABELS */}
            {selectedShift && Object.keys(machineData).length > 0 && (
              <div className="bulk-operations navy-bulk-operations no-labels">
                <div className="bulk-header navy-bulk-header">
                  <FiEdit3 />
                  <h4>Bulk Operations</h4>
                </div>
                <div className="bulk-controls navy-bulk-controls">
                  <input
                    type="text"
                    placeholder="Operator Name (All Machines)"
                    onChange={(e) => handleBulkUpdate('operator_name', e.target.value)}
                    className="form-input navy-form-input navy-input"
                  />
                  <input
                    type="text"
                    value={currentUser}
                    readOnly
                    className="form-input navy-form-input navy-input readonly-input"
                    placeholder="User Name (Auto)"
                  />
                  <input
                    type="text"
                    placeholder="Remarks (All Machines)"
                    onChange={(e) => handleBulkUpdate('remarks', e.target.value)}
                    className="form-input navy-form-input navy-input"
                  />
                </div>
              </div>
            )}

            <div className="sidebar-stats navy-sidebar-stats">
              <div className="stat-item navy-stat-item">
                <span className="stat-label navy-stat-label">Total Machines</span>
                <span className="stat-value navy-stat-value">{totalMachinesCount}</span>
              </div>
              {selectedShift ? (
                <>
                  <div className="stat-item navy-stat-item">
                    <span className="stat-label navy-stat-label">Active Machines</span>
                    <span className="stat-value navy-stat-value">{machinesForCurrentShift.length}</span>
                  </div>
                  <div className="stat-item navy-stat-item">
                    <span className="stat-label navy-stat-label">Total Items</span>
                    <span className="stat-value navy-stat-value">{totalItems}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-item navy-stat-item">
                    <span className="stat-label navy-stat-label">Shifts</span>
                    <span className="stat-value navy-stat-value">{shifts.length}</span>
                  </div>
                  <div className="stat-item navy-stat-item">
                    <span className="stat-label navy-stat-label">Items</span>
                    <span className="stat-value navy-stat-value">{items.length}</span>
                  </div>
                </>
              )}
            </div>

            {selectedShift && (
              <div className="change-shift-section">
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
                  className="btn btn-secondary navy-change-shift-btn"
                  title="Change shift"
                >
                  <FiRefreshCw />
                  Change Shift
                </button>
              </div>
            )}
          </div>

          {/* MAIN CONTENT - COMPACT NAVY */}
          <div className="form-main-content navy-main-content">
            
            {selectedShift && (
              <div className="final-production-header navy-production-header">
                <div className="final-shift-title navy-shift-title">
                  <h2 className="compact-title">Shift {selectedShift} Production</h2>
                </div>
                
                {/* FOUR BOXES - NAVY STYLE */}
                <div className="final-summary-boxes navy-summary-boxes">
                  <div className="final-summary-box navy-box navy-box-target">
                    <div className="final-box-icon navy-box-icon">
                      <FiTarget />
                    </div>
                    <div className="final-box-content navy-box-content">
                      <div className="final-box-label navy-box-label">TOTAL TARGET</div>
                      <div className="final-box-value navy-box-value">
                        {formatNumber(totalTarget)} 
                        <span className="final-box-unit navy-box-unit">Meter</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="final-summary-box navy-box navy-box-production">
                    <div className="final-box-icon navy-box-icon">
                      <FiActivity />
                    </div>
                    <div className="final-box-content navy-box-content">
                      <div className="final-box-label navy-box-label">TOTAL PRODUCTION</div>
                      <div className="final-box-value navy-box-value">
                        {formatNumber(sectionProductionTotal)}
                        <span className="final-box-unit navy-box-unit">Meter</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="final-summary-box navy-box navy-box-weight">
                    <div className="final-box-icon navy-box-icon">
                      <FiPackage />
                    </div>
                    <div className="final-box-content navy-box-content">
                      <div className="final-box-label navy-box-label">TOTAL WEIGHT</div>
                      <div className="final-box-value navy-box-value">
                        {formatNumber(sectionTotal)}
                        <span className="final-box-unit navy-box-unit">Kg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="final-summary-box navy-box navy-box-efficiency">
                    <div className="final-box-icon navy-box-icon">
                      <FiBarChart2 />
                    </div>
                    <div className="final-box-content navy-box-content">
                      <div className="final-box-label navy-box-label">TOTAL EFFICIENCY</div>
                      <div className="final-box-value-row navy-box-value-row">
                        <span className="final-box-efficiency-value navy-efficiency-value" style={{ color: getEfficiencyColor(totalEfficiency) }}>
                          {formatNumber(totalEfficiency)}%
                        </span>
                        <span className="final-box-efficiency-status navy-efficiency-status" style={{ color: getEfficiencyColor(totalEfficiency) }}>
                          {totalEfficiency >= 100 ? '↑' : '↓'} {getEfficiencyStatus(totalEfficiency).text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* COMPACT MACHINE INFO - NO GAP */}
                <div className="final-machine-stats-combined navy-machine-stats">
                  <div className="final-machine-info-line navy-machine-line">
                    {getCurrentMachineInfo() && (
                      <div className="final-current-machine-info navy-machine-info">
                        <FiCpu className="final-machine-icon-small navy-machine-icon" />
                        <span className="final-machine-text-bold navy-machine-text">
                          Machine {getCurrentMachineInfo().machineNo} | Target: {formatNumber(getCurrentMachineInfo().targetQty)} {getCurrentMachineInfo().targetUnit}
                        </span>
                      </div>
                    )}
                    
                    <div className="final-machine-stats-line navy-stats-line">
                      <div className="final-machine-stat navy-stat">
                        <span className="final-stat-label navy-stat-label">TOTAL WEIGHT:</span>
                        <span className="final-stat-value navy-stat-value">
                          {formatNumber(calculateMachineTotal(machinesForCurrentShift[activeMachineIndex] || ''))} Kg
                        </span>
                      </div>
                      <div className="final-machine-stat navy-stat">
                        <span className="final-stat-label navy-stat-label">MACHINE EFFICIENCY:</span>
                        <span 
                          className="final-stat-efficiency navy-stat-efficiency" 
                          style={{ color: getEfficiencyColor(calculateMachineEfficiency(machinesForCurrentShift[activeMachineIndex] || '')) }}
                        >
                          {formatNumber(calculateMachineEfficiency(machinesForCurrentShift[activeMachineIndex] || ''))}%
                          {calculateMachineEfficiency(machinesForCurrentShift[activeMachineIndex] || '') >= 100 ? ' ↑' : ' ↓'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTION ENTRY - COMPACT */}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="production-entry navy-production-entry">
                {machinesForCurrentShift.map((machineNo, index) => {
                  const data = machineData[machineNo] || {};
                  
                  return (
                    <div 
                      key={machineNo} 
                      className={`machine-card navy-machine-card ${index === activeMachineIndex ? 'active' : ''}`}
                      style={{ display: index === activeMachineIndex ? 'block' : 'none' }}
                    >
                      
                      {/* COMPACT ITEMS TABLE */}
                      <div className="items-table-wrapper navy-table-wrapper">
                        <table className="items-table navy-items-table">
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
                                  <select
                                    value={item.item_code}
                                    onChange={(e) => handleItemChange(machineNo, item.id, 'item_code', e.target.value)}
                                    className={`form-select navy-form-select ${validationErrors[`item_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                    title="Select item"
                                  >
                                    <option value="">-- Select Item --</option>
                                    {items.map(itm => (
                                      <option key={itm.item_code} value={itm.item_code}>
                                        {itm.item_code} - {itm.item_name || 'Unnamed Item'}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                
                                <td>
                                  <div className="raw-material-fields navy-raw-material-fields">
                                    <input
                                      type="text"
                                      value={item.raw_material_flatsize || ''}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'raw_material_flatsize', e.target.value)}
                                      className={`form-input small navy-form-input ${validationErrors[`flat_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      placeholder="Flat Size"
                                      title="Raw material flat size"
                                    />
                                    <input
                                      type="text"
                                      value={item.material_type || ''}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'material_type', e.target.value)}
                                      className={`form-input small navy-form-input ${validationErrors[`material_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      placeholder="Material Type"
                                      title="Material type"
                                    />
                                  </div>
                                </td>
                                
                                <td>
                                  <div className="production-fields navy-production-fields">
                                    <input
                                      type="number"
                                      value={item.production_quantity}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'production_quantity', e.target.value)}
                                      step="0.01"
                                      min="0"
                                      className={`form-input small navy-form-input ${validationErrors[`qty_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      placeholder="Quantity"
                                      title="Production quantity"
                                    />
                                    <input
                                      type="number"
                                      value={item.per_meter_wt}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'per_meter_wt', e.target.value)}
                                      step="0.001"
                                      min="0"
                                      className={`form-input small navy-form-input ${validationErrors[`weight_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      placeholder="Per M Wt"
                                      title="Per meter weight"
                                    />
                                  </div>
                                </td>
                                
                                <td>
                                  <div className="weight-display navy-weight-display">
                                    {formatNumber(item.weight || '0')} Kg
                                  </div>
                                </td>
                                
                                <td>
                                  <div 
                                    className="efficiency-badge navy-efficiency-badge"
                                    style={{ 
                                      backgroundColor: getEfficiencyColor(item.efficiency) + '20', 
                                      color: getEfficiencyColor(item.efficiency),
                                    }}
                                  >
                                    {formatNumber(item.efficiency)}%
                                    {item.efficiency >= 100 ? ' ↑' : item.efficiency > 0 ? ' ↓' : ''}
                                  </div>
                                </td>
                                
                                {/* ACTIONS COLUMN - BUTTONS INSIDE */}
                                <td>
                                  <div className="action-buttons navy-action-buttons">
                                    {data.items.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeItem(machineNo, item.id)}
                                        className="btn-icon btn-danger navy-remove-btn"
                                        title="Remove item"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    )}
                                    
                                    {itemIndex === data.items.length - 1 && (
                                      <button
                                        type="button"
                                        onClick={() => addItem(machineNo)}
                                        className="btn btn-outline navy-add-btn-inline"
                                        title="Add new item"
                                      >
                                        <FiPlus /> Add
                                      </button>
                                    )}
                                    
                                    {itemIndex === 0 && data.items.length === 1 && (
                                      <button
                                        type="button"
                                        onClick={() => clearMachineData(machineNo)}
                                        className="btn btn-secondary navy-clear-btn-inline"
                                        title="Clear all data for this machine"
                                      >
                                        <FiXCircle /> Clear
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* OPERATOR DETAILS - NO LABELS */}
                      <div className="machine-footer navy-machine-footer no-labels">
                        <div className="footer-grid navy-footer-grid">
                          <input
                            type="text"
                            value={data.operator_name || ''}
                            onChange={(e) => setMachineData(prev => ({
                              ...prev,
                              [machineNo]: { ...prev[machineNo], operator_name: e.target.value }
                            }))}
                            className={`form-input navy-form-input navy-input ${validationErrors[`operator_${machineNo}`] ? 'error' : ''}`}
                            placeholder="Operator Name"
                          />
                          
                          <input
                            type="text"
                            value={data.users_name || currentUser}
                            readOnly
                            className="form-input navy-form-input navy-input readonly-input"
                            placeholder="User Name (Auto)"
                          />
                          
                          <input
                            type="text"
                            value={data.remarks || ''}
                            onChange={(e) => setMachineData(prev => ({
                              ...prev,
                              [machineNo]: { ...prev[machineNo], remarks: e.target.value }
                            }))}
                            className="form-input navy-form-input navy-input"
                            placeholder="Remarks"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="form-actions navy-form-actions">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="btn btn-primary navy-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="spinner-small"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave /> Save All Production Data
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpiralSmartForm;