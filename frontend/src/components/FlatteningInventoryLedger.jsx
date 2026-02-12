import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  FiDownload, FiPrinter, FiRefreshCw, FiX, FiArrowLeft, FiBook, 
  FiEye, FiInfo, FiFileText, FiChevronLeft, FiChevronRight,
  FiSun, FiMoon, FiSearch, FiChevronDown
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const FlatteningInventoryLedger = ({ onClose }) => {
  // Theme Context
  const { isDarkMode, toggleTheme } = useTheme();
  
  // State Management
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'closing_balance',
    direction: 'desc'
  });

  // ✅ Item Selector Dropdown States
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const ledgerContentRef = useRef(null);
  const printStylesAdded = useRef(false);

  // Constants
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Theme colors
  const themeStyles = {
    dark: {
      bg: '#1a202c',
      cardBg: '#2d3748',
      text: '#e2e8f0',
      border: '#4a5568',
      headerBg: 'linear-gradient(135deg, #1a2634 0%, #2d3748 100%)',
      tableHeaderBg: '#2d3748',
      tableRowEven: '#2d3748',
      tableRowOdd: '#1e293b',
      summaryBg: '#2d3748',
      tooltipBg: '#2d3748',
      inputBg: '#1a202c',
      hoverBg: '#4a5568'
    },
    light: {
      bg: '#f5f5f5',
      cardBg: '#ffffff',
      text: '#2c3e50',
      border: '#dee2e6',
      headerBg: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      tableHeaderBg: '#34495e',
      tableRowEven: '#fff',
      tableRowOdd: '#f8f9fa',
      summaryBg: '#2c3e50',
      tooltipBg: '#ffffff',
      inputBg: '#ffffff',
      hoverBg: '#e8f4f8'
    }
  };

  const currentTheme = isDarkMode ? themeStyles.dark : themeStyles.light;

  // ✅ Filtered Items for Dropdown
  const filteredItems = useMemo(() => {
    if (!ledgerData.length) return [];
    
    let items = [...ledgerData];
    
    if (itemSearchTerm) {
      const term = itemSearchTerm.toLowerCase();
      items = items.filter(item => 
        item.item_code?.toLowerCase().includes(term) ||
        item.item_name?.toLowerCase().includes(term)
      );
    }
    
    // Sort by item code
    items.sort((a, b) => a.item_code.localeCompare(b.item_code));
    
    return items;
  }, [ledgerData, itemSearchTerm]);

  // ✅ Handle Item Select from Dropdown
  const handleItemSelect = useCallback((item) => {
    setSelectedItem(item);
    setShowItemDropdown(false);
    setItemSearchTerm('');
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowItemDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch Data with Error Handling
  const fetchLedgerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parallel queries with error handling
      const [flatteningResult, spiralResult] = await Promise.all([
        supabase
          .from('flatteningsection')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('spiralsection')
          .select('*')
          .order('created_at', { ascending: false })
      ]);

      if (flatteningResult.error) throw flatteningResult.error;
      if (spiralResult.error) throw spiralResult.error;

      const flatteningData = flatteningResult.data || [];
      const spiralData = spiralResult.data || [];

      // Process all transactions
      const allTransactions = [
        ...flatteningData.map(item => ({
          type: 'FLATTENING',
          item_code: item.item_code,
          item_name: item.item_name,
          quantity: parseFloat(item.production_quantity) || 0,
          date: item.created_at,
          operation: 'PRODUCTION',
          reference: `FLT-${item.id?.slice(-6) || 'N/A'}`,
          remarks: item.remarks || 'Production Entry',
          id: item.id
        })),
        ...spiralData.map(item => ({
          type: 'SPIRAL',
          item_code: item.item_code,
          item_name: item.item_name || 'N/A',
          quantity: parseFloat(item.weight) || 0,
          date: item.created_at,
          operation: 'CONSUMPTION',
          reference: `SPL-${item.id?.slice(-6) || 'N/A'}`,
          remarks: item.remarks || 'Spiral Consumption',
          id: item.id
        }))
      ];

      // Sort by date
      allTransactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Build item summary with reduce
      const itemSummary = allTransactions.reduce((acc, transaction) => {
        const key = transaction.item_code;
        
        if (!acc[key]) {
          acc[key] = {
            item_code: key,
            item_name: transaction.item_name,
            opening_balance: 0,
            total_in: 0,
            total_out: 0,
            closing_balance: 0,
            transactions: [],
            last_transaction_date: transaction.date
          };
        }
        
        if (transaction.type === 'FLATTENING') {
          acc[key].total_in += transaction.quantity;
        } else {
          acc[key].total_out += transaction.quantity;
        }
        
        acc[key].transactions.push(transaction);
        
        if (new Date(transaction.date) > new Date(acc[key].last_transaction_date)) {
          acc[key].last_transaction_date = transaction.date;
        }
        
        return acc;
      }, {});

      // Calculate closing balance and sort transactions
      const ledger = Object.values(itemSummary).map(item => ({
        ...item,
        closing_balance: item.total_in - item.total_out,
        transactions: item.transactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }));

      setLedgerData(ledger);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setError('Failed to load ledger data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  // Add print styles only once
  useEffect(() => {
    if (!printStylesAdded.current) {
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          body * {
            visibility: hidden;
          }
          #ledger-content, #ledger-content * {
            visibility: visible;
          }
          #ledger-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
          }
          .no-print, button, .no-print * {
            display: none !important;
          }
          table {
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `;
      document.head.appendChild(style);
      printStylesAdded.current = true;
    }
  }, []);

  // Memoized Calculations
  const totals = useMemo(() => {
    return ledgerData.reduce((acc, item) => ({
      totalItems: ledgerData.length,
      totalIn: Math.round(acc.totalIn + item.total_in),
      totalOut: Math.round(acc.totalOut + item.total_out),
      totalBalance: Math.round(acc.totalBalance + item.closing_balance)
    }), { totalIn: 0, totalOut: 0, totalBalance: 0 });
  }, [ledgerData]);

  // Filtered and Sorted Data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...ledgerData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.item_code?.toLowerCase().includes(term) ||
        item.item_name?.toLowerCase().includes(term)
      );
    }

    if (dateRange.startDate && dateRange.endDate) {
      const start = new Date(dateRange.startDate).getTime();
      const end = new Date(dateRange.endDate).getTime();
      
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.last_transaction_date).getTime();
        return itemDate >= start && itemDate <= end;
      });
    }

    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [ledgerData, searchTerm, dateRange, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / ITEMS_PER_PAGE);

  // Handlers
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleDateFilterChange = useCallback((type, value) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const handleClose = useCallback(() => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  // Export Functions
  const downloadLedgerPDF = useCallback(() => {
    try {
      const element = ledgerContentRef.current;
      if (!element) {
        console.error('Ledger content not found');
        return;
      }

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `flattening-ledger-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true
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
  }, []);

  const sendWhatsAppReport = useCallback(() => {
    if (ledgerData.length === 0) {
      alert('No data to send!');
      return;
    }

    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
    
    let message = `*CONTROL CABLE DIVISION*\n`;
    message += `*Flattening Inventory Ledger*\n`;
    message += `═══════════════════════════\n`;
    message += `Date: ${formattedDate}\n`;
    message += `Items: ${totals.totalItems}\n`;
    message += `═══════════════════════════\n\n`;
    
    message += `*LEDGER SUMMARY:*\n`;
    message += `📊 Total In: ${totals.totalIn.toLocaleString()} KG\n`;
    message += `📉 Total Out: ${totals.totalOut.toLocaleString()} KG\n`;
    message += `⚖️ Net Balance: ${totals.totalBalance.toLocaleString()} KG\n\n`;
    
    message += `*ITEM WISE BALANCE:*\n`;
    message += `───────────────────\n`;
    
    ledgerData.slice(0, 20).forEach((item, index) => {
      message += `${index + 1}. *${item.item_code}*\n`;
      message += `   ${item.item_name}\n`;
      message += `   ➕ In: ${Math.round(item.total_in).toLocaleString()} KG\n`;
      message += `   ➖ Out: ${Math.round(item.total_out).toLocaleString()} KG\n`;
      message += `   💰 Bal: ${Math.round(item.closing_balance).toLocaleString()} KG\n\n`;
    });
    
    if (ledgerData.length > 20) {
      message += `... and ${ledgerData.length - 20} more items\n`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  }, [ledgerData, totals]);

  const exportToCSV = useCallback(() => {
    if (ledgerData.length === 0) return;

    const headers = ['Item Code', 'Item Name', 'Total In (KG)', 'Total Out (KG)', 'Balance (KG)', 'Status', 'Last Transaction'];
    
    const rows = ledgerData.map(item => [
      item.item_code,
      item.item_name,
      Math.round(item.total_in).toLocaleString(),
      Math.round(item.total_out).toLocaleString(),
      Math.round(item.closing_balance).toLocaleString(),
      item.closing_balance >= 0 ? 'Available' : 'Deficit',
      formatDate(item.last_transaction_date)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `flattening-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [ledgerData]);

  // Formatting Functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid Date';
    }
  }, []);

  // ✅ Render Item Selector Dropdown
  const renderItemSelector = () => (
    <div style={{
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: currentTheme.cardBg,
      borderRadius: '8px',
      border: `1px solid ${currentTheme.border}`,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 'bold', color: currentTheme.text, minWidth: '120px' }}>
          🔍 Select Item:
        </div>
        
        {/* Dropdown Container */}
        <div ref={dropdownRef} style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
          {/* Dropdown Button */}
          <button
            onClick={() => setShowItemDropdown(!showItemDropdown)}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: currentTheme.inputBg,
              border: `2px solid ${currentTheme.border}`,
              borderRadius: '6px',
              color: currentTheme.text,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ color: selectedItem ? currentTheme.text : '#95a5a6' }}>
              {selectedItem ? `${selectedItem.item_code} - ${selectedItem.item_name}` : '-- Select an Item to View Details --'}
            </span>
            <FiChevronDown size={18} style={{ 
              transform: showItemDropdown ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s'
            }} />
          </button>
          
          {/* Dropdown Menu */}
          {showItemDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '5px',
              backgroundColor: currentTheme.cardBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              maxHeight: '400px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Search Box */}
              <div style={{
                padding: '10px',
                borderBottom: `1px solid ${currentTheme.border}`,
                backgroundColor: isDarkMode ? '#1a202c' : '#f8f9fa'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: currentTheme.inputBg,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '4px',
                  padding: '8px 12px'
                }}>
                  <FiSearch size={16} style={{ color: '#95a5a6', marginRight: '8px' }} />
                  <input
                    type="text"
                    value={itemSearchTerm}
                    onChange={(e) => setItemSearchTerm(e.target.value)}
                    placeholder="Search by code or name..."
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      color: currentTheme.text,
                      fontSize: '13px'
                    }}
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Items List */}
              <div style={{
                overflowY: 'auto',
                maxHeight: '300px'
              }}>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <button
                      key={item.item_code}
                      onClick={() => handleItemSelect(item)}
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        textAlign: 'left',
                        border: 'none',
                        borderBottom: `1px solid ${currentTheme.border}`,
                        backgroundColor: selectedItem?.item_code === item.item_code ? 
                          (isDarkMode ? '#4a5568' : '#e8f4f8') : 'transparent',
                        color: currentTheme.text,
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.hoverBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 
                          selectedItem?.item_code === item.item_code ? 
                          (isDarkMode ? '#4a5568' : '#e8f4f8') : 'transparent';
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '14px' }}>{item.item_code}</strong>
                        <div style={{ 
                          fontSize: '12px', 
                          color: isDarkMode ? '#a0aec0' : '#7f8c8d',
                          marginTop: '2px'
                        }}>
                          {item.item_name}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: item.closing_balance >= 0 ? '#27ae60' : '#e74c3c',
                        color: 'white'
                      }}>
                        {Math.round(item.closing_balance).toLocaleString()} KG
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: isDarkMode ? '#a0aec0' : '#7f8c8d'
                  }}>
                    <FiSearch size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p>No items found</p>
                  </div>
                )}
              </div>
              
              {/* Footer Stats */}
              <div style={{
                padding: '10px',
                borderTop: `1px solid ${currentTheme.border}`,
                backgroundColor: isDarkMode ? '#1a202c' : '#f8f9fa',
                fontSize: '12px',
                color: isDarkMode ? '#a0aec0' : '#7f8c8d',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Total Items: {filteredItems.length}</span>
                <span>Available: {filteredItems.filter(i => i.closing_balance >= 0).length}</span>
                <span>Deficit: {filteredItems.filter(i => i.closing_balance < 0).length}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Clear Selection Button */}
        {selectedItem && (
          <button
            onClick={() => setSelectedItem(null)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <FiX size={14} /> Clear Selection
          </button>
        )}
      </div>
    </div>
  );

  // Render Sort Icon
  const renderSortIcon = useCallback((key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  }, [sortConfig]);

  // Render Pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        padding: '15px',
        backgroundColor: currentTheme.cardBg,
        borderTop: `1px solid ${currentTheme.border}`,
        color: currentTheme.text
      }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            border: `1px solid ${currentTheme.border}`,
            backgroundColor: currentPage === 1 ? '#e9ecef' : currentTheme.cardBg,
            color: currentPage === 1 ? '#6c757d' : '#007bff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <FiChevronLeft /> Previous
        </button>
        
        <span style={{ fontSize: '14px' }}>
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            border: `1px solid ${currentTheme.border}`,
            backgroundColor: currentPage === totalPages ? '#e9ecef' : currentTheme.cardBg,
            color: currentPage === totalPages ? '#6c757d' : '#007bff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          Next <FiChevronRight />
        </button>
      </div>
    );
  };

  // Render Filters
  const renderFilters = () => (
    <div style={{
      padding: '15px',
      backgroundColor: isDarkMode ? '#2d3748' : '#f8f9fa',
      borderBottom: `1px solid ${currentTheme.border}`,
      display: showFilters ? 'block' : 'none',
      color: currentTheme.text
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontSize: '12px', 
            color: isDarkMode ? '#e2e8f0' : '#495057' 
          }}>
            Search Items
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by code or name..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: currentTheme.inputBg,
              color: currentTheme.text
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontSize: '12px', 
            color: isDarkMode ? '#e2e8f0' : '#495057' 
          }}>
            From Date
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: currentTheme.inputBg,
              color: currentTheme.text
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '5px', 
            fontSize: '12px', 
            color: isDarkMode ? '#e2e8f0' : '#495057' 
          }}>
            To Date
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '4px',
              fontSize: '13px',
              backgroundColor: currentTheme.inputBg,
              color: currentTheme.text
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setSearchTerm('');
              setDateRange({ startDate: '', endDate: '' });
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );

  // Main Render
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
        backgroundColor: currentTheme.bg,
        borderRadius: '8px',
        width: '98%',
        maxWidth: '1600px',
        maxHeight: '95vh',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        fontFamily: "'Courier New', monospace",
        display: 'flex',
        flexDirection: 'column',
        color: currentTheme.text
      }}>
        {/* Header with Theme Toggle */}
        <div className="no-print" style={{
          padding: '12px 20px',
          background: currentTheme.headerBg,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #c0392b'
        }}>
          <button 
            onClick={selectedItem ? handleBackToList : handleClose}
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
              transition: 'background 0.2s',
              ':hover': { background: 'rgba(255,255,255,0.3)' }
            }}
            title={selectedItem ? "Back to List" : "Close"}
          >
            {selectedItem ? <FiArrowLeft /> : <FiX />}
          </button>
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <FiBook size={24} />
              <h1 style={{ 
                margin: 0, 
                fontSize: '24px', 
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
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
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
              transition: 'background 0.2s',
              marginRight: '10px'
            }}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          
          <div style={{ width: '36px' }} /> {/* Spacer */}
        </div>

        {/* Toolbar */}
        <div className="no-print" style={{
          display: 'flex',
          gap: '8px',
          padding: '10px 20px',
          backgroundColor: isDarkMode ? '#2d3748' : '#ecf0f1',
          borderBottom: `2px solid ${currentTheme.border}`,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          color: currentTheme.text
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={fetchLedgerData} 
              disabled={loading}
              style={{
                padding: '8px 15px',
                borderRadius: '4px',
                border: 'none',
                background: '#3498db',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                opacity: loading ? 0.6 : 1
              }}
            >
              <FiRefreshCw size={14} className={loading ? 'spin' : ''} /> 
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 15px',
                borderRadius: '4px',
                border: 'none',
                background: showFilters ? '#2c3e50' : '#95a5a6',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <FiInfo size={14} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={exportToCSV}
              style={{
                padding: '8px 15px',
                borderRadius: '4px',
                border: 'none',
                background: '#f39c12',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px'
              }}
            >
              <FiFileText size={14} /> Export CSV
            </button>
            
            <button 
              onClick={sendWhatsAppReport} 
              disabled={ledgerData.length === 0}
              style={{
                padding: '8px 15px',
                borderRadius: '4px',
                border: 'none',
                background: '#27ae60',
                color: 'white',
                cursor: ledgerData.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                opacity: ledgerData.length === 0 ? 0.6 : 1
              }}
            >
              <FaWhatsapp size={14} /> WhatsApp Report
            </button>
            
            <button 
              onClick={downloadLedgerPDF} 
              disabled={ledgerData.length === 0}
              style={{
                padding: '8px 15px',
                borderRadius: '4px',
                border: 'none',
                background: '#e74c3c',
                color: 'white',
                cursor: ledgerData.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                opacity: ledgerData.length === 0 ? 0.6 : 1
              }}
            >
              <FiDownload size={14} /> Download PDF
            </button>
            
            <button 
              onClick={() => window.print()} 
              style={{
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
              }}
            >
              <FiPrinter size={14} /> Print
            </button>
          </div>
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Summary Cards */}
        {!loading && ledgerData.length > 0 && (
          <div style={{
            padding: '15px 20px',
            backgroundColor: currentTheme.summaryBg,
            color: 'white',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '15px',
            fontSize: '13px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase' }}>
                <FiBook style={{ marginRight: '4px' }} /> Total Items
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {totals.totalItems}
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase' }}>
                📈 Total Production
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                {totals.totalIn.toLocaleString()} KG
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase' }}>
                📉 Total Consumption
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {totals.totalOut.toLocaleString()} KG
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase' }}>
                ⚖️ Net Balance
              </div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: totals.totalBalance >= 0 ? '#2ecc71' : '#e74c3c'
              }}>
                {totals.totalBalance.toLocaleString()} KG
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase' }}>
                🎯 Available Items
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                {ledgerData.filter(item => item.closing_balance >= 0).length}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            padding: '12px',
            margin: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '6px',
            textAlign: 'center',
            border: '1px solid #ef4444'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* ✅ Item Selector Dropdown - Always Visible */}
        {!loading && ledgerData.length > 0 && renderItemSelector()}

        {/* Main Content */}
        <div 
          id="ledger-content" 
          ref={ledgerContentRef}
          style={{
            padding: '15px',
            flex: 1,
            overflow: 'auto',
            backgroundColor: isDarkMode ? '#1a202c' : '#fff',
            color: currentTheme.text
          }}
        >
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentTheme.text
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: `5px solid ${isDarkMode ? '#4a5568' : '#f3f3f3'}`,
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
              }}></div>
              <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#2c3e50', fontSize: '18px', margin: '0' }}>
                Loading Ledger Data...
              </h3>
              <p style={{ color: isDarkMode ? '#a0aec0' : '#7f8c8d', fontSize: '14px', marginTop: '10px' }}>
                Please wait while we fetch the inventory records
              </p>
            </div>
          ) : selectedItem ? (
            // ✅ Item Detail View - Shows when item is selected from dropdown
            <div>
              {/* Item Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: isDarkMode ? '#2d3748' : '#f8f9fa',
                borderRadius: '6px',
                border: `1px solid ${currentTheme.border}`,
                color: currentTheme.text
              }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', color: currentTheme.text, fontSize: '22px' }}>
                    {selectedItem.item_code}
                  </h2>
                  <p style={{ margin: 0, color: isDarkMode ? '#a0aec0' : '#7f8c8d', fontSize: '14px' }}>
                    {selectedItem.item_name}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: isDarkMode ? '#a0aec0' : '#7f8c8d', marginBottom: '5px' }}>
                    Current Balance
                  </div>
                  <div style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold',
                    color: selectedItem.closing_balance >= 0 ? '#27ae60' : '#e74c3c'
                  }}>
                    {Math.round(selectedItem.closing_balance).toLocaleString()} KG
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: selectedItem.closing_balance >= 0 ? '#27ae60' : '#e74c3c',
                    fontWeight: '600'
                  }}>
                    {selectedItem.closing_balance >= 0 ? 'Available' : 'Deficit'}
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: isDarkMode ? '#276749' : '#d4edda',
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: isDarkMode ? '#fff' : '#155724'
                }}>
                  <div style={{ fontSize: '11px', opacity: 0.9, textTransform: 'uppercase' }}>
                    Total Production
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {Math.round(selectedItem.total_in).toLocaleString()} KG
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    ({selectedItem.transactions.filter(t => t.type === 'FLATTENING').length} transactions)
                  </div>
                </div>
                
                <div style={{
                  padding: '12px',
                  backgroundColor: isDarkMode ? '#9b2c2c' : '#f8d7da',
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: isDarkMode ? '#fff' : '#721c24'
                }}>
                  <div style={{ fontSize: '11px', opacity: 0.9, textTransform: 'uppercase' }}>
                    Total Consumption
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {Math.round(selectedItem.total_out).toLocaleString()} KG
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    ({selectedItem.transactions.filter(t => t.type === 'SPIRAL').length} transactions)
                  </div>
                </div>
                
                <div style={{
                  padding: '12px',
                  backgroundColor: isDarkMode ? '#975a16' : '#fff3cd',
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: isDarkMode ? '#fff' : '#856404'
                }}>
                  <div style={{ fontSize: '11px', opacity: 0.9, textTransform: 'uppercase' }}>
                    Last Updated
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {formatDate(selectedItem.last_transaction_date)}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.9 }}>
                    {formatDateTime(selectedItem.last_transaction_date)}
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div style={{
                backgroundColor: isDarkMode ? '#2d3748' : '#fff',
                borderRadius: '6px',
                border: `1px solid ${currentTheme.border}`,
                overflow: 'hidden'
              }}>
                <h4 style={{ 
                  margin: 0,
                  padding: '12px 15px',
                  backgroundColor: isDarkMode ? '#4a5568' : '#f8f9fa',
                  borderBottom: `1px solid ${currentTheme.border}`,
                  color: currentTheme.text,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FiFileText size={18} /> Transaction History 
                  <span style={{ 
                    marginLeft: 'auto',
                    fontSize: '13px',
                    color: isDarkMode ? '#e2e8f0' : '#7f8c8d',
                    fontWeight: 'normal'
                  }}>
                    Total: {selectedItem.transactions.length} transactions
                  </span>
                </h4>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    fontSize: '13px',
                    color: currentTheme.text
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: isDarkMode ? '#1a202c' : '#2c3e50', color: 'white' }}>
                        <th style={{ padding: '10px', textAlign: 'center' }}>#</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Date & Time</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Type</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Operation</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Quantity (KG)</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Reference</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.transactions.map((transaction, index) => (
                        <tr 
                          key={`${transaction.id}-${index}`}
                          style={{ 
                            borderBottom: `1px solid ${currentTheme.border}`,
                            backgroundColor: index % 2 === 0 ? (isDarkMode ? '#2d3748' : '#fff') : (isDarkMode ? '#4a5568' : '#f8f9fa')
                          }}
                        >
                          <td style={{ 
                            padding: '10px', 
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: isDarkMode ? '#e2e8f0' : '#7f8c8d'
                          }}>
                            {index + 1}
                          </td>
                          <td style={{ 
                            padding: '10px', 
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: currentTheme.text
                          }}>
                            {formatDateTime(transaction.date)}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: transaction.type === 'FLATTENING' ? '#27ae60' : '#e74c3c',
                              color: 'white'
                            }}>
                              {transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              backgroundColor: transaction.operation === 'PRODUCTION' ? '#3498db' : '#e74c3c',
                              color: 'white'
                            }}>
                              {transaction.operation}
                            </span>
                          </td>
                          <td style={{ 
                            padding: '10px', 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            color: transaction.type === 'FLATTENING' ? '#27ae60' : '#e74c3c'
                          }}>
                            {transaction.quantity.toLocaleString()} KG
                          </td>
                          <td style={{ 
                            padding: '10px', 
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: isDarkMode ? '#e2e8f0' : '#7f8c8d'
                          }}>
                            {transaction.reference}
                          </td>
                          <td style={{ 
                            padding: '10px',
                            maxWidth: '200px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: currentTheme.text
                          }}>
                            {transaction.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : filteredAndSortedData.length === 0 ? (
            // No Data State
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: isDarkMode ? '#2d3748' : '#f8f9fa',
              borderRadius: '6px',
              color: currentTheme.text
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px', color: '#95a5a6' }}>
                <FiBook size={48} />
              </div>
              <h3 style={{ color: isDarkMode ? '#e2e8f0' : '#2c3e50', fontSize: '20px', marginBottom: '10px' }}>
                No Ledger Data Found
              </h3>
              <p style={{ color: isDarkMode ? '#a0aec0' : '#7f8c8d', fontSize: '14px', marginBottom: '20px' }}>
                {searchTerm || dateRange.startDate ? 
                  'No items match your search criteria. Try adjusting your filters.' :
                  'No inventory transactions have been recorded yet.'
                }
              </p>
              {(searchTerm || dateRange.startDate) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDateRange({ startDate: '', endDate: '' });
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            // Main Ledger Table - Shows when no item is selected
            <div>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: isDarkMode ? '#e2e8f0' : '#7f8c8d',
                  fontStyle: 'italic'
                }}>
                  👆 Select an item from the dropdown above to view detailed transaction history
                </p>
              </div>
              
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '13px',
                color: currentTheme.text
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: currentTheme.tableHeaderBg, 
                    color: 'white',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <th style={{ padding: '12px', textAlign: 'center', border: `1px solid ${currentTheme.border}` }}>#</th>
                    <th 
                      style={{ padding: '12px', textAlign: 'left', border: `1px solid ${currentTheme.border}`, cursor: 'pointer' }}
                      onClick={() => handleSort('item_code')}
                    >
                      Item Code {renderSortIcon('item_code')}
                    </th>
                    <th 
                      style={{ padding: '12px', textAlign: 'left', border: `1px solid ${currentTheme.border}`, cursor: 'pointer' }}
                      onClick={() => handleSort('item_name')}
                    >
                      Item Name {renderSortIcon('item_name')}
                    </th>
                    <th 
                      style={{ padding: '12px', textAlign: 'center', border: `1px solid ${currentTheme.border}`, cursor: 'pointer' }}
                      onClick={() => handleSort('total_in')}
                    >
                      Total In (KG) {renderSortIcon('total_in')}
                    </th>
                    <th 
                      style={{ padding: '12px', textAlign: 'center', border: `1px solid ${currentTheme.border}`, cursor: 'pointer' }}
                      onClick={() => handleSort('total_out')}
                    >
                      Total Out (KG) {renderSortIcon('total_out')}
                    </th>
                    <th 
                      style={{ padding: '12px', textAlign: 'center', border: `1px solid ${currentTheme.border}`, cursor: 'pointer' }}
                      onClick={() => handleSort('closing_balance')}
                    >
                      Balance (KG) {renderSortIcon('closing_balance')}
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', border: `1px solid ${currentTheme.border}` }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: `1px solid ${currentTheme.border}` }}>Transactions</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: `1px solid ${currentTheme.border}` }}>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, index) => {
                    const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    const status = item.closing_balance >= 0 ? 'Available' : 'Deficit';
                    const statusColor = status === 'Available' ? '#27ae60' : '#e74c3c';
                    const statusBg = status === 'Available' ? (isDarkMode ? '#276749' : '#d4edda') : (isDarkMode ? '#9b2c2c' : '#f8d7da');
                    
                    return (
                      <tr 
                        key={item.item_code} 
                        style={{ 
                          borderBottom: `1px solid ${currentTheme.border}`,
                          backgroundColor: index % 2 === 0 ? currentTheme.tableRowEven : currentTheme.tableRowOdd,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          color: currentTheme.text
                        }}
                        onClick={() => handleItemSelect(item)}
                      >
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center', 
                          border: `1px solid ${currentTheme.border}`,
                          fontWeight: 'bold',
                          backgroundColor: isDarkMode ? '#4a5568' : '#ecf0f1'
                        }}>
                          {rowNumber}
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          border: `1px solid ${currentTheme.border}`,
                          fontWeight: 'bold',
                          color: currentTheme.text
                        }}>
                          {item.item_code}
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          border: `1px solid ${currentTheme.border}`,
                          maxWidth: '250px'
                        }}>
                          <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {item.item_name || 'N/A'}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center', 
                          border: `1px solid ${currentTheme.border}`,
                          fontWeight: 'bold',
                          color: '#27ae60'
                        }}>
                          {Math.round(item.total_in).toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center', 
                          border: `1px solid ${currentTheme.border}`,
                          fontWeight: 'bold',
                          color: '#e74c3c'
                        }}>
                          {Math.round(item.total_out).toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center', 
                          border: `1px solid ${currentTheme.border}`,
                          fontWeight: 'bold',
                          color: statusColor
                        }}>
                          {Math.round(item.closing_balance).toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center', 
                          border: `1px solid ${currentTheme.border}`
                        }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            backgroundColor: statusBg,
                            color: status === 'Available' ? (isDarkMode ? '#fff' : '#155724') : (isDarkMode ? '#fff' : '#721c24')
                          }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center', 
                          border: `1px solid ${currentTheme.border}`,
                          fontFamily: 'monospace',
                          color: currentTheme.text
                        }}>
                          {item.transactions.length}
                        </td>
                        <td style={{ 
                          padding: '12px', 
                          textAlign: 'center', 
                          border: `1px solid ${currentTheme.border}`,
                          fontSize: '11px',
                          color: isDarkMode ? '#e2e8f0' : '#7f8c8d'
                        }}>
                          {formatDate(item.last_transaction_date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Pagination */}
              {renderPagination()}
              
              {/* Results Info */}
              <div style={{
                padding: '10px 15px',
                backgroundColor: isDarkMode ? '#2d3748' : '#f8f9fa',
                borderTop: `1px solid ${currentTheme.border}`,
                fontSize: '12px',
                color: isDarkMode ? '#e2e8f0' : '#7f8c8d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  Showing {paginatedData.length} of {filteredAndSortedData.length} items
                </span>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="no-print" style={{ 
          padding: '12px 20px',
          backgroundColor: isDarkMode ? '#2d3748' : '#ecf0f1',
          borderTop: `2px solid ${currentTheme.border}`,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button 
            onClick={handleClose}
            style={{
              padding: '10px 30px',
              background: '#7f8c8d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}
          >
            Close Ledger
          </button>
        </div>
      </div>
      
      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#2d3748' : '#f1f1f1'};
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#4a5568' : '#888'};
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#718096' : '#555'};
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        tr:hover td {
          background-color: ${isDarkMode ? '#4a5568 !important' : '#e8f4f8 !important'};
        }
      `}</style>
    </div>
  );
};

export default FlatteningInventoryLedger;