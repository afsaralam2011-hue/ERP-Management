// src/pages/ProductionReports/DailyProductionReport.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaIndustry,
  FaCheckCircle,
  FaChartLine,
  FaDatabase,
  FaSpinner,
  FaCalendarAlt,
  FaCogs,
  FaArrowUp,
  FaArrowDown,
  FaCheck,
  FaTimes,
  FaWarehouse,
  FaCut,
  FaBoxOpen,
  FaShieldAlt,
  FaBuilding,
  FaListAlt,
  FaBullseye,
  FaTrophy,
  FaRocket,
  FaStar,
  FaBolt,
  FaSyncAlt,
  FaSun,
  FaMoon,
  FaClock,
  FaFileAlt,
  FaChartBar,
  FaFileExport,
  FaFilter,
  FaClipboardList,
  FaEye,
  FaTable,
  FaSitemap,
  FaDownload,
  FaHistory,
  FaPrint,
  FaFileDownload,
  FaEye as FaView,
  FaTimesCircle,
  FaExclamationTriangle,
  FaRegCalendarCheck,
  FaRegClock,
  FaTachometerAlt,
  FaCalculator,
  FaWhatsapp,
  FaUser,
  FaFileExcel,
  FaCopy,
  FaDesktop,
  FaUsers,
  FaTimes as FaClose,
} from "react-icons/fa";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx";

