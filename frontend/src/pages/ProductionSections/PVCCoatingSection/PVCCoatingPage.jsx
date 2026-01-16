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
import "./PVCCoatingPage.css";

const PVCcoatingPage = () => {
  const navigate = useNavigate();
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "light";
  });
  
  // Apply theme
  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    localStorage.setItem("app-theme", theme);
  }, [theme]);
  
  const toggleTheme = () => {
    const themes = ['light', 'dark', 'cream'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

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
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const [products, setProducts] = useState([]);

  const [reportData, setReportData] = useState({
    date: "",
    formattedDate: "",
    itemWise: {},
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
      const uniqueProducts = [...new Set(data.map(r => r.finishedproductname).filter(Boolean))];
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
      const product = record.finishedproductname || 'N/A';
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

  // ✅ Efficiency color calculator
  const getEfficiencyColor = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return '#10b981';
    if (eff >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getEfficiencyTextColor = (efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return '#10b981';
    if (eff >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // ✅ Filter records function
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.item_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.machine_no?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.operator_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (record.users_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesProduct = !filterProduct || record.finishedproductname === filterProduct;

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
      alert("No report data to print");
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

  // ✅ Excel Export Function
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
        `"${record.finishedproductname || ""}"`,
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
      alert("No report data to export");
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
      <div style={styles.loadingContainer}>
        <div className="mini-spinner" style={{ width: '40px', height: '40px' }}></div>
        <div style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          Loading PVC Coating Data...
        </div>
      </div>
    );
  }

  return (
    <div className={`pvc-container theme-${theme}`} style={styles.container}>
      {/* Database Alert */}
      {!isSupabaseConnected && (
        <div style={styles.dbAlert}>
          <FiAlertCircle style={{ color: '#d97706', fontSize: '18px' }} />
          <div>
            <strong>Supabase Connection Issue</strong>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              Check your .env file for REACT_APP_SUPABASE_URL
            </div>
          </div>
        </div>
      )}

      {/* ✅ HEADER */}
      <div className="blue-header" style={styles.header}>
        <div style={styles.headerTop}>
          <button 
            onClick={() => navigate("/production")}
            style={styles.backButton}
          >
            <FiArrowLeft style={{ fontSize: '18px' }} />
          </button>
          
          <div style={styles.headerIcon}>
            <FiPackage style={{ fontSize: '20px' }} />
          </div>
          
          <div style={styles.headerContent}>
            <div style={styles.headerTitleRow}>
              <h1 style={styles.headerTitle}>
                PVC Coating
              </h1>
              <div style={styles.connectionBadge}>
                {isSupabaseConnected ? <FiCheckCircle /> : <FiXCircle />}
                {isSupabaseConnected ? "Connected" : "Offline"}
              </div>
            </div>
            <div style={styles.headerSubtitle}>
              Production Management System
            </div>
          </div>
        </div>
        
        <div style={styles.headerButtons}>
          <button 
            onClick={() => navigate("/production-sections/pvc-coating/new")}
            style={styles.headerButton}
          >
            <FiPlus style={{ fontSize: '16px' }} /> New
          </button>
          
          <button 
            onClick={() => navigate("/production-sections/pvc-coating/multi-entry")}
            style={styles.headerButton}
          >
            <FiGrid style={{ fontSize: '16px' }} /> Multi
          </button>
          
          <button 
            onClick={toggleTheme}
            title={`Theme: ${theme}`}
            style={styles.themeButton}
          >
            {theme === 'light' && <FiSun style={{ fontSize: '18px' }} />}
            {theme === 'dark' && <FiMoon style={{ fontSize: '18px' }} />}
            {theme === 'cream' && <FiZap style={{ fontSize: '18px' }} />}
          </button>
          
          <button 
            onClick={fetchData}
            disabled={loading}
            style={styles.refreshButton}
          >
            {loading ? <div className="mini-spinner"></div> : <FiRefreshCw style={{ fontSize: '18px' }} />}
          </button>
        </div>
      </div>

      {/* ✅ 1. پہلے کارڈز (8 کارڈز) */}
      <div className="stats-grid" style={styles.statsGrid}>
        <div className="top-stats-row">
          {/* Total Records */}
          <div className="stat-card blue-card" style={styles.statCard}>
            <div className="stat-content" style={styles.statContent}>
              <div className="stat-icon-left" style={styles.statIconLeft}>
                <FiDatabase style={{ fontSize: '16px' }} />
              </div>
              <div className="stat-text" style={styles.statText}>
                <div className="stat-title" style={styles.statTitle}>Total Records</div>
                <div className="stat-value" style={styles.statValue}>{allStats.totalRecords}</div>
              </div>
            </div>
          </div>
          
          {/* Total Production */}
          <div className="stat-card blue-card" style={styles.statCard}>
            <div className="stat-content" style={styles.statContent}>
              <div className="stat-icon-left" style={styles.statIconLeft}>
                <FiPackage style={{ fontSize: '16px' }} />
              </div>
              <div className="stat-text" style={styles.statText}>
                <div className="stat-title" style={styles.statTitle}>Total Production</div>
                <div className="stat-value" style={styles.statValue}>
                  {formatInteger(allStats.totalProduction)} M
                </div>
              </div>
            </div>
          </div>
          
          {/* Total Weight */}
          <div className="stat-card blue-card" style={styles.statCard}>
            <div className="stat-content" style={styles.statContent}>
              <div className="stat-icon-left" style={styles.statIconLeft}>
                <FiDroplet style={{ fontSize: '16px' }} />
              </div>
              <div className="stat-text" style={styles.statText}>
                <div className="stat-title" style={styles.statTitle}>Total Weight</div>
                <div className="stat-value" style={styles.statValue}>
                  {formatWeight(allStats.totalWeight)} KG
                </div>
              </div>
            </div>
          </div>
          
          {/* Avg Efficiency */}
          <div className="stat-card blue-card" style={styles.statCard}>
            <div className="stat-content" style={styles.statContent}>
              <div className="stat-icon-left" style={styles.statIconLeft}>
                <FiTrendingUp style={{ fontSize: '16px' }} />
              </div>
              <div className="stat-text" style={styles.statText}>
                <div className="stat-title" style={styles.statTitle}>Avg Efficiency</div>
                <div className="stat-value-with-arrow" style={styles.statValueWithArrow}>
                  <span style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}>
                    {allStats.avgEfficiency.toFixed(1)}%
                  </span>
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
          <div className="stat-card light-card" style={styles.lightStatCard}>
            <div className="stat-content" style={styles.statContent}>
              <div className="stat-icon-left" style={styles.lightStatIconLeft}>
                <FiClock style={{ fontSize: '16px' }} />
              </div>
              <div className="stat-text" style={styles.statText}>
                <div className="stat-title-light" style={styles.statTitleLight}>Last Day Records</div>
                <div className="stat-value-light" style={styles.statValueLight}>{lastEntryStats.lastEntryRecords}</div>
                <div className="date-badge-light" style={styles.dateBadgeLight}>
                  {lastEntryStats.lastEntryDate || 'No date'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Last Entry Production */}
          <div className="stat-card light-card" style={styles.lightStatCard}>
            <div className="stat-content" style={styles.statContent}>
              <div className="stat-icon-left" style={styles.lightStatIconLeft}>
                <FiActivity style={{ fontSize: '16px' }} />
              </div>
              <div className="stat-text" style={styles.statText}>
                <div className="stat-title-light" style={styles.statTitleLight}>Last Day Production</div>
                <div className="stat-value-light" style={styles.statValueLight}>
                  {formatInteger(lastEntryStats.lastEntryProduction)} M
                </div>
                <div className="date-badge-light" style={styles.dateBadgeLight}>
                  {lastEntryStats.lastEntryDate || 'No date'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Last Entry Weight */}
          <div className="stat-card light-card" style={styles.lightStatCard}>
            <div className="stat-content" style={styles.statContent}>
              <div className="stat-icon-left" style={styles.lightStatIconLeft}>
                <FiDroplet style={{ fontSize: '16px' }} />
              </div>
              <div className="stat-text" style={styles.statText}>
                <div className="stat-title-light" style={styles.statTitleLight}>Last Day Weight</div>
                <div className="stat-value-light" style={styles.statValueLight}>
                  {formatWeight(lastEntryStats.lastEntryWeight)} KG
                </div>
                <div className="date-badge-light" style={styles.dateBadgeLight}>
                  {lastEntryStats.lastEntryDate || 'No date'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Last Entry Efficiency */}
          <div className="stat-card light-card" style={styles.lightStatCard}>
            <div className="stat-content" style={styles.statContent}>
              <div className="stat-icon-left" style={styles.lightStatIconLeft}>
                <FiPercent style={{ fontSize: '16px' }} />
              </div>
              <div className="stat-text" style={styles.statText}>
                <div className="stat-title-light" style={styles.statTitleLight}>Last Day Efficiency</div>
                <div className="stat-value-light" style={{
                  ...styles.statValueLight,
                  color: getEfficiencyTextColor(lastEntryStats.lastEntryEfficiency)
                }}>
                  {lastEntryStats.lastEntryEfficiency.toFixed(1)}%
                </div>
                <div className="date-badge-light" style={styles.dateBadgeLight}>
                  {lastEntryStats.lastEntryDate || 'No date'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 2. دوسرا: لاسٹ انٹری ڈیش بورڈ */}
      <div style={styles.sectionContainer}>
        <div style={styles.sectionHeader}>
          <FiActivity style={{ ...styles.sectionIcon, fontSize: '20px' }} />
          <div>
            <h2 style={styles.sectionTitle}>Last Entry Dashboard</h2>
            <p style={styles.sectionSubtitle}>
              {lastEntryStats.lastEntryDate ? `Date: ${lastEntryStats.lastEntryDate}` : 'No entry date'}
            </p>
          </div>
        </div>

        <div className="dashboard-grid" style={styles.dashboardGrid}>
          {/* Shift-wise Card */}
          <div style={styles.dashboardCard}>
            <div style={styles.dashboardCardHeader}>
              <h3 style={styles.dashboardCardTitle}>
                <FiWatch className="dashboard-icon-spaced" /> Shift-wise
              </h3>
              <span style={styles.cardBadge}>
                {Object.keys(lastEntryStats.shiftWise).length}
              </span>
            </div>
            
            {Object.entries(lastEntryStats.shiftWise).length > 0 ? (
              Object.entries(lastEntryStats.shiftWise).map(([shift, data]) => (
                <div key={shift} style={styles.dashboardItem}>
                  <div style={styles.dashboardItemHeader}>
                    <div className="icon-label-container">
                      <FiWatch className="item-icon-spaced" />
                      <span style={styles.dashboardItemLabel}>{shift}</span>
                    </div>
                    <div style={{
                      fontSize: '11px', 
                      color: getEfficiencyTextColor(data.efficiency),
                      fontWeight: '600'
                    }}>
                      {data.efficiency.toFixed(1)}%
                    </div>
                  </div>
                  <div style={styles.dashboardItemDetails}>
                    <span>{formatInteger(data.production)}M / {formatInteger(data.target)}M</span>
                    <span>{formatWeight(data.weight)}KG</span>
                  </div>
                  <div style={styles.progressBar}>
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
              <div style={styles.emptyState}>
                <FiWatch style={styles.emptyIcon} />
                <p style={styles.emptyText}>No shift records</p>
              </div>
            )}
          </div>

          {/* Machine-wise Card */}
          <div style={styles.dashboardCard}>
            <div style={styles.dashboardCardHeader}>
              <h3 style={styles.dashboardCardTitle}>
                <FiCpu className="dashboard-icon-spaced" /> Machine-wise
              </h3>
              <span style={styles.cardBadge}>
                {Object.keys(lastEntryStats.machineWise).length}
              </span>
            </div>
            
            {Object.entries(lastEntryStats.machineWise).length > 0 ? (
              Object.entries(lastEntryStats.machineWise).map(([machine, data]) => (
                <div key={machine} style={styles.dashboardItem}>
                  <div style={styles.dashboardItemHeader}>
                    <div className="icon-label-container">
                      <FiCpu className="item-icon-spaced" />
                      <span style={styles.dashboardItemLabel}>{machine}</span>
                    </div>
                    <div style={{
                      fontSize: '11px', 
                      color: getEfficiencyTextColor(data.efficiency),
                      fontWeight: '600'
                    }}>
                      {data.efficiency.toFixed(1)}%
                    </div>
                  </div>
                  <div style={styles.dashboardItemDetails}>
                    <span>{formatInteger(data.production)}M / {formatInteger(data.target)}M</span>
                    <span>{formatWeight(data.weight)}KG</span>
                  </div>
                  <div style={styles.progressBar}>
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
              <div style={styles.emptyState}>
                <FiCpu style={styles.emptyIcon} />
                <p style={styles.emptyText}>No machine records</p>
              </div>
            )}
          </div>

          {/* Product-wise Card */}
          <div style={styles.dashboardCard}>
            <div style={styles.dashboardCardHeader}>
              <h3 style={styles.dashboardCardTitle}>
                <FiBox className="dashboard-icon-spaced" /> Product-wise
              </h3>
              <span style={styles.cardBadge}>
                {Object.keys(lastEntryStats.productWise).length}
              </span>
            </div>
            
            {Object.entries(lastEntryStats.productWise).length > 0 ? (
              Object.entries(lastEntryStats.productWise).map(([product, data]) => (
                <div key={product} style={styles.dashboardItem}>
                  <div style={styles.dashboardItemHeader}>
                    <div className="icon-label-container">
                      <FiBox className="item-icon-spaced" />
                      <span style={styles.dashboardItemLabel}>{product.substring(0, 15)}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {formatInteger(data.production)}M
                    </div>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{
                      width: `${Math.min(100, (data.production / (lastEntryStats.lastEntryProduction || 1)) * 100)}%`,
                      height: '100%',
                      background: `linear-gradient(to right, var(--primary-500), #8b5cf6)`,
                      borderRadius: '2px'
                    }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <FiBox style={styles.emptyIcon} />
                <p style={styles.emptyText}>No product records</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 3. تیسرا: فلٹرز */}
      <div style={styles.filtersSection}>
        <div style={styles.filtersContainer}>
          <div style={styles.filterHeading}>
            <FiFilter size={18} />
            <span style={{marginLeft: '8px'}}>FILTERS</span>
          </div>
          
          <div className="filters-single-line" style={styles.filtersSingleLine}>
            <div style={styles.filterGroup}>
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.filterInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.filterGroup}>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                style={styles.filterDate}
              />
            </div>

            <div style={styles.filterGroup}>
              <button
                onClick={generateReport}
                style={styles.filterBtnPrimary}
              >
                <FiBarChart2 /> Generate Report
              </button>
            </div>

            <div style={styles.filterGroup}>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterProduct("");
                  setFilterDate("");
                  setShowReport(false);
                  setCurrentPage(1);
                }}
                style={styles.filterBtnSecondary}
              >
                <FiX /> Clear Filters
              </button>
            </div>

            {/* ✅ WhatsApp اور Print بٹن صرف جب report generate ہو جائے */}
            {showReport && reportData.recordCount > 0 && (
              <>
                <div style={styles.filterGroup}>
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    style={styles.whatsappBtn}
                  >
                    <FaWhatsapp /> WhatsApp
                  </button>
                </div>

                <div style={styles.filterGroup}>
                  <button
                    onClick={handlePrintReport}
                    style={styles.printBtn}
                  >
                    <FiPrinter /> Print
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Show Report Actions if report is generated */}
      {showReport && reportData.recordCount > 0 && (
        <div style={styles.reportActions}>
          <button onClick={handleExportReport} style={styles.excelBtn}>
            <FiDownload /> Export Report Excel
          </button>
          <button onClick={handleExportExcel} style={styles.excelBtn}>
            <FiDownload /> Export Records Excel
          </button>
          <span style={{color: 'var(--text-secondary)', fontSize: '12px'}}>
            Report for: {reportData.formattedDate} | Records: {reportData.recordCount}
          </span>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && <WhatsAppModal />}

      {/* ✅ 4. چوتھا: ٹیبل */}
      <div style={styles.sectionContainer}>
        <div style={styles.tableHeader}>
          <h2 style={styles.sectionTitle}>Records</h2>
          <div style={styles.tableInfo}>
            <span>Total: {records.length}</span>
            <span>Filtered: {filteredRecords.length}</span>
            <span>Page: {currentPage}/{totalPages}</span>
          </div>
        </div>

        <div className="table-container" style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  'ID', 'Machine', 'Prod Date & Shift', 'Item Details', 
                  'User', 'Operator', 'Prod Qty', 
                  'Weight', 'Efficiency', 'Remarks', 'Entry Date', 'Actions'
                ].map((header, index) => (
                  <th key={index} style={styles.tableHeaderCell}>
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
                  <tr key={record.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.idBadge}>
                        #{record.id}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div className="icon-container">
                        <FiCpu className="table-icon-spaced icon-blue" />
                        <span>{record.machine_no || "N/A"}</span>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.dateShiftContainer}>
                        <div className="icon-container">
                          <FiCalendar className="table-icon-spaced icon-green" />
                          <span style={styles.boldDateText}>{record.production_date || "N/A"}</span>
                        </div>
                        <div className="icon-container">
                          <FiHash className="table-icon-spaced icon-purple" />
                          <span style={styles.lightShiftText}>{record.shift_name || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.itemDetails}>
                        <div style={styles.itemName}>
                          {record.item_name || "N/A"}
                        </div>
                        <div style={styles.itemProduct}>
                          {record.finishedproductname || "N/A"}
                        </div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div className="icon-container">
                        <FiUser className="table-icon-spaced icon-blue" />
                        <span>{record.users_name || "N/A"}</span>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div className="icon-container">
                        <FiUserCheck className="table-icon-spaced icon-yellow" />
                        <span>{record.operator_name || "N/A"}</span>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.productionContainer}>
                        <div className="icon-container">
                          <FiBarChart2 className="table-icon-spaced icon-green" />
                          <div style={styles.productionValue}>
                            {formatInteger(record.production_quantity)} {record.unit || "M"}
                          </div>
                        </div>
                        <div style={styles.targetBadge}>
                          Target: {formatInteger(record.target_qty)} M
                        </div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.weightContainer}>
                        <div className="icon-container">
                          <FiDroplet className="table-icon-spaced icon-blue" />
                          <div style={styles.weightValue}>
                            {formatWeight(record.weight)} KG
                          </div>
                        </div>
                        <div style={styles.perMeterBadge}>
                          {record.per_meter_wt || "N/A"} per meter
                        </div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.efficiencyContainer}>
                        <div className="icon-container">
                          <FiPercent className="table-icon-spaced" style={{color: efficiencyColor}} />
                          <div style={{
                            ...styles.efficiencyValue,
                            color: efficiencyColor
                          }}>
                            {efficiency.toFixed(1)}%
                          </div>
                        </div>
                        <div style={styles.efficiencyBar}>
                          <div style={{
                            width: `${Math.min(100, efficiency)}%`,
                            height: '100%',
                            backgroundColor: efficiencyColor,
                            borderRadius: '2px'
                          }}></div>
                        </div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div className="icon-container">
                        <FiMessageSquare className="table-icon-spaced icon-gray" />
                        <div style={styles.remarks}>
                          {record.remarks?.substring(0, 15) || "N/A"}
                          {record.remarks?.length > 15 ? "..." : ""}
                        </div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div className="icon-container">
                        <FiLogIn className="table-icon-spaced icon-purple" />
                        <div style={styles.entryDate}>
                          {record.entry_date || "N/A"}
                        </div>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button 
                          title="View"
                          onClick={() => navigate(`/production-sections/pvc-coating/view/${record.id}`)}
                          className="action-button view"
                          style={{
                            ...styles.viewButton,
                            border: `2px solid #10b981`,
                            backgroundColor: '#10b981',
                            color: 'white'
                          }}
                        >
                          <FiEye style={{fontSize: '20px'}} />
                        </button>
                        <button 
                          title="Edit"
                          onClick={() => navigate(`/production-sections/pvc-coating/edit/${record.id}`)}
                          className="action-button edit"
                          style={{
                            ...styles.editButton,
                            border: `2px solid #f59e0b`,
                            backgroundColor: '#f59e0b',
                            color: 'white'
                          }}
                        >
                          <FiEdit style={{fontSize: '20px'}} />
                        </button>
                        <button 
                          title="Delete"
                          onClick={() => {
                            if (window.confirm(`Delete record #${record.id}?`)) {
                              alert("Delete feature will be implemented");
                            }
                          }}
                          className="action-button delete"
                          style={{
                            ...styles.deleteButton,
                            border: `2px solid #ef4444`,
                            backgroundColor: '#ef4444',
                            color: 'white'
                          }}
                        >
                          <FiTrash2 style={{fontSize: '20px'}} />
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
          <div style={styles.pagination}>
            <div style={styles.paginationInfo}>
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div style={styles.paginationControls}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.paginationButton,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <FiChevronLeft style={{ fontSize: '16px' }} /> Previous
              </button>
              
              <div style={styles.pageButtons}>
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
                        ...styles.pageButton,
                        backgroundColor: currentPage === pageNum ? 'var(--primary-500)' : 'var(--bg-card)',
                        color: currentPage === pageNum ? 'var(--icon-white)' : 'var(--text-primary)'
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
                  ...styles.paginationButton,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next <FiChevronRight style={{ fontSize: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <div style={styles.footerText}>
          PVC Coating Section • Production Management System
        </div>
        <div style={styles.footerButtons}>
          <button 
            onClick={() => navigate("/production-sections/pvc-coating/new")}
            style={styles.footerButtonPrimary}
          >
            <FiPlus style={{ fontSize: '16px' }} /> New Entry
          </button>
          <button 
            onClick={fetchData}
            style={styles.footerButtonSecondary}
          >
            <FiRefreshCw style={{ fontSize: '16px' }} /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    overflowX: 'hidden'
  },
  
  loadingContainer: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  },
  
  dbAlert: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px'
  },
  
  // ✅ Header Styles
  header: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    gap: '12px'
  },
  
  backButton: {
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
  },
  
  headerIcon: {
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
  },
  
  headerContent: {
    flex: 1,
    minWidth: 0
  },
  
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px'
  },
  
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'white'
  },
  
  connectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '20px',
    fontSize: '12px',
    flexShrink: 0,
    color: 'white'
  },
  
  headerSubtitle: {
    fontSize: '13px',
    opacity: 0.9,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'white'
  },
  
  headerButtons: {
    display: 'flex',
    gap: '8px',
    padding: '8px 16px 12px',
    background: 'rgba(0, 0, 0, 0.05)'
  },
  
  headerButton: {
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
  },
  
  themeButton: {
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
  },
  
  refreshButton: {
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
  },
  
  // ✅ 1. پہلے کارڈز
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px'
  },
  
  statCard: {
    backgroundColor: '#3b82f6',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    flex: '1 0 calc(25% - 6px)',
    minHeight: '70px'
  },
  
  lightStatCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid var(--border-color)',
    flex: '1 0 calc(25% - 6px)',
    minHeight: '70px'
  },
  
  statContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px'
  },
  
  statIconLeft: {
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
  },
  
  lightStatIconLeft: {
    width: '34px',
    height: '34px',
    background: 'var(--bg-surface)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary-500)',
    fontSize: '16px',
    flexShrink: 0
  },
  
  statText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  
  statTitle: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: '2px'
  },
  
  statValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '4px'
  },
  
  statValueWithArrow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '4px'
  },
  
  statTitleLight: {
    fontSize: '10px',
    color: 'var(--text-primary)',
    fontWeight: '500',
    marginBottom: '2px'
  },
  
  statValueLight: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  
  dateBadgeLight: {
    fontSize: '8px',
    color: 'var(--text-muted)',
    background: 'var(--bg-surface)',
    padding: '2px 6px',
    borderRadius: '10px',
    display: 'inline-block',
    width: 'fit-content'
  },
  
  // ✅ 2. لاسٹ انٹری ڈیش بورڈ
  sectionContainer: {
    padding: '12px',
    marginTop: '8px'
  },
  
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px'
  },
  
  sectionIcon: {
    fontSize: '20px',
    color: 'var(--icon-color)'
  },
  
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600'
  },
  
  sectionSubtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  
  dashboardCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  
  dashboardCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  
  dashboardCardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-primary)'
  },
  
  cardBadge: {
    fontSize: '10px',
    backgroundColor: 'var(--primary-500)',
    color: 'var(--icon-white)',
    padding: '2px 6px',
    borderRadius: '10px'
  },
  
  dashboardItem: {
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-color)'
  },
  
  dashboardItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  
  dashboardItemLabel: {
    fontSize: '12px',
    color: 'var(--text-primary)'
  },
  
  dashboardItemDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: 'var(--text-secondary)',
    marginBottom: '6px'
  },
  
  progressBar: {
    height: '4px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 0'
  },
  
  emptyIcon: {
    fontSize: '24px',
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  },
  
  emptyText: {
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  
  // ✅ 3. فلٹرز
  filtersSection: {
    padding: '12px',
    marginTop: '8px'
  },
  
  filtersContainer: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  
  filterHeading: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '12px'
  },
  
  filtersSingleLine: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center'
  },
  
  filterGroup: {
    flex: '1 0 calc(14.285% - 8px)',
    minWidth: '120px'
  },
  
  filterInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none'
  },
  
  filterSelect: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none'
  },
  
  filterDate: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none'
  },
  
  filterBtnPrimary: {
    width: '100%',
    padding: '8px 10px',
    background: '#3b82f6',
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
  },
  
  filterBtnSecondary: {
    width: '100%',
    padding: '8px 10px',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  
  whatsappBtn: {
    width: '100%',
    padding: '8px 10px',
    background: '#25D366',
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
  },
  
  printBtn: {
    width: '100%',
    padding: '8px 10px',
    background: '#6b7280',
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
  },
  
  excelBtn: {
    padding: '8px 12px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginRight: '8px'
  },
  
  reportActions: {
    padding: '8px 12px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    margin: '0 12px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  // ✅ 4. ٹیبل
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  
  tableInfo: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: '8px'
  },
  
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)'
  },
  
  table: {
    width: '100%',
    minWidth: '1200px',
    borderCollapse: 'collapse'
  },
  
  tableHeaderCell: {
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '2px solid var(--border-color)',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase'
  },
  
  tableRow: {
    borderBottom: '1px solid var(--border-color)'
  },
  
  tableCell: {
    padding: '10px 8px',
    verticalAlign: 'middle'
  },
  
  boldDateText: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  
  lightShiftText: {
    fontSize: '11px',
    fontWeight: '400',
    color: 'var(--text-secondary)'
  },
  
  idBadge: {
    backgroundColor: 'var(--primary-500)',
    color: 'var(--icon-white)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block',
    textAlign: 'center'
  },
  
  dateShiftContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  
  itemName: {
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '12px'
  },
  
  itemProduct: {
    color: 'var(--text-secondary)',
    fontSize: '11px'
  },
  
  productionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  
  productionValue: {
    fontWeight: '700',
    color: 'var(--primary-500)',
    fontSize: '13px',
    marginLeft: '4px'
  },
  
  targetBadge: {
    fontSize: '10px',
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: '2px 6px',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px'
  },
  
  weightContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },
  
  weightValue: {
    fontWeight: '600',
    color: 'var(--text-primary)',
    fontSize: '12px',
    marginLeft: '4px'
  },
  
  perMeterBadge: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-surface)',
    padding: '1px 4px',
    borderRadius: '3px',
    display: 'inline-block'
  },
  
  efficiencyContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-start'
  },
  
  efficiencyValue: {
    fontWeight: '700',
    fontSize: '12px',
    textAlign: 'center',
    marginLeft: '4px'
  },
  
  efficiencyBar: {
    width: '60px',
    height: '4px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  
  remarks: {
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '11px',
    color: 'var(--text-muted)',
    padding: '2px 4px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '3px',
    marginLeft: '4px'
  },
  
  entryDate: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    padding: '2px 4px',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '3px',
    marginLeft: '4px'
  },
  
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  },
  
  viewButton: {
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
  },
  
  editButton: {
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
  },
  
  deleteButton: {
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
  },
  
  // Pagination Styles
  pagination: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 0',
    alignItems: 'center',
    marginTop: '16px'
  },
  
  paginationInfo: {
    textAlign: 'center',
    fontSize: '12px',
    color: 'var(--text-secondary)'
  },
  
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  
  paginationButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  
  pageButtons: {
    display: 'flex',
    gap: '4px'
  },
  
  pageButton: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  
  // Footer Styles
  footer: {
    padding: '16px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-color)',
    marginTop: '20px'
  },
  
  footerText: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '8px'
  },
  
  footerButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center'
  },
  
  footerButtonPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: 'var(--primary-500)',
    color: 'var(--icon-white)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  
  footerButtonSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

export default PVCcoatingPage;