// src/pages/ProductionSections/FlatteningSection/FlatteningPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../../contexts/ThemeContext';
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
  FiMenu,
  FiHome,
  FiArrowLeft,
  FiEyeOff,
  FiCpu,
  FiFeather,
  FiColumns,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { supabase } from "../../../supabaseClient";
import FlatteningForm from "./FlatteningForm";
import "./FlatteningPage.css";

// ============================================================
// PDF REPORT MODAL (SpiralPage جیسا)
// ============================================================
const PDFReportModal = ({ data, onClose }) => {
  const { isDarkMode } = useTheme();
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Flattening Section Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: white; color: black; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 12px; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #1e40af; color: white; padding: 10px; text-align: left; }
          td { padding: 8px 10px; border: 1px solid #1e40af; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
          .summary-card { border: 1px solid #1e40af; padding: 16px; border-radius: 8px; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Flattening Section Production Report</h1>
          <h2>${data.date}</h2>
          <p>Generated on: ${data.generatedDate}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Production</h3>
            <h2>${data.summary.totalProduction} KG</h2>
          </div>
          <div class="summary-card">
            <h3>Total Target</h3>
            <h2>${data.summary.totalTarget} KG</h2>
          </div>
          <div class="summary-card">
            <h3>Overall Efficiency</h3>
            <h2 style="color: ${data.summary.overallEfficiency >= 80 ? '#10b981' : data.summary.overallEfficiency >= 70 ? '#f59e0b' : '#ef4444'}">${data.summary.overallEfficiency}%</h2>
          </div>
          <div class="summary-card">
            <h3>Total Records</h3>
            <h2>${data.summary.recordCount}</h2>
          </div>
        </div>

        <h3>Shift-wise Production</h3>
        <table>
          <thead><tr><th>Shift</th><th>Production</th><th>Target</th><th>Efficiency</th></tr></thead>
          <tbody>
            ${data.shiftWise.map(s => `
              <tr>
                <td>Shift ${s.shift}</td>
                <td>${s.production} KG</td>
                <td>${s.target} KG</td>
                <td style="color: ${s.efficiency >= 80 ? '#10b981' : s.efficiency >= 70 ? '#f59e0b' : '#ef4444'}">${s.efficiency}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Machine-wise Production</h3>
        <table>
          <thead><tr><th>Machine</th><th>Production</th><th>Efficiency</th><th>Records</th></tr></thead>
          <tbody>
            ${data.machineWise.map(m => `
              <tr>
                <td>${m.machine}</td>
                <td>${m.production} KG</td>
                <td style="color: ${m.efficiency >= 80 ? '#10b981' : m.efficiency >= 70 ? '#f59e0b' : '#ef4444'}">${m.efficiency}%</td>
                <td>${m.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated via Pakistan Wire Industries ERP</p>
          <button class="no-print" onclick="window.print()" style="background: #1e40af; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 20px;">Print Report</button>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FiFile size={22} />
            PDF Report Preview
          </h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="pdf-preview">
            <div className="pdf-summary">
              <div className="pdf-summary-item">
                <FiPackage size={20} />
                <div>
                  <small>Production</small>
                  <strong>{data.summary.totalProduction} KG</strong>
                </div>
              </div>
              <div className="pdf-summary-item">
                <FiTarget size={20} />
                <div>
                  <small>Target</small>
                  <strong>{data.summary.totalTarget} KG</strong>
                </div>
              </div>
              <div className="pdf-summary-item">
                <FiActivity size={20} />
                <div>
                  <small>Efficiency</small>
                  <strong style={{ color: data.summary.overallEfficiency >= 80 ? '#10b981' : data.summary.overallEfficiency >= 70 ? '#f59e0b' : '#ef4444' }}>
                    {data.summary.overallEfficiency}%
                  </strong>
                </div>
              </div>
              <div className="pdf-summary-item">
                <FiDatabase size={20} />
                <div>
                  <small>Records</small>
                  <strong>{data.summary.recordCount}</strong>
                </div>
              </div>
            </div>
            
            <div className="pdf-preview-actions">
              <button onClick={handlePrint} className="pdf-print-btn">
                <FiPrinter size={18} /> Print / Save PDF
              </button>
              <button onClick={onClose} className="pdf-close-btn">
                <FiX size={18} /> Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// WHATSAPP REPORT MODAL (SpiralPage جیسا)
// ============================================================
const WhatsAppReport = ({ data, onClose }) => {
  const { isDarkMode } = useTheme();
  
  const generateMessage = () => {
    let message = `📊 *FLATTENING SECTION PRODUCTION REPORT*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📅 Date: ${data.date}\n`;
    message += `👤 Generated by: Admin\n\n`;
    message += `📈 *SUMMARY*\n`;
    message += `• Total Production: ${data.summary.totalProduction} KG\n`;
    message += `• Total Target: ${data.summary.totalTarget} KG\n`;
    message += `• Overall Efficiency: ${data.summary.overallEfficiency >= 80 ? '🌟' : data.summary.overallEfficiency >= 70 ? '✅' : '⚠️'} ${data.summary.overallEfficiency}%\n`;
    message += `• Total Records: ${data.summary.recordCount}\n\n`;

    if (data.shiftWise && data.shiftWise.length > 0) {
      message += `🕒 *SHIFT WISE*\n`;
      data.shiftWise.forEach(s => {
        message += `  Shift ${s.shift}: ${s.production} KG | ${s.efficiency}%\n`;
      });
      message += `\n`;
    }

    if (data.machineWise && data.machineWise.length > 0) {
      message += `🏭 *MACHINE WISE*\n`;
      data.machineWise.slice(0, 5).forEach(m => {
        message += `  ${m.machine}: ${m.production} KG | ${m.efficiency}%\n`;
      });
      message += `\n`;
    }

    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `✅ Generated via Pakistan Wire Industries ERP`;
    return message;
  };

  const sendViaWhatsApp = () => {
    const message = encodeURIComponent(generateMessage());
    window.open(`https://wa.me/?text=${message}`, '_blank');
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateMessage());
    alert("Report copied to clipboard!");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaWhatsapp size={22} />
            Send Report via WhatsApp
          </h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
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
              <button onClick={sendViaWhatsApp} className="whatsapp-option-btn whatsapp-desktop-btn">
                <FaWhatsapp size={20} /> <span>WhatsApp</span>
              </button>
              <button onClick={copyToClipboard} className="whatsapp-option-btn copy-message-btn">
                <FiDownload size={20} /> <span>Copy</span>
              </button>
              <button onClick={onClose} className="whatsapp-option-btn close-btn">
                <FiX size={20} /> <span>Close</span>
              </button>
            </div>
          </div>
          <div className="preview-section">
            <h4>
              <FiEye size={16} /> Message Preview
            </h4>
            <div className="message-preview">
              {generateMessage()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// EXCEL EXPORT MODAL (بہتر ورژن)
// ============================================================
const ExcelExportModal = ({ records, onClose }) => {
  const { isDarkMode } = useTheme();
  
  const handleExport = () => {
    if (!records || records.length === 0) {
      alert("No records to export");
      return;
    }

    const headers = [
      "ID", "Machine ID", "Machine No", "Item Name", "Coil Size",
      "Production (KG)", "Target (KG)", "Efficiency %", "Operator",
      "User", "Shift", "Created At"
    ];

    const csvRows = records.map(record => [
      record.id,
      record.machine_id || '',
      record.machine_no || '',
      record.item_name || '',
      record.coil_size || '',
      record.production_quantity || 0,
      record.target_qty || 0,
      record.efficiency || 0,
      record.operator_name || '',
      record.user_name || '',
      record.shift || record.shift_code || '',
      new Date(record.created_at).toLocaleString()
    ]);

    const csvContent = [headers, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flattening-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FiDownload size={22} />
            Export to CSV
          </h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="export-info">
            <FiDatabase size={48} />
            <h3>{records.length} Records</h3>
            <p>Ready to export to CSV format</p>
          </div>
          <div className="export-actions">
            <button onClick={handleExport} className="export-confirm-btn">
              <FiDownload size={18} /> Export Now
            </button>
            <button onClick={onClose} className="export-cancel-btn">
              <FiX size={18} /> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// REMARKS MODAL (SpiralPage جیسا)
// ============================================================
const RemarksModal = ({ remarks, id, onClose, isDarkMode }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-container remarks-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>
          <FiMessageSquare size={22} />
          Remarks Details
        </h2>
        <button className="modal-close-btn" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <div className="remarks-modal-content">
          <div className="remarks-icon-container">
            <FiMessageSquare size={36} color={isDarkMode ? '#93c5fd' : '#2563eb'} />
          </div>
          <h3>Record ID: #{id}</h3>
          <div className="remarks-full-text">
            {remarks || "No remarks available"}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// PRODUCTION INFO COMPONENT
// ============================================================
const ProductionInfo = ({ production, target }) => {
  const { isDarkMode } = useTheme();
  
  const prodQty = parseFloat(production) || 0;
  const targetQty = parseFloat(target) || 0;
  const efficiency = targetQty > 0 ? (prodQty / targetQty) * 100 : 0;
  
  const getEfficiencyColor = (eff) => {
    if (eff >= 80) return "#10b981";
    if (eff >= 70) return "#f59e0b";
    if (eff >= 60) return "#f97316";
    return "#ef4444";
  };

  const efficiencyColor = getEfficiencyColor(efficiency);

  return (
    <div className={`production-info-detailed ${isDarkMode ? 'dark' : ''}`}>
      <div className="production-row-detailed">
        <span className="production-label-detailed">
          <FiPackage size={12} /> Prod:
        </span>
        <span className="production-value-detailed main-value">
          {prodQty.toLocaleString()} KG
        </span>
      </div>
      <div className="production-row-detailed">
        <span className="production-label-detailed">
          <FiTarget size={12} /> Tgt:
        </span>
        <span className="production-value-detailed target-value">
          {targetQty.toLocaleString()} KG
        </span>
      </div>
      <div className="production-row-detailed">
        <span className="production-label-detailed">
          <FiPercent size={12} /> Eff:
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

// ============================================================
// MAIN FLATTENING PAGE COMPONENT
// ============================================================
const FlatteningPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  // ============================================================
  // STATE DECLARATIONS
  // ============================================================
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShift, setFilterShift] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [targets, setTargets] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [selectedRemarks, setSelectedRemarks] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [showFlatteningModal, setShowFlatteningModal] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  
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

  // ============================================================
  // EFFICIENCY FUNCTIONS
  // ============================================================
  const getEfficiencyColor = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return '#10b981';
    if (eff >= 70) return '#f59e0b';
    if (eff >= 60) return '#f97316';
    return '#ef4444';
  };

  const getEfficiencyClass = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return 'efficiency-excellent';
    if (eff >= 70) return 'efficiency-good';
    if (eff >= 60) return 'efficiency-average';
    return 'efficiency-poor';
  };

  const getEfficiencyEmoji = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return '🌟';
    if (eff >= 70) return '✅';
    if (eff >= 60) return '⚠️';
    return '❌';
  };

  // ============================================================
  // STAT CARDS
  // ============================================================
  const statCards = [
    { id: "total-records", title: "Total Records", value: stats.totalRecords, icon: FiDatabase, color: isDarkMode ? '#60a5fa' : '#1e40af' },
    { id: "total-production", title: "Total Production", value: `${Math.round(stats.totalProduction)} KG`, icon: FiColumns, color: isDarkMode ? '#34d399' : '#059669' },
    { id: "avg-efficiency", title: "Avg Efficiency", value: `${Math.round(stats.avgEfficiency)}%`, icon: FiTrendingUp, color: getEfficiencyColor(stats.avgEfficiency) },
    { id: "today-records", title: "Today's Records", value: stats.todayRecords, icon: FiCalendar, color: isDarkMode ? '#60a5fa' : '#2563eb' },
    { id: "today-production", title: "Today's Production", value: `${Math.round(stats.todayProduction)} KG`, icon: FiPackage, color: isDarkMode ? '#60a5fa' : '#1e40af' },
    { id: "today-efficiency", title: "Today's Efficiency", value: `${Math.round(stats.todayEfficiency)}%`, icon: FiActivity, color: getEfficiencyColor(stats.todayEfficiency) },
    { id: "database-status", title: "Database", value: isSupabaseConnected ? "Connected" : "Offline", icon: FiDatabase, color: isSupabaseConnected ? '#10b981' : '#ef4444' },
  ];

  // ============================================================
  // DATA FETCHING
  // ============================================================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!supabase) return;

      const [targetsRes, recordsRes] = await Promise.all([
        supabase.from("targets").select("*").eq("section", "Flattening").eq("is_active", true),
        supabase.from("flatteningsection").select("*").order("created_at", { ascending: false })
      ]);

      setTargets(targetsRes.data || []);
      setRecords(recordsRes.data || []);
      calculateStats(recordsRes.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================================
  // STATISTICS CALCULATION
  // ============================================================
  const calculateStats = (recordsData) => {
    if (!recordsData || recordsData.length === 0) {
      setStats({
        totalRecords: 0, todayRecords: 0, todayProduction: 0, todayEfficiency: 0,
        avgEfficiency: 0, yesterdayProduction: 0, yesterdayEfficiency: 0, totalProduction: 0,
        machineWiseToday: {}, itemWiseToday: {}, shiftWiseToday: {},
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const todayRecs = recordsData.filter(r => new Date(r.created_at).toISOString().split("T")[0] === today);
    const yesterdayRecs = recordsData.filter(r => new Date(r.created_at).toISOString().split("T")[0] === yesterday);

    const totalProd = recordsData.reduce((s, r) => s + (parseFloat(r.production_quantity) || 0), 0);
    const totalEff = recordsData.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0);
    const avgEff = recordsData.length > 0 ? totalEff / recordsData.length : 0;

    const todayProd = todayRecs.reduce((s, r) => s + (parseFloat(r.production_quantity) || 0), 0);
    const todayEffSum = todayRecs.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0);
    const todayEff = todayRecs.length > 0 ? todayEffSum / todayRecs.length : 0;

    const yesterdayProd = yesterdayRecs.reduce((s, r) => s + (parseFloat(r.production_quantity) || 0), 0);
    const yesterdayEffSum = yesterdayRecs.reduce((s, r) => s + (parseFloat(r.efficiency) || 0), 0);
    const yesterdayEff = yesterdayRecs.length > 0 ? yesterdayEffSum / yesterdayRecs.length : 0;

    const machineWiseToday = {};
    const itemWiseToday = {};
    const shiftWiseToday = {};

    todayRecs.forEach((record) => {
      const machine = record.machine_no || record.machine_id || "Unknown";
      if (!machineWiseToday[machine]) machineWiseToday[machine] = { production: 0, count: 0 };
      machineWiseToday[machine].production += parseFloat(record.production_quantity) || 0;
      machineWiseToday[machine].count += 1;

      const item = record.item_name || "Unknown";
      if (!itemWiseToday[item]) itemWiseToday[item] = { production: 0, count: 0 };
      itemWiseToday[item].production += parseFloat(record.production_quantity) || 0;
      itemWiseToday[item].count += 1;

      const shift = record.shift_code || record.shift || "Unknown";
      if (!shiftWiseToday[shift]) shiftWiseToday[shift] = { production: 0, count: 0 };
      shiftWiseToday[shift].production += parseFloat(record.production_quantity) || 0;
      shiftWiseToday[shift].count += 1;
    });

    setStats({
      totalRecords: recordsData.length,
      todayRecords: todayRecs.length,
      todayProduction: todayProd,
      todayEfficiency: parseFloat(todayEff.toFixed(1)),
      avgEfficiency: parseFloat(avgEff.toFixed(1)),
      yesterdayProduction: yesterdayProd,
      yesterdayEfficiency: parseFloat(yesterdayEff.toFixed(1)),
      totalProduction: totalProd,
      machineWiseToday,
      itemWiseToday,
      shiftWiseToday,
    });
  };

  // ============================================================
  // FILTERING & PAGINATION
  // ============================================================
  const filteredRecords = records.filter((record) => {
    const productionDateStr = record.production_date 
      ? new Date(record.production_date).toLocaleDateString("en-GB") 
      : "";
    
    const matchesSearch = 
      (record.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.machine_id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.operator_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.user_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.remarks?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      productionDateStr.includes(searchTerm);

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

  const uniqueShiftCodes = [...new Set(records.map(r => r.shift_code || r.shift).filter(Boolean))].sort();

  // ============================================================
  // REPORT GENERATION
  // ============================================================
  const generateReport = useCallback((selectedDate) => {
    if (!records || records.length === 0) return;

    const dateRecords = records.filter((record) => {
      const recordDate = new Date(record.created_at).toISOString().split("T")[0];
      return recordDate === selectedDate;
    });

    if (dateRecords.length === 0) {
      setReportData({
        date: selectedDate,
        formattedDate: new Date(selectedDate).toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        }),
        shiftGroups: {}, totalProduction: 0, totalTarget: 0, overallEfficiency: 0,
        recordCount: 0, machineProduction: {}, itemProduction: {},
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

      if (!shiftGroups[shift]) shiftGroups[shift] = { production: 0, target: 0, efficiency: 0, records: [] };
      shiftGroups[shift].production += qty;
      shiftGroups[shift].records.push(record);
      totalProduction += qty;

      if (!machineProduction[machine]) machineProduction[machine] = { production: 0, efficiency: 0, count: 0 };
      machineProduction[machine].production += qty;
      machineProduction[machine].efficiency += parseFloat(record.efficiency) || 0;
      machineProduction[machine].count += 1;

      if (!itemProduction[item]) itemProduction[item] = { production: 0, efficiency: 0, count: 0 };
      itemProduction[item].production += qty;
      itemProduction[item].efficiency += parseFloat(record.efficiency) || 0;
      itemProduction[item].count += 1;

      const targetRecord = targets.find(t => t.shift_code === shift && t.machine_id === record.machine_id);
      if (targetRecord) {
        shiftGroups[shift].target += targetRecord.target_qty;
        totalTarget += targetRecord.target_qty;
      }
    });

    Object.keys(shiftGroups).forEach(shift => {
      shiftGroups[shift].efficiency = shiftGroups[shift].target > 0 ? (shiftGroups[shift].production / shiftGroups[shift].target) * 100 : 0;
    });

    Object.keys(machineProduction).forEach(m => machineProduction[m].efficiency = machineProduction[m].count > 0 ? machineProduction[m].efficiency / machineProduction[m].count : 0);
    Object.keys(itemProduction).forEach(i => itemProduction[i].efficiency = itemProduction[i].count > 0 ? itemProduction[i].efficiency / itemProduction[i].count : 0);

    const overallEfficiency = totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;

    setReportData({
      date: selectedDate,
      formattedDate: new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      shiftGroups,
      totalProduction,
      totalTarget,
      overallEfficiency: parseFloat(overallEfficiency.toFixed(1)),
      recordCount: dateRecords.length,
      machineProduction,
      itemProduction,
    });
  }, [records, targets]);

  useEffect(() => {
    if (filterDate) generateReport(filterDate);
  }, [filterDate, generateReport]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await supabase.from("flatteningsection").delete().eq("id", id);
      fetchData();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleView = (id) => {
    alert(`View record ${id}`);
  };

  const handleEdit = (id) => {
    alert(`Edit record ${id}`);
  };

  const openRemarksModal = (remarks, id) => {
    setSelectedRemarks(remarks || "No remarks available");
    setSelectedRecordId(id);
    setShowRemarksModal(true);
  };

  const handlePDFReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to generate PDF");
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
    };

    setShowPDFModal(true);
    window.pdfData = pdfData;
  };

  const handleWhatsAppReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to share");
      return;
    }

    const whatsappData = {
      date: reportData.formattedDate,
      summary: {
        totalProduction: reportData.totalProduction.toFixed(1),
        totalTarget: reportData.totalTarget.toFixed(1),
        overallEfficiency: reportData.overallEfficiency.toFixed(1),
        recordCount: reportData.recordCount,
      },
      shiftWise: Object.entries(reportData.shiftGroups).map(([shift, data]) => ({
        shift,
        production: data.production.toFixed(1),
        efficiency: data.efficiency.toFixed(1),
      })),
      machineWise: Object.entries(reportData.machineProduction).map(([machine, data]) => ({
        machine,
        production: data.production.toFixed(1),
        efficiency: data.efficiency.toFixed(1),
      })),
    };

    setShowWhatsAppModal(true);
    window.whatsappData = whatsappData;
  };

  const handleExcelExport = () => {
    setShowExcelModal(true);
  };

  const handlePrintReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to print");
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Flattening Section Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: white; color: black; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .summary-card { border: 1px solid #1e40af; padding: 20px; border-radius: 8px; text-align: center; }
          .summary-card h3 { margin: 0 0 10px 0; color: #1e40af; }
          .summary-card .value { font-size: 24px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #1e40af; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border: 1px solid #1e40af; }
          .efficiency-high { color: #10b981; font-weight: bold; }
          .efficiency-medium { color: #f59e0b; font-weight: bold; }
          .efficiency-low { color: #ef4444; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Flattening Section Production Report</h1>
          <h2>${reportData.formattedDate}</h2>
          <p>Generated by: Admin</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Production</h3>
            <div class="value">${Math.round(reportData.totalProduction)} KG</div>
          </div>
          <div class="summary-card">
            <h3>Total Target</h3>
            <div class="value">${Math.round(reportData.totalTarget)} KG</div>
          </div>
          <div class="summary-card">
            <h3>Overall Efficiency</h3>
            <div class="value ${reportData.overallEfficiency >= 80 ? 'efficiency-high' : reportData.overallEfficiency >= 70 ? 'efficiency-medium' : 'efficiency-low'}">
              ${reportData.overallEfficiency}%
            </div>
          </div>
          <div class="summary-card">
            <h3>Total Records</h3>
            <div class="value">${reportData.recordCount}</div>
          </div>
        </div>

        <h3>Shift-wise Production</h3>
        <table>
          <thead><tr><th>Shift</th><th>Production</th><th>Target</th><th>Efficiency</th></tr></thead>
          <tbody>
            ${Object.entries(reportData.shiftGroups).map(([shift, data]) => `
              <tr>
                <td>Shift ${shift}</td>
                <td>${Math.round(data.production)} KG</td>
                <td>${Math.round(data.target)} KG</td>
                <td class="${data.efficiency >= 80 ? 'efficiency-high' : data.efficiency >= 70 ? 'efficiency-medium' : 'efficiency-low'}">
                  ${data.efficiency.toFixed(1)}%
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Machine-wise Production</h3>
        <table>
          <thead><tr><th>Machine</th><th>Production</th><th>Efficiency</th><th>Records</th></tr></thead>
          <tbody>
            ${Object.entries(reportData.machineProduction).map(([machine, data]) => `
              <tr>
                <td>${machine}</td>
                <td>${Math.round(data.production)} KG</td>
                <td class="${data.efficiency >= 80 ? 'efficiency-high' : data.efficiency >= 70 ? 'efficiency-medium' : 'efficiency-low'}">
                  ${data.efficiency.toFixed(1)}%
                </td>
                <td>${data.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()} • Pakistan Wire Industries ERP</p>
          <button class="no-print" onclick="window.print()" style="background: #1e40af; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin-top: 20px;">Print Report</button>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading && records.length === 0) {
    return (
      <div className={`full-page-loading ${isDarkMode ? 'dark' : ''}`}>
        <div className="loading-spinner-large" />
        <h3>Loading Flattening Section Data...</h3>
        <p>Fetching records from database</p>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <>
      <div className={`flattening-page-container ${isDarkMode ? 'dark' : ''}`}>
        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{ display: window.innerWidth < 768 ? 'flex' : 'none' }}
        >
          <FiMenu size={22} color="white" />
        </button>

        {/* Database Connection Alert */}
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

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="mobile-menu-overlay" onClick={() => setShowMobileMenu(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-header">
                <h3>Flattening Section</h3>
                <button onClick={() => setShowMobileMenu(false)} className="mobile-menu-close">×</button>
              </div>
              <div className="mobile-menu-content">
                <button onClick={() => { navigate("/dashboard"); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <FiHome size={16} /> <span>Dashboard</span>
                </button>
                <button onClick={() => { navigate("/production"); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <FiArrowLeft size={16} /> <span>Production</span>
                </button>
                <button onClick={() => { setShowFlatteningModal(true); setShowMobileMenu(false); }} className="mobile-menu-btn-item primary">
                  <FiPlus size={16} /> <span>New Entry</span>
                </button>
                <button onClick={() => { navigate("/production-sections/flattening/smart-entry"); setShowMobileMenu(false); }} className="mobile-menu-btn-item primary">
                  <FiSmartphone size={16} /> <span>Smart Entry</span>
                </button>
                <button onClick={() => { setShowDashboard(!showDashboard); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  {showDashboard ? <FiEyeOff size={16} /> : <FiBarChart2 size={16} />} <span>{showDashboard ? "Hide" : "Dashboard"}</span>
                </button>
                <button onClick={() => { setShowStats(!showStats); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  {showStats ? <FiEyeOff size={16} /> : <FiLayers size={16} />} <span>{showStats ? "Hide" : "Stats"}</span>
                </button>
                <button onClick={() => { handleExcelExport(); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <FiDownload size={16} /> <span>Export CSV</span>
                </button>
                <button onClick={() => { fetchData(); setShowMobileMenu(false); }} className="mobile-menu-btn-item">
                  <FiRefreshCw size={16} /> <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flattening-content">
          {/* Action Buttons Row */}
          <div className="buttons-row">
            <button onClick={() => setShowFlatteningModal(true)} className="page-btn primary-btn" title="New Entry">
              <FiPlus size={16} /> <span>New Entry</span>
            </button>
            <button onClick={() => navigate("/production-sections/flattening/smart-entry")} className="page-btn smart-entry-btn" title="Smart Entry">
              <FiSmartphone size={16} /> <span>Smart Entry</span>
            </button>
            <button onClick={() => navigate("/production-sections/flattening/multi-entry")} className="page-btn smart-entry-btn" title="Multi Entry">
              <FiGrid size={16} /> <span>Multi Entry</span>
            </button>
            <button onClick={fetchData} disabled={loading} className="page-btn refresh-btn" title="Refresh">
              {loading ? <div className="mini-spinner" /> : <FiRefreshCw size={16} />} <span>Refresh</span>
            </button>
            <button onClick={() => navigate("/production")} className="page-btn nav-btn" title="Production">
              <FiArrowLeft size={16} /> <span>Production</span>
            </button>
            <button onClick={() => setShowDashboard(!showDashboard)} className="page-btn dashboard-btn" title="Toggle Dashboard">
              {showDashboard ? <FiEyeOff size={16} /> : <FiBarChart2 size={16} />} <span>Dashboard</span>
            </button>
            <button onClick={() => setShowStats(!showStats)} className="page-btn stats-btn" title="Toggle Stats">
              {showStats ? <FiEyeOff size={16} /> : <FiLayers size={16} />} <span>Stats</span>
            </button>
          </div>

          {/* Statistics Cards */}
          {showStats && (
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
                    <FiDatabase size={14} /> Total: {stats.totalRecords}
                  </span>
                  <span className="summary-item">
                    <FiUser size={14} /> Admin
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
                    <div className="stat-value" style={{ color: card.color }}>
                      {card.value}
                    </div>
                    <div className="stat-footer">
                      <FiDatabase size={12} /> Real-time data
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Dashboard */}
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
                    <FiUser size={14} /> Admin
                  </span>
                  <span className="info-item">
                    <FiDatabase size={14} /> {stats.todayRecords} records
                  </span>
                </div>
              </div>
              <div className="dashboard-grid">
                {/* Machine-wise Card */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <FiTool size={20} color="white" />
                    <h4>Machine-wise Production</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.machineWiseToday).length > 0 ? (
                      Object.entries(stats.machineWiseToday).slice(0, 5).map(([machine, data]) => (
                        <div key={machine} className="item-row">
                          <div className="item-name">
                            <FiTool size={16} /> {machine}
                          </div>
                          <div className="item-stats">
                            <span>{Math.round(data.production)} KG</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">No machine data today</div>
                    )}
                  </div>
                </div>
                {/* Item-wise Card */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <FiPackage size={20} color="white" />
                    <h4>Item-wise Production</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.itemWiseToday).length > 0 ? (
                      Object.entries(stats.itemWiseToday).slice(0, 5).map(([item, data]) => (
                        <div key={item} className="item-row">
                          <div className="item-name">
                            <FiPackage size={16} /> {item}
                          </div>
                          <div className="item-stats">
                            <span>{Math.round(data.production)} KG</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">No item data today</div>
                    )}
                  </div>
                </div>
                {/* Shift-wise Card */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <FiClock size={20} color="white" />
                    <h4>Shift-wise Production</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.shiftWiseToday).length > 0 ? (
                      Object.entries(stats.shiftWiseToday).slice(0, 5).map(([shift, data]) => (
                        <div key={shift} className="item-row">
                          <div className="item-name">
                            <FiClock size={16} /> Shift {shift}
                          </div>
                          <div className="item-stats">
                            <span>{Math.round(data.production)} KG</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">No shift data today</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters Section */}
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
                      <FiSearch size={12} className="filter-icon" />
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
                      <FiClock size={12} className="filter-icon" />
                      <select
                        value={filterShift}
                        onChange={(e) => setFilterShift(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All Shifts</option>
                        {uniqueShiftCodes.map((shift) => (
                          <option key={shift} value={shift}>Shift {shift}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="filter-item date-picker">
                    <div className="filter-input-container">
                      <FiCalendar size={12} className="filter-icon" />
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => {
                          setFilterDate(e.target.value);
                          setShowReport(!!e.target.value);
                          setCurrentPage(1);
                        }}
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
                      <FiBarChart2 size={13} /> <span>Generate</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterShift("");
                        setFilterDate("");
                        setShowReport(false);
                        setCurrentPage(1);
                      }}
                      className="page-btn filter-action-btn secondary"
                    >
                      <FiX size={13} /> <span>Clear</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={handlePDFReport}
                      className="page-btn filter-action-btn print"
                    >
                      <FiFile size={13} /> <span>PDF</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={handleWhatsAppReport}
                      className="page-btn filter-action-btn success"
                    >
                      <FaWhatsapp size={13} /> <span>WhatsApp</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={handlePrintReport}
                      className="page-btn filter-action-btn print"
                    >
                      <FiPrinter size={13} /> <span>Print</span>
                    </button>
                  </div>
                  <div className="filter-item">
                    <button
                      onClick={handleExcelExport}
                      disabled={records.length === 0}
                      className="page-btn filter-action-btn export"
                    >
                      <FiDownload size={13} /> <span>Export CSV</span>
                    </button>
                  </div>
                </div>
                <div className="filter-status-inline">
                  <div className="active-filters-wrapper">
                    <FiFilter size={11} />
                    <span className="active-filters-text">
                      {searchTerm && `"${searchTerm}"`}
                      {filterShift && (searchTerm ? " • " : "") + `Shift ${filterShift}`}
                      {filterDate && (searchTerm || filterShift ? " • " : "") + filterDate}
                      {!searchTerm && !filterShift && !filterDate && "No filters"}
                    </span>
                  </div>
                  <div className="filter-count-wrapper">
                    <FiDatabase size={11} />
                    <span>
                      <span className="filter-count-number">{filteredRecords.length}</span>
                      <span> / {records.length}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Section - Full Details */}
          {showReport && reportData && reportData.recordCount > 0 && (
            <div className="report-section">
              <div className="report-header">
                <div className="report-title">
                  <h2>
                    <div className="report-icon">
                      <FiBarChart2 />
                    </div>
                    Flattening Section Production Report
                  </h2>
                  <div className="report-info">
                    <div className="report-date">
                      <FiCalendar /> {reportData.formattedDate}
                    </div>
                    <div className="report-author">
                      <FiUser /> Generated by: <strong>Admin</strong>
                    </div>
                  </div>
                </div>
                
                <div className="report-actions">
                  <button onClick={handlePDFReport} className="action-btn" title="PDF Report">
                    <FiFile /> <span>PDF</span>
                  </button>
                  <button onClick={handleWhatsAppReport} className="action-btn whatsapp-btn" title="Share via WhatsApp">
                    <FaWhatsapp /> <span>WhatsApp</span>
                  </button>
                  <button onClick={handlePrintReport} className="action-btn" title="Print Report">
                    <FiPrinter /> <span>Print</span>
                  </button>
                  <button onClick={handleExcelExport} className="action-btn" title="Export as CSV">
                    <FiDownload /> <span>Export</span>
                  </button>
                  <button onClick={() => setShowReport(false)} className="action-btn close-btn" title="Close Report">
                    <FiX /> <span>Close</span>
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="summary-section">
                <h3>Production Summary</h3>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-card-header">
                      <FiPackage /> Total Production
                    </div>
                    <div className="summary-card-value">{Math.round(reportData.totalProduction)} KG</div>
                    <div className="summary-card-note">Target: {Math.round(reportData.totalTarget)} KG</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card-header">
                      <FiTarget /> Total Target
                    </div>
                    <div className="summary-card-value">{Math.round(reportData.totalTarget)} KG</div>
                    <div className="summary-card-note">Vs Production</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card-header">
                      <FiActivity /> Overall Efficiency
                    </div>
                    <div className="summary-card-value" style={{ color: getEfficiencyColor(reportData.overallEfficiency) }}>
                      {reportData.overallEfficiency}%
                    </div>
                    <div className="summary-card-note">Target: 85%</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-card-header">
                      <FiDatabase /> Total Records
                    </div>
                    <div className="summary-card-value">{reportData.recordCount}</div>
                    <div className="summary-card-note">For selected date</div>
                  </div>
                </div>
              </div>

              {/* Shift-wise Production */}
              {Object.keys(reportData.shiftGroups).length > 0 && (
                <div className="summary-section">
                  <h3>Shift-wise Production</h3>
                  <div className="shift-cards-container">
                    {Object.entries(reportData.shiftGroups).map(([shift, data]) => (
                      <div key={shift} className="shift-card">
                        <div className="shift-card-header">
                          <div className="shift-title">
                            <div className="shift-icon-container">
                              <span className="shift-icon">{shift === 'A' ? '☀️' : shift === 'B' ? '🌙' : '⭐'}</span>
                            </div>
                            <div>
                              <h4>Shift {shift}</h4>
                            </div>
                          </div>
                          <div className="shift-badge">{data.records.length} Records</div>
                        </div>
                        <div className="shift-stats">
                          <div className="shift-stat-item">
                            <FiPackage /> {Math.round(data.production)} KG
                            <small>Production</small>
                          </div>
                          <div className="shift-stat-item">
                            <FiTarget /> {Math.round(data.target)} KG
                            <small>Target</small>
                          </div>
                          <div className="shift-stat-item">
                            <FiActivity style={{ color: getEfficiencyColor(data.efficiency) }} /> 
                            <span style={{ color: getEfficiencyColor(data.efficiency) }}>{data.efficiency.toFixed(1)}%</span>
                            <small>Efficiency</small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Machine-wise Production */}
              {Object.keys(reportData.machineProduction).length > 0 && (
                <div className="summary-section">
                  <h3>Machine-wise Production</h3>
                  <div className="machines-grid">
                    {Object.entries(reportData.machineProduction).map(([machine, data]) => (
                      <div key={machine} className="machine-card">
                        <div className="machine-card-header">
                          <div className="machine-name">
                            <FiTool /> {machine}
                          </div>
                        </div>
                        <div className="machine-card-stats">
                          <div className="machine-stat">
                            <div className="machine-stat-value">{Math.round(data.production)} KG</div>
                            <div className="machine-stat-label">Production</div>
                          </div>
                          <div className="machine-stat">
                            <div className="machine-stat-value" style={{ color: getEfficiencyColor(data.efficiency) }}>
                              {data.efficiency.toFixed(1)}%
                            </div>
                            <div className="machine-stat-label">Efficiency</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Item-wise Production */}
              {Object.keys(reportData.itemProduction).length > 0 && (
                <div className="summary-section">
                  <h3>Item-wise Production</h3>
                  <div className="items-cards-container">
                    {Object.entries(reportData.itemProduction).map(([item, data]) => (
                      <div key={item} className="item-card">
                        <div className="item-card-header">
                          <FiPackage /> {item}
                        </div>
                        <div className="item-card-stats">
                          <div className="item-stat">
                            <div className="item-stat-value">{Math.round(data.production)} KG</div>
                            <div className="item-stat-label">Production</div>
                          </div>
                          <div className="item-stat">
                            <div className="item-stat-value" style={{ color: getEfficiencyColor(data.efficiency) }}>
                              {data.efficiency.toFixed(1)}%
                            </div>
                            <div className="item-stat-label">Efficiency</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Footer */}
              <div className="report-footer">
                <p>Generated on {new Date().toLocaleString()} • <strong>Admin</strong></p>
                <p>Pakistan Wire Industries ERP System</p>
              </div>
            </div>
          )}

          {/* Records Table */}
          <div className="records-section">
            <div className="section-header">
              <h3>
                <div className="section-icon">
                  <FiDatabase size={18} color="white" />
                </div>
                Flattening Production Records
              </h3>
              <div className="section-info">
                <span className="info-item">
                  <FiDatabase size={12} /> {records.length}
                </span>
                <span className="info-item">
                  <FiFilter size={12} /> {filteredRecords.length}
                </span>
                <span className="info-item">
                  <FiHash size={12} /> {currentPage}/{totalPages}
                </span>
                <span className="info-item">
                  <FiUser size={12} /> Admin
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
                  <FiColumns size={36} />
                </div>
                <h4>No records found</h4>
                <p>{searchTerm || filterDate || filterShift ? "No records match your search criteria" : "No production records available"}</p>
                <button onClick={() => setShowFlatteningModal(true)} className="primary-btn large">
                  <FiPlus size={18} /> Create First Record
                </button>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="records-table">
                    <thead>
                      <tr>
                        <th><FiHash size={12} /> ID</th>
                        <th><FiTool size={12} /> Machine</th>
                        <th><FiCalendar size={12} /> Date/Shift</th>
                        <th><FiPackage size={12} /> Item</th>
                        <th><FiUser size={12} /> User</th>
                        <th><FiUser size={12} /> Operator</th>
                        <th><FiBarChart size={12} /> Production</th>
                        <th><FiActivity size={12} /> Efficiency</th>
                        <th><FiMessageSquare size={12} /> Remarks</th>
                        <th><FiClock size={12} /> Created</th>
                        <th><FiSettings size={12} /> Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((record, index) => {
                        const efficiency = parseFloat(record.efficiency) || 0;
                        const remarks = record.remarks || "";
                        const hasRemarks = remarks.trim().length > 0;
                        const shiftClass = record.shift_code || record.shift || "default";
                        
                        return (
                          <tr key={record.id} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                            <td><span className="record-id">#{record.id}</span></td>
                            <td>{record.machine_id || record.machine_no || '—'}</td>
                            <td>
                              <div>{new Date(record.created_at).toLocaleDateString("en-GB")}</div>
                              <div className="cell-detail">Shift {shiftClass}</div>
                            </td>
                            <td>{record.item_name || '—'}</td>
                            <td>{record.user_name || '—'}</td>
                            <td>{record.operator_name || '—'}</td>
                            <td>
                              <div className="production-value">{Math.round(parseFloat(record.production_quantity || 0))}<span className="unit">KG</span></div>
                              <div className="cell-detail">Target: {Math.round(parseFloat(record.target_qty || 0))} KG</div>
                            </td>
                            <td>
                              <span className={`efficiency-badge ${getEfficiencyClass(efficiency)}`}>
                                <FiPercent size={10} /> {Math.round(efficiency)}%
                              </span>
                            </td>
                            <td>
                              <div className="remarks-cell">
                                {hasRemarks ? (
                                  <>
                                    <span className="remarks-text">{remarks.length > 15 ? `${remarks.substring(0, 15)}...` : remarks}</span>
                                    <button onClick={() => openRemarksModal(remarks, record.id)} className="remarks-view-btn" title="View full remarks">
                                      <FiEye size={12} />
                                    </button>
                                  </>
                                ) : (
                                  <span className="remarks-text">—</span>
                                )}
                              </div>
                            </td>
                            <td>{new Date(record.created_at).toLocaleDateString("en-GB")}</td>
                            <td>
                              <div className="action-buttons">
                                <button onClick={() => handleView(record.id)} className="action-btn view-btn" title="View"><FiEye size={12} /></button>
                                <button onClick={() => handleEdit(record.id)} className="action-btn edit-btn" title="Edit"><FiEdit size={12} /></button>
                                <button onClick={() => handleDelete(record.id)} className="action-btn delete-btn" title="Delete"><FiTrash2 size={12} /></button>
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

        {/* Bottom Info Bar */}
        <div className="bottom-info-bar">
          <div className="info-left">
            <span className="info-item">
              <FiDatabase size={12} /> {stats.totalRecords}
            </span>
            <span className="info-item">
              <FiUser size={12} /> Admin
            </span>
            <span className="info-item">
              <FiClock size={12} /> {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="info-right">
            <span className="info-item">
              <FiPackage size={12} /> {Math.round(stats.totalProduction)}KG
            </span>
            <span className="info-item">
              <FiPercent size={12} style={{ color: getEfficiencyColor(stats.avgEfficiency) }} />
              <span style={{ color: getEfficiencyColor(stats.avgEfficiency) }}>{Math.round(stats.avgEfficiency)}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Fixed Buttons */}
      {window.innerWidth < 768 && (
        <div className="mobile-fixed-bottom">
          <button onClick={() => setShowFlatteningModal(true)} className="page-btn primary-btn">
            <FiPlus size={16} /> <span>New</span>
          </button>
          <button onClick={() => navigate("/production-sections/flattening/smart-entry")} className="page-btn smart-entry-btn">
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

      {/* Modals */}
      {showPDFModal && (
        <PDFReportModal
          data={window.pdfData}
          onClose={() => setShowPDFModal(false)}
        />
      )}

      {showWhatsAppModal && (
        <WhatsAppReport
          data={window.whatsappData}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}

      {showExcelModal && (
        <ExcelExportModal
          records={filteredRecords}
          onClose={() => setShowExcelModal(false)}
        />
      )}

      {showRemarksModal && (
        <RemarksModal
          remarks={selectedRemarks}
          id={selectedRecordId}
          onClose={() => setShowRemarksModal(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {showFlatteningModal && (
        <div className="modal-overlay" onClick={() => setShowFlatteningModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <FlatteningForm
              isModal={true}
              onClose={() => { setShowFlatteningModal(false); fetchData(); }}
              onSuccess={() => { setShowFlatteningModal(false); fetchData(); }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FlatteningPage;