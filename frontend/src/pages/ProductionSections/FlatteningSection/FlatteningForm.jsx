// src/pages/ProductionSections/FlatteningSection/FlatteningForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiSave, FiX, FiPackage, FiArrowLeft,
  FiCalendar, FiUser, FiSettings, FiTarget
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../../../supabaseClient';

const FlatteningForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    section: 'Flattening',
    machine_id: '',
    machine_no: '',
    item_code: '',
    item_name: '',
    production_quantity: '',
    coil_size: '',
    shift_code: '',
    shift_name: '',
    operator_name: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dynamic data from Supabase - صرف تین ٹیبلز سے
  const [coilSizes, setCoilSizes] = useState([]); // items ٹیبل سے coil_size کالم
  const [shifts, setShifts] = useState([]); // shifts ٹیبل سے
  const [items, setItems] = useState([]); // items ٹیبل سے
  const [machineTargets, setMachineTargets] = useState([]); // targets ٹیبل سے
  
  // Calculated efficiency
  const [calculatedEfficiency, setCalculatedEfficiency] = useState(0);
  const [machineTarget, setMachineTarget] = useState(null);

  // Fetch all configuration data from three tables only
  useEffect(() => {
    fetchConfigurationData();
  }, []);

  const fetchConfigurationData = async () => {
    try {
      setLoading(true);
      
      // 1. shifts ٹیبل سے ڈیٹا
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time');
      
      // 2. items ٹیبل سے ڈیٹا
      const { data: itemData } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('item_name');
      
      // 3. targets ٹیبل سے ڈیٹا (Flattening section کے لیے)
      const { data: targetData } = await supabase
        .from('targets')
        .select('*')
        .eq('is_active', true)
        .eq('section', 'Flattening');

      // Set data to state
      setShifts(shiftData || []);
      setItems(itemData || []);
      setMachineTargets(targetData || []);
      
      // Extract unique coil sizes from items table
      if (itemData) {
        const uniqueCoilSizes = [...new Set(itemData.map(item => item.coil_size))]
          .filter(size => size) // Remove null/empty values
          .map(size => ({
            size_code: size,
            size_name: size
          }));
        setCoilSizes(uniqueCoilSizes);
      }
      
    } catch (error) {
      console.error('Error fetching configuration:', error);
      // Fallback to static data based on your tables structure
      setCoilSizes([
        { size_code: '100kg', size_name: '100kg Coil' },
        { size_code: '200kg', size_name: '200kg Coil' },
        { size_code: '300kg', size_name: '300kg Coil' }
      ]);
      
      setShifts([
        { id: 1, shift_code: 'M', shift_name: 'Morning', start_time: '08:00:00', end_time: '16:00:00' },
        { id: 2, shift_code: 'E', shift_name: 'Evening', start_time: '16:00:00', end_time: '00:00:00' },
        { id: 3, shift_code: 'N', shift_name: 'Night', start_time: '00:00:00', end_time: '08:00:00' }
      ]);
      
      setItems([
        { id: 1, item_code: 'CW-1.5', item_name: 'Copper Wire 1.5mm', coil_size: '200kg', material_type: 'Copper', unit: 'Kg', is_active: true },
        { id: 2, item_code: 'CW-2.0', item_name: 'Copper Wire 2mm', coil_size: '300kg', material_type: 'Copper', unit: 'Kg', is_active: true }
      ]);
      
      setMachineTargets([
        { id: 1, section: 'Flattening', machine_id: 'FLT-001', machine_no: 'FLT-001', shift_code: 'M', shift_name: 'Morning', target_qty: 5000, uom: 'Kg', is_active: true },
        { id: 2, section: 'Flattening', machine_id: 'FLT-001', machine_no: 'FLT-001', shift_code: 'E', shift_name: 'Evening', target_qty: 4500, uom: 'Kg', is_active: true },
        { id: 3, section: 'Flattening', machine_id: 'FLT-002', machine_no: 'FLT-002', shift_code: 'M', shift_name: 'Morning', target_qty: 5500, uom: 'Kg', is_active: true }
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  // Calculate efficiency when production quantity or machine changes
  useEffect(() => {
    calculateEfficiency();
  }, [formData.production_quantity, formData.machine_id, formData.shift_code]);

  const calculateEfficiency = () => {
    const productionQty = parseFloat(formData.production_quantity) || 0;
    
    if (!formData.machine_id || !formData.shift_code || productionQty <= 0) {
      setCalculatedEfficiency(0);
      setMachineTarget(null);
      return;
    }

    // Find machine target from targets table
    const target = machineTargets.find(m => 
      m.machine_id === formData.machine_id && 
      m.shift_code === formData.shift_code &&
      m.section === 'Flattening'
    );
    
    setMachineTarget(target);

    if (!target) {
      setCalculatedEfficiency(0);
      return;
    }

    // Calculate efficiency percentage
    const efficiency = target.target_qty > 0 ? (productionQty / target.target_qty) * 100 : 0;
    setCalculatedEfficiency(parseFloat(efficiency.toFixed(2)));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing shift_code, also set shift_name from shifts table
    if (name === 'shift_code') {
      const selectedShift = shifts.find(shift => shift.shift_code === value);
      setFormData(prev => ({
        ...prev,
        shift_code: value,
        shift_name: selectedShift ? selectedShift.shift_name : ''
      }));
    } 
    // If changing item_code, also set item_name and coil_size from items table
    else if (name === 'item_code') {
      const selectedItem = items.find(item => item.item_code === value);
      setFormData(prev => ({
        ...prev,
        item_code: value,
        item_name: selectedItem ? selectedItem.item_name : '',
        coil_size: selectedItem ? selectedItem.coil_size : ''
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

  const handleMachineChange = (e) => {
    const machineId = e.target.value;
    
    // Find machine details from targets table
    const selectedMachine = machineTargets.find(m => 
      m.machine_id === machineId && 
      m.section === 'Flattening'
    );
    
    setFormData(prev => ({
      ...prev,
      machine_id: machineId,
      machine_no: selectedMachine ? selectedMachine.machine_no : ''
    }));
    
    if (errors.machine_id) {
      setErrors(prev => ({
        ...prev,
        machine_id: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.section.trim()) newErrors.section = 'Section is required';
    if (!formData.machine_id.trim()) newErrors.machine_id = 'Machine ID is required';
    if (!formData.machine_no.trim()) newErrors.machine_no = 'Machine number is required';
    if (!formData.item_code) newErrors.item_code = 'Item is required';
    if (!formData.production_quantity) {
      newErrors.production_quantity = 'Production quantity is required';
    } else if (isNaN(formData.production_quantity) || formData.production_quantity <= 0) {
      newErrors.production_quantity = 'Please enter a valid positive number';
    }
    if (!formData.coil_size) newErrors.coil_size = 'Coil size is required';
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

    setIsSubmitting(true);

    try {
      // Find selected item from items table for unit
      const selectedItem = items.find(item => item.item_code === formData.item_code);
      const unit = selectedItem ? selectedItem.unit : 'Kg';

      // ✅ صرف یہ ایک لائن تبدیل کریں: production_logs سے flatteningsection
      const { data, error } = await supabase
        .from('flatteningsection') // ✅ صرف یہاں ٹیبل کا نام تبدیل کیا
        .insert([
          {
            section: formData.section.trim(),
            machine_id: formData.machine_id.trim(),
            machine_no: formData.machine_no.trim(),
            item_code: formData.item_code,
            item_name: formData.item_name,
            production_quantity: parseFloat(formData.production_quantity),
            unit: unit,
            coil_size: formData.coil_size,
            shift_code: formData.shift_code,
            shift_name: formData.shift_name,
            operator_name: formData.operator_name.trim(),
            efficiency: calculatedEfficiency,
            remarks: formData.remarks.trim(),
            target_qty: machineTarget ? machineTarget.target_qty : 0,
            target_uom: machineTarget ? machineTarget.uom : 'Kg',
            production_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        
        // اگر flatteningsection ٹیبل میں columns مختلف ہیں تو سادہ structure استعمال کریں
        if (error.message.includes('column') || error.message.includes('does not exist')) {
          console.log('Trying with simple structure...');
          
          const { data: simpleData, error: simpleError } = await supabase
            .from('flatteningsection')
            .insert([
              {
                section_name: formData.section.trim(),
                machine_id: formData.machine_id.trim(),
                machine_no: formData.machine_no.trim(),
                item_name: formData.item_name,
                production_quantity: parseFloat(formData.production_quantity),
                coil_size: formData.coil_size,
                shift: formData.shift_code,
                operator_name: formData.operator_name.trim(),
                efficiency: calculatedEfficiency,
                remarks: formData.remarks.trim(),
                created_at: new Date().toISOString()
              }
            ])
            .select();
          
          if (simpleError) throw simpleError;
          
          alert('Flattening section record created successfully! (Simple structure)');
          navigate('/production-sections/flattening');
          return;
        }
        
        throw error;
      }
      
      alert('Flattening section record created successfully!');
      navigate('/production-sections/flattening');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/production-sections/flattening');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields to default?')) {
      setFormData({
        section: 'Flattening',
        machine_id: '',
        machine_no: '',
        item_code: '',
        item_name: '',
        production_quantity: '',
        coil_size: '',
        shift_code: '',
        shift_name: '',
        operator_name: '',
        remarks: ''
      });
      setErrors({});
      setCalculatedEfficiency(0);
      setMachineTarget(null);
    }
  };

  // Get unique machines from targets table for Flattening section
  const flatteningMachines = machineTargets
    .filter(target => target.section === 'Flattening')
    .filter((value, index, self) => 
      index === self.findIndex(t => t.machine_id === value.machine_id)
    );

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

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <button
            onClick={() => navigate('/production-sections/flattening')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              marginBottom: '10px',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.color = '#475569';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#64748b';
            }}
          >
            <FiArrowLeft /> Back to Flattening Section
          </button>
          <h1 style={{
            margin: '0',
            fontSize: '32px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiPackage size={28} />
            </div>
            New Flattening Record
          </h1>
          <p style={{ 
            margin: '10px 0 0 75px', 
            color: '#64748b',
            fontSize: '16px'
          }}>
            Using Data from: shifts, targets, and items tables | Storage: flatteningsection table
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px',
            marginBottom: '30px'
          }}>
            {/* Section (Fixed) */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Section
              </label>
              <input
                type="text"
                name="section"
                value={formData.section}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f1f5f9',
                  fontSize: '15px',
                  color: '#64748b',
                  fontWeight: '600'
                }}
              />
            </div>

            {/* Machine ID - from targets table */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Machine ID *
              </label>
              <select
                name="machine_id"
                value={formData.machine_id}
                onChange={handleMachineChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.machine_id ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Machine</option>
                {flatteningMachines.map(machine => (
                  <option key={machine.id} value={machine.machine_id}>
                    {machine.machine_id} ({machine.machine_no})
                  </option>
                ))}
              </select>
              {errors.machine_id && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                  ⚠ {errors.machine_id}
                </div>
              )}
            </div>

            {/* Machine Number (Auto-filled from targets table) */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Machine Number *
              </label>
              <input
                type="text"
                name="machine_no"
                value={formData.machine_no}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f1f5f9',
                  fontSize: '15px',
                  color: '#64748b'
                }}
              />
            </div>

            {/* Item Selection - from items table */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Item *
              </label>
              <select
                name="item_code"
                value={formData.item_code}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.item_code ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select an item</option>
                {items.map(item => (
                  <option key={item.id} value={item.item_code}>
                    {item.item_name} ({item.item_code}) - {item.coil_size}
                  </option>
                ))}
              </select>
              {errors.item_code && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                  ⚠ {errors.item_code}
                </div>
              )}
            </div>

            {/* Production Quantity */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Production Quantity *
              </label>
              <input
                type="number"
                name="production_quantity"
                value={formData.production_quantity}
                onChange={handleChange}
                placeholder="Enter production quantity"
                min="1"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.production_quantity ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              {errors.production_quantity && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                  ⚠ {errors.production_quantity}
                </div>
              )}
            </div>

            {/* Coil Size (Auto-filled from items table) */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Coil Size (from items table)
              </label>
              <input
                type="text"
                name="coil_size"
                value={formData.coil_size}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f1f5f9',
                  fontSize: '15px',
                  color: '#64748b'
                }}
              />
            </div>

            {/* Shift Selection - from shifts table */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Shift *
              </label>
              <select
                name="shift_code"
                value={formData.shift_code}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.shift_code ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select shift</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.shift_code}>
                    {shift.shift_name} ({shift.start_time} - {shift.end_time})
                  </option>
                ))}
              </select>
              {errors.shift_code && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                  ⚠ {errors.shift_code}
                </div>
              )}
            </div>

            {/* Operator Name */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiUser /> Operator Name *
              </label>
              <input
                type="text"
                name="operator_name"
                value={formData.operator_name}
                onChange={handleChange}
                placeholder="e.g., Ali Khan"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.operator_name ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              {errors.operator_name && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                  ⚠ {errors.operator_name}
                </div>
              )}
            </div>

            {/* Auto-Calculated Efficiency */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px', 
                  marginBottom: '15px' 
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#0ea5e9',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <FiTarget size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', color: '#0369a1' }}>
                      Auto-Calculated Efficiency
                    </h3>
                    <p style={{ margin: '0', color: '#0c4a6e', fontSize: '14px' }}>
                      Using targets from targets table only
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                      Shift Target ({machineTarget?.uom || 'Kg'})
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: machineTarget ? '#059669' : '#94a3b8' 
                    }}>
                      {machineTarget ? machineTarget.target_qty.toFixed(2) : '--'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                      {formData.shift_name || 'Select shift'}
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                      Production Quantity ({items.find(i => i.item_code === formData.item_code)?.unit || 'Kg'})
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                      {formData.production_quantity || '--'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                      Actual Production
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                      Efficiency
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: calculatedEfficiency > 100 ? '#ef4444' :
                             calculatedEfficiency >= 90 ? '#059669' :
                             calculatedEfficiency >= 80 ? '#d97706' : '#ef4444'
                    }}>
                      {calculatedEfficiency.toFixed(2)}%
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: calculatedEfficiency > 100 ? '#ef4444' :
                             calculatedEfficiency >= 90 ? '#059669' :
                             calculatedEfficiency >= 80 ? '#d97706' : '#ef4444',
                      marginTop: '5px'
                    }}>
                      {calculatedEfficiency > 100 ? 'Over Target' :
                       calculatedEfficiency >= 90 ? 'Excellent' :
                       calculatedEfficiency >= 80 ? 'Good' : 'Below Target'}
                    </div>
                  </div>
                </div>

                <div style={{
                  background: '#e0f2fe',
                  padding: '10px 15px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0c4a6e'
                }}>
                  <strong>Formula:</strong> Efficiency = (Production Quantity ÷ Shift Target) × 100
                  {machineTarget && (
                    <div style={{ marginTop: '5px' }}>
                      <strong>Source:</strong> targets table | 
                      Machine: {formData.machine_id} | 
                      Shift: {formData.shift_name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter any additional notes or remarks..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '25px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: '2px solid #e2e8f0',
                padding: '12px 24px',
                borderRadius: '10px',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '600'
              }}
            >
              <FiSettings /> Reset Form
            </button>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'transparent',
                  border: '2px solid #e2e8f0',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '600'
                }}
              >
                <FiX /> Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {isSubmitting ? 'Saving...' : <><FiSave /> Save Record</>}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Data Source Info */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '30px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#475569' }}>
          Data Sources Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div>
            <div style={{ fontWeight: '600', color: '#3b82f6', marginBottom: '5px' }}>
              shifts Table
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Shift codes, names, and timings
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#10b981', marginBottom: '5px' }}>
              items Table
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Item details, coil sizes, and units
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '5px' }}>
              targets Table
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Machine targets for efficiency calculation
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#8b5cf6', marginBottom: '5px' }}>
              Storage Table
            </div>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              flatteningsection (Records storage)
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FlatteningForm;