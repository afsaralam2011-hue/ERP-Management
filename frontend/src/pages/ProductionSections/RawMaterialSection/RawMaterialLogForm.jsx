// ========================================================
// FILE: RawMaterialLogForm.jsx - FIXED VERSION
// ========================================================

import React, { useState, useEffect } from 'react';
import { 
  FiSave, FiX, FiPackage, FiBox, FiRefreshCw,
  FiUser, FiClipboard, FiSettings, FiCheck, 
  FiAlertCircle, FiDatabase, FiTool, FiFileText
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const RawMaterialLogForm = ({ onClose, editData, isModal = true }) => {
  // ========================================================
  // STATE - SIMPLIFIED
  // ========================================================
  const [formData, setFormData] = useState({
    gate_pass: '',
    transaction_type: 'receive',
    wire_size: '1.20mm',
    category: 'B4',
    shape: 'coil_form',
    weight: '',
    remarks: '',
    department: 'Production',
    reference_no: '',
    received_by: '',
    issued_by: '',
    returned_by: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ========================================================
  // INITIALIZE FORM
  // ========================================================
  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      // Auto-generate gate pass on load
      generateGatePass();
    }
  }, [editData]);

  // ========================================================
  // SIMPLE GATE PASS GENERATOR
  // ========================================================
  const generateGatePass = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const gatePass = `GP-${year}${month}${day}-${random}`;
    
    setFormData(prev => ({ ...prev, gate_pass: gatePass }));
  };

  // ========================================================
  // HANDLE INPUT CHANGE - SIMPLE
  // ========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ========================================================
  // VALIDATION - SIMPLE
  // ========================================================
  const validateForm = () => {
    if (!formData.gate_pass.trim()) {
      setError('گیٹ پاس نمبر درج کریں');
      return false;
    }
    
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      setError('وزن درج کریں (0 سے زیادہ)');
      return false;
    }
    
    // Check person based on transaction type
    const personField = formData.transaction_type === 'receive' ? 'received_by' :
                       formData.transaction_type === 'issue' ? 'issued_by' : 'returned_by';
    
    if (!formData[personField]?.trim()) {
      setError('ذمہ دار شخص کا نام درج کریں');
      return false;
    }
    
    return true;
  };

  // ========================================================
  // SAVE TO DATABASE - SIMPLE
  // ========================================================
  const saveToDatabase = async () => {
    try {
      setLoading(true);
      setError('');
      
      const dbData = {
        gate_pass: formData.gate_pass,
        transaction_type: formData.transaction_type,
        wire_size: formData.wire_size,
        category: formData.category,
        shape: formData.shape,
        weight: parseFloat(formData.weight),
        remarks: formData.remarks,
        department: formData.department,
        reference_no: formData.reference_no,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add person field
      if (formData.transaction_type === 'receive') dbData.received_by = formData.received_by;
      if (formData.transaction_type === 'issue') dbData.issued_by = formData.issued_by;
      if (formData.transaction_type === 'return') dbData.returned_by = formData.returned_by;
      
      // Save to Supabase
      const { error: insertError } = await supabase
        .from('raw_material_log')
        .insert([dbData]);
      
      if (insertError) throw insertError;
      
      setSuccess('ڈیٹا محفوظ ہو گیا!');
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Save error:', error);
      setError('محفوظ کرنے میں خرابی: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // FORM SUBMIT
  // ========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await saveToDatabase();
  };

  // ========================================================
  // RESET FORM
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
      department: 'Production',
      reference_no: '',
      received_by: '',
      issued_by: '',
      returned_by: ''
    });
    setError('');
    setSuccess('');
    generateGatePass();
  };

  // ========================================================
  // OPTIONS
  // ========================================================
  const wireSizes = ['1.20mm', '1.50mm', '2.00mm', '2.50mm', '3.00mm', '3.50mm', '4.00mm', '4.50mm', '5.00mm'];
  const categories = ['B4', 'B6', 'B8', 'B10', 'B12', 'B14', 'B16'];
  const shapes = ['coil_form', 'bobbins_form', 'sheet_form', 'rod_form'];
  const departments = ['Production', 'Warehouse', 'Flattening', 'Spiral', 'PVC Coating', 'Cutting & Packing'];

  // ========================================================
  // SIMPLE CSS STYLES (Add to your CSS file or style tag)
  // ========================================================
  const styles = `
    .simple-form-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .simple-form-container {
      background: white;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    
    .simple-form-header {
      background: #1e40af;
      color: white;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 10px 10px 0 0;
    }
    
    .simple-form-title {
      font-size: 18px;
      font-weight: bold;
      margin: 0;
    }
    
    .simple-form-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
    
    .simple-form-content {
      padding: 20px;
    }
    
    .simple-form-group {
      margin-bottom: 15px;
    }
    
    .simple-form-label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }
    
    .simple-form-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }
    
    .simple-form-select {
      width: 100%;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 5px;
      font-size: 14px;
      background: white;
    }
    
    .simple-form-row {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .simple-form-row > div {
      flex: 1;
    }
    
    .simple-form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    
    .simple-form-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
    
    .simple-form-btn-primary {
      background: #1e40af;
      color: white;
    }
    
    .simple-form-btn-secondary {
      background: #6b7280;
      color: white;
    }
    
    .simple-form-btn-danger {
      background: #dc2626;
      color: white;
    }
    
    .simple-message {
      padding: 10px;
      margin: 10px 20px;
      border-radius: 5px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .simple-message-success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    
    .simple-message-error {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    
    .transaction-type-container {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .transaction-btn-simple {
      flex: 1;
      padding: 12px;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      font-size: 13px;
    }
    
    .transaction-btn-simple.active {
      border-color: #1e40af;
      background: #eff6ff;
    }
    
    @media (max-width: 768px) {
      .simple-form-container {
        width: 95%;
      }
      
      .simple-form-row {
        flex-direction: column;
        gap: 10px;
      }
      
      .transaction-type-container {
        flex-direction: column;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="simple-form-modal" onClick={onClose}>
        <div className="simple-form-container" onClick={(e) => e.stopPropagation()}>
          
          {/* HEADER */}
          <div className="simple-form-header">
            <h2 className="simple-form-title">
              خام مال کی انٹری
            </h2>
            <button className="simple-form-close" onClick={onClose}>
              <FiX />
            </button>
          </div>
          
          {/* MESSAGES */}
          {success && (
            <div className="simple-message simple-message-success">
              <FiCheck /> {success}
            </div>
          )}
          
          {error && (
            <div className="simple-message simple-message-error">
              <FiAlertCircle /> {error}
            </div>
          )}
          
          {/* FORM CONTENT */}
          <div className="simple-form-content">
            <form onSubmit={handleSubmit}>
              
              {/* TRANSACTION TYPE */}
              <div className="simple-form-group">
                <label className="simple-form-label">ٹرانزیکشن کی قسم</label>
                <div className="transaction-type-container">
                  <button
                    type="button"
                    className={`transaction-btn-simple ${formData.transaction_type === 'receive' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, transaction_type: 'receive'})}
                  >
                    <FiPackage size={20} />
                    وصولی
                  </button>
                  
                  <button
                    type="button"
                    className={`transaction-btn-simple ${formData.transaction_type === 'issue' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, transaction_type: 'issue'})}
                  >
                    <FiBox size={20} />
                    جاری
                  </button>
                  
                  <button
                    type="button"
                    className={`transaction-btn-simple ${formData.transaction_type === 'return' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, transaction_type: 'return'})}
                  >
                    <FiPackage size={20} />
                    واپسی
                  </button>
                </div>
              </div>
              
              {/* GATE PASS & REFERENCE */}
              <div className="simple-form-row">
                <div className="simple-form-group">
                  <label className="simple-form-label">گیٹ پاس نمبر *</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      name="gate_pass"
                      value={formData.gate_pass}
                      onChange={handleChange}
                      className="simple-form-input"
                      placeholder="GP-2024001"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={generateGatePass}
                      className="simple-form-btn simple-form-btn-secondary"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <FiRefreshCw /> نیا نمبر
                    </button>
                  </div>
                </div>
                
                <div className="simple-form-group">
                  <label className="simple-form-label">ریفرینس نمبر</label>
                  <input
                    type="text"
                    name="reference_no"
                    value={formData.reference_no}
                    onChange={handleChange}
                    className="simple-form-input"
                    placeholder="PO-2024001"
                  />
                </div>
              </div>
              
              {/* MATERIAL DETAILS */}
              <div className="simple-form-group">
                <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>
                  <FiTool /> مال کی تفصیلات
                </h4>
                
                <div className="simple-form-row">
                  <div className="simple-form-group">
                    <label className="simple-form-label">تار کا سائز *</label>
                    <select
                      name="wire_size"
                      value={formData.wire_size}
                      onChange={handleChange}
                      className="simple-form-select"
                      required
                    >
                      {wireSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="simple-form-group">
                    <label className="simple-form-label">قسم *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="simple-form-select"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="simple-form-row">
                  <div className="simple-form-group">
                    <label className="simple-form-label">شکل *</label>
                    <select
                      name="shape"
                      value={formData.shape}
                      onChange={handleChange}
                      className="simple-form-select"
                      required
                    >
                      {shapes.map(shape => (
                        <option key={shape} value={shape}>
                          {shape.replace('_form', '').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="simple-form-group">
                    <label className="simple-form-label">وزن (KG) *</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="simple-form-input"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* DEPARTMENT & PERSON */}
              <div className="simple-form-row">
                <div className="simple-form-group">
                  <label className="simple-form-label">محکمہ</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="simple-form-select"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div className="simple-form-group">
                  <label className="simple-form-label">
                    {formData.transaction_type === 'receive' ? 'وصول کنندہ' : 
                     formData.transaction_type === 'issue' ? 'جاری کنندہ' : 'واپس کنندہ'} *
                  </label>
                  <input
                    type="text"
                    name={formData.transaction_type === 'receive' ? 'received_by' : 
                          formData.transaction_type === 'issue' ? 'issued_by' : 'returned_by'}
                    value={formData.transaction_type === 'receive' ? formData.received_by : 
                          formData.transaction_type === 'issue' ? formData.issued_by : formData.returned_by}
                    onChange={handleChange}
                    className="simple-form-input"
                    placeholder="نام درج کریں"
                    required
                  />
                </div>
              </div>
              
              {/* REMARKS */}
              <div className="simple-form-group">
                <label className="simple-form-label">
                  <FiClipboard /> ریمارکس
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  className="simple-form-input"
                  placeholder="اضافی معلومات..."
                  rows="3"
                  style={{ resize: 'vertical' }}
                />
              </div>
              
              {/* FORM ACTIONS */}
              <div className="simple-form-actions">
                <button
                  type="button"
                  onClick={handleReset}
                  className="simple-form-btn simple-form-btn-secondary"
                >
                  <FiSettings /> صاف کریں
                </button>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="simple-form-btn simple-form-btn-danger"
                  >
                    <FiX /> منسوخ
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="simple-form-btn simple-form-btn-primary"
                  >
                    {loading ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid white',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        محفوظ ہو رہا ہے...
                      </>
                    ) : (
                      <>
                        <FiSave /> محفوظ کریں
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default RawMaterialLogForm;