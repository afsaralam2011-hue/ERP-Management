// src/pages/ProductionSections/SpiralSection/SpiralForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiSave, FiX, FiArrowLeft,
  FiCheck, FiAlertCircle,
  FiCheckCircle, FiTarget, FiTrendingUp,
  FiPlusCircle, FiRefreshCw, FiCalendar
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useTheme } from '../../../contexts/ThemeContext';
import './SpiralForm.css';

const SpiralForm = () => {
  const navigate = useNavigate();
  const { mode, isDarkMode } = useTheme();
  
  // Initial form state
  const initialFormData = {
    section_name: 'Spiral',
    machine_id: '',
    machine_no: '',
    item_id: '',
    item_code: '',
    item_name: '',
    raw_material_flatsize: '',
    material_type: '',
    wire_size: '',
    finishedproductname: '',
    operator_name: '',
    production_quantity: '',
    per_meter_wt: '',
    weight: '',
    unit: 'Meter',
    efficiency: 0,
    users_name: '',
    shift_code: '',
    shift_name: '',
    target_qty: '',
    remarks: '',
    production_date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duplicateError, setDuplicateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filledFields, setFilledFields] = useState({});
  
  // Machine completion tracking
  const [machineCompletion, setMachineCompletion] = useState({
    totalMachines: 0,
    completedMachines: 0,
    completionPercentage: 0,
    entriesForDate: [],
    shiftMachines: []
  });
  
  // Dynamic data from Supabase
  const [shifts, setShifts] = useState([]);
  const [spiralItems, setSpiralItems] = useState([]);
  const [targetsData, setTargetsData] = useState([]);
  const [operators, setOperators] = useState([]);
  const [currentUser, setCurrentUser] = useState('');

  // Filtered machines based on selected shift
  const [filteredMachines, setFilteredMachines] = useState([]);
  
  // Current target for selected shift and machine
  const [currentTarget, setCurrentTarget] = useState(null);
  
  // Calculated fields
  const [calculatedWeight, setCalculatedWeight] = useState(0);
  const [calculatedEfficiency, setCalculatedEfficiency] = useState(0);

  // Get current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user.email || 'System');
          setFormData(prev => ({
            ...prev,
            users_name: user.email || 'System'
          }));
          setFilledFields(prev => ({
            ...prev,
            users_name: true
          }));
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setCurrentUser('System');
        setFormData(prev => ({
          ...prev,
          users_name: 'System'
        }));
        setFilledFields(prev => ({
          ...prev,
          users_name: true
        }));
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Function to clear the form after successful submission
  const clearForm = () => {
    setFormData({
      ...initialFormData,
      section_name: 'Spiral',
      users_name: currentUser,
      unit: 'Meter',
      production_date: new Date().toISOString().split('T')[0]
    });
    
    setFilledFields({
      section_name: true,
      users_name: true,
      production_date: true
    });
    
    setErrors({});
    setDuplicateError('');
    setCalculatedWeight(0);
    setCalculatedEfficiency(0);
    setCurrentTarget(null);
  };

  // Fetch entries for selected date using production_date
  const fetchEntriesForDate = useCallback(async (date, shiftCode = null) => {
    try {
      let query = supabase
        .from('spiralsection')
        .select('machine_id, shift_code, production_date')
        .eq('production_date', date);  // ✅ production_date استعمال کریں

      if (shiftCode) {
        query = query.eq('shift_code', shiftCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching entries for date:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchEntriesForDate:', error);
      return [];
    }
  }, []);

  // Calculate machine completion status for selected date
  const calculateMachineCompletion = useCallback((entriesForDate, shiftCode, targets) => {
    const shiftTargets = shiftCode 
      ? targets.filter(target => target.shift_code === shiftCode)
      : targets;
    
    const uniqueMachines = [...new Set(shiftTargets.map(target => target.machine_id))];
    const enteredMachines = [...new Set(entriesForDate.map(entry => entry.machine_id))];
    const completedMachines = enteredMachines.filter(machineId => 
      uniqueMachines.includes(machineId)
    ).length;
    
    const totalMachines = uniqueMachines.length;
    const completionPercentage = totalMachines > 0 ? (completedMachines / totalMachines) * 100 : 0;
    
    return {
      totalMachines,
      completedMachines,
      completionPercentage: Math.round(completionPercentage),
      entriesForDate: enteredMachines,
      shiftMachines: uniqueMachines
    };
  }, []);

  // Update machine completion when date, shift changes or targets load
  useEffect(() => {
    const updateMachineCompletion = async () => {
      if (targetsData.length === 0 || !formData.production_date) return;
      
      const entriesForDate = await fetchEntriesForDate(
        formData.production_date, 
        formData.shift_code
      );
      const completion = calculateMachineCompletion(
        entriesForDate, 
        formData.shift_code, 
        targetsData
      );
      
      setMachineCompletion(completion);
    };
    
    updateMachineCompletion();
  }, [formData.production_date, formData.shift_code, targetsData, fetchEntriesForDate, calculateMachineCompletion]);

  const fetchConfigurationData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time');
      
      const { data: spiralItemData } = await supabase
        .from('spiralitem')
        .select('*')
        .order('item_name');
      
      const { data: targetsData } = await supabase
        .from('targets')
        .select('*')
        .eq('section_name', 'Spiral')
        .eq('is_active', true)
        .order('machine_id');

      const { data: operatorsData } = await supabase
        .from('spiralsection')
        .select('operator_name')
        .order('operator_name');
      
      let uniqueOperators = [];
      if (operatorsData) {
        uniqueOperators = [...new Set(operatorsData.map(item => item.operator_name).filter(name => name))];
      }

      setShifts(shiftData || []);
      setSpiralItems(spiralItemData || []);
      setTargetsData(targetsData || []);
      setOperators(uniqueOperators);
      
    } catch (error) {
      console.error('Error fetching configuration:', error);
      setShifts([
        { id: 1, shift_code: 'D', shift_name: 'Day', start_time: '08:30:00', end_time: '22:30:00' },
        { id: 2, shift_code: 'N', shift_name: 'Night', start_time: '22:30:00', end_time: '08:30:00' },
        { id: 3, shift_code: 'E', shift_name: 'Evening', start_time: '16:00:00', end_time: '00:00:00' }
      ]);
      
      setSpiralItems([
        { 
          id: 1, 
          item_code: 'ITEM006', 
          item_name: '5.45mm2P', 
          raw_material_flatsize: 'T0.55_W3.40', 
          material_type: 'PVC', 
          wire_size: '1.65mm', 
          finishedproductname: '7mm2P',
          unit: 'Meter',
          per_meter_wt: 0.064
        },
        { 
          id: 2, 
          item_code: 'ITEM007', 
          item_name: '6.0mm2P', 
          raw_material_flatsize: 'T0.60_W3.50', 
          material_type: 'PVC', 
          wire_size: '1.70mm', 
          finishedproductname: '8mm2P',
          unit: 'Meter',
          per_meter_wt: 0.072
        }
      ]);
      
      setTargetsData([
        { 
          id: 1, 
          section_name: 'Spiral', 
          machine_id: 'SP # 01', 
          machine_no: '01', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 2, 
          section_name: 'Spiral', 
          machine_id: 'SP # 02', 
          machine_no: '02', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 15, 
          section_name: 'Spiral', 
          machine_id: 'SP # 01', 
          machine_no: '01', 
          shift_code: 'N', 
          shift_name: 'Night', 
          target_qty: 11000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 16, 
          section_name: 'Spiral', 
          machine_id: 'SP # 02', 
          machine_no: '02', 
          shift_code: 'N', 
          shift_name: 'Night', 
          target_qty: 11000, 
          uom: 'Meter', 
          is_active: true 
        }
      ]);
      
      setOperators(['Operator 1', 'Operator 2', 'Operator 3']);
      
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all configuration data
  useEffect(() => {
    fetchConfigurationData();
  }, [fetchConfigurationData]);

  // Filter machines when shift changes
  useEffect(() => {
    if (formData.shift_code && targetsData.length > 0) {
      const machinesForShift = targetsData.filter(target => 
        target.shift_code === formData.shift_code && 
        target.section_name === 'Spiral'
      );
      
      const uniqueMachines = machinesForShift.filter((machine, index, self) => 
        index === self.findIndex(m => 
          m.machine_id === machine.machine_id && 
          m.machine_no === machine.machine_no
        )
      );
      
      setFilteredMachines(uniqueMachines);
      
      if (formData.machine_id && !uniqueMachines.find(m => m.machine_id === formData.machine_id)) {
        setFormData(prev => ({
          ...prev,
          machine_id: '',
          machine_no: '',
          target_qty: ''
        }));
        setFilledFields(prev => ({
          ...prev,
          machine_id: false,
          machine_no: false,
          target_qty: false
        }));
      }
    } else {
      setFilteredMachines([]);
    }
  }, [formData.shift_code, formData.machine_id, targetsData]);

  // Find target when shift OR machine changes
  useEffect(() => {
    if (formData.shift_code && formData.machine_id && targetsData.length > 0) {
      const target = targetsData.find(t => 
        t.section_name === 'Spiral' &&
        t.machine_id === formData.machine_id &&
        t.shift_code === formData.shift_code
      );
      
      setCurrentTarget(target || null);
      
      if (target) {
        setFormData(prev => ({
          ...prev,
          machine_no: target.machine_no,
          target_qty: target.target_qty || ''
        }));
        setFilledFields(prev => ({
          ...prev,
          machine_no: true,
          target_qty: !!target.target_qty
        }));
      }
    } else {
      setCurrentTarget(null);
    }
  }, [formData.shift_code, formData.machine_id, formData.machine_no, targetsData]);

  // Calculate weight function
  const calculateWeight = useCallback(() => {
    const productionQty = parseFloat(formData.production_quantity) || 0;
    const perMeterWt = parseFloat(formData.per_meter_wt) || 0;
    
    if (productionQty > 0 && perMeterWt > 0) {
      const weight = productionQty * perMeterWt;
      return parseFloat(weight.toFixed(2));
    }
    return 0;
  }, [formData.production_quantity, formData.per_meter_wt]);

  // Calculate efficiency function
  const calculateEfficiency = useCallback(() => {
    const productionQty = parseFloat(formData.production_quantity) || 0;
    
    let efficiency = 0;

    if (currentTarget && currentTarget.target_qty > 0 && productionQty > 0) {
      efficiency = (productionQty / currentTarget.target_qty) * 100;
      efficiency = parseFloat(efficiency.toFixed(2));
    }
    
    return efficiency;
  }, [formData.production_quantity, currentTarget]);

  // Calculate all fields
  useEffect(() => {
    const weight = calculateWeight();
    const efficiency = calculateEfficiency();
    
    setCalculatedWeight(weight);
    setCalculatedEfficiency(efficiency);
  }, [calculateWeight, calculateEfficiency]);

  // Check for duplicate entry based on machine, shift, and production_date ONLY
  const checkDuplicateEntry = async () => {
    if (!formData.machine_id || !formData.shift_code || !formData.production_date) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('spiralsection')
        .select('id, machine_id, shift_code, production_date')
        .eq('machine_id', formData.machine_id)
        .eq('shift_code', formData.shift_code)
        .eq('production_date', formData.production_date);  // ✅ production_date استعمال کریں

      if (error) {
        console.error('Error checking duplicate:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in duplicate check:', error);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (duplicateError) {
      setDuplicateError('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
    
    if (value && value.toString().trim() !== '') {
      setFilledFields(prev => ({
        ...prev,
        [name]: true
      }));
    } else {
      setFilledFields(prev => ({
        ...prev,
        [name]: false
      }));
    }
    
    if (name === 'production_date') {
      setFormData(prev => ({
        ...prev,
        production_date: value
      }));
    }
    else if (name === 'shift_code') {
      const selectedShift = shifts.find(shift => shift.shift_code === value);
      setFormData(prev => ({
        ...prev,
        shift_code: value,
        shift_name: selectedShift ? selectedShift.shift_name : '',
        machine_id: '',
        machine_no: '',
        target_qty: '',
        item_id: '',
        item_code: '',
        item_name: '',
        raw_material_flatsize: '',
        material_type: '',
        wire_size: '',
        finishedproductname: '',
        per_meter_wt: ''
      }));
      if (value) {
        setFilledFields(prev => ({
          ...prev,
          shift_name: true,
          target_qty: false
        }));
      }
    } 
    else if (name === 'machine_id') {
      const selectedMachine = filteredMachines.find(m => m.machine_id === value);
      if (selectedMachine) {
        setFormData(prev => ({
          ...prev,
          machine_id: value,
          machine_no: selectedMachine.machine_no,
          target_qty: selectedMachine.target_qty || ''
        }));
        setFilledFields(prev => ({
          ...prev,
          machine_no: true,
          target_qty: !!selectedMachine.target_qty
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          machine_no: '',
          target_qty: ''
        }));
      }
    }
    else if (name === 'item_id') {
      const selectedItem = spiralItems.find(item => item.id.toString() === value);
      if (selectedItem) {
        setFormData(prev => ({
          ...prev,
          item_id: value,
          item_code: selectedItem.item_code || '',
          item_name: selectedItem.item_name || '',
          raw_material_flatsize: selectedItem.raw_material_flatsize || '',
          material_type: selectedItem.material_type || '',
          wire_size: selectedItem.wire_size || '',
          finishedproductname: selectedItem.finishedproductname || '',
          per_meter_wt: selectedItem.per_meter_wt || '',
          unit: 'Meter'
        }));
        const relatedFields = [
          'item_code', 'item_name', 'raw_material_flatsize', 'material_type', 
          'wire_size', 'finishedproductname', 'per_meter_wt'
        ];
        relatedFields.forEach(field => {
          setFilledFields(prev => ({
            ...prev,
            [field]: true
          }));
        });
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          item_code: '',
          item_name: '',
          raw_material_flatsize: '',
          material_type: '',
          wire_size: '',
          finishedproductname: '',
          per_meter_wt: ''
        }));
      }
    }
    else if (name === 'operator_name') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (value && !operators.includes(value)) {
        setOperators(prev => [...prev, value].sort());
      }
    }
    else if (name === 'target_qty') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Check if a field is filled and valid
  const getFieldStatus = (fieldName, value) => {
    const isFilled = filledFields[fieldName] || (value && value.toString().trim() !== '');
    const hasError = errors[fieldName];
    
    return {
      isFilled,
      hasError,
      isRequired: ['machine_id', 'item_id', 'production_quantity', 'shift_code', 'operator_name', 'target_qty', 'production_date'].includes(fieldName)
    };
  };

  // Get field CSS class based on status
  const getFieldClass = (fieldName, value, isSelect = false) => {
    const status = getFieldStatus(fieldName, value);
    let className = isSelect ? 'form-select' : 'form-input';
    
    if (status.hasError) {
      className += ' form-input-error';
    } else if (status.isFilled) {
      className += ' form-input-filled';
    }
    
    return className;
  };

  // Get display field class
  const getDisplayFieldClass = (fieldName, value) => {
    const status = getFieldStatus(fieldName, value);
    let className = 'display-field';
    
    if (status.isFilled) {
      className += ' display-field-filled';
    }
    
    return className;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.section_name.trim()) newErrors.section_name = 'Section name is required';
    if (!formData.machine_id.trim()) newErrors.machine_id = 'Machine ID is required';
    if (!formData.machine_no.trim()) newErrors.machine_no = 'Machine number is required';
    if (!formData.item_id) newErrors.item_id = 'Item selection is required';
    if (!formData.item_name.trim()) newErrors.item_name = 'Item name is required';
    if (!formData.item_code.trim()) newErrors.item_code = 'Item code is required';
    if (!formData.production_quantity) {
      newErrors.production_quantity = 'Production quantity is required';
    } else if (isNaN(formData.production_quantity) || formData.production_quantity <= 0) {
      newErrors.production_quantity = 'Please enter a valid positive number';
    }
    if (!formData.shift_code) newErrors.shift_code = 'Shift is required';
    if (!formData.operator_name.trim()) newErrors.operator_name = 'Operator name is required';
    if (!formData.target_qty) {
      newErrors.target_qty = 'Target quantity is required';
    } else if (isNaN(formData.target_qty) || formData.target_qty <= 0) {
      newErrors.target_qty = 'Please enter a valid target quantity';
    }
    if (!formData.production_date) {
      newErrors.production_date = 'Production date is required';
    } else {
      const selectedDate = new Date(formData.production_date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.production_date = 'Production date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const isDuplicate = await checkDuplicateEntry();
    if (isDuplicate) {
      setDuplicateError(`This machine (${formData.machine_id}) already has an entry for ${formData.shift_name} shift on ${formData.production_date}. Only one entry per machine per shift per day is allowed.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedItem = spiralItems.find(item => item.id.toString() === formData.item_id);
      
      const recordData = {
        section_name: formData.section_name.trim(),
        machine_id: formData.machine_id.trim(),
        machine_no: formData.machine_no.trim(),
        item_id: parseInt(formData.item_id),
        item_code: formData.item_code.trim(),
        item_name: formData.item_name.trim(),
        raw_material_flatsize: formData.raw_material_flatsize.trim(),
        material_type: formData.material_type.trim(),
        wire_size: formData.wire_size.trim(),
        finishedproductname: formData.finishedproductname.trim(),
        operator_name: formData.operator_name.trim(),
        production_quantity: parseFloat(formData.production_quantity),
        per_meter_wt: parseFloat(formData.per_meter_wt) || 0,
        target_qty: parseFloat(formData.target_qty) || 0,
        weight: calculatedWeight,
        unit: 'Meter',
        efficiency: calculatedEfficiency,
        users_name: currentUser,
        shift_code: formData.shift_code,
        shift_name: formData.shift_name,
        production_date: formData.production_date,
        remarks: formData.remarks.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('spiralsection')
        .insert([recordData]);

      if (error) throw error;
      
      // Refresh machine completion status after successful submission
      const entriesForDate = await fetchEntriesForDate(formData.production_date, formData.shift_code);
      const completion = calculateMachineCompletion(
        entriesForDate, 
        formData.shift_code, 
        targetsData
      );
      setMachineCompletion(completion);
      
      setSuccessMessage(`✅ Record saved successfully for ${formData.machine_id} - ${formData.operator_name} on ${formData.production_date}!`);
      
      setTimeout(() => {
        clearForm();
        setSuccessMessage('');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create record. Please try again. Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/production-sections/spiral');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields to default?')) {
      clearForm();
    }
  };

  const handleAddNew = () => {
    clearForm();
    setSuccessMessage('');
  };

  // Function to get machine status icon
  const getMachineStatusIcon = (machineId) => {
    const isCompleted = machineCompletion.entriesForDate.includes(machineId);
    return isCompleted ? (
      <FiCheckCircle className="machine-icon-completed" />
    ) : (
      <div className="machine-icon-pending" />
    );
  };

  if (loading) {
    return (
      <div className={`spiral-form-container loading-container ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading configuration data from database...</p>
      </div>
    );
  }

  // Filter shifts to only show those that have targets in Spiral section
  const availableShifts = shifts.filter(shift => 
    targetsData.some(target => 
      target.shift_code === shift.shift_code && 
      target.section_name === 'Spiral'
    )
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`spiral-form-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="form-header">
        <button
          onClick={() => navigate('/production-sections/spiral')}
          className="back-button"
        >
          <FiArrowLeft /> Back to Spiral Section
        </button>
        <h1 className="form-title">
          New Spiral Section Record
        </h1>
        <p className="form-subtitle">
          Production in Meter | Weight in KG | Targets from targets table | Date Selection Enabled
        </p>
        <p className="form-note">
          Note: Only one entry per machine per shift per day is allowed
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <div className="success-content">
            <FiCheckCircle className="success-icon" />
            <div className="success-details">
              <strong className="success-title">Success!</strong>
              <div className="success-description">{successMessage}</div>
              <div className="success-hint">Form cleared. Ready for next entry...</div>
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage('')}
            className="close-message-button"
          >
            ✕
          </button>
        </div>
      )}

      {/* Machine Completion Tracker */}
      {formData.shift_code && formData.production_date && (
        <div className="completion-tracker">
          <div className="tracker-header">
            <div className="tracker-title">
              <FiTarget className="tracker-icon" />
              <div className="tracker-text">
                <div className="tracker-main-title">
                  {formData.shift_name} Shift Machine Completion
                </div>
                <div className="tracker-subtitle">
                  {formData.production_date === new Date().toISOString().split('T')[0] 
                    ? "Today's progress" 
                    : `Progress for ${formatDate(formData.production_date)}`}
                </div>
              </div>
            </div>
            
            <div className={`completion-badge ${machineCompletion.completionPercentage === 100 ? 'completion-badge-full' : ''}`}>
              {machineCompletion.completedMachines} / {machineCompletion.totalMachines} Machines
              <span className="completion-percentage">
                ({machineCompletion.completionPercentage}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div className={`progress-fill ${machineCompletion.completionPercentage === 100 ? 'progress-fill-complete' : ''}`} 
                 style={{ width: `${machineCompletion.completionPercentage}%` }} />
            
            {/* Machine markers */}
            <div className="machine-markers">
              {machineCompletion.totalMachines > 0 && 
                Array.from({ length: machineCompletion.totalMachines }).map((_, index) => {
                  const position = ((index + 0.5) / machineCompletion.totalMachines) * 100;
                  const isCompleted = index < machineCompletion.completedMachines;
                  
                  return (
                    <div
                      key={index}
                      className={`machine-marker ${isCompleted ? 'machine-marker-completed' : ''}`}
                      style={{ left: `${position}%` }}
                    >
                      {isCompleted && (
                        <div className="marker-check">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Machine List */}
          {machineCompletion.shiftMachines.length > 0 && (
            <div className="machine-list-container">
              <div className="machine-list-header">
                <span className="machine-list-title">Machine Status:</span>
                <div className="machine-list-counts">
                  <span className="completed-count">
                    {machineCompletion.completedMachines} Completed
                  </span>
                  <span className="count-separator">•</span>
                  <span className="pending-count">
                    {machineCompletion.totalMachines - machineCompletion.completedMachines} Pending
                  </span>
                </div>
              </div>
              
              <div className="machine-grid">
                {machineCompletion.shiftMachines.map((machineId, index) => {
                  const isCompleted = machineCompletion.entriesForDate.includes(machineId);
                  const isCurrentMachine = machineId === formData.machine_id;
                  
                  const statusClass = isCurrentMachine 
                    ? 'machine-status-current' 
                    : isCompleted 
                      ? 'machine-status-completed' 
                      : 'machine-status-item';
                  
                  return (
                    <div
                      key={machineId}
                      className={`machine-status ${statusClass}`}
                    >
                      {getMachineStatusIcon(machineId)}
                      <span className="machine-name">{machineId}</span>
                      {isCurrentMachine && (
                        <div className="current-machine-indicator" />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Completion Message */}
              {machineCompletion.completionPercentage === 100 && (
                <div className="all-completed-message">
                  <FiCheckCircle className="all-completed-icon" />
                  <span className="all-completed-text">
                    All machines completed for {formData.shift_name} shift on {formData.production_date}! Great work! 🎉
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="main-form">
        <div className="form-content">
          
          {/* Duplicate Entry Error Message */}
          {duplicateError && (
            <div className="error-message">
              <div className="error-icon">
                !
              </div>
              <div className="error-content">
                <strong className="error-title">Duplicate Entry Detected!</strong>
                <div className="error-description">{duplicateError}</div>
                <div className="error-suggestion">
                  Please check existing records or select a different machine/shift/date.
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Basic Information with Production Date */}
          <div className="form-section">
            <h3 className="section-title">
              Basic Information
            </h3>
            <div className="form-grid">
              {/* Production Date */}
              <div className="form-field">
                <label className="form-label">
                  Production Date *
                  {getFieldStatus('production_date', formData.production_date).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus('production_date', formData.production_date).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="input-with-icon">
                  <input
                    type="date"
                    name="production_date"
                    value={formData.production_date}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={getFieldClass('production_date', formData.production_date)}
                  />
                  <FiCalendar className="date-icon" />
                  {getFieldStatus('production_date', formData.production_date).isFilled && (
                    <div className="field-checkmark">
                      ✓
                    </div>
                  )}
                </div>
                {errors.production_date && <div className="error-text">{errors.production_date}</div>}
                <div className="field-hint">
                  Select any past date for historical data entry (cannot be future date)
                </div>
              </div>

              {/* Section Name */}
              <div className="form-field">
                <label className="form-label">
                  Section Name
                  {getFieldStatus('section_name', formData.section_name).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayFieldClass('section_name', formData.section_name)}>
                  {formData.section_name}
                </div>
              </div>

              {/* Shift Code */}
              <div className="form-field">
                <label className="form-label">
                  Shift *
                  {getFieldStatus('shift_code', formData.shift_code).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus('shift_code', formData.shift_code).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="select-with-indicator">
                  <select
                    name="shift_code"
                    value={formData.shift_code}
                    onChange={handleChange}
                    className={getFieldClass('shift_code', formData.shift_code, true)}
                  >
                    <option value="">Select shift</option>
                    {availableShifts.map(shift => (
                      <option key={shift.id} value={shift.shift_code}>
                        {shift.shift_name} ({shift.shift_code})
                      </option>
                    ))}
                  </select>
                  {getFieldStatus('shift_code', formData.shift_code).isFilled && (
                    <div className="select-checkmark">✓</div>
                  )}
                </div>
                {errors.shift_code && <div className="error-text">{errors.shift_code}</div>}
              </div>
            </div>
            
            {/* Shift Name - moved to second row */}
            <div className="form-grid shift-name-row">
              {/* Shift Name */}
              <div className="form-field">
                <label className="form-label">
                  Shift Name
                  {getFieldStatus('shift_name', formData.shift_name).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayFieldClass('shift_name', formData.shift_name)}>
                  {formData.shift_name || 'Select Shift first'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Machine Details */}
          <div className="form-section">
            <h3 className="section-title">
              Machine Details
            </h3>
            <div className="form-grid">
              {/* Machine ID */}
              <div className="form-field">
                <label className="form-label">
                  Machine ID *
                  {getFieldStatus('machine_id', formData.machine_id).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus('machine_id', formData.machine_id).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="select-with-indicator">
                  <select
                    name="machine_id"
                    value={formData.machine_id}
                    onChange={handleChange}
                    disabled={!formData.shift_code}
                    className={getFieldClass('machine_id', formData.machine_id, true)}
                    style={{
                      opacity: formData.shift_code ? 1 : 0.6,
                      cursor: formData.shift_code ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <option value="">
                      {formData.shift_code 
                        ? `Select machine for ${formData.shift_name} shift` 
                        : 'Select Shift first'}
                    </option>
                    {filteredMachines.map(machine => (
                      <option key={`${machine.machine_id}-${machine.machine_no}`} value={machine.machine_id}>
                        {machine.machine_id} (No: {machine.machine_no})
                      </option>
                    ))}
                  </select>
                  {getFieldStatus('machine_id', formData.machine_id).isFilled && (
                    <div className="select-checkmark">✓</div>
                  )}
                </div>
                {errors.machine_id && <div className="error-text">{errors.machine_id}</div>}
              </div>

              {/* Machine Number */}
              <div className="form-field">
                <label className="form-label">
                  Machine Number
                  {getFieldStatus('machine_no', formData.machine_no).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayFieldClass('machine_no', formData.machine_no)}>
                  {formData.machine_no || 'Select Machine ID first'}
                </div>
              </div>

              {/* Target Quantity */}
              <div className="form-field">
                <label className="form-label">
                  Target Quantity *
                  {getFieldStatus('target_qty', formData.target_qty).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus('target_qty', formData.target_qty).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="target_qty"
                    value={formData.target_qty}
                    onChange={handleChange}
                    placeholder="Auto-filled from targets"
                    min="0.01"
                    step="0.01"
                    disabled={!formData.machine_id}
                    className={getFieldClass('target_qty', formData.target_qty)}
                  />
                  <div className="input-unit">
                    Meter
                  </div>
                </div>
                {errors.target_qty && <div className="error-text">{errors.target_qty}</div>}
                <div className="field-hint">
                  Auto-filled from targets table when machine is selected
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Item Details */}
          <div className="form-section">
            <h3 className="section-title">
              Item Details
            </h3>
            <div className="form-grid">
              {/* Item ID Selection */}
              <div className="form-field">
                <label className="form-label">
                  Select Item *
                  {getFieldStatus('item_id', formData.item_id).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus('item_id', formData.item_id).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="select-with-indicator">
                  <select
                    name="item_id"
                    value={formData.item_id}
                    onChange={handleChange}
                    className={getFieldClass('item_id', formData.item_id, true)}
                  >
                    <option value="">Select item by ID</option>
                    {spiralItems.map(item => (
                      <option key={item.id} value={item.id}>
                        ID: {item.id} - {item.item_name}
                      </option>
                    ))}
                  </select>
                  {getFieldStatus('item_id', formData.item_id).isFilled && (
                    <div className="select-checkmark">✓</div>
                  )}
                </div>
                {errors.item_id && <div className="error-text">{errors.item_id}</div>}
              </div>

              {/* Item Code */}
              <div className="form-field">
                <label className="form-label">
                  Item Code
                  {getFieldStatus('item_code', formData.item_code).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayFieldClass('item_code', formData.item_code)}>
                  {formData.item_code || 'Select Item first'}
                </div>
              </div>

              {/* Item Name */}
              <div className="form-field">
                <label className="form-label">
                  Item Name
                  {getFieldStatus('item_name', formData.item_name).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayFieldClass('item_name', formData.item_name)}>
                  {formData.item_name || 'Select Item first'}
                </div>
              </div>

              {/* Finished Product Name */}
              <div className="form-field">
                <label className="form-label">
                  Finished Product Name
                  {getFieldStatus('finishedproductname', formData.finishedproductname).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayFieldClass('finishedproductname', formData.finishedproductname)}>
                  {formData.finishedproductname || 'Select Item first'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Production Details */}
          <div className="form-section">
            <h3 className="section-title">
              Production Details
            </h3>
            <div className="form-grid">
              {/* Production Quantity */}
              <div className="form-field">
                <label className="form-label">
                  Production Quantity (Meter) *
                  {getFieldStatus('production_quantity', formData.production_quantity).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus('production_quantity', formData.production_quantity).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="production_quantity"
                    value={formData.production_quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    min="0.01"
                    step="0.01"
                    className={getFieldClass('production_quantity', formData.production_quantity)}
                  />
                  <div className="input-unit">
                    Meter
                  </div>
                </div>
                {errors.production_quantity && <div className="error-text">{errors.production_quantity}</div>}
              </div>

              {/* Per Meter Weight */}
              <div className="form-field">
                <label className="form-label">
                  Per Meter Weight
                  {getFieldStatus('per_meter_wt', formData.per_meter_wt).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="per_meter_wt"
                    value={formData.per_meter_wt}
                    onChange={handleChange}
                    placeholder="0.0000"
                    min="0"
                    step="0.0001"
                    className={getFieldClass('per_meter_wt', formData.per_meter_wt)}
                  />
                  <div className="input-unit">
                    KG
                  </div>
                </div>
              </div>

              {/* Unit */}
              <div className="form-field">
                <label className="form-label">Unit</label>
                <div className="unit-display">
                  Meter
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Auto-Calculations */}
          <div className="form-section">
            <h3 className="section-title">
              Auto-Calculations
            </h3>
            
            <div className={`calculation-box ${calculatedWeight > 0 || calculatedEfficiency > 0 ? 'calculation-box-active' : ''}`}>
              <div className="calculation-grid">
                {/* Weight Calculation */}
                <div className={`calculation-item ${calculatedWeight > 0 ? 'calculation-item-active' : ''}`}>
                  <div className="calculation-label">
                    Calculated Weight
                  </div>
                  <div className="calculation-value">
                    {calculatedWeight > 0 ? calculatedWeight.toFixed(2) : '0.00'} 
                    <span className="calculation-unit">KG</span>
                  </div>
                </div>

                {/* Efficiency Display */}
                <div className={`calculation-item ${calculatedEfficiency > 0 ? 'calculation-item-active' : ''}`}>
                  <div className="calculation-label">
                    Efficiency
                  </div>
                  <div className="calculation-value">
                    {calculatedEfficiency > 0 ? calculatedEfficiency.toFixed(2) : '0.00'}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Operator Details */}
          <div className="form-section">
            <h3 className="section-title">
              Operator Details
            </h3>
            <div className="form-grid">
              {/* Operator Name */}
              <div className="form-field">
                <label className="form-label">
                  Operator Name *
                  {getFieldStatus('operator_name', formData.operator_name).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus('operator_name', formData.operator_name).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="input-with-datalist">
                  <input
                    type="text"
                    name="operator_name"
                    value={formData.operator_name}
                    onChange={handleChange}
                    placeholder="Enter or select operator name"
                    list="operatorSuggestions"
                    className={getFieldClass('operator_name', formData.operator_name)}
                  />
                  <datalist id="operatorSuggestions">
                    {operators.map((operator, index) => (
                      <option key={index} value={operator} />
                    ))}
                  </datalist>
                </div>
                {errors.operator_name && <div className="error-text">{errors.operator_name}</div>}
              </div>

              {/* User Name */}
              <div className="form-field">
                <label className="form-label">
                  User Name
                  {getFieldStatus('users_name', currentUser).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <input
                  type="text"
                  name="users_name"
                  value={currentUser}
                  disabled
                  className={getFieldClass('users_name', currentUser)}
                />
                <div className="field-hint">
                  Auto-filled from logged-in user
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Remarks */}
          <div className="form-section">
            <h3 className="section-title">
              Additional Information
            </h3>
            <div className="form-field">
              <label className="form-label">
                Remarks
                {getFieldStatus('remarks', formData.remarks).isFilled && (
                  <FiCheck className="success-indicator" />
                )}
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter any additional notes or remarks..."
                rows="3"
                className={getFieldClass('remarks', formData.remarks)}
              />
            </div>
          </div>

          {/* Form Completion Status */}
          <div className="completion-status">
            <div className="completion-header">
              <div className="completion-title">
                <FiTrendingUp className="completion-icon" />
                <div className="completion-label">Form Completion Status</div>
              </div>
              <div className="completion-count">
                {Object.values(filledFields).filter(Boolean).length} of {Object.keys(formData).length} fields filled
              </div>
            </div>
            <div className="completion-progress-bar">
              <div className="completion-progress-fill" 
                   style={{ width: `${(Object.values(filledFields).filter(Boolean).length / Object.keys(formData).length) * 100}%` }} />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <div className="button-group">
              <button
                type="button"
                onClick={handleReset}
                className="form-button button-reset"
              >
                <FiRefreshCw className="button-icon" /> Reset
              </button>

              <button
                type="button"
                onClick={handleAddNew}
                className="form-button button-new"
              >
                <FiPlusCircle className="button-icon" /> New Entry
              </button>
            </div>

            <div className="button-group">
              <button
                type="button"
                onClick={handleCancel}
                className="form-button button-cancel"
              >
                <FiX className="button-icon" /> Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="form-button button-submit"
              >
                {isSubmitting ? (
                  <>
                    <div className="submit-spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="button-icon" /> Save & Continue
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SpiralForm;