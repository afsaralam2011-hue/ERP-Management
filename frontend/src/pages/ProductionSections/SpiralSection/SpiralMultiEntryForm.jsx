// src/pages/ProductionSections/SpiralSection/SpiralMultiEntryForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiSave, FiX, FiArrowLeft,
  FiSettings, FiCheck, FiAlertCircle,
  FiTarget,
  FiPlus, FiTrash2, FiList, FiCalendar
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const SpiralMultiEntryForm = () => {
  const navigate = useNavigate();
  
  const [items, setItems] = useState([
    {
      id: 1,
      item_code: '',
      item_name: '',
      raw_material_flatsize: '',
      material_type: '',
      wire_size: '',
      finishedproductname: '',
      production_quantity: '',
      per_meter_wt: '',
      weight: 0,
      unit: 'Meter'
    }
  ]);

  const [commonData, setCommonData] = useState({
    section_name: 'Spiral',
    machine_id: '',
    machine_no: '',
    operator_name: '',
    users_name: '',
    shift_code: '',
    shift_name: '',
    production_date: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState([{}]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duplicateError, setDuplicateError] = useState('');
  
  const [filledFields, setFilledFields] = useState({});
  
  const [machineCompletion, setMachineCompletion] = useState({
    totalMachines: 0,
    completedMachines: 0,
    completionPercentage: 0,
    entriesForDate: [],
    shiftMachines: []
  });
  
  const [shifts, setShifts] = useState([]);
  const [spiralItems, setSpiralItems] = useState([]);
  const [targetsData, setTargetsData] = useState([]);
  const [operators, setOperators] = useState([]);
  const [currentUser, setCurrentUser] = useState('');

  const [filteredMachines, setFilteredMachines] = useState([]);
  const [currentTarget, setCurrentTarget] = useState(null);
  
  const [totalProduction, setTotalProduction] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [overallEfficiency, setOverallEfficiency] = useState(0);

  // Get current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user.email || 'System');
          setCommonData(prev => ({
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
        setCommonData(prev => ({
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

  // Fetch entries for selected date using production_date
  const fetchEntriesForDate = useCallback(async (date, shiftCode = null) => {
    try {
      let query = supabase
        .from('spiralsection')
        .select('machine_id, shift_code, production_date')
        .eq('production_date', date);

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
      if (targetsData.length === 0 || !commonData.production_date) return;
      
      const entriesForDate = await fetchEntriesForDate(
        commonData.production_date, 
        commonData.shift_code
      );
      const completion = calculateMachineCompletion(
        entriesForDate, 
        commonData.shift_code, 
        targetsData
      );
      
      setMachineCompletion(completion);
    };
    
    updateMachineCompletion();
  }, [commonData.production_date, commonData.shift_code, targetsData, fetchEntriesForDate, calculateMachineCompletion]);

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
      // Fallback data
      setShifts([
        { id: 1, shift_code: 'D', shift_name: 'Day', start_time: '08:30:00', end_time: '22:30:00' },
        { id: 2, shift_code: 'N', shift_name: 'Night', start_time: '22:30:00', end_time: '08:30:00' },
        { id: 3, shift_code: 'E', shift_name: 'Evening', start_time: '16:00:00', end_time: '00:00:00' }
      ]);
      
      setSpiralItems([
        { 
          id: 1, 
          item_code: 'ITEM001', 
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
          item_code: 'ITEM002', 
          item_name: '4.0mm2P', 
          raw_material_flatsize: 'T0.45_W2.80', 
          material_type: 'PVC', 
          wire_size: '1.45mm', 
          finishedproductname: '5.5mm2P',
          unit: 'Meter',
          per_meter_wt: 0.048
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
    if (commonData.shift_code && targetsData.length > 0) {
      const machinesForShift = targetsData.filter(target => 
        target.shift_code === commonData.shift_code && 
        target.section_name === 'Spiral'
      );
      
      const uniqueMachines = machinesForShift.filter((machine, index, self) => 
        index === self.findIndex(m => 
          m.machine_id === machine.machine_id && 
          m.machine_no === machine.machine_no
        )
      );
      
      setFilteredMachines(uniqueMachines);
      
      if (commonData.machine_id && !uniqueMachines.find(m => m.machine_id === commonData.machine_id)) {
        setCommonData(prev => ({
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
  }, [commonData.shift_code, commonData.machine_id, targetsData]);

  // Find target when shift OR machine changes
  useEffect(() => {
    if (commonData.shift_code && commonData.machine_id && targetsData.length > 0) {
      const target = targetsData.find(t => 
        t.section_name === 'Spiral' &&
        t.machine_id === commonData.machine_id &&
        t.shift_code === commonData.shift_code
      );
      
      setCurrentTarget(target || null);
      
      if (target && target.machine_no !== commonData.machine_no) {
        setCommonData(prev => ({
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
  }, [commonData.shift_code, commonData.machine_id, commonData.machine_no, targetsData]);

  // Calculate total production, weight and efficiency
  useEffect(() => {
    let totalProd = 0;
    let totalWt = 0;
    
    items.forEach(item => {
      const productionQty = parseFloat(item.production_quantity) || 0;
      const perMeterWt = parseFloat(item.per_meter_wt) || 0;
      
      totalProd += productionQty;
      
      if (productionQty > 0 && perMeterWt > 0) {
        totalWt += productionQty * perMeterWt;
      }
    });
    
    let efficiency = 0;
    if (currentTarget && currentTarget.target_qty > 0 && totalProd > 0) {
      efficiency = (totalProd / currentTarget.target_qty) * 100;
      efficiency = parseFloat(efficiency.toFixed(2));
    }
    
    setTotalProduction(parseFloat(totalProd.toFixed(2)));
    setTotalWeight(parseFloat(totalWt.toFixed(2)));
    setOverallEfficiency(efficiency);
  }, [items, currentTarget]);

  // Add new item row
  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems(prev => [
      ...prev,
      {
        id: newId,
        item_code: '',
        item_name: '',
        raw_material_flatsize: '',
        material_type: '',
        wire_size: '',
        finishedproductname: '',
        production_quantity: '',
        per_meter_wt: '',
        weight: 0,
        unit: 'Meter'
      }
    ]);
    setItemErrors(prev => [...prev, {}]);
  };

  // Remove item row
  const removeItem = (id) => {
    if (items.length <= 1) {
      alert('At least one item is required');
      return;
    }
    
    setItems(prev => prev.filter(item => item.id !== id));
    setItemErrors(prev => prev.filter((_, index) => {
      const itemIndex = items.findIndex(item => item.id === id);
      return index !== itemIndex;
    }));
  };

  // Handle common data changes
  const handleCommonChange = (e) => {
    const { name, value } = e.target;
    
    if (duplicateError) {
      setDuplicateError('');
    }
    
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
      setCommonData(prev => ({
        ...prev,
        shift_code: value,
        shift_name: selectedShift ? selectedShift.shift_name : '',
        machine_id: '',
        machine_no: ''
      }));
      if (value) {
        setFilledFields(prev => ({
          ...prev,
          shift_name: true
        }));
      }
    } 
    else if (name === 'machine_id') {
      const selectedMachine = filteredMachines.find(m => m.machine_id === value);
      setCommonData(prev => ({
        ...prev,
        machine_id: value,
        machine_no: selectedMachine ? selectedMachine.machine_no : ''
      }));
      if (value && selectedMachine) {
        setFilledFields(prev => ({
          ...prev,
          machine_no: true
        }));
      }
    }
    else if (name === 'operator_name') {
      setCommonData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (value && !operators.includes(value)) {
        setOperators(prev => [...prev, value].sort());
      }
    }
    else {
      setCommonData(prev => ({
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

  // Handle item changes
  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'item_code') {
          const selectedItem = spiralItems.find(spItem => spItem.item_code === value);
          if (selectedItem) {
            updatedItem.item_name = selectedItem.item_name || '';
            updatedItem.raw_material_flatsize = selectedItem.raw_material_flatsize || '';
            updatedItem.material_type = selectedItem.material_type || '';
            updatedItem.wire_size = selectedItem.wire_size || '';
            updatedItem.finishedproductname = selectedItem.finishedproductname || '';
            updatedItem.per_meter_wt = selectedItem.per_meter_wt || '';
          }
        }
        
        if (field === 'production_quantity' || field === 'per_meter_wt') {
          const productionQty = parseFloat(field === 'production_quantity' ? value : updatedItem.production_quantity) || 0;
          const perMeterWt = parseFloat(field === 'per_meter_wt' ? value : updatedItem.per_meter_wt) || 0;
          
          if (productionQty > 0 && perMeterWt > 0) {
            updatedItem.weight = parseFloat((productionQty * perMeterWt).toFixed(2));
          } else {
            updatedItem.weight = 0;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
    
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex >= 0 && itemErrors[itemIndex]?.[field]) {
      setItemErrors(prev => {
        const newErrors = [...prev];
        newErrors[itemIndex] = { ...newErrors[itemIndex], [field]: '' };
        return newErrors;
      });
    }
  };

  // Get field status for common data
  const getFieldStatus = (fieldName, value) => {
    const isFilled = filledFields[fieldName] || (value && value.toString().trim() !== '');
    const hasError = errors[fieldName];
    
    return {
      isFilled,
      hasError,
      isRequired: ['machine_id', 'shift_code', 'operator_name', 'production_date'].includes(fieldName)
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const newItemErrors = items.map(() => ({}));
    let isValid = true;
    
    if (!commonData.section_name.trim()) {
      newErrors.section_name = 'Section name is required';
      isValid = false;
    }
    if (!commonData.machine_id.trim()) {
      newErrors.machine_id = 'Machine ID is required';
      isValid = false;
    }
    if (!commonData.shift_code) {
      newErrors.shift_code = 'Shift is required';
      isValid = false;
    }
    if (!commonData.production_date) {
      newErrors.production_date = 'Production date is required';
      isValid = false;
    }
    if (!commonData.operator_name.trim()) {
      newErrors.operator_name = 'Operator name is required';
      isValid = false;
    }
    
    items.forEach((item, index) => {
      if (!item.item_code) {
        newItemErrors[index].item_code = 'Item code is required';
        isValid = false;
      }
      if (!item.production_quantity) {
        newItemErrors[index].production_quantity = 'Production quantity is required';
        isValid = false;
      } else if (isNaN(item.production_quantity) || parseFloat(item.production_quantity) <= 0) {
        newItemErrors[index].production_quantity = 'Please enter a valid positive number';
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    setItemErrors(newItemErrors);
    return isValid;
  };

  // Check for duplicate entry based on machine, shift, and production_date ONLY
  const checkDuplicateEntry = async () => {
    if (!commonData.machine_id || !commonData.shift_code || !commonData.production_date) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('spiralsection')
        .select('id, machine_id, shift_code, production_date')
        .eq('machine_id', commonData.machine_id)
        .eq('shift_code', commonData.shift_code)
        .eq('production_date', commonData.production_date);

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

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const isDuplicate = await checkDuplicateEntry();
    if (isDuplicate) {
      setDuplicateError(
        `This machine (${commonData.machine_id}) already has an entry for ${commonData.shift_name} shift on ${commonData.production_date}. ` +
        `Only one entry per machine per shift per day is allowed.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const records = items.map(item => ({
        section_name: commonData.section_name.trim(),
        machine_id: commonData.machine_id.trim(),
        machine_no: commonData.machine_no.trim(),
        item_code: item.item_code,
        item_name: item.item_name.trim(),
        raw_material_flatsize: item.raw_material_flatsize.trim(),
        material_type: item.material_type.trim(),
        wire_size: item.wire_size.trim(),
        finishedproductname: item.finishedproductname.trim(),
        operator_name: commonData.operator_name.trim(),
        production_quantity: parseFloat(item.production_quantity),
        per_meter_wt: parseFloat(item.per_meter_wt) || 0,
        weight: item.weight,
        unit: 'Meter',
        efficiency: overallEfficiency,
        users_name: currentUser,
        shift_code: commonData.shift_code,
        shift_name: commonData.shift_name,
        production_date: commonData.production_date,
        remarks: commonData.remarks.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('spiralsection')
        .insert(records);

      if (error) throw error;
      
      alert(`${items.length} record(s) created successfully for ${commonData.machine_id} on ${commonData.production_date}!`);
      navigate('/production-sections/spiral');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create records. Please try again. Error: ' + error.message);
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
      setCommonData({
        section_name: 'Spiral',
        machine_id: '',
        machine_no: '',
        operator_name: '',
        users_name: currentUser,
        shift_code: '',
        shift_name: '',
        production_date: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setItems([{
        id: 1,
        item_code: '',
        item_name: '',
        raw_material_flatsize: '',
        material_type: '',
        wire_size: '',
        finishedproductname: '',
        production_quantity: '',
        per_meter_wt: '',
        weight: 0,
        unit: 'Meter'
      }]);
      setErrors({});
      setItemErrors([{}]);
      setDuplicateError('');
      setFilteredMachines([]);
      setCurrentTarget(null);
      setTotalProduction(0);
      setTotalWeight(0);
      setOverallEfficiency(0);
      setFilledFields({});
    }
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

  const availableShifts = shifts.filter(shift => 
    targetsData.some(target => 
      target.shift_code === shift.shift_code && 
      target.section_name === 'Spiral'
    )
  );

  return (
    <div style={{ 
      padding: '0', 
      maxWidth: '1400px', 
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
          Multi-Item Spiral Section Record
        </h1>
        <p style={{ 
          margin: '8px 0 0', 
          color: '#64748b',
          fontSize: '14px'
        }}>
          Add multiple items for the same machine | Production in Meter | Weight in KG
        </p>
        <p style={{ 
          margin: '4px 0 0', 
          color: '#3b82f6',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <FiList style={{ marginRight: '5px' }} />
          Note: You can add multiple items/parts for the same machine in one entry
        </p>
      </div>

      {/* Machine Completion Tracker */}
      {commonData.shift_code && commonData.production_date && (
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
                  {commonData.shift_name} Shift Machine Completion for {commonData.production_date}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                  Progress for selected date
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
                  Please check existing records or select a different date/machine/shift.
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Common Information */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#1e293b',
              paddingBottom: '8px',
              borderBottom: '1px solid #d1d5db',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Machine & Shift Information
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
                  {getFieldStatus('section_name', commonData.section_name).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  ...getDisplayStyle('section_name', commonData.section_name),
                  fontWeight: '500'
                }}>
                  {commonData.section_name}
                </div>
              </div>

              {/* Production Date */}
              <div>
                <label style={labelStyle}>
                  Production Date *
                  {getFieldStatus('production_date', commonData.production_date).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('production_date', commonData.production_date).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    name="production_date"
                    value={commonData.production_date}
                    onChange={handleCommonChange}
                    max={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      paddingRight: '40px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      fontSize: '14px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box',
                      ...getFieldStyle('production_date', commonData.production_date)
                    }}
                  />
                  <FiCalendar style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: getFieldStatus('production_date', commonData.production_date).isFilled ? '#065f46' : '#9ca3af',
                    pointerEvents: 'none'
                  }} size={16} />
                </div>
                {errors.production_date && <ErrorText text={errors.production_date} />}
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  marginTop: '4px'
                }}>
                  Select the date when production occurred
                </div>
              </div>

              {/* Shift Code */}
              <div>
                <label style={labelStyle}>
                  Shift *
                  {getFieldStatus('shift_code', commonData.shift_code).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('shift_code', commonData.shift_code).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="shift_code"
                    value={commonData.shift_code}
                    onChange={handleCommonChange}
                    style={{
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
                      backgroundSize: '14px',
                      ...getFieldStyle('shift_code', commonData.shift_code, true)
                    }}
                  >
                    <option value="">Select shift</option>
                    {availableShifts.map(shift => (
                      <option key={shift.id} value={shift.shift_code}>
                        {shift.shift_name} ({shift.shift_code})
                      </option>
                    ))}
                  </select>
                  {getFieldStatus('shift_code', commonData.shift_code).isFilled && (
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
                  {getFieldStatus('shift_name', commonData.shift_name).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  ...getDisplayStyle('shift_name', commonData.shift_name),
                  fontWeight: '500'
                }}>
                  {commonData.shift_name || 'Select Shift first'}
                </div>
              </div>

              {/* Machine ID */}
              <div>
                <label style={labelStyle}>
                  Machine ID *
                  {getFieldStatus('machine_id', commonData.machine_id).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('machine_id', commonData.machine_id).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="machine_id"
                    value={commonData.machine_id}
                    onChange={handleCommonChange}
                    disabled={!commonData.shift_code}
                    style={{
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
                      cursor: commonData.shift_code ? 'pointer' : 'not-allowed',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '14px',
                      opacity: commonData.shift_code ? 1 : 0.6,
                      ...getFieldStyle('machine_id', commonData.machine_id, true)
                    }}
                  >
                    <option value="">
                      {commonData.shift_code 
                        ? `Select machine for ${commonData.shift_name} shift` 
                        : 'Select Shift first'}
                    </option>
                    {filteredMachines.map(machine => (
                      <option key={`${machine.machine_id}-${machine.machine_no}`} value={machine.machine_id}>
                        {machine.machine_id} (No: {machine.machine_no})
                      </option>
                    ))}
                  </select>
                  {getFieldStatus('machine_id', commonData.machine_id).isFilled && (
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
                  {getFieldStatus('machine_no', commonData.machine_no).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  ...getDisplayStyle('machine_no', commonData.machine_no),
                  fontWeight: '500'
                }}>
                  {commonData.machine_no || 'Select Machine ID first'}
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

          {/* Section 2: Operator Details */}
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
              {/* Operator Name */}
              <div>
                <label style={labelStyle}>
                  Operator Name *
                  {getFieldStatus('operator_name', commonData.operator_name).hasError && (
                    <FiAlertCircle style={{ marginLeft: '5px', color: '#ef4444' }} size={14} />
                  )}
                  {getFieldStatus('operator_name', commonData.operator_name).isFilled && (
                    <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="operator_name"
                    value={commonData.operator_name}
                    onChange={handleCommonChange}
                    placeholder="Enter or select operator name"
                    list="operatorSuggestions"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                      fontSize: '14px',
                      color: '#1f2937',
                      outline: 'none',
                      boxSizing: 'border-box',
                      ...getFieldStyle('operator_name', commonData.operator_name)
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

              {/* User Name */}
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
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    background: getFieldStatus('users_name', currentUser).isFilled ? '#d1fae5' : '#f3f4f6',
                    fontSize: '14px',
                    color: getFieldStatus('users_name', currentUser).isFilled ? '#065f46' : '#1f2937',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'not-allowed',
                    fontWeight: getFieldStatus('users_name', currentUser).isFilled ? '600' : '400'
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

          {/* Section 3: Items Section with Add Button */}
          <div style={{ 
            marginBottom: '25px',
            paddingTop: '10px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ 
                margin: '0', 
                color: '#1e293b',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Production Items ({items.length} item{items.length !== 1 ? 's' : ''})
              </h3>
              <button
                type="button"
                onClick={addItem}
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '13px'
                }}
              >
                <FiPlus size={14} /> Add Another Item
              </button>
            </div>

            {/* Items List */}
            {items.map((item, index) => {
              const itemError = itemErrors[index] || {};
              
              return (
                <div key={item.id} style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  background: index % 2 === 0 ? '#f8fafc' : 'white',
                  position: 'relative'
                }}>
                  {/* Item Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '12px'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>
                        Item #{index + 1}
                      </div>
                    </div>
                    
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        style={{
                          background: '#fee2e2',
                          border: '1px solid #fca5a5',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontWeight: '500',
                          fontSize: '12px'
                        }}
                      >
                        <FiTrash2 size={12} /> Remove
                      </button>
                    )}
                  </div>

                  {/* Item Form Fields */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '15px'
                  }}>
                    {/* Item Code */}
                    <div>
                      <label style={labelStyle}>
                        Item Code *
                        {item.item_code && (
                          <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                        )}
                      </label>
                      <select
                        value={item.item_code}
                        onChange={(e) => handleItemChange(item.id, 'item_code', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          paddingRight: '35px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          background: item.item_code ? '#d1fae5' : '#f8fafc',
                          fontSize: item.item_code ? '15px' : '14px',
                          color: item.item_code ? '#065f46' : '#1f2937',
                          fontWeight: item.item_code ? '600' : '400',
                          outline: 'none',
                          boxSizing: 'border-box',
                          cursor: 'pointer',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '14px',
                          borderColor: item.item_code ? '#10b981' : (itemError.item_code ? '#ef4444' : '#e5e7eb')
                        }}
                      >
                        <option value="">Select item code</option>
                        {spiralItems.map(spItem => (
                          <option key={spItem.id} value={spItem.item_code}>
                            {spItem.item_code} - {spItem.item_name}
                          </option>
                        ))}
                      </select>
                      {itemError.item_code && <ErrorText text={itemError.item_code} />}
                    </div>

                    {/* Item Name */}
                    <div>
                      <label style={labelStyle}>Item Name</label>
                      <div style={{
                        padding: '12px 15px',
                        borderRadius: '6px',
                        border: item.item_name ? '2px solid #10b981' : '1px solid #e5e7eb',
                        background: item.item_name ? '#d1fae5' : '#f8fafc',
                        fontSize: item.item_name ? '15px' : '14px',
                        color: item.item_name ? '#065f46' : '#9ca3af',
                        fontWeight: item.item_name ? '600' : '500'
                      }}>
                        {item.item_name || 'Select Item Code first'}
                      </div>
                    </div>

                    {/* Finished Product Name */}
                    <div>
                      <label style={labelStyle}>Finished Product Name</label>
                      <div style={{
                        padding: '12px 15px',
                        borderRadius: '6px',
                        border: item.finishedproductname ? '2px solid #10b981' : '1px solid #e5e7eb',
                        background: item.finishedproductname ? '#d1fae5' : '#f8fafc',
                        fontSize: item.finishedproductname ? '15px' : '14px',
                        color: item.finishedproductname ? '#065f46' : '#9ca3af',
                        fontWeight: item.finishedproductname ? '600' : '500'
                      }}>
                        {item.finishedproductname || 'Select Item Code first'}
                      </div>
                    </div>

                    {/* Production Quantity */}
                    <div>
                      <label style={labelStyle}>
                        Production Quantity (Meter) *
                        {item.production_quantity && (
                          <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                        )}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={item.production_quantity}
                          onChange={(e) => handleItemChange(item.id, 'production_quantity', e.target.value)}
                          placeholder="Enter quantity"
                          min="0.01"
                          step="0.01"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            paddingRight: '70px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            background: item.production_quantity ? '#d1fae5' : '#f8fafc',
                            fontSize: item.production_quantity ? '15px' : '14px',
                            color: item.production_quantity ? '#065f46' : '#1f2937',
                            fontWeight: item.production_quantity ? '600' : '400',
                            outline: 'none',
                            boxSizing: 'border-box',
                            borderColor: item.production_quantity ? '#10b981' : (itemError.production_quantity ? '#ef4444' : '#e5e7eb')
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: item.production_quantity ? '#065f46' : '#6b7280',
                          fontWeight: '500',
                          fontSize: item.production_quantity ? '14px' : '13px'
                        }}>
                          Meter
                        </div>
                      </div>
                      {itemError.production_quantity && <ErrorText text={itemError.production_quantity} />}
                    </div>

                    {/* Per Meter Weight */}
                    <div>
                      <label style={labelStyle}>
                        Per Meter Weight
                        {item.per_meter_wt && (
                          <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                        )}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          value={item.per_meter_wt}
                          onChange={(e) => handleItemChange(item.id, 'per_meter_wt', e.target.value)}
                          placeholder="0.0000"
                          min="0"
                          step="0.0001"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            paddingRight: '45px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            background: item.per_meter_wt ? '#d1fae5' : '#f8fafc',
                            fontSize: item.per_meter_wt ? '15px' : '14px',
                            color: item.per_meter_wt ? '#065f46' : '#1f2937',
                            fontWeight: item.per_meter_wt ? '600' : '400',
                            outline: 'none',
                            boxSizing: 'border-box',
                            borderColor: item.per_meter_wt ? '#10b981' : '#e5e7eb'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: item.per_meter_wt ? '#065f46' : '#6b7280',
                          fontWeight: '500',
                          fontSize: item.per_meter_wt ? '14px' : '13px'
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

                    {/* Item Weight Calculation */}
                    <div>
                      <label style={labelStyle}>Calculated Weight</label>
                      <div style={{
                        padding: '12px 15px',
                        borderRadius: '6px',
                        border: item.weight > 0 ? '2px solid #10b981' : '1px solid #e5e7eb',
                        background: item.weight > 0 ? '#d1fae5' : '#f8fafc',
                        fontSize: item.weight > 0 ? '15px' : '14px',
                        color: item.weight > 0 ? '#065f46' : '#9ca3af',
                        fontWeight: item.weight > 0 ? '700' : '500'
                      }}>
                        {item.weight > 0 ? item.weight.toFixed(2) : '0.00'} KG
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 4: Overall Calculations */}
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
              Overall Calculations (All Items Combined)
            </h3>
            
            <div style={{
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              background: totalProduction > 0 || totalWeight > 0 ? '#ecfdf5' : '#f8fafc'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                {/* Total Production */}
                <div style={{
                  background: totalProduction > 0 ? '#d1fae5' : '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  border: totalProduction > 0 ? '2px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: totalProduction > 0 ? '#065f46' : '#6b7280', 
                    marginBottom: '5px', 
                    fontWeight: '600'
                  }}>
                    Total Production (All Items)
                  </div>
                  <div style={{ 
                    fontSize: totalProduction > 0 ? '20px' : '18px', 
                    fontWeight: totalProduction > 0 ? '800' : '700', 
                    color: totalProduction > 0 ? '#065f46' : '#374151'
                  }}>
                    {totalProduction > 0 ? totalProduction.toFixed(2) : '0.00'} 
                    <span style={{ 
                      fontSize: totalProduction > 0 ? '16px' : '14px', 
                      fontWeight: '600',
                      color: totalProduction > 0 ? '#065f46' : '#374151'
                    }}> Meter</span>
                  </div>
                </div>

                {/* Total Weight */}
                <div style={{
                  background: totalWeight > 0 ? '#d1fae5' : '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  border: totalWeight > 0 ? '2px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: totalWeight > 0 ? '#065f46' : '#6b7280',
                    marginBottom: '5px',
                    fontWeight: '600'
                  }}>
                    Total Weight (All Items)
                  </div>
                  <div style={{ 
                    fontSize: totalWeight > 0 ? '20px' : '18px', 
                    fontWeight: totalWeight > 0 ? '800' : '700', 
                    color: totalWeight > 0 ? '#065f46' : '#374151'
                  }}>
                    {totalWeight > 0 ? totalWeight.toFixed(2) : '0.00'} 
                    <span style={{ 
                      fontSize: totalWeight > 0 ? '16px' : '14px', 
                      fontWeight: '600',
                      color: totalWeight > 0 ? '#065f46' : '#374151'
                    }}> KG</span>
                  </div>
                </div>

                {/* Overall Efficiency */}
                <div style={{
                  background: overallEfficiency > 0 ? '#d1fae5' : '#f8fafc',
                  padding: '15px',
                  borderRadius: '8px',
                  border: overallEfficiency > 0 ? '2px solid #10b981' : '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: overallEfficiency > 0 ? '#065f46' : '#6b7280',
                    marginBottom: '5px',
                    fontWeight: '600'
                  }}>
                    Overall Efficiency
                  </div>
                  <div style={{ 
                    fontSize: overallEfficiency > 0 ? '20px' : '18px', 
                    fontWeight: overallEfficiency > 0 ? '800' : '700', 
                    color: overallEfficiency > 0 ? '#065f46' : '#374151'
                  }}>
                    {overallEfficiency > 0 ? overallEfficiency.toFixed(2) : '0.00'}%
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: overallEfficiency > 0 ? '#047857' : '#6b7280',
                    marginTop: '5px'
                  }}>
                    Based on total production vs shift target
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Remarks */}
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
                {commonData.remarks && (
                  <FiCheck style={{ marginLeft: '5px', color: '#10b981' }} size={14} />
                )}
              </label>
              <textarea
                name="remarks"
                value={commonData.remarks}
                onChange={handleCommonChange}
                placeholder="Enter any additional notes or remarks..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: commonData.remarks ? '2px solid #10b981' : '1px solid #e5e7eb',
                  background: commonData.remarks ? '#d1fae5' : '#f8fafc',
                  fontSize: commonData.remarks ? '15px' : '14px',
                  color: commonData.remarks ? '#065f46' : '#1f2937',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  fontWeight: commonData.remarks ? '500' : '400',
                  outline: 'none'
                }}
              />
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
              <FiSettings size={16} /> Reset All
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
                    Saving {items.length} Item{items.length !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <FiSave size={16} /> Save {items.length} Item{items.length !== 1 ? 's' : ''}
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
          
          div[style*="justify-content: space-between"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
        }
        
        input, select, textarea {
          font-size: 16px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        button, select, input[type="text"], input[type="number"], input[type="date"] {
          min-height: 44px;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        input, select, textarea, div[style*="border"] {
          transition: all 0.3s ease;
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

export default SpiralMultiEntryForm;