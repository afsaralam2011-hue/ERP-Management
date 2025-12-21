// MaterialIssueForm.jsx - COMPLETE FINAL VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiBox, FiSave, FiArrowLeft, FiRefreshCw,
  FiTag, FiPackage, FiUser, FiFileText,
  FiMessageSquare, FiHash, FiBriefcase,
  FiTool, FiX, FiPlus, FiCheck
} from 'react-icons/fi';
import axios from 'axios';
import './RawMaterialPage.css';

const MaterialIssueForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    gate_pass: '',
    transaction_type: 'material issue',
    wire_size: '',
    category: '',
    shape: '',
    kg_wt: '',
    remarks: '',
    reason: '',
    department: 'Production',
    reference_no: '',
    issued_by: '',
    status: 'active',
    issued_to: '',
    purpose: '',
    production_order_no: '',
    machine_no: '',
    shift: '',
    issued_date: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [availableStock, setAvailableStock] = useState([]);

  // Options
  const wireSizeOptions = [
    '1.20mm', '1.50mm', '2.00mm', '2.50mm', '3.00mm',
    '3.50mm', '4.00mm', '4.50mm', '5.00mm'
  ];

  const categoryOptions = [
    'B4', 'B6', 'B8', 'B10', 'B12', 'B14', 'B16'
  ];

  const shapeOptions = [
    'coil form', 'bobbins form', 'sheet form', 'rod form'
  ];

  const departmentOptions = [
    'Production', 'Flattening', 'Spiral', 'PVC Coating',
    'Cutting & Packing', 'Finished Goods', 'Maintenance'
  ];

  const purposeOptions = [
    'Production Order', 'Maintenance', 'Sample', 'Testing',
    'Replacement', 'Waste', 'Other'
  ];

  const shiftOptions = [
    'Morning (8AM-4PM)', 'Evening (4PM-12AM)', 'Night (12AM-8AM)'
  ];

  const machineOptions = [
    'Machine-001', 'Machine-002', 'Machine-003', 'Machine-004',
    'Machine-005', 'Machine-006', 'Machine-007', 'Machine-008'
  ];

  // Initialize form
  useEffect(() => {
    generateGatePass();
    fetchAvailableStock();
    setFormData(prev => ({
      ...prev,
      issued_date: new Date().toISOString().split('T')[0]
    }));
  }, []);

  // Fetch available stock
  const fetchAvailableStock = async () => {
    try {
      // API call to fetch available stock
      const response = await axios.get('http://localhost:5000/api/raw-material/available-stock');
      setAvailableStock(response.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // If wire size or category changes, check available stock
    if (name === 'wire_size' || name === 'category') {
      checkAvailableQuantity();
    }
  };

  // Generate gate pass
  const generateGatePass = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const gatePass = `MI-${year}${month}${day}-${random}`; // MI = Material Issue
    
    setFormData(prev => ({ 
      ...prev, 
      gate_pass: gatePass 
    }));
  };

  // Check available quantity
  const checkAvailableQuantity = () => {
    if (formData.wire_size && formData.category) {
      const stockItem = availableStock.find(item => 
        item.wire_size === formData.wire_size && 
        item.category === formData.category
      );
      
      if (stockItem && parseFloat(formData.kg_wt) > stockItem.available_quantity) {
        setErrors(prev => ({
          ...prev,
          kg_wt: `Available quantity is ${stockItem.available_quantity} KG`
        }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.gate_pass.trim()) {
      newErrors.gate_pass = 'Gate pass number is required';
    }
    
    if (!formData.wire_size) {
      newErrors.wire_size = 'Wire size is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.shape) {
      newErrors.shape = 'Shape is required';
    }
    
    if (!formData.kg_wt || parseFloat(formData.kg_wt) <= 0) {
      newErrors.kg_wt = 'Valid weight is required (must be greater than 0)';
    }
    
    if (!formData.issued_by.trim()) {
      newErrors.issued_by = 'Issued by is required';
    }
    
    if (!formData.issued_to.trim()) {
      newErrors.issued_to = 'Issued to is required';
    }
    
    if (!formData.purpose) {
      newErrors.purpose = 'Purpose is required';
    }
    
    if (!formData.production_order_no.trim()) {
      newErrors.production_order_no = 'Production order number is required';
    }
    
    // Check stock availability
    if (formData.wire_size && formData.category && formData.kg_wt) {
      const stockItem = availableStock.find(item => 
        item.wire_size === formData.wire_size && 
        item.category === formData.category
      );
      
      if (stockItem && parseFloat(formData.kg_wt) > stockItem.available_quantity) {
        newErrors.kg_wt = `Insufficient stock. Available: ${stockItem.available_quantity} KG`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data
      const dataToSave = {
        ...formData,
        kg_wt: parseFloat(formData.kg_wt),
        transaction_type: 'material issue',
        created_by: 'admin', // Replace with actual user from context/state
        created_at: new Date().toISOString(),
        issued_date: formData.issued_date
      };
      
      // API call to save material issue
      const response = await axios.post(
        'http://localhost:5000/api/raw-material-log/issue', 
        dataToSave,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setSuccessMessage('Material issued successfully!');
        
        // Reset form after successful submission
        setTimeout(() => {
          resetForm();
          setSuccessMessage('');
          
          // Redirect to main page after 2 seconds
          setTimeout(() => {
            navigate('/production-sections/raw-material');
          }, 2000);
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error issuing material:', error);
      setSuccessMessage('Error issuing material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      gate_pass: '',
      transaction_type: 'material issue',
      wire_size: '',
      category: '',
      shape: '',
      kg_wt: '',
      remarks: '',
      reason: '',
      department: 'Production',
      reference_no: '',
      issued_by: '',
      status: 'active',
      issued_to: '',
      purpose: '',
      production_order_no: '',
      machine_no: '',
      shift: '',
      issued_date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    generateGatePass();
  };

  // Get available quantity for selected material
  const getAvailableQuantity = () => {
    if (formData.wire_size && formData.category) {
      const stockItem = availableStock.find(item => 
        item.wire_size === formData.wire_size && 
        item.category === formData.category
      );
      return stockItem ? stockItem.available_quantity : 0;
    }
    return 0;
  };

  return (
    <div className="form-page-container">
      {/* Header */}
      <div className="form-page-header">
        <button 
          className="back-btn" 
          onClick={() => navigate('/production-sections/raw-material')}
        >
          <FiArrowLeft /> Back to Raw Material
        </button>
        
        <div className="header-content">
          <h1>
            <FiBox /> Material Issue Form
          </h1>
          <p>
            Issue material to production departments
          </p>
        </div>
      </div>

      {/* Success Message */}
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
                <label className="required">Gate Pass Number</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    name="gate_pass"
                    value={formData.gate_pass}
                    onChange={handleChange}
                    placeholder="MI-2024-001"
                    className={errors.gate_pass ? 'error' : ''}
                    readOnly
                  />
                  <button 
                    type="button" 
                    className="btn-small"
                    onClick={generateGatePass}
                  >
                    <FiHash /> Regenerate
                  </button>
                </div>
                {errors.gate_pass && (
                  <div className="error-text">{errors.gate_pass}</div>
                )}
              </div>
              
              <div className="form-group">
                <label className="required">Production Order No.</label>
                <input
                  type="text"
                  name="production_order_no"
                  value={formData.production_order_no}
                  onChange={handleChange}
                  placeholder="PO-2024-001"
                  className={errors.production_order_no ? 'error' : ''}
                />
                {errors.production_order_no && (
                  <div className="error-text">{errors.production_order_no}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="required">Issued Date</label>
                <input
                  type="date"
                  name="issued_date"
                  value={formData.issued_date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label>Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                >
                  <option value="">Select Shift</option>
                  {shiftOptions.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
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
                  <option value="">Select Wire Size</option>
                  {wireSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                {errors.wire_size && (
                  <div className="error-text">{errors.wire_size}</div>
                )}
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
                {errors.category && (
                  <div className="error-text">{errors.category}</div>
                )}
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
                {errors.shape && (
                  <div className="error-text">{errors.shape}</div>
                )}
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
                {errors.kg_wt && (
                  <div className="error-text">{errors.kg_wt}</div>
                )}
                {formData.wire_size && formData.category && (
                  <div className="stock-info">
                    Available: {getAvailableQuantity()} KG
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Issuing Details */}
          <div className="form-section">
            <h3><FiUser /> Issuing Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="required">Issued By</label>
                <input
                  type="text"
                  name="issued_by"
                  value={formData.issued_by}
                  onChange={handleChange}
                  placeholder="Person issuing material"
                  className={errors.issued_by ? 'error' : ''}
                />
                {errors.issued_by && (
                  <div className="error-text">{errors.issued_by}</div>
                )}
              </div>
              
              <div className="form-group">
                <label className="required">Issued To</label>
                <input
                  type="text"
                  name="issued_to"
                  value={formData.issued_to}
                  onChange={handleChange}
                  placeholder="Department/Person receiving material"
                  className={errors.issued_to ? 'error' : ''}
                />
                {errors.issued_to && (
                  <div className="error-text">{errors.issued_to}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="required">Purpose</label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className={errors.purpose ? 'error' : ''}
                >
                  <option value="">Select Purpose</option>
                  {purposeOptions.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
                {errors.purpose && (
                  <div className="error-text">{errors.purpose}</div>
                )}
              </div>
              
              <div className="form-group">
                <label>Machine No.</label>
                <select
                  name="machine_no"
                  value={formData.machine_no}
                  onChange={handleChange}
                >
                  <option value="">Select Machine</option>
                  {machineOptions.map(machine => (
                    <option key={machine} value={machine}>{machine}</option>
                  ))}
                </select>
              </div>
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

          {/* Section 4: Additional Information */}
          <div className="form-section">
            <h3><FiFileText /> Additional Information</h3>
            
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
              <label>Reason for Issue</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Reason for issuing this material..."
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Reference Number (Optional)</label>
              <input
                type="text"
                name="reference_no"
                value={formData.reference_no}
                onChange={handleChange}
                placeholder="Reference number if any"
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
                    Issuing Material...
                  </>
                ) : (
                  <>
                    <FiSave /> Issue Material
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Stock Summary */}
      {availableStock.length > 0 && (
        <div className="stock-summary">
          <h4><FiPackage /> Available Stock Summary</h4>
          <div className="stock-grid">
            {availableStock.slice(0, 5).map(item => (
              <div key={`${item.wire_size}-${item.category}`} className="stock-item">
                <span className="stock-details">
                  {item.wire_size} - {item.category}
                </span>
                <span className="stock-quantity">
                  {item.available_quantity} KG
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialIssueForm;