// src/pages/ProductionSections/FlatteningSection/FlatteningPage.jsx
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
  FiTarget,
  FiBarChart2,
  FiPrinter,
  FiArrowLeft,
  FiEye,
  FiHome,
  FiTrendingUp,
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
  FiBarChart,
  FiHash,
  FiPercent,
  FiTrendingDown,
  FiFile,
  FiZap,
  FiChevronUp,
  FiChevronDown,
  FiBook, // ✅ نیا آئیکن اضافہ کیا (Inventory Ledger کے لیے)
} from "react-icons/fi";
import { supabase } from "../../../supabaseClient";
import FlatteningForm from "./FlatteningForm";
import "./FlatteningPage.css";

// Floating Particles Component
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

// Enhanced Stat Card Component
const EnhancedStatCard = ({ card, stats, isSupabaseConnected }) => {
  const cardColors = {
    "today-records": { color: "#10b981", rgb: "16, 185, 129" },
    "today-production": { color: "#3b82f6", rgb: "59, 130, 246" },
    "today-efficiency": { color: "#f59e0b", rgb: "245, 158, 11" },
    yesterday: { color: "#8b5cf6", rgb: "139, 92, 246" },
    "total-records": { color: "#ec4899", rgb: "236, 72, 153" },
    "total-production": { color: "#06b6d4", rgb: "6, 182, 212" },
    "avg-efficiency": { color: "#f97316", rgb: "249, 115, 22" },
    "database-status": {
      color: isSupabaseConnected ? "#10b981" : "#ef4444",
      rgb: isSupabaseConnected ? "16, 185, 129" : "239, 68, 68",
    },
  };

  const currentColor = cardColors[card.id] || {
    color: "#3b82f6",
    rgb: "59, 130, 246",
  };

  return (
    <div
      key={card.id}
      className="stat-card-enhanced slide-in-left"
      style={{
        "--card-color": currentColor.color,
        "--card-color-rgb": currentColor.rgb,
        animationDelay: `${card.id.charCodeAt(0) * 0.1}s`,
      }}
    >
      <div className="stat-card-header">
        <div className="stat-icon-wrapper">
          <div className="stat-icon-enhanced">
            <card.icon size={16} />
          </div>
          <div className="stat-title-wrapper">
            <div className="stat-title-enhanced">{card.title}</div>
            {card.hasSubValue && (
              <div className="stat-subvalue">{card.subValue}</div>
            )}
          </div>
        </div>
        <div className="stat-trend">
          {card.id === "today-efficiency" && (
            <div
              className={`trend-${
                stats.todayEfficiency >= 80
                  ? "excellent"
                  : stats.todayEfficiency >= 60
                  ? "good"
                  : "poor"
              }`}
            >
              {stats.todayEfficiency >= 80
                ? "Excellent"
                : stats.todayEfficiency >= 60
                ? "Good"
                : "Needs Attention"}
            </div>
          )}
          {card.id === "database-status" && (
            <div
              className={`indicator-${
                isSupabaseConnected ? "achieved" : "not-achieved"
              }`}
            >
              {isSupabaseConnected ? "Connected" : "Offline"}
            </div>
          )}
        </div>
      </div>
      <div className="stat-card-body">
        <div
          className="stat-value-enhanced"
          style={{ color: card.valueColor || currentColor.color }}
        >
          {card.value}
        </div>
      </div>
      <div className="stat-card-footer">
        <div className="stat-description">{card.description}</div>
        {card.id === "today-efficiency" && (
          <div
            className={`indicator-${
              stats.todayEfficiency >= 80
                ? "excellent"
                : stats.todayEfficiency >= 60
                ? "good"
                : "poor"
            }`}
          >
            {stats.todayEfficiency >= 80
              ? "Excellent"
              : stats.todayEfficiency >= 60
              ? "Good"
              : "Poor"}
          </div>
        )}
      </div>
    </div>
  );
};

