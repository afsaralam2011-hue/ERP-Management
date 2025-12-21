// ========================================================
// FILE: FlatteningForm.jsx
// PURPOSE: Production Entry Form for Flattening Section
// DESCRIPTION: 
// - Create new production records for flattening section
// - Multiple items entry for same target
// - Auto-fill machine details from target selection
// - Auto-fill item details from item selection
// - Automatic efficiency calculation
// - Form validation and error handling
// ========================================================

// ========================================================
// SECTION 1: IMPORTS
// ========================================================
// React and Router imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Icons from react-icons/fi
import { 
  FiSave, FiX, FiTarget, FiPackage,
  FiUser, FiEdit2, FiClipboard, FiSettings,
  FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiList, FiTrendingUp,
  FiDatabase, FiRefreshCw, FiInfo
} from 'react-icons/fi';

// Database connection
import { supabase } from '../../../supabaseClient';

// CSS styles
import './FlatteningForm.css';

// ========================================================
// SECTION 2: MAIN COMPONENT - FlatteningForm
// ========================================================
// PROPS:
// - onClose: Function to close modal (if used as modal)
// - isModal: Boolean indicating if component is used as modal
// ========================================================

const FlatteningForm = ({ onClose, isModal = true }) => {
  // ========================================================
  // SECTION 3: STATE VARIABLES
  // ========================================================
  
  // NAVIGATION
  const navigate = useNavigate();

  // TARGET DATA STATE
  // Stores information about selected target
  // - targets_id: Selected target ID
  // - machine_id: Auto-filled from target
  // - machine_no: Auto-filled from target  
  // - shift_code: Auto-filled from target
  // - shift_name: Auto-filled from target
  // - target_qty: Target quantity from targets table
  // - unit: Measurement unit (Kg, etc.)
  const [targetData, setTargetData] = useState({
    targets_id: '',
    machine_id: '',
    machine_no: '',
    shift_code: '',
    shift_name: '',
    target_qty: 0,
    unit: 'Kg'
  });

  // ITEMS LIST STATE
  // Array of items for production entry
  // Each item has:
  // - id: Unique identifier
  // - item_code: Selected item code
  // - item_name: Auto-filled from items table
  // - coil_size: Auto-filled from items table
  // - material_type: Auto-filled from items table
  // - production_quantity: User entered quantity
  // - unit: Measurement unit
  // - efficiency: Calculated efficiency percentage
  const [itemsList, setItemsList] = useState([
    { 
      id: 1, 
      item_code: '', 
      item_name: '',
      coil_size: '',
      material_type: '',
      production_quantity: '', 
      unit: 'Kg',
      efficiency: 0
    }
  ]);

  // FORM DATA STATES
  const [operatorName, setOperatorName] = useState(''); // Operator name input
  const [remarks, setRemarks] = useState(''); // Remarks textarea
  const [totalProduction, setTotalProduction] = useState(0); // Sum of all items quantity
  const [overallEfficiency, setOverallEfficiency] = useState(0); // Overall efficiency percentage

  // VALIDATION STATES
  const [validationErrors, setValidationErrors] = useState({}); // Field validation errors
  const [fieldStatus, setFieldStatus] = useState({}); // Field status (empty/filled)

  // DATA FETCHING STATES
  const [items, setItems] = useState([]); // Items from database
  const [targets, setTargets] = useState([]); // Targets from database

  // UI STATES
  const [loading, setLoading] = useState(true); // Loading state for data fetching
  const [saving, setSaving] = useState(false); // Saving state for form submission
  const [error, setError] = useState(''); // Error message display
  const [success, setSuccess] = useState(''); // Success message display

  // ========================================================
  // SECTION 4: EFFECT HOOKS (useEffect)
  // ========================================================

  // EFFECT 1: Fetch initial data on component mount
  // Fetches items and targets from database
  useEffect(() => {
    fetchAllData();
  }, []);

  // EFFECT 2: Recalculate efficiency when production quantity changes
  // Runs when production_quantity or target_qty changes
  useEffect(() => {
    calculateOverallEfficiency();
  }, [totalProduction, targetData.target_qty]);

  // ========================================================
  // SECTION 5: DATA FETCHING FUNCTIONS
  // ========================================================

  /**
   * FUNCTION: fetchAllData
   * PURPOSE: Fetch items and targets from database
   * FETCHES:
   * - Items: Active items from items table
   * - Targets: Active targets from targets table
   */
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch items with all details
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('is_active', true)
        .order('item_name');

      // Fetch targets
      const { data: targetsData, error: targetsError } = await supabase
        .from('targets')
        .select('*')
        .eq('is_active', true)
        .order('targets_id');

      if (itemsError || targetsError) {
        throw new Error(itemsError?.message || targetsError?.message);
      }

      setItems(itemsData || []);
      setTargets(targetsData || []);

    } catch (error) {
      console.error('Data fetching error:', error);
      setError('Data loading failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // SECTION 6: FIELD STATUS FUNCTIONS
  // ========================================================

  /**
   * FUNCTION: getFieldClass
   * PURPOSE: Determine CSS class for field based on status
   * RETURNS:
   * - 'empty-required': Field is empty but required
   * - 'filled-valid': Field is properly filled
   */
  const getFieldClass = (fieldName, value) => {
    if (!value || value.toString().trim() === '') {
      return 'empty-required';
    }
    return 'filled-valid';
  };

  // ========================================================
  // SECTION 7: TARGET HANDLING FUNCTIONS
  // ========================================================

  /**
   * FUNCTION: handleTargetChange
   * PURPOSE: Handle target selection change
   * ACTIONS:
   * 1. Updates targetData state
   * 2. Auto-fills machine details
   * 3. Updates field status
   * 4. Recalculates efficiencies
   */
  const handleTargetChange = (e) => {
    const selectedTargetsId = e.target.value;
    
    // Update field status for validation
    const newStatus = { ...fieldStatus };
    if (selectedTargetsId) {
      newStatus.targets_id = 'filled-valid';
    } else {
      newStatus.targets_id = 'empty-required';
    }
    setFieldStatus(newStatus);

    // Clear form if no target selected
    if (!selectedTargetsId) {
      setTargetData({
        targets_id: '',
        machine_id: '',
        machine_no: '',
        shift_code: '',
        shift_name: '',
        target_qty: 0,
        unit: 'Kg'
      });
      setTotalProduction(0);
      setOverallEfficiency(0);
      return;
    }

    // Find selected target and update state
    const target = targets.find(t => t.targets_id === selectedTargetsId);
    
    if (target) {
      const newTargetData = {
        targets_id: target.targets_id,
        machine_id: target.machine_id || '',
        machine_no: target.machine_no || '',
        shift_code: target.shift_code || '',
        shift_name: target.shift_name || '',
        target_qty: parseFloat(target.target_qty) || 0,
        unit: target.uom || 'Kg'
      };
      
      setTargetData(newTargetData);
      
      // Update items efficiency with new target
      const updatedItems = itemsList.map(item => {
        if (item.production_quantity) {
          const quantityNum = parseFloat(item.production_quantity) || 0;
          const efficiency = newTargetData.target_qty > 0 
            ? (quantityNum / newTargetData.target_qty) * 100
            : 0;
          
          return {
            ...item,
            efficiency: Math.min(100, parseFloat(efficiency.toFixed(2)))
          };
        }
        return item;
      });
      
      setItemsList(updatedItems);
    }
  };

  // ========================================================
  // SECTION 8: ITEM HANDLING FUNCTIONS
  // ========================================================

  /**
   * FUNCTION: handleItemChange
   * PURPOSE: Handle item selection change for specific row
   * ACTIONS:
   * 1. Updates itemsList state
   * 2. Auto-fills item details from database
   * 3. Updates field status
   */
  const handleItemChange = (id, itemCode) => {
    const updatedItems = itemsList.map(item => {
      if (item.id === id) {
        const selectedItem = items.find(i => i.item_code === itemCode);
        if (selectedItem) {
          // Update field status
          const newStatus = { ...fieldStatus };
          newStatus[`item_${id}`] = 'filled-valid';
          setFieldStatus(newStatus);
          
          // Auto-fill item details
          return {
            ...item,
            item_code: itemCode,
            item_name: selectedItem.item_name || '',
            coil_size: selectedItem.coil_size || '',
            material_type: selectedItem.material_type || '',
            unit: selectedItem.unit || 'Kg'
          };
        }
      }
      return item;
    });
    
    setItemsList(updatedItems);
  };

  /**
   * FUNCTION: handleQuantityChange
   * PURPOSE: Handle quantity change for specific item
   * ACTIONS:
   * 1. Updates itemsList state
   * 2. Calculates item efficiency
   * 3. Updates total production
   * 4. Updates field status
   */
  const handleQuantityChange = (id, quantity) => {
    const quantityNum = parseFloat(quantity) || 0;
    
    const updatedItems = itemsList.map(item => {
      if (item.id === id) {
        // Update field status
        const newStatus = { ...fieldStatus };
        if (quantity && quantity.trim() !== '') {
          newStatus[`quantity_${id}`] = 'filled-valid';
        } else {
          newStatus[`quantity_${id}`] = 'empty-required';
        }
        setFieldStatus(newStatus);
        
        // Calculate efficiency
        const efficiency = targetData.target_qty > 0 
          ? (quantityNum / targetData.target_qty) * 100
          : 0;
          
        return { 
          ...item, 
          production_quantity: quantity,
          efficiency: Math.min(100, parseFloat(efficiency.toFixed(2)))
        };
      }
      return item;
    });
    
    setItemsList(updatedItems);
    
    // Calculate total production
    const total = updatedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.production_quantity) || 0);
    }, 0);
    
    setTotalProduction(total);
  };

  // ========================================================
  // SECTION 9: FORM INPUT HANDLERS
  // ========================================================

  /**
   * FUNCTION: handleOperatorChange
   * PURPOSE: Handle operator name input change
   */
  const handleOperatorChange = (value) => {
    const newStatus = { ...fieldStatus };
    if (value && value.trim() !== '') {
      newStatus.operator_name = 'filled-valid';
    } else {
      newStatus.operator_name = 'empty-required';
    }
    setFieldStatus(newStatus);
    setOperatorName(value);
  };

  /**
   * FUNCTION: handleRemarksChange
   * PURPOSE: Handle remarks textarea change
   */
  const handleRemarksChange = (value) => {
    const newStatus = { ...fieldStatus };
    if (value && value.trim() !== '') {
      newStatus.remarks = 'filled-valid';
    } else {
      newStatus.remarks = '';
    }
    setFieldStatus(newStatus);
    setRemarks(value);
  };

  // ========================================================
  // SECTION 10: ITEM ROW MANAGEMENT
  // ========================================================

  /**
   * FUNCTION: addItemRow
   * PURPOSE: Add new item row to the form
   * CREATES: New item object with unique ID
   */
  const addItemRow = () => {
    const newId = itemsList.length > 0 ? Math.max(...itemsList.map(i => i.id)) + 1 : 1;
    setItemsList([
      ...itemsList,
      { 
        id: newId, 
        item_code: '', 
        item_name: '',
        coil_size: '',
        material_type: '',
        production_quantity: '', 
        unit: 'Kg',
        efficiency: 0
      }
    ]);
  };

  /**
   * FUNCTION: removeItemRow
   * PURPOSE: Remove item row from the form
   * PREVENTS: Removal if only one item remains
   */
  const removeItemRow = (id) => {
    if (itemsList.length > 1) {
      const newItemsList = itemsList.filter(item => item.id !== id);
      setItemsList(newItemsList);
      
      // Recalculate total production
      const total = newItemsList.reduce((sum, item) => {
        return sum + (parseFloat(item.production_quantity) || 0);
      }, 0);
      
      setTotalProduction(total);
    }
  };

  // ========================================================
  // SECTION 11: CALCULATION FUNCTIONS
  // ========================================================

  /**
   * FUNCTION: calculateOverallEfficiency
   * PURPOSE: Calculate overall efficiency based on total production
   * FORMULA: (Total Production ÷ Target Quantity) × 100
   */
  const calculateOverallEfficiency = () => {
    if (targetData.target_qty > 0 && totalProduction > 0) {
      const overallEff = (totalProduction / targetData.target_qty) * 100;
      setOverallEfficiency(Math.min(100, parseFloat(overallEff.toFixed(2))));
    } else {
      setOverallEfficiency(0);
    }
  };

  // ========================================================
  // SECTION 12: VALIDATION FUNCTIONS
  // ========================================================

  /**
   * FUNCTION: validateForm
   * PURPOSE: Validate all form fields
   * CHECKS:
   * - Required fields are filled
   * - Valid quantities entered
   * - Valid item selections
   * RETURNS: Boolean (true if valid, false if errors)
   */
  const validateForm = () => {
    const errors = {};
    const newFieldStatus = {};
    
    // Check target selection
    if (!targetData.targets_id) {
      errors.targets_id = 'Target ID is required';
      newFieldStatus.targets_id = 'empty-required';
    } else {
      newFieldStatus.targets_id = 'filled-valid';
    }
    
    // Check operator name
    if (!operatorName.trim()) {
      errors.operator_name = 'Operator name is required';
      newFieldStatus.operator_name = 'empty-required';
    } else {
      newFieldStatus.operator_name = 'filled-valid';
    }
    
    // Check each item
    itemsList.forEach((item, index) => {
      if (!item.item_code) {
        errors[`item_${item.id}`] = `Item ${index + 1} is required`;
        newFieldStatus[`item_${item.id}`] = 'empty-required';
      } else {
        newFieldStatus[`item_${item.id}`] = 'filled-valid';
      }
      
      if (!item.production_quantity || parseFloat(item.production_quantity) <= 0) {
        errors[`quantity_${item.id}`] = `Valid quantity for item ${index + 1} is required`;
        newFieldStatus[`quantity_${item.id}`] = 'empty-required';
      } else {
        newFieldStatus[`quantity_${item.id}`] = 'filled-valid';
      }
    });

    setFieldStatus(newFieldStatus);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========================================================
  // SECTION 13: FORM SUBMISSION
  // ========================================================

  /**
   * FUNCTION: handleSubmit
   * PURPOSE: Handle form submission
   * ACTIONS:
   * 1. Validates form
   * 2. Prepares data for database
   * 3. Saves to Supabase
   * 4. Shows success/error messages
   * 5. Resets form on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setError('Please fill all required fields');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for each item
      const records = itemsList.map(item => ({
        section_name: 'Flattening',
        targets_id: targetData.targets_id,
        machine_id: targetData.machine_id,
        machine_no: targetData.machine_no,
        item_code: item.item_code,
        item_name: item.item_name,
        coil_size: item.coil_size,
        material_type: item.material_type,
        operator_name: operatorName.trim(),
        production_quantity: parseFloat(item.production_quantity),
        unit: item.unit,
        efficiency: item.efficiency,
        shift_code: targetData.shift_code,
        shift_name: targetData.shift_name,
        remarks: remarks?.trim() || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Save to database
      const { error: insertError } = await supabase
        .from('flatteningsection')
        .insert(records);

      if (insertError) throw insertError;

      // ✅ SUCCESS: Show message and reset form
      setSuccess(`✅ ${records.length} record(s) saved successfully!`);
      
      // ✅ RESET FORM AFTER 2 SECONDS
      setTimeout(() => {
        handleReset(); // Reset all form fields
        setSuccess(''); // Clear success message
      }, 2000);

      // ✅ NO REDIRECT - STAY ON SAME PAGE

    } catch (error) {
      console.error('Save error:', error);
      setError('❌ Save failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // SECTION 14: FORM RESET FUNCTIONS
  // ========================================================

  /**
   * FUNCTION: handleReset
   * PURPOSE: Reset entire form to initial state
   * RESETS: All form fields and states
   */
  const handleReset = () => {
    // Reset target data
    setTargetData({
      targets_id: '',
      machine_id: '',
      machine_no: '',
      shift_code: '',
      shift_name: '',
      target_qty: 0,
      unit: 'Kg'
    });
    
    // Reset items list (keep one empty item)
    setItemsList([
      { 
        id: 1, 
        item_code: '', 
        item_name: '',
        coil_size: '',
        material_type: '',
        production_quantity: '', 
        unit: 'Kg',
        efficiency: 0
      }
    ]);
    
    // Reset form inputs
    setOperatorName('');
    setRemarks('');
    setTotalProduction(0);
    setOverallEfficiency(0);
    
    // Reset validation states
    setValidationErrors({});
    setFieldStatus({});
    setError('');
    setSuccess('');
  };

  // ========================================================
  // SECTION 15: UI HELPER FUNCTIONS
  // ========================================================

  /**
   * FUNCTION: getEfficiencyColor
   * PURPOSE: Get color based on efficiency percentage
   * RETURNS: Hex color code
   */
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return '#27ae60'; // Green - Excellent
    if (efficiency >= 80) return '#f39c12'; // Orange - Good
    if (efficiency >= 70) return '#e67e22'; // Dark Orange - Average
    return '#e74c3c'; // Red - Below Target
  };

  /**
   * FUNCTION: getEfficiencyStatus
   * PURPOSE: Get status text based on efficiency percentage
   * RETURNS: Status string
   */
  const getEfficiencyStatus = (efficiency) => {
    if (efficiency >= 90) return 'Excellent';
    if (efficiency >= 80) return 'Good';
    if (efficiency >= 70) return 'Average';
    return 'Below Target';
  };

  // ========================================================
  // SECTION 16: MODAL HANDLING
  // ========================================================

  /**
   * FUNCTION: handleClose
   * PURPOSE: Close modal or navigate back
   */
  const handleClose = () => {
    if (isModal && onClose) {
      onClose(); // Close modal
    } else {
      navigate('/production-sections/flattening'); // Navigate back
    }
  };

  // ========================================================
  // SECTION 17: LOADING STATE
  // ========================================================
  
  if (loading) {
    return (
      <div className="flattening-modal-overlay" onClick={handleClose}>
        <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Production Form...</p>
            <div className="loading-details">
              <p>Fetching from database:</p>
              <ul>
                <li><FiPackage /> Items: {items.length} loaded</li>
                <li><FiTarget /> Targets: {targets.length} loaded</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // SECTION 18: MAIN RENDER
  // ========================================================

  return (
    <div className="flattening-modal-overlay" onClick={handleClose}>
      <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ============================================ */}
        {/* HEADER SECTION */}
        {/* ============================================ */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <FiPackage />
            </div>
            <div className="header-text">
              <h1>FLATTENING PRODUCTION ENTRY</h1>
              <p>
                <FiDatabase /> Section: Flattening | Tables: items, targets, flatteningsection
              </p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        {/* ============================================ */}
        {/* MESSAGES SECTION - Success/Error */}
        {/* ============================================ */}
        {success && (
          <div className="message success">
            <FiCheck /> {success}
          </div>
        )}

        {error && (
          <div className="message error">
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* ============================================ */}
        {/* MAIN FORM */}
        {/* ============================================ */}
        <form onSubmit={handleSubmit}>
          
          {/* ============================================ */}
          {/* SECTION 1: TARGET & MACHINE DETAILS */}
          {/* ============================================ */}
          <div className="target-section">
            <div className="section-title">
              <FiTarget /> TARGET & MACHINE DETAILS
            </div>
            
            <div className="target-grid">
              {/* Target Selection - Required */}
              <div className="selection-box">
                <label className="selection-label required">
                  <FiTarget /> TARGET ID
                </label>
                <select
                  value={targetData.targets_id}
                  onChange={handleTargetChange}
                  className={`form-select ${fieldStatus.targets_id || getFieldClass('targets_id', targetData.targets_id)}`}
                >
                  <option value="">-- SELECT TARGET --</option>
                  {targets.map(target => (
                    <option key={target.targets_id} value={target.targets_id}>
                      {target.targets_id}
                    </option>
                  ))}
                </select>
                {validationErrors.targets_id && (
                  <span className="error-text">{validationErrors.targets_id}</span>
                )}
              </div>

              {/* Machine ID - Auto-filled */}
              <div className="selection-box">
                <label className="selection-label">MACHINE ID</label>
                <input
                  type="text"
                  value={targetData.machine_id}
                  readOnly
                  className="selection-input readonly"
                />
              </div>

              {/* Machine No - Auto-filled */}
              <div className="selection-box">
                <label className="selection-label">MACHINE NO</label>
                <input
                  type="text"
                  value={targetData.machine_no}
                  readOnly
                  className="selection-input readonly"
                />
              </div>

              {/* Shift Code - Auto-filled */}
              <div className="selection-box">
                <label className="selection-label">SHIFT CODE</label>
                <input
                  type="text"
                  value={targetData.shift_code}
                  readOnly
                  className="selection-input readonly"
                />
              </div>

              {/* Target Quantity & Unit - Combined Display */}
              <div className="selection-box target-qty-box">
                <label className="selection-label">TARGET QTY & UNIT</label>
                <div className="target-qty-value">
                  {targetData.target_qty.toFixed(2)} {targetData.unit}
                </div>
              </div>

              {/* Overall Efficiency Display */}
              <div className="selection-box efficiency-box">
                <label className="selection-label">
                  <FiTrendingUp /> EFFICIENCY
                </label>
                <div 
                  className="efficiency-value"
                  style={{ color: getEfficiencyColor(overallEfficiency) }}
                >
                  {overallEfficiency.toFixed(1)}%
                </div>
                <div className="efficiency-label">
                  {getEfficiencyStatus(overallEfficiency)}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 2: ITEMS PRODUCTION */}
          {/* ============================================ */}
          <div className="items-section">
            <div className="items-header">
              <div className="section-title-secondary">
                <FiList /> ITEMS PRODUCTION
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="add-item-btn"
              >
                <FiPlus /> ADD ITEM
              </button>
            </div>

            {/* Items Table */}
            <table className="items-table">
              <thead>
                <tr>
                  <th>ITEM CODE</th>
                  <th>ITEM NAME</th>
                  <th>COIL SIZE</th>
                  <th>MATERIAL TYPE</th>
                  <th>QUANTITY</th>
                  <th>UNIT</th>
                  <th>EFFICIENCY</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {itemsList.map((item, index) => (
                  <tr key={item.id}>
                    {/* Item Code Selection - Required */}
                    <td>
                      <select
                        value={item.item_code}
                        onChange={(e) => handleItemChange(item.id, e.target.value)}
                        className={`item-select ${fieldStatus[`item_${item.id}`] || getFieldClass('item_code', item.item_code)}`}
                      >
                        <option value="">-- SELECT ITEM --</option>
                        {items.map(itm => (
                          <option key={itm.id} value={itm.item_code}>
                            {itm.item_code} - {itm.item_name}
                          </option>
                        ))}
                      </select>
                      {validationErrors[`item_${item.id}`] && (
                        <div className="error-text">{validationErrors[`item_${item.id}`]}</div>
                      )}
                    </td>

                    {/* Item Name - Auto-filled */}
                    <td>
                      <input
                        type="text"
                        value={item.item_name}
                        readOnly
                        className="item-input readonly"
                      />
                    </td>

                    {/* Coil Size - Auto-filled */}
                    <td>
                      <input
                        type="text"
                        value={item.coil_size}
                        readOnly
                        className="item-input readonly"
                      />
                    </td>

                    {/* Material Type - Auto-filled */}
                    <td>
                      <input
                        type="text"
                        value={item.material_type}
                        readOnly
                        className="item-input readonly"
                      />
                    </td>

                    {/* Production Quantity - Required */}
                    <td>
                      <input
                        type="number"
                        value={item.production_quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        step="0.01"
                        min="0"
                        className={`item-input quantity-input ${fieldStatus[`quantity_${item.id}`] || getFieldClass('quantity', item.production_quantity)}`}
                        placeholder="0.00"
                      />
                      {validationErrors[`quantity_${item.id}`] && (
                        <div className="error-text">{validationErrors[`quantity_${item.id}`]}</div>
                      )}
                    </td>

                    {/* Unit - Auto-filled */}
                    <td className="unit-cell">
                      {item.unit}
                    </td>

                    {/* Efficiency - Calculated */}
                    <td 
                      className="efficiency-cell"
                      style={{
                        color: getEfficiencyColor(item.efficiency),
                        backgroundColor: getEfficiencyColor(item.efficiency) + '20'
                      }}
                    >
                      {item.efficiency.toFixed(1)}%
                    </td>

                    {/* Remove Item Button */}
                    <td style={{ textAlign: 'center' }}>
                      {itemsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(item.id)}
                          className="remove-item-btn"
                          title="Remove Item"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============================================ */}
          {/* SECTION 3: OPERATOR & REMARKS */}
          {/* ============================================ */}
          <div className="bottom-section">
            <div className="operator-row">
              {/* OPERATOR NAME - Required */}
              <div className="form-group">
                <label className="form-label required" style={{ color: '#27ae60' }}>
                  <FiUser /> OPERATOR NAME
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => handleOperatorChange(e.target.value)}
                  className={`item-input ${fieldStatus.operator_name || getFieldClass('operator_name', operatorName)}`}
                  placeholder="Enter operator name"
                />
                {validationErrors.operator_name && (
                  <span className="error-text">{validationErrors.operator_name}</span>
                )}
              </div>
              
              {/* REMARKS - Optional */}
              <div className="form-group">
                <label className="form-label" style={{ color: '#3498db' }}>
                  <FiClipboard /> REMARKS
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => handleRemarksChange(e.target.value)}
                  className={`form-textarea ${fieldStatus.remarks || ''}`}
                  placeholder="Enter any additional notes or remarks..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 4: FORM ACTIONS */}
          {/* ============================================ */}
          <div className="actions-section">
            <div className="total-info">
              TOTAL PRODUCTION: 
              <span> {totalProduction.toFixed(2)} {targetData.unit}</span>
            </div>
            
            <div className="action-buttons">
              {/* Reset Button */}
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-reset"
              >
                <FiSettings /> RESET FORM
              </button>
              
              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-cancel"
              >
                <FiX /> CANCEL
              </button>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="btn btn-submit"
              >
                {saving ? (
                  <>
                    <div className="btn-spinner"></div>
                    SAVING...
                  </>
                ) : (
                  <>
                    <FiSave /> SAVE ({itemsList.length} ITEM{itemsList.length > 1 ? 'S' : ''})
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ============================================ */}
        {/* FOOTER: DATABASE INFORMATION */}
        {/* ============================================ */}
        <div className="database-info">
          <div className="info-header">
            <FiDatabase /> DATABASE CONNECTION STATUS
          </div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-title">ITEMS TABLE</div>
              <div className="info-value">{items.length} active items</div>
              <div className="info-desc">Source: items table (is_active = true)</div>
            </div>
            <div className="info-item">
              <div className="info-title">TARGETS TABLE</div>
              <div className="info-value">{targets.length} targets loaded</div>
              <div className="info-desc">Filtered for Flattening section</div>
            </div>
            <div className="info-item">
              <div className="info-title">STORAGE TABLE</div>
              <div className="info-value">flatteningsection</div>
              <div className="info-desc">Records are saved here</div>
            </div>
            <div className="info-item">
              <div className="info-title">CONNECTION</div>
              <div className="info-value">
                <span style={{ color: '#27ae60' }}>● CONNECTED</span>
              </div>
              <div className="info-desc">Supabase PostgreSQL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// SECTION 19: EXPORT
// ========================================================

export default FlatteningForm;