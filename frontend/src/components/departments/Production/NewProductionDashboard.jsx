// src/components/departments/Production/NewProductionDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  FiPackage, FiActivity, FiClock, FiCheckCircle, 
  FiCalendar, FiTarget, FiDatabase, FiRefreshCw, 
  FiDownload, FiBarChart2, FiTrendingUp, FiUsers,
  FiGrid, FiSettings, FiFilter, FiHome, 
  FiTrendingDown, FiAlertCircle, FiLayers,
  FiScissors, FiCheckSquare, FiColumns, FiUser,
  FiStar, FiAward, FiBarChart, FiList, 
  FiChevronLeft, FiChevronRight,
  FiDollarSign, FiPercent, FiPlay, FiPause,
  FiRotateCw, FiZap, FiTool, FiBox,
  FiBarChart as FiChart, FiUserCheck, FiUserX,
  FiChevronsRight, FiChevronsLeft, FiChevronUp, FiChevronDown,
  FiSun, FiMoon, FiSunrise, FiSunset
} from "react-icons/fi";
import { 
  FaIndustry, FaCogs, FaSpinner, FaChartLine,
  FaWarehouse, FaShieldAlt, FaCut, FaBoxOpen,
  FaTable, FaUserTie, FaUsers as FaUsersIcon,
  FaHistory, FaCalendarAlt, FaRegCalendarCheck,
  FaChartBar, FaChartPie, FaChartArea, FaRobot,
  FaTachometerAlt, FaCog, FaClipboardCheck,
  FaExclamationTriangle, FaCheckCircle, FaTimesCircle,
  FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown,
  FaBolt, FaFire, FaTruck, FaBuilding,
  FaWrench, FaHammer, FaTools, FaCubes
} from "react-icons/fa";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";

// Import chart and card components
import ProductionBarChart from "../../charts/ProductionBarChart";
import ProductionLineChart from "../../charts/ProductionLineChart";
import ProductionPieChart from "../../charts/ProductionPieChart";
import StatCard from "../../cards/StatCard";

// Import CSS file
import "./NewProductionDashboard.css";

const NewProductionDashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('Flattening Section');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [productionData, setProductionData] = useState([]);
  const [lastEntry, setLastEntry] = useState(null);
  
  // Weekly Data with Navigation
  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyOffset, setWeeklyOffset] = useState(0);
  
  // Monthly Data with Navigation
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlyOffset, setMonthlyOffset] = useState(0);
  
  const [dailyData, setDailyData] = useState([]);
  const [shiftData, setShiftData] = useState({});
  
  // Separate states for historical data
  const [yesterdayProduction, setYesterdayProduction] = useState(0);
  const [lastWeekProduction, setLastWeekProduction] = useState(0);
  const [lastMonthProduction, setLastMonthProduction] = useState(0);
  const [lastMonthEfficiency, setLastMonthEfficiency] = useState(0);
  
  // Shift data for different dates
  const [yesterdayShiftData, setYesterdayShiftData] = useState({});
  const [lastWeekShiftData, setLastWeekShiftData] = useState({});
  const [lastMonthShiftData, setLastMonthShiftData] = useState({});
  
  const [stats, setStats] = useState({
    todayProduction: 0,
    avgEfficiency: 0,
    activeMachines: 0,
    totalOperators: 0,
    shiftWise: {},
    machineWise: [],
    operatorWise: [],
    yesterdayProduction: 0,
    lastWeekProduction: 0,
    lastMonthProduction: 0
  });
  
  const navigate = useNavigate();
  const { mode, isDarkMode } = useTheme();
  const darkMode = isDarkMode || mode === 'dark';

  // Departments configuration
  const departments = useMemo(() => [
    { 
      id: 1, 
      name: 'Raw Material Section', 
      icon: FaWarehouse, 
      color: '#f59e0b', 
      tableName: 'raw_material_log',
      unit: 'KG',
      keyField: 'quantity',
      dateField: 'entry_date',
      operatorField: 'received_by',
      shiftField: 'shift'
    },
    { 
      id: 2, 
      name: 'Flattening Section', 
      icon: FaIndustry, 
      color: '#3b82f6', 
      tableName: 'flatteningsection',
      unit: 'KG',
      keyField: 'production_quantity',
      dateField: 'production_date',
      efficiencyField: 'efficiency',
      operatorField: 'operator_name',
      shiftField: 'shift_name'
    },
    { 
      id: 3, 
      name: 'Spiral Section', 
      icon: FaCogs, 
      color: '#8b5cf6', 
      tableName: 'spiralsection',
      unit: 'Meter',
      keyField: 'production_quantity',
      dateField: 'production_date',
      efficiencyField: 'efficiency',
      operatorField: 'operator_name',
      shiftField: 'shift_name'
    },
    { 
      id: 4, 
      name: 'PVC Coating Section', 
      icon: FaShieldAlt, 
      color: '#10b981', 
      tableName: 'pvcsection',
      unit: 'Meter',
      keyField: 'production_quantity',
      dateField: 'production_date',
      efficiencyField: 'efficiency',
      operatorField: 'operator_name',
      shiftField: 'shift_name'
    },
    { 
      id: 5, 
      name: 'Cutting & Packing Section', 
      icon: FaCut, 
      color: '#ec4899', 
      tableName: 'cuttingpacking',
      unit: 'Meter',
      keyField: 'production_quantity',
      dateField: 'production_date',
      efficiencyField: 'efficiency',
      operatorField: 'operator_name',
      shiftField: 'shift_name'
    },
    { 
      id: 6, 
      name: 'Finishing Goods Section', 
      icon: FaBoxOpen, 
      color: '#06b6d4', 
      tableName: 'finishinggoods',
      unit: 'Meter',
      keyField: 'production_quantity',
      dateField: 'production_date',
      efficiencyField: 'efficiency',
      operatorField: 'operator_name',
      shiftField: 'shift_name'
    }
  ], []);

  const currentDept = useMemo(() => 
    departments.find(dept => dept.name === selectedDepartment),
    [departments, selectedDepartment]
  );

  // Fix: Remove decimals completely
  const removeDecimals = useCallback((value) => {
    if (value === null || value === undefined || value === '') return '0';
    
    if (typeof value === 'string') {
      const cleanValue = value.replace(/,/g, '');
      const num = parseFloat(cleanValue);
      if (isNaN(num)) return '0';
      return Math.floor(num).toLocaleString();
    }
    
    const num = Number(value);
    if (isNaN(num)) return '0';
    
    return Math.floor(num).toLocaleString();
  }, []);

  // Fix: Comprehensive shift field detection
  const detectShiftField = useCallback(async (tableName) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
      
      if (error || !data || data.length === 0) return 'shift_name';
      
      const shiftFields = ['shift_name', 'shift', 'shift_type', 'shift_code'];
      
      for (const field of shiftFields) {
        const hasData = data.some(record => 
          record[field] && 
          record[field].toString().trim() !== '' && 
          record[field].toString().trim().toLowerCase() !== 'null'
        );
        if (hasData) return field;
      }
      
      return 'shift_name';
    } catch (error) {
      console.error('Error detecting shift field:', error);
      return 'shift_name';
    }
  }, []);

  // Get dark version of color
  const getDarkColor = useCallback((color) => {
    const colorMap = {
      '#f59e0b': '#d97706',
      '#3b82f6': darkMode ? '#818cf8' : '#1d4ed8',
      '#8b5cf6': darkMode ? '#a78bfa' : '#7c3aed',
      '#10b981': darkMode ? '#34d399' : '#059669',
      '#ec4899': darkMode ? '#f472b6' : '#db2777',
      '#06b6d4': darkMode ? '#22d3ee' : '#0891b2',
      '#ef4444': darkMode ? '#f87171' : '#dc2626',
      '#64748b': darkMode ? '#94a3b8' : '#475569',
      '#84cc16': darkMode ? '#a3e635' : '#65a30d',
      '#f97316': darkMode ? '#fb923c' : '#ea580c'
    };
    return colorMap[color] || color;
  }, [darkMode]);

  // Get light version of color
  const getLightColor = useCallback((color) => {
    const colorMap = {
      '#f59e0b': darkMode ? '#451a03' : '#fef3c7',
      '#3b82f6': darkMode ? '#1e1b4b' : '#dbeafe',
      '#8b5cf6': darkMode ? '#2e1065' : '#ede9fe',
      '#10b981': darkMode ? '#064e3b' : '#d1fae5',
      '#ec4899': darkMode ? '#500724' : '#fce7f3',
      '#06b6d4': darkMode ? '#164e63' : '#cffafe',
      '#ef4444': darkMode ? '#7f1d1d' : '#fee2e2',
      '#64748b': darkMode ? '#1e293b' : '#f1f5f9',
      '#84cc16': darkMode ? '#365314' : '#ecfccb',
      '#f97316': darkMode ? '#7c2d12' : '#ffedd5'
    };
    return colorMap[color] || `${color}15`;
  }, [darkMode]);

  // Icon Box Component
  const IconBox = useCallback(({ icon: Icon, color, size = 24, label, className = "" }) => {
    const darkColor = getDarkColor(color);
    const lightColor = getLightColor(color);
    
    return (
      <div className={`icon-box ${className}`}>
        <div 
          className="icon-box-inner"
          style={{
            width: `${size + 24}px`,
            height: `${size + 24}px`,
            borderColor: darkColor,
            backgroundColor: lightColor,
            color: darkColor
          }}
        >
          <Icon size={size} />
        </div>
        {label && (
          <span className="icon-box-label">{label}</span>
        )}
      </div>
    );
  }, [getDarkColor, getLightColor]);

  // Shift name formatting - اصل نام رکھیں، تبدیل نہ کریں
  const formatShiftName = useCallback((shiftName) => {
    if (!shiftName) return 'Unknown';
    
    // صرف capitalize کریں، تبدیل نہ کریں
    return shiftName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }, []);

  // Calculate change percentage
  const calculateChange = useCallback((current, previous) => {
    if (previous === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
  }, []);

  // Calculate total production from data array
  const calculateTotalProduction = useCallback((data, department) => {
    if (!data || !data.length || !department) return 0;
    
    return data.reduce((total, record) => {
      const production = Number(record[department.keyField]) || 0;
      return total + Math.floor(production);
    }, 0);
  }, []);

  // Calculate average efficiency from data array
  const calculateAverageEfficiency = useCallback((data, department) => {
    if (!data || !data.length || !department || !department.efficiencyField) return 0;
    
    const efficiencyRecords = data.filter(record => 
      record[department.efficiencyField] && 
      !isNaN(Number(record[department.efficiencyField]))
    );
    
    if (efficiencyRecords.length === 0) return 0;
    
    const totalEfficiency = efficiencyRecords.reduce((total, record) => {
      return total + Math.floor(Number(record[department.efficiencyField]));
    }, 0);
    
    return Math.floor(totalEfficiency / efficiencyRecords.length);
  }, []);

  // Fetch yesterday's production data
  const fetchYesterdayProduction = useCallback(async (department) => {
    if (!department) return 0;
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      
      const { data, error } = await supabase
        .from(department.tableName)
        .select(department.keyField)
        .eq(department.dateField, yesterdayStr);
      
      if (error) {
        console.error('Error fetching yesterday production:', error);
        return 0;
      }
      
      return calculateTotalProduction(data || [], department);
    } catch (error) {
      console.error('Error fetching yesterday production:', error);
      return 0;
    }
  }, [calculateTotalProduction]);

  // Fetch last week's production data
  const fetchLastWeekProduction = useCallback(async (department) => {
    if (!department) return 0;
    
    try {
      const today = new Date();
      const lastWeekStart = new Date();
      lastWeekStart.setDate(today.getDate() - 7);
      
      const lastWeekStartStr = getLocalDateString(lastWeekStart);
      const todayStr = getLocalDateString(today);
      
      const { data, error } = await supabase
        .from(department.tableName)
        .select(department.keyField)
        .gte(department.dateField, lastWeekStartStr)
        .lt(department.dateField, todayStr);
      
      if (error) {
        console.error('Error fetching last week production:', error);
        return 0;
      }
      
      return calculateTotalProduction(data || [], department);
    } catch (error) {
      console.error('Error fetching last week production:', error);
      return 0;
    }
  }, [calculateTotalProduction]);

  // Fetch last month's production data
  const fetchLastMonthProduction = useCallback(async (department) => {
    if (!department) return { production: 0, efficiency: 0 };
    
    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      let lastMonth = currentMonth - 1;
      let year = currentYear;
      if (lastMonth < 0) {
        lastMonth = 11;
        year = currentYear - 1;
      }
      
      const firstDayOfLastMonth = new Date(year, lastMonth, 1);
      const lastDayOfLastMonth = new Date(year, lastMonth + 1, 0);
      
      const firstDayStr = getLocalDateString(firstDayOfLastMonth);
      const lastDayStr = getLocalDateString(lastDayOfLastMonth);
      
      const { data, error } = await supabase
        .from(department.tableName)
        .select('*')
        .gte(department.dateField, firstDayStr)
        .lte(department.dateField, lastDayStr);
      
      if (error) {
        console.error('Error in last month query:', error);
        throw error;
      }
      
      const production = calculateTotalProduction(data || [], department);
      const efficiency = calculateAverageEfficiency(data || [], department);
      
      return { production, efficiency };
    } catch (error) {
      console.error('Error fetching last month production:', error);
      return { production: 0, efficiency: 0 };
    }
  }, [calculateTotalProduction, calculateAverageEfficiency]);

  // Fetch shift data for any date
  const fetchShiftDataForDate = useCallback(async (dateStr, department = currentDept) => {
    if (!department) return {};
    
    try {
      const actualShiftField = await detectShiftField(department.tableName);
      
      const { data, error } = await supabase
        .from(department.tableName)
        .select(`${actualShiftField}, ${department.keyField}`)
        .eq(department.dateField, dateStr);
      
      if (error) throw error;
      
      const shiftProduction = {};
      
      data?.forEach(record => {
        const shift = record[actualShiftField];
        const production = Number(record[department.keyField]) || 0;
        
        if (shift && shift.toString().trim() !== '' && shift.toString().trim().toLowerCase() !== 'null') {
          const shiftName = formatShiftName(shift.toString().trim());
          const cleanProduction = Math.floor(production);
          
          if (!shiftProduction[shiftName]) {
            shiftProduction[shiftName] = 0;
          }
          shiftProduction[shiftName] += cleanProduction;
        }
      });
      
      return shiftProduction;
    } catch (error) {
      console.error(`Error fetching shift data for date ${dateStr}:`, error);
      return {};
    }
  }, [detectShiftField, formatShiftName]);

  // Fetch all shift data
  const fetchAllShiftData = useCallback(async (department = currentDept) => {
    if (!department) return;
    
    try {
      // Today's shift data
      const today = getLocalDateString(new Date());
      const todayShiftData = await fetchShiftDataForDate(today, department);
      setShiftData(todayShiftData);
      
      // Yesterday's shift data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      const yesterdayShiftData = await fetchShiftDataForDate(yesterdayStr, department);
      setYesterdayShiftData(yesterdayShiftData);
      
      // Last week shift data (aggregate)
      const lastWeekStart = new Date();
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekStartStr = getLocalDateString(lastWeekStart);
      const todayStr = getLocalDateString(new Date());
      
      const { data: lastWeekData } = await supabase
        .from(department.tableName)
        .select('*')
        .gte(department.dateField, lastWeekStartStr)
        .lt(department.dateField, todayStr);
      
      const lastWeekShiftData = {};
      lastWeekData?.forEach(record => {
        const shift = record[department.shiftField] || record.shift_name || record.shift;
        const production = Number(record[department.keyField]) || 0;
        
        if (shift) {
          const shiftName = formatShiftName(shift.toString().trim());
          if (!lastWeekShiftData[shiftName]) {
            lastWeekShiftData[shiftName] = 0;
          }
          lastWeekShiftData[shiftName] += Math.floor(production);
        }
      });
      setLastWeekShiftData(lastWeekShiftData);
      
      // Last month shift data (aggregate)
      const todayObj = new Date();
      const lastMonth = new Date(todayObj.getFullYear(), todayObj.getMonth() - 1, 1);
      const firstDayOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const lastDayOfLastMonth = new Date(todayObj.getFullYear(), todayObj.getMonth(), 0);
      
      const firstDayStr = getLocalDateString(firstDayOfLastMonth);
      const lastDayStr = getLocalDateString(lastDayOfLastMonth);
      
      const { data: lastMonthData } = await supabase
        .from(department.tableName)
        .select('*')
        .gte(department.dateField, firstDayStr)
        .lte(department.dateField, lastDayStr);
      
      const lastMonthShiftData = {};
      lastMonthData?.forEach(record => {
        const shift = record[department.shiftField] || record.shift_name || record.shift;
        const production = Number(record[department.keyField]) || 0;
        
        if (shift) {
          const shiftName = formatShiftName(shift.toString().trim());
          if (!lastMonthShiftData[shiftName]) {
            lastMonthShiftData[shiftName] = 0;
          }
          lastMonthShiftData[shiftName] += Math.floor(production);
        }
      });
      setLastMonthShiftData(lastMonthShiftData);
      
    } catch (error) {
      console.error('Error fetching all shift data:', error);
    }
  }, [fetchShiftDataForDate, formatShiftName]);

  // Get local date string (fix timezone issue)
  const getLocalDateString = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Weekly Data Fetch
  const fetchWeeklyData = useCallback(async (offset = 0, department = currentDept) => {
    if (!department) return;
    
    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - (7 * offset) - 6);
      const endDate = new Date();
      endDate.setDate(today.getDate() - (7 * offset));
      
      const startDateStr = getLocalDateString(startDate);
      const endDateStr = getLocalDateString(endDate);
      
      const { data, error } = await supabase
        .from(department.tableName)
        .select('*')
        .gte(department.dateField, startDateStr)
        .lte(department.dateField, endDateStr)
        .order(department.dateField, { ascending: true });
      
      if (error) throw error;
      
      const dayGroups = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dayName = days[date.getDay()];
        const dateStr = getLocalDateString(date);
        dayGroups[dateStr] = {
          day: dayName,
          date: dateStr,
          production: 0,
          formattedDate: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
        };
      }
      
      data?.forEach(record => {
        const date = record[department.dateField];
        if (dayGroups[date]) {
          const production = Number(record[department.keyField]) || 0;
          dayGroups[date].production += Math.floor(production);
        }
      });
      
      const weeklyDataArray = Object.values(dayGroups)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setWeeklyData(weeklyDataArray);
      
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setWeeklyData([]);
    }
  }, [getLocalDateString]);

  // Monthly Data Fetch
  const fetchMonthlyData = useCallback(async (offset = 0, department = currentDept) => {
    if (!department) return;
    
    try {
      const today = new Date();
      const targetDate = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      
      const firstDayStr = getLocalDateString(firstDayOfMonth);
      const lastDayStr = getLocalDateString(lastDayOfMonth);
      
      const { data, error } = await supabase
        .from(department.tableName)
        .select('*')
        .gte(department.dateField, firstDayStr)
        .lte(department.dateField, lastDayStr);
      
      if (error) throw error;
      
      const daysInMonth = lastDayOfMonth.getDate();
      const weeksCount = Math.ceil(daysInMonth / 7);
      const weeklyGroups = {};
      
      for (let week = 1; week <= weeksCount; week++) {
        const weekName = `Week ${week}`;
        const startDay = (week - 1) * 7 + 1;
        const endDay = Math.min(week * 7, daysInMonth);
        weeklyGroups[weekName] = {
          production: 0,
          days: 0,
          startDay: startDay,
          endDay: endDay,
          actualDays: endDay - startDay + 1
        };
      }
      
      data?.forEach(record => {
        const date = new Date(record[department.dateField]);
        const dayOfMonth = date.getDate();
        const weekNumber = Math.ceil(dayOfMonth / 7);
        const weekName = `Week ${weekNumber}`;
        
        if (weeklyGroups[weekName]) {
          const production = Number(record[department.keyField]) || 0;
          weeklyGroups[weekName].production += Math.floor(production);
          weeklyGroups[weekName].days += 1;
        }
      });
      
      const monthlyDataArray = Object.entries(weeklyGroups).map(([week, data]) => ({
        week: week,
        production: data.production,
        days: data.days,
        startDay: data.startDay,
        endDay: data.endDay,
        actualDays: data.actualDays,
        range: `${data.startDay}-${data.endDay}`
      }));
      
      setMonthlyData(monthlyDataArray);
      
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData([]);
    }
  }, [getLocalDateString]);

  // Current month daily data
  const fetchCurrentMonthDailyData = useCallback(async (department = currentDept) => {
    if (!department) return;
    
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const firstDayStr = getLocalDateString(firstDayOfMonth);
      const todayStr = getLocalDateString(today);
      
      const { data, error } = await supabase
        .from(department.tableName)
        .select('*')
        .gte(department.dateField, firstDayStr)
        .lte(department.dateField, todayStr);
      
      if (error) throw error;
      
      const currentMonthDays = [];
      const currentDate = new Date(firstDayOfMonth);
      
      while (currentDate <= today) {
        const dateStr = getLocalDateString(currentDate);
        currentMonthDays.push({
          date: dateStr,
          day: currentDate.getDate(),
          production: 0,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      data?.forEach(record => {
        const recordDate = record[department.dateField];
        const dayData = currentMonthDays.find(d => d.date === recordDate);
        if (dayData) {
          const production = Number(record[department.keyField]) || 0;
          dayData.production += Math.floor(production);
        }
      });
      
      setDailyData(currentMonthDays);
      
    } catch (error) {
      console.error('Error fetching current month daily data:', error);
      setDailyData([]);
    }
  }, [getLocalDateString]);

  // Calculate Statistics
  const calculateStats = useCallback((data, department = currentDept) => {
    if (!data || !data.length || !department) {
      setStats(prev => ({
        ...prev,
        todayProduction: 0,
        avgEfficiency: 0,
        activeMachines: 0,
        totalOperators: 0,
        shiftWise: {},
        machineWise: [],
        operatorWise: []
      }));
      return;
    }

    let totalProduction = 0;
    let totalEfficiency = 0;
    let efficiencyCount = 0;
    const machines = new Set();
    const uniqueOperators = new Set();
    const shiftCount = {};
    const machineGroups = {};
    const operatorGroups = {};
    
    data.forEach(record => {
      const production = Math.floor(Number(record[department.keyField]) || 0);
      totalProduction += production;
      
      if (department.efficiencyField && record[department.efficiencyField]) {
        const efficiency = Math.floor(Number(record[department.efficiencyField]) || 0);
        totalEfficiency += efficiency;
        efficiencyCount++;
      }
      
      let machineName = record.machine_no || record.machine_id || record.machine || 'Unknown';
      machines.add(machineName);
      
      if (!machineGroups[machineName]) {
        machineGroups[machineName] = {
          production: 0,
          efficiency: 0,
          count: 0,
          operator: record.operator_name || 'Unknown'
        };
      }
      machineGroups[machineName].production += production;
      if (department.efficiencyField && record[department.efficiencyField]) {
        machineGroups[machineName].efficiency += Math.floor(Number(record[department.efficiencyField]) || 0);
        machineGroups[machineName].count++;
      }
      
      if (record[department.operatorField]) {
        const operator = record[department.operatorField].toString().trim();
        if (operator) {
          uniqueOperators.add(operator);
          
          if (!operatorGroups[operator]) {
            operatorGroups[operator] = {
              production: 0,
              efficiency: 0,
              count: 0,
              machine: machineName
            };
          }
          operatorGroups[operator].production += production;
          if (department.efficiencyField && record[department.efficiencyField]) {
            operatorGroups[operator].efficiency += Math.floor(Number(record[department.efficiencyField]) || 0);
            operatorGroups[operator].count++;
          }
        }
      }
    });
    
    const machineWiseData = Object.entries(machineGroups).map(([machine, stats]) => ({
      name: machine === 'Unknown' ? 'Unknown Machine' : machine,
      production: stats.production,
      efficiency: stats.count > 0 ? Math.floor(stats.efficiency / stats.count) : 0,
      operator: stats.operator
    })).sort((a, b) => b.production - a.production);
    
    const operatorWiseData = Object.entries(operatorGroups).map(([operator, stats]) => ({
      name: operator,
      production: stats.production,
      efficiency: stats.count > 0 ? Math.floor(stats.efficiency / stats.count) : 0,
      machine: stats.machine
    })).sort((a, b) => b.production - a.production);
    
    setStats(prev => ({
      ...prev,
      todayProduction: totalProduction,
      avgEfficiency: efficiencyCount > 0 ? Math.floor(totalEfficiency / efficiencyCount) : 0,
      activeMachines: machines.size,
      totalOperators: uniqueOperators.size,
      shiftWise: shiftCount,
      machineWise: machineWiseData,
      operatorWise: operatorWiseData
    }));
  }, []);

  // Fetch historical data separately
  const fetchHistoricalData = useCallback(async (department = currentDept) => {
    if (!department) return;
    
    try {
      const yesterdayProd = await fetchYesterdayProduction(department);
      setYesterdayProduction(yesterdayProd);
      
      const lastWeekProd = await fetchLastWeekProduction(department);
      setLastWeekProduction(lastWeekProd);
      
      const lastMonthResult = await fetchLastMonthProduction(department);
      setLastMonthProduction(lastMonthResult.production);
      setLastMonthEfficiency(lastMonthResult.efficiency);
      
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setYesterdayProduction(0);
      setLastWeekProduction(0);
      setLastMonthProduction(0);
      setLastMonthEfficiency(0);
    }
  }, [currentDept, fetchYesterdayProduction, fetchLastWeekProduction, fetchLastMonthProduction]);

  // Main Fetch Function
  const fetchDepartmentData = useCallback(async () => {
    if (!currentDept) return;
    
    setLoading(true);
    
    try {
      let query = supabase
        .from(currentDept.tableName)
        .select('*')
        .order('id', { ascending: false });
      
      const today = getLocalDateString(new Date());
      if (dateFilter === 'today') {
        query = query.eq(currentDept.dateField, today);
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.eq(currentDept.dateField, getLocalDateString(yesterday));
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte(currentDept.dateField, getLocalDateString(weekAgo));
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte(currentDept.dateField, getLocalDateString(monthAgo));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setProductionData(data || []);
      
      if (data && data.length > 0) {
        setLastEntry(data[0]);
      }
      
      calculateStats(data || [], currentDept);
      fetchHistoricalData(currentDept);
      fetchAllShiftData(currentDept);
      fetchWeeklyData(weeklyOffset, currentDept);
      fetchMonthlyData(monthlyOffset, currentDept);
      fetchCurrentMonthDailyData(currentDept);
      
    } catch (error) {
      console.error(`Error fetching data from ${currentDept.tableName}:`, error);
      setProductionData([]);
      setLastEntry(null);
      setYesterdayProduction(0);
      setLastWeekProduction(0);
      setLastMonthProduction(0);
      setLastMonthEfficiency(0);
      setShiftData({});
      setYesterdayShiftData({});
      setLastWeekShiftData({});
      setLastMonthShiftData({});
      setWeeklyData([]);
      setMonthlyData([]);
      setDailyData([]);
      setStats({
        todayProduction: 0,
        avgEfficiency: 0,
        activeMachines: 0,
        totalOperators: 0,
        shiftWise: {},
        machineWise: [],
        operatorWise: [],
        yesterdayProduction: 0,
        lastWeekProduction: 0,
        lastMonthProduction: 0
      });
    } finally {
      setLoading(false);
    }
  }, [currentDept, dateFilter, weeklyOffset, monthlyOffset, getLocalDateString,
      calculateStats, fetchHistoricalData, fetchAllShiftData, fetchWeeklyData, fetchMonthlyData, 
      fetchCurrentMonthDailyData]);

  // Handle weekly navigation
  const handleWeeklyPrev = useCallback(() => {
    const newOffset = weeklyOffset + 1;
    setWeeklyOffset(newOffset);
    fetchWeeklyData(newOffset, currentDept);
  }, [weeklyOffset, currentDept, fetchWeeklyData]);

  const handleWeeklyNext = useCallback(() => {
    if (weeklyOffset === 0) return;
    const newOffset = weeklyOffset - 1;
    setWeeklyOffset(newOffset);
    fetchWeeklyData(newOffset, currentDept);
  }, [weeklyOffset, currentDept, fetchWeeklyData]);

  // Handle monthly navigation
  const handleMonthlyPrev = useCallback(() => {
    const newOffset = monthlyOffset + 1;
    setMonthlyOffset(newOffset);
    fetchMonthlyData(newOffset, currentDept);
  }, [monthlyOffset, currentDept, fetchMonthlyData]);

  const handleMonthlyNext = useCallback(() => {
    if (monthlyOffset === 0) return;
    const newOffset = monthlyOffset - 1;
    setMonthlyOffset(newOffset);
    fetchMonthlyData(newOffset, currentDept);
  }, [monthlyOffset, currentDept, fetchMonthlyData]);

  // Get current week range
  const getCurrentWeekRange = useCallback(() => {
    if (weeklyData.length === 0) return '';
    
    const firstDate = weeklyData[0].date;
    const lastDate = weeklyData[weeklyData.length - 1].date;
    
    const first = new Date(firstDate);
    const last = new Date(lastDate);
    
    const format = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    return `${format(first)} - ${format(last)}`;
  }, [weeklyData]);

  // Get current month name
  const getCurrentMonthName = useCallback(() => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() - monthlyOffset, 1);
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  }, [monthlyOffset]);

  // Get shift data based on date filter
  const getShiftDataForCurrentFilter = useCallback(() => {
    switch(dateFilter) {
      case 'yesterday':
        return yesterdayShiftData;
      case 'week':
        return lastWeekShiftData;
      case 'month':
        return lastMonthShiftData;
      default:
        return shiftData;
    }
  }, [dateFilter, shiftData, yesterdayShiftData, lastWeekShiftData, lastMonthShiftData]);

  // Get shift data label based on date filter
  const getShiftDataLabel = useCallback(() => {
    switch(dateFilter) {
      case 'yesterday':
        return "Yesterday's Shift-wise Production";
      case 'week':
        return "Last Week Shift-wise Production";
      case 'month':
        return "Last Month Shift-wise Production";
      default:
        return "Today's Shift-wise Production";
    }
  }, [dateFilter]);

  // Main useEffect
  useEffect(() => {
    if (currentDept) {
      fetchDepartmentData();
    }
  }, [currentDept, dateFilter, fetchDepartmentData]);

  // Reset offsets when department changes
  useEffect(() => {
    setWeeklyOffset(0);
    setMonthlyOffset(0);
  }, [selectedDepartment]);

  const handleRefresh = useCallback(() => {
    setWeeklyOffset(0);
    setMonthlyOffset(0);
    fetchDepartmentData();
  }, [fetchDepartmentData]);

  const handleExportData = useCallback(() => {
    if (!productionData.length) {
      alert('No data to export!');
      return;
    }
    
    const exportData = {
      department: selectedDepartment,
      table: currentDept.tableName,
      dateFilter: dateFilter,
      exportDate: new Date().toISOString(),
      lastEntry: lastEntry,
      weeklyData: weeklyData,
      monthlyData: monthlyData,
      dailyData: dailyData,
      shiftData: getShiftDataForCurrentFilter(),
      data: productionData,
      summary: {
        ...stats,
        yesterdayProduction,
        lastWeekProduction,
        lastMonthProduction,
        lastMonthEfficiency
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const fileName = `${currentDept.tableName}_${dateFilter}_${new Date().toISOString().split('T')[0]}.json`;
    
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [productionData, selectedDepartment, currentDept, dateFilter, lastEntry, weeklyData, monthlyData, dailyData, stats, yesterdayProduction, lastWeekProduction, lastMonthProduction, lastMonthEfficiency, getShiftDataForCurrentFilter]);

  // Get top operators (top 5)
  const getTopOperators = useCallback(() => {
    return stats.operatorWise.slice(0, 5);
  }, [stats.operatorWise]);

  // Get top machines (top 5)
  const getTopMachines = useCallback(() => {
    return stats.machineWise.slice(0, 5);
  }, [stats.machineWise]);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  }, []);

  // Get efficiency class
  const getEfficiencyClass = useCallback((efficiency) => {
    if (efficiency > 90) return 'efficiency-high';
    if (efficiency > 80) return 'efficiency-medium';
    return 'efficiency-low';
  }, []);

  // Format operator name for display
  const formatOperatorName = useCallback((name) => {
    if (!name) return 'Unknown';
    return name.length > 15 ? name.substring(0, 15) + '...' : name;
  }, []);

  // Format machine name for display
  const formatMachineName = useCallback((name) => {
    if (!name) return 'Unknown Machine';
    return name.length > 12 ? name.substring(0, 12) + '...' : name;
  }, []);

  // Stats cards data
  const statsCards = useMemo(() => [
    { 
      title: "Today's Production", 
      value: loading ? "..." : `${removeDecimals(stats.todayProduction)} ${currentDept?.unit}`,
      change: calculateChange(stats.todayProduction, yesterdayProduction), 
      icon: FiPackage, 
      color: currentDept?.color || "#3b82f6",
      description: `${currentDept?.unit} produced today`,
      isPositive: stats.todayProduction >= yesterdayProduction,
      link: "#"
    },
    { 
      title: "Yesterday's Production", 
      value: loading ? "..." : `${removeDecimals(yesterdayProduction)} ${currentDept?.unit}`,
      change: calculateChange(yesterdayProduction, lastWeekProduction / 7), 
      icon: FaHistory, 
      color: "#8b5cf6",
      description: `${currentDept?.unit} produced yesterday`,
      isPositive: yesterdayProduction > 0,
      link: "#"
    },
    { 
      title: "Last Week Total", 
      value: loading ? "..." : `${removeDecimals(lastWeekProduction)} ${currentDept?.unit}`,
      change: calculateChange(lastWeekProduction, lastMonthProduction / 4), 
      icon: FaCalendarAlt, 
      color: "#10b981",
      description: `${currentDept?.unit} last week`,
      isPositive: lastWeekProduction > 0,
      link: "#"
    },
    { 
      title: "Last Month Total", 
      value: loading ? "..." : `${removeDecimals(lastMonthProduction)} ${currentDept?.unit}`,
      change: "+0%", 
      icon: FaRegCalendarCheck, 
      color: "#ec4899",
      description: `${currentDept?.unit} last month`,
      isPositive: lastMonthProduction > 0,
      link: "#"
    },
    { 
      title: "Avg Efficiency", 
      value: loading ? "..." : `${stats.avgEfficiency}%`, 
      change: calculateChange(stats.avgEfficiency, lastMonthEfficiency), 
      icon: FiActivity, 
      color: "#06b6d4",
      description: "Average efficiency rate",
      isPositive: stats.avgEfficiency >= lastMonthEfficiency,
      link: "#"
    },
    { 
      title: "Active Operators", 
      value: loading ? "..." : stats.totalOperators.toString(), 
      change: `Unique: ${stats.totalOperators}`, 
      icon: FiUsers, 
      color: "#f59e0b",
      description: "Unique operators working today",
      isPositive: true,
      link: "#"
    }
  ], [loading, stats, yesterdayProduction, lastWeekProduction, lastMonthProduction, lastMonthEfficiency, currentDept, removeDecimals, calculateChange]);

  // Render function
  return (
    <div className={`production-dashboard ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ 
            margin: "0", 
            fontSize: "32px", 
            color: "var(--color-text-primary)",
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              border: `3px solid ${getDarkColor(currentDept?.color || '#3b82f6')}`,
              background: getLightColor(currentDept?.color || '#3b82f6'),
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: getDarkColor(currentDept?.color || '#3b82f6')
            }}>
              {currentDept?.icon ? React.createElement(currentDept.icon, { size: 28 }) : <FaIndustry size={28} />}
            </div>
            <span>Production Dashboard - Live Data</span>
          </h1>
          <p style={{ 
            margin: "10px 0 0 75px", 
            color: "var(--color-text-secondary)",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap"
          }}>
            <IconBox icon={FiDatabase} color="#3b82f6" size={16} />
            <strong>{currentDept?.tableName}</strong>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <IconBox icon={FiPackage} color="#10b981" size={16} />
            <span>Unit: </span>
            <strong>{currentDept?.unit}</strong>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <IconBox icon={FiList} color="#8b5cf6" size={16} />
            <span>Records: </span>
            <strong>{productionData.length}</strong>
            <span style={{ color: "var(--color-border)" }}>•</span>
            <span className={loading ? "badge badge-warning" : "badge badge-success"} style={{
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
              {loading ? (
                <>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    border: `2px solid var(--color-warning)`,
                    background: "var(--color-surface)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <FaSpinner className="spin-animation" size={10} />
                  </div>
                  Loading Data...
                </>
              ) : (
                <>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    border: `2px solid var(--color-success)`,
                    background: "var(--color-success)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white"
                  }}>
                    ✓
                  </div>
                  Data Loaded
                </>
              )}
            </span>
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Date Filter */}
          <div className="dashboard-card" style={{ 
            display: "flex", 
            alignItems: "center",
            gap: "10px"
          }}>
            <IconBox icon={FiFilter} color="#8b5cf6" size={18} label="Filter" />
            
            <div style={{ 
              display: "flex", 
              background: "var(--color-background)",
              padding: "4px",
              borderRadius: "8px",
              border: `1px solid var(--color-border)`
            }}>
              {[
                { key: 'today', icon: FiPlay, color: '#10b981', label: 'Today' },
                { key: 'yesterday', icon: FiRotateCw, color: '#f59e0b', label: 'Yesterday' },
                { key: 'week', icon: FiCalendar, color: '#3b82f6', label: 'Week' },
                { key: 'month', icon: FiBarChart, color: '#8b5cf6', label: 'Month' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setDateFilter(filter.key)}
                  className="btn"
                  style={{
                    background: dateFilter === filter.key ? 
                      `${filter.color}${darkMode ? '30' : '15'}` : 'transparent',
                    color: dateFilter === filter.key ? getDarkColor(filter.color) : "var(--color-text-secondary)",
                    border: `1px solid ${dateFilter === filter.key ? getDarkColor(filter.color) : "var(--color-border)"}`,
                    padding: '8px 16px'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: `2px solid ${getDarkColor(filter.color)}`,
                    background: dateFilter === filter.key ? filter.color : 'transparent',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: dateFilter === filter.key ? (darkMode ? '#000' : '#FFF') : getDarkColor(filter.color)
                  }}>
                    {React.createElement(filter.icon, { size: 12 })}
                  </div>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn btn-outline"
            style={{
              opacity: loading ? 0.7 : 1
            }}
          >
            <IconBox icon={FiRefreshCw} color="#64748b" size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          {/* Export Button */}
          <button
            onClick={handleExportData}
            disabled={loading || !productionData.length}
            className="btn btn-primary"
            style={{
              opacity: loading || !productionData.length ? 0.7 : 1,
              backgroundColor: getLightColor(currentDept?.color || '#3b82f6'),
              color: getDarkColor(currentDept?.color || '#3b82f6'),
              borderColor: getDarkColor(currentDept?.color || '#3b82f6')
            }}
          >
            <IconBox icon={FiDownload} color={currentDept?.color || '#3b82f6'} size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Department Selector */}
      <div className="dashboard-section">
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          fontSize: "15px",
          color: "var(--color-text-secondary)",
          paddingRight: "15px",
          borderRight: `1px solid var(--color-border)`,
          marginBottom: "20px"
        }}>
          <IconBox icon={FiGrid} color="#8b5cf6" size={20} label="Select" />
          <span>Select Department:</span>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "15px"
        }}>
          {departments.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.name)}
              className="btn"
              style={{
                background: selectedDepartment === dept.name ? 
                  getLightColor(dept.color) : 'transparent',
                color: selectedDepartment === dept.name ? getDarkColor(dept.color) : "var(--color-text-secondary)",
                borderColor: selectedDepartment === dept.name ? getDarkColor(dept.color) : "var(--color-border)",
                padding: '15px',
                minHeight: '80px',
                justifyContent: 'flex-start'
              }}
            >
              <IconBox icon={dept.icon} color={dept.color} size={20} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  color: selectedDepartment === dept.name ? getDarkColor(dept.color) : "var(--color-text-primary)"
                }}>
                  {dept.name}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: "var(--color-text-secondary)",
                  marginTop: '4px'
                }}>
                  Table: {dept.tableName} • {dept.unit}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Last Entry Card */}
      {lastEntry && !loading && (
        <div className="dashboard-section" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "100px",
            height: "100px",
            background: `${getLightColor(currentDept?.color)}${darkMode ? '30' : ''}`,
            borderRadius: "50%",
            transform: "translate(30px, -30px)",
            opacity: darkMode ? 0.3 : 0.1
          }}></div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "20px",
            position: "relative",
            zIndex: 1
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <IconBox icon={FiList} color={currentDept?.color} size={28} label="Last Entry" />
              <div>
                <h3 className="chart-title">
                  Last Entry Added
                </h3>
                <p className="data-label">
                  Most recent production record
                </p>
              </div>
            </div>
            <div className="badge badge-primary">
              <IconBox icon={FiClock} color={currentDept?.color} size={14} />
              {formatDate(lastEntry[currentDept.dateField])}
            </div>
          </div>
          
          <div className="grid-info">
            <div>
              <div className="data-label">
                <IconBox icon={FaCog} color="#8b5cf6" size={14} />
                Machine
              </div>
              <div className="data-value">
                {lastEntry.machine_no || lastEntry.machine_id || 'N/A'}
              </div>
            </div>
            <div>
              <div className="data-label">
                <IconBox icon={FiPackage} color={currentDept?.color} size={14} />
                Production Quantity
              </div>
              <div className="data-value" style={{ color: getDarkColor(currentDept?.color) }}>
                {lastEntry.production_quantity ? removeDecimals(lastEntry.production_quantity) : '0'} {currentDept?.unit}
              </div>
            </div>
            <div>
              <div className="data-label">
                <IconBox icon={FiUser} color="#f59e0b" size={14} />
                Operator
              </div>
              <div className="data-value">
                {lastEntry.operator_name || lastEntry.received_by || 'N/A'}
              </div>
            </div>
            <div>
              <div className="data-label">
                <IconBox icon={FiActivity} color="#10b981" size={14} />
                Efficiency
              </div>
              <div className="data-value" style={{ 
                color: lastEntry.efficiency > 90 ? "var(--color-success)" :
                       lastEntry.efficiency > 80 ? "var(--color-primary)" :
                       lastEntry.efficiency > 70 ? "var(--color-warning)" : "var(--color-error)"
              }}>
                {lastEntry.efficiency ? `${removeDecimals(lastEntry.efficiency)}%` : 'N/A'}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: `1px solid var(--color-border)`,
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            position: "relative",
            zIndex: 1
          }}>
            <IconBox icon={FiAlertCircle} color="#f59e0b" size={12} />
            <span>This is the most recent entry in the database</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid-cards">
        {statsCards.map((stat, index) => (
          <div className="dashboard-card" key={index}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              change={stat.change}
              description={stat.description}
              link={stat.link}
              loading={loading}
              isPositive={stat.isPositive}
              darkMode={darkMode}
            />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid-charts">
        {/* Weekly Production Trend with Navigation */}
        <div className="dashboard-section">
          <div className="chart-controls">
            <h3 className="chart-title">
              <IconBox icon={FaChartLine} color="#3b82f6" size={20} />
              7-Day Production Trend
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge badge-primary">
                {currentDept?.unit}
              </span>
              <span className="chart-period">
                {getCurrentWeekRange()}
              </span>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="chart-controls">
            <button
              onClick={handleWeeklyPrev}
              disabled={loading}
              className="chart-nav-btn"
            >
              <FiChevronLeft size={16} />
              Previous Week
            </button>
            
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ 
                fontSize: "14px", 
                color: "var(--color-text-primary)",
                fontWeight: "600"
              }}>
                Week {weeklyOffset === 0 ? "Current" : `-${weeklyOffset}`}
              </span>
            </div>
            
            <button
              onClick={handleWeeklyNext}
              disabled={weeklyOffset === 0 || loading}
              className="chart-nav-btn"
            >
              Next Week
              <FiChevronRight size={16} />
            </button>
          </div>
          
          {loading ? (
            <div className="loading-state">
              Loading weekly data...
            </div>
          ) : weeklyData.length > 0 ? (
            <>
              <ProductionBarChart 
                title={null}
                labels={weeklyData.map(d => d.day.substring(0, 3))}
                data={weeklyData.map(d => d.production)}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444']}
                height={250}
                darkMode={darkMode}
                unit={currentDept?.unit || ''}
                showStats={false}
              />
              
              {/* Footer Stats */}
              <div className="chart-footer-stats">
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Total:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(weeklyData.reduce((sum, d) => sum + d.production, 0))} {currentDept?.unit}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Avg:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(Math.round(weeklyData.reduce((sum, d) => sum + d.production, 0) / 7))} {currentDept?.unit}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Max:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(Math.max(...weeklyData.map(d => d.production)))} {currentDept?.unit}
                  </span>
                </div>
              </div>
              
              <div className="week-chart-labels">
                {weeklyData.map((day, index) => (
                  <div key={index} className="week-label">
                    <div className="week-label-day">{day.day}</div>
                    <div className="week-label-date">{day.formattedDate}</div>
                    <div className="week-label-quantity">
                      {removeDecimals(day.production)} {currentDept?.unit}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              No weekly data available
            </div>
          )}
        </div>

        {/* Monthly Data with Navigation */}
        <div className="dashboard-section">
          <div className="chart-controls">
            <h3 className="chart-title">
              <IconBox icon={FaChartBar} color="#10b981" size={20} />
              Monthly Production
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge badge-success">
                {currentDept?.unit}
              </span>
              <span className="chart-period">
                {getCurrentMonthName()}
              </span>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="chart-controls">
            <button
              onClick={handleMonthlyPrev}
              disabled={loading}
              className="chart-nav-btn"
            >
              <FiChevronLeft size={16} />
              Previous Month
            </button>
            
            <div style={{ flex: 1, textAlign: "center" }}>
              <span style={{ 
                fontSize: "14px", 
                color: "var(--color-text-primary)",
                fontWeight: "600"
              }}>
                {monthlyOffset === 0 ? "Current Month" : `${monthlyOffset} Month${monthlyOffset > 1 ? 's' : ''} Ago`}
              </span>
            </div>
            
            <button
              onClick={handleMonthlyNext}
              disabled={monthlyOffset === 0 || loading}
              className="chart-nav-btn"
            >
              Next Month
              <FiChevronRight size={16} />
            </button>
          </div>
          
          {loading ? (
            <div className="loading-state">
              Loading monthly data...
            </div>
          ) : monthlyData.length > 0 ? (
            <>
              <ProductionBarChart 
                title={null}
                labels={monthlyData.map(m => `${m.week}\n(${m.range})`)}
                data={monthlyData.map(m => m.production)}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']}
                height={250}
                darkMode={darkMode}
                unit={currentDept?.unit || ''}
                showStats={false}
              />
              
              {/* Footer Stats */}
              <div className="chart-footer-stats">
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Total:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(monthlyData.reduce((sum, m) => sum + m.production, 0))} {currentDept?.unit}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Avg per Week:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(Math.round(monthlyData.reduce((sum, m) => sum + m.production, 0) / monthlyData.length))} {currentDept?.unit}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Max Week:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(Math.max(...monthlyData.map(m => m.production)))} {currentDept?.unit}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${monthlyData.length}, 1fr)`,
                gap: "10px",
                marginTop: "15px"
              }}>
                {monthlyData.map((week, index) => (
                  <div key={index} className="dashboard-card" style={{ padding: "10px", textAlign: "center" }}>
                    <div className="data-label" style={{ fontSize: "12px", marginBottom: "5px" }}>
                      {week.week} ({week.range})
                    </div>
                    <div className="data-value" style={{ fontSize: "16px" }}>
                      {removeDecimals(week.production)}
                    </div>
                    <div className="data-unit">
                      {week.actualDays} days • {currentDept?.unit}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              No monthly data available
            </div>
          )}
        </div>

        {/* Current Month Daily Production */}
        <div className="dashboard-section">
          <div className="chart-controls">
            <h3 className="chart-title">
              <IconBox icon={FaChartArea} color="#ec4899" size={20} />
              Current Month Daily Production
            </h3>
            <span className="badge badge-error">
              {dailyData.length} days
            </span>
          </div>
          
          {loading ? (
            <div className="loading-state">
              Loading daily data...
            </div>
          ) : dailyData.length > 0 ? (
            <>
              <ProductionLineChart 
                title={null}
                labels={dailyData.map(d => d.day.toString())}
                data={dailyData.map(d => d.production)}
                lineColor="#ec4899"
                fillColor={darkMode ? "#1f2937" : "#fce7f3"}
                height={250}
                darkMode={darkMode}
                unit={currentDept?.unit || ''}
                showStats={false}
              />
              
              {/* Footer Stats */}
              <div className="chart-footer-stats">
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Total:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(dailyData.reduce((sum, d) => sum + d.production, 0))} {currentDept?.unit}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Avg per Day:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(Math.round(dailyData.reduce((sum, d) => sum + d.production, 0) / dailyData.length))} {currentDept?.unit}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Max Day:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(Math.max(...dailyData.map(d => d.production)))} {currentDept?.unit}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "15px",
                fontSize: "12px",
                color: "var(--color-text-secondary)"
              }}>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "5px", color: "var(--color-text-primary)" }}>Start Date</div>
                  <div>{dailyData[0]?.date || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "5px", color: "var(--color-text-primary)" }}>End Date</div>
                  <div>{dailyData[dailyData.length - 1]?.date || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "5px", color: "var(--color-text-primary)" }}>Total</div>
                  <div>{removeDecimals(dailyData.reduce((sum, day) => sum + day.production, 0))} {currentDept?.unit}</div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              No daily data available for current month
            </div>
          )}
        </div>

        {/* Shift-wise Production - FIXED */}
        <div className="dashboard-section">
          <div className="chart-controls">
            <h3 className="chart-title">
              <IconBox icon={FiClock} color="#f59e0b" size={20} />
              {getShiftDataLabel()}
            </h3>
            <span className="badge badge-warning">
              {Object.keys(getShiftDataForCurrentFilter()).length} Shifts
            </span>
          </div>
          
          <div style={{ marginBottom: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
            {['today', 'yesterday', 'week', 'month'].map(filterType => (
              <button
                key={filterType}
                onClick={() => setDateFilter(filterType)}
                className="btn"
                style={{
                  background: dateFilter === filterType ? 
                    `${filterType === 'today' ? '#10b981' : 
                      filterType === 'yesterday' ? '#f59e0b' : 
                      filterType === 'week' ? '#3b82f6' : '#8b5cf6'}${darkMode ? '30' : '15'}` : 'transparent',
                  color: dateFilter === filterType ? 
                    getDarkColor(filterType === 'today' ? '#10b981' : 
                      filterType === 'yesterday' ? '#f59e0b' : 
                      filterType === 'week' ? '#3b82f6' : '#8b5cf6') : "var(--color-text-secondary)",
                  border: `1px solid ${dateFilter === filterType ? 
                    getDarkColor(filterType === 'today' ? '#10b981' : 
                      filterType === 'yesterday' ? '#f59e0b' : 
                      filterType === 'week' ? '#3b82f6' : '#8b5cf6') : "var(--color-border)"}`,
                  padding: '6px 12px',
                  fontSize: '13px'
                }}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
          
          {loading ? (
            <div className="loading-state">
              Loading shift data...
            </div>
          ) : Object.keys(getShiftDataForCurrentFilter()).length > 0 ? (
            <>
              <ProductionPieChart 
                title={getShiftDataLabel()}
                labels={Object.keys(getShiftDataForCurrentFilter())}
                data={Object.values(getShiftDataForCurrentFilter())}
                colors={['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#ec4899', '#ef4444']}
                height={500}
                unit={currentDept?.unit || ''}
                showCenterTotal={true}
                showPercentages={true}
                showValues={true}
                innerRadius="65%"
                showLegend={false}
              />
            </>
          ) : (
            <div className="empty-state">
              {dateFilter === 'today' ? 'No shift data available for today' :
               dateFilter === 'yesterday' ? 'No shift data available for yesterday' :
               dateFilter === 'week' ? 'No shift data available for last week' :
               'No shift data available for last month'}
            </div>
          )}
        </div>
      </div>

      {/* Machine-wise and Operator-wise Charts Section */}
      <div className="grid-charts">
        {/* Machine-wise Production Chart */}
        <div className="dashboard-section">
          <div className="chart-controls">
            <h3 className="chart-title">
              <IconBox icon={FaCog} color="#8b5cf6" size={20} />
              Machine-wise Production ({dateFilter})
            </h3>
            <span className="badge badge-primary">
              Top {Math.min(5, stats.machineWise.length)} Machines
            </span>
          </div>
          
          {loading ? (
            <div className="loading-state">
              Loading machine data...
            </div>
          ) : stats.machineWise.length > 0 ? (
            <>
              <ProductionBarChart 
                title={null}
                labels={stats.machineWise.slice(0, 5).map(m => formatMachineName(m.name))}
                data={stats.machineWise.slice(0, 5).map(m => m.production)}
                colors={['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b']}
                height={250}
                darkMode={darkMode}
                unit={currentDept?.unit || ''}
                showStats={false}
              />
              
              {/* Footer Stats */}
              <div className="chart-footer-stats">
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Total:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(stats.machineWise.reduce((sum, m) => sum + m.production, 0))} {currentDept?.unit}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Active Machines:</span>
                  <span className="chart-footer-value">
                    {stats.activeMachines}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Top Machine:</span>
                  <span className="chart-footer-value">
                    {stats.machineWise[0]?.name || 'N/A'}
                  </span>
                </div>
              </div>
              
              {/* Machine-wise Chart Details */}
              <div className="chart-details">
                <div className="chart-details-header">
                  <div className="chart-details-title">
                    <IconBox icon={FaCogs} color="#8b5cf6" size={16} />
                    Machine Performance Details ({dateFilter})
                  </div>
                  <div className="badge badge-primary">
                    {stats.activeMachines} Active Machines
                  </div>
                </div>
                
                <div className="chart-details-content">
                  {stats.machineWise.slice(0, 3).map((machine, index) => (
                    <div key={index} className="chart-detail-item">
                      <div className="chart-detail-label">
                        <span style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: ['#8b5cf6', '#3b82f6', '#06b6d4'][index % 3]
                        }}></span>
                        {formatMachineName(machine.name)}
                      </div>
                      <div className="chart-detail-value">
                        {removeDecimals(machine.production)} {currentDept?.unit}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: machine.efficiency > 90 ? "var(--color-success)" :
                               machine.efficiency > 80 ? "var(--color-primary)" :
                               machine.efficiency > 70 ? "var(--color-warning)" : "var(--color-error)",
                        marginTop: '5px'
                      }}>
                        Efficiency: {machine.efficiency}%
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: "var(--color-text-secondary)",
                        marginTop: '3px'
                      }}>
                        Operator: {machine.operator}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Top 5 Machines Grid */}
                <div className="top-performers-grid">
                  {stats.machineWise.slice(0, 5).map((machine, index) => (
                    <div key={index} className="top-performer-card">
                      <div 
                        className="top-performer-rank"
                        style={{
                          backgroundColor: 
                            index === 0 ? '#f59e0b' :
                            index === 1 ? '#94a3b8' :
                            index === 2 ? '#8b5cf6' : 'var(--color-border)'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="top-performer-name">
                        {formatMachineName(machine.name)}
                      </div>
                      <div className="top-performer-production">
                        {removeDecimals(machine.production)} {currentDept?.unit}
                      </div>
                      <div className="top-performer-stats">
                        <div>Operator: {machine.operator}</div>
                        <div style={{ marginTop: '5px' }}>
                          Efficiency: 
                          <span className={`top-performer-efficiency ${getEfficiencyClass(machine.efficiency)}`}>
                            {machine.efficiency}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="chart-empty-state">
              <div className="chart-empty-icon">
                <FaCogs />
              </div>
              <div>No machine data available</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>
                Machine production data will appear here
              </div>
            </div>
          )}
        </div>

        {/* Operator-wise Production Chart */}
        <div className="dashboard-section">
          <div className="chart-controls">
            <h3 className="chart-title">
              <IconBox icon={FiUser} color="#10b981" size={20} />
              Operator-wise Production ({dateFilter})
            </h3>
            <span className="badge badge-success">
              Top {Math.min(5, stats.operatorWise.length)} Operators
            </span>
          </div>
          
          {loading ? (
            <div className="loading-state">
              Loading operator data...
            </div>
          ) : stats.operatorWise.length > 0 ? (
            <>
              <ProductionBarChart 
                title={null}
                labels={stats.operatorWise.slice(0, 5).map(o => 
                  formatOperatorName(o.name)
                )}
                data={stats.operatorWise.slice(0, 5).map(o => o.production)}
                colors={['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b']}
                height={250}
                darkMode={darkMode}
                unit={currentDept?.unit || ''}
                showStats={false}
              />
              
              {/* Footer Stats */}
              <div className="chart-footer-stats">
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Total:</span>
                  <span className="chart-footer-value">
                    {removeDecimals(stats.operatorWise.reduce((sum, o) => sum + o.production, 0))} {currentDept?.unit}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Unique Operators:</span>
                  <span className="chart-footer-value">
                    {stats.totalOperators}
                  </span>
                </div>
                <div className="chart-footer-stat">
                  <span className="chart-footer-label">Top Operator:</span>
                  <span className="chart-footer-value">
                    {stats.operatorWise[0]?.name || 'N/A'}
                  </span>
                </div>
              </div>
              
              {/* Operator-wise Chart Details */}
              <div className="chart-details">
                <div className="chart-details-header">
                  <div className="chart-details-title">
                    <IconBox icon={FiUsers} color="#10b981" size={16} />
                    Operator Performance Details ({dateFilter})
                  </div>
                  <div className="badge badge-success">
                    {stats.totalOperators} Unique Operators
                  </div>
                </div>
                
                <div className="chart-details-content">
                  {stats.operatorWise.slice(0, 3).map((operator, index) => (
                    <div key={index} className="chart-detail-item">
                      <div className="chart-detail-label">
                        <span style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: ['#10b981', '#06b6d4', '#3b82f6'][index % 3]
                        }}></span>
                        {formatOperatorName(operator.name)}
                      </div>
                      <div className="chart-detail-value">
                        {removeDecimals(operator.production)} {currentDept?.unit}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: operator.efficiency > 90 ? "var(--color-success)" :
                               operator.efficiency > 80 ? "var(--color-primary)" :
                               operator.efficiency > 70 ? "var(--color-warning)" : "var(--color-error)",
                        marginTop: '5px'
                      }}>
                        Efficiency: {operator.efficiency}%
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: "var(--color-text-secondary)",
                        marginTop: '3px'
                      }}>
                        Machine: {operator.machine}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Top 5 Operators Grid */}
                <div className="top-performers-grid">
                  {stats.operatorWise.slice(0, 5).map((operator, index) => (
                    <div key={index} className="top-performer-card">
                      <div 
                        className="top-performer-rank"
                        style={{
                          backgroundColor: 
                            index === 0 ? '#f59e0b' :
                            index === 1 ? '#94a3b8' :
                            index === 2 ? '#8b5cf6' : 'var(--color-border)'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="top-performer-name">
                        {formatOperatorName(operator.name)}
                      </div>
                      <div className="top-performer-production">
                        {removeDecimals(operator.production)} {currentDept?.unit}
                      </div>
                      <div className="top-performer-stats">
                        <div>Machine: {operator.machine}</div>
                        <div style={{ marginTop: '5px' }}>
                          Efficiency: 
                          <span className={`top-performer-efficiency ${getEfficiencyClass(operator.efficiency)}`}>
                            {operator.efficiency}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Additional Operator Statistics */}
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--color-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <IconBox icon={FiActivity} color="#f59e0b" size={14} />
                      Operator Performance Summary ({dateFilter})
                    </div>
                    <div className="badge badge-warning">
                      {stats.operatorWise.length} Operators
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)'
                  }}>
                    <div>
                      <div>Top Operator:</div>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {stats.operatorWise[0]?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div>Total Production:</div>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {removeDecimals(stats.operatorWise.reduce((sum, op) => sum + op.production, 0))} {currentDept?.unit}
                      </div>
                    </div>
                    <div>
                      <div>Avg Efficiency:</div>
                      <div style={{ 
                        fontWeight: '600',
                        color: stats.avgEfficiency > 90 ? "var(--color-success)" :
                               stats.avgEfficiency > 80 ? "var(--color-primary)" :
                               stats.avgEfficiency > 70 ? "var(--color-warning)" : "var(--color-error)"
                      }}>
                        {stats.avgEfficiency}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="chart-empty-state">
              <div className="chart-empty-icon">
                <FiUsers />
              </div>
              <div>No operator data available</div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>
                Operator production data will appear here
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Performers Section */}
      <div className="grid-charts">
        {/* Top Operators Table */}
        <div className="dashboard-section">
          <h3 className="chart-title">
            <IconBox icon={FiStar} color="#f59e0b" size={20} />
            Top Operators Performance (Unique) - {dateFilter}
          </h3>
          
          {loading ? (
            <div className="loading-state">
              Loading operator data...
            </div>
          ) : stats.operatorWise.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="table-header">
                    <th style={{ padding: "12px", textAlign: "left" }}>Rank</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Operator</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Production</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Efficiency</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Machine</th>
                  </tr>
                </thead>
                <tbody>
                  {getTopOperators().map((operator, index) => (
                    <tr 
                      key={index}
                      className="table-row"
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          background: index === 0 ? "#f59e0b" : 
                                    index === 1 ? "#94a3b8" : 
                                    index === 2 ? "#8b5cf6" : "var(--color-border)",
                          color: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td style={{ padding: "12px", fontWeight: "500" }}>
                        {operator.name}
                      </td>
                      <td style={{ padding: "12px", fontWeight: "600" }}>
                        {removeDecimals(operator.production)} {currentDept?.unit}
                      </td>
                      <td style={{ 
                        padding: "12px",
                        fontWeight: "600",
                        color: operator.efficiency > 90 ? "var(--color-success)" :
                               operator.efficiency > 80 ? "var(--color-primary)" :
                               operator.efficiency > 70 ? "var(--color-warning)" : "var(--color-error)"
                      }}>
                        {operator.efficiency}%
                      </td>
                      <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>
                        {operator.machine}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              No operator data available
            </div>
          )}
        </div>

        {/* Top Machines Table */}
        <div className="dashboard-section">
          <h3 className="chart-title">
            <IconBox icon={FiAward} color="#06b6d4" size={20} />
            Top Machines Performance - {dateFilter}
          </h3>
          
          {loading ? (
            <div className="loading-state">
              Loading machine data...
            </div>
          ) : stats.machineWise.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr className="table-header">
                    <th style={{ padding: "12px", textAlign: "left" }}>Rank</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Machine</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Production</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Efficiency</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {getTopMachines().map((machine, index) => (
                    <tr 
                      key={index}
                      className="table-row"
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          background: index === 0 ? "#f59e0b" : 
                                    index === 1 ? "#94a3b8" : 
                                    index === 2 ? "#8b5cf6" : "var(--color-border)",
                          color: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td style={{ padding: "12px", fontWeight: "500" }}>
                        {machine.name}
                      </td>
                      <td style={{ padding: "12px", fontWeight: "600" }}>
                        {removeDecimals(machine.production)} {currentDept?.unit}
                      </td>
                      <td style={{ 
                        padding: "12px",
                        fontWeight: "600",
                        color: machine.efficiency > 90 ? "var(--color-success)" :
                               machine.efficiency > 80 ? "var(--color-primary)" :
                               machine.efficiency > 70 ? "var(--color-warning)" : "var(--color-error)"
                      }}>
                        {machine.efficiency}%
                      </td>
                      <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>
                        {machine.operator}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              No machine data available
            </div>
          )}
        </div>
      </div>

      {/* Data Table Section */}
      <div className="dashboard-section">
        <div className="chart-controls">
          <h3 className="chart-title">
            <IconBox icon={FaTable} color="#8b5cf6" size={20} />
            Production Records ({dateFilter}) - {productionData.length} records
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigate(`/add-record?table=${currentDept.tableName}`)}
              className="btn btn-primary"
              style={{
                backgroundColor: getLightColor(currentDept?.color),
                color: getDarkColor(currentDept?.color),
                borderColor: getDarkColor(currentDept?.color)
              }}
            >
              <IconBox icon={FiCheckSquare} color={currentDept?.color} size={14} />
              Add Record
            </button>
            <button
              onClick={() => navigate(`/view-all?table=${currentDept.tableName}`)}
              className="btn btn-outline"
              style={{
                color: getDarkColor(currentDept?.color),
                borderColor: getDarkColor(currentDept?.color)
              }}
            >
              <IconBox icon={FiColumns} color={currentDept?.color} size={14} />
              View All
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            Loading production data...
          </div>
        ) : productionData.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr className="table-header">
                  <th style={{ padding: "12px", textAlign: "left" }}>Machine</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Item</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Production</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Efficiency</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Operator</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Shift</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {productionData.slice(0, 10).map((record, index) => (
                  <tr 
                    key={index}
                    className="table-row"
                  >
                    <td style={{ padding: "12px", fontWeight: "500" }}>
                      {record.machine_no || record.machine_id || 'N/A'}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {record.item_name || 'N/A'}
                    </td>
                    <td style={{ padding: "12px", fontWeight: "600" }}>
                      {record.production_quantity ? removeDecimals(record.production_quantity) : '0'} {currentDept?.unit}
                    </td>
                    <td style={{ 
                      padding: "12px",
                      fontWeight: "600",
                      color: record.efficiency > 90 ? "var(--color-success)" :
                             record.efficiency > 80 ? "var(--color-primary)" :
                             record.efficiency > 70 ? "var(--color-warning)" : "var(--color-error)"
                    }}>
                      {record.efficiency ? `${removeDecimals(record.efficiency)}%` : 'N/A'}
                    </td>
                    <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>
                      {record.operator_name || record.received_by || 'Unknown'}
                    </td>
                    <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>
                      {record.shift_name || record.shift || 'N/A'}
                    </td>
                    <td style={{ padding: "12px", color: "var(--color-text-secondary)" }}>
                      {record.production_date || record.entry_date || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {productionData.length > 10 && (
              <div style={{
                textAlign: "center",
                padding: "15px",
                color: getDarkColor(currentDept?.color),
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                borderTop: `1px solid var(--color-border)`,
                transition: 'all 0.2s'
              }}
              onClick={() => navigate(`/view-all?table=${currentDept.tableName}`)}
              >
                View all {productionData.length} records →
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            No production records found for selected date filter ({dateFilter})
          </div>
        )}
      </div>

      {/* Database Info Footer */}
      <div className="dashboard-section" style={{
        border: `2px solid ${getDarkColor(currentDept?.color)}${darkMode ? '30' : '20'}`,
      }}>
        <div className="grid-info">
          <div>
            <div className="data-label">
              <IconBox icon={FaIndustry} color={currentDept?.color} size={12} />
              Department
            </div>
            <div className="data-value" style={{ color: getDarkColor(currentDept?.color) }}>
              {selectedDepartment}
            </div>
          </div>
          <div>
            <div className="data-label">
              <IconBox icon={FiDatabase} color="#3b82f6" size={12} />
              Database Table
            </div>
            <div className="data-value">
              {currentDept?.tableName}
            </div>
          </div>
          <div>
            <div className="data-label">
              <IconBox icon={FiFilter} color="#8b5cf6" size={12} />
              Date Filter
            </div>
            <div className="data-value">
              {dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
            </div>
          </div>
          <div>
            <div className="data-label">
              <IconBox icon={FiClock} color="#f59e0b" size={12} />
              Last Updated
            </div>
            <div className="data-value">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProductionDashboard;