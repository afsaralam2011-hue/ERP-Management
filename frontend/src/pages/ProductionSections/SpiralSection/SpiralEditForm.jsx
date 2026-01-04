// src/pages/ProductionSections/SpiralSection/SpiralEditForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiSave, FiX, FiArrowLeft,
  FiSettings, FiTrash2
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const SpiralEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get record ID from URL
  
  const [formData, setFormData] = useState({
    section_name: 'Spiral Section',
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
  const [fetchingRecord, setFetchingRecord] = useState(true);
  const [duplicateError, setDuplicateError] = useState('');
  
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

  // Original record data for comparison
  const [originalRecord, setOriginalRecord] = useState(null);

  // Get current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user.email || 'System');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setCurrentUser('System');
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch existing record data
  useEffect(() => {
    const fetchRecordData = async () => {
      if (!id) {
        setFetchingRecord(false);
        return;
      }

      try {
        setFetchingRecord(true);
        
        const { data, error } = await supabase
          .from('spiralsection')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Store original record for comparison
          setOriginalRecord(data);
          
          // Set form data with fetched record
          setFormData({
            section_name: data.section_name || 'Spiral Section',
            machine_id: data.machine_id || '',
            machine_no: data.machine_no || '',
            item_code: data.item_code || '',
            item_name: data.item_name || '',
            raw_material_flatsize: data.raw_material_flatsize || '',
            material_type: data.material_type || '',
            wire_size: data.wire_size || '',
            finishedproductname: data.finishedproductname || '',
            operator_name: data.operator_name || '',
            production_quantity: data.production_quantity || '',
            per_meter_wt: data.per_meter_wt || '',
            weight: data.weight || '',
            unit: data.unit || 'Meter',
            efficiency: data.efficiency || 0,
            users_name: data.users_name || '',
            shift_code: data.shift_code || '',
            shift_name: data.shift_name || '',
            remarks: data.remarks || ''
          });
        }
      } catch (error) {
        console.error('Error fetching record:', error);
        alert('Failed to load record. Please try again.');
        navigate('/production-sections/spiral');
      } finally {
        setFetchingRecord(false);
      }
    };

    fetchRecordData();
  }, [id, navigate]);

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
          machine_id: 'SP # 04', 
          machine_no: '04', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        },
        { 
          id: 2, 
          section_name: 'Spiral', 
          machine_id: 'SP # 05', 
          machine_no: '05', 
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

  // Check for duplicate entry before submitting (exclude current record)
  const checkDuplicateEntry = async () => {
    if (!formData.machine_id || !formData.shift_code) {
      return false;
    }

    // If machine and shift haven't changed, no duplicate check needed
    if (originalRecord && 
        originalRecord.machine_id === formData.machine_id && 
        originalRecord.shift_code === formData.shift_code) {
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
        .neq('id', id) // Exclude current record
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
    
    if (name === 'shift_code') {
      const selectedShift = shifts.find(shift => shift.shift_code === value);
      setFormData(prev => ({
        ...prev,
        shift_code: value,
        shift_name: selectedShift ? selectedShift.shift_name : '',
        machine_id: '',
        machine_no: ''
      }));
    } 
    else if (name === 'machine_id') {
      const selectedMachine = filteredMachines.find(m => m.machine_id === value);
      setFormData(prev => ({
        ...prev,
        machine_id: value,
        machine_no: selectedMachine ? selectedMachine.machine_no : ''
      }));
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check for duplicate entry (only if machine or shift changed)
    const isDuplicate = await checkDuplicateEntry();
    if (isDuplicate) {
      setDuplicateError(`This machine (${formData.machine_id}) already has an entry for ${formData.shift_name} shift today. Only one entry per machine per shift per day is allowed.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedData = {
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
        users_name: currentUser, // Auto-filled from logged-in user
        shift_code: formData.shift_code,
        shift_name: formData.shift_name,
        remarks: formData.remarks.trim(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('spiralsection')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;
      
      alert('Spiral section record updated successfully!');
      navigate('/production-sections/spiral');
      
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record. Please try again. Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this record? This action cannot be undone.');
    
    if (!confirmDelete) return;
    
    try {
      const { error } = await supabase
        .from('spiralsection')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('Record deleted successfully!');
      navigate('/production-sections/spiral');
      
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record. Please try again.');
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/production-sections/spiral');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all changes to original values?')) {
      if (originalRecord) {
        setFormData({
          section_name: originalRecord.section_name || 'Spiral Section',
          machine_id: originalRecord.machine_id || '',
          machine_no: originalRecord.machine_no || '',
          item_code: originalRecord.item_code || '',
          item_name: originalRecord.item_name || '',
          raw_material_flatsize: originalRecord.raw_material_flatsize || '',
          material_type: originalRecord.material_type || '',
          wire_size: originalRecord.wire_size || '',
          finishedproductname: originalRecord.finishedproductname || '',
          operator_name: originalRecord.operator_name || '',
          production_quantity: originalRecord.production_quantity || '',
          per_meter_wt: originalRecord.per_meter_wt || '',
          weight: originalRecord.weight || '',
          unit: originalRecord.unit || 'Meter',
          efficiency: originalRecord.efficiency || 0,
          users_name: originalRecord.users_name || '',
          shift_code: originalRecord.shift_code || '',
          shift_name: originalRecord.shift_name || '',
          remarks: originalRecord.remarks || ''
        });
      }
      setErrors({});
      setDuplicateError('');
    }
  };

  if (fetchingRecord || loading) {
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
        <p>
          {fetchingRecord 
            ? 'Loading record data...' 
            : 'Loading configuration data...'}
        </p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              margin: '0',
              fontSize: '24px',
              color: '#1e293b'
            }}>
              Edit Spiral Section Record
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
          <button
            type="button"
            onClick={handleDelete}
            style={{
              background: 'transparent',
              border: '1px solid #fca5a5',
              padding: '10px 20px',
              borderRadius: '6px',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <FiTrash2 size={16} /> Delete Record
          </button>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleUpdate}>
        <div style={{
          background: 'white',
          padding: '20px'
        }}>
          
          {/* Duplicate Entry Error Message */}
          {duplicateError && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #ef4444',
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
                <label style={labelStyle}>Section Name</label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  {formData.section_name}
                </div>
              </div>

              {/* Shift Code */}
              <div>
                <label style={labelStyle}>Shift *</label>
                <select
                  name="shift_code"
                  value={formData.shift_code}
                  onChange={handleChange}
                  style={selectStyle(errors.shift_code)}
                >
                  <option value="">Select shift</option>
                  {availableShifts.map(shift => (
                    <option key={shift.id} value={shift.shift_code}>
                      {shift.shift_name} ({shift.shift_code})
                    </option>
                  ))}
                </select>
                {errors.shift_code && <ErrorText text={errors.shift_code} />}
              </div>

              {/* Shift Name */}
              <div>
                <label style={labelStyle}>Shift Name</label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: formData.shift_name ? '#374151' : '#9ca3af',
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
            borderTop: '1px solid #e5e7eb'
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
                <label style={labelStyle}>Machine ID *</label>
                <select
                  name="machine_id"
                  value={formData.machine_id}
                  onChange={handleChange}
                  disabled={!formData.shift_code}
                  style={{
                    ...selectStyle(errors.machine_id),
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
                {errors.machine_id && <ErrorText text={errors.machine_id} />}
              </div>

              {/* Machine Number */}
              <div>
                <label style={labelStyle}>Machine Number</label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: formData.machine_no ? '#374151' : '#9ca3af',
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
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: currentTarget ? '#374151' : '#9ca3af',
                  fontWeight: '500'
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
            borderTop: '1px solid #e5e7eb'
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
                <label style={labelStyle}>Item Code *</label>
                <select
                  name="item_code"
                  value={formData.item_code}
                  onChange={handleChange}
                  style={selectStyle(errors.item_code)}
                >
                  <option value="">Select item code</option>
                  {spiralItems.map(item => (
                    <option key={item.id} value={item.item_code}>
                      {item.item_code} - {item.item_name}
                    </option>
                  ))}
                </select>
                {errors.item_code && <ErrorText text={errors.item_code} />}
              </div>

              {/* Item Name */}
              <div>
                <label style={labelStyle}>Item Name</label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: formData.item_name ? '#374151' : '#9ca3af',
                  fontWeight: '500'
                }}>
                  {formData.item_name || 'Select Item Code first'}
                </div>
              </div>

              {/* Finished Product Name */}
              <div>
                <label style={labelStyle}>Finished Product Name</label>
                <div style={{
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: formData.finishedproductname ? '#374151' : '#9ca3af',
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
            borderTop: '1px solid #e5e7eb'
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
                <label style={labelStyle}>Production Quantity (Meter) *</label>
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
                      ...inputStyle(errors.production_quantity),
                      paddingRight: '70px'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    fontWeight: '500',
                    fontSize: '13px'
                  }}>
                    Meter
                  </div>
                </div>
                {errors.production_quantity && <ErrorText text={errors.production_quantity} />}
              </div>

              {/* Per Meter Weight */}
              <div>
                <label style={labelStyle}>Per Meter Weight</label>
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
                      paddingRight: '45px'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    fontWeight: '500',
                    fontSize: '13px'
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
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '500'
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
            borderTop: '1px solid #e5e7eb'
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
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                {/* Weight Calculation */}
                <div style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    marginBottom: '5px', 
                    fontWeight: '600'
                  }}>
                    Calculated Weight
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#374151'
                  }}>
                    {calculatedWeight > 0 ? calculatedWeight.toFixed(2) : '0.00'} 
                    <span style={{ fontSize: '14px', fontWeight: '600' }}> KG</span>
                  </div>
                </div>

                {/* Efficiency Display */}
                <div style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    marginBottom: '5px',
                    fontWeight: '600'
                  }}>
                    Efficiency
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700', 
                    color: '#374151'
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
            borderTop: '1px solid #e5e7eb'
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
                <label style={labelStyle}>Operator Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="operator_name"
                    value={formData.operator_name}
                    onChange={handleChange}
                    placeholder="Enter or select operator name"
                    list="operatorSuggestions"
                    style={inputStyle(errors.operator_name)}
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
                <label style={labelStyle}>Updated By</label>
                <input
                  type="text"
                  value={currentUser}
                  disabled
                  style={{
                    ...inputStyle(),
                    background: '#f3f4f6',
                    cursor: 'not-allowed'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Auto-filled from logged-in user
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Remarks */}
          <div style={{ 
            marginBottom: '25px',
            paddingTop: '10px',
            borderTop: '1px solid #e5e7eb'
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
              <label style={labelStyle}>Remarks</label>
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
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                  fontSize: '14px',
                  color: '#1f2937',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
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
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                <FiSettings size={16} /> Reset
              </button>

              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'transparent',
                  border: '1px solid #fca5a5',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                <FiX size={16} /> Cancel
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#9ca3af' : '#3b82f6',
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
                  Updating...
                </>
              ) : (
                <>
                  <FiSave size={16} /> Update Record
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          
          div[style*="justify-content: space-between"] {
            flex-direction: column;
            gap: 15px;
          }
          
          div[style*="justify-content: space-between"] > div {
            width: 100%;
            justify-content: center;
          }
          
          button[style*="background: transparent"][style*="border: 1px solid #fca5a5"] {
            margin-left: 0 !important;
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
      `}</style>
    </div>
  );
};

// Reusable styles - Light colors only
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
  border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
  background: '#f8fafc',
  fontSize: '14px',
  color: '#1f2937',
  outline: 'none',
  boxSizing: 'border-box'
});

const selectStyle = (hasError) => ({
  ...inputStyle(hasError),
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  backgroundSize: '14px',
  paddingRight: '35px'
});

const ErrorText = ({ text }) => (
  <div style={{ 
    color: '#ef4444', 
    fontSize: '11px', 
    marginTop: '4px'
  }}>
    {text}
  </div>
);

export default SpiralEditForm;