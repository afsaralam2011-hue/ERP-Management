// ========================================================
// FILE: RawMaterialLogForm.jsx
// ========================================================

import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSave, FiX, FiPackage, FiBox, FiRefreshCw,
  FiClipboard, FiSettings, FiCheck, 
  FiAlertCircle, FiTool, FiUpload,
  FiCamera, FiImage, FiHash, FiSend
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const RawMaterialLogForm = ({ onClose, editData, isModal = true, onSaveSuccess }) => {
  // ========================================================
  // STATE
  // ========================================================
  const initialFormState = {
    gate_pass: '',
    transaction_type: 'receive',
    wire_size: '1.20mm',
    category: 'B4',
    shape: 'coil',
    weight: '',
    quantity: '',
    remarks: '',
    department: 'Production',
    reference_no: '',
    received_by: '',
    issued_by: '',
    returned_by: '',
    image_url: '',
    batch_no: '',
    supplier: '',
    contact_person: '',
    contact_number: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savedData, setSavedData] = useState(null);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const formRef = useRef(null);

  // ========================================================
  // INITIALIZE FORM
  // ========================================================
  useEffect(() => {
    if (editData) {
      setFormData(editData);
      if (editData.image_url) {
        setImagePreview(editData.image_url);
      }
    } else {
      resetForm();
    }
  }, [editData]);

  // ========================================================
  // GENERATE GATE PASS
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
  // GENERATE BATCH NUMBER
  // ========================================================
  const generateBatchNo = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const batchNo = `BATCH-${year}${month}-${random}`;
    
    setFormData(prev => ({ ...prev, batch_no: batchNo }));
  };

  // ========================================================
  // RESET FORM COMPLETELY
  // ========================================================
  const resetForm = () => {
    const currentTransactionType = formData.transaction_type || 'receive';
    
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newGatePass = `GP-${year}${month}${day}-${random}`;
    const newBatchNo = `BATCH-${year.toString().slice(-2)}${month}-${random}`;
    
    setFormData({
      ...initialFormState,
      gate_pass: newGatePass,
      transaction_type: currentTransactionType,
      batch_no: newBatchNo
    });
    
    setImagePreview(null);
    setError('');
    setSuccess('');
    setSavedData(null);
    setWhatsappSent(false);
    
    // Reset form fields manually
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  // ========================================================
  // IMAGE UPLOAD HANDLER
  // ========================================================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, JPG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.gate_pass || 'temp'}-${Date.now()}.${fileExt}`;
      const filePath = `gate-passes/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('raw-material')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('raw-material')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setSuccess('Image uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // ========================================================
  // SEND WHATSAPP MESSAGE
  // ========================================================
  const sendWhatsAppMessage = () => {
    if (!savedData) return;

    const {
      gate_pass,
      transaction_type,
      wire_size,
      category,
      shape,
      weight,
      quantity,
      department,
      reference_no,
      batch_no,
      supplier,
      received_by,
      issued_by,
      returned_by
    } = savedData;

    // Determine person based on transaction type
    const person = transaction_type === 'receive' ? received_by : 
                   transaction_type === 'issue' ? issued_by : returned_by;

    // Format the message
    const message = `
📦 *RAW MATERIAL TRANSACTION*
────────────────────
🎯 *Transaction Type:* ${transaction_type.toUpperCase()}
📋 *Gate Pass:* ${gate_pass}
🏷️ *Batch No:* ${batch_no}
🔗 *Reference:* ${reference_no}

⚙️ *MATERIAL DETAILS*
• Wire Size: ${wire_size}
• Category: ${category}
• Shape: ${shape}
• Weight: ${weight} KG
${quantity ? `• Quantity: ${quantity} ${shape === 'bobbins' ? 'pieces' : 'coils'}\n` : ''}

🏭 *DEPARTMENT*
• ${department}
${supplier ? `• Supplier: ${supplier}\n` : ''}

👤 *RESPONSIBLE PERSON*
• ${person}

⏰ *Timestamp:* ${new Date().toLocaleString()}
────────────────────
✅ *Transaction Completed Successfully*
    `.trim();

    // Create WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    setWhatsappSent(true);
    setSuccess('WhatsApp message opened successfully!');
  };

  // ========================================================
  // VALIDATION
  // ========================================================
  const validateForm = () => {
    // Clear previous errors
    setError('');

    if (!formData.gate_pass.trim()) {
      setError('Please enter gate pass number');
      return false;
    }
    
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      setError('Please enter weight (greater than 0)');
      return false;
    }

    // Validate quantity based on shape
    if ((formData.shape === 'bobbins' || formData.shape === 'coil') && 
        (!formData.quantity || parseInt(formData.quantity) <= 0)) {
      setError(`Please enter number of ${formData.shape === 'bobbins' ? 'pieces' : 'coils'}`);
      return false;
    }
    
    // Check person based on transaction type
    const personField = formData.transaction_type === 'receive' ? 'received_by' :
                       formData.transaction_type === 'issue' ? 'issued_by' : 'returned_by';
    
    if (!formData[personField]?.trim()) {
      setError('Please enter responsible person name');
      return false;
    }
    
    return true;
  };

  // ========================================================
  // SAVE TO DATABASE
  // ========================================================
  const saveToDatabase = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Prepare data for database
      const dbData = {
        gate_pass: formData.gate_pass,
        transaction_type: formData.transaction_type,
        wire_size: formData.wire_size,
        category: formData.category,
        shape: formData.shape,
        weight: parseFloat(formData.weight),
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        remarks: formData.remarks,
        department: formData.department,
        reference_no: formData.reference_no,
        batch_no: formData.batch_no,
        supplier: formData.supplier,
        contact_person: formData.contact_person,
        contact_number: formData.contact_number,
        image_url: formData.image_url,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add person field based on transaction type
      if (formData.transaction_type === 'receive') {
        dbData.received_by = formData.received_by;
      } else if (formData.transaction_type === 'issue') {
        dbData.issued_by = formData.issued_by;
      } else {
        dbData.returned_by = formData.returned_by;
      }
      
      // Save to Supabase
      const { data, error: insertError } = await supabase
        .from('raw_material_log')
        .insert([dbData])
        .select();

      if (insertError) throw insertError;
      
      // Store saved data for WhatsApp
      setSavedData(dbData);
      
      // Show success message
      setSuccess('✅ Data saved successfully! Form will reset in 2 seconds...');
      
      // Reset form after successful save
      setTimeout(() => {
        resetForm();
        
        // Send WhatsApp automatically
        setTimeout(() => {
          sendWhatsAppMessage();
        }, 500);
        
      }, 2000);
      
      // Call success callback if provided
      if (onSaveSuccess && data && data[0]) {
        onSaveSuccess(data[0]);
      }
      
    } catch (error) {
      console.error('Save error:', error);
      setError('❌ Save error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // HANDLE INPUT CHANGE
  // ========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'shape') {
      // Reset quantity when shape changes
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        quantity: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
  // OPTIONS
  // ========================================================
  const wireSizes = ['1.20mm', '1.45mm', '1.65mm', '2.00mm', '1.40mm', '1.25mm', '1.10mm'];
  const categories = ['B2', 'B4', 'GHD', 'F9', 'B12', 'B14', 'B16'];
  const shapes = ['coil', 'bobbins', 'sheet', 'rod'];
  const departments = ['Production', 'Warehouse', 'Flattening', 'Quality', 'Dispatch'];
  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Local Vendor'];

  // ========================================================
  // RENDER
  // ========================================================
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          
          .rm-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
            animation: fadeIn 0.3s ease-out;
          }
          
          .rm-modal-container {
            background: white;
            width: 100%;
            max-width: 750px;
            max-height: 95vh;
            overflow-y: auto;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: slideIn 0.4s ease-out;
          }
          
          .rm-modal-header {
            background: linear-gradient(135deg, #3498db, #2c3e50);
            color: white;
            padding: 24px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 16px 16px 0 0;
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .rm-modal-title {
            font-size: 22px;
            font-weight: 600;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .rm-modal-close {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 18px;
          }
          
          .rm-modal-close:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: rotate(90deg);
            border-color: white;
          }
          
          .rm-modal-content {
            padding: 30px;
            background: #f8fafc;
          }
          
          .rm-form-section {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
          }
          
          .rm-form-group {
            margin-bottom: 20px;
          }
          
          .rm-form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .rm-form-label.required::after {
            content: '*';
            color: #e74c3c;
            margin-left: 4px;
            font-weight: bold;
          }
          
          .rm-form-input, .rm-form-select, .rm-form-textarea {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 15px;
            font-family: inherit;
            transition: all 0.3s;
            background: white;
            color: #1f2937;
          }
          
          .rm-form-input:focus, .rm-form-select:focus, .rm-form-textarea:focus {
            border-color: #3498db;
            outline: none;
            box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.15);
            transform: translateY(-1px);
          }
          
          .rm-form-input::placeholder {
            color: #9ca3af;
          }
          
          .rm-form-textarea {
            resize: vertical;
            min-height: 100px;
          }
          
          .rm-form-row {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .rm-form-row > div {
            flex: 1;
          }
          
          .rm-transaction-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 25px;
          }
          
          .rm-transaction-card {
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px 15px;
            background: white;
            cursor: pointer;
            text-align: center;
            transition: all 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          
          .rm-transaction-card:hover {
            border-color: #3498db;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(52, 152, 219, 0.2);
          }
          
          .rm-transaction-card.active {
            border-color: #3498db;
            background: linear-gradient(135deg, #e6f7ff, #f0f8ff);
            color: #3498db;
            font-weight: 600;
            box-shadow: 0 6px 18px rgba(52, 152, 219, 0.25);
          }
          
          .rm-transaction-icon {
            font-size: 28px;
            color: inherit;
          }
          
          .rm-image-section {
            border: 3px dashed #d1d5db;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin-bottom: 25px;
            transition: all 0.3s;
            background: #fafafa;
            min-height: 200px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          
          .rm-image-section:hover {
            border-color: #3498db;
            background: #f0f8ff;
          }
          
          .rm-image-preview-container {
            position: relative;
            display: inline-block;
            margin-bottom: 20px;
          }
          
          .rm-image-preview {
            max-width: 250px;
            max-height: 250px;
            border-radius: 12px;
            border: 2px solid #e5e7eb;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
            object-fit: cover;
          }
          
          .rm-image-remove {
            position: absolute;
            top: -12px;
            right: -12px;
            background: #e74c3c;
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          
          .rm-image-remove:hover {
            background: #c0392b;
            transform: scale(1.15);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
          }
          
          .rm-image-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;
          }
          
          .rm-btn {
            padding: 14px 28px;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s;
            font-family: inherit;
            min-width: 140px;
            justify-content: center;
          }
          
          .rm-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
          }
          
          .rm-btn-primary {
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
          }
          
          .rm-btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, #27ae60, #219653);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(46, 204, 113, 0.4);
          }
          
          .rm-btn-whatsapp {
            background: linear-gradient(135deg, #25D366, #128C7E);
            color: white;
            box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
          }
          
          .rm-btn-whatsapp:hover:not(:disabled) {
            background: linear-gradient(135deg, #128C7E, #075E54);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(37, 211, 102, 0.4);
          }
          
          .rm-btn-secondary {
            background: linear-gradient(135deg, #34495e, #2c3e50);
            color: white;
            box-shadow: 0 4px 12px rgba(52, 73, 94, 0.3);
          }
          
          .rm-btn-secondary:hover {
            background: linear-gradient(135deg, #2c3e50, #1c2833);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(52, 73, 94, 0.4);
          }
          
          .rm-btn-outline {
            background: white;
            border: 2px solid #3498db;
            color: #3498db;
            box-shadow: 0 4px 12px rgba(52, 152, 219, 0.1);
          }
          
          .rm-btn-outline:hover {
            background: #f0f8ff;
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(52, 152, 219, 0.2);
          }
          
          .rm-btn-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
          }
          
          .rm-btn-danger:hover {
            background: linear-gradient(135deg, #c0392b, #a93226);
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(231, 76, 60, 0.4);
          }
          
          .rm-form-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 35px;
            padding-top: 25px;
            border-top: 2px solid #e5e7eb;
            gap: 20px;
          }
          
          .rm-section-title {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin: 0 0 20px 0;
            padding-bottom: 12px;
            border-bottom: 3px solid #3498db;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .rm-message {
            padding: 16px 20px;
            margin: 0 30px 20px;
            border-radius: 12px;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: fadeIn 0.3s ease-out;
          }
          
          .rm-message-success {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
            border: 2px solid #6ee7b7;
            box-shadow: 0 4px 12px rgba(110, 231, 183, 0.2);
          }
          
          .rm-message-error {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #991b1b;
            border: 2px solid #fca5a5;
            box-shadow: 0 4px 12px rgba(252, 165, 165, 0.2);
          }
          
          .rm-message-info {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1e40af;
            border: 2px solid #93c5fd;
            box-shadow: 0 4px 12px rgba(147, 197, 253, 0.2);
          }
          
          .rm-spinner {
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          .whatsapp-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 15px;
            background: #d1fae5;
            color: #065f46;
            border-radius: 8px;
            font-size: 14px;
            animation: fadeIn 0.5s ease-out;
          }
          
          .form-success-animation {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            animation: fadeIn 0.5s ease-out;
          }
          
          .success-icon {
            font-size: 60px;
            color: #2ecc71;
            margin-bottom: 20px;
            animation: bounce 1s infinite alternate;
          }
          
          @keyframes bounce {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
          }
          
          @media (max-width: 768px) {
            .rm-modal-overlay {
              padding: 10px;
            }
            
            .rm-modal-container {
              max-height: 100vh;
              border-radius: 12px;
            }
            
            .rm-modal-header {
              padding: 20px;
            }
            
            .rm-modal-content {
              padding: 20px;
            }
            
            .rm-form-row {
              flex-direction: column;
              gap: 15px;
            }
            
            .rm-transaction-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }
            
            .rm-form-actions {
              flex-direction: column;
              gap: 15px;
            }
            
            .rm-btn {
              width: 100%;
            }
            
            .rm-image-buttons {
              flex-direction: column;
              align-items: center;
            }
            
            .rm-image-preview {
              max-width: 200px;
              max-height: 200px;
            }
            
            .rm-form-section {
              padding: 20px;
            }
          }
        `}
      </style>
      
      <div className="rm-modal-overlay">
        <div className="rm-modal-container">
          
          {/* HEADER */}
          <div className="rm-modal-header">
            <h2 className="rm-modal-title">
              <FiPackage /> Raw Material Transaction Form
            </h2>
            <button 
              className="rm-modal-close" 
              onClick={onClose}
              aria-label="Close"
              type="button"
              disabled={loading}
            >
              <FiX />
            </button>
          </div>
          
          {/* MESSAGES */}
          {success && (
            <div className="rm-message rm-message-success">
              <FiCheck /> {success}
            </div>
          )}
          
          {error && (
            <div className="rm-message rm-message-error">
              <FiAlertCircle /> {error}
            </div>
          )}
          
          {whatsappSent && (
            <div className="rm-message rm-message-info">
              <FiSend /> WhatsApp message sent successfully!
            </div>
          )}
          
          {/* FORM CONTENT */}
          <div className="rm-modal-content">
            <form ref={formRef} onSubmit={handleSubmit}>
              
              {/* TRANSACTION TYPE SECTION */}
              <div className="rm-form-section">
                <h3 className="rm-section-title">Transaction Type</h3>
                <div className="rm-transaction-grid">
                  <button
                    type="button"
                    className={`rm-transaction-card ${formData.transaction_type === 'receive' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, transaction_type: 'receive'})}
                  >
                    <FiPackage className="rm-transaction-icon" />
                    <span className="rm-transaction-label">Receive</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`rm-transaction-card ${formData.transaction_type === 'issue' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, transaction_type: 'issue'})}
                  >
                    <FiBox className="rm-transaction-icon" />
                    <span className="rm-transaction-label">Issue</span>
                  </button>
                  
                  <button
                    type="button"
                    className={`rm-transaction-card ${formData.transaction_type === 'return' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, transaction_type: 'return'})}
                  >
                    <FiRefreshCw className="rm-transaction-icon" />
                    <span className="rm-transaction-label">Return</span>
                  </button>
                </div>
              </div>
              
              {/* DOCUMENT DETAILS SECTION */}
              <div className="rm-form-section">
                <h3 className="rm-section-title">
                  <FiClipboard /> Document Details
                </h3>
                
                <div className="rm-form-row">
                  <div className="rm-form-group">
                    <label className="rm-form-label required">
                      <FiHash /> Gate Pass Number
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        name="gate_pass"
                        value={formData.gate_pass}
                        onChange={handleChange}
                        className="rm-form-input"
                        placeholder="GP-2024001"
                        required
                        disabled={loading}
                      />
                      <button 
                        type="button" 
                        onClick={generateGatePass}
                        className="rm-btn rm-btn-outline"
                        style={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
                        disabled={loading}
                      >
                        <FiRefreshCw />
                      </button>
                    </div>
                  </div>
                  
                  <div className="rm-form-group">
                    <label className="rm-form-label">
                      <FiHash /> Batch Number
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        name="batch_no"
                        value={formData.batch_no}
                        onChange={handleChange}
                        className="rm-form-input"
                        placeholder="BATCH-2401-001"
                        disabled={loading}
                      />
                      <button 
                        type="button" 
                        onClick={generateBatchNo}
                        className="rm-btn rm-btn-outline"
                        style={{ whiteSpace: 'nowrap', minWidth: 'auto' }}
                        disabled={loading}
                      >
                        <FiHash />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="rm-form-row">
                  <div className="rm-form-group">
                    <label className="rm-form-label">Reference Number</label>
                    <input
                      type="text"
                      name="reference_no"
                      value={formData.reference_no}
                      onChange={handleChange}
                      className="rm-form-input"
                      placeholder="PO-2024001"
                      disabled={loading}
                    />
                  </div>
                  
                  {formData.transaction_type === 'receive' && (
                    <div className="rm-form-group">
                      <label className="rm-form-label">Supplier</label>
                      <select
                        name="supplier"
                        value={formData.supplier}
                        onChange={handleChange}
                        className="rm-form-select"
                        disabled={loading}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier} value={supplier}>{supplier}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              {/* MATERIAL SPECIFICATIONS SECTION */}
              <div className="rm-form-section">
                <h3 className="rm-section-title">
                  <FiTool /> Material Specifications
                </h3>
                
                <div className="rm-form-row">
                  <div className="rm-form-group">
                    <label className="rm-form-label required">Wire Size</label>
                    <select
                      name="wire_size"
                      value={formData.wire_size}
                      onChange={handleChange}
                      className="rm-form-select"
                      required
                      disabled={loading}
                    >
                      {wireSizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="rm-form-group">
                    <label className="rm-form-label required">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="rm-form-select"
                      required
                      disabled={loading}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="rm-form-row">
                  <div className="rm-form-group">
                    <label className="rm-form-label required">Shape</label>
                    <select
                      name="shape"
                      value={formData.shape}
                      onChange={handleChange}
                      className="rm-form-select"
                      required
                      disabled={loading}
                    >
                      {shapes.map(shape => (
                        <option key={shape} value={shape}>
                          {shape.charAt(0).toUpperCase() + shape.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="rm-form-group">
                    <label className="rm-form-label required">Weight (KG)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="rm-form-input"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                {/* QUANTITY BASED ON SHAPE */}
                {(formData.shape === 'bobbins' || formData.shape === 'coil') && (
                  <div className="rm-form-group">
                    <label className="rm-form-label required">
                      Number of {formData.shape === 'bobbins' ? 'Pieces' : 'Coils'}
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="rm-form-input"
                      placeholder={`Enter number of ${formData.shape}`}
                      min="1"
                      required
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
              
              {/* TRANSACTION DETAILS SECTION */}
              <div className="rm-form-section">
                <h3 className="rm-section-title">
                  <FiSettings /> Transaction Details
                </h3>
                
                <div className="rm-form-row">
                  <div className="rm-form-group">
                    <label className="rm-form-label">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="rm-form-select"
                      disabled={loading}
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="rm-form-group">
                    <label className="rm-form-label required">
                      {formData.transaction_type === 'receive' ? 'Received By' : 
                       formData.transaction_type === 'issue' ? 'Issued By' : 'Returned By'}
                    </label>
                    <input
                      type="text"
                      name={formData.transaction_type === 'receive' ? 'received_by' : 
                            formData.transaction_type === 'issue' ? 'issued_by' : 'returned_by'}
                      value={formData.transaction_type === 'receive' ? formData.received_by : 
                            formData.transaction_type === 'issue' ? formData.issued_by : formData.returned_by}
                      onChange={handleChange}
                      className="rm-form-input"
                      placeholder="Enter full name"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="rm-form-row">
                  <div className="rm-form-group">
                    <label className="rm-form-label">Contact Person</label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                      className="rm-form-input"
                      placeholder="Contact person name"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="rm-form-group">
                    <label className="rm-form-label">Contact Number</label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleChange}
                      className="rm-form-input"
                      placeholder="+92 300 1234567"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              
              {/* GATE PASS IMAGE SECTION */}
              <div className="rm-form-section">
                <h3 className="rm-section-title">
                  <FiImage /> Gate Pass Image
                </h3>
                
                <div className="rm-image-section">
                  {imagePreview ? (
                    <>
                      <div className="rm-image-preview-container">
                        <img 
                          src={imagePreview} 
                          alt="Gate Pass Preview" 
                          className="rm-image-preview"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image_url: '' }));
                          }}
                          className="rm-image-remove"
                          disabled={loading}
                        >
                          <FiX />
                        </button>
                      </div>
                      <div className="rm-image-buttons">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="rm-btn rm-btn-outline"
                          disabled={loading || uploading}
                        >
                          <FiUpload /> Change Image
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <FiImage size={48} color="#9ca3af" style={{ marginBottom: '20px' }} />
                      <p style={{ marginBottom: '20px', color: '#6b7280' }}>
                        Upload gate pass image for reference (Max 5MB)
                      </p>
                      <div className="rm-image-buttons">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="rm-btn rm-btn-primary"
                          disabled={loading || uploading}
                        >
                          <FiUpload /> Upload Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                              fileInputRef.current.click();
                            } else {
                              alert('Camera access not available in this browser');
                            }
                          }}
                          className="rm-btn rm-btn-secondary"
                          disabled={loading || uploading}
                        >
                          <FiCamera /> Take Photo
                        </button>
                      </div>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                  />
                  {uploading && (
                    <div style={{ marginTop: '15px', color: '#3498db', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="rm-spinner" style={{ borderTopColor: '#3498db', borderColor: 'rgba(52, 152, 219, 0.3)' }}></div>
                      Uploading image...
                    </div>
                  )}
                </div>
              </div>
              
              {/* REMARKS SECTION */}
              <div className="rm-form-section">
                <div className="rm-form-group">
                  <label className="rm-form-label">
                    <FiClipboard /> Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    className="rm-form-textarea"
                    placeholder="Add any additional information or notes..."
                    rows="4"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* FORM ACTIONS */}
              <div className="rm-form-actions">
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rm-btn rm-btn-secondary"
                    disabled={loading}
                  >
                    <FiSettings /> Reset Form
                  </button>
                  
                  <button
                    type="button"
                    onClick={onClose}
                    className="rm-btn rm-btn-danger"
                    disabled={loading}
                  >
                    <FiX /> Cancel
                  </button>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  {whatsappSent && (
                    <div className="whatsapp-status">
                      <FiCheck /> WhatsApp Sent
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="rm-btn rm-btn-primary"
                  >
                    {loading ? (
                      <>
                        <div className="rm-spinner"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave /> Save Record
                      </>
                    )}
                  </button>
                  
                  {savedData && !whatsappSent && (
                    <button
                      type="button"
                      onClick={sendWhatsAppMessage}
                      className="rm-btn rm-btn-whatsapp"
                      disabled={loading}
                    >
                      <FiSend /> Send WhatsApp
                    </button>
                  )}
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