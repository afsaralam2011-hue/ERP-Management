// ========================================================
// FILE: PVCSmartForm.jsx
// PURPOSE: Smart Production Entry for PVC Section
// VERSION: 7.0 - Fixed Mobile Save Button and Zero Quantity Validation
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
import './PVCSmartForm.css';

const PVCSmartForm = () => {
  const navigate = useNavigate();
  
  // Constants
  const CURRENT_SECTION = 'PVC';
  
  // States
  const [selectedShift, setSelectedShift] = useState('');
  const [shifts, setShifts] = useState([]);
  const [filteredShifts, setFilteredShifts] = useState([]);
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
        setCurrentUser('admin');
      }
    };

    getUser();
  }, []);

  // ==================== CHECK MOBILE ====================
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        document.body.classList.add('mobile-view');
      } else {
        document.body.classList.remove('mobile-view');
      }
    };
    
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
            timestamp: new Date().toISOString(),
            user: currentUser
          };
          localStorage.setItem(`pvc_draft_${selectedShift}`, JSON.stringify(draftData));
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
  }, [selectedShift, machineData, currentUser]);

  // ==================== LOAD DRAFT ON SHIFT SELECT ====================
  const loadDraftForShift = useCallback((shiftCode) => {
    try {
      const draft = localStorage.getItem(`pvc_draft_${shiftCode}`);
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

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('Starting data fetch...');
        
        // 1. PVC سیکشن کے ٹارگٹس لوڈ کریں
        const { data: targetsData, error: targetsError } = await supabase
          .from('targets')
          .select('*')
          .eq('section_name', CURRENT_SECTION)
          .eq('is_active', true);

        if (targetsError) throw targetsError;

        // 2. صرف ان شفٹس کو لوڈ کریں جو ٹارگٹس میں موجود ہیں
        const shiftCodes = [...new Set(targetsData.map(target => target.shift_code))];
        
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .in('shift_code', shiftCodes)
          .order('shift_code');

        if (shiftsError) throw shiftsError;

        // 3. PVC آئٹمز لوڈ کریں
        const { data: itemsData, error: itemsError } = await supabase
          .from('pvcitem')
          .select('*')
          .order('item_code');

        if (itemsError) throw itemsError;

        console.log('Data loaded:', {
          targets: targetsData?.length || 0,
          shifts: shiftsData?.length || 0,
          shiftCodes: shiftCodes,
          items: itemsData?.length || 0
        });

        // 4. ٹارگٹس سے مشینز کی فہرست بنائیں
        const machineSet = new Set();
        const uniqueMachines = [];

        if (targetsData && targetsData.length > 0) {
          targetsData.forEach(target => {
            const machineNo = target.machine_no;
            if (machineNo && !machineSet.has(machineNo)) {
              machineSet.add(machineNo);
              uniqueMachines.push({
                machine_no: machineNo,
                machine_id: target.machine_id,
                section_name: target.section_name
              });
            }
          });

          // مشینز کو نمبر کے لحاظ سے ترتیب دیں
          uniqueMachines.sort((a, b) => {
            const numA = parseInt(a.machine_no.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.machine_no.replace(/\D/g, '')) || 0;
            return numA - numB;
          });
        }

        setShifts(shiftsData || []);
        setFilteredShifts(shiftsData || []);
        setTargets(targetsData || []);
        setMachines(uniqueMachines);
        setItems(itemsData || []);

        console.log('Filtered shifts from targets:', shiftCodes);
        console.log('Machines found:', uniqueMachines);

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

    return targets.find(target => {
      return target.machine_no === machineNo && 
             target.shift_code === shiftCode &&
             target.section_name === CURRENT_SECTION;
    });
  }, [targets]);

  // ==================== GET MACHINES FOR SHIFT ====================
  const getMachinesForShift = useCallback((shiftCode) => {
    if (!shiftCode) return [];
    
    const machineSet = new Set();
    const machinesForShift = [];
    
    targets.forEach(target => {
      if (target.shift_code === shiftCode && 
          target.section_name === CURRENT_SECTION &&
          target.machine_no) {
        
        if (!machineSet.has(target.machine_no)) {
          machineSet.add(target.machine_no);
          machinesForShift.push({
            machine_no: target.machine_no,
            machine_id: target.machine_id,
            target: target
          });
        }
      }
    });

    // مشینز کو نمبر کے لحاظ سے ترتیب دیں
    machinesForShift.sort((a, b) => {
      const numA = parseInt(a.machine_no.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.machine_no.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    return machinesForShift;
  }, [targets]);

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

    // Load draft if exists
    loadDraftForShift(shiftCode);

    const selectedShiftData = shifts.find(s => s.shift_code === shiftCode);
    
    // If no draft exists, initialize machine data
    if (!localStorage.getItem(`pvc_draft_${shiftCode}`)) {
      const initialMachineData = {};
      const machinesForThisShift = getMachinesForShift(shiftCode);

      console.log(`Machines for shift ${shiftCode}:`, machinesForThisShift);

      machinesForThisShift.forEach(machine => {
        const target = machine.target;
        
        initialMachineData[machine.machine_no] = {
          machine_id: target.machine_id || '',
          machine_no: machine.machine_no,
          targets_id: target.targets_id || '',
          target_qty: parseFloat(target.target_qty) || 0,
          unit: target.uom || 'Meter',
          shift_code: shiftCode,
          shift_name: selectedShiftData?.shift_name || shiftCode,
          items: [{ 
            id: Date.now(), 
            item_code: '', 
            item_name: '', 
            raw_material_Spiralsize: '',
            material_type: '',
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
              newItem.raw_material_Spiralsize = selectedItem.raw_material_Spiralsize || '';
              newItem.material_type = selectedItem.material_type || '';
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
          raw_material_Spiralsize: '',
          material_type: '',
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
            raw_material_Spiralsize: '',
            material_type: '',
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

  // ==================== SECTION TOTALS ====================
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
    
    return targets
      .filter(target => 
        target.shift_code === selectedShift &&
        target.section_name === CURRENT_SECTION
      )
      .reduce((total, target) => {
        return total + (parseFloat(target.target_qty) || 0);
      }, 0);
  }, [selectedShift, targets]);

  const totalEfficiency = useMemo(() => {
    if (totalTarget === 0) return 0;
    
    const totalProduction = sectionProductionTotal;
    const totalEfficiencyValue = (totalProduction / totalTarget) * 100;
    return parseFloat(totalEfficiencyValue.toFixed(1));
  }, [sectionProductionTotal, totalTarget]);

  // ==================== GET EFFICIENCY STATUS ====================
  const getEfficiencyStatus = (efficiency) => {
    if (efficiency >= 70) {
      return {
        text: efficiency >= 100 ? 'Excellent' : 'Good',
        color: efficiency >= 100 ? '#00ff88' : '#4cc9f0',
        icon: <FiArrowUp />,
        direction: 'up'
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

  // ==================== FORMAT EFFICIENCY DISPLAY ====================
  const getEfficiencyDisplay = (efficiency) => {
    const status = getEfficiencyStatus(efficiency);
    return {
      value: efficiency,
      color: status.color,
      icon: status.icon,
      text: status.text
    };
  };

  // ==================== MACHINES FOR CURRENT SHIFT ====================
  const machinesForCurrentShift = useMemo(() => {
    if (!selectedShift) return [];
    
    const machineSet = new Set();
    const machinesList = [];
    
    targets.forEach(target => {
      if (target.shift_code === selectedShift && 
          target.section_name === CURRENT_SECTION &&
          target.machine_no && 
          !machineSet.has(target.machine_no)) {
        
        machineSet.add(target.machine_no);
        machinesList.push(target.machine_no);
      }
    });

    // مشینز کو نمبر کے لحاظ سے ترتیب دیں
    machinesList.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    return machinesList;
  }, [selectedShift, targets]);

  // ==================== MACHINE NAVIGATION ====================
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

      // Operator name is always required
      if (!machine.operator_name?.trim()) {
        errors[`operator_${machineNo}`] = 'Operator name is required';
      }

      machine.items.forEach((item, index) => {
        // Item selection is required
        if (!item.item_code) {
          errors[`item_${machineNo}_${index}`] = 'Item selection is required';
        }

        // Spiral size and material type are required
        if (!item.raw_material_Spiralsize?.trim()) {
          errors[`spiral_${machineNo}_${index}`] = 'Spiral size is required';
        }
        if (!item.material_type?.trim()) {
          errors[`material_${machineNo}_${index}`] = 'Material type is required';
        }

        // Check if production quantity is zero or empty
        const productionQty = parseFloat(item.production_quantity) || 0;
        const perMeterWt = parseFloat(item.per_meter_wt) || 0;

        // If production quantity is zero or empty, remarks become required
        if (productionQty === 0 && !item.production_quantity?.trim()) {
          if (!machine.remarks?.trim()) {
            errors[`remarks_${machineNo}`] = 'Remarks are required when production is zero (e.g., "Machine down", "No production")';
          }
        }

        // If production quantity has value, per meter weight is required
        if (productionQty > 0 && (!perMeterWt || perMeterWt <= 0)) {
          errors[`weight_${machineNo}_${index}`] = 'Per meter weight is required when production quantity is entered';
        }

        // If per meter weight has value, production quantity is required
        if (perMeterWt > 0 && (!productionQty || productionQty <= 0)) {
          errors[`qty_${machineNo}_${index}`] = 'Production quantity is required when per meter weight is entered';
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
          if (item.item_code) {  // Only save if item is selected
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
              raw_material_Spiralsize: item.raw_material_Spiralsize || '',
              material_type: item.material_type || '',
              finishedproductname: item.finishedproductname || '',
              operator_name: machine.operator_name.trim(),
              production_quantity: productionQty,
              per_meter_wt: parseFloat(item.per_meter_wt) || 0,
              weight: parseFloat(item.weight) || 0,
              unit: item.unit || 'Kg',
              efficiency: parseFloat(itemEfficiency.toFixed(1)),
              users_name: machine.users_name || currentUser,
              shift_code: machine.shift_code,
              shift_name: machine.shift_name,
              target_qty: machine.target_qty || 0,
              remarks: machine.remarks || (productionQty === 0 ? 'Zero Production' : ''),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              targets_id: machine.targets_id || ''
            });
          }
        });
      });

      if (allRecords.length === 0) {
        throw new Error('No valid records to save');
      }

      const { error: insertError } = await supabase
        .from('pvcsection')
        .insert(allRecords);

      if (insertError) {
        console.error('Database error:', insertError);
        throw insertError;
      }

      localStorage.removeItem(`pvc_draft_${selectedShift}`);
      
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
  const handleBackClick = () => {
    navigate('/production-sections/pvc-coating');
  };

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

  // ==================== SHIFT NAME DISPLAY ====================
  const getShiftDisplayName = (shiftCode) => {
    const shift = shifts.find(s => s.shift_code === shiftCode);
    if (!shift) return `Shift ${shiftCode}`;
    
    return shift.shift_name === 'Day Shift' ? 'Day Shift' : 
           shift.shift_name === 'Night Shift' ? 'Night Shift' : 
           `Shift ${shiftCode}`;
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="modal-overlay navy-overlay">
        <div className="modal-container loading-modal navy-modal">
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h3>Loading PVC Production Form</h3>
            <p>Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="modal-overlay navy-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) handleBackClick();
    }}>
      <div className="modal-container smart-form-modal navy-theme">
        
        {/* HEADER */}
        <div className="modal-header navy-header">
          <div className="header-content-compact">
            <button 
              className="btn btn-back navy-back-btn"
              onClick={handleBackClick}
              title="Go back"
            >
              <FiArrowLeft />
              {!isMobile && 'Back'}
            </button>
            <div className="header-titles">
              <h1 className="main-title-compact navy-title">PVC Production</h1>
              <p className="subtitle-compact navy-subtitle">
                <FiPackage /> PVC Section Entry
              </p>
            </div>
          </div>
          
          <div className="header-actions-compact">
            {draftSaved && (
              <span className="draft-saved-badge navy-draft-badge">
                <FiSave /> Draft Saved
              </span>
            )}
            
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="machine-nav-compact navy-machine-nav">
                <button
                  type="button"
                  onClick={prevMachine}
                  disabled={activeMachineIndex === 0}
                  className="nav-btn-compact navy-nav-btn"
                  title="Previous Machine"
                >
                  <FiChevronLeft />
                </button>
                
                <div className="nav-info-compact navy-nav-info">
                  <span className="nav-current-compact navy-nav-current">
                    <FiCpu /> Machine {machinesForCurrentShift[activeMachineIndex]}
                  </span>
                  <span className="nav-counter-compact navy-nav-counter">
                    {activeMachineIndex + 1} / {machinesForCurrentShift.length}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={nextMachine}
                  disabled={activeMachineIndex === machinesForCurrentShift.length - 1}
                  className="nav-btn-compact navy-nav-btn"
                  title="Next Machine"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
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

        {/* FORM LAYOUT */}
        <div className="form-layout-compact navy-layout">
          
          {/* SIDEBAR - SIMPLE SHIFT SELECTION */}
          <div className="sidebar-compact navy-sidebar">
            <div className="shift-selection-compact navy-shift-selection">
              <div className="shift-header-compact navy-shift-header">
                <FiClock />
                <h3>Select Shift</h3>
              </div>
              
              <div className="shift-options-scroll navy-shift-options-scroll">
                {filteredShifts.map(shift => (
                  <button
                    key={shift.id}
                    type="button"
                    className={`shift-option-btn navy-shift-btn ${selectedShift === shift.shift_code ? 'active' : ''}`}
                    onClick={() => handleShiftSelect(shift.shift_code)}
                  >
                    <div className="shift-btn-content">
                      <span className="shift-code-btn navy-shift-code">
                        Shift {shift.shift_code}
                      </span>
                      <span className="shift-time-btn navy-shift-time">
                        {shift.start_time} - {shift.end_time}
                      </span>
                    </div>
                    {selectedShift === shift.shift_code && (
                      <div className="shift-active-indicator navy-active-indicator">
                        <div className="active-dot"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* BULK OPERATIONS - ONLY WHEN SHIFT SELECTED */}
            {selectedShift && Object.keys(machineData).length > 0 && (
              <div className="bulk-operations-compact navy-bulk-operations">
                <div className="bulk-header-compact navy-bulk-header">
                  <FiEdit3 />
                  <h4>Bulk Operations</h4>
                </div>
                <div className="bulk-controls-compact navy-bulk-controls">
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
                </div>
              </div>
            )}

            {/* STATS */}
            <div className="stats-compact navy-stats">
              <div className="stat-row-compact navy-stat-row">
                <div className="stat-item-compact navy-stat-item">
                  <span className="stat-label-compact navy-stat-label">Total Machines</span>
                  <span className="stat-value-compact navy-stat-value">{machines.length}</span>
                </div>
                <div className="stat-item-compact navy-stat-item">
                  <span className="stat-label-compact navy-stat-label">Active Machines</span>
                  <span className="stat-value-compact navy-stat-value">{machinesForCurrentShift.length}</span>
                </div>
              </div>
              <div className="stat-row-compact navy-stat-row">
                <div className="stat-item-compact navy-stat-item">
                  <span className="stat-label-compact navy-stat-label">Total Items</span>
                  <span className="stat-value-compact navy-stat-value">{items.length}</span>
                </div>
                <div className="stat-item-compact navy-stat-item">
                  <span className="stat-label-compact navy-stat-label">Current Items</span>
                  <span className="stat-value-compact navy-stat-value">{totalItems}</span>
                </div>
              </div>
            </div>

            {selectedShift && (
              <div className="action-buttons-compact navy-action-buttons">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem(`pvc_draft_${selectedShift}`);
                    setSelectedShift('');
                    setMachineData({});
                    setValidationErrors({});
                    setError('');
                    setSuccess('');
                  }}
                  className="btn btn-secondary navy-change-btn"
                  title="Change shift"
                >
                  <FiRefreshCw /> Change Shift
                </button>
              </div>
            )}
          </div>

          {/* MAIN CONTENT */}
          <div className="main-content-compact navy-main-content">
            
            {selectedShift && (
              <div className="production-header-compact navy-production-header">
                <div className="shift-title-compact navy-shift-title">
                  <h2 className="title-compact">
                    {getShiftDisplayName(selectedShift)} Production
                  </h2>
                </div>
                
                {/* SUMMARY BOXES */}
                <div className="summary-boxes-compact navy-summary-boxes">
                  <div className="summary-box-compact navy-box navy-box-target">
                    <div className="box-icon-compact navy-box-icon">
                      <FiTarget />
                    </div>
                    <div className="box-content-compact navy-box-content">
                      <div className="box-label-compact navy-box-label">TOTAL TARGET</div>
                      <div className="box-value-compact navy-box-value">
                        {formatNumber(totalTarget)} 
                        <span className="box-unit-compact navy-box-unit">Meter</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="summary-box-compact navy-box navy-box-production">
                    <div className="box-icon-compact navy-box-icon">
                      <FiActivity />
                    </div>
                    <div className="box-content-compact navy-box-content">
                      <div className="box-label-compact navy-box-label">TOTAL PRODUCTION</div>
                      <div className="box-value-compact navy-box-value">
                        {formatNumber(sectionProductionTotal)}
                        <span className="box-unit-compact navy-box-unit">Meter</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="summary-box-compact navy-box navy-box-weight">
                    <div className="box-icon-compact navy-box-icon">
                      <FiPackage />
                    </div>
                    <div className="box-content-compact navy-box-content">
                      <div className="box-label-compact navy-box-label">TOTAL WEIGHT</div>
                      <div className="box-value-compact navy-box-value">
                        {formatNumber(sectionTotal)}
                        <span className="box-unit-compact navy-box-unit">Kg</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="summary-box-compact navy-box navy-box-efficiency">
                    <div className="box-icon-compact navy-box-icon">
                      <FiBarChart2 />
                    </div>
                    <div className="box-content-compact navy-box-content">
                      <div className="box-label-compact navy-box-label">TOTAL EFFICIENCY</div>
                      <div className="box-value-row-compact navy-box-value-row">
                        <span 
                          className="box-efficiency-value-compact navy-efficiency-value" 
                          style={{ color: getEfficiencyStatus(totalEfficiency).color }}
                        >
                          {formatNumber(totalEfficiency)}%
                        </span>
                        <div className="efficiency-indicator">
                          <span className="efficiency-arrow">
                            {getEfficiencyStatus(totalEfficiency).icon}
                          </span>
                          <span 
                            className="box-efficiency-status-compact navy-efficiency-status" 
                            style={{ color: getEfficiencyStatus(totalEfficiency).color }}
                          >
                            {getEfficiencyStatus(totalEfficiency).text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* MACHINE INFO - SINGLE LINE */}
                {machinesForCurrentShift.length > 0 && getCurrentMachineInfo() && (
                  <div className="machine-info-single-line navy-machine-info-single">
                    <div className="machine-info-grid">
                      <div className="machine-info-item">
                        <div className="info-label">Machine No.</div>
                        <div className="info-value">
                          <FiCpu /> {machinesForCurrentShift[activeMachineIndex]}
                        </div>
                      </div>
                      <div className="machine-info-item">
                        <div className="info-label">Target</div>
                        <div className="info-value">
                          {formatNumber(getCurrentMachineInfo().targetQty)} {getCurrentMachineInfo().targetUnit}
                        </div>
                      </div>
                      <div className="machine-info-item">
                        <div className="info-label">Weight</div>
                        <div className="info-value">
                          {formatNumber(calculateMachineTotal(machinesForCurrentShift[activeMachineIndex] || ''))} Kg
                        </div>
                      </div>
                      <div className="machine-info-item">
                        <div className="info-label">Efficiency</div>
                        <div 
                          className="info-value efficiency-display"
                          style={{ color: getEfficiencyStatus(calculateMachineEfficiency(machinesForCurrentShift[activeMachineIndex] || '')).color }}
                        >
                          {formatNumber(calculateMachineEfficiency(machinesForCurrentShift[activeMachineIndex] || ''))}%
                          <span className="efficiency-arrow">
                            {getEfficiencyStatus(calculateMachineEfficiency(machinesForCurrentShift[activeMachineIndex] || '')).icon}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PRODUCTION ENTRY */}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="production-entry-compact navy-production-entry">
                {machinesForCurrentShift.map((machineNo, index) => {
                  const data = machineData[machineNo] || {};
                  
                  return (
                    <div 
                      key={machineNo} 
                      className={`machine-card-compact navy-machine-card ${index === activeMachineIndex ? 'active' : ''}`}
                      style={{ display: index === activeMachineIndex ? 'block' : 'none' }}
                    >
                      
                      {/* ITEMS TABLE */}
                      <div className="table-wrapper-compact navy-table-wrapper">
                        <table className="table-compact navy-table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Material</th>
                              <th>Production</th>
                              <th>Weight</th>
                              <th>Eff%</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.items?.map((item, itemIndex) => {
                              const efficiencyDisplay = getEfficiencyDisplay(item.efficiency);
                              
                              return (
                                <tr key={item.id}>
                                  <td>
                                    <select
                                      value={item.item_code}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'item_code', e.target.value)}
                                      className={`form-select navy-form-select ${validationErrors[`item_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      title="Select item"
                                    >
                                      <option value="">Select Item</option>
                                      {items.map(itm => (
                                        <option key={itm.item_code} value={itm.item_code}>
                                          {itm.item_code} - {itm.item_name || 'Item'}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  
                                  <td>
                                    <div className="material-fields-compact navy-material-fields">
                                      <input
                                        type="text"
                                        value={item.raw_material_Spiralsize || ''}
                                        onChange={(e) => handleItemChange(machineNo, item.id, 'raw_material_Spiralsize', e.target.value)}
                                        className={`form-input small navy-form-input ${validationErrors[`spiral_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                        placeholder="Spiral Size"
                                      />
                                      <input
                                        type="text"
                                        value={item.material_type || ''}
                                        onChange={(e) => handleItemChange(machineNo, item.id, 'material_type', e.target.value)}
                                        className={`form-input small navy-form-input ${validationErrors[`material_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                        placeholder="Material Type"
                                      />
                                    </div>
                                  </td>
                                  
                                  <td>
                                    <div className="production-fields-compact navy-production-fields">
                                      <input
                                        type="number"
                                        value={item.production_quantity}
                                        onChange={(e) => handleItemChange(machineNo, item.id, 'production_quantity', e.target.value)}
                                        step="0.01"
                                        min="0"
                                        className={`form-input small navy-form-input ${validationErrors[`qty_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                        placeholder="Qty (Optional)"
                                        title="Production quantity (can be zero)"
                                      />
                                      <input
                                        type="number"
                                        value={item.per_meter_wt}
                                        onChange={(e) => handleItemChange(machineNo, item.id, 'per_meter_wt', e.target.value)}
                                        step="0.001"
                                        min="0"
                                        className={`form-input small navy-form-input ${validationErrors[`weight_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                        placeholder="Per M"
                                      />
                                    </div>
                                  </td>
                                  
                                  <td>
                                    <div className="weight-display-compact navy-weight-display">
                                      {formatNumber(item.weight || '0')} Kg
                                    </div>
                                  </td>
                                  
                                  <td>
                                    <div 
                                      className="efficiency-badge-compact navy-efficiency-badge"
                                      style={{ 
                                        backgroundColor: efficiencyDisplay.color + '20', 
                                        color: efficiencyDisplay.color,
                                      }}
                                    >
                                      {formatNumber(item.efficiency)}%
                                      <span className="badge-arrow">
                                        {efficiencyDisplay.icon}
                                      </span>
                                    </div>
                                  </td>
                                  
                                  <td>
                                    <div className="actions-compact navy-actions">
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
                                          className="btn btn-outline navy-add-btn"
                                          title="Add item"
                                        >
                                          <FiPlus />
                                        </button>
                                      )}
                                      
                                      {itemIndex === 0 && data.items.length === 1 && (
                                        <button
                                          type="button"
                                          onClick={() => clearMachineData(machineNo)}
                                          className="btn btn-secondary navy-clear-btn"
                                          title="Clear data"
                                        >
                                          <FiXCircle />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* OPERATOR DETAILS WITH ACTION BUTTONS */}
                      <div className="machine-footer-with-actions navy-machine-footer-actions">
                        <div className="footer-grid-with-actions">
                          <div className="input-group">
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
                            {validationErrors[`operator_${machineNo}`] && (
                              <div className="error-message">{validationErrors[`operator_${machineNo}`]}</div>
                            )}
                          </div>
                          
                          <div className="input-group">
                            <input
                              type="text"
                              value={data.users_name || currentUser}
                              readOnly
                              className="form-input navy-form-input navy-input readonly-input"
                              placeholder="User Name"
                            />
                          </div>
                          
                          <div className="input-group">
                            <input
                              type="text"
                              value={data.remarks || ''}
                              onChange={(e) => setMachineData(prev => ({
                                ...prev,
                                [machineNo]: { ...prev[machineNo], remarks: e.target.value }
                              }))}
                              className={`form-input navy-form-input navy-input ${validationErrors[`remarks_${machineNo}`] ? 'error' : ''}`}
                              placeholder="Remarks (Required if production is zero)"
                              title="Enter reason if production is zero (e.g., Machine down, Maintenance, etc.)"
                            />
                            {validationErrors[`remarks_${machineNo}`] && (
                              <div className="error-message">{validationErrors[`remarks_${machineNo}`]}</div>
                            )}
                          </div>
                          
                          {/* ACTION BUTTONS */}
                          <div className="action-buttons-inline">
                            <button
                              type="button"
                              onClick={() => clearMachineData(machineNo)}
                              className="btn btn-secondary navy-clear-btn-inline"
                              title="Clear all data for this machine"
                            >
                              <FiXCircle /> Clear
                            </button>
                            
                            <button
                              type="button"
                              onClick={handleSubmit}
                              className="btn btn-primary navy-save-btn-inline"
                              disabled={saving}
                              title="Save current machine data"
                            >
                              {saving ? (
                                <>
                                  <div className="spinner-small"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <FiSave /> Save
                                </>
                              )}
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date();
                                const timeString = now.toLocaleTimeString('en-US', {
                                  hour12: false,
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                                setMachineData(prev => ({
                                  ...prev,
                                  [machineNo]: { 
                                    ...prev[machineNo], 
                                    remarks: `${prev[machineNo].remarks ? prev[machineNo].remarks + ' | ' : ''}Save Time: ${timeString}`
                                  }
                                }));
                                setSuccess('Time saved to remarks');
                                setTimeout(() => setSuccess(''), 2000);
                              }}
                              className="btn btn-outline navy-time-btn"
                              title="Add save time to remarks"
                            >
                              <FiClock /> Time
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* NO MACHINES MESSAGE */}
            {selectedShift && machinesForCurrentShift.length === 0 && (
              <div className="no-machines-compact navy-no-machines">
                <div className="no-machines-content-compact navy-no-machines-content">
                  <FiAlertCircle className="no-machines-icon" />
                  <h3>No Machines Found</h3>
                  <p>No targets set for machines in PVC Section, Shift {selectedShift}.</p>
                  <p>Please set targets first or select another shift.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PVCSmartForm;