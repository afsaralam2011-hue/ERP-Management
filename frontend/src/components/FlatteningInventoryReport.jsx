import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  FiDownload, FiPrinter, FiRefreshCw, FiX, FiMessageSquare, 
  FiArrowLeft, FiCheck, FiCheckSquare, FiSquare, FiSearch,
  FiFilter, FiCalendar, FiBox, FiAlertCircle, FiCheckCircle, 
  FiTag, FiLayers, FiCpu, FiTrendingUp, FiTrendingDown,
  FiGitMerge, FiSun, FiMoon, FiClock, FiHome, FiPieChart,
  FiBarChart2, FiDroplet, FiActivity, FiAnchor, FiCompass,
  FiMap, FiGlobe, FiAward, FiTarget, FiZap, FiStar, FiPlus, FiMinus,
  FiCircle, FiGrid, FiList, FiInfo, FiTrendingUp as FiTrend
} from 'react-icons/fi';
import { FaWhatsapp, FaFilePdf, FaFileExcel, FaRobot, FaChartLine, FaChartPie, FaChartBar } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import './FlatteningInventoryReport.css';

// ==================== IMPORTS FOR CHARTS AND CARDS ====================
import ProductionBarChart from './charts/ProductionBarChart';
import ProductionLineChart from './charts/ProductionLineChart';
import ProductionPieChart from './charts/ProductionPieChart';
import StatCard from './cards/StatCard';

