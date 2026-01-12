import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiArrowLeft, FiPackage, FiLayers, 
  FiUser, FiHash, FiDroplet, FiDatabase, 
  FiTarget, FiCheck, FiAlertCircle, FiRefreshCw,
  FiEdit2, FiClipboard, FiTrendingUp, FiFilter,
  FiX, FiTrash2, FiEye,
  FiMoon, FiSun, FiCoffee,
  FiCalendar, FiClock, FiCheckCircle
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import "./PVCCoatingForm.css";
const PVCCoatingEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ تھیم اسٹیٹ
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'cream'

  // ✅ تھیم کلرز
  const themeColors = {
    light: {
      bgPrimary: '#faf5ff',
      bgHeader: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      bgCard: '#ffffff',
      bgInput: '#f9fafb',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textWhite: '#ffffff',
      border: '#d1d5db',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      primary: '#8b5cf6',
      info: '#3b82f6'
    },
    dark: {
      bgPrimary: '#0f172a',
      bgHeader: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      bgCard: '#1e293b',
      bgInput: '#334155',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textWhite: '#ffffff',
      border: '#475569',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      primary: '#8b5cf6',
      info: '#60a5fa'
    },
    cream: {
      bgPrimary: '#fffaf0',
      bgHeader: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      bgCard: '#fef3c7',
      bgInput: '#fde68a',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textWhite: '#ffffff',
      border: '#f59e0b',
      success: '#10b981',
      error: '#ef4444',
      warning: '#d97706',
      primary: '#d97706',
      info: '#f59e0b'
    }
  };

  const colors = themeColors[theme];

  // ✅ INITIAL FORM STATE
  const initialFormState = {
    section_name: 'PVC',
    targets_id: '',
    machine_id: '',
    machine_no: '',
    shift_code: '',
    shift_name: '',
    target_qty: '',
    item_code: '',
    item_name: '',
    raw_material_Spiralsize: '',
    material_type: 'PVC',
    finishedproductname: '',
    operator_name: '',
    production_quantity: '',
    per_meter_wt: '',
    weight: '',
    unit: 'Meter',
    efficiency: 0,
    users_name: '',
    uom: 'Meter',
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [originalData, setOriginalData] = useState(null);
  const [items, setItems] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [allTargets, setAllTargets] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [recordInfo, setRecordInfo] = useState({ created_at: '', updated_at: '' });

  // ✅ تھیم سوئچ
  const toggleTheme = () => {
    const themes = ['light', 'dark', 'cream'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // ✅ 1. USER AUTO-FILL
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
          const userName = session.user.email?.split('@')[0] || 'User';
          // Edit mode میں user update کر سکتا ہے
          setFormData(prev => ({ ...prev, users_name: userName }));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  // ✅ 2. LOAD RECORD AND ALL DATA
  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. ✅ پہلے record load کریں
      console.log('Loading record with ID:', id);
      const { data: recordData, error: recordError } = await supabase
        .from('pvcsection')
        .select('*')
        .eq('id', id)
        .single();

      if (recordError) throw recordError;
      
      if (recordData) {
        console.log('Record loaded:', recordData);
        setFormData(recordData);
        setOriginalData(recordData);
        setRecordInfo({
          created_at: recordData.created_at,
          updated_at: recordData.updated_at
        });

        // pvcitem TABLE
        const { data: itemsData, error: itemsError } = await supabase
          .from('pvcitem')
          .select('*')
          .eq('section_name', 'PVC')
          .order('item_name');

        if (itemsError) throw itemsError;
        setItems(itemsData || []);

        // shifts TABLE
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select('*')
          .order('shift_code');

        if (shiftsError) throw shiftsError;
        setAllShifts(shiftsData || []);

        // targets TABLE
        const { data: targetsData, error: targetsError } = await supabase
          .from('targets')
          .select('*')
          .eq('section_name', 'PVC')
          .order('machine_id');

        if (targetsError) throw targetsError;
        setAllTargets(targetsData || []);

        // ✅ Record کی shift کو set کریں
        if (recordData.shift_code) {
          const shiftObj = shiftsData?.find(s => s.shift_code === recordData.shift_code);
          if (shiftObj) {
            handleShiftSelection(shiftObj);
          }
        }

        // ✅ Record کی machine کو set کریں
        if (recordData.machine_id && recordData.shift_code) {
          const machines = getMachinesForShift(recordData.shift_code);
          setFilteredMachines(machines);
          
          const machineObj = machines.find(m => m.machine_id === recordData.machine_id);
          if (machineObj) {
            setSelectedMachine(machineObj);
            
            // ✅ Record کی target کو set کریں
            const targets = getTargetsForMachineAndShift(
              recordData.machine_id, 
              recordData.shift_code
            );
            setFilteredTargets(targets);
            
            if (recordData.targets_id) {
              const targetObj = targetsData?.find(t => t.id === recordData.targets_id);
              if (targetObj) {
                setSelectedTarget(targetObj);
              }
            }
          }
        }

        // ✅ Record کی item کو set کریں
        if (recordData.item_code && itemsData) {
          const itemObj = itemsData.find(item => item.item_code === recordData.item_code);
          if (itemObj) {
            // Item details update کریں
            setFormData(prev => ({
              ...prev,
              item_name: itemObj.item_name || '',
              raw_material_Spiralsize: itemObj.raw_material_Spiralsize || '',
              material_type: itemObj.material_type || 'PVC',
              finishedproductname: itemObj.finishedproductname || '',
              per_meter_wt: itemObj.per_meter_wt || ''
            }));
          }
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Data loading error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 3. GET MACHINES FOR SELECTED SHIFT
  const getMachinesForShift = (shiftCode) => {
    if (!shiftCode) return [];
    const targetsForShift = allTargets.filter(target => target.shift_code === shiftCode);
    
    const uniqueMachines = [];
    const machineMap = new Map();
    
    targetsForShift.forEach(target => {
      if (target.machine_id) {
        const machineKey = `${target.machine_id}_${target.machine_no || ''}`;
        if (!machineMap.has(machineKey)) {
          machineMap.set(machineKey, true);
          uniqueMachines.push({
            machine_id: target.machine_id,
            machine_no: target.machine_no || '',
            displayText: target.machine_no ? 
              `${target.machine_id} (${target.machine_no})` : 
              target.machine_id
          });
        }
      }
    });
    
    return uniqueMachines;
  };

  // ✅ 4. GET TARGETS FOR SELECTED MACHINE AND SHIFT
  const getTargetsForMachineAndShift = (machineId, shiftCode) => {
    if (!machineId || !shiftCode) return [];
    return allTargets.filter(target => 
      target.machine_id === machineId && 
      target.shift_code === shiftCode
    );
  };

  // ✅ 5. HANDLE SHIFT SELECTION
  const handleShiftSelection = (shiftObj) => {
    if (!shiftObj) {
      setSelectedShift(null);
      setSelectedMachine(null);
      setSelectedTarget(null);
      setFilteredMachines([]);
      setFilteredTargets([]);
      
      setFormData(prev => ({
        ...prev,
        shift_code: '',
        shift_name: '',
        targets_id: '',
        machine_id: '',
        machine_no: '',
        target_qty: '',
        uom: ''
      }));
      return;
    }
    
    setSelectedShift(shiftObj);
    setFormData(prev => ({
      ...prev,
      shift_code: shiftObj.shift_code,
      shift_name: shiftObj.shift_name || shiftObj.shift_code,
      targets_id: '',
      machine_id: '',
      machine_no: '',
      target_qty: '',
      uom: ''
    }));
    
    const machines = getMachinesForShift(shiftObj.shift_code);
    setFilteredMachines(machines);
    setFilteredTargets([]);
    setSelectedMachine(null);
    setSelectedTarget(null);
    setValidationErrors(prev => ({ ...prev, machine_id: '', targets_id: '' }));
  };

  // ✅ 6. HANDLE MACHINE SELECTION
  const handleMachineSelection = (machineId) => {
    if (!machineId || !selectedShift) return;
    
    const selectedMachineObj = filteredMachines.find(m => m.machine_id === machineId);
    if (selectedMachineObj) {
      setSelectedMachine(selectedMachineObj);
      setFormData(prev => ({
        ...prev,
        machine_id: selectedMachineObj.machine_id,
        machine_no: selectedMachineObj.machine_no || '',
        targets_id: '',
        target_qty: '',
        uom: ''
      }));
      
      const targets = getTargetsForMachineAndShift(
        selectedMachineObj.machine_id, 
        selectedShift.shift_code
      );
      setFilteredTargets(targets);
      setSelectedTarget(null);
      setValidationErrors(prev => ({ ...prev, targets_id: '' }));
    }
  };

  // ✅ 7. HANDLE TARGET SELECTION
  const handleTargetSelection = (targetId) => {
    if (!targetId || !selectedShift || !selectedMachine) return;
    
    const selectedTargetObj = filteredTargets.find(t => t.id == targetId);
    if (selectedTargetObj) {
      setSelectedTarget(selectedTargetObj);
      setFormData(prev => ({
        ...prev,
        targets_id: selectedTargetObj.id,
        target_qty: selectedTargetObj.target_qty || '',
        uom: selectedTargetObj.uom || 'Meter',
        unit: selectedTargetObj.uom || 'Meter'
      }));
    }
  };

  // ✅ 8. AUTOMATIC WEIGHT CALCULATION
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

  // ✅ 9. EFFICIENCY CALCULATION
  useEffect(() => {
    const calculateEfficiency = () => {
      const productionQty = parseFloat(formData.production_quantity) || 0;
      if (!selectedTarget || productionQty <= 0) {
        setFormData(prev => ({ ...prev, efficiency: 0 }));
        return;
      }

      const targetQty = selectedTarget.target_qty || 0;
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
        raw_material_Spiralsize: '',
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
        raw_material_Spiralsize: item.raw_material_Spiralsize || '',
        material_type: item.material_type || 'PVC',
        finishedproductname: item.finishedproductname || '',
        per_meter_wt: item.per_meter_wt || '',
        unit: 'Meter'
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

  // ✅ 11. RESET TO ORIGINAL DATA
  const resetForm = () => {
    if (originalData) {
      setFormData(originalData);
      
      // Reset selections
      if (originalData.shift_code) {
        const shiftObj = allShifts.find(s => s.shift_code === originalData.shift_code);
        if (shiftObj) handleShiftSelection(shiftObj);
      }
      
      setValidationErrors({});
      setError(null);
      setSuccess(false);
    }
  };

  // ✅ 12. DELETE RECORD
  const deleteRecord = async () => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('pvcsection')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSuccess('Record deleted successfully!');
      setTimeout(() => navigate('/production-sections/pvc-coating'), 1500);
    } catch (error) {
      console.error('Error deleting record:', error);
      setError('Failed to delete record: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ✅ 13. HANDLE FORM SUBMIT (Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!formData.item_code) errors.item_code = 'Item is required';
    if (!formData.targets_id) errors.targets_id = 'Target is required';
    if (!formData.production_quantity || parseFloat(formData.production_quantity) <= 0) 
      errors.production_quantity = 'Production quantity is required';
    if (!formData.shift_code) errors.shift_code = 'Shift is required';
    if (!formData.operator_name) errors.operator_name = 'Operator name is required';
    if (!formData.remarks) errors.remarks = 'Remarks are required';
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
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
      setOriginalData(recordData); // Update original data
      
      setTimeout(() => {
        navigate('/production-sections/pvc-coating');
      }, 2000);

    } catch (error) {
      console.error('Error updating record:', error);
      setError('Failed to update: ' + error.message);
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
        minHeight: '100vh',
        background: colors.bgPrimary
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: `3px solid ${colors.border}`, 
          borderTopColor: colors.primary, 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <p style={{ marginTop: '20px', color: colors.textSecondary }}>Loading record data...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: colors.bgPrimary,
      color: colors.textPrimary,
      padding: '0',
      margin: '0',
      width: '100vw',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      {/* ✅ HEADER - ONE LINE */}
      <div style={{ 
        background: colors.bgHeader,
        color: colors.textWhite,
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '15px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Left side: Back button + Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
          <button
            onClick={() => navigate('/production-sections/pvc-coating')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              fontSize: '13px'
            }}
          >
            <FiArrowLeft size={14} /> 
          </button>

          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FiEdit2 size={20} />
          </div>

          <div>
            <h1 style={{ 
              margin: '0', 
              fontSize: '18px', 
              color: 'white', 
              fontWeight: '700',
              whiteSpace: 'nowrap'
            }}>
              Edit PVC Record #{id}
            </h1>
            <p style={{ 
              margin: '0', 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '12px',
              whiteSpace: 'nowrap'
            }}>
              Edit Production Entry
            </p>
          </div>
        </div>

        {/* Right side: Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px'
          }}
          title={`Theme: ${theme} (Click to change)`}
        >
          {theme === 'light' && <FiSun size={18} />}
          {theme === 'dark' && <FiMoon size={18} />}
          {theme === 'cream' && <FiCoffee size={18} />}
        </button>
      </div>

      {/* Record Info Bar */}
      <div style={{
        background: colors.info,
        color: 'white',
        padding: '10px 20px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiCalendar size={12} />
          <span>Created: {new Date(recordInfo.created_at).toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiClock size={12} />
          <span>Last Updated: {new Date(recordInfo.updated_at).toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiCheckCircle size={12} />
          <span>Record ID: {id}</span>
        </div>
      </div>

      {/* Refresh Button */}
      <div style={{ padding: '15px 20px 0' }}>
        <button
          onClick={fetchAllData}
          style={{
            background: colors.success,
            border: 'none',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            width: '100%'
          }}
        >
          <FiRefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div style={{
          background: colors.success,
          color: 'white',
          padding: '15px 20px',
          margin: '15px 20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <FiCheck size={20} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '16px' }}>{success}</strong>
            <div style={{ fontSize: '14px', opacity: '0.9' }}>
              Redirecting to list page...
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '15px 20px',
          margin: '15px 20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <FiAlertCircle size={20} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: '16px' }}>Error</strong>
            <div style={{ fontSize: '14px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ padding: '20px', paddingBottom: '90px' }}>
          
          {/* Section 1: ITEM SELECTION */}
          <div style={{ 
            marginBottom: '25px',
            background: colors.bgCard,
            borderRadius: '10px',
            padding: '15px'
          }}>
            <div style={{
              background: colors.primary,
              color: 'white',
              padding: '10px 15px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FiPackage size={14} /> ITEM DETAILS
            </div>

            {/* Item Selection */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: colors.textPrimary,
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
                  border: `1px solid ${colors.border}`,
                  background: colors.bgInput,
                  fontSize: '14px',
                  color: colors.textPrimary,
                  boxSizing: 'border-box'
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
                <div style={{ color: colors.error, fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.item_code}
                </div>
              )}
            </div>

            {/* Item Details */}
            {formData.item_code && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '10px',
                marginBottom: '15px'
              }}>
                <div>
                  <div style={{ color: colors.textSecondary, fontWeight: '600', fontSize: '12px' }}>Item Name</div>
                  <div style={{ color: colors.textPrimary, fontSize: '14px', marginTop: '5px' }}>{formData.item_name}</div>
                </div>
                <div>
                  <div style={{ color: colors.textSecondary, fontWeight: '600', fontSize: '12px' }}>Material</div>
                  <div style={{ color: colors.textPrimary, fontSize: '14px', marginTop: '5px' }}>{formData.material_type}</div>
                </div>
                <div>
                  <div style={{ color: colors.textSecondary, fontWeight: '600', fontSize: '12px' }}>Spiral Size</div>
                  <div style={{ color: colors.textPrimary, fontSize: '14px', marginTop: '5px' }}>{formData.raw_material_Spiralsize || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: colors.textSecondary, fontWeight: '600', fontSize: '12px' }}>Per Meter Wt</div>
                  <div style={{ color: colors.textPrimary, fontSize: '14px', marginTop: '5px' }}>{formData.per_meter_wt || 'N/A'} KG/M</div>
                </div>
              </div>
            )}

            {/* Production Quantity */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: colors.textPrimary,
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
                  border: `1px solid ${validationErrors.production_quantity ? colors.error : colors.border}`,
                  background: colors.bgInput,
                  fontSize: '14px',
                  color: colors.textPrimary,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter production quantity"
              />
              {validationErrors.production_quantity && (
                <div style={{ color: colors.error, fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.production_quantity}
                </div>
              )}
            </div>

            {/* Per Meter Weight */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: colors.textPrimary,
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
                  border: `1px solid ${colors.border}`,
                  background: colors.bgInput,
                  fontSize: '14px',
                  color: colors.textPrimary,
                  boxSizing: 'border-box'
                }}
                placeholder="KG/M"
              />
            </div>

            {/* Total Weight */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: colors.textPrimary,
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
                  border: `1px solid ${colors.border}`,
                  background: colors.bgPrimary,
                  fontSize: '14px',
                  color: colors.textSecondary,
                  boxSizing: 'border-box'
                }}
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          {/* Section 2: SHIFT → MACHINE → TARGET */}
          <div style={{ 
            marginBottom: '25px',
            background: colors.bgCard,
            borderRadius: '10px',
            padding: '15px'
          }}>
            <div style={{
              background: colors.primary,
              color: 'white',
              padding: '10px 15px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FiFilter size={14} /> SHIFT → MACHINE → TARGET
            </div>

            {/* STEP 1: Shift Selection */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '20px', height: '20px', background: colors.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>1</div>
                <label style={{ fontWeight: '600', color: colors.textPrimary, fontSize: '14px' }}>Select Shift *</label>
              </div>
              <select
                value={selectedShift?.shift_code || formData.shift_code || ''}
                onChange={(e) => {
                  const shiftCode = e.target.value;
                  if (!shiftCode) handleShiftSelection(null);
                  else {
                    const shiftObj = allShifts.find(s => s.shift_code === shiftCode);
                    if (shiftObj) handleShiftSelection(shiftObj);
                  }
                }}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${validationErrors.shift_code ? colors.error : colors.border}`,
                  background: colors.bgInput,
                  fontSize: '14px',
                  color: colors.textPrimary,
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select Shift ({allShifts.length} available)</option>
                {allShifts.map((shift, index) => (
                  <option key={index} value={shift.shift_code}>
                    {shift.shift_code} - {shift.shift_name}
                  </option>
                ))}
              </select>
              {validationErrors.shift_code && (
                <div style={{ color: colors.error, fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.shift_code}
                </div>
              )}
            </div>

            {/* STEP 2: Machine Selection */}
            {selectedShift && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: colors.success, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>2</div>
                  <label style={{ fontWeight: '600', color: colors.textPrimary, fontSize: '14px' }}>Select Machine *</label>
                </div>
                <select
                  value={selectedMachine?.machine_id || formData.machine_id || ''}
                  onChange={(e) => handleMachineSelection(e.target.value)}
                  required={!!selectedShift}
                  disabled={!selectedShift || filteredMachines.length === 0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${validationErrors.machine_id ? colors.error : colors.border}`,
                    background: colors.bgInput,
                    fontSize: '14px',
                    color: colors.textPrimary,
                    boxSizing: 'border-box',
                    opacity: !selectedShift || filteredMachines.length === 0 ? 0.6 : 1
                  }}
                >
                  <option value="">
                    {filteredMachines.length === 0 ? 'No machines available' : `Select Machine (${filteredMachines.length})`}
                  </option>
                  {filteredMachines.map((machine, index) => (
                    <option key={index} value={machine.machine_id}>
                      {machine.displayText}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* STEP 3: Target Selection */}
            {selectedMachine && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: colors.warning, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>3</div>
                  <label style={{ fontWeight: '600', color: colors.textPrimary, fontSize: '14px' }}>Select Target *</label>
                </div>
                <select
                  value={selectedTarget?.id || formData.targets_id || ''}
                  onChange={(e) => handleTargetSelection(e.target.value)}
                  required={!!selectedMachine}
                  disabled={!selectedMachine || filteredTargets.length === 0}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${validationErrors.targets_id ? colors.error : colors.border}`,
                    background: colors.bgInput,
                    fontSize: '14px',
                    color: colors.textPrimary,
                    boxSizing: 'border-box',
                    opacity: !selectedMachine || filteredTargets.length === 0 ? 0.6 : 1
                  }}
                >
                  <option value="">
                    {filteredTargets.length === 0 ? 'No targets available' : `Select Target (${filteredTargets.length})`}
                  </option>
                  {filteredTargets.map((target, index) => (
                    <option key={index} value={target.id}>
                      Target #{target.id} | Qty: {target.target_qty || 0} {target.uom || 'Meter'}
                    </option>
                  ))}
                </select>
                {validationErrors.targets_id && (
                  <div style={{ color: colors.error, fontSize: '12px', marginTop: '5px' }}>
                    {validationErrors.targets_id}
                  </div>
                )}
              </div>
            )}

            {/* Current Selection Info */}
            <div style={{ 
              background: colors.bgPrimary,
              padding: '10px',
              borderRadius: '8px',
              marginTop: '10px'
            }}>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '5px' }}>Current Selection:</div>
              <div style={{ fontSize: '14px', color: colors.textPrimary }}>
                {formData.shift_code ? `Shift: ${formData.shift_code}` : 'No shift selected'} → 
                {formData.machine_id ? ` Machine: ${formData.machine_id}` : ' No machine'} → 
                {formData.targets_id ? ` Target: #${formData.targets_id}` : ' No target'}
              </div>
            </div>
          </div>

          {/* Section 3: PERSONNEL & EFFICIENCY */}
          <div style={{ 
            marginBottom: '25px',
            background: colors.bgCard,
            borderRadius: '10px',
            padding: '15px'
          }}>
            <div style={{
              background: colors.primary,
              color: 'white',
              padding: '10px 15px',
              borderRadius: '6px',
              marginBottom: '15px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FiUser size={14} /> PERSONNEL & EFFICIENCY
            </div>

            {/* Efficiency Display */}
            <div style={{ 
              background: formData.efficiency >= 80 ? '#d1fae5' : 
                        formData.efficiency >= 60 ? '#fef3c7' : '#fee2e2',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                <FiTrendingUp size={18} />
                <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>PRODUCTION EFFICIENCY</div>
              </div>
              <div style={{ 
                fontSize: '28px', 
                color: formData.efficiency >= 80 ? '#059669' : 
                      formData.efficiency >= 60 ? '#d97706' : '#dc2626', 
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>
                {formData.efficiency}%
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Based on current production vs target
              </div>
            </div>

            {/* Operator Name */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: colors.textPrimary,
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
                  border: `1px solid ${validationErrors.operator_name ? colors.error : colors.border}`,
                  background: colors.bgInput,
                  fontSize: '14px',
                  color: colors.textPrimary,
                  boxSizing: 'border-box'
                }}
                placeholder="Enter operator name"
              />
              {validationErrors.operator_name && (
                <div style={{ color: colors.error, fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.operator_name}
                </div>
              )}
            </div>

            {/* Current User */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: colors.textPrimary,
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
                  border: `1px solid ${colors.border}`,
                  background: colors.bgPrimary,
                  fontSize: '14px',
                  color: colors.textSecondary,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Remarks */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: colors.textPrimary,
                fontSize: '14px'
              }}>
                <FiClipboard size={14} /> Remarks *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                required
                rows="3"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${validationErrors.remarks ? colors.error : colors.border}`,
                  background: colors.bgInput,
                  fontSize: '14px',
                  color: colors.textPrimary,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  minHeight: '80px'
                }}
                placeholder="Enter any remarks or notes"
              />
              {validationErrors.remarks && (
                <div style={{ color: colors.error, fontSize: '12px', marginTop: '5px' }}>
                  {validationErrors.remarks}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar - EDIT MODE SPECIAL */}
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          background: colors.bgCard,
          padding: '12px 15px',
          display: 'flex',
          gap: '8px',
          borderTop: `1px solid ${colors.border}`,
          zIndex: 1000
        }}>
          <button
            type="button"
            onClick={resetForm}
            style={{
              flex: 1,
              padding: '12px 8px',
              borderRadius: '8px',
              background: '#fef3c7',
              color: '#d97706',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              minHeight: '44px'
            }}
          >
            <FiRefreshCw size={14} /> Reset
          </button>
          
          <button
            type="button"
            onClick={deleteRecord}
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px 8px',
              borderRadius: '8px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              minHeight: '44px'
            }}
          >
            <FiTrash2 size={14} /> Delete
          </button>
          
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '12px 8px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}88 100%)`,
              color: 'white',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              minHeight: '44px'
            }}
          >
            {saving ? 'Saving...' : <><FiSave size={14} /> Update</>}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }
        
        * {
          box-sizing: border-box;
        }
        
        select:focus, input:focus, textarea:focus {
          outline: none;
          border-color: ${colors.primary} !important;
        }
        
        /* Hide scrollbar but keep functionality */
        ::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
};

export default PVCCoatingEditForm;