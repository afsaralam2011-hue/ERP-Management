import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FiDownload, FiPrinter, FiRefreshCw, FiX, FiMessageSquare, FiArrowLeft } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const FlatteningInventoryReportPopup = ({ onClose }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemMessages, setItemMessages] = useState({});

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      const { data: flatteningData } = await supabase
        .from('flatteningsection')
        .select('item_code, item_name, production_quantity, created_at')
        .order('created_at', { ascending: false });

      const { data: spiralData } = await supabase
        .from('spiralsection')
        .select('item_code, weight, created_at')
        .order('created_at', { ascending: false });

      const flatteningSummary = {};
      flatteningData?.forEach(item => {
        const key = item.item_code;
        if (!flatteningSummary[key]) {
          flatteningSummary[key] = {
            item_code: key,
            item_name: item.item_name,
            total_qty: 0,
            last_updated: item.created_at
          };
        }
        flatteningSummary[key].total_qty += parseFloat(item.production_quantity) || 0;
        if (new Date(item.created_at) > new Date(flatteningSummary[key].last_updated)) {
          flatteningSummary[key].last_updated = item.created_at;
        }
      });

      const spiralSummary = {};
      spiralData?.forEach(item => {
        const key = item.item_code;
        if (!spiralSummary[key]) {
          spiralSummary[key] = {
            item_code: key,
            total_weight: 0,
            last_updated: item.created_at
          };
        }
        spiralSummary[key].total_weight += parseFloat(item.weight) || 0;
        if (new Date(item.created_at) > new Date(spiralSummary[key].last_updated)) {
          spiralSummary[key].last_updated = item.created_at;
        }
      });

      const inventory = Object.values(flatteningSummary).map(flatItem => {
        const spiralItem = spiralSummary[flatItem.item_code];
        const balance = Math.round(flatItem.total_qty - (spiralItem?.total_weight || 0));
        
        let lastUpdatedDate = flatItem.last_updated;
        if (spiralItem?.last_updated && new Date(spiralItem.last_updated) > new Date(lastUpdatedDate)) {
          lastUpdatedDate = spiralItem.last_updated;
        }
        
        return {
          id: flatItem.item_code,
          item_code: flatItem.item_code,
          item_name: flatItem.item_name,
          flattening_qty: flatItem.total_qty,
          spiral_qty: spiralItem?.total_weight || 0,
          balance: balance,
          status: balance >= 0 ? 'Available' : 'Deficit',
          last_updated: lastUpdatedDate
        };
      });

      inventory.sort((a, b) => {
        if (a.status === 'Available' && b.status === 'Deficit') return -1;
        if (a.status === 'Deficit' && b.status === 'Available') return 1;
        return b.balance - a.balance;
      });
      
      setInventoryData(inventory);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    let totalAvailable = 0;
    let totalItems = inventoryData.length;
    let availableItems = 0;
    let deficitItems = 0;

    inventoryData.forEach(item => {
      if (item.balance >= 0) {
        totalAvailable += item.balance;
        availableItems++;
      } else {
        deficitItems++;
      }
    });

    return {
      totalAvailable: Math.round(totalAvailable),
      totalItems,
      availableItems,
      deficitItems
    };
  };

  const totals = calculateTotals();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const editItemMessage = (itemCode) => {
    const currentMessage = itemMessages[itemCode] || '';
    const newMessage = prompt(`Enter message for ${itemCode}:`, currentMessage);
    
    if (newMessage !== null) {
      setItemMessages(prev => ({
        ...prev,
        [itemCode]: newMessage
      }));
    }
  };

  const sendItemWhatsApp = (item) => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
    
    let message = `*CONTROL CABLE DIVISION*\n`;
    message += `*Flattening Inventory Report*\n`;
    message += `===========================\n`;
    message += `Date: ${formattedDate}\n`;
    message += `===========================\n\n`;
    
    const itemMsg = itemMessages[item.item_code];
    if (itemMsg && itemMsg.trim()) {
      message += `Message: ${itemMsg}\n\n`;
    }
    
    message += `Item Code: ${item.item_code}\n`;
    message += `Item Name: ${item.item_name}\n`;
    message += `Flattening: ${Math.round(item.flattening_qty)} KG\n`;
    message += `Spiral: ${Math.round(item.spiral_qty)} KG\n`;
    message += `Balance: ${item.balance} KG\n`;
    message += `Status: ${item.status}\n`;
    message += `Last Updated: ${formatDate(item.last_updated)}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const sendAllWhatsApp = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
    
    let message = `*CONTROL CABLE DIVISION*\n`;
    message += `*Flattening Inventory Report*\n`;
    message += `===========================\n`;
    message += `Date: ${formattedDate}\n`;
    message += `===========================\n\n`;
    
    message += `*SUMMARY:*\n`;
    message += `Total Items: ${totals.totalItems}\n`;
    message += `Available: ${totals.availableItems}\n`;
    message += `Deficit: ${totals.deficitItems}\n`;
    message += `Total Available: ${totals.totalAvailable} KG\n\n`;
    
    message += `*ITEMS LIST:*\n\n`;
    
    inventoryData.forEach((item, index) => {
      const itemMsg = itemMessages[item.item_code];
      message += `${index + 1}. ${item.item_code}\n`;
      message += `   ${item.item_name}\n`;
      message += `   Flattening: ${Math.round(item.flattening_qty)} KG\n`;
      message += `   Spiral: ${Math.round(item.spiral_qty)} KG\n`;
      message += `   Balance: ${item.balance} KG\n`;
      message += `   Status: ${item.status}\n`;
      message += `   Last Updated: ${formatDate(item.last_updated)}\n`;
      if (itemMsg && itemMsg.trim()) {
        message += `   Message: ${itemMsg}\n`;
      }
      message += `\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const downloadPDF = () => {
    try {
      const element = document.getElementById('inventory-table');
      const opt = {
        margin: 0.5,
        filename: `flattening-inventory-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'landscape' 
        }
      };
      
      if (window.html2pdf) {
        window.html2pdf()
          .set(opt)
          .from(element)
          .save();
      } else {
        window.print();
      }
      
    } catch (error) {
      console.error('PDF Error:', error);
      window.print();
    }
  };

  // ✅ کام کرنے والے کلوز فنکشن
  const handleClose = () => {
    console.log('Close button clicked - working');
    if (onClose && typeof onClose === 'function') {
      console.log('Calling onClose() function');
      onClose();
    } else {
      console.error('onClose is not a function or not provided');
    }
  };

  // ✅ بیک بٹن کے لیے فنکشن
  const handleBack = () => {
    console.log('Back button clicked - working');
    handleClose();
  };

  // ✅ اوورلے پر کلک
  const handleOverlayClick = (e) => {
    console.log('Overlay clicked');
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // ✅ پاپ اپ پر کلک روکنے کے لیے
  const handlePopupClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '10px'
      }}
      onClick={handleOverlayClick}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '98%',
          maxWidth: '1400px',
          maxHeight: '95vh',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
        onClick={handlePopupClick}
      >
        {/* ✅ ہیڈر - واپس لایا */}
        <div style={{
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)',
          color: 'white',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* ✅ بیک بٹن - کام کرے گا */}
          <button 
            onClick={handleBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Back"
          >
            <FiArrowLeft />
          </button>
          
          {/* ✅ ہیڈنگ سنٹر میں */}
          <div style={{ 
            textAlign: 'center',
            flex: 1,
            margin: '0 15px'
          }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}>
              CONTROL CABLE DIVISION
            </h1>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '14px',
              opacity: 0.9
            }}>
              Flattening Inventory Report
            </p>
          </div>
          
          {/* ✅ کلوز بٹن - کام کرے گا */}
          <button 
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Close"
          >
            <FiX />
          </button>
        </div>

        {/* ✅ سمری سیکشن - ہیڈنگ کے نیچے */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontSize: '13px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px'
          }}>
            <span style={{ fontWeight: '600', color: '#495057' }}>Total Items:</span>
            <span style={{ fontWeight: 'bold', color: '#212529' }}>{totals.totalItems}</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#28a745'
            }}></div>
            <span style={{ fontWeight: '600', color: '#495057' }}>Available:</span>
            <span style={{ fontWeight: 'bold', color: '#212529' }}>{totals.availableItems}</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#dc3545'
            }}></div>
            <span style={{ fontWeight: '600', color: '#495057' }}>Deficit:</span>
            <span style={{ fontWeight: 'bold', color: '#212529' }}>{totals.deficitItems}</span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '4px 12px',
            backgroundColor: '#28a745',
            borderRadius: '4px',
            marginLeft: '10px'
          }}>
            <span style={{ fontWeight: '600', color: 'white' }}>Total Available:</span>
            <span style={{ fontWeight: 'bold', color: 'white' }}>
              {totals.totalAvailable} KG
            </span>
          </div>
        </div>

        {/* ٹولبار */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 20px',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button onClick={fetchInventoryData} style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: 'none',
            background: '#0ea5e9',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          
          <button onClick={sendAllWhatsApp} style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: 'none',
            background: '#25D366',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <FaWhatsapp size={14} /> WhatsApp All
          </button>
          
          <button onClick={downloadPDF} style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: 'none',
            background: '#dc3545',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <FiDownload size={14} /> Download PDF
          </button>
          
          <button onClick={() => window.print()} style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: 'none',
            background: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <FiPrinter size={14} /> Print
          </button>
        </div>

        {/* مواد */}
        <div style={{
          padding: '15px',
          maxHeight: 'calc(95vh - 200px)',
          overflow: 'auto'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #0ea5e9',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }}></div>
              <h3 style={{ color: '#666', fontSize: '16px' }}>Loading Inventory...</h3>
            </div>
          ) : (
            <>
              <table 
                id="inventory-table" 
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px'
                }}
              >
                <thead>
                  <tr style={{ 
                    background: '#1a2980', 
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Sr#</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Item Code</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Item Name</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Flattening (KG)</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Spiral (KG)</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Balance (KG)</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Status</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Last Updated</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'left', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Message</th>
                    <th style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      fontWeight: '600',
                      fontSize: '11px'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((item, index) => {
                    const message = itemMessages[item.item_code] || '';
                    return (
                      <tr key={item.id} style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: item.status === 'Available' ? '#f8fff9' : '#fff8f8',
                        fontSize: '12px'
                      }}>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'center', 
                          fontWeight: 'bold',
                          color: '#212529',
                          fontSize: '12px'
                        }}>
                          {index + 1}
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          fontWeight: 'bold',
                          color: '#212529',
                          fontSize: '12px'
                        }}>
                          {item.item_code}
                        </td>
                        <td style={{ 
                          padding: '8px',
                          color: '#212529',
                          fontSize: '12px'
                        }}>
                          {item.item_name}
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'center', 
                          color: '#28a745', 
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {Math.round(item.flattening_qty)}
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'center', 
                          color: '#dc3545', 
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}>
                          {Math.round(item.spiral_qty)}
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'center', 
                          color: item.balance >= 0 ? '#28a745' : '#dc3545', 
                          fontWeight: 'bold', 
                          fontSize: '12px' 
                        }}>
                          {item.balance}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: item.status === 'Available' ? '#d4edda' : '#f8d7da',
                            color: item.status === 'Available' ? '#155724' : '#721c24',
                            display: 'inline-block',
                            border: '1px solid #c3e6cb'
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          color: '#212529',
                          fontSize: '11px'
                        }}>
                          {formatDate(item.last_updated)}
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          maxWidth: '200px', 
                          wordWrap: 'break-word',
                          color: '#212529',
                          fontSize: '12px'
                        }}>
                          {message || '-'}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button onClick={() => editItemMessage(item.item_code)} style={{
                              background: 'white',
                              color: '#f59e0b',
                              border: '1px solid #f59e0b',
                              width: '30px',
                              height: '30px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px'
                            }} title="Edit Message">
                              <FiMessageSquare />
                            </button>
                            <button onClick={() => sendItemWhatsApp(item)} style={{
                              background: 'white',
                              color: '#25D366',
                              border: '1px solid #25D366',
                              width: '30px',
                              height: '30px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px'
                            }} title="Send on WhatsApp">
                              <FaWhatsapp />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* ✅ کلوز رپورٹ بٹن - کام کرے گا */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button 
                  onClick={handleClose}
                  style={{
                    padding: '8px 30px',
                    background: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Close Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FlatteningInventoryReportPopup;