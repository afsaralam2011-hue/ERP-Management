import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiArrowLeft, FiPackage, FiLayers, 
  FiUser, FiHash, FiDroplet, FiDatabase, 
  FiCheck, FiAlertCircle, FiRefreshCw,
  FiEdit2, FiClipboard, FiTrendingUp, FiFilter,
  FiX, FiRefreshCw as FiClear,
  FiMoon, FiSun, FiCoffee
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import "./PVCCoatingForm.css";

const PVCCoatingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // ✅ تھیم اسٹیٹ
  const [theme, setTheme] = useState('light'); // 'light', 'dark', 'cream'

  // ✅ INITIAL FORM STATE - useMemo میں wrap کریں
  const initialFormState = useMemo(() => ({
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
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const [items, setItems] = useState([]);
  const [allShifts, setAllShifts] = useState([]);
  const [allTargets, setAllTargets] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [filteredTargets, setFilteredTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // ✅ تھیم سوئچ
  const toggleTheme = useCallback(() => {
    const themes = ['light', 'dark', 'cream'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme]);

  // ✅ 1. USER AUTO-FILL
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userName = session.user.email?.split('@')[0] || 'User';
          setFormData(prev => ({ ...prev, users_name: userName }));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  // ✅ 5. HANDLE SHIFT SELECTION - تمام dependencies کو remove کریں
  const handleShiftSelection = useCallback((shiftObj, allTargets) => {
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
    
    // GET MACHINES FOR SELECTED SHIFT
    if (!shiftObj.shift_code) {
      setFilteredMachines([]);
    } else {
      const targetsForShift = allTargets.filter(target => target.shift_code === shiftObj.shift_code);
      
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
      
      setFilteredMachines(uniqueMachines);
    }
    
    setFilteredTargets([]);
    setSelectedMachine(null);
    setSelectedTarget(null);
    setValidationErrors(prev => ({ ...prev, machine_id: '', targets_id: '' }));
  }, []);

  // ✅ FETCH RECORD FUNCTION - allShifts اور allTargets کو parameters کے طور پر پاس کریں
  const fetchRecord = useCallback(async (id, allShifts, allTargets) => {
    try {
      const { data, error } = await supabase
        .from('pvcsection')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        if (data.shift_code) {
          const shiftObj = allShifts.find(s => s.shift_code === data.shift_code);
          if (shiftObj) handleShiftSelection(shiftObj, allTargets);
        }
        if (data.targets_id) {
          const targetObj = allTargets.find(t => t.id === data.targets_id);
          if (targetObj) setSelectedTarget(targetObj);
        }
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      setError('Failed to load record: ' + error.message);
    }
  }, [handleShiftSelection]);

  // ✅ FETCH ALL DATA
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
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

      setDataLoaded(true);
      
      // Edit mode میں record fetch کریں
      if (isEditMode && id) {
        await fetchRecord(id, shiftsData || [], targetsData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Data loading error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [isEditMode, id, fetchRecord]);

  // ✅ 2. FETCH ALL DATA ON MOUNT - ایک ہی بار fetch کریں
  useEffect(() => {
    if (!dataLoaded) {
      fetchAllData();
    }
  }, [dataLoaded, fetchAllData]);

  // ✅ 4. GET TARGETS FOR SELECTED MACHINE AND SHIFT
  const getTargetsForMachineAndShift = useCallback((machineId, shiftCode) => {
    if (!machineId || !shiftCode) return [];
    return allTargets.filter(target => 
      target.machine_id === machineId && 
      target.shift_code === shiftCode
    );
  }, [allTargets]);

  // ✅ 6. HANDLE MACHINE SELECTION
  const handleMachineSelection = useCallback((machineId) => {
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
  }, [filteredMachines, getTargetsForMachineAndShift, selectedShift]);

  // ✅ 7. HANDLE TARGET SELECTION
  const handleTargetSelection = useCallback((targetId) => {
    if (!targetId || !selectedShift || !selectedMachine) return;
    
    const selectedTargetObj = filteredTargets.find(t => t.id === targetId);
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
  }, [filteredTargets, selectedMachine, selectedShift]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const handleItemChange = useCallback((e) => {
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
  }, [items]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [validationErrors]);

  // ✅ 11. CLEAR FORM FUNCTION
  const clearForm = useCallback(() => {
    setFormData({
      ...initialFormState,
      users_name: formData.users_name,
    });
    setSelectedShift(null);
    setSelectedMachine(null);
    setSelectedTarget(null);
    setFilteredMachines([]);
    setFilteredTargets([]);
    setValidationErrors({});
    setError(null);
    setSuccess(false);
    setDataLoaded(false);
  }, [formData.users_name, initialFormState]);

  // ✅ 12. HANDLE FORM SUBMIT
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

      if (isEditMode) {
        const { error } = await supabase
          .from('pvcsection')
          .update(recordData)
          .eq('id', id);
        if (error) throw error;
        setSuccess('Record updated successfully!');
        setTimeout(() => navigate('/production-sections/pvc-coating'), 2000);
      } else {
        const { error } = await supabase
          .from('pvcsection')
          .insert([{
            ...recordData,
            created_at: new Date().toISOString()
          }]);
        if (error) throw error;
        setSuccess('Record saved successfully! Form will clear in 2 seconds...');
        
        setTimeout(() => {
          clearForm();
          setSuccess(false);
        }, 2000);
      }

    } catch (error) {
      console.error('Error saving record:', error);
      setError('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p className="loading-text">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className={`pvc-coating-form-container theme-${theme}`}>
      {/* ✅ HEADER */}
      <div className="form-header">
        {/* Left side: Back button + Icon + Title */}
        <div className="header-left">
          <button
            onClick={() => navigate('/production-sections/pvc-coating')}
            className="back-button-small"
          >
            <FiArrowLeft size={14} /> 
          </button>

          <div className="header-icon">
            <FiLayers size={20} />
          </div>

          <div>
            <h1 className="header-title">
              {isEditMode ? 'Edit PVC Record' : 'New PVC Entry'}
            </h1>
            <p className="header-subtitle">
              PVC Coating Section
            </p>
          </div>
        </div>

        {/* Right side: Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-button"
          title={`Theme: ${theme} (Click to change)`}
        >
          {theme === 'light' && <FiSun size={18} />}
          {theme === 'dark' && <FiMoon size={18} />}
          {theme === 'cream' && <FiCoffee size={18} />}
        </button>
      </div>

      {/* Refresh Button */}
      <div className="refresh-button-container">
        <button
          onClick={fetchAllData}
          className="refresh-button-primary"
        >
          <FiRefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="success-message-container">
          <FiCheck size={20} />
          <div style={{ flex: 1 }}>
            <strong className="success-message-title">{success}</strong>
            <div className="success-message-subtitle">
              {isEditMode ? 'Redirecting...' : 'Form will clear automatically...'}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message-container">
          <FiAlertCircle size={20} />
          <div style={{ flex: 1 }}>
            <strong className="error-message-title">Error</strong>
            <div style={{ fontSize: '14px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="form-content">
          
          {/* Section 1: ITEM SELECTION */}
          <div className="form-section-card">
            <div className="section-header-primary">
              <FiPackage size={14} /> ITEM DETAILS
            </div>

            {/* Item Selection */}
            <div className="form-group">
              <label className="form-label">
                <FiHash size={14} /> Select Item *
              </label>
              <select
                value={formData.item_code}
                onChange={handleItemChange}
                required
                className={`form-control ${validationErrors.item_code ? 'has-error' : ''}`}
              >
                <option value="">Select PVC Item ({items.length} available)</option>
                {items.map((item, index) => (
                  <option key={index} value={item.item_code}>
                    {item.item_code} - {item.item_name}
                  </option>
                ))}
              </select>
              {validationErrors.item_code && (
                <div className="error-text">
                  {validationErrors.item_code}
                </div>
              )}
            </div>

            {/* Item Details */}
            {formData.item_code && (
              <div className="item-details-grid">
                <div>
                  <div className="detail-item-label">Item Name</div>
                  <div className="detail-item-value">{formData.item_name}</div>
                </div>
                <div>
                  <div className="detail-item-label">Material</div>
                  <div className="detail-item-value">{formData.material_type}</div>
                </div>
                <div>
                  <div className="detail-item-label">Spiral Size</div>
                  <div className="detail-item-value">{formData.raw_material_Spiralsize || 'N/A'}</div>
                </div>
                <div>
                  <div className="detail-item-label">Per Meter Wt</div>
                  <div className="detail-item-value">{formData.per_meter_wt || 'N/A'} KG/M</div>
                </div>
              </div>
            )}

            {/* Production Quantity */}
            <div className="form-group">
              <label className="form-label">
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
                className={`form-control ${validationErrors.production_quantity ? 'has-error' : ''}`}
                placeholder="Enter production quantity"
              />
              {validationErrors.production_quantity && (
                <div className="error-text">
                  {validationErrors.production_quantity}
                </div>
              )}
            </div>

            {/* Per Meter Weight */}
            <div className="form-group">
              <label className="form-label">
                <FiDroplet size={14} /> Per Meter Weight (KG/M)
              </label>
              <input
                type="number"
                step="0.001"
                name="per_meter_wt"
                value={formData.per_meter_wt}
                onChange={handleChange}
                min="0"
                className="form-control"
                placeholder="KG/M"
              />
            </div>

            {/* Total Weight */}
            <div className="form-group">
              <label className="form-label">
                <FiDatabase size={14} /> Total Weight (KG)
              </label>
              <input
                type="number"
                step="0.01"
                name="weight"
                value={formData.weight}
                readOnly
                className="form-control readonly"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          {/* Section 2: SHIFT → MACHINE → TARGET */}
          <div className="form-section-card">
            <div className="section-header-primary">
              <FiFilter size={14} /> SHIFT → MACHINE → TARGET
            </div>

            {/* STEP 1: Shift Selection */}
            <div className="form-group">
              <div className="step-indicator">
                <div className="step-circle step-1">1</div>
                <label className="form-label">Select Shift *</label>
              </div>
              <select
                value={selectedShift?.shift_code || ''}
                onChange={(e) => {
                  const shiftCode = e.target.value;
                  if (!shiftCode) handleShiftSelection(null, allTargets);
                  else {
                    const shiftObj = allShifts.find(s => s.shift_code === shiftCode);
                    if (shiftObj) handleShiftSelection(shiftObj, allTargets);
                  }
                }}
                required
                className={`form-control ${validationErrors.shift_code ? 'has-error' : ''}`}
              >
                <option value="">Select Shift ({allShifts.length} available)</option>
                {allShifts.map((shift, index) => (
                  <option key={index} value={shift.shift_code}>
                    {shift.shift_code} - {shift.shift_name}
                  </option>
                ))}
              </select>
              {validationErrors.shift_code && (
                <div className="error-text">
                  {validationErrors.shift_code}
                </div>
              )}
            </div>

            {/* STEP 2: Machine Selection */}
            {selectedShift && (
              <div className="form-group">
                <div className="step-indicator">
                  <div className="step-circle step-2">2</div>
                  <label className="form-label">Select Machine *</label>
                </div>
                <select
                  value={selectedMachine?.machine_id || ''}
                  onChange={(e) => handleMachineSelection(e.target.value)}
                  required={!!selectedShift}
                  disabled={!selectedShift || filteredMachines.length === 0}
                  className="form-control"
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
              <div className="form-group">
                <div className="step-indicator">
                  <div className="step-circle step-3">3</div>
                  <label className="form-label">Select Target *</label>
                </div>
                <select
                  value={selectedTarget?.id || ''}
                  onChange={(e) => handleTargetSelection(e.target.value)}
                  required={!!selectedMachine}
                  disabled={!selectedMachine || filteredTargets.length === 0}
                  className={`form-control ${validationErrors.targets_id ? 'has-error' : ''}`}
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
                  <div className="error-text">
                    {validationErrors.targets_id}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: PERSONNEL & EFFICIENCY */}
          <div className="form-section-card">
            <div className="section-header-primary">
              <FiUser size={14} /> PERSONNEL & EFFICIENCY
            </div>

            {/* Efficiency Display */}
            <div className={`efficiency-display ${
              formData.efficiency >= 80 ? 'efficiency-high' : 
              formData.efficiency >= 60 ? 'efficiency-medium' : 'efficiency-low'
            }`}>
              <div className="efficiency-header">
                <FiTrendingUp size={18} />
                <div className="efficiency-title">PRODUCTION EFFICIENCY</div>
              </div>
              <div className="efficiency-value">
                {formData.efficiency}%
              </div>
            </div>

            {/* Operator Name */}
            <div className="form-group">
              <label className="form-label">
                <FiUser size={14} /> Operator Name *
              </label>
              <input
                type="text"
                name="operator_name"
                value={formData.operator_name}
                onChange={handleChange}
                required
                className={`form-control ${validationErrors.operator_name ? 'has-error' : ''}`}
                placeholder="Enter operator name"
              />
              {validationErrors.operator_name && (
                <div className="error-text">
                  {validationErrors.operator_name}
                </div>
              )}
            </div>

            {/* Current User */}
            <div className="form-group">
              <label className="form-label">
                <FiUser size={14} /> Entered By
              </label>
              <input
                type="text"
                name="users_name"
                value={formData.users_name}
                readOnly
                className="form-control readonly"
              />
            </div>

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">
                <FiClipboard size={14} /> Remarks *
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                required
                rows="3"
                className={`form-textarea ${validationErrors.remarks ? 'has-error' : ''}`}
                placeholder="Enter any remarks or notes"
              />
              {validationErrors.remarks && (
                <div className="error-text">
                  {validationErrors.remarks}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="mobile-bottom-bar">
          <button
            type="button"
            onClick={clearForm}
            className="bottom-bar-button clear"
          >
            <FiClear size={14} /> Clear
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/production-sections/pvc-coating')}
            className="bottom-bar-button cancel"
          >
            <FiX size={14} /> Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="bottom-bar-button save"
          >
            {saving ? 'Saving...' : <><FiSave size={14} /> Save</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PVCCoatingForm;