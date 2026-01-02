// ========================================================
// FILE: PVCSmartForm.jsx - COLOR FIXED VERSION
// Fixed all color issues - white text on white background resolved
// ========================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiClock, FiCheck, FiAlertCircle,
  FiRefreshCw, FiArrowLeft, FiArrowRight,
  FiCpu, FiChevronRight, FiChevronLeft, 
  FiCalendar, FiX, FiLock,
  FiXCircle, FiUser, FiPackage, FiActivity,
  FiBarChart2, FiPlus, FiTrash2,
  FiSettings, FiMaximize2, FiMinimize2, FiInfo,
  FiMenu, FiTrendingUp, FiSkipForward, FiEdit,
  FiEye, FiBarChart
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
  const [machineData, setMachineData] = useState({});
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeShiftIndex, setActiveShiftIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [duplicateCheck, setDuplicateCheck] = useState({
    checking: false,
    duplicateFound: false,
    existingEntry: null
  });
  
  // Flow States
  const [emptyMachines, setEmptyMachines] = useState([]);
  const [completedMachines, setCompletedMachines] = useState([]);

  // Entry form settings
  const [entryFormExpanded, setEntryFormExpanded] = useState(false);
  const [selectedMachineForEntry, setSelectedMachineForEntry] = useState(null);
  const [showEntryForm, setShowEntryForm] = useState(false);

  // Auto save and move flag - kept for future use
  const [autoMoveEnabled] = useState(true);
  
  // ==================== SIDE PANEL STATES ====================
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [sidePanelContent, setSidePanelContent] = useState('summary');
  const [currentMachineDetails, setCurrentMachineDetails] = useState(null);
  
  // ==================== UTILITY FUNCTIONS (DEFINED FIRST) ====================
  
  // FORMAT NUMBER FUNCTION - DEFINED BEFORE ANY USE
  const formatNumber = useCallback((num) => {
    const number = parseFloat(num) || 0;
    
    if (Number.isInteger(number)) {
      return number.toLocaleString('en-US');
    }
    
    const rounded = Math.round(number * 100) / 100;
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, []);
  
  // GET EFFICIENCY STATUS FUNCTION
  const getEfficiencyStatus = useCallback((efficiency) => {
    if (efficiency >= 70) {
      return {
        text: efficiency >= 100 ? 'Excellent' : 'Good',
        color: efficiency >= 100 ? '#00ff88' : '#4cc9f0'
      };
    } else {
      return {
        text: 'Below Target',
        color: '#ff4444'
      };
    }
  }, []);
  
  // GET SHIFT DISPLAY NAME FUNCTION
  const getShiftDisplayName = useCallback((shiftCode) => {
    const shift = shifts.find(s => s.shift_code === shiftCode);
    if (!shift) return `Shift ${shiftCode}`;
    
    return shift.shift_name === 'Day Shift' ? 'Day Shift' : 
           shift.shift_name === 'Night Shift' ? 'Night Shift' : 
           `Shift ${shiftCode}`;
  }, [shifts]);
  
  // ==================== GET CURRENT USER AND DATE ====================
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

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setCurrentDate(formattedDate);

    getUser();
  }, []);
  
  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: targetsData, error: targetsError } = await supabase
          .from('targets')
          .select('*')
          .eq('section_name', CURRENT_SECTION)
          .eq('is_active', true);

        if (targetsError) throw targetsError;

        const shiftCodes = [...new Set(targetsData.map(target => target.shift_code))];
        
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .in('shift_code', shiftCodes)
          .order('shift_code');

        if (shiftsError) throw shiftsError;

        const { data: itemsData, error: itemsError } = await supabase
          .from('pvcitem')
          .select('*')
          .order('item_code');

        if (itemsError) throw itemsError;

        setShifts(shiftsData || []);
        setTargets(targetsData || []);
        setItems(itemsData || []);

      } catch (error) {
        console.error('Data fetch error:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [CURRENT_SECTION]);
  
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

    machinesList.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    return machinesList;
  }, [selectedShift, targets]);
  
  // ==================== CALCULATIONS ====================
  const calculateMachineTotal = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || !machine.items) return 0;

    return machine.items.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      return total + weight;
    }, 0);
  }, [machineData]);

  const calculateMachineProductionTotal = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || !machine.items) return 0;

    return machine.items.reduce((total, item) => {
      const qty = parseFloat(item.production_quantity) || 0;
      return total + qty;
    }, 0);
  }, [machineData]);

  // ==================== SECTION TOTALS ====================
  const sectionProductionTotal = useMemo(() => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      return total + calculateMachineProductionTotal(machineNo);
    }, 0);
  }, [machineData, calculateMachineProductionTotal]);

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

  // ==================== UPDATE CURRENT MACHINE DETAILS FOR SIDE PANEL ====================
  useEffect(() => {
    if (selectedMachineForEntry && machineData[selectedMachineForEntry]) {
      const machine = machineData[selectedMachineForEntry];
      const production = calculateMachineProductionTotal(selectedMachineForEntry);
      const target = machine.target_qty || 0;
      const efficiency = target > 0 ? (production / target) * 100 : 0;
      
      setCurrentMachineDetails({
        machineNo: selectedMachineForEntry,
        production,
        target,
        efficiency: parseFloat(efficiency.toFixed(1)),
        operator: machine.operator_name || currentUser,
        itemsCount: machine.items?.length || 0,
        status: machine.isCompleted ? 'Completed' : 'In Progress',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  }, [selectedMachineForEntry, machineData, currentUser, calculateMachineProductionTotal]);
  
  // ==================== GET SIDE PANEL SUMMARY ====================
  const getSidePanelSummary = useMemo(() => {
    if (!selectedShift) return null;
    
    const totalMachines = machinesForCurrentShift.length;
    const completed = completedMachines.length;
    const totalProduction = sectionProductionTotal;
    const totalTargetValue = totalTarget;
    
    const overallEfficiency = totalTargetValue > 0 ? (totalProduction / totalTargetValue) * 100 : 0;
    
    return {
      totalMachines,
      completed,
      pending: totalMachines - completed,
      totalProduction: formatNumber(totalProduction),
      totalTarget: formatNumber(totalTargetValue),
      overallEfficiency: parseFloat(overallEfficiency.toFixed(1)),
      shiftName: getShiftDisplayName(selectedShift),
      date: currentDate
    };
  }, [selectedShift, machinesForCurrentShift, completedMachines, sectionProductionTotal, totalTarget, currentDate, formatNumber, getShiftDisplayName]);
  
  // ==================== OPEN SIDE PANEL ====================
  const openSidePanel = (contentType = 'summary', machineNo = null) => {
    if (machineNo) {
      setSelectedMachineForEntry(machineNo);
    }
    setSidePanelContent(contentType);
    setShowSidePanel(true);
  };
  
  // ==================== CLOSE SIDE PANEL ====================
  const closeSidePanel = () => {
    setShowSidePanel(false);
  };
  
  // ==================== ENHANCED DUPLICATE CHECK ====================
  const checkDuplicateEntry = useCallback(async (shiftCode, date = currentDate) => {
    if (!shiftCode || !date) return false;
    
    try {
      setDuplicateCheck(prev => ({ ...prev, checking: true }));
      
      const { data: existingEntries, error: checkError } = await supabase
        .from('pvcsection')
        .select('id, shift_code, entry_date, created_at')
        .eq('shift_code', shiftCode)
        .eq('section_name', CURRENT_SECTION)
        .eq('entry_date', date)
        .limit(1);
      
      if (checkError) {
        console.error('Duplicate check error:', checkError);
        return false;
      }
      
      const hasDuplicates = existingEntries && existingEntries.length > 0;
      
      setDuplicateCheck({
        checking: false,
        duplicateFound: hasDuplicates,
        existingEntry: hasDuplicates ? existingEntries[0] : null
      });
      
      return hasDuplicates;
    } catch (error) {
      console.error('Duplicate check failed:', error);
      setDuplicateCheck(prev => ({ ...prev, checking: false }));
      return false;
    }
  }, [currentDate]);

  // ==================== CHECK DUPLICATE ON SHIFT CHANGE ====================
  useEffect(() => {
    if (selectedShift && currentDate) {
      checkDuplicateEntry(selectedShift);
    }
  }, [selectedShift, currentDate, checkDuplicateEntry]);
  
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

    machinesForShift.sort((a, b) => {
      const numA = parseInt(a.machine_no.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.machine_no.replace(/\D/g, '')) || 0;
      return numA - numB;
    });

    return machinesForShift;
  }, [targets]);
  
  // ==================== HANDLE SHIFT SELECTION ====================
  const handleShiftSelect = async (shiftCode) => {
    setSelectedShift(shiftCode);
    setError('');
    setSuccess('');
    setCompletedMachines([]);
    setEmptyMachines([]);
    setShowEntryForm(false);
    setSelectedMachineForEntry(null);
    setShowSidePanel(false);

    if (!shiftCode) {
      setMachineData({});
      return;
    }

    // Check for duplicate entry
    const hasDuplicate = await checkDuplicateEntry(shiftCode);
    if (hasDuplicate) {
      setError(`This shift already has data for today (${currentDate}). Please edit existing entry instead.`);
      return;
    }

    const draftKey = `pvc_draft_${shiftCode}_${currentDate}`;
    const draft = localStorage.getItem(draftKey);
    
    const selectedShiftData = shifts.find(s => s.shift_code === shiftCode);
    
    const initialMachineData = {};
    const machinesForThisShift = getMachinesForShift(shiftCode);

    // AUTO-FILL ALL REQUIRED FIELDS FOR EACH MACHINE
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
        operator_name: currentUser,
        users_name: currentUser,
        remarks: 'Normal Production',
        section_name: CURRENT_SECTION,
        entry_date: currentDate,
        isCompleted: false
      };
    });

    setMachineData(initialMachineData);
    setEmptyMachines(machinesForThisShift.map(m => m.machine_no));
    
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.machineData) {
          setMachineData(parsedDraft.machineData);
          setSuccess('Previous draft loaded');
          setTimeout(() => setSuccess(''), 3000);
          
          const completed = [];
          Object.keys(parsedDraft.machineData).forEach(machineNo => {
            const machine = parsedDraft.machineData[machineNo];
            if (machine.items?.some(item => item.item_code) && machine.operator_name) {
              completed.push(machineNo);
            }
          });
          setCompletedMachines(completed);
          setEmptyMachines(prev => prev.filter(m => !completed.includes(m)));
        }
      } catch (err) {
        console.error('Draft load error:', err);
      }
    }
  };
  
  // ==================== OPEN ENTRY FORM POPUP ====================
  const openEntryFormPopup = (machineNo) => {
    setSelectedMachineForEntry(machineNo);
    setShowEntryForm(true);
  };

  // ==================== CLOSE ENTRY FORM POPUP ====================
  const closeEntryFormPopup = () => {
    setShowEntryForm(false);
    setSelectedMachineForEntry(null);
    setEntryFormExpanded(false);
  };

  // ==================== SAVE + CLEAR + NEXT SHIFT FUNCTION ====================
  const saveClearAndNextShift = async () => {
    if (!selectedShift) {
      setError('Please select a shift first');
      return;
    }

    if (machinesForCurrentShift.length === 0) {
      setError('No machines found for this shift');
      return;
    }

    // Check if all machines have at least one item with quantity
    const allMachinesHaveData = machinesForCurrentShift.every(machineNo => {
      const machine = machineData[machineNo];
      return machine?.items?.some(item => 
        item.item_code && item.item_code.trim() !== '' && 
        item.production_quantity && parseFloat(item.production_quantity) > 0
      );
    });

    if (!allMachinesHaveData) {
      setError('Please enter production quantity for at least one item in each machine');
      return;
    }

    // FINAL DUPLICATE CHECK - Strict prevention
    const hasDuplicate = await checkDuplicateEntry(selectedShift);
    if (hasDuplicate) {
      setError(`Cannot save: This shift already has data for today (${currentDate}).`);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const allRecords = [];

      machinesForCurrentShift.forEach(machineNo => {
        const machine = machineData[machineNo];
        if (!machine) return;

        machine.items.forEach(item => {
          if (item.item_code && item.item_code.trim() !== '') {
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
              operator_name: machine.operator_name.trim() || currentUser,
              production_quantity: productionQty,
              per_meter_wt: parseFloat(item.per_meter_wt) || 0,
              weight: parseFloat(item.weight) || 0,
              unit: item.unit || 'Kg',
              efficiency: parseFloat(itemEfficiency.toFixed(1)),
              users_name: machine.users_name || currentUser,
              shift_code: machine.shift_code,
              shift_name: machine.shift_name,
              target_qty: machine.target_qty || 0,
              remarks: machine.remarks || 'Normal Production',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              targets_id: machine.targets_id || '',
              entry_date: currentDate
            });
          }
        });
      });

      if (allRecords.length === 0) {
        throw new Error('No valid records to save');
      }

      // SAVE TO DATABASE
      const { error: insertError } = await supabase
        .from('pvcsection')
        .insert(allRecords);

      if (insertError) {
        console.error('Database error:', insertError);
        
        if (insertError.code === '23505' || insertError.message.includes('duplicate key')) {
          throw new Error(`This shift already has data for today. Database constraint violation.`);
        }
        
        throw insertError;
      }

      // Remove draft
      localStorage.removeItem(`pvc_draft_${selectedShift}_${currentDate}`);
      
      // CLEAR CURRENT DATA
      const resetMachineData = {};
      machinesForCurrentShift.forEach(machineNo => {
        resetMachineData[machineNo] = {
          ...machineData[machineNo],
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
          operator_name: currentUser,
          users_name: currentUser,
          remarks: 'Normal Production',
          isCompleted: false
        };
      });
      
      setMachineData(resetMachineData);
      setCompletedMachines([]);
      setEmptyMachines(machinesForCurrentShift);
      setShowEntryForm(false);
      setSelectedMachineForEntry(null);
      setShowSidePanel(false);
      
      // MOVE TO NEXT SHIFT (if auto move enabled)
      const currentShiftIndex = shifts.findIndex(s => s.shift_code === selectedShift);
      
      if (autoMoveEnabled) {
        let foundAvailableShift = false;
        
        // Check all shifts in rotation
        for (let i = 0; i < shifts.length; i++) {
          const nextIndex = (currentShiftIndex + i + 1) % shifts.length;
          const nextShiftCode = shifts[nextIndex]?.shift_code;
          
          // Check if next shift already has data
          const nextHasDuplicate = await checkDuplicateEntry(nextShiftCode);
          
          if (!nextHasDuplicate) {
            handleShiftSelect(nextShiftCode);
            setActiveShiftIndex(nextIndex);
            setSuccess(`Data saved! Auto-switched to next shift: ${nextShiftCode}`);
            foundAvailableShift = true;
            break;
          }
        }
        
        if (!foundAvailableShift) {
          setSuccess('Data saved! All shifts already have data for today.');
          handleShiftSelect(shifts[0]?.shift_code);
          setActiveShiftIndex(0);
        }
      } else {
        setSuccess(`Success! ${allRecords.length} records saved.`);
      }

    } catch (error) {
      console.error('Save error:', error);
      
      if (error.message.includes('Database constraint violation') || 
          error.message.includes('already has data')) {
        const hasDuplicateNow = await checkDuplicateEntry(selectedShift);
        if (hasDuplicateNow) {
          setError(`This shift already has data for today. Please edit existing entry.`);
        }
      } else {
        setError('Save failed: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };
  
  // ==================== SHIFT NAVIGATION ====================
  const nextShift = () => {
    if (shifts.length === 0) return;
    
    let nextIndex = activeShiftIndex + 1;
    
    // If at last shift, go back to first shift
    if (nextIndex >= shifts.length) {
      nextIndex = 0;
    }
    
    const nextShift = shifts[nextIndex];
    handleShiftSelect(nextShift.shift_code);
    setActiveShiftIndex(nextIndex);
  };

  const prevShift = () => {
    if (shifts.length === 0) return;
    
    let prevIndex = activeShiftIndex - 1;
    
    // If at first shift, go to last shift
    if (prevIndex < 0) {
      prevIndex = shifts.length - 1;
    }
    
    const prevShift = shifts[prevIndex];
    handleShiftSelect(prevShift.shift_code);
    setActiveShiftIndex(prevIndex);
  };

  useEffect(() => {
    if (shifts.length > 0 && selectedShift) {
      const index = shifts.findIndex(s => s.shift_code === selectedShift);
      if (index !== -1) {
        setActiveShiftIndex(index);
      }
    }
  }, [shifts, selectedShift]);
  
  // ==================== FIXED FORMULA CALCULATIONS ====================
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

          if (field === 'production_quantity' || field === 'per_meter_wt') {
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
      
      const hasCompletedItems = updatedItems.some(item => 
        item.item_code && item.production_quantity
      );
      
      if (hasCompletedItems && machine.operator_name) {
        updated[machineNo].isCompleted = true;
        if (!completedMachines.includes(machineNo)) {
          setCompletedMachines(prev => [...prev, machineNo]);
          setEmptyMachines(prev => prev.filter(m => m !== machineNo));
        }
      } else {
        updated[machineNo].isCompleted = false;
        setCompletedMachines(prev => prev.filter(m => m !== machineNo));
        if (!emptyMachines.includes(machineNo)) {
          setEmptyMachines(prev => [...prev, machineNo]);
        }
      }
      
      return updated;
    });
  };
  
  // ==================== DYNAMIC ITEM MANAGEMENT ====================
  const addItemToMachine = (machineNo) => {
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

  const removeItemFromMachine = (machineNo, itemId) => {
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
        operator_name: currentUser,
        users_name: currentUser,
        remarks: 'Normal Production',
        isCompleted: false
      };
      
      return updated;
    });
    
    setCompletedMachines(prev => prev.filter(m => m !== machineNo));
    if (!emptyMachines.includes(machineNo)) {
      setEmptyMachines(prev => [...prev, machineNo]);
    }
    
    setSuccess(`Machine ${machineNo} cleared`);
    setTimeout(() => setSuccess(''), 2000);
  };
  
  // ==================== CHECK ALL MACHINES COMPLETED ====================
  const checkAllMachinesCompleted = () => {
    const allCompleted = machinesForCurrentShift.every(machineNo => {
      const machine = machineData[machineNo];
      return machine?.items?.some(item => 
        item.item_code && item.item_code.trim() !== '' && 
        item.production_quantity && parseFloat(item.production_quantity) > 0
      );
    });
    
    return allCompleted;
  };
  
  // ==================== UI HELPERS ====================
  const handleBackClick = () => {
    navigate('/production-sections/pvc-coating');
  };
  
  const closeAlert = () => {
    setError('');
    setSuccess('');
  };
  
  // ==================== SIDE PANEL RENDER ====================
  const renderSidePanelContent = () => {
    switch(sidePanelContent) {
      case 'summary':
        return (
          <>
            {/* Current Machine Summary */}
            {currentMachineDetails && (
              <div className="current-machine-summary">
                <h4 className="summary-section-title">
                  <FiCpu /> Machine {currentMachineDetails.machineNo}
                </h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Production</span>
                    <span className="summary-value">{formatNumber(currentMachineDetails.production)} M</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Target</span>
                    <span className="summary-value">{formatNumber(currentMachineDetails.target)} M</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Efficiency</span>
                    <span 
                      className="summary-value highlight"
                      style={{ color: getEfficiencyStatus(currentMachineDetails.efficiency).color }}
                    >
                      {currentMachineDetails.efficiency}%
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Status</span>
                    <span className="summary-value">{currentMachineDetails.status}</span>
                  </div>
                </div>
                <div className="summary-item" style={{ marginTop: 'var(--space-md)' }}>
                  <span className="summary-label">Operator</span>
                  <span className="summary-value">{currentMachineDetails.operator}</span>
                </div>
              </div>
            )}
            
            {/* Production Summary */}
            {getSidePanelSummary && (
              <div className="production-summary">
                <h4 className="summary-section-title">
                  <FiBarChart /> Shift Summary
                </h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Machines</span>
                    <span className="summary-value">
                      {getSidePanelSummary.completed}/{getSidePanelSummary.totalMachines}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total Production</span>
                    <span className="summary-value">{getSidePanelSummary.totalProduction} M</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Target</span>
                    <span className="summary-value">{getSidePanelSummary.totalTarget} M</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Overall Efficiency</span>
                    <span 
                      className="summary-value highlight"
                      style={{ color: getEfficiencyStatus(getSidePanelSummary.overallEfficiency).color }}
                    >
                      {getSidePanelSummary.overallEfficiency}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Efficiency Graph */}
            <div className="efficiency-graph">
              <h4 className="summary-section-title">
                <FiTrendingUp /> Efficiency Progress
              </h4>
              <div className="graph-bar">
                <div 
                  className="graph-fill" 
                  style={{ 
                    width: `${Math.min(getSidePanelSummary?.overallEfficiency || 0, 100)}%`
                  }}
                />
              </div>
              <div className="flex-between" style={{ marginTop: 'var(--space-sm)' }}>
                <span className="summary-label">0%</span>
                <span className="summary-label">50%</span>
                <span className="summary-label">100%</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => {
                  if (selectedMachineForEntry) {
                    clearMachineData(selectedMachineForEntry);
                  }
                }}
              >
                <FiXCircle />
                Clear Machine
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => {
                  if (selectedMachineForEntry) {
                    openEntryFormPopup(selectedMachineForEntry);
                  }
                }}
              >
                <FiEdit />
                Edit Details
              </button>
              <button 
                className="quick-action-btn"
                onClick={saveClearAndNextShift}
                disabled={!checkAllMachinesCompleted()}
              >
                <FiSave />
                Save All
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => {
                  closeSidePanel();
                  nextShift();
                }}
              >
                <FiSkipForward />
                Next Shift
              </button>
            </div>
          </>
        );
        
      default:
        return (
          <div className="empty-state">
            <FiInfo className="empty-icon" />
            <h3 className="empty-title">Side Panel</h3>
            <p className="empty-text">
              Select a view from the menu
            </p>
          </div>
        );
    }
  };
  
  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner-large"></div>
          <h3>Loading PVC Production Form</h3>
          <p>Please wait while we fetch the data...</p>
        </div>
      </div>
    );
  }
  
  // ==================== MAIN RENDER ====================
  return (
    <div className="pvc-smart-form-container">
      
      {/* HEADER WITH SIDE PANEL BUTTON */}
      <div className="single-header-main">
        <div className="header-content-single-line">
          <div className="header-left-section">
            <button 
              className="btn-back-compact"
              onClick={handleBackClick}
              title="Go back"
            >
              <FiArrowLeft />
            </button>
            <div className="header-title">
              <FiCpu /> PVC Production Entry
            </div>
            
            {/* Side Panel Toggle Button */}
            {selectedShift && !duplicateCheck.duplicateFound && machinesForCurrentShift.length > 0 && (
              <button 
                className="btn-back-compact"
                onClick={() => openSidePanel('summary', selectedMachineForEntry || machinesForCurrentShift[0])}
                title="Open Side Panel"
                style={{ background: '#10b981' }}
              >
                <FiMenu />
              </button>
            )}
          </div>
          
          <div className="header-right-section">
            <div className="header-info-item">
              <FiCalendar /> {currentDate}
            </div>
            
            <div className="header-info-item">
              <FiClock /> {selectedShift ? getShiftDisplayName(selectedShift) : 'Shift Not Selected'}
            </div>
            
            <div className="header-info-item">
              <FiCpu /> Machines
              <span className="machine-count">
                {selectedShift ? `${machinesForCurrentShift.length}` : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content-single">
        
        {/* SHIFT SELECTION */}
        <div className="shift-selection-bar">
          <div className="shift-selection-left">
            <span className="selection-label">Current Shift:</span>
            <span className="selection-value">
              {selectedShift ? getShiftDisplayName(selectedShift) : 'Not Selected'}
            </span>
          </div>
          
          <div className="shift-selection-controls">
            <button
              type="button"
              onClick={prevShift}
              disabled={shifts.length === 0}
              className="btn-shift-nav"
              title="Previous Shift"
            >
              <FiChevronLeft />
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (shifts.length > 0 && !selectedShift) {
                  handleShiftSelect(shifts[0].shift_code);
                  setActiveShiftIndex(0);
                }
              }}
              className={`btn-shift-select ${selectedShift ? 'selected' : ''}`}
              title={selectedShift ? "Change Shift" : "Select First Shift"}
            >
              {selectedShift ? <FiRefreshCw /> : 'Select Shift'}
            </button>
            
            <button
              type="button"
              onClick={nextShift}
              disabled={shifts.length === 0}
              className="btn-shift-nav"
              title="Next Shift"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {(success || error) && (
          <div className={`alert-main ${success ? 'alert-success-main' : 'alert-error-main'}`}>
            <div className="alert-content-main">
              {success ? <FiCheck /> : <FiAlertCircle />}
              <span>{success || error}</span>
            </div>
            <button 
              type="button" 
              className="alert-close-main"
              onClick={closeAlert}
            >
              <FiX />
            </button>
          </div>
        )}

        {/* DUPLICATE WARNING */}
        {duplicateCheck.duplicateFound && (
          <div className="duplicate-warning-main">
            <div className="alert-content-main">
              <FiLock />
              <div>
                <strong>Shift Already Has Data!</strong>
                <p>This shift already has data for today ({currentDate}).</p>
                <small>To modify, please edit the existing entry.</small>
              </div>
            </div>
            <div className="alert-actions-main">
              <button 
                type="button"
                className="btn-secondary-main"
                onClick={() => {
                  nextShift();
                }}
              >
                <FiArrowRight /> Skip to Next Shift
              </button>
            </div>
          </div>
        )}

        {/* MACHINE LIST */}
        {selectedShift && !duplicateCheck.duplicateFound && machinesForCurrentShift.length > 0 && (
          <div className="machine-list-container">
            <div className="machine-list-header">
              <h3><FiCpu /> Machines in Shift</h3>
              <div className="completion-summary">
                <span className="completed-count">{completedMachines.length}</span>
                <span className="total-count">/{machinesForCurrentShift.length}</span>
                <span className="summary-label">Machines Complete</span>
              </div>
            </div>
            
            <div className="machines-grid">
              {machinesForCurrentShift.map((machineNo) => {
                const machine = machineData[machineNo];
                const isCompleted = completedMachines.includes(machineNo);
                const production = calculateMachineProductionTotal(machineNo);
                
                return (
                  <div key={machineNo} className={`machine-card ${isCompleted ? 'completed' : 'pending'}`}>
                    <div className="machine-card-header">
                      <div className="machine-info">
                        <div className="machine-name">
                          <FiCpu /> Machine {machineNo}
                        </div>
                        <div className="machine-target">
                          Target: {formatNumber(machine?.target_qty || 0)} M
                        </div>
                      </div>
                      <div className={`machine-status ${isCompleted ? 'completed' : 'pending'}`}>
                        {isCompleted ? (
                          <>
                            <FiCheck /> Completed
                          </>
                        ) : (
                          <>
                            <FiAlertCircle /> Pending
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="machine-card-body">
                      <div className="machine-stats">
                        <div className="stat-item">
                          <span className="stat-label">Production:</span>
                          <span className="stat-value">{formatNumber(production)} M</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Operator:</span>
                          <span className="stat-value">{machine?.operator_name || currentUser}</span>
                        </div>
                      </div>
                      
                      <div className="machine-actions">
                        <button
                          type="button"
                          onClick={() => openEntryFormPopup(machineNo)}
                          className="btn-enter-data"
                        >
                          <FiSettings /> Enter Production Data
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SAVE BUTTON */}
        <div className="fixed-save-section">
          <div className="save-button-wrapper">
            <button
              type="button"
              onClick={saveClearAndNextShift}
              className={`btn-save-all ${checkAllMachinesCompleted() ? 'enabled' : 'disabled'}`}
              disabled={saving || !checkAllMachinesCompleted() || duplicateCheck.duplicateFound}
              title={duplicateCheck.duplicateFound ? "This shift already has data" : "Save + Clear + Next Shift"}
            >
              {saving ? (
                <>
                  <div className="spinner-small"></div>
                  Saving All Machines...
                </>
              ) : (
                <>
                  <div className="save-all-icons">
                    <FiSave className="icon-save" />
                    <FiXCircle className="icon-clear" />
                    <FiArrowRight className="icon-next" />
                  </div>
                  <div className="save-all-text">
                    <span className="save-main-text">Save All Machines</span>
                    <span className="save-sub-text">
                      ({completedMachines.length}/{machinesForCurrentShift.length}) • 
                      {autoMoveEnabled ? ' Auto-Next' : ' Stay Here'}
                    </span>
                  </div>
                </>
              )}
            </button>
            
            <div className="save-status-message">
              {!checkAllMachinesCompleted() ? (
                <div className="status-warning">
                  <FiAlertCircle /> Complete all {machinesForCurrentShift.length} machines before saving
                </div>
              ) : duplicateCheck.duplicateFound ? (
                <div className="status-error">
                  <FiLock /> This shift already has data for today
                </div>
              ) : (
                <div className="status-success">
                  <FiCheck /> Ready to save! {autoMoveEnabled ? 'Will auto-move to next shift' : 'Will stay on current shift'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* EMPTY STATES */}
        {!selectedShift && !duplicateCheck.duplicateFound && (
          <div className="empty-state">
            <FiClock className="empty-icon" />
            <h3 className="empty-title">Select a Shift</h3>
            <p className="empty-text">
              Use the shift selection above to begin production entry.
            </p>
          </div>
        )}
        
        {selectedShift && !duplicateCheck.duplicateFound && machinesForCurrentShift.length === 0 && (
          <div className="empty-state">
            <FiAlertCircle className="empty-icon" />
            <h3 className="empty-title">No Machines</h3>
            <p className="empty-text">
              No machines assigned to this shift.
            </p>
          </div>
        )}
      </div>

      {/* ENTRY FORM POPUP */}
      {showEntryForm && selectedMachineForEntry && (
        <div className="entry-form-modal-overlay">
          <div className={`entry-form-modal ${entryFormExpanded ? 'expanded' : ''}`}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-title">
                <FiCpu />
                <div>
                  <h3>Machine {selectedMachineForEntry} - Production Entry</h3>
                  <p className="modal-subtitle">Shift {selectedShift} • {currentDate}</p>
                </div>
              </div>
              
              <div className="modal-controls">
                <button
                  type="button"
                  onClick={() => setEntryFormExpanded(!entryFormExpanded)}
                  className="btn-expand"
                  title={entryFormExpanded ? "Minimize" : "Maximize"}
                >
                  {entryFormExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
                </button>
                <button
                  type="button"
                  onClick={closeEntryFormPopup}
                  className="btn-close-modal"
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {/* Production Items Section */}
              <div className="production-items-section">
                <div className="section-header">
                  <h4><FiPackage /> Production Items</h4>
                  <button
                    type="button"
                    onClick={() => addItemToMachine(selectedMachineForEntry)}
                    className="btn-add-item"
                  >
                    <FiPlus /> Add Item
                  </button>
                </div>

                <div className="items-list">
                  {machineData[selectedMachineForEntry]?.items.map((item, itemIndex) => (
                    <div key={item.id} className="item-row">
                      <div className="item-header">
                        <span className="item-number">Item #{itemIndex + 1}</span>
                        {machineData[selectedMachineForEntry]?.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemFromMachine(selectedMachineForEntry, item.id)}
                            className="btn-remove-item"
                            title="Remove Item"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>

                      <div className="item-form">
                        <div className="form-group">
                          <label className="form-label">
                            <FiPackage /> Item *
                          </label>
                          <select
                            value={item.item_code || ''}
                            onChange={(e) => handleItemChange(selectedMachineForEntry, item.id, 'item_code', e.target.value)}
                            className="form-select"
                          >
                            <option value="">-- Select Item --</option>
                            {items.map(itm => (
                              <option key={itm.item_code} value={itm.item_code}>
                                {itm.item_code} - {itm.item_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">
                            <FiActivity /> Quantity (Meters) *
                          </label>
                          <input
                            type="number"
                            value={item.production_quantity || ''}
                            onChange={(e) => handleItemChange(selectedMachineForEntry, item.id, 'production_quantity', e.target.value)}
                            step="0.01"
                            min="0"
                            className="form-input"
                            placeholder="Enter quantity"
                          />
                        </div>

                        {/* Auto-filled Item Details - MOVED TO LEFT SIDE */}
                        {item.item_code && (
                          <div className="item-details">
                            <div className="details-grid-left">
                              <div className="detail-item-left">
                                <span className="detail-label-left">Spiral Size:</span>
                                <span className="detail-value-left">{item.raw_material_Spiralsize || 'N/A'}</span>
                              </div>
                              <div className="detail-item-left">
                                <span className="detail-label-left">Material Type:</span>
                                <span className="detail-value-left">{item.material_type || 'N/A'}</span>
                              </div>
                              <div className="detail-item-left">
                                <span className="detail-label-left">Per Meter Wt:</span>
                                <span className="detail-value-left">{item.per_meter_wt || '0.00'} kg</span>
                              </div>
                            </div>

                            {/* Calculated Results */}
                            {item.weight && parseFloat(item.weight) > 0 && (
                              <div className="calculated-results">
                                <div className="result-item">
                                  <span className="result-label">Total Weight:</span>
                                  <span className="result-value">{formatNumber(item.weight)} Kg</span>
                                </div>
                                <div className="result-item">
                                  <span className="result-label">Efficiency:</span>
                                  <span 
                                    className="result-value efficiency"
                                    style={{ color: getEfficiencyStatus(item.efficiency).color }}
                                  >
                                    {formatNumber(item.efficiency)}% ({getEfficiencyStatus(item.efficiency).text})
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operator and Remarks */}
              <div className="operator-remarks-modal">
                <div className="form-group">
                  <label className="form-label">
                    <FiUser /> Operator Name *
                  </label>
                  <input
                    type="text"
                    value={machineData[selectedMachineForEntry]?.operator_name || currentUser}
                    onChange={(e) => {
                      setMachineData(prev => ({
                        ...prev,
                        [selectedMachineForEntry]: { 
                          ...prev[selectedMachineForEntry], 
                          operator_name: e.target.value 
                        }
                      }));
                    }}
                    className="form-input"
                    placeholder="Enter operator name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiInfo /> Remarks
                  </label>
                  <textarea
                    value={machineData[selectedMachineForEntry]?.remarks || 'Normal Production'}
                    onChange={(e) => {
                      setMachineData(prev => ({
                        ...prev,
                        [selectedMachineForEntry]: { 
                          ...prev[selectedMachineForEntry], 
                          remarks: e.target.value 
                        }
                      }));
                    }}
                    className="form-textarea"
                    placeholder="Enter remarks if needed"
                    rows="3"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => clearMachineData(selectedMachineForEntry)}
                  className="btn-clear"
                >
                  <FiXCircle /> Clear Data
                </button>
                
                <div className="action-group">
                  <button
                    type="button"
                    onClick={closeEntryFormPopup}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const isCurrentCompleted = machineData[selectedMachineForEntry]?.items?.some(item => 
                        item.item_code && item.item_code.trim() !== '' && 
                        item.production_quantity && parseFloat(item.production_quantity) > 0
                      );
                      
                      if (isCurrentCompleted) {
                        const currentIndex = machinesForCurrentShift.indexOf(selectedMachineForEntry);
                        let nextMachineIndex = -1;
                        
                        for (let i = currentIndex + 1; i < machinesForCurrentShift.length; i++) {
                          const nextMachine = machineData[machinesForCurrentShift[i]];
                          const isNextCompleted = nextMachine?.items?.some(item => 
                            item.item_code && item.item_code.trim() !== '' && 
                            item.production_quantity && parseFloat(item.production_quantity) > 0
                          );
                          
                          if (!isNextCompleted) {
                            nextMachineIndex = i;
                            break;
                          }
                        }
                        
                        if (nextMachineIndex !== -1) {
                          openEntryFormPopup(machinesForCurrentShift[nextMachineIndex]);
                        } else {
                          closeEntryFormPopup();
                          setSuccess('All machines completed!');
                        }
                      } else {
                        setError('Please complete current machine before moving to next');
                      }
                    }}
                    className="btn-save-next"
                  >
                    Save & Next Machine
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDE PANEL */}
      <div className={`side-panel-overlay ${showSidePanel ? 'active' : ''}`} onClick={closeSidePanel} />
      
      <div className={`side-panel ${showSidePanel ? 'active' : ''}`}>
        <div className="side-panel-header">
          <div className="side-panel-title">
            <FiEye /> Production Summary
          </div>
          <button 
            className="side-panel-close"
            onClick={closeSidePanel}
          >
            <FiX />
          </button>
        </div>
        
        <div className="side-panel-content">
          {renderSidePanelContent()}
        </div>
      </div>
    </div>
  );
};

export default PVCSmartForm;