// src/pages/ProductionSections/PVCCoatingSection/PVCCoatingForm.jsx
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
  FiTrendingUp, FiCalendar,
  FiFilter, FiCpu
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const PVCCoatingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

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
    shift_id: '',
    remarks: ''
  });

  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // ✅ 1. USER AUTO-FILL
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

  // ✅ 2. FETCH ALL DATA
  useEffect(() => {
    fetchAllData();
    if (isEditMode) fetchRecord();
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. ✅ pvcitem TABLE
      console.log('Fetching pvcitem table...');
      const { data: itemsData, error: itemsError } = await supabase
        .from('pvcitem')
        .select('*')
        .order('item_name');

      if (itemsError) {
        console.error('pvcitem error:', itemsError);
        if (itemsError.message.includes('does not exist')) {
          setItems([]);
        } else {
          throw new Error(`pvcitem table: ${itemsError.message}`);
        }
      } else {
        setItems(itemsData || []);
      }

      // 2. ✅ targets TABLE
      console.log('Fetching all targets for PVC section...');
      const { data: targetsData, error: targetsError } = await supabase
        .from('targets')
        .select('*')
        .eq('section_name', 'pvcsection')
        .order('machine_id');

      if (targetsError) {
        console.error('targets error:', targetsError);
        if (targetsError.message.includes('does not exist')) {
          setTargets([]);
          setFilteredTargets([]);
        } else {
          throw new Error(`targets table: ${targetsError.message}`);
        }
      } else {
        setTargets(targetsData || []);
        setFilteredTargets(targetsData || []);
      }

      // 3. ✅ shifts TABLE
      console.log('Fetching shifts table...');
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .order('shift_code');

      if (shiftsError) {
        console.error('shifts error:', shiftsError);
        if (shiftsError.message.includes('does not exist')) {
          setAllShifts([]);
        } else {
          throw new Error(`shifts table: ${shiftsError.message}`);
        }
      } else {
        setAllShifts(shiftsData || []);
      }

      console.log('Data loaded:', {
        items: itemsData?.length || 0,
        targets: targetsData?.length || 0,
        shifts: shiftsData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Data loading error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('pvcsection')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        
        // پہلے shift set کریں
        if (data.shift_id) {
          const { data: shiftData } = await supabase
            .from('shifts')
            .select('*')
            .eq('id', data.shift_id)
            .single();
          
          if (shiftData) {
            handleShiftSelection(shiftData);
          }
        }
        
        // پھر target fetch کریں
        if (data.targets_id) {
          const { data: targetData } = await supabase
            .from('targets')
            .select('*')
            .eq('id', data.targets_id)
            .single();
          
          if (targetData) {
            setSelectedTarget(targetData);
          }
        }
      }

    } catch (error) {
      console.error('Error fetching record:', error);
      setError('Failed to load record: ' + error.message);
    }
  };

  // ✅ 3. AUTOMATIC WEIGHT CALCULATION
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

  // ✅ 4. FIELD VALIDATION AND COLOR
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

  // ✅ 5. FORM VALIDATION
  const validateForm = () => {
    const errors = {};
    
    if (!formData.item_code) errors.item_code = 'Item is required';
    if (!formData.targets_id) errors.targets_id = 'Target is required';
    if (!formData.production_quantity || parseFloat(formData.production_quantity) <= 0) 
      errors.production_quantity = 'Production quantity is required';
    if (!formData.shift_id) errors.shift_id = 'Shift is required';
    if (!formData.operator_name) errors.operator_name = 'Operator name is required';
    if (!formData.remarks) errors.remarks = 'Remarks are required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ 6. HANDLE SHIFT SELECTION (FIRST STEP)
  const handleShiftSelection = (shiftObj) => {
    if (!shiftObj) {
      // Reset everything if no shift selected
      setSelectedShift(null);
      setFilteredMachines([]);
      setFilteredTargets([]);
      setSelectedMachine(null);
      setSelectedTarget(null);
      
      setFormData(prev => ({
        ...prev,
        shift_id: '',
        shift_code: '',
        shift_name: '',
        targets_id: '',
        machine_id: '',
        machine_no: ''
      }));
      return;
    }
    
    // Set selected shift
    setSelectedShift(shiftObj);
    setFormData(prev => ({
      ...prev,
      shift_id: shiftObj.id,
      shift_code: shiftObj.shift_code,
      shift_name: shiftObj.shift_name
    }));
    
    // اس شفٹ کے تمام targets نکالیں
    const targetsForShift = targets.filter(target => 
      target.shift_id === shiftObj.id || 
      target.shift_code === shiftObj.shift_code
    );
    
    // اس شفٹ کے unique مشینیں نکالیں
    const uniqueMachines = [];
    const machineMap = new Map();
    
    targetsForShift.forEach(target => {
      const machineKey = `${target.machine_id}_${target.machine_no || ''}`;
      if (!machineMap.has(machineKey) && target.machine_id) {
        machineMap.set(machineKey, true);
        uniqueMachines.push({
          machine_id: target.machine_id,
          machine_no: target.machine_no,
          displayText: target.machine_no ? 
            `${target.machine_id} (${target.machine_no})` : 
            target.machine_id
        });
      }
    });
    
    setFilteredMachines(uniqueMachines);
    setFilteredTargets(targetsForShift);
    
    // Reset machine and target selection
    setSelectedMachine(null);
    setSelectedTarget(null);
    setFormData(prev => ({
      ...prev,
      targets_id: '',
      machine_id: '',
      machine_no: '',
      item_code: '',
      item_name: '',
      raw_material_flatsize: '',
      material_type: 'PVC',
      finishedproductname: '',
      per_meter_wt: '',
      unit: 'Meter'
    }));
    
    setValidationErrors(prev => ({ 
      ...prev, 
      shift_id: '',
      targets_id: '',
      machine_id: ''
    }));
  };

  // ✅ 7. HANDLE MACHINE SELECTION (SECOND STEP)
  const handleMachineSelection = (machineId) => {
    if (!machineId || !selectedShift) return;
    
    // Machine details parse کریں
    const [machineIdOnly] = machineId.split('|');
    const selectedMachineObj = filteredMachines.find(m => 
      m.machine_id === machineIdOnly
    );
    
    if (selectedMachineObj) {
      setSelectedMachine(selectedMachineObj);
      
      // اس مشین کے لیے فلٹرڈ ٹارگیٹس
      const targetsForMachine = filteredTargets.filter(target => 
        target.machine_id === selectedMachineObj.machine_id
      );
      
      setFilteredTargets(targetsForMachine);
      
      // Form میں مشین کی معلومات ڈالیں
      setFormData(prev => ({
        ...prev,
        machine_id: selectedMachineObj.machine_id,
        machine_no: selectedMachineObj.machine_no || '',
        targets_id: '',
        item_code: '',
        item_name: '',
        raw_material_flatsize: '',
        material_type: 'PVC',
        finishedproductname: '',
        per_meter_wt: '',
        unit: 'Meter'
      }));
      
      // Reset target
      setSelectedTarget(null);
      setValidationErrors(prev => ({ ...prev, targets_id: '' }));
    }
  };

  // ✅ 8. HANDLE TARGET SELECTION (THIRD STEP)
  const handleTargetSelection = (targetId) => {
    if (!targetId || !selectedShift || !selectedMachine) return;
    
    const selectedTargetObj = filteredTargets.find(t => t.id == targetId);
    
    if (selectedTargetObj) {
      setSelectedTarget(selectedTargetObj);
      
      const updatedForm = {
        ...formData,
        targets_id: selectedTargetObj.id,
        machine_id: selectedTargetObj.machine_id || selectedMachine.machine_id,
        machine_no: selectedTargetObj.machine_no || selectedMachine.machine_no || '',
        unit: selectedTargetObj.uom || selectedTargetObj.unit || 'Meter'
      };

      // Item auto-fill from target
      if (selectedTargetObj.item_code) {
        updatedForm.item_code = selectedTargetObj.item_code;
        
        const item = items.find(i => i.item_code === selectedTargetObj.item_code);
        if (item) {
          updatedForm.item_name = item.item_name || '';
          updatedForm.raw_material_flatsize = item.raw_material_flatsize || '';
          updatedForm.material_type = item.material_type || 'PVC';
          updatedForm.finishedproductname = item.finishedproductname || '';
          updatedForm.per_meter_wt = item.per_meter_wt || '';
          updatedForm.unit = item.unit || 'Meter';
        }
      }
      
      setFormData(updatedForm);
      setValidationErrors(prev => ({ ...prev, item_code: '' }));
    }
  };

  // ✅ 9. EFFICIENCY CALCULATION
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

  // ✅ 10. HANDLE ITEM SELECTION
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
        shift_id: formData.shift_id || null,
        production_quantity: parseFloat(formData.production_quantity) || 0,
        per_meter_wt: parseFloat(formData.per_meter_wt) || 0,
        weight: parseFloat(formData.weight) || 0,
        efficiency: parseFloat(formData.efficiency) || 0,
        updated_at: new Date().toISOString()
      };

      if (isEditMode) {
        const { error } = await supabase
          .from('pvcsection')
          .update(recordData)
          .eq('id', id);
        if (error) throw error;
        setSuccess('Record updated successfully!');
      } else {
        const { error } = await supabase
          .from('pvcsection')
          .insert([{
            ...recordData,
            created_at: new Date().toISOString()
          }]);
        if (error) throw error;
        setSuccess('Record created successfully!');
      }

      setTimeout(() => navigate('/production-sections/pvc-coating'), 2000);

    } catch (error) {
      console.error('Error saving record:', error);
      setError('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
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
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <FiLayers size={28} />
          </div>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1f2937', fontWeight: '700' }}>
              {isEditMode ? 'Edit PVC Coating Record' : 'New PVC Coating Entry'}
            </h1>
            <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
              PVC Coating Section | Complete Production Entry
            </p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={fetchAllData}
          style={{
            background: '#10b981',
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
      </div>

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
          
          {/* Section 1: SHIFT & MACHINE CASCADE */}
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
              <FiFilter size={16} /> SHIFT → MACHINE → TARGET
            </div>

            {/* STEP 1: Shift Selection */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: '#8b5cf6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>1</div>
                <label style={{
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Select Shift *
                </label>
              </div>
              <select
                value={formData.shift_id}
                onChange={(e) => {
                  const shiftId = e.target.value;
                  if (!shiftId) {
                    handleShiftSelection(null);
                  } else {
                    const shiftObj = allShifts.find(s => s.id == shiftId);
                    if (shiftObj) handleShiftSelection(shiftObj);
                  }
                }}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('shift_id', formData.shift_id)}`,
                  background: getFieldBackgroundColor('shift_id', formData.shift_id),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500'
                }}
              >
                <option value="">Select Shift ({allShifts.length} available)</option>
                {allShifts.map((shift, index) => (
                  <option key={index} value={shift.id}>
                    {shift.shift_code} - {shift.shift_name}
                  </option>
                ))}
              </select>
              {validationErrors.shift_id && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.shift_id}
                </div>
              )}
              
              {/* Shift Details */}
              {selectedShift && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
                    Selected Shift: <span style={{ color: '#1e293b' }}>{selectedShift.shift_code}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px' }}>
                    {selectedShift.shift_name} | Available Machines: {filteredMachines.length}
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Machine Selection (Only if shift selected) */}
            {selectedShift && (
              <div style={{ marginBottom: '25px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>2</div>
                  <label style={{
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Select Machine *
                  </label>
                </div>
                <select
                  value={formData.machine_id}
                  onChange={(e) => handleMachineSelection(e.target.value)}
                  required={!!selectedShift}
                  disabled={!selectedShift || filteredMachines.length === 0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${getFieldBorderColor('machine_id', formData.machine_id)}`,
                    background: getFieldBackgroundColor('machine_id', formData.machine_id),
                    fontSize: '14px',
                    color: '#1f2937',
                    fontWeight: '500',
                    opacity: !selectedShift || filteredMachines.length === 0 ? 0.6 : 1
                  }}
                >
                  <option value="">
                    {filteredMachines.length === 0 ? 
                      'No machines available for this shift' : 
                      `Select Machine (${filteredMachines.length} available)`}
                  </option>
                  {filteredMachines.map((machine, index) => (
                    <option key={index} value={machine.machine_id}>
                      {machine.displayText}
                    </option>
                  ))}
                </select>
                
                {/* Machine Details */}
                {selectedMachine && (
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '600' }}>
                      Selected Machine: <span style={{ color: '#1e293b' }}>{selectedMachine.machine_id}</span>
                    </div>
                    {selectedMachine.machine_no && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px' }}>
                        Machine No: {selectedMachine.machine_no} | 
                        Available Targets: {filteredTargets.length}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Target Selection (Only if machine selected) */}
            {selectedMachine && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#f59e0b',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>3</div>
                  <label style={{
                    fontWeight: '600',
                    color: '#374151',
                    fontSize: '14px'
                  }}>
                    Select Target *
                  </label>
                </div>
                <select
                  value={formData.targets_id}
                  onChange={(e) => handleTargetSelection(e.target.value)}
                  required={!!selectedMachine}
                  disabled={!selectedMachine || filteredTargets.length === 0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${getFieldBorderColor('targets_id', formData.targets_id)}`,
                    background: getFieldBackgroundColor('targets_id', formData.targets_id),
                    fontSize: '14px',
                    color: '#1f2937',
                    fontWeight: '500',
                    opacity: !selectedMachine || filteredTargets.length === 0 ? 0.6 : 1
                  }}
                >
                  <option value="">
                    {filteredTargets.length === 0 ? 
                      'No targets available for this machine' : 
                      `Select Target (${filteredTargets.length} available)`}
                  </option>
                  {filteredTargets.map((target, index) => (
                    <option key={index} value={target.id}>
                      Target #{target.id} | 
                      Item: {target.item_code || 'N/A'} | 
                      Qty: {target.target_qty || 0} {target.uom || target.unit || ''}
                    </option>
                  ))}
                </select>
                {validationErrors.targets_id && (
                  <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                    {validationErrors.targets_id}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: ITEM & PRODUCTION */}
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
                disabled={!selectedTarget}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${getFieldBorderColor('item_code', formData.item_code)}`,
                  background: getFieldBackgroundColor('item_code', formData.item_code),
                  fontSize: '14px',
                  color: '#1f2937',
                  fontWeight: '500',
                  opacity: !selectedTarget ? 0.6 : 1
                }}
              >
                <option value="">
                  {!selectedTarget ? 'Select target first' : `Select PVC Item (${items.length} available)`}
                </option>
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

            {/* Current User */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                <FiUser size={14} /> Entered By
              </label>
              <input
                type="text"
                name="users_name"
                value={formData.users_name}
                readOnly
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #d1d5db',
                  background: '#f9fafb',
                  fontSize: '14px',
                  color: '#6b7280',
                  fontWeight: '500'
                }}
              />
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

        {/* Selected Information Summary */}
        {(selectedShift || selectedMachine || selectedTarget) && (
          <div style={{
            background: '#f8fafc',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '15px' 
            }}>
              <FiCheckSquare color="#8b5cf6" size={20} />
              <div style={{ fontWeight: '700', color: '#8b5cf6', fontSize: '16px' }}>
                SELECTION SUMMARY
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px',
              fontSize: '12px'
            }}>
              {selectedShift && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <div style={{ color: '#6b7280', marginBottom: '5px' }}>
                    <FiClock size={12} style={{ marginRight: '5px' }} /> SHIFT
                  </div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
                    {selectedShift.shift_code}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '3px' }}>
                    {selectedShift.shift_name}
                  </div>
                </div>
              )}
              
              {selectedMachine && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  borderLeft: '4px solid #10b981'
                }}>
                  <div style={{ color: '#6b7280', marginBottom: '5px' }}>
                    <FiCpu size={12} style={{ marginRight: '5px' }} /> MACHINE
                  </div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
                    {selectedMachine.machine_id}
                  </div>
                  {selectedMachine.machine_no && (
                    <div style={{ color: '#64748b', fontSize: '11px', marginTop: '3px' }}>
                      No: {selectedMachine.machine_no}
                    </div>
                  )}
                </div>
              )}
              
              {selectedTarget && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <div style={{ color: '#6b7280', marginBottom: '5px' }}>
                    <FiTarget size={12} style={{ marginRight: '5px' }} /> TARGET
                  </div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
                    #{selectedTarget.id}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '3px' }}>
                    Qty: {selectedTarget.target_qty || 0} | Item: {selectedTarget.item_code || 'N/A'}
                  </div>
                </div>
              )}
              
              {formData.production_quantity && (
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  borderLeft: '4px solid #8b5cf6'
                }}>
                  <div style={{ color: '#6b7280', marginBottom: '5px' }}>
                    <FiTrendingUp size={12} style={{ marginRight: '5px' }} /> PRODUCTION
                  </div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '14px' }}>
                    {formData.production_quantity} {formData.unit}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '11px', marginTop: '3px' }}>
                    Weight: {formData.weight || '0'} KG
                  </div>
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
            <FiX /> Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? '#c4b5fd' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              color: 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '600',
              fontSize: '15px'
            }}
          >
            {saving ? 'Saving...' : <><FiSave /> Save Record</>}
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
            <div style={{ fontWeight: '600', color: '#3b82f6' }}>PVC Items</div>
            <div>{items.length} items loaded</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#10b981' }}>All Targets</div>
            <div>{targets.length} targets loaded</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#f59e0b' }}>Shifts</div>
            <div>{allShifts.length} shifts loaded</div>
          </div>
          <div>
            <div style={{ fontWeight: '600', color: '#8b5cf6' }}>Current Selection</div>
            <div>
              {selectedShift ? selectedShift.shift_code : 'No shift'} → 
              {selectedMachine ? selectedMachine.machine_id : 'No machine'} → 
              {selectedTarget ? `Target #${selectedTarget.id}` : 'No target'}
            </div>
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
        
        select:disabled, input:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PVCCoatingForm;