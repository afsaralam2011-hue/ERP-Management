import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  FiDownload, FiPrinter, FiRefreshCw, FiX, FiMessageSquare, 
  FiArrowLeft, FiCheck, FiCheckSquare, FiSquare, FiSearch,
  FiFilter, FiCalendar, FiBox, FiAlertCircle, FiCheckCircle, 
  FiTag, FiLayers, FiCpu, FiTrendingUp, FiTrendingDown
} from 'react-icons/fi';
import { FaWhatsapp, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import './FlatteningInventoryReport.css';

const FlatteningInventoryReportPopup = ({ onClose }) => {
  // ==================== REFS ====================
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const popupRef = useRef(null);
  const closeButtonRef = useRef(null);
  const backButtonRef = useRef(null);

  // ==================== STATE ====================
  // Main Data
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Item Messages
  const [itemMessages, setItemMessages] = useState({});
  
  // Date Filter
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilterType, setDateFilterType] = useState('specific');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  
  // Selection
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'balance',
    direction: 'desc'
  });
  
  // UI State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // ==================== SAFE FUNCTIONS ====================
  const getSafeReference = useCallback((id, prefix) => {
    if (!id) return `${prefix}-N/A`;
    try {
      const idStr = String(id);
      const sliced = idStr.slice(-6);
      return `${prefix}-${sliced || 'N/A'}`;
    } catch (error) {
      console.error('Error slicing id:', error);
      return `${prefix}-N/A`;
    }
  }, []);

  const safeNumber = useCallback((value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  }, []);

  // ==================== CLOSE HANDLERS - 100% FIXED ====================
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    console.log('Closing popup...');
    
    if (onClose && typeof onClose === 'function') {
      try {
        onClose();
      } catch (error) {
        console.error('Error in onClose:', error);
      }
    }
    
    setTimeout(() => {
      setIsClosing(false);
    }, 300);
  }, [onClose, isClosing]);

  const handleBack = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget && !isClosing) {
      handleClose();
    }
  }, [handleClose, isClosing]);

  const handlePopupClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleEscKey = useCallback((e) => {
    if (e.key === 'Escape' && !isClosing) {
      handleClose();
    }
  }, [handleClose, isClosing]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleEscKey]);

  // ==================== FETCH DATA ====================
  const fetchInventoryData = useCallback(async () => {
    if (isClosing) return;
    
    try {
      setLoading(true);
      setError(null);
      setIsRefreshing(true);
      
      // Flattening Section - coil_size کے ساتھ
      let flatteningQuery = supabase
        .from('flatteningsection')
        .select('item_code, item_name, production_quantity, created_at, id, coil_size');
      
      // Spiral Section - per_meter_wt کے ساتھ
      let spiralQuery = supabase
        .from('spiralsection')
        .select('item_code, weight, created_at, raw_material_flatsize, id, per_meter_wt');

      // Date filtering
      if (dateFilterType === 'specific' && selectedDate) {
        const startOfDay = new Date(selectedDate + 'T00:00:00').toISOString();
        const endOfDay = new Date(selectedDate + 'T23:59:59').toISOString();
        
        flatteningQuery = flatteningQuery
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
        
        spiralQuery = spiralQuery
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);
      } 
      else if (dateFilterType === 'range' && startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00').toISOString();
        const end = new Date(endDate + 'T23:59:59').toISOString();
        
        flatteningQuery = flatteningQuery
          .gte('created_at', start)
          .lte('created_at', end);
        
        spiralQuery = spiralQuery
          .gte('created_at', start)
          .lte('created_at', end);
      }

      const [flatteningResult, spiralResult] = await Promise.all([
        flatteningQuery.order('created_at', { ascending: false }),
        spiralQuery.order('created_at', { ascending: false })
      ]);

      if (flatteningResult.error) throw flatteningResult.error;
      if (spiralResult.error) throw spiralResult.error;

      const flatteningData = flatteningResult.data || [];
      const spiralData = spiralResult.data || [];

      // Flattening Summary - coil_size کے ساتھ
      const flatteningSummary = flatteningData.reduce((acc, item) => {
        const key = item.item_code;
        if (!acc[key]) {
          acc[key] = {
            item_code: key,
            item_name: item.item_name,
            total_qty: 0,
            last_updated: item.created_at,
            transactions: [],
            coil_sizes: new Set()
          };
        }
        acc[key].total_qty += safeNumber(item.production_quantity);
        if (item.coil_size) {
          acc[key].coil_sizes.add(String(item.coil_size));
        }
        acc[key].transactions.push({
          type: 'PRODUCTION',
          quantity: safeNumber(item.production_quantity),
          date: item.created_at,
          coil_size: item.coil_size || 'N/A',
          reference: getSafeReference(item.id, 'FLT')
        });
        if (new Date(item.created_at) > new Date(acc[key].last_updated)) {
          acc[key].last_updated = item.created_at;
        }
        return acc;
      }, {});

      // Spiral Summary - per_meter_wt کے ساتھ
      const spiralSummary = spiralData.reduce((acc, item) => {
        const key = item.item_code;
        if (!acc[key]) {
          acc[key] = {
            item_code: key,
            total_weight: 0,
            last_updated: item.created_at,
            transactions: [],
            raw_material_sizes: new Set(),
            per_meter_wts: new Set()
          };
        }
        acc[key].total_weight += safeNumber(item.weight);
        if (item.raw_material_flatsize) {
          acc[key].raw_material_sizes.add(String(item.raw_material_flatsize));
        }
        if (item.per_meter_wt) {
          acc[key].per_meter_wts.add(String(item.per_meter_wt));
        }
        acc[key].transactions.push({
          type: 'CONSUMPTION',
          quantity: safeNumber(item.weight),
          date: item.created_at,
          flatsize: item.raw_material_flatsize || 'N/A',
          per_meter_wt: item.per_meter_wt || 'N/A',
          reference: getSafeReference(item.id, 'SPL')
        });
        if (new Date(item.created_at) > new Date(acc[key].last_updated)) {
          acc[key].last_updated = item.created_at;
        }
        return acc;
      }, {});

      // ✅ Merge Data - SMART WEIGHT REMOVED, ESTIMATED SPIRAL WITH MINUS SUPPORT
      const inventory = Object.values(flatteningSummary).map(flatItem => {
        const spiralItem = spiralSummary[flatItem.item_code];
        const balance = Math.round(flatItem.total_qty - (spiralItem?.total_weight || 0));
        
        let lastUpdatedDate = flatItem.last_updated;
        if (spiralItem?.last_updated && new Date(spiralItem.last_updated) > new Date(lastUpdatedDate)) {
          lastUpdatedDate = spiralItem.last_updated;
        }
        
        const coilSizes = flatItem.coil_sizes 
          ? Array.from(flatItem.coil_sizes).join(', ') 
          : 'N/A';
        
        const rawMaterialSizes = spiralItem?.raw_material_sizes 
          ? Array.from(spiralItem.raw_material_sizes).join(', ') 
          : 'N/A';
        
        const perMeterWts = spiralItem?.per_meter_wts 
          ? Array.from(spiralItem.per_meter_wts).join(', ') 
          : 'N/A';
        
        // ✅ Estimated Spiral Calculation (Balance ÷ Per Meter WT)
        // PLUS میں بھی اور MINUS میں بھی کام کرے گا
        let estimatedSpiral = 0;
        let avgPerMeterWt = 0;
        
        if (spiralItem?.per_meter_wts && spiralItem.per_meter_wts.size > 0) {
          // اوسط Per Meter WT نکالیں
          const wts = Array.from(spiralItem.per_meter_wts).map(w => safeNumber(w));
          avgPerMeterWt = wts.reduce((a, b) => a + b, 0) / wts.length;
          
          // اگر Per Meter WT موجود ہے
          if (avgPerMeterWt > 0) {
            estimatedSpiral = balance / avgPerMeterWt;
            // 2 decimal places تک رکھیں
            estimatedSpiral = Math.round(estimatedSpiral * 100) / 100;
          }
        }
        
        return {
          id: flatItem.item_code,
          item_code: flatItem.item_code,
          item_name: flatItem.item_name || 'N/A',
          flattening_qty: flatItem.total_qty,
          flattening_transactions: flatItem.transactions || [],
          coil_size: coilSizes,
          spiral_qty: spiralItem?.total_weight || 0,
          spiral_transactions: spiralItem?.transactions || [],
          raw_material_flatsize: rawMaterialSizes,
          per_meter_wt: perMeterWts,
          avg_per_meter_wt: avgPerMeterWt > 0 ? Math.round(avgPerMeterWt * 1000) / 1000 : 0,
          balance: balance,
          estimated_spiral: estimatedSpiral, // ✅ PLUS/MINUS دونوں میں کام کرے گا
          status: balance >= 0 ? 'Available' : 'Deficit',
          last_updated: lastUpdatedDate,
          transaction_count: (flatItem.transactions?.length || 0) + (spiralItem?.transactions?.length || 0)
        };
      });

      // Add spiral-only items
      Object.keys(spiralSummary).forEach(key => {
        if (!flatteningSummary[key]) {
          const spiralItem = spiralSummary[key];
          const rawMaterialSizes = spiralItem.raw_material_sizes 
            ? Array.from(spiralItem.raw_material_sizes).join(', ') 
            : 'N/A';
          
          const perMeterWts = spiralItem.per_meter_wts 
            ? Array.from(spiralItem.per_meter_wts).join(', ') 
            : 'N/A';
          
          // ✅ Estimated Spiral for spiral-only items (negative balance)
          let estimatedSpiral = 0;
          let avgPerMeterWt = 0;
          
          if (spiralItem.per_meter_wts && spiralItem.per_meter_wts.size > 0) {
            const wts = Array.from(spiralItem.per_meter_wts).map(w => safeNumber(w));
            avgPerMeterWt = wts.reduce((a, b) => a + b, 0) / wts.length;
            
            if (avgPerMeterWt > 0) {
              estimatedSpiral = -spiralItem.total_weight / avgPerMeterWt;
              estimatedSpiral = Math.round(estimatedSpiral * 100) / 100;
            }
          }
          
          inventory.push({
            id: key,
            item_code: key,
            item_name: 'N/A',
            flattening_qty: 0,
            flattening_transactions: [],
            coil_size: 'N/A',
            spiral_qty: spiralItem.total_weight,
            spiral_transactions: spiralItem.transactions || [],
            raw_material_flatsize: rawMaterialSizes,
            per_meter_wt: perMeterWts,
            avg_per_meter_wt: avgPerMeterWt > 0 ? Math.round(avgPerMeterWt * 1000) / 1000 : 0,
            balance: -spiralItem.total_weight,
            estimated_spiral: -estimatedSpiral, // ✅ MINUS میں دکھائے گا
            status: 'Deficit',
            last_updated: spiralItem.last_updated,
            transaction_count: spiralItem.transactions?.length || 0
          });
        }
      });

      // Sort inventory
      inventory.sort((a, b) => {
        if (sortConfig.key === 'item_code') {
          return sortConfig.direction === 'asc' 
            ? (a.item_code || '').localeCompare(b.item_code || '')
            : (b.item_code || '').localeCompare(a.item_code || '');
        }
        if (sortConfig.key === 'balance') {
          return sortConfig.direction === 'asc' 
            ? (a.balance || 0) - (b.balance || 0)
            : (b.balance || 0) - (a.balance || 0);
        }
        if (sortConfig.key === 'estimated_spiral') {
          return sortConfig.direction === 'asc' 
            ? (a.estimated_spiral || 0) - (b.estimated_spiral || 0)
            : (b.estimated_spiral || 0) - (a.estimated_spiral || 0);
        }
        if (sortConfig.key === 'status') {
          const aStatus = a.status || '';
          const bStatus = b.status || '';
          if (aStatus === bStatus) return 0;
          return sortConfig.direction === 'asc'
            ? (aStatus === 'Available' ? -1 : 1)
            : (aStatus === 'Available' ? 1 : -1);
        }
        return (b.balance || 0) - (a.balance || 0);
      });
      
      setInventoryData(inventory);
      
      // Initialize selected items
      const initialSelected = inventory.reduce((acc, item) => {
        if (item && item.item_code) {
          acc[item.item_code] = true;
        }
        return acc;
      }, {});
      
      setSelectedItems(initialSelected);
      setSelectAll(true);
      setSuccess(`Loaded ${inventory.length} items successfully`);

    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedDate, dateFilterType, startDate, endDate, sortConfig, isClosing, getSafeReference, safeNumber]);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // ==================== FILTERED DATA ====================
  const filteredData = useMemo(() => {
    let filtered = [...inventoryData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.item_code?.toLowerCase() || '').includes(term) ||
        (item.item_name?.toLowerCase() || '').includes(term) ||
        (item.raw_material_flatsize?.toLowerCase() || '').includes(term) ||
        (item.coil_size?.toLowerCase() || '').includes(term) ||
        (item.per_meter_wt?.toLowerCase() || '').includes(term)
      );
    }

    if (statusFilter === 'available') {
      filtered = filtered.filter(item => item.status === 'Available');
    } else if (statusFilter === 'deficit') {
      filtered = filtered.filter(item => item.status === 'Deficit');
    }

    return filtered;
  }, [inventoryData, searchTerm, statusFilter]);

  // ==================== SELECTION HANDLERS ====================
  const handleItemSelect = useCallback((itemCode) => {
    if (!itemCode) return;
    setSelectedItems(prev => {
      const newState = {
        ...prev,
        [itemCode]: !prev[itemCode]
      };
      const allSelected = Object.values(newState).every(Boolean);
      setSelectAll(allSelected);
      return newState;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelectedItems = {};
    filteredData.forEach(item => {
      if (item && item.item_code) {
        newSelectedItems[item.item_code] = newSelectAll;
      }
    });
    setSelectedItems(newSelectedItems);
  }, [selectAll, filteredData]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean).length;
  }, [selectedItems]);

  // ==================== TOTALS ====================
  const totals = useMemo(() => {
    let totalAvailable = 0;
    let totalItems = inventoryData.length;
    let availableItems = 0;
    let deficitItems = 0;
    let totalProduction = 0;
    let totalConsumption = 0;
    let totalEstimatedSpiral = 0;
    let totalPositiveSpiral = 0; // PLUS میٹرز
    let totalNegativeSpiral = 0; // MINUS میٹرز

    inventoryData.forEach(item => {
      totalProduction += item.flattening_qty || 0;
      totalConsumption += item.spiral_qty || 0;
      totalEstimatedSpiral += item.estimated_spiral || 0;
      
      if (item.estimated_spiral > 0) {
        totalPositiveSpiral += item.estimated_spiral;
      } else {
        totalNegativeSpiral += Math.abs(item.estimated_spiral || 0);
      }
      
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
      deficitItems,
      totalProduction: Math.round(totalProduction),
      totalConsumption: Math.round(totalConsumption),
      totalEstimatedSpiral: Math.round(totalEstimatedSpiral * 100) / 100,
      totalPositiveSpiral: Math.round(totalPositiveSpiral * 100) / 100,
      totalNegativeSpiral: Math.round(totalNegativeSpiral * 100) / 100
    };
  }, [inventoryData]);

  // ==================== SORT HANDLER ====================
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // ==================== FORMATTING ====================
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
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
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  }, []);

  // ==================== MESSAGE HANDLERS ====================
  const editItemMessage = useCallback((itemCode) => {
    if (!itemCode) return;
    const currentMessage = itemMessages[itemCode] || '';
    const newMessage = prompt(`Enter message for ${itemCode}:`, currentMessage);
    
    if (newMessage !== null) {
      setItemMessages(prev => ({
        ...prev,
        [itemCode]: newMessage.trim()
      }));
    }
  }, [itemMessages]);

  // ==================== DATE FILTER HANDLERS ====================
  const applyDateFilter = useCallback(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  const setToToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setDateFilterType('specific');
    setShowDateRange(false);
  }, []);

  const showAllData = useCallback(() => {
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setDateFilterType('all');
    setShowDateRange(false);
  }, []);

  // ==================== WHATSAPP HANDLERS ====================
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
    
    let message = `*🏭 CONTROL CABLE DIVISION*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*📊 FLATTENING INVENTORY REPORT WITH ESTIMATED SPIRAL*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `📅 Date: ${formattedDate}\n`;
    
    if (dateFilterType === 'specific' && selectedDate) {
      message += `🎯 Report For: ${selectedDate}\n`;
    } else if (dateFilterType === 'range' && startDate && endDate) {
      message += `📆 From: ${startDate} To: ${endDate}\n`;
    }
    
    message += `✅ Selected Items: ${selectedItemsData.length}/${inventoryData.length}\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n\n`;
    
    message += `*📋 SELECTED ITEMS LIST WITH ESTIMATED SPIRAL:*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n\n`;
    
    selectedItemsData.forEach((item, index) => {
      const itemMsg = itemMessages[item.item_code];
      message += `*${index + 1}. ${item.item_code}*\n`;
      message += `   📦 ${item.item_name || 'N/A'}\n`;
      if (item.coil_size !== 'N/A') {
        message += `   🎥 Coil Size: ${item.coil_size}\n`;
      }
      if (item.raw_material_flatsize !== 'N/A') {
        message += `   📐 Raw Size: ${item.raw_material_flatsize}\n`;
      }
      if (item.per_meter_wt !== 'N/A') {
        message += `   ⚖️ Per Meter WT: ${item.per_meter_wt} KG/m\n`;
      }
      message += `   ⚙️ Flattening: ${Math.round(item.flattening_qty).toLocaleString()} KG\n`;
      message += `   🔩 Spiral Used: ${Math.round(item.spiral_qty).toLocaleString()} KG\n`;
      message += `   ⚖️ Current Balance: ${item.balance.toLocaleString()} KG\n`;
      
      // ✅ Estimated Spiral - PLUS/MINUS دونوں میں دکھائے گا
      if (item.estimated_spiral > 0) {
        message += `   *🔮 ESTIMATED SPIRAL: +${item.estimated_spiral.toLocaleString()} METERS*\n`;
        message += `   *   (Can produce ${(item.estimated_spiral * item.avg_per_meter_wt).toLocaleString()} KG more)*\n`;
        message += `   *   Based on Avg Per Meter WT: ${item.avg_per_meter_wt} KG/m*\n`;
      } else if (item.estimated_spiral < 0) {
        message += `   *🔻 EXCESS USAGE: ${item.estimated_spiral.toLocaleString()} METERS*\n`;
        message += `   *   (Used ${Math.abs(item.estimated_spiral * item.avg_per_meter_wt).toLocaleString()} KG extra)*\n`;
        message += `   *   Based on Avg Per Meter WT: ${item.avg_per_meter_wt} KG/m*\n`;
      } else {
        message += `   🔮 Estimated Spiral: 0 METERS\n`;
      }
      
      message += `   📊 Status: ${item.status === 'Available' ? '✅ AVAILABLE' : '⚠️ DEFICIT'}\n`;
      message += `   🕐 Last: ${formatDate(item.last_updated)}\n`;
      if (itemMsg?.trim()) {
        message += `   💬 Note: ${itemMsg}\n`;
      }
      message += `\n`;
    });
    
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*📈 SUMMARY*\n`;
    message += `📦 Total Items: ${totals.totalItems}\n`;
    message += `✅ Available: ${totals.availableItems}\n`;
    message += `⚠️ Deficit: ${totals.deficitItems}\n`;
    message += `⚙️ Production: ${totals.totalProduction.toLocaleString()} KG\n`;
    message += `🔩 Consumption: ${totals.totalConsumption.toLocaleString()} KG\n`;
    message += `⚖️ Net Balance: ${totals.totalAvailable.toLocaleString()} KG\n`;
    message += `*🔮 TOTAL ESTIMATED SPIRAL: ${totals.totalEstimatedSpiral.toLocaleString()} METERS*\n`;
    message += `*   ✅ Can Produce: +${totals.totalPositiveSpiral.toLocaleString()} METERS*\n`;
    message += `*   🔻 Excess Used: -${totals.totalNegativeSpiral.toLocaleString()} METERS*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `_Generated by Control Cable System_`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }, [inventoryData, selectedItems, itemMessages, dateFilterType, selectedDate, startDate, endDate, formatDate, totals]);

  const sendItemWhatsApp = useCallback((item) => {
    if (!item) return;
    const itemMessage = itemMessages[item.item_code] || '';
    let message = `*🏭 CONTROL CABLE DIVISION*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*📊 ITEM DETAIL REPORT WITH ESTIMATED SPIRAL*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n\n`;
    message += `*🔖 Item Code:* ${item.item_code}\n`;
    message += `*📦 Item Name:* ${item.item_name || 'N/A'}\n`;
    if (item.coil_size !== 'N/A') {
      message += `*🎥 Coil Size:* ${item.coil_size}\n`;
    }
    if (item.raw_material_flatsize !== 'N/A') {
      message += `*📐 Raw Material Size:* ${item.raw_material_flatsize}\n`;
    }
    if (item.per_meter_wt !== 'N/A') {
      message += `*⚖️ Per Meter Weight:* ${item.per_meter_wt} KG/m\n`;
    }
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*⚙️ PRODUCTION (Flattening):*\n`;
    message += `   Total Qty: ${Math.round(item.flattening_qty).toLocaleString()} KG\n`;
    message += `   Transactions: ${item.flattening_transactions?.length || 0}\n\n`;
    message += `*🔩 CONSUMPTION (Spiral):*\n`;
    message += `   Total Weight: ${Math.round(item.spiral_qty).toLocaleString()} KG\n`;
    message += `   Transactions: ${item.spiral_transactions?.length || 0}\n\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*⚖️ CURRENT BALANCE:* ${item.balance.toLocaleString()} KG\n`;
    
    // ✅ Estimated Spiral Detail - PLUS/MINUS دونوں میں
    if (item.estimated_spiral > 0) {
      message += `*🔮 ESTIMATED SPIRAL:* +${item.estimated_spiral.toLocaleString()} METERS\n`;
      message += `*   Weight Equivalent:* +${(item.estimated_spiral * item.avg_per_meter_wt).toLocaleString()} KG\n`;
      message += `*   Average Per Meter WT:* ${item.avg_per_meter_wt} KG/m\n`;
      message += `*   Formula:* Balance (${item.balance} KG) ÷ Avg Per Meter WT (${item.avg_per_meter_wt} KG/m)\n`;
    } else if (item.estimated_spiral < 0) {
      message += `*🔻 EXCESS USAGE:* ${item.estimated_spiral.toLocaleString()} METERS\n`;
      message += `*   Weight Equivalent:* -${Math.abs(item.estimated_spiral * item.avg_per_meter_wt).toLocaleString()} KG\n`;
      message += `*   Average Per Meter WT:* ${item.avg_per_meter_wt} KG/m\n`;
      message += `*   Formula:* Deficit (${Math.abs(item.balance)} KG) ÷ Avg Per Meter WT (${item.avg_per_meter_wt} KG/m)\n`;
    } else {
      message += `*🔮 ESTIMATED SPIRAL:* 0 METERS\n`;
    }
    
    message += `*📊 STATUS:* ${item.status === 'Available' ? '✅ AVAILABLE' : '⚠️ DEFICIT'}\n`;
    message += `*🕐 LAST UPDATED:* ${formatDateTime(item.last_updated)}\n`;
    if (itemMessage) {
      message += `*💬 MESSAGE:* ${itemMessage}\n`;
    }
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `_Generated by Control Cable System_`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }, [itemMessages, formatDateTime]);

  const sendAllWhatsApp = useCallback(() => {
    const allSelected = {};
    inventoryData.forEach(item => {
      if (item && item.item_code) {
        allSelected[item.item_code] = true;
      }
    });
    setSelectedItems(allSelected);
    setSelectAll(true);
    setTimeout(sendSelectedWhatsApp, 100);
  }, [inventoryData, sendSelectedWhatsApp]);

  // ==================== PDF HANDLER ====================
  const downloadPDF = useCallback(() => {
    if (tableRef.current) {
      if (!window.html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
          const opt = {
            margin: 0.5,
            filename: `flattening-inventory-estimated-${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
          };
          window.html2pdf().set(opt).from(tableRef.current).save();
        };
        document.body.appendChild(script);
      } else {
        const opt = {
          margin: 0.5,
          filename: `flattening-inventory-estimated-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, letterRendering: true },
          jsPDF: { unit: 'in', format: 'a3', orientation: 'landscape' }
        };
        window.html2pdf().set(opt).from(tableRef.current).save();
      }
    }
  }, []);

  // ==================== EXPORT CSV ====================
  const exportCSV = useCallback(() => {
    if (inventoryData.length === 0) return;

    const headers = [
      'Item Code', 
      'Item Name', 
      'Coil Size',
      'Raw Material Size',
      'Per Meter WT (KG/m)',
      'Avg Per Meter WT',
      'Flattening (KG)', 
      'Spiral Used (KG)', 
      'Current Balance (KG)', 
      'ESTIMATED SPIRAL (METERS)',
      'Status', 
      'Last Updated',
      'Transactions'
    ];
    
    const rows = inventoryData.map(item => {
      return [
        item.item_code || '',
        item.item_name || '',
        item.coil_size || '',
        item.raw_material_flatsize || '',
        item.per_meter_wt || '',
        item.avg_per_meter_wt > 0 ? item.avg_per_meter_wt.toFixed(3) : '',
        Math.round(item.flattening_qty || 0).toLocaleString(),
        Math.round(item.spiral_qty || 0).toLocaleString(),
        (item.balance || 0).toLocaleString(),
        item.estimated_spiral ? item.estimated_spiral.toLocaleString() : '0',
        item.status || '',
        formatDate(item.last_updated),
        item.transaction_count || 0
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `flattening-inventory-estimated-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 100);
  }, [inventoryData, formatDate]);

  // ==================== RENDER SORT ICON ====================
  const renderSortIcon = useCallback((key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  }, [sortConfig]);

  // ==================== CLEANUP ====================
  useEffect(() => {
    return () => {
      setInventoryData([]);
      setError(null);
      setSuccess(null);
    };
  }, []);

  // ==================== MAIN RENDER ====================
  if (isClosing) {
    return null;
  }

  return (
    <div 
      className="report-popup-overlay" 
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999,
        padding: '20px'
      }}
    >
      <div 
        ref={popupRef}
        className="report-popup-container" 
        onClick={handlePopupClick}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '2000px',
          height: '95vh',
          maxHeight: '95vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* ========== HEADER ========== */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #f59e0b'
        }}>
          <button 
            ref={backButtonRef}
            onClick={handleBack}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            title="Go Back"
          >
            <FiArrowLeft size={22} />
          </button>
          
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <FiBox size={28} color="#f59e0b" />
              <h1 style={{ 
                margin: 0, 
                fontSize: '26px', 
                fontWeight: '700',
                letterSpacing: '0.5px',
                fontFamily: "'Inter', 'Segoe UI', sans-serif"
              }}>
                CONTROL CABLE DIVISION
              </h1>
            </div>
            <p style={{ 
              margin: '6px 0 0 0', 
              fontSize: '15px',
              opacity: 0.9,
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <FiTag size={14} />
              Flattening Inventory Report with Estimated Spiral
              {inventoryData.length > 0 && (
                <span style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>
                  {inventoryData.length} Items
                </span>
              )}
            </p>
          </div>
          
          <button 
            ref={closeButtonRef}
            onClick={handleClose}
            disabled={isClosing}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              cursor: isClosing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
              opacity: isClosing ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isClosing) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            title="Close Report"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* ========== FILTERS AND TOOLBAR ========== */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              flex: 1,
              minWidth: '300px',
              position: 'relative'
            }}>
              <FiSearch size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b'
              }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Item Code, Name, Coil Size, Raw Size, Per Meter Wt..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: showFilters ? '#f59e0b' : '#f1f5f9',
                  color: showFilters ? 'white' : '#334155',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <FiFilter size={16} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              <button
                onClick={showAllData}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <FiRefreshCw size={16} />
                All Data
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {/* Date Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  <FiCalendar style={{ marginRight: '6px' }} />
                  Date Filter
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    value={dateFilterType}
                    onChange={(e) => {
                      setDateFilterType(e.target.value);
                      setShowDateRange(e.target.value === 'range');
                    }}
                    style={{
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      flex: 1
                    }}
                  >
                    <option value="specific">Specific Date</option>
                    <option value="range">Date Range</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                
                {dateFilterType === 'specific' && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        flex: 1
                      }}
                    />
                    <button
                      onClick={setToToday}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      Today
                    </button>
                  </div>
                )}

                {showDateRange && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="From"
                      style={{
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        flex: 1
                      }}
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="To"
                      style={{
                        padding: '10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        flex: 1
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={applyDateFilter}
                  disabled={loading}
                  style={{
                    marginTop: '10px',
                    padding: '10px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  Apply Date Filter
                </button>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                >
                  <option value="all">All Items</option>
                  <option value="available">Available Only</option>
                  <option value="deficit">Deficit Only</option>
                </select>
              </div>

              {/* Selection Tools */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Selection Tools
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleSelectAll}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: selectAll ? '#ef4444' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {selectAll ? <FiSquare size={14} /> : <FiCheckSquare size={14} />}
                    {selectAll ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <p style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                  Selected: {selectedCount} items
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={fetchInventoryData}
                disabled={loading || isClosing}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (loading || isClosing) ? 'not-allowed' : 'pointer',
                  opacity: (loading || isClosing) ? 0.7 : 1
                }}
              >
                <FiRefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>

              <button
                onClick={sendSelectedWhatsApp}
                disabled={selectedCount === 0 || isClosing}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (selectedCount === 0 || isClosing) ? 'not-allowed' : 'pointer',
                  opacity: (selectedCount === 0 || isClosing) ? 0.7 : 1
                }}
              >
                <FaWhatsapp size={14} />
                WhatsApp ({selectedCount})
              </button>

              <button
                onClick={sendAllWhatsApp}
                disabled={inventoryData.length === 0 || isClosing}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#075E54',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (inventoryData.length === 0 || isClosing) ? 'not-allowed' : 'pointer',
                  opacity: (inventoryData.length === 0 || isClosing) ? 0.7 : 1
                }}
              >
                <FaWhatsapp size={14} />
                All Items
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={downloadPDF}
                disabled={inventoryData.length === 0 || isClosing}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (inventoryData.length === 0 || isClosing) ? 'not-allowed' : 'pointer',
                  opacity: (inventoryData.length === 0 || isClosing) ? 0.7 : 1
                }}
              >
                <FaFilePdf size={14} />
                PDF
              </button>

              <button
                onClick={exportCSV}
                disabled={inventoryData.length === 0 || isClosing}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (inventoryData.length === 0 || isClosing) ? 'not-allowed' : 'pointer',
                  opacity: (inventoryData.length === 0 || isClosing) ? 0.7 : 1
                }}
              >
                <FaFileExcel size={14} />
                CSV
              </button>

              <button
                onClick={() => window.print()}
                disabled={isClosing}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isClosing ? 'not-allowed' : 'pointer',
                  opacity: isClosing ? 0.7 : 1
                }}
              >
                <FiPrinter size={14} />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* ========== SUMMARY CARDS - SMART WEIGHT REMOVED ========== */}
        {!loading && inventoryData.length > 0 && (
          <div style={{
            padding: '20px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                <FiBox size={12} style={{ marginRight: '4px' }} />
                Total Items
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{totals.totalItems}</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: '1px solid #86efac'
            }}>
              <div style={{ fontSize: '12px', color: '#166534', marginBottom: '4px' }}>
                <FiCheckCircle size={12} style={{ marginRight: '4px' }} />
                Available
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#15803d' }}>{totals.availableItems}</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>
                <FiAlertCircle size={12} style={{ marginRight: '4px' }} />
                Deficit
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#b91c1c' }}>{totals.deficitItems}</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>
                ⚙️ Production
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb' }}>{totals.totalProduction.toLocaleString()} KG</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#fffbeb',
              borderRadius: '12px',
              border: '1px solid #fed7aa'
            }}>
              <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>
                🔩 Consumption
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#b45309' }}>{totals.totalConsumption.toLocaleString()} KG</div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#fff7ed',
              borderRadius: '12px',
              border: '1px solid #fdba74'
            }}>
              <div style={{ fontSize: '12px', color: '#9a3412', marginBottom: '4px' }}>
                <FiTrendingUp size={12} style={{ marginRight: '4px' }} />
                Can Produce
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#c2410c' }}>
                +{totals.totalPositiveSpiral.toLocaleString()} m
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>
                <FiTrendingDown size={12} style={{ marginRight: '4px' }} />
                Excess Used
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#b91c1c' }}>
                -{totals.totalNegativeSpiral.toLocaleString()} m
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: totals.totalAvailable >= 0 ? '#f0fdf4' : '#fef2f2',
              borderRadius: '12px',
              border: `1px solid ${totals.totalAvailable >= 0 ? '#86efac' : '#fecaca'}`
            }}>
              <div style={{ fontSize: '12px', color: totals.totalAvailable >= 0 ? '#166534' : '#991b1b', marginBottom: '4px' }}>
                ⚖️ Net Balance
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: totals.totalAvailable >= 0 ? '#15803d' : '#b91c1c' 
              }}>
                {totals.totalAvailable.toLocaleString()} KG
              </div>
            </div>
          </div>
        )}

        {/* ========== ERROR MESSAGE ========== */}
        {error && (
          <div style={{
            margin: '16px 24px',
            padding: '16px 20px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <FiAlertCircle size={20} />
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#b91c1c',
                cursor: 'pointer'
              }}
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        {/* ========== MAIN CONTENT ========== */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
          backgroundColor: '#ffffff'
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #f59e0b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px'
              }}></div>
              <h3 style={{ color: '#334155', fontSize: '18px', marginBottom: '8px' }}>
                Loading Inventory Data...
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Please wait while we fetch the records
              </p>
            </div>
          ) : inventoryData.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '400px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px'
            }}>
              <FiBox size={64} color="#94a3b8" style={{ marginBottom: '20px' }} />
              <h3 style={{ color: '#334155', fontSize: '20px', marginBottom: '8px' }}>
                No Inventory Data Found
              </h3>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px', textAlign: 'center' }}>
                No records match your current filters.<br />
                Try adjusting your date range or search criteria.
              </p>
              <button
                onClick={showAllData}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <FiRefreshCw size={16} />
                Show All Data
              </button>
            </div>
          ) : (
            <>
              {/* ========== TABLE - SMART WEIGHT REMOVED, ESTIMATED SPIRAL WITH PLUS/MINUS ========== */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'auto',
                maxHeight: 'calc(100vh - 550px)'
              }}>
                <table 
                  ref={tableRef}
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px',
                    minWidth: '1700px'
                  }}
                >
                  <thead style={{
                    backgroundColor: '#f8fafc',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <tr>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px',
                        width: '40px'
                      }}>
                        <button
                          onClick={handleSelectAll}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: selectAll ? '#2563eb' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {selectAll ? <FiCheckSquare size={18} /> : <FiSquare size={18} />}
                        </button>
                      </th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px',
                        width: '50px'
                      }}>#</th>
                      <th 
                        onClick={() => handleSort('item_code')}
                        style={{ 
                          padding: '16px 12px', 
                          textAlign: 'left',
                          borderBottom: '2px solid #e2e8f0',
                          color: '#334155',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Item Code {renderSortIcon('item_code')}
                      </th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'left',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>Item Name</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <FiLayers size={14} />
                          Coil Size
                        </div>
                      </th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <FiBox size={14} />
                          Raw Size
                        </div>
                      </th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <FiCpu size={14} />
                          Per Meter WT
                        </div>
                      </th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>Flattening (KG)</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>Spiral Used (KG)</th>
                      <th 
                        onClick={() => handleSort('balance')}
                        style={{ 
                          padding: '16px 12px', 
                          textAlign: 'center',
                          borderBottom: '2px solid #e2e8f0',
                          color: '#334155',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Balance (KG) {renderSortIcon('balance')}
                      </th>
                      <th 
                        onClick={() => handleSort('estimated_spiral')}
                        style={{ 
                          padding: '16px 12px', 
                          textAlign: 'center',
                          borderBottom: '2px solid #e2e8f0',
                          color: '#334155',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          ESTIMATED SPIRAL (m)
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('status')}
                        style={{ 
                          padding: '16px 12px', 
                          textAlign: 'center',
                          borderBottom: '2px solid #e2e8f0',
                          color: '#334155',
                          fontWeight: '600',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Status {renderSortIcon('status')}
                      </th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px'
                      }}>Last Updated</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px',
                        width: '150px'
                      }}>Message</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'center',
                        borderBottom: '2px solid #e2e8f0',
                        color: '#334155',
                        fontWeight: '600',
                        fontSize: '13px',
                        width: '100px'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => {
                      const isSelected = selectedItems[item.item_code] || false;
                      const message = itemMessages[item.item_code] || '';
                      const isPositive = item.estimated_spiral > 0;
                      const isNegative = item.estimated_spiral < 0;
                      
                      return (
                        <tr 
                          key={item.id}
                          style={{
                            backgroundColor: isSelected ? '#eff6ff' : (index % 2 === 0 ? '#ffffff' : '#fafbfc'),
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 
                            isSelected ? '#eff6ff' : (index % 2 === 0 ? '#ffffff' : '#fafbfc')
                          }
                        >
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleItemSelect(item.item_code)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: isSelected ? '#2563eb' : '#64748b'
                              }}
                            >
                              {isSelected ? <FiCheck size={18} /> : <FiSquare size={18} />}
                            </button>
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            color: '#64748b',
                            fontWeight: '500'
                          }}>
                            {index + 1}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'left',
                            fontWeight: '600',
                            color: '#0f172a'
                          }}>
                            {item.item_code}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'left',
                            color: '#334155'
                          }}>
                            {item.item_name || 'N/A'}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            color: '#2563eb',
                            fontWeight: '500',
                            fontSize: '12px'
                          }}>
                            {item.coil_size}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            color: '#7e22ce',
                            fontWeight: '500',
                            fontSize: '12px'
                          }}>
                            {item.raw_material_flatsize}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            color: '#b45309',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}>
                            {item.per_meter_wt}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#2563eb'
                          }}>
                            {Math.round(item.flattening_qty).toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#dc2626'
                          }}>
                            {Math.round(item.spiral_qty).toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            fontWeight: '700',
                            color: item.balance >= 0 ? '#15803d' : '#b91c1c'
                          }}>
                            {item.balance.toLocaleString()}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            fontWeight: '700',
                            color: isPositive ? '#c2410c' : (isNegative ? '#b91c1c' : '#64748b'),
                            backgroundColor: isPositive ? '#fff7ed' : (isNegative ? '#fee2e2' : 'transparent')
                          }}>
                            {item.estimated_spiral !== 0 ? (
                              <div>
                                <div style={{ 
                                  fontSize: '15px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}>
                                  {isPositive ? (
                                    <>
                                      <FiTrendingUp size={14} color="#c2410c" />
                                      <span>+{item.estimated_spiral.toLocaleString()} m</span>
                                    </>
                                  ) : isNegative ? (
                                    <>
                                      <FiTrendingDown size={14} color="#b91c1c" />
                                      <span>{item.estimated_spiral.toLocaleString()} m</span>
                                    </>
                                  ) : (
                                    '0 m'
                                  )}
                                </div>
                                {item.avg_per_meter_wt > 0 && (
                                  <div style={{ 
                                    fontSize: '11px', 
                                    color: isPositive ? '#9a3412' : '#991b1b',
                                    marginTop: '2px'
                                  }}>
                                    ≈ {Math.abs(Math.round(item.estimated_spiral * item.avg_per_meter_wt)).toLocaleString()} KG
                                  </div>
                                )}
                              </div>
                            ) : (
                              '0 m'
                            )}
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '6px 12px',
                              borderRadius: '30px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: item.status === 'Available' ? '#dcfce7' : '#fee2e2',
                              color: item.status === 'Available' ? '#15803d' : '#b91c1c'
                            }}>
                              {item.status === 'Available' ? (
                                <FiCheckCircle size={12} style={{ marginRight: '6px' }} />
                              ) : (
                                <FiAlertCircle size={12} style={{ marginRight: '6px' }} />
                              )}
                              {item.status}
                            </span>
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '12px'
                          }}>
                            {formatDate(item.last_updated)}
                          </td>
                          <td style={{ 
                            padding: '14px 12px', 
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '12px',
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {message || '-'}
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => editItemMessage(item.item_code)}
                                style={{
                                  padding: '6px',
                                  backgroundColor: '#f1f5f9',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: '#475569',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Add/Edit Message"
                              >
                                <FiMessageSquare size={14} />
                              </button>
                              <button
                                onClick={() => sendItemWhatsApp(item)}
                                style={{
                                  padding: '6px',
                                  backgroundColor: '#25D366',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title="Send on WhatsApp"
                              >
                                <FaWhatsapp size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ========== FOOTER ========== */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ color: '#64748b', fontSize: '13px' }}>
                  Showing <strong>{filteredData.length}</strong> of <strong>{inventoryData.length}</strong> items
                  {totals.totalEstimatedSpiral !== 0 && (
                    <span style={{ marginLeft: '16px' }}>
                      <span style={{ color: '#c2410c', fontWeight: '600' }}>
                        🔮 Can Produce: +{totals.totalPositiveSpiral.toLocaleString()} m
                      </span>
                      <span style={{ color: '#b91c1c', fontWeight: '600', marginLeft: '12px' }}>
                        🔻 Excess Used: -{totals.totalNegativeSpiral.toLocaleString()} m
                      </span>
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  disabled={isClosing}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: isClosing ? 'not-allowed' : 'pointer',
                    opacity: isClosing ? 0.7 : 1
                  }}
                >
                  <FiX size={16} />
                  Close Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========== GLOBAL STYLES ========== */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
        
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        button {
          -webkit-tap-highlight-color: transparent;
        }
        
        button:focus {
          outline: none;
        }
        
        button:disabled {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default FlatteningInventoryReportPopup;