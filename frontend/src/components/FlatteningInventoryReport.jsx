import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { FiDownload, FiPrinter, FiRefreshCw, FiX, FiMessageSquare, FiArrowLeft, FiCheck, FiCheckSquare, FiSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './FlatteningInventoryReport.css';

const FlatteningInventoryReportPopup = ({ onClose }) => {
  console.log('Report Popup rendered, onClose prop:', onClose);
  
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemMessages, setItemMessages] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilterType, setDateFilterType] = useState('specific');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);

  // ✅ بٹنز کو کام کرنے کے لیے event handlers
  const handleClose = () => {
    console.log('handleClose called');
    if (onClose && typeof onClose === 'function') {
      console.log('Calling onClose()');
      onClose();
    } else {
      console.error('onClose is not a function:', onClose);
    }
  };

  const handleBack = () => {
    console.log('handleBack called');
    handleClose();
  };

  const handleOverlayClick = (e) => {
    console.log('Overlay clicked');
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handlePopupClick = (e) => {
    console.log('Popup clicked, stopping propagation');
    e.stopPropagation();
  };

  // ✅ useCallback کے ساتھ fetchInventoryData
  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      
      let flatteningQuery = supabase
        .from('flatteningsection')
        .select('item_code, item_name, production_quantity, created_at');
      
      let spiralQuery = supabase
        .from('spiralsection')
        .select('item_code, weight, created_at');

      // تاریخ فلٹرنگ
      if (dateFilterType === 'specific' && selectedDate) {
        const startOfDay = new Date(selectedDate + 'T00:00:00').toISOString();
        const endOfDay = new Date(selectedDate + 'T23:59:59').toISOString();
        
        flatteningQuery = flatteningQuery
          .lte('created_at', endOfDay)
          .gte('created_at', startOfDay);
        
        spiralQuery = spiralQuery
          .lte('created_at', endOfDay)
          .gte('created_at', startOfDay);
      } 
      else if (dateFilterType === 'range' && startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00').toISOString();
        const end = new Date(endDate + 'T23:59:59').toISOString();
        
        flatteningQuery = flatteningQuery
          .lte('created_at', end)
          .gte('created_at', start);
        
        spiralQuery = spiralQuery
          .lte('created_at', end)
          .gte('created_at', start);
      }

      const { data: flatteningData } = await flatteningQuery.order('created_at', { ascending: false });
      const { data: spiralData } = await spiralQuery.order('created_at', { ascending: false });

      // ڈیٹا پروسیسنگ
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
      
      // سب آئٹمز کو ڈیفالٹ میں selected کر لیں
      const initialSelected = {};
      inventory.forEach(item => {
        initialSelected[item.item_code] = true;
      });
      setSelectedItems(initialSelected);
      setSelectAll(true);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, dateFilterType, startDate, endDate]);

  // ✅ useEffect with fetchInventoryData in dependencies
  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // ✅ آئٹم سلیکشن کا ہینڈلر
  const handleItemSelect = useCallback((itemCode) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemCode]: !prev[itemCode]
    }));
  }, []);

  // ✅ سب سلیکٹ/ڈی سلیکٹ
  const handleSelectAll = useCallback(() => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedItems = {};
    inventoryData.forEach(item => {
      newSelectedItems[item.item_code] = newSelectAll;
    });
    setSelectedItems(newSelectedItems);
  }, [selectAll, inventoryData]);

  // ✅ منتخب آئٹمز کی تعداد
  const getSelectedCount = useCallback(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  // ✅ ٹوٹلز کا حساب
  const calculateTotals = useCallback(() => {
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
  }, [inventoryData]);

  const totals = calculateTotals();

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  // ✅ ایک آئٹم کا میسج ایڈٹ
  const editItemMessage = useCallback((itemCode) => {
    const currentMessage = itemMessages[itemCode] || '';
    const newMessage = prompt(`Enter message for ${itemCode}:`, currentMessage);
    
    if (newMessage !== null) {
      setItemMessages(prev => ({
        ...prev,
        [itemCode]: newMessage
      }));
    }
  }, [itemMessages]);

  // ✅ تاریخ فلٹر اپلائی کرنا
  const applyDateFilter = useCallback(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // ✅ آج کی تاریخ پر سیٹ کرنا
  const setToToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setDateFilterType('specific');
    setShowDateRange(false);
    setTimeout(() => fetchInventoryData(), 100);
  }, [fetchInventoryData]);

  // ✅ سارے ڈیٹا (بغیر فلٹر)
  const showAllData = useCallback(() => {
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setDateFilterType('all');
    setShowDateRange(false);
    setTimeout(() => fetchInventoryData(), 100);
  }, [fetchInventoryData]);

  // ✅ منتخب آئٹمز بھیجیں
  const sendSelectedWhatsApp = useCallback(() => {
    const selectedItemsData = inventoryData.filter(item => selectedItems[item.item_code]);
    
    if (selectedItemsData.length === 0) {
      alert('Please select at least one item!');
      return;
    }

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
    
    // تاریخ فلٹر کا ڈیٹیلز
    if (dateFilterType === 'specific' && selectedDate) {
      message += `Report For: ${selectedDate}\n`;
    } else if (dateFilterType === 'range' && startDate && endDate) {
      message += `Report From: ${startDate} To ${endDate}\n`;
    }
    
    message += `Selected Items: ${selectedItemsData.length}\n`;
    message += `===========================\n\n`;
    
    message += `*SELECTED ITEMS LIST:*\n\n`;
    
    selectedItemsData.forEach((item, index) => {
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
  }, [inventoryData, selectedItems, itemMessages, selectedDate, dateFilterType, startDate, endDate, formatDate]);

  // ✅ ایک آئٹم کا WhatsApp
  const sendItemWhatsApp = useCallback((item) => {
    const itemMessage = itemMessages[item.item_code] || '';
    let message = `*CONTROL CABLE DIVISION*\n*Flattening Inventory Report*\n\n`;
    message += `Item: ${item.item_code}\n`;
    message += `Name: ${item.item_name}\n`;
    message += `Flattening: ${Math.round(item.flattening_qty)} KG\n`;
    message += `Spiral: ${Math.round(item.spiral_qty)} KG\n`;
    message += `Balance: ${item.balance} KG\n`;
    message += `Status: ${item.status}\n`;
    message += `Last Updated: ${formatDate(item.last_updated)}\n`;
    if (itemMessage) message += `Message: ${itemMessage}\n`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }, [itemMessages, formatDate]);

  return (
    <div className="report-popup-overlay" onClick={handleOverlayClick}>
      <div className="report-popup-container" onClick={handlePopupClick}>
        {/* Header */}
        <div className="popup-header">
          <button 
            className="popup-back-btn" 
            onClick={handleBack} 
            title="Back"
          >
            <FiArrowLeft />
          </button>
          
          <div className="header-content">
            <h1>CONTROL CABLE DIVISION</h1>
            <p className="subtitle">Flattening Inventory Report</p>
          </div>
          
          <button 
            className="popup-close-btn" 
            onClick={handleClose} 
            title="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Date Filter Section */}
        <div className="date-filter-section">
          <div className="date-filter-row">
            <div className="filter-options">
              <button 
                className={`filter-btn ${dateFilterType === 'specific' ? 'active' : ''}`}
                onClick={() => {
                  setDateFilterType('specific');
                  setShowDateRange(false);
                }}
              >
                Specific Date
              </button>
              <button 
                className={`filter-btn ${dateFilterType === 'range' ? 'active' : ''}`}
                onClick={() => {
                  setDateFilterType('range');
                  setShowDateRange(true);
                }}
              >
                Date Range
              </button>
              <button 
                className={`filter-btn ${dateFilterType === 'all' ? 'active' : ''}`}
                onClick={showAllData}
              >
                All Data
              </button>
            </div>

            <div className="date-inputs">
              {dateFilterType === 'specific' && (
                <div className="date-input-group">
                  <label style={{ color: '#1a202c' }}>Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="date-input"
                  />
                  <button className="today-btn" onClick={setToToday}>
                    Today
                  </button>
                </div>
              )}

              {showDateRange && (
                <div className="date-range-group">
                  <div className="date-input-group">
                    <label style={{ color: '#1a202c' }}>From:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                  <div className="date-input-group">
                    <label style={{ color: '#1a202c' }}>To:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>
              )}

              <button className="apply-filter-btn" onClick={applyDateFilter}>
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-item">
            <div className="summary-dot dot-total"></div>
            <span className="summary-label" style={{ color: '#1a202c' }}>Total Items:</span>
            <span className="summary-value">{totals.totalItems}</span>
          </div>
          
          <div className="summary-item">
            <div className="summary-dot dot-available"></div>
            <span className="summary-label" style={{ color: '#1a202c' }}>Available:</span>
            <span className="summary-value">{totals.availableItems}</span>
          </div>
          
          <div className="summary-item">
            <div className="summary-dot dot-deficit"></div>
            <span className="summary-label" style={{ color: '#1a202c' }}>Deficit:</span>
            <span className="summary-value">{totals.deficitItems}</span>
          </div>
          
          <div className="summary-item highlight">
            <span className="summary-label">Total Available:</span>
            <span className="summary-value">{totals.totalAvailable} KG</span>
          </div>

          <div className="summary-item selection-count">
            <span className="summary-label">Selected:</span>
            <span className="summary-value">{getSelectedCount()} items</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <button onClick={fetchInventoryData} className="toolbar-btn btn-refresh">
            <FiRefreshCw size={16} /> Refresh
          </button>
          
          <button onClick={sendSelectedWhatsApp} className="toolbar-btn btn-whatsapp">
            <FaWhatsapp size={16} /> WhatsApp Selected ({getSelectedCount()})
          </button>
          
          <button onClick={() => {
            const allSelected = {};
            inventoryData.forEach(item => {
              allSelected[item.item_code] = true;
            });
            setSelectedItems(allSelected);
            setSelectAll(true);
            sendSelectedWhatsApp();
          }} className="toolbar-btn btn-whatsapp-all">
            <FaWhatsapp size={16} /> WhatsApp All
          </button>
          
          <div className="selection-toolbar">
            <button onClick={handleSelectAll} className="select-all-btn">
              {selectAll ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
              {selectAll ? ' Deselect All' : ' Select All'}
            </button>
          </div>
          
          <button onClick={() => {
            const element = document.getElementById('inventory-table');
            const opt = {
              margin: 0.5,
              filename: `flattening-inventory-${new Date().toISOString().split('T')[0]}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
            };
            
            if (window.html2pdf) {
              window.html2pdf().set(opt).from(element).save();
            } else {
              window.print();
            }
          }} className="toolbar-btn btn-pdf">
            <FiDownload size={16} /> Download PDF
          </button>
          
          <button onClick={() => window.print()} className="toolbar-btn btn-print">
            <FiPrinter size={16} /> Print
          </button>
        </div>

        {/* Content */}
        <div className="popup-content">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <h3 style={{ color: '#1a202c' }}>Loading Inventory...</h3>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table id="inventory-table" className="inventory-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <button 
                          onClick={handleSelectAll}
                          className="checkbox-header"
                        >
                          {selectAll ? <FiCheckSquare size={20} /> : <FiSquare size={20} />}
                        </button>
                      </th>
                      <th style={{ width: '50px' }}>Sr#</th>
                      <th style={{ width: '120px' }}>Item Code</th>
                      <th>Item Name</th>
                      <th style={{ width: '120px' }}>Flattening (KG)</th>
                      <th style={{ width: '120px' }}>Spiral (KG)</th>
                      <th style={{ width: '120px' }}>Balance (KG)</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th style={{ width: '120px' }}>Last Updated</th>
                      <th style={{ width: '200px' }}>Message</th>
                      <th style={{ width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item, index) => {
                      const message = itemMessages[item.item_code] || '';
                      const isSelected = selectedItems[item.item_code] || false;
                      
                      return (
                        <tr key={item.id} className={item.status === 'Available' ? 'row-available' : 'row-deficit'}>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              onClick={() => handleItemSelect(item.item_code)}
                              className={`item-checkbox ${isSelected ? 'selected' : ''}`}
                            >
                              {isSelected ? <FiCheck size={18} /> : <FiSquare size={18} />}
                            </button>
                          </td>
                          <td className="text-center" style={{ color: '#1a202c' }}>{index + 1}</td>
                          <td className="text-bold" style={{ color: '#1a202c' }}>{item.item_code}</td>
                          <td style={{ color: '#1a202c' }}>{item.item_name}</td>
                          <td className="text-center text-green">{Math.round(item.flattening_qty)}</td>
                          <td className="text-center text-red">{Math.round(item.spiral_qty)}</td>
                          <td className={`text-center ${item.balance >= 0 ? 'text-green' : 'text-red'}`}>
                            {item.balance}
                          </td>
                          <td className="text-center">
                            <span className={`status-badge ${item.status === 'Available' ? 'status-available' : 'status-deficit'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="text-center" style={{ color: '#1a202c' }}>
                            {formatDate(item.last_updated)}
                          </td>
                          <td className="message-cell" style={{ color: '#1a202c' }}>
                            {message || '-'}
                          </td>
                          <td className="text-center">
                            <div className="action-buttons">
                              <button 
                                onClick={() => editItemMessage(item.item_code)} 
                                className="action-btn btn-message"
                                title="Edit Message"
                              >
                                <FiMessageSquare size={16} />
                              </button>
                              <button 
                                onClick={() => sendItemWhatsApp(item)}
                                className="action-btn btn-whatsapp-item"
                                title="Send on WhatsApp"
                              >
                                <FaWhatsapp size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="popup-footer">
                <button onClick={handleClose} className="btn-close-report">
                  Close Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlatteningInventoryReportPopup;