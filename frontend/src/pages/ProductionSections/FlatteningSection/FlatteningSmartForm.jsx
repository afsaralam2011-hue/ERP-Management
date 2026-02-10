// ========================================================
// FILE: FlatteningSmartForm.jsx - 100% FINAL VERSION
// WITH THEME SYSTEM INTEGRATED
// ========================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiClock, FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiTrendingUp, FiRefreshCw, FiArrowLeft, 
  FiCpu, FiPackage, FiUser, FiEdit3, FiChevronRight,
  FiChevronLeft, FiDownload, FiArrowUp, FiArrowDown,
  FiCalendar
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import { useTheme } from '../../../contexts/ThemeContext'; // Theme Context import کریں
import './FlatteningSmartForm.css';

const FlatteningSmartForm = () => {
  const navigate = useNavigate();
  const CURRENT_SECTION = 'Flattening';
  
  // Theme Context سے colors حاصل کریں
  const { mode, currentTheme } = useTheme();
  const isDarkMode = mode === 'dark';
  
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
  const [productionDate, setProductionDate] = useState('');

  // Theme-based styles
  const themeStyles = useMemo(() => ({
    // Background colors
    background: isDarkMode ? '#1a1a1a' : '#ffffff',
    surface: isDarkMode ? '#2a2a2a' : '#f5f5f5',
    cardBackground: isDarkMode ? '#2a2a2a' : '#ffffff',
    
    // Text colors
    textPrimary: isDarkMode ? '#7986CB' : '#1A237E', // INDIGO/NAVY BLUE
    textSecondary: isDarkMode ? '#9FA8DA' : '#283593', // LIGHT INDIGO
    textMuted: isDarkMode ? '#aaaaaa' : '#666666',
    
    // Border colors
    border: isDarkMode ? '#333333' : '#e0e0e0',
    borderLight: isDarkMode ? '#3a3a3a' : '#eeeeee',
    
    // Status colors
    primary: '#00a8ff',
    primaryLight: isDarkMode ? 'rgba(0, 168, 255, 0.2)' : 'rgba(0, 168, 255, 0.1)',
    success: '#00ff88',
    successLight: isDarkMode ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 255, 136, 0.1)',
    error: '#ff4444',
    errorLight: isDarkMode ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 68, 68, 0.1)',
    warning: '#ff9800',
    
    // Gradient colors
    gradientPrimary: isDarkMode 
      ? 'linear-gradient(135deg, #1A237E 0%, #283593 100%)' 
      : 'linear-gradient(135deg, #7986CB 0%, #9FA8DA 100%)',
    gradientHeader: isDarkMode 
      ? 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)' 
      : 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
    
    // Shadow
    shadow: isDarkMode 
      ? '0 20px 60px rgba(0, 0, 0, 0.5)' 
      : '0 10px 40px rgba(0, 0, 0, 0.1)',
    
    // Overlay
    overlay: isDarkMode 
      ? 'rgba(0, 0, 0, 0.85)' 
      : 'rgba(0, 0, 0, 0.5)',
  }), [isDarkMode]);

  // آج کی تاریخ کو ڈیفالٹ ویلیو کے طور پر سیٹ کریں
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setProductionDate(today);
  }, []);

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
          const draftData = { 
            shift: selectedShift, 
            machineData, 
            productionDate,
            timestamp: new Date().toISOString() 
          };
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
  }, [selectedShift, machineData, productionDate]);

  const loadDraftForShift = useCallback((shiftCode) => {
    try {
      const draft = localStorage.getItem(`flattening_draft_${shiftCode}`);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.machineData) {
          setMachineData(parsedDraft.machineData);
          if (parsedDraft.productionDate) {
            setProductionDate(parsedDraft.productionDate);
          }
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
        bgColor: isDarkMode ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 255, 136, 0.15)',
        borderColor: isDarkMode ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 255, 136, 0.3)'
      };
    } else {
      return {
        color: '#ff4444',
        icon: <FiArrowDown />,
        bgColor: isDarkMode ? 'rgba(255, 68, 68, 0.1)' : 'rgba(255, 68, 68, 0.15)',
        borderColor: isDarkMode ? 'rgba(255, 68, 68, 0.2)' : 'rgba(255, 68, 68, 0.3)'
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
    if (!productionDate) errors.date = 'Production date is required';
    
    const selectedDate = new Date(productionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      errors.date = 'Production date cannot be in the future';
    }
    
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
              production_date: productionDate,
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
      setSuccess(`Success! ${allRecords.length} records saved for ${Object.keys(machineData).length} machines on ${productionDate}`);
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
      <div className="modal-overlay" style={{ background: themeStyles.overlay }}>
        <div className="modal-container loading-modal" style={{ 
          background: themeStyles.background,
          border: `1px solid ${themeStyles.border}`
        }}>
          <div className="loading-content">
            <div className="loading-spinner-large" style={{ 
              border: `3px solid ${themeStyles.primaryLight}`,
              borderTopColor: themeStyles.primary 
            }}></div>
            <h3 style={{ color: themeStyles.textPrimary }}>Loading Production Form</h3>
            <p style={{ color: themeStyles.textMuted }}>Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" style={{ background: themeStyles.overlay }} onClick={(e) => { if (e.target === e.currentTarget) handleBackClick(); }}>
      <div className="modal-container smart-form-modal enhanced-form" style={{ 
        background: themeStyles.background,
        boxShadow: themeStyles.shadow,
        border: `1px solid ${themeStyles.border}`
      }}>
        <div className="modal-header enhanced-header" style={{ 
          background: themeStyles.gradientHeader,
          borderBottom: `1px solid ${themeStyles.border}`
        }}>
          <div className="header-left">
            <div className="header-icon" style={{ 
              background: themeStyles.gradientPrimary,
              boxShadow: `0 4px 12px ${themeStyles.primary}40`
            }}><FiEdit3 /></div>
            <div className="header-text">
              <h1 style={{ color: themeStyles.textPrimary }}>Flattening Production Entry</h1>
              <p className="header-subtitle" style={{ color: themeStyles.textSecondary }}>
                <FiPackage /> Smart entry form for production section
              </p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-actions">
              {draftSaved && (
                <span className="draft-saved-badge" style={{ 
                  background: themeStyles.successLight,
                  color: themeStyles.success,
                  border: `1px solid ${themeStyles.success}40`
                }}>
                  <FiSave /> Draft Saved
                </span>
              )}
              {selectedShift && machinesForCurrentShift.length > 0 && (
                <div className="machine-nav-container" style={{ 
                  background: themeStyles.surface,
                  border: `1px solid ${themeStyles.border}`
                }}>
                  <button type="button" onClick={prevMachine} disabled={activeMachineIndex === 0} className="btn-nav-header" title="Previous Machine" style={{ 
                    background: themeStyles.surface,
                    border: `1px solid ${themeStyles.borderLight}`,
                    color: themeStyles.textPrimary
                  }}><FiChevronLeft /></button>
                  <div className="machine-header-display">
                    <span className="machine-header-number" style={{ color: themeStyles.textPrimary }}>M/C {machinesForCurrentShift[activeMachineIndex]}</span>
                    <span className="machine-header-counter" style={{ color: themeStyles.textMuted }}>({activeMachineIndex + 1}/{machinesForCurrentShift.length})</span>
                  </div>
                  <button type="button" onClick={nextMachine} disabled={activeMachineIndex === machinesForCurrentShift.length - 1} className="btn-nav-header" title="Next Machine" style={{ 
                    background: themeStyles.surface,
                    border: `1px solid ${themeStyles.borderLight}`,
                    color: themeStyles.textPrimary
                  }}><FiChevronRight /></button>
                </div>
              )}
              <button className="btn btn-back" onClick={handleBackClick} title="Go back" style={{ 
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.borderLight}`,
                color: themeStyles.textPrimary
              }}><FiArrowLeft /> {!isMobile && 'Back'}</button>
            </div>
          </div>
        </div>
        
        {success && (
          <div className="alert alert-success" style={{ 
            background: themeStyles.successLight,
            color: themeStyles.success,
            border: `1px solid ${themeStyles.success}40`
          }}>
            <FiCheck /> {success}
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ 
            background: themeStyles.errorLight,
            color: themeStyles.error,
            border: `1px solid ${themeStyles.error}40`
          }}>
            <FiAlertCircle /> {error}
          </div>
        )}
        
        <div className="form-layout">
          <div className="form-sidebar" style={{ 
            background: themeStyles.surface,
            borderRight: `1px solid ${themeStyles.border}`
          }}>
            <div className="sidebar-header" style={{ borderBottom: `1px solid ${themeStyles.border}` }}>
              <FiClock style={{ color: themeStyles.primary }} />
              <h3 style={{ color: themeStyles.textPrimary }}>Select Shift</h3>
            </div>
            
            <div className="date-input-section">
              <div className="form-group">
                <label className="form-label date-label" style={{ color: themeStyles.textPrimary }}>
                  <FiCalendar /> Production Date
                </label>
                <input 
                  type="date" 
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  className="form-input date-input"
                  style={{ 
                    background: themeStyles.background,
                    border: `1px solid ${themeStyles.border}`,
                    color: themeStyles.textPrimary
                  }}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="shift-options">
              {shifts.slice(0, 3).map(shift => (
                <div key={shift.id} className={`shift-option ${selectedShift === shift.shift_code ? 'active' : ''}`} onClick={() => handleShiftSelect(shift.shift_code)} style={{ 
                  background: selectedShift === shift.shift_code ? themeStyles.primaryLight : themeStyles.surface,
                  border: `1px solid ${selectedShift === shift.shift_code ? themeStyles.primary : themeStyles.border}`
                }}>
                  <div className="option-content">
                    <span className="option-code" style={{ color: themeStyles.textPrimary }}>Shift {shift.shift_code}</span>
                    <span className="option-name" style={{ color: themeStyles.textSecondary }}>{shift.shift_name}</span>
                    <span className="option-time" style={{ color: themeStyles.textMuted }}>{shift.start_time} - {shift.end_time}</span>
                  </div>
                  <div className="option-status">
                    {selectedShift === shift.shift_code ? (
                      <span className="status-active" style={{ 
                        background: themeStyles.successLight,
                        color: themeStyles.success,
                        border: `1px solid ${themeStyles.success}40`
                      }}>Active</span>
                    ) : (
                      <span className="status-inactive" style={{ 
                        background: themeStyles.surface,
                        color: themeStyles.textMuted,
                        border: `1px solid ${themeStyles.border}`
                      }}>Click to load</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {selectedShift && Object.keys(machineData).length > 0 && (
              <div className="bulk-operations" style={{ 
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`
              }}>
                <div className="bulk-header">
                  <FiTrendingUp style={{ color: themeStyles.primary }} />
                  <h4 style={{ color: themeStyles.textPrimary }}>Bulk Operations</h4>
                </div>
                <div className="bulk-controls">
                  <div className="form-group">
                    <label className="form-label" style={{ color: themeStyles.textPrimary }}>Operator Name (All Machines)</label>
                    <input type="text" placeholder="Enter for all machines" onChange={(e) => handleBulkUpdate('operator_name', e.target.value)} className="form-input" style={{ 
                      background: themeStyles.background,
                      border: `1px solid ${themeStyles.border}`,
                      color: themeStyles.textPrimary
                    }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ color: themeStyles.textPrimary }}>Remarks (All Machines)</label>
                    <input type="text" placeholder="Enter for all machines" onChange={(e) => handleBulkUpdate('remarks', e.target.value)} className="form-input" style={{ 
                      background: themeStyles.background,
                      border: `1px solid ${themeStyles.border}`,
                      color: themeStyles.textPrimary
                    }} />
                  </div>
                </div>
              </div>
            )}
            
            {selectedShift && (
              <div className="sidebar-stats" style={{ 
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`
              }}>
                <div className="stat-item" style={{ background: themeStyles.cardBackground }}>
                  <span className="stat-label" style={{ color: themeStyles.textMuted }}>Machines</span>
                  <span className="stat-value" style={{ color: themeStyles.textPrimary }}>{machinesForCurrentShift.length}</span>
                </div>
                <div className="stat-item" style={{ background: themeStyles.cardBackground }}>
                  <span className="stat-label" style={{ color: themeStyles.textMuted }}>Items</span>
                  <span className="stat-value" style={{ color: themeStyles.textPrimary }}>{totalItems}</span>
                </div>
                <div className="stat-item" style={{ background: themeStyles.cardBackground }}>
                  <span className="stat-label" style={{ color: themeStyles.textMuted }}>Total Target</span>
                  <span className="stat-value" style={{ color: themeStyles.textPrimary }}>{totalTarget.toFixed(2)} Kg</span>
                </div>
                <div className="stat-item" style={{ background: themeStyles.cardBackground }}>
                  <span className="stat-label" style={{ color: themeStyles.textMuted }}>Production Date</span>
                  <span className="stat-value date-value" style={{ color: themeStyles.textPrimary }}>{productionDate}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-main-content" style={{ background: themeStyles.background }}>
            {selectedShift && (
              <div className="shift-header" style={{ borderBottom: `1px solid ${themeStyles.border}` }}>
                <div className="shift-title">
                  <h2 style={{ color: themeStyles.textPrimary }}>Shift {selectedShift} Production</h2>
                  <div className="date-badge-container">
                    <span className="shift-badge" style={{ 
                      background: themeStyles.primaryLight,
                      color: themeStyles.primary,
                      border: `1px solid ${themeStyles.primary}40`
                    }}>{shifts.find(s => s.shift_code === selectedShift)?.shift_name}</span>
                    <span className="date-badge" style={{ color: themeStyles.textSecondary }}>
                      <FiCalendar /> {productionDate}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="totals-line" style={{ 
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`
              }}>
                <div className="totals-container">
                  <div className="total-item" style={{ background: themeStyles.cardBackground }}>
                    <span className="total-label" style={{ color: themeStyles.textMuted }}>Total Target:</span>
                    <span className="total-value" style={{ color: themeStyles.textPrimary }}>{totalTarget.toFixed(2)} Kg</span>
                  </div>
                  <div className="total-separator" style={{ color: themeStyles.border }}>|</div>
                  <div className="total-item" style={{ background: themeStyles.cardBackground }}>
                    <span className="total-label" style={{ color: themeStyles.textMuted }}>Total Production:</span>
                    <span className="total-value" style={{ color: themeStyles.textPrimary }}>{sectionTotal.toFixed(2)} Kg</span>
                  </div>
                  <div className="total-separator" style={{ color: themeStyles.border }}>|</div>
                  <div className="total-item" style={{ background: themeStyles.cardBackground }}>
                    <span className="total-label" style={{ color: themeStyles.textMuted }}>Total Efficiency:</span>
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
                    <div key={machineNo} className={`machine-card ${index === activeMachineIndex ? 'active' : 'collapsed'}`} onClick={() => setActiveMachineIndex(index)} style={{ 
                      background: themeStyles.cardBackground,
                      border: `1px solid ${index === activeMachineIndex ? themeStyles.primary : themeStyles.border}`
                    }}>
                      <div className="machine-card-header" style={{ borderBottom: `1px solid ${themeStyles.border}` }}>
                        <div className="machine-info">
                          <FiCpu className="machine-icon" style={{ 
                            color: themeStyles.primary,
                            background: themeStyles.primaryLight
                          }} />
                          <div>
                            <h3 style={{ color: themeStyles.textPrimary }}>Machine {machineNo}</h3>
                            <div className="machine-meta">
                              <span className="meta-item" style={{ color: themeStyles.textSecondary }}>
                                <FiClock /> Shift: {selectedShift}
                              </span>
                              {target && (
                                <span className={`meta-item target ${calculateMachineTotal(machineNo) >= target.target_qty ? 'target-met' : 'target-missed'}`} style={{ 
                                  background: calculateMachineTotal(machineNo) >= target.target_qty ? themeStyles.successLight : themeStyles.errorLight,
                                  color: calculateMachineTotal(machineNo) >= target.target_qty ? themeStyles.success : themeStyles.error,
                                  border: `1px solid ${calculateMachineTotal(machineNo) >= target.target_qty ? themeStyles.success : themeStyles.error}40`
                                }}>
                                  <FiTrendingUp /> Target: {target.target_qty || 0} {target.uom || 'Kg'}
                                </span>
                              )}
                              <span className="meta-item date-item" style={{ color: themeStyles.textSecondary }}>
                                <FiCalendar /> {productionDate}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="machine-stats-compact">
                          <div className="machine-stat-item">
                            <span className="stat-label-compact" style={{ color: themeStyles.textMuted }}>Production:</span>
                            <strong className="stat-value-compact" style={{ color: themeStyles.textPrimary }}>{calculateMachineTotal(machineNo).toFixed(2)} Kg</strong>
                          </div>
                          <div className="machine-stat-item">
                            <span className="stat-label-compact" style={{ color: themeStyles.textMuted }}>Efficiency:</span>
                            <div className="efficiency-box-compact" style={{ 
                              backgroundColor: efficiencyStatus.bgColor, 
                              color: efficiencyStatus.color, 
                              borderColor: efficiencyStatus.borderColor 
                            }}>
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
                                  <th className="col-item" style={{ color: themeStyles.textSecondary }}>Item Code & Name</th>
                                  <th className="col-coil-material" style={{ color: themeStyles.textSecondary }}>Coil Size & Material Type</th>
                                  <th className="col-qty-eff" style={{ color: themeStyles.textSecondary }}>Quantity & Efficiency</th>
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
                                        {itemIndex === 0 && (
                                          <button type="button" onClick={() => addItem(machineNo)} className="btn-add-inline" title="Add item" style={{ 
                                            background: themeStyles.surface,
                                            border: `1px solid ${themeStyles.border}`,
                                            color: themeStyles.textPrimary
                                          }}>
                                            <FiPlus /> Add
                                          </button>
                                        )}
                                      </td>
                                      <td className="cell-item">
                                        <div className="item-code-select">
                                          <select value={item.item_code} onChange={(e) => handleItemChange(machineNo, item.id, 'item_code', e.target.value)} className="form-select" style={{ 
                                            background: themeStyles.background,
                                            border: `1px solid ${themeStyles.border}`,
                                            color: themeStyles.textPrimary
                                          }}>
                                            <option value="">-- Select Item --</option>
                                            {items.map(itm => (
                                              <option key={itm.item_code} value={itm.item_code}>{itm.item_code} - {itm.item_name || 'Unnamed Item'}</option>
                                            ))}
                                          </select>
                                        </div>
                                        {item.item_code && (
                                          <div className="item-name-line" style={{ color: themeStyles.textSecondary }}>
                                            {item.item_name || items.find(i => i.item_code === item.item_code)?.item_name || 'Unknown'}
                                          </div>
                                        )}
                                      </td>
                                      <td className="cell-coil-material">
                                        <div className="coil-size-input">
                                          <input type="text" value={item.coil_size || ''} onChange={(e) => handleItemChange(machineNo, item.id, 'coil_size', e.target.value)} className="form-input" placeholder="Coil size" style={{ 
                                            background: 'transparent',
                                            borderBottom: `1px solid ${themeStyles.border}`,
                                            color: themeStyles.textPrimary
                                          }} />
                                        </div>
                                        <div className="material-type-input">
                                          <input type="text" value={item.material_type || ''} onChange={(e) => handleItemChange(machineNo, item.id, 'material_type', e.target.value)} className="form-input" placeholder="Material type" style={{ 
                                            background: 'transparent',
                                            borderBottom: `1px solid ${themeStyles.border}`,
                                            color: themeStyles.textPrimary
                                          }} />
                                        </div>
                                      </td>
                                      <td className="cell-qty-eff">
                                        <div className="quantity-input">
                                          <input type="number" value={item.quantity} onChange={(e) => handleItemChange(machineNo, item.id, 'quantity', e.target.value)} step="0.01" min="0" className="form-input" placeholder="0.00" style={{ 
                                            background: themeStyles.background,
                                            border: `1px solid ${themeStyles.border}`,
                                            color: themeStyles.textPrimary
                                          }} />
                                        </div>
                                        <div className="item-efficiency-display">
                                          <span className="item-efficiency-value" style={{ color: itemStatus.color }}>{itemEff}%</span>
                                          <span className="item-efficiency-icon" style={{ color: itemStatus.color }}>{itemStatus.icon}</span>
                                        </div>
                                      </td>
                                      <td className="cell-actions">
                                        {data.items.length > 1 && (
                                          <button type="button" onClick={() => removeItem(machineNo, item.id)} className="btn-icon btn-danger" title="Remove item">
                                            <FiTrash2 />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          <div className="operator-remarks-line" style={{ 
                            background: themeStyles.surface,
                            border: `1px solid ${themeStyles.border}`
                          }}>
                            <div className="form-group-inline">
                              <label className="form-label-inline" style={{ color: themeStyles.textPrimary }}>
                                <FiUser /> Operator:
                              </label>
                              <input type="text" value={data.operator_name || ''} onChange={(e) => setMachineData(prev => ({ ...prev, [machineNo]: { ...prev[machineNo], operator_name: e.target.value } }))} className="form-input-inline" placeholder="Operator name" style={{ 
                                background: themeStyles.background,
                                border: `1px solid ${themeStyles.border}`,
                                color: themeStyles.textPrimary
                              }} />
                            </div>
                            <div className="form-group-inline">
                              <label className="form-label-inline" style={{ color: themeStyles.textPrimary }}>Remarks:</label>
                              <input type="text" value={data.remarks || ''} onChange={(e) => setMachineData(prev => ({ ...prev, [machineNo]: { ...prev[machineNo], remarks: e.target.value } }))} className="form-input-inline" placeholder="Optional remarks" style={{ 
                                background: themeStyles.background,
                                border: `1px solid ${themeStyles.border}`,
                                color: themeStyles.textPrimary
                              }} />
                            </div>
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
                <div className="empty-icon" style={{ color: themeStyles.primary }}>
                  <FiClock size={64} />
                </div>
                <h3 style={{ color: themeStyles.textPrimary }}>Select a Shift to Begin</h3>
                <p style={{ color: themeStyles.textSecondary }}>Choose a shift from the sidebar to start entering production data</p>
                <div className="empty-stats">
                  <div className="stat">
                    <span className="stat-number" style={{ color: themeStyles.textPrimary }}>{shifts.length}</span>
                    <span className="stat-label" style={{ color: themeStyles.textMuted }}>Shifts Available</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number" style={{ color: themeStyles.textPrimary }}>{normalizedTargets.length}</span>
                    <span className="stat-label" style={{ color: themeStyles.textMuted }}>Total Machines</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number" style={{ color: themeStyles.textPrimary }}>{productionDate}</span>
                    <span className="stat-label" style={{ color: themeStyles.textMuted }}>Selected Date</span>
                  </div>
                </div>
              </div>
            )}
            
            {selectedShift && machinesForCurrentShift.length === 0 && (
              <div className="empty-state centered">
                <div className="empty-icon" style={{ color: themeStyles.primary }}>
                  <FiCpu size={64} />
                </div>
                <h3 style={{ color: themeStyles.textPrimary }}>No Machines Found</h3>
                <p style={{ color: themeStyles.textSecondary }}>No machines are available for the selected shift ({selectedShift}) on {productionDate}</p>
                <button type="button" onClick={() => setSelectedShift('')} className="btn btn-outline" style={{ 
                  background: 'transparent',
                  color: themeStyles.primary,
                  border: `1px solid ${themeStyles.primary}`
                }}>
                  <FiRefreshCw /> Change Shift
                </button>
              </div>
            )}
            
            {selectedShift && machinesForCurrentShift.length > 0 && (
              <div className="form-actions enhanced-actions" style={{ 
                background: themeStyles.surface,
                border: `1px solid ${themeStyles.border}`
              }}>
                <div className="action-left">
                  <button type="button" onClick={() => { localStorage.removeItem(`flattening_draft_${selectedShift}`); setSelectedShift(''); setMachineData({}); setError(''); setSuccess(''); }} className="btn btn-secondary" disabled={saving} title="Change shift and reset form" style={{ 
                    background: themeStyles.surface,
                    border: `1px solid ${themeStyles.border}`,
                    color: themeStyles.textPrimary
                  }}>
                    <FiRefreshCw /> Change Shift
                  </button>
                  <button type="button" onClick={() => { const dataStr = JSON.stringify({...machineData, productionDate}, null, 2); navigator.clipboard.writeText(dataStr); setSuccess('Data copied to clipboard'); setTimeout(() => setSuccess(''), 2000); }} className="btn btn-outline" title="Copy data to clipboard" style={{ 
                    background: 'transparent',
                    color: themeStyles.primary,
                    border: `1px solid ${themeStyles.primary}`
                  }}>
                    <FiDownload /> Copy Data
                  </button>
                </div>
                <div className="action-right">
                  <button type="submit" onClick={handleSubmit} className="btn btn-primary save-btn" disabled={saving} title="Save all production data" style={{ 
                    background: themeStyles.gradientPrimary,
                    color: 'white'
                  }}>
                    {saving ? (
                      <>
                        <div className="spinner-small" style={{ 
                          border: `2px solid rgba(255,255,255,0.3)`,
                          borderTopColor: 'white'
                        }}></div>Saving...
                      </>
                    ) : (
                      <><FiSave /> Save All Data ({totalItems} Items)</>
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