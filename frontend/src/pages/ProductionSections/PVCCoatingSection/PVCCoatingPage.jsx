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
  FiBarChart2,
  FiPrinter,
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
  FiEye,
  FiCpu,
  FiBox,
  FiDroplet,
  FiWatch,
  FiMessageCircle,
  FiSun,
  FiMoon,
  FiArrowLeft,
  FiZap
} from "react-icons/fi";
import { supabase } from "../../../supabaseClient";
import "./PVCCoatingPage.css";

const PVCcoatingPage = () => {
  const navigate = useNavigate();
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("pvc-dark-mode");
    return saved === "true";
  });
  
  // Apply theme effect
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark-mode");
      root.style.setProperty("--primary-color", "#60a5fa");
      root.style.setProperty("--secondary-color", "#a78bfa");
      root.style.setProperty("--background-color", "#0f172a");
      root.style.setProperty("--surface-color", "#1e293b");
      root.style.setProperty("--text-color", "#f1f5f9");
      root.style.setProperty("--border-color", "#334155");
    } else {
      root.classList.remove("dark-mode");
      root.style.setProperty("--primary-color", "#3b82f6");
      root.style.setProperty("--secondary-color", "#8b5cf6");
      root.style.setProperty("--background-color", "#f8fafc");
      root.style.setProperty("--surface-color", "#ffffff");
      root.style.setProperty("--text-color", "#1e293b");
      root.style.setProperty("--border-color", "#e2e8f0");
    }
    localStorage.setItem("pvc-dark-mode", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Data states
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    todayRecords: 0,
    todayProduction: 0,
    todayWeight: 0,
    todayAvgEfficiency: 0,
    machineWiseToday: {},
    finishedProductWiseToday: {},
    shiftWiseToday: {},
  });
  const [reportData, setReportData] = useState({
    date: "",
    formattedDate: "",
    machineWise: {},
    shiftWise: {},
    finishedProductWise: {},
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    recordCount: 0,
  });

  const isSupabaseConnected = supabase && process.env.REACT_APP_SUPABASE_URL;
  const coatingTypes = [
    "Transparent PVC", "White PVC", "Black PVC", "Grey PVC", "Color PVC",
    "Special Coating", "UV Protected", "Fire Retardant", "Other",
  ];

  // Calculate statistics
  const calculateStats = useCallback((recordsData) => {
    if (!recordsData || recordsData.length === 0) {
      setStats({
        totalRecords: 0, totalProduction: 0, totalWeight: 0, avgEfficiency: 0,
        todayRecords: 0, todayProduction: 0, todayWeight: 0, todayAvgEfficiency: 0,
        machineWiseToday: {}, finishedProductWiseToday: {}, shiftWiseToday: {},
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const todayRecords = recordsData.filter(record => 
      new Date(record.created_at).toISOString().split("T")[0] === today
    );

    const totalProduction = recordsData.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0);
    const totalWeight = recordsData.reduce((sum, record) => 
      sum + (parseFloat(record.weight) || 0), 0);
    const totalEfficiency = recordsData.reduce((sum, record) => 
      sum + (parseFloat(record.efficiency) || 0), 0);
    const avgEfficiency = recordsData.length > 0 ? totalEfficiency / recordsData.length : 0;

    const todayProduction = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0);
    const todayWeight = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.weight) || 0), 0);
    const todayEfficiencySum = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.efficiency) || 0), 0);
    const todayAvgEfficiency = todayRecords.length > 0 ? todayEfficiencySum / todayRecords.length : 0;

    const machineWiseToday = {};
    const finishedProductWiseToday = {};
    const shiftWiseToday = {};

    todayRecords.forEach(record => {
      const machine = record.machine_no || "Unknown";
      if (!machineWiseToday[machine]) machineWiseToday[machine] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      machineWiseToday[machine].production += parseFloat(record.production_quantity) || 0;
      machineWiseToday[machine].weight += parseFloat(record.weight) || 0;
      machineWiseToday[machine].efficiency += parseFloat(record.efficiency) || 0;
      machineWiseToday[machine].count += 1;

      const product = record.finishedproductname || "Unknown";
      if (!finishedProductWiseToday[product]) finishedProductWiseToday[product] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      finishedProductWiseToday[product].production += parseFloat(record.production_quantity) || 0;
      finishedProductWiseToday[product].weight += parseFloat(record.weight) || 0;
      finishedProductWiseToday[product].efficiency += parseFloat(record.efficiency) || 0;
      finishedProductWiseToday[product].count += 1;

      const shift = record.shift_name || "Unknown";
      if (!shiftWiseToday[shift]) shiftWiseToday[shift] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      shiftWiseToday[shift].production += parseFloat(record.production_quantity) || 0;
      shiftWiseToday[shift].weight += parseFloat(record.weight) || 0;
      shiftWiseToday[shift].efficiency += parseFloat(record.efficiency) || 0;
      shiftWiseToday[shift].count += 1;
    });

    setStats({
      totalRecords: recordsData.length,
      totalProduction, totalWeight, avgEfficiency,
      todayRecords: todayRecords.length, todayProduction, todayWeight, todayAvgEfficiency,
      machineWiseToday, finishedProductWiseToday, shiftWiseToday,
    });
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (!supabase) throw new Error("Supabase client not initialized");

      const { data: recordsData, error } = await supabase
        .from("pvcsection")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(recordsData || []);
      calculateStats(recordsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = (record.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.material_type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.finishedproductname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.users_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.raw_material_flatsize?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.machine_no?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.operator_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesType = !filterType || record.material_type === filterType;
    const recordDate = new Date(record.created_at).toISOString().split("T")[0];
    const matchesDate = !filterDate || recordDate === filterDate;
    return matchesSearch && matchesType && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Generate report
  const handleGenerateReport = useCallback(() => {
    if (!filterDate) { alert("Please select a date first"); return; }
    const dateRecords = records.filter(record => 
      new Date(record.created_at).toISOString().split("T")[0] === filterDate
    );

    if (dateRecords.length === 0) {
      setReportData({
        date: filterDate,
        formattedDate: new Date(filterDate).toLocaleDateString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        }),
        machineWise: {}, shiftWise: {}, finishedProductWise: {},
        totalProduction: 0, totalWeight: 0, avgEfficiency: 0, recordCount: 0,
      });
      setShowReport(true);
      return;
    }

    const machineWise = {}; const shiftWise = {}; const finishedProductWise = {};
    let totalProduction = 0; let totalWeight = 0; let totalEfficiency = 0;

    dateRecords.forEach(record => {
      const machine = record.machine_no || "Unknown";
      const shift = record.shift_name || "Unknown";
      const product = record.finishedproductname || "Unknown";
      const production = parseFloat(record.production_quantity) || 0;
      const weight = parseFloat(record.weight) || 0;
      const efficiency = parseFloat(record.efficiency) || 0;

      if (!machineWise[machine]) machineWise[machine] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      machineWise[machine].production += production;
      machineWise[machine].weight += weight;
      machineWise[machine].efficiency += efficiency;
      machineWise[machine].count += 1;

      if (!shiftWise[shift]) shiftWise[shift] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      shiftWise[shift].production += production;
      shiftWise[shift].weight += weight;
      shiftWise[shift].efficiency += efficiency;
      shiftWise[shift].count += 1;

      if (!finishedProductWise[product]) finishedProductWise[product] = { production: 0, weight: 0, efficiency: 0, count: 0 };
      finishedProductWise[product].production += production;
      finishedProductWise[product].weight += weight;
      finishedProductWise[product].efficiency += efficiency;
      finishedProductWise[product].count += 1;

      totalProduction += production; totalWeight += weight; totalEfficiency += efficiency;
    });

    const avgEfficiency = dateRecords.length > 0 ? totalEfficiency / dateRecords.length : 0;
    setReportData({
      date: filterDate,
      formattedDate: new Date(filterDate).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      }),
      machineWise, shiftWise, finishedProductWise,
      totalProduction, totalWeight, avgEfficiency, recordCount: dateRecords.length,
    });
    setShowReport(true);
  }, [filterDate, records]);

  // Export data
  const handleExport = () => {
    if (filteredRecords.length === 0) { alert("No records to export"); return; }
    const csvContent = [
      ["ID","Item Name","Raw Material Size","Material Type","Finished Product",
       "Machine ID","Machine No","Production","Unit","Weight","Per Meter WT",
       "Efficiency %","Operator","User Name","Shift Code","Shift Name",
       "Remarks","Item Code","Section Name","Created At"],
      ...filteredRecords.map(record => [
        record.id, `"${record.item_name || ""}"`, `"${record.raw_material_flatsize || ""}"`,
        `"${record.material_type || ""}"`, `"${record.finishedproductname || ""}"`,
        `"${record.machine_id || ""}"`, `"${record.machine_no || ""}"`,
        parseFloat(record.production_quantity) || 0, `"${record.unit || "Meter"}"`,
        parseFloat(record.weight) || 0, parseFloat(record.per_meter_wt) || 0,
        parseFloat(record.efficiency) || 0, `"${record.operator_name || ""}"`,
        `"${record.users_name || ""}"`, `"${record.shift_code || ""}"`,
        `"${record.shift_name || ""}"`, `"${record.remarks || ""}"`,
        `"${record.item_code || ""}"`, `"${record.section_name || ""}"`,
        `"${new Date(record.created_at).toLocaleString()}"`,
      ]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pvc-coating-records-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // CRUD operations
  const handleEdit = (id) => navigate(`/production-sections/pvc-coating/edit/${id}`);
  const handleView = (id) => navigate(`/production-sections/pvc-coating/view/${id}`);
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const { error } = await supabase.from("pvcsection").delete().eq("id", id);
      if (error) throw error;
      alert("Record deleted successfully"); fetchData();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Failed to delete record: " + error.message);
    }
  };

  // Print report
  const handlePrintReport = () => {
    if (!reportData || reportData.recordCount === 0) { alert("No report data to print"); return; }
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>PVC Coating Report - ${reportData.formattedDate}</title>
      <style>
        body{font-family:Arial;margin:40px}
        .header{text-align:center;margin-bottom:30px}
        .header h1{margin-bottom:10px}
        .header .date{font-size:18px}
        .table{width:100%;border-collapse:collapse;margin:20px 0}
        .table th,.table td{border:1px solid #ddd;padding:12px;text-align:left}
        .table th{background:#f8f9fa}
        .summary{background:#f8f9fa;padding:20px;margin:20px 0;border-radius:8px}
        .summary h3{margin-top:0}
        .footer{margin-top:40px;text-align:center;font-size:12px}
        @media print{
          body{margin:20px}
          .no-print{display:none}
          @page{size:landscape}
        }
      </style></head>
      <body>
        <div class="header">
          <h1>PVC Coating Production Report</h1>
          <div class="date">${reportData.formattedDate}</div>
        </div>
        <h3>Machine-wise Summary:</h3>
        <table class="table">
          <thead><tr><th>Machine</th><th>Production (M)</th><th>Weight (KG)</th><th>Avg Efficiency</th></tr></thead>
          <tbody>${Object.entries(reportData.machineWise).map(([machine, data]) => `
            <tr><td>${machine}</td><td>${data.production.toFixed(2)}</td><td>${data.weight.toFixed(2)}</td>
            <td>${(data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)}%</td></tr>`).join("")}
          </tbody>
        </table>
        <h3>Shift-wise Summary:</h3>
        <table class="table">
          <thead><tr><th>Shift</th><th>Production (M)</th><th>Weight (KG)</th><th>Avg Efficiency</th></tr></thead>
          <tbody>${Object.entries(reportData.shiftWise).map(([shift, data]) => `
            <tr><td>${shift}</td><td>${data.production.toFixed(2)}</td><td>${data.weight.toFixed(2)}</td>
            <td>${(data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)}%</td></tr>`).join("")}
          </tbody>
        </table>
        <h3>Product-wise Summary:</h3>
        <table class="table">
          <thead><tr><th>Product</th><th>Production (M)</th><th>Weight (KG)</th><th>Avg Efficiency</th></tr></thead>
          <tbody>${Object.entries(reportData.finishedProductWise).map(([product, data]) => `
            <tr><td>${product}</td><td>${data.production.toFixed(2)}</td><td>${data.weight.toFixed(2)}</td>
            <td>${(data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)}%</td></tr>`).join("")}
          </tbody>
        </table>
        <div class="summary">
          <h3>Summary:</h3>
          <p><strong>Total Production:</strong> ${reportData.totalProduction.toFixed(2)} Meter</p>
          <p><strong>Total Weight:</strong> ${reportData.totalWeight.toFixed(2)} KG</p>
          <p><strong>Average Efficiency:</strong> ${reportData.avgEfficiency.toFixed(2)}%</p>
          <p><strong>Total Records:</strong> ${reportData.recordCount}</p>
        </div>
        <div class="footer">
          Generated on ${new Date().toLocaleString()}<br/>PVC Coating Section
        </div>
        <div class="no-print">
          <button onclick="window.print()">Print Report</button>
          <button onclick="window.close()">Close</button>
        </div>
        <script>window.onload=function(){window.print()}</script>
      </body></html>
    `); printWindow.document.close();
  };

  // Export report
  const handleExportReport = () => {
    if (!reportData || reportData.recordCount === 0) { alert("No report data to export"); return; }
    const csvContent = [
      ["PVC Coating Production Report", reportData.formattedDate], [],
      ["Machine-wise Summary"], ["Machine Name","Production (M)","Weight (KG)","Avg Efficiency"],
      ...Object.entries(reportData.machineWise).map(([machine, data]) => [machine, data.production.toFixed(2), 
      data.weight.toFixed(2), (data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)+"%"]), [],
      ["Shift-wise Summary"], ["Shift Name","Production (M)","Weight (KG)","Avg Efficiency"],
      ...Object.entries(reportData.shiftWise).map(([shift, data]) => [shift, data.production.toFixed(2),
      data.weight.toFixed(2), (data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)+"%"]), [],
      ["Product-wise Summary"], ["Product","Production (M)","Weight (KG)","Avg Efficiency"],
      ...Object.entries(reportData.finishedProductWise).map(([product, data]) => [product, data.production.toFixed(2),
      data.weight.toFixed(2), (data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)+"%"]), [],
      ["SUMMARY"], ["Total Production (M):", reportData.totalProduction.toFixed(2)],
      ["Total Weight (KG):", reportData.totalWeight.toFixed(2)], ["Avg Efficiency:", reportData.avgEfficiency.toFixed(2)+"%"],
      ["Total Records:", reportData.recordCount], [], ["Generated on:", new Date().toLocaleString()],
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pvc-coating-report-${filterDate}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // WhatsApp sharing
  const handleWhatsAppShare = () => {
    if (!reportData || reportData.recordCount === 0) { alert("No report data to share"); return; }
    const message = `PVC Coating Report - ${reportData.formattedDate}\nProduction: ${reportData.totalProduction.toFixed(2)}M\nWeight: ${reportData.totalWeight.toFixed(2)}KG\nEfficiency: ${reportData.avgEfficiency.toFixed(2)}%\nRecords: ${reportData.recordCount}\nDate: ${new Date().toLocaleDateString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleRecordWhatsAppShare = (record) => {
    const message = `PVC Record - ID: ${record.id}\nItem: ${record.item_name || 'N/A'}\nCoating: ${record.material_type || 'N/A'}\nMachine: ${record.machine_no || 'N/A'}\nProduction: ${parseFloat(record.production_quantity).toLocaleString()} ${record.unit || 'Meter'}\nWeight: ${parseFloat(record.weight || 0).toLocaleString()}KG\nEfficiency: ${parseFloat(record.efficiency || 0).toFixed(1)}%\nOperator: ${record.operator_name || 'N/A'}\nDate: ${new Date(record.created_at).toLocaleDateString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Pagination
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  // Stat cards data
  const statCards = [
    { id: "total-records", title: "Total Records", value: stats.totalRecords, icon: FiDatabase },
    { id: "total-production", title: "Total Production", value: `${stats.totalProduction.toLocaleString()} M`, icon: FiPackage },
    { id: "total-weight", title: "Total Weight", value: `${stats.totalWeight.toLocaleString()} KG`, icon: FiDroplet },
    { id: "avg-efficiency", title: "Avg Efficiency", value: `${stats.avgEfficiency.toFixed(2)}%`, icon: FiTrendingUp },
    { id: "today-records", title: "Today's Records", value: stats.todayRecords, icon: FiClock },
    { id: "today-production", title: "Today's Production", value: `${stats.todayProduction.toLocaleString()} M`, icon: FiActivity },
    { id: "today-weight", title: "Today's Weight", value: `${stats.todayWeight.toLocaleString()} KG`, icon: FiDroplet },
    { id: "today-avg-efficiency", title: "Today's Avg Efficiency", value: `${stats.todayAvgEfficiency.toFixed(2)}%`, icon: FiActivity },
  ];

  // Loading state
  if (loading && records.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h3>Loading PVC Coating Data...</h3>
        <p>Fetching records from database</p>
      </div>
    );
  }

  return (
    <div className={`container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Database Alert */}
      {!isSupabaseConnected && (
        <div className="alert">
          <FiAlertCircle />
          <div>
            <strong>Supabase Connection Issue</strong>
            <div>Check your .env file for REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY</div>
          </div>
        </div>
      )}

      {/* Main Header - All in one line */}
      <div className="main-header">
        <div className="header-content">
          {/* Left Side: Back Button + Logo + Title + Subtitle + Status */}
          <div className="header-left">
            <button 
              className="back-btn"
              onClick={() => navigate("/production")}
              title="Go Back"
            >
              <FiArrowLeft />
            </button>
            
            <div className="logo-circle">
              <FiPackage />
            </div>
            
            <div className="title-section">
              <div className="main-title">
                <h1>PVC Coating</h1>
                <div className={`connection-status ${isSupabaseConnected ? "connected" : "disconnected"}`}>
                  {isSupabaseConnected ? <FiCheckCircle /> : <FiXCircle />}
                  {isSupabaseConnected ? "Connected" : "Offline"}
                </div>
              </div>
              <div className="subtitle">Production Management System</div>
            </div>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="header-right">
            <button onClick={() => navigate("/production-sections/pvc-coating/new")} className="action-btn">
              <FiPlus />
              <span>New</span>
            </button>
            
            <button onClick={() => navigate("/production-sections/pvc-coating/multi-entry")} className="action-btn">
              <FiGrid />
              <span>Multi</span>
            </button>
            
            <button onClick={() => navigate("/production-sections/pvc-coating/smart-form")} className="action-btn">
              <FiZap />
              <span>Smart</span>
            </button>
            
            <button onClick={handleExport} disabled={records.length === 0} className="action-btn">
              <FiDownload />
              <span>Export</span>
            </button>
            
            <button onClick={toggleTheme} className="action-btn theme-btn">
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>
            
            <button onClick={fetchData} disabled={loading} className="action-btn refresh-btn">
              {loading ? <div className="mini-spinner"></div> : <FiRefreshCw />}
            </button>
          </div>
        </div>
      </div>

      {/* Today's Dashboard */}
      <div className="dashboard">
        <div className="section-title">
          <FiActivity />
          <div>
            <h2>Today's Coating Dashboard</h2>
            <p>PVC coating overview for today</p>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-section">
            <h3><FiWatch /> Shift-wise Today</h3>
            <div className="cards-grid">
              {Object.entries(stats.shiftWiseToday).length > 0 ? (
                Object.entries(stats.shiftWiseToday).map(([shift, data]) => (
                  <div key={shift} className="card">
                    <div className="card-header">
                      <FiWatch />
                      <span>{shift}</span>
                    </div>
                    <div className="card-body">
                      <div>{data.production.toFixed(0)}<small>M</small></div>
                      <div>{data.weight.toFixed(0)}<small>KG</small></div>
                      <div>{(data.count > 0 ? data.efficiency / data.count : 0).toFixed(1)}<small>%</small></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-card">
                  <FiWatch />
                  <p>No shift coating today</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h3><FiCpu /> Machine-wise Today</h3>
            <div className="cards-grid">
              {Object.entries(stats.machineWiseToday).length > 0 ? (
                Object.entries(stats.machineWiseToday).map(([machine, data]) => (
                  <div key={machine} className="card">
                    <div className="card-header">
                      <FiCpu />
                      <span>Machine {machine}</span>
                    </div>
                    <div className="card-body">
                      <div>{data.production.toFixed(0)}<small>M</small></div>
                      <div>{data.weight.toFixed(0)}<small>KG</small></div>
                      <div>{(data.count > 0 ? data.efficiency / data.count : 0).toFixed(1)}<small>%</small></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-card">
                  <FiCpu />
                  <p>No machine coating today</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h3><FiBox /> Product-wise Today</h3>
            <div className="cards-grid">
              {Object.entries(stats.finishedProductWiseToday).length > 0 ? (
                Object.entries(stats.finishedProductWiseToday).map(([product, data]) => (
                  <div key={product} className="card">
                    <div className="card-header">
                      <FiBox />
                      <span>{product}</span>
                    </div>
                    <div className="card-body">
                      <div>{data.production.toFixed(0)}<small>M</small></div>
                      <div>{data.weight.toFixed(0)}<small>KG</small></div>
                      <div>{(data.count > 0 ? data.efficiency / data.count : 0).toFixed(1)}<small>%</small></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-card">
                  <FiBox />
                  <p>No finished product today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats">
        {statCards.map((card) => (
          <div key={card.id} className="stat-card">
            <div className="stat-icon">
              <card.icon />
            </div>
            <div className="stat-content">
              <div className="stat-title">{card.title}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="filters">
        <div className="filter-header">
          <FiFilter /> FILTERS
        </div>
        
        <div className="filter-grid">
          <div className="filter-group">
            <label><FiSearch /> Search Records</label>
            <input
              type="text"
              placeholder="Search by item, coating type, finished product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label><FiFilter /> Coating Type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {coatingTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label><FiCalendar /> Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPage(1);
              }}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          
          <div className="filter-buttons">
            <button onClick={handleGenerateReport} className="report-btn">
              <FiBarChart2 /> Generate Report
            </button>
            <button onClick={() => {
              setSearchTerm(""); 
              setFilterType(""); 
              setFilterDate(""); 
              setShowReport(false); 
              setCurrentPage(1);
            }} className="clear-btn">
              <FiX /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Report Section */}
      {showReport && reportData && (
        <div className="report">
          <div className="report-header">
            <div>
              <h2>PVC Coating Production Report</h2>
              <p>{reportData.formattedDate}</p>
            </div>
            <div className="report-actions">
              <button onClick={handlePrintReport}><FiPrinter /> Print</button>
              <button onClick={handleExportReport}><FiDownload /> Export</button>
              <button onClick={handleWhatsAppShare}><FiMessageCircle /> WhatsApp</button>
              <button onClick={() => setShowReport(false)}>Close</button>
            </div>
          </div>

          {/* Report Content */}
          {Object.keys(reportData.machineWise).length > 0 && (
            <div className="report-section">
              <h3>Machine-wise Summary</h3>
              <div className="report-cards">
                {Object.entries(reportData.machineWise).map(([machine, data]) => (
                  <div key={machine} className="report-card">
                    <div className="card-title">
                      <FiCpu /> Machine {machine}
                    </div>
                    <div className="card-stats">
                      <div>{data.production.toFixed(2)} M</div>
                      <div>{data.weight.toFixed(2)} KG</div>
                      <div>{(data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(reportData.shiftWise).length > 0 && (
            <div className="report-section">
              <h3>Shift-wise Summary</h3>
              <div className="report-cards">
                {Object.entries(reportData.shiftWise).map(([shift, data]) => (
                  <div key={shift} className="report-card">
                    <div className="card-title">
                      <FiWatch /> {shift}
                    </div>
                    <div className="card-stats">
                      <div>{data.production.toFixed(2)} M</div>
                      <div>{data.weight.toFixed(2)} KG</div>
                      <div>{(data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(reportData.finishedProductWise).length > 0 && (
            <div className="report-section">
              <h3>Product-wise Summary</h3>
              <div className="report-cards">
                {Object.entries(reportData.finishedProductWise).map(([product, data]) => (
                  <div key={product} className="report-card">
                    <div className="card-title">
                      <FiBox /> {product}
                    </div>
                    <div className="card-stats">
                      <div>{data.production.toFixed(2)} M</div>
                      <div>{data.weight.toFixed(2)} KG</div>
                      <div>{(data.count > 0 ? data.efficiency/data.count : 0).toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="report-summary">
            <h3>Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <div>Total Production</div>
                <div>{reportData.totalProduction.toFixed(2)} M</div>
              </div>
              <div className="summary-item">
                <div>Total Weight</div>
                <div>{reportData.totalWeight.toFixed(2)} KG</div>
              </div>
              <div className="summary-item">
                <div>Avg Efficiency</div>
                <div>{reportData.avgEfficiency.toFixed(2)}%</div>
              </div>
              <div className="summary-item">
                <div>Total Records</div>
                <div>{reportData.recordCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="records-section">
        <div className="section-header">
          <h2>PVC Coating Records</h2>
          <div className="section-info">
            Total: {records.length} • Filtered: {filteredRecords.length} • Page: {currentPage}/{totalPages}
            <div className="database-status">
              <div className={`dot ${isSupabaseConnected ? "green" : "red"}`}></div>
              {isSupabaseConnected ? "Database Connected" : "Database Offline"}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading records from pvcsection...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty">
            <FiPackage />
            <h3>No records found</h3>
            <p>
              {searchTerm || filterDate || filterType
                ? "No records match your search criteria."
                : "No PVC coating records available."}
            </p>
            <div className="empty-buttons">
              <button onClick={() => navigate("/production-sections/pvc-coating/new")}>
                <FiPlus /> Create Single Entry
              </button>
              <button onClick={() => navigate("/production-sections/pvc-coating/multi-entry")}>
                <FiGrid /> Create Multi-Entry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Item Details</th>
                    <th>Coating Type</th>
                    <th>Finished Product</th>
                    <th>Machine</th>
                    <th>Production</th>
                    <th>Weight</th>
                    <th>Efficiency</th>
                    <th>Operator</th>
                    <th>Shift</th>
                    <th>Date & Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <tr key={record.id} className={index % 2 === 0 ? "even" : "odd"}>
                      <td>
                        <div className="id">#{record.id}</div>
                        {record.item_code && <div className="code">Code: {record.item_code}</div>}
                      </td>
                      <td>
                        <div className="item">
                          <div className="item-icon"><FiPackage /></div>
                          <div>
                            <div className="item-name">{record.item_name || "N/A"}</div>
                            <div className="item-size">{record.raw_material_flatsize || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="badge">{record.material_type || "N/A"}</div>
                      </td>
                      <td>
                        <div className="badge">{record.finishedproductname || "N/A"}</div>
                      </td>
                      <td>
                        <div className="machine">
                          <div><FiCpu /> {record.machine_no || "N/A"}</div>
                          {record.machine_id && <div className="machine-id">ID: {record.machine_id}</div>}
                        </div>
                      </td>
                      <td>
                        <div className="production">
                          <div>{parseFloat(record.production_quantity).toLocaleString()}</div>
                          <div className="unit">{record.unit || "Meter"}</div>
                        </div>
                      </td>
                      <td>
                        <div className="weight">
                          <div>{parseFloat(record.weight || 0).toLocaleString()}</div>
                          <div className="unit">KG</div>
                          {record.per_meter_wt && (
                            <div className="per-meter">{parseFloat(record.per_meter_wt).toFixed(2)} KG/M</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="efficiency">{parseFloat(record.efficiency || 0).toFixed(1)}%</div>
                      </td>
                      <td>
                        <div className="operator">
                          <div className="avatar">{record.operator_name?.charAt(0) || "O"}</div>
                          <div>
                            <div>{record.operator_name || "Unknown"}</div>
                            <div className="user">User: {record.users_name || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="shift">
                          <div>{record.shift_name || "N/A"}</div>
                          {record.shift_code && <div className="shift-code">Code: {record.shift_code}</div>}
                        </div>
                      </td>
                      <td>
                        <div className="datetime">
                          <div><FiCalendar /> {new Date(record.created_at).toLocaleDateString("en-GB")}</div>
                          <div><FiClock /> {new Date(record.created_at).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}</div>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button onClick={() => handleView(record.id)} className="action-btn"><FiEye /> View</button>
                          <button onClick={() => handleEdit(record.id)} className="action-btn"><FiEdit /> Edit</button>
                          <button onClick={() => handleDelete(record.id)} className="action-btn delete"><FiTrash2 /> Delete</button>
                          <button onClick={() => handleRecordWhatsAppShare(record)} className="action-btn whatsapp"><FiMessageCircle /> WhatsApp</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Page {currentPage} of {totalPages} • Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
                </div>
                <div className="pagination-controls">
                  <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    <FiChevronLeft /> Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={currentPage === pageNum ? "active" : ""}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <div>PVC Coating Section • Production Management System</div>
            <div>Database: pvcsection table • Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
          
          <div className="footer-stats">
            <div className={`connection ${isSupabaseConnected ? "connected" : "disconnected"}`}>
              <div className="dot"></div>
              {isSupabaseConnected ? "Database Connected" : "Connection Issue"}
            </div>
            <div>
              {stats.totalRecords} records • {stats.totalProduction} M • {stats.totalWeight} KG • {stats.avgEfficiency.toFixed(1)}% efficiency
            </div>
          </div>
        </div>
        
        <div className="footer-buttons">
          <button onClick={() => navigate("/production-sections/pvc-coating/new")}>
            <FiPlus /> Single Entry
          </button>
          <button onClick={() => navigate("/production-sections/pvc-coating/multi-entry")}>
            <FiGrid /> Multi-Entry
          </button>
          <button onClick={fetchData}>
            <FiRefreshCw /> Refresh
          </button>
          <button onClick={() => navigate("/dashboard")}>
            <FiTrendingUp /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PVCcoatingPage;