// src/pages/ProductionSections/PVCCoatingSection/PVCCoatingView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiPackage, FiLayers, 
  FiTool, FiUser, FiClock,
  FiHash, FiBox, FiCheckSquare,
  FiDroplet, FiDatabase, FiEdit2,
  FiTarget, FiPercent, FiPrinter,
  FiDownload, FiShare2, FiCalendar,
  FiEye, FiTrendingUp, FiActivity,
  FiDollarSign, FiBarChart2, FiInfo,
  FiRefreshCw, FiChevronRight
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';

const PVCCoatingView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [recordData, setRecordData] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [printMode, setPrintMode] = useState(false);

  // ✅ 1. FETCH RECORD DATA
  useEffect(() => {
    const fetchRecordData = async () => {
      try {
        setLoading(true);
        
        // Fetch the record
        const { data, error } = await supabase
          .from('pvcsection')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setRecordData(data);
          
          // Fetch target data if targets_id exists
          if (data.targets_id) {
            const { data: target } = await supabase
              .from('targets')
              .select('*')
              .eq('id', data.targets_id)
              .single();
            
            if (target) setTargetData(target);
          }
          
          // Fetch item data if item_code exists
          if (data.item_code) {
            const { data: item } = await supabase
              .from('pvcitem')
              .select('*')
              .eq('item_code', data.item_code)
              .single();
            
            if (item) setItemData(item);
          }
        }

      } catch (error) {
        console.error('Error fetching record:', error);
        setError('Failed to load record: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecordData();
  }, [id]);

  // ✅ 2. GET USER INFO
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUser(session.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    getUser();
  }, []);

  // ✅ 3. CALCULATE ADDITIONAL METRICS
  const calculateMetrics = () => {
    if (!recordData || !targetData) return null;
    
    const productionQty = parseFloat(recordData.production_quantity) || 0;
    const targetQty = parseFloat(targetData.target_qty) || 
                     parseFloat(targetData.target_quantity) || 
                     parseFloat(targetData.quantity) || 
                     0;
    const efficiency = parseFloat(recordData.efficiency) || 0;
    const weight = parseFloat(recordData.weight) || 0;
    
    const remainingQty = Math.max(0, targetQty - productionQty);
    const achievement = targetQty > 0 ? (productionQty / targetQty) * 100 : 0;
    const status = efficiency >= 80 ? 'Excellent' : 
                   efficiency >= 60 ? 'Good' : 
                   'Needs Improvement';
    
    return {
      remainingQty,
      achievement,
      status,
      productionQty,
      targetQty,
      efficiency,
      weight
    };
  };

  // ✅ 4. FORMAT DATE
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ 5. HANDLE PRINT
  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 500);
  };

  // ✅ 6. HANDLE DOWNLOAD
  const handleDownload = () => {
    if (!recordData) return;
    
    const dataStr = JSON.stringify(recordData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pvc-coating-record-${recordData.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '3px solid #f3f4f6', 
          borderTopColor: '#8b5cf6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading record details...</p>
      </div>
    );
  }

  if (error || !recordData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        padding: '20px'
      }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '40px', 
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ fontSize: '48px', color: '#ef4444', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#1f2937', marginBottom: '10px' }}>Record Not Found</h2>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            {error || 'The record you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/production-sections/pvc-coating')}
            style={{
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            <FiArrowLeft /> Back to PVC Coating
          </button>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
      padding: printMode ? '0' : '20px'
    }}>
      {/* Print Mode Header */}
      {printMode && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderBottom: '2px solid #e5e7eb',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0, color: '#1f2937' }}>PVC Coating Production Record</h1>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
            Record #{recordData.id} | Printed: {new Date().toLocaleString()}
          </p>
        </div>
      )}

      {/* Header */}
      {!printMode && (
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <button
              onClick={() => navigate('/production-sections/pvc-coating')}
              style={{
                background: 'white',
                border: '2px solid #8b5cf6',
                color: '#8b5cf6',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#8b5cf6';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#8b5cf6';
              }}
            >
              <FiArrowLeft /> Back to PVC Coating
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePrint}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                <FiPrinter /> Print
              </button>
              
              <button
                onClick={handleDownload}
                style={{
                  background: '#3b82f6',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                <FiDownload /> Download
              </button>
              
              <Link
                to={`/production-sections/pvc-coating/edit/${id}`}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
              >
                <FiEdit2 /> Edit Record
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiEye size={28} />
            </div>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1f2937', fontWeight: '700' }}>
                PVC Coating Record #{recordData.id}
              </h1>
              <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
                View Production Details | All fields are read-only
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Record Info */}
      {!printMode && (
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiCalendar size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '16px' }}>
                Production Record Information
              </div>
              <div style={{ fontSize: '12px', opacity: '0.9' }}>
                Created: {formatDate(recordData.created_at)} | 
                Last Updated: {formatDate(recordData.updated_at)}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '5px 10px',
            borderRadius: '20px',
            fontWeight: '600'
          }}>
            Record #{recordData.id}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: printMode ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        
        {/* Section 1: PRODUCTION SUMMARY */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: printMode ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '25px',
          border: printMode ? '1px solid #e5e7eb' : 'none'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FiActivity size={16} /> PRODUCTION SUMMARY
          </div>

          {/* Efficiency Card */}
          <div style={{ 
            background: recordData.efficiency >= 80 ? '#d1fae5' : 
                      recordData.efficiency >= 60 ? '#fef3c7' : '#fee2e2',
            border: '2px solid',
            borderColor: recordData.efficiency >= 80 ? '#10b981' : 
                        recordData.efficiency >= 60 ? '#f59e0b' : '#ef4444',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <FiTrendingUp size={20} color={recordData.efficiency >= 80 ? '#059669' : 
                                           recordData.efficiency >= 60 ? '#d97706' : '#dc2626'} />
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                PRODUCTION EFFICIENCY
              </div>
            </div>
            <div style={{ 
              fontSize: '36px', 
              color: recordData.efficiency >= 80 ? '#059669' : 
                    recordData.efficiency >= 60 ? '#d97706' : '#dc2626', 
              fontWeight: 'bold',
              marginBottom: '5px'
            }}>
              {recordData.efficiency}%
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Based on production vs target
            </div>
          </div>

          {/* Production Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600' }}>Production Qty</div>
              <div style={{ fontSize: '18px', color: '#1e293b', fontWeight: '700', marginTop: '5px' }}>
                {recordData.production_quantity} {recordData.unit}
              </div>
            </div>
            
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600' }}>Total Weight</div>
              <div style={{ fontSize: '18px', color: '#1e293b', fontWeight: '700', marginTop: '5px' }}>
                {recordData.weight} KG
              </div>
            </div>
          </div>

          {/* Target Comparison */}
          {metrics && targetData && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fbbf24',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '10px' }}>
                <FiTarget size={14} style={{ marginRight: '8px' }} />
                TARGET COMPARISON
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Target Quantity</div>
                  <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
                    {metrics.targetQty} {targetData.uom || targetData.unit || recordData.unit}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  color: '#6b7280', 
                  fontWeight: '300',
                  margin: '0 10px'
                }}>
                  →
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Remaining</div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: metrics.remainingQty > 0 ? '#ef4444' : '#10b981',
                    fontWeight: '600'
                  }}>
                    {metrics.remainingQty.toFixed(2)} {targetData.uom || targetData.unit || recordData.unit}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                height: '8px', 
                background: '#e5e7eb', 
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '5px'
              }}>
                <div style={{
                  width: `${Math.min(100, metrics.achievement)}%`,
                  height: '100%',
                  background: recordData.efficiency >= 80 ? '#10b981' : 
                            recordData.efficiency >= 60 ? '#f59e0b' : '#ef4444',
                  borderRadius: '4px'
                }} />
              </div>
              
              <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
                Achievement: {metrics.achievement.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Section 2: ITEM & MACHINE DETAILS */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: printMode ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '25px',
          border: printMode ? '1px solid #e5e7eb' : 'none'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FiPackage size={16} /> ITEM & MACHINE DETAILS
          </div>

          {/* Item Details */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '15px'
            }}>
              <div style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>
                ITEM INFORMATION
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#8b5cf6', 
                background: '#f5f3ff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: '600'
              }}>
                {recordData.item_code}
              </div>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '12px'
            }}>
              <div style={{
                background: '#f8fafc',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Item Name</div>
                <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>
                  {recordData.item_name}
                </div>
              </div>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Material Type</div>
                <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>
                  {recordData.material_type}
                </div>
              </div>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Raw Material Size</div>
                <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>
                  {recordData.raw_material_flatsize || 'N/A'}
                </div>
              </div>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Finished Product</div>
                <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600', marginTop: '4px' }}>
                  {recordData.finishedproductname || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Machine Details */}
          <div>
            <div style={{ 
              fontSize: '13px', 
              color: '#374151', 
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              MACHINE INFORMATION
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '15px'
            }}>
              <div style={{
                background: '#ecfdf5',
                border: '2px solid #a7f3d0',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '11px', color: '#065f46', fontWeight: '600' }}>Machine ID</div>
                <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700', marginTop: '8px' }}>
                  {recordData.machine_id}
                </div>
              </div>
              
              <div style={{
                background: '#ecfdf5',
                border: '2px solid #a7f3d0',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '11px', color: '#065f46', fontWeight: '600' }}>Machine No</div>
                <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700', marginTop: '8px' }}>
                  {recordData.machine_no}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: SHIFT & PERSONNEL */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: printMode ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '25px',
          border: printMode ? '1px solid #e5e7eb' : 'none'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FiUser size={16} /> SHIFT & PERSONNEL
          </div>

          {/* Shift Details */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ 
              fontSize: '13px', 
              color: '#374151', 
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              SHIFT INFORMATION
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '15px'
            }}>
              <div style={{
                background: '#f0f9ff',
                border: '2px solid #bae6fd',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600' }}>Shift Code</div>
                <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700', marginTop: '8px' }}>
                  {recordData.shift_code}
                </div>
              </div>
              
              <div style={{
                background: '#f0f9ff',
                border: '2px solid #bae6fd',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600' }}>Shift Name</div>
                <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700', marginTop: '8px' }}>
                  {recordData.shift_name}
                </div>
              </div>
            </div>
          </div>

          {/* Personnel Details */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ 
              fontSize: '13px', 
              color: '#374151', 
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              PERSONNEL INFORMATION
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Operator Name</div>
                <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600', marginTop: '8px' }}>
                  {recordData.operator_name}
                </div>
              </div>
              
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>Entry User</div>
                <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600', marginTop: '8px' }}>
                  {recordData.users_name}
                </div>
              </div>
            </div>
          </div>

          {/* Weight Details */}
          <div>
            <div style={{ 
              fontSize: '13px', 
              color: '#374151', 
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              WEIGHT DETAILS
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '15px'
            }}>
              <div style={{
                background: '#f5f3ff',
                border: '2px solid #ddd6fe',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600' }}>Per Meter Weight</div>
                <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700', marginTop: '8px' }}>
                  {recordData.per_meter_wt} KG/M
                </div>
              </div>
              
              <div style={{
                background: '#f5f3ff',
                border: '2px solid #ddd6fe',
                borderRadius: '8px',
                padding: '15px'
              }}>
                <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600' }}>Total Weight</div>
                <div style={{ fontSize: '16px', color: '#1e293b', fontWeight: '700', marginTop: '8px' }}>
                  {recordData.weight} KG
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: printMode ? 'none' : '0 4px 20px rgba(0, 0, 0, 0.08)',
        padding: '25px',
        marginBottom: '20px',
        border: printMode ? '1px solid #e5e7eb' : 'none'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          padding: '12px 15px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FiInfo size={16} /> REMARKS & ADDITIONAL INFORMATION
        </div>
        
        <div style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '20px',
          minHeight: '100px'
        }}>
          {recordData.remarks ? (
            <div style={{ 
              fontSize: '14px', 
              color: '#1f2937', 
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {recordData.remarks}
            </div>
          ) : (
            <div style={{ 
              fontSize: '14px', 
              color: '#9ca3af', 
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px'
            }}>
              No remarks provided for this record
            </div>
          )}
        </div>
      </div>

      {/* Target Information */}
      {targetData && (
        <div style={{
          background: '#ecfdf5',
          border: '2px solid #10b981',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            marginBottom: '20px'
          }}>
            <FiTarget color="#059669" size={20} />
            <div style={{ fontWeight: '700', color: '#059669', fontSize: '16px' }}>
              TARGET INFORMATION
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: printMode ? 'repeat(4, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '15px',
            fontSize: '12px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ color: '#6b7280' }}>Target ID</div>
              <div style={{ fontWeight: '700', color: '#7c3aed', fontSize: '14px', marginTop: '8px' }}>
                #{targetData.id}
              </div>
            </div>
            
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ color: '#6b7280' }}>Target Quantity</div>
              <div style={{ fontWeight: '700', color: '#059669', fontSize: '14px', marginTop: '8px' }}>
                {targetData.target_qty || targetData.target_quantity || targetData.quantity || 0} 
                {targetData.uom || targetData.unit || recordData.unit}
              </div>
            </div>
            
            {targetData.item_code && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ color: '#6b7280' }}>Target Item Code</div>
                <div style={{ fontWeight: '700', color: '#f59e0b', fontSize: '14px', marginTop: '8px' }}>
                  {targetData.item_code}
                </div>
              </div>
            )}
            
            {targetData.section_name && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div style={{ color: '#6b7280' }}>Section</div>
                <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '14px', marginTop: '8px' }}>
                  {targetData.section_name}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print Mode Footer */}
      {printMode && (
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          borderTop: '2px solid #e5e7eb',
          textAlign: 'center',
          fontSize: '11px',
          color: '#6b7280',
          marginTop: '20px'
        }}>
          <div>PVC Coating Production System | Record #{recordData.id}</div>
          <div>Printed on: {new Date().toLocaleString()} | Page 1 of 1</div>
        </div>
      )}

      {/* Action Buttons (Non-Print Mode) */}
      {!printMode && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center',
          gap: '15px'
        }}>
          <Link
            to={`/production-sections/pvc-coating/edit/${id}`}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            <FiEdit2 /> Edit This Record
          </Link>
          
          <button
            onClick={() => navigate('/production-sections/pvc-coating')}
            style={{
              background: 'white',
              border: '2px solid #8b5cf6',
              color: '#8b5cf6',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#8b5cf6';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#8b5cf6';
            }}
          >
            <FiArrowLeft /> Back to List
          </button>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.5in;
          }
          
          body * {
            visibility: hidden;
          }
          
          #printable-area, #printable-area * {
            visibility: visible;
          }
          
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          
          button, .no-print {
            display: none !important;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PVCCoatingView;