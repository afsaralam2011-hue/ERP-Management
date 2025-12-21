// src/pages/ProductionSections/PVCCoatingSection/PVCCoatingEditForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiArrowLeft, FiPackage, FiLayers, 
  FiTool, FiUser, FiClock,
  FiHash, FiBox, FiCheckSquare,
  FiDroplet, FiDatabase, FiX,
  FiTarget, FiPercent, FiCheck,
  FiAlertCircle, FiRefreshCw,
  FiEdit2, FiSettings, FiClipboard,
  FiTrendingUp, FiEye, FiCalendar
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const PVCCoatingEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    section_name: 'pvcsection',
    targets_id: '',
    machine_id: '',
    machine_no: '',
    item_code: '',
    item_name: '',
    raw_material_flatsize: '',
    material_type: 'PVC',
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

  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [recordInfo, setRecordInfo] = useState({
    created_at: '',
    updated_at: '',
    id: ''
  });

  // ✅ 1. FETCH CURRENT RECORD
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        
        // Fetch the record
        const { data, error } = await supabase
          .from('pvcsection')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setOriginalData(data);
          setFormData(data);
          setRecordInfo({
            created_at: data.created_at,
            updated_at: data.updated_at,
            id: data.id
          });
        }

      } catch (error) {
        console.error('Error fetching record:', error);
        setError('Failed to load record: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  // ✅ 2. FETCH REFERENCE DATA
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch items
        const { data: itemsData } = await supabase
          .from('pvcitem')
          .select('*')
          .order('item_name');
        setItems(itemsData || []);

        // Fetch targets
        const { data: targetsData } = await supabase
          .from('targets')
          .select('*')
          .eq('section_name', 'pvcsection')
          .order('machine_id');
        setTargets(targetsData || []);

      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    if (formData.targets_id) {
      fetchReferenceData();
    }
  }, [formData.targets_id]);

  // ✅ 3. SET SELECTED TARGET BASED ON EXISTING RECORD
  useEffect(() => {
    if (formData.targets_id && targets.length > 0) {
      const target = targets.find(t => t.id == formData.targets_id);
      if (target) {
        setSelectedTarget(target);
      }
    }
  }, [formData.targets_id, targets]);

  // ✅ 4. AUTOMATIC WEIGHT CALCULATION
  useEffect(() => {
    if (formData.production_quantity && formData.per_meter_wt) {
      const production = parseFloat(formData.production_quantity) || 0;
      const perMeterWt = parseFloat(formData.per_meter_wt) || 0;
      const calculatedWeight = (production * perMeterWt).toFixed(2);
      
      if (parseFloat(calculatedWeight) !== parseFloat(formData.weight || 0)) {
        setFormData(prev => ({ ...prev, weight: calculatedWeight }));
      }
    }
  }, [formData.production_quantity, formData.per_meter_wt]);

  // ✅ 5. EFFICIENCY CALCULATION
  useEffect(() => {
    const calculateEfficiency = () => {
      const productionQty = parseFloat(formData.production_quantity) || 0;
      
      if (!selectedTarget || productionQty <= 0) {
        setFormData(prev => ({ ...prev, efficiency: 0 }));
        return;
      }

      const targetQty = selectedTarget.target_qty || 
                       selectedTarget.target_quantity || 
                       selectedTarget.quantity || 
                       0;

      if (!targetQty || targetQty <= 0) {
        setFormData(prev => ({ ...prev, efficiency: 0 }));
        return;
      }

      const efficiency = (productionQty / targetQty) * 100;
      const finalEfficiency = Math.min(100, parseFloat(efficiency.toFixed(2)));
      
      setFormData(prev => ({ ...prev, efficiency: finalEfficiency }));
    };

    if (formData.production_quantity && selectedTarget) {
      calculateEfficiency();
    }
  }, [formData.production_quantity, selectedTarget]);

  // ✅ 6. FIELD VALIDATION AND COLOR
  const getFieldBackgroundColor = (fieldName, value) => {
    if (fieldName === 'shift_name' || fieldName === 'per_meter_wt') {
      return value ? '#d1fae5' : '#f9fafb';
    }
    
    if (!value) return '#fee2e2';
    return '#d1fae5';
  };

  const getFieldBorderColor = (fieldName, value) => {
    if (fieldName === 'shift_name' || fieldName === 'per_meter_wt') {
      return value ? '#10b981' : '#d1d5db';
    }
    
    return !value ? '#ef4444' : '#10b981';
  };

  // ✅ 7. FORM VALIDATION
  const validateForm = () => {
    const errors = {};
    
    if (!formData.item_code) errors.item_code = 'Item is required';
    if (!formData.targets_id) errors.targets_id = 'Target is required';
    if (!formData.production_quantity || parseFloat(formData.production_quantity) <= 0) 
      errors.production_quantity = 'Production quantity is required';
    if (!formData.shift_code) errors.shift_code = 'Shift is required';
    if (!formData.operator_name) errors.operator_name = 'Operator name is required';
    if (!formData.remarks) errors.remarks = 'Remarks are required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ 8. HANDLE TARGET SELECTION
  const handleTargetChange = (targetId) => {
    const selectedTargetObj = targets.find(t => t.id == targetId);
    
    if (selectedTargetObj) {
      const updatedForm = {
        ...formData,
        targets_id: selectedTargetObj.id,
        machine_id: selectedTargetObj.machine_id || '',
        machine_no: selectedTargetObj.machine_no || selectedTargetObj.machine_id || '',
        unit: selectedTargetObj.uom || selectedTargetObj.unit || 'Meter'
      };

      if (selectedTargetObj.shift_code) {
        updatedForm.shift_code = selectedTargetObj.shift_code;
        updatedForm.shift_name = selectedTargetObj.shift_name || selectedTargetObj.shift_code;
      }

      if (selectedTargetObj.item_code) {
        updatedForm.item_code = selectedTargetObj.item_code;
        
        const item = items.find(i => i.item_code === selectedTargetObj.item_code);
        if (item) {
          updatedForm.item_name = item.item_name || '';
          updatedForm.raw_material_flatsize = item.raw_material_flatsize || '';
          updatedForm.material_type = item.material_type || 'PVC';
          updatedForm.finishedproductname = item.finishedproductname || '';
          updatedForm.per_meter_wt = item.per_meter_wt || '';
        }
      }
      
      setFormData(updatedForm);
      setSelectedTarget(selectedTargetObj);
    }
  };

  // ✅ 9. HANDLE ITEM SELECTION
  const handleItemChange = (e) => {
    const itemCode = e.target.value;
    setValidationErrors(prev => ({ ...prev, item_code: '' }));
    
    if (!itemCode) {
      setFormData(prev => ({
        ...prev,
        item_code: '',
        item_name: '',
        raw_material_flatsize: '',
        material_type: 'PVC',
        finishedproductname: '',
        per_meter_wt: '',
        unit: 'Meter'
      }));
      return;
    }
    
    const item = items.find(item => item.item_code === itemCode);
    
    if (item) {
      setFormData(prev => ({
        ...prev,
        item_code: item.item_code,
        item_name: item.item_name || '',
        raw_material_flatsize: item.raw_material_flatsize || '',
        material_type: item.material_type || 'PVC',
        finishedproductname: item.finishedproductname || '',
        per_meter_wt: item.per_meter_wt || '',
        unit: item.unit || 'Meter'
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ 10. HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all required fields marked with *');
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      const recordData = {
        ...formData,
        targets_id: formData.targets_id || null,
        production_quantity: parseFloat(formData.production_quantity) || 0,
        per_meter_wt: parseFloat(formData.per_meter_wt) || 0,
        weight: parseFloat(formData.weight) || 0,
        efficiency: parseFloat(formData.efficiency) || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('pvcsection')
        .update(recordData)
        .eq('id', id);

      if (error) throw error;
      
      setSuccess('Record updated successfully!');

      setTimeout(() => navigate('/production-sections/pvc-coating'), 2000);

    } catch (error) {
      console.error('Error saving record:', error);
      setError('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ✅ 11. COMPARE CHANGES
  const hasChanges = () => {
    if (!originalData) return false;
    
    const changedFields = [];
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changedFields.push(key);
      }
    });
    
    return changedFields.length > 0;
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
        <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading record data...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '25px' }}>
        <button
          onClick={() => navigate('/production-sections/pvc-coating')}
          style={{
            background: 'white',
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
            e.target.style.background = '#8b5cf6';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.color = '#8b5cf6';
          }}
        >
          <FiArrowLeft /> Back to PVC Coating
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <FiEdit2 size={28} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1f2937', fontWeight: '700' }}>
              Edit PVC Coating Record #{recordInfo.id}
            </h1>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
              Edit Production Entry | Make changes and save
            </p>
          </div>
        </div>
      </div>

      {/* Record Info */}
      {recordInfo.created_at && (
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiEye size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>
                Record #{recordInfo.id}
              </div>
              <div style={{ fontSize: '12px', opacity: '0.9' }}>
                Created: {new Date(recordInfo.created_at).toLocaleString()} | 
                Last Updated: {new Date(recordInfo.updated_at).toLocaleString()}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            background: hasChanges() ? '#f59e0b' : 'rgba(255, 255, 255, 0.2)',
            padding: '5px 10px',
            borderRadius: '20px',
            fontWeight: '600'
          }}>
            {hasChanges() ? '⚡ Changes Detected' : 'No Changes'}
          </div>
        </div>
      )}

      {/* Messages */}
      {success && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
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
          background: '#fee2e2',
          color: '#dc2626',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #fecaca',
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

      {/* Form */}
      <form onSubmit={handleSubmit} style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          
          {/* Section 1: ITEM & PRODUCTION */}
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiPackage size={16} /> ITEM & PRODUCTION DETAILS
            </div>

            {/* Item Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiHash size={14} /> Select Item *
              </label>
              <select
                value={formData.item_code}
                onChange={handleItemChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('item_code', formData.item_code)}`,
                  background: getFieldBackgroundColor('item_code', formData.item_code),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
              >
                <option value="">Select PVC Item ({items.length} available)</option>
                {items.map((item, index) => (
                  <option key={index} value={item.item_code}>
                    {item.item_code} - {item.item_name}
                  </option>
                ))}
              </select>
              {validationErrors.item_code && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.item_code}
                </div>
              )}
            </div>

            {/* Item Details */}
            {formData.item_code && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '10px',
                marginBottom: '20px'
              }}>
                <div style={{
                  background: '#f0f9ff',
                  border: '2px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '12px' }}>Item Name</div>
                  <div style={{ color: '#1e293b', fontSize: '14px', marginTop: '5px', fontWeight: '500' }}>{formData.item_name}</div>
                </div>
                <div style={{
                  background: '#f0f9ff',
                  border: '2px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '12px' }}>Material</div>
                  <div style={{ color: '#1e293b', fontSize: '14px', marginTop: '5px', fontWeight: '500' }}>{formData.material_type}</div>
                </div>
                <div style={{
                  background: '#f0f9ff',
                  border: '2px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '12px' }}>Size</div>
                  <div style={{ color: '#1e293b', fontSize: '14px', marginTop: '5px', fontWeight: '500' }}>{formData.raw_material_flatsize || 'N/A'}</div>
                </div>
                <div style={{
                  background: '#f0f9ff',
                  border: '2px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{ color: '#0369a1', fontWeight: '600', fontSize: '12px' }}>Unit</div>
                  <div style={{ color: '#1e293b', fontSize: '14px', marginTop: '5px', fontWeight: '500' }}>{formData.unit}</div>
                </div>
              </div>
            )}

            {/* Per Meter Weight */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiDroplet size={14} /> Per Meter Weight (KG/M)
              </label>
              <input
                type="number"
                step="0.001"
                name="per_meter_wt"
                value={formData.per_meter_wt}
                onChange={handleChange}
                min="0"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('per_meter_wt', formData.per_meter_wt)}`,
                  background: getFieldBackgroundColor('per_meter_wt', formData.per_meter_wt),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
                placeholder="KG/M"
              />
            </div>

            {/* Total Weight */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiDatabase size={14} /> Total Weight (KG)
              </label>
              <input
                type="number"
                step="0.01"
                name="weight"
                value={formData.weight}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('weight', formData.weight)}`,
                  background: getFieldBackgroundColor('weight', formData.weight),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
                placeholder="Auto-calculated"
              />
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                ⚡ Automatically calculated from production × per meter weight
              </div>
            </div>
          </div>

          {/* Section 2: TARGET & SHIFT */}
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiTarget size={16} /> TARGET & SHIFT DETAILS
            </div>

            {/* Target Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiTarget size={14} /> Select Target *
              </label>
              <select
                value={formData.targets_id}
                onChange={(e) => handleTargetChange(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('targets_id', formData.targets_id)}`,
                  background: getFieldBackgroundColor('targets_id', formData.targets_id),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
              >
                <option value="">Select Target ({targets.length} available)</option>
                {targets.map((target, index) => (
                  <option key={index} value={target.id}>
                    Machine: {target.machine_id} 
                    {target.machine_no ? ` (${target.machine_no})` : ''}
                    {target.target_qty ? ` | Target: ${target.target_qty}` : ''}
                    {target.shift_code ? ` | Shift: ${target.shift_code}` : ''}
                  </option>
                ))}
              </select>
              {validationErrors.targets_id && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.targets_id}
                </div>
              )}
            </div>

            {/* Machine Details */}
            {formData.machine_id && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '15px', 
                marginBottom: '20px' 
              }}>
                <div style={{
                  background: '#ecfdf5',
                  border: '2px solid #a7f3d0',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600' }}>Machine ID</div>
                  <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700', marginTop: '8px' }}>{formData.machine_id}</div>
                </div>
                <div style={{
                  background: '#ecfdf5',
                  border: '2px solid #a7f3d0',
                  borderRadius: '8px',
                  padding: '15px'
                }}>
                  <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600' }}>Machine No</div>
                  <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700', marginTop: '8px' }}>{formData.machine_no}</div>
                </div>
              </div>
            )}

            {/* Shift Code */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiClock size={14} /> Shift Code *
              </label>
              <input
                type="text"
                name="shift_code"
                value={formData.shift_code}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('shift_code', formData.shift_code)}`,
                  background: getFieldBackgroundColor('shift_code', formData.shift_code),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
                placeholder="Auto-filled from target"
              />
              {validationErrors.shift_code && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.shift_code}
                </div>
              )}
            </div>

            {/* Shift Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiClock size={14} /> Shift Name
              </label>
              <input
                type="text"
                name="shift_name"
                value={formData.shift_name}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('shift_name', formData.shift_name)}`,
                  background: getFieldBackgroundColor('shift_name', formData.shift_name),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
              />
            </div>
          </div>

          {/* Section 3: PERSONNEL & EFFICIENCY */}
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FiUser size={16} /> PERSONNEL & EFFICIENCY
            </div>

            {/* Production Quantity */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
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
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('production_quantity', formData.production_quantity)}`,
                  background: getFieldBackgroundColor('production_quantity', formData.production_quantity),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
                placeholder="Enter production quantity"
              />
              {validationErrors.production_quantity && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.production_quantity}
                </div>
              )}
            </div>

            {/* Efficiency Display */}
            <div style={{ 
              background: formData.efficiency >= 80 ? '#d1fae5' : 
                        formData.efficiency >= 60 ? '#fef3c7' : '#fee2e2',
              border: '2px solid',
              borderColor: formData.efficiency >= 80 ? '#10b981' : 
                          formData.efficiency >= 60 ? '#f59e0b' : '#ef4444',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px',
                marginBottom: '10px'
              }}>
                <FiTrendingUp size={20} color={formData.efficiency >= 80 ? '#059669' : 
                                             formData.efficiency >= 60 ? '#d97706' : '#dc2626'} />
                <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                  PRODUCTION EFFICIENCY
                </div>
              </div>
              <div style={{ 
                fontSize: '32px', 
                color: formData.efficiency >= 80 ? '#059669' : 
                      formData.efficiency >= 60 ? '#d97706' : '#dc2626', 
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {formData.efficiency}%
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Auto-calculated based on target vs production
              </div>
            </div>

            {/* Operator Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiUser size={14} /> Operator Name *
              </label>
              <input
                type="text"
                name="operator_name"
                value={formData.operator_name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('operator_name', formData.operator_name)}`,
                  background: getFieldBackgroundColor('operator_name', formData.operator_name),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
                placeholder="Enter operator name"
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
                <FiClipboard size={14} /> Remarks *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                required
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('remarks', formData.remarks)}`,
                  background: getFieldBackgroundColor('remarks', formData.remarks),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500',
                  resize: 'vertical'
                }}
                placeholder="Enter any remarks or notes"
              />
              {validationErrors.remarks && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.remarks}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Target Information */}
        {selectedTarget && (
          <div style={{
            background: '#ecfdf5',
            border: '2px solid #10b981',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <FiTarget color="#059669" size={20} />
              <div style={{ fontWeight: '700', color: '#059669', fontSize: '16px' }}>SELECTED TARGET DETAILS</div>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '15px',
              fontSize: '12px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ color: '#6b7280' }}>Target ID</div>
                <div style={{ fontWeight: '700', color: '#7c3aed', fontSize: '14px', marginTop: '5px' }}>#{selectedTarget.id}</div>
              </div>
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ color: '#6b7280' }}>Target Quantity</div>
                <div style={{ fontWeight: '700', color: '#059669', fontSize: '14px', marginTop: '5px' }}>
                  {selectedTarget.target_qty || 0} {selectedTarget.uom || selectedTarget.unit || ''}
                </div>
              </div>
              {selectedTarget.shift_code && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ color: '#6b7280' }}>Shift</div>
                  <div style={{ fontWeight: '700', color: '#dc2626', fontSize: '14px', marginTop: '5px' }}>{selectedTarget.shift_code}</div>
                </div>
              )}
              {selectedTarget.item_code && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ color: '#6b7280' }}>Item Code</div>
                  <div style={{ fontWeight: '700', color: '#f59e0b', fontSize: '14px', marginTop: '5px' }}>{selectedTarget.item_code}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigate('/production-sections/pvc-coating')}
              style={{
                background: 'transparent',
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
                e.target.style.background = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <FiX /> Cancel Edit
            </button>
            
            <button
              type="button"
              onClick={() => {
                if (originalData) {
                  setFormData(originalData);
                  setSuccess('Changes reverted to original values');
                }
              }}
              style={{
                background: 'transparent',
                border: '2px solid #f59e0b',
                padding: '12px 24px',
                borderRadius: '8px',
                color: '#f59e0b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#fef3c7';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <FiRefreshCw /> Revert Changes
            </button>
          </div>

          <button
            type="submit"
            disabled={saving || !hasChanges()}
            style={{
              background: !hasChanges() ? '#d1d5db' : 
                         saving ? '#c4b5fd' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              color: 'white',
              cursor: (!hasChanges() || saving) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '600',
              fontSize: '15px'
            }}
          >
            {saving ? 'Saving...' : <><FiSave /> Update Record</>}
          </button>
        </div>
      </form>

      {/* Database Info */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '8px',
        padding: '15px 20px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <div>
            <div style={{ fontWeight: '600', color: '#3b82f6' }}>Record Information</div>
            <div>ID: #{recordInfo.id}</div>
            <div>Status: {hasChanges() ? 'Modified' : 'Unchanged'}</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#10b981' }}>Production Details</div>
            <div>Efficiency: {formData.efficiency}%</div>
            <div>Weight: {formData.weight || '0'} KG</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#f59e0b' }}>References</div>
            <div>{items.length} items</div>
            <div>{targets.length} targets</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        select option {
          font-size: 14px;
          padding: 8px;
        }
        
        select, input, textarea {
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.3s ease;
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default PVCCoatingEditForm;