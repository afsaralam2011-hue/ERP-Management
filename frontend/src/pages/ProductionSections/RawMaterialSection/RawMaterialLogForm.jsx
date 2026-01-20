// ========================================================
// FINAL FORM - SINGLE PERSON COLUMN
// ========================================================
import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { 
  FiSave, FiX, FiPackage, FiCalendar, 
  FiUser, FiHash, FiRefreshCw, FiMessageSquare,
  FiDownload, FiUpload
} from 'react-icons/fi';

const MaterialTransactionForm = ({ onClose, onSaveSuccess }) => {
  // Initial empty state
  const initialFormState = {
    gate_pass: '',
    transaction_type: 'receive', // receive, issue, return
    receiving_date: new Date().toISOString().split('T')[0],
    entry_date: new Date().toISOString().split('T')[0],
    supplier: '',
    person_name: '', // Single column for all person types
    quantity: '',
    wire_size: '',
    category: '',
    shape: '',
    remarks: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle transaction type change
  const handleTransactionTypeChange = (type) => {
    setFormData({
      ...initialFormState,
      transaction_type: type
    });
    setError('');
    setSuccess('');
  };

  // Handle field change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    setError('');
    
    if (!formData.gate_pass.trim()) {
      setError('Gate pass number is required');
      return false;
    }
    
    if (formData.transaction_type === 'receive' && !formData.supplier.trim()) {
      setError('Supplier is required for receiving');
      return false;
    }
    
    if (!formData.person_name.trim()) {
      setError(`${formData.transaction_type === 'receive' ? 'Received by' : 
                formData.transaction_type === 'issue' ? 'Issued by' : 'Returned by'} is required`);
      return false;
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError('Please enter valid quantity');
      return false;
    }
    
    if (!formData.wire_size) {
      setError('Please select wire size');
      return false;
    }
    
    if (!formData.category) {
      setError('Please select category');
      return false;
    }
    
    if (!formData.shape) {
      setError('Please select shape');
      return false;
    }
    
    return true;
  };

  // Save to database
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // SIMPLE DATA - using only existing columns
      const dbData = {
        gate_pass: formData.gate_pass,
        transaction_type: formData.transaction_type,
        wire_size: formData.wire_size,
        category: formData.category,
        shape: formData.shape,
        quantity: parseFloat(formData.quantity),
        remarks: formData.remarks || null,
        receiving_date: formData.receiving_date,
        entry_date: formData.entry_date,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Single column for all person types
        received_by: formData.person_name, // Always use received_by column
        
        // Supplier only for receiving
        supplier: formData.transaction_type === 'receive' ? formData.supplier : null
      };
      
      console.log('Saving data:', dbData);
      
      const { data, error: insertError } = await supabase
        .from('raw_material_log')
        .insert([dbData])
        .select();

      if (insertError) {
        console.error('Database error:', insertError);
        setError('❌ Failed to save: ' + insertError.message);
        throw insertError;
      }
      
      // Success message
      const transactionMessages = {
        'receive': 'Material received successfully!',
        'issue': 'Material issued successfully!',
        'return': 'Material returned successfully!'
      };
      
      setSuccess(`✅ ${transactionMessages[formData.transaction_type]}`);
      
      // COMPLETE RESET AFTER 1 SECOND
      setTimeout(() => {
        // Complete reset
        setFormData({
          ...initialFormState,
          transaction_type: formData.transaction_type
        });
        
        setSuccess('');
        
        if (onSaveSuccess) onSaveSuccess(data[0]);
        
      }, 1000);
      
    } catch (error) {
      console.error('Save error:', error);
      // Error already set above
    } finally {
      setLoading(false);
    }
  };

  // Reset form manually
  const handleReset = () => {
    setFormData({
      ...initialFormState,
      transaction_type: formData.transaction_type
    });
    setError('');
    setSuccess('Form reset successfully!');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Get label based on transaction type
  const getTransactionLabel = () => {
    switch(formData.transaction_type) {
      case 'receive': return 'Receive Material';
      case 'issue': return 'Issue Material';
      case 'return': return 'Return Material';
      default: return 'Material Transaction';
    }
  };

  // Get person label based on transaction type
  const getPersonLabel = () => {
    switch(formData.transaction_type) {
      case 'receive': return 'Received By *';
      case 'issue': return 'Issued By *';
      case 'return': return 'Returned By *';
      default: return 'Person Name *';
    }
  };

  // Get placeholder based on transaction type
  const getPersonPlaceholder = () => {
    switch(formData.transaction_type) {
      case 'receive': return 'Enter receiver name';
      case 'issue': return 'Enter issuer name';
      case 'return': return 'Enter returner name';
      default: return 'Enter person name';
    }
  };

  // Get date label based on transaction type
  const getDateLabel = () => {
    switch(formData.transaction_type) {
      case 'receive': return 'Receiving Date *';
      case 'issue': return 'Issuing Date *';
      case 'return': return 'Return Date *';
      default: return 'Date *';
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '500px',
      margin: '0 auto',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px 12px 0 0',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <FiPackage /> {getTransactionLabel()}
        </h2>
      </div>
      
      {/* Content */}
      <div style={{ padding: '25px' }}>
        <form onSubmit={handleSubmit}>
          
          {/* Success Message */}
          {success && (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              {success}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}
          
          {/* Transaction Type Selector */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              marginBottom: '15px'
            }}>
              {['receive', 'issue', 'return'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTransactionTypeChange(type)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: formData.transaction_type === type ? 
                      (type === 'receive' ? '#2ecc71' : 
                       type === 'issue' ? '#e74c3c' : '#f39c12') : '#ecf0f1',
                    color: formData.transaction_type === type ? 'white' : '#2c3e50',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s'
                  }}
                >
                  {type === 'receive' && <FiDownload />}
                  {type === 'issue' && <FiUpload />}
                  {type === 'return' && <FiRefreshCw />}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Gate Pass */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
              <FiHash /> Gate Pass Number *
            </label>
            <input
              type="text"
              name="gate_pass"
              value={formData.gate_pass}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Enter gate pass number"
              required
              disabled={loading}
            />
          </div>
          
          {/* Date */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
              <FiCalendar /> {getDateLabel()}
            </label>
            <input
              type="date"
              name="receiving_date"
              value={formData.receiving_date}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              required
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          {/* Supplier (Only for receiving) */}
          {formData.transaction_type === 'receive' && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
                Supplier *
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                placeholder="Enter supplier name"
                required
                disabled={loading}
              />
            </div>
          )}
          
          {/* Single Person Name Column */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
              <FiUser /> {getPersonLabel()}
            </label>
            <input
              type="text"
              name="person_name"
              value={formData.person_name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder={getPersonPlaceholder()}
              required
              disabled={loading}
            />
          </div>
          
          {/* Quantity */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Enter quantity"
              step="0.01"
              min="0.01"
              required
              disabled={loading}
            />
          </div>
          
          {/* Wire Size */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
              Wire Size *
            </label>
            <select
              name="wire_size"
              value={formData.wire_size}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                background: 'white',
                color: formData.wire_size ? '#2c3e50' : '#999'
              }}
              required
              disabled={loading}
            >
              <option value="">Select wire size</option>
              <option value="1.20mm">1.20mm</option>
              <option value="1.45mm">1.45mm</option>
              <option value="1.65mm">1.65mm</option>
              <option value="2.00mm">2.00mm</option>
            </select>
          </div>
          
          {/* Category */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                background: 'white',
                color: formData.category ? '#2c3e50' : '#999'
              }}
              required
              disabled={loading}
            >
              <option value="">Select category</option>
              <option value="B2">B2</option>
              <option value="B4">B4</option>
              <option value="GHD">GHD</option>
              <option value="F9">F9</option>
            </select>
          </div>
          
          {/* Shape */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
              Shape *
            </label>
            <select
              name="shape"
              value={formData.shape}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                background: 'white',
                color: formData.shape ? '#2c3e50' : '#999'
              }}
              required
              disabled={loading}
            >
              <option value="">Select shape</option>
              <option value="coil">Coil</option>
              <option value="bobbins">Bobbins</option>
              <option value="sheet">Sheet</option>
              <option value="rod">Rod</option>
            </select>
          </div>
          
          {/* Remarks */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#2c3e50' }}>
              <FiMessageSquare /> Remarks (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Enter any remarks..."
              disabled={loading}
            />
          </div>
          
          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '25px', 
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: '#f39c12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FiRefreshCw /> Reset
              </button>
              
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <FiX /> Cancel
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: formData.transaction_type === 'receive' ? '#2ecc71' : 
                           formData.transaction_type === 'issue' ? '#e74c3c' : '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave /> {formData.transaction_type === 'receive' ? 'Receive' : 
                             formData.transaction_type === 'issue' ? 'Issue' : 'Return'}
                </>
              )}
            </button>
          </div>
        </form>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            input:focus, select:focus, textarea:focus {
              border-color: #3498db !important;
              outline: none !important;
              box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2) !important;
            }
            
            button:disabled {
              opacity: 0.6;
              cursor: not-allowed !important;
            }
            
            button:hover:not(:disabled) {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default MaterialTransactionForm;