// src/pages/ProductionSections/FlatteningSection/FlatteningPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../../contexts/ThemeContext'; // Theme context import
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
  FiTarget,
  FiBarChart2,
  FiPrinter,
  FiEye,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiActivity,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiCheckCircle,
  FiXCircle,
  FiGrid,
  FiX,
  FiTool,
  FiTag,
  FiUser,
  FiInfo,
  FiLayers,
  FiHash,
  FiPercent,
  FiFile,
  FiZap,
  FiChevronUp,
  FiChevronDown,
  FiBook,
  FiShare2,
  FiMail,
  FiMessageSquare,
  FiSmartphone,
  FiSettings,
  FiKey,
  FiBarChart,
} from "react-icons/fi";
import { supabase } from "../../../supabaseClient";
import FlatteningForm from "./FlatteningForm";
import "./FlatteningPage.css";

// ✅ Floating Particles Component
const FloatingParticles = () => {
  useEffect(() => {
    const particlesContainer = document.querySelector(".particles-container");
    if (!particlesContainer) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      const size = Math.random() * 4 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 20 + 10;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}vw`;
      particle.style.top = `${y}vh`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.opacity = Math.random() * 0.5 + 0.1;

      particlesContainer.appendChild(particle);
    }

    return () => {
      particlesContainer.innerHTML = "";
    };
  }, []);

  return <div className="particles-container" />;
};

// ✅ Enhanced Stat Card Component with Theme
const EnhancedStatCard = ({ card, stats, isSupabaseConnected }) => {
  const { isDarkMode, mode } = useTheme(); // ✅ Global theme استعمال
  
  const getEfficiencyColor = (value) => {
    if (value >= 80) return { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)", text: "Excellent" };
    if (value >= 70) return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", text: "Good" };
    return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", text: "Needs Attention" };
  };

  const cardColors = {
    "today-records": { 
      color: "#3b82f6", 
      rgb: "59, 130, 246", 
      icon: <FiClock className="stat-icon" size={18} style={{ color: "#3b82f6" }} /> 
    },
    "today-production": { 
      color: "#10b981", 
      rgb: "16, 185, 129", 
      icon: <FiPackage className="stat-icon" size={18} style={{ color: "#10b981" }} /> 
    },
    "today-efficiency": getEfficiencyColor(stats.todayEfficiency),
    "yesterday": { 
      color: "#8b5cf6", 
      rgb: "139, 92, 246", 
      icon: <FiTrendingDown className="stat-icon" size={18} style={{ color: "#8b5cf6" }} /> 
    },
    "total-records": { 
      color: "#ec4899", 
      rgb: "236, 72, 153", 
      icon: <FiDatabase className="stat-icon" size={18} style={{ color: "#ec4899" }} /> 
    },
    "total-production": { 
      color: "#06b6d4", 
      rgb: "6, 182, 212", 
      icon: <FiTrendingUp className="stat-icon" size={18} style={{ color: "#06b6d4" }} /> 
    },
    "avg-efficiency": getEfficiencyColor(stats.avgEfficiency),
    "database-status": {
      color: isSupabaseConnected ? "#10b981" : "#ef4444",
      rgb: isSupabaseConnected ? "16, 185, 129" : "239, 68, 68",
      icon: isSupabaseConnected ? 
        <FiCheckCircle className="stat-icon" size={18} style={{ color: "#10b981" }} /> : 
        <FiXCircle className="stat-icon" size={18} style={{ color: "#ef4444" }} />
    },
  };

  const currentColor = cardColors[card.id] || {
    color: "#3b82f6",
    rgb: "59, 130, 246",
    icon: card.icon ? React.createElement(card.icon, { 
      className: "stat-icon", 
      size: 18,
      style: { color: card.gradientColors?.[0] || "#3b82f6" }
    }) : <FiActivity className="stat-icon" size={18} style={{ color: "#3b82f6" }} />
  };

  return (
    <div
      className={`stat-card-enhanced ${isDarkMode ? 'dark' : ''} slide-in-left`}
      style={{
        "--card-color": currentColor.color,
        "--card-color-rgb": currentColor.rgb,
        animationDelay: `${card.id.charCodeAt(0) * 0.1}s`,
      }}
    >
      <div className="stat-card-header">
        <div className="stat-icon-wrapper">
          <div className="stat-icon-enhanced">
            {currentColor.icon}
          </div>
          <div className="stat-title-wrapper">
            <div className="stat-title-enhanced">{card.title}</div>
            {card.hasSubValue && (
              <div className="stat-subvalue">{card.subValue}</div>
            )}
          </div>
        </div>
        <div className="stat-trend">
          {["today-efficiency", "avg-efficiency"].includes(card.id) && currentColor.text && (
            <div className="trend-badge" style={{ 
              backgroundColor: currentColor.bg,
              color: currentColor.color
            }}>
              {currentColor.text}
            </div>
          )}
          {card.id === "database-status" && (
            <div className={`status-badge ${isSupabaseConnected ? 'connected' : 'disconnected'}`}>
              {isSupabaseConnected ? "Connected" : "Offline"}
            </div>
          )}
        </div>
      </div>
      <div className="stat-card-body">
        <div
          className="stat-value-enhanced"
          style={{ color: currentColor.color }}
        >
          {card.value}
        </div>
      </div>
      <div className="stat-card-footer">
        <div className="stat-description">
          <FiInfo className="desc-icon" size={12} style={{ color: "#6b7280" }} />
          {card.description}
        </div>
      </div>
    </div>
  );
};

// ✅ PDF Report Modal Component with Theme
const PDFReportModal = ({ data, onClose }) => {
  const { isDarkMode } = useTheme(); // ✅ Global theme استعمال
  
  if (!data) return null;

  return (
    <div className="modal-overlay">
      <div className={`pdf-modal-container ${isDarkMode ? 'dark' : ''}`}>
        {/* باقی کوڈ وہی رہے گا */}
        <div className="pdf-modal-header">
          <h2><FiFile className="modal-icon" size={20} style={{ color: "#3b82f6" }} /> Flattening Section Production Report</h2>
          <button className="close-pdf-btn" onClick={onClose}>
            <FiX className="close-icon" size={24} style={{ color: "#374151" }} />
          </button>
        </div>
        {/* ... باقی کوڈ ... */}
      </div>
    </div>
  );
};

// ✅ Print Report Component
const PrintReport = ({ data }) => {
  // ... (وہی کوڈ) ...
  return (
    <div className="print-report-container">
      {/* ... وہی کوڈ ... */}
    </div>
  );
};

// ✅ Production Info Component with Theme - UPDATED AS PER YOUR REQUEST
const ProductionInfo = ({ production, target }) => {
  const { isDarkMode } = useTheme(); // ✅ Global theme استعمال
  
  const prodQty = parseFloat(production) || 0;
  const targetQty = parseFloat(target) || 0;
  const efficiency = targetQty > 0 ? (prodQty / targetQty) * 100 : 0;
  
  const getEfficiencyColor = (eff) => {
    if (eff >= 80) return "#10b981";
    if (eff >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const efficiencyColor = getEfficiencyColor(efficiency);

  return (
    <div className={`production-info-detailed ${isDarkMode ? 'dark' : ''}`}>
      <div className="production-row-detailed">
        <span className="production-label-detailed">
          <FiPackage size={12} style={{ color: "#3b82f6" }} /> Production:
        </span>
        <span className="production-value-detailed main-value">
          {prodQty.toLocaleString()} KG
        </span>
      </div>
      <div className="production-row-detailed">
        <span className="production-label-detailed">
          <FiTarget size={12} style={{ color: "#f59e0b" }} /> Target:
        </span>
        <span className="production-value-detailed target-value">
          {targetQty.toLocaleString()} KG
        </span>
      </div>
      <div className="production-row-detailed">
        <span className="production-label-detailed">
          <FiPercent size={12} style={{ color: efficiencyColor }} /> Efficiency:
        </span>
        <span 
          className="production-value-detailed efficiency-value"
          style={{ color: efficiencyColor }}
        >
          {efficiency.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

// ✅ WhatsApp Report Component
const WhatsAppReport = ({ data, onClose }) => {
  // ... (وہی کوڈ) ...
  return (
    <div className="modal-overlay">
      <div className="whatsapp-modal-container">
        {/* ... وہی کوڈ ... */}
      </div>
    </div>
  );
};

// ✅ Excel Export Component
const ExcelExportModal = ({ records, onClose }) => {
  // ... (وہی کوڈ) ...
  return (
    <div className="modal-overlay">
      <div className="excel-modal-container">
        {/* ... وہی کوڈ ... */}
      </div>
    </div>
  );
};

// ✅ Main FlatteningPage Component with Theme
const FlatteningPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, mode, currentTheme } = useTheme(); // ✅ Global theme استعمال
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [targets, setTargets] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [showFlatteningModal, setShowFlatteningModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [pdfReportData, setPdfReportData] = useState(null);

  const [showStats, setShowStats] = useState(() => {
    const saved = localStorage.getItem("flattening_showStats");
    return saved ? JSON.parse(saved) : false;
  });

  const [showTodayProduction, setShowTodayProduction] = useState(() => {
    const saved = localStorage.getItem("flattening_showTodayProduction");
    return saved ? JSON.parse(saved) : false;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [reportData, setReportData] = useState({
    date: "",
    formattedDate: "",
    shiftGroups: {},
    totalProduction: 0,
    totalTarget: 0,
    overallEfficiency: 0,
    recordCount: 0,
    machineProduction: {},
    itemProduction: {},
  });

  const [stats, setStats] = useState({
    totalRecords: 0,
    todayRecords: 0,
    todayProduction: 0,
    todayEfficiency: 0,
    avgEfficiency: 0,
    yesterdayProduction: 0,
    yesterdayEfficiency: 0,
    totalProduction: 0,
    machineWiseToday: {},
    itemWiseToday: {},
    shiftWiseToday: {},
  });

  const isSupabaseConnected = supabase && process.env.REACT_APP_SUPABASE_URL;

  const statCards = [
    {
      id: "today-records",
      title: "Today's Records",
      value: stats.todayRecords,
      icon: FiClock,
      description: "Records added today",
      gradientColors: ["#3b82f6", "#1d4ed8"],
      iconBg: "#3b82f6",
    },
    {
      id: "today-production",
      title: "Today's Production",
      value: `${stats.todayProduction.toLocaleString()} KG`,
      icon: FiPackage,
      description: "Production today",
      gradientColors: ["#10b981", "#059669"],
      iconBg: "#10b981",
    },
    {
      id: "today-efficiency",
      title: "Today's Efficiency",
      value: `${stats.todayEfficiency}%`,
      icon: FiActivity,
      description: "Efficiency today",
      colorValue: true,
      gradientColors: ["#f59e0b", "#d97706"],
      iconBg: "#f59e0b",
      hasSubValue: false,
    },
    {
      id: "yesterday",
      title: "Yesterday Summary",
      value: `${stats.yesterdayProduction.toLocaleString()} KG`,
      subValue: `${stats.yesterdayEfficiency}% efficiency`,
      icon: FiTrendingDown,
      description: "Production & Efficiency",
      gradientColors: ["#8b5cf6", "#7c3aed"],
      iconBg: "#8b5cf6",
      hasSubValue: true,
    },
    {
      id: "total-records",
      title: "Total Records",
      value: stats.totalRecords,
      icon: FiDatabase,
      description: "All records in database",
      gradientColors: ["#ec4899", "#be185d"],
      iconBg: "#ec4899",
    },
    {
      id: "total-production",
      title: "Total Production",
      value: `${stats.totalProduction.toLocaleString()} KG`,
      icon: FiTrendingUp,
      description: "All time production",
      gradientColors: ["#06b6d4", "#0891b2"],
      iconBg: "#06b6d4",
    },
    {
      id: "avg-efficiency",
      title: "Average Efficiency",
      value: `${stats.avgEfficiency}%`,
      icon: FiPercent,
      description: "Average efficiency all time",
      colorValue: true,
      gradientColors: ["#f97316", "#ea580c"],
      iconBg: "#f97316",
    },
    {
      id: "database-status",
      title: "Database Status",
      value: isSupabaseConnected ? "Connected" : "Offline",
      icon: isSupabaseConnected ? FiCheckCircle : FiXCircle,
      description: "Database connection status",
      gradientColors: isSupabaseConnected ? ["#10b981", "#059669"] : ["#ef4444", "#dc2626"],
      iconBg: isSupabaseConnected ? "#10b981" : "#ef4444",
    },
  ];

  const saveToggleState = (key, value) => {
    localStorage.setItem(`flattening_${key}`, JSON.stringify(value));
  };

  const toggleStats = () => {
    const newValue = !showStats;
    setShowStats(newValue);
    saveToggleState("showStats", newValue);
  };

  const toggleTodayProduction = () => {
    const newValue = !showTodayProduction;
    setShowTodayProduction(newValue);
    saveToggleState("showTodayProduction", newValue);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      if (!supabase) {
        return;
      }

      const { data: targetsData } = await supabase
        .from("targets")
        .select("*")
        .eq("section", "Flattening")
        .eq("is_active", true);

      const { data: recordsData } = await supabase
        .from("flatteningsection")
        .select("*")
        .order("created_at", { ascending: false });

      setRecords(recordsData || []);
      calculateStats(recordsData || []);
      setTargets(targetsData || []);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setRecords([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateStats = (recordsData) => {
    if (!recordsData || recordsData.length === 0) {
      setStats({
        totalRecords: 0,
        todayRecords: 0,
        todayProduction: 0,
        todayEfficiency: 0,
        avgEfficiency: 0,
        yesterdayProduction: 0,
        yesterdayEfficiency: 0,
        totalProduction: 0,
        machineWiseToday: {},
        itemWiseToday: {},
        shiftWiseToday: {},
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const todayRecords = recordsData.filter((record) => {
      const recordDate = new Date(record.created_at).toISOString().split("T")[0];
      return recordDate === today;
    });

    const yesterdayRecords = recordsData.filter((record) => {
      const recordDate = new Date(record.created_at).toISOString().split("T")[0];
      return recordDate === yesterdayStr;
    });

    const totalProduction = recordsData.reduce(
      (sum, record) => sum + (parseFloat(record.production_quantity) || 0),
      0
    );

    const totalEfficiency = recordsData.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const avgEfficiency = recordsData.length > 0 ? totalEfficiency / recordsData.length : 0;

    const yesterdayProduction = yesterdayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.production_quantity) || 0),
      0
    );

    const yesterdayTotalEfficiency = yesterdayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const yesterdayEfficiency = yesterdayRecords.length > 0 ? yesterdayTotalEfficiency / yesterdayRecords.length : 0;

    const todayProduction = todayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.production_quantity) || 0),
      0
    );

    const todayTotalEfficiency = todayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const todayEfficiency = todayRecords.length > 0 ? todayTotalEfficiency / todayRecords.length : 0;

    const machineWiseToday = {};
    const itemWiseToday = {};
    const shiftWiseToday = {};

    todayRecords.forEach((record) => {
      const machine = record.machine_no || record.machine_id || "Unknown";
      if (!machineWiseToday[machine]) {
        machineWiseToday[machine] = { production: 0, efficiency: 0, count: 0 };
      }
      machineWiseToday[machine].production += parseFloat(record.production_quantity) || 0;
      machineWiseToday[machine].efficiency += parseFloat(record.efficiency) || 0;
      machineWiseToday[machine].count += 1;

      const item = record.item_name || "Unknown";
      if (!itemWiseToday[item]) {
        itemWiseToday[item] = { production: 0, efficiency: 0, count: 0 };
      }
      itemWiseToday[item].production += parseFloat(record.production_quantity) || 0;
      itemWiseToday[item].efficiency += parseFloat(record.efficiency) || 0;
      itemWiseToday[item].count += 1;

      const shift = record.shift_code || record.shift || "Unknown";
      if (!shiftWiseToday[shift]) {
        shiftWiseToday[shift] = { production: 0, efficiency: 0, count: 0 };
      }
      shiftWiseToday[shift].production += parseFloat(record.production_quantity) || 0;
      shiftWiseToday[shift].efficiency += parseFloat(record.efficiency) || 0;
      shiftWiseToday[shift].count += 1;
    });

    Object.keys(machineWiseToday).forEach((machine) => {
      if (machineWiseToday[machine].count > 0) {
        machineWiseToday[machine].efficiency = machineWiseToday[machine].efficiency / machineWiseToday[machine].count;
      }
    });

    Object.keys(itemWiseToday).forEach((item) => {
      if (itemWiseToday[item].count > 0) {
        itemWiseToday[item].efficiency = itemWiseToday[item].efficiency / itemWiseToday[item].count;
      }
    });

    Object.keys(shiftWiseToday).forEach((shift) => {
      if (shiftWiseToday[shift].count > 0) {
        shiftWiseToday[shift].efficiency = shiftWiseToday[shift].efficiency / shiftWiseToday[shift].count;
      }
    });

    setStats({
      totalRecords: recordsData.length,
      todayRecords: todayRecords.length,
      todayProduction,
      todayEfficiency: parseFloat(todayEfficiency.toFixed(1)),
      avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
      yesterdayProduction,
      yesterdayEfficiency: parseFloat(yesterdayEfficiency.toFixed(1)),
      totalProduction,
      machineWiseToday,
      itemWiseToday,
      shiftWiseToday,
    });
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      (record.section_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.machine_id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.operator_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const recordShift = record.shift_code || record.shift || "";
    const matchesShift = !filterShift || recordShift === filterShift;

    const recordDate = new Date(record.created_at).toISOString().split("T")[0];
    const matchesDate = !filterDate || recordDate === filterDate;

    return matchesSearch && matchesShift && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const generateReport = useCallback(
    (selectedDate) => {
      if (!records || records.length === 0) return;

      const dateRecords = records.filter((record) => {
        const recordDate = new Date(record.created_at).toISOString().split("T")[0];
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
          shiftGroups: {},
          totalProduction: 0,
          totalTarget: 0,
          overallEfficiency: 0,
          recordCount: 0,
          machineProduction: {},
          itemProduction: {},
        });
        return;
      }

      const shiftGroups = {};
      const machineProduction = {};
      const itemProduction = {};
      let totalProduction = 0;
      let totalTarget = 0;

      dateRecords.forEach((record) => {
        const shift = record.shift || record.shift_code || "Unknown";
        const machine = record.machine_no || record.machine_id || "Unknown";
        const item = record.item_name || "Unknown";
        const qty = parseFloat(record.production_quantity) || 0;

        if (!shiftGroups[shift]) {
          shiftGroups[shift] = { production: 0, target: 0, efficiency: 0, records: [] };
        }

        shiftGroups[shift].production += qty;
        totalProduction += qty;
        shiftGroups[shift].records.push(record);

        if (!machineProduction[machine]) {
          machineProduction[machine] = { production: 0, efficiency: 0, count: 0 };
        }
        machineProduction[machine].production += qty;
        machineProduction[machine].efficiency += parseFloat(record.efficiency) || 0;
        machineProduction[machine].count += 1;

        if (!itemProduction[item]) {
          itemProduction[item] = { production: 0, efficiency: 0, count: 0 };
        }
        itemProduction[item].production += qty;
        itemProduction[item].efficiency += parseFloat(record.efficiency) || 0;
        itemProduction[item].count += 1;

        const targetRecord = targets.find(
          (t) => t.shift_code === shift && t.machine_id === record.machine_id
        );

        if (targetRecord) {
          shiftGroups[shift].target += targetRecord.target_qty;
          totalTarget += targetRecord.target_qty;
        }
      });

      Object.keys(shiftGroups).forEach((shift) => {
        const group = shiftGroups[shift];
        group.efficiency = group.target > 0 ? (group.production / group.target) * 100 : 0;
      });

      Object.keys(machineProduction).forEach((machine) => {
        if (machineProduction[machine].count > 0) {
          machineProduction[machine].efficiency = machineProduction[machine].efficiency / machineProduction[machine].count;
        }
      });

      Object.keys(itemProduction).forEach((item) => {
        if (itemProduction[item].count > 0) {
          itemProduction[item].efficiency = itemProduction[item].efficiency / itemProduction[item].count;
        }
      });

      const overallEfficiency = totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;

      setReportData({
        date: selectedDate,
        formattedDate: new Date(selectedDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        shiftGroups,
        totalProduction,
        totalTarget,
        overallEfficiency: parseFloat(overallEfficiency.toFixed(2)),
        recordCount: dateRecords.length,
        machineProduction,
        itemProduction,
      });
    },
    [records, targets]
  );

  useEffect(() => {
    if (filterDate) {
      generateReport(filterDate);
    }
  }, [filterDate, generateReport]);

  const generatePDFReportData = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data available for PDF");
      return;
    }

    const pdfData = {
      title: "Flattening Section Production Report",
      date: reportData.formattedDate,
      generatedDate: new Date().toLocaleString(),
      summary: {
        totalProduction: reportData.totalProduction.toFixed(1),
        totalTarget: reportData.totalTarget.toFixed(1),
        overallEfficiency: reportData.overallEfficiency.toFixed(1),
        recordCount: reportData.recordCount,
      },
      shiftWise: Object.entries(reportData.shiftGroups).map(([shift, data]) => ({
        shift,
        production: data.production.toFixed(1),
        target: data.target.toFixed(1),
        efficiency: data.efficiency.toFixed(1),
      })),
      machineWise: Object.entries(reportData.machineProduction).map(([machine, data]) => ({
        machine,
        production: data.production.toFixed(1),
        efficiency: data.efficiency.toFixed(1),
        count: data.count,
      })),
      itemWise: Object.entries(reportData.itemProduction).map(([item, data]) => ({
        item,
        production: data.production.toFixed(1),
        efficiency: data.efficiency.toFixed(1),
        count: data.count,
      })),
    };

    setPdfReportData(pdfData);
    setShowPDFModal(true);
  };

  const generatePrintReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to print");
      return;
    }

    const printData = {
      title: "Flattening Section Production Report",
      date: reportData.formattedDate,
      generatedDate: new Date().toLocaleString(),
      summary: {
        totalProduction: reportData.totalProduction.toFixed(1),
        totalTarget: reportData.totalTarget.toFixed(1),
        overallEfficiency: reportData.overallEfficiency.toFixed(1),
        recordCount: reportData.recordCount,
      },
      shiftWise: Object.entries(reportData.shiftGroups).map(([shift, data]) => ({
        shift,
        production: data.production.toFixed(1),
        target: data.target.toFixed(1),
        efficiency: data.efficiency.toFixed(1),
      })),
      machineWise: Object.entries(reportData.machineProduction).map(([machine, data]) => ({
        machine,
        production: data.production.toFixed(1),
        efficiency: data.efficiency.toFixed(1),
        count: data.count,
      })),
      itemWise: Object.entries(reportData.itemProduction).map(([item, data]) => ({
        item,
        production: data.production.toFixed(1),
        efficiency: data.efficiency.toFixed(1),
        count: data.count,
      })),
    };

    setPdfReportData(printData);
    setShowPrintModal(true);
  };

  const handleWhatsAppReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to share");
      return;
    }

    const pdfData = {
      date: reportData.formattedDate,
      generatedDate: new Date().toLocaleString(),
      summary: {
        totalProduction: reportData.totalProduction.toFixed(1),
        totalTarget: reportData.totalTarget.toFixed(1),
        overallEfficiency: reportData.overallEfficiency.toFixed(1),
        recordCount: reportData.recordCount,
      },
    };

    setPdfReportData(pdfData);
    setShowWhatsAppModal(true);
  };

  const handleExcelExport = () => {
    setShowExcelModal(true);
  };

  const handleView = (id) => {
    alert(`View record ${id} - Functionality to be implemented`);
  };

  const handleEdit = (id) => {
    alert(`Edit record ${id} - Functionality to be implemented`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      if (!supabase) {
        alert("Supabase connection not available");
        return;
      }

      const { error } = await supabase
        .from("flatteningsection")
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

  const getEfficiencyColor = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return "#10b981";
    if (eff >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const uniqueShiftCodes = [
    ...new Set(
      records.map((record) => record.shift_code || record.shift).filter(Boolean)
    ),
  ].sort();

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

  if (loading && records.length === 0) {
    return (
      <div className={`loading-container ${isDarkMode ? 'dark' : ''}`}>
        <div className="loading-spinner" />
        <h3>Loading Flattening Section Data...</h3>
        <p className="loading-subtext">Fetching records from database</p>
      </div>
    );
  }

  return (
    <div className={`flattening-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* Database Status Banner */}
      {!isSupabaseConnected && (
        <div className="database-alert slide-in-left">
          <FiAlertCircle className="fi-warning" size={20} style={{ color: "#d97706" }} />
          <div>
            <strong>Supabase Connection Issue</strong>
            <div className="alert-subtext">
              Check your .env file for REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flattening-page-header fade-in-up">
        <div className="page-header-content">
          <div className="page-header-left">
            <h1 className="flattening-page-title">
              <FiTool className="page-title-icon" size={28} style={{ color: "#3b82f6" }} />
              Flattening Section Production
              <div className={`connection-badge ${isSupabaseConnected ? "connected" : "offline"}`}>
                {isSupabaseConnected ? (
                  <>
                    <FiCheckCircle className="fi-success" size={12} style={{ color: "#059669" }} /> Connected
                  </>
                ) : (
                  <>
                    <FiXCircle className="fi-error" size={12} style={{ color: "#dc2626" }} /> Offline
                  </>
                )}
              </div>
            </h1>
            <p className="flattening-page-subtitle">
              <FiDatabase className="fi-primary" size={16} style={{ color: "#3b82f6" }} />
              Data from: flatteningsection table • Total Records: {stats.totalRecords}
            </p>
          </div>
          <div className="page-header-actions">
            <div className="action-buttons-row">
              <button
                onClick={() => setShowFlatteningModal(true)}
                className="btn btn-primary"
              >
                <FiPlus className="fi-primary" size={20} style={{ color: "white" }} /> Flattening Entry
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => navigate("/production-sections/flattening/new")}
              >
                <FiPlus className="fi-primary" style={{ color: "#3b82f6" }} /> Single Entry
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => navigate("/production-sections/flattening/multi-entry")}
              >
                <FiGrid className="fi-secondary" style={{ color: "#6b7280" }} /> Multi-Entry
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => navigate("/production-sections/flattening/smart-entry")}
              >
                <FiZap className="fi-warning" style={{ color: "#f59e0b" }} /> Smart Entry
              </button>

              <button
                onClick={handleExcelExport}
                disabled={records.length === 0}
                className="btn btn-secondary"
              >
                <FiDownload className="fi-success" style={{ color: "#10b981" }} /> Export Excel
              </button>

              <button
                onClick={fetchData}
                disabled={loading}
                className="btn btn-secondary"
              >
                {loading ? (
                  <>
                    <div className="mini-spinner" />
                    Loading...
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="fi-info" style={{ color: "#3b82f6" }} /> Refresh
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/flattening-inventory")}
                className="btn btn-secondary"
              >
                <FiBarChart2 className="fi-info" style={{ color: "#3b82f6" }} /> Inventory Report
              </button>

              <button
                onClick={() => navigate("/flattening-ledger")}
                className="btn btn-secondary"
              >
                <FiBook className="fi-primary" style={{ color: "#3b82f6" }} /> Inventory Ledger
              </button>

              <button
                onClick={toggleStats}
                className="btn btn-tertiary"
                title={showStats ? "Hide Statistics" : "Show Statistics"}
              >
                {showStats ? (
                  <>
                    <FiChevronUp className="fi-secondary" style={{ color: "#6b7280" }} /> Hide Stats
                  </>
                ) : (
                  <>
                    <FiChevronDown className="fi-secondary" style={{ color: "#6b7280" }} /> Show Stats
                  </>
                )}
              </button>

              <button
                onClick={toggleTodayProduction}
                className="btn btn-tertiary"
                title={showTodayProduction ? "Hide Today's Production" : "Show Today's Production"}
              >
                {showTodayProduction ? (
                  <>
                    <FiChevronUp className="fi-secondary" style={{ color: "#6b7280" }} /> Hide Today's
                  </>
                ) : (
                  <>
                    <FiChevronDown className="fi-secondary" style={{ color: "#6b7280" }} /> Show Today's
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="stats-section fade-in-up">
          <div className="stats-grid-enhanced">
            {statCards.map((card) => (
              <EnhancedStatCard
                key={card.id}
                card={card}
                stats={stats}
                isSupabaseConnected={isSupabaseConnected}
              />
            ))}
          </div>
        </div>
      )}

      {/* Today's Production & Efficiency Section */}
      {showTodayProduction && (
        <div className={`today-production-section fade-in-up ${isDarkMode ? 'dark' : ''}`}>
          <div className="section-header">
            <div className="header-icon">
              <FiBarChart className="fi-info" size={28} style={{ color: "white" }} />
            </div>
            <div className="section-header-content">
              <h2>Today's Production & Efficiency</h2>
              <p className="section-subtitle">Real-time production data for today</p>
            </div>
          </div>

          <div className="production-analysis-container">
            <div className="machine-analysis">
              <div className="analysis-header">
                <h3><FiTool className="section-icon" size={20} style={{ color: "#3b82f6" }} /> Machine-wise Production</h3>
                <div className="analysis-summary">
                  {Object.keys(stats.machineWiseToday).length} Machines Active
                </div>
              </div>
              <div className="machine-analysis-grid">
                {Object.entries(stats.machineWiseToday).length > 0 ? (
                  Object.entries(stats.machineWiseToday).map(([machine, data]) => {
                    const efficiencyClass = data.efficiency >= 80 ? "good" : data.efficiency >= 70 ? "average" : "poor";
                    return (
                      <div key={machine} className={`machine-analysis-card ${isDarkMode ? 'dark' : ''}`}>
                        <div className="machine-analysis-header">
                          <div className="machine-analysis-icon">
                            <FiTool className="fi-primary" size={18} style={{ color: "#3b82f6" }} />
                          </div>
                          <div className="machine-analysis-name">{machine}</div>
                          <div className={`machine-status status-${efficiencyClass}`} />
                        </div>
                        <div className="machine-analysis-stats">
                          <div className="production-stats">
                            <div className={`production-value value-${efficiencyClass}`}>
                              {data.production.toFixed(0)}
                            </div>
                            <div className="production-label">
                              <FiPackage size={12} style={{ color: "#6b7280" }} /> KG Produced
                            </div>
                          </div>
                          <div className="efficiency-stats">
                            <div className={`efficiency-value value-${efficiencyClass}`}>
                              {data.efficiency.toFixed(1)}%
                            </div>
                            <div className="efficiency-label"><FiActivity size={12} style={{ color: "#6b7280" }} /> Efficiency</div>
                          </div>
                        </div>
                        <div className="machine-analysis-footer">
                          <div className="performance-bar">
                            <div
                              className="performance-fill"
                              style={{
                                width: `${Math.min(data.efficiency, 100)}%`,
                                background: data.efficiency >= 80 ? "#10b981" : data.efficiency >= 70 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <div className={`performance-indicator indicator-${efficiencyClass}`}>
                            {efficiencyClass === "good" ? "Excellent" : efficiencyClass === "average" ? "Good" : "Needs Improvement"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-production">
                    <FiTool className="fi-primary" size={24} style={{ color: "#3b82f6" }} />
                    <div>No machine production recorded today</div>
                  </div>
                )}
              </div>
            </div>

            <div className="item-analysis">
              <div className="analysis-header">
                <h3><FiTag className="section-icon" size={20} style={{ color: "#10b981" }} /> Item-wise Production</h3>
                <div className="analysis-summary">
                  {Object.keys(stats.itemWiseToday).length} Items Produced
                </div>
              </div>
              <div className="item-analysis-grid">
                {Object.entries(stats.itemWiseToday).length > 0 ? (
                  Object.entries(stats.itemWiseToday).map(([item, data]) => {
                    const efficiencyClass = data.efficiency >= 80 ? "good" : data.efficiency >= 70 ? "average" : "poor";
                    return (
                      <div key={item} className={`item-analysis-card ${isDarkMode ? 'dark' : ''}`}>
                        <div className="item-analysis-header">
                          <div className="item-analysis-icon">
                            <FiTag className="fi-success" size={18} style={{ color: "#10b981" }} />
                          </div>
                          <div className="item-analysis-name">{item}</div>
                          <div className={`machine-status status-${efficiencyClass}`} />
                        </div>
                        <div className="item-analysis-stats">
                          <div className="production-stats">
                            <div className={`production-value value-${efficiencyClass}`}>
                              {data.production.toFixed(0)}
                            </div>
                            <div className="production-label"><FiPackage size={12} style={{ color: "#6b7280" }} /> KG Produced</div>
                          </div>
                          <div className="efficiency-stats">
                            <div className={`efficiency-value value-${efficiencyClass}`}>
                              {data.efficiency.toFixed(1)}%
                            </div>
                            <div className="efficiency-label"><FiActivity size={12} style={{ color: "#6b7280" }} /> Efficiency</div>
                          </div>
                        </div>
                        <div className="item-analysis-footer">
                          <div className="performance-bar">
                            <div
                              className="performance-fill"
                              style={{
                                width: `${Math.min(data.efficiency, 100)}%`,
                                background: data.efficiency >= 80 ? "#10b981" : data.efficiency >= 70 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <div className={`performance-indicator indicator-${efficiencyClass}`}>
                            {efficiencyClass === "good" ? "Excellent" : efficiencyClass === "average" ? "Good" : "Needs Improvement"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-production">
                    <FiTag className="fi-success" size={24} style={{ color: "#10b981" }} />
                    <div>No items recorded today</div>
                  </div>
                )}
              </div>
            </div>

            <div className="shift-analysis">
              <div className="analysis-header">
                <h3><FiClock className="section-icon" size={20} style={{ color: "#f59e0b" }} /> Shift-wise Production</h3>
                <div className="analysis-summary">
                  {Object.keys(stats.shiftWiseToday).length} Shifts Active
                </div>
              </div>
              <div className="shift-analysis-grid">
                {Object.entries(stats.shiftWiseToday).length > 0 ? (
                  Object.entries(stats.shiftWiseToday).map(([shift, data]) => {
                    const efficiencyClass = data.efficiency >= 80 ? "good" : data.efficiency >= 70 ? "average" : "poor";
                    return (
                      <div key={shift} className={`shift-analysis-card ${isDarkMode ? 'dark' : ''}`}>
                        <div className="shift-analysis-header">
                          <div className="shift-analysis-icon">
                            <FiClock className="fi-warning" size={18} style={{ color: "#f59e0b" }} />
                          </div>
                          <div className="shift-analysis-name">Shift {shift}</div>
                          <div className={`machine-status status-${efficiencyClass}`} />
                        </div>
                        <div className="shift-analysis-stats">
                          <div className="production-stats">
                            <div className={`production-value value-${efficiencyClass}`}>
                              {data.production.toFixed(0)}
                            </div>
                            <div className="production-label"><FiPackage size={12} style={{ color: "#6b7280" }} /> KG Produced</div>
                          </div>
                          <div className="efficiency-stats">
                            <div className={`efficiency-value value-${efficiencyClass}`}>
                              {data.efficiency.toFixed(1)}%
                            </div>
                            <div className="efficiency-label"><FiActivity size={12} style={{ color: "#6b7280" }} /> Efficiency</div>
                          </div>
                        </div>
                        <div className="shift-analysis-footer">
                          <div className="performance-bar">
                            <div
                              className="performance-fill"
                              style={{
                                width: `${Math.min(data.efficiency, 100)}%`,
                                background: data.efficiency >= 80 ? "#10b981" : data.efficiency >= 70 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <div className={`performance-indicator indicator-${efficiencyClass}`}>
                            {data.count} records
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-production">
                    <FiClock className="fi-warning" size={24} style={{ color: "#f59e0b" }} />
                    <div>No shift data available</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className={`filters-section-enhanced slide-in-right ${isDarkMode ? 'dark' : ''}`}>
        <div className="filter-section-header">
          <FiFilter className="fi-secondary" size={20} style={{ color: "#6b7280" }} />
          <h3>Filters & Reports</h3>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">
              <FiSearch className="fi-secondary" size={16} style={{ color: "#6b7280" }} /> Search Records
            </label>
            <input
              type="text"
              placeholder="Search by machine, operator, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`filter-input-enhanced ${isDarkMode ? 'dark' : ''}`}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <FiFilter className="fi-secondary" size={16} style={{ color: "#6b7280" }} /> Filter by Shift
            </label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className={`filter-select-enhanced ${isDarkMode ? 'dark' : ''}`}
            >
              <option value="">All Shifts</option>
              {uniqueShiftCodes.map((shiftCode) => (
                <option key={shiftCode} value={shiftCode}>
                  {shiftCode}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <FiCalendar className="fi-warning" size={16} style={{ color: "#f59e0b" }} /> Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setShowReport(!!e.target.value);
                setCurrentPage(1);
              }}
              max={new Date().toISOString().split("T")[0]}
              className={`filter-date-enhanced ${isDarkMode ? 'dark' : ''}`}
            />
          </div>

          <div className="filter-actions">
            <button
              onClick={() => {
                if (!filterDate) {
                  alert("Please select a date first to generate report");
                  return;
                }
                setShowReport(true);
              }}
              className="report-btn-enhanced"
            >
              <FiBarChart2 className="fi-info" size={16} style={{ color: "white" }} /> Generate Report
            </button>

            <button
              onClick={() => {
                setSearchTerm("");
                setFilterShift("");
                setFilterDate("");
                setShowReport(false);
                setCurrentPage(1);
              }}
              className="clear-btn-enhanced"
            >
              <FiX className="fi-error" size={16} style={{ color: "#374151" }} /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Report Section */}
      {showReport && reportData && (
        <div className={`report-section-enhanced fade-in-up ${isDarkMode ? 'dark' : ''}`}>
          <div className="report-bg-pattern" />

          <div className="report-header-enhanced">
            <div className="report-title-section">
              <h2><FiBarChart2 className="section-icon" size={20} style={{ color: "#3b82f6" }} /> Flattening Section Daily Report</h2>
              <div className="report-date-enhanced">
                <FiCalendar className="fi-warning" size={16} style={{ color: "#f59e0b" }} />
                {reportData.formattedDate}
              </div>
            </div>
            <div className="report-actions-enhanced">
              <button
                onClick={generatePDFReportData}
                className="btn btn-primary"
              >
                <FiFile className="fi-primary" size={16} style={{ color: "white" }} /> PDF Report
              </button>
              <button onClick={generatePrintReport} className="btn btn-secondary">
                <FiPrinter className="fi-secondary" size={16} style={{ color: "#374151" }} /> Print
              </button>
              <button onClick={handleWhatsAppReport} className="btn btn-secondary">
                <FiMessageSquare className="fi-success" size={16} style={{ color: "#10b981" }} /> WhatsApp
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="btn btn-secondary"
              >
                <FiX size={16} style={{ color: "#374151" }} /> Close
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="report-summary-cards">
            <div className={`summary-card ${isDarkMode ? 'dark' : ''}`}>
              <div className="summary-icon">
                <FiPackage className="fi-primary" size={24} style={{ color: "white" }} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Production</div>
                <div className="summary-value">
                  {reportData.totalProduction.toFixed(1)} KG
                </div>
              </div>
            </div>

            <div className={`summary-card ${isDarkMode ? 'dark' : ''}`}>
              <div className="summary-icon">
                <FiTarget className="fi-primary" size={24} style={{ color: "white" }} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Target</div>
                <div className="summary-value">
                  {reportData.totalTarget.toFixed(1)} KG
                </div>
              </div>
            </div>

            <div className={`summary-card ${isDarkMode ? 'dark' : ''}`}>
              <div className="summary-icon">
                <FiActivity className="fi-info" size={24} style={{ color: "white" }} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Overall Efficiency</div>
                <div
                  className="summary-value"
                  style={{
                    color: reportData.overallEfficiency >= 80 ? "#10b981" : reportData.overallEfficiency >= 70 ? "#f59e0b" : "#ef4444",
                  }}
                >
                  {reportData.overallEfficiency.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className={`summary-card ${isDarkMode ? 'dark' : ''}`}>
              <div className="summary-icon">
                <FiDatabase className="fi-primary" size={24} style={{ color: "white" }} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Records</div>
                <div className="summary-value">{reportData.recordCount}</div>
              </div>
            </div>
          </div>

          {/* Shift-wise Production */}
          {Object.keys(reportData.shiftGroups).length > 0 && (
            <div className="report-section-block">
              <h3><FiClock className="section-icon" size={20} style={{ color: "#f59e0b" }} /> Shift-wise Production</h3>
              <div className="shift-report-grid">
                {Object.entries(reportData.shiftGroups).map(([shift, data]) => {
                  const efficiencyClass = data.efficiency >= 80 ? "good" : data.efficiency >= 70 ? "average" : "poor";
                  return (
                    <div key={shift} className={`shift-report-card ${isDarkMode ? 'dark' : ''}`}>
                      <div className="shift-report-header">
                        <div className="shift-name">Shift {shift}</div>
                        <div className={`shift-status indicator-${efficiencyClass}`}>
                          {efficiencyClass === "good" ? "Excellent" : efficiencyClass === "average" ? "Good" : "Needs Attention"}
                        </div>
                      </div>
                      <div className="shift-report-stats">
                        <div className="stat-item">
                          <div className="stat-label"><FiPackage size={12} style={{ color: "#6b7280" }} /> Production</div>
                          <div className="stat-value">
                            {data.production.toFixed(1)} KG
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label"><FiTarget size={12} style={{ color: "#6b7280" }} /> Target</div>
                          <div className="stat-value">
                            {data.target.toFixed(1)} KG
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label"><FiActivity size={12} style={{ color: "#6b7280" }} /> Efficiency</div>
                          <div
                            className="stat-value"
                            style={{
                              color: data.efficiency >= 80 ? "#10b981" : data.efficiency >= 70 ? "#f59e0b" : "#ef4444",
                            }}
                          >
                            {data.efficiency.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Machine-wise Production */}
          {Object.keys(reportData.machineProduction).length > 0 && (
            <div className="report-section-block">
              <h3><FiTool className="section-icon" size={20} style={{ color: "#3b82f6" }} /> Machine-wise Production</h3>
              <div className="machine-report-list">
                {Object.entries(reportData.machineProduction).map(([machine, data]) => {
                  const efficiencyClass = data.efficiency >= 80 ? "good" : data.efficiency >= 70 ? "average" : "poor";
                  return (
                    <div key={machine} className={`machine-report-item ${isDarkMode ? 'dark' : ''}`}>
                      <div className="machine-report-header">
                        <div className="machine-report-name">
                          <FiTool className="fi-primary" size={16} style={{ color: "#3b82f6" }} />
                          {machine}
                        </div>
                        <div
                          className="machine-report-efficiency"
                          style={{
                            color: data.efficiency >= 80 ? "#10b981" : data.efficiency >= 70 ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {data.efficiency.toFixed(1)}%
                        </div>
                      </div>
                      <div className="machine-report-details">
                        <div className="detail-item">
                          <div className="detail-label"><FiPackage size={12} style={{ color: "#6b7280" }} /> Production:</div>
                          <div className="detail-value">
                            {data.production.toFixed(1)} KG
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label"><FiDatabase size={12} style={{ color: "#6b7280" }} /> Records:</div>
                          <div className="detail-value">{data.count}</div>
                        </div>
                        <div className={`detail-status indicator-${efficiencyClass}`}>
                          {efficiencyClass === "good" ? "Excellent" : efficiencyClass === "average" ? "Good" : "Needs Attention"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Item-wise Production */}
          {Object.keys(reportData.itemProduction).length > 0 && (
            <div className="report-section-block">
              <h3><FiTag className="section-icon" size={20} style={{ color: "#10b981" }} /> Item-wise Production</h3>
              <div className="machine-report-list">
                {Object.entries(reportData.itemProduction).map(([item, data]) => {
                  const efficiencyClass = data.efficiency >= 80 ? "good" : data.efficiency >= 70 ? "average" : "poor";
                  return (
                    <div key={item} className={`machine-report-item ${isDarkMode ? 'dark' : ''}`}>
                      <div className="machine-report-header">
                        <div className="machine-report-name">
                          <FiTag className="fi-success" size={16} style={{ color: "#10b981" }} />
                          {item}
                        </div>
                        <div
                          className="machine-report-efficiency"
                          style={{
                            color: data.efficiency >= 80 ? "#10b981" : data.efficiency >= 70 ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {data.efficiency.toFixed(1)}%
                        </div>
                      </div>
                      <div className="machine-report-details">
                        <div className="detail-item">
                          <div className="detail-label"><FiPackage size={12} style={{ color: "#6b7280" }} /> Production:</div>
                          <div className="detail-value">
                            {data.production.toFixed(1)} KG
                          </div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label"><FiDatabase size={12} style={{ color: "#6b7280" }} /> Records:</div>
                          <div className="detail-value">{data.count}</div>
                        </div>
                        <div className={`detail-status indicator-${efficiencyClass}`}>
                          {efficiencyClass === "good" ? "Excellent" : efficiencyClass === "average" ? "Good" : "Needs Attention"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="report-footer-enhanced">
            <div className="report-footer-content">
              <div className="footer-info">
                <span><FiClock size={12} style={{ color: "#6b7280" }} /> Report generated on {new Date().toLocaleString()}</span>
                <span>•</span>
                <span><FiDatabase size={12} style={{ color: "#6b7280" }} /> Data source: flatteningsection table</span>
                <span>•</span>
                <span><FiTool size={12} style={{ color: "#6b7280" }} /> Flattening Section - Production Management System</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className={`records-table-section-enhanced slide-in-left ${isDarkMode ? 'dark' : ''}`}>
        <div className="table-header-section">
          <div className="table-header-left">
            <h2><FiDatabase className="section-icon" size={20} style={{ color: "#3b82f6" }} /> Production Records</h2>
            <div className="table-stats">
              <div className="stat-item">
                <FiDatabase className="fi-primary" size={14} style={{ color: "#3b82f6" }} />
                Total: {records.length} records
              </div>
              <div className="stat-item">
                <FiFilter className="fi-secondary" size={14} style={{ color: "#6b7280" }} />
                Showing: {filteredRecords.length} filtered
              </div>
              <div className="stat-item">
                <FiHash className="fi-secondary" size={14} style={{ color: "#6b7280" }} />
                Page: {currentPage}/{totalPages}
              </div>
            </div>
          </div>
          <div className="database-status">
            <div className={`status-indicator ${isSupabaseConnected ? "connected" : "offline"}`} />
            {isSupabaseConnected ? "Database Connected" : "Database Offline"}
          </div>
        </div>

        {loading ? (
          <div className="loading-records">
            <div className="table-spinner" />
            <div className="loading-text">Loading records from flatteningsection...</div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-records">
            <div className="empty-icon">
              <FiPackage className="fi-primary" size={48} style={{ color: "#3b82f6" }} />
            </div>
            <div className="empty-content">
              <h3>No records found</h3>
              <p>
                {searchTerm || filterDate || filterShift
                  ? "No records match your search criteria. Try adjusting your filters."
                  : "No production records available. Create your first record to get started."}
              </p>
              <button
                onClick={() => setShowFlatteningModal(true)}
                className="btn btn-primary"
              >
                <FiPlus className="fi-primary" style={{ color: "white" }} /> Create First Record
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="table-container-enhanced">
              <table className="production-table-enhanced">
                <thead>
                  <tr>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiHash size={14} style={{ color: "#3b82f6" }} />
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiTool size={14} style={{ color: "#3b82f6" }} />
                        <span>MACHINE</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiCalendar size={14} style={{ color: "#3b82f6" }} />
                        <span>PROD DATE & SHIFT</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiPackage size={14} style={{ color: "#10b981" }} />
                        <span>ITEM DETAILS</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiUser size={14} style={{ color: "#3b82f6" }} />
                        <span>USER</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiUser size={14} style={{ color: "#3b82f6" }} />
                        <span>OPERATOR</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiBarChart size={14} style={{ color: "#3b82f6" }} />
                        <span>PRODUCTION DETAILS</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiActivity size={14} style={{ color: "#3b82f6" }} />
                        <span>EFFICIENCY</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiClock size={14} style={{ color: "#3b82f6" }} />
                        <span>ENTRY DATE</span>
                      </div>
                    </th>
                    <th className="table-header-cell">
                      <div className="header-content">
                        <FiSettings size={14} style={{ color: "#3b82f6" }} />
                        <span>ACTIONS</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => {
                    const efficiencyClass = record.efficiency >= 80 ? "good" : record.efficiency >= 70 ? "average" : "poor";
                    const shiftClass = ["A", "B", "C"].includes(record.shift_code || record.shift) ? record.shift_code || record.shift : "default";

                    return (
                      <tr key={record.id} className={index % 2 === 0 ? "even" : "odd"}>
                        <td className="id-cell">
                          <FiKey className="id-icon" size={12} style={{ color: "#9ca3af" }} />
                          #{record.id}
                        </td>

                        <td>
                          <div className="machine-cell">
                            <div className="machine-icon">
                              <FiTool className="fi-primary" size={16} style={{ color: "#3b82f6" }} />
                            </div>
                            <div className="machine-details">
                              <div className="machine-id">{record.machine_id || "N/A"}</div>
                              <div className="machine-number">{record.machine_no || "N/A"}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="datetime-cell">
                            <div className="date-part">
                              <FiCalendar size={12} style={{ color: "#3b82f6" }} />
                              {new Date(record.created_at).toLocaleDateString("en-GB")}
                            </div>
                            <div className={`shift-badge ${shiftClass}`}>
                              <FiClock size={12} style={{ 
                                color: shiftClass === "A" ? "#1d4ed8" : 
                                       shiftClass === "B" ? "#059669" : 
                                       shiftClass === "C" ? "#d97706" : "#6b7280"
                              }} /> {record.shift_code || record.shift || "N/A"}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="item-cell">
                            <div className="item-icon">
                              <FiPackage className="fi-success" size={16} style={{ color: "#10b981" }} />
                            </div>
                            <div className="item-details">
                              <div className="item-name">{record.item_name || "N/A"}</div>
                              <div className="item-size">
                                <FiLayers size={12} style={{ color: "#6b7280" }} /> {record.coil_size || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {record.user_name?.charAt(0) || "U"}
                            </div>
                            <div className="user-details">
                              <div className="user-name">{record.user_name || "Unknown"}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="operator-cell">
                            <div className="operator-avatar">
                              <FiUser size={14} style={{ color: "white" }} />
                            </div>
                            <div className="operator-details">
                              <div className="operator-name">{record.operator_name || "Unknown"}</div>
                            </div>
                          </div>
                        </td>

                        <td className="production-cell">
                          <ProductionInfo 
                            production={record.production_quantity}
                            target={record.target_qty}
                          />
                        </td>

                        <td>
                          <div className={`efficiency-cell ${efficiencyClass}`}>
                            <FiActivity size={12} style={{ 
                              color: efficiencyClass === "good" ? "#10b981" : 
                                     efficiencyClass === "average" ? "#f59e0b" : "#ef4444"
                            }} />
                            {record.efficiency ? `${parseFloat(record.efficiency).toFixed(1)}%` : "N/A"}
                          </div>
                        </td>

                        <td>
                          <div className="datetime-cell">
                            <div className="date-part">
                              {new Date(record.created_at).toLocaleDateString("en-GB")}
                            </div>
                            <div className="time-part">
                              <FiClock size={12} style={{ color: "#6b7280" }} />
                              {new Date(record.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </td>

                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button
                              onClick={() => handleView(record.id)}
                              className="view-btn action-btn"
                              title="View"
                            >
                              <FiEye size={14} style={{ color: "#3b82f6" }} />
                            </button>
                            <button
                              onClick={() => handleEdit(record.id)}
                              className="edit-btn action-btn"
                              title="Edit"
                            >
                              <FiEdit size={14} style={{ color: "#f59e0b" }} />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="delete-btn action-btn"
                              title="Delete"
                            >
                              <FiTrash2 size={14} style={{ color: "#ef4444" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-section-enhanced">
                <div className="pagination-info">
                  Page {currentPage} of {totalPages} • Showing {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <FiChevronLeft className="fi-secondary" size={16} style={{ color: "#6b7280" }} /> Previous
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
                          className={`page-number ${currentPage === pageNum ? "active" : ""}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="page-dots">...</span>
                    )}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    Next <FiChevronRight className="fi-secondary" size={16} style={{ color: "#6b7280" }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flattening-bottom-actions">
        <button
          onClick={() => setShowFlatteningModal(true)}
          className="btn btn-primary"
        >
          <FiPlus className="fi-primary" size={14} style={{ color: "white" }} /> New Flattening Entry
        </button>
        <button onClick={fetchData} className="btn btn-secondary">
          <FiRefreshCw className="fi-info" size={14} style={{ color: "#3b82f6" }} /> Refresh Data
        </button>
      </div>

      {/* Flattening Form Modal */}
      {showFlatteningModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <FlatteningForm
              isModal={true}
              onClose={() => {
                setShowFlatteningModal(false);
                fetchData();
              }}
              onSuccess={() => {
                setShowFlatteningModal(false);
                fetchData();
              }}
            />
          </div>
        </div>
      )}

      {/* PDF Report Modal */}
      {showPDFModal && pdfReportData && (
        <PDFReportModal
          data={pdfReportData}
          onClose={() => setShowPDFModal(false)}
        />
      )}

      {/* Print Report Modal */}
      {showPrintModal && pdfReportData && (
        <div className="modal-overlay">
          <div className="print-modal-container">
            <PrintReport data={pdfReportData} />
            <div className="print-modal-actions">
              <button
                className="print-modal-print-btn"
                onClick={() => window.print()}
              >
                <FiPrinter className="fi-secondary" style={{ color: "#374151" }} /> Print Now
              </button>
              <button
                className="print-modal-close-btn"
                onClick={() => setShowPrintModal(false)}
              >
                <FiX style={{ color: "#374151" }} /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Report Modal */}
      {showWhatsAppModal && pdfReportData && (
        <WhatsAppReport
          data={pdfReportData}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}

      {/* Excel Export Modal */}
      {showExcelModal && (
        <ExcelExportModal
          records={filteredRecords}
          onClose={() => setShowExcelModal(false)}
        />
      )}
    </div>
  );
};

export default FlatteningPage;