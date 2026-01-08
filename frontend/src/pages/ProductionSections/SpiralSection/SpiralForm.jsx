// src/pages/ProductionSections/SpiralSection/SpiralForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiSave, FiX, FiArrowLeft,
  FiSettings, FiCheck, FiAlertCircle,
  FiCheckCircle, FiTarget, FiTrendingUp
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const SpiralForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    section_name: 'Spiral',
    machine_id: '',
    machine_no: '',
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
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duplicateError, setDuplicateError] = useState('');
  
  // Track which fields have been filled
  const [filledFields, setFilledFields] = useState({});
  
  // Machine completion tracking
  const [machineCompletion, setMachineCompletion] = useState({
    totalMachines: 0,
    completedMachines: 0,
    completionPercentage: 0,
    todayEntries: [],
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
          // Mark user_name as filled
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

  // Fetch today's machine entries to track completion
  const fetchTodayEntries = useCallback(async (shiftCode = null) => {
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      let query = supabase
        .from('spiralsection')
        .select('machine_id, shift_code')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (shiftCode) {
        query = query.eq('shift_code', shiftCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching today entries:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in fetchTodayEntries:', error);
      return [];
    }
  }, []);

  // Calculate machine completion status
  const calculateMachineCompletion = useCallback((todayEntries, shiftCode, targets) => {
    // Filter targets for current shift
    const shiftTargets = shiftCode 
      ? targets.filter(target => target.shift_code === shiftCode)
      : targets;
    
    // Get unique machines for this shift
    const uniqueMachines = [...new Set(shiftTargets.map(target => target.machine_id))];
    
    // Get machines already entered today
    const enteredMachines = [...new Set(todayEntries.map(entry => entry.machine_id))];
    
    // Calculate completion
    const completedMachines = enteredMachines.filter(machineId => 
      uniqueMachines.includes(machineId)
    ).length;
    
    const totalMachines = uniqueMachines.length;
    const completionPercentage = totalMachines > 0 ? (completedMachines / totalMachines) * 100 : 0;
    
    return {
      totalMachines,
      completedMachines,
      completionPercentage: Math.round(completionPercentage),
      todayEntries: enteredMachines,
      shiftMachines: uniqueMachines
    };
  }, []);

  // Update machine completion when shift changes or targets load
  useEffect(() => {
    const updateMachineCompletion = async () => {
      if (targetsData.length === 0) return;
      
      const todayEntries = await fetchTodayEntries(formData.shift_code);
      const completion = calculateMachineCompletion(
        todayEntries, 
        formData.shift_code, 
        targetsData
      );
      
      setMachineCompletion(completion);
    };
    
    updateMachineCompletion();
  }, [formData.shift_code, targetsData, fetchTodayEntries, calculateMachineCompletion]);

  const fetchConfigurationData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch shifts
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time');
      
      // 2. Fetch spiral items
      const { data: spiralItemData } = await supabase
        .from('spiralitem')
        .select('*')
        .order('item_name');
      
      // 3. Fetch targets for Spiral section
      const { data: targetsData } = await supabase
        .from('targets')
        .select('*')
        .eq('section_name', 'Spiral')
        .eq('is_active', true)
        .order('machine_id');

      // 4. Fetch operators from spiralsection table
      const { data: operatorsData } = await supabase
        .from('spiralsection')
        .select('operator_name')
        .order('operator_name');
      
      // Get unique operator names
      let uniqueOperators = [];
      if (operatorsData) {
        uniqueOperators = [...new Set(operatorsData.map(item => item.operator_name).filter(name => name))];
      }

      // Set data to state
      setShifts(shiftData || []);
      setSpiralItems(spiralItemData || []);
      setTargetsData(targetsData || []);
      setOperators(uniqueOperators);
      
    } catch (error) {
      console.error('Error fetching configuration:', error);
      // Fallback to static data
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
          id: 3, 
          section_name: 'Spiral', 
          machine_id: 'SP # 03', 
          machine_no: '03', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 4, 
          section_name: 'Spiral', 
          machine_id: 'SP # 04', 
          machine_no: '04', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 5, 
          section_name: 'Spiral', 
          machine_id: 'SP # 05', 
          machine_no: '05', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 6, 
          section_name: 'Spiral', 
          machine_id: 'SP # 06', 
          machine_no: '06', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 7, 
          section_name: 'Spiral', 
          machine_id: 'SP # 07', 
          machine_no: '07', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 8, 
          section_name: 'Spiral', 
          machine_id: 'SP # 08', 
          machine_no: '08', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 9, 
          section_name: 'Spiral', 
          machine_id: 'SP # 09', 
          machine_no: '09', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 10, 
          section_name: 'Spiral', 
          machine_id: 'SP # 10', 
          machine_no: '10', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 11, 
          section_name: 'Spiral', 
          machine_id: 'SP # 11', 
          machine_no: '11', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 12, 
          section_name: 'Spiral', 
          machine_id: 'SP # 12', 
          machine_no: '12', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 13, 
          section_name: 'Spiral', 
          machine_id: 'SP # 13', 
          machine_no: '13', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 14, 
          section_name: 'Spiral', 
          machine_id: 'SP # 14', 
          machine_no: '14', 
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
          machine_no: ''
        }));
        setFilledFields(prev => ({
          ...prev,
          machine_id: false,
          machine_no: false
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
      
      if (target && target.machine_no !== formData.machine_no) {
        setFormData(prev => ({
          ...prev,
          machine_no: target.machine_no
        }));
        setFilledFields(prev => ({
          ...prev,
          machine_no: true
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

  // Check for duplicate entry before submitting
  const checkDuplicateEntry = async () => {
    if (!formData.machine_id || !formData.shift_code) {
      return false;
    }

    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('spiralsection')
        .select('*')
        .eq('machine_id', formData.machine_id)
        .eq('shift_code', formData.shift_code)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

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
    
    // Clear duplicate error when user changes data
    if (duplicateError) {
      setDuplicateError('');
    }
    
    // Mark field as filled if it has value
    if (value && value.trim() !== '') {
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
    
    if (name === 'shift_code') {
      const selectedShift = shifts.find(shift => shift.shift_code === value);
      setFormData(prev => ({
        ...prev,
        shift_code: value,
        shift_name: selectedShift ? selectedShift.shift_name : '',
        machine_id: '',
        machine_no: ''
      }));
      // Mark shift_name as filled if shift selected
      if (value) {
        setFilledFields(prev => ({
          ...prev,
          shift_name: true
        }));
      }
    } 
    else if (name === 'machine_id') {
      const selectedMachine = filteredMachines.find(m => m.machine_id === value);
      setFormData(prev => ({
        ...prev,
        machine_id: value,
        machine_no: selectedMachine ? selectedMachine.machine_no : ''
      }));
      // Mark machine_no as filled if machine selected
      if (value && selectedMachine) {
        setFilledFields(prev => ({
          ...prev,
          machine_no: true
        }));
      }
    }
    else if (name === 'item_code') {
      const selectedItem = spiralItems.find(item => item.item_code === value);
      if (selectedItem) {
        setFormData(prev => ({
          ...prev,
          item_code: value,
          item_name: selectedItem.item_name || '',
          raw_material_flatsize: selectedItem.raw_material_flatsize || '',
          material_type: selectedItem.material_type || '',
          wire_size: selectedItem.wire_size || '',
          finishedproductname: selectedItem.finishedproductname || '',
          per_meter_wt: selectedItem.per_meter_wt || '',
          unit: 'Meter'
        }));
        // Mark all related fields as filled
        const relatedFields = [
          'item_name', 'raw_material_flatsize', 'material_type', 
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
          [name]: value
        }));
      }
    }
    else if (name === 'operator_name') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Add new operator to list if not already present
      if (value && !operators.includes(value)) {
        setOperators(prev => [...prev, value].sort());
      }
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
      // Required fields validation
      isRequired: ['machine_id', 'item_code', 'production_quantity', 'shift_code', 'operator_name'].includes(fieldName)
    };
  };

  // Get field style based on status
  const getFieldStyle = (fieldName, value, isSelect = false) => {
    const status = getFieldStatus(fieldName, value);
    
    if (status.hasError) {
      return {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
        color: '#7f1d1d'
      };
    }
    
    if (status.isFilled) {
      return {
        borderColor: '#10b981',
        backgroundColor: '#d1fae5',
        color: '#065f46',
        fontSize: '15px',
        fontWeight: '600'
      };
    }
    
    if (status.isRequired) {
      return {
        borderColor: '#fecaca',
        backgroundColor: '#f8fafc'
      };
    }
    
    return {};
  };

  // Get display div style
  const getDisplayStyle = (fieldName, value) => {
    const status = getFieldStatus(fieldName, value);
    
    if (status.isFilled) {
      return {
        border: '2px solid #10b981',
        backgroundColor: '#d1fae5',
        color: '#065f46',
        fontSize: '15px',
        fontWeight: '600',
        padding: '14px 15px'
      };
    }
    
    return {
      border: '1px solid #e5e7eb',
      backgroundColor: '#f8fafc',
      color: '#9ca3af'
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.section_name.trim()) newErrors.section_name = 'Section name is required';
    if (!formData.machine_id.trim()) newErrors.machine_id = 'Machine ID is required';
    if (!formData.machine_no.trim()) newErrors.machine_no = 'Machine number is required';
    if (!formData.item_code) newErrors.item_code = 'Item code is required';
    if (!formData.item_name.trim()) newErrors.item_name = 'Item name is required';
    if (!formData.production_quantity) {
      newErrors.production_quantity = 'Production quantity is required';
    } else if (isNaN(formData.production_quantity) || formData.production_quantity <= 0) {
      newErrors.production_quantity = 'Please enter a valid positive number';
    }
    if (!formData.shift_code) newErrors.shift_code = 'Shift is required';
    if (!formData.operator_name.trim()) newErrors.operator_name = 'Operator name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check for duplicate entry
    const isDuplicate = await checkDuplicateEntry();
    if (isDuplicate) {
      setDuplicateError(`This machine (${formData.machine_id}) already has an entry for ${formData.shift_name} shift today. Only one entry per machine per shift per day is allowed.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const recordData = {
        section_name: formData.section_name.trim(),
        machine_id: formData.machine_id.trim(),
        machine_no: formData.machine_no.trim(),
        item_code: formData.item_code,
        item_name: formData.item_name.trim(),
        raw_material_flatsize: formData.raw_material_flatsize.trim(),
        material_type: formData.material_type.trim(),
        wire_size: formData.wire_size.trim(),
        finishedproductname: formData.finishedproductname.trim(),
        operator_name: formData.operator_name.trim(),
        production_quantity: parseFloat(formData.production_quantity),
        per_meter_wt: parseFloat(formData.per_meter_wt) || 0,
        weight: calculatedWeight,
        unit: 'Meter',
        efficiency: calculatedEfficiency,
        users_name: currentUser,
        shift_code: formData.shift_code,
        shift_name: formData.shift_name,
        remarks: formData.remarks.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('spiralsection')
        .insert([recordData]);

      if (error) throw error;
      
      // Refresh machine completion status after successful submission
      const todayEntries = await fetchTodayEntries(formData.shift_code);
      const completion = calculateMachineCompletion(
        todayEntries, 
        formData.shift_code, 
        targetsData
      );
      setMachineCompletion(completion);
      
      alert('Spiral section record created successfully!');
      navigate('/production-sections/spiral');
      
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
      setFormData(prev => ({
        ...prev,
        machine_id: '',
        machine_no: '',
        item_code: '',
        item_name: '',
        raw_material_flatsize: '',
        material_type: '',
        wire_size: '',
        finishedproductname: '',
        operator_name: '',
        production_quantity: '',
        per_meter_wt: '',
        shift_code: '',
        shift_name: '',
        remarks: ''
      }));
      setErrors({});
      setDuplicateError('');
      setFilteredMachines([]);
      setCurrentTarget(null);
      setCalculatedWeight(0);
      setCalculatedEfficiency(0);
      setFilledFields({});
    }
  };

  // Function to get machine status icon
  const getMachineStatusIcon = (machineId) => {
    const isCompleted = machineCompletion.todayEntries.includes(machineId);
    return isCompleted ? (
      <FiCheckCircle style={{ color: '#10b981', marginRight: '8px' }} />
    ) : (
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#e5e7eb',
        marginRight: '8px'
      }} />
    );
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '50px', 
        textAlign: 'center', 
        color: '#64748b' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #e2e8f0',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p>Loading configuration data from database...</p>
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

  return (
    <div style={{ 
      padding: '0', 
      maxWidth: '1200px', 
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        marginBottom: '20px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => navigate('/production-sections/spiral')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            marginBottom: '15px',
            padding: '0'
          }}
        >
          <FiArrowLeft /> Back to Spiral Section
        </button>
        <h1 style={{
          margin: '0',
          fontSize: '24px',
          color: '#1e293b'
        }}>
          New Spiral Section Record
        </h1>
        <p style={{ 
          margin: '8px 0 0', 
          color: '#64748b',
          fontSize: '14px'
        }}>
          Production in Meter | Weight in KG | Targets from targets table
        </p>
        <p style={{ 
          margin: '4px 0 0', 
          color: '#ef4444',
          fontSize: '13px',
          fontWeight: '500'
        }}>
          Note: Only one entry per machine per shift per day is allowed
        </p>
      </div>

      {/* Machine Completion Tracker - TOP BAR */}
      {formData.shift_code && (
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTarget style={{ color: '#3b82f6', fontSize: '20px' }} />
              <div>
                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '16px' }}>
                  {formData.shift_name} Shift Machine Completion
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  Today's progress for selected shift
                </div>
              </div>
            </div>
            
            <div style={{
              background: machineCompletion.completionPercentage === 100 ? '#d1fae5' : '#f0f9ff',
              border: machineCompletion.completionPercentage === 100 ? '2px solid #10b981' : '2px solid #0ea5e9',
              padding: '8px 15px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '14px',
              color: machineCompletion.completionPercentage === 100 ? '#065f46' : '#0369a1'
            }}>
              {machineCompletion.completedMachines} / {machineCompletion.totalMachines} Machines
              <span style={{ marginLeft: '8px' }}>
                ({machineCompletion.completionPercentage}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            height: '12px',
            background: '#f1f5f9',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '12px',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              background: machineCompletion.completionPercentage === 100 
                ? 'linear-gradient(90deg, #10b981, #34d399)' 
                : 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
              width: `${machineCompletion.completionPercentage}%`,
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }} />
            
            {/* Machine markers */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex'
            }}>
              {machineCompletion.totalMachines > 0 && 
                Array.from({ length: machineCompletion.totalMachines }).map((_, index) => {
                  const position = ((index + 0.5) / machineCompletion.totalMachines) * 100;
                  const isCompleted = index < machineCompletion.completedMachines;
                  
                  return (
                    <div
                      key={index}
                      style={{
                        position: 'absolute',
                        left: `${position}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: isCompleted ? '#10b981' : '#e2e8f0',
                        border: isCompleted ? '2px solid white' : '2px solid #f8fafc',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isCompleted && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
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
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#64748b',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Machine Status:</span>
                <span>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>
                    {machineCompletion.completedMachines} Completed
                  </span>
                  {' • '}
                  <span style={{ color: '#ef4444', fontWeight: '700' }}>
                    {machineCompletion.totalMachines - machineCompletion.completedMachines} Pending
                  </span>
                </span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '8px',
                maxHeight: '120px',
                overflowY: 'auto',
                padding: '10px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}>
                {machineCompletion.shiftMachines.map((machineId, index) => {
                  const isCompleted = machineCompletion.todayEntries.includes(machineId);
                  const isCurrentMachine = machineId === formData.machine_id;
                  
                  return (
                    <div
                      key={machineId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: isCurrentMachine 
                          ? '#dbeafe' 
                          : isCompleted 
                            ? '#d1fae5' 
                            : 'white',
                        border: isCurrentMachine
                          ? '2px solid #3b82f6'
                          : isCompleted
                            ? '2px solid #10b981'
                            : '1px solid #e5e7eb',
                        fontSize: '12px',
                        fontWeight: isCurrentMachine ? '700' : (isCompleted ? '600' : '500'),
                        color: isCurrentMachine
                          ? '#1e40af'
                          : isCompleted
                            ? '#065f46'
                            : '#64748b'
                      }}
                    >
                      {getMachineStatusIcon(machineId)}
                      <span>{machineId}</span>
                      {isCurrentMachine && (
                        <div style={{
                          marginLeft: 'auto',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          animation: 'pulse 1.5s infinite'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Completion Message */}
              {machineCompletion.completionPercentage === 100 && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: 'linear-gradient(90deg, #d1fae5, #a7f3d0)',
                  border: '2px solid #10b981',
                  borderRadius: '6px',
                  color: '#065f46',
                  fontWeight: '600',
                  fontSize: '13px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <FiCheckCircle size={16} />
                  All machines completed for {formData.shift_name} shift! Great work! 🎉
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white',
          padding: '20px'
        }}>
          
          {/* Duplicate Entry Error Message */}
          {duplicateError && (
            <div style={{
              background: '#fee2e2',
              border: '2px solid #ef4444',
              borderRadius: '6px',
              padding: '12px 15px',
              marginBottom: '20px',
              color: '#b91c1c',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: '#ef4444',
                borderRadius: '50%',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>!</div>
              <div>
                <strong>Duplicate Entry Detected!</strong>
                <div style={{ marginTop: '5px' }}>{duplicateError}</div>
                <div style={{ marginTop: '5px', fontSize: '13px' }}>
                  Please check existing records or select a different machine/shift.
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#1e293b',
              paddingBottom: '8px',
              borderBottom: '1px solid #d1d5db',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Basic Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {/* Section Name */}
              <div>
                <label style={labelStyle}>
                  Section Name
                  {getFieldStatus('section_name', formData.section_name).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  ...getDisplayStyle('section_name', formData.section_name),
                  fontWeight: '500'
                }}>
                  {formData.section_name}
                </div>
              </div>

              {/* Shift Code */}
              <div>
                <label style={labelStyle}>
                  Shift *
                  {getFieldStatus('shift_code', formData.shift_code).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('shift_code', formData.shift_code).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="shift_code"
                    value={formData.shift_code}
                    onChange={handleChange}
                    style={{
                      ...selectStyle(getFieldStatus('shift_code', formData.shift_code).hasError),
                      ...getFieldStyle('shift_code', formData.shift_code, true)
                    }}
                  >
                    <option value="">Select shift</option>
                    {availableShifts.map(shift => (
                      <option key={shift.id} value={shift.shift_code}>
                        {shift.shift_name} ({shift.shift_code})
                      </option>
                    ))}
                  </select>
                  {getFieldStatus('shift_code', formData.shift_code).isFilled && (
                    <div style={{
                      position: 'absolute',
                      right: '35px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#10b981',
                      fontWeight: 'bold'
                    }}>✓</div>
                  )}
                </div>
                {errors.shift_code && <ErrorText text={errors.shift_code} />}
              </div>

              {/* Shift Name */}
              <div>
                <label style={labelStyle}>
                  Shift Name
                  {getFieldStatus('shift_name', formData.shift_name).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  ...getDisplayStyle('shift_name', formData.shift_name),
                  fontWeight: '500'
                }}>
                  {formData.shift_name || 'Select Shift first'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Machine Details */}
          <div style={{ 
            marginBottom: '25px',
            paddingTop: '10px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Machine Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {/* Machine ID */}
              <div>
                <label style={labelStyle}>
                  Machine ID *
                  {getFieldStatus('machine_id', formData.machine_id).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('machine_id', formData.machine_id).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="machine_id"
                    value={formData.machine_id}
                    onChange={handleChange}
                    disabled={!formData.shift_code}
                    style={{
                      ...selectStyle(getFieldStatus('machine_id', formData.machine_id).hasError),
                      ...getFieldStyle('machine_id', formData.machine_id, true),
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
                    <div style={{
                      position: 'absolute',
                      right: '35px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#10b981',
                      fontWeight: 'bold'
                    }}>✓</div>
                  )}
                </div>
                {errors.machine_id && <ErrorText text={errors.machine_id} />}
              </div>

              {/* Machine Number */}
              <div>
                <label style={labelStyle}>
                  Machine Number
                  {getFieldStatus('machine_no', formData.machine_no).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  ...getDisplayStyle('machine_no', formData.machine_no),
                  fontWeight: '500'
                }}>
                  {formData.machine_no || 'Select Machine ID first'}
                </div>
              </div>

              {/* Target Display */}
              <div>
                <label style={labelStyle}>Shift Target</label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: currentTarget ? '2px solid #10b981' : '1px solid #e5e7eb',
                  background: currentTarget ? '#d1fae5' : '#f8fafc',
                  fontSize: currentTarget ? '15px' : '14px',
                  color: currentTarget ? '#065f46' : '#9ca3af',
                  fontWeight: currentTarget ? '600' : '500'
                }}>
                  {currentTarget 
                    ? `${currentTarget.target_qty.toLocaleString()} ${currentTarget.uom || 'Meter'}`
                    : 'Select Shift and Machine'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Item Details */}
          <div style={{ 
            marginBottom: '25px',
            paddingTop: '10px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Item Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {/* Item Code */}
              <div>
                <label style={labelStyle}>
                  Item Code *
                  {getFieldStatus('item_code', formData.item_code).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('item_code', formData.item_code).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="item_code"
                    value={formData.item_code}
                    onChange={handleChange}
                    style={{
                      ...selectStyle(getFieldStatus('item_code', formData.item_code).hasError),
                      ...getFieldStyle('item_code', formData.item_code, true)
                    }}
                  >
                    <option value="">Select item code</option>
                    {spiralItems.map(item => (
                      <option key={item.id} value={item.item_code}>
                        {item.item_code} - {item.item_name}
                      </option>
                    ))}
                  </select>
                  {getFieldStatus('item_code', formData.item_code).isFilled && (
                    <div style={{
                      position: 'absolute',
                      right: '35px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#10b981',
                      fontWeight: 'bold'
                    }}>✓</div>
                  )}
                </div>
                {errors.item_code && <ErrorText text={errors.item_code} />}
              </div>

              {/* Item Name */}
              <div>
                <label style={labelStyle}>
                  Item Name
                  {getFieldStatus('item_name', formData.item_name).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  ...getDisplayStyle('item_name', formData.item_name),
                  fontWeight: '500'
                }}>
                  {formData.item_name || 'Select Item Code first'}
                </div>
              </div>

              {/* Finished Product Name */}
              <div>
                <label style={labelStyle}>
                  Finished Product Name
                  {getFieldStatus('finishedproductname', formData.finishedproductname).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  ...getDisplayStyle('finishedproductname', formData.finishedproductname),
                  fontWeight: '500'
                }}>
                  {formData.finishedproductname || 'Select Item Code first'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Production Details */}
          <div style={{ 
            marginBottom: '25px',
            paddingTop: '10px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Production Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {/* Production Quantity */}
              <div>
                <label style={labelStyle}>
                  Production Quantity (Meter) *
                  {getFieldStatus('production_quantity', formData.production_quantity).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('production_quantity', formData.production_quantity).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    name="production_quantity"
                    value={formData.production_quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    min="0.01"
                    step="0.01"
                    style={{
                      ...inputStyle(getFieldStatus('production_quantity', formData.production_quantity).hasError),
                      ...getFieldStyle('production_quantity', formData.production_quantity),
                      paddingRight: '70px'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: getFieldStatus('production_quantity', formData.production_quantity).isFilled ? '#065f46' : '#6b7280',
                    fontWeight: '500',
                    fontSize: getFieldStatus('production_quantity', formData.production_quantity).isFilled ? '14px' : '13px'
                  }}>
                    Meter
                  </div>
                </div>
                {errors.production_quantity && <ErrorText text={errors.production_quantity} />}
              </div>

              {/* Per Meter Weight */}
              <div>
                <label style={labelStyle}>
                  Per Meter Weight
                  {getFieldStatus('per_meter_wt', formData.per_meter_wt).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    name="per_meter_wt"
                    value={formData.per_meter_wt}
                    onChange={handleChange}
                    placeholder="0.0000"
                    min="0"
                    step="0.0001"
                    style={{
                      ...inputStyle(),
                      ...getFieldStyle('per_meter_wt', formData.per_meter_wt),
                      paddingRight: '45px'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: getFieldStatus('per_meter_wt', formData.per_meter_wt).isFilled ? '#065f46' : '#6b7280',
                    fontWeight: '500',
                    fontSize: getFieldStatus('per_meter_wt', formData.per_meter_wt).isFilled ? '14px' : '13px'
                  }}>
                    KG
                  </div>
                </div>
              </div>

              {/* Unit */}
              <div>
                <label style={labelStyle}>Unit</label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '2px solid #10b981',
                  background: '#d1fae5',
                  fontSize: '15px',
                  color: '#065f46',
                  fontWeight: '600'
                }}>
                  Meter
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Auto-Calculations */}
          <div style={{ 
            marginBottom: '25px',
            paddingTop: '10px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Auto-Calculations
            </h3>
            
            <div style={{
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              background: calculatedWeight > 0 || calculatedEfficiency > 0 ? '#ecfdf5' : '#f8fafc'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                {/* Weight Calculation */}
                <div style={{
                  background: calculatedWeight > 0 ? '#d1fae5' : '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  border: calculatedWeight > 0 ? '2px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: calculatedWeight > 0 ? '#065f46' : '#6b7280', 
                    marginBottom: '5px', 
                    fontWeight: '600'
                  }}>
                    Calculated Weight
                  </div>
                  <div style={{ 
                    fontSize: calculatedWeight > 0 ? '20px' : '18px', 
                    fontWeight: calculatedWeight > 0 ? '800' : '700', 
                    color: calculatedWeight > 0 ? '#065f46' : '#374151'
                  }}>
                    {calculatedWeight > 0 ? calculatedWeight.toFixed(2) : '0.00'} 
                    <span style={{ 
                      fontSize: calculatedWeight > 0 ? '16px' : '14px', 
                      fontWeight: '600',
                      color: calculatedWeight > 0 ? '#065f46' : '#374151'
                    }}> KG</span>
                  </div>
                </div>

                {/* Efficiency Display */}
                <div style={{
                  background: calculatedEfficiency > 0 ? '#d1fae5' : '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  border: calculatedEfficiency > 0 ? '2px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: calculatedEfficiency > 0 ? '#065f46' : '#6b7280',
                    marginBottom: '5px',
                    fontWeight: '600'
                  }}>
                    Efficiency
                  </div>
                  <div style={{ 
                    fontSize: calculatedEfficiency > 0 ? '20px' : '18px', 
                    fontWeight: calculatedEfficiency > 0 ? '800' : '700', 
                    color: calculatedEfficiency > 0 ? '#065f46' : '#374151'
                  }}>
                    {calculatedEfficiency > 0 ? calculatedEfficiency.toFixed(2) : '0.00'}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Operator Details */}
          <div style={{ 
            marginBottom: '25px',
            paddingTop: '10px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Operator Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {/* Operator Name with datalist for suggestions */}
              <div>
                <label style={labelStyle}>
                  Operator Name *
                  {getFieldStatus('operator_name', formData.operator_name).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('operator_name', formData.operator_name).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="operator_name"
                    value={formData.operator_name}
                    onChange={handleChange}
                    placeholder="Enter or select operator name"
                    list="operatorSuggestions"
                    style={{
                      ...inputStyle(getFieldStatus('operator_name', formData.operator_name).hasError),
                      ...getFieldStyle('operator_name', formData.operator_name)
                    }}
                  />
                  <datalist id="operatorSuggestions">
                    {operators.map((operator, index) => (
                      <option key={index} value={operator} />
                    ))}
                  </datalist>
                </div>
                {errors.operator_name && <ErrorText text={errors.operator_name} />}
              </div>

              {/* User Name - Auto-filled and disabled */}
              <div>
                <label style={labelStyle}>
                  User Name
                  {getFieldStatus('users_name', currentUser).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <input
                  type="text"
                  name="users_name"
                  value={currentUser}
                  disabled
                  style={{
                    ...inputStyle(),
                    ...getFieldStyle('users_name', currentUser),
                    background: getFieldStatus('users_name', currentUser).isFilled ? '#d1fae5' : '#f3f4f6',
                    cursor: 'not-allowed'
                  }}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: getFieldStatus('users_name', currentUser).isFilled ? '#065f46' : '#6b7280', 
                  marginTop: '5px',
                  fontWeight: getFieldStatus('users_name', currentUser).isFilled ? '600' : '400'
                }}>
                  Auto-filled from logged-in user
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Remarks */}
          <div style={{ 
            marginBottom: '25px',
            paddingTop: '10px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#1e293b',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Additional Information
            </h3>
            <div>
              <label style={labelStyle}>
                Remarks
                {getFieldStatus('remarks', formData.remarks).isFilled && (
                  <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                )}
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter any additional notes or remarks..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: getFieldStatus('remarks', formData.remarks).isFilled ? '2px solid #10b981' : '1px solid #e5e7eb',
                  background: getFieldStatus('remarks', formData.remarks).isFilled ? '#d1fae5' : '#f8fafc',
                  fontSize: getFieldStatus('remarks', formData.remarks).isFilled ? '15px' : '14px',
                  color: getFieldStatus('remarks', formData.remarks).isFilled ? '#065f46' : '#1f2937',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  fontWeight: getFieldStatus('remarks', formData.remarks).isFilled ? '500' : '400'
                }}
              />
            </div>
          </div>

          {/* Form Completion Status */}
          <div style={{
            background: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '25px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiTrendingUp style={{ color: '#0ea5e9' }} />
                <div style={{ fontWeight: '600', color: '#0369a1', fontSize: '15px' }}>
                  Form Completion Status
                </div>
              </div>
              <div style={{ fontWeight: '700', color: '#0369a1', fontSize: '16px' }}>
                {Object.values(filledFields).filter(Boolean).length} of {Object.keys(formData).length} fields filled
              </div>
            </div>
            <div style={{
              height: '8px',
              background: '#e0f2fe',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: '#0ea5e9',
                width: `${(Object.values(filledFields).filter(Boolean).length / Object.keys(formData).length) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: '2px solid #d1d5db',
                padding: '10px 20px',
                borderRadius: '6px',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              <FiSettings size={16} /> Reset
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'transparent',
                  border: '2px solid #fca5a5',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                <FiX size={16} /> Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#9ca3af' : '#10b981',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={16} /> Save Record
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 20px !important;
          }
          
          h3 {
            font-size: 16px !important;
          }
          
          /* Machine completion tracker mobile adjustments */
          div[style*="justify-content: space-between"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          
          div[style*="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))"] {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)) !important;
          }
        }
        
        /* Better mobile input styles */
        input, select, textarea {
          font-size: 16px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* Larger touch targets for mobile */
        button, select, input[type="text"], input[type="number"] {
          min-height: 44px;
        }
        
        /* Green filled field animations */
        input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        /* Transition effects */
        input, select, textarea, div[style*="border"] {
          transition: all 0.3s ease;
        }
        
        /* Scrollbar styling for machine list */
        div[style*="overflow-y: auto"]::-webkit-scrollbar {
          width: 6px;
        }
        
        div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

// Reusable styles
const labelStyle = {
  marginBottom: '6px',
  fontWeight: '600',
  color: '#374151',
  fontSize: '13px',
  display: 'block'
};

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  background: '#f8fafc',
  fontSize: '14px',
  color: '#1f2937',
  outline: 'none',
  boxSizing: 'border-box'
});

const selectStyle = (hasError) => ({
  width: '100%',
  padding: '10px 12px',
  paddingRight: '35px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  background: '#f8fafc',
  fontSize: '14px',
  color: '#1f2937',
  outline: 'none',
  boxSizing: 'border-box',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '14px'
});

const ErrorText = ({ text }) => (
  <div style={{ 
    color: '#ef4444', 
    fontSize: '12px', 
    marginTop: '4px',
    fontWeight: '500'
  }}>
    {text}
  </div>
);

export default SpiralForm;