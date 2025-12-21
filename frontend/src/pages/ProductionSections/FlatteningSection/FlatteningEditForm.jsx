// src/pages/ProductionSections/FlatteningSection/FlatteningEditForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiSave, FiX, FiPackage, FiArrowLeft,
  FiCalendar, FiUser, FiSettings, FiTarget,
  FiEdit2, FiRefreshCw
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';

const FlatteningEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    section_name: 'Flattening',
    machine_id: '',
    machine_no: '',
    item_name: '',
    production_quantity: '',
    coil_size: '',
    shift: '', // Note: shift column, not shift_code
    operator_name: '',
    efficiency: 0,
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordLoading, setRecordLoading] = useState(true);
  
  // Dynamic data from Supabase
  const [shifts, setShifts] = useState([]);
  const [items, setItems] = useState([]);
  const [machineTargets, setMachineTargets] = useState([]);
  
  // Calculated efficiency
  const [calculatedEfficiency, setCalculatedEfficiency] = useState(0);
  const [machineTarget, setMachineTarget] = useState(null);
  
  // Original record data
  const [originalRecord, setOriginalRecord] = useState(null);

  // Fetch all configuration data
  useEffect(() => {
    fetchConfigurationData();
  }, []);

  // Fetch existing record data
  useEffect(() => {
    if (id) {
      fetchRecordData();
    }
  }, [id]);

  const fetchConfigurationData = async () => {
    try {
      setLoading(true);
      
      // Fetch shifts from shifts table
      const { data: shiftData, error: shiftError } = await supabase
        .from('shifts')
        .select('*')
        .order('start_time');
      
      if (shiftError) {
        console.error('Error fetching shifts:', shiftError);
      }
      
      // Fetch items from items table
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('item_name');
      
      if (itemError) {
        console.error('Error fetching items:', itemError);
      }
      
      // Fetch targets for Flattening section
      const { data: targetData, error: targetError } = await supabase
        .from('targets')
        .select('*')
        .eq('is_active', true)
        .eq('section', 'Flattening');
      
      if (targetError) {
        console.error('Error fetching targets:', targetError);
      }

      setShifts(shiftData || []);
      setItems(itemData || []);
      setMachineTargets(targetData || []);
      
    } catch (error) {
      console.error('Error fetching configuration:', error);
      // Fallback data
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
        { id: 1, section: 'Flattening', machine_id: 'FLT-001', machine_no: 'FLT-001', shift_code: 'M', target_qty: 5000, uom: 'Kg', is_active: true },
        { id: 2, section: 'Flattening', machine_id: 'FLT-001', machine_no: 'FLT-001', shift_code: 'E', target_qty: 4500, uom: 'Kg', is_active: true },
        { id: 3, section: 'Flattening', machine_id: 'FLT-002', machine_no: 'FLT-002', shift_code: 'M', target_qty: 5500, uom: 'Kg', is_active: true }
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordData = async () => {
    try {
      setRecordLoading(true);
      
      const { data, error } = await supabase
        .from('flatteningsection')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching record:', error);
        alert('Record not found!');
        navigate('/production-sections/flattening');
        return;
      }
      
      if (data) {
        console.log('Loaded record from flatteningsection:', data);
        setOriginalRecord(data);
        
        // Map database columns to form fields
        setFormData({
          section_name: data.section_name || 'Flattening',
          machine_id: data.machine_id || '',
          machine_no: data.machine_no || '',
          item_name: data.item_name || '',
          production_quantity: data.production_quantity || '',
          coil_size: data.coil_size || '',
          shift: data.shift || '', // Note: using shift, not shift_code
          operator_name: data.operator_name || '',
          efficiency: data.efficiency || 0,
          remarks: data.remarks || ''
        });
        
        // Set calculated efficiency
        if (data.efficiency) {
          setCalculatedEfficiency(data.efficiency);
        }
      }
      
    } catch (error) {
      console.error('Error fetching record data:', error);
      alert('Failed to load record data');
      navigate('/production-sections/flattening');
    } finally {
      setRecordLoading(false);
    }
  };

  // Calculate efficiency when production quantity or machine changes
  useEffect(() => {
    calculateEfficiency();
  }, [formData.production_quantity, formData.machine_id, formData.shift]);

  const calculateEfficiency = () => {
    const productionQty = parseInt(formData.production_quantity) || 0;
    
    if (!formData.machine_id || !formData.shift || productionQty <= 0) {
      setCalculatedEfficiency(0);
      setMachineTarget(null);
      return;
    }

    // Find machine target (using shift_code from targets table)
    const target = machineTargets.find(m => 
      m.machine_id === formData.machine_id && 
      m.shift_code === formData.shift // Compare shift with shift_code from targets
    );
    
    setMachineTarget(target);

    if (!target) {
      setCalculatedEfficiency(0);
      return;
    }

    // Calculate efficiency percentage
    const efficiency = target.target_qty > 0 ? (productionQty / target.target_qty) * 100 : 0;
    const calculatedEff = parseFloat(efficiency.toFixed(2));
    setCalculatedEfficiency(calculatedEff);
    
    // Update form data with new efficiency
    setFormData(prev => ({
      ...prev,
      efficiency: calculatedEff
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      m.machine_id === machineId
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
    
    if (!formData.section_name.trim()) newErrors.section_name = 'Section is required';
    if (!formData.machine_id.trim()) newErrors.machine_id = 'Machine ID is required';
    if (!formData.machine_no.trim()) newErrors.machine_no = 'Machine number is required';
    if (!formData.item_name.trim()) newErrors.item_name = 'Item name is required';
    
    if (!formData.production_quantity) {
      newErrors.production_quantity = 'Production quantity is required';
    } else if (isNaN(formData.production_quantity) || parseInt(formData.production_quantity) <= 0) {
      newErrors.production_quantity = 'Please enter a valid positive number';
    }
    
    if (!formData.coil_size.trim()) newErrors.coil_size = 'Coil size is required';
    if (!formData.shift.trim()) newErrors.shift = 'Shift is required';
    if (!formData.operator_name.trim()) newErrors.operator_name = 'Operator name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (originalRecord && !hasChanges()) {
      if (window.confirm('No changes detected. Continue anyway?')) {
        navigate('/production-sections/flattening');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare update data according to your table structure
      const updateData = {
        section_name: formData.section_name.trim(),
        machine_id: formData.machine_id.trim(),
        machine_no: formData.machine_no.trim(),
        item_name: formData.item_name.trim(),
        production_quantity: parseInt(formData.production_quantity),
        coil_size: formData.coil_size.trim(),
        shift: formData.shift.trim(), // Storing as shift (e.g., 'M', 'E', 'N')
        operator_name: formData.operator_name.trim(),
        efficiency: calculatedEfficiency,
        remarks: formData.remarks.trim(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating record with data:', updateData);
      
      const { data, error } = await supabase
        .from('flatteningsection')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        
        // Try without updated_at if column doesn't exist
        if (error.message.includes('column')) {
          console.log('Trying without updated_at column...');
          
          const { updated_at, ...updateDataWithoutUpdatedAt } = updateData;
          
          const { data: simpleData, error: simpleError } = await supabase
            .from('flatteningsection')
            .update(updateDataWithoutUpdatedAt)
            .eq('id', id)
            .select();
          
          if (simpleError) throw simpleError;
          
          alert('Flattening section record updated successfully!');
          navigate('/production-sections/flattening');
          return;
        }
        
        throw error;
      }
      
      console.log('Update successful:', data);
      alert('Flattening section record updated successfully!');
      navigate('/production-sections/flattening');
      
    } catch (error) {
      console.error('Error updating record:', error);
      alert(`Failed to update record. Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        navigate('/production-sections/flattening');
      }
    } else {
      navigate('/production-sections/flattening');
    }
  };

  const handleReset = () => {
    if (originalRecord) {
      if (window.confirm('Reset all fields to original values?')) {
        setFormData({
          section_name: originalRecord.section_name || 'Flattening',
          machine_id: originalRecord.machine_id || '',
          machine_no: originalRecord.machine_no || '',
          item_name: originalRecord.item_name || '',
          production_quantity: originalRecord.production_quantity || '',
          coil_size: originalRecord.coil_size || '',
          shift: originalRecord.shift || '',
          operator_name: originalRecord.operator_name || '',
          efficiency: originalRecord.efficiency || 0,
          remarks: originalRecord.remarks || ''
        });
        setErrors({});
        if (originalRecord.efficiency) {
          setCalculatedEfficiency(originalRecord.efficiency);
        }
      }
    }
  };

  const hasChanges = () => {
    if (!originalRecord) return false;
    
    return (
      formData.section_name !== (originalRecord.section_name || 'Flattening') ||
      formData.machine_id !== (originalRecord.machine_id || '') ||
      formData.machine_no !== (originalRecord.machine_no || '') ||
      formData.item_name !== (originalRecord.item_name || '') ||
      formData.production_quantity !== (originalRecord.production_quantity?.toString() || '') ||
      formData.coil_size !== (originalRecord.coil_size || '') ||
      formData.shift !== (originalRecord.shift || '') ||
      formData.operator_name !== (originalRecord.operator_name || '') ||
      formData.efficiency !== (originalRecord.efficiency || 0) ||
      formData.remarks !== (originalRecord.remarks || '')
    );
  };

  // Get unique machines from targets table for Flattening section
  const flatteningMachines = machineTargets
    .filter((value, index, self) => 
      index === self.findIndex(t => t.machine_id === value.machine_id)
    );

  if (loading || recordLoading) {
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
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p>
          {recordLoading ? 'Loading record data...' : 'Loading configuration data...'}
        </p>
      </div>
    );
  }

  if (!originalRecord) {
    return (
      <div style={{ padding: '50px', textAlign: 'center', color: '#ef4444' }}>
        <h3>Record Not Found</h3>
        <p>Unable to load record with ID: {id}</p>
        <button
          onClick={() => navigate('/production-sections/flattening')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Get shift display name
  const getShiftDisplayName = (shiftCode) => {
    const shiftInfo = shifts.find(s => s.shift_code === shiftCode);
    return shiftInfo ? `${shiftInfo.shift_name} (${shiftInfo.shift_code})` : shiftCode;
  };

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
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiEdit2 size={28} />
            </div>
            Edit Flattening Record
            <span style={{
              fontSize: '16px',
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 12px',
              borderRadius: '20px',
              marginLeft: '15px'
            }}>
              ID: {id}
            </span>
          </h1>
          <p style={{ 
            margin: '10px 0 0 75px', 
            color: '#64748b',
            fontSize: '16px'
          }}>
            Edit existing record in flatteningsection table
          </p>
        </div>
      </div>

      {/* Change Indicator */}
      {hasChanges() && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '10px',
          padding: '15px 20px',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            background: '#f59e0b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            !
          </div>
          <div>
            <strong style={{ color: '#92400e' }}>Unsaved Changes Detected</strong>
            <div style={{ color: '#b45309', fontSize: '14px', marginTop: '5px' }}>
              You have made changes to this record. Don't forget to save.
            </div>
          </div>
        </div>
      )}

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
            {/* Section Name */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Section Name *
              </label>
              <input
                type="text"
                name="section_name"
                value={formData.section_name}
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

            {/* Machine ID */}
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

            {/* Machine Number */}
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

            {/* Item Name */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Item Name *
              </label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                placeholder="Enter item name"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.item_name ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              {errors.item_name && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                  ⚠ {errors.item_name}
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
                step="1"
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

            {/* Coil Size */}
            <div>
              <label style={{
                marginBottom: '10px',
                fontWeight: '600',
                color: '#1e293b',
                fontSize: '15px',
                display: 'block'
              }}>
                Coil Size *
              </label>
              <input
                type="text"
                name="coil_size"
                value={formData.coil_size}
                onChange={handleChange}
                placeholder="e.g., 200kg"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.coil_size ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b'
                }}
              />
              {errors.coil_size && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                  ⚠ {errors.coil_size}
                </div>
              )}
            </div>

            {/* Shift */}
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
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.shift ? '#ef4444' : '#e2e8f0'}`,
                  background: '#f8fafc',
                  fontSize: '15px',
                  color: '#1e293b',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select shift</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.shift_code}>
                    {shift.shift_name} ({shift.shift_code})
                  </option>
                ))}
              </select>
              {errors.shift && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '5px' }}>
                  ⚠ {errors.shift}
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

            {/* Efficiency Display */}
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
                      Efficiency Calculation
                    </h3>
                    <p style={{ margin: '0', color: '#0c4a6e', fontSize: '14px' }}>
                      Based on targets table
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px'
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
                      {machineTarget ? machineTarget.target_qty.toFixed(0) : '--'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                      {getShiftDisplayName(formData.shift)}
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>
                      Production Quantity
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
                      Efficiency (Will be saved)
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
                  color: '#0c4a6e',
                  marginTop: '15px'
                }}>
                  <strong>Note:</strong> Efficiency ({calculatedEfficiency.toFixed(2)}%) will be automatically saved with the record.
                  {machineTarget && (
                    <div style={{ marginTop: '5px' }}>
                      <strong>Source:</strong> targets table | Machine: {formData.machine_id} | Shift: {formData.shift}
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
            <div style={{ display: 'flex', gap: '15px' }}>
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
                <FiRefreshCw /> Reset
              </button>
              
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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting 
                  ? '#94a3b8' 
                  : hasChanges() 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
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
              {isSubmitting ? 'Updating...' : <><FiSave /> Update Record</>}
            </button>
          </div>
        </div>
      </form>

      {/* Original Record Info */}
      {originalRecord && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '30px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#475569', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiCalendar /> Record Information
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px',
            fontSize: '14px'
          }}>
            <div>
              <div style={{ color: '#64748b', marginBottom: '3px' }}>Created At</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>
                {originalRecord.created_at ? new Date(originalRecord.created_at).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', marginBottom: '3px' }}>Original Efficiency</div>
              <div style={{ 
                fontWeight: '600', 
                color: originalRecord.efficiency > 100 ? '#ef4444' :
                       originalRecord.efficiency >= 90 ? '#059669' :
                       originalRecord.efficiency >= 80 ? '#d97706' : '#ef4444'
              }}>
                {originalRecord.efficiency?.toFixed(2) || '0.00'}%
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', marginBottom: '3px' }}>Current Efficiency</div>
              <div style={{ 
                fontWeight: '600', 
                color: calculatedEfficiency > 100 ? '#ef4444' :
                       calculatedEfficiency >= 90 ? '#059669' :
                       calculatedEfficiency >= 80 ? '#d97706' : '#ef4444'
              }}>
                {calculatedEfficiency.toFixed(2)}%
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', marginBottom: '3px' }}>Record Status</div>
              <div style={{ 
                fontWeight: '600', 
                color: hasChanges() ? '#d97706' : '#059669'
              }}>
                {hasChanges() ? 'Modified (Unsaved)' : 'No Changes'}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FlatteningEditForm;