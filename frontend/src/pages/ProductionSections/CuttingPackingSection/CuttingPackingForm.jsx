// src/pages/ProductionSections/PVCcoatingSection/PVCcoatingForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FiSave, FiArrowLeft, FiPackage, FiLayers,
  FiZap, FiThermometer, FiWind, FiClock,
  FiCheckCircle, FiXCircle, FiUser, FiHash,
  FiTool, FiDroplet, FiActivity, FiClipboard,
  FiBarChart, FiTrendingUp, FiShield, FiTarget
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './PVCcoatingForm.css';

const PVCcoatingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    section_name: 'pvcsection',
    machine_id: '',
    machine_no: '',
    item_code: '',
    item_name: '',
    raw_material_flatsize: '',
    material_type: 'PVC',
    coating_type: '',
    coating_thickness: '',
    wire_size: '',
    finishedproductname: '',
    operator_name: '',
    production_quantity: '',
    per_meter_wt: '',
    weight: '',
    unit: 'Meter',
    temperature: '',
    pressure: '',
    speed: '',
    efficiency: 0,
    users_name: 'Afsar',
    shift_code: '',
    shift_name: '',
    quality_check: 'Pass',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // PVC Coating specific options
  const coatingTypes = [
    'Transparent PVC',
    'White PVC',
    'Black PVC',
    'Grey PVC',
    'Color PVC',
    'UV Protected',
    'Fire Retardant',
    'Special Coating',
    'Other'
  ];

  const coatingThicknessOptions = [
    '0.5 mm',
    '0.8 mm',
    '1.0 mm',
    '1.2 mm',
    '1.5 mm',
    '2.0 mm',
    '2.5 mm',
    '3.0 mm',
    'Other'
  ];

  const qualityOptions = ['Pass', 'Fail', 'Hold'];
  
  const shiftOptions = [
    { code: 'MS', name: 'Morning Shift' },
    { code: 'AS', name: 'Afternoon Shift' },
    { code: 'NS', name: 'Night Shift' },
    { code: 'GS', name: 'General Shift' }
  ];

  // Calculate weight based on production and per meter weight
  useEffect(() => {
    const prod = parseFloat(formData.production_quantity) || 0;
    const perMeterWt = parseFloat(formData.per_meter_wt) || 0;
    
    if (prod > 0 && perMeterWt > 0) {
      const calculatedWeight = prod * perMeterWt;
      setFormData(prev => ({
        ...prev,
        weight: calculatedWeight.toFixed(2),
        efficiency: calculateEfficiency(prod, perMeterWt)
      }));
    }
  }, [formData.production_quantity, formData.per_meter_wt]);

  const calculateEfficiency = (production, perMeterWt) => {
    // You can implement your efficiency calculation logic here
    const baseEfficiency = 85; // Default efficiency
    const weightFactor = perMeterWt > 0 ? Math.min(100, baseEfficiency + (perMeterWt * 2)) : baseEfficiency;
    return Math.min(100, weightFactor);
  };

  // Fetch existing record for editing
  useEffect(() => {
    if (isEditMode) {
      fetchRecord();
    }
  }, [id]);

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pvccoatingsection')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          temperature: data.temperature || '',
          pressure: data.pressure || '',
          speed: data.speed || '',
          quality_check: data.quality_check || 'Pass'
        });
      }
    } catch (error) {
      console.error('Error fetching record:', error);
      setError('Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.item_name || !formData.production_quantity || !formData.operator_name) {
        throw new Error('Please fill in all required fields');
      }

      const recordData = {
        ...formData,
        production_quantity: parseFloat(formData.production_quantity),
        per_meter_wt: parseFloat(formData.per_meter_wt) || 0,
        weight: parseFloat(formData.weight) || 0,
        efficiency: parseFloat(formData.efficiency) || 0,
        temperature: parseFloat(formData.temperature) || null,
        pressure: parseFloat(formData.pressure) || null,
        speed: parseFloat(formData.speed) || null,
        updated_at: new Date().toISOString()
      };

      if (isEditMode) {
        // Update existing record
        const { error } = await supabase
          .from('pvccoatingsection')
          .update(recordData)
          .eq('id', id);

        if (error) throw error;
        setSuccess('Record updated successfully!');
      } else {
        // Insert new record
        const { error } = await supabase
          .from('pvccoatingsection')
          .insert([{
            ...recordData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        setSuccess('Record added successfully!');
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/production-sections/pvc-coating');
      }, 2000);

    } catch (error) {
      console.error('Error saving record:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading record...</p>
      </div>
    );
  }

  return (
    <div className="pvc-coating-form-container">
      <div className="form-header" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
        <button className="back-btn" onClick={() => navigate('/production-sections/pvc-coating')}>
          <FiArrowLeft /> Back to PVC Coating
        </button>
        <h1>
          <FiLayers style={{ marginRight: '10px' }} />
          {isEditMode ? 'Edit PVC Coating Record' : 'New PVC Coating Entry'}
        </h1>
        <p className="form-subtitle">
          Section: PVC Coating • Managed by: Afsar • {isEditMode ? 'Editing Record ID: ' + id : 'Creating New Record'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="coating-form">
        {error && (
          <div className="error-alert">
            <FiXCircle /> {error}
          </div>
        )}
        
        {success && (
          <div className="success-alert">
            <FiCheckCircle /> {success}
          </div>
        )}

        <div className="form-grid">
          {/* Basic Information Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiPackage /> Basic Information
            </h3>
            
            <div className="form-group">
              <label>Item Name *</label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                required
                placeholder="Enter item name"
              />
            </div>

            <div className="form-group">
              <label>Item Code</label>
              <input
                type="text"
                name="item_code"
                value={formData.item_code}
                onChange={handleChange}
                placeholder="Item code"
              />
            </div>

            <div className="form-group">
              <label>Raw Material Size</label>
              <input
                type="text"
                name="raw_material_flatsize"
                value={formData.raw_material_flatsize}
                onChange={handleChange}
                placeholder="e.g., 25x25 mm"
              />
            </div>
          </div>

          {/* Coating Specifications Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiLayers /> Coating Specifications
            </h3>

            <div className="form-group">
              <label>Coating Type *</label>
              <select
                name="coating_type"
                value={formData.coating_type}
                onChange={handleChange}
                required
              >
                <option value="">Select coating type</option>
                {coatingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Coating Thickness</label>
              <select
                name="coating_thickness"
                value={formData.coating_thickness}
                onChange={handleChange}
              >
                <option value="">Select thickness</option>
                {coatingThicknessOptions.map(thickness => (
                  <option key={thickness} value={thickness}>{thickness}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Wire Size (Input)</label>
              <input
                type="text"
                name="wire_size"
                value={formData.wire_size}
                onChange={handleChange}
                placeholder="e.g., 2.0 mm"
              />
            </div>

            <div className="form-group">
              <label>Finished Product Name</label>
              <input
                type="text"
                name="finishedproductname"
                value={formData.finishedproductname}
                onChange={handleChange}
                placeholder="Finished product name"
              />
            </div>
          </div>

          {/* Production Details Section */}
          <div className="form-section">
            <h3 className="section-title">
              <FiTrendingUp /> Production Details
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Production Quantity (Meters) *</label>
                <input
                  type="number"
                  name="production_quantity"
                  value={formData.production_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Per Meter Weight (KG)</label>
                <input
                  type="number"
                  name="per_meter_wt"
                  value={formData.per_meter_wt}
                  onChange={handleChange}
                  min="0"
                  step="0.001"
                  placeholder="0.000"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Weight (KG)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  readOnly
                  className="readonly-input"
                  placeholder="Auto-calculated"
                />
              </div>

              <div className="form-group">
                <label>Efficiency (%)</label>
                <input
                  type="number"
                  name="efficiency"
                  value={formData.efficiency}
                  readOnly
                  className="readonly-input"
                  placeholder="Auto-calculated"
                />
              </div>
            </div>
          </div>

          {/* Machine & Process Parameters */}
          <div className="form-section">
            <h3 className="section-title">
              <FiTool /> Machine & Process
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Machine ID</label>
                <input
                  type="text"
                  name="machine_id"
                  value={formData.machine_id}
                  onChange={handleChange}
                  placeholder="Machine ID"
                />
              </div>

              <div className="form-group">
                <label>Machine No</label>
                <input
                  type="text"
                  name="machine_no"
                  value={formData.machine_no}
                  onChange={handleChange}
                  placeholder="Machine number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Temperature (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 180.5"
                />
              </div>

              <div className="form-group">
                <label>Pressure (Bar)</label>
                <input
                  type="number"
                  name="pressure"
                  value={formData.pressure}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 15.5"
                />
              </div>

              <div className="form-group">
                <label>Speed (m/min)</label>
                <input
                  type="number"
                  name="speed"
                  value={formData.speed}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 25.5"
                />
              </div>
            </div>
          </div>

          {/* Quality & Personnel */}
          <div className="form-section">
            <h3 className="section-title">
              <FiShield /> Quality & Personnel
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Quality Check</label>
                <select
                  name="quality_check"
                  value={formData.quality_check}
                  onChange={handleChange}
                >
                  {qualityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Operator Name *</label>
                <input
                  type="text"
                  name="operator_name"
                  value={formData.operator_name}
                  onChange={handleChange}
                  required
                  placeholder="Operator name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Shift</label>
                <select
                  name="shift_name"
                  value={formData.shift_name}
                  onChange={handleChange}
                >
                  <option value="">Select shift</option>
                  {shiftOptions.map(shift => (
                    <option key={shift.code} value={shift.name}>
                      {shift.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Shift Code</label>
                <input
                  type="text"
                  name="shift_code"
                  value={formData.shift_code}
                  onChange={handleChange}
                  placeholder="Shift code"
                />
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="form-section full-width">
            <h3 className="section-title">
              <FiClipboard /> Remarks
            </h3>
            <div className="form-group">
              <label>Remarks / Notes</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Any additional notes or remarks..."
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/production-sections/pvc-coating')}
            disabled={loading}
          >
            <FiXCircle /> Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="form-spinner"></div>
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <FiSave />
                {isEditMode ? 'Update Record' : 'Save Record'}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="form-footer">
        <p>
          <strong>Note:</strong> Fields marked with * are required. 
          Weight and Efficiency are auto-calculated based on production quantity and per meter weight.
        </p>
        <p className="user-info">
          User: <strong>Afsar</strong> • Section: <strong>PVC Coating</strong> • Table: <strong>pvccoatingsection</strong>
        </p>
      </div>
    </div>
  );
};

export default PVCcoatingForm;