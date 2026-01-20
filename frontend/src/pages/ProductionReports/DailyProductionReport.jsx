import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaIndustry,
  FaCheckCircle,
  FaChartLine,
  FaDatabase,
  FaCalendarAlt,
  FaCogs,
  FaArrowUp,
  FaArrowDown,
  FaWarehouse,
  FaCut,
  FaBoxOpen,
  FaShieldAlt,
  FaBuilding,
  FaBullseye,
  FaSyncAlt,
  FaSun,
  FaMoon,
  FaClock,
  FaFileDownload,
  FaSitemap,
  FaPrint,
  FaFileExcel,
  FaCopy,
  FaDesktop,
  FaUsers,
  FaTimes as FaClose,
  FaWhatsapp,
  FaUser,
  FaTachometerAlt,
  FaRegCalendarCheck,
  FaRegClock,
  FaCommentAlt,
  FaChevronDown,
  FaWeightHanging,
} from "react-icons/fa";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx";
import styles from "./DailyProductionReport.module.css";

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
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  const departments = useMemo(
    () => [
      {
        id: 1,
        name: "Raw Material Section",
        shortName: "Raw Material",
        icon: <FaWarehouse />,
        color: "#f59e0b",
        tableName: "raw_material_log",
        unit: "KG",
        isRawMaterial: true,
      },
      {
        id: 2,
        name: "Flatting Section",
        shortName: "Flatting",
        icon: <FaIndustry />,
        color: "#3b82f6",
        tableName: "flatteningsection",
        unit: "KG",
        isRawMaterial: false,
      },
      {
        id: 3,
        name: "Spiral Section",
        shortName: "Spiral",
        icon: <FaCogs />,
        color: "#8b5cf6",
        tableName: "spiralsection",
        unit: "Meter",
        isRawMaterial: false,
      },
      {
        id: 4,
        name: "PVC Coating Section",
        shortName: "PVC Coating",
        icon: <FaShieldAlt />,
        color: "#10b981",
        tableName: "pvcsection",
        unit: "Meter",
        isRawMaterial: false,
      },
      {
        id: 5,
        name: "Cutting & Packing Section",
        shortName: "Cutting & Packing",
        icon: <FaCut />,
        color: "#ec4899",
        tableName: "cuttingpacking",
        unit: "Meter",
        isRawMaterial: false,
      },
      {
        id: 6,
        name: "Finishing Goods Section",
        shortName: "Finishing Goods",
        icon: <FaBoxOpen />,
        color: "#06b6d4",
        tableName: "finishinggoods",
        unit: "Meter",
        isRawMaterial: false,
      },
    ],
    []
  );

  // Efficiency functions
  const getEfficiencyColor = useCallback((efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return "#10b981";  // GREEN for 80% and above
    if (eff >= 70) return "#f59e0b";  // YELLOW for 70-79%
    return "#ef4444";                 // RED for below 70%
  }, []);

  const getEfficiencyClass = useCallback((efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return styles.efficiencyHigh;      // 80% اور اوپر - GREEN
    if (eff >= 70) return styles.efficiencyMedium;    // 70-79% - YELLOW
    return styles.efficiencyLow;                      // 70% سے کم - RED
  }, []);

  const getEfficiencyArrow = useCallback((efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 70) {
      return <FaArrowUp className={styles.arrowIndicator} style={{ color: eff >= 80 ? "#10b981" : "#f59e0b" }} />;
    } else {
      return <FaArrowDown className={styles.arrowIndicator} style={{ color: "#ef4444" }} />;
    }
  }, []);

  const getEfficiencyBgColor = useCallback((efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return "#d1fae5";
    if (eff >= 70) return "#fef3c7";
    return "#fee2e2";
  }, []);

  const getDepartmentInfo = useCallback(
    (deptName) => {
      const dept = departments.find((d) => d.name === deptName);
      return {
        icon: dept?.icon || <FaIndustry />,
        color: dept?.color || "#3b82f6",
        unit: dept?.unit || "Unit",
        isRawMaterial: dept?.isRawMaterial || false,
      };
    },
    [departments]
  );

  const getSelectedDepartmentDisplay = useCallback(() => {
    if (selectedDepartment === "all") {
      return {
        name: "All Departments",
        icon: <FaSitemap />,
        color: "#6b7280",
        shortName: "All Departments",
        isRawMaterial: false,
      };
    }
    const dept = departments.find((d) => d.name === selectedDepartment);
    return dept || { 
      name: "All Departments", 
      icon: <FaSitemap />, 
      color: "#6b7280", 
      shortName: "All Departments",
      isRawMaterial: false,
    };
  }, [selectedDepartment, departments]);

  const calculateItemEfficiency = useCallback((production, target) => {
    if (target === 0) return 0;
    return parseFloat(((production / target) * 100).toFixed(1));
  }, []);

  const formatDataForTable = useCallback(
    (deptData, deptInfo) => {
      if (!deptData || !deptInfo) return [];

      const tableData = [];
      const { dailyData, shiftData, machineData } = deptData;

      const todayData = dailyData.length > 0 ? dailyData[0] : null;

      if (todayData && shiftData.length > 0) {
        shiftData.forEach((shift) => {
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
              section: deptInfo.shortName,
              shift: shift.name,
              production_quantity: machine.production,
              target_quantity: machine.target,
              quantity_unit: deptInfo.unit,
              date: date.toISOString().split("T")[0],
              operator: operator,
              machine: machine.name,
              efficiency: efficiency,
              entries: machine.entries,
              remarks: machine.remarks || "No Remarks",
              isRawMaterial: deptInfo.isRawMaterial,
            });
          });
        });
      }

      return tableData;
    },
    [date, calculateItemEfficiency]
  );

  const calculateAllDataCorrectly = useCallback(
    (records, isRawMaterial = false) => {
      const combinationMap = {};
      const shiftMap = {};
      const machineMap = {};
      const dailyMap = {};

      records.forEach((record) => {
        if (!record.created_at) return;

        const recordDate = new Date(record.created_at);
        const dateStr = recordDate.toISOString().split("T")[0];

        const selectedDateStr = date.toISOString().split("T")[0];
        if (dateStr !== selectedDateStr) return;

        const machine =
          record.machine_no || record.machine_id || record.machine || "unknown";
        const shift =
          record.shift_name || record.shift || record.shift_no || "unknown";
        const operator =
          record.operator_name || record.operator || "Not Available";
        
        // RAW MATERIAL کے لیے الگ calculation
        let target, production;
        
        if (isRawMaterial) {
          // Raw Material کے لیے: production = weight, target = target_weight
          production = 
            parseFloat(record.weight) || 
            parseFloat(record.weight_received) || 
            0;
          target = 
            parseFloat(record.target_weight) || 
            parseFloat(record.target_qty) || 
            parseFloat(record.target) || 
            0;
        } else {
          // باقی ڈیپارٹمنٹ کے لیے عام calculation
          target = 
            parseFloat(record.target_qty) || 
            parseFloat(record.target) || 
            0;
          production = 
            parseFloat(record.production_quantity) || 
            parseFloat(record.production) || 
            0;
        }
        
        const remarks = record.remarks || record.comment || "No Remarks";

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
            remarks: remarks,
          };
        }
        
        combinationMap[combinationKey].production += production;
        combinationMap[combinationKey].entries += 1;
        
        combinationMap[combinationKey].operator = operator;
        combinationMap[combinationKey].remarks = remarks;

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

        shiftMap[shiftKey].production += production;
        shiftMap[shiftKey].entries += 1;

        if (!shiftMap[shiftKey].machineDays[machine]) {
          shiftMap[shiftKey].machineDays[machine] = new Set();
        }
        
        const machineDayKey = `${machine}_${dateStr}`;
        if (!shiftMap[shiftKey].machineDays[machine].has(machineDayKey)) {
          shiftMap[shiftKey].target += target;
          shiftMap[shiftKey].machineDays[machine].add(machineDayKey);
          shiftMap[shiftKey].combinations += 1;
        }

        shiftMap[shiftKey].machines.add(machine);
        shiftMap[shiftKey].days.add(dateStr);
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
            remarks: remarks,
          };
        } else if (recordDate > machineMap[machineKey].lastActive) {
          machineMap[machineKey].lastActive = recordDate;
        }

        machineMap[machineKey].production += production;
        machineMap[machineKey].entries += 1;

        if (!machineMap[machineKey].shiftDays[shift]) {
          machineMap[machineKey].shiftDays[shift] = new Set();
        }
        
        const shiftDayKey = `${shift}_${dateStr}`;
        if (!machineMap[machineKey].shiftDays[shift].has(shiftDayKey)) {
          machineMap[machineKey].target += target;
          machineMap[machineKey].shiftDays[shift].add(shiftDayKey);
        }

        machineMap[machineKey].shifts.add(shift);
        machineMap[machineKey].days.add(dateStr);
        if (operator && operator !== "Not Available") {
          machineMap[machineKey].operators.add(operator);
        }
        machineMap[machineKey].remarks = remarks;

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
            combinationSet: new Set(),
          };
        }

        dailyMap[dayKey].production += production;
        dailyMap[dayKey].entries += 1;

        if (!dailyMap[dayKey].combinationSet.has(combinationKey)) {
          dailyMap[dayKey].target += target;
          dailyMap[dayKey].combinations += 1;
          dailyMap[dayKey].combinationSet.add(combinationKey);
        }

        dailyMap[dayKey].shifts.add(shift);
        dailyMap[dayKey].machines.add(machine);
        if (operator && operator !== "Not Available") {
          dailyMap[dayKey].operators.add(operator);
        }
      });

      const processedMachineData = Object.values(combinationMap).map((combo) => {
        const efficiency = calculateItemEfficiency(combo.production, combo.target);
        
        return {
          name: combo.machine,
          production: combo.production,
          target: combo.target,
          efficiency: efficiency.toFixed(1),
          shifts: combo.shift,
          operators: combo.operator ? [combo.operator] : [],
          workingDays: 1,
          entries: combo.entries,
          remarks: combo.remarks,
          lastActive: combo.date,
          machineNumber: parseInt(combo.machine.replace(/[^0-9]/g, "")) || 0,
        };
      });

      const processedShiftData = Object.values(shiftMap)
        .map((shift) => {
          const efficiency = calculateItemEfficiency(shift.production, shift.target);
          const machineCount = shift.machines.size;

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
            daysCount: shift.days.size,
            combinationsCount: shift.combinations,
            entries: shift.entries,
            avgTargetPerCombo: shift.combinations > 0 ? (shift.target / shift.combinations).toFixed(0) : 0,
            icon: getShiftIcon(shift.shiftName),
          };
        })
        .sort((a, b) => {
          const shiftOrder = {
            morning: 1,
            day: 1,
            a: 1,
            evening: 2,
            b: 2,
            night: 3,
            c: 3,
          };
          const aOrder = shiftOrder[a.name.toLowerCase()] || 99;
          const bOrder = shiftOrder[b.name.toLowerCase()] || 99;
          return aOrder - bOrder;
        });

      const processedDailyData = Object.values(dailyMap)
        .map((day) => {
          const efficiency = calculateItemEfficiency(day.production, day.target);
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

      return {
        dailyData: processedDailyData,
        machineData: processedMachineData,
        shiftData: processedShiftData,
      };
    },
    [date, calculateItemEfficiency]
  );

  const getShiftIcon = (shiftName) => {
    const name = shiftName?.toLowerCase() || "";
    if (name.includes("morning") || name === "a" || name === "day")
      return <FaSun />;
    if (name.includes("evening") || name === "b")
      return <FaClock />;
    if (name.includes("night") || name === "c")
      return <FaMoon />;
    return <FaClock />;
  };

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

      for (const dept of departments) {
        let query = supabase
          .from(dept.tableName)
          .select("*")
          .gte("created_at", `${dateStr}T00:00:00`)
          .lt("created_at", `${dateStr}T23:59:59`)
          .order("created_at", { ascending: false });

        const { data: productionRecords, error } = await query.limit(1000);

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
          console.log(`No production records found for ${dept.name} on ${dateStr}`);
          allData[dept.name] = {
            dailyData: [],
            machineData: [],
            shiftData: [],
          };
          continue;
        }

        const calculatedData = calculateAllDataCorrectly(
          productionRecords, 
          dept.isRawMaterial
        );
        allData[dept.name] = calculatedData;
      }

      setAllDepartmentsData(allData);
      setLastRefresh(new Date());

      if (selectedDepartment !== "all") {
        const selectedDept = departments.find(
          (d) => d.name === selectedDepartment
        );
        if (selectedDept && allData[selectedDept.name]) {
          const formattedData = formatDataForTable(
            allData[selectedDept.name],
            selectedDept
          );
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
  }, [date, selectedDepartment, departments, calculateAllDataCorrectly, formatDataForTable]);

  const getSelectedDepartmentData = useCallback(() => {
    if (selectedDepartment === "all") {
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
  }, [selectedDepartment, allDepartmentsData, productionData, departments, formatDataForTable]);

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
          isRawMaterial: departments.find(d => d.name === deptName)?.isRawMaterial || false,
        };
      }

      const { dailyData } = allDepartmentsData[deptName];
      const todayData = dailyData.length > 0 ? dailyData[0] : null;

      if (!todayData) {
        return {
          totalProduction: 0,
          totalTarget: 0,
          efficiency: 0,
          records: 0,
          machines: 0,
          shifts: 0,
          combinations: 0,
          operators: 0,
          isRawMaterial: departments.find(d => d.name === deptName)?.isRawMaterial || false,
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
        isRawMaterial: departments.find(d => d.name === deptName)?.isRawMaterial || false,
      };
    },
    [allDepartmentsData, departments]
  );

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
      const totals = calculateDepartmentTotals(selectedDepartment);
      return totals;
    }
  }, [selectedDepartment, departments, calculateDepartmentTotals]);

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

  const formatQuantity = useCallback((quantity, unit) => {
    return `${quantity.toLocaleString("en-US", {
      minimumFractionDigits: unit === "Meter" ? 1 : 0,
      maximumFractionDigits: unit === "Meter" ? 1 : 0,
    })} ${unit}`;
  }, []);

  const generateWhatsAppMessage = useCallback(() => {
    const totals = calculateTotals();
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const deptInfo = getDepartmentInfo(selectedDepartment);
    const isRawMaterial = deptInfo.isRawMaterial;

    let message = `📊 ${
      selectedDepartment === "all"
        ? "Daily Production Report"
        : selectedDepartment.replace(" Section", "") + (isRawMaterial ? " Weight Report" : " Production Report")
    }\n`;
    message += `📅 Date: ${dateStr}\n`;
    message += `👤 Generated by: Admin\n\n`;

    message += `📈 Overall Summary:\n`;
    message += `* ${isRawMaterial ? "Total Weight Received" : "Total Production"}: ${totals.totalProduction.toLocaleString()} ${
      selectedDepartment === "all"
        ? "Units"
        : deptInfo.unit
    }\n`;
    message += `* ${isRawMaterial ? "Total Target Weight" : "Total Target"}: ${totals.totalTarget.toLocaleString()} ${
      selectedDepartment === "all"
        ? "Units"
        : deptInfo.unit
    }\n`;
    message += `* Average Efficiency: ${totals.efficiency}%\n`;
    message += `* Total Records: ${totals.records}\n\n`;

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
          message += `* ${isRawMaterial ? "Weight Received" : "Production"}: ${shift.production.toLocaleString()} ${
            deptInfo.unit
          }\n`;
          message += `* ${isRawMaterial ? "Target Weight" : "Target"}: ${shift.target.toLocaleString()} ${
            deptInfo.unit
          }\n`;
          message += `* Efficiency: ${shift.efficiency}%\n`;
          message += `* Records: ${shift.entries}\n\n`;
        });
      }
    }

    message += `📝 Report Summary:\n`;
    message += `* ${isRawMaterial ? "Target Weight" : "Target Production"}: ${totals.totalTarget.toLocaleString()} ${
      selectedDepartment === "all"
        ? "Units"
        : deptInfo.unit
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

  const copyToClipboard = useCallback(() => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  }, [generateWhatsAppMessage]);

  const openWhatsAppDesktop = useCallback(() => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }, [generateWhatsAppMessage]);

  const openWhatsAppGroup = useCallback(() => {
    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }, [generateWhatsAppMessage]);

  const handleRefresh = useCallback(() => {
    fetchActualData();
  }, [fetchActualData]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

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
          isRawMaterial: dept.isRawMaterial,
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

  const handleExportExcel = useCallback(() => {
    const data = getSelectedDepartmentData();

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
      Remarks: item.remarks,
      Date: item.date,
    }));

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
      Remarks: "Summary",
      Date: date.toISOString().split("T")[0],
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Production Report");

    const maxWidth = worksheetData.reduce(
      (w, r) => Math.max(w, r.Department.length),
      10
    );
    worksheet["!cols"] = [{ wch: maxWidth + 2 }];

    XLSX.writeFile(
      workbook,
      `production-report-${date.toISOString().split("T")[0]}.xlsx`
    );
  }, [getSelectedDepartmentData, calculateTotals, date]);

  const formatLastRefresh = useCallback(() => {
    return lastRefresh.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [lastRefresh]);

  const handleDepartmentChange = useCallback(
    (deptName) => {
      setSelectedDepartment(deptName);
      setShowDepartmentDropdown(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDepartmentDropdown && !event.target.closest(`.${styles.dropdownWrapper}`)) {
        setShowDepartmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDepartmentDropdown]);

  const WhatsAppPopup = () => {
    if (!showWhatsAppPopup) return null;

    return (
      <div className={styles.popupOverlay} onClick={() => setShowWhatsAppPopup(false)}>
        <div className={styles.popupContainer} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowWhatsAppPopup(false)}
            className={styles.popupClose}
            aria-label="Close popup"
          >
            <FaClose />
          </button>

          <h3 className={styles.popupTitle}>
            <FaWhatsapp style={{ color: "#25D366" }} />
            Share Report via WhatsApp
          </h3>

          <div className={styles.messagePreview}>
            {generateWhatsAppMessage()}
          </div>

          <div className={styles.popupButtons}>
            <button
              onClick={copyToClipboard}
              className={`${styles.popupButton} ${styles.copyButton}`}
              style={{
                backgroundColor: copiedToClipboard ? "#10b981" : "#3b82f6",
                color: "white",
              }}
              aria-label={copiedToClipboard ? "Copied to clipboard" : "Copy to clipboard"}
            >
              <FaCopy size={16} />
              {copiedToClipboard
                ? "✓ Copied to Clipboard!"
                : "Copy Text to Clipboard"}
            </button>

            <button
              onClick={openWhatsAppDesktop}
              className={`${styles.popupButton} ${styles.whatsappDesktopButton}`}
              style={{ backgroundColor: "#25D366", color: "white" }}
              aria-label="Open WhatsApp Desktop"
            >
              <FaDesktop size={16} />
              Open WhatsApp Desktop
            </button>

            <button
              onClick={openWhatsAppGroup}
              className={`${styles.popupButton} ${styles.whatsappGroupButton}`}
              style={{ backgroundColor: "#075E54", color: "white" }}
              aria-label="Share in WhatsApp Group"
            >
              <FaUsers size={16} />
              Share in WhatsApp Group
            </button>
          </div>

          <div className={styles.popupHint}>
            <p>✅ WhatsApp Group sharing works on mobile devices</p>
            <p>💻 WhatsApp Desktop requires WhatsApp Web to be logged in</p>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchActualData();
  }, [fetchActualData]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <h3>
          <FaDatabase /> Loading Production Data...
        </h3>
        <p>
          Fetching real-time data from all departments for{" "}
          {date.toLocaleDateString()}
        </p>
        <div
          className={`${styles.connectionStatus} ${
            isSupabaseConnected ? styles.connected : styles.connecting
          }`}
        >
          <FaDatabase />
          {isSupabaseConnected ? "Connected to Database" : "Connecting..."}
        </div>
      </div>
    );
  }

  const filteredData = getSelectedDepartmentData();
  const totals = calculateTotals();
  const shiftGroups = groupByShift(filteredData);
  const selectedDeptDisplay = getSelectedDepartmentDisplay();
  const deptInfo = getDepartmentInfo(selectedDepartment);
  const isRawMaterial = deptInfo.isRawMaterial;

  return (
    <div className={styles.container}>
      <WhatsAppPopup />

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleText}>
            <h1>
              <FaCalendarAlt className={styles.titleIcon} />
              {isRawMaterial ? "Daily Material Weight Report" : "Daily Production Report"}
              <span
                className={`${styles.statusBadge} ${
                  !isSupabaseConnected && styles.offlineBadge
                }`}
              >
                <FaDatabase size={10} />
                {isSupabaseConnected ? "Live Data" : "Offline"}
              </span>
            </h1>
          </div>
          <div className={styles.dateInfo}>
            <FaRegCalendarCheck className={styles.dateIcon} />
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            <span className={styles.refreshTime}>
              <FaRegClock />
              {formatLastRefresh()}
            </span>
          </div>
          <div className={styles.controls}>
            <div className={styles.dateControl}>
              <label className={styles.dateLabel}>
                <FaCalendarAlt />
                Date:
              </label>
              <input
                type="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                className={styles.dateInput}
                aria-label="Select report date"
              />
            </div>
            <button
              onClick={handleRefresh}
              className={styles.refreshButton}
              aria-label="Refresh data"
            >
              <FaSyncAlt /> Refresh
            </button>
          </div>
        </div>

        <div className={styles.filterContainer}>
          <div className={styles.filterLabel}>
            <FaBuilding className={styles.filterIcon} />
            Select Department:
          </div>
          
          <div className={styles.dropdownWrapper}>
            <button
              onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
              className={styles.dropdownToggle}
              aria-label="Select department"
              aria-expanded={showDepartmentDropdown}
            >
              <div className={styles.selectedOption}>
                <div
                  className={styles.iconWrapper}
                  style={{
                    backgroundColor: selectedDeptDisplay.color + "20",
                    color: selectedDeptDisplay.color,
                  }}
                >
                  {selectedDeptDisplay.icon}
                </div>
                <span className={styles.selectedText}>{selectedDeptDisplay.shortName}</span>
              </div>
              <FaChevronDown 
                className={styles.chevron}
                style={{ 
                  transform: showDepartmentDropdown ? "rotate(180deg)" : "rotate(0deg)"
                }} 
              />
            </button>

            {showDepartmentDropdown && (
              <div className={styles.dropdownMenu} role="listbox">
                <div
                  onClick={() => handleDepartmentChange("all")}
                  className={styles.optionItem}
                  role="option"
                  aria-selected={selectedDepartment === "all"}
                >
                  <div
                    className={styles.optionIcon}
                    style={{
                      backgroundColor: "#6b728020",
                      color: "#6b7280",
                    }}
                  >
                    <FaSitemap size={12} />
                  </div>
                  <div className={styles.optionInfo}>
                    <div className={styles.optionName}>All Departments</div>
                    <div className={styles.optionDetails}>
                      View data from all sections
                    </div>
                  </div>
                </div>

                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    onClick={() => handleDepartmentChange(dept.name)}
                    className={styles.optionItem}
                    role="option"
                    aria-selected={selectedDepartment === dept.name}
                  >
                    <div
                      className={styles.optionIcon}
                      style={{
                        backgroundColor: dept.color + "20",
                        color: dept.color,
                      }}
                    >
                      {dept.icon}
                    </div>
                    <div className={styles.optionInfo}>
                      <div className={styles.optionName}>{dept.shortName}</div>
                      <div className={styles.optionDetails}>
                        {dept.isRawMaterial ? "Material Weight" : "Production"} • Unit: {dept.unit}
                      </div>
                    </div>
                    {selectedDepartment === dept.name && (
                      <div
                        className={styles.selectedIndicator}
                        style={{ backgroundColor: dept.color }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div
          className={styles.summaryCard}
          style={{ borderLeft: "3px solid #3b82f6" }}
        >
          <div className={styles.cardIcon}>
            {isRawMaterial ? <FaWeightHanging /> : <FaIndustry />}
            {isRawMaterial ? "Total Weight Received" : "Total Production"}
          </div>
          <div className={styles.cardValue}>
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
          <div className={styles.cardSubtitle}>
            {filteredData.length} records • {totals.machines} machines
          </div>
        </div>

        <div
          className={styles.summaryCard}
          style={{ borderLeft: "3px solid #10b981" }}
        >
          <div className={styles.cardIcon}>
            <FaBullseye />
            {isRawMaterial ? "Total Target Weight" : "Total Target"}
          </div>
          <div className={styles.cardValue}>
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
          <div className={styles.cardSubtitle}>
            Expected {isRawMaterial ? "weight" : "production"} • {totals.shifts} shifts
          </div>
        </div>

        <div
          className={styles.summaryCard}
          style={{ borderLeft: `3px solid ${getEfficiencyColor(totals.efficiency)}` }}
        >
          <div className={styles.cardIcon}>
            <FaChartLine />
            Efficiency
          </div>
          <div
            className={styles.cardValue}
            style={{ color: getEfficiencyColor(totals.efficiency) }}
          >
            {totals.efficiency}%
          </div>
          <div className={styles.cardSubtitle}>
            {isRawMaterial ? "Weight vs Target" : "Production vs Target"} • {totals.records} entries
          </div>
        </div>

        <div
          className={styles.summaryCard}
          style={{ borderLeft: "3px solid #8b5cf6" }}
        >
          <div className={styles.cardIcon}>
            <FaTachometerAlt />
            Avg per Record
          </div>
          <div className={styles.cardValue}>
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
          <div className={styles.cardSubtitle}>
            Per record • {totals.combinations || 0} combos
          </div>
        </div>
      </div>

      <div className={styles.detailsContainer}>
        <div className={styles.detailsHeader}>
          <div className={styles.detailsTitle}>
            <h2>
              <FaDatabase />
              {isRawMaterial ? "Material Weight Details" : "Production Details"}
              {selectedDepartment !== "all" && (
                <span
                  className={styles.departmentBadge}
                  style={{
                    backgroundColor:
                      getDepartmentInfo(selectedDepartment).color + "20",
                    color: getDepartmentInfo(selectedDepartment).color,
                  }}
                >
                  {getDepartmentInfo(selectedDepartment).icon}
                  {selectedDepartment}
                </span>
              )}
            </h2>
            <p className={styles.detailsSubtitle}>
              {selectedDepartment === "all"
                ? "Showing data from all departments"
                : `${isRawMaterial ? "Material Weight" : "Production"} • Unit: ${
                    getDepartmentInfo(selectedDepartment).unit
                  }`}
            </p>
          </div>

          <div className={styles.actionButtons}>
            <button
              onClick={() => setShowWhatsAppPopup(true)}
              className={`${styles.actionButton} ${styles.whatsappButton}`}
              title="Share report via WhatsApp"
            >
              <FaWhatsapp /> <span>WhatsApp</span>
            </button>

            <button
              onClick={handleExportExcel}
              className={`${styles.actionButton} ${styles.excelButton}`}
              title="Export to Excel"
            >
              <FaFileExcel /> <span>Excel</span>
            </button>

            <button
              onClick={handleExport}
              className={`${styles.actionButton} ${styles.jsonButton}`}
            >
              <FaFileDownload /> <span>JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className={`${styles.actionButton} ${styles.printButton}`}
            >
              <FaPrint /> <span>Print</span>
            </button>
          </div>
        </div>

        {Object.keys(shiftGroups).length > 0 ? (
          Object.keys(shiftGroups).map((shift) => (
            <div key={shift} className={styles.shiftSection}>
              <h3 className={styles.shiftTitle}>
                <span style={{ color: getShiftIcon(shift).props.color || "#6b7280" }}>
                  {getShiftIcon(shift)}
                </span>
                Shift: {shift}
              </h3>

              <div className={styles.tableContainer}>
                <table className={styles.productionTable}>
                  <thead>
                    <tr className={styles.tableHeader}>
                      <th>Section</th>
                      <th>Operator</th>
                      <th>Machine</th>
                      <th style={{ textAlign: "right" }}>
                        {isRawMaterial ? "Weight" : "Production"}
                      </th>
                      <th style={{ textAlign: "right" }}>Target</th>
                      <th style={{ textAlign: "center" }}>Unit</th>
                      <th style={{ textAlign: "center" }}>Efficiency</th>
                      <th style={{ textAlign: "center" }}>Entries</th>
                      <th style={{ textAlign: "center" }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftGroups[shift].map((item) => {
                      const deptInfo = getDepartmentInfo(item.department);
                      
                      return (
                        <tr key={item.id} className={styles.tableRow}>
                          <td className={styles.sectionCell}>
                            <div className={styles.sectionInfo}>
                              {deptInfo.icon}
                              {item.section}
                            </div>
                          </td>
                          <td className={styles.operatorCell}>
                            <div className={styles.operatorInfo}>
                              <FaUser className={styles.infoIcon} />
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
                          <td className={styles.machineCell}>
                            <div className={styles.machineInfo}>
                              <FaCogs className={styles.infoIcon} />
                              {item.machine}
                            </div>
                          </td>
                          <td className={styles.quantityCell}>
                            {formatQuantity(
                              item.production_quantity,
                              item.quantity_unit
                            )}
                          </td>
                          <td className={styles.quantityCell}>
                            {formatQuantity(
                              item.target_quantity,
                              item.quantity_unit
                            )}
                          </td>
                          <td className={styles.centerCell}>
                            <span
                              className={`${styles.quantityBadge} ${
                                item.quantity_unit === "kg" 
                                  ? styles.kgUnit 
                                  : styles.meterUnit
                              }`}
                            >
                              {item.quantity_unit}
                            </span>
                          </td>
                          <td className={styles.centerCell}>
                            <div className={`${styles.efficiencyBadge} ${getEfficiencyClass(item.efficiency)}`}>
                              <span>
                                {getEfficiencyArrow(item.efficiency)}
                                {item.efficiency}%
                              </span>
                            </div>
                          </td>
                          <td className={styles.centerCell}>
                            <span className={styles.entriesBadge}>
                              {item.entries}
                            </span>
                          </td>
                          <td className={styles.remarksCell}>
                            <div className={styles.remarksContent}>
                              <FaCommentAlt className={styles.remarksIcon} title={item.remarks} />
                              <span className={styles.remarksText}>
                                {item.remarks}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {shiftGroups[shift].length > 0 && (
                <div className={styles.shiftSummary}>
                  <div className={styles.shiftSummaryContent}>
                    <div className={styles.shiftSummaryTitle}>
                      <span style={{ color: getShiftIcon(shift).props.color || "#0369a1" }}>
                        {getShiftIcon(shift)}
                      </span>
                      Shift {shift} Summary
                    </div>
                    <div className={styles.shiftSummaryStats}>
                      <div className={styles.shiftSummaryStat}>
                        <div className={styles.statLabel}>
                          {isRawMaterial ? "Weight:" : "Production:"}
                        </div>
                        <div className={styles.statValue}>
                          {shiftGroups[shift]
                            .reduce(
                              (sum, item) => sum + item.production_quantity,
                              0
                            )
                            .toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.shiftSummaryStat}>
                        <div className={styles.statLabel}>Target:</div>
                        <div className={styles.statValue}>
                          {shiftGroups[shift]
                            .reduce((sum, item) => sum + item.target_quantity, 0)
                            .toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noDataMessage}>
            <div className={styles.noDataIcon}>
              <FaDatabase />
            </div>
            <h3>No {isRawMaterial ? "Material Weight" : "Production"} Data Found</h3>
            <p>
              Select a different department or date to view {isRawMaterial ? "material weight" : "production"} records
            </p>
          </div>
        )}
      </div>

      {selectedDepartment === "all" && (
        <div className={styles.departmentSummary}>
          <h2>
            <FaSitemap />
            Department-wise Summary
          </h2>

          <div className={styles.tableContainer}>
            <table className={`${styles.productionTable} ${styles.departmentTable}`}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>Department</th>
                  <th style={{ textAlign: "right" }}>Production / Weight</th>
                  <th style={{ textAlign: "right" }}>Target</th>
                  <th style={{ textAlign: "center" }}>Efficiency</th>
                  <th style={{ textAlign: "center" }}>Records</th>
                  <th style={{ textAlign: "center" }}>Machines</th>
                  <th style={{ textAlign: "center" }}>Main Unit</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => {
                  const totals = calculateDepartmentTotals(dept.name);
                  const hasData =
                    totals.totalProduction > 0 || totals.totalTarget > 0;

                  return (
                    <tr key={dept.id} className={styles.tableRow}>
                      <td className={styles.sectionCell}>
                        <div className={styles.sectionInfo}>
                          <div
                            className={styles.iconWrapper}
                            style={{
                              backgroundColor: dept.color + "20",
                              color: dept.color,
                            }}
                          >
                            {dept.icon}
                          </div>
                          {dept.shortName}
                        </div>
                      </td>
                      <td className={styles.quantityCell}>
                        {totals.totalProduction.toLocaleString("en-US", {
                          minimumFractionDigits: dept.unit === "Meter" ? 1 : 0,
                          maximumFractionDigits: dept.unit === "Meter" ? 1 : 0,
                        })}
                      </td>
                      <td className={styles.quantityCell}>
                        {totals.totalTarget.toLocaleString("en-US", {
                          minimumFractionDigits: dept.unit === "Meter" ? 0 : 0,
                          maximumFractionDigits: dept.unit === "Meter" ? 0 : 0,
                        })}
                      </td>
                      <td className={styles.centerCell}>
                        <div className={`${styles.efficiencyBadge} ${getEfficiencyClass(totals.efficiency)}`}>
                          <span>
                            {getEfficiencyArrow(totals.efficiency)}
                            {totals.efficiency}%
                          </span>
                        </div>
                      </td>
                      <td className={styles.centerCell}>
                        {totals.records}
                      </td>
                      <td className={styles.centerCell}>
                        {totals.machines}
                      </td>
                      <td className={styles.centerCell}>
                        <span
                          className={`${styles.quantityBadge} ${
                            dept.unit === "kg" ? styles.kgUnit : styles.meterUnit
                          }`}
                        >
                          {dept.unit}
                        </span>
                      </td>
                      <td className={styles.centerCell}>
                        <span
                          className={styles.entriesBadge}
                          style={{
                            backgroundColor: hasData ? "#d1fae5" : "#f3f4f6",
                            color: hasData ? "#059669" : "#6b7280",
                            borderColor: hasData ? "#059669" : "#6b7280",
                          }}
                        >
                          {hasData ? (dept.isRawMaterial ? "Receiving" : "Active") : "No Data"}
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

      <div className={styles.whatsappSettings}>
        <h4 className={styles.whatsappTitle}>
          <FaWhatsapp /> WhatsApp Settings
        </h4>
        <div className={styles.whatsappInputContainer}>
          <label className={styles.whatsappLabel}>
            WhatsApp Number (Optional):
          </label>
          <input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="923001234567"
            className={styles.whatsappInput}
          />
        </div>
        <div className={styles.whatsappHint}>
          Format: 923001234567 (Pakistan) • Leave empty for general WhatsApp sharing
        </div>
      </div>

      <div className={styles.dataSourceInfo}>
        <div className={styles.dataSourceContent}>
          <div className={styles.dataSourceIcon}>
            <FaCheckCircle size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
              Calculation Method
            </h4>
            <div className={styles.calculationGrid}>
              <div className={styles.calculationItem}>
                <strong>
                  <FaCheckCircle style={{ marginRight: "4px", color: "#10b981", fontSize: "10px" }} />
                  Target Calculation:
                </strong>
                <span>
                  Per Machine-Shift-Day (Unique Combination) - Counted ONLY ONCE
                </span>
              </div>
              <div className={styles.calculationItem}>
                <strong>
                  <FaCheckCircle style={{ marginRight: "4px", color: "#10b981", fontSize: "10px" }} />
                  {isRawMaterial ? "Weight" : "Production"} Calculation:
                </strong>
                <span>
                  Sum of ALL Entries for each combination
                </span>
              </div>
              <div className={styles.calculationItem}>
                <strong>
                  <FaCheckCircle style={{ marginRight: "4px", color: "#10b981", fontSize: "10px" }} />
                  Efficiency Formula:
                </strong>
                <span>
                  <span style={{ color: "#10b981" }}>≥80% Green</span>,
                  <span style={{ color: "#f59e0b" }}> 70-79% Yellow</span>,
                  <span style={{ color: "#ef4444" }}> &lt;70% Red</span>
                </span>
              </div>
              <div className={styles.calculationItem}>
                <strong>
                  <FaCommentAlt style={{ marginRight: "4px", color: "#3b82f6", fontSize: "10px" }} />
                  Remarks Data:
                </strong>
                <span>
                  Showing actual remarks/comments from database
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyProductionReport;