// src/pages/ProductionSections/SpiralSection/SpiralForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiSave, FiX, FiPackage, FiArrowLeft,
  FiUser, FiSettings, FiTarget,
  FiTool, FiBox, FiHash, FiGrid,
  FiCalendar, FiCheck, FiAlertCircle,
  FiDivide, FiPercent
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const SpiralForm = () => {
  const navigate = useNavigate();
  
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
    shift_code: '',      // Changed from 'shift' to 'shift_code'
    shift_name: '',       // Added new field
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dynamic data from Supabase
  const [shifts, setShifts] = useState([]);
  const [spiralItems, setSpiralItems] = useState([]);
  const [machineTargets, setMachineTargets] = useState([]);
  
  // Calculated fields
  const [calculatedWeight, setCalculatedWeight] = useState(0);
  const [calculatedEfficiency, setCalculatedEfficiency] = useState(0);
  const [machineTarget, setMachineTarget] = useState(null);
  const [efficiencyFormula, setEfficiencyFormula] = useState('');

  // Fetch all configuration data
  useEffect(() => {
    fetchConfigurationData();
  }, []);

  // Calculate EVERY TIME when dependencies change
  useEffect(() => {
    const weight = calculateWeight();
    const { efficiency, formula, target } = calculateEfficiency();
    
    setCalculatedWeight(weight);
    setCalculatedEfficiency(efficiency);
    setMachineTarget(target);
    setEfficiencyFormula(formula);
  }, [formData.production_quantity, formData.per_meter_wt, formData.machine_id, formData.shift_code, machineTargets]);

  const fetchConfigurationData = async () => {
    try {
      setLoading(true);
      
      // 1. shifts ٹیبل سے ڈیٹا
      const { data: shiftData } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time');
      
      // 2. spiralitem ٹیبل سے ڈیٹا
      const { data: spiralItemData } = await supabase
        .from('spiralitem')
        .select('*')
        .order('item_name');
      
      // 3. targets ٹیبل سے ڈیٹا
      const { data: targetData } = await supabase
        .from('targets')
        .select('*')
        .eq('is_active', true)
        .eq('section', 'Spiral');

      // Set data to state
      setShifts(shiftData || []);
      setSpiralItems(spiralItemData || []);
      setMachineTargets(targetData || []);
      
    } catch (error) {
      console.error('Error fetching configuration:', error);
      // Fallback to static data
      setShifts([
        { id: 1, shift_code: 'D', shift_name: 'Day', start_time: '08:30:00', end_time: '22:30:00' },
        { id: 2, shift_code: 'N', shift_name: 'Nigth', start_time: '22:30:00', end_time: '08:30:00' },
        { id: 3, shift_code: 'E', shift_name: 'Evening', start_time: '16:00:00', end_time: '00:00:00' },
        { id: 4, shift_code: 'N', shift_name: 'Night', start_time: '00:00:00', end_time: '08:00:00' }
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
      
      setMachineTargets([
        { 
          id: 1, 
          section: 'Spiral', 
          machine_id: 'SP # 04', 
          machine_no: '04', 
          shift_code: 'D', 
          shift_name: 'Day', 
          target_qty: 12000, 
          uom: 'Meter', 
          is_active: true 
        }
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  const calculateWeight = () => {
    const productionQty = parseFloat(formData.production_quantity) || 0;
    const perMeterWt = parseFloat(formData.per_meter_wt) || 0;
    
    if (productionQty > 0 && perMeterWt > 0) {
      const weight = productionQty * perMeterWt;
      return parseFloat(weight.toFixed(2));
    }
    return 0;
  };

  const calculateEfficiency = () => {
    const productionQty = parseFloat(formData.production_quantity) || 0;
    const shiftCode = formData.shift_code; // Changed from formData.shift
    const machineId = formData.machine_id;
    
    let target = null;
    let efficiency = 0;
    let formula = '';

    // Find machine target
    if (machineId && shiftCode && productionQty > 0) {
      target = machineTargets.find(m => 
        m.machine_id === machineId && 
        m.shift_code === shiftCode &&
        m.section === 'Spiral'
      );
      
      if (target && target.target_qty > 0) {
        // CORRECT FORMULA: (Production Quantity ÷ Shift Target) × 100
        efficiency = (productionQty / target.target_qty) * 100;
        efficiency = parseFloat(efficiency.toFixed(2));
        
        // Create formula string for display
        formula = `(${productionQty} ÷ ${target.target_qty}) × 100 = ${efficiency}%`;
      } else {
        formula = 'Select valid Shift and Machine';
      }
    } else {
      formula = 'Enter Production Quantity and select Shift';
    }
    
    return { efficiency, formula, target };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing shift_code, also set shift_name
    if (name === 'shift_code') {
      const selectedShift = shifts.find(shift => shift.shift_code === value);
      setFormData(prev => ({
        ...prev,
        shift_code: value,
        shift_name: selectedShift ? selectedShift.shift_name : ''
      }));
    } 
    // If changing item_code, auto-fill all other fields from spiralitem table
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
    const selectedMachine = machineTargets.find(m => m.machine_id === machineId);
    
    setFormData(prev => ({
      ...prev,
      machine_id: machineId,
      machine_no: selectedMachine ? selectedMachine.machine_no : ''
    }));
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
    if (!formData.shift_code) newErrors.shift_code = 'Shift is required'; // Changed from shift to shift_code
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
        users_name: formData.users_name.trim() || 'System',
        shift: formData.shift_code, // Storing shift_code as 'shift' in database
        shift_name: formData.shift_name, // Also storing shift_name
        remarks: formData.remarks.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert into spiralsection table
      const { data, error } = await supabase
        .from('spiralsection')
        .insert([recordData])
        .select();

      if (error) throw error;
      
      alert('Spiral section record created successfully!');
      navigate('/production-sections/spiral');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create record. Please try again.');
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
      setFormData({
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
        shift_code: '', // Reset to empty
        shift_name: '', // Reset to empty
        remarks: ''
      });
      setErrors({});
      setCalculatedWeight(0);
      setCalculatedEfficiency(0);
      setMachineTarget(null);
      setEfficiencyFormula('');
    }
  };

  // Get unique machines for Spiral section
  const spiralMachines = machineTargets
    .filter(target => target.section === 'Spiral')
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

  // Get current shift name
  const currentShiftName = formData.shift_name || shifts.find(s => s.shift_code === formData.shift_code)?.shift_name || '';
  
  // Calculate weight formula for display
  const weightFormula = formData.production_quantity && formData.per_meter_wt 
    ? `${formData.production_quantity} × ${formData.per_meter_wt} = ${calculatedWeight.toFixed(2)} KG`
    : 'Production × Per Meter Weight = Weight (KG)';

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
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
            <FiArrowLeft /> Back to Spiral Section
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
            New Spiral Section Record
          </h1>
          <p style={{ 
            margin: '10px 0 0 75px', 
            color: '#64748b',
            fontSize: '16px'
          }}>
            Production in Meter | Weight in KG | Targets from targets table
          </p>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '30px',
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          
          {/* Section 1: Basic Information */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1e293b',
              paddingBottom: '10px',
              borderBottom: '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              <FiHash style={{ color: '#10b981' }} /> Basic Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Section Name */}
              <div>
                <label style={labelStyle}>Section Name</label>
                <div style={{
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #10b981',
                  background: '#f0fdf4',
                  fontSize: '15px',
                  color: '#065f46',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%'
                  }} />
                  {formData.section_name}
                </div>
              </div>

              {/* Machine ID */}
              <div>
                <label style={labelStyle}>Machine ID *</label>
                <select
                  name="machine_id"
                  value={formData.machine_id}
                  onChange={handleMachineChange}
                  style={{
                    ...selectStyle(errors.machine_id),
                    background: formData.machine_id ? '#f0fdf4' : '#fef2f2',
                    borderColor: formData.machine_id ? '#10b981' : (errors.machine_id ? '#ef4444' : '#f87171')
                  }}
                >
                  <option value="">Select Machine</option>
                  {spiralMachines.map(machine => (
                    <option key={machine.id} value={machine.machine_id}>
                      {machine.machine_id} ({machine.machine_no})
                    </option>
                  ))}
                </select>
                {errors.machine_id && <ErrorText text={errors.machine_id} />}
              </div>

              {/* Machine Number */}
              <div>
                <label style={labelStyle}>Machine Number</label>
                <div style={{
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #10b981',
                  background: formData.machine_no ? '#f0fdf4' : '#fef2f2',
                  fontSize: '15px',
                  color: formData.machine_no ? '#065f46' : '#dc2626',
                  fontWeight: formData.machine_no ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {formData.machine_no ? (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#10b981',
                        borderRadius: '50%'
                      }} />
                      {formData.machine_no}
                    </>
                  ) : (
                    'Select Machine ID first'
                  )}
                </div>
              </div>

              {/* Shift Code */}
              <div>
                <label style={labelStyle}>Shift *</label>
                <select
                  name="shift_code" // Changed from "shift" to "shift_code"
                  value={formData.shift_code}
                  onChange={handleChange}
                  style={{
                    ...selectStyle(errors.shift_code),
                    background: formData.shift_code ? '#f0fdf4' : '#fef2f2',
                    borderColor: formData.shift_code ? '#10b981' : (errors.shift_code ? '#ef4444' : '#f87171')
                  }}
                >
                  <option value="">Select shift</option>
                  {shifts.map(shift => (
                    <option key={shift.id} value={shift.shift_code}>
                      {shift.shift_name} ({shift.shift_code})
                    </option>
                  ))}
                </select>
                {errors.shift_code && <ErrorText text={errors.shift_code} />}
              </div>

              {/* Shift Name (Auto-filled) */}
              <div>
                <label style={labelStyle}>Shift Name</label>
                <div style={{
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #10b981',
                  background: formData.shift_name ? '#f0fdf4' : '#fef2f2',
                  fontSize: '15px',
                  color: formData.shift_name ? '#065f46' : '#dc2626',
                  fontWeight: formData.shift_name ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {formData.shift_name ? (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#10b981',
                        borderRadius: '50%'
                      }} />
                      {formData.shift_name}
                    </>
                  ) : (
                    'Select Shift Code first'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Item Details */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1e293b',
              paddingBottom: '10px',
              borderBottom: '2px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              <FiBox style={{ color: '#8b5cf6' }} /> Item Details (from spiralitem table)
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Item Code */}
              <div>
                <label style={labelStyle}>Item Code *</label>
                <select
                  name="item_code"
                  value={formData.item_code}
                  onChange={handleChange}
                  style={{
                    ...selectStyle(errors.item_code),
                    background: formData.item_code ? '#f5f3ff' : '#fef2f2',
                    borderColor: formData.item_code ? '#8b5cf6' : (errors.item_code ? '#ef4444' : '#f87171')
                  }}
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
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #8b5cf6',
                  background: formData.item_name ? '#f5f3ff' : '#fef2f2',
                  fontSize: '15px',
                  color: formData.item_name ? '#7c3aed' : '#dc2626',
                  fontWeight: formData.item_name ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {formData.item_name ? (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#8b5cf6',
                        borderRadius: '50%'
                      }} />
                      {formData.item_name}
                    </>
                  ) : (
                    'Select Item Code first'
                  )}
                </div>
              </div>

              {/* Finished Product Name */}
              <div>
                <label style={labelStyle}>Finished Product Name</label>
                <div style={{
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #8b5cf6',
                  background: formData.finishedproductname ? '#f5f3ff' : '#fef2f2',
                  fontSize: '15px',
                  color: formData.finishedproductname ? '#7c3aed' : '#dc2626',
                  fontWeight: formData.finishedproductname ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {formData.finishedproductname ? (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#8b5cf6',
                        borderRadius: '50%'
                      }} />
                      {formData.finishedproductname}
                    </>
                  ) : (
                    'Select Item Code first'
                  )}
                </div>
              </div>

              {/* Raw Material Flatsize */}
              <div>
                <label style={labelStyle}>Raw Material Flatsize</label>
                <div style={{
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #8b5cf6',
                  background: formData.raw_material_flatsize ? '#f5f3ff' : '#fef2f2',
                  fontSize: '15px',
                  color: formData.raw_material_flatsize ? '#7c3aed' : '#dc2626',
                  fontWeight: formData.raw_material_flatsize ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {formData.raw_material_flatsize ? (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#8b5cf6',
                        borderRadius: '50%'
                      }} />
                      {formData.raw_material_flatsize}
                    </>
                  ) : (
                    'Select Item Code first'
                  )}
                </div>
              </div>

              {/* Material Type */}
              <div>
                <label style={labelStyle}>Material Type</label>
                <div style={{
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #8b5cf6',
                  background: formData.material_type ? '#f5f3ff' : '#fef2f2',
                  fontSize: '15px',
                  color: formData.material_type ? '#7c3aed' : '#dc2626',
                  fontWeight: formData.material_type ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {formData.material_type ? (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#8b5cf6',
                        borderRadius: '50%'
                      }} />
                      {formData.material_type}
                    </>
                  ) : (
                    'Select Item Code first'
                  )}
                </div>
              </div>

              {/* Wire Size */}
              <div>
                <label style={labelStyle}>Wire Size</label>
                <div style={{
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #8b5cf6',
                  background: formData.wire_size ? '#f5f3ff' : '#fef2f2',
                  fontSize: '15px',
                  color: formData.wire_size ? '#7c3aed' : '#dc2626',
                  fontWeight: formData.wire_size ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  {formData.wire_size ? (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: '#8b5cf6',
                        borderRadius: '50%'
                      }} />
                      {formData.wire_size}
                    </>
                  ) : (
                    'Select Item Code first'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Production Details */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1e293b',
              paddingBottom: '10px',
              borderBottom: '2px solid #3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              <FiTool style={{ color: '#3b82f6' }} /> Production Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
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
                    placeholder="Enter quantity in meters"
                    min="0.01"
                    step="0.01"
                    style={{
                      ...inputStyle(errors.production_quantity),
                      background: formData.production_quantity ? '#dbeafe' : '#fef2f2',
                      borderColor: formData.production_quantity ? '#3b82f6' : (errors.production_quantity ? '#ef4444' : '#f87171'),
                      paddingRight: '80px'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: formData.production_quantity ? '#3b82f6' : '#dc2626',
                    fontWeight: '600',
                    fontSize: '14px'
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
                      background: formData.per_meter_wt ? '#dbeafe' : '#fef2f2',
                      borderColor: formData.per_meter_wt ? '#3b82f6' : '#f87171',
                      paddingRight: '50px'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: formData.per_meter_wt ? '#3b82f6' : '#dc2626',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    KG
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Weight per meter in Kilograms
                </div>
              </div>

              {/* Unit */}
              <div>
                <label style={labelStyle}>Unit</label>
                <div style={{
                  padding: '14px 15px',
                  borderRadius: '10px',
                  border: '1px solid #10b981',
                  background: '#f0fdf4',
                  fontSize: '15px',
                  color: '#065f46',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#10b981',
                    borderRadius: '50%'
                  }} />
                  Meter
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Calculations & Efficiency */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1e293b',
              paddingBottom: '10px',
              borderBottom: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              <FiTarget style={{ color: '#f59e0b' }} /> Auto-Calculations
            </h3>
            
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '20px',
              boxShadow: '0 4px 6px -1px rgba(251, 191, 36, 0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                marginBottom: '25px' 
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <FiGrid size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#92400e', fontSize: '22px', fontWeight: '700' }}>
                    Auto-Calculated Fields
                  </h3>
                  <p style={{ margin: '0', color: '#78350f', fontSize: '14px' }}>
                    Based on spiralitem & targets tables
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '20px'
              }}>
                {/* Weight Calculation */}
                <div style={{
                  background: calculatedWeight > 0 ? '#f0fdf4' : '#fef2f2',
                  padding: '20px',
                  borderRadius: '10px',
                  border: `2px solid ${calculatedWeight > 0 ? '#10b981' : '#f87171'}`,
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: calculatedWeight > 0 ? '#047857' : '#dc2626', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}>
                    {calculatedWeight > 0 ? <FiCheck /> : <FiAlertCircle />}
                    Calculated Weight
                  </div>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    color: calculatedWeight > 0 ? '#10b981' : '#dc2626',
                    marginBottom: '5px'
                  }}>
                    {calculatedWeight > 0 ? calculatedWeight.toFixed(2) : '0.00'} 
                    <span style={{ fontSize: '18px', fontWeight: '600' }}> KG</span>
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: calculatedWeight > 0 ? '#047857' : '#dc2626', 
                    marginTop: '8px', 
                    fontStyle: 'italic'
                  }}>
                    {weightFormula}
                  </div>
                </div>

                {/* Target Display */}
                <div style={{
                  background: machineTarget ? '#dbeafe' : '#fef2f2',
                  padding: '20px',
                  borderRadius: '10px',
                  border: `2px solid ${machineTarget ? '#3b82f6' : '#f87171'}`,
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: machineTarget ? '#1d4ed8' : '#dc2626', 
                    marginBottom: '8px', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}>
                    {machineTarget ? <FiCheck /> : <FiAlertCircle />}
                    Shift Target
                  </div>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    color: machineTarget ? '#3b82f6' : '#dc2626',
                    marginBottom: '5px'
                  }}>
                    {machineTarget 
                      ? machineTarget.target_qty.toLocaleString('en-US', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        }) 
                      : '--'} 
                    <span style={{ fontSize: '18px', fontWeight: '600' }}> Meter</span>
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: machineTarget ? '#1d4ed8' : '#dc2626', 
                    marginTop: '8px' 
                  }}>
                    {machineTarget 
                      ? `From: ${currentShiftName} | Source: targets table`
                      : 'Select Shift and Machine'}
                  </div>
                </div>

                {/* Efficiency Display */}
                <div style={{
                  background: calculatedEfficiency > 0 
                    ? (calculatedEfficiency >= 90 ? '#f0fdf4' : 
                       calculatedEfficiency >= 80 ? '#fef3c7' : '#fef2f2')
                    : '#fef2f2',
                  padding: '20px',
                  borderRadius: '10px',
                  border: `2px solid ${
                    calculatedEfficiency > 0
                      ? (calculatedEfficiency > 100 ? '#ef4444' :
                         calculatedEfficiency >= 90 ? '#10b981' :
                         calculatedEfficiency >= 80 ? '#f59e0b' : '#ef4444')
                      : '#f87171'
                  }`,
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: calculatedEfficiency > 0
                      ? (calculatedEfficiency > 100 ? '#b91c1c' :
                         calculatedEfficiency >= 90 ? '#047857' :
                         calculatedEfficiency >= 80 ? '#92400e' : '#b91c1c')
                      : '#dc2626',
                    marginBottom: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}>
                    <FiPercent />
                    Efficiency
                  </div>
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: '800', 
                    color: calculatedEfficiency > 0
                      ? (calculatedEfficiency > 100 ? '#ef4444' :
                         calculatedEfficiency >= 90 ? '#10b981' :
                         calculatedEfficiency >= 80 ? '#f59e0b' : '#ef4444')
                      : '#dc2626'
                  }}>
                    {calculatedEfficiency > 0 ? calculatedEfficiency.toFixed(2) : '0.00'}%
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: calculatedEfficiency > 0
                      ? (calculatedEfficiency > 100 ? '#ef4444' :
                         calculatedEfficiency >= 90 ? '#10b981' :
                         calculatedEfficiency >= 80 ? '#f59e0b' : '#ef4444')
                      : '#dc2626',
                    marginTop: '8px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}>
                    {calculatedEfficiency > 0 
                      ? (calculatedEfficiency > 100 ? 'Over Target' :
                         calculatedEfficiency >= 90 ? 'Excellent' :
                         calculatedEfficiency >= 80 ? 'Good' : 'Below Target')
                      : 'Enter Production & Select Shift'}
                  </div>
                  {calculatedEfficiency > 0 && (
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      marginTop: '10px',
                      padding: '5px',
                      background: 'rgba(0,0,0,0.05)',
                      borderRadius: '5px',
                      fontFamily: 'monospace'
                    }}>
                      Formula: {efficiencyFormula}
                    </div>
                  )}
                </div>
              </div>

              {/* ✨ YEH NAYA TARGET DETAILS COLUMN HAI ✨ */}
              <div style={{
                background: '#e0f2fe',
                padding: '15px',
                borderRadius: '10px',
                border: '2px solid #0ea5e9',
                marginTop: '15px'
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#0369a1', 
                  marginBottom: '10px', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiTarget />
                  Current Target Details
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Machine</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                      {formData.machine_id || '--'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Shift</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                      {formData.shift_code || '--'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Target</div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: machineTarget ? '#10b981' : '#ef4444'
                    }}>
                      {machineTarget 
                        ? `${machineTarget.target_qty} ${machineTarget.uom}`
                        : 'Not found'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>Status</div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: machineTarget ? '#10b981' : '#ef4444'
                    }}>
                      {machineTarget ? 'Found ✓' : 'Missing ✗'}
                    </div>
                  </div>
                </div>
              </div>
              {/* ✨ TARGET DETAILS COLUMN END ✨ */}

              <div style={{
                background: '#fef3c7',
                padding: '15px',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#92400e',
                marginTop: '15px',
                border: '1px solid #fbbf24'
              }}>
                <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiDivide /> <strong>Formula 1 (Weight):</strong> Production Quantity (Meter) × Per Meter Weight (KG) = Weight (KG)
                </div>
                <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiDivide /> <strong>Formula 2 (Efficiency):</strong> (Production Quantity ÷ Shift Target) × 100
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <strong>Data Sources:</strong> 
                  <span style={{ color: '#10b981', fontWeight: '600' }}>spiralitem table</span> | 
                  <span style={{ color: '#3b82f6', fontWeight: '600' }}>targets table</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Operator Details */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1e293b',
              paddingBottom: '10px',
              borderBottom: '2px solid #8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '20px',
              fontWeight: '700'
            }}>
              <FiUser style={{ color: '#8b5cf6' }} /> Operator Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Operator Name */}
              <div>
                <label style={labelStyle}>Operator Name *</label>
                <input
                  type="text"
                  name="operator_name"
                  value={formData.operator_name}
                  onChange={handleChange}
                  placeholder="Enter operator name"
                  style={{
                    ...inputStyle(errors.operator_name),
                    background: formData.operator_name ? '#f5f3ff' : '#fef2f2',
                    borderColor: formData.operator_name ? '#8b5cf6' : (errors.operator_name ? '#ef4444' : '#f87171')
                  }}
                />
                {errors.operator_name && <ErrorText text={errors.operator_name} />}
              </div>

              {/* User Name (System User) */}
              <div>
                <label style={labelStyle}>Auto User Name (System)</label>
                <input
                  type="text"
                  name="users_name"
                  value={formData.users_name}
                  onChange={handleChange}
                  placeholder="System user name"
                  style={{
                    ...inputStyle(),
                    background: formData.users_name ? '#f5f3ff' : '#fef2f2',
                    borderColor: formData.users_name ? '#8b5cf6' : '#f87171'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Leave empty for "System" user
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Remarks */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1e293b',
              paddingBottom: '10px',
              borderBottom: '2px solid #64748b',
              fontSize: '20px',
              fontWeight: '700'
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
                rows="4"
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '10px',
                  border: `1px solid ${formData.remarks ? '#8b5cf6' : '#f87171'}`,
                  background: formData.remarks ? '#faf5ff' : '#fef2f2',
                  fontSize: '15px',
                  color: formData.remarks ? '#1e293b' : '#dc2626',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = formData.remarks ? '#faf5ff' : '#fef2f2';
                  e.target.style.borderColor = formData.remarks ? '#8b5cf6' : '#f87171';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '30px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: '2px solid #d1d5db',
                padding: '14px 28px',
                borderRadius: '10px',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#9ca3af';
                e.target.style.color = '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#d1d5db';
                e.target.style.color = '#6b7280';
              }}
            >
              <FiSettings /> Reset Form
            </button>

            <div style={{ display: 'flex', gap: '20px' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'transparent',
                  border: '2px solid #fca5a5',
                  padding: '14px 32px',
                  borderRadius: '10px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fee2e2';
                  e.target.style.borderColor = '#f87171';
                  e.target.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#fca5a5';
                  e.target.style.color = '#ef4444';
                }}
              >
                <FiX /> Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  padding: '14px 40px',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 12px -1px rgba(16, 185, 129, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave /> Save Record
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
      `}</style>
    </div>
  );
};

// Reusable styles
const labelStyle = {
  marginBottom: '10px',
  fontWeight: '600',
  color: '#374151',
  fontSize: '15px',
  display: 'block'
};

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '14px 15px',
  borderRadius: '10px',
  border: `1px solid ${hasError ? '#ef4444' : '#e5e7eb'}`,
  background: '#f8fafc',
  fontSize: '15px',
  color: '#1f2937',
  transition: 'all 0.2s ease',
  outline: 'none'
});

const selectStyle = (hasError) => ({
  ...inputStyle(hasError),
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 15px center',
  backgroundSize: '20px',
  paddingRight: '45px'
});

const ErrorText = ({ text }) => (
  <div style={{ 
    color: '#ef4444', 
    fontSize: '13px', 
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  }}>
    <FiAlertCircle size={14} /> {text}
  </div>
);

export default SpiralForm;