/// ============================================================
/// SPIRAL SECTION - MASTER FILE - 100% COMPLETE - FINAL FIXED
/// REAL USER NAME DISPLAY - EFFICIENCY COLORS WORKING EVERYWHERE
/// DARK MODE FIXED - ICONS COLORFUL - TABLE HEIGHT REDUCED
/// PRODUCTION DATE & SHIFT NAME TOGETHER - FILTER CONTAINER FIXED
/// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiPackage,
  FiCalendar,
  FiAlertCircle,
  FiBarChart2,
  FiPrinter,
  FiEye,
  FiTrendingUp,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiX,
  FiActivity,
  FiColumns,
  FiFeather,
  FiTool,
  FiZap,
  FiBox,
  FiArrowLeft,
  FiCpu,
  FiEyeOff,
  FiLayers,
  FiTarget,
  FiUser,
  FiCode,
  FiMenu,
  FiHome,
  FiClock,
  FiSmartphone,
  FiSettings,
  FiHash,
  FiPercent,
  FiShoppingBag,
  FiTrendingDown,
  FiTrendingUp as FiTrendingUpIcon,
  FiSearch,
  FiMessageSquare,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { supabase } from "../../../supabaseClient";
import "./SpiralPage.css";

/// ============================================================
/// MAIN COMPONENT
/// ============================================================
const SpiralPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  /// ============================================================
  /// STATE DECLARATIONS
  /// ============================================================
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);
  const [showStatsCards, setShowStatsCards] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  /// ============================================================
  /// REMARKS MODAL STATE
  /// ============================================================
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  
  /// ============================================================
  /// REPORT DATA STATE
  /// ============================================================
  const [reportData, setReportData] = useState({
    date: "",
    formattedDate: "",
    itemWise: {},
    wireWise: {},
    machineWise: {},
    shiftWise: {},
    dayShiftData: {
      production: 0,
      weight: 0,
      efficiency: 0,
      avgEfficiency: 0,
      count: 0,
      items: {},
      machines: {}
    },
    nightShiftData: {
      production: 0,
      weight: 0,
      efficiency: 0,
      avgEfficiency: 0,
      count: 0,
      items: {},
      machines: {}
    },
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    recordCount: 0,
    dayShiftCount: 0,
    nightShiftCount: 0,
  });

  /// ============================================================
  /// STATISTICS STATE
  /// ============================================================
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    lastDayWeight: 0,
    lastDayEfficiency: 0,
    toDayProduction: 0,
    todayRecords: 0,
    todayProduction: 0,
    todayWeight: 0,
    todayAvgEfficiency: 0,
    itemWiseToday: {},
    machineWiseToday: {},
    finishedProductWiseToday: {},
  });

  const [wireSizes, setWireSizes] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState("");

  const isSupabaseConnected = supabase && process.env.REACT_APP_SUPABASE_URL;

  /// ============================================================
  /// EFFICIENCY COLOR FUNCTION - RED (<70) / YELLOW (70-79) / GREEN (80+)
  /// ============================================================
  const getEfficiencyColor = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return '#10b981'; // Green
    if (eff >= 70) return '#f59e0b'; // Yellow/Amber
    return '#ef4444'; // Red
  };

  const getEfficiencyClass = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return 'efficiency-high';
    if (eff >= 70) return 'efficiency-medium';
    return 'efficiency-low';
  };

  const getEfficiencyEmoji = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return '🟢';
    if (eff >= 70) return '🟡';
    return '🔴';
  };

  /// ============================================================
  /// GET LOGGED IN USER - REAL USER NAME FROM SUPABASE
  /// ============================================================
  useEffect(() => {
    const getRealUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userEmail = user.email;
          let userName = userEmail.split('@')[0];
          userName = userName.charAt(0).toUpperCase() + userName.slice(1);
          setLoggedInUser(userName);
          localStorage.setItem('spiralSectionUser', userName);
          return;
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
      
      const storedUser = localStorage.getItem('spiralSectionUser');
      if (storedUser) {
        setLoggedInUser(storedUser);
        return;
      }
      
      setLoggedInUser('Admin');
    };
    
    getRealUserName();
  }, []);

  /// ============================================================
  /// FETCH DATA FROM SUPABASE
  /// ============================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!supabase) throw new Error("Supabase client not initialized");

      const { data: recordsData, error: recordsError } = await supabase
        .from("spiralsection")
        .select("*")
        .order("created_at", { ascending: false });

      if (recordsError) throw recordsError;

      setRecords(recordsData || []);
      calculateStats(recordsData || []);

      const uniqueWireSizes = [
        ...new Set(
          recordsData
            .map((record) => record.wire_size)
            .filter((size) => size && size.trim() !== "")
        ),
      ].sort();
      setWireSizes(uniqueWireSizes);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /// ============================================================
  /// CALCULATE STATISTICS
  /// ============================================================
  const calculateStats = (recordsData) => {
    if (!recordsData || recordsData.length === 0) {
      setStats({
        totalRecords: 0, totalProduction: 0, totalWeight: 0, avgEfficiency: 0,
        lastDayWeight: 0, lastDayEfficiency: 0, toDayProduction: 0,
        todayRecords: 0, todayProduction: 0, todayWeight: 0, todayAvgEfficiency: 0,
        itemWiseToday: {}, machineWiseToday: {}, finishedProductWiseToday: {},
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const todayRecords = recordsData.filter(r => 
      new Date(r.created_at).toISOString().split("T")[0] === today
    );
    const yesterdayRecords = recordsData.filter(r => 
      new Date(r.created_at).toISOString().split("T")[0] === yesterday
    );

    const totalProduction = recordsData.reduce((s, r) => s + (parseFloat(r.production_quantity) || 0), 0);
    const totalWeight = recordsData.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
    const totalEfficiency = recordsData.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0);
    const avgEfficiency = recordsData.length > 0 ? totalEfficiency / recordsData.length : 0;

    const todayProduction = todayRecords.reduce((s, r) => s + (parseFloat(r.production_quantity) || 0), 0);
    const todayWeight = todayRecords.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
    const todayEfficiencySum = todayRecords.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0);
    const todayAvgEfficiency = todayRecords.length > 0 ? todayEfficiencySum / todayRecords.length : 0;

    const lastDayWeight = yesterdayRecords.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
    const lastDayEfficiencySum = yesterdayRecords.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0);
    const lastDayEfficiency = yesterdayRecords.length > 0 ? lastDayEfficiencySum / yesterdayRecords.length : 0;

    const itemWiseToday = {};
    const machineWiseToday = {};
    const finishedProductWiseToday = {};

    todayRecords.forEach((record) => {
      const item = record.item_name || "Unknown";
      const machine = record.machine_no || "Unknown";
      const product = record.finishedproductname || "Unknown";
      const production = parseFloat(record.production_quantity) || 0;
      const weight = parseFloat(record.weight) || 0;
      const efficiency = parseFloat(record.efficiency) || 0;

      if (!itemWiseToday[item]) itemWiseToday[item] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      itemWiseToday[item].production += production;
      itemWiseToday[item].weight += weight;
      itemWiseToday[item].efficiency += efficiency;
      itemWiseToday[item].count += 1;

      if (!machineWiseToday[machine]) machineWiseToday[machine] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      machineWiseToday[machine].production += production;
      machineWiseToday[machine].weight += weight;
      machineWiseToday[machine].efficiency += efficiency;
      machineWiseToday[machine].count += 1;

      if (!finishedProductWiseToday[product]) finishedProductWiseToday[product] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      finishedProductWiseToday[product].production += production;
      finishedProductWiseToday[product].weight += weight;
      finishedProductWiseToday[product].efficiency += efficiency;
      finishedProductWiseToday[product].count += 1;
    });

    setStats({
      totalRecords: recordsData.length,
      totalProduction,
      totalWeight,
      avgEfficiency,
      toDayProduction: todayProduction,
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

  /// ============================================================
  /// FILTER RECORDS - PRODUCTION DATE SEARCH FIXED
  /// ============================================================
  const filteredRecords = records.filter((record) => {
    const productionDateStr = record.production_date 
      ? new Date(record.production_date).toLocaleDateString("en-GB") 
      : "";
    
    const matchesSearch = 
      (record.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.wire_size?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.finishedproductname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.material_type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.users_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.raw_material_flatsize?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.machine_no?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.operator_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.remarks?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      productionDateStr.includes(searchTerm);

    const matchesType = !filterType || record.wire_size === filterType;
    const recordDate = new Date(record.created_at).toISOString().split("T")[0];
    const matchesDate = !filterDate || recordDate === filterDate;

    return matchesSearch && matchesType && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  /// ============================================================
  /// EXTRACT MACHINE NUMBER
  /// ============================================================
  const extractMachineNumber = (machineNo) => {
    if (!machineNo) return 0;
    const match = machineNo.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  /// ============================================================
  /// GENERATE REPORT
  /// ============================================================
  const generateReport = useCallback((selectedDate) => {
    const dateRecords = records.filter((record) => 
      new Date(record.created_at).toISOString().split("T")[0] === selectedDate
    );

    if (dateRecords.length === 0) {
      setReportData({
        date: selectedDate,
        formattedDate: new Date(selectedDate).toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        }),
        itemWise: {}, wireWise: {}, machineWise: {}, shiftWise: {},
        dayShiftData: { production: 0, weight: 0, efficiency: 0, avgEfficiency: 0, count: 0, items: {}, machines: {} },
        nightShiftData: { production: 0, weight: 0, efficiency: 0, avgEfficiency: 0, count: 0, items: {}, machines: {} },
        totalProduction: 0, totalWeight: 0, avgEfficiency: 0,
        recordCount: 0, dayShiftCount: 0, nightShiftCount: 0,
      });
      return;
    }

    const itemWise = {};
    const wireWise = {};
    const machineWise = {};
    const shiftWise = {};
    const dayShiftData = { production: 0, weight: 0, efficiency: 0, count: 0, items: {}, machines: {} };
    const nightShiftData = { production: 0, weight: 0, efficiency: 0, count: 0, items: {}, machines: {} };

    let totalProduction = 0, totalWeight = 0, totalEfficiency = 0;
    let dayShiftCount = 0, nightShiftCount = 0;

    dateRecords.forEach((record) => {
      const item = record.item_name || "Unknown";
      const wire = record.wire_size || "Unknown";
      const machine = extractMachineNumber(record.machine_no);
      const shift = record.shift_name || "Unknown";
      const operator = record.operator_name || "Unknown";
      const production = parseFloat(record.production_quantity) || 0;
      const weight = parseFloat(record.weight) || 0;
      const efficiency = parseFloat(record.efficiency) || 0;

      if (!itemWise[item]) itemWise[item] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      itemWise[item].production += production;
      itemWise[item].weight += weight;
      itemWise[item].efficiency += efficiency;
      itemWise[item].count += 1;

      if (!wireWise[wire]) wireWise[wire] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      wireWise[wire].production += production;
      wireWise[wire].weight += weight;
      wireWise[wire].efficiency += efficiency;
      wireWise[wire].count += 1;

      const machineKey = `SP # ${machine}`;
      if (!machineWise[machineKey]) {
        machineWise[machineKey] = { production: 0, weight: 0, efficiency: 0, count: 0, operator, machineNumber: machine };
      }
      machineWise[machineKey].production += production;
      machineWise[machineKey].weight += weight;
      machineWise[machineKey].efficiency += efficiency;
      machineWise[machineKey].count += 1;
      machineWise[machineKey].operator = operator;

      if (!shiftWise[shift]) shiftWise[shift] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      shiftWise[shift].production += production;
      shiftWise[shift].weight += weight;
      shiftWise[shift].efficiency += efficiency;
      shiftWise[shift].count += 1;

      const isDayShift = shift.toLowerCase().includes("day") || shift.toLowerCase().includes("morning");
      const isNightShift = shift.toLowerCase().includes("night") || shift.toLowerCase().includes("evening");

      if (isDayShift) {
        dayShiftCount++;
        dayShiftData.production += production;
        dayShiftData.weight += weight;
        dayShiftData.efficiency += efficiency;
        dayShiftData.count++;

        if (!dayShiftData.items[item]) dayShiftData.items[item] = { production: 0, weight: 0, count: 0 };
        dayShiftData.items[item].production += production;
        dayShiftData.items[item].weight += weight;
        dayShiftData.items[item].count++;

        const dayMachineKey = `SP # ${machine}`;
        if (!dayShiftData.machines[dayMachineKey]) {
          dayShiftData.machines[dayMachineKey] = { production: 0, weight: 0, efficiency: 0, count: 0, operator, machineNumber: machine };
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

        if (!nightShiftData.items[item]) nightShiftData.items[item] = { production: 0, weight: 0, count: 0 };
        nightShiftData.items[item].production += production;
        nightShiftData.items[item].weight += weight;
        nightShiftData.items[item].count++;

        const nightMachineKey = `SP # ${machine}`;
        if (!nightShiftData.machines[nightMachineKey]) {
          nightShiftData.machines[nightMachineKey] = { production: 0, weight: 0, efficiency: 0, count: 0, operator, machineNumber: machine };
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

    const avgEfficiency = dateRecords.length > 0 ? totalEfficiency / dateRecords.length : 0;
    const dayShiftAvgEfficiency = dayShiftData.count > 0 ? dayShiftData.efficiency / dayShiftData.count : 0;
    const nightShiftAvgEfficiency = nightShiftData.count > 0 ? nightShiftData.efficiency / nightShiftData.count : 0;

    setReportData({
      date: selectedDate,
      formattedDate: new Date(selectedDate).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      }),
      itemWise, 
      wireWise, 
      machineWise, 
      shiftWise,
      dayShiftData: { 
        ...dayShiftData, 
        avgEfficiency: dayShiftAvgEfficiency 
      },
      nightShiftData: { 
        ...nightShiftData, 
        avgEfficiency: nightShiftAvgEfficiency 
      },
      totalProduction, 
      totalWeight, 
      avgEfficiency,
      recordCount: dateRecords.length, 
      dayShiftCount, 
      nightShiftCount,
    });
  }, [records]);

  useEffect(() => {
    if (filterDate) generateReport(filterDate);
  }, [filterDate, generateReport]);

  /// ============================================================
  /// WHATSAPP REPORT FUNCTIONS
  /// ============================================================
  const prepareWhatsAppReport = (type = "report") => {
    if (!reportData || reportData.recordCount === 0) return "No report data available.";
    if (type === "custom") return whatsAppMessage;

    let message = `📊 *SPIRAL SECTION PRODUCTION REPORT*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📅 Date: ${reportData.formattedDate}\n`;
    message += `👤 Generated by: ${loggedInUser}\n\n`;
    message += `📈 *OVERALL SUMMARY*\n`;
    message += `• Total Production: ${Math.round(reportData.totalProduction)} M\n`;
    message += `• Total Weight: ${Math.round(reportData.totalWeight)} KG\n`;
    message += `• Average Efficiency: ${getEfficiencyEmoji(reportData.avgEfficiency)} ${Math.round(reportData.avgEfficiency)}%\n`;
    message += `• Total Records: ${reportData.recordCount}\n\n`;
    message += `🕒 *SHIFT WISE SUMMARY*\n\n`;
    
    if (reportData.dayShiftCount > 0) {
      message += `☀️ *DAY SHIFT*\n`;
      message += `  Production: ${Math.round(reportData.dayShiftData.production)} M\n`;
      message += `  Weight: ${Math.round(reportData.dayShiftData.weight)} KG\n`;
      message += `  Efficiency: ${getEfficiencyEmoji(reportData.dayShiftData.avgEfficiency)} ${Math.round(reportData.dayShiftData.avgEfficiency)}%\n`;
      message += `  Records: ${reportData.dayShiftCount}\n\n`;
    }

    if (reportData.nightShiftCount > 0) {
      message += `🌙 *NIGHT SHIFT*\n`;
      message += `  Production: ${Math.round(reportData.nightShiftData.production)} M\n`;
      message += `  Weight: ${Math.round(reportData.nightShiftData.weight)} KG\n`;
      message += `  Efficiency: ${getEfficiencyEmoji(reportData.nightShiftData.avgEfficiency)} ${Math.round(reportData.nightShiftData.avgEfficiency)}%\n`;
      message += `  Records: ${reportData.nightShiftCount}\n\n`;
    }

    message += `🏭 *MACHINE WISE - DAY SHIFT*\n`;
    Array.from({ length: 14 }, (_, i) => {
      const machineKey = `SP # ${i + 1}`;
      const data = reportData.dayShiftData.machines[machineKey] || { production: 0, efficiency: 0, operator: "N/A", count: 0 };
      const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
      message += `  SP #${i + 1}: ${Math.round(data.production)} M | ${getEfficiencyEmoji(efficiency)} ${efficiency}% | ${data.operator}\n`;
    });

    message += `\n🏭 *MACHINE WISE - NIGHT SHIFT*\n`;
    Array.from({ length: 14 }, (_, i) => {
      const machineKey = `SP # ${i + 1}`;
      const data = reportData.nightShiftData.machines[machineKey] || { production: 0, efficiency: 0, operator: "N/A", count: 0 };
      const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
      message += `  SP #${i + 1}: ${Math.round(data.production)} M | ${getEfficiencyEmoji(efficiency)} ${efficiency}% | ${data.operator}\n`;
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✅ Generated via Pakistan Wire Industries ERP`;
    return message;
  };

  const sendReportViaWhatsApp = () => {
    const reportMessage = prepareWhatsAppReport("report");
    const encodedMessage = encodeURIComponent(reportMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setShowWhatsAppModal(false);
    setWhatsAppMessage("");
  };

  /// ============================================================
  /// WHATSAPP MODAL COMPONENT
  /// ============================================================
  const WhatsAppModal = () => (
    <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <div className="modal-icon">
              <FaWhatsapp size={22} />
            </div>
            Send Report via WhatsApp
          </h2>
          <button onClick={() => setShowWhatsAppModal(false)} className="modal-close-btn">×</button>
        </div>
        <div className="modal-body">
          <div className="whatsapp-modal-content">
            <div className="whatsapp-icon-container">
              <FaWhatsapp size={36} color={isDarkMode ? '#25D366' : '#075e54'} />
            </div>
            <h3>Send to WhatsApp Desktop</h3>
            <p>Select one of the options below.</p>
          </div>
          <div className="whatsapp-options">
            <div className="options-row">
              <button onClick={sendReportViaWhatsApp} className="whatsapp-option-btn whatsapp-desktop-btn">
                <FaWhatsapp size={20} /> <span>WhatsApp</span>
              </button>
              <button onClick={() => {
                navigator.clipboard.writeText(prepareWhatsAppReport("report"));
                alert("Report copied to clipboard!");
                setShowWhatsAppModal(false);
              }} className="whatsapp-option-btn copy-message-btn">
                <FiDownload size={20} /> <span>Copy</span>
              </button>
              <button onClick={() => setShowWhatsAppModal(false)} className="whatsapp-option-btn close-btn">
                <FiX size={20} /> <span>Close</span>
              </button>
            </div>
          </div>
          <div className="preview-section">
            <h4>
              <div className="preview-icon">
                <FiEye size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />
              </div>
              Message Preview
            </h4>
            <div className="message-preview">
              {prepareWhatsAppReport("report")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /// ============================================================
  /// REMARKS MODAL COMPONENT
  /// ============================================================
  const RemarksModal = () => (
    <div className="modal-overlay" onClick={() => setShowRemarksModal(false)}>
      <div className="modal-container remarks-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <div className="modal-icon">
              <FiMessageSquare size={22} />
            </div>
            Remarks Details
          </h2>
          <button onClick={() => setShowRemarksModal(false)} className="modal-close-btn">×</button>
        </div>
        <div className="modal-body">
          <div className="remarks-modal-content">
            <div className="remarks-icon-container">
              <FiMessageSquare size={36} color={isDarkMode ? '#93c5fd' : '#2563eb'} />
            </div>
            <h3>Record ID: #{selectedRecordId}</h3>
            <div className="remarks-full-text">
              {selectedRemarks || "No remarks available"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /// ============================================================
  /// OPEN REMARKS MODAL
  /// ============================================================
  const openRemarksModal = (remarks, id) => {
    setSelectedRemarks(remarks || "No remarks available");
    setSelectedRecordId(id);
    setShowRemarksModal(true);
  };

  /// ============================================================
  /// CRUD OPERATIONS
  /// ============================================================
  const handleEdit = (id) => navigate(`/production-sections/spiral/edit/${id}`);
  const handleView = (id) => navigate(`/production-sections/spiral/view/${id}`);
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const { error } = await supabase.from("spiralsection").delete().eq("id", id);
      if (error) throw error;
      alert("Record deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record: " + error.message);
    }
  };

  /// ============================================================
  /// EXPORT CSV
  /// ============================================================
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert("No records to export");
      return;
    }

    const csvContent = [
      [
        "ID",
        "Item Name",
        "Item Code",
        "Raw Material Size",
        "Material Type",
        "Wire Size",
        "Finished Product",
        "Machine ID",
        "Machine No",
        "Production Quantity",
        "Target Quantity",
        "Unit",
        "Weight (KG)",
        "Per Meter WT",
        "Efficiency %",
        "Target Efficiency %",
        "Operator",
        "User Name",
        "Shift Code",
        "Shift Name",
        "Remarks",
        "Production Date",
        "Created At",
      ],
      ...filteredRecords.map((record) => [
        record.id,
        `"${record.item_name || ""}"`,
        `"${record.item_code || ""}"`,
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
        `"${record.production_date || ""}"`,
        `"${new Date(record.created_at).toLocaleString()}"`,
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spiral-production-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /// ============================================================
  /// PRINT REPORT
  /// ============================================================
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
        <title>Spiral Section Production Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: ${isDarkMode ? '#e2e8f0' : '#0f172a'}; background: ${isDarkMode ? '#0b1f3a' : 'white'}; }
          .header { background: ${isDarkMode ? '#60a5fa' : '#1e40af'}; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .shift-section { margin: 20px 0; padding: 15px; border-left: 4px solid ${isDarkMode ? '#60a5fa' : '#1e40af'}; background: ${isDarkMode ? '#132b4a' : '#f1f5f9'}; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: ${isDarkMode ? '#60a5fa' : '#1e40af'}; color: white; padding: 12px; text-align: left; }
          td { padding: 10px 12px; border: 1px solid ${isDarkMode ? '#60a5fa' : '#1e40af'}; }
          .efficiency-high { color: #10b981; font-weight: bold; }
          .efficiency-medium { color: #f59e0b; font-weight: bold; }
          .efficiency-low { color: #ef4444; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: ${isDarkMode ? '#94a3b8' : '#334155'}; }
          @media print { body { background: white; color: black; } th { background: #1e40af !important; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Spiral Section Production Report</h1>
          <h2>${reportData.formattedDate}</h2>
          <p>Generated by: ${loggedInUser}</p>
        </div>
        <div class="shift-section">
          <h3 style="color: ${isDarkMode ? '#60a5fa' : '#1e40af'};">☀️ Day Shift</h3>
          <p>Production: ${Math.round(reportData.dayShiftData.production)} M</p>
          <p>Weight: ${Math.round(reportData.dayShiftData.weight)} KG</p>
          <p>Efficiency: <span class="${getEfficiencyClass(reportData.dayShiftData.avgEfficiency)}">${Math.round(reportData.dayShiftData.avgEfficiency)}%</span></p>
          <p>Records: ${reportData.dayShiftCount}</p>
        </div>
        <div class="shift-section">
          <h3 style="color: ${isDarkMode ? '#60a5fa' : '#1e40af'};">🌙 Night Shift</h3>
          <p>Production: ${Math.round(reportData.nightShiftData.production)} M</p>
          <p>Weight: ${Math.round(reportData.nightShiftData.weight)} KG</p>
          <p>Efficiency: <span class="${getEfficiencyClass(reportData.nightShiftData.avgEfficiency)}">${Math.round(reportData.nightShiftData.avgEfficiency)}%</span></p>
          <p>Records: ${reportData.nightShiftCount}</p>
        </div>
        <h3>Machine Wise - Day Shift</h3>
        <table>
          <thead><tr><th>Machine</th><th>Production</th><th>Efficiency</th><th>Operator</th></tr></thead>
          <tbody>
            ${Array.from({ length: 14 }, (_, i) => {
              const data = reportData.dayShiftData.machines[`SP # ${i + 1}`] || { production: 0, efficiency: 0, operator: "N/A", count: 0 };
              const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
              return `<tr><td>SP #${i + 1}</td><td>${Math.round(data.production)} M</td><td><span class="${getEfficiencyClass(efficiency)}">${efficiency}%</span></td><td>${data.operator}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
        <h3>Machine Wise - Night Shift</h3>
        <table>
          <thead><tr><th>Machine</th><th>Production</th><th>Efficiency</th><th>Operator</th></tr></thead>
          <tbody>
            ${Array.from({ length: 14 }, (_, i) => {
              const data = reportData.nightShiftData.machines[`SP # ${i + 1}`] || { production: 0, efficiency: 0, operator: "N/A", count: 0 };
              const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
              return `<tr><td>SP #${i + 1}</td><td>${Math.round(data.production)} M</td><td><span class="${getEfficiencyClass(efficiency)}">${efficiency}%</span></td><td>${data.operator}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()} • Pakistan Wire Industries ERP</p>
          <button onclick="window.print()" style="background: #1e40af; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">Print</button>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  /// ============================================================
  /// EXPORT REPORT CSV
  /// ============================================================
  const handleExportReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to export");
      return;
    }

    const rows = [
      ["SPIRAL SECTION PRODUCTION REPORT"],
      [`Date: ${reportData.formattedDate}`],
      [`Generated by: ${loggedInUser}`],
      [],
      ["SHIFT WISE SUMMARY"],
      [],
      ["DAY SHIFT", `Production,${Math.round(reportData.dayShiftData.production)} M`, `Weight,${Math.round(reportData.dayShiftData.weight)} KG`, `Efficiency,${Math.round(reportData.dayShiftData.avgEfficiency)}%`, `Records,${reportData.dayShiftCount}`],
      [],
      ["NIGHT SHIFT", `Production,${Math.round(reportData.nightShiftData.production)} M`, `Weight,${Math.round(reportData.nightShiftData.weight)} KG`, `Efficiency,${Math.round(reportData.nightShiftData.avgEfficiency)}%`, `Records,${reportData.nightShiftCount}`],
      [],
      ["MACHINE WISE - DAY SHIFT"],
      ["Machine,Production (M),Efficiency (%),Operator"],
      ...Array.from({ length: 14 }, (_, i) => {
        const data = reportData.dayShiftData.machines[`SP # ${i + 1}`] || { production: 0, efficiency: 0, operator: "N/A", count: 0 };
        return [`SP #${i + 1},${Math.round(data.production)},${data.count > 0 ? Math.round(data.efficiency / data.count) : 0}%,${data.operator}`];
      }),
      [],
      ["MACHINE WISE - NIGHT SHIFT"],
      ["Machine,Production (M),Efficiency (%),Operator"],
      ...Array.from({ length: 14 }, (_, i) => {
        const data = reportData.nightShiftData.machines[`SP # ${i + 1}`] || { production: 0, efficiency: 0, operator: "N/A", count: 0 };
        return [`SP #${i + 1},${Math.round(data.production)},${data.count > 0 ? Math.round(data.efficiency / data.count) : 0}%,${data.operator}`];
      }),
      [],
      ["OVERALL SUMMARY"],
      [`Total Production,${Math.round(reportData.totalProduction)} M`],
      [`Total Weight,${Math.round(reportData.totalWeight)} KG`],
      [`Average Efficiency,${Math.round(reportData.avgEfficiency)}%`],
      [`Total Records,${reportData.recordCount}`],
      [],
      [`Generated on,${new Date().toLocaleString()}`]
    ];

    const csvContent = rows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spiral-report-${filterDate || new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /// ============================================================
  /// PAGINATION HANDLERS
  /// ============================================================
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  /// ============================================================
  /// STATS CARDS DATA - WITH EFFICIENCY COLORS FIXED
  /// ============================================================
  const statCards = [
    { id: "total-records", title: "Total Records", value: stats.totalRecords, icon: FiDatabase, color: isDarkMode ? '#60a5fa' : '#1e40af' },
    { id: "total-production", title: "Total Production", value: `${Math.round(stats.totalProduction)} M`, icon: FiColumns, color: isDarkMode ? '#34d399' : '#059669' },
    { id: "total-weight", title: "Total Weight", value: `${Math.round(stats.totalWeight)} KG`, icon: FiFeather, color: isDarkMode ? '#fbbf24' : '#d97706' },
    { 
      id: "avg-efficiency", 
      title: "Avg Efficiency", 
      value: `${Math.round(stats.avgEfficiency)}%`, 
      icon: FiTrendingUpIcon, 
      color: getEfficiencyColor(stats.avgEfficiency) 
    },
    { id: "today-records", title: "Today's Records", value: stats.todayRecords, icon: FiCalendar, color: isDarkMode ? '#60a5fa' : '#2563eb' },
    { id: "today-production", title: "Today's Production", value: `${Math.round(stats.todayProduction)} M`, icon: FiPackage, color: isDarkMode ? '#60a5fa' : '#1e40af' },
    { id: "today-weight", title: "Today's Weight", value: `${Math.round(stats.todayWeight)} KG`, icon: FiFeather, color: isDarkMode ? '#fbbf24' : '#d97706' },
    { 
      id: "today-avg-efficiency", 
      title: "Today's Avg Efficiency", 
      value: `${Math.round(stats.todayAvgEfficiency)}%`, 
      icon: FiActivity, 
      color: getEfficiencyColor(stats.todayAvgEfficiency) 
    },
  ];

  /// ============================================================
  /// LOADING STATE
  /// ============================================================
  if (loading && records.length === 0) {
    return (
      <div className="full-page-loading">
        <div className="loading-spinner-large" />
        <h3>Loading Spiral Section Data...</h3>
        <p>Fetching records from database</p>
      </div>
    );
  }

  /// ============================================================
  /// MAIN RENDER - JSX
  /// ============================================================
  return (
    <>
      <div className="spiral-page-container">
        {/* ===== MOBILE MENU BUTTON ===== */}
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{ display: window.innerWidth < 768 ? 'flex' : 'none' }}
        >
          <FiMenu size={22} color="white" />
        </button>

        {/* ===== DATABASE CONNECTION ALERT ===== */}
        {!isSupabaseConnected && (
          <div className="database-alert">
            <div className="alert-icon">
              <FiAlertCircle size={18} color="#ef4444" />
            </div>
            <div className="alert-content">
              <strong>Supabase Connection Issue</strong>
              <div>Check your .env file</div>
            </div>
          </div>
        )}

        {/* ===== MOBILE MENU OVERLAY ===== */}
        {showMobileMenu && (
          <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-header">
                <h3>Spiral Section</h3>
                <button onClick={() => setShowMobileMenu(false)} className="mobile-menu-close">×</button>
              </div>
              <div className="mobile-menu-content">
                <button onClick={() => { navigate("/dashboard"); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <div className="mobile-menu-icon"><FiHome size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /></div>
                  <span>Dashboard</span>
                </button>
                <button onClick={() => { navigate("/production"); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <div className="mobile-menu-icon"><FiArrowLeft size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} /></div>
                  <span>Production</span>
                </button>
                <button onClick={() => { navigate("/production-sections/spiral/new"); setShowMobileMenu(false); }} className="mobile-menu-btn-item primary">
                  <div className="mobile-menu-icon"><FiPlus size={16} color="white" /></div>
                  <span>New Entry</span>
                </button>
                <button onClick={() => { navigate("/production-sections/spiral/smart-entry"); setShowMobileMenu(false); }} className="mobile-menu-btn-item primary">
                  <div className="mobile-menu-icon"><FiSmartphone size={16} color="white" /></div>
                  <span>Smart Entry</span>
                </button>
                <button onClick={() => { setShowDashboard(!showDashboard); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <div className="mobile-menu-icon">{showDashboard ? <FiEyeOff size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> : <FiBarChart2 size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />}</div>
                  <span>{showDashboard ? "Hide" : "Dashboard"}</span>
                </button>
                <button onClick={() => { setShowStatsCards(!showStatsCards); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <div className="mobile-menu-icon">{showStatsCards ? <FiEyeOff size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> : <FiLayers size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />}</div>
                  <span>{showStatsCards ? "Hide" : "Stats"}</span>
                </button>
                <button onClick={() => { handleExport(); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <div className="mobile-menu-icon"><FiDownload size={16} color={isDarkMode ? '#34d399' : '#059669'} /></div>
                  <span>Export CSV</span>
                </button>
                <button onClick={() => { fetchData(); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <div className="mobile-menu-icon"><FiRefreshCw size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /></div>
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="spiral-content">
          {/* ===== ACTION BUTTONS ROW ===== */}
          <div className="buttons-row">
            <button onClick={() => navigate("/production-sections/spiral/new")} className="page-btn primary-btn" title="New Entry">
              <FiPlus size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> <span>New Entry</span>
            </button>
            <button onClick={() => navigate("/production-sections/spiral/smart-entry")} className="page-btn smart-entry-btn" title="Smart Entry">
              <FiSmartphone size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} /> <span>Smart Entry</span>
            </button>
            <button onClick={fetchData} disabled={loading} className="page-btn refresh-btn" title="Refresh">
              {loading ? <div className="mini-spinner" /> : <FiRefreshCw size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />} <span>Refresh</span>
            </button>
            <button onClick={() => navigate("/production")} className="page-btn nav-btn" title="Production">
              <FiArrowLeft size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} /> <span>Production</span>
            </button>
            <button onClick={() => setShowDashboard(!showDashboard)} className="page-btn dashboard-btn" title="Toggle Dashboard">
              {showDashboard ? <FiEyeOff size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> : <FiBarChart2 size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />} <span>Dashboard</span>
            </button>
            <button onClick={() => setShowStatsCards(!showStatsCards)} className="page-btn stats-btn" title="Toggle Stats">
              {showStatsCards ? <FiEyeOff size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> : <FiLayers size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />} <span>Stats</span>
            </button>
          </div>

          {/* ===== STATISTICS CARDS ===== */}
          {showStatsCards && (
            <div className="stats-section">
              <div className="section-header">
                <h3>
                  <div className="section-icon">
                    <FiActivity size={20} color="white" />
                  </div>
                  Production Statistics
                </h3>
                <div className="stats-summary">
                  <span className="summary-item">
                    <FiDatabase size={14} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                    Total: {stats.totalRecords}
                  </span>
                  <span className="summary-item">
                    <FiUser size={14} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                    {loggedInUser}
                  </span>
                </div>
              </div>
              <div className="stats-grid">
                {statCards.map((card) => (
                  <div key={card.id} className="stat-card">
                    <div className="stat-header">
                      <div className="stat-icon-title">
                        <div 
                          className="stat-icon-container" 
                          style={{ 
                            background: `${card.color}15`, 
                            borderColor: `${card.color}30` 
                          }}
                        >
                          <card.icon size={20} color={card.color} />
                        </div>
                        <div className="stat-title">{card.title}</div>
                      </div>
                    </div>
                    <div 
                      className="stat-value"
                      style={{ color: card.color }}
                    >
                      {card.value}
                    </div>
                    <div className="stat-footer">
                      <FiDatabase size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} />
                      {card.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== TODAY'S DASHBOARD ===== */}
          {showDashboard && (
            <div className="dashboard-section">
              <div className="section-header">
                <h3>
                  <div className="section-icon">
                    <FiCpu size={20} color="white" />
                  </div>
                  Today's Production Dashboard
                </h3>
                <div className="section-info">
                  <span className="info-item">
                    <FiUser size={14} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                    {loggedInUser}
                  </span>
                  <span className="info-item">
                    <FiDatabase size={14} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                    {stats.todayRecords} records
                  </span>
                </div>
              </div>
              <div className="dashboard-grid">
                {/* Item-wise Card */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <div className="card-icon"><FiPackage size={20} color="white" /></div>
                    <h4>Item-wise Production</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.itemWiseToday).length > 0 ? (
                      Object.entries(stats.itemWiseToday).map(([item, data]) => {
                        const avgEff = data.count > 0 ? data.efficiency / data.count : 0;
                        return (
                          <div key={item} className="item-row">
                            <div className="item-name">
                              <FiPackage size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                              {item}
                            </div>
                            <div className="item-stats">
                              <div className="item-stat">
                                <div className="item-stat-value">{Math.round(data.production)} M</div>
                                <div className="item-stat-label">Production</div>
                              </div>
                              <div className="item-stat">
                                <div className="item-stat-value">{Math.round(data.weight)} KG</div>
                                <div className="item-stat-label">Weight</div>
                              </div>
                              <div className="item-stat">
                                <div 
                                  className="item-stat-value"
                                  style={{ color: getEfficiencyColor(avgEff) }}
                                >
                                  {Math.round(avgEff)}%
                                </div>
                                <div className="item-stat-label">Efficiency</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state">
                        <FiPackage size={28} color={isDarkMode ? '#cbd5e1' : '#334155'} />
                        <h5>No Production Today</h5>
                        <p>No records for today</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Machine-wise Card */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <div className="card-icon"><FiTool size={20} color="white" /></div>
                    <h4>Machine-wise Production</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.machineWiseToday).length > 0 ? (
                      Object.entries(stats.machineWiseToday).map(([machine, data]) => {
                        const avgEff = data.count > 0 ? data.efficiency / data.count : 0;
                        return (
                          <div key={machine} className="machine-row">
                            <div className="machine-name">
                              <FiTool size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                              Machine {machine}
                            </div>
                            <div className="machine-stats">
                              <div className="machine-stat">
                                <div className="machine-stat-value">{Math.round(data.production)} M</div>
                                <div className="machine-stat-label">Production</div>
                              </div>
                              <div className="machine-stat">
                                <div className="machine-stat-value">{Math.round(data.weight)} KG</div>
                                <div className="machine-stat-label">Weight</div>
                              </div>
                              <div className="machine-stat">
                                <div 
                                  className="machine-stat-value"
                                  style={{ color: getEfficiencyColor(avgEff) }}
                                >
                                  {Math.round(avgEff)}%
                                </div>
                                <div className="machine-stat-label">Efficiency</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state">
                        <FiTool size={28} color={isDarkMode ? '#cbd5e1' : '#334155'} />
                        <h5>No Machine Activity</h5>
                        <p>No records for today</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Finished Products Card */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <div className="card-icon"><FiBox size={20} color="white" /></div>
                    <h4>Finished Products</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.finishedProductWiseToday).length > 0 ? (
                      Object.entries(stats.finishedProductWiseToday).map(([product, data]) => {
                        const avgEff = data.count > 0 ? data.efficiency / data.count : 0;
                        return (
                          <div key={product} className="product-row">
                            <div className="product-name">
                              <FiBox size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                              {product}
                            </div>
                            <div className="product-stats">
                              <div className="product-stat">
                                <div className="product-stat-value">{Math.round(data.production)} M</div>
                                <div className="product-stat-label">Production</div>
                              </div>
                              <div className="product-stat">
                                <div className="product-stat-value">{Math.round(data.weight)} KG</div>
                                <div className="product-stat-label">Weight</div>
                              </div>
                              <div className="product-stat">
                                <div 
                                  className="product-stat-value"
                                  style={{ color: getEfficiencyColor(avgEff) }}
                                >
                                  {Math.round(avgEff)}%
                                </div>
                                <div className="product-stat-label">Efficiency</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state">
                        <FiBox size={28} color={isDarkMode ? '#cbd5e1' : '#334155'} />
                        <h5>No Finished Products</h5>
                        <p>No records for today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== FILTERS SECTION - HEIGHT REDUCED, DARK MODE FIXED ===== */}
          <div className="filters-section">
            <div className="filters-container">
              <div className="filters-row">
                <div className="filter-heading">
                  <div className="filter-icon-header">
                    <FiFilter size={13} color="white" />
                  </div>
                  <span>FILTERS</span>
                </div>
                <div className="filter-controls">
                  <div className="filter-item search-box">
                    <div className="filter-input-container">
                      <FiSearch size={12} className="filter-icon" color={isDarkMode ? '#cbd5e1' : '#334155'} />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="filter-input"
                      />
                    </div>
                  </div>
                  <div className="filter-item wire-size">
                    <div className="filter-input-container">
                      <FiZap size={12} className="filter-icon" color={isDarkMode ? '#fbbf24' : '#d97706'} />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All Wire Sizes</option>
                        {wireSizes.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="filter-item date-picker">
                    <div className="filter-input-container">
                      <FiCalendar size={12} className="filter-icon" color={isDarkMode ? '#60a5fa' : '#2563eb'} />
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="filter-date"
                      />
                    </div>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={() => filterDate ? setShowReport(true) : alert("Please select a date")}
                      className="page-btn filter-action-btn"
                    >
                      <FiBarChart2 size={13} color={isDarkMode ? '#60a5fa' : '#1e40af'} />
                      <span>Generate</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterType("");
                        setFilterDate("");
                        setShowReport(false);
                        setCurrentPage(1);
                      }}
                      className="page-btn filter-action-btn secondary"
                    >
                      <FiX size={13} color={isDarkMode ? '#a78bfa' : '#7c3aed'} />
                      <span>Clear</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={() => setShowWhatsAppModal(true)}
                      className="page-btn filter-action-btn success"
                    >
                      <FaWhatsapp size={13} color={isDarkMode ? '#34d399' : '#059669'} />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={handlePrintReport}
                      className="page-btn filter-action-btn print"
                    >
                      <FiPrinter size={13} color={isDarkMode ? '#60a5fa' : '#2563eb'} />
                      <span>Print</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={handleExport}
                      disabled={records.length === 0}
                      className="page-btn filter-action-btn export"
                    >
                      <FiDownload size={13} color={isDarkMode ? '#34d399' : '#059669'} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
                <div className="filter-status-inline">
                  <div className="active-filters-wrapper">
                    <FiFilter size={11} color={isDarkMode ? '#60a5fa' : '#1e40af'} />
                    <span className="active-filters-text">
                      {searchTerm && `"${searchTerm}"`}
                      {filterType && (searchTerm ? " • " : "") + filterType}
                      {filterDate && (searchTerm || filterType ? " • " : "") + filterDate}
                      {!searchTerm && !filterType && !filterDate && "No filters"}
                    </span>
                  </div>
                  <div className="filter-count-wrapper">
                    <FiDatabase size={11} color={isDarkMode ? '#60a5fa' : '#1e40af'} />
                    <span>
                      <span className="filter-count-number">{filteredRecords.length}</span>
                      <span style={{ color: isDarkMode ? '#cbd5e1' : '#334155' }}> / {records.length}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== PRODUCTION REPORT SECTION - FULLY INTEGRATED ===== */}
          {showReport && reportData && reportData.recordCount > 0 && (
            <div className="report-section">
              <div className="report-header">
                <div className="report-title">
                  <h2>
                    <div className="report-icon">
                      <FiBarChart2 />
                    </div>
                    Spiral Section Production Report
                  </h2>
                  <div className="report-info">
                    <div className="report-date">
                      <FiCalendar />
                      {reportData.formattedDate}
                    </div>
                    <div className="report-author">
                      <FiUser />
                      Generated by: <strong>{loggedInUser}</strong>
                    </div>
                  </div>
                </div>
                
                {/* ===== REPORT ACTION BUTTONS ===== */}
                <div className="report-actions">
                  <button 
                    onClick={() => setShowWhatsAppModal(true)} 
                    className="action-btn whatsapp-btn"
                    title="Share via WhatsApp"
                  >
                    <FaWhatsapp />
                    <span>WhatsApp</span>
                  </button>
                  <button 
                    onClick={handlePrintReport} 
                    className="action-btn"
                    title="Print Report"
                  >
                    <FiPrinter />
                    <span>Print</span>
                  </button>
                  <button 
                    onClick={handleExportReport} 
                    className="action-btn"
                    title="Export as CSV"
                  >
                    <FiDownload />
                    <span>Export</span>
                  </button>
                  <button 
                    onClick={() => setShowReport(false)} 
                    className="action-btn close-btn"
                    title="Close Report"
                  >
                    <FiX />
                    <span>Close</span>
                  </button>
                </div>
              </div>

              {/* ===== SHIFT SUMMARY CARDS ===== */}
              <div className="summary-section">
                <h3>Shift-wise Production Summary</h3>
                <div className="shift-cards-container">
                  {/* Day Shift Card */}
                  <div className="shift-card day-shift-card">
                    <div className="shift-card-header">
                      <div className="shift-title">
                        <div className="shift-icon-container">
                          <span className="shift-icon">☀️</span>
                        </div>
                        <div>
                          <h4>Day Shift</h4>
                          <div className="shift-subtitle">Morning Production</div>
                        </div>
                      </div>
                      <div className="shift-badge">
                        {reportData.dayShiftCount} Records
                      </div>
                    </div>
                    <div className="shift-stats">
                      <div className="shift-stat-item">
                        <div className="shift-stat-icon">
                          <FiPackage color={isDarkMode ? '#60a5fa' : '#1e40af'} />
                        </div>
                        <div className="shift-stat-value">
                          {Math.round(reportData.dayShiftData.production)} M
                        </div>
                        <div className="shift-stat-label">Production</div>
                      </div>
                      <div className="shift-stat-item">
                        <div className="shift-stat-icon">
                          <FiFeather color={isDarkMode ? '#fbbf24' : '#d97706'} />
                        </div>
                        <div className="shift-stat-value">
                          {Math.round(reportData.dayShiftData.weight)} KG
                        </div>
                        <div className="shift-stat-label">Weight</div>
                      </div>
                      <div className="shift-stat-item">
                        <div className="shift-stat-icon">
                          <FiTrendingUp color={isDarkMode ? '#fbbf24' : '#d97706'} />
                        </div>
                        <div 
                          className="shift-stat-value"
                          style={{ color: getEfficiencyColor(reportData.dayShiftData.avgEfficiency) }}
                        >
                          {Math.round(reportData.dayShiftData.avgEfficiency)}%
                        </div>
                        <div className="shift-stat-label">Efficiency</div>
                      </div>
                    </div>
                  </div>

                  {/* Night Shift Card */}
                  <div className="shift-card night-shift-card">
                    <div className="shift-card-header">
                      <div className="shift-title">
                        <div className="shift-icon-container">
                          <span className="shift-icon">🌙</span>
                        </div>
                        <div>
                          <h4>Night Shift</h4>
                          <div className="shift-subtitle">Evening Production</div>
                        </div>
                      </div>
                      <div className="shift-badge">
                        {reportData.nightShiftCount} Records
                      </div>
                    </div>
                    <div className="shift-stats">
                      <div className="shift-stat-item">
                        <div className="shift-stat-icon">
                          <FiPackage color={isDarkMode ? '#60a5fa' : '#1e40af'} />
                        </div>
                        <div className="shift-stat-value">
                          {Math.round(reportData.nightShiftData.production)} M
                        </div>
                        <div className="shift-stat-label">Production</div>
                      </div>
                      <div className="shift-stat-item">
                        <div className="shift-stat-icon">
                          <FiFeather color={isDarkMode ? '#fbbf24' : '#d97706'} />
                        </div>
                        <div className="shift-stat-value">
                          {Math.round(reportData.nightShiftData.weight)} KG
                        </div>
                        <div className="shift-stat-label">Weight</div>
                      </div>
                      <div className="shift-stat-item">
                        <div className="shift-stat-icon">
                          <FiTrendingUp color={isDarkMode ? '#fbbf24' : '#d97706'} />
                        </div>
                        <div 
                          className="shift-stat-value"
                          style={{ color: getEfficiencyColor(reportData.nightShiftData.avgEfficiency) }}
                        >
                          {Math.round(reportData.nightShiftData.avgEfficiency)}%
                        </div>
                        <div className="shift-stat-label">Efficiency</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== ITEM-WISE SUMMARY - GRID LAYOUT ===== */}
              {Object.keys(reportData.itemWise).length > 0 && (
                <div className="summary-section">
                  <div className="section-header">
                    <h3>Item-wise Summary</h3>
                    <div className="section-count">
                      {Object.keys(reportData.itemWise).length} Items
                    </div>
                  </div>
                  <div className="items-cards-container">
                    {Object.entries(reportData.itemWise).map(([item, data]) => {
                      const avgEff = data.count > 0 ? data.efficiency / data.count : 0;
                      return (
                        <div key={item} className="item-card">
                          <div className="item-card-header">
                            <div className="item-icon">
                              <FiPackage />
                            </div>
                            <div className="item-name">{item}</div>
                          </div>
                          <div className="item-card-stats">
                            <div className="item-stat">
                              <div className="item-stat-value">
                                {Math.round(data.production)} M
                              </div>
                              <div className="item-stat-label">Production</div>
                            </div>
                            <div className="item-stat">
                              <div className="item-stat-value">
                                {Math.round(data.weight)} KG
                              </div>
                              <div className="item-stat-label">Weight</div>
                            </div>
                            <div className="item-stat">
                              <div 
                                className="item-stat-value"
                                style={{ color: getEfficiencyColor(avgEff) }}
                              >
                                {Math.round(avgEff)}%
                              </div>
                              <div className="item-stat-label">Efficiency</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ===== MACHINE-WISE SUMMARY - DAY SHIFT ===== */}
              <div className="summary-section">
                <h3>Machine-wise Summary - Day Shift</h3>
                <div className="machines-grid">
                  {Array.from({ length: 14 }, (_, i) => {
                    const machineNum = i + 1;
                    const data = reportData.dayShiftData.machines[`SP # ${machineNum}`] || {
                      production: 0,
                      efficiency: 0,
                      operator: "N/A",
                      count: 0,
                    };
                    const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;

                    return (
                      <div key={machineNum} className="machine-card">
                        <div className="machine-card-header">
                          <div className="machine-name">
                            <FiTool color={isDarkMode ? '#60a5fa' : '#1e40af'} /> SP #{machineNum}
                          </div>
                          <div className="machine-operator">
                            <FiUser color={isDarkMode ? '#cbd5e1' : '#334155'} /> {data.operator}
                          </div>
                        </div>
                        <div className="machine-card-stats">
                          <div className="machine-stat">
                            <div className="machine-stat-value">
                              {Math.round(data.production)} M
                            </div>
                            <div className="machine-stat-label">Production</div>
                          </div>
                          <div className="machine-stat">
                            <div 
                              className="machine-stat-value"
                              style={{ color: getEfficiencyColor(efficiency) }}
                            >
                              {efficiency}%
                            </div>
                            <div className="machine-stat-label">Efficiency</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ===== MACHINE-WISE SUMMARY - NIGHT SHIFT ===== */}
              <div className="summary-section">
                <h3>Machine-wise Summary - Night Shift</h3>
                <div className="machines-grid">
                  {Array.from({ length: 14 }, (_, i) => {
                    const machineNum = i + 1;
                    const data = reportData.nightShiftData.machines[`SP # ${machineNum}`] || {
                      production: 0,
                      efficiency: 0,
                      operator: "N/A",
                      count: 0,
                    };
                    const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;

                    return (
                      <div key={machineNum} className="machine-card">
                        <div className="machine-card-header">
                          <div className="machine-name">
                            <FiTool color={isDarkMode ? '#60a5fa' : '#1e40af'} /> SP #{machineNum}
                          </div>
                          <div className="machine-operator">
                            <FiUser color={isDarkMode ? '#cbd5e1' : '#334155'} /> {data.operator}
                          </div>
                        </div>
                        <div className="machine-card-stats">
                          <div className="machine-stat">
                            <div className="machine-stat-value">
                              {Math.round(data.production)} M
                            </div>
                            <div className="machine-stat-label">Production</div>
                          </div>
                          <div className="machine-stat">
                            <div 
                              className="machine-stat-value"
                              style={{ color: getEfficiencyColor(efficiency) }}
                            >
                              {efficiency}%
                            </div>
                            <div className="machine-stat-label">Efficiency</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ===== REPORT SUMMARY - GRADIENT BACKGROUND ===== */}
              <div className="report-summary">
                <h3>Report Summary</h3>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-card-header">
                      <div className="summary-card-icon">
                        <FiPackage />
                      </div>
                      <div className="summary-card-label">Total Production</div>
                    </div>
                    <div className="summary-card-value">
                      {Math.round(reportData.totalProduction)} M
                    </div>
                    <div className="summary-card-note">
                      Target: {Math.round(reportData.totalProduction * 1.2)} M
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-header">
                      <div className="summary-card-icon">
                        <FiFeather />
                      </div>
                      <div className="summary-card-label">Total Weight</div>
                    </div>
                    <div className="summary-card-value">
                      {Math.round(reportData.totalWeight)} KG
                    </div>
                    <div className="summary-card-note">
                      Total weight produced
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-header">
                      <div className="summary-card-icon">
                        <FiTrendingUp />
                      </div>
                      <div className="summary-card-label">Avg Efficiency</div>
                    </div>
                    <div 
                      className="summary-card-value"
                      style={{ color: getEfficiencyColor(reportData.avgEfficiency) }}
                    >
                      {Math.round(reportData.avgEfficiency)}%
                    </div>
                    <div className="summary-card-note">
                      Target: 85%
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-card-header">
                      <div className="summary-card-icon">
                        <FiDatabase />
                      </div>
                      <div className="summary-card-label">Total Records</div>
                    </div>
                    <div className="summary-card-value">
                      {reportData.recordCount}
                    </div>
                    <div className="summary-card-note">
                      Day: {reportData.dayShiftCount} | Night: {reportData.nightShiftCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== REPORT FOOTER ===== */}
              <div className="report-footer">
                <p>
                  Generated on {new Date().toLocaleString()} 
                  <span>•</span>
                  <strong>{loggedInUser}</strong>
                </p>
                <p>
                  Pakistan Wire Industries ERP System
                </p>
              </div>
            </div>
          )}

          {/* ===== RECORDS TABLE - HEIGHT REDUCED, TEXT BIGGER, PRODUCTION DATE & SHIFT TOGETHER ===== */}
          <div className="records-section">
            <div className="section-header">
              <h3>
                <div className="section-icon">
                  <FiDatabase size={18} color="white" />
                </div>
                Spiral Production Records
              </h3>
              <div className="section-info">
                <span className="info-item">
                  <FiDatabase size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                  {records.length}
                </span>
                <span className="info-item">
                  <FiFilter size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                  {filteredRecords.length}
                </span>
                <span className="info-item">
                  <FiHash size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                  {currentPage}/{totalPages}
                </span>
                <span className="info-item">
                  <FiUser size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
                  {loggedInUser}
                </span>
                <div className="database-status">
                  <div className={`status-dot ${isSupabaseConnected ? "connected" : "offline"}`} />
                  <span className="status-text">{isSupabaseConnected ? "On" : "Off"}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <h4>Loading Records</h4>
                <p>Fetching records from database...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-large">
                  <FiColumns size={36} color={isDarkMode ? '#cbd5e1' : '#334155'} />
                </div>
                <h4>No records found</h4>
                <p>{searchTerm || filterDate || filterType ? "No records match your search criteria" : "No production records available"}</p>
                <button onClick={() => navigate("/production-sections/spiral/new")} className="primary-btn large">
                  <FiPlus size={18} /> Create First Record
                </button>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="records-table">
                    <thead>
                      <tr>
                        <th><div className="table-header-content"><FiHash size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><div><div>ID</div><div className="table-subheader">Code</div></div></div></th>
                        <th><div className="table-header-content"><FiPackage size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><div><div>Item</div><div className="table-subheader">Size</div></div></div></th>
                        <th><div className="table-header-content"><FiZap size={12} color={isDarkMode ? '#fbbf24' : '#d97706'} /><div><div>Material</div><div className="table-subheader">Wire</div></div></div></th>
                        <th><div className="table-header-content"><FiBox size={12} color={isDarkMode ? '#34d399' : '#059669'} /><div><div>Product</div><div className="table-subheader">Name</div></div></div></th>
                        <th><div className="table-header-content"><FiTool size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><div><div>Machine</div><div className="table-subheader">ID</div></div></div></th>
                        <th><div className="table-header-content"><FiTrendingUpIcon size={12} color={isDarkMode ? '#34d399' : '#059669'} /><div><div>Prod</div><div className="table-subheader">Target</div></div></div></th>
                        <th><div className="table-header-content"><FiFeather size={12} color={isDarkMode ? '#fbbf24' : '#d97706'} /><div><div>Weight</div><div className="table-subheader">Per M</div></div></div></th>
                        <th><div className="table-header-content"><FiPercent size={12} color={isDarkMode ? '#f87171' : '#dc2626'} /><div><div>Eff</div><div className="table-subheader">Tgt</div></div></div></th>
                        <th><div className="table-header-content"><FiUser size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><div>Operator</div></div></th>
                        <th><div className="table-header-content"><FiUser size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><div>User</div></div></th>
                        <th><div className="table-header-content"><FiClock size={12} color={isDarkMode ? '#60a5fa' : '#2563eb'} /><div><div>Prod Date</div><div className="table-subheader">Shift</div></div></div></th>
                        <th><div className="table-header-content"><FiMessageSquare size={12} color={isDarkMode ? '#93c5fd' : '#2563eb'} /><div><div>Remarks</div><div className="table-subheader">View</div></div></div></th>
                        <th><div className="table-header-content"><FiCalendar size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><div><div>Created</div><div className="table-subheader">Time</div></div></div></th>
                        <th><div className="table-header-content"><FiSettings size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><div>Actions</div></div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((record, index) => {
                        const efficiency = parseFloat(record.efficiency) || 0;
                        const targetEfficiency = parseFloat(record.target_efficiency) || 85;
                        const productionDate = record.production_date 
                          ? new Date(record.production_date).toLocaleDateString("en-GB") 
                          : "—";
                        const shiftName = record.shift_name || "—";
                        const remarks = record.remarks || "";
                        const hasRemarks = remarks.trim().length > 0;
                        
                        return (
                          <tr key={record.id} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                            <td><div className="table-cell-content"><div className="record-id">#{record.id}</div>{record.item_code && <div className="record-code"><FiCode size={10} color={isDarkMode ? '#cbd5e1' : '#334155'} /> {record.item_code.substring(0,3)}</div>}</div></td>
                            <td><div className="table-cell-content"><div className="cell-header"><FiPackage size={14} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><span className="cell-value">{record.item_name?.substring(0,12) || "—"}</span></div><div className="cell-detail">{record.raw_material_flatsize?.substring(0,8) || "—"}</div></div></td>
                            <td><div className="table-cell-content"><div className="cell-value">{record.material_type?.substring(0,8) || "—"}</div><div className="cell-detail"><FiZap size={10} color={isDarkMode ? '#fbbf24' : '#d97706'} /> {record.wire_size?.substring(0,8) || "—"}</div></div></td>
                            <td><div className="table-cell-content"><div className="cell-value">{record.finishedproductname?.substring(0,12) || "—"}</div></div></td>
                            <td><div className="table-cell-content"><div className="cell-header"><FiTool size={14} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><span className="cell-value">{record.machine_no?.substring(0,8) || "—"}</span></div><div className="cell-detail">{record.machine_id?.substring(0,6) || "—"}</div></div></td>
                            <td><div className="table-cell-content"><div className="production-value">{Math.round(parseFloat(record.production_quantity || 0))}<span className="unit">M</span></div><div className="cell-detail"><FiTarget size={10} color={isDarkMode ? '#cbd5e1' : '#334155'} /> {Math.round(parseFloat(record.target_quantity || record.production_quantity * 1.2))}</div></div></td>
                            <td><div className="table-cell-content"><div className="production-value">{Math.round(parseFloat(record.weight || 0))}<span className="unit">KG</span></div><div className="cell-detail">{Math.round(parseFloat(record.per_meter_wt || 0))} KG</div></div></td>
                            <td>
                              <div className="table-cell-content">
                                <div 
                                  className={`efficiency-badge ${getEfficiencyClass(efficiency)}`}
                                  style={{ 
                                    backgroundColor: `${getEfficiencyColor(efficiency)}15`,
                                    color: getEfficiencyColor(efficiency),
                                    borderColor: `${getEfficiencyColor(efficiency)}30`
                                  }}
                                >
                                  <FiPercent size={10} />
                                  {Math.round(efficiency)}%
                                </div>
                                <div className="cell-detail" style={{ color: isDarkMode ? '#cbd5e1' : '#334155' }}>
                                  <FiTarget size={10} /> 
                                  {Math.round(targetEfficiency)}%
                                </div>
                              </div>
                            </td>
                            <td><div className="table-cell-content"><div className="cell-header"><FiUser size={14} color={isDarkMode ? '#cbd5e1' : '#334155'} /><span className="cell-value">{record.operator_name?.substring(0,10) || "—"}</span></div></div></td>
                            <td><div className="table-cell-content"><div className="cell-value">{record.users_name?.substring(0,8) || "—"}</div></div></td>
                            <td>
                              <div className="table-cell-content">
                                <div className="cell-value" style={{ fontWeight: 600, color: isDarkMode ? '#60a5fa' : '#1e40af' }}>{productionDate}</div>
                                <div className="cell-detail" style={{ color: shiftName.includes('Day') || shiftName.includes('Morning') ? (isDarkMode ? '#fbbf24' : '#d97706') : (isDarkMode ? '#60a5fa' : '#2563eb') }}>
                                  <FiClock size={10} /> {shiftName}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="remarks-cell">
                                {hasRemarks ? (
                                  <>
                                    <span className="remarks-text" style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }}>
                                      {remarks.length > 18 ? `${remarks.substring(0, 18)}...` : remarks}
                                    </span>
                                    <button 
                                      onClick={() => openRemarksModal(remarks, record.id)}
                                      className="remarks-view-btn"
                                      title="View full remarks"
                                    >
                                      <FiEye size={12} color={isDarkMode ? '#93c5fd' : '#2563eb'} />
                                    </button>
                                  </>
                                ) : (
                                  <span className="remarks-text" style={{ color: isDarkMode ? '#cbd5e1' : '#334155' }}>—</span>
                                )}
                              </div>
                            </td>
                            <td><div className="table-cell-content"><div className="cell-value">{new Date(record.created_at).toLocaleDateString("en-GB")}</div><div className="cell-detail">{new Date(record.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></div></td>
                            <td><div className="action-buttons">
                              <button onClick={() => handleView(record.id)} className="action-btn view-btn" title="View"><FiEye size={12} color={isDarkMode ? '#60a5fa' : '#2563eb'} /></button>
                              <button onClick={() => handleEdit(record.id)} className="action-btn edit-btn" title="Edit"><FiEdit size={12} color={isDarkMode ? '#34d399' : '#059669'} /></button>
                              <button onClick={() => handleDelete(record.id)} className="action-btn delete-btn" title="Delete"><FiTrash2 size={12} color={isDarkMode ? '#f87171' : '#dc2626'} /></button>
                            </div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ===== PAGINATION ===== */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <div className="pagination-info">
                      {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}/{filteredRecords.length}
                    </div>
                    <div className="pagination-controls">
                      <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-btn">
                        <FiChevronLeft size={12} />
                      </button>
                      <div className="page-numbers">
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 3) pageNum = i + 1;
                          else if (currentPage <= 2) pageNum = i + 1;
                          else if (currentPage >= totalPages - 1) pageNum = totalPages - 2 + i;
                          else pageNum = currentPage - 1 + i;
                          return (
                            <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}>
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-btn">
                        <FiChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ===== BOTTOM INFO BAR ===== */}
        <div className="bottom-info-bar">
          <div className="info-left">
            <span className="info-item">
              <FiDatabase size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
              {stats.totalRecords}
            </span>
            <span className="info-item">
              <FiUser size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
              {loggedInUser}
            </span>
            <span className="info-item">
              <FiClock size={12} color={isDarkMode ? '#60a5fa' : '#2563eb'} /> 
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="info-right">
            <span className="info-item">
              <FiPackage size={12} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> 
              {Math.round(stats.totalProduction)}M
            </span>
            <span className="info-item">
              <FiFeather size={12} color={isDarkMode ? '#fbbf24' : '#d97706'} /> 
              {Math.round(stats.totalWeight)}KG
            </span>
            <span className="info-item">
              <FiPercent 
                size={12} 
                color={getEfficiencyColor(stats.avgEfficiency)} 
              />
              <span style={{ color: getEfficiencyColor(stats.avgEfficiency) }}>
                {Math.round(stats.avgEfficiency)}%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ===== MOBILE BOTTOM FIXED BUTTONS ===== */}
      {window.innerWidth < 768 && (
        <div className="mobile-fixed-bottom">
          <button onClick={() => navigate("/production-sections/spiral/new")} className="page-btn primary-btn">
            <FiPlus size={16} /> <span>New</span>
          </button>
          <button onClick={() => navigate("/production-sections/spiral/smart")} className="page-btn smart-entry-btn">
            <FiSmartphone size={16} /> <span>Smart</span>
          </button>
          <button onClick={fetchData} disabled={loading} className="page-btn refresh-btn">
            {loading ? <div className="mini-spinner" style={{ width: '16px', height: '16px' }} /> : <FiRefreshCw size={16} />} <span>Sync</span>
          </button>
          <button onClick={() => navigate("/production")} className="page-btn nav-btn">
            <FiArrowLeft size={16} /> <span>Back</span>
          </button>
        </div>
      )}

      {/* ===== WHATSAPP MODAL ===== */}
      {showWhatsAppModal && <WhatsAppModal />}
      
      {/* ===== REMARKS MODAL ===== */}
      {showRemarksModal && <RemarksModal />}
    </>
  );
};

export default SpiralPage;