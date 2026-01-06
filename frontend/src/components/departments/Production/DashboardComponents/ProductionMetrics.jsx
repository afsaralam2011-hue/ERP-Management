// src/components/departments/Production/DashboardComponents/ProductionMetrics.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaIndustry, FaCheckCircle, FaChartLine, 
  FaDatabase, FaSpinner, FaCalendarAlt, FaCogs, FaArrowUp, 
  FaArrowDown, FaCheck, FaTimes, FaWarehouse, FaCut, 
  FaBoxOpen, FaShieldAlt, FaBuilding, FaListAlt, FaBullseye,
  FaTrophy, FaRocket, FaStar, FaBolt, FaSyncAlt,
  FaSun, FaMoon, FaClock, FaFileAlt, FaChartBar, 
  FaFileExport, FaFilter, FaDownload, FaEye, FaTable, 
  FaSitemap, FaClipboardList
} from 'react-icons/fa';
import { supabase } from '../../../../supabaseClient';
import './ProductionMetrics.css';

const ProductionMetrics = () => {
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [machineData, setMachineData] = useState([]);
  const [shiftData, setShiftData] = useState([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Flatting Section');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const departments = useMemo(() => [
    { 
      id: 1, 
      name: 'Raw Material Section', 
      icon: <FaWarehouse />, 
      color: '#f59e0b', 
      tableName: 'raw_material_log',
      unit: 'KG'
    },
    { 
      id: 2, 
      name: 'Flatting Section', 
      icon: <FaIndustry />, 
      color: '#3b82f6', 
      tableName: 'flatteningsection',
      unit: 'KG'
    },
    { 
      id: 3, 
      name: 'Spiral Section', 
      icon: <FaCogs />, 
      color: '#8b5cf6', 
      tableName: 'spiralsection',
      unit: 'Meter'
    },
    { 
      id: 4, 
      name: 'PVC Coating Section', 
      icon: <FaShieldAlt />, 
      color: '#10b981', 
      tableName: 'pvcsection',
      unit: 'Meter'
    },
    { 
      id: 5, 
      name: 'Cutting & Packing Section', 
      icon: <FaCut />, 
      color: '#ec4899', 
      tableName: 'cuttingpacking',
      unit: 'Meter'
    },
    { 
      id: 6, 
      name: 'Finishing Goods Section', 
      icon: <FaBoxOpen />, 
      color: '#06b6d4', 
      tableName: 'finishinggoods',
      unit: 'Meter'
    }
  ], []);

  const getCurrentDepartment = useCallback(() => {
    return departments.find(dept => dept.name === selectedDepartment);
  }, [selectedDepartment, departments]);

  const getShiftIcon = (shiftName) => {
    const name = shiftName?.toLowerCase() || '';
    if (name.includes('morning') || name.includes('صبح') || name === 'a' || name === 'day') return <FaSun />;
    if (name.includes('evening') || name.includes('شام') || name === 'b') return <FaClock />;
    if (name.includes('night') || name.includes('رات') || name === 'c' || name === 'night') return <FaMoon />;
    return <FaClock />;
  };

  // Main calculation function
  const calculateAllDataCorrectly = useCallback((records) => {
    const combinationMap = {};
    const shiftMap = {};
    const machineMap = {};
    const dailyMap = {};
    const monthlyMap = {};

    records.forEach(record => {
      if (!record.created_at) return;

      const date = new Date(record.created_at);
      const dateStr = date.toISOString().split('T')[0];
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const machine = record.machine_no || record.machine_id || record.machine || 'unknown';
      const shift = record.shift_name || record.shift || record.shift_no || 'unknown';
      const target = parseFloat(record.target_qty) || parseFloat(record.target) || 0;
      const production = parseFloat(record.production_quantity) || parseFloat(record.production) || 0;

      const combinationKey = `${machine}_${shift}_${dateStr}`;
      const shiftKey = `${shift}`.trim();
      const machineKey = `${machine}`;
      const dayKey = dateStr;
      const monthKey = monthYear;

      if (!combinationMap[combinationKey]) {
        combinationMap[combinationKey] = {
          machine,
          shift,
          date: dateStr,
          target: target,
          production: 0,
          entries: 0
        };
      }
      combinationMap[combinationKey].production += production;
      combinationMap[combinationKey].entries += 1;

      if (!shiftMap[shiftKey]) {
        shiftMap[shiftKey] = {
          shiftName: shift,
          target: 0,
          production: 0,
          machines: new Set(),
          machineDays: {},
          days: new Set(),
          entries: 0,
          combinations: 0
        };
      }
      
      if (!shiftMap[shiftKey].machineDays[machine]) {
        shiftMap[shiftKey].machineDays[machine] = new Set();
      }
      
      const machineDayKey = `${machine}_${dateStr}`;
      if (!shiftMap[shiftKey].machineDays[machine].has(machineDayKey)) {
        shiftMap[shiftKey].target += target;
        shiftMap[shiftKey].machineDays[machine].add(machineDayKey);
        shiftMap[shiftKey].combinations += 1;
      }
      
      shiftMap[shiftKey].production += production;
      shiftMap[shiftKey].machines.add(machine);
      shiftMap[shiftKey].days.add(dateStr);
      shiftMap[shiftKey].entries += 1;

      if (!machineMap[machineKey]) {
        machineMap[machineKey] = {
          machineName: machine,
          target: 0,
          production: 0,
          shifts: new Set(),
          shiftDays: {},
          days: new Set(),
          entries: 0,
          lastActive: date,
          machineNumber: parseInt(machine.replace(/[^0-9]/g, '')) || 0
        };
      } else if (date > machineMap[machineKey].lastActive) {
        machineMap[machineKey].lastActive = date;
      }
      
      if (!machineMap[machineKey].shiftDays[shift]) {
        machineMap[machineKey].shiftDays[shift] = new Set();
      }
      
      const shiftDayKey = `${shift}_${dateStr}`;
      if (!machineMap[machineKey].shiftDays[shift].has(shiftDayKey)) {
        machineMap[machineKey].target += target;
        machineMap[machineKey].shiftDays[shift].add(shiftDayKey);
      }
      
      machineMap[machineKey].production += production;
      machineMap[machineKey].shifts.add(shift);
      machineMap[machineKey].days.add(dateStr);
      machineMap[machineKey].entries += 1;

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = {
          date: dateStr,
          target: 0,
          production: 0,
          shifts: new Set(),
          machines: new Set(),
          combinations: 0,
          entries: 0
        };
      }
      
      if (!dailyMap[dayKey].combinationsSet) {
        dailyMap[dayKey].combinationsSet = new Set();
      }
      if (!dailyMap[dayKey].combinationsSet.has(combinationKey)) {
        dailyMap[dayKey].target += target;
        dailyMap[dayKey].combinations += 1;
        dailyMap[dayKey].combinationsSet.add(combinationKey);
      }
      
      dailyMap[dayKey].production += production;
      dailyMap[dayKey].shifts.add(shift);
      dailyMap[dayKey].machines.add(machine);
      dailyMap[dayKey].entries += 1;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
          month: monthYear,
          target: 0,
          production: 0,
          shifts: new Set(),
          machines: new Set(),
          days: new Set(),
          combinations: 0,
          entries: 0
        };
      }
      
      if (!monthlyMap[monthKey].combinationsSet) {
        monthlyMap[monthKey].combinationsSet = new Set();
      }
      if (!monthlyMap[monthKey].combinationsSet.has(combinationKey)) {
        monthlyMap[monthKey].target += target;
        monthlyMap[monthKey].combinations += 1;
        monthlyMap[monthKey].combinationsSet.add(combinationKey);
      }
      
      monthlyMap[monthKey].production += production;
      monthlyMap[monthKey].shifts.add(shift);
      monthlyMap[monthKey].machines.add(machine);
      monthlyMap[monthKey].days.add(dateStr);
      monthlyMap[monthKey].entries += 1;
    });

    const processedShiftData = Object.values(shiftMap)
      .map(shift => {
        const efficiency = shift.target > 0 ? (shift.production / shift.target) * 100 : 0;
        const machineCount = shift.machines.size;
        const dayCount = shift.days.size;
        
        let status = 'good';
        let statusColor = '#10b981';
        
        if (efficiency >= 100) {
          status = 'excellent';
          statusColor = '#10b981';
        } else if (efficiency >= 80) {
          status = 'good';
          statusColor = '#10b981';
        } else if (efficiency >= 60) {
          status = 'average';
          statusColor = '#f59e0b';
        } else {
          status = 'poor';
          statusColor = '#ef4444';
        }
        
        const avgTargetPerCombination = shift.combinations > 0 ? 
          (shift.target / shift.combinations).toFixed(0) : 0;
        
        return {
          name: shift.shiftName,
          production: shift.production,
          target: shift.target,
          efficiency: efficiency.toFixed(1),
          machines: [...shift.machines].sort((a, b) => {
            const aNum = parseInt(a.replace(/[^0-9]/g, '')) || 0;
            const bNum = parseInt(b.replace(/[^0-9]/g, '')) || 0;
            return aNum - bNum;
          }),
          machineCount: machineCount,
          daysCount: dayCount,
          combinationsCount: shift.combinations,
          entries: shift.entries,
          avgTargetPerCombo: avgTargetPerCombination,
          status,
          statusColor,
          icon: getShiftIcon(shift.shiftName)
        };
      })
      .sort((a, b) => {
        const shiftOrder = {
          'morning': 1, 'day': 1, 'صبح': 1, 'a': 1,
          'evening': 2, 'شام': 2, 'b': 2,
          'night': 3, 'رات': 3, 'c': 3
        };
        const aOrder = shiftOrder[a.name.toLowerCase()] || 99;
        const bOrder = shiftOrder[b.name.toLowerCase()] || 99;
        return aOrder - bOrder;
      });

    const processedDailyData = Object.values(dailyMap)
      .map(day => {
        const efficiency = day.target > 0 ? (day.production / day.target) * 100 : 0;
        const date = new Date(day.date);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        return {
          date: day.date,
          formattedDate: dayNames[date.getDay()],
          production: day.production,
          target: day.target,
          efficiency: efficiency.toFixed(1),
          status: efficiency >= 100 ? 'met' : efficiency >= 80 ? 'good' : 'not-met',
          shiftsCount: day.shifts.size,
          machinesCount: day.machines.size,
          combinationsCount: day.combinations,
          entriesCount: day.entries
        };
      })
      .filter(day => {
        const date = new Date(day.date);
        return date.getDay() !== 0;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    const processedMonthlyData = Object.values(monthlyMap)
      .map(month => {
        const efficiency = month.target > 0 ? (month.production / month.target) * 100 : 0;
        return {
          month: month.month,
          production: month.production,
          target: month.target,
          efficiency: efficiency.toFixed(1),
          status: efficiency >= 100 ? 'met' : efficiency >= 80 ? 'good' : 'not-met',
          shiftsCount: month.shifts.size,
          machinesCount: month.machines.size,
          daysCount: month.days.size,
          combinationsCount: month.combinations,
          entriesCount: month.entries
        };
      })
      .sort((a, b) => new Date(b.month) - new Date(a.month))
      .slice(0, 6);

    const processedMachineData = Object.values(machineMap)
      .map(machine => {
        const efficiency = machine.target > 0 ? (machine.production / machine.target) * 100 : 0;
        const daysSinceActive = machine.lastActive ? 
          Math.floor((new Date() - machine.lastActive) / (1000 * 60 * 60 * 24)) : 999;
        
        let status = 'running';
        let statusColor = '#10b981';
        
        if (efficiency >= 80) {
          status = 'good';
          statusColor = '#10b981';
        } else if (efficiency >= 70) {
          status = 'average';
          statusColor = '#f59e0b';
        } else {
          status = 'poor';
          statusColor = '#ef4444';
        }
        
        if (daysSinceActive > 7) {
          status = 'down';
          statusColor = '#ef4444';
        } else if (daysSinceActive > 1) {
          status = 'idle';
          statusColor = '#f59e0b';
        } else if (machine.production === 0) {
          status = 'maintenance';
          statusColor = '#8b5cf6';
        }
        
        return {
          name: machine.machineName,
          production: machine.production,
          target: machine.target,
          efficiency: efficiency.toFixed(1),
          shifts: [...machine.shifts].sort().join(', '),
          workingDays: machine.days.size,
          entries: machine.entries,
          status,
          statusColor,
          lastActive: machine.lastActive ? 
            machine.lastActive.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 
            'Never',
          machineNumber: machine.machineNumber
        };
      })
      .sort((a, b) => a.machineNumber - b.machineNumber);

    return {
      dailyData: processedDailyData,
      monthlyData: processedMonthlyData,
      machineData: processedMachineData,
      shiftData: processedShiftData
    };
  }, []);

  const fetchActualData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!supabase || !process.env.REACT_APP_SUPABASE_URL) {
        console.warn('Supabase not configured');
        setIsSupabaseConnected(false);
        setLoading(false);
        return;
      }
      
      setIsSupabaseConnected(true);
      
      const currentDept = getCurrentDepartment();
      const tableName = currentDept?.tableName;
      
      if (!tableName) {
        console.error('No table name found for department:', selectedDepartment);
        setLoading(false);
        return;
      }
      
      const { data: productionRecords, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (error) {
        console.error('Supabase error:', error);
        setIsSupabaseConnected(false);
        setLoading(false);
        return;
      }
      
      if (!productionRecords || productionRecords.length === 0) {
        console.log('No production records found for', tableName);
        setDailyData([]);
        setMonthlyData([]);
        setMachineData([]);
        setShiftData([]);
        setLoading(false);
        return;
      }
      
      const {
        dailyData: calculatedDailyData,
        monthlyData: calculatedMonthlyData,
        machineData: calculatedMachineData,
        shiftData: calculatedShiftData
      } = calculateAllDataCorrectly(productionRecords);
      
      setDailyData(calculatedDailyData);
      setMonthlyData(calculatedMonthlyData);
      setMachineData(calculatedMachineData);
      setShiftData(calculatedShiftData);
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('Error fetching production data:', error);
      setIsSupabaseConnected(false);
      setDailyData([]);
      setMonthlyData([]);
      setMachineData([]);
      setShiftData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment, getCurrentDepartment, calculateAllDataCorrectly]);

  const getUnit = useCallback(() => {
    const currentDept = getCurrentDepartment();
    return currentDept?.unit || 'Unit';
  }, [getCurrentDepartment]);

  const formatLastRefresh = useCallback(() => {
    return lastRefresh.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }, [lastRefresh]);

  const calculateMetrics = useCallback(() => {
    const currentDept = getCurrentDepartment();
    const unit = currentDept?.unit || 'Unit';
    
    if (monthlyData.length === 0 || dailyData.length === 0) {
      return [
        {
          id: 1,
          title: 'Total Production',
          value: '0',
          unit: unit === 'Meter' ? 'KM' : unit,
          change: '0%',
          isPositive: true,
          icon: <FaIndustry />,
          borderColor: '#3b82f6',
          description: 'Total production this month',
          highlight: false
        },
        {
          id: 2,
          title: 'MPT Achievement',
          value: '0/0',
          unit: 'days',
          change: '0%',
          isPositive: true,
          icon: <FaBullseye />,
          borderColor: '#10b981',
          description: 'Monthly Production Target days met',
          highlight: false
        },
        {
          id: 3,
          title: 'MTE',
          value: '0%',
          unit: '',
          change: '0%',
          isPositive: true,
          icon: <FaChartLine />,
          borderColor: '#10b981',
          description: 'Monthly Target Efficiency',
          highlight: false
        },
        {
          id: 4,
          title: 'Avg Daily',
          value: '0',
          unit: unit,
          change: '0%',
          isPositive: true,
          icon: <FaBolt />,
          borderColor: '#8b5cf6',
          description: 'Average Daily Production',
          highlight: false
        },
      ];
    }

    const totalProduction = monthlyData.reduce((sum, month) => sum + month.production, 0);
    const avgEfficiency = monthlyData.length > 0 ? 
      monthlyData.reduce((sum, month) => sum + parseFloat(month.efficiency), 0) / monthlyData.length : 0;
    const totalDaysMet = dailyData.filter(day => parseFloat(day.efficiency) >= 100).length;
    const avgDailyProduction = dailyData.length > 0 ? 
      dailyData.reduce((sum, day) => sum + day.production, 0) / dailyData.length : 0;

    return [
      {
        id: 1,
        title: 'Total Production',
        value: unit === 'Meter' 
          ? (totalProduction / 1000).toFixed(2)
          : totalProduction.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        unit: unit === 'Meter' ? 'KM' : unit,
        change: '+0%',
        isPositive: true,
        icon: <FaIndustry />,
        borderColor: '#3b82f6',
        description: 'Total production this month',
        highlight: false
      },
      {
        id: 2,
        title: 'MPT Achievement',
        value: `${totalDaysMet}/${dailyData.length}`,
        unit: 'days',
        change: '+0%',
        isPositive: true,
        icon: <FaBullseye />,
        borderColor: '#10b981',
        description: 'Monthly Production Target days met',
        highlight: false
      },
      {
        id: 3,
        title: 'MTE',
        value: `${avgEfficiency.toFixed(1)}%`,
        unit: '',
        change: avgEfficiency > 80 ? '+0%' : '-0%',
        isPositive: avgEfficiency > 80,
        icon: <FaChartLine />,
        borderColor: avgEfficiency > 80 ? '#10b981' : '#f59e0b',
        description: 'Monthly Target Efficiency',
        highlight: false
      },
      {
        id: 4,
        title: 'Avg Daily',
        value: unit === 'Meter' 
          ? avgDailyProduction.toFixed(2)
          : avgDailyProduction.toFixed(0),
        unit: unit,
        change: '+0%',
        isPositive: true,
        icon: <FaBolt />,
        borderColor: '#8b5cf6',
        description: 'Average Daily Production',
        highlight: false
      },
    ];
  }, [monthlyData, dailyData, getCurrentDepartment]);

  const getTodayActualSummary = useCallback(() => {
    if (dailyData.length === 0) {
      return {
        production: 0,
        target: 0,
        efficiency: 0,
        records: 0,
        machinesCount: 0,
        shiftsCount: 0,
        combinationsCount: 0,
        status: 'No Data'
      };
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayDay = today.getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const todayData = dailyData.find(day => day.date === todayStr);
    
    if (todayData) {
      return {
        production: todayData.production,
        target: todayData.target,
        efficiency: parseFloat(todayData.efficiency),
        records: todayData.entriesCount,
        machinesCount: todayData.machinesCount,
        shiftsCount: todayData.shiftsCount,
        combinationsCount: todayData.combinationsCount,
        status: todayData.efficiency >= 100 ? 'Excellent' : todayData.efficiency >= 80 ? 'Good' : 'Needs Improvement'
      };
    } else {
      if (dailyData.length > 0) {
        const latestDay = dailyData[0];
        return {
          production: latestDay.production,
          target: latestDay.target,
          efficiency: parseFloat(latestDay.efficiency),
          records: latestDay.entriesCount,
          machinesCount: latestDay.machinesCount,
          shiftsCount: latestDay.shiftsCount,
          combinationsCount: latestDay.combinationsCount,
          status: `${dayNames[todayDay]}: No Data`
        };
      }
      
      return {
        production: 0,
        target: 0,
        efficiency: 0,
        records: 0,
        machinesCount: 0,
        shiftsCount: 0,
        combinationsCount: 0,
        status: 'No Data Available'
      };
    }
  }, [dailyData]);

  const getTodayShiftPerformance = useCallback(() => {
    if (shiftData.length === 0 || dailyData.length === 0) {
      return [];
    }

    return shiftData.filter(shift => {
      return shift.daysCount > 0;
    });
  }, [shiftData, dailyData]);

  // Efficiency color function
  const getEfficiencyColor = useCallback((efficiency) => {
    const eff = parseFloat(efficiency);
    if (eff >= 80) return '#10b981'; // Green
    if (eff >= 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  }, []);

  // Report generation functions
  const generateDailyReport = useCallback(() => {
    const reportData = {
      date: new Date().toISOString().split('T')[0],
      department: selectedDepartment,
      dailyData: dailyData,
      shiftData: shiftData,
      machineData: machineData,
      summary: getTodayActualSummary(),
      metrics: calculateMetrics()
    };
    
    console.log('Generating daily report:', reportData);
    
    alert(`Daily report for ${selectedDepartment} is being generated...`);
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `daily-report-${selectedDepartment.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [selectedDepartment, dailyData, shiftData, machineData, getTodayActualSummary, calculateMetrics]);

  const viewAnalytics = useCallback(() => {
    console.log('Opening analytics view...');
    alert('Analytics view would open here with detailed charts and graphs.');
  }, []);

  const refreshDashboard = useCallback(() => {
    fetchActualData();
    alert('Dashboard refreshed with latest data!');
  }, [fetchActualData]);

  const exportDashboard = useCallback(() => {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      department: selectedDepartment,
      dailyData: dailyData,
      monthlyData: monthlyData,
      machineData: machineData,
      shiftData: shiftData,
      metrics: calculateMetrics(),
      todaySummary: getTodayActualSummary()
    };
    
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `dashboard-export-${selectedDepartment.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert(`Dashboard data exported successfully as ${exportFileDefaultName}`);
  }, [selectedDepartment, dailyData, monthlyData, machineData, shiftData, calculateMetrics, getTodayActualSummary]);

  useEffect(() => {
    fetchActualData();
  }, [fetchActualData]);

  if (loading) {
    return (
      <div className="production-metrics-dashboard">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <h3>Loading Production Data...</h3>
          <p>Fetching data for {selectedDepartment}</p>
          <p className="connection-status">
            {isSupabaseConnected ? 'Connected to Database' : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();
  const currentDept = getCurrentDepartment();
  const unit = getUnit();
  const todaySummary = getTodayActualSummary();
  const todayShiftPerformance = getTodayShiftPerformance();

  return (
    <div className="production-metrics-dashboard">
      <div className="departments-nav">
        <div className="departments-header">
          <FaBuilding size={24} />
          <h2>Production Departments</h2>
        </div>
        <div className="departments-grid">
          {departments.map(dept => (
            <button
              key={dept.id}
              className={`department-btn ${selectedDepartment === dept.name ? 'active' : ''}`}
              onClick={() => setSelectedDepartment(dept.name)}
            >
              <div className="dept-icon" style={{ color: dept.color }}>
                {dept.icon}
              </div>
              <div className="dept-name">{dept.name}</div>
              <div className="dept-table-info">
                {dept.unit} • {dept.tableName}
              </div>
              {selectedDepartment === dept.name && (
                <div className="active-indicator" style={{ background: dept.color }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">
            <div className="dept-title-icon" style={{ color: currentDept?.color || '#3b82f6' }}>
              {currentDept?.icon || <FaIndustry />}
            </div>
            {selectedDepartment} Dashboard
            <div className={`connection-badge ${isSupabaseConnected ? 'connected' : 'disconnected'}`}>
              <FaDatabase /> {isSupabaseConnected ? 'Database Connected' : 'Connection Issue'}
            </div>
          </h1>
          <p className="dashboard-subtitle">
            Real-time production data • Updated: {formatLastRefresh()}
            <span className="table-info"> • Table: {currentDept?.tableName}</span>
            <span className="unit-info"> • Unit: {unit}</span>
          </p>
        </div>
        <div className="header-right">
          <div className="refresh-info">
            Last refresh: {formatLastRefresh()}
          </div>
          <button className="refresh-btn" onClick={fetchActualData}>
            <FaSyncAlt /> Refresh Data
          </button>
        </div>
      </div>

      <div className="today-summary-section">
        <h2 className="section-title">
          <FaCalendarAlt /> Today's Production Summary
        </h2>
        <div className="today-summary-cards">
          <div className="summary-card">
            <div className="summary-icon-wrapper">
              <div className="summary-icon" style={{ 
                background: `linear-gradient(135deg, ${currentDept?.color || '#3b82f6'}, ${currentDept?.color || '#3b82f6'}80)`
              }}>
                <FaRocket />
              </div>
              <div className="production-badge">
                <FaTrophy /> Today
              </div>
            </div>
            <div className="summary-content">
              <h3>
                <FaIndustry /> Today's Production
                <span className={`trend-up ${todaySummary.efficiency >= 100 ? 'positive' : todaySummary.efficiency >= 80 ? 'warning' : 'negative'}`}>
                  <FaArrowUp /> {todaySummary.efficiency > 0 ? `${todaySummary.efficiency.toFixed(1)}%` : 'No Data'}
                </span>
              </h3>
              <div className="summary-main-value">
                <span className="value-large">
                  {todaySummary.production.toLocaleString('en-US', { 
                    minimumFractionDigits: unit === 'Meter' ? 1 : 0,
                    maximumFractionDigits: unit === 'Meter' ? 1 : 0
                  })}
                </span>
                <span className="value-unit">{unit}</span>
              </div>
              <div className="summary-details">
                <div className="detail-row">
                  <span className="detail-label">
                    <FaCheckCircle /> Target:
                  </span>
                  <span className="detail-value">
                    {todaySummary.target.toLocaleString('en-US', { 
                      minimumFractionDigits: unit === 'Meter' ? 0 : 0,
                      maximumFractionDigits: unit === 'Meter' ? 0 : 0
                    })} {unit}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">
                    <FaCheckCircle /> Efficiency:
                  </span>
                  <span className={`detail-value ${todaySummary.efficiency >= 100 ? 'highlight-green' : todaySummary.efficiency >= 80 ? 'highlight-yellow' : 'highlight-red'}`}>
                    {todaySummary.efficiency > 0 ? `${todaySummary.efficiency.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">
                    <FaDatabase /> M-S-D Combinations:
                  </span>
                  <span className="detail-value">
                    {todaySummary.combinationsCount}
                  </span>
                </div>
              </div>
              {todaySummary.target > 0 && (
                <div className="progress-indicator">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(todaySummary.efficiency, 150)}%` }}></div>
                  </div>
                  <div className="progress-labels">
                    <span>Target: {todaySummary.target.toLocaleString()} {unit}</span>
                    <span>Actual: {todaySummary.production.toLocaleString()} {unit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon-wrapper">
              <div className="summary-icon" style={{ 
                background: `linear-gradient(135deg, ${currentDept?.color || '#3b82f6'}, ${currentDept?.color || '#3b82f6'}80)`
              }}>
                <FaStar />
              </div>
            </div>
            <div className="summary-content">
              <h3>
                <FaCheckCircle /> Today's Performance
                <span className={`status-badge ${todaySummary.efficiency >= 100 ? 'excellent' : todaySummary.efficiency >= 80 ? 'good' : 'needs-improvement'}`}>
                  {todaySummary.status}
                </span>
              </h3>
              <div className="summary-main-value">
                <span className="value-large">
                  {todaySummary.efficiency > 0 ? `${todaySummary.efficiency.toFixed(1)}%` : 'N/A'}
                </span>
                <span className="value-unit">
                  {todaySummary.efficiency >= 100 ? 'Above Target' : 
                   todaySummary.efficiency >= 80 ? 'Near Target' : 'Below Target'}
                </span>
              </div>
              <div className="efficiency-details">
                <div className="metric-box">
                  <div className="metric-label">Target Met</div>
                  <div className={`metric-value ${todaySummary.efficiency >= 100 ? 'success' : 'not-met'}`}>
                    {todaySummary.efficiency >= 100 ? '✓' : '✗'}
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Shifts</div>
                  <div className="metric-value">
                    {todaySummary.shiftsCount}
                  </div>
                </div>
                <div className="metric-box">
                  <div className="metric-label">Entries</div>
                  <div className="metric-value">
                    {todaySummary.records}
                  </div>
                </div>
              </div>
              {todaySummary.efficiency > 0 && (
                <div className="performance-message">
                  <FaCheckCircle /> 
                  {todaySummary.efficiency >= 100 
                    ? `Target exceeded by ${(todaySummary.efficiency - 100).toFixed(1)}%`
                    : todaySummary.efficiency >= 80
                    ? `Target achieved ${todaySummary.efficiency.toFixed(1)}%`
                    : `Needs improvement (${todaySummary.efficiency.toFixed(1)}%)`
                  }
                </div>
              )}
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon-wrapper">
              <div className="summary-icon" style={{ 
                background: `linear-gradient(135deg, ${currentDept?.color || '#3b82f6'}, ${currentDept?.color || '#3b82f6'}80)`
              }}>
                <FaClock />
              </div>
            </div>
            <div className="summary-content">
              <h3>
                <FaClock /> Shift Performance
              </h3>
              {todayShiftPerformance.length > 0 ? (
                <>
                  <div className="shift-performance-grid">
                    {todayShiftPerformance.map((shift, index) => (
                      <div key={index} className="shift-item">
                        <div className="shift-icon" style={{ color: shift.statusColor }}>
                          {shift.icon}
                        </div>
                        <div className="shift-details">
                          <div className="shift-name">
                            {shift.name}
                          </div>
                          <div className="shift-stats">
                            <span className="shift-stat">
                              {shift.production.toLocaleString()} {unit}
                            </span>
                            <span className={`shift-efficiency ${shift.status}`} style={{ color: shift.statusColor }}>
                              {shift.efficiency}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="shift-summary">
                    <div className="summary-stat">
                      <span>Active Shifts:</span>
                      <strong>{todayShiftPerformance.length}</strong>
                    </div>
                    <div className="summary-stat">
                      <span>Total Machines:</span>
                      <strong>
                        {todayShiftPerformance.reduce((sum, shift) => sum + shift.machineCount, 0)}
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-shift-data">
                  <p>No shift data available for today</p>
                  <p>
                    Check if production entries have shift information
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-section">
        <div className="section-header">
          <h2 className="section-title">Performance Indicators</h2>
          <div className="target-info">
            <FaListAlt /> 
            <span className="info-item">MPT = Monthly Production Target</span>
            <span className="info-item">MTE = Monthly Target Efficiency</span>
          </div>
        </div>
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <div 
              key={metric.id} 
              className="metric-card"
              style={{ borderLeftColor: metric.borderColor }}
            >
              <div className="metric-header">
                <div className="metric-icon-wrapper" style={{ borderColor: metric.borderColor }}>
                  <div className="metric-icon" style={{ color: metric.borderColor }}>
                    {metric.icon}
                  </div>
                </div>
                <div>
                  <h3 className="metric-title">{metric.title}</h3>
                  <div className="metric-description">{metric.description}</div>
                </div>
              </div>
              <div className="metric-value">
                <span>{metric.value}</span> <span className="metric-unit">{metric.unit}</span>
              </div>
              <div className={`metric-change ${metric.isPositive ? 'positive' : 'negative'}`}>
                <div className="change-indicator">
                  {metric.isPositive ? <FaArrowUp /> : <FaArrowDown />} {metric.change}
                </div>
                <div className="change-label">from last month</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {shiftData.length > 0 && (
        <div className="table-section">
          <h2 className="section-title">
            <FaClock /> Shift-wise Performance
          </h2>
          <div className="table-container">
            <table className="production-table">
              <thead>
                <tr>
                  <th>Shift</th>
                  <th>Days</th>
                  <th>Target ({unit})</th>
                  <th>Production ({unit})</th>
                  <th>Efficiency</th>
                  <th>Machines</th>
                  <th>M-S-D Pairs</th>
                  <th>Entries</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shiftData.map((shift, index) => (
                  <tr key={index}>
                    <td className="shift-cell">
                      <div className="shift-cell-content">
                        <div className="shift-icon-cell" style={{ color: getEfficiencyColor(shift.efficiency) }}>
                          {shift.icon}
                        </div>
                        {shift.name}
                      </div>
                    </td>
                    <td className="days-cell">
                      {shift.daysCount}
                    </td>
                    <td className="target-cell">
                      {shift.target.toLocaleString('en-US', { 
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </td>
                    <td className="production-cell">
                      {shift.production.toLocaleString('en-US', { 
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1
                      })}
                    </td>
                    <td 
                      className={`efficiency-cell ${shift.status}`} 
                      style={{ color: getEfficiencyColor(shift.efficiency) }}
                    >
                      {shift.efficiency}%
                    </td>
                    <td className="machines-cell">
                      <div className="machines-list">
                        {shift.machines.slice(0, 5).join(', ')}
                        {shift.machines.length > 5 && '...'}
                        <span className="machine-count"> ({shift.machineCount})</span>
                      </div>
                    </td>
                    <td className="combinations-cell">
                      {shift.combinationsCount}
                    </td>
                    <td className="entries-cell">
                      {shift.entries}
                    </td>
                    <td className="status-cell">
                      <span 
                        className={`status-badge ${shift.status}`} 
                        style={{ 
                          color: getEfficiencyColor(shift.efficiency),
                          borderColor: getEfficiencyColor(shift.efficiency)
                        }}
                      >
                        {shift.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <div className="footer-note">
              <FaDatabase /> M-S-D Pairs = Machine-Shift-Day Unique Combinations | 
              Target calculated per machine-shift-day combination
            </div>
          </div>
        </div>
      )}

      {dailyData.length > 0 && (
        <div className="table-section">
          <h2 className="section-title">
            <FaCalendarAlt /> Daily Production (Last 6 Days - Monday to Saturday)
          </h2>
          <div className="table-container">
            <table className="production-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Production ({unit})</th>
                  <th>Target ({unit})</th>
                  <th>Efficiency</th>
                  <th>Shifts</th>
                  <th>Machines</th>
                  <th>M-S-D Pairs</th>
                  <th>Entries</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.map((day, index) => (
                  <tr key={index}>
                    <td className="date-cell">{day.formattedDate}</td>
                    <td className="production-cell">
                      <div className="production-with-trend">
                        {day.production.toLocaleString('en-US', { 
                          minimumFractionDigits: unit === 'Meter' ? 1 : 0,
                          maximumFractionDigits: unit === 'Meter' ? 1 : 0
                        })}
                        {day.production > day.target && (
                          <span className="trend-up-small">
                            <FaArrowUp /> {(day.production - day.target).toLocaleString('en-US', { 
                              minimumFractionDigits: unit === 'Meter' ? 1 : 0,
                              maximumFractionDigits: unit === 'Meter' ? 1 : 0
                            })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="target-cell">
                      {day.target.toLocaleString('en-US', { 
                        minimumFractionDigits: unit === 'Meter' ? 0 : 0,
                        maximumFractionDigits: unit === 'Meter' ? 0 : 0
                      })}
                    </td>
                    <td 
                      className={`efficiency-cell ${day.status}`} 
                      style={{ 
                        color: getEfficiencyColor(day.efficiency)
                      }}
                    >
                      {day.efficiency}%
                      {parseFloat(day.efficiency) > 100 && <FaArrowUp className="efficiency-up" />}
                    </td>
                    <td className="records-cell">{day.shiftsCount}</td>
                    <td className="records-cell">{day.machinesCount}</td>
                    <td className="records-cell">{day.combinationsCount}</td>
                    <td className="records-cell">{day.entriesCount}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${day.status}`}>
                        {day.status === 'met' ? <><FaCheck /> Target Met</> : 
                         day.status === 'good' ? <><FaCheck /> Good</> : 
                         <><FaTimes /> Not Met</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <div className="footer-note">
              <FaCalendarAlt /> Showing Monday to Saturday only (Sunday excluded from production days)
            </div>
          </div>
        </div>
      )}

      {monthlyData.length > 0 && (
        <div className="table-section">
          <h2 className="section-title">
            <FaChartLine /> Monthly Production Report
          </h2>
          <div className="table-container">
            <table className="production-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Production ({unit})</th>
                  <th>Target ({unit})</th>
                  <th>Efficiency</th>
                  <th>Shifts</th>
                  <th>Machines</th>
                  <th>M-S-D Pairs</th>
                  <th>Working Days</th>
                  <th>Entries</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => (
                  <tr key={index}>
                    <td className="month-cell">{month.month}</td>
                    <td className="production-cell">
                      {month.production.toLocaleString('en-US', { 
                        minimumFractionDigits: unit === 'Meter' ? 1 : 0,
                        maximumFractionDigits: unit === 'Meter' ? 1 : 0
                      })}
                    </td>
                    <td className="target-cell">
                      {month.target.toLocaleString('en-US', { 
                        minimumFractionDigits: unit === 'Meter' ? 0 : 0,
                        maximumFractionDigits: unit === 'Meter' ? 0 : 0
                      })}
                    </td>
                    <td 
                      className={`efficiency-cell ${month.status}`} 
                      style={{ 
                        color: getEfficiencyColor(month.efficiency)
                      }}
                    >
                      {month.efficiency}%
                      {parseFloat(month.efficiency) > 100 && <FaArrowUp className="efficiency-up" />}
                    </td>
                    <td className="records-cell">{month.shiftsCount}</td>
                    <td className="machines-cell">{month.machinesCount}</td>
                    <td className="records-cell">{month.combinationsCount}</td>
                    <td className="records-cell">{month.daysCount}</td>
                    <td className="records-cell">{month.entriesCount}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${month.status}`}>
                        {month.status === 'met' ? <><FaCheck /> Excellent</> : 
                         month.status === 'good' ? <><FaCheck /> Good</> : 
                         <><FaTimes /> Needs Improvement</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {machineData.length > 0 && (
        <div className="machine-section">
          <h2 className="section-title">
            <FaCogs /> Machine Status ({machineData.length} Machines)
          </h2>
          <div className="machine-grid-inline">
            {machineData.map((machine, index) => (
              <div key={index} className="machine-card-inline">
                <div className="machine-header-inline">
                  <div className="machine-name-inline">
                    <FaCogs style={{ color: getEfficiencyColor(machine.efficiency) }} /> 
                    {machine.name}
                    {machine.status === 'running' && <span className="active-pulse"></span>}
                  </div>
                  <span 
                    className="status-indicator-inline" 
                    style={{ 
                      background: getEfficiencyColor(machine.efficiency)
                    }}
                  ></span>
                </div>
                <div className="machine-details-inline">
                  <div className="detail-inline">
                    <span>Production:</span>
                    <strong>
                      {machine.production.toLocaleString('en-US', { 
                        minimumFractionDigits: unit === 'Meter' ? 1 : 0,
                        maximumFractionDigits: unit === 'Meter' ? 1 : 0
                      })} {unit}
                    </strong>
                  </div>
                  <div className="detail-inline">
                    <span>Target:</span>
                    <strong>
                      {machine.target.toLocaleString('en-US', { 
                        minimumFractionDigits: unit === 'Meter' ? 0 : 0,
                        maximumFractionDigits: unit === 'Meter' ? 0 : 0
                      })} {unit}
                    </strong>
                  </div>
                  <div className="detail-inline">
                    <span>Efficiency:</span>
                    <strong style={{ color: getEfficiencyColor(machine.efficiency) }}>
                      {machine.efficiency}%
                    </strong>
                  </div>
                  <div className="detail-inline">
                    <span>Days:</span>
                    <strong>{machine.workingDays}</strong>
                  </div>
                </div>
                <div className="progress-container-inline">
                  <div 
                    className="progress-bar-inline" 
                    style={{ 
                      width: `${Math.min(parseFloat(machine.efficiency), 100)}%`,
                      background: getEfficiencyColor(machine.efficiency)
                    }}
                  ></div>
                </div>
                <div className="machine-status-inline">
                  <span 
                    className={`status-text-inline status-${machine.status}`} 
                    style={{ 
                      color: getEfficiencyColor(machine.efficiency),
                      borderColor: getEfficiencyColor(machine.efficiency)
                    }}
                  >
                    {machine.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="data-source-info">
        <div className="source-card">
          <div className="source-icon-wrapper">
            <FaDatabase className="source-icon" />
          </div>
          <div className="source-content">
            <h3>Calculation Method</h3>
            <div className="source-details">
              <div className="detail-item">
                <span className="detail-label">Target Calculation:</span>
                <span className="detail-value">Per Machine-Shift-Day (Unique Combination)</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Production Calculation:</span>
                <span className="detail-value">Sum of All Entries</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Machine Efficiency Colors:</span>
                <span className="detail-value">
                  <span style={{ color: '#10b981' }}>≥80% Green</span>, 
                  <span style={{ color: '#f59e0b' }}> 70-79% Yellow</span>, 
                  <span style={{ color: '#ef4444' }}> &lt;70% Red</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="report-cards-section">
        {/* Daily Production Report Card */}
        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h3 className="report-card-title">Daily Production Report</h3>
              <p className="report-card-description">
                View detailed daily production analysis, section-wise performance, material consumption, 
                and generate exportable reports with real-time data from your production database.
              </p>
            </div>
            <div className="report-card-icon">
              <FaFileAlt />
            </div>
          </div>
          
          <div className="report-features">
            <ul className="feature-list">
              <li className="feature-item">
                <div className="feature-icon">
                  <FaChartBar />
                </div>
                <span className="feature-text">
                  <strong>Section-wise Analysis:</strong> Compare performance across all production sections
                </span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">
                  <FaDatabase />
                </div>
                <span className="feature-text">
                  <strong>Material Consumption:</strong> Track raw material usage vs production output
                </span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">
                  <FaFileExport />
                </div>
                <span className="feature-text">
                  <strong>Exportable Reports:</strong> Download reports in PDF, Excel, and CSV formats
                </span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">
                  <FaFilter />
                </div>
                <span className="feature-text">
                  <strong>Advanced Filtering:</strong> Filter by date range, shift, machine, or section
                </span>
              </li>
            </ul>
          </div>
          
          <div className="report-stats">
            <div className="stat-item">
              <div className="stat-value">{dailyData.length}</div>
              <div className="stat-label">Days of Data Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{departments.length}</div>
              <div className="stat-label">Production Sections</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {monthlyData.length > 0 
                  ? (monthlyData[0]?.production / (unit === 'Meter' ? 1000 : 1)).toLocaleString('en-US', { 
                      minimumFractionDigits: unit === 'Meter' ? 2 : 0,
                      maximumFractionDigits: unit === 'Meter' ? 2 : 0
                    })
                  : '0'}
              </div>
              <div className="stat-label">Current Month Production ({unit === 'Meter' ? 'KM' : unit})</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {machineData.length > 0 
                  ? Math.round(machineData.reduce((sum, machine) => 
                      sum + parseFloat(machine.efficiency), 0) / machineData.length)
                  : '0'}%
              </div>
              <div className="stat-label">Avg Machine Efficiency</div>
            </div>
          </div>
          
          <div className="report-actions">
            <button className="report-btn primary-btn" onClick={generateDailyReport}>
              <FaFileExport /> Generate Daily Report
            </button>
            <button className="report-btn secondary-btn" onClick={viewAnalytics}>
              <FaChartBar /> View Analytics
            </button>
          </div>
        </div>
        
        {/* Production Dashboard Overview Card */}
        <div className="report-card">
          <div className="report-card-header">
            <div>
              <h3 className="report-card-title">Production Dashboard Overview</h3>
              <p className="report-card-description">
                This dashboard provides comprehensive monitoring of all production operations. 
                Use the navigation to access different views and analytics tools.
              </p>
            </div>
            <div className="report-card-icon">
              <FaClipboardList />
            </div>
          </div>
          
          <div className="dashboard-tabs">
            <button className="tab-btn active">
              <FaEye /> Overview
            </button>
            <button className="tab-btn">
              <FaChartLine /> Analytics
            </button>
            <button className="tab-btn">
              <FaDatabase /> Records
            </button>
            <button className="tab-btn">
              <FaSitemap /> Sections
            </button>
          </div>
          
          <div className="report-features">
            <ul className="feature-list">
              <li className="feature-item">
                <div className="feature-icon">
                  <FaChartLine />
                </div>
                <span className="feature-text">
                  <strong>Real-time Monitoring:</strong> Live updates of production metrics and KPIs
                </span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">
                  <FaTable />
                </div>
                <span className="feature-text">
                  <strong>Data Visualization:</strong> Charts, graphs, and tables for better insights
                </span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">
                  <FaCalendarAlt />
                </div>
                <span className="feature-text">
                  <strong>Historical Analysis:</strong> Compare current performance with past data
                </span>
              </li>
              <li className="feature-item">
                <div className="feature-icon">
                  <FaFilter />
                </div>
                <span className="feature-text">
                  <strong>Customizable Views:</strong> Filter and customize dashboard views as needed
                </span>
              </li>
            </ul>
          </div>
          
          <div className="report-stats">
            <div className="stat-item">
              <div className="stat-value">{isSupabaseConnected ? '✓' : '✗'}</div>
              <div className="stat-label">Database Status</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{lastRefresh ? 'Live' : 'Offline'}</div>
              <div className="stat-label">Data Refresh</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{shiftData.length}</div>
              <div className="stat-label">Active Shifts</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="stat-label">Current Date</div>
            </div>
          </div>
          
          <div className="report-actions">
            <button className="report-btn primary-btn" onClick={refreshDashboard}>
              <FaSyncAlt /> Refresh Dashboard
            </button>
            <button className="report-btn secondary-btn" onClick={exportDashboard}>
              <FaDownload /> Export Data
            </button>
          </div>
        </div>
      </div>

      {dailyData.length === 0 && monthlyData.length === 0 && machineData.length === 0 && shiftData.length === 0 && (
        <div className="no-data-message">
          <h3>
            <FaDatabase /> No Production Data Available
          </h3>
          <p>There are no production records found for {selectedDepartment} in the database.</p>
          <button className="refresh-btn" onClick={fetchActualData}>
            <FaSyncAlt /> Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductionMetrics;