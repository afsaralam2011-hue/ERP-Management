import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FiDownload, FiPrinter, FiRefreshCw, FiX, FiArrowLeft, FiBook } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const FlatteningInventoryLedger = ({ onClose }) => {
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      
      // Flattening ڈیٹا
      const { data: flatteningData } = await supabase
        .from('flatteningsection')
        .select('*')
        .order('created_at', { ascending: false });

      // Spiral ڈیٹا
      const { data: spiralData } = await supabase
        .from('spiralsection')
        .select('*')
        .order('created_at', { ascending: false });

      // تمام ٹرانزیکشنز کو اکٹھا کریں
      const allTransactions = [];
      
      // Flattening ٹرانزیکشنز
      flatteningData?.forEach(item => {
        allTransactions.push({
          type: 'FLATTENING',
          item_code: item.item_code,
          item_name: item.item_name,
          quantity: parseFloat(item.production_quantity) || 0,
          date: item.created_at,
          operation: 'PRODUCTION',
          reference: `FLT-${item.id?.slice(0, 8) || 'N/A'}`,
          remarks: item.remarks || 'Production Entry'
        });
      });

      // Spiral ٹرانزیکشنز
      spiralData?.forEach(item => {
        allTransactions.push({
          type: 'SPIRAL',
          item_code: item.item_code,
          item_name: item.item_name,
          quantity: parseFloat(item.weight) || 0,
          date: item.created_at,
          operation: 'CONSUMPTION',
          reference: `SPL-${item.id?.slice(0, 8) || 'N/A'}`,
          remarks: item.remarks || 'Spiral Consumption'
        });
      });

      // تاریخ کے حساب سے ترتیب دیں
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // آئٹم وائز کل کیلکولیشن
      const itemSummary = {};
      allTransactions.forEach(transaction => {
        const key = transaction.item_code;
        if (!itemSummary[key]) {
          itemSummary[key] = {
            item_code: key,
            item_name: transaction.item_name,
            opening_balance: 0,
            total_in: 0,
            total_out: 0,
            closing_balance: 0,
            transactions: []
          };
        }
        
        if (transaction.type === 'FLATTENING') {
          itemSummary[key].total_in += transaction.quantity;
        } else {
          itemSummary[key].total_out += transaction.quantity;
        }
        
        itemSummary[key].transactions.push(transaction);
      });

      // کلوزنگ بیلنس کیلکولیشن
      Object.keys(itemSummary).forEach(key => {
        const item = itemSummary[key];
        item.closing_balance = item.total_in - item.total_out;
      });

      const ledger = Object.values(itemSummary).map(item => ({
        ...item,
        transactions: item.transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
      }));

      // بیلنس کے حساب سے ترتیب
      ledger.sort((a, b) => b.closing_balance - a.closing_balance);
      
      setLedgerData(ledger);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleBackToList = () => {
    setSelectedItem(null);
  };

  const calculateTotals = () => {
    let totalItems = ledgerData.length;
    let totalIn = 0;
    let totalOut = 0;
    let totalBalance = 0;

    ledgerData.forEach(item => {
      totalIn += item.total_in;
      totalOut += item.total_out;
      totalBalance += item.closing_balance;
    });

    return {
      totalItems,
      totalIn: Math.round(totalIn),
      totalOut: Math.round(totalOut),
      totalBalance: Math.round(totalBalance)
    };
  };

  const totals = calculateTotals();

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  const downloadLedgerPDF = () => {
    try {
      const element = document.getElementById('ledger-content');
      const opt = {
        margin: 0.5,
        filename: `flattening-ledger-${new Date().toISOString().split('T')[0]}.pdf`,
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

  const sendWhatsAppReport = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
    
    let message = `*CONTROL CABLE DIVISION*\n`;
    message += `*Flattening Inventory Ledger*\n`;
    message += `===========================\n`;
    message += `Date: ${formattedDate}\n`;
    message += `===========================\n\n`;
    
    message += `*LEDGER SUMMARY:*\n`;
    message += `Total Items: ${totals.totalItems}\n`;
    message += `Total In: ${totals.totalIn} KG\n`;
    message += `Total Out: ${totals.totalOut} KG\n`;
    message += `Total Balance: ${totals.totalBalance} KG\n\n`;
    
    message += `*ITEM WISE BALANCE:*\n\n`;
    
    ledgerData.forEach((item, index) => {
      message += `${index + 1}. ${item.item_code}\n`;
      message += `   ${item.item_name}\n`;
      message += `   Total In: ${Math.round(item.total_in)} KG\n`;
      message += `   Total Out: ${Math.round(item.total_out)} KG\n`;
      message += `   Balance: ${Math.round(item.closing_balance)} KG\n\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        width: '98%',
        maxWidth: '1400px',
        maxHeight: '95vh',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        fontFamily: "'Courier New', monospace"
      }}>
        {/* ہیڈر */}
        <div style={{
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #c0392b'
        }}>
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
          
          <div style={{ 
            textAlign: 'center',
            flex: 1,
            margin: '0 15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <FiBook size={24} />
              <h1 style={{ 
                margin: 0, 
                fontSize: '22px', 
                fontWeight: 'bold',
                letterSpacing: '1px',
                fontFamily: "'Times New Roman', serif"
              }}>
                CONTROL CABLE DIVISION
              </h1>
            </div>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '16px',
              opacity: 0.9,
              fontStyle: 'italic'
            }}>
              Flattening Inventory Ledger
            </p>
          </div>
          
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

        {/* ٹولبار */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 20px',
          backgroundColor: '#ecf0f1',
          borderBottom: '2px solid #bdc3c7',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button onClick={fetchLedgerData} style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: 'none',
            background: '#3498db',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <FiRefreshCw size={14} /> Refresh Ledger
          </button>
          
          <button onClick={sendWhatsAppReport} style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: 'none',
            background: '#27ae60',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <FaWhatsapp size={14} /> WhatsApp Report
          </button>
          
          <button onClick={downloadLedgerPDF} style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: 'none',
            background: '#e74c3c',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <FiDownload size={14} /> Download Ledger
          </button>
          
          <button onClick={() => window.print()} style={{
            padding: '8px 15px',
            borderRadius: '4px',
            border: 'none',
            background: '#9b59b6',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px'
          }}>
            <FiPrinter size={14} /> Print Ledger
          </button>
        </div>

        {/* سمری */}
        <div style={{
          padding: '10px 20px',
          backgroundColor: '#2c3e50',
          color: 'white',
          borderBottom: '2px solid #34495e',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          fontSize: '13px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>TOTAL ITEMS</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{totals.totalItems}</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>TOTAL IN (PRODUCTION)</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>{totals.totalIn} KG</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>TOTAL OUT (CONSUMPTION)</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>{totals.totalOut} KG</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>NET BALANCE</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f39c12' }}>{totals.totalBalance} KG</div>
          </div>
        </div>

        {/* لیجر مواد */}
        <div id="ledger-content" style={{
          padding: '15px',
          maxHeight: 'calc(95vh - 280px)',
          overflow: 'auto',
          backgroundColor: '#fff'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }}></div>
              <h3 style={{ color: '#666', fontSize: '16px' }}>Loading Ledger Data...</h3>
            </div>
          ) : selectedItem ? (
            // آئٹم ڈیٹیل ویو
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid #3498db'
              }}>
                <button 
                  onClick={handleBackToList}
                  style={{
                    padding: '6px 12px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '12px'
                  }}
                >
                  <FiArrowLeft size={12} /> Back to List
                </button>
                
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>{selectedItem.item_code}</h3>
                  <p style={{ margin: '2px 0 0 0', color: '#7f8c8d' }}>{selectedItem.item_name}</p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Closing Balance</div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    color: selectedItem.closing_balance >= 0 ? '#27ae60' : '#e74c3c'
                  }}>
                    {Math.round(selectedItem.closing_balance)} KG
                  </div>
                </div>
              </div>

              {/* ٹرانزیکشن ہسٹری */}
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                padding: '15px',
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ 
                  margin: '0 0 15px 0', 
                  color: '#2c3e50',
                  borderBottom: '1px solid #3498db',
                  paddingBottom: '5px'
                }}>
                  Transaction History
                </h4>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Date & Time</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Type</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Operation</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Quantity (KG)</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Reference</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItem.transactions.map((transaction, index) => (
                      <tr key={index} style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                      }}>
                        <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'monospace' }}>
                          {formatDateTime(transaction.date)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: transaction.type === 'FLATTENING' ? '#d4edda' : '#f8d7da',
                            color: transaction.type === 'FLATTENING' ? '#155724' : '#721c24'
                          }}>
                            {transaction.type}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: transaction.operation === 'PRODUCTION' ? '#cce5ff' : '#f8d7da',
                            color: transaction.operation === 'PRODUCTION' ? '#004085' : '#721c24'
                          }}>
                            {transaction.operation}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: transaction.type === 'FLATTENING' ? '#27ae60' : '#e74c3c'
                        }}>
                          {transaction.quantity} KG
                        </td>
                        <td style={{ 
                          padding: '8px', 
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontSize: '11px'
                        }}>
                          {transaction.reference}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {transaction.remarks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // مین لیجر لسٹ
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#34495e', 
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #2c3e50' }}>Sr#</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #2c3e50' }}>Item Code</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #2c3e50' }}>Item Name</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #2c3e50' }}>Total In (KG)</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #2c3e50' }}>Total Out (KG)</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #2c3e50' }}>Balance (KG)</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #2c3e50' }}>Transactions</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #2c3e50' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.map((item, index) => (
                    <tr 
                      key={item.item_code} 
                      style={{ 
                        borderBottom: '1px solid #dee2e6',
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleItemClick(item)}
                    >
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'center', 
                        border: '1px solid #dee2e6',
                        fontWeight: 'bold',
                        backgroundColor: '#ecf0f1'
                      }}>
                        {index + 1}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        border: '1px solid #dee2e6',
                        fontWeight: 'bold',
                        color: '#2c3e50'
                      }}>
                        {item.item_code}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        border: '1px solid #dee2e6'
                      }}>
                        {item.item_name}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'center', 
                        border: '1px solid #dee2e6',
                        fontWeight: 'bold',
                        color: '#27ae60'
                      }}>
                        {Math.round(item.total_in)} KG
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'center', 
                        border: '1px solid #dee2e6',
                        fontWeight: 'bold',
                        color: '#e74c3c'
                      }}>
                        {Math.round(item.total_out)} KG
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'center', 
                        border: '1px solid #dee2e6',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: item.closing_balance >= 0 ? '#27ae60' : '#e74c3c',
                        backgroundColor: item.closing_balance >= 0 ? '#d4edda' : '#f8d7da'
                      }}>
                        {Math.round(item.closing_balance)} KG
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'center', 
                        border: '1px solid #dee2e6',
                        fontFamily: 'monospace'
                      }}>
                        {item.transactions.length}
                      </td>
                      <td style={{ 
                        padding: '10px', 
                        textAlign: 'center', 
                        border: '1px solid #dee2e6'
                      }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(item);
                          }}
                          style={{
                            padding: '5px 10px',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* کلوز بٹن */}
        <div style={{ 
          textAlign: 'center', 
          padding: '15px',
          backgroundColor: '#ecf0f1',
          borderTop: '2px solid #bdc3c7'
        }}>
          <button 
            onClick={handleClose}
            style={{
              padding: '8px 30px',
              background: '#7f8c8d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Close Ledger
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* پرنٹ سٹائلز */
        @media print {
          body * {
            visibility: hidden;
          }
          
          #ledger-content,
          #ledger-content * {
            visibility: visible;
          }
          
          #ledger-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default FlatteningInventoryLedger;