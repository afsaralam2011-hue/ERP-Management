import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiArrowLeft, FiPackage, FiLayers, 
  FiUser, FiHash, FiDroplet, FiDatabase, 
  FiCheck, FiAlertCircle, FiRefreshCw,
  FiEdit2, FiClipboard, FiTrendingUp, FiFilter,
  FiX, FiRefreshCw as FiClear,
  FiMoon, FiSun, FiCoffee, FiCalendar, FiClock,
  FiMessageCircle
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import "./PVCCoatingForm.css";

const PVCCoatingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [theme, setTheme] = useState('light');
  const [formData, setFormData] = useState({
    section_name: 'PVC',
    targets_id: '',
    machine_id: '',
    machine_no: '',
    shift_code: '',
    shift_name: '',
    target_qty: '',
    item_code: '',
    item_name: '',
    raw_material_Spiralsize: '',
    material_type: 'PVC',
    finishedproductname: '',
    operator_name: '',
    production_quantity: '',
    per_meter_wt: '',
    weight: '',
    unit: 'Meter',
    efficiency: 0,
    users_name: '',
    uom: 'Meter',
    remarks: '',
    entry_date: '',
    production_date: '',
    unique_date_shift_machine_item: ''
  });
  
  const [items, setItems] = useState([]);
  const [pvcShifts, setPvcShifts] = useState([]);
  const [pvcTargets, setPvcTargets] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  const toggleTheme = useCallback(() => {
    const themes = ['light', 'dark', 'cream'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme]);

  // ✅ SEND WHATSAPP MESSAGE - USING WHATSAPP:// PROTOCOL
  const sendWhatsAppMessage = useCallback((recordData) => {
    const {
      production_date,
      shift_code,
      shift_name,
      machine_id,
      machine_no,
      item_code,
      item_name,
      operator_name,
      production_quantity,
      target_qty,
      efficiency,
      weight,
      remarks
    } = recordData;

    // WhatsApp message with emojis
    const message = `📊 *PVC PRODUCTION ENTRY*

📅 *Production Date:* ${production_date}
🕐 *Shift:* ${shift_code} - ${shift_name}
🏭 *Machine:* ${machine_id} ${machine_no ? `(${machine_no})` : ''}
📦 *Item:* ${item_code} - ${item_name}
👤 *Operator:* ${operator_name}

📈 *Production:* ${production_quantity} Meter
🎯 *Target:* ${target_qty} Meter
📊 *Efficiency:* ${efficiency}%
⚖️ *Weight:* ${weight} KG

📝 *Remarks:* ${remarks}

✅ *Entry Successful*`;

    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp Number (Replace with your number)
    const whatsappNumber = "923001234567";
    
    // Try WhatsApp protocol first
    const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
    
    try {
      // Try to open WhatsApp Desktop directly
      window.location.href = whatsappUrl;
      
      // Fallback mechanism
      setTimeout(() => {
        if (document.hasFocus()) {
          // WhatsApp didn't open, show options
          const confirmResult = window.confirm(
            'WhatsApp Desktop is not opening.\n\nChoose an option:\n1. Click OK to copy message\n2. Click Cancel to try Web WhatsApp'
          );
          
          if (confirmResult) {
            // Copy to clipboard
            navigator.clipboard.writeText(message).then(() => {
              alert('Message copied to clipboard!\nPlease paste in WhatsApp.');
            });
          } else {
            // Try Web WhatsApp
            const webWhatsappUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
            window.open(webWhatsappUrl, '_blank');
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      
      // Final fallback
      if (window.confirm('Could not open WhatsApp. Copy message to clipboard?')) {
        navigator.clipboard.writeText(message).then(() => {
          alert('Message copied to clipboard. Please paste in WhatsApp.');
        });
      }
    }
  }, []);

  // ✅ 1. USER AUTO-FILL + DATES SETUP - FIXED
  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userName = session.user.email?.split('@')[0] || 'User';
          
          // ✅ Entry date is today (fixed, cannot change)
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          // ✅ Default production date is yesterday (user can change)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          // ✅ یہاں users_name اور entry_date کو صحیح طور پر set کریں
          setFormData(prev => ({ 
            ...prev, 
            users_name: userName, // ✅ یہ auto-filled ہوگا
            entry_date: todayStr, // ✅ Fixed entry date
            production_date: yesterdayStr // User can change
          }));
        }
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };
    initialize();
  }, []);

  // ✅ FETCH PVC RECORD - WITH users_name AND entry_date FIXED
  const fetchPvcRecord = useCallback(async (recordId, targetsData) => {
    try {
      const { data, error } = await supabase
        .from('pvcsection')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) throw error;
      if (data) {
        const formatDateString = (dateValue) => {
          if (!dateValue) return '';
          try {
            if (typeof dateValue === 'string') {
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return dateValue;
              }
              return new Date(dateValue).toISOString().split('T')[0];
            }
            if (dateValue instanceof Date) {
              return dateValue.toISOString().split('T')[0];
            }
            return '';
          } catch (e) {
            return '';
          }
        };
        
        // ✅ Get current user for users_name
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserName = session?.user?.email?.split('@')[0] || 'User';
        
        const recordWithDefaults = {
          ...data,
          users_name: data.users_name || currentUserName, // ✅ users_name set کریں
          production_date: formatDateString(data.production_date) || formatDateString(data.entry_date) || new Date().toISOString().split('T')[0],
          entry_date: formatDateString(data.entry_date) || new Date().toISOString().split('T')[0]
        };
        
        setFormData(recordWithDefaults);
        
        if (data.shift_code && targetsData && targetsData.length > 0) {
          const machinesForShift = targetsData.filter(target => 
            target.shift_code === data.shift_code
          );
          
          const uniqueMachines = [];
          const machineMap = new Map();
          
          machinesForShift.forEach(target => {
            if (target.machine_id) {
              const machineKey = `${target.machine_id}_${target.machine_no || ''}`;
              if (!machineMap.has(machineKey)) {
                machineMap.set(machineKey, true);
                uniqueMachines.push({
                  machine_id: target.machine_id,
                  machine_no: target.machine_no || '',
                  displayText: target.machine_no ? 
                    `${target.machine_id} (${target.machine_no})` : 
                    target.machine_id
                });
              }
            }
          });
          
          setFilteredMachines(uniqueMachines);
          
          if (data.machine_id && data.shift_code) {
            const targetObj = targetsData.find(target => 
              target.machine_id === data.machine_id && 
              target.shift_code === data.shift_code
            );
            
            if (targetObj) {
              setFormData(prev => ({
                ...prev,
                target_qty: targetObj.target_qty || '',
                uom: targetObj.uom || 'Meter'
              }));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching PVC record:', error);
      setError('Failed to load record: ' + error.message);
    }
  }, []);

  // ✅ FETCH ALL PVC DATA
  const fetchAllPvcData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('pvcitem')
        .select('*')
        .eq('section_name', 'PVC')
        .order('item_name');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      const { data: targetsData, error: targetsError } = await supabase
        .from('targets')
        .select('*')
        .eq('section_name', 'PVC')
        .order('shift_code, machine_id');

      if (targetsError) throw targetsError;
      setPvcTargets(targetsData || []);

      const uniqueShifts = [];
      const shiftMap = new Map();
      
      targetsData?.forEach(target => {
        if (target.shift_code && !shiftMap.has(target.shift_code)) {
          shiftMap.set(target.shift_code, true);
          uniqueShifts.push({
            shift_code: target.shift_code,
            shift_name: target.shift_name || target.shift_code
          });
        }
      });
      
      setPvcShifts(uniqueShifts);

      if (isEditMode && id && targetsData) {
        await fetchPvcRecord(id, targetsData);
      }

      setInitialLoadDone(true);

    } catch (error) {
      console.error('Error fetching PVC data:', error);
      setError('Data loading error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [isEditMode, id, fetchPvcRecord]);

  // ✅ INITIAL FETCH
  useEffect(() => {
    if (!initialLoadDone) {
      fetchAllPvcData();
    }
  }, [initialLoadDone, fetchAllPvcData]);

  // ✅ CHECK FOR DUPLICATE ENTRY
  const checkDuplicateEntry = useCallback(async (productionDate, shiftCode, machineId, itemCode) => {
    if (!productionDate || !shiftCode || !machineId || !itemCode) return null;
    
    try {
      const { data, error } = await supabase
        .from('pvcsection')
        .select('id, production_date, shift_code, machine_id, item_code, operator_name, created_at')
        .eq('production_date', productionDate)
        .eq('shift_code', shiftCode)
        .eq('machine_id', machineId)
        .eq('item_code', itemCode)
        .neq('id', id || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          isDuplicate: true,
          existingRecords: data,
          duplicateCount: data.length
        };
      }
      
      return {
        isDuplicate: false,
        duplicateCount: 0
      };
      
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return null;
    }
  }, [id]);

  // ✅ HANDLE SHIFT SELECTION
  const handleShiftSelection = useCallback((shiftCode) => {
    if (!shiftCode) {
      setFilteredMachines([]);
      setFormData(prev => ({
        ...prev,
        shift_code: '',
        shift_name: '',
        machine_id: '',
        machine_no: '',
        target_qty: '',
        uom: 'Meter',
        unique_date_shift_machine_item: ''
      }));
      setDuplicateCheck(null);
      return;
    }
    
    const selectedShift = pvcShifts.find(s => s.shift_code === shiftCode);
    if (selectedShift) {
      setFormData(prev => ({
        ...prev,
        shift_code: selectedShift.shift_code,
        shift_name: selectedShift.shift_name || selectedShift.shift_code,
        machine_id: '',
        machine_no: '',
        target_qty: '',
        uom: 'Meter',
        unique_date_shift_machine_item: ''
      }));
      
      const machinesForShift = pvcTargets.filter(target => 
        target.shift_code === shiftCode
      );
      
      const uniqueMachines = [];
      const machineMap = new Map();
      
      machinesForShift.forEach(target => {
        if (target.machine_id) {
          const machineKey = `${target.machine_id}_${target.machine_no || ''}`;
          if (!machineMap.has(machineKey)) {
            machineMap.set(machineKey, true);
            uniqueMachines.push({
              machine_id: target.machine_id,
              machine_no: target.machine_no || '',
              displayText: target.machine_no ? 
                `${target.machine_id} (${target.machine_no})` : 
                target.machine_id
            });
          }
        }
      });
      
      setFilteredMachines(uniqueMachines);
    }
    
    setValidationErrors(prev => ({ ...prev, machine_id: '' }));
    setDuplicateCheck(null);
  }, [pvcShifts, pvcTargets]);

  // ✅ HANDLE MACHINE SELECTION
  const handleMachineSelection = useCallback((machineId) => {
    if (!machineId || !formData.shift_code) return;
    
    const selectedMachine = filteredMachines.find(m => m.machine_id === machineId);
    if (selectedMachine) {
      setFormData(prev => ({
        ...prev,
        machine_id: selectedMachine.machine_id,
        machine_no: selectedMachine.machine_no || ''
      }));
      
      const targetObj = pvcTargets.find(target => 
        target.machine_id === machineId && 
        target.shift_code === formData.shift_code
      );
      
      if (targetObj) {
        setFormData(prev => ({
          ...prev,
          targets_id: targetObj.id,
          target_qty: targetObj.target_qty || '',
          uom: targetObj.uom || 'Meter',
          unit: targetObj.uom || 'Meter'
        }));
      }
      
      if (formData.production_date && formData.shift_code && machineId && formData.item_code) {
        checkDuplicateEntry(formData.production_date, formData.shift_code, machineId, formData.item_code)
          .then(result => {
            setDuplicateCheck(result);
          });
      }
      
      setValidationErrors(prev => ({ ...prev, machine_id: '' }));
    }
  }, [filteredMachines, formData.shift_code, formData.production_date, formData.item_code, pvcTargets, checkDuplicateEntry]);

  // ✅ HANDLE ITEM CHANGE
  const handleItemChange = useCallback((e) => {
    const itemCode = e.target.value;
    setValidationErrors(prev => ({ ...prev, item_code: '' }));
    
    if (!itemCode) {
      setFormData(prev => ({
        ...prev,
        item_code: '',
        item_name: '',
        raw_material_Spiralsize: '',
        material_type: 'PVC',
        finishedproductname: '',
        per_meter_wt: '',
        unit: 'Meter',
        unique_date_shift_machine_item: ''
      }));
      return;
    }
    
    const item = items.find(item => item.item_code === itemCode);
    if (item) {
      setFormData(prev => ({
        ...prev,
        item_code: item.item_code,
        item_name: item.item_name || '',
        raw_material_Spiralsize: item.raw_material_Spiralsize || '',
        material_type: item.material_type || 'PVC',
        finishedproductname: item.finishedproductname || '',
        per_meter_wt: item.per_meter_wt || '',
        unit: 'Meter'
      }));
      
      if (formData.production_date && formData.shift_code && formData.machine_id && itemCode) {
        checkDuplicateEntry(formData.production_date, formData.shift_code, formData.machine_id, itemCode)
          .then(result => {
            setDuplicateCheck(result);
          });
      }
    }
  }, [items, formData.production_date, formData.shift_code, formData.machine_id, checkDuplicateEntry]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'production_date' && formData.shift_code && formData.machine_id && formData.item_code) {
      checkDuplicateEntry(value, formData.shift_code, formData.machine_id, formData.item_code)
        .then(result => {
          setDuplicateCheck(result);
        });
    }
  }, [validationErrors, formData.shift_code, formData.machine_id, formData.item_code, checkDuplicateEntry]);

  // ✅ WEIGHT CALCULATION (Auto, cannot edit)
  useEffect(() => {
    if (formData.production_quantity && formData.per_meter_wt) {
      const production = parseFloat(formData.production_quantity) || 0;
      const perMeterWt = parseFloat(formData.per_meter_wt) || 0;
      const calculatedWeight = (production * perMeterWt).toFixed(2);
      
      setFormData(prev => ({ 
        ...prev, 
        weight: calculatedWeight 
      }));
    }
  }, [formData.production_quantity, formData.per_meter_wt]);

  // ✅ EFFICIENCY CALCULATION (Auto, cannot edit)
  useEffect(() => {
    const calculateEfficiency = () => {
      const productionQty = parseFloat(formData.production_quantity) || 0;
      const targetQty = parseFloat(formData.target_qty) || 0;
      
      if (productionQty <= 0 || targetQty <= 0) {
        return 0;
      }

      const efficiency = (productionQty / targetQty) * 100;
      return Math.min(100, parseFloat(efficiency.toFixed(2)));
    };

    const newEfficiency = calculateEfficiency();
    if (newEfficiency !== formData.efficiency) {
      setFormData(prev => ({ 
        ...prev, 
        efficiency: newEfficiency 
      }));
    }
  }, [formData.production_quantity, formData.target_qty, formData.efficiency]);

  // ✅ CLEAR FORM - WITH users_name PRESERVED
  const clearForm = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    setFormData({
      section_name: 'PVC',
      targets_id: '',
      machine_id: '',
      machine_no: '',
      shift_code: '',
      shift_name: '',
      target_qty: '',
      item_code: '',
      item_name: '',
      raw_material_Spiralsize: '',
      material_type: 'PVC',
      finishedproductname: '',
      operator_name: '',
      production_quantity: '',
      per_meter_wt: '',
      weight: '',
      unit: 'Meter',
      efficiency: 0,
      users_name: formData.users_name, // ✅ users_name preserve کریں
      uom: 'Meter',
      remarks: '',
      entry_date: today, // ✅ Fixed entry date
      production_date: yesterdayStr,
      unique_date_shift_machine_item: ''
    });
    setFilteredMachines([]);
    setValidationErrors({});
    setError(null);
    setSuccess(false);
    setDuplicateCheck(null);
    setInitialLoadDone(false);
  }, [formData.users_name]);

  // ✅ HANDLE SUBMIT - FIXED users_name AND entry_date SAVING
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!formData.item_code) errors.item_code = 'Item is required';
    if (!formData.machine_id) errors.machine_id = 'Machine is required';
    if (!formData.target_qty) errors.target_qty = 'Target quantity is required';
    if (!formData.production_quantity || parseFloat(formData.production_quantity) <= 0) 
      errors.production_quantity = 'Production quantity is required';
    if (!formData.shift_code) errors.shift_code = 'Shift is required';
    if (!formData.operator_name) errors.operator_name = 'Operator name is required';
    if (!formData.remarks) errors.remarks = 'Remarks are required';
    if (!formData.production_date) errors.production_date = 'Production date is required';
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError('Please fill all required fields');
      return;
    }
    
    const duplicateResult = await checkDuplicateEntry(
      formData.production_date,
      formData.shift_code,
      formData.machine_id,
      formData.item_code
    );
    
    if (duplicateResult && duplicateResult.isDuplicate && !isEditMode) {
      setError(`❌ DUPLICATE ENTRY WARNING! 
      
      An entry already exists for:
      📅 Production Date: ${formData.production_date}
      🕐 Shift: ${formData.shift_code} - ${formData.shift_name}
      🏭 Machine: ${formData.machine_id} ${formData.machine_no ? `(${formData.machine_no})` : ''}
      📦 Item: ${formData.item_code} - ${formData.item_name}
      
      ${duplicateResult.duplicateCount > 1 ? 
        `⚠️ Found ${duplicateResult.duplicateCount} existing entries` : 
        `👤 Existing Operator: ${duplicateResult.existingRecords[0]?.operator_name || 'Unknown'}`}
      
      Please select a different production date, shift, machine, or item.`);
      return;
    }
    
    const uniqueKey = `${formData.production_date}_${formData.shift_code}_${formData.machine_id}_${formData.item_code}`;
    
    setSaving(true);
    setError(null);

    try {
      const formatDateForSupabase = (dateString) => {
        if (!dateString) return null;
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch (e) {
          throw new Error(`Invalid date format: ${dateString}`);
        }
      };

      // ✅ دونوں تاریخوں کو format کریں
      const entryDate = formatDateForSupabase(formData.entry_date);
      const productionDate = formatDateForSupabase(formData.production_date);

      // ✅ Get current user name again to be sure
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserName = session?.user?.email?.split('@')[0] || 'User';

      // ✅ recordData میں users_name اور entry_date بھی شامل کریں
      const recordData = {
        section_name: 'PVC',
        targets_id: formData.targets_id,
        machine_id: formData.machine_id,
        machine_no: formData.machine_no,
        shift_code: formData.shift_code,
        shift_name: formData.shift_name,
        target_qty: formData.target_qty,
        item_code: formData.item_code,
        item_name: formData.item_name,
        raw_material_Spiralsize: formData.raw_material_Spiralsize,
        material_type: formData.material_type,
        finishedproductname: formData.finishedproductname,
        operator_name: formData.operator_name,
        production_quantity: parseFloat(formData.production_quantity) || 0,
        per_meter_wt: parseFloat(formData.per_meter_wt) || 0,
        weight: parseFloat(formData.weight) || 0,
        efficiency: parseFloat(formData.efficiency) || 0,
        users_name: currentUserName, // ✅ Current user name
        uom: formData.uom,
        remarks: formData.remarks,
        entry_date: entryDate, // ✅ Entry date
        production_date: productionDate,
        unique_date_shift_machine_item: uniqueKey,
        updated_at: new Date().toISOString()
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('pvcsection')
          .update(recordData)
          .eq('id', id);
        if (error) throw error;
        setSuccess('Record updated successfully!');
        
        if (sendWhatsApp) {
          setTimeout(() => {
            sendWhatsAppMessage(recordData);
          }, 1000);
        }
        
        setTimeout(() => navigate('/production-sections/pvc-coating'), 2000);
      } else {
        const { error } = await supabase
          .from('pvcsection')
          .insert([{
            ...recordData,
            created_at: new Date().toISOString()
          }]);
        if (error) throw error;
        setSuccess('Record saved successfully!');
        
        if (sendWhatsApp) {
          setTimeout(() => {
            sendWhatsAppMessage(recordData);
          }, 1000);
        }
        
        setTimeout(() => {
          clearForm();
          setSuccess(false);
        }, 2000);
      }

    } catch (error) {
      console.error('Error saving record:', error);
      
      if (error.code === '23505') {
        setError('❌ DUPLICATE ENTRY! Database rejected this entry because a duplicate already exists.');
      } else if (error.message.includes('duplicate')) {
        setError('❌ DUPLICATE ENTRY! This combination already exists in database.');
      } else if (error.message.includes('column') && (error.message.includes('entry_date') || error.message.includes('users_name'))) {
        setError(`❌ DATABASE COLUMNS MISSING!
        
        Required columns are missing in database.
        
        Please run this SQL in Supabase:
        
        ALTER TABLE pvcsection 
        ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT now();
        
        ALTER TABLE pvcsection 
        ADD COLUMN IF NOT EXISTS users_name TEXT;
        
        Then refresh this page.`);
      } else if (error.message.includes('date') || error.message.includes('Date')) {
        setError(`❌ DATE ERROR! 
        
        Error details: ${error.message}
        
        Please make sure dates are in correct format (YYYY-MM-DD)`);
      } else {
        setError('Failed to save: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && !initialLoadDone) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className={`pvc-coating-form-container theme-${theme}`}>
      {/* SINGLE LINE HEADER */}
      <div className="single-line-header">
        <button
          onClick={() => navigate('/production-sections/pvc-coating')}
          className="header-back-btn"
        >
          <FiArrowLeft size={20} />
        </button>
        
        <FiLayers size={22} className="header-icon" />
        
        <div className="header-text-content">
          <h1 className="header-main-title">
            {isEditMode ? 'Edit PVC Record' : 'New PVC Entry'}
          </h1>
          <p className="header-sub-title">PVC Coating Section</p>
        </div>
        
        <button
          onClick={toggleTheme}
          className="header-theme-btn"
          title={`Theme: ${theme}`}
        >
          {theme === 'light' && <FiSun size={18} />}
          {theme === 'dark' && <FiMoon size={18} />}
          {theme === 'cream' && <FiCoffee size={18} />}
        </button>
      </div>

      {/* WHATSAPP OPTION IN ONE LINE */}
      <div className="whatsapp-option-line">
        <div className="whatsapp-toggle">
          <label>
            <input
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
            />
            <FiMessageCircle size={16} />
            <span>Send WhatsApp message after save</span>
          </label>
        </div>
        
        <button
          onClick={() => {
            setInitialLoadDone(false);
            fetchAllPvcData();
          }}
          className="refresh-button-primary"
        >
          <FiRefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* ✅ DUPLICATE WARNING MESSAGE */}
      {duplicateCheck && duplicateCheck.isDuplicate && !isEditMode && (
        <div className="duplicate-warning-container">
          <FiAlertCircle size={20} />
          <div className="duplicate-warning-content">
            <strong className="duplicate-warning-title">⚠️ DUPLICATE ENTRY DETECTED</strong>
            <div className="duplicate-warning-details">
              <div className="warning-item">
                <span className="warning-label">📅 Production Date:</span>
                <span className="warning-value">{formData.production_date}</span>
              </div>
              <div className="warning-item">
                <span className="warning-label">🕐 Shift:</span>
                <span className="warning-value">{formData.shift_code} - {formData.shift_name}</span>
              </div>
              <div className="warning-item">
                <span className="warning-label">🏭 Machine:</span>
                <span className="warning-value">{formData.machine_id} {formData.machine_no ? `(${formData.machine_no})` : ''}</span>
              </div>
              <div className="warning-item">
                <span className="warning-label">📦 Item:</span>
                <span className="warning-value">{formData.item_code} - {formData.item_name}</span>
              </div>
              <div className="warning-item">
                <span className="warning-label">📊 Existing Entries:</span>
                <span className="warning-value">{duplicateCheck.duplicateCount}</span>
              </div>
              {duplicateCheck.existingRecords && duplicateCheck.existingRecords[0] && (
                <div className="warning-item">
                  <span className="warning-label">👤 Last Operator:</span>
                  <span className="warning-value">{duplicateCheck.existingRecords[0].operator_name}</span>
                </div>
              )}
            </div>
            <div className="duplicate-warning-action">
              ❌ Please select different production date, shift, machine, or item.
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="success-message-container">
          <FiCheck size={20} />
          <div style={{ flex: 1 }}>
            <strong className="success-message-title">{success}</strong>
            <div className="success-message-subtitle">
              {isEditMode ? 'Redirecting...' : 'Form will clear...'}
              {sendWhatsApp && ' WhatsApp message sent!'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message-container">
          <FiAlertCircle size={20} />
          <div style={{ flex: 1 }}>
            <strong className="error-message-title">Error</strong>
            <div style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>{error}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          
          <div className="form-section-card">
            <div className="section-header-primary">
              <FiPackage size={14} /> ITEM & DATE DETAILS
            </div>

            {/* ✅ ENTRY DATE - Display only, no input box */}
            <div className="form-group">
              <label className="form-label">
                <FiCalendar size={14} /> Entry Date
              </label>
              <div className="readonly-display">
                <span className="display-value">{formData.entry_date}</span>
                <div className="display-hint">(Auto-filled, cannot change)</div>
              </div>
            </div>

            {/* ✅ PRODUCTION DATE - User can change */}
            <div className="form-group">
              <label className="form-label">
                <FiClock size={14} /> Production Date *
              </label>
              <input
                type="date"
                name="production_date"
                value={formData.production_date || ''}
                onChange={handleChange}
                required
                className={`form-control ${validationErrors.production_date ? 'has-error' : ''}`}
                max={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.production_date && (
                <div className="error-text">{validationErrors.production_date}</div>
              )}
              <div className="form-hint">
                Actual date when production occurred (can be changed)
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiHash size={14} /> Select Item *
              </label>
              <select
                value={formData.item_code}
                onChange={handleItemChange}
                required
                className={`form-control ${validationErrors.item_code ? 'has-error' : ''}`}
              >
                <option value="">Select PVC Item ({items.length} available)</option>
                {items.map((item, index) => (
                  <option key={index} value={item.item_code}>
                    {item.item_code} - {item.item_name}
                  </option>
                ))}
              </select>
              {validationErrors.item_code && (
                <div className="error-text">{validationErrors.item_code}</div>
              )}
            </div>

            {/* ✅ ITEM DETAILS - Display only, no input boxes */}
            {formData.item_code && (
              <div className="item-details-display">
                <div className="detail-row">
                  <span className="detail-label">Item Name:</span>
                  <span className="detail-value">{formData.item_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Material:</span>
                  <span className="detail-value">{formData.material_type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Spiral Size:</span>
                  <span className="detail-value">{formData.raw_material_Spiralsize || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Per Meter Wt:</span>
                  <span className="detail-value">{formData.per_meter_wt || 'N/A'} KG/M</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <FiEdit2 size={14} /> Production Quantity (Meter) *
              </label>
              <input
                type="number"
                name="production_quantity"
                value={formData.production_quantity}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className={`form-control ${validationErrors.production_quantity ? 'has-error' : ''}`}
                placeholder="Enter production quantity"
              />
              {validationErrors.production_quantity && (
                <div className="error-text">{validationErrors.production_quantity}</div>
              )}
            </div>

            {/* ✅ PER METER WEIGHT - Display only (from item) */}
            <div className="form-group">
              <label className="form-label">
                <FiDroplet size={14} /> Per Meter Weight (KG/M)
              </label>
              <div className="readonly-display">
                <span className="display-value">{formData.per_meter_wt || 'N/A'} KG/M</span>
                <div className="display-hint">(Auto-filled from item)</div>
              </div>
            </div>

            {/* ✅ TOTAL WEIGHT - Display only (auto-calculated) */}
            <div className="form-group">
              <label className="form-label">
                <FiDatabase size={14} /> Total Weight (KG)
              </label>
              <div className="readonly-display">
                <span className="display-value">{formData.weight || '0.00'} KG</span>
                <div className="display-hint">(Auto-calculated: Production Qty × Per Meter Wt)</div>
              </div>
            </div>
          </div>

          <div className="form-section-card">
            <div className="section-header-primary">
              <FiFilter size={14} /> SHIFT → MACHINE → TARGET
            </div>

            <div className="form-group">
              <div className="step-indicator">
                <div className="step-circle step-1">1</div>
                <label className="form-label">Select Shift *</label>
              </div>
              <select
                value={formData.shift_code || ''}
                onChange={(e) => handleShiftSelection(e.target.value)}
                required
                className={`form-control ${validationErrors.shift_code ? 'has-error' : ''}`}
              >
                <option value="">Select Shift ({pvcShifts.length} available)</option>
                {pvcShifts.map((shift, index) => (
                  <option key={index} value={shift.shift_code}>
                    {shift.shift_code} - {shift.shift_name}
                  </option>
                ))}
              </select>
              {validationErrors.shift_code && (
                <div className="error-text">{validationErrors.shift_code}</div>
              )}
            </div>

            {formData.shift_code && (
              <div className="form-group">
                <div className="step-indicator">
                  <div className="step-circle step-2">2</div>
                  <label className="form-label">Select Machine *</label>
                </div>
                <select
                  value={formData.machine_id || ''}
                  onChange={(e) => handleMachineSelection(e.target.value)}
                  required
                  disabled={filteredMachines.length === 0}
                  className={`form-control ${validationErrors.machine_id ? 'has-error' : ''}`}
                >
                  <option value="">
                    {filteredMachines.length === 0 ? 'No machines' : `Select Machine (${filteredMachines.length})`}
                  </option>
                  {filteredMachines.map((machine, index) => (
                    <option key={index} value={machine.machine_id}>
                      {machine.displayText}
                    </option>
                  ))}
                </select>
                {validationErrors.machine_id && (
                  <div className="error-text">{validationErrors.machine_id}</div>
                )}
              </div>
            )}

            {/* ✅ TARGET QUANTITY - Display only */}
            {formData.machine_id && formData.target_qty && (
              <div className="form-group">
                <div className="step-indicator">
                  <div className="step-circle step-3">✓</div>
                  <label className="form-label">Target Quantity (Auto-Filled)</label>
                </div>
                <div className="readonly-display">
                  <div className="target-display">
                    <FiDatabase size={16} className="target-icon" />
                    <div className="target-content">
                      <div className="target-value">{formData.target_qty} {formData.uom}</div>
                      <div className="target-source">From targets table (read-only)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {formData.machine_id && !formData.target_qty && (
              <div className="no-targets-message">
                <FiAlertCircle size={14} />
                <span>No target available for this machine and shift</span>
              </div>
            )}
          </div>

          <div className="form-section-card">
            <div className="section-header-primary">
              <FiUser size={14} /> PERSONNEL & EFFICIENCY
            </div>

            {/* ✅ EFFICIENCY - Display only (auto-calculated) */}
            <div className={`efficiency-display-static ${
              formData.efficiency >= 80 ? 'efficiency-high' : 
              formData.efficiency >= 60 ? 'efficiency-medium' : 'efficiency-low'
            }`}>
              <div className="efficiency-header">
                <FiTrendingUp size={18} />
                <div className="efficiency-title">PRODUCTION EFFICIENCY</div>
              </div>
              <div className="efficiency-value">
                {formData.efficiency}%
              </div>
              <div className="efficiency-calc">
                (Auto-calculated: Production ÷ Target × 100)
              </div>
              {formData.target_qty && (
                <div className="efficiency-target-info">
                  <div>Target: {formData.target_qty} {formData.uom}</div>
                  <div>Actual: {formData.production_quantity || 0} Meter</div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiUser size={14} /> Operator Name *
              </label>
              <input
                type="text"
                name="operator_name"
                value={formData.operator_name}
                onChange={handleChange}
                required
                className={`form-control ${validationErrors.operator_name ? 'has-error' : ''}`}
                placeholder="Enter operator name"
              />
              {validationErrors.operator_name && (
                <div className="error-text">{validationErrors.operator_name}</div>
              )}
            </div>

            {/* ✅ ENTERED BY - Display only */}
            <div className="form-group">
              <label className="form-label">
                <FiUser size={14} /> Entered By
              </label>
              <div className="readonly-display">
                <span className="display-value">{formData.users_name}</span>
                <div className="display-hint">(Auto-filled from login)</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiClipboard size={14} /> Remarks *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                required
                rows="3"
                className={`form-textarea ${validationErrors.remarks ? 'has-error' : ''}`}
                placeholder="Enter any remarks or notes"
              />
              {validationErrors.remarks && (
                <div className="error-text">{validationErrors.remarks}</div>
              )}
            </div>
          </div>
        </div>

        <div className="mobile-bottom-bar">
          <button
            type="button"
            onClick={clearForm}
            className="bottom-bar-button clear"
          >
            <FiClear size={14} /> Clear
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/production-sections/pvc-coating')}
            className="bottom-bar-button cancel"
          >
            <FiX size={14} /> Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving || (duplicateCheck && duplicateCheck.isDuplicate && !isEditMode)}
            className="bottom-bar-button save"
          >
            {saving ? 'Saving...' : <><FiSave size={14} /> Save</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PVCCoatingForm;