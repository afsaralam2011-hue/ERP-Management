// ========================================================
// FILE: RawMaterialLogForm.jsx
// PURPOSE: Material Transaction Form (Received/Issue/Return)
// ========================================================

import React, { useState, useEffect } from 'react';
import { 
  FiSave, FiX, FiPackage, FiBox, FiRefreshCw,
  FiUser, FiClipboard, FiSettings, FiCheck, 
  FiAlertCircle, FiDatabase, FiHash, FiTag, 
  FiTool, FiFileText, FiBriefcase, FiArrowLeftCircle,
  FiArrowRightCircle, FiCornerDownLeft
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const RawMaterialLogForm = ({ onClose, editData, isModal = true }) => {
  // ========================================================
  // STATE VARIABLES
  // ========================================================
  const [formData, setFormData] = useState({
    gate_pass: '',
    transaction_type: 'receive',
    wire_size: '1.20mm',
    category: 'B4',
    shape: 'coil_form',
    weight: '',
    remarks: '',
    reason: '',
    department: 'Production',
    reference_no: '',
    received_by: '',
    issued_by: '',
    returned_by: '',
    status: 'active'
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [fieldStatus, setFieldStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [departments, setDepartments] = useState([]);

  // ========================================================
  // EFFECT HOOKS
  // ========================================================
  useEffect(() => {
    fetchDepartments();
    if (editData) {
      setFormData(editData);
    }
  }, [editData]);

  // ========================================================
  // DATA FUNCTIONS
  // ========================================================
  const fetchDepartments = async () => {
    setDepartments([
      'Production', 'Warehouse', 'Flattening', 
      'Spiral', 'PVC Coating', 'Cutting & Packing', 
      'Finished Goods'
    ]);
  };

  // ========================================================
  // FIELD STATUS
  // ========================================================
  const getFieldClass = (fieldName, value) => {
    if (!value || value.toString().trim() === '') {
      return 'empty-required';
    }
    return 'filled-valid';
  };

  // ========================================================
  // FORM HANDLERS
  // ========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const newStatus = { ...fieldStatus };
    if (value && value.toString().trim() !== '') {
      newStatus[name] = 'filled-valid';
    } else {
      newStatus[name] = 'empty-required';
    }
    setFieldStatus(newStatus);

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const generateGatePass = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const gatePass = `GP-${year}${month}${day}-${random}`;
    
    setFormData(prev => ({ ...prev, gate_pass: gatePass }));
    setFieldStatus(prev => ({ ...prev, gate_pass: 'filled-valid' }));
  };

  // ========================================================
  // TRANSACTION TYPE CONFIGURATION
  // ========================================================
  const transactionTypes = [
    { 
      value: 'receive', 
      label: 'Receive', 
      icon: FiPackage, 
      color: '#10b981',
      description: 'Material Received',
      personField: 'received_by'
    },
    { 
      value: 'issue', 
      label: 'Issue', 
      icon: FiBox, 
      color: '#f59e0b',
      description: 'Material Issued',
      personField: 'issued_by'
    },
    { 
      value: 'return', 
      label: 'Return', 
      icon: FiArrowLeftCircle, 
      color: '#8b5cf6',
      description: 'Material Returned',
      personField: 'returned_by'
    }
  ];

  // ========================================================
  // VALIDATION
  // ========================================================
  const validateForm = () => {
    const errors = {};
    const newFieldStatus = {};
    
    // Check gate pass
    if (!formData.gate_pass.trim()) {
      errors.gate_pass = 'Gate pass number is required';
      newFieldStatus.gate_pass = 'empty-required';
    } else {
      newFieldStatus.gate_pass = 'filled-valid';
    }
    
    // Check weight
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      errors.weight = 'Valid weight is required (greater than 0)';
      newFieldStatus.weight = 'empty-required';
    } else {
      newFieldStatus.weight = 'filled-valid';
    }
    
    // Check person field based on transaction type
    const currentTransaction = transactionTypes.find(t => t.value === formData.transaction_type);
    if (currentTransaction) {
      const personField = currentTransaction.personField;
      if (!formData[personField]?.trim()) {
        errors[personField] = `${currentTransaction.label} by is required`;
        newFieldStatus[personField] = 'empty-required';
      } else {
        newFieldStatus[personField] = 'filled-valid';
      }
    }

    setFieldStatus(newFieldStatus);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ========================================================
  // DATABASE SAVE
  // ========================================================
  const saveToDatabase = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const currentTransaction = transactionTypes.find(t => t.value === formData.transaction_type);

      const dbData = {
        gate_pass: formData.gate_pass,
        transaction_type: formData.transaction_type,
        wire_size: formData.wire_size,
        category: formData.category,
        shape: formData.shape,
        weight: parseFloat(formData.weight),
        remarks: formData.remarks,
        reason: formData.reason,
        department: formData.department,
        reference_no: formData.reference_no,
        status: formData.status,
        created_by: 'system',
        updated_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add person field based on transaction type
      if (currentTransaction) {
        dbData[currentTransaction.personField] = formData[currentTransaction.personField];
      }

      // Save to Supabase
      const { error: insertError } = await supabase
        .from('raw_material_log')
        .insert([dbData]);

      if (insertError) throw insertError;

      setSuccess(`✅ Material ${currentTransaction?.label.toLowerCase()} saved successfully!`);
      
      setTimeout(() => {
        handleReset();
        if (onClose) onClose();
      }, 2000);

    } catch (error) {
      console.error('Save error:', error);
      setError('❌ Save failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // FORM SUBMISSION
  // ========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fill all required fields');
      return;
    }

    await saveToDatabase();
  };

  // ========================================================
  // FORM RESET
  // ========================================================
  const handleReset = () => {
    setFormData({
      gate_pass: '',
      transaction_type: 'receive',
      wire_size: '1.20mm',
      category: 'B4',
      shape: 'coil_form',
      weight: '',
      remarks: '',
      reason: '',
      department: 'Production',
      reference_no: '',
      received_by: '',
      issued_by: '',
      returned_by: '',
      status: 'active'
    });
    setValidationErrors({});
    setFieldStatus({});
    setError('');
    setSuccess('');
  };

  // ========================================================
  // OPTIONS DATA
  // ========================================================
  const wireSizes = ['1.20mm', '1.50mm', '2.00mm', '2.50mm', '3.00mm', '3.50mm', '4.00mm', '4.50mm', '5.00mm'];
  const categories = ['B4', 'B6', 'B8', 'B10', 'B12', 'B14', 'B16'];
  const shapes = ['coil_form', 'bobbins_form', 'sheet_form', 'rod_form'];

  // ========================================================
  // RENDER
  // ========================================================
  const currentTransaction = transactionTypes.find(t => t.value === formData.transaction_type);

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div className="form-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* ============================================ */}
        {/* HEADER - NAVY BLUE WITH WHITE TEXT */}
        {/* ============================================ */}
        <div className="form-modal-header">
          <div className="form-modal-title-section">
            <div className="form-modal-icon" style={{ background: currentTransaction?.color }}>
              {currentTransaction?.icon && React.createElement(currentTransaction.icon)}
            </div>
            <div>
              <h2 className="form-modal-title">RAW MATERIAL TRANSACTION</h2>
              <p className="form-modal-subtitle">
                <FiDatabase /> {currentTransaction?.description} | Table: raw_material_log
              </p>
            </div>
          </div>
          <button className="form-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* ============================================ */}
        {/* MESSAGES */}
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
        {/* FORM */}
        {/* ============================================ */}
        <div className="raw-material-log-form">
          <form onSubmit={handleSubmit}>
            
            {/* ============================================ */}
            {/* SECTION 1: TRANSACTION TYPE */}
            {/* ============================================ */}
            <div className="form-group">
              <label className="form-label required">
                Transaction Type
              </label>
              <div className="transaction-type-buttons">
                {transactionTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    className={`transaction-btn ${formData.transaction_type === type.value ? 'active' : ''}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, transaction_type: type.value }));
                      setFieldStatus(prev => ({ ...prev, transaction_type: 'filled-valid' }));
                    }}
                    style={{
                      borderColor: formData.transaction_type === type.value ? type.color : '#e2e8f0',
                      color: formData.transaction_type === type.value ? type.color : '#475569'
                    }}
                  >
                    <div 
                      className="transaction-icon"
                      style={{ 
                        background: formData.transaction_type === type.value ? type.color : '#e2e8f0',
                        color: formData.transaction_type === type.value ? 'white' : '#94a3b8'
                      }}
                    >
                      {React.createElement(type.icon)}
                    </div>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 2: GATE PASS & REFERENCE */}
            {/* ============================================ */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">
                  Gate Pass Number
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    name="gate_pass"
                    value={formData.gate_pass}
                    onChange={handleChange}
                    className={`form-input ${fieldStatus.gate_pass || getFieldClass('gate_pass', formData.gate_pass)}`}
                    placeholder="GP-2024-001"
                  />
                  <button 
                    type="button" 
                    onClick={generateGatePass}
                    className="form-btn secondary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <FiRefreshCw /> Generate
                  </button>
                </div>
                {validationErrors.gate_pass && (
                  <div className="form-error">{validationErrors.gate_pass}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="reference_no"
                  value={formData.reference_no}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="PO-2024-001"
                />
              </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 3: MATERIAL DETAILS */}
            {/* ============================================ */}
            <div className="form-group">
              <h3 style={{ marginBottom: '15px', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                <FiTool /> Material Details
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Wire Size</label>
                  <select
                    name="wire_size"
                    value={formData.wire_size}
                    onChange={handleChange}
                    className={`form-select ${fieldStatus.wire_size || getFieldClass('wire_size', formData.wire_size)}`}
                  >
                    <option value="">Select wire size</option>
                    {wireSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`form-select ${fieldStatus.category || getFieldClass('category', formData.category)}`}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Shape</label>
                  <select
                    name="shape"
                    value={formData.shape}
                    onChange={handleChange}
                    className={`form-select ${fieldStatus.shape || getFieldClass('shape', formData.shape)}`}
                  >
                    <option value="">Select shape</option>
                    {shapes.map(shape => (
                      <option key={shape} value={shape}>
                        {shape.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label required">Weight</label>
                  <div className="weight-input-container">
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className={`form-input ${fieldStatus.weight || getFieldClass('weight', formData.weight)}`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    <span className="weight-unit">KG</span>
                  </div>
                  {validationErrors.weight && (
                    <div className="form-error">{validationErrors.weight}</div>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 4: DEPARTMENT & PERSON */}
            {/* ============================================ */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-select"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">
                  {currentTransaction?.label} By
                </label>
                <input
                  type="text"
                  name={currentTransaction?.personField}
                  value={formData[currentTransaction?.personField || '']}
                  onChange={handleChange}
                  className={`form-input ${fieldStatus[currentTransaction?.personField || ''] || getFieldClass(currentTransaction?.personField || '', formData[currentTransaction?.personField || ''])}`}
                  placeholder={`Person who ${currentTransaction?.label.toLowerCase()} material`}
                />
                {validationErrors[currentTransaction?.personField || ''] && (
                  <div className="form-error">{validationErrors[currentTransaction?.personField || '']}</div>
                )}
              </div>
            </div>

            {/* ============================================ */}
            {/* SECTION 5: NOTES */}
            {/* ============================================ */}
            <div className="form-group">
              <label className="form-label">
                <FiClipboard /> Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Additional notes or observations..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FiFileText /> Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Reason for this transaction..."
                rows="2"
              />
            </div>

            {/* ============================================ */}
            {/* SECTION 6: FORM ACTIONS */}
            {/* ============================================ */}
            <div className="form-actions">
              <div className="form-action-left">
                <button
                  type="button"
                  onClick={handleReset}
                  className="form-btn secondary"
                >
                  <FiSettings /> Reset
                </button>
              </div>
              
              <div className="form-action-right">
                <button
                  type="button"
                  onClick={onClose}
                  className="form-btn cancel"
                >
                  <FiX /> Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="form-btn primary"
                >
                  {saving ? (
                    <>
                      <div className="spinner-small"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave /> Save {currentTransaction?.label}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RawMaterialLogForm;