// src/pages/ProductionSections/PVCCoatingSection/PVCCoatingMultiEntryForm.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiArrowLeft, FiPackage, 
  FiTool, FiUser, FiClock, 
  FiCheck, FiAlertCircle, 
  FiRefreshCw, FiPlus, FiTrash2,
  FiActivity, FiTarget, FiClipboard, FiX,
  FiCalendar, FiHash, FiShare2, FiCopy, FiSmartphone,
  FiMonitor, FiMoon, FiSun, FiCoffee, FiMessageCircle,
  FiTrendingUp, FiDatabase, FiDroplet, FiLayers
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './PVCCoatingMultiEntryForm.css';

const PVCCoatingMultiEntryForm = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  
  const [theme, setTheme] = useState('light');
  const [formData, setFormData] = useState({
    section_name: 'PVC',
    targets_id: '',
    machine_id: '',
    machine_no: '',
    shift_code: '',
    shift_name: '',
    operator_name: '',
    users_name: '',
    remarks: '',
    target_qty: '',
    entry_date: new Date().toISOString().split('T')[0],
    production_date: new Date().toISOString().split('T')[0],
    unique_date_shift_machine_item: ''
  });

  const [entries, setEntries] = useState([
    {
      id: Date.now(),
      item_code: '',
      item_name: '',
      raw_material_Spiralsize: '',
      material_type: 'PVC',
      finishedproductname: '',
      production_quantity: '',
      per_meter_wt: '',
      weight: '',
      unit: 'Meter',
      efficiency: 0
    }
  ]);

  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [entryErrors, setEntryErrors] = useState([]);
  const [existingEntries, setExistingEntries] = useState([]);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappPreview, setWhatsappPreview] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // ✅ THEME TOGGLE
  const toggleTheme = useCallback(() => {
    const themes = ['light', 'dark', 'cream'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme]);

  // ✅ USER AUTO-FILL
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userName = session.user.email?.split('@')[0] || 'User';
          setFormData(prev => ({ ...prev, users_name: userName }));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  // ✅ FETCH ALL DATA
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('pvcitem')
        .select('*')
        .order('item_name');

      if (itemsError) throw new Error(`pvcitem table: ${itemsError.message}`);
      setItems(itemsData || []);

      const { data: targetsData, error: targetsError } = await supabase
        .from('targets')
        .select('*')
        .eq('section_name', 'PVC')
        .order('shift_code');

      if (targetsError) throw new Error(`targets table: ${targetsError.message}`);
      setTargets(targetsData || []);

      if (targetsData) {
        const uniqueShifts = Array.from(
          new Set(targetsData.map(target => target.shift_code))
        ).map(shiftCode => {
          const target = targetsData.find(t => t.shift_code === shiftCode);
          return {
            shift_code: shiftCode,
            shift_name: target?.shift_name || shiftCode
          };
        }).filter(shift => shift.shift_code);
        
        setShifts(uniqueShifts);
      }

      await checkExistingEntries();

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Data loading error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHECK EXISTING ENTRIES
  const checkExistingEntries = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('pvcsection')
        .select('item_code, shift_code, machine_id, production_date')
        .eq('production_date', today);

      if (error) throw error;
      
      setExistingEntries(data || []);
    } catch (error) {
      console.error('Error checking existing entries:', error);
    }
  };

  // ✅ CHECK IF ENTRY ALREADY EXISTS
  const isEntryDuplicate = (itemCode) => {
    if (!formData.shift_code || !formData.machine_id || !formData.production_date) {
      return false;
    }

    return existingEntries.some(entry => 
      entry.item_code === itemCode &&
      entry.shift_code === formData.shift_code &&
      entry.machine_id === formData.machine_id &&
      entry.production_date === formData.production_date
    );
  };

  // ✅ HANDLE SHIFT SELECTION
  const handleShiftChange = (shiftCode) => {
    if (!shiftCode) {
      setFormData(prev => ({
        ...prev,
        shift_code: '',
        shift_name: '',
        targets_id: '',
        machine_id: '',
        machine_no: '',
        target_qty: ''
      }));
      setMachines([]);
      setSelectedTarget(null);
      return;
    }

    const shift = shifts.find(s => s.shift_code === shiftCode);
    
    const shiftMachines = targets.filter(target => 
      target.shift_code === shiftCode && target.section_name === 'PVC'
    );
    
    setMachines(shiftMachines);
    
    setFormData(prev => ({
      ...prev,
      shift_code: shiftCode,
      shift_name: shift?.shift_name || shiftCode,
      targets_id: '',
      machine_id: '',
      machine_no: '',
      target_qty: ''
    }));
    setSelectedTarget(null);
  };

  // ✅ HANDLE MACHINE SELECTION
  const handleMachineChange = (machineId) => {
    if (!machineId) {
      setFormData(prev => ({
        ...prev,
        targets_id: '',
        machine_id: '',
        machine_no: '',
        target_qty: ''
      }));
      setSelectedTarget(null);
      return;
    }

    const target = machines.find(m => m.machine_id === machineId);
    
    if (target) {
      setSelectedTarget(target);
      
      setFormData(prev => ({
        ...prev,
        targets_id: target.targets_id,
        machine_id: target.machine_id,
        machine_no: target.machine_no || target.machine_id,
        target_qty: target.target_qty || ''
      }));
    }
  };

  // ✅ ADD NEW ENTRY ROW
  const addEntryRow = () => {
    const newEntry = {
      id: Date.now() + Math.random(),
      item_code: '',
      item_name: '',
      raw_material_Spiralsize: '',
      material_type: 'PVC',
      finishedproductname: '',
      production_quantity: '',
      per_meter_wt: '',
      weight: '',
      unit: 'Meter',
      efficiency: 0
    };
    setEntries(prev => [...prev, newEntry]);
  };

  // ✅ REMOVE ENTRY ROW
  const removeEntryRow = (id) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  // ✅ HANDLE ENTRY CHANGE
  const handleEntryChange = (id, field, value) => {
    setEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };

        if (field === 'item_code' && value) {
          const item = items.find(i => i.item_code === value);
          if (item) {
            updatedEntry.item_name = item.item_name || '';
            updatedEntry.raw_material_Spiralsize = item.raw_material_Spiralsize || '';
            updatedEntry.material_type = item.material_type || 'PVC';
            updatedEntry.finishedproductname = item.finishedproductname || '';
            updatedEntry.per_meter_wt = item.per_meter_wt || '';
            updatedEntry.unit = item.unit || 'Meter';
          }
        }

        if ((field === 'production_quantity' || field === 'per_meter_wt') && 
            updatedEntry.production_quantity && updatedEntry.per_meter_wt) {
          const production = parseFloat(updatedEntry.production_quantity) || 0;
          const perMeterWt = parseFloat(updatedEntry.per_meter_wt) || 0;
          updatedEntry.weight = (production * perMeterWt).toFixed(2);
        }

        return updatedEntry;
      }
      return entry;
    }));
  };

  // ✅ CALCULATE TOTAL PRODUCTION
  const calculateTotalProduction = () => {
    return entries.reduce((total, entry) => {
      return total + (parseFloat(entry.production_quantity) || 0);
    }, 0);
  };

  // ✅ CALCULATE TOTAL EFFICIENCY WITH COLOR LOGIC
  const calculateTotalEfficiency = () => {
    const totalProduction = calculateTotalProduction();
    
    if (!selectedTarget || !selectedTarget.target_qty || parseFloat(selectedTarget.target_qty) <= 0) {
      return { efficiency: 0, color: 'low' };
    }

    const targetQty = parseFloat(selectedTarget.target_qty);
    const efficiency = (totalProduction / targetQty) * 100;
    const calculatedEfficiency = Math.min(100, parseFloat(efficiency.toFixed(2)));
    
    let color = 'low';
    if (calculatedEfficiency >= 80) {
      color = 'high';
    } else if (calculatedEfficiency >= 70) {
      color = 'medium';
    }
    
    return { efficiency: calculatedEfficiency, color };
  };

  // ✅ VALIDATE FORM
  const validateForm = () => {
    const errors = {};
    const entryErrs = [];

    if (!formData.shift_code) errors.shift_code = 'Shift selection is required';
    if (!formData.machine_id) errors.machine_id = 'Machine selection is required';
    if (!formData.operator_name) errors.operator_name = 'Operator name is required';
    if (!formData.remarks) errors.remarks = 'Remarks are required';
    if (!formData.production_date) errors.production_date = 'Production date is required';

    entries.forEach((entry, index) => {
      const entryError = {};
      
      if (!entry.item_code) {
        entryError.item_code = 'Item is required';
      } else if (isEntryDuplicate(entry.item_code)) {
        entryError.item_code = 'This item already entered for selected shift, machine and date';
      }
      
      if (!entry.production_quantity || parseFloat(entry.production_quantity) <= 0)
        entryError.production_quantity = 'Production quantity is required';
      if (!entry.per_meter_wt) entryError.per_meter_wt = 'Per meter weight is required';

      if (Object.keys(entryError).length > 0) {
        entryErrs.push({ index, errors: entryError });
      }
    });

    setValidationErrors(errors);
    setEntryErrors(entryErrs);

    return Object.keys(errors).length === 0 && entryErrs.length === 0;
  };

  // ✅ GENERATE UNIQUE KEY
  const generateUniqueKey = (itemCode) => {
    return `${formData.production_date}_${formData.shift_code}_${formData.machine_id}_${itemCode}`;
  };

  // ✅ GENERATE WHATSAPP MESSAGE
  const generateWhatsAppMessage = () => {
    const totals = calculateTotals();
    const efficiencyData = calculateTotalEfficiency();
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB');
    
    let message = `📊 *PVC PRODUCTION ENTRY (MULTI-ITEM)*\n\n`;
    message += `📅 *Production Date:* ${formData.production_date}\n`;
    message += `🕐 *Shift:* ${formData.shift_code} - ${formData.shift_name}\n`;
    message += `🏭 *Machine:* ${formData.machine_id} ${formData.machine_no ? `(${formData.machine_no})` : ''}\n`;
    message += `👤 *Operator:* ${formData.operator_name}\n`;
    message += `🎯 *Target:* ${formData.target_qty} Meter\n\n`;
    message += `📦 *Items Produced (${entries.length}):*\n`;
    
    entries.forEach((entry, index) => {
      message += `${index + 1}. ${entry.item_code} - ${entry.item_name.substring(0, 20)}\n`;
      message += `   📏 Quantity: ${entry.production_quantity} Meter\n`;
      message += `   ⚖️ Weight: ${entry.weight} KG\n\n`;
    });
    
    message += `📊 *SUMMARY:*\n`;
    message += `📈 Total Production: ${totals.totalProduction.toFixed(2)} Meter\n`;
    message += `⚖️ Total Weight: ${totals.totalWeight.toFixed(2)} KG\n`;
    message += `📊 Efficiency: ${efficiencyData.efficiency.toFixed(2)}%\n\n`;
    message += `📝 *Remarks:* ${formData.remarks}\n`;
    message += `👤 *Entered By:* ${formData.users_name}\n`;
    message += `📅 *Entry Date:* ${formattedDate}\n\n`;
    message += `✅ *Multi-Entry Completed Successfully*`;
    
    setWhatsappPreview(message);
    return encodeURIComponent(message);
  };

  // ✅ SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix all errors before submitting');
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      const records = entries.map(entry => ({
        ...formData,
        item_code: entry.item_code,
        item_name: entry.item_name,
        raw_material_Spiralsize: entry.raw_material_Spiralsize,
        material_type: entry.material_type,
        finishedproductname: entry.finishedproductname,
        production_quantity: parseFloat(entry.production_quantity) || 0,
        per_meter_wt: parseFloat(entry.per_meter_wt) || 0,
        weight: parseFloat(entry.weight) || 0,
        unit: entry.unit,
        efficiency: calculateTotalEfficiency().efficiency,
        targets_id: formData.targets_id,
        target_qty: parseFloat(formData.target_qty) || 0,
        unique_date_shift_machine_item: generateUniqueKey(entry.item_code),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const duplicates = records.filter(record => 
        existingEntries.some(existing => 
          existing.item_code === record.item_code &&
          existing.shift_code === record.shift_code &&
          existing.machine_id === record.machine_id &&
          existing.production_date === record.production_date
        )
      );

      if (duplicates.length > 0) {
        setError(`Cannot save: ${duplicates.length} item(s) already exist for selected shift, machine and date`);
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('pvcsection')
        .insert(records);

      if (error) throw error;
      
      setSuccess(`${records.length} records created successfully!`);
      
      if (sendWhatsApp) {
        const message = generateWhatsAppMessage();
        const whatsappUrl = `whatsapp://send?text=${message}`;
        
        try {
          window.location.href = whatsappUrl;
          
          setTimeout(() => {
            if (document.hasFocus()) {
              const confirmResult = window.confirm(
                'WhatsApp Desktop is not opening.\n\nChoose an option:\n1. Click OK to copy message to clipboard\n2. Click Cancel to try Web WhatsApp'
              );
              
              if (confirmResult) {
                navigator.clipboard.writeText(whatsappPreview).then(() => {
                  alert('Message copied to clipboard!\nPlease paste in WhatsApp Desktop.');
                });
              } else {
                const webWhatsappUrl = `https://web.whatsapp.com/send?text=${message}`;
                window.open(webWhatsappUrl, '_blank');
              }
            }
          }, 1000);
          
        } catch (error) {
          console.error('Error opening WhatsApp:', error);
          
          if (window.confirm('Could not open WhatsApp. Copy message to clipboard?')) {
            navigator.clipboard.writeText(whatsappPreview).then(() => {
              alert('Message copied to clipboard. Please paste in WhatsApp.');
            });
          }
        }
      }

      setTimeout(() => {
        clearForm();
        setSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error saving records:', error);
      setError('Failed to save: ' + error.message);
      setSaving(false);
    }
  };

  // ✅ CLEAR FORM
  const clearForm = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userName = session?.user?.email?.split('@')[0] || 'User';
    
    setFormData({
      section_name: 'PVC',
      targets_id: '',
      machine_id: '',
      machine_no: '',
      shift_code: '',
      shift_name: '',
      operator_name: '',
      users_name: userName,
      remarks: '',
      target_qty: '',
      entry_date: new Date().toISOString().split('T')[0],
      production_date: new Date().toISOString().split('T')[0],
      unique_date_shift_machine_item: ''
    });
    setEntries([{
      id: Date.now(),
      item_code: '',
      item_name: '',
      raw_material_Spiralsize: '',
      material_type: 'PVC',
      finishedproductname: '',
      production_quantity: '',
      per_meter_wt: '',
      weight: '',
      unit: 'Meter',
      efficiency: 0
    }]);
    setSelectedTarget(null);
    setMachines([]);
    setValidationErrors({});
    setEntryErrors([]);
  };

  // ✅ CALCULATE TOTALS
  const calculateTotals = () => {
    return entries.reduce((acc, entry) => {
      acc.totalProduction += parseFloat(entry.production_quantity) || 0;
      acc.totalWeight += parseFloat(entry.weight) || 0;
      return acc;
    }, { totalProduction: 0, totalWeight: 0 });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  const totals = calculateTotals();
  const efficiencyData = calculateTotalEfficiency();
  const isMobile = window.innerWidth < 768;

  return (
    <div className={`pvc-form-container theme-${theme}`}>
      {/* SINGLE LINE HEADER WITH THEME TOGGLE */}
      <div className="single-line-header">
        <button
          onClick={() => navigate('/production-sections/pvc-coating')}
          className="header-back-btn glass-btn"
          title="Go back"
        >
          <FiArrowLeft size={20} />
        </button>
        
        <div className="header-icon-wrapper">
          <FiTarget size={22} className="header-icon" />
        </div>
        
        <div className="header-text-content">
          <h1 className="header-main-title">PVC Multi-Entry Form</h1>
          <p className="header-sub-title">Shift → Machine → Target • No Duplicates</p>
        </div>
        
        <button
          onClick={toggleTheme}
          className="header-theme-btn glass-btn"
          title={`Theme: ${theme}`}
        >
          {theme === 'light' && <FiSun size={18} />}
          {theme === 'dark' && <FiMoon size={18} />}
          {theme === 'cream' && <FiCoffee size={18} />}
        </button>
      </div>

      {/* WHATSAPP OPTION LINE */}
      <div className="whatsapp-option-line">
        <div className="whatsapp-toggle">
          <label className="toggle-label glass-btn">
            <input
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="toggle-checkbox"
            />
            <FiMessageCircle size={16} className="toggle-icon" />
            <span className="toggle-text">Send WhatsApp message after save</span>
          </label>
        </div>
        
        <button
          onClick={fetchAllData}
          className="refresh-button-primary glass-btn"
          title="Refresh all data"
        >
          <FiRefreshCw size={14} /> Refresh Data
        </button>
        
        <div className="info-badge glass-badge">
          <FiHash size={16} className="badge-icon" />
          <span className="badge-text">Items: {items.length}</span>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="success-message-container glass-success">
          <FiCheck size={20} className="success-icon" />
          <div className="success-content">
            <strong className="success-message-title">{success}</strong>
            <div className="success-message-subtitle">
              {sendWhatsApp && ' WhatsApp message sent!'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message-container glass-error">
          <FiAlertCircle size={20} className="error-icon" />
          <div className="error-content">
            <strong className="error-message-title">Error</strong>
            <div className="error-message-text">{error}</div>
          </div>
        </div>
      )}

      {/* Date Selection */}
      <div className="form-section-card glass-card">
        <div className="section-header-primary">
          <FiCalendar size={14} className="header-icon" /> DATE SELECTION
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <FiCalendar size={14} className="label-icon" /> Production Date *
          </label>
          <input
            type="date"
            value={formData.production_date}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              production_date: e.target.value,
              entry_date: new Date().toISOString().split('T')[0]
            }))}
            className={`form-control glass-input ${validationErrors.production_date ? 'has-error' : ''}`}
            max={new Date().toISOString().split('T')[0]}
          />
          {validationErrors.production_date && (
            <div className="error-text">{validationErrors.production_date}</div>
          )}
        </div>

        {/* ✅ ENTRY DATE - Display only */}
        <div className="form-group">
          <label className="form-label">
            <FiCalendar size={14} className="label-icon" /> Entry Date
          </label>
          <div className="readonly-display glass-display">
            <span className="display-value">{formData.entry_date || 'Loading...'}</span>
            <div className="display-hint">(Auto-filled, cannot change)</div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Selection Card */}
      <div className="form-section-card glass-card">
        <div className="section-header-primary">
          <FiClock size={14} className="header-icon" /> STEP SELECTION
        </div>

        {/* Step 1: Shift Selection */}
        <div className="form-group">
          <div className="step-indicator">
            <div className="step-circle step-1 glass-step">1</div>
            <label className="form-label">Select Shift *</label>
          </div>
          
          <select
            value={formData.shift_code}
            onChange={(e) => handleShiftChange(e.target.value)}
            className={`form-control glass-input ${validationErrors.shift_code ? 'has-error' : ''}`}
          >
            <option value="">Select Shift ({shifts.length})</option>
            {shifts.map((shift, index) => (
              <option key={index} value={shift.shift_code}>
                {shift.shift_code} - {shift.shift_name}
              </option>
            ))}
          </select>
          {validationErrors.shift_code && (
            <div className="error-text">{validationErrors.shift_code}</div>
          )}
        </div>

        {/* Step 2: Machine Selection */}
        {formData.shift_code && (
          <div className="form-group">
            <div className="step-indicator">
              <div className="step-circle step-2 glass-step">2</div>
              <label className="form-label">Select Machine *</label>
            </div>
            
            <select
              value={formData.machine_id}
              onChange={(e) => handleMachineChange(e.target.value)}
              className={`form-control glass-input ${validationErrors.machine_id ? 'has-error' : ''}`}
            >
              <option value="">Select Machine ({machines.length})</option>
              {machines.map((machine, index) => (
                <option key={index} value={machine.machine_id}>
                  Machine {machine.machine_id}
                </option>
              ))}
            </select>
            {validationErrors.machine_id && (
              <div className="error-text">{validationErrors.machine_id}</div>
            )}
          </div>
        )}

        {/* Target Display */}
        {selectedTarget && (
          <div className="form-group">
            <div className="step-indicator">
              <div className="step-circle step-3 glass-step">✓</div>
              <label className="form-label">Target Information</label>
            </div>
            <div className="target-display glass-target">
              <div className="target-grid">
                <div className="target-item">
                  <div className="target-label">Machine</div>
                  <div className="target-value">{selectedTarget.machine_id}</div>
                </div>
                
                <div className="target-item target-qty glass-highlight">
                  <div className="target-label">Target</div>
                  <div className="target-value target-highlight">{selectedTarget.target_qty || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="main-form">
        
        {/* Operator & User Details */}
        <div className="details-grid">
          
          {/* Operator Details */}
          <div className="form-section-card glass-card operator-card">
            <div className="section-header-primary">
              <FiUser size={14} className="header-icon" /> OPERATOR DETAILS
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiUser size={14} className="label-icon" /> Operator Name *
              </label>
              <input
                type="text"
                name="operator_name"
                value={formData.operator_name}
                onChange={(e) => setFormData(prev => ({ ...prev, operator_name: e.target.value }))}
                required
                className={`form-control glass-input ${validationErrors.operator_name ? 'has-error' : ''}`}
                placeholder="Enter operator name"
              />
              {validationErrors.operator_name && (
                <div className="error-text">{validationErrors.operator_name}</div>
              )}
            </div>

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">
                <FiClipboard size={14} className="label-icon" /> Remarks *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                required
                rows="3"
                className={`form-textarea glass-textarea ${validationErrors.remarks ? 'has-error' : ''}`}
                placeholder="Enter remarks"
              />
              {validationErrors.remarks && (
                <div className="error-text">{validationErrors.remarks}</div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="form-section-card glass-card user-card">
            <div className="section-header-primary">
              <FiUser size={14} className="header-icon" /> USER DETAILS
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiUser size={14} className="label-icon" /> User Name
              </label>
              <div className="readonly-display glass-display">
                <span className="display-value">{formData.users_name || 'Loading...'}</span>
                <div className="display-hint">(Auto-filled from login)</div>
              </div>
            </div>

            {/* Entry Date - Already shown above */}
            <div className="form-group">
              <label className="form-label">
                <FiCalendar size={14} className="label-icon" /> Entry Date
              </label>
              <div className="readonly-display glass-display">
                <span className="display-value">{formData.entry_date || 'Loading...'}</span>
                <div className="display-hint">(Auto-filled today's date)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Entries Section */}
        <div className="form-section-card glass-card">
          <div className="entries-header">
            <div className="section-header-primary entries-title">
              <FiPackage size={14} className="header-icon" /> ITEMS ({entries.length})
            </div>
            
            <button
              type="button"
              onClick={addEntryRow}
              className="add-item-btn glass-btn-primary"
              title="Add new item row"
            >
              <FiPlus size={14} className="btn-icon" /> Add Item
            </button>
          </div>

          {/* Entries List */}
          {entries.map((entry, index) => {
            const entryError = entryErrors.find(err => err.index === index);
            const isDuplicate = isEntryDuplicate(entry.item_code);
            
            return (
              <div key={entry.id} className={`entry-card ${isDuplicate ? 'duplicate glass-error' : 'glass-card'}`}>
                
                {/* Entry Header */}
                <div className="entry-header">
                  <div className={`entry-number ${isDuplicate ? 'duplicate' : 'glass-badge'}`}>
                    Item #{index + 1}
                  </div>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntryRow(entry.id)}
                      className="remove-btn glass-btn-danger"
                      title="Remove this item"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Entry Form */}
                <div className="entry-form">
                  
                  {/* Item Selection */}
                  <div className="form-group">
                    <label className="form-label">Item *</label>
                    <select
                      value={entry.item_code}
                      onChange={(e) => handleEntryChange(entry.id, 'item_code', e.target.value)}
                      className={`form-control glass-input ${isDuplicate ? 'has-error' : ''}`}
                    >
                      <option value="">Select Item</option>
                      {items.map((item, idx) => (
                        <option key={idx} value={item.item_code}>
                          {item.item_code} - {item.item_name.substring(0, 15)}...
                        </option>
                      ))}
                    </select>
                    {(entryError?.errors.item_code || isDuplicate) && (
                      <div className="error-text">
                        {entryError?.errors.item_code || 'Duplicate entry detected'}
                      </div>
                    )}
                  </div>

                  {/* Production Quantity */}
                  <div className="form-group">
                    <label className="form-label">Qty (Meter) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entry.production_quantity}
                      onChange={(e) => handleEntryChange(entry.id, 'production_quantity', e.target.value)}
                      className={`form-control glass-input ${entryError?.errors.production_quantity ? 'has-error' : ''}`}
                      placeholder="Enter quantity in meters"
                    />
                    {entryError?.errors.production_quantity && (
                      <div className="error-text">{entryError.errors.production_quantity}</div>
                    )}
                  </div>

                  {/* Per Meter Weight */}
                  <div className="form-group">
                    <label className="form-label">Wt (KG/M) *</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={entry.per_meter_wt}
                      onChange={(e) => handleEntryChange(entry.id, 'per_meter_wt', e.target.value)}
                      className={`form-control glass-input ${entryError?.errors.per_meter_wt ? 'has-error' : ''}`}
                      placeholder="Weight per meter"
                    />
                    {entryError?.errors.per_meter_wt && (
                      <div className="error-text">{entryError.errors.per_meter_wt}</div>
                    )}
                  </div>
                </div>

                {/* Item Details */}
                {entry.item_code && (
                  <div className="item-details-display glass-display">
                    <div className="detail-row">
                      <span className="detail-label">
                        <FiPackage size={12} className="detail-icon" /> Item:
                      </span>
                      <span className="detail-value item-name">{entry.item_code} - {entry.item_name.substring(0, 12)}...</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">
                        <FiTool size={12} className="detail-icon" /> Spiral:
                      </span>
                      <span className="detail-value">{entry.raw_material_Spiralsize || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">
                        <FiDroplet size={12} className="detail-icon" /> Weight:
                      </span>
                      <span className="detail-value weight-value">{entry.weight || '0.00'} KG</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">
                        <FiDatabase size={12} className="detail-icon" /> Unit:
                      </span>
                      <span className="detail-value unit-value">{entry.unit}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Target Summary */}
        {selectedTarget && (
          <div className="form-section-card glass-card summary-card">
            <div className="section-header-primary">
              <FiActivity size={14} className="header-icon" /> PRODUCTION SUMMARY
            </div>
            
            <div className="summary-grid">
              <div className="summary-item glass-summary">
                <div className="summary-label">Target</div>
                <div className="summary-value target-summary">{selectedTarget.target_qty || 0}</div>
                <div className="summary-unit">Meter</div>
              </div>

              <div className="summary-item glass-summary production-item">
                <div className="summary-label">Production</div>
                <div className="summary-value production-summary">{totals.totalProduction.toFixed(2)}</div>
                <div className="summary-unit">Meter</div>
              </div>

              <div className="summary-item glass-summary weight-summary">
                <div className="summary-label">Weight</div>
                <div className="summary-value weight-total">{totals.totalWeight.toFixed(2)}</div>
                <div className="summary-unit">KG</div>
              </div>

              <div className={`summary-item glass-summary efficiency-item efficiency-${efficiencyData.color}`}>
                <div className="summary-label">
                  <FiTrendingUp size={12} className="summary-icon" /> Efficiency
                </div>
                <div className="summary-value efficiency-value">{efficiencyData.efficiency.toFixed(2)}%</div>
                <div className="summary-unit">
                  {efficiencyData.color === 'high' ? 'Excellent' : 
                   efficiencyData.color === 'medium' ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Mobile Bottom Bar */}
      <div className="mobile-bottom-bar glass-bar">
        <button
          type="button"
          onClick={clearForm}
          className="bottom-bar-button clear glass-btn-warning"
          title="Clear all form data"
        >
          <FiRefreshCw size={16} className="btn-icon" /> Clear
        </button>
        
        <button
          type="button"
          onClick={() => navigate('/production-sections/pvc-coating')}
          className="bottom-bar-button cancel glass-btn-secondary"
          title="Cancel and go back"
        >
          <FiX size={16} className="btn-icon" /> Cancel
        </button>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={saving || entries.some(entry => isEntryDuplicate(entry.item_code))}
          className={`bottom-bar-button save ${entries.some(entry => isEntryDuplicate(entry.item_code)) ? 'glass-btn-warning' : 'glass-btn-primary'}`}
          title={entries.some(entry => isEntryDuplicate(entry.item_code)) ? "Fix duplicate entries first" : "Save all items"}
        >
          {saving ? (
            <>
              <div className="btn-spinner"></div>
              Saving...
            </>
          ) : entries.some(entry => isEntryDuplicate(entry.item_code)) ? (
            <>
              <FiAlertCircle size={16} className="btn-icon" />
              Fix Duplicates
            </>
          ) : (
            <>
              <FiSave size={16} className="btn-icon" />
              Save All
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PVCCoatingMultiEntryForm;