// ========================================================
// FILE: FlatteningMultiEntryForm.jsx
// PURPOSE: Multiple Machines Production Entry - Flattening Section
// VERSION: 1.0 - All Machines in Single Form
// ========================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, FiX, FiTarget, FiPackage,
  FiUser, FiClipboard,
  FiCheck, FiAlertCircle, FiPlus,
  FiTrash2, FiTrendingUp,
  FiRefreshCw,
  FiArrowLeft, FiGrid,
  FiLayers, FiCpu, FiZap, FiHardDrive
} from 'react-icons/fi'; // ✅ Removed unused imports
import { supabase } from '../../../supabaseClient';
import './FlatteningForm.css';
import './FlatteningMultiEntryForm.css'; // ✅ Separate CSS file

const FlatteningMultiEntryForm = ({ onClose, isModal = true }) => {
  const navigate = useNavigate();
  
  // Configuration - یہاں مشینوں کی تعداد تبدیل کر سکتے ہیں
  const [machineCount, setMachineCount] = useState(5); // 1 سے 10 تک کر سکتے ہیں
  const [machines, setMachines] = useState([]);
  
  // States for all machines
  const [machineTargets, setMachineTargets] = useState([]);
  const [machineItems, setMachineItems] = useState({});
  const [operatorNames, setOperatorNames] = useState({});
  const [remarks, setRemarks] = useState({});
  
  // Common states
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldStatus, setFieldStatus] = useState({});

  // ==================== INITIALIZE MACHINES ====================
  useEffect(() => {
    // Initialize machines array
    const machinesArray = [];
    for (let i = 1; i <= machineCount; i++) {
      machinesArray.push({
        id: i,
        name: `Machine ${i}`,
        code: `MACH-${String(i).padStart(3, '0')}`,
        items: [{ id: 1, item_code: '', production_quantity: '', unit: 'Kg', efficiency: 0 }]
      });
    }
    setMachines(machinesArray);
    
    // Initialize states for each machine
    const initialMachineTargets = {};
    const initialMachineItems = {};
    const initialOperatorNames = {};
    const initialRemarks = {};
    
    machinesArray.forEach(machine => {
      initialMachineTargets[machine.id] = {
        targets_id: '',
        machine_id: '',
        machine_no: machine.code,
        shift_code: '',
        shift_name: '',
        target_qty: 0,
        unit: 'Kg'
      };
      
      initialMachineItems[machine.id] = [
        { id: 1, item_code: '', production_quantity: '', unit: 'Kg', efficiency: 0 }
      ];
      
      initialOperatorNames[machine.id] = '';
      initialRemarks[machine.id] = '';
    });
    
    setMachineTargets(initialMachineTargets);
    setMachineItems(initialMachineItems);
    setOperatorNames(initialOperatorNames);
    setRemarks(initialRemarks);
  }, [machineCount]);

  // ==================== CHECK MOBILE ====================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==================== FETCH DATA ====================
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [itemsRes, targetsRes] = await Promise.all([
        supabase.from('items').select('*').order('item_name'),
        supabase.from('targets').select('*').order('id')
      ]);
      
      if (itemsRes.error) throw itemsRes.error;
      if (targetsRes.error) throw targetsRes.error;
      
      setItems(itemsRes.data || []);
      setTargets(targetsRes.data || []);
      
    } catch (error) {
      console.error('❌ Data fetching error:', error);
      setError('Data loading failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ==================== MACHINE TARGET HANDLING ====================
  const handleMachineTargetChange = (machineId, selectedTargetsId) => {
    if (!selectedTargetsId) {
      const newTargets = { ...machineTargets };
      newTargets[machineId] = {
        targets_id: '',
        machine_id: '',
        machine_no: machines.find(m => m.id === machineId)?.code || '',
        shift_code: '',
        shift_name: '',
        target_qty: 0,
        unit: 'Kg'
      };
      setMachineTargets(newTargets);
      return;
    }

    const target = targets.find(t => 
      t.targets_id === selectedTargetsId || 
      t.id === selectedTargetsId ||
      t.target_id === selectedTargetsId
    );
    
    if (target) {
      const newTargets = { ...machineTargets };
      newTargets[machineId] = {
        targets_id: target.targets_id || target.id || target.target_id || '',
        machine_id: target.machine_id || target.machine || '',
        machine_no: target.machine_no || target.machine_number || target.machine_code || '',
        shift_code: target.shift_code || target.shift || '',
        shift_name: target.shift_name || target.shift_name || '',
        target_qty: parseFloat(target.target_qty || target.quantity || target.qty || 0),
        unit: target.uom || target.unit || 'Kg'
      };
      
      setMachineTargets(newTargets);
      
      // Update field status
      const newStatus = { ...fieldStatus };
      if (selectedTargetsId) {
        newStatus[`target_${machineId}`] = 'filled-valid';
      } else {
        newStatus[`target_${machineId}`] = 'empty-required';
      }
      setFieldStatus(newStatus);
    }
  };

  // ==================== ITEM HANDLING PER MACHINE ====================
  const handleMachineItemChange = (machineId, itemRowId, itemCode) => {
    const updatedItems = { ...machineItems };
    const machineItemList = [...updatedItems[machineId]];
    
    const selectedItem = items.find(i => i.item_code === itemCode);
    if (selectedItem) {
      const index = machineItemList.findIndex(item => item.id === itemRowId);
      if (index !== -1) {
        machineItemList[index] = {
          ...machineItemList[index],
          item_code: itemCode,
          item_name: selectedItem.item_name || '',
          coil_size: selectedItem.coil_size || '',
          material_type: selectedItem.material_type || '',
          unit: selectedItem.unit || 'Kg'
        };
        
        updatedItems[machineId] = machineItemList;
        setMachineItems(updatedItems);
        
        // Update field status
        const newStatus = { ...fieldStatus };
        newStatus[`item_${machineId}_${itemRowId}`] = 'filled-valid';
        setFieldStatus(newStatus);
      }
    }
  };

  const handleMachineQuantityChange = (machineId, itemRowId, quantity) => {
    const quantityNum = parseFloat(quantity) || 0;
    const updatedItems = { ...machineItems };
    const machineItemList = [...updatedItems[machineId]];
    
    const index = machineItemList.findIndex(item => item.id === itemRowId);
    if (index !== -1) {
      const targetQty = machineTargets[machineId]?.target_qty || 0;
      const efficiency = targetQty > 0 ? (quantityNum / targetQty) * 100 : 0;
      
      machineItemList[index] = {
        ...machineItemList[index],
        production_quantity: quantity,
        efficiency: Math.min(100, parseFloat(efficiency.toFixed(2)))
      };
      
      updatedItems[machineId] = machineItemList;
      setMachineItems(updatedItems);
      
      // Update field status
      const newStatus = { ...fieldStatus };
      if (quantity && quantity.trim() !== '') {
        newStatus[`quantity_${machineId}_${itemRowId}`] = 'filled-valid';
      } else {
        newStatus[`quantity_${machineId}_${itemRowId}`] = 'empty-required';
      }
      setFieldStatus(newStatus);
    }
  };

  // ==================== ADD/REMOVE ITEM ROWS PER MACHINE ====================
  const addMachineItemRow = (machineId) => {
    const updatedItems = { ...machineItems };
    const currentItems = updatedItems[machineId] || [];
    const newId = currentItems.length > 0 ? Math.max(...currentItems.map(i => i.id)) + 1 : 1;
    
    updatedItems[machineId] = [
      ...currentItems,
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
    ];
    
    setMachineItems(updatedItems);
  };

  const removeMachineItemRow = (machineId, itemId) => {
    const updatedItems = { ...machineItems };
    const currentItems = updatedItems[machineId] || [];
    
    if (currentItems.length > 1) {
      updatedItems[machineId] = currentItems.filter(item => item.id !== itemId);
      setMachineItems(updatedItems);
    }
  };

  // ==================== OPERATOR AND REMARKS HANDLING ====================
  const handleOperatorChange = (machineId, value) => {
    const newOperators = { ...operatorNames };
    newOperators[machineId] = value;
    setOperatorNames(newOperators);
    
    // Update field status
    const newStatus = { ...fieldStatus };
    if (value && value.trim() !== '') {
      newStatus[`operator_${machineId}`] = 'filled-valid';
    } else {
      newStatus[`operator_${machineId}`] = 'empty-required';
    }
    setFieldStatus(newStatus);
  };

  const handleRemarksChange = (machineId, value) => {
    const newRemarks = { ...remarks };
    newRemarks[machineId] = value;
    setRemarks(newRemarks);
  };

  // ==================== CALCULATE TOTAL PRODUCTION PER MACHINE ====================
  const calculateMachineTotal = (machineId) => {
    const machineItemList = machineItems[machineId] || [];
    return machineItemList.reduce((total, item) => {
      return total + (parseFloat(item.production_quantity) || 0);
    }, 0);
  };

  const calculateMachineEfficiency = (machineId) => {
    const targetQty = machineTargets[machineId]?.target_qty || 0;
    const totalProduction = calculateMachineTotal(machineId);
    
    if (targetQty > 0 && totalProduction > 0) {
      const efficiency = (totalProduction / targetQty) * 100;
      return Math.min(100, parseFloat(efficiency.toFixed(2)));
    }
    return 0;
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const errors = {};
    const newFieldStatus = {};
    
    // Validate each machine
    machines.forEach(machine => {
      const machineId = machine.id;
      
      // Validate target
      if (!machineTargets[machineId]?.targets_id) {
        errors[`target_${machineId}`] = `Machine ${machine.code}: Target is required`;
        newFieldStatus[`target_${machineId}`] = 'empty-required';
      } else {
        newFieldStatus[`target_${machineId}`] = 'filled-valid';
      }
      
      // Validate operator
      if (!operatorNames[machineId]?.trim()) {
        errors[`operator_${machineId}`] = `Machine ${machine.code}: Operator name is required`;
        newFieldStatus[`operator_${machineId}`] = 'empty-required';
      } else {
        newFieldStatus[`operator_${machineId}`] = 'filled-valid';
      }
      
      // Validate items
      const machineItemList = machineItems[machineId] || [];
      machineItemList.forEach((item, index) => {
        if (!item.item_code) {
          errors[`item_${machineId}_${item.id}`] = `Machine ${machine.code}, Item ${index + 1}: Item is required`;
          newFieldStatus[`item_${machineId}_${item.id}`] = 'empty-required';
        } else {
          newFieldStatus[`item_${machineId}_${item.id}`] = 'filled-valid';
        }
        
        if (!item.production_quantity || parseFloat(item.production_quantity) <= 0) {
          errors[`quantity_${machineId}_${item.id}`] = `Machine ${machine.code}, Item ${index + 1}: Valid quantity is required`;
          newFieldStatus[`quantity_${machineId}_${item.id}`] = 'empty-required';
        } else {
          newFieldStatus[`quantity_${machineId}_${item.id}`] = 'filled-valid';
        }
      });
    });
    
    setFieldStatus(newFieldStatus);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all required fields for all machines');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const allRecords = [];
      
      // Collect records from all machines
      machines.forEach(machine => {
        const machineId = machine.id;
        const machineData = machineTargets[machineId];
        const machineItemList = machineItems[machineId] || [];
        
        machineItemList.forEach(item => {
          allRecords.push({
            section_name: 'Flattening',
            targets_id: machineData.targets_id,
            machine_id: machineData.machine_id,
            machine_no: machineData.machine_no,
            item_code: item.item_code,
            item_name: item.item_name,
            coil_size: item.coil_size,
            material_type: item.material_type,
            operator_name: operatorNames[machineId]?.trim() || '',
            production_quantity: parseFloat(item.production_quantity) || 0,
            unit: item.unit,
            efficiency: item.efficiency,
            shift_code: machineData.shift_code,
            target_qty: machineData.target_qty,
            shift_name: machineData.shift_name,
            remarks: remarks[machineId]?.trim() || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        });
      });

      // Insert all records at once
      const { error: insertError } = await supabase
        .from('flatteningsection')
        .insert(allRecords);

      if (insertError) throw insertError;

      const totalMachines = machines.length;
      const totalRecords = allRecords.length;
      setSuccess(`✅ ${totalMachines} machines, ${totalRecords} records saved successfully!`);
      
      // Reset form after success
      setTimeout(() => {
        handleReset();
        setSuccess('');
      }, 3000);

    } catch (error) {
      console.error('❌ Save error:', error);
      setError('❌ Save failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== FORM RESET ====================
  const handleReset = () => {
    // Reset all machines
    const machinesArray = [];
    for (let i = 1; i <= machineCount; i++) {
      machinesArray.push({
        id: i,
        name: `Machine ${i}`,
        code: `MACH-${String(i).padStart(3, '0')}`,
        items: [{ id: 1, item_code: '', production_quantity: '', unit: 'Kg', efficiency: 0 }]
      });
    }
    setMachines(machinesArray);
    
    // Reset all states
    const initialMachineTargets = {};
    const initialMachineItems = {};
    const initialOperatorNames = {};
    const initialRemarks = {};
    
    machinesArray.forEach(machine => {
      initialMachineTargets[machine.id] = {
        targets_id: '',
        machine_id: '',
        machine_no: machine.code,
        shift_code: '',
        shift_name: '',
        target_qty: 0,
        unit: 'Kg'
      };
      
      initialMachineItems[machine.id] = [
        { id: 1, item_code: '', production_quantity: '', unit: 'Kg', efficiency: 0 }
      ];
      
      initialOperatorNames[machine.id] = '';
      initialRemarks[machine.id] = '';
    });
    
    setMachineTargets(initialMachineTargets);
    setMachineItems(initialMachineItems);
    setOperatorNames(initialOperatorNames);
    setRemarks(initialRemarks);
    
    setValidationErrors({});
    setFieldStatus({});
    setError('');
    setSuccess('');
  };

  // ==================== UI HELPERS ====================
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return '#27ae60';
    if (efficiency >= 80) return '#f39c12';
    if (efficiency >= 70) return '#e67e22';
    return '#e74c3c';
  };

  // ✅ Removed unused getEfficiencyStatus function

  const handleBackClick = () => {
    navigate('/production-sections/flattening');
  };

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate('/production-sections/flattening');
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flattening-modal-overlay" onClick={handleClose}>
        <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Multi-Machine Production Form...</p>
            <div className="loading-details">
              <p>🔄 Setting up {machineCount} machines...</p>
              <p>📊 Loading reference data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="flattening-modal-overlay multi-machine-overlay" onClick={handleClose}>
      <div className="flattening-modal-container multi-machine-container" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="modal-header multi-machine-header">
          <div className="header-content">
            <div className="header-icon multi-machine-icon">
              <FiGrid />
            </div>
            <div className="header-text">
              <h1>MULTI-MACHINE PRODUCTION ENTRY</h1>
              <p>
                <FiCpu /> {machineCount} Machines | 
                <FiPackage /> {items.length} Items | 
                <FiTarget /> {targets.length} Targets
                {isMobile && <span className="mobile-indicator">📱</span>}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="back-button"
              onClick={handleBackClick}
              title="Back to Flattening Section"
            >
              <FiArrowLeft /> {!isMobile && 'BACK'}
            </button>
            <button className="close-button" onClick={handleClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* MACHINE COUNT SELECTOR */}
        <div className="machine-count-selector">
          <div className="selector-label">
            <FiHardDrive /> SELECT NUMBER OF MACHINES:
          </div>
          <div className="machine-buttons">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button
                key={num}
                type="button"
                className={`machine-count-btn ${machineCount === num ? 'active' : ''}`}
                onClick={() => setMachineCount(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* MESSAGES */}
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="multi-machine-form">
          
          {/* MACHINES CONTAINER */}
          <div className="machines-container">
            {machines.map(machine => {
              const machineId = machine.id;
              const machineData = machineTargets[machineId] || {};
              const machineItemList = machineItems[machineId] || [];
              const totalProduction = calculateMachineTotal(machineId);
              const efficiency = calculateMachineEfficiency(machineId);
              
              return (
                <div key={machineId} className="machine-card">
                  
                  {/* MACHINE HEADER */}
                  <div className="machine-header">
                    <div className="machine-title">
                      <FiCpu />
                      <span>{machine.name} ({machine.code})</span>
                      <span className="machine-status">
                        {efficiency > 0 ? '● ACTIVE' : '○ INACTIVE'}
                      </span>
                    </div>
                    <div className="machine-stats">
                      <div className="stat-item">
                        <span className="stat-label">Target:</span>
                        <span className="stat-value">{machineData.target_qty || 0} {machineData.unit}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Production:</span>
                        <span className="stat-value">{totalProduction.toFixed(2)} {machineData.unit}</span>
                      </div>
                      <div className="stat-item efficiency-stat" style={{ color: getEfficiencyColor(efficiency) }}>
                        <span className="stat-label">Efficiency:</span>
                        <span className="stat-value">{efficiency.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* MACHINE CONTENT */}
                  <div className="machine-content">
                    
                    {/* TARGET SELECTION */}
                    <div className="machine-target-section">
                      <div className="section-title-small">
                        <FiTarget /> TARGET SELECTION
                      </div>
                      <div className="target-selection-grid">
                        <div className="selection-box">
                          <label className="selection-label required">
                            <FiTarget /> SELECT TARGET
                          </label>
                          <select
                            value={machineData.targets_id || ''}
                            onChange={(e) => handleMachineTargetChange(machineId, e.target.value)}
                            className={`form-select ${fieldStatus[`target_${machineId}`] || ''}`}
                          >
                            <option value="">-- SELECT TARGET FOR {machine.code} --</option>
                            {targets.map(target => (
                              <option key={target.targets_id || target.id} value={target.targets_id || target.id}>
                                {target.targets_id || target.id} - {target.machine_id || ''}
                              </option>
                            ))}
                          </select>
                          {validationErrors[`target_${machineId}`] && (
                            <span className="error-text">{validationErrors[`target_${machineId}`]}</span>
                          )}
                        </div>
                        
                        {/* Auto-filled target details */}
                        <div className="target-details">
                          <div className="detail-item">
                            <span className="detail-label">Machine ID:</span>
                            <span className="detail-value">{machineData.machine_id || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Shift:</span>
                            <span className="detail-value">{machineData.shift_code || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Target Qty:</span>
                            <span className="detail-value target-qty">{machineData.target_qty || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* ITEMS SECTION */}
                    <div className="machine-items-section">
                      <div className="items-header">
                        <div className="section-title-small">
                          <FiLayers /> PRODUCTION ITEMS
                        </div>
                        <button
                          type="button"
                          onClick={() => addMachineItemRow(machineId)}
                          className="add-item-btn-small"
                        >
                          <FiPlus /> ADD PART
                        </button>
                      </div>
                      
                      <div className="items-table-container">
                        <table className="compact-items-table">
                          <thead>
                            <tr>
                              <th>ITEM</th>
                              <th>QUANTITY</th>
                              <th>UNIT</th>
                              <th>EFFICIENCY</th>
                              <th>ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {machineItemList.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <select
                                    value={item.item_code}
                                    onChange={(e) => handleMachineItemChange(machineId, item.id, e.target.value)}
                                    className={`item-select-compact ${fieldStatus[`item_${machineId}_${item.id}`] || ''}`}
                                  >
                                    <option value="">-- SELECT --</option>
                                    {items.map(itm => (
                                      <option key={itm.item_code} value={itm.item_code}>
                                        {itm.item_code}
                                      </option>
                                    ))}
                                  </select>
                                  {validationErrors[`item_${machineId}_${item.id}`] && (
                                    <div className="error-text-small">
                                      {validationErrors[`item_${machineId}_${item.id}`]}
                                    </div>
                                  )}
                                </td>
                                
                                <td>
                                  <input
                                    type="number"
                                    value={item.production_quantity}
                                    onChange={(e) => handleMachineQuantityChange(machineId, item.id, e.target.value)}
                                    step="0.01"
                                    min="0"
                                    className={`quantity-input-compact ${fieldStatus[`quantity_${machineId}_${item.id}`] || ''}`}
                                    placeholder="0.00"
                                  />
                                  {validationErrors[`quantity_${machineId}_${item.id}`] && (
                                    <div className="error-text-small">
                                      {validationErrors[`quantity_${machineId}_${item.id}`]}
                                    </div>
                                  )}
                                </td>
                                
                                <td className="unit-cell-compact">
                                  {item.unit}
                                </td>
                                
                                <td 
                                  className="efficiency-cell-compact"
                                  style={{
                                    color: getEfficiencyColor(item.efficiency),
                                    backgroundColor: getEfficiencyColor(item.efficiency) + '20'
                                  }}
                                >
                                  {item.efficiency.toFixed(1)}%
                                </td>
                                
                                <td className="action-cell-compact">
                                  {machineItemList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeMachineItemRow(machineId, item.id)}
                                      className="remove-item-btn-small"
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
                    </div>
                    
                    {/* OPERATOR & REMARKS */}
                    <div className="machine-operator-section">
                      <div className="operator-input-group">
                        <div className="form-group-small">
                          <label className="form-label-small required">
                            <FiUser /> OPERATOR
                          </label>
                          <input
                            type="text"
                            value={operatorNames[machineId] || ''}
                            onChange={(e) => handleOperatorChange(machineId, e.target.value)}
                            className={`operator-input ${fieldStatus[`operator_${machineId}`] || ''}`}
                            placeholder="Operator name"
                          />
                          {validationErrors[`operator_${machineId}`] && (
                            <span className="error-text">{validationErrors[`operator_${machineId}`]}</span>
                          )}
                        </div>
                        
                        <div className="form-group-small">
                          <label className="form-label-small">
                            <FiClipboard /> REMARKS
                          </label>
                          <textarea
                            value={remarks[machineId] || ''}
                            onChange={(e) => handleRemarksChange(machineId, e.target.value)}
                            className="remarks-input"
                            placeholder="Any remarks..."
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                    
                  </div> {/* End machine-content */}
                </div> // End machine-card
              );
            })}
          </div> {/* End machines-container */}
          
          {/* FORM ACTIONS */}
          <div className="multi-machine-actions">
            <div className="summary-info">
              <FiTrendingUp /> TOTAL PRODUCTION: 
              <span className="summary-value">
                {machines.reduce((total, machine) => total + calculateMachineTotal(machine.id), 0).toFixed(2)} Kg
              </span>
              <span className="summary-machines">
                | {machineCount} MACHINES | {machines.reduce((total, machine) => total + (machineItems[machine.id]?.length || 0), 0)} PARTS
              </span>
            </div>
            
            <div className="action-buttons">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-reset"
              >
                <FiRefreshCw /> {!isMobile && 'RESET ALL'}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-cancel"
              >
                <FiX /> {!isMobile && 'CANCEL'}
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="btn btn-submit multi-save-btn"
              >
                {saving ? (
                  <>
                    <div className="btn-spinner"></div>
                    {!isMobile && 'SAVING ALL...'}
                  </>
                ) : (
                  <>
                    <FiSave /> {!isMobile && 'SAVE ALL MACHINES'} ({machineCount})
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* DEBUG INFO */}
        <div className="database-info debug-info">
          <div className="info-header">
            <FiZap /> MULTI-MACHINE SYSTEM
          </div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-title">ACTIVE MACHINES</div>
              <div className="info-value">{machineCount}</div>
              <div className="info-desc">Currently configured</div>
            </div>
            <div className="info-item">
              <div className="info-title">TOTAL PARTS</div>
              <div className="info-value">
                {machines.reduce((total, machine) => total + (machineItems[machine.id]?.length || 0), 0)}
              </div>
              <div className="info-desc">Across all machines</div>
            </div>
            <div className="info-item">
              <div className="info-title">ITEMS LOADED</div>
              <div className="info-value">{items.length}</div>
              <div className="info-desc">Available items</div>
            </div>
            <div className="info-item">
              <div className="info-title">SYSTEM STATUS</div>
              <div className="info-value">
                <span style={{ color: '#27ae60' }}>
                  ● READY
                </span>
              </div>
              <div className="info-desc">All systems operational</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default FlatteningMultiEntryForm;