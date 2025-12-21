//src/pages/ProductionSections/RawMaterialSection/RawMaterialLogForm.jsx
// COMPLETE RawMaterialLogForm.jsx - Final Version
import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiX, FiSave, FiPackage, FiTag, 
  FiBox, FiDollarSign, FiMessageSquare, FiFileText,
  FiHash, FiCalendar, FiUser, FiBriefcase, FiTool
} from 'react-icons/fi';

const RawMaterialLogForm = ({ onClose, editData, onSubmit }) => {
  const [formData, setFormData] = useState({
    gate_pass: '',
    transaction_type: 'material received',
    wire_size: '1.20mm',
    category: 'B4',
    shape: 'coil form',
    kg_wt: '',
    remarks: '',
    reason: '',
    department: 'Production',
    reference_no: '',
    received_by: '',
    issued_by: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  // Initialize form with edit data if provided
  useEffect(() => {
    if (editData) {
      setFormData(editData);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.gate_pass.trim()) {
      newErrors.gate_pass = 'Gate pass number is required';
    }
    
    if (!formData.kg_wt || parseFloat(formData.kg_wt) <= 0) {
      newErrors.kg_wt = 'Valid weight is required (greater than 0)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const finalData = {
      ...formData,
      kg_wt: parseFloat(formData.kg_wt)
    };
    
    if (onSubmit) {
      onSubmit(finalData);
    }
    
    if (onClose) {
      onClose();
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
  };

  const handleReset = () => {
    setFormData({
      gate_pass: '',
      transaction_type: 'material received',
      wire_size: '1.20mm',
      category: 'B4',
      shape: 'coil form',
      kg_wt: '',
      remarks: '',
      reason: '',
      department: 'Production',
      reference_no: '',
      received_by: '',
      issued_by: '',
      status: 'active'
    });
    setErrors({});
  };

  const transactionTypes = [
    { value: 'material received', label: 'Material Received', icon: FiPackage, color: '#10b981' },
    { value: 'material issue', label: 'Material Issue', icon: FiBox, color: '#f59e0b' }
  ];

  const wireSizes = ['1.20mm', '1.50mm', '2.00mm', '2.50mm', '3.00mm', '3.50mm', '4.00mm', '4.50mm', '5.00mm'];
  const categories = ['B4', 'B6', 'B8', 'B10', 'B12', 'B14', 'B16'];
  const shapes = ['coil form', 'bobbins form', 'sheet form', 'rod form'];
  const departments = ['Production', 'Warehouse', 'Flattening', 'Spiral', 'PVC Coating', 'Cutting & Packing', 'Finished Goods'];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <h2>
              {editData ? <FiSave /> : <FiPlus />}
              {editData ? 'Edit Material Log' : 'Add Material Log'}
            </h2>
            <p>{editData ? 'Update existing record' : 'Create new material transaction'}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="form-section">
            <h3><FiBriefcase /> Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="required">Gate Pass Number</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    name="gate_pass"
                    value={formData.gate_pass}
                    onChange={handleChange}
                    placeholder="GP-2024-001"
                    className={errors.gate_pass ? 'error' : ''}
                  />
                  <button type="button" onClick={generateGatePass} className="btn-small">
                    <FiHash /> Generate
                  </button>
                </div>
                {errors.gate_pass && <span className="error-message">{errors.gate_pass}</span>}
              </div>
              
              <div className="form-group">
                <label>Reference Number</label>
                <input
                  type="text"
                  name="reference_no"
                  value={formData.reference_no}
                  onChange={handleChange}
                  placeholder="PO-2024-001"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="required">Transaction Type</label>
              <div className="radio-group">
                {transactionTypes.map((type) => (
                  <label key={type.value} className="radio-label">
                    <input
                      type="radio"
                      name="transaction_type"
                      value={type.value}
                      checked={formData.transaction_type === type.value}
                      onChange={handleChange}
                    />
                    <span className="radio-custom"></span>
                    <div className="radio-content">
                      <div className="radio-icon" style={{ background: type.color }}>
                        <type.icon />
                      </div>
                      <span>{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Material Details */}
          <div className="form-section">
            <h3><FiPackage /> Material Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="required">Wire Size</label>
                <select
                  name="wire_size"
                  value={formData.wire_size}
                  onChange={handleChange}
                >
                  <option value="">Select wire size</option>
                  {wireSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="required">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
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
                <label className="required">Shape</label>
                <select
                  name="shape"
                  value={formData.shape}
                  onChange={handleChange}
                >
                  <option value="">Select shape</option>
                  {shapes.map(shape => (
                    <option key={shape} value={shape}>{shape}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="required">Weight (KG)</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="kg_wt"
                    value={formData.kg_wt}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={errors.kg_wt ? 'error' : ''}
                  />
                  <span className="unit">KG</span>
                </div>
                {errors.kg_wt && <span className="error-message">{errors.kg_wt}</span>}
              </div>
            </div>
          </div>

          {/* Section 3: Transaction Details */}
          <div className="form-section">
            <h3><FiTool /> Transaction Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              {formData.transaction_type === 'material received' ? (
                <div className="form-group">
                  <label>Received By</label>
                  <input
                    type="text"
                    name="received_by"
                    value={formData.received_by}
                    onChange={handleChange}
                    placeholder="Person who received material"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Issued By</label>
                  <input
                    type="text"
                    name="issued_by"
                    value={formData.issued_by}
                    onChange={handleChange}
                    placeholder="Person who issued material"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="form-section">
            <h3><FiFileText /> Notes & Remarks</h3>
            
            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Additional notes or observations..."
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Reason</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Reason for this transaction..."
                rows="2"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <div className="actions-left">
              <button type="button" className="btn-secondary" onClick={handleReset}>
                Reset Form
              </button>
            </div>
            
            <div className="actions-right">
              <button type="button" className="btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editData ? (
                  <>
                    <FiSave /> Update Record
                  </>
                ) : (
                  <>
                    <FiPlus /> Save Record
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RawMaterialLogForm;