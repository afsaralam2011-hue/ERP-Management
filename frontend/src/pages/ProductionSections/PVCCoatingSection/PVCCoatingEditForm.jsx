import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiArrowLeft, FiPackage, FiUser, 
  FiHash, FiDroplet, FiDatabase, 
  FiCheck, FiAlertCircle, FiRefreshCw,
  FiEdit2, FiClipboard, FiTrendingUp, FiFilter,
  FiX, FiMoon, FiSun, FiCoffee, FiCalendar, FiClock,
  FiMessageCircle, FiEdit3
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import "./PVCCoatingForm.css";

const PVCCoatingEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [originalData, setOriginalData] = useState(null);

  const toggleTheme = useCallback(() => {
    const themes = ['light', 'dark', 'cream'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme]);

  // ✅ SEND WHATSAPP MESSAGE - IMPROVED VERSION
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
    const message = `✏️ *PVC RECORD UPDATED*

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

✅ *Record Updated Successfully*`;

    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
    
    try {
      window.location.href = whatsappUrl;
      
      setTimeout(() => {
        if (document.hasFocus()) {
          const confirmResult = window.confirm(
            'WhatsApp Desktop is not opening.\n\nChoose an option:\n1. Click OK to copy message to clipboard\n2. Click Cancel to try Web WhatsApp'
          );
          
          if (confirmResult) {
            navigator.clipboard.writeText(message).then(() => {
              alert('Message copied to clipboard!\nPlease paste in WhatsApp Desktop.');
            });
          } else {
            const webWhatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
            window.open(webWhatsappUrl, '_blank');
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      
      if (window.confirm('Could not open WhatsApp. Copy message to clipboard?')) {
        navigator.clipboard.writeText(message).then(() => {
          alert('Message copied to clipboard. Please paste in WhatsApp.');
        });
      }
    }
  }, []);

  // ✅ FETCH ORIGINAL RECORD
  const fetchRecord = useCallback(async () => {
    if (!id) {
      setError('Record ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // پہلے اصل ریکارڈ حاصل کریں
      const { data: recordData, error: recordError } = await supabase
        .from('pvcsection')
        .select('*')
        .eq('id', id)
        .single();

      if (recordError) throw recordError;
      
      if (!recordData) {
        throw new Error('Record not found');
      }

      // اصل ڈیٹا کو محفوظ کریں
      setOriginalData(recordData);
      
      // تاریخوں کی فارمیٹنگ
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

      // فارم ڈیٹا کو سیٹ کریں
      const formattedData = {
        ...recordData,
        entry_date: formatDateString(recordData.entry_date),
        production_date: formatDateString(recordData.production_date)
      };
      
      setFormData(formattedData);

      // تمام PVC ڈیٹا لوڈ کریں
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

      // شفٹس کی لسٹ بنائیں
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

      // مشینز کو فلٹر کریں
      if (recordData.shift_code && targetsData) {
        const machinesForShift = targetsData.filter(target => 
          target.shift_code === recordData.shift_code
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

    } catch (error) {
      console.error('Error fetching record:', error);
      setError('Failed to load record: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ INITIAL FETCH
  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // ✅ CHECK FOR DUPLICATE ENTRY (ایڈٹ موڈ میں اپنے آپ کو نظرانداز کرنا)
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
        .neq('id', id) // اپنے آپ کو نظرانداز کریں
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
          targets_id: targetObj.targets_id,
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

  // ✅ RESET TO ORIGINAL
  const resetToOriginal = useCallback(() => {
    if (originalData) {
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

      const formattedData = {
        ...originalData,
        entry_date: formatDateString(originalData.entry_date),
        production_date: formatDateString(originalData.production_date)
      };
      
      setFormData(formattedData);
      setValidationErrors({});
      setError(null);
      setSuccess(false);
      setDuplicateCheck(null);
      
      alert('Form reset to original values');
    }
  }, [originalData]);

  // ✅ HANDLE SUBMIT - UPDATED FOR EDIT MODE
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
    if (!formData.users_name) errors.users_name = 'User name is required';
    if (!formData.entry_date) errors.entry_date = 'Entry date is required';
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError('Please fill all required fields');
      return;
    }
    
    // ✅ ایڈٹ موڈ میں ڈپلیکیٹ چیک کریں (اپنے آپ کو نظرانداز کرتے ہوئے)
    const duplicateResult = await checkDuplicateEntry(
      formData.production_date,
      formData.shift_code,
      formData.machine_id,
      formData.item_code
    );
    
    if (duplicateResult && duplicateResult.isDuplicate) {
      setError(`❌ DUPLICATE ENTRY WARNING! 
      
      Another entry already exists for:
      📅 Production Date: ${formData.production_date}
      🕐 Shift: ${formData.shift_code} - ${formData.shift_name}
      🏭 Machine: ${formData.machine_id} ${formData.machine_no ? `(${formData.machine_no})` : ''}
      📦 Item: ${formData.item_code} - ${formData.item_name}
      
      ${duplicateResult.duplicateCount > 1 ? 
        `⚠️ Found ${duplicateResult.duplicateCount} other entries` : 
        `👤 Other Operator: ${duplicateResult.existingRecords[0]?.operator_name || 'Unknown'}`}
      
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

      const entryDate = formatDateForSupabase(formData.entry_date);
      const productionDate = formatDateForSupabase(formData.production_date);

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
        users_name: formData.users_name,
        uom: formData.uom,
        remarks: formData.remarks,
        entry_date: entryDate,
        production_date: productionDate,
        unique_date_shift_machine_item: uniqueKey,
        updated_at: new Date().toISOString()
      };

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

    } catch (error) {
      console.error('Error updating record:', error);
      
      if (error.code === '23505') {
        setError('❌ DUPLICATE ENTRY! Database rejected this update because a duplicate already exists.');
      } else if (error.message.includes('duplicate')) {
        setError('❌ DUPLICATE ENTRY! This combination already exists in database.');
      } else if (error.message.includes('date') || error.message.includes('Date')) {
        setError(`❌ DATE ERROR! 
        
        Error details: ${error.message}
        
        Please make sure dates are in correct format (YYYY-MM-DD)`);
      } else {
        setError('Failed to update: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading record data...</p>
      </div>
    );
  }

  return (
    <div className={`pvc-coating-form-container theme-${theme}`}>
      {/* SINGLE LINE HEADER WITH EDIT ICON */}
      <div className="single-line-header">
        <button
          onClick={() => navigate('/production-sections/pvc-coating')}
          className="header-back-btn"
        >
          <FiArrowLeft size={20} />
        </button>
        
        <FiEdit3 size={22} className="header-icon" />
        
        <div className="header-text-content">
          <h1 className="header-main-title">
            Edit PVC Record - ID: {id}
          </h1>
          <p className="header-sub-title">PVC Coating Section - Update Mode</p>
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
            <span>Send WhatsApp message after update</span>
          </label>
        </div>
        
        <div className="edit-form-actions">
          <button
            onClick={() => {
              fetchRecord();
            }}
            className="refresh-button-primary"
          >
            <FiRefreshCw size={14} /> Reload
          </button>
          
          <button
            onClick={resetToOriginal}
            className="reset-button"
          >
            <FiRefreshCw size={14} /> Reset to Original
          </button>
        </div>
      </div>

      {/* ✅ DUPLICATE WARNING MESSAGE */}
      {duplicateCheck && duplicateCheck.isDuplicate && (
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
                <span className="warning-label">📊 Other Entries:</span>
                <span className="warning-value">{duplicateCheck.duplicateCount}</span>
              </div>
              {duplicateCheck.existingRecords && duplicateCheck.existingRecords[0] && (
                <div className="warning-item">
                  <span className="warning-label">👤 Other Operator:</span>
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
              Redirecting to PVC section...
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

      {/* ORIGINAL DATA INFO */}
      {originalData && (
        <div className="original-data-info">
          <div className="original-data-header">
            <FiClipboard size={16} />
            <span>Original Record Info</span>
          </div>
          <div className="original-data-grid">
            <div className="original-data-item">
              <span className="original-label">Created:</span>
              <span className="original-value">
                {new Date(originalData.created_at).toLocaleDateString()} at {new Date(originalData.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="original-data-item">
              <span className="original-label">Last Updated:</span>
              <span className="original-value">
                {originalData.updated_at ? 
                  `${new Date(originalData.updated_at).toLocaleDateString()} at ${new Date(originalData.updated_at).toLocaleTimeString()}` : 
                  'Never'}
              </span>
            </div>
            <div className="original-data-item">
              <span className="original-label">Entry By:</span>
              <span className="original-value">{originalData.users_name}</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          
          <div className="form-section-card">
            <div className="section-header-primary">
              <FiPackage size={14} /> ITEM & DATE DETAILS
            </div>

            {/* ✅ ENTRY DATE - Display only */}
            <div className="form-group">
              <label className="form-label">
                <FiCalendar size={14} /> Entry Date
              </label>
              <div className="readonly-display">
                <span className="display-value">{formData.entry_date || 'N/A'}</span>
                <div className="display-hint">(Original entry date)</div>
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
                Actual date when production occurred
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

            {/* ✅ ITEM DETAILS - Display only */}
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

            {/* ✅ PER METER WEIGHT - Display only */}
            <div className="form-group">
              <label className="form-label">
                <FiDroplet size={14} /> Per Meter Weight (KG/M)
              </label>
              <div className="readonly-display">
                <span className="display-value">{formData.per_meter_wt || 'N/A'} KG/M</span>
                <div className="display-hint">(Auto-filled from item)</div>
              </div>
            </div>

            {/* ✅ TOTAL WEIGHT - Display only */}
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

            {/* ✅ EFFICIENCY - Display only */}
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
                <span className="display-value">{formData.users_name || 'N/A'}</span>
                <div className="display-hint">(Original entry user)</div>
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
            onClick={resetToOriginal}
            className="bottom-bar-button clear"
          >
            <FiRefreshCw size={14} /> Reset
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
            disabled={saving || (duplicateCheck && duplicateCheck.isDuplicate)}
            className="bottom-bar-button save"
          >
            {saving ? 'Updating...' : <><FiSave size={14} /> Update</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PVCCoatingEditForm;