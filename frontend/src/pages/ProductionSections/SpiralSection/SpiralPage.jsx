/// src/pages/ProductionSections/SpiralSection/SpiralPage.jsx
// ============================================================
// Spiral Section - 100% HORIZONTAL LAYOUT COMPATIBLE VERSION
// ALL FILTERS AND BUTTONS IN SINGLE LINE
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
  FiHash,
  FiDollarSign,
  FiPercent,
  FiShoppingBag,
  FiServer,
  FiTrendingDown,
  FiTrendingUp as FiTrendingUpIcon,
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
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || (isDarkMode ? '#7986CB' : '#1A237E');
  };

  // Theme-based colors - INDIGO/NAVY BLUE COLORS
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

  // Header background gradient colors (theme-based) - INDIGO GRADIENT
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
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: `0 20px 60px ${themeColors.shadow}`
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
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        >
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
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
            <h3 style={{ margin: '10px 0 5px 0', fontSize: '16px' }}>Send to WhatsApp Desktop</h3>
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
                  borderRadius: '8px',
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
                  borderRadius: '8px',
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
                  borderRadius: '8px',
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
            <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <FiEye /> Message Preview
            </h4>
            <div 
              className="message-preview"
              style={{
                background: themeColors.surface,
                padding: '15px',
                borderRadius: '8px',
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
        "Production Data",
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
        `"${record.production_data || ""}"`,
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
            color: ${isDarkMode ? '#7986CB' : '#1A237E'};
            background: ${isDarkMode ? '#121212' : 'white'};
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding: 20px;
            background: ${isDarkMode ? '#283593' : '#1A237E'};
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
            border: 1px solid ${isDarkMode ? '#7986CB' : '#283593'}; 
            padding: 12px; 
            text-align: left; 
          }
          .table th { 
            background-color: ${isDarkMode ? '#283593' : '#1A237E'}; 
            color: #FFFFFF;
          }
          .summary { 
            background-color: ${isDarkMode ? '#1a1a1a' : '#F4F4F4'}; 
            padding: 20px; 
            margin: 20px 0; 
            border: 1px solid ${isDarkMode ? '#7986CB' : '#283593'};
            color: ${isDarkMode ? '#7986CB' : '#1A237E'};
          }
          .shift-section { 
            margin: 20px 0; 
            padding: 15px; 
            border-left: 4px solid ${isDarkMode ? '#7986CB' : '#1A237E'};
            background: ${isDarkMode ? '#1a1a1a' : '#F4F4F4'};
            color: ${isDarkMode ? '#7986CB' : '#1A237E'};
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
            color: ${isDarkMode ? '#7986CB' : '#1A237E'};
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
            <h3 style="margin: 0; color: ${isDarkMode ? '#7986CB' : '#1A237E'};">☀️ Day Shift Summary</h3>
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
            <h3 style="margin: 0; color: ${isDarkMode ? '#7986CB' : '#1A237E'};">🌙 Night Shift Summary</h3>
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
          <button onclick="window.print()" style="padding: 10px 20px; background: ${isDarkMode ? '#283593' : '#1A237E'}; color: #FFFFFF; border: none; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: ${isDarkMode ? '#7986CB' : '#283593'}; color: #FFFFFF; border: none; cursor: pointer; margin-left: 10px;">
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
      color: "#6366F1",
      trend: stats.todayRecords > 0 ? "up" : "neutral"
    },
    {
      id: "total-production",
      title: "Total Production",
      value: `${Math.round(stats.totalProduction)} M`,
      icon: FiColumns,
      description: "Total production in meters",
      color: "#10B981",
      trend: stats.todayProduction > 0 ? "up" : "neutral"
    },
    {
      id: "total-weight",
      title: "Total Weight",
      value: `${Math.round(stats.totalWeight)} KG`,
      icon: FiFeather,
      description: "Total weight in kilograms",
      color: "#F59E0B",
      trend: stats.todayWeight > 0 ? "up" : "neutral"
    },
    {
      id: "avg-efficiency",
      title: "Avg Efficiency",
      value: `${Math.round(stats.avgEfficiency)}%`,
      icon: FiTrendingUpIcon,
      description: "Average efficiency percentage",
      color: "#EF4444",
      trend: stats.todayAvgEfficiency > 85 ? "up" : "down"
    },
    {
      id: "today-records",
      title: "Today's Records",
      value: stats.todayRecords,
      icon: FiCalendar,
      description: "Records added today",
      color: "#8B5CF6",
      trend: stats.todayRecords > 0 ? "up" : "neutral"
    },
    {
      id: "today-production",
      title: "Today's Production",
      value: `${Math.round(stats.todayProduction)} M`,
      icon: FiPackage,
      description: "Today's production",
      color: "#06B6D4",
      trend: stats.todayProduction > 0 ? "up" : "neutral"
    },
    {
      id: "today-weight",
      title: "Today's Weight",
      value: `${Math.round(stats.todayWeight)} KG`,
      icon: FiFeather,
      description: "Today's weight",
      color: "#F97316",
      trend: stats.todayWeight > 0 ? "up" : "neutral"
    },
    {
      id: "today-avg-efficiency",
      title: "Today's Avg Efficiency",
      value: `${Math.round(stats.todayAvgEfficiency)}%`,
      icon: FiActivity,
      description: "Today's average efficiency",
      color: "#EC4899",
      trend: stats.todayAvgEfficiency > 85 ? "up" : "down"
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
            borderRadius: '8px',
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
            background: themeColors.error + '20',
            color: themeColors.error,
            padding: '12px 20px',
            margin: '0',
            borderRadius: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: `1px solid ${themeColors.error}`
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
                    borderRadius: '8px',
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
                    borderRadius: '8px',
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
                    borderRadius: '8px',
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
                    borderRadius: '8px',
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
                    borderRadius: '8px',
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
                    borderRadius: '8px',
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
                    borderRadius: '8px',
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
                background: 'transparent',
                color: themeColors.primary,
                border: `1px solid ${themeColors.primary}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = themeColors.primary;
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = themeColors.primary;
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
                background: 'transparent',
                color: themeColors.info,
                border: `1px solid ${themeColors.info}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = themeColors.info;
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = themeColors.info;
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
                background: 'transparent',
                color: themeColors.warning,
                border: `1px solid ${themeColors.warning}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = themeColors.warning;
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = themeColors.warning;
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
                background: 'transparent',
                color: themeColors.primary,
                border: `1px solid ${themeColors.primary}`,
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = themeColors.primary;
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = themeColors.primary;
                }
              }}
            >
              {loading ? (
                <div 
                  className="mini-spinner"
                  style={{
                    width: '16px',
                    height: '16px',
                    border: `2px solid ${themeColors.primary}30`,
                    borderTop: `2px solid ${themeColors.primary}`,
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
                background: 'transparent',
                color: themeColors.secondary,
                border: `1px solid ${themeColors.secondary}`,
                borderRadius: '6px',
                cursor: records.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                opacity: records.length === 0 ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (records.length > 0) {
                  e.target.style.background = themeColors.secondary;
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (records.length > 0) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = themeColors.secondary;
                }
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
                background: 'transparent',
                color: themeColors.info,
                border: `1px solid ${themeColors.info}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = themeColors.info;
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = themeColors.info;
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
                background: 'transparent',
                color: '#283593',
                border: '1px solid #283593',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#283593';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#283593';
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
                background: 'transparent',
                color: themeColors.primary,
                border: `1px solid ${themeColors.primary}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = themeColors.primary;
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = themeColors.primary;
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
                background: 'transparent',
                color: themeColors.primary,
                border: `1px solid ${themeColors.primary}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = themeColors.primary;
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = themeColors.primary;
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
                background: 'transparent',
                color: themeColors.success,
                border: `1px solid ${themeColors.success}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = themeColors.success;
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = themeColors.success;
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
                padding: '20px',
                borderBottom: `1px solid ${themeColors.border}`
              }}
            >
              <div 
                className="section-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}
              >
                <h3 style={{ 
                  margin: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  <div style={{
                    background: themeColors.primary + '20',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiActivity size={20} color={themeColors.primary} />
                  </div>
                  Production Statistics
                </h3>
                <div 
                  className="stats-summary"
                  style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '13px',
                    color: themeColors.textSecondary,
                    background: themeColors.surface,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${themeColors.border}`
                  }}
                >
                  <span className="summary-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiDatabase size={14} />
                    Total: {stats.totalRecords} records
                  </span>
                  <span className="summary-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiUser size={14} />
                    {loggedInUser}
                  </span>
                </div>
              </div>
              <div 
                className="stats-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '16px'
                }}
              >
                {statCards.map((card) => (
                  <div 
                    key={card.id} 
                    className="stat-card"
                    style={{
                      background: themeColors.surface,
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${themeColors.border}`,
                      boxShadow: `0 2px 8px ${themeColors.shadow}`,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 24px ${themeColors.shadow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 2px 8px ${themeColors.shadow}`;
                    }}
                  >
                    <div 
                      className="stat-header"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          background: card.color + '20',
                          padding: '10px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <card.icon size={20} color={card.color} />
                        </div>
                        <div className="stat-title" style={{ fontSize: '14px', fontWeight: '500', color: themeColors.textSecondary }}>{card.title}</div>
                      </div>
                      {card.trend !== "neutral" && (
                        <div style={{
                          background: card.trend === "up" ? '#10B98120' : '#EF444420',
                          color: card.trend === "up" ? '#10B981' : '#EF4444',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {card.trend === "up" ? <FiTrendingUpIcon size={12} /> : <FiTrendingDown size={12} />}
                          {card.trend === "up" ? 'Up' : 'Down'}
                        </div>
                      )}
                    </div>
                    <div className="stat-value" style={{ 
                      fontSize: '28px', 
                      fontWeight: 'bold', 
                      marginBottom: '8px',
                      color: themeColors.textPrimary
                    }}>{card.value}</div>
                    <div className="stat-footer" style={{ 
                      fontSize: '13px', 
                      color: themeColors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{ flex: 1 }}>{card.description}</div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${card.color} 0%, ${card.color}80 100%)`,
                      borderBottomLeftRadius: '12px',
                      borderBottomRightRadius: '12px'
                    }} />
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
                padding: '20px',
                borderBottom: `1px solid ${themeColors.border}`
              }}
            >
              <div 
                className="section-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}
              >
                <h3 style={{ 
                  margin: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  <div style={{
                    background: themeColors.primary + '20',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiCpu size={20} color={themeColors.primary} />
                  </div>
                  Today's Production Dashboard
                </h3>
                <div 
                  className="section-info"
                  style={{
                    display: 'flex',
                    gap: '15px',
                    fontSize: '13px',
                    color: themeColors.textPrimary,
                    background: themeColors.surface,
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${themeColors.border}`
                  }}
                >
                  <span className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiUser size={14} />
                    {loggedInUser}
                  </span>
                  <span className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiDatabase size={14} />
                    {stats.todayRecords} records
                  </span>
                </div>
              </div>

              <div 
                className="dashboard-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px'
                }}
              >
                <div 
                  className="dashboard-card"
                  style={{
                    background: themeColors.surface,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${themeColors.border}`,
                    boxShadow: `0 2px 8px ${themeColors.shadow}`,
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div 
                    className="card-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '20px'
                    }}
                  >
                    <div style={{
                      background: themeColors.primary + '20',
                      padding: '10px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiPackage size={20} color={themeColors.primary} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Item-wise Production</h4>
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
                                padding: '12px',
                                marginBottom: '10px',
                                background: themeColors.background,
                                borderRadius: '8px',
                                border: `1px solid ${themeColors.border}`,
                                transition: 'border-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = themeColors.primary}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.border}
                            >
                              <div className="item-name" style={{ 
                                fontWeight: '500', 
                                marginBottom: '8px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <FiPackage size={14} color={themeColors.textSecondary} />
                                {item}
                              </div>
                              <div 
                                className="item-stats"
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: '12px'
                                }}
                              >
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.primary,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(data.production)} M
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Production</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.success,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(data.weight)} KG
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Weight</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.warning,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(
                                      data.count > 0
                                        ? data.efficiency / data.count
                                        : 0
                                    )}
                                    %
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Efficiency</div>
                                </div>
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
                          padding: '40px 20px',
                          color: themeColors.textSecondary
                        }}
                      >
                        <div style={{
                          background: themeColors.border,
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px'
                        }}>
                          <FiPackage size={24} color={themeColors.textSecondary} />
                        </div>
                        <h5 style={{ margin: '0 0 8px 0', color: themeColors.textPrimary }}>No Production Today</h5>
                        <p style={{ margin: 0, fontSize: '14px' }}>No item production records for today</p>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className="dashboard-card"
                  style={{
                    background: themeColors.surface,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${themeColors.border}`,
                    boxShadow: `0 2px 8px ${themeColors.shadow}`,
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div 
                    className="card-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '20px'
                    }}
                  >
                    <div style={{
                      background: themeColors.primary + '20',
                      padding: '10px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiTool size={20} color={themeColors.primary} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Machine-wise Production</h4>
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
                                padding: '12px',
                                marginBottom: '10px',
                                background: themeColors.background,
                                borderRadius: '8px',
                                border: `1px solid ${themeColors.border}`,
                                transition: 'border-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = themeColors.primary}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.border}
                            >
                              <div className="machine-name" style={{ 
                                fontWeight: '500', 
                                marginBottom: '8px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <FiTool size={14} color={themeColors.textSecondary} />
                                Machine {machine}
                              </div>
                              <div 
                                className="machine-stats"
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: '12px'
                                }}
                              >
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.primary,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(data.production)} M
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Production</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.success,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(data.weight)} KG
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Weight</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.warning,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(
                                      data.count > 0
                                        ? data.efficiency / data.count
                                        : 0
                                    )}
                                    %
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Efficiency</div>
                                </div>
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
                          padding: '40px 20px',
                          color: themeColors.textSecondary
                        }}
                      >
                        <div style={{
                          background: themeColors.border,
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px'
                        }}>
                          <FiTool size={24} color={themeColors.textSecondary} />
                        </div>
                        <h5 style={{ margin: '0 0 8px 0', color: themeColors.textPrimary }}>No Machine Activity</h5>
                        <p style={{ margin: 0, fontSize: '14px' }}>No machine production records for today</p>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className="dashboard-card"
                  style={{
                    background: themeColors.surface,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${themeColors.border}`,
                    boxShadow: `0 2px 8px ${themeColors.shadow}`,
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div 
                    className="card-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '20px'
                    }}
                  >
                    <div style={{
                      background: themeColors.primary + '20',
                      padding: '10px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiBox size={20} color={themeColors.primary} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Finished Products</h4>
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
                                padding: '12px',
                                marginBottom: '10px',
                                background: themeColors.background,
                                borderRadius: '8px',
                                border: `1px solid ${themeColors.border}`,
                                transition: 'border-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = themeColors.primary}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = themeColors.border}
                            >
                              <div className="product-name" style={{ 
                                fontWeight: '500', 
                                marginBottom: '8px',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <FiBox size={14} color={themeColors.textSecondary} />
                                {product}
                              </div>
                              <div 
                                className="product-stats"
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 1fr)',
                                  gap: '12px'
                                }}
                              >
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.primary,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(data.production)} M
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Production</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.success,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(data.weight)} KG
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Weight</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div className="stat-value" style={{ 
                                    color: themeColors.warning,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}>
                                    {Math.round(
                                      data.count > 0
                                        ? data.efficiency / data.count
                                        : 0
                                    )}
                                    %
                                  </div>
                                  <div style={{ fontSize: '11px', color: themeColors.textSecondary, marginTop: '2px' }}>Efficiency</div>
                                </div>
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
                          padding: '40px 20px',
                          color: themeColors.textSecondary
                        }}
                      >
                        <div style={{
                          background: themeColors.border,
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px'
                        }}>
                          <FiBox size={24} color={themeColors.textSecondary} />
                        </div>
                        <h5 style={{ margin: '0 0 8px 0', color: themeColors.textPrimary }}>No Finished Products</h5>
                        <p style={{ margin: 0, fontSize: '14px' }}>No finished product records for today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🔥 🔥 🔥 FILTERS SECTION - SINGLE LINE HORIZONTAL LAYOUT 🔥 🔥 🔥 */}
          <div 
            className="filters-section"
            style={{
              background: themeColors.background,
              padding: '20px',
              borderBottom: `1px solid ${themeColors.border}`
            }}
          >
            <div 
              className="filters-container"
              style={{
                background: themeColors.surface,
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${themeColors.border}`,
                boxShadow: `0 2px 8px ${themeColors.shadow}`
              }}
            >
              <div 
                className="filter-heading"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                  color: themeColors.primary,
                  fontWeight: '600',
                  fontSize: '16px'
                }}
              >
                <div style={{
                  background: themeColors.primary + '20',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiFilter size={18} color={themeColors.primary} />
                </div>
                <span>FILTERS & CONTROLS</span>
              </div>
              
              {/* 🔥 SINGLE LINE HORIZONTAL LAYOUT - ALL ITEMS IN ONE LINE 🔥 */}
              <div 
                className="filters-horizontal-single-line"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'nowrap', // 🔥 Prevent wrapping to new line
                  overflowX: 'auto', // 🔥 Horizontal scroll for small screens
                  padding: '4px 0',
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${themeColors.border} ${themeColors.background}`
                }}
              >
                {/* 🔍 Search Input */}
                <div className="filter-item" style={{
                  flex: '0 0 auto',
                  minWidth: '180px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '4px',
                    color: themeColors.textSecondary,
                    fontSize: '12px'
                  }}>
                    <FiHash size={12} />
                    <span>Search</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: '6px',
                        background: themeColors.background,
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                      onBlur={(e) => e.target.style.borderColor = themeColors.border}
                    />
                    <FiHash 
                      size={14} 
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: themeColors.textSecondary
                      }} 
                    />
                  </div>
                </div>

                {/* ⚡ Wire Size Select */}
                <div className="filter-item" style={{
                  flex: '0 0 auto',
                  minWidth: '160px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '4px',
                    color: themeColors.textSecondary,
                    fontSize: '12px'
                  }}>
                    <FiZap size={12} />
                    <span>Wire Size</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: '6px',
                        background: themeColors.background,
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                      onBlur={(e) => e.target.style.borderColor = themeColors.border}
                    >
                      <option value="">All Wire Sizes</option>
                      {wireSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <FiZap 
                      size={14} 
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: themeColors.textSecondary
                      }} 
                    />
                  </div>
                </div>

                {/* 📅 Date Filter */}
                <div className="filter-item" style={{
                  flex: '0 0 auto',
                  minWidth: '160px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginBottom: '4px',
                    color: themeColors.textSecondary,
                    fontSize: '12px'
                  }}>
                    <FiCalendar size={12} />
                    <span>Date Filter</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        border: `1px solid ${themeColors.border}`,
                        borderRadius: '6px',
                        background: themeColors.background,
                        color: themeColors.textPrimary,
                        fontSize: '13px',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = themeColors.primary}
                      onBlur={(e) => e.target.style.borderColor = themeColors.border}
                    />
                    <FiCalendar 
                      size={14} 
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: themeColors.textSecondary
                      }} 
                    />
                  </div>
                </div>

                {/* 📊 Generate Report Button */}
                <div className="filter-item" style={{
                  flex: '0 0 auto',
                  marginTop: '20px'
                }}>
                  <button
                    onClick={() =>
                      filterDate
                        ? setShowReport(true)
                        : alert("Please select a date first")
                    }
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: themeColors.primary,
                      border: `1px solid ${themeColors.primary}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = themeColors.primary;
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = themeColors.primary;
                    }}
                  >
                    <FiBarChart2 size={14} />
                    <span>Generate Report</span>
                  </button>
                </div>

                {/* 🗑️ Clear Filters Button */}
                <div className="filter-item" style={{
                  flex: '0 0 auto',
                  marginTop: '20px'
                }}>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("");
                      setFilterDate("");
                      setShowReport(false);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: themeColors.secondary,
                      border: `1px solid ${themeColors.secondary}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = themeColors.secondary;
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = themeColors.secondary;
                    }}
                  >
                    <FiX size={14} />
                    <span>Clear Filters</span>
                  </button>
                </div>

                {/* 📱 WhatsApp Button */}
                <div className="filter-item" style={{
                  flex: '0 0 auto',
                  marginTop: '20px'
                }}>
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: '#25D366',
                      border: '1px solid #25D366',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#25D366';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#25D366';
                    }}
                  >
                    <FaWhatsapp size={14} />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {/* 🖨️ Print Button */}
                <div className="filter-item" style={{
                  flex: '0 0 auto',
                  marginTop: '20px'
                }}>
                  <button
                    onClick={handlePrintReport}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: '#495057',
                      border: '1px solid #495057',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#495057';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#495057';
                    }}
                  >
                    <FiPrinter size={14} />
                    <span>Print</span>
                  </button>
                </div>

                {/* 📥 Export CSV Button */}
                <div className="filter-item" style={{
                  flex: '0 0 auto',
                  marginTop: '20px'
                }}>
                  <button
                    onClick={handleExport}
                    disabled={records.length === 0}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: themeColors.success,
                      border: `1px solid ${themeColors.success}`,
                      borderRadius: '6px',
                      cursor: records.length === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      opacity: records.length === 0 ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (records.length > 0) {
                        e.target.style.background = themeColors.success;
                        e.target.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (records.length > 0) {
                        e.target.style.background = 'transparent';
                        e.target.style.color = themeColors.success;
                      }
                    }}
                  >
                    <FiDownload size={14} />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Live Filtering Info */}
              <div 
                className="filter-info"
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: themeColors.background,
                  borderRadius: '6px',
                  border: `1px solid ${themeColors.border}`,
                  fontSize: '12px',
                  color: themeColors.textSecondary,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiFilter size={12} />
                  <span>Active Filters:</span>
                  <span style={{ 
                    color: themeColors.primary,
                    fontWeight: '500',
                    marginLeft: '4px'
                  }}>
                    {searchTerm && "Search: " + searchTerm}
                    {filterType && (searchTerm ? " | " : "") + "Wire: " + filterType}
                    {filterDate && (searchTerm || filterType ? " | " : "") + "Date: " + filterDate}
                    {!searchTerm && !filterType && !filterDate && "No filters applied"}
                  </span>
                </div>
                <div style={{ color: themeColors.textSecondary }}>
                  Showing {filteredRecords.length} of {records.length} records
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
                padding: '20px',
                borderBottom: `1px solid ${themeColors.border}`
              }}
            >
              <div 
                className="report-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '24px',
                  paddingBottom: '20px',
                  borderBottom: `1px solid ${themeColors.border}`
                }}
              >
                <div 
                  className="report-title"
                  style={{ flex: 1 }}
                >
                  <h2 style={{ 
                    margin: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>
                    <div style={{
                      background: themeColors.primary + '20',
                      padding: '10px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiBarChart2 size={24} color={themeColors.primary} />
                    </div>
                    Spiral Section Production Report
                  </h2>
                  <div 
                    className="report-info"
                    style={{
                      marginTop: '12px',
                      fontSize: '14px',
                      color: themeColors.textSecondary,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div className="report-date" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiCalendar size={16} />
                      {reportData.formattedDate}
                    </div>
                    <div className="report-author" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiUser size={16} />
                      Generated by: <strong>{loggedInUser}</strong>
                    </div>
                  </div>
                </div>

                <div 
                  className="report-actions"
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}
                >
                  <button
                    onClick={() => setShowWhatsAppModal(true)}
                    className="action-btn whatsapp-btn"
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      color: '#25D366',
                      border: '1px solid #25D366',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#25D366';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#25D366';
                    }}
                  >
                    <FaWhatsapp size={18} /> WhatsApp
                  </button>
                  <button 
                    onClick={handlePrintReport} 
                    className="action-btn"
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      color: themeColors.primary,
                      border: `1px solid ${themeColors.primary}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = themeColors.primary;
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = themeColors.primary;
                    }}
                  >
                    <FiPrinter /> Print
                  </button>
                  <button 
                    onClick={handleExportReport} 
                    className="action-btn"
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      color: themeColors.secondary,
                      border: `1px solid ${themeColors.secondary}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = themeColors.secondary;
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = themeColors.secondary;
                    }}
                  >
                    <FiDownload /> Export
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="action-btn close-btn"
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      color: themeColors.error,
                      border: `1px solid ${themeColors.error}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = themeColors.error;
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = themeColors.error;
                    }}
                  >
                    <FiX /> Close
                  </button>
                </div>
              </div>

              <div 
                className="summary-section"
                style={{ marginBottom: '24px' }}
              >
                <h3 style={{ 
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: themeColors.textPrimary
                }}>Shift-wise Production Summary</h3>
                <div 
                  className="shift-cards-container"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                  }}
                >
                  <div 
                    className="shift-card day-shift-card"
                    style={{
                      background: themeColors.surface,
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${themeColors.border}`,
                      boxShadow: `0 2px 8px ${themeColors.shadow}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      className="shift-card-header"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '20px'
                      }}
                    >
                      <div 
                        className="shift-title"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        <div style={{
                          background: '#FFD70020',
                          padding: '10px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span className="shift-icon" style={{ fontSize: '20px', color: '#FFD700' }}>☀️</span>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Day Shift</h4>
                          <div style={{ fontSize: '13px', color: themeColors.textSecondary }}>Morning Production</div>
                        </div>
                      </div>
                      <div 
                        className="shift-badge"
                        style={{
                          background: themeColors.primary,
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
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
                        gap: '16px'
                      }}
                    >
                      {[
                        { label: 'Production', value: Math.round(reportData.dayShiftData.production) + ' M', icon: FiPackage, color: themeColors.primary },
                        { label: 'Weight', value: Math.round(reportData.dayShiftData.weight) + ' KG', icon: FiFeather, color: themeColors.success },
                        { label: 'Avg Efficiency', value: Math.round(reportData.dayShiftData.avgEfficiency) + '%', icon: FiTrendingUp, color: themeColors.warning }
                      ].map((stat, index) => (
                        <div key={index} className="stat-item" style={{ textAlign: 'center' }}>
                          <div style={{
                            background: stat.color + '20',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px'
                          }}>
                            <stat.icon size={20} color={stat.color} />
                          </div>
                          <div className="stat-value" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {stat.value}
                          </div>
                          <div className="stat-label" style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div 
                    className="shift-card night-shift-card"
                    style={{
                      background: themeColors.surface,
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${themeColors.border}`,
                      boxShadow: `0 2px 8px ${themeColors.shadow}`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div 
                      className="shift-card-header"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '20px'
                      }}
                    >
                      <div 
                        className="shift-title"
                        style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                      >
                        <div style={{
                          background: '#6366F120',
                          padding: '10px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span className="shift-icon" style={{ fontSize: '20px', color: '#6366F1' }}>🌙</span>
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Night Shift</h4>
                          <div style={{ fontSize: '13px', color: themeColors.textSecondary }}>Evening Production</div>
                        </div>
                      </div>
                      <div 
                        className="shift-badge"
                        style={{
                          background: themeColors.primary,
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
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
                        gap: '16px'
                      }}
                    >
                      {[
                        { label: 'Production', value: Math.round(reportData.nightShiftData.production) + ' M', icon: FiPackage, color: themeColors.primary },
                        { label: 'Weight', value: Math.round(reportData.nightShiftData.weight) + ' KG', icon: FiFeather, color: themeColors.success },
                        { label: 'Avg Efficiency', value: Math.round(reportData.nightShiftData.avgEfficiency) + '%', icon: FiTrendingUp, color: themeColors.warning }
                      ].map((stat, index) => (
                        <div key={index} className="stat-item" style={{ textAlign: 'center' }}>
                          <div style={{
                            background: stat.color + '20',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px'
                          }}>
                            <stat.icon size={20} color={stat.color} />
                          </div>
                          <div className="stat-value" style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {stat.value}
                          </div>
                          <div className="stat-label" style={{ fontSize: '12px', color: themeColors.textSecondary }}>
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {Object.keys(reportData.itemWise).length > 0 && (
                <div 
                  className="summary-section"
                  style={{ marginBottom: '24px' }}
                >
                  <div 
                    className="section-header"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}
                  >
                    <h3 style={{ 
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: '600',
                      color: themeColors.textPrimary
                    }}>Item-wise Summary</h3>
                    <div 
                      className="section-count"
                      style={{
                        fontSize: '14px',
                        color: themeColors.textSecondary,
                        background: themeColors.surface,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: `1px solid ${themeColors.border}`
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
                      gap: '16px'
                    }}
                  >
                    {Object.entries(reportData.itemWise).map(([item, data]) => (
                      <div 
                        key={item} 
                        className="item-card"
                        style={{
                          background: themeColors.surface,
                          padding: '20px',
                          borderRadius: '12px',
                          border: `1px solid ${themeColors.border}`,
                          boxShadow: `0 2px 8px ${themeColors.shadow}`,
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div 
                          className="item-card-header"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                          }}
                        >
                          <div style={{
                            background: themeColors.primary + '20',
                            padding: '10px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <FiPackage size={18} color={themeColors.primary} />
                          </div>
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
                            gap: '12px'
                          }}
                        >
                          {[
                            { label: 'Production', value: Math.round(data.production) + ' M', color: themeColors.primary },
                            { label: 'Weight', value: Math.round(data.weight) + ' KG', color: themeColors.success },
                            { label: 'Efficiency', value: Math.round(data.count > 0 ? data.efficiency / data.count : 0) + '%', color: themeColors.warning }
                          ].map((stat, index) => (
                            <div key={index} className="item-stat" style={{ textAlign: 'center' }}>
                              <div 
                                className="item-stat-value"
                                style={{
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  marginBottom: '4px',
                                  color: stat.color
                                }}
                              >
                                {stat.value}
                              </div>
                              <div 
                                className="item-stat-label"
                                style={{
                                  fontSize: '11px',
                                  color: themeColors.textSecondary
                                }}
                              >
                                {stat.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div 
                className="summary-section"
                style={{ marginBottom: '24px' }}
              >
                <h3 style={{ 
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: themeColors.textPrimary
                }}>Machine-wise Summary - Day Shift</h3>
                <div 
                  className="machines-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '12px'
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
                          padding: '16px',
                          borderRadius: '12px',
                          border: `1px solid ${themeColors.border}`,
                          boxShadow: `0 2px 8px ${themeColors.shadow}`,
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div 
                          className="machine-card-header"
                          style={{
                            marginBottom: '12px'
                          }}
                        >
                          <div 
                            className="machine-name"
                            style={{
                              fontWeight: '500',
                              fontSize: '14px',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <FiTool size={14} color={themeColors.textSecondary} />
                            SP # {machineNum}
                          </div>
                          <div 
                            className="machine-operator"
                            style={{
                              fontSize: '12px',
                              color: themeColors.textSecondary,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
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
                            gap: '10px'
                          }}
                        >
                          <div className="machine-stat" style={{ textAlign: 'center' }}>
                            <div 
                              className="machine-stat-value"
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '2px',
                                color: themeColors.primary
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
                          <div className="machine-stat" style={{ textAlign: 'center' }}>
                            <div 
                              className="machine-stat-value"
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '2px',
                                color: efficiency >= 85 ? themeColors.success : efficiency >= 70 ? themeColors.warning : themeColors.error
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
                style={{ marginBottom: '24px' }}
              >
                <h3 style={{ 
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: themeColors.textPrimary
                }}>Machine-wise Summary - Night Shift</h3>
                <div 
                  className="machines-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '12px'
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
                          padding: '16px',
                          borderRadius: '12px',
                          border: `1px solid ${themeColors.border}`,
                          boxShadow: `0 2px 8px ${themeColors.shadow}`,
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <div 
                          className="machine-card-header"
                          style={{
                            marginBottom: '12px'
                          }}
                        >
                          <div 
                            className="machine-name"
                            style={{
                              fontWeight: '500',
                              fontSize: '14px',
                              marginBottom: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <FiTool size={14} color={themeColors.textSecondary} />
                            SP # {machineNum}
                          </div>
                          <div 
                            className="machine-operator"
                            style={{
                              fontSize: '12px',
                              color: themeColors.textSecondary,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
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
                            gap: '10px'
                          }}
                        >
                          <div className="machine-stat" style={{ textAlign: 'center' }}>
                            <div 
                              className="machine-stat-value"
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '2px',
                                color: themeColors.primary
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
                          <div className="machine-stat" style={{ textAlign: 'center' }}>
                            <div 
                              className="machine-stat-value"
                              style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                marginBottom: '2px',
                                color: efficiency >= 85 ? themeColors.success : efficiency >= 70 ? themeColors.warning : themeColors.error
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
                  padding: '24px',
                  borderRadius: '12px',
                  border: `1px solid ${themeColors.border}`,
                  boxShadow: `0 2px 8px ${themeColors.shadow}`
                }}
              >
                <h3 style={{ 
                  marginBottom: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: themeColors.textPrimary
                }}>Report Summary</h3>
                <div 
                  className="summary-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px'
                  }}
                >
                  {[
                    { 
                      label: 'Total Production', 
                      value: Math.round(reportData.totalProduction) + ' M',
                      note: `Target: ${Math.round(reportData.totalProduction * 1.2)} M`,
                      icon: FiPackage,
                      color: themeColors.primary
                    },
                    { 
                      label: 'Total Weight', 
                      value: Math.round(reportData.totalWeight) + ' KG',
                      note: 'Total weight produced',
                      icon: FiFeather,
                      color: themeColors.success
                    },
                    { 
                      label: 'Average Efficiency', 
                      value: Math.round(reportData.avgEfficiency) + '%',
                      note: 'Target: 85%',
                      icon: FiTrendingUp,
                      color: themeColors.warning
                    },
                    { 
                      label: 'Total Records', 
                      value: reportData.recordCount.toString(),
                      note: `Day: ${reportData.dayShiftCount} | Night: ${reportData.nightShiftCount}`,
                      icon: FiDatabase,
                      color: themeColors.info
                    }
                  ].map((item, index) => (
                    <div 
                      key={index}
                      className="summary-card"
                      style={{
                        padding: '20px',
                        background: themeColors.background,
                        borderRadius: '12px',
                        border: `1px solid ${themeColors.border}`,
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                          background: item.color + '20',
                          padding: '10px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <item.icon size={20} color={item.color} />
                        </div>
                        <div 
                          className="summary-card-label"
                          style={{
                            fontSize: '14px',
                            color: themeColors.textSecondary,
                            fontWeight: '500'
                          }}
                        >
                          {item.label}
                        </div>
                      </div>
                      <div 
                        className="summary-card-value"
                        style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          marginBottom: '8px',
                          color: themeColors.textPrimary
                        }}
                      >
                        {item.value}
                      </div>
                      <div 
                        className="summary-card-note"
                        style={{
                          fontSize: '12px',
                          color: themeColors.textSecondary
                        }}
                      >
                        {item.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div 
                className="report-footer"
                style={{
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: `1px solid ${themeColors.border}`,
                  fontSize: '13px',
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
              padding: '20px',
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
                marginBottom: '20px'
              }}
            >
              <h3 style={{ 
                margin: 0,
                fontSize: '18px',
                fontWeight: '600'
              }}>Spiral Production Records</h3>
              <div 
                className="section-info"
                style={{
                  display: 'flex',
                  gap: '15px',
                  fontSize: '13px',
                  color: themeColors.textPrimary,
                  background: themeColors.surface,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${themeColors.border}`
                }}
              >
                <span className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiDatabase size={14} />
                  Total: {records.length} records
                </span>
                <span className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiFilter size={14} />
                  Showing: {filteredRecords.length} filtered
                </span>
                <span className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiHash size={14} />
                  Page: {currentPage}/{totalPages}
                </span>
                <span className="info-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiUser size={14} />
                  {loggedInUser}
                </span>
                <div 
                  className="database-status"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
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
                      background: isSupabaseConnected ? themeColors.success : themeColors.error
                    }}
                  />
                  <span style={{ fontSize: '12px' }}>{isSupabaseConnected ? "Connected" : "Offline"}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div 
                className="loading-state"
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
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
                    width: '48px',
                    height: '48px',
                    border: `3px solid ${themeColors.border}`,
                    borderTop: `3px solid ${themeColors.primary}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }}
                />
                <h4 style={{ margin: '0 0 12px 0', color: themeColors.textPrimary }}>Loading Records</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>Fetching records from spiralsection table...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div 
                className="empty-state"
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: themeColors.textSecondary,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  background: themeColors.border,
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <FiColumns size={32} color={themeColors.textSecondary} />
                </div>
                <h4 style={{ marginBottom: '12px', color: themeColors.textPrimary, fontSize: '18px' }}>No records found</h4>
                <p style={{ marginBottom: '24px', fontSize: '14px', maxWidth: '400px' }}>
                  {searchTerm || filterDate || filterType
                    ? "No records match your search criteria. Try adjusting your filters."
                    : "No spiral production records available. Create your first record to get started."}
                </p>
                <button
                  onClick={() => navigate("/production-sections/spiral/new")}
                  className="primary-btn"
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    color: themeColors.primary,
                    border: `1px solid ${themeColors.primary}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = themeColors.primary;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = themeColors.primary;
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
                    borderRadius: '12px',
                    boxShadow: `0 2px 8px ${themeColors.shadow}`
                  }}
                >
                  <table 
                    className="records-table"
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      minWidth: '1200px'
                    }}
                  >
                    <thead>
                      <tr style={{ 
                        background: headerGradient, 
                        color: 'white',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                      }}>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiHash size={14} />
                            <div>
                              <div>ID</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>& Code</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiPackage size={14} />
                            <div>
                              <div>Item</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>Details</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiZap size={14} />
                            <div>
                              <div>Material</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>& Wire</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiBox size={14} />
                            <div>
                              <div>Product</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>Details</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiTool size={14} />
                            <div>
                              <div>Machine</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>(ID)</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiTrendingUpIcon size={14} />
                            <div>
                              <div>Production</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>(Target)</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiFeather size={14} />
                            <div>
                              <div>Weight</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>(Per M)</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiPercent size={14} />
                            <div>
                              <div>Efficiency</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>(Target)</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiUser size={14} />
                            <div>Operator</div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiUser size={14} />
                            <div>User</div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiClock size={14} />
                            <div>
                              <div>Shift</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>(Code)</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiShoppingBag size={14} />
                            <div>
                              <div>Production</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>Data</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left',
                          borderRight: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCalendar size={14} />
                            <div>
                              <div>Date</div>
                              <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>& Time</div>
                            </div>
                          </div>
                        </th>
                        <th style={{ 
                          padding: '16px 12px', 
                          fontSize: '13px', 
                          textAlign: 'left'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiSettings size={14} />
                            <div>Actions</div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map((record, index) => (
                        <tr
                          key={record.id}
                          style={{
                            background: index % 2 === 0 ? themeColors.background : themeColors.surface,
                            borderBottom: `1px solid ${themeColors.border}`,
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = themeColors.hover + '20'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? themeColors.background : themeColors.surface}
                        >
                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ fontWeight: 'bold', color: themeColors.primary }}>#{record.id}</div>
                              {record.item_code && (
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: themeColors.textSecondary, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  marginTop: '4px'
                                }}>
                                  <FiCode size={10} /> {record.item_code}
                                </div>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <FiPackage size={16} style={{ color: themeColors.primary }} />
                                <span style={{ fontWeight: '500' }}>
                                  {record.item_name || "N/A"}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: themeColors.textSecondary }}>
                                <span>Size:</span>
                                <span style={{ marginLeft: '4px' }}>{record.raw_material_flatsize || "N/A"}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{record.material_type || "N/A"}</div>
                              <div style={{ fontSize: '11px', color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                <FiZap size={12} /> {record.wire_size || "N/A"}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{record.finishedproductname || "N/A"}</div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <FiTool size={16} style={{ color: themeColors.primary }} />
                                <span style={{ fontWeight: '500' }}>{record.machine_no || "N/A"}</span>
                              </div>
                              <div style={{ fontSize: '11px', color: themeColors.textSecondary }}>
                                <span>ID:</span>
                                <span style={{ marginLeft: '4px' }}>{record.machine_id || "N/A"}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                                <span>{Math.round(parseFloat(record.production_quantity || 0))}</span>
                                <span style={{ fontSize: '11px', marginLeft: '2px', color: themeColors.textSecondary }}>M</span>
                              </div>
                              <div style={{ fontSize: '11px', color: themeColors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
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

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
                                <span>{Math.round(parseFloat(record.weight || 0))}</span>
                                <span style={{ fontSize: '11px', marginLeft: '2px', color: themeColors.textSecondary }}>KG</span>
                              </div>
                              <div style={{ fontSize: '11px', color: themeColors.textSecondary }}>
                                <span>Per M:</span>
                                <span style={{ marginLeft: '4px' }}>{Math.round(parseFloat(record.per_meter_wt || 0))} KG</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div 
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontWeight: 'bold',
                                  fontSize: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  marginBottom: '6px',
                                  background: parseFloat(record.efficiency || 0) >= 85 
                                    ? themeColors.success + '20' 
                                    : parseFloat(record.efficiency || 0) >= 70
                                    ? themeColors.warning + '20'
                                    : themeColors.error + '20',
                                  color: parseFloat(record.efficiency || 0) >= 85 
                                    ? themeColors.success 
                                    : parseFloat(record.efficiency || 0) >= 70
                                    ? themeColors.warning
                                    : themeColors.error
                                }}
                              >
                                <FiPercent size={10} />
                                {Math.round(parseFloat(record.efficiency || 0))}%
                              </div>
                              <div style={{ fontSize: '11px', color: themeColors.textSecondary }}>
                                <span>Target:</span>
                                <span style={{ marginLeft: '4px' }}>85%</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiUser size={16} style={{ color: themeColors.textSecondary }} />
                                <span>{record.operator_name || "N/A"}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{record.users_name || "N/A"}</div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ fontWeight: '500', marginBottom: '6px' }}>{record.shift_name || "N/A"}</div>
                              <div style={{ fontSize: '11px', color: themeColors.textSecondary }}>
                                <span>Code:</span>
                                <span style={{ marginLeft: '4px' }}>{record.shift_code || "N/A"}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ 
                                fontSize: '12px', 
                                color: record.production_data ? themeColors.textPrimary : themeColors.textSecondary,
                                maxWidth: '150px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {record.production_data || "No data"}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px', borderRight: `1px solid ${themeColors.border}` }}>
                            <div>
                              <div style={{ marginBottom: '6px' }}>
                                {new Date(record.created_at).toLocaleDateString("en-GB")}
                              </div>
                              <div style={{ fontSize: '11px', color: themeColors.textSecondary }}>
                                {new Date(record.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px 12px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleView(record.id)}
                                className="action-btn view-btn"
                                title="View Record"
                                style={{
                                  padding: '8px',
                                  background: 'transparent',
                                  color: themeColors.info,
                                  border: `1px solid ${themeColors.info}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = themeColors.info;
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.color = themeColors.info;
                                }}
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                onClick={() => handleEdit(record.id)}
                                className="action-btn edit-btn"
                                title="Edit Record"
                                style={{
                                  padding: '8px',
                                  background: 'transparent',
                                  color: themeColors.warning,
                                  border: `1px solid ${themeColors.warning}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = themeColors.warning;
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.color = themeColors.warning;
                                }}
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="action-btn delete-btn"
                                title="Delete Record"
                                style={{
                                  padding: '8px',
                                  background: 'transparent',
                                  color: themeColors.error,
                                  border: `1px solid ${themeColors.error}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.background = themeColors.error;
                                  e.target.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.color = themeColors.error;
                                }}
                              >
                                <FiTrash2 size={18} />
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
                      marginTop: '24px',
                      paddingTop: '20px',
                      borderTop: `1px solid ${themeColors.border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div 
                      className="pagination-info"
                      style={{
                        fontSize: '13px',
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
                        gap: '12px'
                      }}
                >
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        style={{
                          padding: '10px 20px',
                          background: currentPage === 1 ? themeColors.disabled : 'transparent',
                          color: currentPage === 1 ? themeColors.textSecondary : themeColors.primary,
                          border: `1px solid ${currentPage === 1 ? themeColors.disabled : themeColors.primary}`,
                          borderRadius: '8px',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          opacity: currentPage === 1 ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: currentPage === 1 ? 'none' : 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== 1) {
                            e.target.style.background = themeColors.primary;
                            e.target.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== 1) {
                            e.target.style.background = 'transparent';
                            e.target.style.color = themeColors.primary;
                          }
                        }}
                      >
                        <FiChevronLeft /> Previous
                      </button>

                      <div 
                        className="page-numbers"
                        style={{
                          display: 'flex',
                          gap: '6px'
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
                                  padding: '10px 16px',
                                  background: currentPage === pageNum ? themeColors.primary : 'transparent',
                                  color: currentPage === pageNum ? 'white' : themeColors.textPrimary,
                                  border: `1px solid ${currentPage === pageNum ? themeColors.primary : themeColors.border}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (currentPage !== pageNum) {
                                    e.target.style.background = themeColors.primary + '20';
                                    e.target.style.borderColor = themeColors.primary;
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (currentPage !== pageNum) {
                                    e.target.style.background = 'transparent';
                                    e.target.style.borderColor = themeColors.border;
                                  }
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
                          padding: '10px 20px',
                          background: currentPage === totalPages ? themeColors.disabled : 'transparent',
                          color: currentPage === totalPages ? themeColors.textSecondary : themeColors.primary,
                          border: `1px solid ${currentPage === totalPages ? themeColors.disabled : themeColors.primary}`,
                          borderRadius: '8px',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          opacity: currentPage === totalPages ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: currentPage === totalPages ? 'none' : 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== totalPages) {
                            e.target.style.background = themeColors.primary;
                            e.target.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== totalPages) {
                            e.target.style.background = 'transparent';
                            e.target.style.color = themeColors.primary;
                          }
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
            padding: '12px 20px',
            borderTop: `1px solid ${themeColors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: themeColors.textSecondary
          }}
        >
          <div className="info-left" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiDatabase size={14} />
              Records: {stats.totalRecords}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiUser size={14} />
              {loggedInUser}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiClock size={14} />
              {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="info-right" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiPackage size={14} />
              Production: {Math.round(stats.totalProduction)} M
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiFeather size={14} />
              Weight: {Math.round(stats.totalWeight)} KG
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiPercent size={14} />
              Efficiency: {Math.round(stats.avgEfficiency)}%
            </span>
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
          height: 8px;
          width: 8px;
        }
        
        .table-container::-webkit-scrollbar-track {
          background: ${themeColors.background};
          border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb {
          background: ${themeColors.border};
          border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb:hover {
          background: ${themeColors.primary};
        }
        
        .filters-horizontal-single-line::-webkit-scrollbar {
          height: 4px;
        }
        
        .filters-horizontal-single-line::-webkit-scrollbar-track {
          background: ${themeColors.background};
          border-radius: 2px;
        }
        
        .filters-horizontal-single-line::-webkit-scrollbar-thumb {
          background: ${themeColors.border};
          border-radius: 2px;
        }
        
        @media (max-width: 768px) {
          .buttons-row {
            flex-direction: column;
          }
          
          .page-btn {
            width: 100%;
            justify-content: center;
          }
          
          .filters-horizontal-single-line {
            gap: 6px;
            padding-bottom: 8px;
          }
          
          .filter-item {
            min-width: 150px !important;
          }
          
          .section-info {
            flex-direction: column;
            gap: 5px;
          }
          
          .stats-grid,
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          
          .records-table th,
          .records-table td {
            padding: 12px 8px;
            font-size: 12px;
          }
          
          .pagination-controls {
            flex-direction: column;
            gap: 10px;
          }
          
          .page-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .report-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default SpiralPage;