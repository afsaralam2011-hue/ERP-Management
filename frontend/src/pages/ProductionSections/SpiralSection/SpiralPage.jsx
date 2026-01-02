// src/pages/ProductionSections/SpiralSection/SpiralPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiPackage,
  FiCalendar,
  FiAlertCircle,
  FiBarChart2,
  FiPrinter,
  FiEye,
  FiTrendingUp as FiTrendingUp2,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiCheckCircle,
  FiXCircle,
  FiGrid,
  FiX,
  FiActivity,
  FiColumns,
  FiFeather as FiWeight,
  FiTool as FiMachine,
  FiZap,
  FiBox as FiProduct,
  FiArrowLeft as FiBack,
  FiCpu,
  FiEyeOff,
  FiLayers,
  FiTarget,
  FiMessageSquare,
  FiShare2,
  FiFileText,
  FiSun,
  FiMoon,
  FiUser,
} from "react-icons/fi";
import { supabase } from "../../../supabaseClient";
import "./SpiralPage.css";

const SpiralPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  
  // WhatsApp states
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsAppMessageType, setWhatsAppMessageType] = useState("report");

  // New state for toggle buttons
  const [showDashboard, setShowDashboard] = useState(false);
  const [showStatsCards, setShowStatsCards] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Report data
  const [reportData, setReportData] = useState({
    date: "",
    formattedDate: "",
    itemWise: {},
    wireWise: {},
    machineWise: {},
    shiftWise: {},
    dayShiftData: {},
    nightShiftData: {},
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    recordCount: 0,
    dayShiftCount: 0,
    nightShiftCount: 0,
  });

  // Stats states
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    toDayProduction: 0,
    lastDayWeight: 0,
    lastDayEfficiency: 0,
    todayRecords: 0,
    todayProduction: 0,
    todayWeight: 0,
    todayAvgEfficiency: 0,
    itemWiseToday: {},
    machineWiseToday: {},
    finishedProductWiseToday: {},
  });

  // Wire sizes
  const wireSizes = [
    "1.0 mm",
    "1.5 mm",
    "2.0 mm",
    "2.5 mm",
    "3.0 mm",
    "3.5 mm",
    "4.0 mm",
    "Other",
  ];

  // Check if supabase is connected
  const isSupabaseConnected = supabase && process.env.REACT_APP_SUPABASE_URL;

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      const { data: recordsData, error: recordsError } = await supabase
        .from("spiralsection")
        .select("*")
        .order("created_at", { ascending: false });

      if (recordsError) throw recordsError;

      setRecords(recordsData || []);
      calculateStats(recordsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate stats
  const calculateStats = (recordsData) => {
    if (!recordsData || recordsData.length === 0) {
      setStats({
        totalRecords: 0,
        totalProduction: 0,
        totalWeight: 0,
        avgEfficiency: 0,
        toDayProduction: 0,
        lastDayWeight: 0,
        lastDayEfficiency: 0,
        todayRecords: 0,
        todayProduction: 0,
        todayWeight: 0,
        todayAvgEfficiency: 0,
        itemWiseToday: {},
        machineWiseToday: {},
        finishedProductWiseToday: {},
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const todayRecords = recordsData.filter((record) => {
      const recordDate = new Date(record.created_at)
        .toISOString()
        .split("T")[0];
      return recordDate === today;
    });

    const yesterdayRecords = recordsData.filter((record) => {
      const recordDate = new Date(record.created_at)
        .toISOString()
        .split("T")[0];
      return recordDate === yesterdayStr;
    });

    const totalProduction = recordsData.reduce(
      (sum, record) => sum + (parseFloat(record.production_quantity) || 0),
      0
    );

    const totalWeight = recordsData.reduce(
      (sum, record) => sum + (parseFloat(record.weight) || 0),
      0
    );

    const totalEfficiency = recordsData.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const avgEfficiency =
      recordsData.length > 0 ? totalEfficiency / recordsData.length : 0;

    const toDayProduction = todayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.production_quantity) || 0),
      0
    );

    const lastDayWeight = yesterdayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.weight) || 0),
      0
    );

    const lastDayEfficiencySum = yesterdayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const lastDayEfficiency =
      yesterdayRecords.length > 0
        ? lastDayEfficiencySum / yesterdayRecords.length
        : 0;

    // Today's stats
    const todayProduction = todayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.production_quantity) || 0),
      0
    );

    const todayWeight = todayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.weight) || 0),
      0
    );

    const todayEfficiencySum = todayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const todayAvgEfficiency =
      todayRecords.length > 0 ? todayEfficiencySum / todayRecords.length : 0;

    // Item-wise today
    const itemWiseToday = {};
    const machineWiseToday = {};
    const finishedProductWiseToday = {};

    todayRecords.forEach((record) => {
      // Item data
      const item = record.item_name || "Unknown";
      if (!itemWiseToday[item]) {
        itemWiseToday[item] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0,
        };
      }
      itemWiseToday[item].production +=
        parseFloat(record.production_quantity) || 0;
      itemWiseToday[item].weight += parseFloat(record.weight) || 0;
      itemWiseToday[item].efficiency += parseFloat(record.efficiency) || 0;
      itemWiseToday[item].count += 1;

      // Machine data
      const machine = record.machine_no || "Unknown";
      if (!machineWiseToday[machine]) {
        machineWiseToday[machine] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0,
        };
      }
      machineWiseToday[machine].production +=
        parseFloat(record.production_quantity) || 0;
      machineWiseToday[machine].weight += parseFloat(record.weight) || 0;
      machineWiseToday[machine].efficiency +=
        parseFloat(record.efficiency) || 0;
      machineWiseToday[machine].count += 1;

      // Finished Product data
      const product = record.finishedproductname || "Unknown";
      if (!finishedProductWiseToday[product]) {
        finishedProductWiseToday[product] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0,
        };
      }
      finishedProductWiseToday[product].production +=
        parseFloat(record.production_quantity) || 0;
      finishedProductWiseToday[product].weight +=
        parseFloat(record.weight) || 0;
      finishedProductWiseToday[product].efficiency +=
        parseFloat(record.efficiency) || 0;
      finishedProductWiseToday[product].count += 1;
    });

    setStats({
      totalRecords: recordsData.length,
      totalProduction,
      totalWeight,
      avgEfficiency,
      toDayProduction,
      lastDayWeight,
      lastDayEfficiency,
      todayRecords: todayRecords.length,
      todayProduction,
      todayWeight,
      todayAvgEfficiency,
      itemWiseToday,
      machineWiseToday,
      finishedProductWiseToday,
    });
  };

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      (record.item_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.wire_size?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.finishedproductname?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.material_type?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.users_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.raw_material_flatsize?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.machine_no?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.operator_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const matchesType = !filterType || record.material_type === filterType;

    const recordDate = new Date(record.created_at).toISOString().split("T")[0];
    const matchesDate = !filterDate || recordDate === filterDate;

    return matchesSearch && matchesType && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Helper function to extract machine number for sorting
  const extractMachineNumber = (machineNo) => {
    if (!machineNo) return 0;
    
    const match = machineNo.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Generate report
  const generateReport = useCallback(
    (selectedDate) => {
      const dateRecords = records.filter((record) => {
        const recordDate = new Date(record.created_at)
          .toISOString()
          .split("T")[0];
        return recordDate === selectedDate;
      });

      if (dateRecords.length === 0) {
        setReportData({
          date: selectedDate,
          formattedDate: new Date(selectedDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          itemWise: {},
          wireWise: {},
          machineWise: {},
          shiftWise: {},
          dayShiftData: {},
          nightShiftData: {},
          totalProduction: 0,
          totalWeight: 0,
          avgEfficiency: 0,
          recordCount: 0,
          dayShiftCount: 0,
          nightShiftCount: 0,
        });
        return;
      }

      const itemWise = {};
      const wireWise = {};
      const machineWise = {};
      const shiftWise = {};
      const dayShiftData = {
        production: 0,
        weight: 0,
        efficiency: 0,
        count: 0,
        items: {},
        machines: {},
        machineOperators: {},
      };
      const nightShiftData = {
        production: 0,
        weight: 0,
        efficiency: 0,
        count: 0,
        items: {},
        machines: {},
        machineOperators: {},
      };
      
      let totalProduction = 0;
      let totalWeight = 0;
      let totalEfficiency = 0;
      let dayShiftCount = 0;
      let nightShiftCount = 0;

      dateRecords.forEach((record) => {
        const item = record.item_name || "Unknown";
        const wire = record.wire_size || "Unknown";
        const machine = extractMachineNumber(record.machine_no); // Extract machine number
        const shift = record.shift_name || "Unknown";
        const operator = record.operator_name || "Unknown";
        const production = parseFloat(record.production_quantity) || 0;
        const weight = parseFloat(record.weight) || 0;
        const efficiency = parseFloat(record.efficiency) || 0;

        // Item wise
        if (!itemWise[item]) {
          itemWise[item] = {
            production: 0,
            weight: 0,
            efficiency: 0,
            count: 0,
          };
        }
        itemWise[item].production += production;
        itemWise[item].weight += weight;
        itemWise[item].efficiency += efficiency;
        itemWise[item].count += 1;

        // Wire wise
        if (!wireWise[wire]) {
          wireWise[wire] = {
            production: 0,
            weight: 0,
            efficiency: 0,
            count: 0,
          };
        }
        wireWise[wire].production += production;
        wireWise[wire].weight += weight;
        wireWise[wire].efficiency += efficiency;
        wireWise[wire].count += 1;

        // Machine wise
        const machineKey = `SP # ${machine}`;
        if (!machineWise[machineKey]) {
          machineWise[machineKey] = {
            production: 0,
            weight: 0,
            efficiency: 0,
            count: 0,
            operator: operator,
            machineNumber: machine,
          };
        } else {
          // Keep the most frequent operator for this machine
          machineWise[machineKey].operator = operator;
        }
        machineWise[machineKey].production += production;
        machineWise[machineKey].weight += weight;
        machineWise[machineKey].efficiency += efficiency;
        machineWise[machineKey].count += 1;

        // Shift wise
        if (!shiftWise[shift]) {
          shiftWise[shift] = {
            production: 0,
            weight: 0,
            efficiency: 0,
            count: 0,
          };
        }
        shiftWise[shift].production += production;
        shiftWise[shift].weight += weight;
        shiftWise[shift].efficiency += efficiency;
        shiftWise[shift].count += 1;

        // Day/Night Shift wise
        const isDayShift = shift.toLowerCase().includes('day') || 
                          shift.toLowerCase().includes('morning') ||
                          shift === "Day Shift" ||
                          shift === "Morning Shift";
        
        const isNightShift = shift.toLowerCase().includes('night') || 
                            shift.toLowerCase().includes('evening') ||
                            shift === "Night Shift" ||
                            shift === "Evening Shift";

        if (isDayShift) {
          dayShiftCount++;
          dayShiftData.production += production;
          dayShiftData.weight += weight;
          dayShiftData.efficiency += efficiency;
          dayShiftData.count++;
          
          // Day shift items
          if (!dayShiftData.items[item]) {
            dayShiftData.items[item] = {
              production: 0,
              weight: 0,
              count: 0,
            };
          }
          dayShiftData.items[item].production += production;
          dayShiftData.items[item].weight += weight;
          dayShiftData.items[item].count++;
          
          // Day shift machines
          const dayMachineKey = `SP # ${machine}`;
          if (!dayShiftData.machines[dayMachineKey]) {
            dayShiftData.machines[dayMachineKey] = {
              production: 0,
              weight: 0,
              efficiency: 0,
              count: 0,
              operator: operator,
              machineNumber: machine,
            };
          }
          dayShiftData.machines[dayMachineKey].production += production;
          dayShiftData.machines[dayMachineKey].weight += weight;
          dayShiftData.machines[dayMachineKey].efficiency += efficiency;
          dayShiftData.machines[dayMachineKey].count++;
          dayShiftData.machines[dayMachineKey].operator = operator;
          
        } else if (isNightShift) {
          nightShiftCount++;
          nightShiftData.production += production;
          nightShiftData.weight += weight;
          nightShiftData.efficiency += efficiency;
          nightShiftData.count++;
          
          // Night shift items
          if (!nightShiftData.items[item]) {
            nightShiftData.items[item] = {
              production: 0,
              weight: 0,
              count: 0,
            };
          }
          nightShiftData.items[item].production += production;
          nightShiftData.items[item].weight += weight;
          nightShiftData.items[item].count++;
          
          // Night shift machines
          const nightMachineKey = `SP # ${machine}`;
          if (!nightShiftData.machines[nightMachineKey]) {
            nightShiftData.machines[nightMachineKey] = {
              production: 0,
              weight: 0,
              efficiency: 0,
              count: 0,
              operator: operator,
              machineNumber: machine,
            };
          }
          nightShiftData.machines[nightMachineKey].production += production;
          nightShiftData.machines[nightMachineKey].weight += weight;
          nightShiftData.machines[nightMachineKey].efficiency += efficiency;
          nightShiftData.machines[nightMachineKey].count++;
          nightShiftData.machines[nightMachineKey].operator = operator;
        }

        totalProduction += production;
        totalWeight += weight;
        totalEfficiency += efficiency;
      });

      const avgEfficiency =
        dateRecords.length > 0 ? totalEfficiency / dateRecords.length : 0;
      
      const dayShiftAvgEfficiency = dayShiftData.count > 0 ? dayShiftData.efficiency / dayShiftData.count : 0;
      const nightShiftAvgEfficiency = nightShiftData.count > 0 ? nightShiftData.efficiency / nightShiftData.count : 0;

      setReportData({
        date: selectedDate,
        formattedDate: new Date(selectedDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        itemWise,
        wireWise,
        machineWise,
        shiftWise,
        dayShiftData: {
          ...dayShiftData,
          avgEfficiency: dayShiftAvgEfficiency,
        },
        nightShiftData: {
          ...nightShiftData,
          avgEfficiency: nightShiftAvgEfficiency,
        },
        totalProduction,
        totalWeight,
        avgEfficiency,
        recordCount: dateRecords.length,
        dayShiftCount,
        nightShiftCount,
      });
    },
    [records]
  );

  // Handle report generation when date changes
  useEffect(() => {
    if (filterDate) {
      generateReport(filterDate);
    }
  }, [filterDate, generateReport]);

  // WhatsApp کے لیے رپورٹ ڈیٹا تیار کرنا - آپ کے فارمیٹ کے مطابق
  const prepareWhatsAppReport = (type = "report") => {
    if (!reportData || reportData.recordCount === 0) {
      return "No report data available.";
    }

    if (type === "custom") {
      return whatsAppMessage;
    }

    let message = `📊 *Spiral Section Production Report*\n`;
    message += `📅 Date: ${reportData.formattedDate}\n`;
    message += `👤 Generated by: Afsar\n\n`;
    
    // Overall Summary - NO DECIMAL POINTS
    message += `📈 *Overall Summary:*\n`;
    message += `• Total Production: ${Math.round(reportData.totalProduction)} M\n`;
    message += `• Total Weight: ${Math.round(reportData.totalWeight)} KG\n`;
    message += `• Average Efficiency: ${Math.round(reportData.avgEfficiency)}%\n`;
    message += `• Total Records: ${reportData.recordCount}\n\n`;
    
    // Shift-wise Summary
    message += `🕒 *Shift-wise Summary:*\n\n`;
    
    // Day Shift
    if (reportData.dayShiftCount > 0) {
      message += `☀️ *Day Shift:*\n`;
      message += `• Production: ${Math.round(reportData.dayShiftData.production)} M\n`;
      message += `• Weight: ${Math.round(reportData.dayShiftData.weight)} KG\n`;
      message += `• Avg Efficiency: ${Math.round(reportData.dayShiftData.avgEfficiency)}%\n`;
      message += `• Records: ${reportData.dayShiftCount}\n\n`;
    }
    
    // Night Shift
    if (reportData.nightShiftCount > 0) {
      message += `🌙 *Night Shift:*\n`;
      message += `• Production: ${Math.round(reportData.nightShiftData.production)} M\n`;
      message += `• Weight: ${Math.round(reportData.nightShiftData.weight)} KG\n`;
      message += `• Avg Efficiency: ${Math.round(reportData.nightShiftData.avgEfficiency)}%\n`;
      message += `• Records: ${reportData.nightShiftCount}\n\n`;
    }
    
    // Item-wise Summary - NO DECIMAL POINTS
    if (Object.keys(reportData.itemWise).length > 0) {
      message += `📋 *Item-wise Summary:*\n`;
      Object.entries(reportData.itemWise).forEach(([item, data], index) => {
        message += `${index + 1}. ${item}: ${Math.round(data.production)} M, ${Math.round(data.weight)} KG\n`;
      });
      message += `\n`;
    }
    
    // Machine-wise Summary - Day Shift (SORTED BY MACHINE NUMBER 1-14)
    if (Object.keys(reportData.dayShiftData.machines).length > 0) {
      message += `🏭 *Machine-wise Summary - Day Shift:*\n`;
      
      // Create sorted machine list (1 to 14)
      const allDayMachines = Array.from({ length: 14 }, (_, i) => {
        const machineKey = `SP # ${i + 1}`;
        return reportData.dayShiftData.machines[machineKey] || {
          production: 0,
          efficiency: 0,
          operator: "Operator Absent",
          machineNumber: i + 1,
          count: 0
        };
      });
      
      allDayMachines.forEach((data, index) => {
        const machineNum = index + 1;
        const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
        const operator = data.operator || "Operator Absent";
        message += `${machineNum}. SP # ${machineNum}: ${Math.round(data.production)} M, ${efficiency}% | ${operator}\n`;
      });
      message += `\n`;
    }
    
    // Machine-wise Summary - Night Shift (SORTED BY MACHINE NUMBER 1-14)
    if (Object.keys(reportData.nightShiftData.machines).length > 0) {
      message += `🏭 *Machine-wise Summary - Night Shift:*\n`;
      
      // Create sorted machine list (1 to 14)
      const allNightMachines = Array.from({ length: 14 }, (_, i) => {
        const machineKey = `SP # ${i + 1}`;
        return reportData.nightShiftData.machines[machineKey] || {
          production: 0,
          efficiency: 0,
          operator: "Operator Absent",
          machineNumber: i + 1,
          count: 0
        };
      });
      
      allNightMachines.forEach((data, index) => {
        const machineNum = index + 1;
        const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
        const operator = data.operator || "Operator Absent";
        message += `${machineNum}. SP # ${machineNum}: ${Math.round(data.production)} M, ${efficiency}% | ${operator}\n`;
      });
      message += `\n`;
    }
    
    // Report Summary
    message += `📝 *Report Summary:*\n`;
    message += `• Target Production: ${Math.round(reportData.totalProduction * 1.2)} M\n`;
    message += `• Target Efficiency: 85%\n\n`;
    
    message += `✅ Generated via Spiral Section Management System`;
    
    return message;
  };

  // WhatsApp پر میسج بھیجنے کا فنکشن
  const sendReportViaWhatsApp = () => {
    if (!whatsAppNumber) {
      alert('Please enter WhatsApp number');
      return;
    }

    setSendingWhatsApp(true);
    
    const message = prepareWhatsAppReport(whatsAppMessageType);
    const formattedNumber = whatsAppNumber.replace(/[^0-9]/g, '');
    
    // WhatsApp API URL
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
    
    // WhatsApp ونڈو کھولنا
    window.open(whatsappUrl, '_blank');
    
    setTimeout(() => {
      setSendingWhatsApp(false);
      setShowWhatsAppModal(false);
      setWhatsAppNumber('');
      setWhatsAppMessage('');
    }, 1000);
  };

  // Generate PDF
  const generatePDF = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to generate PDF");
      return;
    }
    
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spiral Section Production Report - ${reportData.formattedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 10px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; }
          .table th { background-color: #f8f9fa; }
          .summary { margin: 20px 0; padding: 15px; background: #f8f9fa; }
          .shift-section { margin: 20px 0; padding: 15px; border-left: 4px solid #3b82f6; }
          .day-shift { border-left-color: #f59e0b; }
          .night-shift { border-left-color: #1e40af; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Spiral Section Production Report</h1>
          <div>Date: ${reportData.formattedDate}</div>
          <div>Generated by: Afsar</div>
        </div>
        
        <div class="shift-section day-shift">
          <h3>Day Shift Summary</h3>
          <p>Production: ${Math.round(reportData.dayShiftData.production)} M</p>
          <p>Weight: ${Math.round(reportData.dayShiftData.weight)} KG</p>
          <p>Average Efficiency: ${Math.round(reportData.dayShiftData.avgEfficiency)}%</p>
          <p>Records: ${reportData.dayShiftCount}</p>
        </div>
        
        <div class="shift-section night-shift">
          <h3>Night Shift Summary</h3>
          <p>Production: ${Math.round(reportData.nightShiftData.production)} M</p>
          <p>Weight: ${Math.round(reportData.nightShiftData.weight)} KG</p>
          <p>Average Efficiency: ${Math.round(reportData.nightShiftData.avgEfficiency)}%</p>
          <p>Records: ${reportData.nightShiftCount}</p>
        </div>
        
        <div class="summary">
          <h3>Summary:</h3>
          <p>Total Production: ${Math.round(reportData.totalProduction)} M</p>
          <p>Total Weight: ${Math.round(reportData.totalWeight)} KG</p>
          <p>Average Efficiency: ${Math.round(reportData.avgEfficiency)}%</p>
          <p>Total Records: ${reportData.recordCount}</p>
        </div>
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print PDF
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // WhatsApp Modal Component
  const WhatsAppModal = () => (
    <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiMessageSquare color="#25D366" /> Send Report via WhatsApp
          </h2>
          <button 
            onClick={() => setShowWhatsAppModal(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              <FiMessageSquare style={{ marginRight: '5px' }} /> WhatsApp Number
              <span style={{ color: '#ff4444', marginLeft: '4px' }}>*</span>
            </label>
            <input
              type="tel"
              value={whatsAppNumber}
              onChange={(e) => setWhatsAppNumber(e.target.value)}
              placeholder="923001234567 (with country code)"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              required
            />
            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
              Enter number with country code (without + sign)
            </small>
          </div>
          
          {/* Message Type Selection */}
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              <FiFileText style={{ marginRight: '5px' }} /> Message Type
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <button
                onClick={() => setWhatsAppMessageType('report')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: whatsAppMessageType === 'report' ? '#25D366' : '#f8f9fa',
                  color: whatsAppMessageType === 'report' ? 'white' : '#333',
                  border: `1px solid ${whatsAppMessageType === 'report' ? '#25D366' : '#ddd'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: whatsAppMessageType === 'report' ? '600' : '400'
                }}
              >
                Auto-generated Report
              </button>
              <button
                onClick={() => setWhatsAppMessageType('custom')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: whatsAppMessageType === 'custom' ? '#3b82f6' : '#f8f9fa',
                  color: whatsAppMessageType === 'custom' ? 'white' : '#333',
                  border: `1px solid ${whatsAppMessageType === 'custom' ? '#3b82f6' : '#ddd'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: whatsAppMessageType === 'custom' ? '600' : '400'
                }}
              >
                Custom Message
              </button>
            </div>
          </div>
          
          {whatsAppMessageType === 'custom' && (
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                <FiEdit style={{ marginRight: '5px' }} /> Custom Message
              </label>
              <textarea
                value={whatsAppMessage}
                onChange={(e) => setWhatsAppMessage(e.target.value)}
                placeholder="Enter your custom message here..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
            </div>
          )}
          
          <div className="preview-section" style={{
            marginTop: '20px',
            borderTop: '1px solid #eee',
            paddingTop: '15px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FiEye /> Message Preview
            </h4>
            <div className="message-preview" style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '15px',
              marginTop: '10px',
              whiteSpace: 'pre-line',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: '1.5',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {whatsAppMessageType === 'report' ? prepareWhatsAppReport('report') : (whatsAppMessage || 'Type your custom message above...')}
            </div>
          </div>
        </div>
        
        <div className="modal-footer" style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '15px'
        }}>
          <button
            onClick={() => setShowWhatsAppModal(false)}
            disabled={sendingWhatsApp}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={sendReportViaWhatsApp}
            disabled={sendingWhatsApp || !whatsAppNumber}
            style={{
              padding: '8px 16px',
              background: '#25D366',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            {sendingWhatsApp ? (
              <>
                <div className="spinner-small" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Sending...
              </>
            ) : (
              <>
                <FiMessageSquare /> Open in WhatsApp
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Handlers
  const handleEdit = (id) => {
    navigate(`/production-sections/spiral/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/production-sections/spiral/view/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const { error } = await supabase
        .from("spiralsection")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("Record deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record: " + error.message);
    }
  };

  // Export all records
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert("No records to export");
      return;
    }

    const csvContent = [
      [
        "ID",
        "Item Name",
        "Raw Material Size",
        "Material Type",
        "Wire Size",
        "Finished Product",
        "Machine ID",
        "Machine No",
        "Production",
        "Target Production",
        "Unit",
        "Weight",
        "Per Meter WT",
        "Efficiency %",
        "Target Efficiency %",
        "Operator",
        "User Name",
        "Shift Code",
        "Shift Name",
        "Remarks",
        "Item Code",
        "Created At",
      ],
      ...filteredRecords.map((record) => [
        record.id,
        `"${record.item_name || ""}"`,
        `"${record.raw_material_flatsize || ""}"`,
        `"${record.material_type || ""}"`,
        `"${record.wire_size || ""}"`,
        `"${record.finishedproductname || ""}"`,
        `"${record.machine_id || ""}"`,
        `"${record.machine_no || ""}"`,
        parseFloat(record.production_quantity) || 0,
        parseFloat(record.target_quantity) || 0,
        `"${record.unit || "Meter"}"`,
        parseFloat(record.weight) || 0,
        parseFloat(record.per_meter_wt) || 0,
        parseFloat(record.efficiency) || 0,
        parseFloat(record.target_efficiency) || 85,
        `"${record.operator_name || ""}"`,
        `"${record.users_name || ""}"`,
        `"${record.shift_code || ""}"`,
        `"${record.shift_name || ""}"`,
        `"${record.remarks || ""}"`,
        `"${record.item_code || ""}"`,
        `"${new Date(record.created_at).toLocaleString()}"`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spiral-production-records-${
      new Date().toISOString().split("T")[0]
    }-Afsar.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print report
  const handlePrintReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to print");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spiral Section Production Report - ${
          reportData.formattedDate
        }</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 10px; }
          .header .date { color: #666; font-size: 18px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          .table th { background-color: #f8f9fa; }
          .summary { 
            background-color: #f8f9fa; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
          }
          .shift-section { 
            margin: 20px 0; 
            padding: 15px; 
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .night-shift { 
            border-left-color: #1e40af;
          }
          .shift-header { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            margin-bottom: 10px; 
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Spiral Section Production Report</h1>
          <div class="date">${reportData.formattedDate}</div>
          <div class="date">Report Generated by: Afsar</div>
        </div>
        
        <!-- Shift-wise Summary -->
        <div class="shift-section">
          <div class="shift-header">
            <h3 style="margin: 0; color: #f59e0b;">☀️ Day Shift Summary</h3>
          </div>
          <p><strong>Production:</strong> ${Math.round(reportData.dayShiftData.production)} Meter</p>
          <p><strong>Weight:</strong> ${Math.round(reportData.dayShiftData.weight)} KG</p>
          <p><strong>Average Efficiency:</strong> ${Math.round(reportData.dayShiftData.avgEfficiency)}%</p>
          <p><strong>Records:</strong> ${reportData.dayShiftCount}</p>
        </div>
        
        <div class="shift-section night-shift">
          <div class="shift-header">
            <h3 style="margin: 0; color: #1e40af;">🌙 Night Shift Summary</h3>
          </div>
          <p><strong>Production:</strong> ${Math.round(reportData.nightShiftData.production)} Meter</p>
          <p><strong>Weight:</strong> ${Math.round(reportData.nightShiftData.weight)} KG</p>
          <p><strong>Average Efficiency:</strong> ${Math.round(reportData.nightShiftData.avgEfficiency)}%</p>
          <p><strong>Records:</strong> ${reportData.nightShiftCount}</p>
        </div>
        
        <h3>Item-wise Summary:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Production (Meter)</th>
              <th>Target (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
              <th>Target Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.itemWise)
              .map(
                ([item, data]) => `
              <tr>
                <td>${item}</td>
                <td>${Math.round(data.production)}</td>
                <td>${Math.round(data.production * 1.2)}</td>
                <td>${Math.round(data.weight)}</td>
                <td>${Math.round(data.count > 0 ? data.efficiency / data.count : 0)}%</td>
                <td>85%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <h3>Machine-wise Summary - Day Shift:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Machine No</th>
              <th>Production (Meter)</th>
              <th>Target (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
              <th>Operator</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: 14 }, (_, i) => {
              const machineKey = `SP # ${i + 1}`;
              const data = reportData.dayShiftData.machines[machineKey] || {
                production: 0,
                efficiency: 0,
                operator: "Operator Absent",
                count: 0
              };
              const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
              return `
                <tr>
                  <td>SP # ${i + 1}</td>
                  <td>${Math.round(data.production)}</td>
                  <td>${Math.round(data.production * 1.2)}</td>
                  <td>${Math.round(data.weight || 0)}</td>
                  <td>${efficiency}%</td>
                  <td>${data.operator || "Operator Absent"}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <h3>Machine-wise Summary - Night Shift:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Machine No</th>
              <th>Production (Meter)</th>
              <th>Target (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
              <th>Operator</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: 14 }, (_, i) => {
              const machineKey = `SP # ${i + 1}`;
              const data = reportData.nightShiftData.machines[machineKey] || {
                production: 0,
                efficiency: 0,
                operator: "Operator Absent",
                count: 0
              };
              const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
              return `
                <tr>
                  <td>SP # ${i + 1}</td>
                  <td>${Math.round(data.production)}</td>
                  <td>${Math.round(data.production * 1.2)}</td>
                  <td>${Math.round(data.weight || 0)}</td>
                  <td>${efficiency}%</td>
                  <td>${data.operator || "Operator Absent"}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Summary:</h3>
          <p><strong>Total Production:</strong> ${Math.round(reportData.totalProduction)} Meter</p>
          <p><strong>Target Production:</strong> ${Math.round(reportData.totalProduction * 1.2)} Meter</p>
          <p><strong>Total Weight:</strong> ${Math.round(reportData.totalWeight)} KG</p>
          <p><strong>Average Efficiency:</strong> ${Math.round(reportData.avgEfficiency)}%</p>
          <p><strong>Target Efficiency:</strong> 85%</p>
          <p><strong>Total Records:</strong> ${reportData.recordCount}</p>
          <p><strong>Day Shift Records:</strong> ${reportData.dayShiftCount}</p>
          <p><strong>Night Shift Records:</strong> ${reportData.nightShiftCount}</p>
        </div>
        
        <div class="footer">
          Generated on ${new Date().toLocaleString()} by Afsar<br/>
          Spiral Section - Production Management System
        </div>
        
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export report to Excel
  const handleExportReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to export");
      return;
    }

    const csvContent = [
      ["Spiral Section Production Report", reportData.formattedDate],
      ["Generated by: Afsar"],
      [],
      ["SHIFT-WISE SUMMARY"],
      [],
      ["Day Shift Summary"],
      ["Production (Meter):", Math.round(reportData.dayShiftData.production)],
      ["Weight (KG):", Math.round(reportData.dayShiftData.weight)],
      ["Average Efficiency:", Math.round(reportData.dayShiftData.avgEfficiency) + "%"],
      ["Records:", reportData.dayShiftCount],
      [],
      ["Night Shift Summary"],
      ["Production (Meter):", Math.round(reportData.nightShiftData.production)],
      ["Weight (KG):", Math.round(reportData.nightShiftData.weight)],
      ["Average Efficiency:", Math.round(reportData.nightShiftData.avgEfficiency) + "%"],
      ["Records:", reportData.nightShiftCount],
      [],
      ["Item-wise Summary"],
      [
        "Item Name",
        "Production (Meter)",
        "Target (Meter)",
        "Weight (KG)",
        "Avg Efficiency",
        "Target Efficiency",
      ],
      ...Object.entries(reportData.itemWise).map(([item, data]) => [
        item,
        Math.round(data.production),
        Math.round(data.production * 1.2),
        Math.round(data.weight),
        Math.round(data.count > 0 ? data.efficiency / data.count : 0) + "%",
        "85%",
      ]),
      [],
      ["Machine-wise Summary - Day Shift"],
      [
        "Machine No",
        "Production (Meter)",
        "Target (Meter)",
        "Weight (KG)",
        "Avg Efficiency",
        "Operator",
      ],
      ...Array.from({ length: 14 }, (_, i) => {
        const machineKey = `SP # ${i + 1}`;
        const data = reportData.dayShiftData.machines[machineKey] || {
          production: 0,
          efficiency: 0,
          operator: "Operator Absent",
          count: 0
        };
        const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
        return [
          `SP # ${i + 1}`,
          Math.round(data.production),
          Math.round(data.production * 1.2),
          Math.round(data.weight || 0),
          efficiency + "%",
          data.operator || "Operator Absent",
        ];
      }),
      [],
      ["Machine-wise Summary - Night Shift"],
      [
        "Machine No",
        "Production (Meter)",
        "Target (Meter)",
        "Weight (KG)",
        "Avg Efficiency",
        "Operator",
      ],
      ...Array.from({ length: 14 }, (_, i) => {
        const machineKey = `SP # ${i + 1}`;
        const data = reportData.nightShiftData.machines[machineKey] || {
          production: 0,
          efficiency: 0,
          operator: "Operator Absent",
          count: 0
        };
        const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
        return [
          `SP # ${i + 1}`,
          Math.round(data.production),
          Math.round(data.production * 1.2),
          Math.round(data.weight || 0),
          efficiency + "%",
          data.operator || "Operator Absent",
        ];
      }),
      [],
      ["SUMMARY"],
      ["Total Production (Meter):", Math.round(reportData.totalProduction)],
      [
        "Target Production (Meter):",
        Math.round(reportData.totalProduction * 1.2),
      ],
      ["Total Weight (KG):", Math.round(reportData.totalWeight)],
      ["Average Efficiency:", Math.round(reportData.avgEfficiency) + "%"],
      ["Target Efficiency:", "85%"],
      ["Total Records:", reportData.recordCount],
      ["Day Shift Records:", reportData.dayShiftCount],
      ["Night Shift Records:", reportData.nightShiftCount],
      [],
      ["Generated by: Afsar"],
      ["Generated on:", new Date().toLocaleString()],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spiral-section-report-${filterDate}-Afsar.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Stats cards
  const statCards = [
    {
      id: "total-records",
      title: "Total Records",
      value: stats.totalRecords,
      icon: FiDatabase,
      gradientColors: ["#3b82f6", "#1d4ed8"],
      description: "All production records",
    },
    {
      id: "total-production",
      title: "Total Production",
      value: `${Math.round(stats.totalProduction)} M`,
      icon: FiColumns,
      gradientColors: ["#3b82f6", "#2563eb"],
      description: "Total production in meters",
    },
    {
      id: "total-weight",
      title: "Total Weight",
      value: `${Math.round(stats.totalWeight)} KG`,
      icon: FiWeight,
      gradientColors: ["#8b5cf6", "#7c3aed"],
      description: "Total weight in kilograms",
    },
    {
      id: "avg-efficiency",
      title: "Avg Efficiency",
      value: `${Math.round(stats.avgEfficiency)}%`,
      icon: FiTrendingUp2,
      gradientColors: ["#10b981", "#059669"],
      description: "Average efficiency percentage",
    },
    {
      id: "today-records",
      title: "Today's Records",
      value: stats.todayRecords,
      icon: FiCalendar,
      gradientColors: ["#3b82f6", "#2563eb"],
      description: "Records added today",
    },
    {
      id: "today-production",
      title: "Today's Production",
      value: `${Math.round(stats.todayProduction)} M`,
      icon: FiPackage,
      gradientColors: ["#3b82f6", "#1d4ed8"],
      description: "Today's production",
    },
    {
      id: "today-weight",
      title: "Today's Weight",
      value: `${Math.round(stats.todayWeight)} KG`,
      icon: FiWeight,
      gradientColors: ["#8b5cf6", "#7c3aed"],
      description: "Today's weight",
    },
    {
      id: "today-avg-efficiency",
      title: "Today's Avg Efficiency",
      value: `${Math.round(stats.todayAvgEfficiency)}%`,
      icon: FiActivity,
      gradientColors: ["#10b981", "#059669"],
      description: "Today's average efficiency",
    },
  ];

  // Render loading state
  if (loading && records.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <h3>Loading Spiral Section Data...</h3>
        <p className="loading-subtext">Fetching records from database</p>
      </div>
    );
  }

  return (
    <>
      <div className="spiral-container">
        {/* Database Status Banner */}
        {!isSupabaseConnected && (
          <div className="database-alert">
            <FiAlertCircle size={20} />
            <div>
              <strong>Supabase Connection Issue</strong>
              <div className="alert-subtext">
                Check your .env file for REACT_APP_SUPABASE_URL and
                REACT_APP_SUPABASE_ANON_KEY
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="header-section">
          <div>
            <div className="breadcrumb-nav">
              <button
                onClick={() => navigate("/production")}
                className="breadcrumb-btn back-btn"
              >
                <FiBack size={16} /> Back to Production Sections
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="breadcrumb-btn secondary"
              >
                <FiGrid size={16} /> Back to Dashboard
              </button>
            </div>
            <div className="title-section">
              <div className="title-icon">
                <FiColumns size={28} />
              </div>
              <div>
                <h1 className="page-title">
                  Spiral Section
                  <div
                    className={`connection-badge ${
                      isSupabaseConnected ? "connected" : "offline"
                    }`}
                  >
                    {isSupabaseConnected ? (
                      <>
                        <FiCheckCircle size={10} /> Connected
                      </>
                    ) : (
                      <>
                        <FiXCircle size={10} /> Offline
                      </>
                    )}
                  </div>
                </h1>
                <p className="page-subtitle">
                  <FiDatabase size={14} />
                  Data from: spiralsection table • Total Records:{" "}
                  {stats.totalRecords} • By: Afsar
                </p>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {/* Toggle Buttons */}
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="toggle-btn toggle-blue"
            >
              {showDashboard ? <FiEyeOff size={14} /> : <FiBarChart2 size={14} />}
              {showDashboard ? " Hide Dashboard" : " Show Dashboard"}
            </button>

            <button
              onClick={() => setShowStatsCards(!showStatsCards)}
              className="toggle-btn toggle-green"
            >
              {showStatsCards ? <FiEyeOff size={14} /> : <FiLayers size={14} />}
              {showStatsCards ? " Hide Stats" : " Show Stats"}
            </button>

            <button
              onClick={() => navigate("/production")}
              className="production-sections-btn green-border"
            >
              <FiGrid size={16} /> All Production Sections
            </button>

            <button
              onClick={() => navigate("/production-sections/spiral/new")}
              className="primary-btn blue-gradient"
            >
              <FiPlus size={20} /> New Production Entry
            </button>

            {/* Smart Entry Form Button */}
            <button
              onClick={() => navigate("/production-sections/spiral/smart-entry")}
              className="smart-entry-btn green-border"
            >
              <FiCpu size={20} /> Smart Entry Form
            </button>

            <button
              onClick={handleExport}
              disabled={records.length === 0}
              className="export-btn gray-border"
            >
              <FiDownload /> Export CSV
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="refresh-btn blue-border"
            >
              {loading ? (
                <>
                  <div className="mini-spinner" />
                  Loading...
                </>
              ) : (
                <>
                  <FiRefreshCw /> Refresh
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Cards - Conditional Rendering */}
        {showStatsCards && (
          <div className="stats-grid">
            {statCards.map((card, index) => {
              const gradients = [
                { colors: ["#3b82f6", "#1d4ed8"], iconBg: "#3b82f6" },
                { colors: ["#3b82f6", "#2563eb"], iconBg: "#3b82f6" },
                { colors: ["#8b5cf6", "#7c3aed"], iconBg: "#8b5cf6" },
                { colors: ["#10b981", "#059669"], iconBg: "#10b981" },
                { colors: ["#f59e0b", "#d97706"], iconBg: "#f59e0b" },
                { colors: ["#ef4444", "#dc2626"], iconBg: "#ef4444" },
                { colors: ["#ec4899", "#db2777"], iconBg: "#ec4899" },
                { colors: ["#06b6d4", "#0891b2"], iconBg: "#06b6d4" },
              ];

              const gradient = gradients[index % gradients.length];

              return (
                <div
                  key={card.id}
                  className="stat-card"
                  style={{
                    background: `linear-gradient(135deg, ${gradient.colors[0]}15 0%, ${gradient.colors[1]}05 100%)`,
                    border: `1px solid ${gradient.colors[0]}30`,
                    boxShadow: `0 10px 25px ${gradient.colors[0]}10, 0 5px 15px ${gradient.colors[1]}05`,
                  }}
                >
                  <div
                    className="stat-card-glow"
                    style={{
                      background: `linear-gradient(90deg, transparent 0%, ${gradient.colors[0]}30 50%, transparent 100%)`,
                    }}
                  />

                  <div className="stat-card-content">
                    <div>
                      <div className="stat-title">{card.title}</div>
                      <div
                        className="stat-value"
                        style={{
                          color: gradient.colors[0],
                          textShadow: `0 2px 4px ${gradient.colors[0]}20`,
                        }}
                      >
                        {card.value}
                      </div>
                    </div>
                    <div
                      className="stat-icon"
                      style={{
                        background: `linear-gradient(135deg, ${gradient.colors[0]} 0%, ${gradient.colors[1]} 100%)`,
                        boxShadow: `0 4px 10px ${gradient.iconBg}40`,
                      }}
                    >
                      <card.icon size={24} />
                    </div>
                  </div>
                  <div className="stat-description">{card.description}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Today's Production Dashboard - Conditional Rendering */}
        {showDashboard && (
          <div className="today-production-dashboard">
            <div className="section-header">
              <div className="header-icon blue-gradient">
                <FiCpu size={20} />
              </div>
              <div>
                <h3>Today's Production Dashboard</h3>
                <p className="section-subtitle">
                  Spiral production overview for today • Managed by: Afsar
                </p>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Item-wise Today */}
              <div className="dashboard-section">
                <h4 className="dashboard-title">
                  <FiPackage style={{ marginRight: "8px" }} />
                  Item-wise Production Today
                </h4>
                <div className="dashboard-cards">
                  {Object.entries(stats.itemWiseToday).length > 0 ? (
                    Object.entries(stats.itemWiseToday).map(([item, data]) => (
                      <div key={item} className="dashboard-card item-card">
                        <div className="card-header">
                          <div className="card-icon blue-gradient">
                            <FiPackage size={14} />
                          </div>
                          <div className="card-name">{item}</div>
                        </div>
                        <div className="card-stats">
                          <div className="card-production">
                            {Math.round(data.production)}{" "}
                            <span className="unit">M</span>
                          </div>
                          <div className="card-weight">
                            {Math.round(data.weight)}{" "}
                            <span className="unit">KG</span>
                          </div>
                          <div className="card-efficiency">
                            {Math.round(data.count > 0 ? data.efficiency / data.count : 0)}%
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <FiPackage size={24} />
                      <div>No item production today</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Machine-wise Today */}
              <div className="dashboard-section">
                <h4 className="dashboard-title">
                  <FiMachine style={{ marginRight: "8px" }} />
                  Machine-wise Production Today
                </h4>
                <div className="dashboard-cards">
                  {Object.entries(stats.machineWiseToday).length > 0 ? (
                    Object.entries(stats.machineWiseToday).map(
                      ([machine, data]) => (
                        <div
                          key={machine}
                          className="dashboard-card machine-card"
                        >
                          <div className="card-header">
                            <div className="card-icon purple-gradient">
                              <FiMachine size={14} />
                            </div>
                            <div className="card-name">Machine {machine}</div>
                          </div>
                          <div className="card-stats">
                            <div className="card-production">
                              {Math.round(data.production)}{" "}
                              <span className="unit">M</span>
                            </div>
                            <div className="card-weight">
                              {Math.round(data.weight)}{" "}
                              <span className="unit">KG</span>
                            </div>
                            <div className="card-efficiency">
                              {Math.round(data.count > 0 ? data.efficiency / data.count : 0)}%
                            </div>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="no-data">
                      <FiMachine size={24} />
                      <div>No machine production today</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Finished Product-wise Today */}
              <div className="dashboard-section">
                <h4 className="dashboard-title">
                  <FiProduct style={{ marginRight: "8px" }} />
                  Finished Product-wise Today
                </h4>
                <div className="dashboard-cards">
                  {Object.entries(stats.finishedProductWiseToday).length > 0 ? (
                    Object.entries(stats.finishedProductWiseToday).map(
                      ([product, data]) => (
                        <div
                          key={product}
                          className="dashboard-card product-card"
                        >
                          <div className="card-header">
                            <div className="card-icon green-gradient">
                              <FiProduct size={14} />
                            </div>
                            <div className="card-name">{product}</div>
                          </div>
                          <div className="card-stats">
                            <div className="card-production">
                              {Math.round(data.production)}{" "}
                              <span className="unit">M</span>
                            </div>
                            <div className="card-weight">
                              {Math.round(data.weight)}{" "}
                              <span className="unit">KG</span>
                            </div>
                            <div className="card-efficiency">
                              {Math.round(data.count > 0 ? data.efficiency / data.count : 0)}%
                            </div>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className="no-data">
                      <FiProduct size={24} />
                      <div>No finished product today</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-container">
            <div className="filter-box">
              <FiFilter size={14} />
              <span style={{ fontWeight: "bold", color: "#3b82f6" }}>
                FILTERS
              </span>
            </div>

            <div className="filter-box search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-box select-box">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="">All Wire Sizes</option>
                {wireSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-box date-box">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="filter-date"
              />
            </div>

            <div className="filter-box button-box">
              <button
                onClick={() =>
                  filterDate ? setShowReport(true) : alert("Select date first")
                }
                className="filter-btn btn-generate"
              >
                <FiBarChart2 /> Generate Report
              </button>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("");
                  setFilterDate("");
                  setShowReport(false);
                  setCurrentPage(1);
                }}
                className="filter-btn btn-clear"
              >
                <FiX /> Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Report Section */}
        {showReport && reportData && (
          <div className="report-section">
            <div className="report-bg-pattern blue-radial" />

            <div className="report-header">
              <div>
                <h2>Spiral Section Production Report</h2>
                <div className="report-date">
                  {reportData.formattedDate}
                  <div className="report-date-subtext">
                    Report Generated by: <strong>Afsar</strong>
                  </div>
                </div>
              </div>
              <div className="report-actions">
                {/* WhatsApp Button */}
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="whatsapp-btn"
                  style={{
                    backgroundColor: '#25D366',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#1da851';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#25D366';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <FiMessageSquare size={18} /> WhatsApp
                </button>
                
                {/* Print Button */}
                <button
                  onClick={handlePrintReport}
                  className="print-report-btn blue-solid"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500'
                  }}
                >
                  <FiPrinter /> Print Report
                </button>
                
                {/* Export Button */}
                <button
                  onClick={handleExportReport}
                  className="export-report-btn blue-solid"
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500'
                  }}
                >
                  <FiDownload /> Export Report
                </button>
                
                {/* Close Button */}
                <button
                  onClick={() => setShowReport(false)}
                  className="close-report-btn gray-border"
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Shift-wise Summary */}
            <div className="shift-report-section">
              <h3>Shift-wise Production Summary</h3>
              <div className="shift-report-grid">
                {/* Day Shift Card */}
                <div className="day-shift-card" style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1px solid #f59e0b30',
                  borderRadius: '8px',
                  padding: '15px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#f59e0b',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <FiSun size={12} /> Day Shift
                  </div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#92400e' }}>☀️ Day Shift Production</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                        {Math.round(reportData.dayShiftData.production)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#92400e' }}>Production (M)</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                        {Math.round(reportData.dayShiftData.weight)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#92400e' }}>Weight (KG)</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                        {Math.round(reportData.dayShiftData.avgEfficiency)}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#92400e' }}>Efficiency</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e' }}>
                        {reportData.dayShiftCount}
                      </div>
                      <div style={{ fontSize: '12px', color: '#92400e' }}>Records</div>
                    </div>
                  </div>
                </div>

                {/* Night Shift Card */}
                <div className="night-shift-card" style={{
                  background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                  border: '1px solid #4f46e530',
                  borderRadius: '8px',
                  padding: '15px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#4f46e5',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <FiMoon size={12} /> Night Shift
                  </div>
                  <h4 style={{ margin: '0 0 15px 0', color: '#3730a3' }}>🌙 Night Shift Production</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3730a3' }}>
                        {Math.round(reportData.nightShiftData.production)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#3730a3' }}>Production (M)</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3730a3' }}>
                        {Math.round(reportData.nightShiftData.weight)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#3730a3' }}>Weight (KG)</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3730a3' }}>
                        {Math.round(reportData.nightShiftData.avgEfficiency)}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#3730a3' }}>Efficiency</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3730a3' }}>
                        {reportData.nightShiftCount}
                      </div>
                      <div style={{ fontSize: '12px', color: '#3730a3' }}>Records</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Item-wise Summary */}
            {Object.keys(reportData.itemWise).length > 0 && (
              <div className="item-report-section">
                <h3>Item-wise Summary</h3>
                <div className="item-report-grid">
                  {Object.entries(reportData.itemWise).map(([item, data]) => (
                    <div key={item} className="item-report-card">
                      <div className="item-report-header">
                        <div className="item-report-icon blue-gradient">
                          <FiPackage size={16} />
                        </div>
                        <div className="item-report-name">{item}</div>
                      </div>
                      <div className="item-report-stats">
                        <div className="item-report-production">
                          {Math.round(data.production)} M
                        </div>
                        <div className="item-report-weight">
                          {Math.round(data.weight)} KG
                        </div>
                        <div className="item-report-efficiency">
                          {Math.round(data.count > 0 ? data.efficiency / data.count : 0)}% Efficiency
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Machine-wise Summary - Day Shift */}
            <div className="machine-report-section">
              <h3>Machine-wise Summary - Day Shift</h3>
              <div className="machine-report-grid">
                {Array.from({ length: 14 }, (_, i) => {
                  const machineNum = i + 1;
                  const machineKey = `SP # ${machineNum}`;
                  const data = reportData.dayShiftData.machines[machineKey] || {
                    production: 0,
                    efficiency: 0,
                    operator: "Operator Absent",
                    count: 0
                  };
                  const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
                  
                  return (
                    <div key={machineNum} className="machine-report-card">
                      <div className="machine-report-header">
                        <div className="machine-report-icon purple-gradient">
                          <FiMachine size={16} />
                        </div>
                        <div className="machine-report-name">
                          SP # {machineNum}
                        </div>
                        <div className="machine-report-operator">
                          <FiUser size={12} /> {data.operator || "Operator Absent"}
                        </div>
                      </div>
                      <div className="machine-report-stats">
                        <div className="machine-report-production">
                          {Math.round(data.production)} M
                        </div>
                        <div className="machine-report-efficiency">
                          {efficiency}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Machine-wise Summary - Night Shift */}
            <div className="machine-report-section">
              <h3>Machine-wise Summary - Night Shift</h3>
              <div className="machine-report-grid">
                {Array.from({ length: 14 }, (_, i) => {
                  const machineNum = i + 1;
                  const machineKey = `SP # ${machineNum}`;
                  const data = reportData.nightShiftData.machines[machineKey] || {
                    production: 0,
                    efficiency: 0,
                    operator: "Operator Absent",
                    count: 0
                  };
                  const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
                  
                  return (
                    <div key={machineNum} className="machine-report-card">
                      <div className="machine-report-header">
                        <div className="machine-report-icon purple-gradient">
                          <FiMachine size={16} />
                        </div>
                        <div className="machine-report-name">
                          SP # {machineNum}
                        </div>
                        <div className="machine-report-operator">
                          <FiUser size={12} /> {data.operator || "Operator Absent"}
                        </div>
                      </div>
                      <div className="machine-report-stats">
                        <div className="machine-report-production">
                          {Math.round(data.production)} M
                        </div>
                        <div className="machine-report-efficiency">
                          {efficiency}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Section */}
            <div className="report-summary">
              <h3>Summary</h3>

              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">Total Production</div>
                  <div className="summary-value production-value">
                    {Math.round(reportData.totalProduction)} M
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Target Production</div>
                  <div className="summary-value target-value">
                    {Math.round(reportData.totalProduction * 1.2)} M
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total Weight</div>
                  <div className="summary-value weight-value">
                    {Math.round(reportData.totalWeight)} KG
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Average Efficiency</div>
                  <div className="summary-value efficiency-value">
                    {Math.round(reportData.avgEfficiency)}%
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Target Efficiency</div>
                  <div className="summary-value target-efficiency-value">85%</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total Records</div>
                  <div className="summary-value records-value">
                    {reportData.recordCount}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Day Shift Records</div>
                  <div className="summary-value day-shift-value" style={{ color: '#f59e0b' }}>
                    {reportData.dayShiftCount}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Night Shift Records</div>
                  <div className="summary-value night-shift-value" style={{ color: '#4f46e5' }}>
                    {reportData.nightShiftCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="report-footer">
              Report generated on {new Date().toLocaleString()} by{" "}
              <strong>Afsar</strong> • Data source: spiralsection table
            </div>
          </div>
        )}

        {/* Records Table */}
        <div className="records-table-section">
          <div className="table-header-section blue-gradient">
            <div>
              <h3>Spiral Production Records</h3>
              <div className="table-stats">
                Total: {records.length} records • Showing:{" "}
                {filteredRecords.length} filtered • Page: {currentPage}/
                {totalPages}
                <div className="table-stats-subtext">Managed by: Afsar</div>
              </div>
            </div>
            <div className="database-status">
              <div
                className={`status-indicator ${
                  isSupabaseConnected ? "connected" : "offline"
                }`}
              />
              {isSupabaseConnected ? "Database Connected" : "Database Offline"}
            </div>
          </div>

          {loading ? (
            <div className="loading-records">
              <div className="table-spinner" />
              Loading records from spiralsection...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="empty-records">
              <FiColumns size={48} />
              <div className="empty-title">No records found</div>
              <div className="empty-message">
                {searchTerm || filterDate || filterType
                  ? "No records match your search criteria. Try adjusting your filters."
                  : "No spiral production records available. Create your first record to get started."}
              </div>
              <button
                onClick={() => navigate("/production-sections/spiral/new")}
                className="create-first-btn blue-gradient"
              >
                <FiPlus /> Create First Record
              </button>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="production-table compact-table">
                  <thead>
                    <tr className="table-header-row">
                      <th className="table-header-cell compact-header">ID</th>
                      <th className="table-header-cell compact-header">
                        Item Details
                      </th>
                      <th className="table-header-cell compact-header">
                        Material & Wire
                      </th>
                      <th className="table-header-cell compact-header">
                        Finished Product
                      </th>
                      <th className="table-header-cell compact-header">
                        <div>Machine</div>
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>(ID)</div>
                      </th>
                      <th className="table-header-cell compact-header">
                        <div>Production</div>
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>
                          (Target)
                        </div>
                      </th>
                      <th className="table-header-cell compact-header">
                        <div>Weight</div>
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>
                          (Per M)
                        </div>
                      </th>
                      <th className="table-header-cell compact-header">
                        <div>Efficiency</div>
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>
                          (Target)
                        </div>
                      </th>
                      <th className="table-header-cell compact-header">
                        <div>Operator</div>
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>
                          (User)
                        </div>
                      </th>
                      <th className="table-header-cell compact-header">
                        <div>Shift</div>
                        <div style={{ fontSize: "11px", opacity: 0.8 }}>
                          (Code)
                        </div>
                      </th>
                      <th className="table-header-cell compact-header">
                        <div>Date & Time</div>
                      </th>
                      <th
                        className="table-header-cell compact-header"
                        style={{ width: "90px" }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record, index) => (
                      <tr
                        key={record.id}
                        className={`table-row compact-row ${
                          index % 2 === 0 ? "even" : "odd"
                        }`}
                        style={{ height: "55px" }}
                      >
                        {/* ID Cell */}
                        <td className="table-cell compact-cell">
                          <div className="id-cell">#{record.id}</div>
                          {record.item_code && (
                            <div className="id-code">
                              Code: {record.item_code}
                            </div>
                          )}
                        </td>

                        {/* Item Details */}
                        <td className="table-cell compact-cell">
                          <div className="item-details-cell">
                            <div className="item-icon-small">
                              <FiPackage size={12} />
                            </div>
                            <div>
                              <div className="item-name">
                                {record.item_name || "N/A"}
                              </div>
                              <div className="item-size">
                                Size: {record.raw_material_flatsize || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Material & Wire */}
                        <td className="table-cell compact-cell">
                          <div>
                            <div className="material-cell">
                              {record.material_type || "N/A"}
                            </div>
                            <div className="wire-size-cell">
                              <FiZap size={8} />
                              {record.wire_size || "N/A"}
                            </div>
                          </div>
                        </td>

                        {/* Finished Product */}
                        <td className="table-cell compact-cell">
                          <div className="material-cell">
                            {record.finishedproductname || "N/A"}
                          </div>
                        </td>

                        {/* Machine */}
                        <td className="table-cell compact-cell">
                          <div>
                            <div className="machine-cell">
                              <FiMachine size={10} />
                              {record.machine_no || "N/A"}
                            </div>
                            <div className="machine-id-cell">
                              ID: {record.machine_id || "N/A"}
                            </div>
                          </div>
                        </td>

                        {/* Production with Target */}
                        <td className="table-cell compact-cell">
                          <div>
                            <div className="production-cell">
                              {Math.round(parseFloat(record.production_quantity || 0))}{" "}
                              M
                            </div>
                            <div className="production-target-cell">
                              <FiTarget size={8} />
                              Target:{" "}
                              {Math.round(parseFloat(
                                record.target_quantity ||
                                  record.production_quantity * 1.2
                              ))}{" "}
                              M
                            </div>
                          </div>
                        </td>

                        {/* Weight with Per Meter */}
                        <td className="table-cell compact-cell">
                          <div>
                            <div className="weight-cell">
                              {Math.round(parseFloat(record.weight || 0))} KG
                            </div>
                            <div className="weight-per-meter-cell">
                              Per M:{" "}
                              {Math.round(parseFloat(record.per_meter_wt || 0))} KG
                            </div>
                          </div>
                        </td>

                        {/* Efficiency with Target */}
                        <td className="table-cell compact-cell">
                          <div>
                            <div
                              className={`efficiency-cell ${
                                parseFloat(record.efficiency || 0) >= 85
                                  ? "high"
                                  : parseFloat(record.efficiency || 0) >= 70
                                  ? "medium"
                                  : "low"
                              }`}
                            >
                              {Math.round(parseFloat(record.efficiency || 0))}%
                            </div>
                            <div className="efficiency-target-cell">
                              Target: 85%
                            </div>
                          </div>
                        </td>

                        {/* Operator with User */}
                        <td className="table-cell compact-cell">
                          <div>
                            <div className="operator-cell">
                              {record.operator_name || "N/A"}
                            </div>
                            <div className="user-cell">
                              User: {record.users_name || "N/A"}
                            </div>
                          </div>
                        </td>

                        {/* Shift with Code */}
                        <td className="table-cell compact-cell">
                          <div>
                            <div className="shift-cell">
                              {record.shift_name || "N/A"}
                            </div>
                            <div className="shift-code-cell">
                              Code: {record.shift_code || "N/A"}
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="table-cell compact-cell">
                          <div>
                            <div className="date-cell">
                              {new Date(record.created_at).toLocaleDateString(
                                "en-GB"
                              )}
                            </div>
                            <div className="time-cell">
                              {new Date(record.created_at).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="table-cell compact-cell">
                          <div className="action-buttons-inline">
                            <button
                              onClick={() => handleView(record.id)}
                              className="action-btn-outline view-btn-outline"
                            >
                              <FiEye size={10} /> View
                            </button>
                            <button
                              onClick={() => handleEdit(record.id)}
                              className="action-btn-outline edit-btn-outline"
                            >
                              <FiEdit size={10} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="action-btn-outline delete-btn-outline"
                            >
                              <FiTrash2 size={10} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-section">
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages} • Showing{" "}
                    {indexOfFirstItem + 1}-
                    {Math.min(indexOfLastItem, filteredRecords.length)} of{" "}
                    {filteredRecords.length} records
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`pagination-btn prev ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <FiChevronLeft /> Previous
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`page-number ${
                              currentPage === pageNum ? "active" : ""
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`pagination-btn next ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="page-footer">
          <div className="footer-content">
            <div>
              <div className="footer-title">
                Spiral Section • Production Management System
              </div>
              <div className="footer-subtitle">
                Database: spiralsection table • Last updated:{" "}
                {new Date().toLocaleTimeString()} • Managed by: Afsar
              </div>
            </div>
            <div className="footer-status">
              <div
                className={`database-connection ${
                  isSupabaseConnected ? "connected" : "offline"
                }`}
              >
                <div
                  className={`connection-dot ${
                    isSupabaseConnected ? "connected" : "offline"
                  }`}
                />
                {isSupabaseConnected
                  ? "Supabase Database Connected"
                  : "Database Connection Issue"}
              </div>
              <div className="footer-stats">
                {stats.totalRecords} records • {Math.round(stats.totalProduction)} M •{" "}
                {Math.round(stats.totalWeight)} KG • {Math.round(stats.avgEfficiency)}%
                efficiency
              </div>
            </div>
          </div>

          <div className="footer-actions">
            <button
              onClick={() => navigate("/production")}
              className="footer-btn sections-btn"
            >
              <FiGrid size={12} /> All Production Sections
            </button>
            <button
              onClick={() => navigate("/production-sections/spiral/new")}
              className="footer-btn add-btn"
            >
              <FiPlus size={12} /> Add New Record
            </button>
            <button
              onClick={() => navigate("/production-sections/spiral/smart-entry")}
              className="footer-btn smart-entry-btn"
            >
              <FiCpu size={12} /> Smart Entry
            </button>
            <button onClick={fetchData} className="footer-btn refresh-footer-btn">
              <FiRefreshCw size={12} /> Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && <WhatsAppModal />}
    </>
  );
};

export default SpiralPage;