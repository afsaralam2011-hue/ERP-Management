// ============================================================
// Spiral Section - COMPLETE FIXED VERSION
// All buttons in ONE line, NO borders
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
            color: #005461;
            background: white;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding: 20px;
            background: #018790;
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
            border: 1px solid #00B7B5; 
            padding: 12px; 
            text-align: left; 
          }
          .table th { 
            background-color: #018790; 
            color: #FFFFFF;
          }
          .summary { 
            background-color: #F4F4F4; 
            padding: 20px; 
            margin: 20px 0; 
            border: 1px solid #00B7B5;
          }
          .shift-section { 
            margin: 20px 0; 
            padding: 15px; 
            border-left: 4px solid #005461;
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
          <h1>Spiral Section Production Report</h1>
          <div class="date">${reportData.formattedDate}</div>
          <div class="date">Report Generated by: ${loggedInUser}</div>
        </div>
        
        <div class="shift-section">
          <div class="shift-header">
            <h3 style="margin: 0; color: #005461;">☀️ Day Shift Summary</h3>
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
            <h3 style="margin: 0; color: #005461;">🌙 Night Shift Summary</h3>
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
          <button onclick="window.print()" style="padding: 10px 20px; background: #018790; color: #FFFFFF; border: none; cursor: pointer;">
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
      <div className="loading-container">
        <div className="loading-spinner" />
        <h3>Loading Spiral Section Data...</h3>
        <p className="loading-subtext">Fetching records from database</p>
      </div>
    );
  }

  return (
    <>
      <div className="spiral-container">
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <FiMenu size={24} />
        </button>

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

        {showMobileMenu && (
          <div className="mobile-menu-overlay">
            <div className="mobile-menu">
              <div className="mobile-menu-header">
                <h3>Spiral Section</h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="mobile-menu-close"
                >
                  &times;
                </button>
              </div>
              <div className="mobile-menu-content">
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                >
                  <FiHome size={18} /> Dashboard
                </button>
                <button
                  onClick={() => {
                    navigate("/production");
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                >
                  <FiArrowLeft size={18} /> Back to Production
                </button>
                <button
                  onClick={() => {
                    navigate("/production-sections/spiral/new");
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                >
                  <FiPlus size={18} /> New Entry
                </button>
                <button
                  onClick={() => {
                    setShowDashboard(!showDashboard);
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
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
                >
                  <FiDownload size={18} /> Export CSV
                </button>
                <button
                  onClick={() => {
                    fetchData();
                    setShowMobileMenu(false);
                  }}
                  className="mobile-menu-btn-item"
                >
                  <FiRefreshCw size={18} /> Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== HEADER SECTION - ALL BUTTONS IN ONE LINE ===== */}
        <div className="header-section">
          <div className="header-main">
            <div className="header-left">
              <div className="title-section">
                <div className="title-icon">
                  <FiColumns size={20} />
                </div>
                <div className="title-content">
                  <h1 className="page-title">
                    <span className="title-text">Spiral Section</span>
                    <div className={`connection-badge ${isSupabaseConnected ? "connected" : "offline"}`}>
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
                    <span className="subtitle-text">Data from: spiralsection table</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="header-right">
              <div className="all-buttons-one-line">
                <button
                  onClick={() => navigate("/production-sections/spiral/new")}
                  className="header-btn primary-btn"
                  title="New Entry"
                >
                  <FiPlus size={18} />
                  <span className="btn-label">New Entry</span>
                </button>
                <button
                  onClick={() => navigate("/production-sections/spiral/smart")}
                  className="header-btn smart-entry-btn"
                  title="Smart Entry"
                >
                  <FiSmartphone size={18} />
                  <span className="btn-label">Smart Entry</span>
                </button>
                <button
                  onClick={() => navigate("/production-sections/spiral/settings")}
                  className="header-btn settings-btn"
                  title="Settings"
                >
                  <FiSettings size={18} />
                  <span className="btn-label">Settings</span>
                </button>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="header-btn refresh-btn"
                  title="Refresh Data"
                >
                  {loading ? (
                    <div className="mini-spinner" />
                  ) : (
                    <FiRefreshCw size={18} />
                  )}
                  <span className="btn-label">Refresh</span>
                </button>
                <button
                  onClick={handleExport}
                  disabled={records.length === 0}
                  className="header-btn export-btn"
                  title="Export Data"
                >
                  <FiDownload size={18} />
                  <span className="btn-label">Export</span>
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="header-btn nav-btn"
                  title="Dashboard"
                >
                  <FiHome size={18} />
                  <span className="btn-label">Dashboard</span>
                </button>
                <button
                  onClick={() => navigate("/production")}
                  className="header-btn nav-btn"
                  title="Production Sections"
                >
                  <FiArrowLeft size={18} />
                  <span className="btn-label">Production</span>
                </button>
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="header-btn dashboard-btn"
                  title="Toggle Dashboard"
                >
                  {showDashboard ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiBarChart2 size={18} />
                  )}
                  <span className="btn-label">Dashboard</span>
                </button>
                <button
                  onClick={() => setShowStatsCards(!showStatsCards)}
                  className="header-btn stats-btn"
                  title="Toggle Stats"
                >
                  {showStatsCards ? (
                    <FiEyeOff size={18} />
                  ) : (
                    <FiLayers size={18} />
                  )}
                  <span className="btn-label">Stats</span>
                </button>
                <button
                  onClick={() => navigate("/production-sections/spiral/batch")}
                  className="header-btn batch-btn"
                  title="Batch Entry"
                >
                  <FiCheckSquare size={18} />
                  <span className="btn-label">Batch</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showStatsCards && (
          <div className="stats-section">
            <div className="section-header">
              <h3>
                <FiActivity size={20} />
                Production Statistics
              </h3>
              <div className="stats-summary">
                <span className="summary-item">
                  Total: {stats.totalRecords} records
                </span>
                <span className="summary-item">Managed by: {loggedInUser}</span>
              </div>
            </div>
            <div className="stats-grid">
              {statCards.map((card) => (
                <div key={card.id} className="stat-card">
                  <div className="stat-header">
                    <card.icon size={20} className="stat-icon" />
                    <div className="stat-title">{card.title}</div>
                  </div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-footer">{card.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showDashboard && (
          <div className="dashboard-section">
            <div className="section-header">
              <h3>
                <FiCpu size={20} />
                Today's Production Dashboard
              </h3>
              <div className="section-info">
                <span className="info-item">Managed by: {loggedInUser}</span>
                <span className="info-item">Records: {stats.todayRecords}</span>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <FiPackage size={20} />
                  <h4>Item-wise Production</h4>
                </div>
                <div className="card-content">
                  {Object.entries(stats.itemWiseToday).length > 0 ? (
                    <div className="items-list">
                      {Object.entries(stats.itemWiseToday).map(
                        ([item, data]) => (
                          <div key={item} className="item-row">
                            <div className="item-name">{item}</div>
                            <div className="item-stats">
                              <span className="stat-value">
                                {Math.round(data.production)} M
                              </span>
                              <span className="stat-value">
                                {Math.round(data.weight)} KG
                              </span>
                              <span className="stat-value">
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
                    <div className="empty-state">
                      <FiPackage size={24} />
                      <p>No item production today</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <FiTool size={20} />
                  <h4>Machine-wise Production</h4>
                </div>
                <div className="card-content">
                  {Object.entries(stats.machineWiseToday).length > 0 ? (
                    <div className="machines-list">
                      {Object.entries(stats.machineWiseToday).map(
                        ([machine, data]) => (
                          <div key={machine} className="machine-row">
                            <div className="machine-name">
                              Machine {machine}
                            </div>
                            <div className="machine-stats">
                              <span className="stat-value">
                                {Math.round(data.production)} M
                              </span>
                              <span className="stat-value">
                                {Math.round(data.weight)} KG
                              </span>
                              <span className="stat-value">
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
                    <div className="empty-state">
                      <FiTool size={24} />
                      <p>No machine production today</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <FiBox size={20} />
                  <h4>Finished Products</h4>
                </div>
                <div className="card-content">
                  {Object.entries(stats.finishedProductWiseToday).length > 0 ? (
                    <div className="products-list">
                      {Object.entries(stats.finishedProductWiseToday).map(
                        ([product, data]) => (
                          <div key={product} className="product-row">
                            <div className="product-name">{product}</div>
                            <div className="product-stats">
                              <span className="stat-value">
                                {Math.round(data.production)} M
                              </span>
                              <span className="stat-value">
                                {Math.round(data.weight)} KG
                              </span>
                              <span className="stat-value">
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
                    <div className="empty-state">
                      <FiBox size={24} />
                      <p>No finished product today</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="filters-section">
          <div className="filters-container">
            <div className="filter-heading">
              <FiFilter size={18} />
              <span>FILTERS</span>
            </div>
            
            {/* ALL FILTERS IN ONE LINE - DESKTOP, MOBILE: VERTICAL */}
            <div className="filters-single-line">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
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

              <div className="filter-group">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="filter-date"
                />
              </div>

              <div className="filter-group">
                <button
                  onClick={() =>
                    filterDate
                      ? setShowReport(true)
                      : alert("Please select a date first")
                  }
                  className="filter-btn primary-btn"
                >
                  <FiBarChart2 /> Generate Report
                </button>
              </div>

              <div className="filter-group">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("");
                    setFilterDate("");
                    setShowReport(false);
                    setCurrentPage(1);
                  }}
                  className="filter-btn secondary-btn"
                >
                  <FiX /> Clear Filters
                </button>
              </div>

              <div className="filter-group">
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="filter-btn whatsapp-btn"
                >
                  <FaWhatsapp /> WhatsApp
                </button>
              </div>

              <div className="filter-group">
                <button
                  onClick={handlePrintReport}
                  className="filter-btn print-btn"
                >
                  <FiPrinter /> Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {showReport && reportData && (
          <div className="report-section">
            <div className="report-header">
              <div className="report-title">
                <h2>
                  <FiBarChart2 size={24} />
                  Spiral Section Production Report
                </h2>
                <div className="report-info">
                  <div className="report-date">{reportData.formattedDate}</div>
                  <div className="report-author">
                    Generated by: <strong>{loggedInUser}</strong>
                  </div>
                </div>
              </div>

              <div className="report-actions">
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="action-btn whatsapp-btn"
                >
                  <FaWhatsapp size={18} /> WhatsApp
                </button>
                <button onClick={handlePrintReport} className="action-btn">
                  <FiPrinter /> Print
                </button>
                <button onClick={handleExportReport} className="action-btn">
                  <FiDownload /> Export
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  className="action-btn close-btn"
                >
                  <FiX /> Close
                </button>
              </div>
            </div>

            <div className="summary-section">
              <h3>Shift-wise Production Summary</h3>
              <div className="shift-cards-container">
                <div className="shift-card day-shift-card">
                  <div className="shift-card-header">
                    <div className="shift-title">
                      <span className="shift-icon">☀️</span>
                      <h4>Day Shift</h4>
                    </div>
                    <div className="shift-badge">
                      {reportData.dayShiftCount} Records
                    </div>
                  </div>
                  <div className="shift-stats">
                    <div className="stat-item">
                      <div className="stat-label">Production</div>
                      <div className="stat-value">
                        {Math.round(reportData.dayShiftData.production)} M
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Weight</div>
                      <div className="stat-value">
                        {Math.round(reportData.dayShiftData.weight)} KG
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Avg Efficiency</div>
                      <div className="stat-value">
                        {Math.round(reportData.dayShiftData.avgEfficiency)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shift-card night-shift-card">
                  <div className="shift-card-header">
                    <div className="shift-title">
                      <span className="shift-icon">🌙</span>
                      <h4>Night Shift</h4>
                    </div>
                    <div className="shift-badge">
                      {reportData.nightShiftCount} Records
                    </div>
                  </div>
                  <div className="shift-stats">
                    <div className="stat-item">
                      <div className="stat-label">Production</div>
                      <div className="stat-value">
                        {Math.round(reportData.nightShiftData.production)} M
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Weight</div>
                      <div className="stat-value">
                        {Math.round(reportData.nightShiftData.weight)} KG
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Avg Efficiency</div>
                      <div className="stat-value">
                        {Math.round(reportData.nightShiftData.avgEfficiency)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {Object.keys(reportData.itemWise).length > 0 && (
              <div className="summary-section">
                <div className="section-header">
                  <h3>Item-wise Summary</h3>
                  <div className="section-count">
                    {Object.keys(reportData.itemWise).length} Items
                  </div>
                </div>
                <div className="items-cards-container">
                  {Object.entries(reportData.itemWise).map(([item, data]) => (
                    <div key={item} className="item-card">
                      <div className="item-card-header">
                        <FiPackage size={18} />
                        <div className="item-name">{item}</div>
                      </div>
                      <div className="item-card-stats">
                        <div className="item-stat">
                          <div className="item-stat-value">
                            {Math.round(data.production)} M
                          </div>
                          <div className="item-stat-label">Production</div>
                        </div>
                        <div className="item-stat">
                          <div className="item-stat-value">
                            {Math.round(data.weight)} KG
                          </div>
                          <div className="item-stat-label">Weight</div>
                        </div>
                        <div className="item-stat">
                          <div className="item-stat-value">
                            {Math.round(
                              data.count > 0 ? data.efficiency / data.count : 0
                            )}
                            %
                          </div>
                          <div className="item-stat-label">Efficiency</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="summary-section">
              <h3>Machine-wise Summary - Day Shift</h3>
              <div className="machines-grid">
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
                    <div key={machineNum} className="machine-card">
                      <div className="machine-card-header">
                        <div className="machine-name">SP # {machineNum}</div>
                        <div className="machine-operator">
                          <FiUser size={12} />{" "}
                          {data.operator || "Operator Absent"}
                        </div>
                      </div>
                      <div className="machine-card-stats">
                        <div className="machine-stat">
                          <div className="machine-stat-value">
                            {Math.round(data.production)} M
                          </div>
                          <div className="machine-stat-label">Production</div>
                        </div>
                        <div className="machine-stat">
                          <div className="machine-stat-value">
                            {efficiency}%
                          </div>
                          <div className="machine-stat-label">Efficiency</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="summary-section">
              <h3>Machine-wise Summary - Night Shift</h3>
              <div className="machines-grid">
                {Array.from({ length: 14 }, (_, i) => {
                  const machineNum = i + 1;
                  const machineKey = `SP # ${machineNum}`;
                  const data = reportData.nightShiftData.machines[
                    machineKey
                  ] || {
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
                    <div key={machineNum} className="machine-card">
                      <div className="machine-card-header">
                        <div className="machine-name">SP # {machineNum}</div>
                        <div className="machine-operator">
                          <FiUser size={12} />{" "}
                          {data.operator || "Operator Absent"}
                        </div>
                      </div>
                      <div className="machine-card-stats">
                        <div className="machine-stat">
                          <div className="machine-stat-value">
                            {Math.round(data.production)} M
                          </div>
                          <div className="machine-stat-label">Production</div>
                        </div>
                        <div className="machine-stat">
                          <div className="machine-stat-value">
                            {efficiency}%
                          </div>
                          <div className="machine-stat-label">Efficiency</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="report-summary">
              <h3>Report Summary</h3>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-card-label">Total Production</div>
                  <div className="summary-card-value">
                    {Math.round(reportData.totalProduction)} M
                  </div>
                  <div className="summary-card-note">
                    Target: {Math.round(reportData.totalProduction * 1.2)} M
                  </div>
                </div>

                <div className="summary-card">
                  <div className="summary-card-label">Total Weight</div>
                  <div className="summary-card-value">
                    {Math.round(reportData.totalWeight)} KG
                  </div>
                  <div className="summary-card-note">Total weight produced</div>
                </div>

                <div className="summary-card">
                  <div className="summary-card-label">Average Efficiency</div>
                  <div className="summary-card-value">
                    {Math.round(reportData.avgEfficiency)}%
                  </div>
                  <div className="summary-card-note">Target: 85%</div>
                </div>

                <div className="summary-card">
                  <div className="summary-card-label">Total Records</div>
                  <div className="summary-card-value">
                    {reportData.recordCount}
                  </div>
                  <div className="summary-card-note">
                    Day: {reportData.dayShiftCount} | Night:{" "}
                    {reportData.nightShiftCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="report-footer">
              <p>
                Report generated on {new Date().toLocaleString()} by{" "}
                <strong>{loggedInUser}</strong> • Data source: spiralsection table •
                Pakistan Wire Industries ERP System
              </p>
            </div>
          </div>
        )}

        <div className="records-section">
          <div className="section-header">
            <h3>Spiral Production Records</h3>
            <div className="section-info">
              <span className="info-item">Total: {records.length} records</span>
              <span className="info-item">
                Showing: {filteredRecords.length} filtered
              </span>
              <span className="info-item">
                Page: {currentPage}/{totalPages}
              </span>
              <span className="info-item">Managed by: {loggedInUser}</span>
              <div className="database-status">
                <div
                  className={`status-dot ${
                    isSupabaseConnected ? "connected" : "offline"
                  }`}
                />
                {isSupabaseConnected ? "Connected" : "Offline"}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading records from spiralsection table...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="empty-state">
              <FiColumns size={48} />
              <h4>No records found</h4>
              <p>
                {searchTerm || filterDate || filterType
                  ? "No records match your search criteria. Try adjusting your filters."
                  : "No spiral production records available. Create your first record to get started."}
              </p>
              <button
                onClick={() => navigate("/production-sections/spiral/new")}
                className="primary-btn"
              >
                <FiPlus /> Create First Record
              </button>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>
                        <div>ID</div>
                        <div className="sub-header">& Code</div>
                      </th>
                      <th>
                        <div>Item</div>
                        <div className="sub-header">Details</div>
                      </th>
                      <th>
                        <div>Material</div>
                        <div className="sub-header">& Wire</div>
                      </th>
                      <th>
                        <div>Product</div>
                        <div className="sub-header">Details</div>
                      </th>
                      <th>
                        <div>Machine</div>
                        <div className="sub-header">(ID)</div>
                      </th>
                      <th>
                        <div>Production</div>
                        <div className="sub-header">(Target)</div>
                      </th>
                      <th>
                        <div>Weight</div>
                        <div className="sub-header">(Per M)</div>
                      </th>
                      <th>
                        <div>Efficiency</div>
                        <div className="sub-header">(Target)</div>
                      </th>
                      <th>Operator</th>
                      <th>User</th>
                      <th>
                        <div>Shift</div>
                        <div className="sub-header">(Code)</div>
                      </th>
                      <th>
                        <div>Date</div>
                        <div className="sub-header">& Time</div>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record, index) => (
                      <tr
                        key={record.id}
                        className={index % 2 === 0 ? "even-row" : "odd-row"}
                      >
                        <td className="id-cell">
                          <div className="cell-content">
                            <div className="id-number">#{record.id}</div>
                            {record.item_code && (
                              <div className="item-code-display">
                                <FiCode size={10} /> {record.item_code}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="item-details-cell">
                          <div className="cell-content">
                            <div className="item-name-primary">
                              <FiPackage size={14} />
                              <span className="item-name-text">
                                {record.item_name || "N/A"}
                              </span>
                            </div>
                            <div className="item-size-row">
                              <span className="item-size-label">Size:</span>
                              <span className="item-size-value">
                                {record.raw_material_flatsize || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="material-cell">
                          <div className="cell-content">
                            <div className="material-type">
                              {record.material_type || "N/A"}
                            </div>
                            <div className="wire-size-info">
                              <FiZap size={12} />
                              <span className="wire-size-text">
                                {record.wire_size || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="product-cell">
                          <div className="cell-content">
                            <div className="product-name">
                              {record.finishedproductname || "N/A"}
                            </div>
                          </div>
                        </td>

                        <td className="machine-cell">
                          <div className="cell-content">
                            <div className="machine-number">
                              <FiTool size={14} />
                              <span className="machine-no-text">
                                {record.machine_no || "N/A"}
                              </span>
                            </div>
                            <div className="machine-id-info">
                              <span className="machine-id-label">ID:</span>
                              <span className="machine-id-value">
                                {record.machine_id || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="production-cell">
                          <div className="cell-content">
                            <div className="production-quantity">
                              <span className="production-value">
                                {Math.round(
                                  parseFloat(record.production_quantity || 0)
                                )}
                              </span>
                              <span className="unit">M</span>
                            </div>
                            <div className="production-target-info">
                              <FiTarget size={12} />
                              <span className="target-label">Target:</span>
                              <span className="target-value">
                                {Math.round(
                                  parseFloat(
                                    record.target_quantity ||
                                      record.production_quantity * 1.2
                                  )
                                )}{" "}
                                M
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="weight-cell">
                          <div className="cell-content">
                            <div className="weight-quantity">
                              <span className="weight-value">
                                {Math.round(parseFloat(record.weight || 0))}
                              </span>
                              <span className="unit">KG</span>
                            </div>
                            <div className="weight-per-meter-info">
                              <span className="per-meter-label">Per M:</span>
                              <span className="per-meter-value">
                                {Math.round(
                                  parseFloat(record.per_meter_wt || 0)
                                )}{" "}
                                KG
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="efficiency-cell">
                          <div className="cell-content">
                            <div
                              className={`efficiency-indicator ${
                                parseFloat(record.efficiency || 0) >= 85
                                  ? "high-efficiency"
                                  : parseFloat(record.efficiency || 0) >= 70
                                  ? "medium-efficiency"
                                  : "low-efficiency"
                              }`}
                            >
                              {Math.round(parseFloat(record.efficiency || 0))}%
                            </div>
                            <div className="efficiency-target-info">
                              <span className="efficiency-target-label">
                                Target:
                              </span>
                              <span className="efficiency-target-value">
                                85%
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="operator-cell">
                          <div className="cell-content">
                            <div className="operator-info">
                              <FiUser size={14} />
                              <span className="operator-name-text">
                                {record.operator_name || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="user-cell">
                          <div className="cell-content">
                            <div className="user-name">
                              {record.users_name || "N/A"}
                            </div>
                          </div>
                        </td>

                        <td className="shift-cell">
                          <div className="cell-content">
                            <div className="shift-name-info">
                              <span className="shift-name-text">
                                {record.shift_name || "N/A"}
                              </span>
                            </div>
                            <div className="shift-code-info">
                              <span className="shift-code-label">Code:</span>
                              <span className="shift-code-value">
                                {record.shift_code || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="datetime-cell">
                          <div className="cell-content">
                            <div className="date-info">
                              {new Date(record.created_at).toLocaleDateString(
                                "en-GB"
                              )}
                            </div>
                            <div className="time-info">
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
                          <div className="cell-content">
                            <div className="action-buttons-group">
                              <button
                                onClick={() => handleView(record.id)}
                                className="action-btn view-btn"
                                title="View Record"
                              >
                                <FiEye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(record.id)}
                                className="action-btn edit-btn"
                                title="Edit Record"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(record.id)}
                                className="action-btn delete-btn"
                                title="Delete Record"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <div className="pagination-info">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredRecords.length)} of{" "}
                    {filteredRecords.length} records
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <FiChevronLeft /> Previous
                    </button>

                    <div className="page-numbers">
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
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <div className="footer-title">
                Pakistan Wire Industries ERP System © 2006
              </div>
              <div className="footer-info">
                <span className="info-item">
                  <FiDatabase size={12} /> spiralsection table
                </span>
                <span className="info-item">
                  <FiUser size={12} /> {loggedInUser}
                </span>
                <span className="info-item">
                  <FiClock size={12} /> {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="footer-right">
              <div className="footer-stats">
                <div className="footer-stat">
                  <span className="stat-value">{stats.totalRecords}</span>
                  <span className="stat-label">Records</span>
                </div>
                <div className="footer-stat">
                  <span className="stat-value">
                    {Math.round(stats.totalProduction)}
                  </span>
                  <span className="stat-label">M</span>
                </div>
                <div className="footer-stat">
                  <span className="stat-value">
                    {Math.round(stats.totalWeight)}
                  </span>
                  <span className="stat-label">KG</span>
                </div>
                <div className="footer-stat">
                  <span className="stat-value">
                    {Math.round(stats.avgEfficiency)}%
                  </span>
                  <span className="stat-label">Eff.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-actions">
            <button
              onClick={() => navigate("/dashboard")}
              className="footer-btn"
            >
              <FiHome size={14} /> Dashboard
            </button>
            <button
              onClick={() => navigate("/production")}
              className="footer-btn"
            >
              <FiGrid size={14} /> All Sections
            </button>
            <button
              onClick={() => navigate("/production-sections/spiral/new")}
              className="footer-btn primary-btn"
            >
              <FiPlus size={14} /> New Record
            </button>
            <button onClick={fetchData} className="footer-btn">
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {showWhatsAppModal && <WhatsAppModal />}
    </>
  );
};

export default SpiralPage;