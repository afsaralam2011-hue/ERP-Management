// src/pages/ProductionSections/SpiralSection/SpiralPage.jsx
// ============================================================
// Spiral Section - 100% LAYOUT COMPATIBLE VERSION
// Complete file - Just copy and paste
// ============================================================

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
  FiCheckCircle,
  FiXCircle,
  FiGrid,
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
  FiCheckSquare,
  FiSettings,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { supabase } from "../../../supabaseClient";
import "./SpiralPage.css";

const SpiralPage = () => {
  const navigate = useNavigate();
  const { mode, isDarkMode } = useTheme();
  
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

  // CSS Variables کے ذریعے colors لینے کا function
  const getColor = (varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#000000';
  };

  // Theme-based colors
  const themeColors = {
    background: getColor('--color-background'),
    textPrimary: getColor('--color-text-primary'),
    textSecondary: getColor('--color-text-secondary'),
    surface: getColor('--color-surface'),
    border: getColor('--color-border'),
    primary: getColor('--color-primary'),
    primaryLight: getColor('--color-primary-light'),
    primaryDark: getColor('--color-primary-dark'),
    secondary: getColor('--color-secondary'),
    success: getColor('--color-success'),
    warning: getColor('--color-warning'),
    error: getColor('--color-error'),
    info: getColor('--color-info'),
    shadow: getColor('--color-shadow'),
    hover: getColor('--color-hover'),
    divider: getColor('--color-divider'),
    paper: getColor('--color-paper'),
    disabled: getColor('--color-disabled'),
  };

  // Header background gradient colors (theme-based)
  const headerGradient = isDarkMode 
    ? 'linear-gradient(135deg, #1A237E 0%, #283593 100%)' // Indigo gradient for dark mode
    : 'linear-gradient(135deg, #1A237E 0%, #283593 100%)'; // Indigo gradient for light mode

  useEffect(() => {
    const getUserName = () => {
      const storedUser = localStorage.getItem('spiralSectionUser');
      if (storedUser) {
        setLoggedInUser(storedUser);
        return storedUser;
      }
      
      const session = localStorage.getItem('supabase.auth.token');
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          if (parsedSession.currentSession?.user?.email) {
            const userEmail = parsedSession.currentSession.user.email;
            const userName = userEmail.split('@')[0];
            setLoggedInUser(userName);
            localStorage.setItem('spiralSectionUser', userName);
            return userName;
          }
        } catch (error) {
          console.error("Error parsing session:", error);
        }
      }
      
      const defaultUser = 'Admin';
      setLoggedInUser(defaultUser);
      localStorage.setItem('spiralSectionUser', defaultUser);
      return defaultUser;
    };
    
    getUserName();
  }, []);

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

  const calculateStats = (recordsData) => {
    if (!recordsData || recordsData.length === 0) {
      setStats({
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

    const itemWiseToday = {};
    const machineWiseToday = {};
    const finishedProductWiseToday = {};

    todayRecords.forEach((record) => {
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

    const matchesType = !filterType || record.wire_size === filterType;

    const recordDate = new Date(record.created_at).toISOString().split("T")[0];
    const matchesDate = !filterDate || recordDate === filterDate;

    return matchesSearch && matchesType && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const extractMachineNumber = (machineNo) => {
    if (!machineNo) return 0;

    const match = machineNo.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

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
        const machine = extractMachineNumber(record.machine_no);
        const shift = record.shift_name || "Unknown";
        const operator = record.operator_name || "Unknown";
        const production = parseFloat(record.production_quantity) || 0;
        const weight = parseFloat(record.weight) || 0;
        const efficiency = parseFloat(record.efficiency) || 0;

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
          machineWise[machineKey].operator = operator;
        }
        machineWise[machineKey].production += production;
        machineWise[machineKey].weight += weight;
        machineWise[machineKey].efficiency += efficiency;
        machineWise[machineKey].count += 1;

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

        const isDayShift =
          shift.toLowerCase().includes("day") ||
          shift.toLowerCase().includes("morning") ||
          shift === "Day Shift" ||
          shift === "Morning Shift";

        const isNightShift =
          shift.toLowerCase().includes("night") ||
          shift.toLowerCase().includes("evening") ||
          shift === "Night Shift" ||
          shift === "Evening Shift";

        if (isDayShift) {
          dayShiftCount++;
          dayShiftData.production += production;
          dayShiftData.weight += weight;
          dayShiftData.efficiency += efficiency;
          dayShiftData.count++;

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

      const dayShiftAvgEfficiency =
        dayShiftData.count > 0
          ? dayShiftData.efficiency / dayShiftData.count
          : 0;
      const nightShiftAvgEfficiency =
        nightShiftData.count > 0
          ? nightShiftData.efficiency / nightShiftData.count
          : 0;

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

  useEffect(() => {
    if (filterDate) {
      generateReport(filterDate);
    }
  }, [filterDate, generateReport]);

  const prepareWhatsAppReport = (type = "report") => {
    if (!reportData || reportData.recordCount === 0) {
      return "No report data available.";
    }

    if (type === "custom") {
      return whatsAppMessage;
    }

    let message = `📊 *Spiral Section Production Report*\n`;
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

    if (reportData.dayShiftCount > 0) {
      message += `☀️ *Day Shift:*\n`;
      message += `• Production: ${Math.round(
        reportData.dayShiftData.production
      )} M\n`;
      message += `• Weight: ${Math.round(reportData.dayShiftData.weight)} KG\n`;
      message += `• Avg Efficiency: ${Math.round(
        reportData.dayShiftData.avgEfficiency
      )}%\n`;
      message += `• Records: ${reportData.dayShiftCount}\n\n`;
    }

    if (reportData.nightShiftCount > 0) {
      message += `🌙 *Night Shift:*\n`;
      message += `• Production: ${Math.round(
        reportData.nightShiftData.production
      )} M\n`;
      message += `• Weight: ${Math.round(
        reportData.nightShiftData.weight
      )} KG\n`;
      message += `• Avg Efficiency: ${Math.round(
        reportData.nightShiftData.avgEfficiency
      )}%\n`;
      message += `• Records: ${reportData.nightShiftCount}\n\n`;
    }

    if (Object.keys(reportData.itemWise).length > 0) {
      message += `📋 *Item-wise Summary:*\n`;
      Object.entries(reportData.itemWise).forEach(([item, data], index) => {
        message += `${index + 1}. ${item}: ${Math.round(
          data.production
        )} M, ${Math.round(data.weight)} KG\n`;
      });
      message += `\n`;
    }

    message += `🏭 *Machine-wise Summary - Day Shift:*\n`;

    const allDayMachines = Array.from({ length: 14 }, (_, i) => {
      const machineKey = `SP # ${i + 1}`;
      return (
        reportData.dayShiftData.machines[machineKey] || {
          production: 0,
          efficiency: 0,
          operator: "Operator Absent",
          machineNumber: i + 1,
          count: 0,
        }
      );
    });

    allDayMachines.forEach((data, index) => {
      const machineNum = index + 1;
      const efficiency =
        data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
      const operator = data.operator || "Operator Absent";
      message += `${machineNum}. SP # ${machineNum}: ${Math.round(
        data.production
      )} M, ${efficiency}% | ${operator}\n`;
    });
    message += `\n`;

    message += `🏭 *Machine-wise Summary - Night Shift:*\n`;

    const allNightMachines = Array.from({ length: 14 }, (_, i) => {
      const machineKey = `SP # ${i + 1}`;
      return (
        reportData.nightShiftData.machines[machineKey] || {
          production: 0,
          efficiency: 0,
          operator: "Operator Absent",
          machineNumber: i + 1,
          count: 0,
        }
      );
    });

    allNightMachines.forEach((data, index) => {
      const machineNum = index + 1;
      const efficiency =
        data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
      const operator = data.operator || "Operator Absent";
      message += `${machineNum}. SP # ${machineNum}: ${Math.round(
        data.production
      )} M, ${efficiency}% | ${operator}\n`;
    });
    message += `\n`;

    message += `📝 *Report Summary:*\n`;
    message += `• Target Production: ${Math.round(
      reportData.totalProduction * 1.2
    )} M\n`;
    message += `• Target Efficiency: 85%\n\n`;

    message += `✅ Generated via Spiral Section Management System`;

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

  const WhatsAppModal = () => (
    <div 
      className="modal-overlay" 
      onClick={() => setShowWhatsAppModal(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: themeColors.paper || themeColors.background,
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: `0 10px 40px ${themeColors.shadow}`
        }}
      >
        <div 
          className="modal-header"
          style={{
            padding: '20px',
            borderBottom: `1px solid ${themeColors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: headerGradient,
            color: 'white',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}
        >
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaWhatsapp className="whatsapp-icon" /> Send Report via WhatsApp
          </h2>
          <button
            onClick={() => setShowWhatsAppModal(false)}
            className="modal-close-btn"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &times;
          </button>
        </div>

        <div 
          className="modal-body"
          style={{
            padding: '20px',
            color: themeColors.textPrimary
          }}
        >
          <div 
            className="whatsapp-modal-content"
            style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}
          >
            <FaWhatsapp size={48} color="#25D366" />
            <h3 style={{ margin: '10px 0 5px 0' }}>Send to WhatsApp Desktop</h3>
            <p style={{ margin: 0, fontSize: '14px', color: themeColors.textSecondary }}>
              Select one of the options below. Report will automatically open in WhatsApp Desktop.
            </p>
          </div>

          <div 
            className="whatsapp-options"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div 
              className="options-row"
              style={{
                display: 'flex',
                gap: '10px'
              }}
            >
              <button
                onClick={sendReportViaWhatsApp}
                className="whatsapp-option-btn whatsapp-desktop-btn"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <FaWhatsapp /> WhatsApp Desktop
              </button>

              <button
                onClick={() => {
                  const reportMessage = prepareWhatsAppReport("report");
                  navigator.clipboard.writeText(reportMessage).then(() => {
                    alert("Report copied to clipboard. Please paste in WhatsApp.");
                    setShowWhatsAppModal(false);
                  });
                }}
                className="whatsapp-option-btn copy-message-btn"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: themeColors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <FiDownload /> Copy Message
              </button>

              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="whatsapp-option-btn close-btn"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: themeColors.error,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <FiX /> Close
              </button>
            </div>
          </div>

          <div 
            className="preview-section"
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${themeColors.border}`
            }}
          >
            <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiEye /> Message Preview
            </h4>
            <div 
              className="message-preview"
              style={{
                background: themeColors.surface,
                padding: '15px',
                borderRadius: '6px',
                fontSize: '12px',
                maxHeight: '200px',
                overflow: 'auto',
                color: themeColors.textPrimary,
                border: `1px solid ${themeColors.border}`
              }}
            >
              {prepareWhatsAppReport("report")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
    }-${loggedInUser}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #1A237E;
            background: white;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding: 20px;
            background: #1A237E;
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
            border: 1px solid #283593; 
            padding: 12px; 
            text-align: left; 
          }
          .table th { 
            background-color: #1A237E; 
            color: #FFFFFF;
          }
          .summary { 
            background-color: #F4F4F4; 
            padding: 20px; 
            margin: 20px 0; 
            border: 1px solid #283593;
          }
          .shift-section { 
            margin: 20px 0; 
            padding: 15px; 
            border-left: 4px solid #1A237E;
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
            color: #1A237E;
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
          <div class="date">Report Generated by: ${loggedInUser}</div>
        </div>
        
        <div class="shift-section">
          <div class="shift-header">
            <h3 style="margin: 0; color: #1A237E;">☀️ Day Shift Summary</h3>
          </div>
          <p><strong>Production:</strong> ${Math.round(
            reportData.dayShiftData.production
          )} Meter</p>
          <p><strong>Weight:</strong> ${Math.round(
            reportData.dayShiftData.weight
          )} KG</p>
          <p><strong>Average Efficiency:</strong> ${Math.round(
            reportData.dayShiftData.avgEfficiency
          )}%</p>
          <p><strong>Records:</strong> ${reportData.dayShiftCount}</p>
        </div>
        
        <div class="shift-section">
          <div class="shift-header">
            <h3 style="margin: 0; color: #1A237E;">🌙 Night Shift Summary</h3>
          </div>
          <p><strong>Production:</strong> ${Math.round(
            reportData.nightShiftData.production
          )} Meter</p>
          <p><strong>Weight:</strong> ${Math.round(
            reportData.nightShiftData.weight
          )} KG</p>
          <p><strong>Average Efficiency:</strong> ${Math.round(
            reportData.nightShiftData.avgEfficiency
          )}%</p>
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
                count: 0,
              };
              const efficiency =
                data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
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
            }).join("")}
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
                count: 0,
              };
              const efficiency =
                data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
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
            }).join("")}
          </tbody>
        </table>
        
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
          <p><strong>Day Shift Records:</strong> ${reportData.dayShiftCount}</p>
          <p><strong>Night Shift Records:</strong> ${
            reportData.nightShiftCount
          }</p>
        </div>
        
        <div class="footer">
          Generated on ${new Date().toLocaleString()} by ${loggedInUser}<br/>
          Spiral Section - Production Management System
        </div>
        
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #1A237E; color: #FFFFFF; border: none; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #283593; color: #FFFFFF; border: none; cursor: pointer; margin-left: 10px;">
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

  const handleExportReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert("No report data to export");
      return;
    }

    const csvContent = [
      ["Spiral Section Production Report", reportData.formattedDate],
      ["Generated by: " + loggedInUser],
      [],
      ["SHIFT-WISE SUMMARY"],
      [],
      ["Day Shift Summary"],
      ["Production (Meter):", Math.round(reportData.dayShiftData.production)],
      ["Weight (KG):", Math.round(reportData.dayShiftData.weight)],
      [
        "Average Efficiency:",
        Math.round(reportData.dayShiftData.avgEfficiency) + "%",
      ],
      ["Records:", reportData.dayShiftCount],
      [],
      ["Night Shift Summary"],
      ["Production (Meter):", Math.round(reportData.nightShiftData.production)],
      ["Weight (KG):", Math.round(reportData.nightShiftData.weight)],
      [
        "Average Efficiency:",
        Math.round(reportData.nightShiftData.avgEfficiency) + "%",
      ],
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
          count: 0,
        };
        const efficiency =
          data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
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
          count: 0,
        };
        const efficiency =
          data.count > 0 ? Math.round(data.efficiency / data.count) : 0;
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
      ["Generated by: " + loggedInUser],
      ["Generated on:", new Date().toLocaleString()],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spiral-section-report-${filterDate}-${loggedInUser}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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

  const statCards = [
    {
      id: "total-records",
      title: "Total Records",
      value: stats.totalRecords,
      icon: FiDatabase,
      description: "All production records",
    },
    {
      id: "total-production",
      title: "Total Production",
      value: `${Math.round(stats.totalProduction)} M`,
      icon: FiColumns,
      description: "Total production in meters",
    },
    {
      id: "total-weight",
      title: "Total Weight",
      value: `${Math.round(stats.totalWeight)} KG`,
      icon: FiFeather,
      description: "Total weight in kilograms",
    },
    {
      id: "avg-efficiency",
      title: "Avg Efficiency",
      value: `${Math.round(stats.avgEfficiency)}%`,
      icon: FiTrendingUp,
      description: "Average efficiency percentage",
    },
    {
      id: "today-records",
      title: "Today's Records",
      value: stats.todayRecords,
      icon: FiCalendar,
      description: "Records added today",
    },
    {
      id: "today-production",
      title: "Today's Production",
      value: `${Math.round(stats.todayProduction)} M`,
      icon: FiPackage,
      description: "Today's production",
    },
    {
      id: "today-weight",
      title: "Today's Weight",
      value: `${Math.round(stats.todayWeight)} KG`,
      icon: FiFeather,
      description: "Today's weight",
    },
    {
      id: "today-avg-efficiency",
      title: "Today's Avg Efficiency",
      value: `${Math.round(stats.todayAvgEfficiency)}%`,
      icon: FiActivity,
      description: "Today's average efficiency",
    },
  ];

  if (loading && records.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: themeColors.background,
        color: themeColors.textPrimary,
        padding: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${themeColors.border}`,
          borderTop: `3px solid ${themeColors.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h3>Loading Spiral Section Data...</h3>
        <p style={{ color: themeColors.textSecondary }}>Fetching records from database</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Layout Compatible Page Structure */}
      <div className="spiral-page-container" style={{
        width: '100%',
        height: '100%',
        background: themeColors.background,
        color: themeColors.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Mobile Menu Button (Only for mobile) */}
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 1001,
            background: headerGradient,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px',
            cursor: 'pointer',
            display: window.innerWidth < 768 ? 'block' : 'none'
          }}
        >
          <FiMenu size={24} />
        </button>

        {/* Database Connection Alert */}
        {!isSupabaseConnected && (
          <div style={{
            background: themeColors.errorLight || '#f8d7da',
            color: themeColors.errorDark || '#721c24',
            padding: '12px',
            margin: '0 0 10px 0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: `1px solid ${themeColors.error}`
          }}>
            <FiAlertCircle size={20} />
            <div>
              <strong>Supabase Connection Issue</strong>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>
                Check your .env file for REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div 
            className="mobile-menu-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 2000
            }}
            onClick={() => setShowMobileMenu(false)}
          >
            <div 
              className="mobile-menu"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '250px',
                background: themeColors.paper || themeColors.background,
                color: themeColors.textPrimary,
                boxShadow: `0 0 20px ${themeColors.shadow}`,
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="mobile-menu-header"
                style={{
                  padding: '15px',
                  borderBottom: `1px solid ${themeColors.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: headerGradient,
                  color: 'white'
                }}
              >
                <h3 style={{ margin: 0 }}>Spiral Section</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="mobile-menu-close"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  &times;
                </button>
              </div>
              <div 
                className="mobile-menu-content"
                style={{ padding: '10px' }}
              >
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    background: themeColors.surface,
                    color: themeColors.textPrimary,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                >
                  <FiHome size={18} /> Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate("/production");
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    background: themeColors.surface,
                    color: themeColors.textPrimary,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                >
                  <FiArrowLeft size={18} /> Back to Production
                </button>
                <button
                  onClick={() => {
                    navigate("/production-sections/spiral/new");
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    background: headerGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                >
                  <FiPlus size={18} /> New Entry
                </button>
                <button
                  onClick={() => {
                    setShowDashboard(!showDashboard);
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    background: themeColors.surface,
                    color: themeColors.textPrimary,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                >
                  {showDashboard ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiBarChart2 size={18} />
                  )}
                  {showDashboard ? " Hide Dashboard" : " Dashboard"}
                </button>
                <button
                  onClick={() => {
                    setShowStatsCards(!showStatsCards);
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    background: themeColors.surface,
                    color: themeColors.textPrimary,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                >
                  {showStatsCards ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiLayers size={18} />
                  )}
                  {showStatsCards ? " Hide Stats" : " Stats"}
                </button>
                <button
                  onClick={() => {
                    handleExport();
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    background: themeColors.surface,
                    color: themeColors.textPrimary,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                >
                  <FiDownload size={18} /> Export CSV
                </button>
                <button
                  onClick={() => {
                    fetchData();
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginBottom: '5px',
                    background: themeColors.surface,
                    color: themeColors.textPrimary,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'left'
                  }}
                >
                  <FiRefreshCw size={18} /> Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="spiral-content" style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Buttons Row */}
          <div className="buttons-row" style={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            background: themeColors.surface,
            borderBottom: `1px solid ${themeColors.border}`,
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate("/production-sections/spiral/new")}
              className="page-btn primary-btn"
              title="New Entry"
              style={{
                padding: '8px 12px',
                background: themeColors.success || '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <FiPlus size={16} />
              <span>New Entry</span>
            </button>
            <button
              onClick={() => navigate("/production-sections/spiral/smart")}
              className="page-btn smart-entry-btn"
              title="Smart Entry"
              style={{
                padding: '8px 12px',
                background: themeColors.info || '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <FiSmartphone size={16} />
              <span>Smart Entry</span>
            </button>
            <button
              onClick={() => navigate("/production-sections/spiral/settings")}
              className="page-btn settings-btn"
              title="Settings"
              style={{
                padding: '8px 12px',
                background: themeColors.warning || '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <FiSettings size={16} />
              <span>Settings</span>
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="page-btn refresh-btn"
              title="Refresh Data"
              style={{
                padding: '8px 12px',
                background: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? (
                <div 
                  className="mini-spinner"
                  style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid rgba(255, 255, 255, 0.3)`,
                    borderTop: `2px solid white`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              ) : (
                <FiRefreshCw size={16} />
              )}
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              disabled={records.length === 0}
              className="page-btn export-btn"
              title="Export Data"
              style={{
                padding: '8px 12px',
                background: themeColors.secondary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                opacity: records.length === 0 ? 0.6 : 1
              }}
            >
              <FiDownload size={16} />
              <span>Export</span>
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="page-btn nav-btn"
              title="Dashboard"
              style={{
                padding: '8px 12px',
                background: themeColors.info || '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <FiHome size={16} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/production")}
              className="page-btn nav-btn"
              title="Production Sections"
              style={{
                padding: '8px 12px',
                background: '#283593',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <FiArrowLeft size={16} />
              <span>Production</span>
            </button>
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="page-btn dashboard-btn"
              title="Toggle Dashboard"
              style={{
                padding: '8px 12px',
                background: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              {showDashboard ? (
                <FiEyeOff size={16} />
              ) : (
                <FiBarChart2 size={16} />
              )}
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setShowStatsCards(!showStatsCards)}
              className="page-btn stats-btn"
              title="Toggle Stats"
              style={{
                padding: '8px 12px',
                background: themeColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              {showStatsCards ? (
                <FiEyeOff size={16} />
              ) : (
                <FiLayers size={16} />
              )}
              <span>Stats</span>
            </button>
            <button
              onClick={() => navigate("/production-sections/spiral/batch")}
              className="page-btn batch-btn"
              title="Batch Entry"
              style={{
                padding: '8px 12px',
                background: themeColors.success || '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <FiCheckSquare size={16} />
              <span>Batch</span>
            </button>
          </div>

          {/* Stats Cards Section */}
          {showStatsCards && (
            <div 
              className="stats-section"
              style={{
                background: themeColors.background,
                color: themeColors.textPrimary,
                padding: '15px',
                borderBottom: `1px solid ${themeColors.border}`
              }}
            >
              <div 
                className="section-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}
              >
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiActivity size={20} />
                  Production Statistics
                </h3>
                <div 
                  className="stats-summary"
                  style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '12px',
                    color: themeColors.textSecondary
                  }}
                >
                  <span className="summary-item">
                    Total: {stats.totalRecords} records
                  </span>
                  <span className="summary-item">Managed by: {loggedInUser}</span>
                </div>
              </div>
              <div 
                className="stats-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px'
                }}
              >
                {statCards.map((card) => (
                  <div 
                    key={card.id} 
                    className="stat-card"
                    style={{
                      background: themeColors.surface,
                      padding: '15px',
                      borderRadius: '6px',
                      border: `1px solid ${themeColors.border}`
                    }}
                  >
                    <div 
                      className="stat-header"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px'
                      }}
                    >
                      <card.icon size={20} className="stat-icon" style={{ color: themeColors.primary }} />
                      <div className="stat-title" style={{ fontSize: '14px', fontWeight: '500' }}>{card.title}</div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>{card.value}</div>
                    <div className="stat-footer" style={{ fontSize: '12px', color: themeColors.textSecondary }}>{card.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard Section */}
          {showDashboard && (
            <div 
              className="dashboard-section"
              style={{
                background: themeColors.background,
                color: themeColors.textPrimary,
                padding: '15px',
                borderBottom: `1px solid ${themeColors.border}`
              }}
            >
              <div 
                className="section-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}
              >
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCpu size={20} />
                  Today's Production Dashboard
                </h3>
                <div 
                  className="section-info"
                  style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '12px',
                    color: themeColors.textPrimary 
                  }}
                >
                  <span className="info-item">Managed by: {loggedInUser}</span>
                  <span className="info-item">Records: {stats.todayRecords}</span>
                </div>
              </div>

              <div 
                className="dashboard-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '15px'
                }}
              >
                <div 
                  className="dashboard-card"
                  style={{
                    background: themeColors.surface,
                    padding: '15px',
                    borderRadius: '6px',
                    border: `1px solid ${themeColors.border}`
                  }}
                >
                  <div 
                    className="card-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '15px'
                    }}
                  >
                    <FiPackage size={20} style={{ color: themeColors.primary }} />
                    <h4 style={{ margin: 0 }}>Item-wise Production</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.itemWiseToday).length > 0 ? (
                      <div className="items-list">
                        {Object.entries(stats.itemWiseToday).map(
                          ([item, data]) => (
                            <div 
                              key={item} 
                              className="item-row"
                              style={{
                                padding: '10px',
                                marginBottom: '8px',
                                background: themeColors.background,
                                borderRadius: '4px',
                                border: `1px solid ${themeColors.border}`
                              }}
                            >
                              <div className="item-name" style={{ fontWeight: '500', marginBottom: '5px' }}>{item}</div>
                              <div 
                                className="item-stats"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px'
                                }}
                              >
                                <span className="stat-value" style={{ color: themeColors.primary }}>
                                  {Math.round(data.production)} M
                                </span>
                                <span className="stat-value" style={{ color: themeColors.success }}>
                                  {Math.round(data.weight)} KG
                                </span>
                                <span className="stat-value" style={{ color: themeColors.warning }}>
                                  {Math.round(
                                    data.count > 0
                                      ? data.efficiency / data.count
                                      : 0
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div 
                        className="empty-state"
                        style={{
                          textAlign: 'center',
                          padding: '30px',
                          color: themeColors.textSecondary
                        }}
                      >
                        <FiPackage size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No item production today</p>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className="dashboard-card"
                  style={{
                    background: themeColors.surface,
                    padding: '15px',
                    borderRadius: '6px',
                    border: `1px solid ${themeColors.border}`
                  }}
                >
                  <div 
                    className="card-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '15px'
                    }}
                  >
                    <FiTool size={20} style={{ color: themeColors.primary }} />
                    <h4 style={{ margin: 0 }}>Machine-wise Production</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.machineWiseToday).length > 0 ? (
                      <div className="machines-list">
                        {Object.entries(stats.machineWiseToday).map(
                          ([machine, data]) => (
                            <div 
                              key={machine} 
                              className="machine-row"
                              style={{
                                padding: '10px',
                                marginBottom: '8px',
                                background: themeColors.background,
                                borderRadius: '4px',
                                border: `1px solid ${themeColors.border}`
                              }}
                            >
                              <div className="machine-name" style={{ fontWeight: '500', marginBottom: '5px' }}>
                                Machine {machine}
                              </div>
                              <div 
                                className="machine-stats"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px'
                                }}
                              >
                                <span className="stat-value" style={{ color: themeColors.primary }}>
                                  {Math.round(data.production)} M
                                </span>
                                <span className="stat-value" style={{ color: themeColors.success }}>
                                  {Math.round(data.weight)} KG
                                </span>
                                <span className="stat-value" style={{ color: themeColors.warning }}>
                                  {Math.round(
                                    data.count > 0
                                      ? data.efficiency / data.count
                                      : 0
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div 
                        className="empty-state"
                        style={{
                          textAlign: 'center',
                          padding: '30px',
                          color: themeColors.textSecondary
                        }}
                      >
                        <FiTool size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No machine production today</p>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className="dashboard-card"
                  style={{
                    background: themeColors.surface,
                    padding: '15px',
                    borderRadius: '6px',
                    border: `1px solid ${themeColors.border}`
                  }}
                >
                  <div 
                    className="card-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '15px'
                    }}
                  >
                    <FiBox size={20} style={{ color: themeColors.primary }} />
                    <h4 style={{ margin: 0 }}>Finished Products</h4>
                  </div>
                  <div className="card-content">
                    {Object.entries(stats.finishedProductWiseToday).length > 0 ? (
                      <div className="products-list">
                        {Object.entries(stats.finishedProductWiseToday).map(
                          ([product, data]) => (
                            <div 
                              key={product} 
                              className="product-row"
                              style={{
                                padding: '10px',
                                marginBottom: '8px',
                                background: themeColors.background,
                                borderRadius: '4px',
                                border: `1px solid ${themeColors.border}`
                              }}
                            >
                              <div className="product-name" style={{ fontWeight: '500', marginBottom: '5px' }}>{product}</div>
                              <div 
                                className="product-stats"
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '12px'
                                }}
                              >
                                <span className="stat-value" style={{ color: themeColors.primary }}>
                                  {Math.round(data.production)} M
                                </span>
                                <span className="stat-value" style={{ color: themeColors.success }}>
                                  {Math.round(data.weight)} KG
                                </span>
                                <span className="stat-value" style={{ color: themeColors.warning }}>
                                  {Math.round(
                                    data.count > 0
                                      ? data.efficiency / data.count
                                      : 0
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div 
                        className="empty-state"
                        style={{
                          textAlign: 'center',
                          padding: '30px',
                          color: themeColors.textSecondary
                        }}
                      >
                        <FiBox size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No finished product today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div 
            className="filters-section"
            style={{
              background: themeColors.background,
              padding: '15px',
              borderBottom: `1px solid ${themeColors.border}`
            }}
          >
            <div 
              className="filters-container"
              style={{
                background: themeColors.surface,
                padding: '12px',
                borderRadius: '6px'
              }}
            >
              <div 
                className="filter-heading"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  color: themeColors.primary,
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                <FiFilter size={18} />
                <span>FILTERS</span>
              </div>
              
              <div 
                className="filters-single-line"
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <div className="filter-group" style={{ flex: 1, minWidth: '150px' }}>
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${themeColors.border}`,
                      borderRadius: '4px',
                      background: themeColors.background,
                      color: themeColors.textPrimary,
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="filter-group" style={{ flex: 1, minWidth: '150px' }}>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${themeColors.border}`,
                      borderRadius: '4px',
                      background: themeColors.background,
                      color: themeColors.textPrimary,
                      fontSize: '14px'
                    }}
                  >
                    <option value="">All Wire Sizes</option>
                    {wireSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-group" style={{ flex: 1, minWidth: '150px' }}>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="filter-date"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: `1px solid ${themeColors.border}`,
                      borderRadius: '4px',
                      background: themeColors.background,
                      color: themeColors.textPrimary,
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="filter-group" style={{ flex: '0 0 auto' }}>
                  <button
                    onClick={() =>
                      filterDate
                        ? setShowReport(true)
                        : alert("Please select a date first")
                    }
                    className="filter-btn primary-btn"
                    style={{
                      padding: '10px 15px',
                      background: themeColors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiBarChart2 /> Generate Report
                  </button>
                </div>

                <div className="filter-group" style={{ flex: '0 0 auto' }}>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("");
                      setFilterDate("");
                      setShowReport(false);
                      setCurrentPage(1);
                    }}
                    className="filter-btn secondary-btn"
                    style={{
                      padding: '10px 15px',
                      background: themeColors.secondary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiX /> Clear Filters
                  </button>
                </div>

                <div className="filter-group" style={{ flex: '0 0 auto' }}>
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    className="filter-btn whatsapp-btn"
                    style={{
                      padding: '10px 15px',
                      background: '#25D366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaWhatsapp /> WhatsApp
                  </button>
                </div>

                <div className="filter-group" style={{ flex: '0 0 auto' }}>
                  <button
                    onClick={handlePrintReport}
                    className="filter-btn print-btn"
                    style={{
                      padding: '10px 15px',
                      background: '#495057',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <FiPrinter /> Print
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Report Section */}
          {showReport && reportData && (
            <div 
              className="report-section"
              style={{
                background: themeColors.background,
                color: themeColors.textPrimary,
                padding: '15px',
                borderBottom: `1px solid ${themeColors.border}`
              }}
            >
              <div 
                className="report-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '15px',
                  borderBottom: `1px solid ${themeColors.border}`
                }}
              >
                <div 
                  className="report-title"
                  style={{ flex: 1 }}
                >
                  <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiBarChart2 size={24} />
                    Spiral Section Production Report
                  </h2>
                  <div 
                    className="report-info"
                    style={{
                      marginTop: '5px',
                      fontSize: '14px',
                      color: themeColors.textSecondary
                    }}
                  >
                    <div className="report-date">{reportData.formattedDate}</div>
                    <div className="report-author">
                      Generated by: <strong>{loggedInUser}</strong>
                    </div>
                  </div>
                </div>

                <div 
                  className="report-actions"
                  style={{
                    display: 'flex',
                    gap: '10px'
                  }}
                >
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    className="action-btn whatsapp-btn"
                    style={{
                      padding: '8px 15px',
                      background: '#25D366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <FaWhatsapp size={18} /> WhatsApp
                  </button>
                  <button 
                    onClick={handlePrintReport} 
                    className="action-btn"
                    style={{
                      padding: '8px 15px',
                      background: themeColors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <FiPrinter /> Print
                  </button>
                  <button 
                    onClick={handleExportReport} 
                    className="action-btn"
                    style={{
                      padding: '8px 15px',
                      background: themeColors.secondary,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <FiDownload /> Export
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="action-btn close-btn"
                    style={{
                      padding: '8px 15px',
                      background: themeColors.error,
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <FiX /> Close
                  </button>
                </div>
              </div>

              <div 
                className="summary-section"
                style={{ marginBottom: '20px' }}
              >
                <h3 style={{ marginBottom: '15px' }}>Shift-wise Production Summary</h3>
                <div 
                  className="shift-cards-container"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '15px'
                  }}
                >
                  <div 
                    className="shift-card day-shift-card"
                    style={{
                      background: themeColors.surface,
                      padding: '15px',
                      borderRadius: '8px',
                      border: `1px solid ${themeColors.border}`
                    }}
                  >
                    <div 
                      className="shift-card-header"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}
                    >
                      <div 
                        className="shift-title"
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <span className="shift-icon" style={{ fontSize: '24px' }}>☀️</span>
                        <h4 style={{ margin: 0 }}>Day Shift</h4>
                      </div>
                      <div 
                        className="shift-badge"
                        style={{
                          background: themeColors.primary,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {reportData.dayShiftCount} Records
                      </div>
                    </div>
                    <div 
                      className="shift-stats"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px'
                      }}
                    >
                      <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '12px', color: themeColors.textSecondary }}>Production</div>
                        <div className="stat-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(reportData.dayShiftData.production)} M
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '12px', color: themeColors.textSecondary }}>Weight</div>
                        <div className="stat-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(reportData.dayShiftData.weight)} KG
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '12px', color: themeColors.textSecondary }}>Avg Efficiency</div>
                        <div className="stat-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(reportData.dayShiftData.avgEfficiency)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="shift-card night-shift-card"
                    style={{
                      background: themeColors.surface,
                      padding: '15px',
                      borderRadius: '8px',
                      border: `1px solid ${themeColors.border}`
                    }}
                  >
                    <div 
                      className="shift-card-header"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px'
                      }}
                    >
                      <div 
                        className="shift-title"
                        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                      >
                        <span className="shift-icon" style={{ fontSize: '24px' }}>🌙</span>
                        <h4 style={{ margin: 0 }}>Night Shift</h4>
                      </div>
                      <div 
                        className="shift-badge"
                        style={{
                          background: themeColors.primary,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        {reportData.nightShiftCount} Records
                      </div>
                    </div>
                    <div 
                      className="shift-stats"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px'
                      }}
                    >
                      <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '12px', color: themeColors.textSecondary }}>Production</div>
                        <div className="stat-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(reportData.nightShiftData.production)} M
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '12px', color: themeColors.textSecondary }}>Weight</div>
                        <div className="stat-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(reportData.nightShiftData.weight)} KG
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '12px', color: themeColors.textSecondary }}>Avg Efficiency</div>
                        <div className="stat-value" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {Math.round(reportData.nightShiftData.avgEfficiency)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {Object.keys(reportData.itemWise).length > 0 && (
                <div 
                  className="summary-section"
                  style={{ marginBottom: '20px' }}
                >
                  <div 
                    className="section-header"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px'
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Item-wise Summary</h3>
                    <div 
                      className="section-count"
                      style={{
                        fontSize: '14px',
                        color: themeColors.textSecondary
                      }}
                    >
                      {Object.keys(reportData.itemWise).length} Items
                    </div>
                  </div>
                  <div 
                    className="items-cards-container"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '15px'
                    }}
                  >
                    {Object.entries(reportData.itemWise).map(([item, data]) => (
                      <div 
                        key={item} 
                        className="item-card"
                        style={{
                          background: themeColors.surface,
                          padding: '15px',
                          borderRadius: '8px',
                          border: `1px solid ${themeColors.border}`
                        }}
                      >
                        <div 
                          className="item-card-header"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '15px'
                          }}
                        >
                          <FiPackage size={18} style={{ color: themeColors.primary }} />
                          <div 
                            className="item-name"
                            style={{
                              fontWeight: '500',
                              fontSize: '14px'
                            }}
                          >
                            {item}
                          </div>
                        </div>
                        <div 
                          className="item-card-stats"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px'
                          }}
                        >
                          <div className="item-stat">
                            <div 
                              className="item-stat-value"
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '2px'
                              }}
                            >
                              {Math.round(data.production)} M
                            </div>
                            <div 
                              className="item-stat-label"
                              style={{
                                fontSize: '11px',
                                color: themeColors.textSecondary
                              }}
                            >
                              Production
                            </div>
                          </div>
                          <div className="item-stat">
                            <div 
                              className="item-stat-value"
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '2px'
                              }}
                            >
                              {Math.round(data.weight)} KG
                            </div>
                            <div 
                              className="item-stat-label"
                              style={{
                                fontSize: '11px',
                                color: themeColors.textSecondary
                              }}
                            >
                              Weight
                            </div>
                          </div>
                          <div className="item-stat">
                            <div 
                              className="item-stat-value"
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginBottom: '2px'
                              }}
                            >
                              {Math.round(
                                data.count > 0 ? data.efficiency / data.count : 0
                              )}
                              %
                            </div>
                            <div 
                              className="item-stat-label"
                              style={{
                                fontSize: '11px',
                                color: themeColors.textSecondary
                              }}
                            >
                              Efficiency
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div 
                className="summary-section"
                style={{ marginBottom: '20px' }}
              >
                <h3 style={{ marginBottom: '15px' }}>Machine-wise Summary - Day Shift</h3>
                <div 
                  className="machines-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '10px'
                  }}
                >
                  {Array.from({ length: 14 }, (_, i) => {
                    const machineNum = i + 1;
                    const machineKey = `SP # ${machineNum}`;
                    const data = reportData.dayShiftData.machines[machineKey] || {
                      production: 0,
                      efficiency: 0,
                      operator: "Operator Absent",
                      count: 0,
                    };
                    const efficiency =
                      data.count > 0
                        ? Math.round(data.efficiency / data.count)
                        : 0;

                    return (
                      <div 
                        key={machineNum} 
                        className="machine-card"
                        style={{
                          background: themeColors.surface,
                          padding: '12px',
                          borderRadius: '6px',
                          border: `1px solid ${themeColors.border}`
                        }}
                      >
                        <div 
                          className="machine-card-header"
                          style={{
                            marginBottom: '10px'
                          }}
                        >
                          <div 
                            className="machine-name"
                            style={{
                              fontWeight: '500',
                              fontSize: '14px',
                              marginBottom: '5px'
                            }}
                          >
                            SP # {machineNum}
                          </div>
                          <div 
                            className="machine-operator"
                            style={{
                              fontSize: '11px',
                              color: themeColors.textSecondary,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiUser size={12} />
                            {data.operator || "Operator Absent"}
                          </div>
                        </div>
                        <div 
                          className="machine-card-stats"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px'
                          }}
                        >
                          <div className="machine-stat">
                            <div 
                              className="machine-stat-value"
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '2px'
                              }}
                            >
                              {Math.round(data.production)} M
                            </div>
                            <div 
                              className="machine-stat-label"
                              style={{
                                fontSize: '10px',
                                color: themeColors.textSecondary
                              }}
                            >
                              Production
                            </div>
                          </div>
                          <div className="machine-stat">
                            <div 
                              className="machine-stat-value"
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '2px'
                              }}
                            >
                              {efficiency}%
                            </div>
                            <div 
                              className="machine-stat-label"
                              style={{
                                fontSize: '10px',
                                color: themeColors.textSecondary
                              }}
                            >
                              Efficiency
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div 
                className="summary-section"
                style={{ marginBottom: '20px' }}
              >
                <h3 style={{ marginBottom: '15px' }}>Machine-wise Summary - Night Shift</h3>
                <div 
                  className="machines-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '10px'
                  }}
                >
                  {Array.from({ length: 14 }, (_, i) => {
                    const machineNum = i + 1;
                    const machineKey = `SP # ${machineNum}`;
                    const data = reportData.nightShiftData.machines[machineKey] || {
                      production: 0,
                      efficiency: 0,
                      operator: "Operator Absent",
                      count: 0,
                    };
                    const efficiency =
                      data.count > 0
                        ? Math.round(data.efficiency / data.count)
                        : 0;

                    return (
                      <div 
                        key={machineNum} 
                        className="machine-card"
                        style={{
                          background: themeColors.surface,
                          padding: '12px',
                          borderRadius: '6px',
                          border: `1px solid ${themeColors.border}`
                        }}
                      >
                        <div 
                          className="machine-card-header"
                          style={{
                            marginBottom: '10px'
                          }}
                        >
                          <div 
                            className="machine-name"
                            style={{
                              fontWeight: '500',
                              fontSize: '14px',
                              marginBottom: '5px'
                            }}
                          >
                            SP # {machineNum}
                          </div>
                          <div 
                            className="machine-operator"
                            style={{
                              fontSize: '11px',
                              color: themeColors.textSecondary,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiUser size={12} />
                            {data.operator || "Operator Absent"}
                          </div>
                        </div>
                        <div 
                          className="machine-card-stats"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px'
                          }}
                        >
                          <div className="machine-stat">
                            <div 
                              className="machine-stat-value"
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '2px'
                              }}
                            >
                              {Math.round(data.production)} M
                            </div>
                            <div 
                              className="machine-stat-label"
                              style={{
                                fontSize: '10px',
                                color: themeColors.textSecondary
                              }}
                            >
                              Production
                            </div>
                          </div>
                          <div className="machine-stat">
                            <div 
                              className="machine-stat-value"
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '2px'
                              }}
                            >
                              {efficiency}%
                            </div>
                            <div 
                              className="machine-stat-label"
                              style={{
                                fontSize: '10px',
                                color: themeColors.textSecondary
                              }}
                            >
                              Efficiency
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div 
                className="report-summary"
                style={{
                  background: themeColors.surface,
                  padding: '15px',
                  borderRadius: '8px',
                  border: `1px solid ${themeColors.border}`
                }}
              >
                <h3 style={{ marginBottom: '15px' }}>Report Summary</h3>
                <div 
                  className="summary-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px'
                  }}
                >
                  <div 
                    className="summary-card"
                    style={{
                      padding: '12px',
                      background: themeColors.background,
                      borderRadius: '6px',
                      border: `1px solid ${themeColors.border}`
                    }}
                  >
                    <div 
                      className="summary-card-label"
                      style={{
                        fontSize: '12px',
                        color: themeColors.textSecondary,
                        marginBottom: '8px'
                      }}
                    >
                      Total Production
                    </div>
                    <div 
                      className="summary-card-value"
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}
                    >
                      {Math.round(reportData.totalProduction)} M
                    </div>
                    <div 
                      className="summary-card-note"
                      style={{
                        fontSize: '11px',
                        color: themeColors.textSecondary
                      }}
                    >
                      Target: {Math.round(reportData.totalProduction * 1.2)} M
                    </div>
                  </div>

                  <div 
                    className="summary-card"
                    style={{
                      padding: '12px',
                      background: themeColors.background,
                      borderRadius: '6px',
                      border: `1px solid ${themeColors.border}`
                    }}
                  >
                    <div 
                      className="summary-card-label"
                      style={{
                        fontSize: '12px',
                        color: themeColors.textSecondary,
                        marginBottom: '8px'
                      }}
                    >
                      Total Weight
                    </div>
                    <div 
                      className="summary-card-value"
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}
                    >
                      {Math.round(reportData.totalWeight)} KG
                    </div>
                    <div 
                      className="summary-card-note"
                      style={{
                        fontSize: '11px',
                        color: themeColors.textSecondary
                      }}
                    >
                      Total weight produced
                    </div>
                  </div>

                  <div 
                    className="summary-card"
                    style={{
                      padding: '12px',
                      background: themeColors.background,
                      borderRadius: '6px',
                      border: `1px solid ${themeColors.border}`
                    }}
                  >
                    <div 
                      className="summary-card-label"
                      style={{
                        fontSize: '12px',
                        color: themeColors.textSecondary,
                        marginBottom: '8px'
                      }}
                    >
                      Average Efficiency
                    </div>
                    <div 
                      className="summary-card-value"
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}
                    >
                      {Math.round(reportData.avgEfficiency)}%
                    </div>
                    <div 
                      className="summary-card-note"
                      style={{
                        fontSize: '11px',
                        color: themeColors.textSecondary
                      }}
                    >
                      Target: 85%
                    </div>
                  </div>

                  <div 
                    className="summary-card"
                    style={{
                      padding: '12px',
                      background: themeColors.background,
                      borderRadius: '6px',
                      border: `1px solid ${themeColors.border}`
                    }}
                  >
                    <div 
                      className="summary-card-label"
                      style={{
                        fontSize: '12px',
                        color: themeColors.textSecondary,
                        marginBottom: '8px'
                      }}
                    >
                      Total Records
                    </div>
                    <div 
                      className="summary-card-value"
                      style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}
                    >
                      {reportData.recordCount}
                    </div>
                    <div 
                      className="summary-card-note"
                      style={{
                        fontSize: '11px',
                        color: themeColors.textSecondary
                      }}
                    >
                      Day: {reportData.dayShiftCount} | Night: {reportData.nightShiftCount}
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="report-footer"
                style={{
                  marginTop: '20px',
                  paddingTop: '15px',
                  borderTop: `1px solid ${themeColors.border}`,
                  fontSize: '12px',
                  color: themeColors.textSecondary,
                  textAlign: 'center'
                }}
              >
                <p style={{ margin: 0 }}>
                  Report generated on {new Date().toLocaleString()} by <strong>{loggedInUser}</strong> • Data source: spiralsection table • Pakistan Wire Industries ERP System
                </p>
              </div>
            </div>
          )}

          {/* Records Section */}
          <div 
            className="records-section"
            style={{
              background: themeColors.background,
              color: themeColors.textPrimary,
              padding: '15px',
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div 
              className="section-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}
            >
              <h3 style={{ margin: 0 }}>Spiral Production Records</h3>
              <div 
                className="section-info"
                style={{
                  display: 'flex',
                  gap: '15px',
                  fontSize: '12px',
                  color: themeColors.textPrimary 
                }}
              >
                <span className="info-item">Total: {records.length} records</span>
                <span className="info-item">
                  Showing: {filteredRecords.length} filtered
                </span>
                <span className="info-item">
                  Page: {currentPage}/{totalPages}
                </span>
                <span className="info-item">Managed by: {loggedInUser}</span>
                <div 
                  className="database-status"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <div
                    className={`status-dot ${
                      isSupabaseConnected ? "connected" : "offline"
                    }`}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isSupabaseConnected ? '#4CAF50' : '#F44336'
                    }}
                  />
                  {isSupabaseConnected ? "Connected" : "Offline"}
                </div>
              </div>
            </div>

            {loading ? (
              <div 
                className="loading-state"
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: themeColors.textSecondary,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div 
                  className="loading-spinner"
                  style={{
                    width: '40px',
                    height: '40px',
                    border: `3px solid ${themeColors.border}`,
                    borderTop: `3px solid ${themeColors.primary}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }}
                />
                <p>Loading records from spiralsection table...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div 
                className="empty-state"
                style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: themeColors.textSecondary,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <FiColumns size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <h4 style={{ marginBottom: '10px', color: themeColors.textPrimary }}>No records found</h4>
                <p style={{ marginBottom: '20px' }}>
                  {searchTerm || filterDate || filterType
                    ? "No records match your search criteria. Try adjusting your filters."
                    : "No spiral production records available. Create your first record to get started."}
                </p>
                <button
                  onClick={() => navigate("/production-sections/spiral/new")}
                  className="primary-btn"
                  style={{
                    padding: '12px 24px',
                    background: headerGradient,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px'
                  }}
                >
                  <FiPlus /> Create First Record
                </button>
              </div>
            ) : (
              <>
                <div 
                  className="table-container"
                  style={{ 
                    overflowX: 'auto',
                    flex: 1,
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: '6px'
                  }}
                >
                  <table 
                    className="records-table"
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      minWidth: '1000px'
                    }}
                  >
                    <thead>
                      <tr style={{ background: headerGradient, color: 'white' }}>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>ID</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>& Code</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Item</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>Details</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Material</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>& Wire</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Product</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>Details</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Machine</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>(ID)</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Production</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>(Target)</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Weight</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>(Per M)</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Efficiency</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>(Target)</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>Operator</th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>User</th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Shift</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>(Code)</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>
                          <div>Date</div>
                          <div style={{ fontSize: '10px', opacity: 0.8 }}>& Time</div>
                        </th>
                        <th style={{ padding: '10px 8px', fontSize: '12px', textAlign: 'left' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((record, index) => (
                        <tr
                          key={record.id}
                          style={{
                            background: index % 2 === 0 ? themeColors.background : themeColors.surface,
                            borderBottom: `1px solid ${themeColors.border}`
                          }}
                        >
                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>#{record.id}</div>
                              {record.item_code && (
                                <div style={{ fontSize: '10px', color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <FiCode size={10} /> {record.item_code}
                                </div>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <FiPackage size={14} style={{ color: themeColors.primary }} />
                                <span style={{ fontWeight: '500' }}>
                                  {record.item_name || "N/A"}
                                </span>
                              </div>
                              <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>
                                <span>Size:</span>
                                <span style={{ marginLeft: '4px' }}>{record.raw_material_flatsize || "N/A"}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{record.material_type || "N/A"}</div>
                              <div style={{ fontSize: '10px', color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiZap size={12} /> {record.wire_size || "N/A"}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{record.finishedproductname || "N/A"}</div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <FiTool size={14} style={{ color: themeColors.primary }} />
                                <span style={{ fontWeight: '500' }}>{record.machine_no || "N/A"}</span>
                              </div>
                              <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>
                                <span>ID:</span>
                                <span style={{ marginLeft: '4px' }}>{record.machine_id || "N/A"}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                <span>{Math.round(parseFloat(record.production_quantity || 0))}</span>
                                <span style={{ fontSize: '10px', marginLeft: '2px', color: themeColors.textSecondary }}>M</span>
                              </div>
                              <div style={{ fontSize: '10px', color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiTarget size={12} />
                                <span>Target:</span>
                                <span>{Math.round(
                                  parseFloat(
                                    record.target_quantity ||
                                    record.production_quantity * 1.2
                                  )
                                )} M</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                <span>{Math.round(parseFloat(record.weight || 0))}</span>
                                <span style={{ fontSize: '10px', marginLeft: '2px', color: themeColors.textSecondary }}>KG</span>
                              </div>
                              <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>
                                <span>Per M:</span>
                                <span style={{ marginLeft: '4px' }}>{Math.round(parseFloat(record.per_meter_wt || 0))} KG</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div 
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontWeight: 'bold',
                                  fontSize: '11px',
                                  display: 'inline-block',
                                  marginBottom: '4px',
                                  background: parseFloat(record.efficiency || 0) >= 85 
                                    ? 'rgba(76, 175, 80, 0.2)' 
                                    : parseFloat(record.efficiency || 0) >= 70
                                    ? 'rgba(255, 152, 0, 0.2)'
                                    : 'rgba(244, 67, 54, 0.2)',
                                  color: parseFloat(record.efficiency || 0) >= 85 
                                    ? '#4CAF50' 
                                    : parseFloat(record.efficiency || 0) >= 70
                                    ? '#FF9800'
                                    : '#F44336',
                                  border: `1px solid ${parseFloat(record.efficiency || 0) >= 85 
                                    ? '#4CAF50' 
                                    : parseFloat(record.efficiency || 0) >= 70
                                    ? '#FF9800'
                                    : '#F44336'}`
                                }}
                              >
                                {Math.round(parseFloat(record.efficiency || 0))}%
                              </div>
                              <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>
                                <span>Target:</span>
                                <span style={{ marginLeft: '4px' }}>85%</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiUser size={14} style={{ color: themeColors.primary }} />
                                <span>{record.operator_name || "N/A"}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{record.users_name || "N/A"}</div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ fontWeight: '500', marginBottom: '4px' }}>{record.shift_name || "N/A"}</div>
                              <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>
                                <span>Code:</span>
                                <span style={{ marginLeft: '4px' }}>{record.shift_code || "N/A"}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div>
                              <div style={{ marginBottom: '4px' }}>
                                {new Date(record.created_at).toLocaleDateString("en-GB")}
                              </div>
                              <div style={{ fontSize: '10px', color: themeColors.textSecondary }}>
                                {new Date(record.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 8px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => handleView(record.id)}
                                className="action-btn view-btn"
                                title="View Record"
                                style={{
                                  padding: '6px',
                                  background: themeColors.info || '#2196F3',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <FiEye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(record.id)}
                                className="action-btn edit-btn"
                                title="Edit Record"
                                style={{
                                  padding: '6px',
                                  background: themeColors.warning || '#FF9800',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="action-btn delete-btn"
                                title="Delete Record"
                                style={{
                                  padding: '6px',
                                  background: themeColors.error || '#F44336',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div 
                    className="pagination"
                    style={{
                      marginTop: '20px',
                      paddingTop: '15px',
                      borderTop: `1px solid ${themeColors.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div 
                      className="pagination-info"
                      style={{
                        fontSize: '12px',
                        color: themeColors.textSecondary
                      }}
                    >
                      Showing {indexOfFirstItem + 1} to{" "}
                      {Math.min(indexOfLastItem, filteredRecords.length)} of{" "}
                      {filteredRecords.length} records
                    </div>
                    <div 
                      className="pagination-controls"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        style={{
                          padding: '8px 15px',
                          background: currentPage === 1 ? themeColors.disabled : themeColors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          opacity: currentPage === 1 ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px'
                        }}
                      >
                        <FiChevronLeft /> Previous
                      </button>

                      <div 
                        className="page-numbers"
                        style={{
                          display: 'flex',
                          gap: '5px'
                        }}
                      >
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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
                                className={`page-btn ${
                                  currentPage === pageNum ? "active" : ""
                                }`}
                                style={{
                                  padding: '8px 12px',
                                  background: currentPage === pageNum ? themeColors.primary : themeColors.surface,
                                  color: currentPage === pageNum ? 'white' : themeColors.textPrimary,
                                  border: `1px solid ${currentPage === pageNum ? themeColors.primary : themeColors.border}`,
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '14px'
                                }}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        style={{
                          padding: '8px 15px',
                          background: currentPage === totalPages ? themeColors.disabled : themeColors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          opacity: currentPage === totalPages ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px'
                        }}
                      >
                        Next <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div 
          className="bottom-info-bar"
          style={{
            background: themeColors.surface,
            padding: '10px 15px',
            borderTop: `1px solid ${themeColors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: themeColors.textSecondary
          }}
        >
          <div className="info-left" style={{ display: 'flex', gap: '15px' }}>
            <span>Records: {stats.totalRecords}</span>
            <span>User: {loggedInUser}</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="info-right" style={{ display: 'flex', gap: '15px' }}>
            <span>Production: {Math.round(stats.totalProduction)} M</span>
            <span>Weight: {Math.round(stats.totalWeight)} KG</span>
            <span>Efficiency: {Math.round(stats.avgEfficiency)}%</span>
          </div>
        </div>
      </div>

      {showWhatsAppModal && <WhatsAppModal />}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spiral-content {
          -webkit-overflow-scrolling: touch;
        }
        
        .table-container::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        
        .table-container::-webkit-scrollbar-track {
          background: ${themeColors.background};
        }
        
        .table-container::-webkit-scrollbar-thumb {
          background: ${themeColors.border};
          border-radius: 3px;
        }
        
        @media (max-width: 768px) {
          .buttons-row {
            flex-direction: column;
          }
          
          .page-btn {
            width: 100%;
            justify-content: center;
          }
          
          .filters-single-line {
            flex-direction: column;
          }
          
          .filter-group {
            width: 100%;
          }
          
          .section-info {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </>
  );
};

export default SpiralPage;