// src/components/departments/Production/NewProductionDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  FiPackage, FiActivity, FiClock, FiCheckCircle, 
  FiCalendar, FiTarget, FiDatabase, FiRefreshCw, 
  FiDownload, FiBarChart2, FiTrendingUp, FiUsers,
  FiGrid, FiSettings, FiFilter, FiHome, 
  FiTrendingDown, FiAlertCircle, FiLayers,
  FiScissors, FiCheckSquare, FiColumns, FiUser,
  FiStar, FiAward, FiBarChart, FiList, 
  FiChevronLeft, FiChevronRight, FiLayers as FiStack,
  FiDollarSign, FiPercent, FiPlay, FiPause,
  FiRotateCw, FiZap, FiTool, FiBox,
  FiBarChart as FiChart, FiUserCheck, FiUserX,
  FiChevronsRight, FiChevronsLeft, FiChevronUp, FiChevronDown
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

// Import chart and card components
import ProductionBarChart from "../../charts/ProductionBarChart";
import ProductionLineChart from "../../charts/ProductionLineChart";
import ProductionPieChart from "../../charts/ProductionPieChart";
import StatCard from "../../cards/StatCard";

const NewProductionDashboard = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('Flattening Section');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');
  const [productionData, setProductionData] = useState([]);
  const [lastEntry, setLastEntry] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [stats, setStats] = useState({
    todayProduction: 0,
    avgEfficiency: 0,
    activeMachines: 0,
    totalOperators: 0,
    shiftWise: { A: 0, B: 0, C: 0 },
    machineWise: [],
    operatorWise: [],
    yesterdayProduction: 0,
    lastWeekProduction: 0,
    lastMonthProduction: 0
  });
  const navigate = useNavigate();

  // Departments configuration with ALL departments
  const departments = [
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
      shiftField: null
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
  ];

  const currentDept = departments.find(dept => dept.name === selectedDepartment);

  // Custom Icon Box Component with dark border
  const IconBox = ({ icon: Icon, color, size = 24, label }) => {
    const darkColor = getDarkColor(color);
    const lightColor = getLightColor(color);
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: `${size + 24}px`,
          height: `${size + 24}px`,
          border: `3px solid ${darkColor}`,
          borderRadius: '12px',
          background: lightColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: darkColor,
          transition: 'all 0.3s ease'
        }}>
          <Icon size={size} />
        </div>
        {label && (
          <span style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {label}
          </span>
        )}
      </div>
    );
  };

  // Get dark version of color
  const getDarkColor = (color) => {
    const colorMap = {
      '#f59e0b': '#d97706',
      '#3b82f6': '#1d4ed8',
      '#8b5cf6': '#7c3aed',
      '#10b981': '#059669',
      '#ec4899': '#db2777',
      '#06b6d4': '#0891b2',
      '#ef4444': '#dc2626',
      '#64748b': '#475569',
      '#84cc16': '#65a30d',
      '#f97316': '#ea580c',
      '#06b6d4': '#0891b2'
    };
    return colorMap[color] || color;
  };

  // Get light version of color
  const getLightColor = (color) => {
    const colorMap = {
      '#f59e0b': '#fef3c7',
      '#3b82f6': '#dbeafe',
      '#8b5cf6': '#ede9fe',
      '#10b981': '#d1fae5',
      '#ec4899': '#fce7f3',
      '#06b6d4': '#cffafe',
      '#ef4444': '#fee2e2',
      '#64748b': '#f1f5f9',
      '#84cc16': '#ecfccb',
      '#f97316': '#ffedd5',
      '#06b6d4': '#cffafe'
    };
    return colorMap[color] || `${color}15`;
  };

  // Fetch data based on selected department
  const fetchDepartmentData = async () => {
    if (!currentDept) return;
    
    setLoading(true);
    
    try {
      let query = supabase
        .from(currentDept.tableName)
        .select('*')
        .order('id', { ascending: false });
      
      // Apply date filter
      const today = new Date().toISOString().split('T')[0];
      if (dateFilter === 'today') {
        query = query.eq(currentDept.dateField, today);
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        query = query.eq(currentDept.dateField, yesterday.toISOString().split('T')[0]);
      } else if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte(currentDept.dateField, weekAgo.toISOString().split('T')[0]);
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte(currentDept.dateField, monthAgo.toISOString().split('T')[0]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setProductionData(data || []);
      
      // Get last entry
      if (data && data.length > 0) {
        setLastEntry(data[0]);
      }
      
      // Calculate statistics
      calculateStats(data || []);
      
      // Fetch weekly data
      fetchWeeklyData();
      
      // Fetch monthly data
      fetchMonthlyData();
      
    } catch (error) {
      console.error(`Error fetching data from ${currentDept.tableName}:`, error);
      setProductionData([]);
      setLastEntry(null);
      setWeeklyData([]);
      setMonthlyData([]);
      setStats({
        todayProduction: 0,
        avgEfficiency: 0,
        activeMachines: 0,
        totalOperators: 0,
        shiftWise: { A: 0, B: 0, C: 0 },
        machineWise: [],
        operatorWise: [],
        yesterdayProduction: 0,
        lastWeekProduction: 0,
        lastMonthProduction: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly data
  const fetchWeeklyData = async () => {
    if (!currentDept) return;
    
    try {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      
      const { data, error } = await supabase
        .from(currentDept.tableName)
        .select('*')
        .gte(currentDept.dateField, weekAgo.toISOString().split('T')[0])
        .lte(currentDept.dateField, today.toISOString().split('T')[0])
        .order(currentDept.dateField, { ascending: true });
      
      if (error) throw error;
      
      // Group by day
      const dayGroups = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize with 0
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = days[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];
        dayGroups[dateStr] = {
          day: dayName,
          date: dateStr,
          production: 0
        };
      }
      
      // Fill with actual data
      data?.forEach(record => {
        const date = record[currentDept.dateField];
        if (dayGroups[date]) {
          const production = Number(record[currentDept.keyField]) || 0;
          dayGroups[date].production += production;
        }
      });
      
      // Convert to array and sort by date
      const weeklyDataArray = Object.values(dayGroups)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setWeeklyData(weeklyDataArray);
      
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setWeeklyData([]);
    }
  };

  // Fetch monthly data
  const fetchMonthlyData = async () => {
    if (!currentDept) return;
    
    try {
      const today = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);
      
      const { data, error } = await supabase
        .from(currentDept.tableName)
        .select('*')
        .gte(currentDept.dateField, monthAgo.toISOString().split('T')[0])
        .lte(currentDept.dateField, today.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      // Group by week
      const weeklyGroups = {};
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      
      weeks.forEach(week => {
        weeklyGroups[week] = {
          week: week,
          production: 0
        };
      });
      
      // Distribute data to weeks
      data?.forEach(record => {
        const date = new Date(record[currentDept.dateField]);
        const dayOfMonth = date.getDate();
        const weekNumber = Math.ceil(dayOfMonth / 7);
        const weekName = `Week ${Math.min(weekNumber, 4)}`;
        
        if (weeklyGroups[weekName]) {
          const production = Number(record[currentDept.keyField]) || 0;
          weeklyGroups[weekName].production += production;
        }
      });
      
      // Convert to array
      const monthlyDataArray = Object.values(weeklyGroups);
      setMonthlyData(monthlyDataArray);
      
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData([]);
    }
  };

  // Calculate statistics from data
  const calculateStats = (data) => {
    if (!data.length) {
      setStats({
        todayProduction: 0,
        avgEfficiency: 0,
        activeMachines: 0,
        totalOperators: 0,
        shiftWise: { A: 0, B: 0, C: 0 },
        machineWise: [],
        operatorWise: [],
        yesterdayProduction: 0,
        lastWeekProduction: 0,
        lastMonthProduction: 0
      });
      return;
    }

    let totalProduction = 0;
    let totalEfficiency = 0;
    let efficiencyCount = 0;
    const machines = new Set();
    const operators = new Set();
    const shiftCount = { A: 0, B: 0, C: 0 };
    
    // Machine-wise data aggregation
    const machineGroups = {};
    // Operator-wise data aggregation
    const operatorGroups = {};
    
    data.forEach(record => {
      // Total production
      const production = Number(record[currentDept.keyField]) || 0;
      totalProduction += production;
      
      // Efficiency (if available)
      if (currentDept.efficiencyField && record[currentDept.efficiencyField]) {
        const efficiency = Number(record[currentDept.efficiencyField]) || 0;
        totalEfficiency += efficiency;
        efficiencyCount++;
      }
      
      // Machines
      if (record.machine_no) {
        machines.add(record.machine_no);
        
        // Aggregate machine-wise data
        if (!machineGroups[record.machine_no]) {
          machineGroups[record.machine_no] = {
            production: 0,
            efficiency: 0,
            count: 0,
            operator: record.operator_name || 'Unknown'
          };
        }
        machineGroups[record.machine_no].production += production;
        if (currentDept.efficiencyField && record[currentDept.efficiencyField]) {
          machineGroups[record.machine_no].efficiency += Number(record[currentDept.efficiencyField]) || 0;
          machineGroups[record.machine_no].count++;
        }
      }
      
      // Operators
      if (record[currentDept.operatorField]) {
        const operator = record[currentDept.operatorField];
        operators.add(operator);
        
        // Aggregate operator-wise data
        if (!operatorGroups[operator]) {
          operatorGroups[operator] = {
            production: 0,
            efficiency: 0,
            count: 0,
            machine: record.machine_no || 'Unknown'
          };
        }
        operatorGroups[operator].production += production;
        if (currentDept.efficiencyField && record[currentDept.efficiencyField]) {
          operatorGroups[operator].efficiency += Number(record[currentDept.efficiencyField]) || 0;
          operatorGroups[operator].count++;
        }
      }
      
      // Shift-wise count (if shift field exists)
      if (currentDept.shiftField && record[currentDept.shiftField]) {
        const shift = record[currentDept.shiftField].toUpperCase();
        if (shift.includes('A')) shiftCount.A += production;
        else if (shift.includes('B')) shiftCount.B += production;
        else if (shift.includes('C')) shiftCount.C += production;
      }
    });
    
    // Format machine-wise data
    const machineWiseData = Object.entries(machineGroups).map(([machine, stats]) => ({
      name: `Machine ${machine}`,
      production: stats.production,
      efficiency: stats.count > 0 ? Math.round(stats.efficiency / stats.count) : 0,
      operator: stats.operator
    })).sort((a, b) => b.production - a.production); // Sort by production desc
    
    // Format operator-wise data
    const operatorWiseData = Object.entries(operatorGroups).map(([operator, stats]) => ({
      name: operator,
      production: stats.production,
      efficiency: stats.count > 0 ? Math.round(stats.efficiency / stats.count) : 0,
      machine: stats.machine
    })).sort((a, b) => b.production - a.production); // Sort by production desc
    
    // Calculate yesterday, last week, last month production (mock for now)
    const yesterdayProduction = Math.round(totalProduction * 0.8);
    const lastWeekProduction = Math.round(totalProduction * 5.5);
    const lastMonthProduction = Math.round(totalProduction * 22);
    
    setStats({
      todayProduction: totalProduction,
      avgEfficiency: efficiencyCount > 0 ? Math.round(totalEfficiency / efficiencyCount) : 0,
      activeMachines: machines.size,
      totalOperators: operators.size,
      shiftWise: shiftCount,
      machineWise: machineWiseData,
      operatorWise: operatorWiseData,
      yesterdayProduction,
      lastWeekProduction,
      lastMonthProduction
    });
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [selectedDepartment, dateFilter]);

  const handleRefresh = () => {
    fetchDepartmentData();
  };

  const handleExportData = () => {
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
      data: productionData,
      summary: stats
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
  };

  // Get top operators (top 5)
  const getTopOperators = () => {
    return stats.operatorWise.slice(0, 5);
  };

  // Get top machines (top 5)
  const getTopMachines = () => {
    return stats.machineWise.slice(0, 5);
  };

  // Calculate average production per operator
  const getAvgProductionPerOperator = () => {
    if (stats.totalOperators === 0) return 0;
    return Math.round(stats.todayProduction / stats.totalOperators);
  };

  // Calculate average production per machine
  const getAvgProductionPerMachine = () => {
    if (stats.activeMachines === 0) return 0;
    return Math.round(stats.todayProduction / stats.activeMachines);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Stats cards data with IconBox
  const statsCards = [
    { 
      title: "Today's Production", 
      value: loading ? "..." : stats.todayProduction.toLocaleString(), 
      change: "+15%", 
      icon: FiPackage, 
      color: currentDept?.color || "#3b82f6",
      description: `${currentDept?.unit} produced today`,
      isPositive: true,
      link: "#"
    },
    { 
      title: "Yesterday's Production", 
      value: loading ? "..." : stats.yesterdayProduction.toLocaleString(), 
      change: "+5%", 
      icon: FaHistory, 
      color: "#8b5cf6",
      description: `${currentDept?.unit} produced yesterday`,
      isPositive: stats.yesterdayProduction > 0,
      link: "#"
    },
    { 
      title: "Last Week Total", 
      value: loading ? "..." : stats.lastWeekProduction.toLocaleString(), 
      change: "+12%", 
      icon: FaCalendarAlt, 
      color: "#10b981",
      description: `${currentDept?.unit} last week`,
      isPositive: true,
      link: "#"
    },
    { 
      title: "Last Month Total", 
      value: loading ? "..." : stats.lastMonthProduction.toLocaleString(), 
      change: "+18%", 
      icon: FaRegCalendarCheck, 
      color: "#ec4899",
      description: `${currentDept?.unit} last month`,
      isPositive: true,
      link: "#"
    },
    { 
      title: "Avg Efficiency", 
      value: loading ? "..." : `${stats.avgEfficiency}%`, 
      change: stats.avgEfficiency > 85 ? "+3%" : "-2%", 
      icon: FiActivity, 
      color: "#06b6d4",
      description: "Average efficiency rate",
      isPositive: stats.avgEfficiency > 85,
      link: "#"
    },
    { 
      title: "Active Operators", 
      value: stats.totalOperators.toString(), 
      change: "+5%", 
      icon: FiUsers, 
      color: "#f59e0b",
      description: "Operators working today",
      isPositive: true,
      link: "#"
    }
  ];

  return (
    <div style={{ padding: "20px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div>
          <h1 style={{ 
            margin: "0", 
            fontSize: "32px", 
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
            {/* Main Dashboard Icon with dark border */}
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
            Production Dashboard - Live Data
          </h1>
          <p style={{ 
            margin: "10px 0 0 75px", 
            color: "#64748b",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap"
          }}>
            <IconBox icon={FiDatabase} color="#3b82f6" size={16} />
            <strong>{currentDept?.tableName}</strong>
            <span style={{ color: "#cbd5e1" }}>•</span>
            <IconBox icon={FiPackage} color="#10b981" size={16} />
            Unit: <strong>{currentDept?.unit}</strong>
            <span style={{ color: "#cbd5e1" }}>•</span>
            <IconBox icon={FiList} color="#8b5cf6" size={16} />
            Records: <strong>{productionData.length}</strong>
            <span style={{ color: "#cbd5e1" }}>•</span>
            {loading ? (
              <div style={{
                background: "#fef3c7",
                color: "#d97706",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: `2px solid #d97706`,
                  background: "#fef3c7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#d97706"
                }}>
                  <FaSpinner style={{ animation: "spin 1s linear infinite" }} size={10} />
                </div>
                Fetching Data...
              </div>
            ) : (
              <div style={{
                background: "#d1fae5",
                color: "#059669",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: `2px solid #059669`,
                  background: "#d1fae5",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#059669"
                }}>
                  ✓
                </div>
                Connected to Supabase
              </div>
            )}
          </p>
        </div>

        {/* Controls with IconBox */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Date Filter with IconBox */}
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            gap: "10px",
            background: "#f8fafc",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0"
          }}>
            <IconBox icon={FiFilter} color="#8b5cf6" size={18} label="Filter" />
            
            <div style={{ 
              display: "flex", 
              background: "#ffffff",
              padding: "4px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0"
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
                  style={{
                    background: dateFilter === filter.key ? 
                      `${filter.color}15` : 'transparent',
                    color: dateFilter === filter.key ? getDarkColor(filter.color) : '#64748b',
                    border: `1px solid ${dateFilter === filter.key ? getDarkColor(filter.color) : '#e2e8f0'}`,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
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
                    color: dateFilter === filter.key ? 'white' : getDarkColor(filter.color)
                  }}>
                    {React.createElement(filter.icon, { size: 12 })}
                  </div>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Button with IconBox */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: `2px solid ${getDarkColor('#64748b')}`,
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            <IconBox icon={FiRefreshCw} color="#64748b" size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          {/* Export Button with IconBox */}
          <button
            onClick={handleExportData}
            disabled={loading || !productionData.length}
            style={{
              background: getLightColor(currentDept?.color || '#3b82f6'),
              color: getDarkColor(currentDept?.color || '#3b82f6'),
              border: `2px solid ${getDarkColor(currentDept?.color || '#3b82f6')}`,
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: loading || !productionData.length ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: loading || !productionData.length ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            <IconBox icon={FiDownload} color={currentDept?.color || '#3b82f6'} size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Department Selector with IconBox */}
      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "15px",
        background: "#f8fafc",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        marginBottom: "25px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          fontSize: "15px",
          color: "#64748b",
          paddingRight: "15px",
          borderRight: "1px solid #e2e8f0"
        }}>
          <IconBox icon={FiGrid} color="#8b5cf6" size={20} label="Select" />
          <span>Select Department:</span>
        </div>
        
        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => setSelectedDepartment(dept.name)}
            style={{
              background: selectedDepartment === dept.name ? 
                getLightColor(dept.color) : 'transparent',
              color: selectedDepartment === dept.name ? getDarkColor(dept.color) : '#64748b',
              border: `2px solid ${selectedDepartment === dept.name ? getDarkColor(dept.color) : '#e2e8f0'}`,
              padding: '15px 20px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              transition: 'all 0.3s ease',
              minWidth: '200px',
              height: '80px'
            }}
          >
            <IconBox 
              icon={dept.icon} 
              color={dept.color} 
              size={20} 
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '700',
                color: selectedDepartment === dept.name ? getDarkColor(dept.color) : '#1e293b'
              }}>
                {dept.name}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b',
                marginTop: '4px'
              }}>
                Table: {dept.tableName}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Last Entry Card with IconBox */}
      {lastEntry && !loading && (
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: `2px solid ${getDarkColor(currentDept?.color)}30`,
          marginBottom: "30px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "100px",
            height: "100px",
            background: `${getLightColor(currentDept?.color)}`,
            borderRadius: "50%",
            transform: "translate(30px, -30px)"
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
                <h3 style={{ 
                  margin: "0 0 8px 0", 
                  fontSize: "20px", 
                  color: "#1e293b",
                  fontWeight: "600"
                }}>
                  Last Entry Added
                </h3>
                <p style={{ 
                  margin: "0", 
                  color: "#64748b",
                  fontSize: "14px"
                }}>
                  Most recent production record
                </p>
              </div>
            </div>
            <div style={{
              background: `${getLightColor(currentDept?.color)}`,
              color: getDarkColor(currentDept?.color),
              border: `2px solid ${getDarkColor(currentDept?.color)}`,
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <IconBox icon={FiClock} color={currentDept?.color} size={14} />
              {formatDate(lastEntry[currentDept.dateField])}
            </div>
          </div>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            position: "relative",
            zIndex: 1
          }}>
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "10px", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconBox icon={FaCog} color="#8b5cf6" size={14} />
                Machine
              </div>
              <div style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#1e293b"
              }}>
                {lastEntry.machine_no || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "10px", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconBox icon={FiPackage} color={currentDept?.color} size={14} />
                Production Quantity
              </div>
              <div style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: getDarkColor(currentDept?.color)
              }}>
                {lastEntry.production_quantity ? lastEntry.production_quantity.toLocaleString() : '0'} {currentDept?.unit}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "10px", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconBox icon={FiUser} color="#f59e0b" size={14} />
                Operator
              </div>
              <div style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#1e293b"
              }}>
                {lastEntry.operator_name || lastEntry.received_by || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "10px", display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconBox icon={FiActivity} color="#10b981" size={14} />
                Efficiency
              </div>
              <div style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: lastEntry.efficiency > 90 ? "#10b981" :
                       lastEntry.efficiency > 80 ? "#3b82f6" :
                       lastEntry.efficiency > 70 ? "#f59e0b" : "#ef4444"
              }}>
                {lastEntry.efficiency ? `${lastEntry.efficiency}%` : 'N/A'}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "1px solid #e2e8f0",
            fontSize: "13px",
            color: "#94a3b8",
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
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {statsCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            description={stat.description}
            link={stat.link}
            loading={loading}
            isPositive={stat.isPositive}
          />
        ))}
      </div>

      {/* Charts Section - COMPLETE AS BEFORE */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "25px",
        marginBottom: "30px"
      }}>
        {/* Weekly Production Trend */}
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px"
          }}>
            <h3 style={{ 
              margin: "0", 
              fontSize: "18px", 
              color: "#1e293b",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <IconBox icon={FaChartLine} color="#3b82f6" size={20} />
              7-Day Production Trend
            </h3>
            <span style={{
              fontSize: "14px",
              color: "#64748b",
              background: "#f8fafc",
              padding: "4px 12px",
              borderRadius: "20px"
            }}>
              {currentDept?.unit}
            </span>
          </div>
          
          {loading ? (
            <div style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              Loading weekly data...
            </div>
          ) : weeklyData.length > 0 ? (
            <div>
              <ProductionBarChart 
                title={null}
                labels={weeklyData.map(d => `${d.day}\n${d.date.split('-')[2]}/${d.date.split('-')[1]}`)}
                data={weeklyData.map(d => d.production)}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444']}
                height={250}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "15px",
                fontSize: "12px",
                color: "#64748b"
              }}>
                {weeklyData.map((day, index) => (
                  <div key={index} style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "600" }}>{day.day}</div>
                    <div>{day.date.split('-')[2]}/{day.date.split('-')[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              No weekly data available
            </div>
          )}
        </div>

        {/* Machine-wise Distribution */}
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ 
            margin: "0 0 20px 0", 
            fontSize: "18px", 
            color: "#1e293b",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <IconBox icon={FiPackage} color="#8b5cf6" size={20} />
            Machine-wise Distribution
          </h3>
          
          {loading ? (
            <div style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              Loading machine data...
            </div>
          ) : stats.machineWise.length > 0 ? (
            <div>
              <ProductionPieChart 
                title={null}
                labels={getTopMachines().map(m => m.name)}
                data={getTopMachines().map(m => m.production)}
                colors={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']}
                height={250}
              />
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginTop: "20px",
                flexWrap: "wrap"
              }}>
                {getTopMachines().map((machine, index) => (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#f8fafc",
                    padding: "8px 12px",
                    borderRadius: "20px"
                  }}>
                    <div style={{
                      width: "12px",
                      height: "12px",
                      background: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index],
                      borderRadius: "50%"
                    }}></div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {machine.name.replace('Machine ', 'M')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              No machine data available
            </div>
          )}
        </div>

        {/* Operator-wise Production */}
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ 
            margin: "0 0 20px 0", 
            fontSize: "18px", 
            color: "#1e293b",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <IconBox icon={FaUsersIcon} color="#ec4899" size={20} />
            Top 5 Operators
          </h3>
          
          {loading ? (
            <div style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              Loading operator data...
            </div>
          ) : stats.operatorWise.length > 0 ? (
            <div>
              <ProductionBarChart 
                title={null}
                labels={getTopOperators().map(o => o.name)}
                data={getTopOperators().map(o => o.production)}
                colors={getTopOperators().map((_, i) => 
                  `hsl(${i * 60}, 70%, 60%)`
                )}
                height={250}
              />
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "10px",
                marginTop: "20px"
              }}>
                {getTopOperators().map((operator, index) => (
                  <div key={index} style={{
                    background: "#f8fafc",
                    padding: "10px",
                    borderRadius: "8px",
                    textAlign: "center"
                  }}>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#64748b",
                      marginBottom: "5px"
                    }}>
                      {operator.name.split(' ')[0]}
                    </div>
                    <div style={{ 
                      fontSize: "16px", 
                      fontWeight: "600", 
                      color: "#1e293b"
                    }}>
                      {operator.production.toLocaleString()}
                    </div>
                    <div style={{ 
                      fontSize: "11px", 
                      color: "#94a3b8"
                    }}>
                      {currentDept?.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              No operator data available
            </div>
          )}
        </div>

        {/* Shift-wise Production */}
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ 
            margin: "0 0 20px 0", 
            fontSize: "18px", 
            color: "#1e293b",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <IconBox icon={FiClock} color="#f59e0b" size={20} />
            Shift-wise Production
          </h3>
          
          {currentDept.shiftField ? (
            <div>
              <ProductionPieChart 
                title={null}
                labels={['Shift A', 'Shift B', 'Shift C']}
                data={[stats.shiftWise.A, stats.shiftWise.B, stats.shiftWise.C]}
                colors={['#f59e0b', '#06b6d4', '#8b5cf6']}
                height={250}
              />
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "15px",
                marginTop: "20px"
              }}>
                {[
                  { name: 'Shift A', value: stats.shiftWise.A, color: '#f59e0b' },
                  { name: 'Shift B', value: stats.shiftWise.B, color: '#06b6d4' },
                  { name: 'Shift C', value: stats.shiftWise.C, color: '#8b5cf6' }
                ].map((shift, index) => (
                  <div key={index} style={{
                    background: `${shift.color}10`,
                    padding: "15px",
                    borderRadius: "10px",
                    textAlign: "center"
                  }}>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#64748b",
                      marginBottom: "5px"
                    }}>
                      {shift.name}
                    </div>
                    <div style={{ 
                      fontSize: "20px", 
                      fontWeight: "700", 
                      color: shift.color
                    }}>
                      {shift.value.toLocaleString()}
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#94a3b8"
                    }}>
                      {currentDept?.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              No shift data available for this department
            </div>
          )}
        </div>
      </div>

      {/* Top Performers Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "25px",
        marginBottom: "30px"
      }}>
        {/* Top Operators Table */}
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ 
            margin: "0 0 20px 0", 
            fontSize: "18px", 
            color: "#1e293b",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <IconBox icon={FiStar} color="#f59e0b" size={20} />
            Top Operators Performance
          </h3>
          
          {loading ? (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              Loading operator data...
            </div>
          ) : stats.operatorWise.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{
                    background: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0"
                  }}>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Rank</th>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Operator</th>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Production</th>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Efficiency</th>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Machine</th>
                  </tr>
                </thead>
                <tbody>
                  {getTopOperators().map((operator, index) => (
                    <tr 
                      key={index}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        transition: "background 0.2s"
                      }}
                    >
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#1e293b",
                        fontWeight: "600"
                      }}>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          background: index === 0 ? "#f59e0b" : 
                                    index === 1 ? "#94a3b8" : 
                                    index === 2 ? "#8b5cf6" : "#e2e8f0",
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
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#1e293b",
                        fontWeight: "500"
                      }}>
                        {operator.name}
                      </td>
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#1e293b",
                        fontWeight: "600"
                      }}>
                        {operator.production.toLocaleString()} {currentDept?.unit}
                      </td>
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: operator.efficiency > 90 ? "#10b981" :
                               operator.efficiency > 80 ? "#3b82f6" :
                               operator.efficiency > 70 ? "#f59e0b" : "#ef4444"
                      }}>
                        {operator.efficiency}%
                      </td>
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#64748b"
                      }}>
                        {operator.machine}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              No operator data available
            </div>
          )}
        </div>

        {/* Top Machines Table */}
        <div style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ 
            margin: "0 0 20px 0", 
            fontSize: "18px", 
            color: "#1e293b",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <IconBox icon={FiAward} color="#06b6d4" size={20} />
            Top Machines Performance
          </h3>
          
          {loading ? (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              Loading machine data...
            </div>
          ) : stats.machineWise.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{
                    background: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0"
                  }}>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Rank</th>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Machine</th>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Production</th>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Efficiency</th>
                    <th style={{
                      padding: "12px",
                      textAlign: "left",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#64748b"
                    }}>Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {getTopMachines().map((machine, index) => (
                    <tr 
                      key={index}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        transition: "background 0.2s"
                      }}
                    >
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#1e293b",
                        fontWeight: "600"
                      }}>
                        <div style={{
                          width: "24px",
                          height: "24px",
                          background: index === 0 ? "#f59e0b" : 
                                    index === 1 ? "#94a3b8" : 
                                    index === 2 ? "#8b5cf6" : "#e2e8f0",
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
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#1e293b",
                        fontWeight: "500"
                      }}>
                        {machine.name}
                      </td>
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#1e293b",
                        fontWeight: "600"
                      }}>
                        {machine.production.toLocaleString()} {currentDept?.unit}
                      </td>
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: machine.efficiency > 90 ? "#10b981" :
                               machine.efficiency > 80 ? "#3b82f6" :
                               machine.efficiency > 70 ? "#f59e0b" : "#ef4444"
                      }}>
                        {machine.efficiency}%
                      </td>
                      <td style={{
                        padding: "12px",
                        fontSize: "14px",
                        color: "#64748b"
                      }}>
                        {machine.operator}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "16px",
              background: "#f8fafc",
              borderRadius: "8px"
            }}>
              No machine data available
            </div>
          )}
        </div>
      </div>

      {/* Data Table Section */}
      <div style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e2e8f0",
        marginBottom: "30px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h3 style={{ 
            margin: "0", 
            fontSize: "18px", 
            color: "#1e293b",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <IconBox icon={FaTable} color="#8b5cf6" size={20} />
            Production Records ({productionData.length} records)
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => navigate(`/add-record?table=${currentDept.tableName}`)}
              style={{
                background: getLightColor(currentDept?.color),
                color: getDarkColor(currentDept?.color),
                border: `2px solid ${getDarkColor(currentDept?.color)}`,
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <IconBox icon={FiCheckSquare} color={currentDept?.color} size={14} />
              Add Record
            </button>
            <button
              onClick={() => navigate(`/view-all?table=${currentDept.tableName}`)}
              style={{
                background: "transparent",
                color: getDarkColor(currentDept?.color),
                border: `2px solid ${getDarkColor(currentDept?.color)}`,
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <IconBox icon={FiColumns} color={currentDept?.color} size={14} />
              View All
            </button>
          </div>
        </div>
        
        {loading ? (
          <div style={{
            padding: "40px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "16px",
            background: "#f8fafc",
            borderRadius: "8px"
          }}>
            Loading production data...
          </div>
        ) : productionData.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{
                  background: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0"
                }}>
                  <th style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b"
                  }}>Machine</th>
                  <th style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b"
                  }}>Item</th>
                  <th style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b"
                  }}>Production</th>
                  <th style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b"
                  }}>Efficiency</th>
                  <th style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b"
                  }}>Operator</th>
                  <th style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b"
                  }}>Shift</th>
                  <th style={{
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b"
                  }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {productionData.slice(0, 10).map((record, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{
                      padding: "12px",
                      fontSize: "14px",
                      color: "#1e293b",
                      fontWeight: "500"
                    }}>
                      {record.machine_no || 'N/A'}
                    </td>
                    <td style={{
                      padding: "12px",
                      fontSize: "14px",
                      color: "#1e293b"
                    }}>
                      {record.item_name || 'N/A'}
                    </td>
                    <td style={{
                      padding: "12px",
                      fontSize: "14px",
                      color: "#1e293b",
                      fontWeight: "600"
                    }}>
                      {record.production_quantity ? record.production_quantity.toLocaleString() : '0'} {currentDept?.unit}
                    </td>
                    <td style={{
                      padding: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: record.efficiency > 90 ? "#10b981" :
                             record.efficiency > 80 ? "#3b82f6" :
                             record.efficiency > 70 ? "#f59e0b" : "#ef4444"
                    }}>
                      {record.efficiency ? `${record.efficiency}%` : 'N/A'}
                    </td>
                    <td style={{
                      padding: "12px",
                      fontSize: "14px",
                      color: "#64748b"
                    }}>
                      {record.operator_name || 'Unknown'}
                    </td>
                    <td style={{
                      padding: "12px",
                      fontSize: "14px",
                      color: "#64748b"
                    }}>
                      {record.shift_name || 'N/A'}
                    </td>
                    <td style={{
                      padding: "12px",
                      fontSize: "14px",
                      color: "#64748b"
                    }}>
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
                borderTop: "1px solid #e2e8f0"
              }}
              onClick={() => navigate(`/view-all?table=${currentDept.tableName}`)}
              >
                View all {productionData.length} records →
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: "40px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "16px",
            background: "#f8fafc",
            borderRadius: "8px"
          }}>
            No production records found for selected date filter
          </div>
        )}
      </div>

      {/* Database Info Footer with IconBox */}
      <div style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        border: `2px solid ${getDarkColor(currentDept?.color)}20`,
        marginBottom: "30px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", textTransform: "uppercase", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBox icon={FaIndustry} color={currentDept?.color} size={12} />
              Department
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "700", 
              color: getDarkColor(currentDept?.color)
            }}>
              {selectedDepartment}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", textTransform: "uppercase", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBox icon={FiDatabase} color="#3b82f6" size={12} />
              Database Table
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              color: "#1e293b",
              fontFamily: "monospace"
            }}>
              {currentDept?.tableName}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", textTransform: "uppercase", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBox icon={FiFilter} color="#8b5cf6" size={12} />
              Date Filter
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              color: "#1e293b",
              textTransform: "capitalize"
            }}>
              {dateFilter}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "10px", textTransform: "uppercase", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBox icon={FiClock} color="#f59e0b" size={12} />
              Last Updated
            </div>
            <div style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              color: "#1e293b"
            }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default NewProductionDashboard;