// PDF Report Modal Component
const PDFReportModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="modal-overlay">
      <div className="pdf-modal-container">
        <div className="pdf-modal-header">
          <h2>Flattening Section Production Report - PDF Preview</h2>
          <button className="close-pdf-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="pdf-content">
          <div className="pdf-header">
            <h1>{data.title}</h1>
            <div className="pdf-date">Date: {data.date}</div>
            <div className="pdf-generated">Generated: {data.generatedDate}</div>
          </div>

          <div className="pdf-summary">
            <h3>Summary</h3>
            <div className="pdf-summary-grid">
              <div className="pdf-summary-item">
                <div className="pdf-summary-label">Total Production</div>
                <div className="pdf-summary-value">
                  {data.summary.totalProduction} KG
                </div>
              </div>
              <div className="pdf-summary-item">
                <div className="pdf-summary-label">Total Target</div>
                <div className="pdf-summary-value">
                  {data.summary.totalTarget} KG
                </div>
              </div>
              <div className="pdf-summary-item">
                <div className="pdf-summary-label">Overall Efficiency</div>
                <div className="pdf-summary-value">
                  {data.summary.overallEfficiency}%
                </div>
              </div>
              <div className="pdf-summary-item">
                <div className="pdf-summary-label">Total Records</div>
                <div className="pdf-summary-value">
                  {data.summary.recordCount}
                </div>
              </div>
            </div>
          </div>

          {data.shiftWise.length > 0 && (
            <div className="pdf-section">
              <h3>Shift-wise Production</h3>
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th>Shift</th>
                    <th>Production (KG)</th>
                    <th>Target (KG)</th>
                    <th>Efficiency (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.shiftWise.map((shift, index) => (
                    <tr key={index}>
                      <td>{shift.shift}</td>
                      <td>{shift.production}</td>
                      <td>{shift.target}</td>
                      <td>{shift.efficiency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.machineWise.length > 0 && (
            <div className="pdf-section">
              <h3>Machine-wise Production</h3>
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th>Machine</th>
                    <th>Production (KG)</th>
                    <th>Efficiency (%)</th>
                    <th>Records</th>
                  </tr>
                </thead>
                <tbody>
                  {data.machineWise.map((machine, index) => (
                    <tr key={index}>
                      <td>{machine.machine}</td>
                      <td>{machine.production}</td>
                      <td>{machine.efficiency}</td>
                      <td>{machine.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.itemWise.length > 0 && (
            <div className="pdf-section">
              <h3>Item-wise Production</h3>
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Production (KG)</th>
                    <th>Efficiency (%)</th>
                    <th>Records</th>
                  </tr>
                </thead>
                <tbody>
                  {data.itemWise.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item}</td>
                      <td>{item.production}</td>
                      <td>{item.efficiency}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pdf-modal-actions">
            <button
              className="pdf-download-btn"
              onClick={() => {
                alert(
                  "PDF download functionality requires jsPDF library installation."
                );
                onClose();
              }}
            >
              <FiDownload /> Download as PDF
            </button>
            <button
              className="pdf-print-btn"
              onClick={() => {
                window.print();
                onClose();
              }}
            >
              <FiPrinter /> Print Report
            </button>
            <button className="pdf-close-btn" onClick={onClose}>
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Print Report Component
const PrintReport = ({ data }) => {
  return (
    <div className="print-report-container">
      <div className="print-header">
        <h1>Flattening Section Production Report</h1>
        <div className="print-date">{data.date}</div>
        <div className="print-generated">Generated: {data.generatedDate}</div>
      </div>

      <div className="print-summary">
        <h2>Summary</h2>
        <div className="print-summary-grid">
          <div className="print-summary-item">
            <div className="print-summary-label">Total Production</div>
            <div className="print-summary-value">
              {data.summary.totalProduction} KG
            </div>
          </div>
          <div className="print-summary-item">
            <div className="print-summary-label">Total Target</div>
            <div className="print-summary-value">
              {data.summary.totalTarget} KG
            </div>
          </div>
          <div className="print-summary-item">
            <div className="print-summary-label">Overall Efficiency</div>
            <div className="print-summary-value">
              {data.summary.overallEfficiency}%
            </div>
          </div>
          <div className="print-summary-item">
            <div className="print-summary-label">Total Records</div>
            <div className="print-summary-value">
              {data.summary.recordCount}
            </div>
          </div>
        </div>
      </div>

      {data.shiftWise.length > 0 && (
        <div className="print-section">
          <h2>Shift-wise Production</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Shift</th>
                <th>Production (KG)</th>
                <th>Target (KG)</th>
                <th>Efficiency (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.shiftWise.map((shift, index) => (
                <tr key={index}>
                  <td>{shift.shift}</td>
                  <td>{shift.production}</td>
                  <td>{shift.target}</td>
                  <td>{shift.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.machineWise.length > 0 && (
        <div className="print-section">
          <h2>Machine-wise Production</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Production (KG)</th>
                <th>Efficiency (%)</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {data.machineWise.map((machine, index) => (
                <tr key={index}>
                  <td>{machine.machine}</td>
                  <td>{machine.production}</td>
                  <td>{machine.efficiency}</td>
                  <td>{machine.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.itemWise.length > 0 && (
        <div className="print-section">
          <h2>Item-wise Production</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Production (KG)</th>
                <th>Efficiency (%)</th>
                <th>Records</th>
              </tr>
            </thead>
            <tbody>
              {data.itemWise.map((item, index) => (
                <tr key={index}>
                  <td>{item.item}</td>
                  <td>{item.production}</td>
                  <td>{item.efficiency}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="print-footer">
        <p>Flattening Section - Production Management System</p>
        <p>Report generated on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

// Main FlatteningPage Component
const FlatteningPage = () => {
  const navigate = useNavigate();
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
  const [pdfReportData, setPdfReportData] = useState(null);

  // ✅ YEH DO NAYE STATES ADD KARNE HAI - LINE 63-64 KE BAAD
  const [showStats, setShowStats] = useState(() => {
    // Local storage se state load karenge, default false
    const saved = localStorage.getItem("flattening_showStats");
    return saved ? JSON.parse(saved) : false;
  });

  const [showTodayProduction, setShowTodayProduction] = useState(() => {
    const saved = localStorage.getItem("flattening_showTodayProduction");
    return saved ? JSON.parse(saved) : false;
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Report data
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

  // Stats states
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

  // Check if supabase is connected
  const isSupabaseConnected = supabase && process.env.REACT_APP_SUPABASE_URL;

  // Stat cards
  const statCards = [
    {
      id: "today-records",
      title: "Today's Records",
      value: stats.todayRecords,
      icon: FiClock,
      description: "Records added today",
      gradientColors: ["#10b981", "#059669"],
      iconBg: "#10b981",
    },
    {
      id: "today-production",
      title: "Today's Production",
      value: `${stats.todayProduction.toLocaleString()} KG`,
      icon: FiPackage,
      description: "Production today",
      gradientColors: ["#3b82f6", "#1d4ed8"],
      iconBg: "#3b82f6",
    },
    {
      id: "today-efficiency",
      title: "Today's Efficiency",
      value: `${stats.todayEfficiency}%`,
      icon: FiActivity,
      description: "Efficiency today",
      colorValue: true,
      valueColor:
        stats.todayEfficiency >= 80
          ? "#059669"
          : stats.todayEfficiency >= 60
          ? "#d97706"
          : "#ef4444",
      gradientColors: ["#f59e0b", "#d97706"],
      iconBg: "#f59e0b",
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
      valueColor:
        stats.avgEfficiency >= 80
          ? "#059669"
          : stats.avgEfficiency >= 60
          ? "#d97706"
          : "#ef4444",
      gradientColors: ["#f97316", "#ea580c"],
      iconBg: "#f97316",
    },
    {
      id: "database-status",
      title: "Database Status",
      value: isSupabaseConnected ? "Connected" : "Offline",
      icon: isSupabaseConnected ? FiCheckCircle : FiXCircle,
      description: "Database connection status",
      gradientColors: isSupabaseConnected
        ? ["#10b981", "#059669"]
        : ["#ef4444", "#dc2626"],
      iconBg: isSupabaseConnected ? "#10b981" : "#ef4444",
      valueColor: isSupabaseConnected ? "#059669" : "#ef4444",
    },
  ];

  // ✅ State save karne ka function
  const saveToggleState = (key, value) => {
    localStorage.setItem(`flattening_${key}`, JSON.stringify(value));
  };

  // ✅ Toggle handlers
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

  // Fetch data function with useCallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Check if supabase is available
      if (!supabase) {
        return;
      }

      // Fetch targets from targets table
      const { data: targetsData } = await supabase
        .from("targets")
        .select("*")
        .eq("section", "Flattening")
        .eq("is_active", true);

      // Fetch records from flatteningsection table
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

  // Calculate stats
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

    const totalEfficiency = recordsData.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const avgEfficiency =
      recordsData.length > 0 ? totalEfficiency / recordsData.length : 0;

    const yesterdayProduction = yesterdayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.production_quantity) || 0),
      0
    );

    const yesterdayTotalEfficiency = yesterdayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const yesterdayEfficiency =
      yesterdayRecords.length > 0
        ? yesterdayTotalEfficiency / yesterdayRecords.length
        : 0;

    // Today's stats
    const todayProduction = todayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.production_quantity) || 0),
      0
    );

    const todayTotalEfficiency = todayRecords.reduce(
      (sum, record) => sum + (parseFloat(record.efficiency) || 0),
      0
    );

    const todayEfficiency =
      todayRecords.length > 0 ? todayTotalEfficiency / todayRecords.length : 0;

    // Machine-wise today production
    const machineWiseToday = {};
    const itemWiseToday = {};
    const shiftWiseToday = {};

    todayRecords.forEach((record) => {
      // Machine data
      const machine = record.machine_no || record.machine_id || "Unknown";
      if (!machineWiseToday[machine]) {
        machineWiseToday[machine] = {
          production: 0,
          efficiency: 0,
          count: 0,
        };
      }
      machineWiseToday[machine].production +=
        parseFloat(record.production_quantity) || 0;
      machineWiseToday[machine].efficiency +=
        parseFloat(record.efficiency) || 0;
      machineWiseToday[machine].count += 1;

      // Item data
      const item = record.item_name || "Unknown";
      if (!itemWiseToday[item]) {
        itemWiseToday[item] = {
          production: 0,
          efficiency: 0,
          count: 0,
        };
      }
      itemWiseToday[item].production +=
        parseFloat(record.production_quantity) || 0;
      itemWiseToday[item].efficiency += parseFloat(record.efficiency) || 0;
      itemWiseToday[item].count += 1;

      // Shift data
      const shift = record.shift_code || record.shift || "Unknown";
      if (!shiftWiseToday[shift]) {
        shiftWiseToday[shift] = {
          production: 0,
          efficiency: 0,
          count: 0,
        };
      }
      shiftWiseToday[shift].production +=
        parseFloat(record.production_quantity) || 0;
      shiftWiseToday[shift].efficiency += parseFloat(record.efficiency) || 0;
      shiftWiseToday[shift].count += 1;
    });

    // Calculate average efficiency for each machine
    Object.keys(machineWiseToday).forEach((machine) => {
      if (machineWiseToday[machine].count > 0) {
        machineWiseToday[machine].efficiency =
          machineWiseToday[machine].efficiency /
          machineWiseToday[machine].count;
      }
    });

    // Calculate average efficiency for each item
    Object.keys(itemWiseToday).forEach((item) => {
      if (itemWiseToday[item].count > 0) {
        itemWiseToday[item].efficiency =
          itemWiseToday[item].efficiency / itemWiseToday[item].count;
      }
    });

    // Calculate average efficiency for each shift
    Object.keys(shiftWiseToday).forEach((shift) => {
      if (shiftWiseToday[shift].count > 0) {
        shiftWiseToday[shift].efficiency =
          shiftWiseToday[shift].efficiency / shiftWiseToday[shift].count;
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

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      (record.section_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.machine_id?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.operator_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (record.item_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const recordShift = record.shift_code || record.shift || "";
    const matchesShift = !filterShift || recordShift === filterShift;

    const recordDate = new Date(record.created_at).toISOString().split("T")[0];
    const matchesDate = !filterDate || recordDate === filterDate;

    return matchesSearch && matchesShift && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Generate report with useCallback
  const generateReport = useCallback(
    (selectedDate) => {
      if (!records || records.length === 0) return;

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

        // Shift groups
        if (!shiftGroups[shift]) {
          shiftGroups[shift] = {
            production: 0,
            target: 0,
            efficiency: 0,
            records: [],
          };
        }

        shiftGroups[shift].production += qty;
        totalProduction += qty;
        shiftGroups[shift].records.push(record);

        // Machine production
        if (!machineProduction[machine]) {
          machineProduction[machine] = {
            production: 0,
            efficiency: 0,
            count: 0,
          };
        }
        machineProduction[machine].production += qty;
        machineProduction[machine].efficiency +=
          parseFloat(record.efficiency) || 0;
        machineProduction[machine].count += 1;

        // Item production
        if (!itemProduction[item]) {
          itemProduction[item] = {
            production: 0,
            efficiency: 0,
            count: 0,
          };
        }
        itemProduction[item].production += qty;
        itemProduction[item].efficiency += parseFloat(record.efficiency) || 0;
        itemProduction[item].count += 1;

        // Find target
        const targetRecord = targets.find(
          (t) => t.shift_code === shift && t.machine_id === record.machine_id
        );

        if (targetRecord) {
          shiftGroups[shift].target += targetRecord.target_qty;
          totalTarget += targetRecord.target_qty;
        }
      });

      // Calculate efficiency
      Object.keys(shiftGroups).forEach((shift) => {
        const group = shiftGroups[shift];
        group.efficiency =
          group.target > 0 ? (group.production / group.target) * 100 : 0;
      });

      // Calculate average efficiency for each machine
      Object.keys(machineProduction).forEach((machine) => {
        if (machineProduction[machine].count > 0) {
          machineProduction[machine].efficiency =
            machineProduction[machine].efficiency /
            machineProduction[machine].count;
        }
      });

      // Calculate average efficiency for each item
      Object.keys(itemProduction).forEach((item) => {
        if (itemProduction[item].count > 0) {
          itemProduction[item].efficiency =
            itemProduction[item].efficiency / itemProduction[item].count;
        }
      });

      const overallEfficiency =
        totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;

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

  // Handle report generation when date changes
  useEffect(() => {
    if (filterDate) {
      generateReport(filterDate);
    }
  }, [filterDate, generateReport]);

  // Generate PDF Report Data
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
      shiftWise: Object.entries(reportData.shiftGroups).map(
        ([shift, data]) => ({
          shift,
          production: data.production.toFixed(1),
          target: data.target.toFixed(1),
          efficiency: data.efficiency.toFixed(1),
        })
      ),
      machineWise: Object.entries(reportData.machineProduction).map(
        ([machine, data]) => ({
          machine,
          production: data.production.toFixed(1),
          efficiency: data.efficiency.toFixed(1),
          count: data.count,
        })
      ),
      itemWise: Object.entries(reportData.itemProduction).map(
        ([item, data]) => ({
          item,
          production: data.production.toFixed(1),
          efficiency: data.efficiency.toFixed(1),
          count: data.count,
        })
      ),
    };

    setPdfReportData(pdfData);
    setShowPDFModal(true);
  };

  // Generate Print Report Data
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
      shiftWise: Object.entries(reportData.shiftGroups).map(
        ([shift, data]) => ({
          shift,
          production: data.production.toFixed(1),
          target: data.target.toFixed(1),
          efficiency: data.efficiency.toFixed(1),
        })
      ),
      machineWise: Object.entries(reportData.machineProduction).map(
        ([machine, data]) => ({
          machine,
          production: data.production.toFixed(1),
          efficiency: data.efficiency.toFixed(1),
          count: data.count,
        })
      ),
      itemWise: Object.entries(reportData.itemProduction).map(
        ([item, data]) => ({
          item,
          production: data.production.toFixed(1),
          efficiency: data.efficiency.toFixed(1),
          count: data.count,
        })
      ),
    };

    setPdfReportData(printData);
    setShowPrintModal(true);
  };

  // Handlers
  const handleEdit = (id) => {
    navigate(`/production-sections/flattening/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/production-sections/flattening/view/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await supabase.from("flatteningsection").delete().eq("id", id);

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
        "Section",
        "Machine ID",
        "Machine No",
        "Item Name",
        "Production (KG)",
        "Coil Size",
        "Shift",
        "Operator",
        "Efficiency %",
        "Remarks",
        "Created At",
      ],
      ...filteredRecords.map((record) => [
        record.id,
        `"${record.section_name || "Flattening"}"`,
        `"${record.machine_id || ""}"`,
        `"${record.machine_no || ""}"`,
        `"${record.item_name || ""}"`,
        parseFloat(record.production_quantity) || 0,
        `"${record.coil_size || ""}"`,
        `"${record.shift_code || record.shift || ""}"`,
        `"${record.operator_name || ""}"`,
        parseFloat(record.efficiency) || 0,
        `"${record.remarks || ""}"`,
        `"${new Date(record.created_at).toLocaleString()}"`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flattening-records-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print report function
  const handlePrintReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to print");
      return;
    }

    generatePrintReport();
  };

  // Export report
  const handleExportReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to export");
      return;
    }

    const csvContent = [
      ["Flattening Section Production Report", reportData.formattedDate],
      [],
      ["Shift", "Production (KG)", "Target (KG)", "Efficiency (%)"],
      ...Object.entries(reportData.shiftGroups).map(([shift, data]) => [
        shift,
        data.production.toFixed(1),
        data.target.toFixed(1),
        data.efficiency.toFixed(1),
      ]),
      [],
      ["Machine-wise Production"],
      ["Machine", "Production (KG)", "Efficiency (%)"],
      ...Object.entries(reportData.machineProduction).map(([machine, data]) => [
        machine,
        data.production.toFixed(1),
        data.efficiency.toFixed(1),
      ]),
      [],
      ["Item-wise Production"],
      ["Item", "Production (KG)", "Efficiency (%)"],
      ...Object.entries(reportData.itemProduction).map(([item, data]) => [
        item,
        data.production.toFixed(1),
        data.efficiency.toFixed(1),
      ]),
      [],
      ["SUMMARY"],
      ["Total Production (KG):", reportData.totalProduction.toFixed(1)],
      ["Total Target (KG):", reportData.totalTarget.toFixed(1)],
      ["Overall Efficiency (%):", reportData.overallEfficiency.toFixed(1)],
      ["Total Records:", reportData.recordCount],
      [],
      ["Generated on:", new Date().toLocaleString()],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flattening-report-${filterDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get unique values for filters
  const uniqueShiftCodes = [
    ...new Set(
      records.map((record) => record.shift_code || record.shift).filter(Boolean)
    ),
  ].sort();

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

  // Handle back button - go to /production
  const handleBack = () => {
    navigate("/production");
  };

  // Render loading state
  if (loading && records.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <h3>Loading Flattening Section Data...</h3>
        <p className="loading-subtext">Fetching records from database</p>
      </div>
    );
  }

  return (
    <div className="flattening-container">
      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* Database Status Banner */}
      {!isSupabaseConnected && (
        <div className="database-alert slide-in-left">
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

      {/* ✅ Header Section - نئے بٹن یہاں شامل ہوئے ہیں */}
      <div className="header-section fade-in-up">
        <div>
          <div className="breadcrumb-nav">
            <button onClick={handleBack} className="breadcrumb-btn back-btn">
              <FiArrowLeft size={16} /> Back
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="breadcrumb-btn"
            >
              <FiHome size={16} /> Dashboard
            </button>
            <button
              onClick={() => navigate("/production")}
              className="breadcrumb-btn secondary"
            >
              <FiGrid size={16} /> Production Sections
            </button>
          </div>
          <div className="title-section">
            <div className="title-icon">
              <FiPackage size={28} />
            </div>
            <div>
              <h1 className="page-title">
                Flattening Section Production
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
                Data from: flatteningsection table • Total Records:{" "}
                {stats.totalRecords}
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => setShowFlatteningModal(true)}
            className="btn btn-primary"
          >
            <FiPlus size={20} /> New Flattening Entry
          </button>

          <div className="action-buttons">
            <button
              className="btn btn-secondary btn-border"
              onClick={() => navigate("/production-sections/flattening/new")}
            >
              <FiPlus /> Single Entry
            </button>

            <button
              className="btn btn-secondary btn-border"
              onClick={() =>
                navigate("/production-sections/flattening/multi-entry")
              }
            >
              <FiGrid /> Multi-Entry
            </button>

            <button
              className="btn btn-secondary btn-border"
              onClick={() =>
                navigate("/production-sections/flattening/smart-entry")
              }
            >
              <FiZap /> Smart Entry
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={records.length === 0}
            className="btn btn-secondary"
          >
            <FiDownload /> Export CSV
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
                <FiRefreshCw /> Refresh
              </>
            )}
          </button>

          {/* ✅ نیا بٹن: INVENTORY REPORT BUTTON - ہرا رنگ */}
          <button
            onClick={() => navigate("/flattening-inventory")}
            className="btn btn-secondary"
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
            }}
          >
            <FiBarChart2 size={16} /> Inventory Report
          </button>

          {/* ✅ نیا بٹن: INVENTORY LEDGER BUTTON - گہرا نیلا رنگ، بائیں طرف سرخ بارڈر */}
          <button
            onClick={() => navigate("/flattening-ledger")}
            className="btn btn-secondary"
            style={{
              background: "#2c3e50",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "600",
              borderLeft: "3px solid #c0392b",
            }}
          >
            <FiBook size={16} /> Inventory Ledger
          </button>

          {/* ✅ STATS TOGGLE BUTTON */}
          <button
            onClick={toggleStats}
            className="btn btn-tertiary"
            title={showStats ? "Hide Statistics" : "Show Statistics"}
          >
            {showStats ? (
              <>
                <FiChevronUp size={16} /> Hide Stats
              </>
            ) : (
              <>
                <FiChevronDown size={16} /> Show Stats
              </>
            )}
          </button>

          {/* ✅ TODAY'S PRODUCTION TOGGLE BUTTON */}
          <button
            onClick={toggleTodayProduction}
            className="btn btn-tertiary"
            title={
              showTodayProduction
                ? "Hide Today's Production"
                : "Show Today's Production"
            }
          >
            {showTodayProduction ? (
              <>
                <FiChevronUp size={16} /> Hide Today's
              </>
            ) : (
              <>
                <FiChevronDown size={16} /> Show Today's
              </>
            )}
          </button>
        </div>
      </div>

      {/* ✅ Stats Cards - TOGGLE BASED ON STATE - LINE 260 */}
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

      {/* ✅ Today's Production & Efficiency Section - TOGGLE BASED ON STATE - LINE 275 */}
      {showTodayProduction && (
        <div className="today-production-section fade-in-up">
          <div className="section-header">
            <div className="header-icon">
              <FiBarChart size={28} />
            </div>
            <div className="section-header-content">
              <h2>Today's Production & Efficiency</h2>
              <p className="section-subtitle">
                Real-time production data for today
              </p>
            </div>
          </div>

          <div className="production-analysis-container">
            {/* Machine-wise Production */}
            <div className="machine-analysis">
              <div className="analysis-header">
                <h3>Machine-wise Production</h3>
                <div className="analysis-summary">
                  {Object.keys(stats.machineWiseToday).length} Machines Active
                </div>
              </div>
              <div className="machine-analysis-grid">
                {Object.entries(stats.machineWiseToday).length > 0 ? (
                  Object.entries(stats.machineWiseToday).map(
                    ([machine, data]) => {
                      const efficiencyStatus =
                        data.efficiency >= 80
                          ? "good"
                          : data.efficiency >= 60
                          ? "average"
                          : "poor";
                      return (
                        <div key={machine} className="machine-analysis-card">
                          <div className="machine-analysis-header">
                            <div className="machine-analysis-icon">
                              <FiTool size={16} />
                            </div>
                            <div className="machine-analysis-name">
                              {machine}
                            </div>
                            <div
                              className={`machine-status status-${efficiencyStatus}`}
                            />
                          </div>
                          <div className="machine-analysis-stats">
                            <div className="production-stats">
                              <div
                                className={`production-value value-${efficiencyStatus}`}
                              >
                                {data.production.toFixed(0)}
                              </div>
                              <div className="production-label">
                                KG Produced
                              </div>
                            </div>
                            <div className="efficiency-stats">
                              <div
                                className={`efficiency-value value-${efficiencyStatus}`}
                              >
                                {data.efficiency.toFixed(1)}%
                              </div>
                              <div className="efficiency-label">Efficiency</div>
                            </div>
                          </div>
                          <div className="machine-analysis-footer">
                            <div className="performance-bar">
                              <div
                                className="performance-fill"
                                style={{
                                  width: `${Math.min(data.efficiency, 100)}%`,
                                  background:
                                    data.efficiency >= 80
                                      ? "#10b981"
                                      : data.efficiency >= 60
                                      ? "#f59e0b"
                                      : "#ef4444",
                                }}
                              />
                            </div>
                            <div
                              className={`performance-indicator indicator-${efficiencyStatus}`}
                            >
                              {efficiencyStatus === "good"
                                ? "Excellent"
                                : efficiencyStatus === "average"
                                ? "Good"
                                : "Needs Improvement"}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="no-production">
                    <FiTool size={24} />
                    <div>No machine production recorded today</div>
                  </div>
                )}
              </div>
            </div>

            {/* Item-wise Production */}
            <div className="item-analysis">
              <div className="analysis-header">
                <h3>Item-wise Production</h3>
                <div className="analysis-summary">
                  {Object.keys(stats.itemWiseToday).length} Items Produced
                </div>
              </div>
              <div className="item-analysis-grid">
                {Object.entries(stats.itemWiseToday).length > 0 ? (
                  Object.entries(stats.itemWiseToday).map(([item, data]) => {
                    const efficiencyStatus =
                      data.efficiency >= 80
                        ? "good"
                        : data.efficiency >= 60
                        ? "average"
                        : "poor";
                    return (
                      <div key={item} className="item-analysis-card">
                        <div className="item-analysis-header">
                          <div className="item-analysis-icon">
                            <FiTag size={16} />
                          </div>
                          <div className="item-analysis-name">{item}</div>
                          <div
                            className={`machine-status status-${efficiencyStatus}`}
                          />
                        </div>
                        <div className="item-analysis-stats">
                          <div className="production-stats">
                            <div
                              className={`production-value value-${efficiencyStatus}`}
                            >
                              {data.production.toFixed(0)}
                            </div>
                            <div className="production-label">KG Produced</div>
                          </div>
                          <div className="efficiency-stats">
                            <div
                              className={`efficiency-value value-${efficiencyStatus}`}
                            >
                              {data.efficiency.toFixed(1)}%
                            </div>
                            <div className="efficiency-label">Efficiency</div>
                          </div>
                        </div>
                        <div className="item-analysis-footer">
                          <div className="performance-bar">
                            <div
                              className="performance-fill"
                              style={{
                                width: `${Math.min(data.efficiency, 100)}%`,
                                background:
                                  data.efficiency >= 80
                                    ? "#10b981"
                                    : data.efficiency >= 60
                                    ? "#f59e0b"
                                    : "#ef4444",
                              }}
                            />
                          </div>
                          <div
                            className={`performance-indicator indicator-${efficiencyStatus}`}
                          >
                            {efficiencyStatus === "good"
                              ? "Excellent"
                              : efficiencyStatus === "average"
                              ? "Good"
                              : "Needs Improvement"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-production">
                    <FiTag size={24} />
                    <div>No items recorded today</div>
                  </div>
                )}
              </div>
            </div>

            {/* Shift-wise Production */}
            <div className="shift-analysis">
              <div className="analysis-header">
                <h3>Shift-wise Production</h3>
                <div className="analysis-summary">
                  {Object.keys(stats.shiftWiseToday).length} Shifts Active
                </div>
              </div>
              <div className="shift-analysis-grid">
                {Object.entries(stats.shiftWiseToday).length > 0 ? (
                  Object.entries(stats.shiftWiseToday).map(([shift, data]) => {
                    const efficiencyStatus =
                      data.efficiency >= 80
                        ? "good"
                        : data.efficiency >= 60
                        ? "average"
                        : "poor";
                    return (
                      <div key={shift} className="shift-analysis-card">
                        <div className="shift-analysis-header">
                          <div className="shift-analysis-icon">
                            <FiClock size={16} />
                          </div>
                          <div className="shift-analysis-name">
                            Shift {shift}
                          </div>
                          <div
                            className={`machine-status status-${efficiencyStatus}`}
                          />
                        </div>
                        <div className="shift-analysis-stats">
                          <div className="production-stats">
                            <div
                              className={`production-value value-${efficiencyStatus}`}
                            >
                              {data.production.toFixed(0)}
                            </div>
                            <div className="production-label">KG Produced</div>
                          </div>
                          <div className="efficiency-stats">
                            <div
                              className={`efficiency-value value-${efficiencyStatus}`}
                            >
                              {data.efficiency.toFixed(1)}%
                            </div>
                            <div className="efficiency-label">Efficiency</div>
                          </div>
                        </div>
                        <div className="shift-analysis-footer">
                          <div className="performance-bar">
                            <div
                              className="performance-fill"
                              style={{
                                width: `${Math.min(data.efficiency, 100)}%`,
                                background:
                                  data.efficiency >= 80
                                    ? "#10b981"
                                    : data.efficiency >= 60
                                    ? "#f59e0b"
                                    : "#ef4444",
                              }}
                            />
                          </div>
                          <div
                            className={`performance-indicator indicator-${efficiencyStatus}`}
                          >
                            {data.count} records
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-production">
                    <FiClock size={24} />
                    <div>No shift data available</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section-enhanced slide-in-right">
        <div className="filter-section-header">
          <FiFilter size={20} />
          <h3>Filters & Reports</h3>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">
              <FiSearch /> Search Records
            </label>
            <input
              type="text"
              placeholder="Search by machine, operator, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input-enhanced"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <FiFilter /> Filter by Shift
            </label>
            <select
              value={filterShift}
              onChange={(e) => setFilterShift(e.target.value)}
              className="filter-select-enhanced"
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
              <FiCalendar /> Filter by Date
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
              className="filter-date-enhanced"
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
              <FiBarChart2 /> Generate Report
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
              <FiX /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Report Section */}
      {showReport && reportData && (
        <div className="report-section-enhanced fade-in-up">
          <div className="report-bg-pattern" />

          <div className="report-header-enhanced">
            <div className="report-title-section">
              <h2>Flattening Section Daily Report</h2>
              <div className="report-date-enhanced">
                <FiCalendar size={16} />
                {reportData.formattedDate}
              </div>
            </div>
            <div className="report-actions-enhanced">
              <button
                onClick={generatePDFReportData}
                className="btn btn-primary"
              >
                <FiFile size={16} /> View PDF Report
              </button>
              <button onClick={handlePrintReport} className="btn btn-secondary">
                <FiPrinter /> Print Report
              </button>
              <button
                onClick={handleExportReport}
                className="btn btn-secondary"
              >
                <FiDownload /> Export CSV
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="report-summary-cards">
            <div className="summary-card">
              <div className="summary-icon">
                <FiPackage size={24} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Production</div>
                <div className="summary-value">
                  {reportData.totalProduction.toFixed(1)} KG
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <FiTarget size={24} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Target</div>
                <div className="summary-value">
                  {reportData.totalTarget.toFixed(1)} KG
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <FiActivity size={24} />
              </div>
              <div className="summary-content">
                <div className="summary-label">Overall Efficiency</div>
                <div
                  className="summary-value"
                  style={{
                    color:
                      reportData.overallEfficiency >= 80
                        ? "#10b981"
                        : reportData.overallEfficiency >= 60
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                >
                  {reportData.overallEfficiency.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <FiDatabase size={24} />
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
              <h3>Shift-wise Production</h3>
              <div className="shift-report-grid">
                {Object.entries(reportData.shiftGroups).map(([shift, data]) => {
                  const efficiencyStatus =
                    data.efficiency >= 80
                      ? "excellent"
                      : data.efficiency >= 60
                      ? "good"
                      : "poor";
                  return (
                    <div key={shift} className="shift-report-card">
                      <div className="shift-report-header">
                        <div className="shift-name">Shift {shift}</div>
                        <div
                          className={`shift-status indicator-${efficiencyStatus}`}
                        >
                          {efficiencyStatus === "excellent"
                            ? "Excellent"
                            : efficiencyStatus === "good"
                            ? "Good"
                            : "Needs Attention"}
                        </div>
                      </div>
                      <div className="shift-report-stats">
                        <div className="stat-item">
                          <div className="stat-label">Production</div>
                          <div className="stat-value">
                            {data.production.toFixed(1)} KG
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label">Target</div>
                          <div className="stat-value">
                            {data.target.toFixed(1)} KG
                          </div>
                        </div>
                        <div className="stat-item">
                          <div className="stat-label">Efficiency</div>
                          <div
                            className="stat-value"
                            style={{
                              color:
                                data.efficiency >= 80
                                  ? "#10b981"
                                  : data.efficiency >= 60
                                  ? "#f59e0b"
                                  : "#ef4444",
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
              <h3>Machine-wise Production</h3>
              <div className="machine-report-list">
                {Object.entries(reportData.machineProduction).map(
                  ([machine, data]) => {
                    const efficiencyStatus =
                      data.efficiency >= 80
                        ? "excellent"
                        : data.efficiency >= 60
                        ? "good"
                        : "poor";
                    return (
                      <div key={machine} className="machine-report-item">
                        <div className="machine-report-header">
                          <div className="machine-report-name">
                            <FiTool size={16} />
                            {machine}
                          </div>
                          <div
                            className="machine-report-efficiency"
                            style={{
                              color:
                                data.efficiency >= 80
                                  ? "#10b981"
                                  : data.efficiency >= 60
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          >
                            {data.efficiency.toFixed(1)}%
                          </div>
                        </div>
                        <div className="machine-report-details">
                          <div className="detail-item">
                            <div className="detail-label">Production:</div>
                            <div className="detail-value">
                              {data.production.toFixed(1)} KG
                            </div>
                          </div>
                          <div className="detail-item">
                            <div className="detail-label">Records:</div>
                            <div className="detail-value">{data.count}</div>
                          </div>
                          <div
                            className={`detail-status indicator-${efficiencyStatus}`}
                          >
                            {efficiencyStatus === "excellent"
                              ? "Excellent"
                              : efficiencyStatus === "good"
                              ? "Good"
                              : "Needs Attention"}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* Item-wise Production */}
          {Object.keys(reportData.itemProduction).length > 0 && (
            <div className="report-section-block">
              <h3>Item-wise Production</h3>
              <div className="machine-report-list">
                {Object.entries(reportData.itemProduction).map(
                  ([item, data]) => {
                    const efficiencyStatus =
                      data.efficiency >= 80
                        ? "excellent"
                        : data.efficiency >= 60
                        ? "good"
                        : "poor";
                    return (
                      <div key={item} className="machine-report-item">
                        <div className="machine-report-header">
                          <div className="machine-report-name">
                            <FiTag size={16} />
                            {item}
                          </div>
                          <div
                            className="machine-report-efficiency"
                            style={{
                              color:
                                data.efficiency >= 80
                                  ? "#10b981"
                                  : data.efficiency >= 60
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          >
                            {data.efficiency.toFixed(1)}%
                          </div>
                        </div>
                        <div className="machine-report-details">
                          <div className="detail-item">
                            <div className="detail-label">Production:</div>
                            <div className="detail-value">
                              {data.production.toFixed(1)} KG
                            </div>
                          </div>
                          <div className="detail-item">
                            <div className="detail-label">Records:</div>
                            <div className="detail-value">{data.count}</div>
                          </div>
                          <div
                            className={`detail-status indicator-${efficiencyStatus}`}
                          >
                            {efficiencyStatus === "excellent"
                              ? "Excellent"
                              : efficiencyStatus === "good"
                              ? "Good"
                              : "Needs Attention"}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          <div className="report-footer-enhanced">
            <div className="report-footer-content">
              <div className="footer-info">
                <span>Report generated on {new Date().toLocaleString()}</span>
                <span>•</span>
                <span>Data source: flatteningsection table</span>
                <span>•</span>
                <span>Flattening Section - Production Management System</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="records-table-section-enhanced slide-in-left">
        <div className="table-header-section">
          <div className="table-header-left">
            <h2>Production Records</h2>
            <div className="table-stats">
              <div className="stat-item">
                <FiDatabase size={14} />
                Total: {records.length} records
              </div>
              <div className="stat-item">
                <FiFilter size={14} />
                Showing: {filteredRecords.length} filtered
              </div>
              <div className="stat-item">
                <FiHash size={14} />
                Page: {currentPage}/{totalPages}
              </div>
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
            <div className="loading-text">
              Loading records from flatteningsection...
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-records">
            <div className="empty-icon">
              <FiPackage size={48} />
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
                <FiPlus /> Create First Record
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="table-container-enhanced">
              <table className="production-table-enhanced">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Machine</th>
                    <th>Item Details</th>
                    <th>Production Quantity</th>
                    <th>Shift</th>
                    <th>Operator Name</th>
                    <th>Efficiency</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => {
                    const efficiencyClass =
                      record.efficiency >= 80
                        ? "good"
                        : record.efficiency >= 70
                        ? "average"
                        : "poor";
                    const shiftClass = ["A", "B", "C"].includes(
                      record.shift_code || record.shift
                    )
                      ? record.shift_code || record.shift
                      : "default";

                    return (
                      <tr
                        key={record.id}
                        className={index % 2 === 0 ? "even" : "odd"}
                      >
                        <td className="id-cell">#{record.id}</td>

                        <td>
                          <div className="machine-cell">
                            <div className="machine-icon">
                              <FiTool size={16} />
                            </div>
                            <div className="machine-details">
                              <div className="machine-id">
                                {record.machine_id || "N/A"}
                              </div>
                              <div className="machine-number">
                                {record.machine_no || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="item-cell">
                            <div className="item-icon">
                              <FiPackage size={16} />
                            </div>
                            <div className="item-details">
                              <div className="item-name">
                                {record.item_name || "N/A"}
                              </div>
                              <div className="item-size">
                                {record.coil_size || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="production-cell">
                          <div className="production-info">
                            <div className="production-row">
                              <span className="label">Production:</span>
                              <span className="value">
                                {parseFloat(
                                  record.production_quantity
                                ).toLocaleString()}{" "}
                                KG
                              </span>
                            </div>
                            <div className="production-row">
                              <span className="label">Target:</span>
                              <span className="value">
                                {parseFloat(
                                  record.target_qty || 0
                                ).toLocaleString()}{" "}
                                KG
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className={`shift-badge ${shiftClass}`}>
                            {record.shift_code || record.shift || "N/A"}
                          </div>
                        </td>

                        <td>
                          <div className="operator-cell">
                            <div className="operator-avatar">
                              {record.operator_name?.charAt(0) || "U"}
                            </div>
                            <div className="operator-details">
                              <div className="operator-name">
                                {record.operator_name || "Unknown"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className={`efficiency-cell ${efficiencyClass}`}>
                            {record.efficiency
                              ? `${parseFloat(record.efficiency).toFixed(1)}%`
                              : "N/A"}
                          </div>
                        </td>

                        <td>
                          <div className="datetime-cell">
                            <div className="date-part">
                              {new Date(record.created_at).toLocaleDateString(
                                "en-GB"
                              )}
                            </div>
                            <div className="time-part">
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

                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button
                              onClick={() => handleView(record.id)}
                              className="view-btn"
                              title="View"
                            >
                              <FiEye size={14} />
                            </button>
                            <button
                              onClick={() => handleEdit(record.id)}
                              className="edit-btn"
                              title="Edit"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="delete-btn"
                              title="Delete"
                            >
                              <FiTrash2 size={14} />
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
                  Page {currentPage} of {totalPages} • Showing{" "}
                  {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredRecords.length)} of{" "}
                  {filteredRecords.length} records
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`pagination-btn ${
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
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="page-dots">...</span>
                    )}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`pagination-btn ${
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
      <div className="page-footer-enhanced fade-in-up">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-title">
              Flattening Section • Production Management System
            </div>
            <div className="footer-subtitle">
              Database: flatteningsection table • Last updated:{" "}
              {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="footer-right">
            <div
              className={`database-status ${
                isSupabaseConnected ? "connected" : "offline"
              }`}
            >
              <div
                className={`status-dot ${
                  isSupabaseConnected ? "connected" : "offline"
                }`}
              />
              {isSupabaseConnected
                ? "Supabase Database Connected"
                : "Database Connection Issue"}
            </div>
            <div className="footer-stats">
              {stats.totalRecords} total records • {stats.todayProduction} KG
              today • {stats.totalProduction.toLocaleString()} KG total
              production
            </div>
          </div>
        </div>
        <div className="footer-actions">
          <button
            onClick={() => setShowFlatteningModal(true)}
            className="footer-btn add-btn"
          >
            <FiPlus size={14} /> New Flattening Entry
          </button>
          <button onClick={fetchData} className="footer-btn refresh-btn">
            <FiRefreshCw size={14} /> Refresh Data
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="footer-btn production-btn"
          >
            <FiTrendingUp size={14} /> View Dashboard
          </button>
        </div>
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
                <FiPrinter /> Print Now
              </button>
              <button
                className="print-modal-close-btn"
                onClick={() => setShowPrintModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlatteningPage;