// src/pages/ProductionSections/PVCCoatingSection/PVCCoatingMultiEntryForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiArrowLeft, FiPackage, FiLayers, 
  FiTool, FiUser, FiClock, FiHash, FiBox, 
  FiCheckSquare, FiDroplet, FiDatabase, FiX,
  FiTarget, FiPercent, FiCheck, FiAlertCircle, 
  FiRefreshCw, FiEdit2, FiSettings, FiClipboard,
  FiTrendingUp, FiPlus, FiTrash2, FiList, FiGrid,
  FiActivity, FiTarget as FiTargetIcon
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const PVCCoatingMultiEntryForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    section_name: 'pvcsection',
    targets_id: '',
    machine_id: '',
    machine_no: '',
    shift_code: '',
    shift_name: '',
    operator_name: '',
    users_name: '',
    remarks: ''
  });

  const [entries, setEntries] = useState([
    {
      id: Date.now(),
      item_code: '',
      item_name: '',
      raw_material_flatsize: '',
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
  const [machineTarget, setMachineTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [entryErrors, setEntryErrors] = useState([]);

  // ✅ USER AUTO-FILL
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          const userName = session.user.email?.split('@')[0] || 'User';
          setFormData(prev => ({ ...prev, users_name: userName }));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  // ✅ FETCH DATA
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. ✅ pvcitem TABLE
      const { data: itemsData, error: itemsError } = await supabase
        .from('pvcitem')
        .select('*')
        .order('item_name');

      if (itemsError) throw new Error(`pvcitem table: ${itemsError.message}`);
      setItems(itemsData || []);

      // 2. ✅ targets TABLE
      const { data: targetsData, error: targetsError } = await supabase
        .from('targets')
        .select('*')
        .eq('section_name', 'pvcsection')
        .order('machine_id');

      if (targetsError) throw new Error(`targets table: ${targetsError.message}`);
      setTargets(targetsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Data loading error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE TARGET SELECTION - MACHINE & SHIFT AUTO-FETCH
  const handleTargetChange = (targetId) => {
    const target = targets.find(t => t.id == targetId);
    
    if (target) {
      setMachineTarget(target);
      
      // Update form data with target, machine, and shift details
      setFormData(prev => ({
        ...prev,
        targets_id: target.id,
        machine_id: target.machine_id || '',
        machine_no: target.machine_no || target.machine_id || '',
        shift_code: target.shift_code || '',
        shift_name: target.shift_name || target.shift_code || ''
      }));
    }
  };

  // ✅ ADD NEW ENTRY ROW
  const addEntryRow = () => {
    const newEntry = {
      id: Date.now() + Math.random(),
      item_code: '',
      item_name: '',
      raw_material_flatsize: '',
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

        // If item_code changed, auto-fill item details
        if (field === 'item_code' && value) {
          const item = items.find(i => i.item_code === value);
          if (item) {
            updatedEntry.item_name = item.item_name || '';
            updatedEntry.raw_material_flatsize = item.raw_material_flatsize || '';
            updatedEntry.material_type = item.material_type || 'PVC';
            updatedEntry.finishedproductname = item.finishedproductname || '';
            updatedEntry.per_meter_wt = item.per_meter_wt || '';
            updatedEntry.unit = item.unit || 'Meter';
          }
        }

        // Calculate weight if production quantity or per meter weight changes
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

  // ✅ CALCULATE TOTAL EFFICIENCY
  const calculateTotalEfficiency = () => {
    const totalProduction = calculateTotalProduction();
    
    if (!machineTarget || !machineTarget.target_qty || parseFloat(machineTarget.target_qty) <= 0) {
      return 0;
    }

    const targetQty = parseFloat(machineTarget.target_qty);
    const efficiency = (totalProduction / targetQty) * 100;
    return Math.min(100, parseFloat(efficiency.toFixed(2)));
  };

  // ✅ VALIDATE FORM
  const validateForm = () => {
    const errors = {};
    const entryErrs = [];

    // Validate main form
    if (!formData.targets_id) errors.targets_id = 'Target selection is required';
    if (!formData.shift_code) errors.shift_code = 'Shift is required';
    if (!formData.operator_name) errors.operator_name = 'Operator name is required';
    if (!formData.remarks) errors.remarks = 'Remarks are required';

    // Validate each entry
    entries.forEach((entry, index) => {
      const entryError = {};
      if (!entry.item_code) entryError.item_code = 'Item is required';
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

  // ✅ SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all required fields in all entries');
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      const records = entries.map(entry => ({
        ...formData,
        item_code: entry.item_code,
        item_name: entry.item_name,
        raw_material_flatsize: entry.raw_material_flatsize,
        material_type: entry.material_type,
        finishedproductname: entry.finishedproductname,
        production_quantity: parseFloat(entry.production_quantity) || 0,
        per_meter_wt: parseFloat(entry.per_meter_wt) || 0,
        weight: parseFloat(entry.weight) || 0,
        unit: entry.unit,
        efficiency: calculateTotalEfficiency(),
        targets_id: formData.targets_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('pvcsection')
        .insert(records);

      if (error) throw error;
      
      setSuccess(`${records.length} records created successfully!`);
      setTimeout(() => navigate('/production-sections/pvc-coating'), 3000);

    } catch (error) {
      console.error('Error saving records:', error);
      setError('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
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
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid #f3f4f6', 
          borderTopColor: '#8b5cf6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading form data...</p>
      </div>
    );
  }

  const totals = calculateTotals();
  const totalEfficiency = calculateTotalEfficiency();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <button
          onClick={() => navigate('/production-sections/pvc-coating')}
          style={{
            backgroundColor: 'white',
            border: '2px solid #8b5cf6',
            color: '#8b5cf6',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#8b5cf6';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = '#8b5cf6';
          }}
        >
          <FiArrowLeft /> Back to PVC Coating
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#8b5cf6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <FiGrid size={28} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1f2937', fontWeight: '700' }}>
              PVC Coating Multi-Entry Form
            </h1>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
              Add multiple items with ONE machine target • Batch Entry System
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={fetchAllData}
          style={{
            backgroundColor: '#10b981',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <FiRefreshCw size={14} /> Refresh Data
        </button>
        
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '10px 15px',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#0369a1',
          fontWeight: '600',
          border: '1px solid #bae6fd'
        }}>
          <FiList style={{ marginRight: '8px' }} />
          Total Items: {items.length} | Total Targets: {targets.length}
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          border: '2px solid #10b981',
          color: '#065f46',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <FiCheck size={20} />
          <div>
            <strong style={{ fontSize: '16px' }}>{success}</strong>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>Redirecting to PVC Coating page...</div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '2px solid #ef4444',
          color: '#dc2626',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <FiAlertCircle size={20} />
          <div>
            <strong style={{ fontSize: '16px' }}>Error</strong>
            <div style={{ fontSize: '14px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Target & Machine Card */}
      <div style={{
        backgroundColor: 'white',
        border: '2px solid #8b5cf6',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '25px',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#8b5cf6',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <FiTargetIcon size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
              Target & Machine Selection
            </h2>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
              Select target and machine/shift will auto-fill • One target for all items
            </p>
          </div>
        </div>

        {/* Target Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: '600',
            color: '#374151',
            fontSize: '16px'
          }}>
            <FiTargetIcon style={{ marginRight: '8px', color: '#8b5cf6' }} />
            Select Target *
          </label>
          <select
            value={formData.targets_id}
            onChange={(e) => handleTargetChange(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: '2px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '16px',
              color: '#1f2937',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
          >
            <option value="">Select Target ({targets.length} available)</option>
            {targets.map((target, index) => (
              <option key={index} value={target.id}>
                Machine: {target.machine_id} 
                {target.machine_no ? ` (${target.machine_no})` : ''}
                {target.shift_code ? ` | Shift: ${target.shift_code}` : ''}
                {target.target_qty ? ` | Target: ${target.target_qty}` : ''}
              </option>
            ))}
          </select>
          {validationErrors.targets_id && (
            <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
              {validationErrors.targets_id}
            </div>
          )}
        </div>

        {/* Machine & Shift Display */}
        {machineTarget && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <FiTool size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
                  Machine & Shift Details
                </h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                  Auto-filled from selected target
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px'
            }}>
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Machine ID
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {machineTarget.machine_id}
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Machine No
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {machineTarget.machine_no || machineTarget.machine_id}
                </div>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Shift Code
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  {machineTarget.shift_code || 'N/A'}
                </div>
              </div>
              
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                  Target Quantity
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#92400e' }}>
                  {machineTarget.target_qty || 0} {machineTarget.uom || 'Meter'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        padding: '30px',
        marginBottom: '30px'
      }}>
        
        {/* Shift & Operator Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          
          {/* Shift Details */}
          <div>
            <div style={{
              backgroundColor: '#d1fae5',
              border: '2px solid #10b981',
              color: '#065f46',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiClock size={16} /> SHIFT DETAILS
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiClock size={14} style={{ color: '#10b981', marginRight: '8px' }} />
                Shift Code *
              </label>
              <input
                type="text"
                value={formData.shift_code}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${formData.shift_code ? '#10b981' : '#ef4444'}`,
                  backgroundColor: formData.shift_code ? '#f0fdf4' : '#fef2f2',
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
              />
              {validationErrors.shift_code && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.shift_code}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiClock size={14} style={{ color: '#6b7280', marginRight: '8px' }} />
                Shift Name
              </label>
              <input
                type="text"
                value={formData.shift_name}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #d1d5db',
                  backgroundColor: '#f9fafb',
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
              />
            </div>
          </div>

          {/* Operator Details */}
          <div>
            <div style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              color: '#92400e',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiUser size={16} /> OPERATOR DETAILS
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiUser size={14} style={{ color: '#f59e0b', marginRight: '8px' }} />
                Operator Name *
              </label>
              <input
                type="text"
                name="operator_name"
                value={formData.operator_name}
                onChange={(e) => setFormData(prev => ({ ...prev, operator_name: e.target.value }))}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${formData.operator_name ? '#10b981' : '#ef4444'}`,
                  backgroundColor: formData.operator_name ? '#f0fdf4' : '#fef2f2',
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500',
                  transition: 'all 0.3s'
                }}
                placeholder="Enter operator name"
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = formData.operator_name ? '#10b981' : '#ef4444'}
              />
              {validationErrors.operator_name && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.operator_name}
                </div>
              )}
            </div>

            {/* Remarks */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiClipboard size={14} style={{ color: '#8b5cf6', marginRight: '8px' }} />
                Remarks *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                required
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${formData.remarks ? '#10b981' : '#ef4444'}`,
                  backgroundColor: formData.remarks ? '#f0fdf4' : '#fef2f2',
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500',
                  transition: 'all 0.3s',
                  resize: 'vertical'
                }}
                placeholder="Enter remarks for all entries"
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = formData.remarks ? '#10b981' : '#ef4444'}
              />
              {validationErrors.remarks && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.remarks}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Entries Section */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{
              backgroundColor: '#8b5cf6',
              border: '2px solid #7c3aed',
              color: 'white',
              padding: '12px 15px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiPackage size={16} /> ITEM ENTRIES ({entries.length})
            </div>
            
            <button
              type="button"
              onClick={addEntryRow}
              style={{
                backgroundColor: '#8b5cf6',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#7c3aed';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#8b5cf6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiPlus /> Add New Item
            </button>
          </div>

          {/* Entries List */}
          {entries.map((entry, index) => {
            const entryError = entryErrors.find(err => err.index === index);
            
            return (
              <div key={entry.id} style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '15px',
                position: 'relative',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8b5cf6';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                
                {/* Entry Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{ 
                    backgroundColor: '#8b5cf6', 
                    color: 'white', 
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Entry #{index + 1}
                  </div>
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntryRow(entry.id)}
                      style={{
                        backgroundColor: '#fee2e2',
                        border: '1px solid #ef4444',
                        color: '#dc2626',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fecaca';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#fee2e2';
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>

                {/* Entry Form */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '15px'
                }}>
                  
                  {/* Item Selection */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '13px'
                    }}>
                      Item *
                    </label>
                    <select
                      value={entry.item_code}
                      onChange={(e) => handleEntryChange(entry.id, 'item_code', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: `2px solid ${entry.item_code ? '#10b981' : '#ef4444'}`,
                        backgroundColor: entry.item_code ? '#f0fdf4' : '#fef2f2',
                        fontSize: '13px',
                        color: '#1f2937',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                      onBlur={(e) => e.target.style.borderColor = entry.item_code ? '#10b981' : '#ef4444'}
                    >
                      <option value="">Select Item</option>
                      {items.map((item, idx) => (
                        <option key={idx} value={item.item_code}>
                          {item.item_code} - {item.item_name}
                        </option>
                      ))}
                    </select>
                    {entryError?.errors.item_code && (
                      <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>
                        {entryError.errors.item_code}
                      </div>
                    )}
                  </div>

                  {/* Production Quantity */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '13px'
                    }}>
                      Production Qty *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entry.production_quantity}
                      onChange={(e) => handleEntryChange(entry.id, 'production_quantity', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: `2px solid ${entry.production_quantity ? '#10b981' : '#ef4444'}`,
                        backgroundColor: entry.production_quantity ? '#f0fdf4' : '#fef2f2',
                        fontSize: '13px',
                        color: '#1f2937',
                        transition: 'all 0.3s'
                      }}
                      placeholder="Meter"
                      onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                      onBlur={(e) => e.target.style.borderColor = entry.production_quantity ? '#10b981' : '#ef4444'}
                    />
                    {entryError?.errors.production_quantity && (
                      <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>
                        {entryError.errors.production_quantity}
                      </div>
                    )}
                  </div>

                  {/* Per Meter Weight */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '13px'
                    }}>
                      Per Meter Wt (KG/M) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={entry.per_meter_wt}
                      onChange={(e) => handleEntryChange(entry.id, 'per_meter_wt', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: `2px solid ${entry.per_meter_wt ? '#10b981' : '#ef4444'}`,
                        backgroundColor: entry.per_meter_wt ? '#f0fdf4' : '#fef2f2',
                        fontSize: '13px',
                        color: '#1f2937',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                      onBlur={(e) => e.target.style.borderColor = entry.per_meter_wt ? '#10b981' : '#ef4444'}
                    />
                    {entryError?.errors.per_meter_wt && (
                      <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px' }}>
                        {entryError.errors.per_meter_wt}
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Details Display */}
                {entry.item_code && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '10px',
                    marginTop: '15px',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      padding: '8px'
                    }}>
                      <div style={{ color: '#0369a1', fontWeight: '600' }}>Item</div>
                      <div style={{ color: '#1e293b' }}>{entry.item_name}</div>
                    </div>
                    <div style={{
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      padding: '8px'
                    }}>
                      <div style={{ color: '#0369a1', fontWeight: '600' }}>Material</div>
                      <div style={{ color: '#1e293b' }}>{entry.material_type}</div>
                    </div>
                    <div style={{
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '6px',
                      padding: '8px'
                    }}>
                      <div style={{ color: '#065f46', fontWeight: '600' }}>Total Weight</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>{entry.weight || '0'} KG</div>
                    </div>
                    <div style={{
                      backgroundColor: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '6px',
                      padding: '8px'
                    }}>
                      <div style={{ color: '#92400e', fontWeight: '600' }}>Unit</div>
                      <div style={{ color: '#1e293b', fontWeight: '600' }}>{entry.unit}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Efficiency & Target Summary Card */}
        {machineTarget && (
          <div style={{
            backgroundColor: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '25px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: '#3b82f6',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <FiActivity size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                  Target & Efficiency Summary
                </h2>
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                  Based on selected machine target
                </p>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                  Machine Target
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#92400e' }}>
                  {machineTarget.target_qty || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                  {machineTarget.uom || 'Meter'}
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#065f46', marginBottom: '10px' }}>
                  Total Production
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#065f46' }}>
                  {totals.totalProduction.toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', color: '#065f46', marginTop: '5px', opacity: '0.8' }}>
                  Meter
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #0ea5e9',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '10px' }}>
                  Total Weight
                </div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#0369a1' }}>
                  {totals.totalWeight.toFixed(2)}
                </div>
                <div style={{ fontSize: '14px', color: '#0369a1', marginTop: '5px', opacity: '0.8' }}>
                  KG
                </div>
              </div>

              <div style={{
                backgroundColor: totalEfficiency >= 80 ? '#f0fdf4' : 
                          totalEfficiency >= 60 ? '#fef3c7' : '#fef2f2',
                border: `2px solid ${totalEfficiency >= 80 ? '#10b981' : 
                        totalEfficiency >= 60 ? '#f59e0b' : '#ef4444'}`,
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  color: totalEfficiency >= 80 ? '#065f46' : 
                        totalEfficiency >= 60 ? '#92400e' : '#dc2626',
                  marginBottom: '10px' 
                }}>
                  Overall Efficiency
                </div>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: totalEfficiency >= 80 ? '#065f46' : 
                        totalEfficiency >= 60 ? '#92400e' : '#dc2626'
                }}>
                  {totalEfficiency.toFixed(2)}%
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: totalEfficiency >= 80 ? '#065f46' : 
                        totalEfficiency >= 60 ? '#92400e' : '#dc2626',
                  marginTop: '5px', 
                  opacity: '0.8' 
                }}>
                  Based on total production vs target
                </div>
              </div>
            </div>
          </div>
        )}

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
            onClick={() => navigate('/production-sections/pvc-coating')}
            style={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              padding: '12px 24px',
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
            }}
          >
            <FiX /> Cancel
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={addEntryRow}
              style={{
                backgroundColor: '#10b981',
                border: '2px solid #059669',
                padding: '12px 24px',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FiPlus /> Add Another Item
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: saving ? '#c4b5fd' : '#8b5cf6',
                border: '2px solid #7c3aed',
                padding: '12px 32px',
                borderRadius: '8px',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = '#7c3aed';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.backgroundColor = '#8b5cf6';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {saving ? 'Saving...' : <><FiSave /> Save All ({entries.length}) Items</>}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        select, input, textarea {
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.3s ease;
        }
        
        select:focus, input:focus, textarea:focus {
          outline: none;
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default PVCCoatingMultiEntryForm;