// ========================================================
// FILE: FlatteningSmartForm.jsx (FINAL CORRECTED VERSION)
// PURPOSE: Smart Production Entry for Flattening Section
// VERSION: 4.0 - Enhanced UI, Better UX, Mobile Optimized
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
          localStorage.setItem(`flattening_draft_${selectedShift}`, JSON.stringify(draftData));
          setDraftSaved(true);
          
          // Auto hide success message after 3 seconds
          setTimeout(() => setDraftSaved(false), 3000);
        } catch (err) {
          console.error('Draft save error:', err);
        }
      }
    };

    if (selectedShift) {
      autoSaveTimer = setTimeout(saveDraft, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [selectedShift, machineData]);

  // ==================== LOAD DRAFT ON SHIFT SELECT ====================
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

  // ==================== NORMALIZE TARGETS DATA ====================
  const normalizedTargets = useMemo(() => {
    return targets.map(target => ({
      id: target.targets_id || target.id,
      machine_no: target.machine_no || target.machine_number || target.machine_id,
      shift_code: target.shift_code || target.shift,
      section_name: target.section_name,
      target_qty: parseFloat(target.target_qty || target.quantity || 0),
      uom: target.uom || target.unit || 'Kg',
      rawData: target // Keep original data for reference
    }));
  }, [targets]);

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

  // ==================== HANDLE SHIFT SELECTION - ENHANCED ====================
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

    // Load draft if available
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
        // Extract numeric part from machine number for proper sorting
        const numA = parseInt(a.machine_no.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.machine_no.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

    // Only initialize if no draft loaded
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
            efficiency: 0,
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
              // Auto-fill coil_size if available in item
              newItem.coil_size = selectedItem.coil_size || '';
              // Auto-fill material_type if available in item
              newItem.material_type = selectedItem.material_type || '';
            }
          }

          // Calculate ITEM efficiency when quantity changes
          if (field === 'quantity') {
            const qty = parseFloat(value) || 0;
            const targetQty = machine.target_qty || 0;
            
            // Calculate item efficiency (item quantity ÷ total target)
            const itemEfficiency = targetQty > 0 ? (qty / targetQty) * 100 : 0;
            newItem.efficiency = parseFloat(itemEfficiency.toFixed(1));
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
            quantity: '',
            unit: 'Kg',
            efficiency: 0,
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

  // ==================== CALCULATIONS ====================
  const calculateMachineTotal = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || !machine.items) return 0;

    return machine.items.reduce((total, item) => {
      return total + (parseFloat(item.quantity) || 0);
    }, 0);
  }, [machineData]);

  // Calculate machine efficiency based on TOTAL production vs machine target
  const calculateMachineEfficiency = useCallback((machineNo) => {
    const machine = machineData[machineNo];
    if (!machine || machine.target_qty === 0) return 0;

    const totalProduction = calculateMachineTotal(machineNo);
    const machineEfficiency = (totalProduction / machine.target_qty) * 100;
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
    
    const totalProduction = sectionTotal;
    const totalEfficiencyValue = (totalProduction / totalTarget) * 100;
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
        // Sort by numeric value for proper ordering
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
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors[`qty_${machineNo}_${index}`] = 'Valid quantity is required';
        }
        if (!item.coil_size?.trim()) {
          errors[`coil_${machineNo}_${index}`] = 'Coil size is required';
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
        const totalProduction = calculateMachineTotal(machineNo);
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
              item_efficiency: item.efficiency || 0, // Item-level efficiency
              machine_efficiency: machineEfficiency || 0, // Machine-level efficiency
              coil_size: item.coil_size || '',
              material_type: item.material_type || '',
              shift_code: machine.shift_code,
              shift_name: machine.shift_name,
              target_qty: machine.target_qty,
              total_production: totalProduction, // Machine total production
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

      console.log('Saving records:', allRecords); // For debugging

      const { error: insertError } = await supabase
        .from('flatteningsection')
        .insert(allRecords);

      if (insertError) {
        console.error('Database error:', insertError);
        throw insertError;
      }

      // Clear draft after successful save
      localStorage.removeItem(`flattening_draft_${selectedShift}`);
      
      setSuccess(`Success! ${allRecords.length} records saved for ${Object.keys(machineData).length} machines`);

      // Auto reset after save
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
    navigate('/production-sections/flattening');
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
              <h1>Flattening Production Entry</h1>
              <p className="header-subtitle">
                <FiPackage /> Smart entry form for production section
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
              {shifts.slice(0, 3).map(shift => (
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
                
                {/* MACHINE NAVIGATION */}
                {machinesForCurrentShift.length > 0 && (
                  <div className="machine-navigation">
                    <button
                      type="button"
                      onClick={prevMachine}
                      disabled={activeMachineIndex === 0}
                      className="nav-btn"
                      title="Previous Machine"
                    >
                      <FiChevronLeft />
                    </button>
                    
                    <div className="nav-info">
                      <span className="nav-current">
                        Machine {machinesForCurrentShift[activeMachineIndex]}
                      </span>
                      <span className="nav-counter">
                        {activeMachineIndex + 1} of {machinesForCurrentShift.length}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={nextMachine}
                      disabled={activeMachineIndex === machinesForCurrentShift.length - 1}
                      className="nav-btn"
                      title="Next Machine"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OVERALL SUMMARY - INLINE */}
            {selectedShift && machinesForCurrentShift.length > 0 && (
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
                        <span className="summary-label">Total Production</span>
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

            {/* PRODUCTION ENTRY */}
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="production-entry">
                {machinesForCurrentShift.map((machineNo, index) => {
                  if (index !== activeMachineIndex && machinesForCurrentShift.length > 3) return null;
                  
                  const data = machineData[machineNo] || {};
                  const target = getTargetForMachine(machineNo, selectedShift);
                  const totalProduction = calculateMachineTotal(machineNo);
                  const machineEfficiency = calculateMachineEfficiency(machineNo);
                  const isActive = index === activeMachineIndex;
                  
                  return (
                    <div 
                      key={machineNo} 
                      className={`machine-card ${isActive ? 'active' : ''} ${!isActive && machinesForCurrentShift.length > 3 ? 'collapsed' : ''}`}
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
                              <span className="stat-label">Total Production:</span>
                              <strong>{totalProduction.toFixed(2)} Kg</strong>
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
                              <th>Item Code & Name</th>
                              <th>Coil Size</th>
                              <th>Material Type</th>
                              <th>Quantity (Kg)</th>
                              <th>Item Efficiency</th>
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
                                      <div className="item-name-display">
                                        <FiPackage /> {item.item_name || items.find(i => i.item_code === item.item_code)?.item_name || 'Unknown'}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                
                                <td>
                                  <input
                                    type="text"
                                    value={item.coil_size || ''}
                                    onChange={(e) => handleItemChange(machineNo, item.id, 'coil_size', e.target.value)}
                                    className={`form-input ${validationErrors[`coil_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                    placeholder="Enter coil size"
                                    title="Enter coil size"
                                  />
                                  {validationErrors[`coil_${machineNo}_${itemIndex}`] && (
                                    <div className="validation-error-small">
                                      <FiAlertCircle /> {validationErrors[`coil_${machineNo}_${itemIndex}`]}
                                    </div>
                                  )}
                                </td>
                                
                                <td>
                                  <input
                                    type="text"
                                    value={item.material_type || ''}
                                    onChange={(e) => handleItemChange(machineNo, item.id, 'material_type', e.target.value)}
                                    className={`form-input ${validationErrors[`material_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                    placeholder="Enter material type"
                                    title="Enter material type"
                                  />
                                  {validationErrors[`material_${machineNo}_${itemIndex}`] && (
                                    <div className="validation-error-small">
                                      <FiAlertCircle /> {validationErrors[`material_${machineNo}_${itemIndex}`]}
                                    </div>
                                  )}
                                </td>
                                
                                <td>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(machineNo, item.id, 'quantity', e.target.value)}
                                    step="0.01"
                                    min="0"
                                    className={`form-input ${validationErrors[`qty_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
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
                      localStorage.removeItem(`flattening_draft_${selectedShift}`);
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

export default FlatteningSmartForm;