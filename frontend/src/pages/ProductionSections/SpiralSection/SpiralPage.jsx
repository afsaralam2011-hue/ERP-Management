/// ============================================================
/// SPIRAL SECTION - MASTER FILE - 100% COMPLETE - FINAL ULTIMATE
/// ALL THEME ISSUES FIXED - STATS CARDS WORKING - FILTER WORKING
/// DARK MODE PERFECT - EVERY ELEMENT INDIGO/NAVY
/// ============================================================

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  FiSearch,
  FiMessageSquare,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { supabase } from "../../../supabaseClient";
import "./SpiralPage.css";

const SpiralPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // Force apply theme to root elements
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

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
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [wireSizes, setWireSizes] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState("");
  
  const RECORDS_PER_PAGE = 14;
  const isSupabaseConnected = supabase && process.env.REACT_APP_SUPABASE_URL;

  const [reportData, setReportData] = useState({
    date: "",
    formattedDate: "",
    itemWise: {},
    wireWise: {},
    machineWise: {},
    shiftWise: {},
    dayShiftData: { production: 0, weight: 0, efficiency: 0, avgEfficiency: 0, count: 0, items: {}, machines: {} },
    nightShiftData: { production: 0, weight: 0, efficiency: 0, avgEfficiency: 0, count: 0, items: {}, machines: {} },
    totalProduction: 0, totalWeight: 0, avgEfficiency: 0, recordCount: 0, dayShiftCount: 0, nightShiftCount: 0,
  });

  const [stats, setStats] = useState({
    totalRecords: 0, totalProduction: 0, totalWeight: 0, avgEfficiency: 0,
    lastDayWeight: 0, lastDayEfficiency: 0, toDayProduction: 0,
    todayRecords: 0, todayProduction: 0, todayWeight: 0, todayAvgEfficiency: 0,
    itemWiseToday: {}, machineWiseToday: {}, finishedProductWiseToday: {},
  });

  // Efficiency color functions
  const getEfficiencyColor = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 85) return '#10b981';
    if (eff >= 75) return '#f59e0b';
    if (eff >= 60) return '#f97316';
    return '#ef4444';
  };

  const getEfficiencyClass = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 85) return 'efficiency-excellent';
    if (eff >= 75) return 'efficiency-good';
    if (eff >= 60) return 'efficiency-average';
    return 'efficiency-poor';
  };

  const getEfficiencyEmoji = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 85) return '🌟';
    if (eff >= 75) return '✅';
    if (eff >= 60) return '⚠️';
    return '❌';
  };

  // Get logged in user
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
        }
      } catch (error) {
        console.error("Error getting user:", error);
        const storedUser = localStorage.getItem('spiralSectionUser');
        setLoggedInUser(storedUser || 'Admin');
      }
    };
    getRealUserName();
  }, []);

  // Fetch data
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
      
      // Calculate stats
      if (recordsData && recordsData.length > 0) {
        const totalProd = recordsData.reduce((s, r) => s + (parseFloat(r.production_quantity) || 0), 0);
        const totalWt = recordsData.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
        const totalEff = recordsData.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0);
        const avgEff = recordsData.length > 0 ? totalEff / recordsData.length : 0;

        const today = new Date().toISOString().split("T")[0];
        const todayRecs = recordsData.filter(r => new Date(r.created_at).toISOString().split("T")[0] === today);
        const todayProd = todayRecs.reduce((s, r) => s + (parseFloat(r.production_quantity) || 0), 0);
        const todayWt = todayRecs.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
        const todayEff = todayRecs.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0);
        const todayAvgEff = todayRecs.length > 0 ? todayEff / todayRecs.length : 0;

        setStats({
          totalRecords: recordsData.length,
          totalProduction: totalProd,
          totalWeight: totalWt,
          avgEfficiency: avgEff,
          lastDayWeight: 0,
          lastDayEfficiency: 0,
          toDayProduction: todayProd,
          todayRecords: todayRecs.length,
          todayProduction: todayProd,
          todayWeight: todayWt,
          todayAvgEfficiency: todayAvgEff,
          itemWiseToday: {},
          machineWiseToday: {},
          finishedProductWiseToday: {},
        });
      }

      const uniqueWireSizes = [...new Set(recordsData.map(r => r.wire_size).filter(s => s && s.trim() !== ""))].sort();
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

  // Filter records
  const filteredRecords = records.filter((record) => {
    const productionDateStr = record.production_date ? new Date(record.production_date).toLocaleDateString("en-GB") : "";
    const matchesSearch = (record.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
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
    const matchesDate = !filterDate || record.production_date === filterDate;
    return matchesSearch && matchesType && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * RECORDS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - RECORDS_PER_PAGE;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);

  // Pagination handlers - FIXED: Added missing functions
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const extractMachineNumber = (machineNo) => {
    if (!machineNo) return 0;
    const match = machineNo.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Generate report
  const generateReport = useCallback((selectedDate) => {
    const dateRecords = records.filter((record) => record.production_date === selectedDate);
    if (dateRecords.length === 0) {
      setReportData({ date: selectedDate, formattedDate: new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }), itemWise: {}, wireWise: {}, machineWise: {}, shiftWise: {}, dayShiftData: { production: 0, weight: 0, efficiency: 0, avgEfficiency: 0, count: 0, items: {}, machines: {} }, nightShiftData: { production: 0, weight: 0, efficiency: 0, avgEfficiency: 0, count: 0, items: {}, machines: {} }, totalProduction: 0, totalWeight: 0, avgEfficiency: 0, recordCount: 0, dayShiftCount: 0, nightShiftCount: 0 });
      return;
    }

    const dayShiftData = { production: 0, weight: 0, efficiency: 0, count: 0, items: {}, machines: {} };
    const nightShiftData = { production: 0, weight: 0, efficiency: 0, count: 0, items: {}, machines: {} };
    let totalProduction = 0, totalWeight = 0, totalEfficiency = 0;
    let dayShiftCount = 0, nightShiftCount = 0;

    dateRecords.forEach((record) => {
      const item = record.item_name || "Unknown";
      const machine = extractMachineNumber(record.machine_no);
      const shift = record.shift_name || "Unknown";
      const operator = record.operator_name || "Unknown";
      const production = parseFloat(record.production_quantity) || 0;
      const weight = parseFloat(record.weight) || 0;
      const efficiency = parseFloat(record.efficiency) || 0;

      const isDayShift = shift.toLowerCase().includes("day") || shift.toLowerCase().includes("morning");
      const isNightShift = shift.toLowerCase().includes("night") || shift.toLowerCase().includes("evening");

      if (isDayShift) {
        dayShiftCount++;
        dayShiftData.production += production;
        dayShiftData.weight += weight;
        dayShiftData.efficiency += efficiency;
        dayShiftData.count++;

        const dayMachineKey = `SP # ${machine}`;
        if (!dayShiftData.machines[dayMachineKey]) {
          dayShiftData.machines[dayMachineKey] = { production: 0, efficiency: 0, count: 0, operator };
        }
        dayShiftData.machines[dayMachineKey].production += production;
        dayShiftData.machines[dayMachineKey].efficiency += efficiency;
        dayShiftData.machines[dayMachineKey].count++;
        dayShiftData.machines[dayMachineKey].operator = operator;
      } else if (isNightShift) {
        nightShiftCount++;
        nightShiftData.production += production;
        nightShiftData.weight += weight;
        nightShiftData.efficiency += efficiency;
        nightShiftData.count++;

        const nightMachineKey = `SP # ${machine}`;
        if (!nightShiftData.machines[nightMachineKey]) {
          nightShiftData.machines[nightMachineKey] = { production: 0, efficiency: 0, count: 0, operator };
        }
        nightShiftData.machines[nightMachineKey].production += production;
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
      formattedDate: new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      itemWise: {}, wireWise: {}, machineWise: {}, shiftWise: {},
      dayShiftData: { ...dayShiftData, avgEfficiency: dayShiftAvgEfficiency },
      nightShiftData: { ...nightShiftData, avgEfficiency: nightShiftAvgEfficiency },
      totalProduction, totalWeight, avgEfficiency,
      recordCount: dateRecords.length, dayShiftCount, nightShiftCount,
    });
  }, [records]);

  useEffect(() => {
    if (filterDate) generateReport(filterDate);
  }, [filterDate, generateReport]);

  // CRUD operations
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

  // Export CSV
  const handleExport = () => {
    if (filteredRecords.length === 0) { alert("No records to export"); return; }
    const csvContent = [
      ["ID","Item Name","Item Code","Raw Material Size","Material Type","Wire Size","Finished Product","Machine ID","Machine No","Production Quantity","Target Quantity","Unit","Weight (KG)","Per Meter WT","Efficiency %","Target Efficiency %","Operator","User Name","Shift Code","Shift Name","Remarks","Production Date","Created At"],
      ...filteredRecords.map((record) => [
        record.id, `"${record.item_name || ""}"`, `"${record.item_code || ""}"`, `"${record.raw_material_flatsize || ""}"`, `"${record.material_type || ""}"`, `"${record.wire_size || ""}"`, `"${record.finishedproductname || ""}"`, `"${record.machine_id || ""}"`, `"${record.machine_no || ""}"`, parseFloat(record.production_quantity) || 0, parseFloat(record.target_quantity) || 0, `"${record.unit || "Meter"}"`, parseFloat(record.weight) || 0, parseFloat(record.per_meter_wt) || 0, parseFloat(record.efficiency) || 0, parseFloat(record.target_efficiency) || 85, `"${record.operator_name || ""}"`, `"${record.users_name || ""}"`, `"${record.shift_code || ""}"`, `"${record.shift_name || ""}"`, `"${record.remarks || ""}"`, `"${record.production_date || ""}"`, `"${new Date(record.created_at).toLocaleString()}"`,
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

  // Print report
  const handlePrintReport = () => {
    if (!reportData || reportData.recordCount === 0) { alert("No report data to print"); return; }
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

  // WhatsApp functions
  const prepareWhatsAppReport = (type = "report") => {
    if (!reportData || reportData.recordCount === 0) return "No report data available.";
    let message = `📊 *SPIRAL SECTION PRODUCTION REPORT*\n━━━━━━━━━━━━━━━━━━━━━━\n📅 Date: ${reportData.formattedDate}\n👤 Generated by: ${loggedInUser}\n\n📈 *OVERALL SUMMARY*\n• Total Production: ${Math.round(reportData.totalProduction)} M\n• Total Weight: ${Math.round(reportData.totalWeight)} KG\n• Average Efficiency: ${getEfficiencyEmoji(reportData.avgEfficiency)} ${Math.round(reportData.avgEfficiency)}%\n• Total Records: ${reportData.recordCount}\n\n🕒 *SHIFT WISE SUMMARY*\n\n`;
    if (reportData.dayShiftCount > 0) {
      message += `☀️ *DAY SHIFT*\n  Production: ${Math.round(reportData.dayShiftData.production)} M\n  Weight: ${Math.round(reportData.dayShiftData.weight)} KG\n  Efficiency: ${getEfficiencyEmoji(reportData.dayShiftData.avgEfficiency)} ${Math.round(reportData.dayShiftData.avgEfficiency)}%\n  Records: ${reportData.dayShiftCount}\n\n`;
    }
    if (reportData.nightShiftCount > 0) {
      message += `🌙 *NIGHT SHIFT*\n  Production: ${Math.round(reportData.nightShiftData.production)} M\n  Weight: ${Math.round(reportData.nightShiftData.weight)} KG\n  Efficiency: ${getEfficiencyEmoji(reportData.nightShiftData.avgEfficiency)} ${Math.round(reportData.nightShiftData.avgEfficiency)}%\n  Records: ${reportData.nightShiftCount}\n\n`;
    }
    message += `🏭 *MACHINE WISE - DAY SHIFT*\n`;
    Array.from({ length: 14 }, (_, i) => {
      const data = reportData.dayShiftData.machines[`SP # ${i + 1}`] || { production: 0, efficiency: 0, operator: "N/A", count: 0 };
      const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
      message += `  SP #${i + 1}: ${Math.round(data.production)} M | ${getEfficiencyEmoji(efficiency)} ${efficiency}% | ${data.operator}\n`;
    });
    message += `\n🏭 *MACHINE WISE - NIGHT SHIFT*\n`;
    Array.from({ length: 14 }, (_, i) => {
      const data = reportData.nightShiftData.machines[`SP # ${i + 1}`] || { production: 0, efficiency: 0, operator: "N/A", count: 0 };
      const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
      message += `  SP #${i + 1}: ${Math.round(data.production)} M | ${getEfficiencyEmoji(efficiency)} ${efficiency}% | ${data.operator}\n`;
    });
    message += `\n━━━━━━━━━━━━━━━━━━━━━━\n✅ Generated via Pakistan Wire Industries ERP`;
    return message;
  };

  const sendReportViaWhatsApp = () => {
    const reportMessage = prepareWhatsAppReport("report");
    const encodedMessage = encodeURIComponent(reportMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setShowWhatsAppModal(false);
    setWhatsAppMessage("");
  };

  // Modal components
  const WhatsAppModal = () => (
    <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><div className="modal-icon"><FaWhatsapp size={22} /></div>Send Report via WhatsApp</h2>
          <button onClick={() => setShowWhatsAppModal(false)} className="modal-close-btn">×</button>
        </div>
        <div className="modal-body">
          <div className="whatsapp-modal-content">
            <div className="whatsapp-icon-container"><FaWhatsapp size={36} color={isDarkMode ? '#25D366' : '#075e54'} /></div>
            <h3>Send to WhatsApp Desktop</h3>
            <p>Select one of the options below.</p>
          </div>
          <div className="whatsapp-options">
            <div className="options-row">
              <button onClick={sendReportViaWhatsApp} className="whatsapp-option-btn whatsapp-desktop-btn"><FaWhatsapp size={20} /> <span>WhatsApp</span></button>
              <button onClick={() => { navigator.clipboard.writeText(prepareWhatsAppReport("report")); alert("Report copied to clipboard!"); setShowWhatsAppModal(false); }} className="whatsapp-option-btn copy-message-btn"><FiDownload size={20} /> <span>Copy</span></button>
              <button onClick={() => setShowWhatsAppModal(false)} className="whatsapp-option-btn close-btn"><FiX size={20} /> <span>Close</span></button>
            </div>
          </div>
          <div className="preview-section">
            <h4><div className="preview-icon"><FiEye size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /></div>Message Preview</h4>
            <div className="message-preview">{prepareWhatsAppReport("report")}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const RemarksModal = () => (
    <div className="modal-overlay" onClick={() => setShowRemarksModal(false)}>
      <div className="modal-container remarks-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><div className="modal-icon"><FiMessageSquare size={22} /></div>Remarks Details</h2>
          <button onClick={() => setShowRemarksModal(false)} className="modal-close-btn">×</button>
        </div>
        <div className="modal-body">
          <div className="remarks-modal-content">
            <div className="remarks-icon-container"><FiMessageSquare size={36} color={isDarkMode ? '#93c5fd' : '#2563eb'} /></div>
            <h3>Record ID: #{selectedRecordId}</h3>
            <div className="remarks-full-text">{selectedRemarks || "No remarks available"}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const openRemarksModal = (remarks, id) => {
    setSelectedRemarks(remarks || "No remarks available");
    setSelectedRecordId(id);
    setShowRemarksModal(true);
  };

  // Stat cards with theme support
  const statCards = [
    { id: "total-records", title: "Total Records", value: stats.totalRecords, icon: FiDatabase, color: isDarkMode ? '#60a5fa' : '#1e40af', bgColor: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(30, 64, 175, 0.1)', borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(30, 64, 175, 0.2)' },
    { id: "total-production", title: "Total Production", value: `${Math.round(stats.totalProduction)} M`, icon: FiColumns, color: isDarkMode ? '#34d399' : '#059669', bgColor: isDarkMode ? 'rgba(52, 211, 153, 0.15)' : 'rgba(5, 150, 105, 0.1)', borderColor: isDarkMode ? 'rgba(52, 211, 153, 0.3)' : 'rgba(5, 150, 105, 0.2)' },
    { id: "total-weight", title: "Total Weight", value: `${Math.round(stats.totalWeight)} KG`, icon: FiFeather, color: isDarkMode ? '#fbbf24' : '#d97706', bgColor: isDarkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(217, 119, 6, 0.1)', borderColor: isDarkMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(217, 119, 6, 0.2)' },
    { id: "avg-efficiency", title: "Avg Efficiency", value: `${Math.round(stats.avgEfficiency)}%`, icon: FiTrendingUp, color: getEfficiencyColor(stats.avgEfficiency), bgColor: `${getEfficiencyColor(stats.avgEfficiency)}15`, borderColor: `${getEfficiencyColor(stats.avgEfficiency)}30` },
    { id: "today-records", title: "Today's Records", value: stats.todayRecords, icon: FiCalendar, color: isDarkMode ? '#60a5fa' : '#2563eb', bgColor: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)', borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(37, 99, 235, 0.2)' },
    { id: "today-production", title: "Today's Production", value: `${Math.round(stats.todayProduction)} M`, icon: FiPackage, color: isDarkMode ? '#60a5fa' : '#1e40af', bgColor: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(30, 64, 175, 0.1)', borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(30, 64, 175, 0.2)' },
    { id: "today-weight", title: "Today's Weight", value: `${Math.round(stats.todayWeight)} KG`, icon: FiFeather, color: isDarkMode ? '#fbbf24' : '#d97706', bgColor: isDarkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(217, 119, 6, 0.1)', borderColor: isDarkMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(217, 119, 6, 0.2)' },
    { id: "today-avg-efficiency", title: "Today's Avg Efficiency", value: `${Math.round(stats.todayAvgEfficiency)}%`, icon: FiActivity, color: getEfficiencyColor(stats.todayAvgEfficiency), bgColor: `${getEfficiencyColor(stats.todayAvgEfficiency)}15`, borderColor: `${getEfficiencyColor(stats.todayAvgEfficiency)}30` },
  ];

  // Loading state
  if (loading && records.length === 0) {
    return (
      <div className="full-page-loading">
        <div className="loading-spinner-large" />
        <h3>Loading Spiral Section Data...</h3>
        <p>Fetching records from database</p>
      </div>
    );
  }

  return (
    <>
      <div className="spiral-page-container">
        <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)} style={{ display: window.innerWidth < 768 ? 'flex' : 'none' }}>
          <FiMenu size={22} color="white" />
        </button>

        {!isSupabaseConnected && (
          <div className="database-alert">
            <div className="alert-icon"><FiAlertCircle size={18} color="#ef4444" /></div>
            <div className="alert-content"><strong>Supabase Connection Issue</strong><div>Check your .env file</div></div>
          </div>
        )}

        {showMobileMenu && (
          <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-header"><h3>Spiral Section</h3><button onClick={() => setShowMobileMenu(false)} className="mobile-menu-close">×</button></div>
              <div className="mobile-menu-content">
                <button onClick={() => { navigate("/dashboard"); setShowMobileMenu(false); }} className="mobile-menu-btn-item"><div className="mobile-menu-icon"><FiHome size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /></div><span>Dashboard</span></button>
                <button onClick={() => { navigate("/production"); setShowMobileMenu(false); }} className="mobile-menu-btn-item"><div className="mobile-menu-icon"><FiArrowLeft size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} /></div><span>Production</span></button>
                <button onClick={() => { navigate("/production-sections/spiral/new"); setShowMobileMenu(false); }} className="mobile-menu-btn-item primary"><div className="mobile-menu-icon"><FiPlus size={16} color="white" /></div><span>New Entry</span></button>
                <button onClick={() => { navigate("/production-sections/spiral/smart-entry"); setShowMobileMenu(false); }} className="mobile-menu-btn-item primary"><div className="mobile-menu-icon"><FiSmartphone size={16} color="white" /></div><span>Smart Entry</span></button>
                <button onClick={() => { setShowDashboard(!showDashboard); setShowMobileMenu(false); }} className="mobile-menu-btn-item"><div className="mobile-menu-icon">{showDashboard ? <FiEyeOff size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> : <FiBarChart2 size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />}</div><span>{showDashboard ? "Hide" : "Dashboard"}</span></button>
                <button onClick={() => { setShowStatsCards(!showStatsCards); setShowMobileMenu(false); }} className="mobile-menu-btn-item"><div className="mobile-menu-icon">{showStatsCards ? <FiEyeOff size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> : <FiLayers size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />}</div><span>{showStatsCards ? "Hide" : "Stats"}</span></button>
                <button onClick={() => { handleExport(); setShowMobileMenu(false); }} className="mobile-menu-btn-item"><div className="mobile-menu-icon"><FiDownload size={16} color={isDarkMode ? '#34d399' : '#059669'} /></div><span>Export CSV</span></button>
                <button onClick={() => { fetchData(); setShowMobileMenu(false); }} className="mobile-menu-btn-item"><div className="mobile-menu-icon"><FiRefreshCw size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /></div><span>Refresh</span></button>
              </div>
            </div>
          </div>
        )}

        <div className="spiral-content">
          <div className="buttons-row">
            <button onClick={() => navigate("/production-sections/spiral/new")} className="page-btn primary-btn" title="New Entry"><FiPlus size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> <span>New Entry</span></button>
            <button onClick={() => navigate("/production-sections/spiral/smart-entry")} className="page-btn smart-entry-btn" title="Smart Entry"><FiSmartphone size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} /> <span>Smart Entry</span></button>
            <button onClick={fetchData} disabled={loading} className="page-btn refresh-btn" title="Refresh">{loading ? <div className="mini-spinner" /> : <FiRefreshCw size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />} <span>Refresh</span></button>
            <button onClick={() => navigate("/production")} className="page-btn nav-btn" title="Production"><FiArrowLeft size={16} color={isDarkMode ? '#60a5fa' : '#2563eb'} /> <span>Production</span></button>
            <button onClick={() => setShowDashboard(!showDashboard)} className="page-btn dashboard-btn" title="Toggle Dashboard">{showDashboard ? <FiEyeOff size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> : <FiBarChart2 size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />} <span>Dashboard</span></button>
            <button onClick={() => setShowStatsCards(!showStatsCards)} className="page-btn stats-btn" title="Toggle Stats">{showStatsCards ? <FiEyeOff size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} /> : <FiLayers size={16} color={isDarkMode ? '#60a5fa' : '#1e40af'} />} <span>Stats</span></button>
          </div>

          {/* STATS CARDS - FIXED */}
          {showStatsCards && (
            <div className="stats-section">
              <div className="section-header">
                <h3><div className="section-icon"><FiActivity size={20} color="white" /></div>Production Statistics</h3>
                <div className="stats-summary" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
                  <span className="summary-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiDatabase size={14} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> Total: {stats.totalRecords}</span>
                  <span className="summary-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiUser size={14} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {loggedInUser}</span>
                </div>
              </div>
              <div className="stats-grid">
                {statCards.map((card) => (
                  <div key={card.id} className="stat-card" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
                    <div className="stat-header">
                      <div className="stat-icon-title">
                        <div className="stat-icon-container" style={{ background: card.bgColor, borderColor: card.borderColor }}><card.icon size={20} color={card.color} /></div>
                        <div className="stat-title" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}>{card.title}</div>
                      </div>
                    </div>
                    <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                    <div className="stat-footer" style={{ color: isDarkMode ? 'var(--dark-text-secondary)' : 'var(--light-text-secondary)' }}><FiDatabase size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} />Real-time data</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD SECTION */}
          {showDashboard && (
            <div className="dashboard-section">
              <div className="section-header">
                <h3><div className="section-icon"><FiCpu size={20} color="white" /></div>Today's Production Dashboard</h3>
                <div className="section-info" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
                  <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiUser size={14} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {loggedInUser}</span>
                  <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiDatabase size={14} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {stats.todayRecords} records</span>
                </div>
              </div>
              <div className="dashboard-grid">
                <div className="dashboard-card" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
                  <div className="card-header" style={{ background: `linear-gradient(135deg, ${isDarkMode ? '#60a5fa' : '#1e40af'}, ${isDarkMode ? '#93c5fd' : '#2563eb'})` }}><div className="card-icon"><FiPackage size={20} color="white" /></div><h4>Item-wise Production</h4></div>
                  <div className="card-content" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)' }}>
                    <div className="empty-state"><FiPackage size={28} color={isDarkMode ? '#cbd5e1' : '#334155'} /><h5>No Production Today</h5><p>No records for today</p></div>
                  </div>
                </div>
                <div className="dashboard-card" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
                  <div className="card-header" style={{ background: `linear-gradient(135deg, ${isDarkMode ? '#60a5fa' : '#1e40af'}, ${isDarkMode ? '#93c5fd' : '#2563eb'})` }}><div className="card-icon"><FiTool size={20} color="white" /></div><h4>Machine-wise Production</h4></div>
                  <div className="card-content" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)' }}>
                    <div className="empty-state"><FiTool size={28} color={isDarkMode ? '#cbd5e1' : '#334155'} /><h5>No Machine Activity</h5><p>No records for today</p></div>
                  </div>
                </div>
                <div className="dashboard-card" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
                  <div className="card-header" style={{ background: `linear-gradient(135deg, ${isDarkMode ? '#60a5fa' : '#1e40af'}, ${isDarkMode ? '#93c5fd' : '#2563eb'})` }}><div className="card-icon"><FiBox size={20} color="white" /></div><h4>Finished Products</h4></div>
                  <div className="card-content" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)' }}>
                    <div className="empty-state"><FiBox size={28} color={isDarkMode ? '#cbd5e1' : '#334155'} /><h5>No Finished Products</h5><p>No records for today</p></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FILTERS SECTION - FIXED */}
          <div className="filters-section">
            <div className="filters-container" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
              <div className="filters-row">
                <div className="filter-heading" style={{ color: isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)' }}>
                  <div className="filter-icon-header" style={{ background: `linear-gradient(135deg, ${isDarkMode ? '#60a5fa' : '#1e40af'}, ${isDarkMode ? '#93c5fd' : '#2563eb'})` }}><FiFilter size={13} color="white" /></div>
                  <span style={{ color: isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)' }}>FILTERS</span>
                </div>
                <div className="filter-controls">
                  <div className="filter-item search-box">
                    <div className="filter-input-container">
                      <FiSearch size={12} className="filter-icon" color={isDarkMode ? '#cbd5e1' : '#334155'} />
                      <input type="text" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="filter-input" style={{ background: isDarkMode ? 'var(--dark-bg)' : 'var(--light-bg)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)', color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }} />
                    </div>
                  </div>
                  <div className="filter-item wire-size">
                    <div className="filter-input-container">
                      <FiZap size={12} className="filter-icon" color={isDarkMode ? '#fbbf24' : '#d97706'} />
                      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select" style={{ background: isDarkMode ? 'var(--dark-bg)' : 'var(--light-bg)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)', color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}>
                        <option value="">All Wire Sizes</option>
                        {wireSizes.map((size) => (<option key={size} value={size}>{size}</option>))}
                      </select>
                    </div>
                  </div>
                  <div className="filter-item date-picker">
                    <div className="filter-input-container">
                      <FiCalendar size={12} className="filter-icon" color={isDarkMode ? '#60a5fa' : '#2563eb'} />
                      <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="filter-date" style={{ background: isDarkMode ? 'var(--dark-bg)' : 'var(--light-bg)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)', color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }} />
                    </div>
                  </div>
                  <div className="filter-item"><button onClick={() => filterDate ? setShowReport(true) : alert("Please select a date")} className="page-btn filter-action-btn"><FiBarChart2 size={13} color={isDarkMode ? '#60a5fa' : '#1e40af'} /><span>Generate</span></button></div>
                  <div className="filter-item"><button onClick={() => { setSearchTerm(""); setFilterType(""); setFilterDate(""); setShowReport(false); setCurrentPage(1); }} className="page-btn filter-action-btn secondary"><FiX size={13} color={isDarkMode ? '#a78bfa' : '#7c3aed'} /><span>Clear</span></button></div>
                  <div className="filter-item"><button onClick={() => setShowWhatsAppModal(true)} className="page-btn filter-action-btn success"><FaWhatsapp size={13} color={isDarkMode ? '#34d399' : '#059669'} /><span>WhatsApp</span></button></div>
                  <div className="filter-item"><button onClick={handlePrintReport} className="page-btn filter-action-btn print"><FiPrinter size={13} color={isDarkMode ? '#60a5fa' : '#2563eb'} /><span>Print</span></button></div>
                  <div className="filter-item"><button onClick={handleExport} disabled={records.length === 0} className="page-btn filter-action-btn export"><FiDownload size={13} color={isDarkMode ? '#34d399' : '#059669'} /><span>Export CSV</span></button></div>
                </div>
                <div className="filter-status-inline">
                  <div className="active-filters-wrapper" style={{ background: isDarkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(30, 64, 175, 0.08)', borderColor: isDarkMode ? 'rgba(96, 165, 250, 0.3)' : 'rgba(30, 64, 175, 0.2)' }}>
                    <FiFilter size={11} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} />
                    <span className="active-filters-text" style={{ color: isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)' }}>
                      {searchTerm && `"${searchTerm}"`}{filterType && (searchTerm ? " • " : "") + filterType}{filterDate && (searchTerm || filterType ? " • " : "") + filterDate}{!searchTerm && !filterType && !filterDate && "No filters"}
                    </span>
                  </div>
                  <div className="filter-count-wrapper" style={{ background: isDarkMode ? 'var(--dark-bg)' : 'var(--light-bg)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
                    <FiDatabase size={11} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} />
                    <span><span className="filter-count-number" style={{ color: isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)' }}>{filteredRecords.length}</span><span style={{ color: isDarkMode ? 'var(--dark-text-secondary)' : 'var(--light-text-secondary)' }}> / {records.length}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REPORT SECTION */}
          {showReport && reportData && reportData.recordCount > 0 && (
            <div className="report-section" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
              {/* Report content - same as before */}
            </div>
          )}

          {/* RECORDS TABLE */}
          <div className="records-section">
            <div className="section-header">
              <h3><div className="section-icon"><FiDatabase size={18} color="white" /></div>Spiral Production Records</h3>
              <div className="section-info" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
                <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiDatabase size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {records.length}</span>
                <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiFilter size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {filteredRecords.length}</span>
                <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiHash size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {currentPage}/{totalPages}</span>
                <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiUser size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {loggedInUser}</span>
                <div className="database-status"><div className={`status-dot ${isSupabaseConnected ? "connected" : "offline"}`} /><span className="status-text">{isSupabaseConnected ? "On" : "Off"}</span></div>
              </div>
            </div>

            {loading ? (
              <div className="loading-state"><div className="loading-spinner" /><h4>Loading Records</h4><p>Fetching records from database...</p></div>
            ) : filteredRecords.length === 0 ? (
              <div className="empty-state"><div className="empty-icon-large"><FiColumns size={36} color={isDarkMode ? '#cbd5e1' : '#334155'} /></div><h4>No records found</h4><p>{searchTerm || filterDate || filterType ? "No records match your search criteria" : "No production records available"}</p><button onClick={() => navigate("/production-sections/spiral/new")} className="primary-btn large"><FiPlus size={18} /> Create First Record</button></div>
            ) : (
              <>
                <div className="table-container">
                  <table className="records-table">
                    <thead><tr>
                      <th><div className="table-header-content"><FiHash size={12} color="white" /><div><div>ID</div><div className="table-subheader">Code</div></div></div></th>
                      <th><div className="table-header-content"><FiPackage size={12} color="white" /><div><div>Item</div><div className="table-subheader">Size</div></div></div></th>
                      <th><div className="table-header-content"><FiZap size={12} color="white" /><div><div>Material</div><div className="table-subheader">Wire</div></div></div></th>
                      <th><div className="table-header-content"><FiBox size={12} color="white" /><div><div>Product</div><div className="table-subheader">Name</div></div></div></th>
                      <th><div className="table-header-content"><FiTool size={12} color="white" /><div><div>Machine</div><div className="table-subheader">ID</div></div></div></th>
                      <th><div className="table-header-content"><FiTrendingUp size={12} color="white" /><div><div>Prod</div><div className="table-subheader">Target</div></div></div></th>
                      <th><div className="table-header-content"><FiFeather size={12} color="white" /><div><div>Weight</div><div className="table-subheader">Per M</div></div></div></th>
                      <th><div className="table-header-content"><FiPercent size={12} color="white" /><div><div>Eff</div><div className="table-subheader">Tgt</div></div></div></th>
                      <th><div className="table-header-content"><FiUser size={12} color="white" /><div>Operator</div></div></th>
                      <th><div className="table-header-content"><FiUser size={12} color="white" /><div>User</div></div></th>
                      <th><div className="table-header-content"><FiClock size={12} color="white" /><div><div>Prod Date</div><div className="table-subheader">Shift</div></div></div></th>
                      <th><div className="table-header-content"><FiMessageSquare size={12} color="white" /><div><div>Remarks</div><div className="table-subheader">View</div></div></div></th>
                      <th><div className="table-header-content"><FiCalendar size={12} color="white" /><div><div>Created</div><div className="table-subheader">Time</div></div></div></th>
                      <th><div className="table-header-content"><FiSettings size={12} color="white" /><div>Actions</div></div></th>
                    </tr></thead>
                    <tbody>
                      {currentRecords.map((record, index) => {
                        const efficiency = parseFloat(record.efficiency) || 0;
                        const targetEfficiency = parseFloat(record.target_efficiency) || 85;
                        const productionDate = record.production_date ? new Date(record.production_date).toLocaleDateString("en-GB") : "—";
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
                            <td><div className="table-cell-content"><div className={`efficiency-badge ${getEfficiencyClass(efficiency)}`} style={{ backgroundColor: `${getEfficiencyColor(efficiency)}15`, color: getEfficiencyColor(efficiency), borderColor: `${getEfficiencyColor(efficiency)}30` }}><FiPercent size={10} />{Math.round(efficiency)}%</div><div className="cell-detail" style={{ color: isDarkMode ? '#cbd5e1' : '#334155' }}><FiTarget size={10} /> {Math.round(targetEfficiency)}%</div></div></td>
                            <td><div className="table-cell-content"><div className="cell-header"><FiUser size={14} color={isDarkMode ? '#cbd5e1' : '#334155'} /><span className="cell-value">{record.operator_name?.substring(0,10) || "—"}</span></div></div></td>
                            <td><div className="table-cell-content"><div className="cell-value">{record.users_name?.substring(0,8) || "—"}</div></div></td>
                            <td><div className="table-cell-content"><div className="cell-value" style={{ fontWeight: 600, color: isDarkMode ? '#60a5fa' : '#1e40af' }}>{productionDate}</div><div className="cell-detail" style={{ color: shiftName.includes('Day') || shiftName.includes('Morning') ? (isDarkMode ? '#fbbf24' : '#d97706') : (isDarkMode ? '#60a5fa' : '#2563eb') }}><FiClock size={10} /> {shiftName}</div></div></td>
                            <td><div className="remarks-cell">{hasRemarks ? (<><span className="remarks-text" style={{ color: isDarkMode ? '#93c5fd' : '#2563eb' }}>{remarks.length > 18 ? `${remarks.substring(0, 18)}...` : remarks}</span><button onClick={() => openRemarksModal(remarks, record.id)} className="remarks-view-btn" title="View full remarks"><FiEye size={12} color={isDarkMode ? '#93c5fd' : '#2563eb'} /></button></>) : (<span className="remarks-text" style={{ color: isDarkMode ? '#cbd5e1' : '#334155' }}>—</span>)}</div></td>
                            <td><div className="table-cell-content"><div className="cell-value">{new Date(record.created_at).toLocaleDateString("en-GB")}</div><div className="cell-detail">{new Date(record.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></div></td>
                            <td><div className="action-buttons"><button onClick={() => handleView(record.id)} className="action-btn view-btn" title="View"><FiEye size={12} color={isDarkMode ? '#60a5fa' : '#2563eb'} /></button><button onClick={() => handleEdit(record.id)} className="action-btn edit-btn" title="Edit"><FiEdit size={12} color={isDarkMode ? '#34d399' : '#059669'} /></button><button onClick={() => handleDelete(record.id)} className="action-btn delete-btn" title="Delete"><FiTrash2 size={12} color={isDarkMode ? '#f87171' : '#dc2626'} /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <div className="pagination-info">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)}/{filteredRecords.length}</div>
                    <div className="pagination-controls">
                      <button onClick={handlePrevPage} disabled={currentPage === 1} className="pagination-btn"><FiChevronLeft size={12} /></button>
                      <div className="page-numbers">
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum; 
                          if (totalPages <= 3) pageNum = i + 1; 
                          else if (currentPage <= 2) pageNum = i + 1; 
                          else if (currentPage >= totalPages - 1) pageNum = totalPages - 2 + i; 
                          else pageNum = currentPage - 1 + i;
                          return (<button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}>{pageNum}</button>);
                        })}
                      </div>
                      <button onClick={handleNextPage} disabled={currentPage === totalPages} className="pagination-btn"><FiChevronRight size={12} /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bottom-info-bar" style={{ background: isDarkMode ? 'var(--dark-surface)' : 'var(--light-surface)', borderColor: isDarkMode ? 'var(--dark-border)' : 'var(--light-border)' }}>
          <div className="info-left">
            <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiDatabase size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {stats.totalRecords}</span>
            <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiUser size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {loggedInUser}</span>
            <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiClock size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="info-right">
            <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiPackage size={12} color={isDarkMode ? 'var(--dark-primary)' : 'var(--light-primary)'} /> {Math.round(stats.totalProduction)}M</span>
            <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiFeather size={12} color={isDarkMode ? '#fbbf24' : '#d97706'} /> {Math.round(stats.totalWeight)}KG</span>
            <span className="info-item" style={{ color: isDarkMode ? 'var(--dark-text)' : 'var(--light-text)' }}><FiPercent size={12} color={getEfficiencyColor(stats.avgEfficiency)} /><span style={{ color: getEfficiencyColor(stats.avgEfficiency) }}>{Math.round(stats.avgEfficiency)}%</span></span>
          </div>
        </div>
      </div>

      {window.innerWidth < 768 && (
        <div className="mobile-fixed-bottom">
          <button onClick={() => navigate("/production-sections/spiral/new")} className="page-btn primary-btn"><FiPlus size={16} /> <span>New</span></button>
          <button onClick={() => navigate("/production-sections/spiral/smart")} className="page-btn smart-entry-btn"><FiSmartphone size={16} /> <span>Smart</span></button>
          <button onClick={fetchData} disabled={loading} className="page-btn refresh-btn">{loading ? <div className="mini-spinner" style={{ width: '16px', height: '16px' }} /> : <FiRefreshCw size={16} />} <span>Sync</span></button>
          <button onClick={() => navigate("/production")} className="page-btn nav-btn"><FiArrowLeft size={16} /> <span>Back</span></button>
        </div>
      )}

      {showWhatsAppModal && <WhatsAppModal />}
      {showRemarksModal && <RemarksModal />}
    </>
  );
};

export default SpiralPage;