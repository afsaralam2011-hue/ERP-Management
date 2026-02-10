// src/components/ProductionSections/SpiralSection/SpiralSmartForm.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiClock, FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiRefreshCw, FiArrowLeft,
  FiCpu, FiPackage, FiEdit3, FiChevronRight,
  FiChevronLeft, FiArrowUp, FiArrowDown,
  FiTarget, FiBarChart2, FiXCircle, FiActivity,
  FiMessageSquare, FiFileText, FiEye, FiCalendar
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import { useTheme } from '../../../contexts/ThemeContext'; // ✅ Theme import
import './SpiralSmartForm.css'; // ✅ Separate CSS file

const SpiralSmartForm = () => {
  const navigate = useNavigate();
  
  // ✅ Theme Context
  const { mode, isDarkMode, currentTheme } = useTheme();
  
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
  
  // WhatsApp related states
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [whatsAppMessage, setWhatsAppMessage] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // Production Date state
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);

  // ✅ Get Theme Colors
  const getThemeColor = (colorName, fallback) => {
    return currentTheme?.colors?.[colorName] || fallback;
  };

  // ✅ Theme-based colors
  const themeColors = {
    primary: getThemeColor('primary', '#1e40af'),
    secondary: getThemeColor('secondary', '#1e293b'),
    background: getThemeColor('background', '#0f172a'),
    surface: getThemeColor('surface', '#1e293b'),
    textPrimary: getThemeColor('textPrimary', '#f8fafc'),
    textSecondary: getThemeColor('textSecondary', '#cbd5e1'),
    border: getThemeColor('border', '#475569'),
    success: getThemeColor('success', '#10b981'),
    warning: getThemeColor('warning', '#f59e0b'),
    error: getThemeColor('error', '#ef4444'),
    info: getThemeColor('info', '#3b82f6'),
  };

  // ✅ Theme-based style objects
  const themeStyles = {
    modalOverlay: {
      backgroundColor: isDarkMode ? 'rgba(0, 10, 20, 0.9)' : 'rgba(0, 20, 40, 0.8)'
    },
    modalContainer: {
      background: isDarkMode 
        ? `linear-gradient(135deg, ${themeColors.background} 0%, ${themeColors.surface} 100%)`
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: `1px solid ${themeColors.info}`,
      color: themeColors.textPrimary
    },
    header: {
      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.info} 100%)`,
      borderBottom: `2px solid ${themeColors.info}`
    },
    sidebar: {
      backgroundColor: themeColors.surface,
      border: `1px solid ${themeColors.border}`,
      color: themeColors.textPrimary
    },
    card: {
      backgroundColor: themeColors.surface,
      border: `1px solid ${themeColors.border}`,
      color: themeColors.textPrimary
    },
    input: {
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
      border: `1px solid ${themeColors.border}`,
      color: themeColors.textPrimary
    },
    button: {
      primary: {
        background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.info} 100%)`,
        color: 'white'
      },
      success: {
        background: `linear-gradient(135deg, ${themeColors.success} 0%, #059669 100%)`,
        color: 'white'
      },
      warning: {
        background: `linear-gradient(135deg, ${themeColors.warning} 0%, #d97706 100%)`,
        color: 'white'
      }
    }
  };

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
            productionDate,
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
  }, [selectedShift, machineData, productionDate]);

  // ==================== LOAD DRAFT ON SHIFT SELECT ====================
  const loadDraftForShift = useCallback((shiftCode) => {
    try {
      const draft = localStorage.getItem(`spiral_draft_${shiftCode}`);
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
          production_date: productionDate,
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

  // ==================== WHATSAPP FUNCTIONS ====================
  const prepareWhatsAppData = useCallback(() => {
    if (!selectedShift || Object.keys(machineData).length === 0) {
      return "No production data available.";
    }

    const shiftData = shifts.find(s => s.shift_code === selectedShift);
    const shiftName = shiftData?.shift_name || selectedShift;
    const shiftTime = shiftData ? `${shiftData.start_time} - ${shiftData.end_time}` : '';
    
    let message = `🏭 *Spiral Section Production Report*\n`;
    message += `📅 Production Date: ${productionDate}\n`;
    message += `🕒 Shift: ${shiftName} (${selectedShift}) ${shiftTime}\n`;
    message += `👤 User: ${currentUser}\n`;
    message += `📊 *Overall Summary:*\n`;
    message += `   • Target: ${formatNumber(totalTarget)} Meter\n`;
    message += `   • Production: ${formatNumber(sectionProductionTotal)} Meter\n`;
    message += `   • Weight: ${formatNumber(sectionTotal)} Kg\n`;
    message += `   • Efficiency: ${formatNumber(totalEfficiency)}%\n\n`;
    
    message += `📋 *Machine-wise Details:*\n`;
    
    Object.keys(machineData).forEach((machineNo, index) => {
      const machine = machineData[machineNo];
      if (!machine || !machine.items) return;
      
      const machineTotal = calculateMachineTotal(machineNo);
      const machineProduction = calculateMachineProductionTotal(machineNo);
      const machineEfficiency = calculateMachineEfficiency(machineNo);
      
      message += `\n${index + 1}. *Machine ${machineNo}*\n`;
      message += `   👷 Operator: ${machine.operator_name || 'N/A'}\n`;
      message += `   🎯 Target: ${formatNumber(machine.target_qty)} ${machine.unit || 'Meter'}\n`;
      message += `   📈 Production: ${formatNumber(machineProduction)} Meter\n`;
      message += `   ⚖️ Weight: ${formatNumber(machineTotal)} Kg\n`;
      message += `   📊 Efficiency: ${formatNumber(machineEfficiency)}%\n`;
      
      machine.items.forEach((item, itemIndex) => {
        if (item.item_code) {
          message += `   ├─ Item ${itemIndex + 1}: ${item.item_code} - ${item.item_name || ''}\n`;
          message += `   │  ├─ Qty: ${formatNumber(item.production_quantity)} Meter\n`;
          message += `   │  ├─ Weight: ${formatNumber(item.weight)} Kg\n`;
          message += `   │  └─ Efficiency: ${formatNumber(item.efficiency)}%\n`;
        }
      });
    });
    
    message += `\n📝 *Remarks:* ${Object.values(machineData)[0]?.remarks || 'None'}\n`;
    message += `\n✅ Generated via Spiral Smart Form`;
    
    return message;
  }, [selectedShift, machineData, shifts, currentUser, totalTarget, sectionProductionTotal, sectionTotal, totalEfficiency, calculateMachineTotal, calculateMachineProductionTotal, calculateMachineEfficiency, productionDate]);

  const sendViaWhatsApp = () => {
    if (!whatsAppNumber) {
      setError('Please enter WhatsApp number');
      return;
    }

    setSendingWhatsApp(true);
    
    const message = whatsAppMessage || prepareWhatsAppData();
    const formattedNumber = whatsAppNumber.replace(/[^0-9]/g, '');
    
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    setTimeout(() => {
      setSendingWhatsApp(false);
      setShowWhatsAppModal(false);
      setSuccess('WhatsApp message prepared successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const generatePDF = () => {
    setSuccess('PDF generation feature will be implemented soon!');
    setTimeout(() => setSuccess(''), 3000);
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
              newItem.item_name = selectedItem?.item_name || '';
              newItem.unit = selectedItem?.unit || 'Kg';
              newItem.raw_material_flatsize = selectedItem?.raw_material_flatsize || '';
              newItem.material_type = selectedItem?.material_type || '';
              newItem.wire_size = selectedItem?.wire_size || '';
              newItem.finishedproductname = selectedItem?.finishedproductname || '';
              newItem.per_meter_wt = selectedItem?.per_meter_wt || '';
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

  // ==================== UPDATE PRODUCTION DATE FOR ALL MACHINES ====================
  const updateProductionDateForAll = (date) => {
    setProductionDate(date);
    const updatedData = { ...machineData };
    Object.keys(updatedData).forEach(machineNo => {
      updatedData[machineNo] = {
        ...updatedData[machineNo],
        production_date: date
      };
    });
    setMachineData(updatedData);
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
        remarks: '',
        production_date: productionDate
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

  const totalItems = useMemo(() => {
    return Object.keys(machineData).reduce((total, machineNo) => {
      return total + (machineData[machineNo]?.items?.length || 0);
    }, 0);
  }, [machineData]);

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

  // ==================== FORMAT DATE ====================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const errors = {};

    if (!selectedShift) {
      errors.shift = 'Please select a shift';
    }

    if (!productionDate) {
      errors.productionDate = 'Production date is required';
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
              production_date: productionDate,
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
      
      setSuccess(`Success! ${allRecords.length} records saved for ${Object.keys(machineData).length} machines on ${formatDate(productionDate)}`);

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
      <div className="modal-overlay" style={themeStyles.modalOverlay}>
        <div className="modal-container loading-modal" style={themeStyles.modalContainer}>
          <div className="loading-content">
            <div className="loading-spinner-large"></div>
            <h3>Loading Production Form</h3>
            <p>Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== WHATSAPP MODAL ====================
  const WhatsAppModal = () => (
    <div className="whatsapp-modal-overlay">
      <div className="modal-container whatsapp-modal">
        <div className="modal-header">
          <h2><FiMessageSquare /> Send via WhatsApp</h2>
          <button 
            className="btn-close" 
            onClick={() => setShowWhatsAppModal(false)}
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>
              <FiMessageSquare /> WhatsApp Number
              <span className="required">*</span>
            </label>
            <input
              type="tel"
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              placeholder="923001234567 (with country code)"
              className="form-input"
              required
            />
            <small className="form-text">
              Enter number with country code (without + sign)
            </small>
          </div>
          
          <div className="form-group">
            <label>
              <FiEdit3 /> Custom Message (Optional)
            </label>
            <textarea
              value={whatsAppMessage}
              onChange={(e) => setWhatsAppMessage(e.target.value)}
              placeholder="You can customize the message or use auto-generated message"
              className="form-textarea"
              rows="6"
            />
          </div>
          
          <div className="preview-section">
            <h4><FiEye /> Message Preview</h4>
            <div className="message-preview">
              {whatsAppMessage || prepareWhatsAppData()}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => setShowWhatsAppModal(false)}
            disabled={sendingWhatsApp}
          >
            Cancel
          </button>
          <button
            className="btn btn-success"
            onClick={sendViaWhatsApp}
            disabled={sendingWhatsApp || !whatsAppNumber}
          >
            {sendingWhatsApp ? (
              <>
                <div className="spinner-small"></div>
                Sending...
              </>
            ) : (
              <>
                <FiMessageSquare /> Open in WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <>
      <div className="modal-overlay" style={themeStyles.modalOverlay} onClick={(e) => {
        if (e.target === e.currentTarget) handleBackClick();
      }}>
        <div className="modal-container smart-form-modal" style={themeStyles.modalContainer}>
          
          {/* HEADER - Theme integrated */}
          <div className="modal-header" style={themeStyles.header}>
            <div className="final-header-content">
              <h1 className="final-main-title">Spiral Production Entry</h1>
              <p className="final-subtitle">
                <FiPackage /> Smart entry form for spiral section
              </p>
            </div>
            
            <div className="final-header-actions">
              {draftSaved && (
                <span className="draft-saved-badge">
                  <FiSave /> Draft Saved
                </span>
              )}
              
              {/* PRODUCTION DATE PICKER */}
              {selectedShift && (
                <div className="production-date-picker">
                  <FiCalendar />
                  <input
                    type="date"
                    value={productionDate}
                    onChange={(e) => updateProductionDateForAll(e.target.value)}
                    className="date-input"
                    title="Select production date"
                  />
                  {validationErrors.productionDate && (
                    <span className="error-text">{validationErrors.productionDate}</span>
                  )}
                </div>
              )}
              
              {/* SHARE BUTTONS */}
              {selectedShift && Object.keys(machineData).length > 0 && (
                <div className="share-buttons-container">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppModal(true)}
                    className="btn whatsapp-btn"
                    style={themeStyles.button.success}
                    title="Share via WhatsApp"
                  >
                    <FiMessageSquare /> WhatsApp
                  </button>
                  
                  <button
                    type="button"
                    onClick={generatePDF}
                    className="btn pdf-btn"
                    style={themeStyles.button.warning}
                    title="Generate PDF"
                  >
                    <FiFileText /> PDF
                  </button>
                </div>
              )}
              
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
                style={themeStyles.button.primary}
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

          {/* FORM LAYOUT */}
          <div className="form-layout">
            
            {/* SIDEBAR */}
            <div className="form-sidebar scrollable-sidebar" style={themeStyles.sidebar}>
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
                    style={themeStyles.card}
                  >
                    <div className="option-content">
                      <span className="option-code">Shift {shift.shift_code}</span>
                      <span className="option-name">
                        {shift.shift_name === 'Day Shift' ? 'Day Shift' : 'Night Shift'}
                      </span>
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
                    <FiEdit3 />
                    <h4>Bulk Operations</h4>
                  </div>
                  <div className="bulk-controls">
                    <input
                      type="text"
                      placeholder="Operator Name (All Machines)"
                      onChange={(e) => handleBulkUpdate('operator_name', e.target.value)}
                      className="form-input"
                      style={themeStyles.input}
                    />
                    <input
                      type="text"
                      value={currentUser}
                      readOnly
                      className="form-input readonly-input"
                      placeholder="User Name (Auto)"
                      style={themeStyles.input}
                    />
                    <input
                      type="text"
                      placeholder="Remarks (All Machines)"
                      onChange={(e) => handleBulkUpdate('remarks', e.target.value)}
                      className="form-input"
                      style={themeStyles.input}
                    />
                  </div>
                </div>
              )}

              <div className="sidebar-stats" style={themeStyles.card}>
                <div className="stat-item">
                  <span className="stat-label">Production Date</span>
                  <span className="stat-value">{formatDate(productionDate)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Machines</span>
                  <span className="stat-value">{totalMachinesCount}</span>
                </div>
                {selectedShift ? (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">Active Machines</span>
                      <span className="stat-value">{machinesForCurrentShift.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Items</span>
                      <span className="stat-value">{totalItems}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat-item">
                      <span className="stat-label">Shifts</span>
                      <span className="stat-value">{shifts.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Items</span>
                      <span className="stat-value">{items.length}</span>
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
                      setProductionDate(new Date().toISOString().split('T')[0]);
                    }}
                    className="btn btn-secondary"
                    title="Change shift"
                  >
                    <FiRefreshCw />
                    Change Shift
                  </button>
                </div>
              )}
            </div>

            {/* MAIN CONTENT */}
            <div className="form-main-content" style={themeStyles.card}>
              
              {selectedShift && (
                <div className="final-production-header">
                  <div className="final-shift-title">
                    <h2 className="compact-title">Shift {selectedShift} Production</h2>
                    <div className="production-date-display">
                      <FiCalendar /> {formatDate(productionDate)}
                    </div>
                  </div>
                  
                  {/* SUMMARY BOXES */}
                  <div className="final-summary-boxes">
                    <div className="final-summary-box" style={themeStyles.card}>
                      <div className="final-box-icon">
                        <FiTarget />
                      </div>
                      <div className="final-box-content">
                        <div className="final-box-label">TOTAL TARGET</div>
                        <div className="final-box-value">
                          {formatNumber(totalTarget)} 
                          <span className="final-box-unit">Meter</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="final-summary-box" style={themeStyles.card}>
                      <div className="final-box-icon">
                        <FiActivity />
                      </div>
                      <div className="final-box-content">
                        <div className="final-box-label">TOTAL PRODUCTION</div>
                        <div className="final-box-value">
                          {formatNumber(sectionProductionTotal)}
                          <span className="final-box-unit">Meter</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="final-summary-box" style={themeStyles.card}>
                      <div className="final-box-icon">
                        <FiPackage />
                      </div>
                      <div className="final-box-content">
                        <div className="final-box-label">TOTAL WEIGHT</div>
                        <div className="final-box-value">
                          {formatNumber(sectionTotal)}
                          <span className="final-box-unit">Kg</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="final-summary-box" style={themeStyles.card}>
                      <div className="final-box-icon">
                        <FiBarChart2 />
                      </div>
                      <div className="final-box-content">
                        <div className="final-box-label">TOTAL EFFICIENCY</div>
                        <div className="final-box-value-row">
                          <span className="final-box-efficiency-value" style={{ color: getEfficiencyColor(totalEfficiency) }}>
                            {formatNumber(totalEfficiency)}%
                          </span>
                          <span className="final-box-efficiency-status" style={{ color: getEfficiencyColor(totalEfficiency) }}>
                            {totalEfficiency >= 100 ? '↑' : '↓'} {getEfficiencyStatus(totalEfficiency).text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* MACHINE INFO */}
                  <div className="final-machine-stats-combined" style={themeStyles.card}>
                    <div className="final-machine-info-line">
                      {getCurrentMachineInfo() && (
                        <div className="final-current-machine-info" style={themeStyles.input}>
                          <FiCpu className="final-machine-icon-small" />
                          <span className="final-machine-text-bold">
                            Machine {getCurrentMachineInfo().machineNo} | Target: {formatNumber(getCurrentMachineInfo().targetQty)} {getCurrentMachineInfo().targetUnit}
                          </span>
                        </div>
                      )}
                      
                      <div className="final-machine-stats-line">
                        <div className="final-machine-stat">
                          <span className="final-stat-label">TOTAL WEIGHT:</span>
                          <span className="final-stat-value">
                            {formatNumber(calculateMachineTotal(machinesForCurrentShift[activeMachineIndex] || ''))} Kg
                          </span>
                        </div>
                        <div className="final-machine-stat">
                          <span className="final-stat-label">MACHINE EFFICIENCY:</span>
                          <span 
                            className="final-stat-efficiency" 
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

              {/* PRODUCTION ENTRY */}
              {selectedShift && machinesForCurrentShift.length > 0 && (
                <div className="production-entry">
                  {machinesForCurrentShift.map((machineNo, index) => {
                    const data = machineData[machineNo] || {};
                    
                    return (
                      <div 
                        key={machineNo} 
                        className={`machine-card ${index === activeMachineIndex ? 'active' : ''}`}
                        style={{ display: index === activeMachineIndex ? 'block' : 'none', ...themeStyles.card }}
                      >
                        
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
                                    <select
                                      value={item.item_code}
                                      onChange={(e) => handleItemChange(machineNo, item.id, 'item_code', e.target.value)}
                                      className={`form-select ${validationErrors[`item_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                      title="Select item"
                                      style={themeStyles.input}
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
                                    <div className="raw-material-fields">
                                      <input
                                        type="text"
                                        value={item.raw_material_flatsize || ''}
                                        onChange={(e) => handleItemChange(machineNo, item.id, 'raw_material_flatsize', e.target.value)}
                                        className={`form-input small ${validationErrors[`flat_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                        placeholder="Flat Size"
                                        title="Raw material flat size"
                                        style={themeStyles.input}
                                      />
                                      <input
                                        type="text"
                                        value={item.material_type || ''}
                                        onChange={(e) => handleItemChange(machineNo, item.id, 'material_type', e.target.value)}
                                        className={`form-input small ${validationErrors[`material_${machineNo}_${itemIndex}`] ? 'error' : ''}`}
                                        placeholder="Material Type"
                                        title="Material type"
                                        style={themeStyles.input}
                                      />
                                    </div>
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
                                        placeholder="Quantity"
                                        title="Production quantity"
                                        style={themeStyles.input}
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
                                        style={themeStyles.input}
                                      />
                                    </div>
                                  </td>
                                  
                                  <td>
                                    <div className="weight-display">
                                      {formatNumber(item.weight || '0')} Kg
                                    </div>
                                  </td>
                                  
                                  <td>
                                    <div 
                                      className="efficiency-badge"
                                      style={{ 
                                        backgroundColor: getEfficiencyColor(item.efficiency) + '20', 
                                        color: getEfficiencyColor(item.efficiency),
                                      }}
                                    >
                                      {formatNumber(item.efficiency)}%
                                      {item.efficiency >= 100 ? ' ↑' : item.efficiency > 0 ? ' ↓' : ''}
                                    </div>
                                  </td>
                                  
                                  {/* ACTIONS */}
                                  <td>
                                    <div className="action-buttons">
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
                                      
                                      {itemIndex === data.items.length - 1 && (
                                        <button
                                          type="button"
                                          onClick={() => addItem(machineNo)}
                                          className="btn btn-outline"
                                          title="Add new item"
                                        >
                                          <FiPlus /> Add
                                        </button>
                                      )}
                                      
                                      {itemIndex === 0 && data.items.length === 1 && (
                                        <button
                                          type="button"
                                          onClick={() => clearMachineData(machineNo)}
                                          className="btn btn-secondary"
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

                        {/* OPERATOR DETAILS */}
                        <div className="machine-footer no-labels" style={themeStyles.card}>
                          <div className="footer-grid">
                            <input
                              type="text"
                              value={data.operator_name || ''}
                              onChange={(e) => setMachineData(prev => ({
                                ...prev,
                                [machineNo]: { ...prev[machineNo], operator_name: e.target.value }
                              }))}
                              className={`form-input ${validationErrors[`operator_${machineNo}`] ? 'error' : ''}`}
                              placeholder="Operator Name"
                              style={themeStyles.input}
                            />
                            
                            <input
                              type="text"
                              value={data.users_name || currentUser}
                              readOnly
                              className="form-input readonly-input"
                              placeholder="User Name (Auto)"
                              style={themeStyles.input}
                            />
                            
                            <input
                              type="text"
                              value={data.remarks || ''}
                              onChange={(e) => setMachineData(prev => ({
                                ...prev,
                                [machineNo]: { ...prev[machineNo], remarks: e.target.value }
                              }))}
                              className="form-input"
                              placeholder="Remarks"
                              style={themeStyles.input}
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
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppModal(true)}
                    className="btn navy-whatsapp-btn"
                    style={themeStyles.button.success}
                    title="Share via WhatsApp"
                  >
                    <FiMessageSquare /> Share via WhatsApp
                  </button>
                  
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="btn btn-primary"
                    disabled={saving}
                    style={themeStyles.button.primary}
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

      {/* WHATSAPP MODAL */}
      {showWhatsAppModal && <WhatsAppModal />}
    </>
  );
};

export default SpiralSmartForm;