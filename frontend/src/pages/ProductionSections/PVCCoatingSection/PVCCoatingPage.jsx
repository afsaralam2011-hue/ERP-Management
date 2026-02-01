import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus, FiEdit, FiTrash2, FiDownload,
  FiRefreshCw, FiPackage, FiCalendar,
  FiTrendingUp, FiClock, FiActivity, FiChevronLeft,
  FiChevronRight, FiDatabase, FiCheckCircle, FiXCircle, FiGrid,
  FiEye, FiCpu, FiDroplet,
  FiSun, FiMoon, FiArrowLeft, FiZap, FiPercent,
  FiHash, FiUser, FiWatch, FiBox, FiFilter,
  FiX, FiArrowUp, FiArrowDown,
  FiAlertCircle, FiPrinter, FiBarChart2,
  FiMessageSquare, FiLogIn, FiUserCheck
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { supabase } from "../../../supabaseClient";
import { useTheme } from "../../../contexts/ThemeContext"; // ✅ تھیم کونٹیکسٹ شامل کیا
import "./PVCCoatingPage.css";

const PVCcoatingPage = () => {
  const navigate = useNavigate();
  
  // ✅ Theme Context استعمال کریں
  const { currentTheme, mode, isDarkMode, toggleMode } = useTheme();
  
  // Data states
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // ✅ Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState("");

  const [reportData, setReportData] = useState({
    date: "",
    formattedDate: "",
    itemWise: {},
    productWise: {},
    machineWise: {},
    shiftWise: {},
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    recordCount: 0,
  });

  const isSupabaseConnected = supabase && process.env.REACT_APP_SUPABASE_URL;
  const loggedInUser = localStorage.getItem("userName") || "Admin";

  // ✅ Helper function to format numbers without decimal
  const formatInteger = (number) => {
    if (!number && number !== 0) return "0";
    const num = parseFloat(number);
    if (isNaN(num)) return "0";
    return Math.round(num).toLocaleString();
  };

  // ✅ Helper function to format weight without decimal
  const formatWeight = (weight) => {
    if (!weight && weight !== 0) return "0";
    const w = parseFloat(weight);
    if (isNaN(w)) return "0";
    return Math.round(w).toLocaleString();
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pvcsection")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecords(data || []);
      
      // Extract unique products
      const uniqueProducts = [...new Set(data.map(r => r.raw_material_Spiralsize).filter(Boolean))];
      setProducts(uniqueProducts);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // ✅ **واحد درست فارمولا: Unique Date+Shift+Machine**
  const calculateEfficiencyForRecords = useCallback((records) => {
    if (!records || records.length === 0) return 0;

    const uniqueEntries = new Map();
    
    records.forEach(record => {
      const key = `${record.production_date}_${record.shift_name}_${record.machine_no}`;
      
      if (!uniqueEntries.has(key)) {
        uniqueEntries.set(key, {
          production: parseFloat(record.production_quantity) || 0,
          target: parseFloat(record.target_qty) || 0
        });
      } else {
        const existing = uniqueEntries.get(key);
        existing.production += parseFloat(record.production_quantity) || 0;
      }
    });

    // Calculate total production and target
    let totalProduction = 0;
    let totalTarget = 0;
    
    uniqueEntries.forEach(entry => {
      totalProduction += entry.production;
      totalTarget += entry.target;
    });

    return totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;
  }, []);

  // ✅ درست فارمولا: لاسٹ انٹری کے لیے
  const calculateLastEntryStats = useCallback((records) => {
    if (!records || records.length === 0) {
      return {
        lastEntryRecords: 0,
        lastEntryProduction: 0,
        lastEntryWeight: 0,
        lastEntryEfficiency: 0,
        shiftWise: {},
        machineWise: {},
        productWise: {},
        lastEntryDate: null
      };
    }

    // آخری entry کی تاریخ تلاش کریں
    const latestRecord = records[0];
    const lastEntryDate = latestRecord?.production_date || latestRecord?.entry_date;
    
    if (!lastEntryDate) {
      return {
        lastEntryRecords: 0,
        lastEntryProduction: 0,
        lastEntryWeight: 0,
        lastEntryEfficiency: 0,
        shiftWise: {},
        machineWise: {},
        productWise: {},
        lastEntryDate: null
      };
    }

    // صرف آخری entry تاریخ کے ریکارڈز
    const lastEntryRecords = records.filter(record => {
      const recordDate = record.production_date || record.entry_date;
      if (!recordDate) return false;
      return recordDate === lastEntryDate;
    });

    // Calculate totals
    const lastEntryProduction = lastEntryRecords.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0);
    
    const lastEntryWeight = lastEntryRecords.reduce((sum, record) => 
      sum + (parseFloat(record.weight) || 0), 0);

    const lastEntryEfficiency = calculateEfficiencyForRecords(lastEntryRecords);

    // ✅ **Shift-wise حساب (درست)**
    const shiftWise = {};
    const shiftMap = new Map();
    
    lastEntryRecords.forEach(record => {
      const shiftKey = `${record.production_date}_${record.shift_name}`;
      const shift = record.shift_name || 'N/A';
      
      if (!shiftMap.has(shiftKey)) {
        shiftMap.set(shiftKey, {
          shift: shift,
          production: parseFloat(record.production_quantity) || 0,
          target: parseFloat(record.target_qty) || 0,
          weight: parseFloat(record.weight) || 0,
          count: 1
        });
      } else {
        const existing = shiftMap.get(shiftKey);
        existing.production += parseFloat(record.production_quantity) || 0;
        existing.weight += parseFloat(record.weight) || 0;
        existing.count += 1;
      }
    });

    shiftMap.forEach((data, key) => {
      const shift = data.shift;
      if (!shiftWise[shift]) {
        shiftWise[shift] = { 
          production: data.production,
          target: data.target,
          weight: data.weight,
          count: data.count,
          efficiency: data.target > 0 ? (data.production / data.target) * 100 : 0
        };
      } else {
        shiftWise[shift].production += data.production;
        shiftWise[shift].weight += data.weight;
        shiftWise[shift].count += data.count;
      }
    });

    // ✅ **Machine-wise حساب (درست)**
    const machineWise = {};
    const machineMap = new Map();
    
    lastEntryRecords.forEach(record => {
      const machineKey = `${record.production_date}_${record.shift_name}_${record.machine_no}`;
      const machine = record.machine_no || 'N/A';
      
      if (!machineMap.has(machineKey)) {
        machineMap.set(machineKey, {
          machine: machine,
          production: parseFloat(record.production_quantity) || 0,
          target: parseFloat(record.target_qty) || 0,
          weight: parseFloat(record.weight) || 0,
          count: 1
        });
      } else {
        const existing = machineMap.get(machineKey);
        existing.production += parseFloat(record.production_quantity) || 0;
        existing.weight += parseFloat(record.weight) || 0;
        existing.count += 1;
      }
    });

    machineMap.forEach((data, key) => {
      const machine = data.machine;
      if (!machineWise[machine]) {
        machineWise[machine] = { 
          production: data.production,
          target: data.target,
          weight: data.weight,
          count: data.count,
          efficiency: data.target > 0 ? (data.production / data.target) * 100 : 0
        };
      } else {
        machineWise[machine].production += data.production;
        machineWise[machine].target += data.target;
        machineWise[machine].weight += data.weight;
        machineWise[machine].count += data.count;
        machineWise[machine].efficiency = machineWise[machine].target > 0 
          ? (machineWise[machine].production / machineWise[machine].target) * 100 
          : 0;
      }
    });

    // ✅ **Product-wise حساب**
    const productWise = {};
    lastEntryRecords.forEach(record => {
      const product = record.raw_material_Spiralsize || 'N/A';
      if (!productWise[product]) {
        productWise[product] = { 
          production: 0,
          weight: 0,
          count: 0
        };
      }
      productWise[product].production += parseFloat(record.production_quantity || 0);
      productWise[product].weight += parseFloat(record.weight || 0);
      productWise[product].count += 1;
    });

    return {
      lastEntryRecords: lastEntryRecords.length,
      lastEntryProduction,
      lastEntryWeight,
      lastEntryEfficiency,
      shiftWise,
      machineWise,
      productWise,
      lastEntryDate
    };
  }, [calculateEfficiencyForRecords]);

  // Calculate all statistics
  const calculateAllStats = useCallback((records) => {
    if (!records || records.length === 0) {
      return {
        totalRecords: 0,
        totalProduction: 0,
        totalWeight: 0,
        avgEfficiency: 0
      };
    }

    const totalProduction = records.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0);
    
    const totalWeight = records.reduce((sum, record) => 
      sum + (parseFloat(record.weight) || 0), 0);
    
    const avgEfficiency = calculateEfficiencyForRecords(records);

    return {
      totalRecords: records.length,
      totalProduction,
      totalWeight,
      avgEfficiency
    };
  }, [calculateEfficiencyForRecords]);

  const lastEntryStats = calculateLastEntryStats(records);
  const allStats = calculateAllStats(records);

  // ✅ Efficiency color calculator - Theme colors استعمال کریں
  const getEfficiencyColor = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return '#10b981'; // Success color
    if (eff >= 70) return '#f59e0b'; // Warning color
    return '#ef4444'; // Error color
  };

  const getEfficiencyTextColor = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return '#10b981';
    if (eff >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // Get unique values for filters
  const [products, setProducts] = useState([]);

  // ✅ Filter records function
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.machine_no?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.operator_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.users_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesProduct = !filterProduct || record.raw_material_Spiralsize === filterProduct;

    const recordDate = record.production_date || new Date(record.created_at).toISOString().split("T")[0];
    const matchesDate = !filterDate || recordDate === filterDate;
    
    return matchesSearch && matchesProduct && matchesDate;
  });

  // ✅ Function to generate report data - DYNAMIC SHIFT FORMULA
  const generateReport = () => {
    if (!filterDate) {
      alert("Please select a date first");
      return;
    }

    const dateRecords = records.filter(record => {
      const recordDate = record.production_date || new Date(record.created_at).toISOString().split("T")[0];
      return recordDate === filterDate;
    });

    if (dateRecords.length === 0) {
      alert("No records found for selected date");
      return;
    }

    // Calculate report data
    const totalProduction = dateRecords.reduce((sum, record) => sum + (parseFloat(record.production_quantity) || 0), 0);
    const totalWeight = dateRecords.reduce((sum, record) => sum + (parseFloat(record.weight) || 0), 0);
    const avgEfficiency = calculateEfficiencyForRecords(dateRecords);

    // Item-wise data
    const itemWise = {};
    dateRecords.forEach(record => {
      const item = record.item_name || 'N/A';
      if (!itemWise[item]) {
        itemWise[item] = {
          production: 0,
          weight: 0,
          count: 0,
          efficiency: 0
        };
      }
      itemWise[item].production += parseFloat(record.production_quantity) || 0;
      itemWise[item].weight += parseFloat(record.weight) || 0;
      itemWise[item].count += 1;
      itemWise[item].efficiency += parseFloat(record.efficiency) || 0;
    });

    // ✅ DYNAMIC SHIFT-WISE DATA - جو بھی شفٹ ہو وہ آئے
    const shiftWise = {};
    dateRecords.forEach(record => {
      const shift = record.shift_name || 'N/A';
      if (!shiftWise[shift]) {
        shiftWise[shift] = {
          production: 0,
          weight: 0,
          count: 0,
          efficiency: 0,
          machines: {}
        };
      }
      shiftWise[shift].production += parseFloat(record.production_quantity) || 0;
      shiftWise[shift].weight += parseFloat(record.weight) || 0;
      shiftWise[shift].count += 1;
      shiftWise[shift].efficiency += parseFloat(record.efficiency) || 0;
      
      // Machine-wise data for each shift
      const machine = record.machine_no || 'N/A';
      if (!shiftWise[shift].machines[machine]) {
        shiftWise[shift].machines[machine] = {
          production: 0,
          efficiency: 0,
          operator: record.operator_name || 'N/A',
          weight: 0,
          count: 0
        };
      }
      shiftWise[shift].machines[machine].production += parseFloat(record.production_quantity) || 0;
      shiftWise[shift].machines[machine].efficiency += parseFloat(record.efficiency) || 0;
      shiftWise[shift].machines[machine].weight += parseFloat(record.weight) || 0;
      shiftWise[shift].machines[machine].count += 1;
    });

    // Calculate average efficiency for each shift
    Object.keys(shiftWise).forEach(shift => {
      shiftWise[shift].avgEfficiency = shiftWise[shift].count > 0 
        ? shiftWise[shift].efficiency / shiftWise[shift].count 
        : 0;
    });

    const formattedDate = new Date(filterDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setReportData({
      date: filterDate,
      formattedDate,
      itemWise,
      productWise: itemWise,
      machineWise: {},
      shiftWise,
      totalProduction,
      totalWeight,
      avgEfficiency,
      recordCount: dateRecords.length,
    });

    setShowReport(true);
  };

  // ✅ Print Report Function - DYNAMIC SHIFT
  const handlePrintReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to print. Please generate report first.");
      return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>PVC Coating Production Report - ${reportData.formattedDate}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #005461;
            background: white;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding: 20px;
            background: #3b82f6;
            color: #FFFFFF;
          }
          .header h1 { 
            margin-bottom: 10px; 
          }
          .header .date { 
            font-size: 18px; 
          }
          .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          .table th, .table td { 
            border: 1px solid #3b82f6; 
            padding: 12px; 
            text-align: left; 
          }
          .table th { 
            background-color: #3b82f6; 
            color: #FFFFFF;
          }
          .summary { 
            background-color: #F4F4F4; 
            padding: 20px; 
            margin: 20px 0; 
            border: 1px solid #3b82f6;
          }
          .shift-section { 
            margin: 20px 0; 
            padding: 15px; 
            border-left: 4px solid #3b82f6;
            background: #F4F4F4;
          }
          .shift-header { 
            display: flex; 
            align-items: center; 
            gap: 10px; 
            margin-bottom: 10px; 
          }
          .footer { 
            margin-top: 4px; 
            text-align: center; 
            font-size: 1px; 
            color: #005461;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PVC Coating Production Report</h1>
          <div class="date">${reportData.formattedDate}</div>
          <div class="date">Report Generated by: ${loggedInUser}</div>
        </div>
        
        ${Object.entries(reportData.shiftWise).map(([shift, data]) => `
          <div class="shift-section">
            <div class="shift-header">
              <h3 style="margin: 0; color: #005461;">${shift} Shift Summary</h3>
            </div>
            <p><strong>Production:</strong> ${Math.round(data.production)} Meter</p>
            <p><strong>Weight:</strong> ${Math.round(data.weight)} KG</p>
            <p><strong>Average Efficiency:</strong> ${Math.round(data.avgEfficiency)}%</p>
            <p><strong>Records:</strong> ${data.count}</p>
          </div>
        `).join('')}
        
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
                <td>${Math.round(
                  data.count > 0 ? data.efficiency / data.count : 0
                )}%</td>
                <td>85%</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        ${Object.entries(reportData.shiftWise).map(([shift, shiftData]) => `
          <h3>Machine-wise Summary - ${shift} Shift:</h3>
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
              ${Object.entries(shiftData.machines).map(([machine, data]) => {
                const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
                return `
                  <tr>
                    <td>${machine}</td>
                    <td>${Math.round(data.production)}</td>
                    <td>${Math.round(data.production * 1.2)}</td>
                    <td>${Math.round(data.weight || 0)}</td>
                    <td>${efficiency}%</td>
                    <td>${data.operator || "Operator Absent"}</td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        `).join('')}
        
        <div class="summary">
          <h3>Summary:</h3>
          <p><strong>Total Production:</strong> ${Math.round(
            reportData.totalProduction
          )} Meter</p>
          <p><strong>Target Production:</strong> ${Math.round(
            reportData.totalProduction * 1.2
          )} Meter</p>
          <p><strong>Total Weight:</strong> ${Math.round(
            reportData.totalWeight
          )} KG</p>
          <p><strong>Average Efficiency:</strong> ${Math.round(
            reportData.avgEfficiency
          )}%</p>
          <p><strong>Target Efficiency:</strong> 85%</p>
          <p><strong>Total Records:</strong> ${reportData.recordCount}</p>
          ${Object.entries(reportData.shiftWise).map(([shift, data]) => `
            <p><strong>${shift} Shift Records:</strong> ${data.count}</p>
          `).join('')}
        </div>
        
        <div class="footer">
          Generated on ${new Date().toLocaleString()} by ${loggedInUser}<br/>
          PVC Coating Section - Production Management System
        </div>
        
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: #FFFFFF; border: none; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #005461; color: #FFFFFF; border: none; cursor: pointer; margin-left: 10px;">
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

  // ✅ WhatsApp Report Function - DYNAMIC SHIFT
  const prepareWhatsAppReport = (type = "report") => {
    if (!reportData || reportData.recordCount === 0) {
      return "No report data available.";
    }

    if (type === "custom") {
      return whatsAppMessage;
    }

    let message = `📊 *PVC Coating Production Report*\n`;
    message += `📅 Date: ${reportData.formattedDate}\n`;
    message += `👤 Generated by: ${loggedInUser}\n\n`;

    message += `📈 *Overall Summary:*\n`;
    message += `• Total Production: ${Math.round(
      reportData.totalProduction
    )} M\n`;
    message += `• Total Weight: ${Math.round(reportData.totalWeight)} KG\n`;
    message += `• Average Efficiency: ${Math.round(
      reportData.avgEfficiency
    )}%\n`;
    message += `• Total Records: ${reportData.recordCount}\n\n`;

    message += `🕒 *Shift-wise Summary:*\n\n`;

    Object.entries(reportData.shiftWise).forEach(([shift, data]) => {
      message += `*${shift} Shift:*\n`;
      message += `• Production: ${Math.round(data.production)} M\n`;
      message += `• Weight: ${Math.round(data.weight)} KG\n`;
      message += `• Avg Efficiency: ${Math.round(data.avgEfficiency)}%\n`;
      message += `• Records: ${data.count}\n\n`;
    });

    if (Object.keys(reportData.itemWise).length > 0) {
      message += `📋 *Item-wise Summary:*\n`;
      Object.entries(reportData.itemWise).forEach(([item, data], index) => {
        message += `${index + 1}. ${item}: ${Math.round(
          data.production
        )} M, ${Math.round(data.weight)} KG\n`;
      });
      message += `\n`;
    }

    Object.entries(reportData.shiftWise).forEach(([shift, shiftData]) => {
      message += `🏭 *Machine-wise Summary - ${shift} Shift:*\n`;
      Object.entries(shiftData.machines).forEach(([machine, data], index) => {
        const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
        const operator = data.operator || "Operator Absent";
        message += `${index + 1}. ${machine}: ${Math.round(
          data.production
        )} M, ${efficiency}% | ${operator}\n`;
      });
      message += `\n`;
    });

    message += `📝 *Report Summary:*\n`;
    message += `• Target Production: ${Math.round(
      reportData.totalProduction * 1.2
    )} M\n`;
    message += `• Target Efficiency: 85%\n\n`;

    message += `✅ Generated via PVC Coating Management System`;

    return message;
  };

  const sendReportViaWhatsApp = () => {
    const reportMessage = prepareWhatsAppReport("report");
    const encodedMessage = encodeURIComponent(reportMessage);

    const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;

    try {
      window.location.href = whatsappUrl;

      setTimeout(() => {
        if (document.hasFocus()) {
          alert(
            "WhatsApp Desktop is not opening. Please open WhatsApp manually and paste:"
          );
          navigator.clipboard
            .writeText(reportMessage)
            .then(() =>
              alert("Report copied to clipboard. Please paste in WhatsApp.")
            );
        }
      }, 1000);
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      navigator.clipboard.writeText(reportMessage).then(() => {
        alert("Report copied to clipboard. Please paste in WhatsApp.");
      });
    }

    setShowWhatsAppModal(false);
    setWhatsAppMessage("");
  };

  // ✅ Excel Export Functions
  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      alert("No records to export");
      return;
    }

    const csvContent = [
      [
        "ID",
        "Item Name",
        "Finished Product",
        "Machine No",
        "Production Date",
        "Shift",
        "Production (M)",
        "Target (M)",
        "Weight (KG)",
        "Per Meter WT",
        "Efficiency %",
        "Operator",
        "User Name",
        "Remarks",
        "Created At",
      ],
      ...filteredRecords.map((record) => [
        record.id,
        `"${record.item_name || ""}"`,
        `"${record.raw_material_Spiralsize || ""}"`,
        `"${record.machine_no || ""}"`,
        `"${record.production_date || ""}"`,
        `"${record.shift_name || ""}"`,
        parseFloat(record.production_quantity) || 0,
        parseFloat(record.target_qty) || 0,
        parseFloat(record.weight) || 0,
        parseFloat(record.per_meter_wt) || 0,
        parseFloat(record.efficiency) || 0,
        `"${record.operator_name || ""}"`,
        `"${record.users_name || ""}"`,
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
    a.download = `pvc-coating-records-${
      new Date().toISOString().split("T")[0]
    }-${loggedInUser}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to export. Please generate report first.");
      return;
    }

    const csvContent = [
      ["PVC Coating Production Report", reportData.formattedDate],
      ["Generated by: " + loggedInUser],
      [],
      ["SHIFT-WISE SUMMARY"],
      ...Object.entries(reportData.shiftWise).flatMap(([shift, data]) => [
        [],
        [`${shift} Shift Summary`],
        ["Production (Meter):", Math.round(data.production)],
        ["Weight (KG):", Math.round(data.weight)],
        ["Average Efficiency:", Math.round(data.avgEfficiency) + "%"],
        ["Records:", data.count],
      ]),
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
      ...Object.entries(reportData.shiftWise).flatMap(([shift, shiftData]) => [
        [],
        [`Machine-wise Summary - ${shift} Shift`],
        [
          "Machine No",
          "Production (Meter)",
          "Target (Meter)",
          "Weight (KG)",
          "Avg Efficiency",
          "Operator",
        ],
        ...Object.entries(shiftData.machines).map(([machine, data]) => {
          const efficiency = data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
          return [
            machine,
            Math.round(data.production),
            Math.round(data.production * 1.2),
            Math.round(data.weight || 0),
            efficiency + "%",
            data.operator || "Operator Absent",
          ];
        }),
      ]),
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
      ...Object.entries(reportData.shiftWise).map(([shift, data]) => [
        [`${shift} Shift Records:`, data.count],
      ]).flat(),
      [],
      ["Generated by: " + loggedInUser],
      ["Generated on:", new Date().toLocaleString()],
    ]
      .map((row) => Array.isArray(row) ? row.join(",") : row)
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pvc-coating-report-${filterDate}-${loggedInUser}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // ✅ Delete Function
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm(`Are you sure you want to delete record #${recordId}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("pvcsection")
        .delete()
        .eq("id", recordId);

      if (error) throw error;

      alert(`Record #${recordId} deleted successfully!`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("Error deleting record. Please try again.");
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // ✅ WhatsApp Modal Component
  const WhatsAppModal = () => (
    <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaWhatsapp className="whatsapp-icon" /> Send Report via WhatsApp
          </h2>
          <button
            onClick={() => setShowWhatsAppModal(false)}
            className="modal-close-btn"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="whatsapp-modal-content">
            <FaWhatsapp size={48} className="whatsapp-icon-large" />
            <h3>Send to WhatsApp Desktop</h3>
            <p className="whatsapp-modal-text">
              Select one of the options below. Report will automatically open in
              WhatsApp Desktop.
            </p>
          </div>

          <div className="whatsapp-options">
            <div className="options-row">
              <button
                onClick={sendReportViaWhatsApp}
                className="whatsapp-option-btn whatsapp-desktop-btn"
              >
                <FaWhatsapp /> WhatsApp Desktop
              </button>

              <button
                onClick={() => {
                  const reportMessage = prepareWhatsAppReport("report");
                  navigator.clipboard.writeText(reportMessage).then(() => {
                    alert(
                      "Report copied to clipboard. Please paste in WhatsApp."
                    );
                    setShowWhatsAppModal(false);
                  });
                }}
                className="whatsapp-option-btn copy-message-btn"
              >
                <FiDownload /> Copy Message
              </button>

              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="whatsapp-option-btn close-btn"
              >
                <FiX /> Close
              </button>
            </div>
          </div>

          <div className="preview-section">
            <h4>
              <FiEye /> Message Preview
            </h4>
            <div className="message-preview">
              {prepareWhatsAppReport("report")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && records.length === 0) {
    return (
      <div className={`loading-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`} style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
        backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
      }}>
        <div className="mini-spinner" style={{ 
          width: '40px', 
          height: '40px',
          border: `3px solid ${isDarkMode ? '#333' : '#EEE'}`,
          borderTopColor: currentTheme?.colors?.primary || '#3b82f6' 
        }}></div>
        <div style={{ 
          marginTop: '16px', 
          color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY COLORS
        }}>
          Loading PVC Coating Data...
        </div>
      </div>
    );
  }

  return (
    <div className={`pvc-container ${isDarkMode ? 'dark-mode' : 'light-mode'}`} style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
      color: isDarkMode ? '#7986CB' : '#1A237E', // ✅ INDIGO/NAVY COLORS
      overflowX: 'hidden'
    }}>
      {/* Database Alert */}
      {!isSupabaseConnected && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          color: '#1A237E' // ✅ INDIGO/NAVY COLOR
        }}>
          <FiAlertCircle style={{ color: '#d97706', fontSize: '18px' }} />
          <div>
            <strong>Supabase Connection Issue</strong>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              Check your .env file for REACT_APP_SUPABASE_URL
            </div>
          </div>
        </div>
      )}

      {/* ✅ HEADER - Fixed to be below main header */}
      <div className="blue-header" style={{
        background: `linear-gradient(135deg, ${currentTheme?.colors?.primary || '#3b82f6'}, #2563eb)`,
        color: 'white',
        position: 'relative', // ✅ Changed from sticky to relative
        zIndex: 100,
        width: '100%',
        marginTop: '0', // ✅ Ensure it starts from top
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          gap: '12px'
        }}>
          <button 
            onClick={() => navigate("/production")}
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <FiArrowLeft style={{ fontSize: '18px' }} />
          </button>
          
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
            color: 'white'
          }}>
            <FiPackage />
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginBottom: '4px' 
            }}>
              <h1 style={{
                fontSize: '18px',
                fontWeight: '700',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: 'white'
              }}>
                PVC Coating
              </h1>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                fontSize: '12px',
                flexShrink: 0,
                color: 'white'
              }}>
                {isSupabaseConnected ? <FiCheckCircle /> : <FiXCircle />}
                {isSupabaseConnected ? "Connected" : "Offline"}
              </div>
            </div>
            <div style={{
              fontSize: '13px',
              opacity: 0.9,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'white'
            }}>
              Production Management System
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 16px 12px',
          background: 'rgba(0, 0, 0, 0.05)'
        }}>
          <button 
            onClick={() => navigate("/production-sections/pvc-coating/new")}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <FiPlus style={{ fontSize: '16px' }} /> New
          </button>
          
          <button 
            onClick={() => navigate("/production-sections/pvc-coating/multi-entry")}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <FiGrid style={{ fontSize: '16px' }} /> Multi
          </button>
          
          <button 
            onClick={toggleMode}
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            style={{
              width: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            {isDarkMode ? <FiSun style={{ fontSize: '18px' }} /> : <FiMoon style={{ fontSize: '18px' }} />}
          </button>
          
          <button 
            onClick={fetchData}
            disabled={loading}
            style={{
              width: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            {loading ? <div className="mini-spinner" style={{ 
              width: '20px', 
              height: '20px',
              border: `2px solid rgba(255, 255, 255, 0.3)`,
              borderTopColor: 'white'
            }}></div> : <FiRefreshCw style={{ fontSize: '18px' }} />}
          </button>
        </div>
      </div>

      {/* ✅ 1. پہلے کارڈز (8 کارڈز) */}
      <div className="stats-grid" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '12px'
      }}>
        <div className="top-stats-row">
          {/* Total Records */}
          <div className="stat-card blue-card" style={{
            backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            flex: '1 0 calc(25% - 6px)',
            minHeight: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                flexShrink: 0
              }}>
                <FiDatabase />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500', marginBottom: '2px' }}>
                  Total Records
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                  {allStats.totalRecords}
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Production */}
          <div className="stat-card blue-card" style={{
            backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            flex: '1 0 calc(25% - 6px)',
            minHeight: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                flexShrink: 0
              }}>
                <FiPackage />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500', marginBottom: '2px' }}>
                  Total Production
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                  {formatInteger(allStats.totalProduction)} M
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Weight */}
          <div className="stat-card blue-card" style={{
            backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            flex: '1 0 calc(25% - 6px)',
            minHeight: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                flexShrink: 0
              }}>
                <FiDroplet />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500', marginBottom: '2px' }}>
                  Total Weight
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                  {formatWeight(allStats.totalWeight)} KG
                </div>
              </div>
            </div>
          </div>
          
          {/* Avg Efficiency */}
          <div className="stat-card blue-card" style={{
            backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            flex: '1 0 calc(25% - 6px)',
            minHeight: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                flexShrink: 0
              }}>
                <FiTrendingUp />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500', marginBottom: '2px' }}>
                  Avg Efficiency
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: 'white', 
                  marginBottom: '4px' 
                }}>
                  <span>{allStats.avgEfficiency.toFixed(1)}%</span>
                  {allStats.avgEfficiency >= 70 ? (
                    <FiArrowUp style={{ 
                      color: 'white', 
                      marginLeft: '4px',
                      fontSize: '14px'
                    }} />
                  ) : (
                    <FiArrowDown style={{ 
                      color: 'white', 
                      marginLeft: '4px',
                      fontSize: '14px'
                    }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-stats-row">
          {/* Last Entry Records */}
          <div className="stat-card light-card" style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
            flex: '1 0 calc(25% - 6px)',
            minHeight: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                background: isDarkMode ? '#333' : '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme?.colors?.primary || '#3b82f6',
                fontSize: '16px',
                flexShrink: 0
              }}>
                <FiClock />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: isDarkMode ? '#7986CB' : '#1A237E', // ✅ INDIGO/NAVY
                  fontWeight: '500', 
                  marginBottom: '2px' 
                }}>
                  Last Day Records
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: isDarkMode ? '#7986CB' : '#1A237E', // ✅ INDIGO/NAVY
                  marginBottom: '4px' 
                }}>
                  {lastEntryStats.lastEntryRecords}
                </div>
                <div style={{
                  fontSize: '8px',
                  color: isDarkMode ? '#9FA8DA' : '#283593', // ✅ INDIGO/NAVY
                  background: isDarkMode ? '#333' : '#F5F5F5',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  width: 'fit-content'
                }}>
                  {lastEntryStats.lastEntryDate || 'No date'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Last Entry Production */}
          <div className="stat-card light-card" style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
            flex: '1 0 calc(25% - 6px)',
            minHeight: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                background: isDarkMode ? '#333' : '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme?.colors?.primary || '#3b82f6',
                fontSize: '16px',
                flexShrink: 0
              }}>
                <FiActivity />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: isDarkMode ? '#7986CB' : '#1A237E', // ✅ INDIGO/NAVY
                  fontWeight: '500', 
                  marginBottom: '2px' 
                }}>
                  Last Day Production
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: isDarkMode ? '#7986CB' : '#1A237E', // ✅ INDIGO/NAVY
                  marginBottom: '4px' 
                }}>
                  {formatInteger(lastEntryStats.lastEntryProduction)} M
                </div>
                <div style={{
                  fontSize: '8px',
                  color: isDarkMode ? '#9FA8DA' : '#283593', // ✅ INDIGO/NAVY
                  background: isDarkMode ? '#333' : '#F5F5F5',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  width: 'fit-content'
                }}>
                  {lastEntryStats.lastEntryDate || 'No date'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Last Entry Weight */}
          <div className="stat-card light-card" style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
            flex: '1 0 calc(25% - 6px)',
            minHeight: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                background: isDarkMode ? '#333' : '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme?.colors?.primary || '#3b82f6',
                fontSize: '16px',
                flexShrink: 0
              }}>
                <FiDroplet />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: isDarkMode ? '#7986CB' : '#1A237E', // ✅ INDIGO/NAVY
                  fontWeight: '500', 
                  marginBottom: '2px' 
                }}>
                  Last Day Weight
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: isDarkMode ? '#7986CB' : '#1A237E', // ✅ INDIGO/NAVY
                  marginBottom: '4px' 
                }}>
                  {formatWeight(lastEntryStats.lastEntryWeight)} KG
                </div>
                <div style={{
                  fontSize: '8px',
                  color: isDarkMode ? '#9FA8DA' : '#283593', // ✅ INDIGO/NAVY
                  background: isDarkMode ? '#333' : '#F5F5F5',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  width: 'fit-content'
                }}>
                  {lastEntryStats.lastEntryDate || 'No date'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Last Entry Efficiency */}
          <div className="stat-card light-card" style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            borderRadius: '8px',
            padding: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
            flex: '1 0 calc(25% - 6px)',
            minHeight: '70px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                background: isDarkMode ? '#333' : '#F5F5F5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentTheme?.colors?.primary || '#3b82f6',
                fontSize: '16px',
                flexShrink: 0
              }}>
                <FiPercent />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ 
                  fontSize: '10px', 
                  color: isDarkMode ? '#7986CB' : '#1A237E', // ✅ INDIGO/NAVY
                  fontWeight: '500', 
                  marginBottom: '2px' 
                }}>
                  Last Day Efficiency
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: getEfficiencyTextColor(lastEntryStats.lastEntryEfficiency),
                  marginBottom: '4px' 
                }}>
                  {lastEntryStats.lastEntryEfficiency.toFixed(1)}%
                </div>
                <div style={{
                  fontSize: '8px',
                  color: isDarkMode ? '#9FA8DA' : '#283593', // ✅ INDIGO/NAVY
                  background: isDarkMode ? '#333' : '#F5F5F5',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  display: 'inline-block',
                  width: 'fit-content'
                }}>
                  {lastEntryStats.lastEntryDate || 'No date'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 2. دوسرا: لاسٹ انٹری ڈیش بورڈ */}
      <div style={{ padding: '12px', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <FiActivity style={{ fontSize: '20px', color: currentTheme?.colors?.primary || '#3b82f6' }} />
          <div>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY
            }}>
              Last Entry Dashboard
            </h2>
            <p style={{ fontSize: '12px', color: isDarkMode ? '#9FA8DA' : '#283593' }}> {/* ✅ INDIGO/NAVY */}
              {lastEntryStats.lastEntryDate ? `Date: ${lastEntryStats.lastEntryDate}` : 'No entry date'}
            </p>
          </div>
        </div>

        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        }}>
          {/* Shift-wise Card */}
          <div style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            borderRadius: '8px',
            padding: '12px',
            border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY
              }}>
                <FiWatch className="dashboard-icon-spaced" /> Shift-wise
              </h3>
              <span style={{
                fontSize: '10px',
                backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {Object.keys(lastEntryStats.shiftWise).length}
              </span>
            </div>
            
            {Object.entries(lastEntryStats.shiftWise).length > 0 ? (
              Object.entries(lastEntryStats.shiftWise).map(([shift, data]) => (
                <div key={shift} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div className="icon-label-container">
                      <FiWatch className="item-icon-spaced" />
                      <span style={{ 
                        fontSize: '12px',
                        color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY
                      }}>
                        {shift}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '11px', 
                      color: getEfficiencyTextColor(data.efficiency),
                      fontWeight: '600'
                    }}>
                      {data.efficiency.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: isDarkMode ? '#9FA8DA' : '#283593', marginBottom: '6px' }}>
                    <span>{formatInteger(data.production)}M / {formatInteger(data.target)}M</span>
                    <span>{formatWeight(data.weight)}KG</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: isDarkMode ? '#333' : '#E0E0E0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, data.efficiency)}%`,
                      height: '100%',
                      backgroundColor: getEfficiencyColor(data.efficiency),
                      borderRadius: '2px'
                    }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                <FiWatch style={{ fontSize: '24px', color: isDarkMode ? '#9FA8DA' : '#283593', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px', color: isDarkMode ? '#9FA8DA' : '#283593' }}>
                  No shift records
                </p>
              </div>
            )}
          </div>

          {/* Machine-wise Card */}
          <div style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            borderRadius: '8px',
            padding: '12px',
            border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY
              }}>
                <FiCpu className="dashboard-icon-spaced" /> Machine-wise
              </h3>
              <span style={{
                fontSize: '10px',
                backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {Object.keys(lastEntryStats.machineWise).length}
              </span>
            </div>
            
            {Object.entries(lastEntryStats.machineWise).length > 0 ? (
              Object.entries(lastEntryStats.machineWise).map(([machine, data]) => (
                <div key={machine} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div className="icon-label-container">
                      <FiCpu className="item-icon-spaced" />
                      <span style={{ 
                        fontSize: '12px',
                        color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY
                      }}>
                        {machine}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '11px', 
                      color: getEfficiencyTextColor(data.efficiency),
                      fontWeight: '600'
                    }}>
                      {data.efficiency.toFixed(1)}%
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: isDarkMode ? '#9FA8DA' : '#283593', marginBottom: '6px' }}>
                    <span>{formatInteger(data.production)}M / {formatInteger(data.target)}M</span>
                    <span>{formatWeight(data.weight)}KG</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: isDarkMode ? '#333' : '#E0E0E0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, data.efficiency)}%`,
                      height: '100%',
                      backgroundColor: getEfficiencyColor(data.efficiency),
                      borderRadius: '2px'
                    }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                <FiCpu style={{ fontSize: '24px', color: isDarkMode ? '#9FA8DA' : '#283593', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px', color: isDarkMode ? '#9FA8DA' : '#283593' }}>
                  No machine records
                </p>
              </div>
            )}
          </div>

          {/* Product-wise Card */}
          <div style={{
            backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            borderRadius: '8px',
            padding: '12px',
            border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY
              }}>
                <FiBox className="dashboard-icon-spaced" /> Product-wise
              </h3>
              <span style={{
                fontSize: '10px',
                backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {Object.keys(lastEntryStats.productWise).length}
              </span>
            </div>
            
            {Object.entries(lastEntryStats.productWise).length > 0 ? (
              Object.entries(lastEntryStats.productWise).map(([product, data]) => (
                <div key={product} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div className="icon-label-container">
                      <FiBox className="item-icon-spaced" />
                      <span style={{ 
                        fontSize: '12px',
                        color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY
                      }}>
                        {product.substring(0, 15)}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: isDarkMode ? '#9FA8DA' : '#283593' }}>
                      {formatInteger(data.production)}M
                    </div>
                  </div>
                  <div style={{ height: '4px', backgroundColor: isDarkMode ? '#333' : '#E0E0E0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (data.production / (lastEntryStats.lastEntryProduction || 1)) * 100)}%`,
                      height: '100%',
                      background: `linear-gradient(to right, ${currentTheme?.colors?.primary || '#3b82f6'}, #8b5cf6)`,
                      borderRadius: '2px'
                    }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
                <FiBox style={{ fontSize: '24px', color: isDarkMode ? '#9FA8DA' : '#283593', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px', color: isDarkMode ? '#9FA8DA' : '#283593' }}>
                  No product records
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 3. تیسرا: فلٹرز */}
      <div style={{ padding: '12px', marginTop: '8px' }}>
        <div style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#7986CB' : '#1A237E', marginBottom: '12px' }}>
            <FiFilter size={18} />
            <span style={{ marginLeft: '8px' }}>FILTERS</span>
          </div>
          
          <div className="filters-single-line" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: '1 0 calc(14.285% - 8px)', minWidth: '120px' }}>
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                  borderRadius: '6px',
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                  color: isDarkMode ? '#7986CB' : '#1A237E',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ flex: '1 0 calc(14.285% - 8px)', minWidth: '120px' }}>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                  borderRadius: '6px',
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                  color: isDarkMode ? '#7986CB' : '#1A237E',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 0 calc(14.285% - 8px)', minWidth: '120px' }}>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                  borderRadius: '6px',
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                  color: isDarkMode ? '#7986CB' : '#1A237E',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ flex: '1 0 calc(14.285% - 8px)', minWidth: '120px' }}>
              <button
                onClick={generateReport}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: currentTheme?.colors?.primary || '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FiBarChart2 /> Generate Report
              </button>
            </div>

            <div style={{ flex: '1 0 calc(14.285% - 8px)', minWidth: '120px' }}>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterProduct("");
                  setFilterDate("");
                  setShowReport(false);
                  setCurrentPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: isDarkMode ? '#333' : '#F5F5F5',
                  color: isDarkMode ? '#7986CB' : '#1A237E',
                  border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FiX /> Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Show Report Actions Only When Report is Generated */}
      {showReport && reportData.recordCount > 0 && (
        <div style={{
          backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
          border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
          borderRadius: '6px',
          margin: '12px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#7986CB' : '#1A237E' }}>
              Report Generated: {reportData.formattedDate}
            </h3>
            <span style={{ color: isDarkMode ? '#9FA8DA' : '#283593', fontSize: '12px' }}>
              Records: {reportData.recordCount} | 
              Production: {formatInteger(reportData.totalProduction)}M | 
              Efficiency: {Math.round(reportData.avgEfficiency)}%
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowExportOptions(!showExportOptions)}
                style={{
                  padding: '8px 12px',
                  background: currentTheme?.colors?.primary || '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiDownload /> Export Options
              </button>
              
              {showExportOptions && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  minWidth: '200px',
                  marginTop: '4px'
                }}>
                  <button onClick={handleExportReport} style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'transparent',
                    color: isDarkMode ? '#7986CB' : '#1A237E',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiDownload /> Export Report Excel
                  </button>
                  <button onClick={handleExportExcel} style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'transparent',
                    color: isDarkMode ? '#7986CB' : '#1A237E',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FiDownload /> Export Records Excel
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowWhatsAppModal(true)}
              style={{
                padding: '8px 12px',
                background: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaWhatsapp /> WhatsApp
            </button>
            
            <button
              onClick={handlePrintReport}
              style={{
                padding: '8px 12px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FiPrinter /> Print
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && <WhatsAppModal />}

      {/* ✅ 4. چوتھا: ٹیبل */}
      <div style={{ padding: '12px', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: isDarkMode ? '#7986CB' : '#1A237E' // ✅ INDIGO/NAVY
          }}>
            Records
          </h2>
          <div style={{ fontSize: '12px', color: isDarkMode ? '#9FA8DA' : '#283593', display: 'flex', gap: '8px' }}>
            <span>Total: {records.length}</span>
            <span>Filtered: {filteredRecords.length}</span>
            <span>Page: {currentPage}/{totalPages}</span>
          </div>
        </div>

        <div className="table-container" style={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '6px',
          backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
          border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`
        }}>
          <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  'ID', 'Machine', 'Prod Date & Shift', 'Item Details', 
                  'User', 'Operator', 'Prod Qty', 
                  'Weight', 'Efficiency', 'Remarks', 'Entry Date', 'Actions'
                ].map((header, index) => (
                  <th key={index} style={{
                    padding: '12px 8px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '12px',
                    color: isDarkMode ? '#9FA8DA' : '#283593',
                    backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
                    borderBottom: `2px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => {
                const efficiency = parseFloat(record.efficiency || 0);
                const efficiencyColor = getEfficiencyColor(efficiency);
                
                return (
                  <tr key={record.id} style={{ borderBottom: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}` }}>
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div style={{
                        backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-block',
                        textAlign: 'center'
                      }}>
                        #{record.id}
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div className="icon-container">
                        <FiCpu className="table-icon-spaced icon-blue" />
                        <span style={{ color: isDarkMode ? '#7986CB' : '#1A237E' }}>{record.machine_no || "N/A"}</span>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div className="icon-container">
                          <FiCalendar className="table-icon-spaced icon-green" />
                          <span style={{ fontSize: '11px', fontWeight: '600', color: isDarkMode ? '#7986CB' : '#1A237E' }}>
                            {record.production_date || "N/A"}
                          </span>
                        </div>
                        <div className="icon-container">
                          <FiHash className="table-icon-spaced icon-purple" />
                          <span style={{ fontSize: '11px', fontWeight: '400', color: isDarkMode ? '#9FA8DA' : '#283593' }}>
                            {record.shift_name || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontWeight: '600', color: isDarkMode ? '#7986CB' : '#1A237E', fontSize: '12px' }}>
                          {record.item_name || "N/A"}
                        </div>
                        <div style={{ color: isDarkMode ? '#9FA8DA' : '#283593', fontSize: '11px' }}>
                          {record.raw_material_Spiralsize || "N/A"}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div className="icon-container">
                        <FiUser className="table-icon-spaced icon-blue" />
                        <span style={{ color: isDarkMode ? '#7986CB' : '#1A237E' }}>{record.users_name || "N/A"}</span>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div className="icon-container">
                        <FiUserCheck className="table-icon-spaced icon-yellow" />
                        <span style={{ color: isDarkMode ? '#7986CB' : '#1A237E' }}>{record.operator_name || "N/A"}</span>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div className="icon-container">
                          <FiBarChart2 className="table-icon-spaced icon-green" />
                          <div style={{ fontWeight: '700', color: currentTheme?.colors?.primary || '#3b82f6', fontSize: '13px', marginLeft: '4px' }}>
                            {formatInteger(record.production_quantity)} {record.unit || "M"}
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '3px', display: 'flex', alignItems: 'center', marginTop: '2px' }}>
                          Target: {formatInteger(record.target_qty)} M
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div className="icon-container">
                          <FiDroplet className="table-icon-spaced icon-blue" />
                          <div style={{ fontWeight: '600', color: isDarkMode ? '#7986CB' : '#1A237E', fontSize: '12px', marginLeft: '4px' }}>
                            {formatWeight(record.weight)} KG
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', color: isDarkMode ? '#9FA8DA' : '#283593', backgroundColor: isDarkMode ? '#333' : '#F5F5F5', padding: '1px 4px', borderRadius: '3px', display: 'inline-block' }}>
                          {record.per_meter_wt || "N/A"} per meter
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <div className="icon-container">
                          <FiPercent className="table-icon-spaced" style={{ color: efficiencyColor }} />
                          <div style={{ fontWeight: '700', fontSize: '12px', textAlign: 'center', marginLeft: '4px', color: efficiencyColor }}>
                            {efficiency.toFixed(1)}%
                          </div>
                        </div>
                        <div style={{ width: '60px', height: '4px', backgroundColor: isDarkMode ? '#333' : '#E0E0E0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, efficiency)}%`,
                            height: '100%',
                            backgroundColor: efficiencyColor,
                            borderRadius: '2px'
                          }}></div>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div className="icon-container">
                        <FiMessageSquare className="table-icon-spaced icon-gray" />
                        <div style={{
                          maxWidth: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '11px',
                          color: isDarkMode ? '#9FA8DA' : '#64748b',
                          padding: '2px 4px',
                          backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
                          borderRadius: '3px',
                          marginLeft: '4px'
                        }}>
                          {record.remarks?.substring(0, 15) || "N/A"}
                          {record.remarks?.length > 15 ? "..." : ""}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div className="icon-container">
                        <FiLogIn className="table-icon-spaced icon-purple" />
                        <div style={{
                          fontSize: '11px',
                          color: isDarkMode ? '#9FA8DA' : '#283593',
                          padding: '2px 4px',
                          backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
                          borderRadius: '3px',
                          marginLeft: '4px'
                        }}>
                          {record.entry_date || "N/A"}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          title="View"
                          onClick={() => navigate(`/production-sections/pvc-coating/view/${record.id}`)}
                          className="action-button view"
                          style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #10b981',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FiEye />
                        </button>
                        <button 
                          title="Edit"
                          onClick={() => navigate(`/production-sections/pvc-coating/edit/${record.id}`)}
                          className="action-button edit"
                          style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #f59e0b',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FiEdit />
                        </button>
                        <button 
                          title="Delete"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="action-button delete"
                          style={{
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #ef4444',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 0', alignItems: 'center', marginTop: '16px' }}>
            <div style={{ textAlign: 'center', fontSize: '12px', color: isDarkMode ? '#9FA8DA' : '#283593' }}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                  color: isDarkMode ? '#7986CB' : '#1A237E',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                <FiChevronLeft style={{ fontSize: '16px' }} /> Previous
              </button>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: currentPage === pageNum ? (currentTheme?.colors?.primary || '#3b82f6') : (isDarkMode ? '#1a1a1a' : '#FFFFFF'),
                        color: currentPage === pageNum ? 'white' : (isDarkMode ? '#7986CB' : '#1A237E')
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                  color: isDarkMode ? '#7986CB' : '#1A237E',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next <FiChevronRight style={{ fontSize: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        padding: '16px',
        textAlign: 'center',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#F5F5F5',
        borderTop: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '12px', color: isDarkMode ? '#9FA8DA' : '#283593', marginBottom: '8px' }}>
          PVC Coating Section • Production Management System
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate("/production-sections/pvc-coating/new")}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: currentTheme?.colors?.primary || '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <FiPlus style={{ fontSize: '16px' }} /> New Entry
          </button>
          <button 
            onClick={fetchData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
              color: isDarkMode ? '#7986CB' : '#1A237E',
              border: `1px solid ${isDarkMode ? '#333' : '#E0E0E0'}`,
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            <FiRefreshCw style={{ fontSize: '16px' }} /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default PVCcoatingPage;