const DailyProductionReport = () => {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [productionData, setProductionData] = useState([]);
  const [allDepartmentsData, setAllDepartmentsData] = useState({});
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [whatsappNumber, setWhatsappNumber] = useState("923001234567");
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const departments = useMemo(
    () => [
      {
        id: 1,
        name: "Raw Material Section",
        icon: <FaWarehouse />,
        color: "#f59e0b",
        tableName: "raw_material_log",
        unit: "KG",
      },
      {
        id: 2,
        name: "Flatting Section",
        icon: <FaIndustry />,
        color: "#3b82f6",
        tableName: "flatteningsection",
        unit: "KG",
      },
      {
        id: 3,
        name: "Spiral Section",
        icon: <FaCogs />,
        color: "#8b5cf6",
        tableName: "spiralsection",
        unit: "Meter",
      },
      {
        id: 4,
        name: "PVC Coating Section",
        icon: <FaShieldAlt />,
        color: "#10b981",
        tableName: "pvcsection",
        unit: "Meter",
      },
      {
        id: 5,
        name: "Cutting & Packing Section",
        icon: <FaCut />,
        color: "#ec4899",
        tableName: "cuttingpacking",
        unit: "Meter",
      },
      {
        id: 6,
        name: "Finishing Goods Section",
        icon: <FaBoxOpen />,
        color: "#06b6d4",
        tableName: "finishinggoods",
        unit: "Meter",
      },
    ],
    []
  );

  // Get department icon and color - FIXED: Moved to top
  const getDepartmentInfo = useCallback(
    (deptName) => {
      const dept = departments.find((d) => d.name === deptName);
      return {
        icon: dept?.icon || <FaIndustry />,
        color: dept?.color || "#3b82f6",
        unit: dept?.unit || "Unit",
      };
    },
    [departments]
  );

  // Calculate all data correctly function (same as ProductionMetrics)
  const calculateAllDataCorrectly = useCallback(
    (records) => {
      const combinationMap = {};
      const shiftMap = {};
      const machineMap = {};
      const dailyMap = {};

      records.forEach((record) => {
        if (!record.created_at) return;

        const recordDate = new Date(record.created_at);
        const dateStr = recordDate.toISOString().split("T")[0];

        // Only process records for selected date
        const selectedDateStr = date.toISOString().split("T")[0];
        if (dateStr !== selectedDateStr) return;

        const machine =
          record.machine_no || record.machine_id || record.machine || "unknown";
        const shift =
          record.shift_name || record.shift || record.shift_no || "unknown";
        const operator =
          record.operator_name || record.operator || "Not Available";
        const target =
          parseFloat(record.target_qty) || parseFloat(record.target) || 0;
        const production =
          parseFloat(record.production_quantity) ||
          parseFloat(record.production) ||
          0;

        const combinationKey = `${machine}_${shift}_${dateStr}`;
        const shiftKey = `${shift}`.trim();
        const machineKey = `${machine}`;
        const dayKey = dateStr;

        if (!combinationMap[combinationKey]) {
          combinationMap[combinationKey] = {
            machine,
            shift,
            date: dateStr,
            target: target,
            production: 0,
            entries: 0,
            operator: operator,
          };
        }
        combinationMap[combinationKey].production += production;
        combinationMap[combinationKey].entries += 1;

        if (!shiftMap[shiftKey]) {
          shiftMap[shiftKey] = {
            shiftName: shift,
            target: 0,
            production: 0,
            machines: new Set(),
            machineDays: {},
            days: new Set(),
            entries: 0,
            combinations: 0,
            operators: new Set(),
          };
        }

        if (!shiftMap[shiftKey].machineDays[machine]) {
          shiftMap[shiftKey].machineDays[machine] = new Set();
        }

        const machineDayKey = `${machine}_${dateStr}`;
        if (!shiftMap[shiftKey].machineDays[machine].has(machineDayKey)) {
          shiftMap[shiftKey].target += target;
          shiftMap[shiftKey].machineDays[machine].add(machineDayKey);
          shiftMap[shiftKey].combinations += 1;
        }

        shiftMap[shiftKey].production += production;
        shiftMap[shiftKey].machines.add(machine);
        shiftMap[shiftKey].days.add(dateStr);
        shiftMap[shiftKey].entries += 1;
        if (operator && operator !== "Not Available") {
          shiftMap[shiftKey].operators.add(operator);
        }

        if (!machineMap[machineKey]) {
          machineMap[machineKey] = {
            machineName: machine,
            target: 0,
            production: 0,
            shifts: new Set(),
            shiftDays: {},
            days: new Set(),
            entries: 0,
            lastActive: recordDate,
            machineNumber: parseInt(machine.replace(/[^0-9]/g, "")) || 0,
            operators: new Set(),
          };
        } else if (recordDate > machineMap[machineKey].lastActive) {
          machineMap[machineKey].lastActive = recordDate;
        }

        if (!machineMap[machineKey].shiftDays[shift]) {
          machineMap[machineKey].shiftDays[shift] = new Set();
        }

        const shiftDayKey = `${shift}_${dateStr}`;
        if (!machineMap[machineKey].shiftDays[shift].has(shiftDayKey)) {
          machineMap[machineKey].target += target;
          machineMap[machineKey].shiftDays[shift].add(shiftDayKey);
        }

        machineMap[machineKey].production += production;
        machineMap[machineKey].shifts.add(shift);
        machineMap[machineKey].days.add(dateStr);
        machineMap[machineKey].entries += 1;
        if (operator && operator !== "Not Available") {
          machineMap[machineKey].operators.add(operator);
        }

        if (!dailyMap[dayKey]) {
          dailyMap[dayKey] = {
            date: dateStr,
            target: 0,
            production: 0,
            shifts: new Set(),
            machines: new Set(),
            combinations: 0,
            entries: 0,
            operators: new Set(),
          };
        }

        if (!dailyMap[dayKey].combinationsSet) {
          dailyMap[dayKey].combinationsSet = new Set();
        }
        if (!dailyMap[dayKey].combinationsSet.has(combinationKey)) {
          dailyMap[dayKey].target += target;
          dailyMap[dayKey].combinations += 1;
          dailyMap[dayKey].combinationsSet.add(combinationKey);
        }

        dailyMap[dayKey].production += production;
        dailyMap[dayKey].shifts.add(shift);
        dailyMap[dayKey].machines.add(machine);
        dailyMap[dayKey].entries += 1;
        if (operator && operator !== "Not Available") {
          dailyMap[dayKey].operators.add(operator);
        }
      });

      const processedShiftData = Object.values(shiftMap)
        .map((shift) => {
          const efficiency =
            shift.target > 0 ? (shift.production / shift.target) * 100 : 0;
          const machineCount = shift.machines.size;
          const dayCount = shift.days.size;

          let status = "good";
          let statusColor = "#10b981";

          if (efficiency >= 100) {
            status = "excellent";
            statusColor = "#10b981";
          } else if (efficiency >= 80) {
            status = "good";
            statusColor = "#10b981";
          } else if (efficiency >= 60) {
            status = "average";
            statusColor = "#f59e0b";
          } else {
            status = "poor";
            statusColor = "#ef4444";
          }

          const avgTargetPerCombination =
            shift.combinations > 0
              ? (shift.target / shift.combinations).toFixed(0)
              : 0;

          return {
            name: shift.shiftName,
            production: shift.production,
            target: shift.target,
            efficiency: efficiency.toFixed(1),
            machines: [...shift.machines].sort((a, b) => {
              const aNum = parseInt(a.replace(/[^0-9]/g, "")) || 0;
              const bNum = parseInt(b.replace(/[^0-9]/g, "")) || 0;
              return aNum - bNum;
            }),
            operators: [...shift.operators],
            machineCount: machineCount,
            daysCount: dayCount,
            combinationsCount: shift.combinations,
            entries: shift.entries,
            avgTargetPerCombo: avgTargetPerCombination,
            status,
            statusColor,
            icon: getShiftIcon(shift.shiftName),
          };
        })
        .sort((a, b) => {
          const shiftOrder = {
            morning: 1,
            day: 1,
            صبح: 1,
            a: 1,
            evening: 2,
            شام: 2,
            b: 2,
            night: 3,
            رات: 3,
            c: 3,
          };
          const aOrder = shiftOrder[a.name.toLowerCase()] || 99;
          const bOrder = shiftOrder[b.name.toLowerCase()] || 99;
          return aOrder - bOrder;
        });

      const processedDailyData = Object.values(dailyMap)
        .map((day) => {
          const efficiency =
            day.target > 0 ? (day.production / day.target) * 100 : 0;
          const dateObj = new Date(day.date);
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

          return {
            date: day.date,
            formattedDate: dayNames[dateObj.getDay()],
            production: day.production,
            target: day.target,
            efficiency: efficiency.toFixed(1),
            status:
              efficiency >= 100 ? "met" : efficiency >= 80 ? "good" : "not-met",
            shiftsCount: day.shifts.size,
            machinesCount: day.machines.size,
            combinationsCount: day.combinations,
            entriesCount: day.entries,
            operatorsCount: day.operators.size,
          };
        })
        .filter((day) => {
          const dateObj = new Date(day.date);
          return dateObj.getDay() !== 0;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const processedMachineData = Object.values(machineMap)
        .map((machine) => {
          const efficiency =
            machine.target > 0
              ? (machine.production / machine.target) * 100
              : 0;
          const daysSinceActive = machine.lastActive
            ? Math.floor(
                (new Date() - machine.lastActive) / (1000 * 60 * 60 * 24)
              )
            : 999;

          let status = "running";
          let statusColor = "#10b981";

          if (efficiency >= 80) {
            status = "good";
            statusColor = "#10b981";
          } else if (efficiency >= 70) {
            status = "average";
            statusColor = "#f59e0b";
          } else {
            status = "poor";
            statusColor = "#ef4444";
          }

          if (daysSinceActive > 7) {
            status = "down";
            statusColor = "#ef4444";
          } else if (daysSinceActive > 1) {
            status = "idle";
            statusColor = "#f59e0b";
          } else if (machine.production === 0) {
            status = "maintenance";
            statusColor = "#8b5cf6";
          }

          return {
            name: machine.machineName,
            production: machine.production,
            target: machine.target,
            efficiency: efficiency.toFixed(1),
            shifts: [...machine.shifts].sort().join(", "),
            operators: [...machine.operators],
            workingDays: machine.days.size,
            entries: machine.entries,
            status,
            statusColor,
            lastActive: machine.lastActive
              ? machine.lastActive.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "Never",
            machineNumber: machine.machineNumber,
          };
        })
        .sort((a, b) => a.machineNumber - b.machineNumber);

      return {
        dailyData: processedDailyData,
        machineData: processedMachineData,
        shiftData: processedShiftData,
      };
    },
    [date]
  );

  const getShiftIcon = (shiftName) => {
    const name = shiftName?.toLowerCase() || "";
    if (
      name.includes("morning") ||
      name.includes("صبح") ||
      name === "a" ||
      name === "day"
    )
      return <FaSun />;
    if (name.includes("evening") || name.includes("شام") || name === "b")
      return <FaClock />;
    if (
      name.includes("night") ||
      name.includes("رات") ||
      name === "c" ||
      name === "night"
    )
      return <FaMoon />;
    return <FaClock />;
  };

  // Fetch actual production data
  const fetchActualData = useCallback(async () => {
    try {
      setLoading(true);

      if (!supabase || !process.env.REACT_APP_SUPABASE_URL) {
        console.warn("Supabase not configured");
        setIsSupabaseConnected(false);
        setLoading(false);
        return;
      }

      setIsSupabaseConnected(true);
      const dateStr = date.toISOString().split("T")[0];
      const allData = {};

      // Fetch data for all departments
      for (const dept of departments) {
        const { data: productionRecords, error } = await supabase
          .from(dept.tableName)
          .select("*")
          .gte("created_at", `${dateStr}T00:00:00`)
          .lt("created_at", `${dateStr}T23:59:59`)
          .order("created_at", { ascending: false })
          .limit(1000);

        if (error) {
          console.error(`Supabase error for ${dept.name}:`, error);
          allData[dept.name] = {
            dailyData: [],
            machineData: [],
            shiftData: [],
          };
          continue;
        }

        if (!productionRecords || productionRecords.length === 0) {
          console.log(
            `No production records found for ${dept.name} on ${dateStr}`
          );
          allData[dept.name] = {
            dailyData: [],
            machineData: [],
            shiftData: [],
          };
          continue;
        }

        // Calculate data for this department
        const calculatedData = calculateAllDataCorrectly(productionRecords);
        allData[dept.name] = calculatedData;
      }

      setAllDepartmentsData(allData);
      setLastRefresh(new Date());

      // If a specific department is selected, set its data
      if (selectedDepartment !== "all") {
        const selectedDept = departments.find(
          (d) => d.name === selectedDepartment
        );
        if (selectedDept && allData[selectedDept.name]) {
          const deptData = allData[selectedDept.name];
          const formattedData = formatDataForTable(deptData, selectedDept);
          setProductionData(formattedData);
        }
      }
    } catch (error) {
      console.error("Error fetching production data:", error);
      setIsSupabaseConnected(false);
      setAllDepartmentsData({});
      setProductionData([]);
    } finally {
      setLoading(false);
    }
  }, [date, selectedDepartment, departments, calculateAllDataCorrectly]);

  // Format data for table display
  const formatDataForTable = useCallback(
    (deptData, deptInfo) => {
      if (!deptData || !deptInfo) return [];

      const tableData = [];
      const { dailyData, shiftData, machineData } = deptData;

      // Get today's data
      const todayData = dailyData.length > 0 ? dailyData[0] : null;

      if (todayData && shiftData.length > 0) {
        shiftData.forEach((shift) => {
          // Find machines for this shift
          const shiftMachines = machineData.filter((machine) =>
            machine.shifts.includes(shift.name)
          );

          shiftMachines.forEach((machine) => {
            const efficiency = calculateItemEfficiency(
              machine.production,
              machine.target
            );
            const operator =
              machine.operators.length > 0
                ? machine.operators[0]
                : shift.operators.length > 0
                ? shift.operators[0]
                : "Not Available";

            tableData.push({
              id: `${shift.name}_${machine.name}`,
              department: deptInfo.name,
              section: deptInfo.name.replace(" Section", ""),
              shift: shift.name,
              production_quantity: machine.production,
              target_quantity: machine.target,
              quantity_unit: deptInfo.unit,
              date: date.toISOString().split("T")[0],
              operator: operator,
              machine: machine.name,
              status: getMachineStatus(machine),
              efficiency: efficiency,
              entries: machine.entries,
              statusColor: getStatusColor(getMachineStatus(machine)),
            });
          });
        });
      }

      return tableData;
    },
    [date]
  );

  // Get machine status
  const getMachineStatus = useCallback((machine) => {
    const efficiency = parseFloat(machine.efficiency);
    if (efficiency === 0) return "pending";
    if (efficiency >= 100) return "completed";
    if (efficiency >= 80) return "good";
    if (efficiency >= 60) return "in-progress";
    return "maintenance";
  }, []);

  // Get status color
  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "good":
        return "#10b981";
      case "in-progress":
        return "#f59e0b";
      case "pending":
        return "#6b7280";
      case "maintenance":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  }, []);

  // Get status text
  const getStatusText = useCallback((status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "good":
        return "Good";
      case "in-progress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  }, []);

  // Calculate efficiency for individual item
  const calculateItemEfficiency = useCallback((production, target) => {
    if (target === 0) return 0;
    return parseFloat(((production / target) * 100).toFixed(1));
  }, []);

  // Get selected department data
  const getSelectedDepartmentData = useCallback(() => {
    if (selectedDepartment === "all") {
      // Combine all departments data
      const allData = [];
      Object.keys(allDepartmentsData).forEach((deptName) => {
        const dept = departments.find((d) => d.name === deptName);
        if (dept && allDepartmentsData[deptName]) {
          const formattedData = formatDataForTable(
            allDepartmentsData[deptName],
            dept
          );
          allData.push(...formattedData);
        }
      });
      return allData;
    } else {
      return productionData;
    }
  }, [
    selectedDepartment,
    allDepartmentsData,
    productionData,
    departments,
    formatDataForTable,
  ]);

  // Calculate department totals
  const calculateDepartmentTotals = useCallback(
    (deptName) => {
      if (!allDepartmentsData[deptName]) {
        return {
          totalProduction: 0,
          totalTarget: 0,
          efficiency: 0,
          records: 0,
          machines: 0,
          shifts: 0,
          combinations: 0,
          operators: 0,
        };
      }

      const { dailyData, shiftData, machineData } =
        allDepartmentsData[deptName];
      const todayData = dailyData.length > 0 ? dailyData[0] : null;

      if (!todayData) {
        return {
          totalProduction: 0,
          totalTarget: 0,
          efficiency: 0,
          records: 0,
          machines: machineData.length || 0,
          shifts: shiftData.length || 0,
          combinations: 0,
          operators: 0,
        };
      }

      const totalProduction = todayData.production;
      const totalTarget = todayData.target;
      const efficiency =
        totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;

      return {
        totalProduction,
        totalTarget,
        efficiency: parseFloat(efficiency.toFixed(1)),
        records: todayData.entriesCount,
        machines: todayData.machinesCount,
        shifts: todayData.shiftsCount,
        combinations: todayData.combinationsCount,
        operators: todayData.operatorsCount,
      };
    },
    [allDepartmentsData]
  );

  // Calculate overall totals
  const calculateTotals = useCallback(() => {
    if (selectedDepartment === "all") {
      let totalProduction = 0;
      let totalTarget = 0;
      let totalRecords = 0;
      let totalMachines = 0;
      let totalShifts = 0;
      let totalCombinations = 0;
      let totalOperators = 0;

      departments.forEach((dept) => {
        const totals = calculateDepartmentTotals(dept.name);
        totalProduction += totals.totalProduction;
        totalTarget += totals.totalTarget;
        totalRecords += totals.records;
        totalMachines += totals.machines;
        totalShifts += totals.shifts;
        totalCombinations += totals.combinations;
        totalOperators += totals.operators;
      });

      const efficiency =
        totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;

      return {
        totalProduction,
        totalTarget,
        efficiency: parseFloat(efficiency.toFixed(1)),
        records: totalRecords,
        machines: totalMachines,
        shifts: totalShifts,
        combinations: totalCombinations,
        operators: totalOperators,
      };
    } else {
      return calculateDepartmentTotals(selectedDepartment);
    }
  }, [selectedDepartment, departments, calculateDepartmentTotals]);

  // Group data by shift
  const groupByShift = useCallback((data) => {
    const grouped = {};
    data.forEach((item) => {
      if (!grouped[item.shift]) {
        grouped[item.shift] = [];
      }
      grouped[item.shift].push(item);
    });
    return grouped;
  }, []);

  // Format quantity with unit
  const formatQuantity = useCallback((quantity, unit) => {
    return `${quantity.toLocaleString("en-US", {
      minimumFractionDigits: unit === "Meter" ? 1 : 0,
      maximumFractionDigits: unit === "Meter" ? 1 : 0,
    })} ${unit}`;
  }, []);

  // Generate WhatsApp message
  const generateWhatsAppMessage = useCallback(() => {
    const totals = calculateTotals();
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let message = `📊 ${
      selectedDepartment === "all"
        ? "Daily Production Report"
        : selectedDepartment.replace(" Section", "") + " Production Report"
    }\n`;
    message += `📅 Date: ${dateStr}\n`;
    message += `👤 Generated by: Admin\n\n`;

    message += `📈 Overall Summary:\n`;
    message += `* Total Production: ${totals.totalProduction.toLocaleString()} ${
      selectedDepartment === "all"
        ? "Units"
        : getDepartmentInfo(selectedDepartment).unit
    }\n`;
    message += `* Total Target: ${totals.totalTarget.toLocaleString()} ${
      selectedDepartment === "all"
        ? "Units"
        : getDepartmentInfo(selectedDepartment).unit
    }\n`;
    message += `* Average Efficiency: ${totals.efficiency}%\n`;
    message += `* Total Records: ${totals.records}\n\n`;

    // Add shift-wise summary if available
    if (selectedDepartment !== "all") {
      const deptData = allDepartmentsData[selectedDepartment];
      if (deptData && deptData.shiftData.length > 0) {
        message += `🕒 Shift-wise Summary:\n\n`;

        deptData.shiftData.forEach((shift) => {
          const shiftIcon =
            shift.name.toLowerCase().includes("morning") ||
            shift.name.toLowerCase().includes("day") ||
            shift.name === "a"
              ? "☀️"
              : shift.name.toLowerCase().includes("evening")
              ? "🌇"
              : shift.name.toLowerCase().includes("night")
              ? "🌙"
              : "🕒";

          message += `${shiftIcon} ${shift.name} Shift:\n`;
          message += `* Production: ${shift.production.toLocaleString()} ${
            getDepartmentInfo(selectedDepartment).unit
          }\n`;
          message += `* Target: ${shift.target.toLocaleString()} ${
            getDepartmentInfo(selectedDepartment).unit
          }\n`;
          message += `* Efficiency: ${shift.efficiency}%\n`;
          message += `* Records: ${shift.entries}\n\n`;
        });
      }
    }

    message += `📝 Report Summary:\n`;
    message += `* Target Production: ${totals.totalTarget.toLocaleString()} ${
      selectedDepartment === "all"
        ? "Units"
        : getDepartmentInfo(selectedDepartment).unit
    }\n`;
    message += `* Target Efficiency: ${
      totals.efficiency >= 100 ? "✅ Target Met" : "⚠️ Below Target"
    }\n\n`;

    message += `✅ Generated via Production Management System`;

    return message;
  }, [
    date,
    selectedDepartment,
    calculateTotals,
    allDepartmentsData,
    getDepartmentInfo,
  ]);

  // Copy to clipboard
  const copyToClipboard = useCallback(() => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  }, [generateWhatsAppMessage]);

  // Open WhatsApp Desktop
  const openWhatsAppDesktop = useCallback(() => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }, [generateWhatsAppMessage]);

  // Open WhatsApp Group (mobile)
  const openWhatsAppGroup = useCallback(() => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }, [generateWhatsAppMessage]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    fetchActualData();
  }, [fetchActualData]);

  // Print report
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Export to JSON
  const handleExport = useCallback(() => {
    const exportData = {
      reportDate: date.toISOString(),
      selectedDepartment,
      departments: departments.map((dept) => {
        const totals = calculateDepartmentTotals(dept.name);
        return {
          name: dept.name,
          unit: dept.unit,
          tableName: dept.tableName,
          ...totals,
        };
      }),
      overallTotals: calculateTotals(),
      lastRefresh: lastRefresh.toISOString(),
      data: getSelectedDepartmentData(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `production-report-${
      date.toISOString().split("T")[0]
    }.json`;
    link.click();
  }, [
    date,
    selectedDepartment,
    departments,
    calculateDepartmentTotals,
    calculateTotals,
    lastRefresh,
    getSelectedDepartmentData,
  ]);

  // Export to Excel
  const handleExportExcel = useCallback(() => {
    const data = getSelectedDepartmentData();

    // Prepare worksheet data
    const worksheetData = data.map((item) => ({
      Department: item.department,
      Section: item.section,
      Shift: item.shift,
      Machine: item.machine,
      Operator: item.operator,
      Production: item.production_quantity,
      Target: item.target_quantity,
      Unit: item.quantity_unit,
      "Efficiency (%)": item.efficiency,
      Entries: item.entries,
      Status: getStatusText(item.status),
      Date: item.date,
    }));

    // Add summary row
    const totals = calculateTotals();
    worksheetData.push({
      Department: "TOTAL",
      Section: "",
      Shift: "",
      Machine: "",
      Operator: "",
      Production: totals.totalProduction,
      Target: totals.totalTarget,
      Unit: "Total",
      "Efficiency (%)": totals.efficiency,
      Entries: totals.records,
      Status: totals.efficiency >= 100 ? "Met Target" : "Below Target",
      Date: date.toISOString().split("T")[0],
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Production Report");

    // Auto-size columns
    const maxWidth = worksheetData.reduce(
      (w, r) => Math.max(w, r.Department.length),
      10
    );
    worksheet["!cols"] = [{ wch: maxWidth + 2 }];

    XLSX.writeFile(
      workbook,
      `production-report-${date.toISOString().split("T")[0]}.xlsx`
    );
  }, [getSelectedDepartmentData, calculateTotals, date, getStatusText]);

  // Format last refresh time
  const formatLastRefresh = useCallback(() => {
    return lastRefresh.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [lastRefresh]);

  // Handle department change
  const handleDepartmentChange = useCallback(
    (deptName) => {
      setSelectedDepartment(deptName);
      if (deptName !== "all") {
        const selectedDept = departments.find((d) => d.name === deptName);
        if (selectedDept && allDepartmentsData[deptName]) {
          const formattedData = formatDataForTable(
            allDepartmentsData[deptName],
            selectedDept
          );
          setProductionData(formattedData);
        }
      }
    },
    [departments, allDepartmentsData, formatDataForTable]
  );

  // WhatsApp Popup Component
  const WhatsAppPopup = () => {
    if (!showWhatsAppPopup) return null;

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            position: "relative",
            animation: "popupFadeIn 0.3s ease",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setShowWhatsAppPopup(false)}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "none",
              border: "none",
              fontSize: "24px",
              color: "#6b7280",
              cursor: "pointer",
              padding: "5px",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <FaClose />
          </button>

          <h3
            style={{
              margin: "0 0 20px 0",
              color: "#1e293b",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaWhatsapp style={{ color: "#25D366" }} />
            Share Report via WhatsApp
          </h3>

          <div
            style={{
              marginBottom: "25px",
              padding: "15px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              maxHeight: "200px",
              overflowY: "auto",
              fontSize: "14px",
              whiteSpace: "pre-line",
              fontFamily: "monospace",
              lineHeight: "1.6",
            }}
          >
            {generateWhatsAppMessage()}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Copy to Clipboard Button */}
            <button
              onClick={copyToClipboard}
              style={{
                padding: "15px",
                backgroundColor: copiedToClipboard ? "#10b981" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                fontWeight: "600",
                fontSize: "16px",
                transition: "all 0.2s",
                width: "100%",
              }}
              onMouseOver={(e) => {
                if (!copiedToClipboard) {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }
              }}
              onMouseOut={(e) => {
                if (!copiedToClipboard) {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }
              }}
            >
              <FaCopy size={20} />
              {copiedToClipboard
                ? "✓ Copied to Clipboard!"
                : "Copy Text to Clipboard"}
            </button>

            {/* WhatsApp Desktop Button */}
            <button
              onClick={openWhatsAppDesktop}
              style={{
                padding: "15px",
                backgroundColor: "#25D366",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                fontWeight: "600",
                fontSize: "16px",
                transition: "all 0.2s",
                width: "100%",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#128C7E";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#25D366";
              }}
            >
              <FaDesktop size={20} />
              Open WhatsApp Desktop
            </button>

            {/* WhatsApp Group/Mobile Button */}
            <button
              onClick={openWhatsAppGroup}
              style={{
                padding: "15px",
                backgroundColor: "#075E54",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                fontWeight: "600",
                fontSize: "16px",
                transition: "all 0.2s",
                width: "100%",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#054D42";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#075E54";
              }}
            >
              <FaUsers size={20} />
              Share in WhatsApp Group
            </button>
          </div>

          <div
            style={{
              marginTop: "20px",
              fontSize: "12px",
              color: "#6b7280",
              textAlign: "center",
            }}
          >
            <p>✅ WhatsApp Group sharing works on mobile devices</p>
            <p>💻 WhatsApp Desktop requires WhatsApp Web to be logged in</p>
          </div>
        </div>
      </div>
    );
  };

  // Initialize data
  useEffect(() => {
    fetchActualData();
  }, [fetchActualData]);

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "5px solid #e2e8f0",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            marginBottom: "20px",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <h3 style={{ color: "#1e293b", marginBottom: "10px" }}>
          <FaDatabase /> Loading Production Data...
        </h3>
        <p style={{ color: "#64748b" }}>
          Fetching real-time data from all departments for{" "}
          {date.toLocaleDateString()}
        </p>
        <div
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: isSupabaseConnected ? "#d1fae5" : "#fee2e2",
            color: isSupabaseConnected ? "#065f46" : "#991b1b",
            borderRadius: "8px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaDatabase />
          {isSupabaseConnected ? "Connected to Database" : "Connecting..."}
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const filteredData = getSelectedDepartmentData();
  const totals = calculateTotals();
  const shiftGroups = groupByShift(filteredData);
  const allDepartments = departments;

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* WhatsApp Popup */}
      <WhatsAppPopup />

      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 10px 0",
                color: "#1e293b",
                fontSize: "28px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaCalendarAlt style={{ color: "#3b82f6" }} />
              Daily Production Report
              <span
                style={{
                  fontSize: "14px",
                  backgroundColor: isSupabaseConnected ? "#10b981" : "#ef4444",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaDatabase size={12} />
                {isSupabaseConnected ? "Live Data" : "Offline"}
              </span>
            </h1>
            <p
              style={{
                margin: "0",
                color: "#64748b",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaRegCalendarCheck />
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              <span
                style={{
                  color: "#6b7280",
                  marginLeft: "10px",
                  paddingLeft: "10px",
                  borderLeft: "1px solid #d1d5db",
                }}
              >
                <FaRegClock style={{ marginRight: "6px" }} />
                Last refresh: {formatLastRefresh()}
              </span>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                <FaCalendarAlt style={{ marginRight: "6px" }} />
                Date:
              </label>
              <input
                type="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  backgroundColor: "#f9fafb",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#3b82f6")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.borderColor = "#d1d5db")
                }
              />
            </div>
            <button
              onClick={handleRefresh}
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
                transition: "all 0.2s",
                transform: "translateY(0)",
                boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 8px rgba(59, 130, 246, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 4px rgba(59, 130, 246, 0.3)";
              }}
            >
              <FaSyncAlt /> Refresh
            </button>
          </div>
        </div>

        {/* Department Filter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontWeight: "600",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaBuilding />
            Filter by Department:
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleDepartmentChange("all")}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  selectedDepartment === "all" ? "#3b82f6" : "#f3f4f6",
                color: selectedDepartment === "all" ? "white" : "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                transform: "translateY(0)",
                boxShadow:
                  selectedDepartment === "all"
                    ? "0 2px 4px rgba(59, 130, 246, 0.3)"
                    : "none",
              }}
              onMouseOver={(e) => {
                if (selectedDepartment !== "all") {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }
              }}
              onMouseOut={(e) => {
                if (selectedDepartment !== "all") {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <FaSitemap />
              All Departments
            </button>
            {allDepartments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentChange(dept.name)}
                style={{
                  padding: "8px 16px",
                  backgroundColor:
                    selectedDepartment === dept.name ? dept.color : "#f3f4f6",
                  color: selectedDepartment === dept.name ? "white" : "#374151",
                  border: `1px solid ${dept.color}30`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                  transform: "translateY(0)",
                  boxShadow:
                    selectedDepartment === dept.name
                      ? `0 2px 4px ${dept.color}30`
                      : "none",
                }}
                onMouseOver={(e) => {
                  if (selectedDepartment !== dept.name) {
                    e.currentTarget.style.backgroundColor = "#e5e7eb";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 4px rgba(0,0,0,0.1)";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedDepartment !== dept.name) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                {dept.icon}
                {dept.name.replace(" Section", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #3b82f6",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "-20px",
              width: "80px",
              height: "80px",
              backgroundColor: "#3b82f610",
              borderRadius: "50%",
            }}
          ></div>
          <div
            style={{
              color: "#64748b",
              marginBottom: "10px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaIndustry />
            Total Production
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "5px",
            }}
          >
            {totals.totalProduction.toLocaleString("en-US", {
              minimumFractionDigits:
                selectedDepartment === "all"
                  ? 0
                  : getDepartmentInfo(selectedDepartment).unit === "Meter"
                  ? 1
                  : 0,
              maximumFractionDigits:
                selectedDepartment === "all"
                  ? 0
                  : getDepartmentInfo(selectedDepartment).unit === "Meter"
                  ? 1
                  : 0,
            })}
          </div>
          <div style={{ color: "#64748b", fontSize: "12px" }}>
            Across {filteredData.length} records • {totals.machines} machines
          </div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #10b981",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "-20px",
              width: "80px",
              height: "80px",
              backgroundColor: "#10b98110",
              borderRadius: "50%",
            }}
          ></div>
          <div
            style={{
              color: "#64748b",
              marginBottom: "10px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaBullseye />
            Total Target
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "5px",
            }}
          >
            {totals.totalTarget.toLocaleString("en-US", {
              minimumFractionDigits:
                selectedDepartment === "all"
                  ? 0
                  : getDepartmentInfo(selectedDepartment).unit === "Meter"
                  ? 0
                  : 0,
              maximumFractionDigits:
                selectedDepartment === "all"
                  ? 0
                  : getDepartmentInfo(selectedDepartment).unit === "Meter"
                  ? 0
                  : 0,
            })}
          </div>
          <div style={{ color: "#64748b", fontSize: "12px" }}>
            Expected production • {totals.shifts} active shifts
          </div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #f59e0b",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "-20px",
              width: "80px",
              height: "80px",
              backgroundColor: "#f59e0b10",
              borderRadius: "50%",
            }}
          ></div>
          <div
            style={{
              color: "#64748b",
              marginBottom: "10px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaChartLine />
            Efficiency
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color:
                totals.efficiency >= 100
                  ? "#10b981"
                  : totals.efficiency >= 90
                  ? "#f59e0b"
                  : "#ef4444",
              marginBottom: "5px",
            }}
          >
            {totals.efficiency}%
          </div>
          <div style={{ color: "#64748b", fontSize: "12px" }}>
            Production vs Target • {totals.records} total entries
          </div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            borderLeft: "4px solid #8b5cf6",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-20px",
              top: "-20px",
              width: "80px",
              height: "80px",
              backgroundColor: "#8b5cf610",
              borderRadius: "50%",
            }}
          ></div>
          <div
            style={{
              color: "#64748b",
              marginBottom: "10px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaTachometerAlt />
            Avg per Record
          </div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "5px",
            }}
          >
            {filteredData.length > 0
              ? (totals.totalProduction / filteredData.length).toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits:
                      selectedDepartment === "all"
                        ? 0
                        : getDepartmentInfo(selectedDepartment).unit === "Meter"
                        ? 1
                        : 0,
                    maximumFractionDigits:
                      selectedDepartment === "all"
                        ? 0
                        : getDepartmentInfo(selectedDepartment).unit === "Meter"
                        ? 1
                        : 0,
                  }
                )
              : "0"}
          </div>
          <div style={{ color: "#64748b", fontSize: "12px" }}>
            Per production record • {totals.combinations || 0} M-S-D pairs
          </div>
        </div>
      </div>

      {/* Production Details */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaDatabase />
              Production Details
              {selectedDepartment !== "all" && (
                <span
                  style={{
                    fontSize: "14px",
                    backgroundColor:
                      getDepartmentInfo(selectedDepartment).color + "20",
                    color: getDepartmentInfo(selectedDepartment).color,
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {getDepartmentInfo(selectedDepartment).icon}
                  {selectedDepartment}
                </span>
              )}
            </h2>
            <p
              style={{
                margin: "5px 0 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              {selectedDepartment === "all"
                ? "Showing data from all departments"
                : `Unit: ${
                    getDepartmentInfo(selectedDepartment).unit
                  } • Table: ${
                    departments.find((d) => d.name === selectedDepartment)
                      ?.tableName
                  }`}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowWhatsAppPopup(true)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#25D366",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
                transition: "all 0.2s",
                transform: "translateY(0)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#128C7E";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#25D366";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              title="Share report via WhatsApp"
            >
              <FaWhatsapp /> WhatsApp
            </button>

            <button
              onClick={handleExportExcel}
              style={{
                padding: "8px 16px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
                transition: "all 0.2s",
                transform: "translateY(0)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#10b981";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              title="Export to Excel"
            >
              <FaFileExcel /> Excel
            </button>

            <button
              onClick={handleExport}
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
                transition: "all 0.2s",
                transform: "translateY(0)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#3b82f6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FaFileDownload /> JSON
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "600",
                transition: "all 0.2s",
                transform: "translateY(0)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#4b5563";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#6b7280";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <FaPrint /> Print
            </button>
          </div>
        </div>

        {Object.keys(shiftGroups).length > 0 ? (
          Object.keys(shiftGroups).map((shift) => (
            <div key={shift} style={{ marginBottom: "30px" }}>
              <h3
                style={{
                  margin: "0 0 15px 0",
                  color: "#374151",
                  paddingBottom: "10px",
                  borderBottom: "2px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    color: getShiftIcon(shift).props.color || "#6b7280",
                  }}
                >
                  {getShiftIcon(shift)}
                </span>
                Shift: {shift}
              </h3>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                        borderBottom: "2px solid #e5e7eb",
                      }}
                    >
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Section
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Operator
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Machine
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Production
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Target
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Unit
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Efficiency
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Entries
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#1e293b",
                        }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftGroups[shift].map((item, index) => {
                      const deptInfo = getDepartmentInfo(item.department);
                      return (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid #e5e7eb",
                            backgroundColor:
                              index % 2 === 0 ? "#ffffff" : "#f8fafc",
                          }}
                        >
                          <td style={{ padding: "12px" }}>
                            <div>
                              <div
                                style={{
                                  fontWeight: "600",
                                  marginBottom: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                {deptInfo.icon}
                                {item.section}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                  backgroundColor: "#f3f4f6",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                }}
                              >
                                {item.department}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <FaUser style={{ color: "#6b7280" }} />
                              <span
                                style={{
                                  fontWeight:
                                    item.operator === "Not Available"
                                      ? "400"
                                      : "600",
                                  color:
                                    item.operator === "Not Available"
                                      ? "#9ca3af"
                                      : "#374151",
                                }}
                              >
                                {item.operator}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <FaCogs style={{ color: "#6b7280" }} />
                              {item.machine}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              fontWeight: "600",
                              color:
                                item.production_quantity > 0
                                  ? "#1e293b"
                                  : "#ef4444",
                            }}
                          >
                            {formatQuantity(
                              item.production_quantity,
                              item.quantity_unit
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                            }}
                          >
                            {formatQuantity(
                              item.target_quantity,
                              item.quantity_unit
                            )}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                backgroundColor:
                                  item.quantity_unit === "kg"
                                    ? "#dbeafe"
                                    : "#ede9fe",
                                color:
                                  item.quantity_unit === "kg"
                                    ? "#1d4ed8"
                                    : "#7c3aed",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              {item.quantity_unit}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                backgroundColor:
                                  item.efficiency >= 100
                                    ? "#d1fae5"
                                    : item.efficiency >= 90
                                    ? "#fef3c7"
                                    : "#fee2e2",
                                color:
                                  item.efficiency >= 100
                                    ? "#059669"
                                    : item.efficiency >= 90
                                    ? "#d97706"
                                    : "#dc2626",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {item.efficiency >= 100 && (
                                <FaArrowUp size={10} />
                              )}
                              {item.efficiency}%
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                backgroundColor: "#f3f4f6",
                                color: "#374151",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              {item.entries}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                backgroundColor: item.statusColor + "20",
                                color: item.statusColor,
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                              }}
                            >
                              {getStatusText(item.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Shift Summary */}
              {shiftGroups[shift].length > 0 && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "8px",
                    border: "1px solid #bae6fd",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#0369a1",
                          marginBottom: "5px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            color: getShiftIcon(shift).props.color || "#0369a1",
                          }}
                        >
                          {getShiftIcon(shift)}
                        </span>
                        Shift {shift} Summary
                      </div>
                      <div style={{ fontSize: "14px", color: "#64748b" }}>
                        {shiftGroups[shift].length} records in this shift
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>
                        Production:{" "}
                        {shiftGroups[shift]
                          .reduce(
                            (sum, item) => sum + item.production_quantity,
                            0
                          )
                          .toLocaleString()}
                      </div>
                      <div style={{ fontSize: "14px", color: "#64748b" }}>
                        Target:{" "}
                        {shiftGroups[shift]
                          .reduce((sum, item) => sum + item.target_quantity, 0)
                          .toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>
              <FaDatabase />
            </div>
            <h3>No Production Data Found</h3>
            <p>
              Select a different department or date to view production records
            </p>
          </div>
        )}
      </div>

      {/* Department Summary (Only when showing all departments) */}
      {selectedDepartment === "all" && (
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px 0",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <FaSitemap />
            Department-wise Summary
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e5e7eb",
                  }}
                >
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    Department
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    Total Production
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    Total Target
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    Efficiency
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    Records
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    Machines
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    Main Unit
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#1e293b",
                    }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => {
                  const totals = calculateDepartmentTotals(dept.name);
                  const hasData =
                    totals.totalProduction > 0 || totals.totalTarget > 0;

                  return (
                    <tr
                      key={dept.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: dept.color + "20",
                            color: dept.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {dept.icon}
                        </div>
                        {dept.name}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          fontWeight: "600",
                          color:
                            totals.totalProduction > 0 ? "#1e293b" : "#ef4444",
                        }}
                      >
                        {totals.totalProduction.toLocaleString("en-US", {
                          minimumFractionDigits: dept.unit === "Meter" ? 1 : 0,
                          maximumFractionDigits: dept.unit === "Meter" ? 1 : 0,
                        })}
                      </td>
                      // Line 2153 کے قریب کا درست کوڈ
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                        }}
                      >
                        {totals.totalTarget.toLocaleString("en-US", {
                          minimumFractionDigits: dept.unit === "Meter" ? 0 : 0,
                          maximumFractionDigits: dept.unit === "Meter" ? 0 : 0,
                        })}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            backgroundColor:
                              totals.efficiency >= 100
                                ? "#d1fae5"
                                : totals.efficiency >= 90
                                ? "#fef3c7"
                                : "#fee2e2",
                            color:
                              totals.efficiency >= 100
                                ? "#059669"
                                : totals.efficiency >= 90
                                ? "#d97706"
                                : "#dc2626",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {totals.efficiency}%
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        {totals.records}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        {totals.machines}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            backgroundColor:
                              dept.unit === "kg" ? "#dbeafe" : "#ede9fe",
                            color: dept.unit === "kg" ? "#1d4ed8" : "#7c3aed",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {dept.unit}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            backgroundColor: hasData ? "#d1fae5" : "#f3f4f6",
                            color: hasData ? "#059669" : "#6b7280",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {hasData ? "Active" : "No Data"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WhatsApp Configuration */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f0fff4",
          borderRadius: "8px",
          border: "1px solid #a7f3d0",
        }}
      >
        <h4
          style={{
            margin: "0 0 10px 0",
            color: "#065f46",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaWhatsapp /> WhatsApp Settings
        </h4>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontSize: "14px", color: "#374151" }}>
            WhatsApp Number (Optional):
          </label>
          <input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="923001234567"
            style={{
              padding: "8px 12px",
              border: "1px solid #a7f3d0",
              borderRadius: "6px",
              fontSize: "14px",
              backgroundColor: "white",
              flex: 1,
              maxWidth: "200px",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#10b981")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#a7f3d0")}
          />
          <span style={{ fontSize: "12px", color: "#6b7280" }}>
            Format: 923001234567 (Pakistan) • Leave empty for general WhatsApp
            sharing
          </span>
        </div>
      </div>

      {/* Data Source Info */}
      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#f8fafc",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "10px",
              backgroundColor: "#3b82f610",
              color: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FaCalculator size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 10px 0",
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Calculation Method
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "15px",
                fontSize: "14px",
              }}
            >
              <div>
                <strong
                  style={{
                    color: "#374151",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  <FaCheckCircle
                    style={{ marginRight: "6px", color: "#10b981" }}
                  />
                  Target Calculation:
                </strong>
                <span style={{ color: "#6b7280" }}>
                  Per Machine-Shift-Day (Unique Combination)
                </span>
              </div>
              <div>
                <strong
                  style={{
                    color: "#374151",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  <FaCheckCircle
                    style={{ marginRight: "6px", color: "#10b981" }}
                  />
                  Production Calculation:
                </strong>
                <span style={{ color: "#6b7280" }}>Sum of All Entries</span>
              </div>
              <div>
                <strong
                  style={{
                    color: "#374151",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  <FaCheckCircle
                    style={{ marginRight: "6px", color: "#10b981" }}
                  />
                  Machine Efficiency:
                </strong>
                <span style={{ color: "#6b7280" }}>
                  <span style={{ color: "#10b981" }}>≥80% Green</span>,
                  <span style={{ color: "#f59e0b" }}> 70-79% Yellow</span>,
                  <span style={{ color: "#ef4444" }}> &lt;70% Red</span>
                </span>
              </div>
              <div>
                <strong
                  style={{
                    color: "#374151",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  <FaUser style={{ marginRight: "6px", color: "#3b82f6" }} />
                  Operator Data:
                </strong>
                <span style={{ color: "#6b7280" }}>
                  Now showing actual operator names from database
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body {
              background-color: white !important;
              color: black !important;
              font-size: 11pt;
              padding: 0 !important;
            }
            
            button, input, select {
              display: none !important;
            }
            
            div {
              box-shadow: none !important;
              border: 1px solid #ddd !important;
              margin-bottom: 10px !important;
            }
            
            table {
              border: 1px solid #000 !important;
              font-size: 10pt !important;
            }
            
            th, td {
              border: 1px solid #ddd !important;
              padding: 6px !important;
            }
            
            .print-only {
              display: block !important;
            }
            
            @page {
              margin: 0.5in;
            }
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @keyframes popupFadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default DailyProductionReport;
