// MaterialReceivedForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPackage, FiSave, FiArrowLeft, FiRefreshCw,
  FiCheck, FiX, FiHash, FiUser, FiBriefcase,
  FiFileText, FiDollarSign, FiTag, FiLayers
} from 'react-icons/fi';
import axios from 'axios';
import './RawMaterialPage.css';

const MaterialReceivedForm = ({ editData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gate_pass: '',
    transaction_type: 'material received',
    wire_size: '',
    category: '',
    shape: '',
    kg_wt: '',
    remarks: '',
    reason: '',
    department: 'Warehouse',
    reference_no: '',
    received_by: '',
    status: 'active',
    supplier_name: '',
    vehicle_no: '',
    quality_check: 'pending'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Options
  const wireSizeOptions = ['1.20mm', '1.50mm', '2.00mm', '2.50mm', '3.00mm', '3.50mm', '4.00mm'];
  const categoryOptions = ['B4', 'B6', 'B8', 'B10', 'B12', 'B14', 'B16'];
  const shapeOptions = ['coil form', 'bobbins form', 'sheet form', 'rod form'];
  const departmentOptions = ['Warehouse', 'Production', 'Quality Control', 'Store'];
  const qualityOptions = ['pending', 'approved', 'rejected', 'under_test'];

  // Initialize
  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      generateGatePass();
    }
  }, [editData]);

  // Generate Gate Pass
  const generateGatePass = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const gatePass = `GP-REC-${year}${month}${day}-${random}`;
    
    setFormData(prev => ({ ...prev, gate_pass: gatePass }));
  };

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.gate_pass.trim()) newErrors.gate_pass = 'Gate pass required';
    if (!formData.wire_size) newErrors.wire_size = 'Wire size required';
    if (!formData.category) newErrors.category = 'Category required';
    if (!formData.shape) newErrors.shape = 'Shape required';
    if (!formData.kg_wt || parseFloat(formData.kg_wt) <= 0) newErrors.kg_wt = 'Valid weight required';
    if (!formData.received_by.trim()) newErrors.received_by = 'Received by required';
    if (!formData.supplier_name.trim()) newErrors.supplier_name = 'Supplier name required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSuccessMessage('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      const dataToSave = {
        ...formData,
        kg_wt: parseFloat(formData.kg_wt),
        created_by: localStorage.getItem('username') || 'admin',
        created_at: new Date().toISOString()
      };
      
      // Remove empty fields
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === '' || dataToSave[key] === null) {
          delete dataToSave[key];
        }
      });
      
      console.log('Saving data:', dataToSave);
      
      // API Call (Replace with your actual API)
      // const response = await axios.post('/api/raw-material/received', dataToSave);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage('Material received record saved successfully!');
      
      // Reset form after success
      setTimeout(() => {
        resetForm();
        setSuccessMessage('');
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/production-sections/raw-material');
        }, 2000);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving data:', error);
      setSuccessMessage('Error saving record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      gate_pass: '',
      transaction_type: 'material received',
      wire_size: '',
      category: '',
      shape: '',
      kg_wt: '',
      remarks: '',
      reason: '',
      department: 'Warehouse',
      reference_no: '',
      received_by: '',
      status: 'active',
      supplier_name: '',
      vehicle_no: '',
      quality_check: 'pending'
    });
    setErrors({});
    generateGatePass();
  };

  return (
    <div className="form-page-container">
      {/* Header */}
      <div className="form-page-header">
        <button className="back-btn" onClick={() => navigate('/production-sections/raw-material')}>
          <FiArrowLeft /> Back to Raw Material
        </button>
        
        <div className="header-content">
          <h1><FiPackage /> Material Received Form</h1>
          <p>Record incoming material from suppliers or production</p>
        </div>
      </div>

      {/* Success/Error Message */}
      {successMessage && (
        <div className={`success-message ${successMessage.includes('Error') ? 'error' : 'success'}`}>
          <FiCheck /> {successMessage}
        </div>
      )}

      {/* Form */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Information */}
          <div className="form-section">
            <h3><FiTag /> Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="required">Gate Pass</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    name="gate_pass"
                    value={formData.gate_pass}
                    onChange={handleChange}
                    className={errors.gate_pass ? 'error' : ''}
                    readOnly
                  />
                  <button type="button" onClick={generateGatePass} className="btn-small">
                    <FiHash /> Regenerate
                  </button>
                </div>
                {errors.gate_pass && <div className="error-text">{errors.gate_pass}</div>}
              </div>
              
              <div className="form-group">
                <label>Reference No.</label>
                <input
                  type="text"
                  name="reference_no"
                  value={formData.reference_no}
                  onChange={handleChange}
                  placeholder="PO-2024-001"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="required">Supplier Name</label>
                <input
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleChange}
                  placeholder="Supplier company name"
                  className={errors.supplier_name ? 'error' : ''}
                />
                {errors.supplier_name && <div className="error-text">{errors.supplier_name}</div>}
              </div>
              
              <div className="form-group">
                <label>Vehicle No.</label>
                <input
                  type="text"
                  name="vehicle_no"
                  value={formData.vehicle_no}
                  onChange={handleChange}
                  placeholder="Vehicle number"
                />
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
                  className={errors.wire_size ? 'error' : ''}
                >
                  <option value="">Select Size</option>
                  {wireSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                {errors.wire_size && <div className="error-text">{errors.wire_size}</div>}
              </div>
              
              <div className="form-group">
                <label className="required">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'error' : ''}
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <div className="error-text">{errors.category}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="required">Shape</label>
                <select
                  name="shape"
                  value={formData.shape}
                  onChange={handleChange}
                  className={errors.shape ? 'error' : ''}
                >
                  <option value="">Select Shape</option>
                  {shapeOptions.map(shape => (
                    <option key={shape} value={shape}>{shape}</option>
                  ))}
                </select>
                {errors.shape && <div className="error-text">{errors.shape}</div>}
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
                {errors.kg_wt && <div className="error-text">{errors.kg_wt}</div>}
              </div>
            </div>
          </div>

          {/* Section 3: Quality & Personnel */}
          <div className="form-section">
            <h3><FiUser /> Quality & Personnel</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="required">Received By</label>
                <input
                  type="text"
                  name="received_by"
                  value={formData.received_by}
                  onChange={handleChange}
                  placeholder="Person who received"
                  className={errors.received_by ? 'error' : ''}
                />
                {errors.received_by && <div className="error-text">{errors.received_by}</div>}
              </div>
              
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quality Check</label>
                <select
                  name="quality_check"
                  value={formData.quality_check}
                  onChange={handleChange}
                >
                  {qualityOptions.map(quality => (
                    <option key={quality} value={quality}>
                      {quality.charAt(0).toUpperCase() + quality.slice(1).replace('_', ' ')}
                    </option>
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
                  <option value="pending">Pending</option>
                </select>
              </div>
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
                placeholder="Additional notes about received material..."
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Reason for Receiving</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Why this material is being received..."
                rows="2"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={resetForm}
              disabled={loading}
            >
              <FiRefreshCw /> Reset Form
            </button>
            
            <div className="action-buttons">
              <button 
                type="button" 
                className="btn-outline"
                onClick={() => navigate('/production-sections/raw-material')}
                disabled={loading}
              >
                <FiX /> Cancel
              </button>
              
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave /> Save Received Record
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

export default MaterialReceivedForm;