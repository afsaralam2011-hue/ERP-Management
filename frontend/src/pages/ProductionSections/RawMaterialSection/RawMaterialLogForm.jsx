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
    switch (formData.transaction_type) {
      case 'receive': return 'Receive Material';
      case 'issue': return 'Issue Material';
      case 'return': return 'Return Material';
      default: return 'Material Transaction';
    }
  };

  // Get person label based on transaction type
  const getPersonLabel = () => {
    switch (formData.transaction_type) {
      case 'receive': return 'Received By *';
      case 'issue': return 'Issued By *';
      case 'return': return 'Returned By *';
      default: return 'Person Name *';
    }
  };

  // Get placeholder based on transaction type
  const getPersonPlaceholder = () => {
    switch (formData.transaction_type) {
      case 'receive': return 'Enter receiver name';
      case 'issue': return 'Enter issuer name';
      case 'return': return 'Enter returner name';
      default: return 'Enter person name';
    }
  };

  // Get date label based on transaction type
  const getDateLabel = () => {
    switch (formData.transaction_type) {
      case 'receive': return 'Receiving Date *';
      case 'issue': return 'Issuing Date *';
      case 'return': return 'Return Date *';
      default: return 'Date *';
    }
  };

  return (
    <div className="bg-white rounded-xl container mx-auto shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-t-xl text-center">
        <h2 className="m-0 text-xl flex items-center justify-center gap-2">
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
          <div className="mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {['receive', 'issue', 'return'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTransactionTypeChange(type)}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all duration-300
                    ${formData.transaction_type === type
                      ? (type === 'receive' ? 'bg-green-500 text-white' : type === 'issue' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white')
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {type === 'receive' && <FiDownload />}
                  {type === 'issue' && <FiUpload />}
                  {type === 'return' && <FiRefreshCw />}
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gate Pass */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
              <FiHash /> Gate Pass Number *
            </label>
            <input
              type="text"
              name="gate_pass"
              value={formData.gate_pass}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter gate pass number"
              required
              disabled={loading}
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
              <FiCalendar /> {getDateLabel()}
            </label>
            <input
              type="date"
              name="receiving_date"
              value={formData.receiving_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
              disabled={loading}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Supplier (Only for receiving) */}
          {formData.transaction_type === 'receive' && (
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">
                Supplier *
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter supplier name"
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Single Person Name Column */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
              <FiUser /> {getPersonLabel()}
            </label>
            <input
              type="text"
              name="person_name"
              value={formData.person_name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder={getPersonPlaceholder()}
              required
              disabled={loading}
            />
          </div>

          {/* Quantity */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter quantity"
              step="0.01"
              min="0.01"
              required
              disabled={loading}
            />
          </div>

          {/* Wire Size */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">
              Wire Size *
            </label>
            <select
              name="wire_size"
              value={formData.wire_size}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${!formData.wire_size && 'text-gray-400'}`}
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
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${!formData.category && 'text-gray-400'}`}
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
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">
              Shape *
            </label>
            <select
              name="shape"
              value={formData.shape}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${!formData.shape && 'text-gray-400'}`}
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
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700 flex items-center gap-2">
              <FiMessageSquare /> Remarks (Optional)
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[80px] resize-y"
              placeholder="Enter any remarks..."
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-between">
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 sm:flex-none py-2.5 px-5 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                <FiRefreshCw /> Reset
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 sm:flex-none py-2.5 px-5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  <FiX /> Cancel
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full sm:w-auto py-2.5 px-5 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-all
                ${formData.transaction_type === 'receive' ? 'bg-green-500 hover:bg-green-600' :
                  formData.transaction_type === 'issue' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}
              `}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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