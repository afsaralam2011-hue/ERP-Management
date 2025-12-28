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
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    recordCount: 0,
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

  // Fetch data function - wrapped in useCallback
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Check if supabase is available
      if (!supabase) {
        throw new Error("Supabase client not initialized");
      }

      // Fetch records from spiralsection table
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

  // Generate report - wrapped in useCallback
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
          totalProduction: 0,
          totalWeight: 0,
          avgEfficiency: 0,
          recordCount: 0,
        });
        return;
      }

      const itemWise = {};
      const wireWise = {};
      const machineWise = {};
      const shiftWise = {};
      let totalProduction = 0;
      let totalWeight = 0;
      let totalEfficiency = 0;

      dateRecords.forEach((record) => {
        const item = record.item_name || "Unknown";
        const wire = record.wire_size || "Unknown";
        const machine = record.machine_no || "Unknown";
        const shift = record.shift_name || "Unknown";
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
        if (!machineWise[machine]) {
          machineWise[machine] = {
            production: 0,
            weight: 0,
            efficiency: 0,
            count: 0,
          };
        }
        machineWise[machine].production += production;
        machineWise[machine].weight += weight;
        machineWise[machine].efficiency += efficiency;
        machineWise[machine].count += 1;

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

        totalProduction += production;
        totalWeight += weight;
        totalEfficiency += efficiency;
      });

      const avgEfficiency =
        dateRecords.length > 0 ? totalEfficiency / dateRecords.length : 0;

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
        totalProduction,
        totalWeight,
        avgEfficiency,
        recordCount: dateRecords.length,
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
          .summary h3 { margin-top: 0; }
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
                <td>${data.production.toFixed(2)}</td>
                <td>${(data.production * 1.2).toFixed(2)}</td>
                <td>${data.weight.toFixed(2)}</td>
                <td>${(data.count > 0
                  ? data.efficiency / data.count
                  : 0
                ).toFixed(2)}%</td>
                <td>85%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <h3>Wire-wise Summary:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Wire Size</th>
              <th>Production (Meter)</th>
              <th>Target (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.wireWise)
              .map(
                ([wire, data]) => `
              <tr>
                <td>${wire}</td>
                <td>${data.production.toFixed(2)}</td>
                <td>${(data.production * 1.2).toFixed(2)}</td>
                <td>${data.weight.toFixed(2)}</td>
                <td>${(data.count > 0
                  ? data.efficiency / data.count
                  : 0
                ).toFixed(2)}%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <h3>Machine-wise Summary:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Machine No</th>
              <th>Production (Meter)</th>
              <th>Target (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.machineWise)
              .map(
                ([machine, data]) => `
              <tr>
                <td>${machine}</td>
                <td>${data.production.toFixed(2)}</td>
                <td>${(data.production * 1.2).toFixed(2)}</td>
                <td>${data.weight.toFixed(2)}</td>
                <td>${(data.count > 0
                  ? data.efficiency / data.count
                  : 0
                ).toFixed(2)}%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <h3>Shift-wise Summary:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Shift Name</th>
              <th>Production (Meter)</th>
              <th>Target (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.shiftWise)
              .map(
                ([shift, data]) => `
              <tr>
                <td>${shift}</td>
                <td>${data.production.toFixed(2)}</td>
                <td>${(data.production * 1.2).toFixed(2)}</td>
                <td>${data.weight.toFixed(2)}</td>
                <td>${(data.count > 0
                  ? data.efficiency / data.count
                  : 0
                ).toFixed(2)}%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Summary:</h3>
          <p><strong>Total Production:</strong> ${reportData.totalProduction.toFixed(
            2
          )} Meter</p>
          <p><strong>Target Production:</strong> ${(
            reportData.totalProduction * 1.2
          ).toFixed(2)} Meter</p>
          <p><strong>Total Weight:</strong> ${reportData.totalWeight.toFixed(
            2
          )} KG</p>
          <p><strong>Average Efficiency:</strong> ${reportData.avgEfficiency.toFixed(
            2
          )}%</p>
          <p><strong>Target Efficiency:</strong> 85%</p>
          <p><strong>Total Records:</strong> ${reportData.recordCount}</p>
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

  // Export report
  const handleExportReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to export");
      return;
    }

    const csvContent = [
      ["Spiral Section Production Report", reportData.formattedDate],
      ["Generated by: Afsar"],
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
        data.production.toFixed(2),
        (data.production * 1.2).toFixed(2),
        data.weight.toFixed(2),
        (data.count > 0 ? data.efficiency / data.count : 0).toFixed(2) + "%",
        "85%",
      ]),
      [],
      ["Wire-wise Summary"],
      [
        "Wire Size",
        "Production (Meter)",
        "Target (Meter)",
        "Weight (KG)",
        "Avg Efficiency",
      ],
      ...Object.entries(reportData.wireWise).map(([wire, data]) => [
        wire,
        data.production.toFixed(2),
        (data.production * 1.2).toFixed(2),
        data.weight.toFixed(2),
        (data.count > 0 ? data.efficiency / data.count : 0).toFixed(2) + "%",
      ]),
      [],
      ["Machine-wise Summary"],
      [
        "Machine No",
        "Production (Meter)",
        "Target (Meter)",
        "Weight (KG)",
        "Avg Efficiency",
      ],
      ...Object.entries(reportData.machineWise).map(([machine, data]) => [
        machine,
        data.production.toFixed(2),
        (data.production * 1.2).toFixed(2),
        data.weight.toFixed(2),
        (data.count > 0 ? data.efficiency / data.count : 0).toFixed(2) + "%",
      ]),
      [],
      ["Shift-wise Summary"],
      [
        "Shift Name",
        "Production (Meter)",
        "Target (Meter)",
        "Weight (KG)",
        "Avg Efficiency",
      ],
      ...Object.entries(reportData.shiftWise).map(([shift, data]) => [
        shift,
        data.production.toFixed(2),
        (data.production * 1.2).toFixed(2),
        data.weight.toFixed(2),
        (data.count > 0 ? data.efficiency / data.count : 0).toFixed(2) + "%",
      ]),
      [],
      ["SUMMARY"],
      ["Total Production (Meter):", reportData.totalProduction.toFixed(2)],
      [
        "Target Production (Meter):",
        (reportData.totalProduction * 1.2).toFixed(2),
      ],
      ["Total Weight (KG):", reportData.totalWeight.toFixed(2)],
      ["Average Efficiency:", reportData.avgEfficiency.toFixed(2) + "%"],
      ["Target Efficiency:", "85%"],
      ["Total Records:", reportData.recordCount],
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
      value: `${stats.totalProduction.toLocaleString()} M`,
      icon: FiColumns,
      gradientColors: ["#3b82f6", "#2563eb"],
      description: "Total production in meters",
    },
    {
      id: "total-weight",
      title: "Total Weight",
      value: `${stats.totalWeight.toLocaleString()} KG`,
      icon: FiWeight,
      gradientColors: ["#8b5cf6", "#7c3aed"],
      description: "Total weight in kilograms",
    },
    {
      id: "avg-efficiency",
      title: "Avg Efficiency",
      value: `${stats.avgEfficiency.toFixed(2)}%`,
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
      value: `${stats.todayProduction.toLocaleString()} M`,
      icon: FiPackage,
      gradientColors: ["#3b82f6", "#1d4ed8"],
      description: "Today's production",
    },
    {
      id: "today-weight",
      title: "Today's Weight",
      value: `${stats.todayWeight.toLocaleString()} KG`,
      icon: FiWeight,
      gradientColors: ["#8b5cf6", "#7c3aed"],
      description: "Today's weight",
    },
    {
      id: "today-avg-efficiency",
      title: "Today's Avg Efficiency",
      value: `${stats.todayAvgEfficiency.toFixed(2)}%`,
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
            // Different gradient colors for each card
            const gradients = [
              { colors: ["#3b82f6", "#1d4ed8"], iconBg: "#3b82f6" }, // Blue
              { colors: ["#3b82f6", "#2563eb"], iconBg: "#3b82f6" }, // Blue 2
              { colors: ["#8b5cf6", "#7c3aed"], iconBg: "#8b5cf6" }, // Purple
              { colors: ["#10b981", "#059669"], iconBg: "#10b981" }, // Green
              { colors: ["#f59e0b", "#d97706"], iconBg: "#f59e0b" }, // Orange
              { colors: ["#ef4444", "#dc2626"], iconBg: "#ef4444" }, // Red
              { colors: ["#ec4899", "#db2777"], iconBg: "#ec4899" }, // Pink
              { colors: ["#06b6d4", "#0891b2"], iconBg: "#06b6d4" }, // Cyan
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
                          {data.production.toFixed(0)}{" "}
                          <span className="unit">M</span>
                        </div>
                        <div className="card-weight">
                          {data.weight.toFixed(0)}{" "}
                          <span className="unit">KG</span>
                        </div>
                        <div className="card-efficiency">
                          {(data.count > 0
                            ? data.efficiency / data.count
                            : 0
                          ).toFixed(1)}
                          %
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
                            {data.production.toFixed(0)}{" "}
                            <span className="unit">M</span>
                          </div>
                          <div className="card-weight">
                            {data.weight.toFixed(0)}{" "}
                            <span className="unit">KG</span>
                          </div>
                          <div className="card-efficiency">
                            {(data.count > 0
                              ? data.efficiency / data.count
                              : 0
                            ).toFixed(1)}
                            %
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
                            {data.production.toFixed(0)}{" "}
                            <span className="unit">M</span>
                          </div>
                          <div className="card-weight">
                            {data.weight.toFixed(0)}{" "}
                            <span className="unit">KG</span>
                          </div>
                          <div className="card-efficiency">
                            {(data.count > 0
                              ? data.efficiency / data.count
                              : 0
                            ).toFixed(1)}
                            %
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
              <button
                onClick={handlePrintReport}
                className="print-report-btn blue-solid"
              >
                <FiPrinter /> Print Report
              </button>
              <button
                onClick={handleExportReport}
                className="export-report-btn blue-solid"
              >
                <FiDownload /> Export Report
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="close-report-btn gray-border"
              >
                Close
              </button>
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
                        {data.production.toFixed(2)} M
                      </div>
                      <div className="item-report-weight">
                        {data.weight.toFixed(2)} KG
                      </div>
                      <div className="item-report-efficiency">
                        {(data.count > 0
                          ? data.efficiency / data.count
                          : 0
                        ).toFixed(2)}
                        % Efficiency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wire-wise Summary */}
          {Object.keys(reportData.wireWise).length > 0 && (
            <div className="wire-report-section">
              <h3>Wire-wise Summary</h3>
              <div className="wire-report-grid">
                {Object.entries(reportData.wireWise).map(([wire, data]) => (
                  <div key={wire} className="wire-report-card">
                    <div className="wire-report-header">
                      <div className="wire-report-icon orange-gradient">
                        <FiZap size={16} />
                      </div>
                      <div className="wire-report-name">{wire}</div>
                    </div>
                    <div className="wire-report-stats">
                      <div className="wire-report-production">
                        {data.production.toFixed(2)} M
                      </div>
                      <div className="wire-report-weight">
                        {data.weight.toFixed(2)} KG
                      </div>
                      <div className="wire-report-efficiency">
                        {(data.count > 0
                          ? data.efficiency / data.count
                          : 0
                        ).toFixed(2)}
                        % Efficiency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Machine-wise Summary */}
          {Object.keys(reportData.machineWise).length > 0 && (
            <div className="machine-report-section">
              <h3>Machine-wise Summary</h3>
              <div className="machine-report-grid">
                {Object.entries(reportData.machineWise).map(
                  ([machine, data]) => (
                    <div key={machine} className="machine-report-card">
                      <div className="machine-report-header">
                        <div className="machine-report-icon purple-gradient">
                          <FiMachine size={16} />
                        </div>
                        <div className="machine-report-name">
                          Machine {machine}
                        </div>
                      </div>
                      <div className="machine-report-stats">
                        <div className="machine-report-production">
                          {data.production.toFixed(2)} M
                        </div>
                        <div className="machine-report-weight">
                          {data.weight.toFixed(2)} KG
                        </div>
                        <div className="machine-report-efficiency">
                          {(data.count > 0
                            ? data.efficiency / data.count
                            : 0
                          ).toFixed(2)}
                          % Efficiency
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Shift-wise Summary */}
          {Object.keys(reportData.shiftWise).length > 0 && (
            <div className="shift-report-section">
              <h3>Shift-wise Summary</h3>
              <div className="shift-report-grid">
                {Object.entries(reportData.shiftWise).map(([shift, data]) => (
                  <div key={shift} className="shift-report-card">
                    <div className="shift-report-header">
                      <div className="shift-report-icon green-gradient">
                        <FiCalendar size={16} />
                      </div>
                      <div className="shift-report-name">{shift}</div>
                    </div>
                    <div className="shift-report-stats">
                      <div className="shift-report-production">
                        {data.production.toFixed(2)} M
                      </div>
                      <div className="shift-report-weight">
                        {data.weight.toFixed(2)} KG
                      </div>
                      <div className="shift-report-efficiency">
                        {(data.count > 0
                          ? data.efficiency / data.count
                          : 0
                        ).toFixed(2)}
                        % Efficiency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="report-summary">
            <h3>Summary</h3>

            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-label">Total Production</div>
                <div className="summary-value production-value">
                  {reportData.totalProduction.toFixed(2)} M
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Target Production</div>
                <div className="summary-value target-value">
                  {(reportData.totalProduction * 1.2).toFixed(2)} M
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Total Weight</div>
                <div className="summary-value weight-value">
                  {reportData.totalWeight.toFixed(2)} KG
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Average Efficiency</div>
                <div className="summary-value efficiency-value">
                  {reportData.avgEfficiency.toFixed(2)}%
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
                            {parseFloat(
                              record.production_quantity || 0
                            ).toLocaleString()}{" "}
                            M
                          </div>
                          <div className="production-target-cell">
                            <FiTarget size={8} />
                            Target:{" "}
                            {parseFloat(
                              record.target_quantity ||
                                record.production_quantity * 1.2
                            ).toLocaleString()}{" "}
                            M
                          </div>
                        </div>
                      </td>

                      {/* Weight with Per Meter */}
                      <td className="table-cell compact-cell">
                        <div>
                          <div className="weight-cell">
                            {parseFloat(record.weight || 0).toLocaleString()} KG
                          </div>
                          <div className="weight-per-meter-cell">
                            Per M:{" "}
                            {parseFloat(record.per_meter_wt || 0).toFixed(2)} KG
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
                            {parseFloat(record.efficiency || 0).toFixed(1)}%
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
              {stats.totalRecords} records • {stats.totalProduction} M •{" "}
              {stats.totalWeight} KG • {stats.avgEfficiency.toFixed(1)}%
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
  );
};

export default SpiralPage;