const FlatteningInventoryReport = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Refs
  const tableRef = useRef(null);
  const searchInputRef = useRef(null);
  const chartRef = useRef(null);
  const initialFetchDone = useRef(false);
  const itemSearchRef = useRef(null);

  // State
  const [inventoryData, setInventoryData] = useState([]);
  const [flatteningData, setFlatteningData] = useState([]);
  const [spiralData, setSpiralData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemMessages, setItemMessages] = useState({});
  
  // ==================== NEW STATES FOR AVERAGE DAILY USAGE ====================
  const [selectedDepartment, setSelectedDepartment] = useState('both');
  const [averageUsageData, setAverageUsageData] = useState({
    flattening: [],
    spiral: []
  });
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [selectedItemsForAvg, setSelectedItemsForAvg] = useState([]);
  const [dateRangeForAvg, setDateRangeForAvg] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Date Filter
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilterType, setDateFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateRange, setShowDateRange] = useState(false);
  
  // Selection
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'balance', direction: 'desc' });
  
  // UI State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChartItem, setSelectedChartItem] = useState(null);
  const [showAIAnalysis, setShowAIAnalysis] = useState(true);
  const [weeklyView, setWeeklyView] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekRange());
  const [aiMessages, setAiMessages] = useState({});
  
  // ==================== NEW STATE FOR CHARTS ====================
  const [activeChartTab, setActiveChartTab] = useState('bar');
  const [chartTimeRange, setChartTimeRange] = useState('month'); // week, month, quarter, year
  const [selectedItemForChart, setSelectedItemForChart] = useState(null);

  // Helper function for current week range
  function getCurrentWeekRange() {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7));
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  }

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Safe Number
  const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Format Number
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch { 
      return 'Invalid Date'; 
    }
  };

  // ==================== FETCH RAW DATA FOR AVERAGE USAGE ====================
  const fetchRawDataForAverage = async () => {
    try {
      // Fetch flattening data for date range
      let flatteningQuery = supabase
        .from('flatteningsection')
        .select('item_code, item_name, production_quantity, created_at, coil_size')
        .gte('created_at', new Date(dateRangeForAvg.start + 'T00:00:00').toISOString())
        .lte('created_at', new Date(dateRangeForAvg.end + 'T23:59:59').toISOString());
      
      // Fetch spiral data for date range
      let spiralQuery = supabase
        .from('spiralsection')
        .select('item_code, item_name, weight, created_at, raw_material_flatsize, per_meter_wt')
        .gte('created_at', new Date(dateRangeForAvg.start + 'T00:00:00').toISOString())
        .lte('created_at', new Date(dateRangeForAvg.end + 'T23:59:59').toISOString());

      const [flatteningResult, spiralResult] = await Promise.all([
        flatteningQuery.order('created_at', { ascending: false }),
        spiralQuery.order('created_at', { ascending: false })
      ]);

      if (flatteningResult.error) throw flatteningResult.error;
      if (spiralResult.error) throw spiralResult.error;

      const flatteningRawData = flatteningResult.data || [];
      const spiralRawData = spiralResult.data || [];

      setFlatteningData(flatteningRawData);
      setSpiralData(spiralRawData);

      // Calculate average daily usage
      calculateAverageDailyUsage(flatteningRawData, spiralRawData);

    } catch (error) {
      console.error('Error fetching raw data:', error);
    }
  };

  // ==================== CALCULATE AVERAGE DAILY USAGE ====================
  const calculateAverageDailyUsage = (flatteningRaw, spiralRaw) => {
    // Calculate for Flattening Department
    const flatteningMap = new Map();
    const spiralMap = new Map();
    
    // Calculate days in range
    const start = new Date(dateRangeForAvg.start);
    const end = new Date(dateRangeForAvg.end);
    const daysDiff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);

    // Process Flattening Data
    flatteningRaw.forEach(item => {
      const key = item.item_code;
      if (!flatteningMap.has(key)) {
        flatteningMap.set(key, {
          id: key,
          item_code: item.item_code,
          item_name: item.item_name || 'N/A',
          coil_size: item.coil_size || 'N/A',
          total_quantity: 0,
          count: 0,
          days: daysDiff
        });
      }
      const record = flatteningMap.get(key);
      record.total_quantity += safeNumber(item.production_quantity);
      record.count += 1;
    });

    // Process Spiral Data
    spiralRaw.forEach(item => {
      const key = item.item_code;
      if (!spiralMap.has(key)) {
        spiralMap.set(key, {
          id: key,
          item_code: item.item_code,
          item_name: item.item_name || 'N/A',
          raw_material_flatsize: item.raw_material_flatsize || 'N/A',
          per_meter_wt: item.per_meter_wt || 'N/A',
          total_weight: 0,
          count: 0,
          days: daysDiff
        });
      }
      const record = spiralMap.get(key);
      record.total_weight += safeNumber(item.weight);
      record.count += 1;
    });

    // Calculate averages and convert to array
    const flatteningAvg = Array.from(flatteningMap.values()).map(item => ({
      ...item,
      avg_daily: item.total_quantity / item.days,
      avg_per_entry: item.count > 0 ? item.total_quantity / item.count : 0,
      total: item.total_quantity,
      unit: 'KG'
    })).sort((a, b) => b.avg_daily - a.avg_daily);

    const spiralAvg = Array.from(spiralMap.values()).map(item => ({
      ...item,
      avg_daily: item.total_weight / item.days,
      avg_per_entry: item.count > 0 ? item.total_weight / item.count : 0,
      total: item.total_weight,
      unit: 'KG'
    })).sort((a, b) => b.avg_daily - a.avg_daily);

    setAverageUsageData({
      flattening: flatteningAvg,
      spiral: spiralAvg
    });
  };

  // ==================== FILTERED AVERAGE USAGE ITEMS ====================
  const filteredAverageItems = useMemo(() => {
    const items = selectedDepartment === 'both' || selectedDepartment === 'flattening' 
      ? averageUsageData.flattening 
      : [];
    const spiralItems = selectedDepartment === 'both' || selectedDepartment === 'spiral' 
      ? averageUsageData.spiral 
      : [];
    
    let allItems = [...items, ...spiralItems];
    
    if (itemSearchTerm) {
      const term = itemSearchTerm.toLowerCase();
      allItems = allItems.filter(item => 
        (item.item_code?.toLowerCase() || '').includes(term) ||
        (item.item_name?.toLowerCase() || '').includes(term) ||
        (item.coil_size?.toLowerCase() || '').includes(term) ||
        (item.raw_material_flatsize?.toLowerCase() || '').includes(term)
      );
    }
    
    return allItems.slice(0, 10); // Show top 10
  }, [averageUsageData, selectedDepartment, itemSearchTerm]);

  // ==================== TOGGLE ITEM SELECTION FOR AVERAGE ====================
  const toggleItemForAverage = (item) => {
    setSelectedItemsForAvg(prev => {
      const exists = prev.find(i => i.id === item.id && i.type === (item.avg_daily ? 'flattening' : 'spiral'));
      if (exists) {
        return prev.filter(i => !(i.id === item.id && i.type === (item.avg_daily ? 'flattening' : 'spiral')));
      } else {
        return [...prev, { ...item, type: item.avg_daily ? 'flattening' : 'spiral' }];
      }
    });
  };

  // ==================== CHART DATA FOR SELECTED ITEMS ====================
  const chartDataForSelectedItems = useMemo(() => {
    if (selectedItemsForAvg.length === 0) return [];
    
    return selectedItemsForAvg.map(item => {
      if (item.type === 'flattening') {
        return {
          name: item.item_code,
          value: item.avg_daily,
          category: 'Flattening',
          coilSize: item.coil_size,
          itemName: item.item_name,
          color: '#2563EB'
        };
      } else {
        return {
          name: item.item_code,
          value: item.avg_daily,
          category: 'Spiral',
          rawSize: item.raw_material_flatsize,
          itemName: item.item_name,
          color: '#B45309'
        };
      }
    }).sort((a, b) => b.value - a.value);
  }, [selectedItemsForAvg]);

  // ==================== FETCH INVENTORY DATA ====================
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRefreshing(true);
      
      let flatteningQuery = supabase
        .from('flatteningsection')
        .select('item_code, item_name, production_quantity, created_at, coil_size');
      
      let spiralQuery = supabase
        .from('spiralsection')
        .select('item_code, item_name, weight, created_at, raw_material_flatsize, per_meter_wt');

      if (dateFilterType === 'specific' && selectedDate) {
        const startOfDay = new Date(selectedDate + 'T00:00:00').toISOString();
        const endOfDay = new Date(selectedDate + 'T23:59:59').toISOString();
        flatteningQuery = flatteningQuery.gte('created_at', startOfDay).lte('created_at', endOfDay);
        spiralQuery = spiralQuery.gte('created_at', startOfDay).lte('created_at', endOfDay);
      } else if (dateFilterType === 'range' && startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00').toISOString();
        const end = new Date(endDate + 'T23:59:59').toISOString();
        flatteningQuery = flatteningQuery.gte('created_at', start).lte('created_at', end);
        spiralQuery = spiralQuery.gte('created_at', start).lte('created_at', end);
      } else if (weeklyView && selectedWeek) {
        const start = new Date(selectedWeek.start + 'T00:00:00').toISOString();
        const end = new Date(selectedWeek.end + 'T23:59:59').toISOString();
        flatteningQuery = flatteningQuery.gte('created_at', start).lte('created_at', end);
        spiralQuery = spiralQuery.gte('created_at', start).lte('created_at', end);
      }

      const [flatteningResult, spiralResult] = await Promise.all([
        flatteningQuery.order('created_at', { ascending: false }),
        spiralQuery.order('created_at', { ascending: false })
      ]);

      if (flatteningResult.error) throw flatteningResult.error;
      if (spiralResult.error) throw spiralResult.error;

      const flatteningData = flatteningResult.data || [];
      const spiralData = spiralResult.data || [];

      // SPECIAL COMBINATIONS
      const SPECIAL_COMBINATIONS = {
        'IT-11': {
          flattening_items: ['IT-10', 'IT-11'],
          spiral_item: 'IT-11'
        }
      };
      
      const combinationMap = {};

      // 1. NORMAL FLATTENING ITEMS
      flatteningData.forEach(flatItem => {
        const flatCode = flatItem.item_code;
        if (SPECIAL_COMBINATIONS[flatCode]?.flattening_items.includes(flatCode)) return;
        
        if (!combinationMap[flatCode]) {
          combinationMap[flatCode] = {
            flattening_item_code: flatCode,
            flattening_item_name: flatItem.item_name || 'N/A',
            coil_size: flatItem.coil_size || 'N/A',
            flattening_qty: 0,
            spiral_item_code: flatCode,
            spiral_item_name: flatItem.item_name || 'N/A',
            raw_material_flatsize: 'N/A',
            per_meter_wt: 'N/A',
            avg_per_meter_wt: 0,
            spiral_qty: 0,
            is_special_combination: false,
            special_notes: '',
            balance: 0,
            estimated_spiral: 0,
            status: 'N/A',
            last_updated: flatItem.created_at,
            created_at: flatItem.created_at
          };
        }
        combinationMap[flatCode].flattening_qty += safeNumber(flatItem.production_quantity);
        if (new Date(flatItem.created_at) > new Date(combinationMap[flatCode].last_updated)) {
          combinationMap[flatCode].last_updated = flatItem.created_at;
        }
      });

      // 2. NORMAL SPIRAL ITEMS
      spiralData.forEach(spiralItem => {
        const spiralCode = spiralItem.item_code;
        if (SPECIAL_COMBINATIONS[spiralCode]) return;
        
        if (combinationMap[spiralCode]) {
          combinationMap[spiralCode].spiral_item_code = spiralCode;
          combinationMap[spiralCode].spiral_item_name = spiralItem.item_name || 'N/A';
          combinationMap[spiralCode].raw_material_flatsize = spiralItem.raw_material_flatsize || 'N/A';
          combinationMap[spiralCode].per_meter_wt = spiralItem.per_meter_wt || 'N/A';
          combinationMap[spiralCode].spiral_qty += safeNumber(spiralItem.weight);
          if (spiralItem.per_meter_wt) {
            combinationMap[spiralCode].avg_per_meter_wt = safeNumber(spiralItem.per_meter_wt);
          }
          if (new Date(spiralItem.created_at) > new Date(combinationMap[spiralCode].last_updated)) {
            combinationMap[spiralCode].last_updated = spiralItem.created_at;
          }
        } else {
          combinationMap[spiralCode] = {
            flattening_item_code: 'N/A',
            flattening_item_name: 'N/A',
            coil_size: 'N/A',
            flattening_qty: 0,
            spiral_item_code: spiralCode,
            spiral_item_name: spiralItem.item_name || 'N/A',
            raw_material_flatsize: spiralItem.raw_material_flatsize || 'N/A',
            per_meter_wt: spiralItem.per_meter_wt || 'N/A',
            avg_per_meter_wt: safeNumber(spiralItem.per_meter_wt),
            spiral_qty: safeNumber(spiralItem.weight),
            is_special_combination: false,
            special_notes: '',
            balance: 0,
            estimated_spiral: 0,
            status: 'Deficit',
            last_updated: spiralItem.created_at,
            created_at: spiralItem.created_at
          };
        }
      });

      // 3. SPECIAL COMBINATIONS
      Object.keys(SPECIAL_COMBINATIONS).forEach(spiralCode => {
        const special = SPECIAL_COMBINATIONS[spiralCode];
        const flatteningItems = special.flattening_items;
        const combinationKey = `SPECIAL-${flatteningItems.join('+')}->${spiralCode}`;
        
        const allCoilSizes = new Set();
        flatteningItems.forEach(flatCode => {
          const flatEntries = flatteningData.filter(f => f.item_code === flatCode);
          flatEntries.forEach(flatItem => {
            if (flatItem.coil_size) allCoilSizes.add(String(flatItem.coil_size));
          });
        });
        
        combinationMap[combinationKey] = {
          flattening_item_code: flatteningItems.join(' + '),
          flattening_item_name: `Combined (${flatteningItems.join(', ')})`,
          coil_size: allCoilSizes.size > 0 ? Array.from(allCoilSizes).join(', ') : 'N/A',
          coil_sizes_list: Array.from(allCoilSizes),
          flattening_qty: 0,
          spiral_item_code: spiralCode,
          spiral_item_name: `Spiral for ${flatteningItems.join(', ')}`,
          raw_material_flatsize: 'N/A',
          per_meter_wt: 'N/A',
          avg_per_meter_wt: 0,
          spiral_qty: 0,
          is_special_combination: true,
          special_notes: `Flattening: ${flatteningItems.join(' + ')} → Spiral: ${spiralCode}`,
          flattening_items_list: flatteningItems,
          balance: 0,
          estimated_spiral: 0,
          status: 'N/A',
          last_updated: null,
          created_at: null
        };
        
        flatteningItems.forEach(flatCode => {
          const flatEntries = flatteningData.filter(f => f.item_code === flatCode);
          flatEntries.forEach(flatItem => {
            combinationMap[combinationKey].flattening_qty += safeNumber(flatItem.production_quantity);
            if (!combinationMap[combinationKey].last_updated || 
                new Date(flatItem.created_at) > new Date(combinationMap[combinationKey].last_updated)) {
              combinationMap[combinationKey].last_updated = flatItem.created_at;
            }
          });
        });
        
        const spiralEntries = spiralData.filter(s => s.item_code === spiralCode);
        spiralEntries.forEach(spiralItem => {
          combinationMap[combinationKey].spiral_qty += safeNumber(spiralItem.weight);
          if (spiralItem.per_meter_wt) {
            combinationMap[combinationKey].per_meter_wt = spiralItem.per_meter_wt;
            combinationMap[combinationKey].avg_per_meter_wt = safeNumber(spiralItem.per_meter_wt);
          }
          if (spiralItem.raw_material_flatsize) {
            combinationMap[combinationKey].raw_material_flatsize = spiralItem.raw_material_flatsize;
          }
          if (!combinationMap[combinationKey].last_updated || 
              new Date(spiralItem.created_at) > new Date(combinationMap[combinationKey].last_updated)) {
            combinationMap[combinationKey].last_updated = spiralItem.created_at;
          }
        });
        
        flatteningItems.forEach(flatCode => delete combinationMap[flatCode]);
        delete combinationMap[spiralCode];
      });

      // 4. CALCULATE BALANCES
      const inventory = Object.values(combinationMap).map(item => {
        const balance = Math.round(item.flattening_qty - item.spiral_qty);
        let avgPerMeterWt = item.avg_per_meter_wt || 0;
        let estimatedSpiral = 0;
        if (avgPerMeterWt > 0) {
          estimatedSpiral = balance / avgPerMeterWt;
          estimatedSpiral = Math.round(estimatedSpiral * 100) / 100;
        }
        
        return {
          ...item,
          id: item.is_special_combination 
            ? `SPECIAL-${item.flattening_items_list?.join('-')}-${item.spiral_item_code}`
            : `${item.flattening_item_code}-${item.spiral_item_code}`,
          avg_per_meter_wt: Math.round(avgPerMeterWt * 1000) / 1000,
          balance: balance,
          estimated_spiral: estimatedSpiral,
          status: balance >= 0 ? 'Available' : 'Deficit'
        };
      });

      // SORT
      inventory.sort((a, b) => {
        if (a.is_special_combination && !b.is_special_combination) return -1;
        if (!a.is_special_combination && b.is_special_combination) return 1;
        if (sortConfig.key === 'flattening_item_code') {
          return sortConfig.direction === 'asc' 
            ? (a.flattening_item_code || '').localeCompare(b.flattening_item_code || '')
            : (b.flattening_item_code || '').localeCompare(a.flattening_item_code || '');
        }
        if (sortConfig.key === 'spiral_item_code') {
          return sortConfig.direction === 'asc' 
            ? (a.spiral_item_code || '').localeCompare(b.spiral_item_code || '')
            : (b.spiral_item_code || '').localeCompare(a.spiral_item_code || '');
        }
        if (sortConfig.key === 'balance') {
          return sortConfig.direction === 'asc' 
            ? (a.balance || 0) - (b.balance || 0)
            : (b.balance || 0) - (a.balance || 0);
        }
        return (b.balance || 0) - (a.balance || 0);
      });
      
      setInventoryData(inventory);
      
      const initialSelected = inventory.reduce((acc, item) => {
        if (item && item.id) acc[item.id] = true;
        return acc;
      }, {});
      
      setSelectedItems(initialSelected);
      setSelectAll(true);
      
      if (inventory.length > 0 && !selectedChartItem) {
        setSelectedChartItem(inventory[0].id);
      }

    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch - ONLY ONCE
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchInventoryData();
      fetchRawDataForAverage();
    }
  }, []);

  // Fetch average data when date range changes
  useEffect(() => {
    if (initialFetchDone.current) {
      fetchRawDataForAverage();
    }
  }, [dateRangeForAvg]);

  // Manual refresh
  const handleRefresh = () => {
    fetchInventoryData();
    fetchRawDataForAverage();
  };

  // Filtered Data
  const filteredData = useMemo(() => {
    let filtered = [...inventoryData];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.flattening_item_code?.toLowerCase() || '').includes(term) ||
        (item.flattening_item_name?.toLowerCase() || '').includes(term) ||
        (item.spiral_item_code?.toLowerCase() || '').includes(term) ||
        (item.spiral_item_name?.toLowerCase() || '').includes(term) ||
        (item.special_notes?.toLowerCase() || '').includes(term) ||
        (item.coil_size?.toLowerCase() || '').includes(term)
      );
    }
    if (statusFilter === 'available') {
      filtered = filtered.filter(item => item.status === 'Available');
    } else if (statusFilter === 'deficit') {
      filtered = filtered.filter(item => item.status === 'Deficit');
    } else if (statusFilter === 'special') {
      filtered = filtered.filter(item => item.is_special_combination === true);
    } else if (statusFilter === 'normal') {
      filtered = filtered.filter(item => item.is_special_combination === false);
    }
    return filtered;
  }, [inventoryData, searchTerm, statusFilter]);

  // Selection Handlers
  const handleItemSelect = (itemId) => {
    if (!itemId) return;
    setSelectedItems(prev => {
      const newState = { ...prev, [itemId]: !prev[itemId] };
      const allSelected = Object.values(newState).every(Boolean);
      setSelectAll(allSelected);
      return newState;
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const newSelectedItems = {};
    filteredData.forEach(item => {
      if (item && item.id) newSelectedItems[item.id] = newSelectAll;
    });
    setSelectedItems(newSelectedItems);
  };

  const selectedCount = useMemo(() => Object.values(selectedItems).filter(Boolean).length, [selectedItems]);

  // ==================== SUMMARY TOTALS ====================
  const totals = useMemo(() => {
    let totalAvailable = 0, totalItems = inventoryData.length, availableItems = 0, deficitItems = 0;
    let totalProduction = 0, totalConsumption = 0;
    let totalEstimatedSpiral = 0, totalPositiveSpiral = 0, totalNegativeSpiral = 0;
    let specialItems = 0;

    inventoryData.forEach(item => {
      totalProduction += item.flattening_qty || 0;
      totalConsumption += item.spiral_qty || 0;
      totalEstimatedSpiral += item.estimated_spiral || 0;
      if (item.is_special_combination) specialItems++;
      if (item.estimated_spiral > 0) totalPositiveSpiral += item.estimated_spiral;
      else totalNegativeSpiral += Math.abs(item.estimated_spiral || 0);
      if (item.balance >= 0) {
        totalAvailable += item.balance;
        availableItems++;
      } else deficitItems++;
    });

    return {
      totalAvailable: Math.round(totalAvailable),
      totalItems, availableItems, deficitItems, specialItems,
      totalProduction: Math.round(totalProduction),
      totalConsumption: Math.round(totalConsumption),
      totalEstimatedSpiral: Math.round(totalEstimatedSpiral * 100) / 100,
      totalPositiveSpiral: Math.round(totalPositiveSpiral * 100) / 100,
      totalNegativeSpiral: Math.round(totalNegativeSpiral * 100) / 100
    };
  }, [inventoryData]);

  // ==================== PIE CHART DATA FOR SUMMARY ====================
  const summaryPieChartData = useMemo(() => {
    return [
      { name: 'Available Items', value: totals.availableItems, color: '#10B981' },
      { name: 'Deficit Items', value: totals.deficitItems, color: '#EF4444' },
      { name: 'Special Cases', value: totals.specialItems, color: '#F59E0B' }
    ].filter(item => item.value > 0);
  }, [totals]);

  // Sort Handler
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Render Sort Icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Date Handlers
  const applyDateFilter = () => {
    fetchInventoryData();
  };
  
  const setToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setDateFilterType('specific');
    setShowDateRange(false);
    setWeeklyView(false);
  };
  
  const showAllData = () => {
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setDateFilterType('all');
    setShowDateRange(false);
    setWeeklyView(false);
    fetchInventoryData();
  };

  const toggleWeeklyView = () => {
    setWeeklyView(!weeklyView);
    if (!weeklyView) {
      setDateFilterType('range');
      setShowDateRange(true);
      setSelectedWeek(getCurrentWeekRange());
    }
  };

  // Message Handler
  const editItemMessage = (itemCode) => {
    if (!itemCode) return;
    const currentMessage = itemMessages[itemCode] || '';
    const newMessage = prompt(`Enter message for ${itemCode}:`, currentMessage);
    if (newMessage !== null) {
      setItemMessages(prev => ({ ...prev, [itemCode]: newMessage.trim() }));
    }
  };

  // WhatsApp Handler
  const sendItemWhatsApp = (item) => {
    let message = `*🏭 CONTROL CABLE DIVISION*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*📊 ${item.is_special_combination ? 'SPECIAL CASE' : 'COMBINATION'} DETAIL REPORT*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n\n`;
    
    if (item.is_special_combination) {
      message += `*🔶 SPECIAL COMBINATION:*\n`;
      message += `*   ${item.special_notes}*\n`;
      message += `*   Formula:* (${item.flattening_items_list?.join(' + ')}) - ${item.spiral_item_code}\n\n`;
    }
    
    message += `*🏭 FLATTENING ITEM:*\n`;
    message += `   📌 Code: ${item.flattening_item_code}\n`;
    message += `   📦 Name: ${item.flattening_item_name}\n`;
    message += `   🎥 Coil Size: ${item.coil_size}\n`;
    message += `   ⚙️ Production: ${formatNumber(item.flattening_qty)} KG\n\n`;
    
    message += `*🔩 SPIRAL ITEM:*\n`;
    message += `   📌 Code: ${item.spiral_item_code}\n`;
    message += `   📦 Name: ${item.spiral_item_name}\n`;
    message += `   📐 Raw Size: ${item.raw_material_flatsize}\n`;
    message += `   ⚖️ Per Meter WT: ${item.per_meter_wt} KG/m\n`;
    message += `   🔩 Consumption: ${formatNumber(item.spiral_qty)} KG\n\n`;
    
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*⚖️ BALANCE:* ${formatNumber(item.balance)} KG\n`;
    if (item.is_special_combination) {
      message += `*   Calculation:* ${formatNumber(item.flattening_qty)} KG (${item.flattening_items_list?.join(' + ')}) - ${formatNumber(item.spiral_qty)} KG (${item.spiral_item_code})\n`;
    }
    if (item.estimated_spiral > 0) {
      message += `*🔮 ESTIMATED SPIRAL:* +${formatNumber(item.estimated_spiral)} m\n`;
      message += `*   Weight:* ${formatNumber(item.estimated_spiral * item.avg_per_meter_wt)} KG\n`;
    } else if (item.estimated_spiral < 0) {
      message += `*🔻 EXCESS USAGE:* ${formatNumber(item.estimated_spiral)} m\n`;
      message += `*   Extra Weight:* ${formatNumber(Math.abs(item.estimated_spiral * item.avg_per_meter_wt))} KG\n`;
    }
    message += `*📊 STATUS:* ${item.status === 'Available' ? '✅ AVAILABLE' : '⚠️ DEFICIT'}\n`;
    message += `*🕐 LAST UPDATED:* ${formatDate(item.last_updated)}\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `_Generated by Control Cable System_`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendSelectedWhatsApp = () => {
    const selectedItemsData = inventoryData.filter(item => selectedItems[item.id]);
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
    message += `*📊 FLATTENING & SPIRAL COMBINATION REPORT*\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `📅 Date: ${formattedDate}\n`;
    if (dateFilterType === 'specific' && selectedDate) message += `🎯 Report For: ${selectedDate}\n`;
    else if (dateFilterType === 'range' && startDate && endDate) message += `📆 From: ${startDate} To: ${endDate}\n`;
    else if (weeklyView) message += `📆 Week: ${selectedWeek.start} to ${selectedWeek.end}\n`;
    message += `✅ Selected Combinations: ${selectedItemsData.length}/${inventoryData.length}\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n\n`;
    
    selectedItemsData.slice(0, 10).forEach((item, index) => {
      message += `*${index + 1}. ${item.is_special_combination ? '🔶 SPECIAL COMBINATION' : 'COMBINATION'}*\n`;
      message += `*━━━━━━━━━━━━━━━━━━━━*\n`;
      
      if (item.is_special_combination) {
        message += `*🔶 SPECIAL CASE:* ${item.special_notes}\n`;
        message += `*   Formula:* (${item.flattening_items_list?.join(' + ')}) - ${item.spiral_item_code}\n`;
      }
      
      message += `*🏭 FLATTENING ITEM:*\n`;
      message += `   📌 Code: ${item.flattening_item_code}\n`;
      message += `   📦 Name: ${item.flattening_item_name}\n`;
      message += `   🎥 Coil Size: ${item.coil_size}\n`;
      message += `   ⚙️ Production: ${formatNumber(item.flattening_qty)} KG\n\n`;
      
      message += `*🔩 SPIRAL ITEM:*\n`;
      message += `   📌 Code: ${item.spiral_item_code}\n`;
      message += `   📦 Name: ${item.spiral_item_name}\n`;
      message += `   📐 Raw Size: ${item.raw_material_flatsize}\n`;
      message += `   ⚖️ Per Meter WT: ${item.per_meter_wt} KG/m\n`;
      message += `   🔩 Consumption: ${formatNumber(item.spiral_qty)} KG\n\n`;
      
      message += `*⚖️ BALANCE:* ${formatNumber(item.balance)} KG\n`;
      if (item.is_special_combination) {
        message += `*   Formula:* ${formatNumber(item.flattening_qty)} KG (${item.flattening_items_list?.join(' + ')}) - ${formatNumber(item.spiral_qty)} KG (${item.spiral_item_code})\n`;
      }
      if (item.estimated_spiral > 0) message += `*🔮 ESTIMATED SPIRAL:* +${formatNumber(item.estimated_spiral)} m\n`;
      else if (item.estimated_spiral < 0) message += `*🔻 EXCESS USAGE:* ${formatNumber(item.estimated_spiral)} m\n`;
      message += `*📊 STATUS:* ${item.status === 'Available' ? '✅ AVAILABLE' : '⚠️ DEFICIT'}\n`;
      message += `*🕐 LAST UPDATED:* ${formatDate(item.last_updated)}\n`;
      message += `*━━━━━━━━━━━━━━━━━━━━*\n\n`;
    });
    
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `*📈 SUMMARY*\n`;
    message += `📦 Total Combinations: ${totals.totalItems}\n`;
    message += `✅ Available: ${totals.availableItems}\n`;
    message += `⚠️ Deficit: ${totals.deficitItems}\n`;
    message += `🔶 Special Cases: ${totals.specialItems}\n`;
    message += `⚙️ Production: ${formatNumber(totals.totalProduction)} KG\n`;
    message += `🔩 Consumption: ${formatNumber(totals.totalConsumption)} KG\n`;
    message += `⚖️ Net Balance: ${formatNumber(totals.totalAvailable)} KG\n`;
    message += `🔮 Can Produce: +${formatNumber(totals.totalPositiveSpiral)} m\n`;
    message += `🔻 Excess Used: -${formatNumber(totals.totalNegativeSpiral)} m\n`;
    message += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━*\n`;
    message += `_Generated by Control Cable System_`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendAllWhatsApp = () => {
    const allSelected = {};
    inventoryData.forEach(item => { 
      if (item && item.id) allSelected[item.id] = true; 
    });
    setSelectedItems(allSelected);
    setSelectAll(true);
    setTimeout(() => sendSelectedWhatsApp(), 100);
  };

  // PDF Handler
  const downloadPDF = () => {
    alert('PDF download feature coming soon!');
  };

  // CSV Export
  const exportCSV = () => {
    if (inventoryData.length === 0) return;

    const headers = [
      'Type', 'Special Notes',
      'Flattening Code', 'Spiral Code', 'Flattening Name', 'Spiral Name',
      'Coil Size', 'Raw Size', 'Flattening (KG)', 'Spiral (KG)', 
      'Balance (KG)', 'Per Meter WT', 'Estimated (m)', 'Status', 'Last Updated'
    ];
    
    const rows = inventoryData.map(item => [
      item.is_special_combination ? 'SPECIAL' : 'NORMAL',
      item.special_notes || '',
      item.flattening_item_code || 'N/A',
      item.spiral_item_code || 'N/A',
      item.flattening_item_name || 'N/A',
      item.spiral_item_name || 'N/A',
      item.coil_size || 'N/A',
      item.raw_material_flatsize || 'N/A',
      formatNumber(item.flattening_qty),
      formatNumber(item.spiral_qty),
      formatNumber(item.balance),
      item.per_meter_wt || 'N/A',
      formatNumber(item.estimated_spiral),
      item.status || '',
      formatDate(item.last_updated)
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `flattening-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Chart Data
  const chartData = useMemo(() => {
    return inventoryData.map(item => ({
      id: item.id,
      name: item.is_special_combination 
        ? `${item.flattening_items_list?.join('+')}`
        : item.flattening_item_code,
      fullName: item.flattening_item_name,
      balance: item.balance,
      production: item.flattening_qty,
      consumption: item.spiral_qty,
      estimated: item.estimated_spiral,
      status: item.status,
      isSpecial: item.is_special_combination,
      coilSize: item.coil_size
    })).sort((a, b) => b.balance - a.balance).slice(0, 10);
  }, [inventoryData]);

  // Selected item for chart
  const selectedChartItemData = useMemo(() => {
    return inventoryData.find(item => item.id === selectedChartItem);
  }, [inventoryData, selectedChartItem]);

  // Cleanup
  useEffect(() => {
    return () => { 
      setInventoryData([]); 
      setError(null); 
    };
  }, []);

  return (
    <div className={`flattening-report ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Header */}
      <div className="report-header">
        <div className="header-left">
          <div className="header-icon-container">
            <FiGitMerge className="header-icon" />
          </div>
          <div className="header-title-section">
            <h1 className="header-title">CONTROL CABLE DIVISION</h1>
            <div className="header-subtitle">
              <FiTag className="header-subtitle-icon" />
              <span className="header-subtitle-text">Flattening & Spiral Inventory Report</span>
              {inventoryData.some(i => i.is_special_combination) && (
                <span className="special-case-header-badge">
                  <FiStar className="badge-icon" />
                  Special Case: IT-10 + IT-11 → IT-11
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {isDarkMode ? <FiSun className="theme-icon" /> : <FiMoon className="theme-icon" />}
        </button>
      </div>

      {/* ==================== AVERAGE DAILY USAGE - LARGE CARDS SECTION ==================== */}
      <div className="average-usage-section">
        <div className="section-header">
          <div className="section-title-wrapper">
            <FiTrend className="section-icon" />
            <h2 className="section-title">Average Daily Consumption Analysis</h2>
            <span className="section-badge">
              {dateRangeForAvg.start} to {dateRangeForAvg.end}
            </span>
          </div>
          <div className="section-controls">
            <div className="date-range-selector">
              <select 
                value={chartTimeRange} 
                onChange={(e) => {
                  const range = e.target.value;
                  setChartTimeRange(range);
                  const end = new Date();
                  let start = new Date();
                  if (range === 'week') start.setDate(end.getDate() - 7);
                  else if (range === 'month') start.setDate(end.getDate() - 30);
                  else if (range === 'quarter') start.setDate(end.getDate() - 90);
                  else if (range === 'year') start.setDate(end.getDate() - 365);
                  setDateRangeForAvg({
                    start: start.toISOString().split('T')[0],
                    end: end.toISOString().split('T')[0]
                  });
                }}
                className="range-select"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last 365 Days</option>
              </select>
            </div>
            <div className="department-toggle">
              <button 
                className={`dept-btn ${selectedDepartment === 'both' ? 'active' : ''}`}
                onClick={() => setSelectedDepartment('both')}
              >
                Both
              </button>
              <button 
                className={`dept-btn ${selectedDepartment === 'flattening' ? 'active' : ''}`}
                onClick={() => setSelectedDepartment('flattening')}
              >
                Flattening
              </button>
              <button 
                className={`dept-btn ${selectedDepartment === 'spiral' ? 'active' : ''}`}
                onClick={() => setSelectedDepartment('spiral')}
              >
                Spiral
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar for Items */}
        <div className="item-search-container">
          <div className="item-search-wrapper">
            <FiSearch className="item-search-icon" />
            <input
              ref={itemSearchRef}
              type="text"
              value={itemSearchTerm}
              onChange={(e) => setItemSearchTerm(e.target.value)}
              placeholder="Search by Item Code, Name, Coil Size, Raw Size..."
              className="item-search-input"
            />
            {itemSearchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setItemSearchTerm('')}
              >
                <FiX />
              </button>
            )}
          </div>
          <div className="selected-count-badge">
            Selected: {selectedItemsForAvg.length} items
          </div>
        </div>

        {/* Large Cards Grid - Flattening Department */}
        {(selectedDepartment === 'both' || selectedDepartment === 'flattening') && averageUsageData.flattening.length > 0 && (
          <div className="department-cards-container">
            <div className="department-header">
              <FiZap className="dept-header-icon" />
              <h3>Flattening Department - Average Daily Production</h3>
              <span className="items-count">{averageUsageData.flattening.length} items</span>
            </div>
            <div className="large-cards-grid">
              {averageUsageData.flattening
                .filter(item => {
                  if (!itemSearchTerm) return true;
                  const term = itemSearchTerm.toLowerCase();
                  return (item.item_code?.toLowerCase() || '').includes(term) ||
                         (item.item_name?.toLowerCase() || '').includes(term) ||
                         (item.coil_size?.toLowerCase() || '').includes(term);
                })
                .slice(0, 6)
                .map((item, index) => (
                  <div 
                    key={`flattening-${item.item_code}`} 
                    className={`large-stat-card ${selectedItemsForAvg.find(i => i.id === item.item_code && i.type === 'flattening') ? 'selected' : ''}`}
                    onClick={() => toggleItemForAverage({...item, id: item.item_code, type: 'flattening'})}
                  >
                    <div className="card-header">
                      <div className="item-badge flattening">
                        <FiZap />
                      </div>
                      <div className="item-code-section">
                        <span className="item-code-label">Item Code</span>
                        <span className="item-code-value">{item.item_code}</span>
                      </div>
                      <div className="item-rank-badge">#{index + 1}</div>
                    </div>
                    
                    <div className="card-body">
                      <div className="item-details-grid">
                        <div className="detail-row">
                          <FiTag className="detail-icon" />
                          <span className="detail-label">Name:</span>
                          <span className="detail-value" title={item.item_name}>
                            {item.item_name?.length > 35 ? item.item_name.substring(0, 35) + '...' : item.item_name}
                          </span>
                        </div>
                        <div className="detail-row">
                          <FiCircle className="detail-icon" />
                          <span className="detail-label">Coil Size:</span>
                          <span className="detail-value coil-badge">{item.coil_size || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="stats-grid-large">
                        <StatCard
                          title="Avg Daily"
                          value={formatNumber(item.avg_daily)}
                          unit="KG"
                          icon={<FiTrendingUp />}
                          color="#2563EB"
                          trend={item.avg_daily > 1000 ? 'up' : item.avg_daily > 500 ? 'stable' : 'down'}
                          size="large"
                        />
                        <StatCard
                          title="Total"
                          value={formatNumber(item.total)}
                          unit="KG"
                          icon={<FiBox />}
                          color="#3B82F6"
                          size="large"
                        />
                        <StatCard
                          title="Entries"
                          value={item.count}
                          unit="batches"
                          icon={<FiLayers />}
                          color="#60A5FA"
                          size="large"
                        />
                      </div>

                      <div className="progress-indicator">
                        <div className="progress-label">
                          <span>Daily Average</span>
                          <span className="progress-value">{formatNumber(item.avg_daily)} KG</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill flattening"
                            style={{ 
                              width: `${Math.min((item.avg_daily / 2000) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <div className="days-info">
                          Based on {item.days} days • {item.count} entries
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button 
                        className={`select-item-btn ${selectedItemsForAvg.find(i => i.id === item.item_code && i.type === 'flattening') ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemForAverage({...item, id: item.item_code, type: 'flattening'});
                        }}
                      >
                        {selectedItemsForAvg.find(i => i.id === item.item_code && i.type === 'flattening') ? (
                          <>✓ Selected for Chart</>
                        ) : (
                          <>+ Add to Chart</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Large Cards Grid - Spiral Department */}
        {(selectedDepartment === 'both' || selectedDepartment === 'spiral') && averageUsageData.spiral.length > 0 && (
          <div className="department-cards-container">
            <div className="department-header">
              <FiActivity className="dept-header-icon spiral" />
              <h3>Spiral Department - Average Daily Consumption</h3>
              <span className="items-count">{averageUsageData.spiral.length} items</span>
            </div>
            <div className="large-cards-grid">
              {averageUsageData.spiral
                .filter(item => {
                  if (!itemSearchTerm) return true;
                  const term = itemSearchTerm.toLowerCase();
                  return (item.item_code?.toLowerCase() || '').includes(term) ||
                         (item.item_name?.toLowerCase() || '').includes(term) ||
                         (item.raw_material_flatsize?.toLowerCase() || '').includes(term);
                })
                .slice(0, 6)
                .map((item, index) => (
                  <div 
                    key={`spiral-${item.item_code}`} 
                    className={`large-stat-card spiral-card ${selectedItemsForAvg.find(i => i.id === item.item_code && i.type === 'spiral') ? 'selected' : ''}`}
                    onClick={() => toggleItemForAverage({...item, id: item.item_code, type: 'spiral'})}
                  >
                    <div className="card-header">
                      <div className="item-badge spiral">
                        <FiActivity />
                      </div>
                      <div className="item-code-section">
                        <span className="item-code-label">Item Code</span>
                        <span className="item-code-value">{item.item_code}</span>
                      </div>
                      <div className="item-rank-badge">#{index + 1}</div>
                    </div>
                    
                    <div className="card-body">
                      <div className="item-details-grid">
                        <div className="detail-row">
                          <FiTag className="detail-icon" />
                          <span className="detail-label">Name:</span>
                          <span className="detail-value" title={item.item_name}>
                            {item.item_name?.length > 35 ? item.item_name.substring(0, 35) + '...' : item.item_name}
                          </span>
                        </div>
                        <div className="detail-row">
                          <FiAnchor className="detail-icon" />
                          <span className="detail-label">Raw Size:</span>
                          <span className="detail-value raw-badge">{item.raw_material_flatsize || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <FiTarget className="detail-icon" />
                          <span className="detail-label">Per Meter:</span>
                          <span className="detail-value">{item.per_meter_wt || 'N/A'} KG</span>
                        </div>
                      </div>

                      <div className="stats-grid-large">
                        <StatCard
                          title="Avg Daily"
                          value={formatNumber(item.avg_daily)}
                          unit="KG"
                          icon={<FiTrendingDown />}
                          color="#B45309"
                          trend={item.avg_daily > 800 ? 'up' : item.avg_daily > 400 ? 'stable' : 'down'}
                          size="large"
                        />
                        <StatCard
                          title="Total"
                          value={formatNumber(item.total)}
                          unit="KG"
                          icon={<FiBox />}
                          color="#D97706"
                          size="large"
                        />
                        <StatCard
                          title="Entries"
                          value={item.count}
                          unit="batches"
                          icon={<FiLayers />}
                          color="#F59E0B"
                          size="large"
                        />
                      </div>

                      <div className="progress-indicator">
                        <div className="progress-label">
                          <span>Daily Average</span>
                          <span className="progress-value">{formatNumber(item.avg_daily)} KG</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill spiral"
                            style={{ 
                              width: `${Math.min((item.avg_daily / 1500) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <div className="days-info">
                          Based on {item.days} days • {item.count} entries
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button 
                        className={`select-item-btn spiral-btn ${selectedItemsForAvg.find(i => i.id === item.item_code && i.type === 'spiral') ? 'selected' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemForAverage({...item, id: item.item_code, type: 'spiral'});
                        }}
                      >
                        {selectedItemsForAvg.find(i => i.id === item.item_code && i.type === 'spiral') ? (
                          <>✓ Selected for Chart</>
                        ) : (
                          <>+ Add to Chart</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Charts Section for Selected Items */}
        {selectedItemsForAvg.length > 0 && (
          <div className="analysis-charts-section">
            <div className="charts-header">
              <div className="charts-title-group">
                <FaChartBar className="charts-main-icon" />
                <h3>Comparative Analysis - Selected Items</h3>
                <span className="selected-items-badge">
                  {selectedItemsForAvg.length} Items Selected
                </span>
              </div>
              <div className="chart-tabs">
                <button 
                  className={`chart-tab ${activeChartTab === 'bar' ? 'active' : ''}`}
                  onClick={() => setActiveChartTab('bar')}
                >
                  <FaChartBar /> Bar Chart
                </button>
                <button 
                  className={`chart-tab ${activeChartTab === 'line' ? 'active' : ''}`}
                  onClick={() => setActiveChartTab('line')}
                >
                  <FaChartLine /> Line Chart
                </button>
                <button 
                  className={`chart-tab ${activeChartTab === 'pie' ? 'active' : ''}`}
                  onClick={() => setActiveChartTab('pie')}
                >
                  <FaChartPie /> Pie Chart
                </button>
              </div>
            </div>

            <div className="chart-container-large">
              {activeChartTab === 'bar' && (
                <ProductionBarChart 
                  data={chartDataForSelectedItems}
                  title="Average Daily Usage by Item"
                  xAxisLabel="Item Code"
                  yAxisLabel="Average Daily (KG)"
                  height={400}
                />
              )}
              {activeChartTab === 'line' && (
                <ProductionLineChart 
                  data={chartDataForSelectedItems}
                  title="Daily Usage Trend"
                  xAxisLabel="Items"
                  yAxisLabel="Average (KG)"
                  height={400}
                />
              )}
              {activeChartTab === 'pie' && (
                <ProductionPieChart 
                  title="Usage Distribution"
                  labels={chartDataForSelectedItems.map(item => item.name)}
                  data={chartDataForSelectedItems.map(item => item.value)}
                  unit="KG"
                  height={400}
                  donut={true}
                  showLegend={true}
                  showPercentages={true}
                  showValues={true}
                />
              )}
            </div>

            <div className="selected-items-list">
              <h4>Selected Items for Analysis</h4>
              <div className="selected-items-grid">
                {selectedItemsForAvg.map((item, idx) => (
                  <div key={`selected-${item.type}-${item.id}`} className="selected-item-chip">
                    <span className={`chip-dot ${item.type}`}></span>
                    <span className="chip-code">{item.item_code}</span>
                    <span className="chip-value">{formatNumber(item.avg_daily)} KG</span>
                    <button 
                      className="chip-remove"
                      onClick={() => toggleItemForAverage(item)}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
                <button 
                  className="clear-all-btn"
                  onClick={() => setSelectedItemsForAvg([])}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-main-container">
        <div className="date-filter-row">
          <div className="filter-btn-group">
            {['specific', 'range', 'all'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setDateFilterType(type);
                  setShowDateRange(type === 'range');
                  setWeeklyView(false);
                }}
                className={`filter-type-btn ${dateFilterType === type && !weeklyView ? 'active' : ''}`}
              >
                {type === 'specific' ? 'Specific Date' : type === 'range' ? 'Date Range' : 'All Data'}
              </button>
            ))}
            <button
              onClick={toggleWeeklyView}
              className={`filter-type-btn weekly-btn ${weeklyView ? 'active' : ''}`}
            >
              <FiCalendar className="btn-icon" />
              This Week
            </button>
          </div>

          <div className="date-input-container">
            {dateFilterType === 'specific' && !weeklyView && (
              <div className="date-picker-group">
                <label className="date-label">Select Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="date-input-field"
                />
                <button onClick={setToToday} className="today-btn">Today</button>
              </div>
            )}

            {showDateRange && !weeklyView && (
              <div className="date-range-picker">
                <div className="date-input-group">
                  <label className="date-label">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="date-input-field"
                  />
                </div>
                <div className="date-input-group">
                  <label className="date-label">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="date-input-field"
                  />
                </div>
              </div>
            )}

            {weeklyView && (
              <div className="week-display">
                <span className="week-label">
                  Week: {selectedWeek.start} to {selectedWeek.end}
                </span>
              </div>
            )}

            <button onClick={applyDateFilter} disabled={loading} className="apply-filter-btn">
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Search & Toolbar */}
      <div className="search-toolbar-container">
        <div className="search-row">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Flattening Code, Spiral Code, Coil Size, Special Notes..."
              className="search-input-field"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          >
            <FiFilter className="btn-icon" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <button onClick={showAllData} className="all-data-btn">
            <FiRefreshCw className={`btn-icon ${isRefreshing ? 'spin' : ''}`} />
            All Data
          </button>
        </div>

        {showFilters && (
          <div className="expanded-filters-panel">
            <div className="filter-group">
              <label className="filter-label">
                <FiCalendar className="filter-icon" />
                Date Filter
              </label>
              <select
                value={dateFilterType}
                onChange={(e) => { 
                  setDateFilterType(e.target.value); 
                  setShowDateRange(e.target.value === 'range'); 
                  setWeeklyView(false);
                }}
                className="filter-select"
              >
                <option value="specific">Specific Date</option>
                <option value="range">Date Range</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <FiLayers className="filter-icon" />
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Combinations</option>
                <option value="available">Available Only</option>
                <option value="deficit">Deficit Only</option>
                <option value="special">Special Cases Only</option>
                <option value="normal">Normal Only</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <FiCheckSquare className="filter-icon" />
                Selection
              </label>
              <div className="select-all-buttons">
                <button
                  onClick={handleSelectAll}
                  className={`select-all-btn ${selectAll ? 'deselect' : 'select'}`}
                >
                  {selectAll ? <FiSquare className="btn-icon" /> : <FiCheckSquare className="btn-icon" />}
                  {selectAll ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="selection-count">
                Selected: <strong>{selectedCount}</strong> combinations
              </div>
            </div>
          </div>
        )}

        <div className="toolbar-actions">
          <div className="toolbar-left">
            <button onClick={handleRefresh} disabled={loading} className="toolbar-btn refresh-btn">
              <FiRefreshCw className={`btn-icon ${isRefreshing ? 'spin' : ''}`} />
              Refresh
            </button>
            <button onClick={sendSelectedWhatsApp} disabled={selectedCount === 0} className="toolbar-btn whatsapp-btn">
              <FaWhatsapp className="btn-icon" />
              WhatsApp ({selectedCount})
            </button>
            <button onClick={sendAllWhatsApp} disabled={inventoryData.length === 0} className="toolbar-btn whatsapp-outline-btn">
              <FaWhatsapp className="btn-icon" />
              All Items
            </button>
          </div>
          <div className="toolbar-right">
            <button onClick={downloadPDF} disabled={inventoryData.length === 0} className="toolbar-btn pdf-btn">
              <FaFilePdf className="btn-icon" />
              PDF
            </button>
            <button onClick={exportCSV} disabled={inventoryData.length === 0} className="toolbar-btn excel-btn">
              <FaFileExcel className="btn-icon" />
              CSV
            </button>
            <button onClick={() => window.print()} className="toolbar-btn print-btn">
              <FiPrinter className="btn-icon" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* ==================== ENHANCED SUMMARY CARDS WITH PIE CHART ==================== */}
      {!loading && inventoryData.length > 0 && (
        <div className="enhanced-summary-container">
          {/* Left Side - Big Metric Cards */}
          <div className="summary-metrics-grid">
            <div className="summary-metric-card net-balance">
              <div className="metric-icon-wrapper">
                <FiTrendingUp className="metric-icon" />
              </div>
              <div className="metric-content">
                <span className="metric-label">Net Balance</span>
                <span className={`metric-value ${totals.totalAvailable >= 0 ? 'positive' : 'negative'}`}>
                  {formatNumber(totals.totalAvailable)} KG
                </span>
                <span className="metric-trend">
                  {totals.totalAvailable >= 0 ? 'Surplus' : 'Deficit'}
                </span>
              </div>
            </div>

            <div className="summary-metric-card production">
              <div className="metric-icon-wrapper">
                <FiZap className="metric-icon" />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Production</span>
                <span className="metric-value">{formatNumber(totals.totalProduction)} KG</span>
                <span className="metric-trend">From Flattening</span>
              </div>
            </div>

            <div className="summary-metric-card consumption">
              <div className="metric-icon-wrapper">
                <FiActivity className="metric-icon" />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Consumption</span>
                <span className="metric-value">{formatNumber(totals.totalConsumption)} KG</span>
                <span className="metric-trend">In Spiral</span>
              </div>
            </div>

            <div className="summary-metric-card can-produce">
              <div className="metric-icon-wrapper">
                <FiTarget className="metric-icon" />
              </div>
              <div className="metric-content">
                <span className="metric-label">Can Produce</span>
                <span className="metric-value positive">+{formatNumber(totals.totalPositiveSpiral)} m</span>
                <span className="metric-trend">From Available Stock</span>
              </div>
            </div>

            <div className="summary-metric-card excess-used">
              <div className="metric-icon-wrapper">
                <FiTrendingDown className="metric-icon" />
              </div>
              <div className="metric-content">
                <span className="metric-label">Excess Used</span>
                <span className="metric-value negative">-{formatNumber(totals.totalNegativeSpiral)} m</span>
                <span className="metric-trend">Above Production</span>
              </div>
            </div>

            <div className="summary-metric-card total-items">
              <div className="metric-icon-wrapper">
                <FiBox className="metric-icon" />
              </div>
              <div className="metric-content">
                <span className="metric-label">Total Items</span>
                <span className="metric-value">{totals.totalItems}</span>
                <span className="metric-trend">
                  {totals.availableItems} Available • {totals.deficitItems} Deficit
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Pie Chart */}
          <div className="summary-pie-chart-container">
            <div className="pie-chart-header">
              <FiPieChart className="pie-header-icon" />
              <h3 className="pie-header-title">Inventory Status Distribution</h3>
            </div>
            
            <div className="pie-chart-wrapper">
              {summaryPieChartData.length > 0 ? (
                <ProductionPieChart
                  title=""
                  labels={summaryPieChartData.map(item => item.name)}
                  data={summaryPieChartData.map(item => item.value)}
                  unit="items"
                  height={280}
                  donut={true}
                  showLegend={true}
                  showPercentages={true}
                  showValues={true}
                  colors={summaryPieChartData.map(item => item.color)}
                />
              ) : (
                <div className="no-chart-data">No data available</div>
              )}
            </div>
            
            <div className="pie-chart-footer">
              <div className="pie-stats">
                <div className="pie-stat-item">
                  <span className="stat-dot available"></span>
                  <span className="stat-label">Available</span>
                  <span className="stat-value">{totals.availableItems}</span>
                </div>
                <div className="pie-stat-item">
                  <span className="stat-dot deficit"></span>
                  <span className="stat-label">Deficit</span>
                  <span className="stat-value">{totals.deficitItems}</span>
                </div>
                <div className="pie-stat-item">
                  <span className="stat-dot special"></span>
                  <span className="stat-label">Special</span>
                  <span className="stat-value">{totals.specialItems}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message-container">
          <FiAlertCircle className="error-icon" />
          <div className="error-text">
            <strong>Error:</strong> {error}
          </div>
          <button onClick={() => setError(null)} className="error-close-btn">
            <FiX className="close-icon" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3 className="loading-title">Loading Inventory Data...</h3>
            <p className="loading-subtitle">Please wait while we fetch the records</p>
          </div>
        ) : inventoryData.length === 0 ? (
          <div className="empty-state">
            <FiBox className="empty-icon" />
            <h3 className="empty-title">No Combinations Found</h3>
            <p className="empty-text">
              No records match your current filters.<br />Try adjusting your date range or search criteria.
            </p>
            <button onClick={showAllData} className="empty-state-btn">
              <FiRefreshCw className="btn-icon" />
              Show All Data
            </button>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <button onClick={handleSelectAll} className="select-all-header-btn">
                        {selectAll ? <FiCheckSquare className="select-icon" /> : <FiSquare className="select-icon" />}
                      </button>
                    </th>
                    <th className="serial-col">#</th>
                    <th className="type-col">Type</th>
                    <th onClick={() => handleSort('flattening_item_code')} className="sortable-col">
                      <div className="th-content">
                        <FiBox className="th-icon" />
                        Flattening Code
                        {renderSortIcon('flattening_item_code')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('spiral_item_code')} className="sortable-col">
                      <div className="th-content">
                        <FiLayers className="th-icon" />
                        Spiral Code
                        {renderSortIcon('spiral_item_code')}
                      </div>
                    </th>
                    <th className="text-left-col">
                      <div className="th-content">
                        <FiTag className="th-icon" />
                        Flattening Name
                      </div>
                    </th>
                    <th className="text-left-col">
                      <div className="th-content">
                        <FiTag className="th-icon" />
                        Spiral Name
                      </div>
                    </th>
                    <th className="coil-size-col">
                      <div className="th-content">
                        <FiCircle className="th-icon" />
                        Coil Size
                      </div>
                    </th>
                    <th className="text-center-col">
                      <div className="th-content">
                        <FiAnchor className="th-icon" />
                        Raw Size
                      </div>
                    </th>
                    <th className="quantity-col">
                      <div className="th-content">
                        <FiZap className="th-icon production-icon" />
                        Flattening (KG)
                      </div>
                    </th>
                    <th className="quantity-col">
                      <div className="th-content">
                        <FiActivity className="th-icon consumption-icon" />
                        Spiral (KG)
                      </div>
                    </th>
                    <th onClick={() => handleSort('balance')} className="sortable-col balance-col">
                      <div className="th-content">
                        <FiAward className="th-icon" />
                        Balance (KG)
                        {renderSortIcon('balance')}
                      </div>
                    </th>
                    <th className="text-center-col">
                      <div className="th-content">
                        <FiCompass className="th-icon" />
                        Per Meter WT
                      </div>
                    </th>
                    <th onClick={() => handleSort('estimated_spiral')} className="sortable-col estimated-col">
                      <div className="th-content">
                        <FiTarget className="th-icon" />
                        Estimated (m)
                        {renderSortIcon('estimated_spiral')}
                      </div>
                    </th>
                    <th onClick={() => handleSort('status')} className="sortable-col status-col">
                      <div className="th-content">
                        <FiMap className="th-icon" />
                        Status
                        {renderSortIcon('status')}
                      </div>
                    </th>
                    <th className="date-col">
                      <div className="th-content">
                        <FiClock className="th-icon" />
                        Last Updated
                      </div>
                    </th>
                    <th className="message-col">
                      <div className="th-content">
                        <FiMessageSquare className="th-icon" />
                        Message
                      </div>
                    </th>
                    <th className="actions-col">
                      <div className="th-content">
                        <FiGlobe className="th-icon" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => {
                    const isSelected = selectedItems[item.id] || false;
                    const message = itemMessages[item.flattening_item_code] || '';
                    const isPositive = item.estimated_spiral > 0;
                    const isNegative = item.estimated_spiral < 0;
                    
                    return (
                      <tr 
                        key={item.id}
                        className={`${isSelected ? 'selected-row' : ''} ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}
                        onClick={() => setSelectedChartItem(item.id)}
                      >
                        <td className="checkbox-cell">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleItemSelect(item.id); }}
                            className={`item-checkbox-btn ${isSelected ? 'selected' : ''}`}
                          >
                            {isSelected ? <FiCheck className="checkbox-checked" /> : <FiSquare className="checkbox-unchecked" />}
                          </button>
                        </td>
                        <td className="serial-cell">{index + 1}</td>
                        <td className="type-cell">
                          {item.is_special_combination ? (
                            <span className="type-badge special">
                              <FiGitMerge className="badge-icon" />
                              SPECIAL
                            </span>
                          ) : (
                            <span className="type-badge normal">
                              NORMAL
                            </span>
                          )}
                        </td>
                        <td className="code-cell flattening-code">
                          <div className="code-wrapper">
                            <FiBox className="code-icon" />
                            <span className="code-text">{item.flattening_item_code}</span>
                          </div>
                          {item.is_special_combination && (
                            <div className="special-notes">{item.special_notes}</div>
                          )}
                        </td>
                        <td className="code-cell spiral-code">
                          <div className="code-wrapper">
                            <FiLayers className="code-icon" />
                            <span className="code-text">{item.spiral_item_code}</span>
                          </div>
                          {item.is_special_combination && (
                            <div className="special-source">from {item.flattening_items_list?.join(' + ')}</div>
                          )}
                        </td>
                        <td className="name-cell">{item.flattening_item_name}</td>
                        <td className="name-cell">{item.spiral_item_name}</td>
                        <td className="coil-size-cell">
                          {item.coil_size && item.coil_size.split(',').length > 2 ? (
                            <div className="coil-size-container multi">
                              <span className="coil-size-text multi-line">
                                {item.coil_size.split(',').slice(0, 2).join(', ')}
                              </span>
                              <span className="coil-size-more">
                                +{item.coil_size.split(',').length - 2} more
                              </span>
                            </div>
                          ) : (
                            <span className="coil-size-text single-line">
                              {item.coil_size || 'N/A'}
                            </span>
                          )}
                        </td>
                        <td className="raw-size-cell">{item.raw_material_flatsize || 'N/A'}</td>
                        <td className="quantity-cell production">
                          <div className="quantity-wrapper">
                            <FiZap className="quantity-icon production" />
                            <span>{formatNumber(item.flattening_qty)}</span>
                          </div>
                        </td>
                        <td className="quantity-cell consumption">
                          <div className="quantity-wrapper">
                            <FiActivity className="quantity-icon consumption" />
                            <span>{formatNumber(item.spiral_qty)}</span>
                          </div>
                        </td>
                        <td className={`balance-cell ${item.balance >= 0 ? 'positive' : 'negative'}`}>
                          <div className="balance-wrapper">
                            {item.balance >= 0 ? (
                              <FiPlus className="balance-icon positive" />
                            ) : (
                              <FiMinus className="balance-icon negative" />
                            )}
                            <span className="balance-amount">{formatNumber(Math.abs(item.balance))}</span>
                            <span className="balance-unit">KG</span>
                          </div>
                          {item.is_special_combination && (
                            <div className="balance-calculation">
                              {formatNumber(item.flattening_qty)} - {formatNumber(item.spiral_qty)}
                            </div>
                          )}
                        </td>
                        <td className="per-meter-cell">{item.per_meter_wt || 'N/A'}</td>
                        <td className={`estimated-cell ${isPositive ? 'positive' : isNegative ? 'negative' : ''}`}>
                          {item.estimated_spiral !== 0 ? (
                            <div className="estimated-wrapper">
                              <div className="estimated-main">
                                {isPositive && <FiTrendingUp className="estimated-icon positive" />}
                                {isNegative && <FiTrendingDown className="estimated-icon negative" />}
                                <span className="estimated-value">
                                  {isPositive ? '+' : ''}{formatNumber(item.estimated_spiral)} m
                                </span>
                              </div>
                              {item.avg_per_meter_wt > 0 && (
                                <div className="estimated-weight">
                                  ≈ {formatNumber(Math.abs(item.estimated_spiral * item.avg_per_meter_wt))} KG
                                </div>
                              )}
                            </div>
                          ) : <span className="estimated-zero">0 m</span>}
                        </td>
                        <td className="status-cell">
                          <span className={`status-badge ${item.status === 'Available' ? 'available' : 'deficit'}`}>
                            {item.status === 'Available' 
                              ? <FiCheckCircle className="status-icon" /> 
                              : <FiAlertCircle className="status-icon" />}
                            {item.status}
                          </span>
                        </td>
                        <td className="date-cell">
                          <div className="date-wrapper">
                            <FiClock className="date-icon" />
                            {formatDate(item.last_updated)}
                          </div>
                        </td>
                        <td className="message-cell">
                          <span className="message-text" title={message}>
                            {message || '-'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button 
                              onClick={() => editItemMessage(item.flattening_item_code)} 
                              className="action-btn message-btn"
                              title="Add/Edit Message"
                            >
                              <FiMessageSquare className="action-icon" />
                            </button>
                            <button 
                              onClick={() => sendItemWhatsApp(item)}
                              className="action-btn whatsapp-item-btn"
                              title="Send on WhatsApp"
                            >
                              <FaWhatsapp className="action-icon" />
                            </button>
                            <button 
                              onClick={() => setSelectedChartItem(item.id)}
                              className={`action-btn chart-btn ${selectedChartItem === item.id ? 'active' : ''}`}
                              title="View Chart"
                            >
                              <FiBarChart2 className="action-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              <div className="footer-info">
                <span>Showing <strong>{filteredData.length}</strong> of <strong>{inventoryData.length}</strong> combinations</span>
                {totals.specialItems > 0 && (
                  <span className="special-footer-badge">
                    <FiGitMerge className="footer-icon" />
                    Special Cases: {totals.specialItems}
                  </span>
                )}
                {totals.totalEstimatedSpiral !== 0 && (
                  <>
                    <span className="positive-footer-badge">
                      <FiTrendingUp className="footer-icon" />
                      Can Produce: +{formatNumber(totals.totalPositiveSpiral)} m
                    </span>
                    <span className="negative-footer-badge">
                      <FiTrendingDown className="footer-icon" />
                      Excess: -{formatNumber(totals.totalNegativeSpiral)} m
                    </span>
                  </>
                )}
              </div>
              <div className="footer-timestamp">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      {!loading && inventoryData.length > 0 && (
        <div className="charts-section">
          <div className="charts-header">
            <div className="charts-title-wrapper">
              <FiBarChart2 className="charts-main-icon" />
              <h2 className="charts-title">Item-wise Balance Analysis</h2>
              <span className="charts-subtitle">Top 10 Items by Balance</span>
            </div>
            {selectedChartItemData && (
              <div className="selected-item-indicator">
                <span className="indicator-label">Selected:</span>
                <span className={`indicator-value ${selectedChartItemData.is_special_combination ? 'special' : ''}`}>
                  {selectedChartItemData.flattening_item_code}
                  {selectedChartItemData.is_special_combination && ' (Special)'}
                </span>
              </div>
            )}
          </div>

          <div className="charts-grid">
            {chartData.map((item) => {
              const isSelected = selectedChartItem === item.id;
              const balanceValue = item.balance;
              const isPositive = balanceValue >= 0;
              const maxBalance = Math.max(...chartData.map(d => Math.abs(d.balance))) || 1;
              const percentage = Math.min(Math.abs(balanceValue) / maxBalance * 100, 100);
              
              return (
                <div 
                  key={item.id} 
                  className={`chart-card ${isSelected ? 'selected' : ''} ${item.isSpecial ? 'special-card' : ''}`}
                  onClick={() => setSelectedChartItem(item.id)}
                >
                  <div className="chart-card-header">
                    <div className="item-info">
                      <div className="item-code-wrapper">
                        {item.isSpecial ? (
                          <FiGitMerge className="item-icon special" />
                        ) : (
                          <FiBox className="item-icon" />
                        )}
                        <span className="item-code">{item.name}</span>
                      </div>
                      <span className="item-name" title={item.fullName}>
                        {item.fullName && item.fullName.length > 20 ? item.fullName.substring(0, 20) + '...' : item.fullName || ''}
                      </span>
                    </div>
                    <div className={`balance-badge ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '+' : '-'}{formatNumber(Math.abs(balanceValue))} KG
                    </div>
                  </div>

                  <div className="chart-visualization">
                    <div className="chart-bar-group">
                      <div className="bar-label">
                        <FiZap className="bar-icon production" />
                        <span>Production</span>
                      </div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill production-bar"
                          style={{ 
                            width: `${Math.min((item.production / maxBalance) * 100, 100)}%`,
                            backgroundColor: '#2563EB'
                          }}
                        >
                          <span className="bar-value">{formatNumber(item.production)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="chart-bar-group">
                      <div className="bar-label">
                        <FiActivity className="bar-icon consumption" />
                        <span>Consumption</span>
                      </div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill consumption-bar"
                          style={{ 
                            width: `${Math.min((item.consumption / maxBalance) * 100, 100)}%`,
                            backgroundColor: '#B45309'
                          }}
                        >
                          <span className="bar-value">{formatNumber(item.consumption)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="chart-bar-group">
                      <div className="bar-label">
                        {isPositive ? (
                          <FiTrendingUp className="bar-icon positive" />
                        ) : (
                          <FiTrendingDown className="bar-icon negative" />
                        )}
                        <span>Balance</span>
                      </div>
                      <div className="bar-container">
                        <div 
                          className={`bar-fill balance-bar ${isPositive ? 'positive' : 'negative'}`}
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: isPositive ? '#059669' : '#DC2626'
                          }}
                        >
                          <span className="bar-value">
                            {isPositive ? '+' : '-'}{formatNumber(Math.abs(balanceValue))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chart-card-footer">
                    <span className={`status-indicator ${item.status === 'Available' ? 'available' : 'deficit'}`}>
                      {item.status === 'Available' ? '✅' : '⚠️'} {item.status}
                    </span>
                    {item.coilSize && item.coilSize !== 'N/A' && (
                      <span className="coil-indicator" title={item.coilSize}>
                        <FiCircle className="coil-icon" />
                        {item.coilSize.split(',').length > 1 
                          ? `${item.coilSize.split(',')[0]}...` 
                          : item.coilSize}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Chart for Selected Item */}
          {selectedChartItemData && (
            <div className="detailed-chart-container">
              <div className="detailed-chart-header">
                <h3 className="detailed-chart-title">
                  <FiTarget className="detailed-icon" />
                  Detailed Analysis: {selectedChartItemData.flattening_item_code}
                  {selectedChartItemData.is_special_combination && (
                    <span className="special-badge">Special Combination</span>
                  )}
                </h3>
                <button 
                  className="view-full-btn"
                  onClick={() => sendItemWhatsApp(selectedChartItemData)}
                >
                  <FaWhatsapp className="btn-icon" />
                  Share Report
                </button>
              </div>

              <div className="detailed-chart-grid">
                <div className="metric-card">
                  <div className="metric-icon-wrapper production">
                    <FiZap className="metric-icon" />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Production</span>
                    <span className="metric-value">{formatNumber(selectedChartItemData.flattening_qty)} KG</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon-wrapper consumption">
                    <FiActivity className="metric-icon" />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Consumption</span>
                    <span className="metric-value">{formatNumber(selectedChartItemData.spiral_qty)} KG</span>
                  </div>
                </div>
                <div className={`metric-card ${selectedChartItemData.balance >= 0 ? 'positive' : 'negative'}`}>
                  <div className={`metric-icon-wrapper ${selectedChartItemData.balance >= 0 ? 'positive' : 'negative'}`}>
                    {selectedChartItemData.balance >= 0 ? (
                      <FiTrendingUp className="metric-icon" />
                    ) : (
                      <FiTrendingDown className="metric-icon" />
                    )}
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Balance</span>
                    <span className={`metric-value ${selectedChartItemData.balance >= 0 ? 'positive' : 'negative'}`}>
                      {selectedChartItemData.balance >= 0 ? '+' : '-'}
                      {formatNumber(Math.abs(selectedChartItemData.balance))} KG
                    </span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon-wrapper estimate">
                    <FiTarget className="metric-icon" />
                  </div>
                  <div className="metric-content">
                    <span className="metric-label">Estimated Spiral</span>
                    <span className="metric-value">
                      {selectedChartItemData.estimated_spiral >= 0 ? '+' : ''}
                      {formatNumber(selectedChartItemData.estimated_spiral)} m
                    </span>
                  </div>
                </div>
              </div>

              <div className="coil-size-detail">
                <FiCircle className="detail-icon" />
                <span className="detail-label">Coil Sizes:</span>
                <span className="detail-value">{selectedChartItemData.coil_size || 'N/A'}</span>
              </div>

              {selectedChartItemData.is_special_combination && (
                <div className="special-formula">
                  <FiGitMerge className="formula-icon" />
                  <span className="formula-label">Formula:</span>
                  <span className="formula-value">
                    {selectedChartItemData.flattening_items_list?.join(' + ')} → {selectedChartItemData.spiral_item_code}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlatteningInventoryReport;