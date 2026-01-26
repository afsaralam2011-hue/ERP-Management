// src/components/DailyProductionReport/DailyProductionReport.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  FaSearch,
  FaFilter,
  FaBars,
  FaEye,
  FaArrowLeft,
  FaArrowRight,
  FaEllipsisH,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import { supabase } from "../../supabaseClient";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
 import { ThemeContext, useTheme } from '../../contexts/ThemeContext';
import styles from "./DailyProductionReport.module.css";

const DailyProductionReport = () => {
  const { theme } = useTheme();
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [productionData, setProductionData] = useState([]);
  const [allDepartmentsData, setAllDepartmentsData] = useState({});
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [whatsappNumber, setWhatsappNumber] = useState("923001234567");
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showWhatsAppMessage, setShowWhatsAppMessage] = useState(false);
  const [whatsappMessageText, setWhatsappMessageText] = useState("");
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showMobileDepartmentDropdown, setShowMobileDepartmentDropdown] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [tableScrollPosition, setTableScrollPosition] = useState(0);
  const [expandedRemarks, setExpandedRemarks] = useState({});
  const [activeRemarksId, setActiveRemarksId] = useState(null);

  const tableContainerRef = useRef(null);
  const remarksRefs = useRef({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const departments = useMemo(
    () => [
      {
        id: 1,
        name: "Raw Material Section",
        shortName: "Raw Material",
        mobileName: "Raw",
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
        mobileName: "Flat",
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
        mobileName: "Spiral",
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
        mobileName: "PVC",
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
        mobileName: "Cutting",
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
        mobileName: "Finish",
        icon: <FaBoxOpen />,
        color: "#06b6d4",
        tableName: "finishinggoods",
        unit: "Meter",
        isRawMaterial: false,
      },
    ],
    [],
  );

  const getThemeColor = useCallback(
    (lightColor, darkColor) => {
      return theme === "dark" ? darkColor : lightColor;
    },
    [theme],
  );

  const getCardBackground = useCallback(() => {
    return getThemeColor("#ffffff", "#1f2937");
  }, [getThemeColor]);

  const getCardBorder = useCallback(() => {
    return getThemeColor("#e5e7eb", "#374151");
  }, [getThemeColor]);

  const getTextColor = useCallback(() => {
    return getThemeColor("#1f2937", "#f3f4f6");
  }, [getThemeColor]);

  const getMutedTextColor = useCallback(() => {
    return getThemeColor("#6b7280", "#9ca3af");
  }, [getThemeColor]);

  const getTableHeaderBg = useCallback(() => {
    return getThemeColor("#f9fafb", "#111827");
  }, [getThemeColor]);

  const getTableRowBg = useCallback(
    (index) => {
      if (theme === "dark") {
        return index % 2 === 0 ? "#1f2937" : "#111827";
      }
      return index % 2 === 0 ? "#ffffff" : "#f9fafb";
    },
    [theme],
  );

  const getEfficiencyColor = useCallback((efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return "#10b981";
    if (eff >= 70) return "#f59e0b";
    return "#ef4444";
  }, []);

  const getEfficiencyLabel = useCallback((efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return "High";
    if (eff >= 70) return "Average";
    return "Low";
  }, []);

  const getEfficiencyClass = useCallback((efficiency) => {
    const eff = parseFloat(efficiency) || 0;
    if (eff >= 80) return styles.efficiencyHigh;
    if (eff >= 70) return styles.efficiencyMedium;
    return styles.efficiencyLow;
  }, []);

  const getEfficiencyArrow = useCallback(
    (efficiency) => {
      const eff = parseFloat(efficiency) || 0;
      const color = getEfficiencyColor(efficiency);

      const formattedEff = eff.toFixed(2);

      if (eff >= 70) {
        return (
          <span className={styles.efficiencyWithArrow}>
            <FaArrowUp className={styles.arrowIcon} style={{ color }} />
            {formattedEff}%
          </span>
        );
      } else {
        return (
          <span className={styles.efficiencyWithArrow}>
            <FaArrowDown className={styles.arrowIcon} style={{ color }} />
            {formattedEff}%
          </span>
        );
      }
    },
    [getEfficiencyColor],
  );

  const getEfficiencyBgColor = useCallback(
    (efficiency) => {
      const eff = parseFloat(efficiency) || 0;
      if (eff >= 80) return getThemeColor("#d1fae5", "#064e3b");
      if (eff >= 70) return getThemeColor("#fef3c7", "#78350f");
      return getThemeColor("#fee2e2", "#7f1d1d");
    },
    [getThemeColor],
  );

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
    [departments],
  );

  const getSelectedDepartmentDisplay = useCallback(() => {
    if (selectedDepartment === "all") {
      return {
        name: "All Departments",
        icon: <FaSitemap />,
        color: "#6b7280",
        shortName: "All Departments",
        mobileName: "All",
        isRawMaterial: false,
      };
    }
    const dept = departments.find((d) => d.name === selectedDepartment);
    return (
      dept || {
        name: "All Departments",
        icon: <FaSitemap />,
        color: "#6b7280",
        shortName: "All Departments",
        mobileName: "All",
        isRawMaterial: false,
      }
    );
  }, [selectedDepartment, departments]);

  const calculateItemEfficiency = useCallback((production, target) => {
    if (target === 0) return 0;
    return parseFloat(((production / target) * 100).toFixed(2));
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
            machine.shifts.includes(shift.name),
          );

          const sortedMachines = shiftMachines.sort((a, b) => {
            const aNum = parseInt(a.machineId.replace(/[^0-9]/g, "")) || 0;
            const bNum = parseInt(b.machineId.replace(/[^0-9]/g, "")) || 0;
            return aNum - bNum;
          });

          sortedMachines.forEach((machine) => {
            const efficiency = calculateItemEfficiency(
              machine.production,
              machine.target,
            );
            const operator =
              machine.operators.length > 0
                ? machine.operators[0]
                : shift.operators.length > 0
                  ? shift.operators[0]
                  : "Not Available";

            const machineId =
              machine.machineId ||
              machine.machineNumber ||
              machine.name.replace(/[^0-9]/g, "") ||
              "N/A";

            tableData.push({
              id: `${shift.name}_${machine.name}_${Date.now()}_${Math.random()}`,
              department: deptInfo.name,
              section: deptInfo.shortName,
              mobileSection: deptInfo.mobileName || deptInfo.shortName,
              shift: shift.name,
              shiftOrder: getShiftOrder(shift.name),
              production_quantity: machine.production,
              target_quantity: machine.target,
              quantity_unit: deptInfo.unit,
              date: date.toISOString().split("T")[0],
              operator: operator,
              machine: machine.name,
              machineId: machineId,
              machineOrder: parseInt(machineId.replace(/[^0-9]/g, "")) || 0,
              efficiency: efficiency,
              entries: machine.entries,
              remarks: machine.remarks || "No Remarks",
              isRawMaterial: deptInfo.isRawMaterial,
            });
          });
        });
      }

      return tableData.sort((a, b) => {
        if (a.shiftOrder !== b.shiftOrder) {
          return a.shiftOrder - b.shiftOrder;
        }
        return a.machineOrder - b.machineOrder;
      });
    },
    [date, calculateItemEfficiency],
  );

  const getShiftOrder = useCallback((shiftName) => {
    const shift = shiftName.toLowerCase();
    if (shift.includes("morning") || shift === "a" || shift === "day") return 1;
    if (shift.includes("evening") || shift === "b") return 2;
    if (shift.includes("night") || shift === "c") return 3;
    return 99;
  }, []);

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

        let target, production;

        if (isRawMaterial) {
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
          target =
            parseFloat(record.target_qty) || parseFloat(record.target) || 0;
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
            machineId:
              record.machine_id ||
              record.machine_no ||
              machine.replace(/[^0-9]/g, "") ||
              "N/A",
            machineOrder: parseInt(machine.replace(/[^0-9]/g, "")) || 0,
          };
        }

        combinationMap[combinationKey].production += production;
        combinationMap[combinationKey].entries += 1;

        combinationMap[combinationKey].operator = operator;
        combinationMap[combinationKey].remarks = remarks;

        if (!shiftMap[shiftKey]) {
          shiftMap[shiftKey] = {
            shiftName: shift,
            shiftOrder: getShiftOrder(shift),
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
            machineId:
              record.machine_id ||
              record.machine_no ||
              machine.replace(/[^0-9]/g, "") ||
              "N/A",
            machineOrder: parseInt(machine.replace(/[^0-9]/g, "")) || 0,
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

      const processedMachineData = Object.values(combinationMap)
        .map((combo) => {
          const efficiency = calculateItemEfficiency(
            combo.production,
            combo.target,
          );

          return {
            name: combo.machine,
            production: combo.production,
            target: combo.target,
            efficiency: efficiency,
            shifts: combo.shift,
            operators: combo.operator ? [combo.operator] : [],
            workingDays: 1,
            entries: combo.entries,
            remarks: combo.remarks,
            lastActive: combo.date,
            machineNumber: parseInt(combo.machine.replace(/[^0-9]/g, "")) || 0,
            machineId: combo.machineId,
            machineOrder: combo.machineOrder,
          };
        })
        .sort((a, b) => a.machineOrder - b.machineOrder);

      const processedShiftData = Object.values(shiftMap)
        .map((shift) => {
          const efficiency = calculateItemEfficiency(
            shift.production,
            shift.target,
          );
          const machineCount = shift.machines.size;

          const sortedMachines = [...shift.machines].sort((a, b) => {
            const aNum = parseInt(a.replace(/[^0-9]/g, "")) || 0;
            const bNum = parseInt(b.replace(/[^0-9]/g, "")) || 0;
            return aNum - bNum;
          });

          return {
            name: shift.shiftName,
            shiftOrder: shift.shiftOrder,
            production: shift.production,
            target: shift.target,
            efficiency: efficiency,
            machines: sortedMachines,
            operators: [...shift.operators],
            machineCount: machineCount,
            daysCount: shift.days.size,
            combinationsCount: shift.combinations,
            entries: shift.entries,
            avgTargetPerCombo:
              shift.combinations > 0
                ? (shift.target / shift.combinations).toFixed(0)
                : 0,
            icon: getShiftIcon(shift.shiftName),
          };
        })
        .sort((a, b) => a.shiftOrder - b.shiftOrder);

      const processedDailyData = Object.values(dailyMap)
        .map((day) => {
          const efficiency = calculateItemEfficiency(
            day.production,
            day.target,
          );
          const dateObj = new Date(day.date);
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

          return {
            date: day.date,
            formattedDate: dayNames[dateObj.getDay()],
            production: day.production,
            target: day.target,
            efficiency: efficiency,
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
    [date, calculateItemEfficiency, getShiftOrder],
  );

  const getShiftIcon = useCallback((shiftName) => {
    const name = shiftName?.toLowerCase() || "";
    if (name.includes("morning") || name === "a" || name === "day")
      return <FaSun />;
    if (name.includes("evening") || name === "b") return <FaClock />;
    if (name.includes("night") || name === "c") return <FaMoon />;
    return <FaClock />;
  }, []);

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
          console.log(
            `No production records found for ${dept.name} on ${dateStr}`,
          );
          allData[dept.name] = {
            dailyData: [],
            machineData: [],
            shiftData: [],
          };
          continue;
        }

        const calculatedData = calculateAllDataCorrectly(
          productionRecords,
          dept.isRawMaterial,
        );
        allData[dept.name] = calculatedData;
      }

      setAllDepartmentsData(allData);
      setLastRefresh(new Date());

      if (selectedDepartment !== "all") {
        const selectedDept = departments.find(
          (d) => d.name === selectedDepartment,
        );
        if (selectedDept && allData[selectedDept.name]) {
          const formattedData = formatDataForTable(
            allData[selectedDept.name],
            selectedDept,
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
  }, [
    date,
    selectedDepartment,
    departments,
    calculateAllDataCorrectly,
    formatDataForTable,
  ]);

  const getSelectedDepartmentData = useCallback(() => {
    if (selectedDepartment === "all") {
      const allData = [];
      Object.keys(allDepartmentsData).forEach((deptName) => {
        const dept = departments.find((d) => d.name === deptName);
        if (dept && allDepartmentsData[deptName]) {
          const formattedData = formatDataForTable(
            allDepartmentsData[deptName],
            dept,
          );
          allData.push(...formattedData);
        }
      });

      return allData.sort((a, b) => {
        if (a.shiftOrder !== b.shiftOrder) {
          return a.shiftOrder - b.shiftOrder;
        }
        if (a.section !== b.section) {
          const deptOrder = {
            "Raw Material": 1,
            Flatting: 2,
            Spiral: 3,
            "PVC Coating": 4,
            "Cutting & Packing": 5,
            "Finishing Goods": 6,
          };
          return (deptOrder[a.section] || 99) - (deptOrder[b.section] || 99);
        }
        return a.machineOrder - b.machineOrder;
      });
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
          isRawMaterial:
            departments.find((d) => d.name === deptName)?.isRawMaterial ||
            false,
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
          isRawMaterial:
            departments.find((d) => d.name === deptName)?.isRawMaterial ||
            false,
        };
      }

      const totalProduction = todayData.production;
      const totalTarget = todayData.target;
      const efficiency = calculateItemEfficiency(totalProduction, totalTarget);

      return {
        totalProduction,
        totalTarget,
        efficiency: efficiency,
        records: todayData.entriesCount,
        machines: todayData.machinesCount,
        shifts: todayData.shiftsCount,
        combinations: todayData.combinationsCount,
        operators: todayData.operatorsCount,
        isRawMaterial:
          departments.find((d) => d.name === deptName)?.isRawMaterial || false,
      };
    },
    [allDepartmentsData, departments, calculateItemEfficiency],
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

      const efficiency = calculateItemEfficiency(totalProduction, totalTarget);

      return {
        totalProduction,
        totalTarget,
        efficiency: efficiency,
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
  }, [
    selectedDepartment,
    departments,
    calculateDepartmentTotals,
    calculateItemEfficiency,
  ]);

  const groupByShift = useCallback((data) => {
    const grouped = {};
    const sortedShifts = {};

    const shiftOrder = {
      A: 1,
      a: 1,
      morning: 1,
      day: 1,
      B: 2,
      b: 2,
      evening: 2,
      C: 3,
      c: 3,
      night: 3,
    };

    data.forEach((item) => {
      if (!grouped[item.shift]) {
        grouped[item.shift] = [];
        sortedShifts[item.shift] = shiftOrder[item.shift.toLowerCase()] || 99;
      }
      grouped[item.shift].push(item);
    });

    const sortedGrouped = {};
    Object.keys(grouped)
      .sort((a, b) => {
        const aOrder = shiftOrder[a.toLowerCase()] || 99;
        const bOrder = shiftOrder[b.toLowerCase()] || 99;
        return aOrder - bOrder;
      })
      .forEach((shift) => {
        sortedGrouped[shift] = grouped[shift];
        sortedGrouped[shift].sort((a, b) => a.machineOrder - b.machineOrder);
      });

    return sortedGrouped;
  }, []);

  const formatQuantity = useCallback((quantity, unit) => {
    return `${quantity.toLocaleString("en-US", {
      minimumFractionDigits: unit === "Meter" ? 1 : 0,
      maximumFractionDigits: unit === "Meter" ? 1 : 0,
    })} ${unit}`;
  }, []);

  const calculateShiftEfficiency = useCallback(
    (shiftItems) => {
      const totalProduction = shiftItems.reduce(
        (sum, item) => sum + item.production_quantity,
        0,
      );
      const totalTarget = shiftItems.reduce(
        (sum, item) => sum + item.target_quantity,
        0,
      );
      return calculateItemEfficiency(totalProduction, totalTarget);
    },
    [calculateItemEfficiency],
  );

  // 🔥 WhatsApp Message Generation - EXACT format you requested
  const generateWhatsAppMessage = useCallback(() => {
    const totals = calculateTotals();
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const isAllDepartments = selectedDepartment === "all";
    
    let message = `📊 Daily Production Report\n`;
    message += `📅 Date: ${dateStr}\n`;
    message += `👤 Generated by: Admin\n\n`;

    // Overall Summary - EXACT format
    message += `📈 Overall Summary:\n`;
    message += `* Total Production: ${totals.totalProduction.toLocaleString()} Units\n`;
    message += `* Total Target: ${totals.totalTarget.toLocaleString()} Units\n`;
    message += `* Average Efficiency: ${totals.efficiency.toFixed(2)}%\n`;
    message += `* Total Records: ${totals.records}\n\n`;

    // Department-wise Summary (Only for All Departments)
    if (isAllDepartments) {
      message += `📝 Department-wise Summary:\n\n`;

      departments.forEach((dept) => {
        const deptData = allDepartmentsData[dept.name];
        if (deptData && deptData.shiftData.length > 0) {
          const deptTotals = calculateDepartmentTotals(dept.name);

          if (deptTotals.totalProduction > 0) {
            // Use department emoji based on name - EXACT format you want
            const deptEmoji = dept.name.includes("Flatting")
              ? "⚙️"
              : dept.name.includes("Spiral")
                ? "🌀"
                : dept.name.includes("PVC")
                  ? "🛡️"
                  : dept.name.includes("Cutting")
                    ? "✂️"
                    : dept.name.includes("Finishing")
                      ? "📦"
                      : dept.name.includes("Raw")
                        ? "🏭"
                        : "✅";

            message += `${deptEmoji} ${dept.shortName} Department\n`;

            // Sort shifts in C, B, A order - EXACT format from your example
            const sortedShifts = [...deptData.shiftData].sort((a, b) => {
              const getShiftOrder = (shiftName) => {
                const name = shiftName.toLowerCase();
                if (name.includes("c") || name.includes("night")) return 1;
                if (name.includes("b") || name.includes("evening")) return 2;
                if (
                  name.includes("a") ||
                  name.includes("morning") ||
                  name.includes("day")
                )
                  return 3;
                return 99;
              };
              return getShiftOrder(a.name) - getShiftOrder(b.name);
            });

            // Add shift-wise data - EXACT format with C, B, A order
            sortedShifts.forEach((shift) => {
              let shiftLetter = "A";
              const shiftName = shift.name.toLowerCase();
              if (shiftName.includes("c") || shiftName.includes("night"))
                shiftLetter = "C";
              else if (shiftName.includes("b") || shiftName.includes("evening"))
                shiftLetter = "B";
              else if (
                shiftName.includes("a") ||
                shiftName.includes("morning") ||
                shiftName.includes("day")
              )
                shiftLetter = "A";

              // If it's Spiral department, use "Night Shift" and "Day Shift"
              if (dept.name.includes("Spiral")) {
                if (shiftName.includes("night")) {
                  message += `* Night Shift: ${shift.production.toLocaleString()} ${dept.unit}\n`;
                } else if (shiftName.includes("day")) {
                  message += `* Day Shift: ${shift.production.toLocaleString()} ${dept.unit}\n`;
                } else {
                  message += `* Shift ${shiftLetter}: ${shift.production.toLocaleString()} ${dept.unit}\n`;
                }
              } else {
                message += `* Shift ${shiftLetter}: ${shift.production.toLocaleString()} ${dept.unit}\n`;
              }
            });

            // Add department totals - EXACT format
            message += `* Total Production: ${deptTotals.totalProduction.toLocaleString()} ${dept.unit}\n`;
            message += `* Total Target: ${deptTotals.totalTarget.toLocaleString()} ${dept.unit}\n`;
            message += `* Average Efficiency: ${deptTotals.efficiency.toFixed(2)}%\n\n`;
          }
        }
      });
    } else {
      // Single department selected
      const deptData = allDepartmentsData[selectedDepartment];
      const deptTotals = calculateDepartmentTotals(selectedDepartment);
      const deptInfo = getDepartmentInfo(selectedDepartment);

      if (deptData && deptData.shiftData.length > 0) {
        message += `📝 ${deptInfo.shortName} Department Summary:\n\n`;

        const sortedShifts = [...deptData.shiftData].sort((a, b) => {
          const getShiftOrder = (shiftName) => {
            const name = shiftName.toLowerCase();
            if (name.includes("c") || name.includes("night")) return 1;
            if (name.includes("b") || name.includes("evening")) return 2;
            if (
              name.includes("a") ||
              name.includes("morning") ||
              name.includes("day")
            )
              return 3;
            return 99;
          };
          return getShiftOrder(a.name) - getShiftOrder(b.name);
        });

        sortedShifts.forEach((shift) => {
          let shiftLetter = "A";
          const shiftName = shift.name.toLowerCase();
          if (shiftName.includes("c") || shiftName.includes("night"))
            shiftLetter = "C";
          else if (shiftName.includes("b") || shiftName.includes("evening"))
            shiftLetter = "B";
          else if (
            shiftName.includes("a") ||
            shiftName.includes("morning") ||
            shiftName.includes("day")
          )
            shiftLetter = "A";

          if (selectedDepartment.includes("Spiral")) {
            if (shiftName.includes("night")) {
              message += `* Night Shift: ${shift.production.toLocaleString()} ${deptInfo.unit}\n`;
            } else if (shiftName.includes("day")) {
              message += `* Day Shift: ${shift.production.toLocaleString()} ${deptInfo.unit}\n`;
            } else {
              message += `* Shift ${shiftLetter}: ${shift.production.toLocaleString()} ${deptInfo.unit}\n`;
            }
          } else {
            message += `* Shift ${shiftLetter}: ${shift.production.toLocaleString()} ${deptInfo.unit}\n`;
          }
        });

        message += `* Total Production: ${deptTotals.totalProduction.toLocaleString()} ${deptInfo.unit}\n`;
        message += `* Total Target: ${deptTotals.totalTarget.toLocaleString()} ${deptInfo.unit}\n`;
        message += `* Average Efficiency: ${deptTotals.efficiency.toFixed(2)}%\n\n`;
      }
    }

    // Report Summary - EXACT format
    message += `📝 Report Summary:\n`;
    message += `* Target Production: ${totals.totalTarget.toLocaleString()} ${isAllDepartments ? "Units" : ""}\n`;

    const efficiencyStatus =
      totals.efficiency >= 100 ? "✅ Target Met" : "⚠️ Below Target";
    message += `* Target Efficiency: ${efficiencyStatus}\n\n`;

    message += `✅ Generated via Production Management System`;

    return message;
  }, [
    date,
    selectedDepartment,
    calculateTotals,
    allDepartmentsData,
    departments,
    calculateDepartmentTotals,
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

  const previewWhatsAppMessage = useCallback(() => {
    const message = generateWhatsAppMessage();
    setWhatsappMessageText(message);
    setShowWhatsAppMessage(true);
  }, [generateWhatsAppMessage]);

  const closeWhatsAppMessage = useCallback(() => {
    setShowWhatsAppMessage(false);
  }, []);

  const handlePrintReport = useCallback(() => {
    const totals = calculateTotals();
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const data = getSelectedDepartmentData();
    const selectedDeptDisplay = getSelectedDepartmentDisplay();
    const deptInfo = getDepartmentInfo(selectedDepartment);
    
    const printWindow = window.open("", "_blank");
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Production Report - ${dateStr}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
          }
          .summary-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 30px 0;
          }
          .summary-card {
            flex: 1;
            min-width: 200px;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            background: white;
            border: 1px solid #e5e7eb;
          }
          .card-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .card-value {
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0;
          }
          .card-unit {
            font-size: 14px;
            color: #666;
            margin-left: 5px;
          }
          .efficiency-card {
            background-color: ${getEfficiencyColor(totals.efficiency)}10;
            border-left: 4px solid ${getEfficiencyColor(totals.efficiency)};
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
          }
          th {
            background-color: #f8f9fa;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
            font-weight: bold;
            color: #374151;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .efficiency-cell {
            font-weight: bold;
            text-align: center;
            border-radius: 20px;
            padding: 4px 8px;
            display: inline-block;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .print-buttons {
            margin-top: 20px;
            text-align: center;
          }
          .print-btn {
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 0 5px;
            font-size: 14px;
          }
          .print-btn:hover {
            background: #2563eb;
          }
          .close-btn {
            background: #6b7280;
          }
          .close-btn:hover {
            background: #4b5563;
          }
          @media print {
            body { margin: 0; }
            .print-buttons { display: none; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Production Report</h1>
          <div style="font-size: 18px; margin: 10px 0;">
            ${dateStr}
          </div>
          <div style="font-size: 16px;">
            Department: ${selectedDepartment === "all" ? "All Departments" : selectedDepartment}
          </div>
        </div>

        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-title">Total Production</div>
            <div class="card-value">${totals.totalProduction.toLocaleString()}
              <span class="card-unit">${selectedDepartment === "all" ? "" : deptInfo.unit}</span>
            </div>
            <div style="color: #666;">${data.length} records</div>
          </div>
          
          <div class="summary-card">
            <div class="card-title">Target</div>
            <div class="card-value">${totals.totalTarget.toLocaleString()}
              <span class="card-unit">${selectedDepartment === "all" ? "" : deptInfo.unit}</span>
            </div>
            <div style="color: #666;">Expected production</div>
          </div>
          
          <div class="summary-card efficiency-card">
            <div class="card-title">Efficiency</div>
            <div class="card-value" style="color: ${getEfficiencyColor(totals.efficiency)};">
              ${totals.efficiency.toFixed(2)}%
            </div>
            <div style="color: #666;">${getEfficiencyLabel(totals.efficiency)}</div>
          </div>

          <div class="summary-card">
            <div class="card-title">Summary</div>
            <div style="font-size: 16px; margin: 10px 0;">
              Machines: ${totals.machines}<br>
              Shifts: ${totals.shifts}<br>
              Operators: ${totals.operators}
            </div>
          </div>
        </div>

        <h3>Production Details</h3>
        <table>
          <thead>
            <tr>
              <th>Shift</th>
              <th>Section</th>
              <th>Machine</th>
              <th>Operator</th>
              <th>Production</th>
              <th>Target</th>
              <th>Efficiency</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.slice(0, 50).forEach((item) => {
      const effColor = getEfficiencyColor(item.efficiency);
      htmlContent += `
        <tr>
          <td>${item.shift}</td>
          <td>${item.section}</td>
          <td>${item.machineId || "N/A"}</td>
          <td>${item.operator}</td>
          <td>${item.production_quantity.toLocaleString()}</td>
          <td>${item.target_quantity.toLocaleString()}</td>
          <td>
            <span class="efficiency-cell" style="background-color: ${effColor}20; color: ${effColor};">
              ${item.efficiency.toFixed(2)}%
            </span>
          </td>
          <td>${item.remarks.length > 30 ? item.remarks.substring(0, 30) + "..." : item.remarks}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Total Records: ${data.length} | Total Machines: ${totals.machines} | Total Shifts: ${Object.keys(groupByShift(data)).length}</p>
          <p>Production Management System - Pakistan Wire Industries</p>
        </div>

        <div class="print-buttons">
          <button onclick="window.print()" class="print-btn">
            Print Report
          </button>
          <button onclick="window.close()" class="print-btn close-btn">
            Close Window
          </button>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, [date, selectedDepartment, calculateTotals, getSelectedDepartmentData, groupByShift, getEfficiencyColor, getEfficiencyLabel]);

  const generatePDF = useCallback(() => {
    const doc = new jsPDF();
    const totals = calculateTotals();
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const deptInfo = getDepartmentInfo(selectedDepartment);

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Daily Production Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${dateStr}`, 14, 30);
    doc.text(
      `Department: ${selectedDepartment === "all" ? "All Departments" : selectedDepartment}`,
      14,
      37,
    );

    const summaryData = [
      ["Metric", "Value"],
      ["Total Production", `${totals.totalProduction.toLocaleString()}`],
      ["Total Target", `${totals.totalTarget.toLocaleString()}`],
      ["Efficiency", `${totals.efficiency.toFixed(2)}%`],
      ["Records", totals.records],
      ["Machines", totals.machines],
      ["Shifts", totals.shifts],
      ["Operators", totals.operators],
    ];

    autoTable(doc, {
      head: [summaryData[0]],
      body: summaryData.slice(1),
      startY: 45,
      theme: "striped",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: "left",
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 248, 255],
      },
      margin: { left: 10, right: 14 },
    });

    let startY = doc.lastAutoTable.finalY + 10;

    if (selectedDepartment === "all") {
      doc.setFontSize(14);
      doc.text("Department-wise Summary", 14, startY);
      startY += 10;

      const departmentSummaryData = departments.map((dept) => {
        const deptTotals = calculateDepartmentTotals(dept.name);
        return [
          dept.shortName,
          deptTotals.totalProduction.toLocaleString(),
          deptTotals.totalTarget.toLocaleString(),
          `${deptTotals.efficiency.toFixed(2)}%`,
          deptTotals.machines.toString(),
          deptTotals.shifts.toString(),
          deptTotals.records.toString(),
        ];
      });

      departmentSummaryData.push([
        "TOTAL",
        totals.totalProduction.toLocaleString(),
        totals.totalTarget.toLocaleString(),
        `${totals.efficiency.toFixed(2)}%`,
        totals.machines.toString(),
        totals.shifts.toString(),
        totals.records.toString(),
      ]);

      autoTable(doc, {
        head: [
          [
            "Department",
            "Production",
            "Target",
            "Efficiency",
            "Machines",
            "Shifts",
            "Records",
          ],
        ],
        body: departmentSummaryData,
        startY: startY,
        theme: "striped",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 40, halign: "left" },
          1: { cellWidth: 25, halign: "right" },
          2: { cellWidth: 25, halign: "right" },
          3: { cellWidth: 25, halign: "center" },
          4: { cellWidth: 25, halign: "center" },
          5: { cellWidth: 20, halign: "center" },
          6: { cellWidth: 20, halign: "center" },
        },
        margin: { left: 5, right: 14 },
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Machine-wise Summary - All Departments", 14, 20);
      doc.setFontSize(10);
      doc.text(`Date: ${dateStr}`, 14, 28);

      let allMachineData = [];
      let currentY = 35;

      departments.forEach((dept) => {
        const deptData = allDepartmentsData[dept.name];
        if (deptData && deptData.machineData.length > 0) {
          allMachineData.push([
            {
              content: dept.shortName,
              colSpan: 7,
              styles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: "bold",
                halign: "left",
                fontSize: 10,
            },
            },
          ]);

          const machineSummary = {};

          deptData.machineData.forEach((machine) => {
            const machineId = machine.machineId || machine.name;
            if (!machineSummary[machineId]) {
              machineSummary[machineId] = {
                machineId: machineId,
                production: 0,
                target: 0,
                entries: 0,
                operators: new Set(),
              };
            }

            machineSummary[machineId].production += machine.production;
            machineSummary[machineId].target += machine.target;
            machineSummary[machineId].entries += machine.entries;

            if (machine.operators && machine.operators.length > 0) {
              machine.operators.forEach((operator) => {
                machineSummary[machineId].operators.add(operator);
              });
            }
          });

          const sortedMachineIds = Object.keys(machineSummary).sort((a, b) => {
            const aNum = parseInt(a.replace(/[^0-9]/g, "")) || 0;
            const bNum = parseInt(b.replace(/[^0-9]/g, "")) || 0;
            return aNum - bNum;
          });

          sortedMachineIds.forEach((machineId) => {
            const machine = machineSummary[machineId];
            const efficiency =
              machine.target > 0
                ? (machine.production / machine.target) * 100
                : 0;

            allMachineData.push([
              machineId,
              machine.production.toLocaleString(),
              machine.target.toLocaleString(),
              `${efficiency.toFixed(2)}%`,
              machine.entries.toString(),
              Array.from(machine.operators).slice(0, 2).join(", ") || "N/A",
              "",
            ]);
          });

          const deptProduction = Object.values(machineSummary).reduce(
            (sum, machine) => sum + machine.production,
            0,
          );
          const deptTarget = Object.values(machineSummary).reduce(
            (sum, machine) => sum + machine.target,
            0,
          );
          const deptEfficiency =
            deptTarget > 0 ? (deptProduction / deptTarget) * 100 : 0;

          allMachineData.push([
            {
              content: `${dept.shortName} Total`,
              colSpan: 2,
              styles: {
                fontStyle: "bold",
                fillColor: [245, 245, 245],
                textColor: [0, 0, 0],
              },
            },
            deptProduction.toLocaleString(),
            deptTarget.toLocaleString(),
            `${deptEfficiency.toFixed(2)}%`,
            Object.values(machineSummary)
              .reduce((sum, machine) => sum + machine.entries, 0)
              .toString(),
            {
              content: "-",
              colSpan: 2,
              styles: { halign: "center", textColor: [0, 0, 0] },
            },
          ]);

          allMachineData.push([{ content: "", colSpan: 7 }]);
        }
      });

      const totalProduction = departments.reduce((sum, dept) => {
        const deptData = allDepartmentsData[dept.name];
        if (deptData && deptData.machineData.length > 0) {
          const machineSummary = {};
          deptData.machineData.forEach((machine) => {
            const machineId = machine.machineId || machine.name;
            if (!machineSummary[machineId]) {
              machineSummary[machineId] = {
                production: 0,
                target: 0,
                entries: 0,
              };
            }
            machineSummary[machineId].production += machine.production;
            machineSummary[machineId].target += machine.target;
            machineSummary[machineId].entries += machine.entries;
          });
          return (
            sum +
            Object.values(machineSummary).reduce((s, m) => s + m.production, 0)
          );
        }
        return sum;
      }, 0);

      const totalTarget = departments.reduce((sum, dept) => {
        const deptData = allDepartmentsData[dept.name];
        if (deptData && deptData.machineData.length > 0) {
          const machineSummary = {};
          deptData.machineData.forEach((machine) => {
            const machineId = machine.machineId || machine.name;
            if (!machineSummary[machineId]) {
              machineSummary[machineId] = {
                production: 0,
                target: 0,
                entries: 0,
              };
            }
            machineSummary[machineId].production += machine.production;
            machineSummary[machineId].target += machine.target;
            machineSummary[machineId].entries += machine.entries;
          });
          return (
            sum +
            Object.values(machineSummary).reduce((s, m) => s + m.target, 0)
          );
        }
        return sum;
      }, 0);

      const totalEfficiency =
        totalTarget > 0 ? (totalProduction / totalTarget) * 100 : 0;

      if (
        allMachineData.length > 0 &&
        allMachineData[allMachineData.length - 1][0].content === ""
      ) {
        allMachineData.pop();
      }

      allMachineData.push([
        {
          content: "GRAND TOTAL",
          colSpan: 2,
          styles: {
            fontStyle: "bold",
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
          },
        },
        totalProduction.toLocaleString(),
        totalTarget.toLocaleString(),
        `${totalEfficiency.toFixed(2)}%`,
        departments
          .reduce((sum, dept) => {
            const deptData = allDepartmentsData[dept.name];
            if (deptData && deptData.machineData.length > 0) {
              const machineSummary = {};
              deptData.machineData.forEach((machine) => {
                const machineId = machine.machineId || machine.name;
                if (!machineSummary[machineId]) {
                  machineSummary[machineId] = {
                    production: 0,
                    target: 0,
                    entries: 0,
                  };
                }
                machineSummary[machineId].entries += machine.entries;
              });
              return (
                sum +
                Object.values(machineSummary).reduce((s, m) => s + m.entries, 0)
              );
            }
            return sum;
          }, 0)
          .toString(),
        {
          content: "-",
          colSpan: 2,
          styles: { halign: "center", textColor: [0, 0, 0] },
        },
      ]);

      autoTable(doc, {
        head: [
          [
            "Machine ID",
            "Production",
            "Target",
            "Efficiency",
            "Entries",
            "Operators",
            "",
          ],
        ],
        body: allMachineData,
        startY: currentY,
        theme: "plain",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          halign: "center",
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 25, halign: "center" },
          1: { cellWidth: 25, halign: "right" },
          2: { cellWidth: 25, halign: "right" },
          3: { cellWidth: 25, halign: "center" },
          4: { cellWidth: 20, halign: "center" },
          5: { cellWidth: 30, halign: "left" },
          6: { cellWidth: 10, halign: "center" },
        },
        margin: { left: 10, right: 10 },
        didParseCell: function (data) {
          const currentRow = allMachineData[data.row.index];

          if (currentRow && currentRow[0] && currentRow[0].colSpan) {
            data.cell.styles.textColor = [0, 0, 0];
            if (currentRow[0].content === "GRAND TOTAL") {
              data.cell.styles.fillColor = [220, 220, 220];
              data.cell.styles.fontStyle = "bold";
            } else if (
              currentRow[0].content &&
              currentRow[0].content.includes("Total")
            ) {
              data.cell.styles.fillColor = [245, 245, 245];
              data.cell.styles.fontStyle = "bold";
            } else if (
              currentRow[0].content &&
              !currentRow[0].content.includes("Total")
            ) {
              data.cell.styles.fillColor = [240, 240, 240];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.halign = "left";
            }
          }
        },
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Shift-wise Summary - All Departments", 14, 20);
      doc.setFontSize(10);
      doc.text(`Date: ${dateStr}`, 14, 28);

      let allShiftData = [];
      let shiftY = 35;

      departments.forEach((dept) => {
        const deptData = allDepartmentsData[dept.name];
        if (deptData && deptData.shiftData.length > 0) {
          allShiftData.push([
            {
              content: dept.shortName,
              colSpan: 6,
              styles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: "bold",
                halign: "left",
                fontSize: 10,
              },
            },
          ]);

          deptData.shiftData.forEach((shift) => {
            allShiftData.push([
              shift.name,
              shift.production.toLocaleString(),
              shift.target.toLocaleString(),
              `${shift.efficiency.toFixed(2)}%`,
              shift.machineCount.toString(),
              shift.entries.toString(),
            ]);
          });

          const shiftProduction = deptData.shiftData.reduce(
            (sum, shift) => sum + shift.production,
            0,
          );
          const shiftTarget = deptData.shiftData.reduce(
            (sum, shift) => sum + shift.target,
            0,
          );
          const shiftEfficiency =
            shiftTarget > 0 ? (shiftProduction / shiftTarget) * 100 : 0;

          allShiftData.push([
            {
              content: `${dept.shortName} Total`,
              colSpan: 1,
              styles: {
                fontStyle: "bold",
                fillColor: [245, 245, 245],
                textColor: [0, 0, 0],
              },
            },
            shiftProduction.toLocaleString(),
            shiftTarget.toLocaleString(),
            `${shiftEfficiency.toFixed(2)}%`,
            deptData.shiftData
              .reduce((sum, shift) => sum + shift.machineCount, 0)
              .toString(),
            deptData.shiftData
              .reduce((sum, shift) => sum + shift.entries, 0)
              .toString(),
          ]);

          allShiftData.push([{ content: "", colSpan: 6 }]);
        }
      });

      const totalShiftProduction = departments.reduce((sum, dept) => {
        const deptData = allDepartmentsData[dept.name];
        if (deptData && deptData.shiftData.length > 0) {
          return (
            sum +
            deptData.shiftData.reduce((s, shift) => s + shift.production, 0)
          );
        }
        return sum;
      }, 0);

      const totalShiftTarget = departments.reduce((sum, dept) => {
        const deptData = allDepartmentsData[dept.name];
        if (deptData && deptData.shiftData.length > 0) {
          return (
            sum + deptData.shiftData.reduce((s, shift) => s + shift.target, 0)
          );
        }
        return sum;
      }, 0);

      const totalShiftEfficiency =
        totalShiftTarget > 0
          ? (totalShiftProduction / totalShiftTarget) * 100
          : 0;

      if (
        allShiftData.length > 0 &&
        allShiftData[allShiftData.length - 1][0].content === ""
      ) {
        allShiftData.pop();
      }

      allShiftData.push([
        {
          content: "GRAND TOTAL",
          colSpan: 1,
          styles: {
            fontStyle: "bold",
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
          },
        },
        totalShiftProduction.toLocaleString(),
        totalShiftTarget.toLocaleString(),
        `${totalShiftEfficiency.toFixed(2)}%`,
        departments
          .reduce((sum, dept) => {
            const deptData = allDepartmentsData[dept.name];
            if (deptData && deptData.shiftData.length > 0) {
              return (
                sum +
                deptData.shiftData.reduce(
                  (s, shift) => s + shift.machineCount,
                  0,
                )
              );
            }
            return sum;
          }, 0)
          .toString(),
        departments
          .reduce((sum, dept) => {
            const deptData = allDepartmentsData[dept.name];
            if (deptData && deptData.shiftData.length > 0) {
              return (
                sum +
                deptData.shiftData.reduce((s, shift) => s + shift.entries, 0)
              );
            }
            return sum;
          }, 0)
          .toString(),
      ]);

      autoTable(doc, {
        head: [
          [
            "Shift",
            "Production",
            "Target",
            "Efficiency",
            "Machines",
            "Records",
          ],
        ],
        body: allShiftData,
        startY: shiftY,
        theme: "plain",
        styles: {
          fontSize: 8,
          cellPadding: 2,
          halign: "center",
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [236, 72, 153],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 25, halign: "center" },
          1: { cellWidth: 25, halign: "right" },
          2: { cellWidth: 25, halign: "right" },
          3: { cellWidth: 25, halign: "center" },
          4: { cellWidth: 20, halign: "center" },
          5: { cellWidth: 20, halign: "center" },
        },
        margin: { left: 10, right: 10 },
        didParseCell: function (data) {
          const currentRow = allShiftData[data.row.index];

          if (currentRow && currentRow[0] && currentRow[0].colSpan) {
            data.cell.styles.textColor = [0, 0, 0];
            if (currentRow[0].content === "GRAND TOTAL") {
              data.cell.styles.fillColor = [220, 220, 220];
              data.cell.styles.fontStyle = "bold";
            } else if (
              currentRow[0].content &&
              currentRow[0].content.includes("Total")
            ) {
              data.cell.styles.fillColor = [245, 245, 245];
              data.cell.styles.fontStyle = "bold";
            } else if (
              currentRow[0].content &&
              !currentRow[0].content.includes("Total")
            ) {
              data.cell.styles.fillColor = [240, 240, 240];
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.halign = "left";
            }
          }
        },
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Detailed Production Records", 14, 20);
      doc.setFontSize(10);
      doc.text(`Date: ${dateStr}`, 14, 28);
      doc.text("All Departments", 14, 34);

      const productionData = getSelectedDepartmentData();
      if (productionData.length > 0) {
        const detailedData = productionData.map((item) => {
          return [
            item.section,
            item.shift,
            item.machineId || item.machine,
            item.operator,
            item.production_quantity.toLocaleString(),
            item.target_quantity.toLocaleString(),
            `${item.efficiency.toFixed(2)}%`,
            item.quantity_unit,
            item.entries,
            item.remarks.length > 15
              ? item.remarks.substring(0, 15) + "..."
              : item.remarks,
          ];
        });

        autoTable(doc, {
          head: [
            [
              "Section",
              "Shift",
              "Machine ID",
              "Operator",
              "Production",
              "Target",
              "Efficiency",
              "Unit",
              "Entries",
              "Remarks",
            ],
          ],
          body: detailedData,
          startY: 40,
          theme: "grid",
          styles: {
            fontSize: 7,
            cellPadding: 1.5,
            overflow: "linebreak",
            cellWidth: "wrap",
            textColor: [0, 0, 0],
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 8,
          },
          columnStyles: {
            0: { cellWidth: 25, halign: "left" },
            1: { cellWidth: 15, halign: "center" },
            2: { cellWidth: 20, halign: "center" },
            3: { cellWidth: 25, halign: "left" },
            4: { cellWidth: 20, halign: "right" },
            5: { cellWidth: 15, halign: "right" },
            6: { cellWidth: 15, halign: "center" },
            7: { cellWidth: 12, halign: "center" },
            8: { cellWidth: 12, halign: "center" },
            9: { cellWidth: 25, halign: "left" },
          },
          margin: { left: 5, right: 14 },
          pageBreak: "auto",
        });
      }
    } else {
      const selectedDept = departments.find(
        (d) => d.name === selectedDepartment,
      );
      const deptData = allDepartmentsData[selectedDepartment];

      if (selectedDept && deptData) {
        if (deptData.machineData.length > 0) {
          doc.addPage();
          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text(`${selectedDept.shortName} - Machine-wise Summary`, 14, 20);
          doc.setFontSize(10);
          doc.text(`Date: ${dateStr}`, 14, 28);

          const machineSummary = {};

          deptData.machineData.forEach((machine) => {
            const machineId = machine.machineId || machine.name;
            if (!machineSummary[machineId]) {
              machineSummary[machineId] = {
                machineId: machineId,
                production: 0,
                target: 0,
                entries: 0,
                operators: new Set(),
              };
            }

            machineSummary[machineId].production += machine.production;
            machineSummary[machineId].target += machine.target;
            machineSummary[machineId].entries += machine.entries;

            if (machine.operators && machine.operators.length > 0) {
              machine.operators.forEach((operator) => {
                machineSummary[machineId].operators.add(operator);
              });
            }
          });

          const sortedMachineIds = Object.keys(machineSummary).sort((a, b) => {
            const aNum = parseInt(a.replace(/[^0-9]/g, "")) || 0;
            const bNum = parseInt(b.replace(/[^0-9]/g, "")) || 0;
            return aNum - bNum;
          });

          const machineSummaryData = sortedMachineIds.map((machineId) => {
            const machine = machineSummary[machineId];
            const efficiency =
              machine.target > 0
                ? (machine.production / machine.target) * 100
                : 0;

            return [
              machineId,
              machine.production.toLocaleString(),
              machine.target.toLocaleString(),
              `${efficiency.toFixed(2)}%`,
              machine.entries.toString(),
              Array.from(machine.operators).slice(0, 3).join(", ") || "N/A",
            ];
          });

          const deptProduction = Object.values(machineSummary).reduce(
            (sum, machine) => sum + machine.production,
            0,
          );
          const deptTarget = Object.values(machineSummary).reduce(
            (sum, machine) => sum + machine.target,
            0,
          );
          const deptEfficiency =
            deptTarget > 0 ? (deptProduction / deptTarget) * 100 : 0;

          machineSummaryData.push([
            "TOTAL",
            deptProduction.toLocaleString(),
            deptTarget.toLocaleString(),
            `${deptEfficiency.toFixed(2)}%`,
            Object.values(machineSummary)
              .reduce((sum, machine) => sum + machine.entries, 0)
              .toString(),
            "-",
          ]);

          autoTable(doc, {
            head: [
              [
                "Machine ID",
                "Production",
                "Target",
                "Efficiency",
                "Entries",
                "Operators",
              ],
            ],
            body: machineSummaryData,
            startY: 35,
            theme: "grid",
            styles: {
              fontSize: 9,
              cellPadding: 3,
              halign: "center",
              textColor: [0, 0, 0],
            },
            headStyles: {
              fillColor: [139, 92, 246],
              textColor: 255,
              fontStyle: "bold",
            },
            columnStyles: {
              0: { cellWidth: 30, halign: "center" },
              1: { cellWidth: 30, halign: "right" },
              2: { cellWidth: 30, halign: "right" },
              3: { cellWidth: 25, halign: "center" },
              4: { cellWidth: 20, halign: "center" },
              5: { cellWidth: 35, halign: "left" },
            },
            margin: { left: 5, right: 14 },
          });
        }

        if (deptData.shiftData.length > 0) {
          doc.addPage();
          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text(`${selectedDept.shortName} - Shift-wise Summary`, 14, 20);
          doc.setFontSize(10);
          doc.text(`Date: ${dateStr}`, 14, 28);

          const shiftSummaryData = deptData.shiftData.map((shift) => {
            return [
              shift.name,
              shift.production.toLocaleString(),
              shift.target.toLocaleString(),
              `${shift.efficiency.toFixed(2)}%`,
              shift.machineCount.toString(),
              shift.entries.toString(),
            ];
          });

          const shiftProduction = deptData.shiftData.reduce(
            (sum, shift) => sum + shift.production,
            0,
          );
          const shiftTarget = deptData.shiftData.reduce(
            (sum, shift) => sum + shift.target,
            0,
          );
          const shiftEfficiency =
            shiftTarget > 0 ? (shiftProduction / shiftTarget) * 100 : 0;

          shiftSummaryData.push([
            "TOTAL",
            shiftProduction.toLocaleString(),
            shiftTarget.toLocaleString(),
            `${shiftEfficiency.toFixed(2)}%`,
            deptData.shiftData
              .reduce((sum, shift) => sum + shift.machineCount, 0)
              .toString(),
            deptData.shiftData
              .reduce((sum, shift) => sum + shift.entries, 0)
              .toString(),
          ]);

          autoTable(doc, {
            head: [
              [
                "Shift",
                "Production",
                "Target",
                "Efficiency",
                "Machines",
                "Records",
              ],
            ],
            body: shiftSummaryData,
            startY: 35,
            theme: "striped",
            styles: {
              fontSize: 9,
              cellPadding: 3,
              halign: "center",
              textColor: [0, 0, 0],
            },
            headStyles: {
              fillColor: [236, 72, 153],
              textColor: 255,
              fontStyle: "bold",
            },
            columnStyles: {
              0: { cellWidth: 30, halign: "center" },
              1: { cellWidth: 35, halign: "right" },
              2: { cellWidth: 35, halign: "right" },
              3: { cellWidth: 30, halign: "center" },
              4: { cellWidth: 25, halign: "center" },
              5: { cellWidth: 25, halign: "center" },
            },
            margin: { left: 5, right: 14 },
          });
        }

        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("Detailed Production Records", 14, 20);
        doc.setFontSize(10);
        doc.text(`Date: ${dateStr}`, 14, 28);
        doc.text(`Department: ${selectedDept.shortName}`, 14, 34);

        const productionData = getSelectedDepartmentData();
        if (productionData.length > 0) {
          const detailedData = productionData.map((item) => {
            return [
              item.section,
              item.shift,
              item.machineId || item.machine,
              item.operator,
              item.production_quantity.toLocaleString(),
              item.target_quantity.toLocaleString(),
              `${item.efficiency.toFixed(2)}%`,
              item.quantity_unit,
              item.entries,
              item.remarks.length > 15
                ? item.remarks.substring(0, 15) + "..."
                : item.remarks,
            ];
          });

          autoTable(doc, {
            head: [
              [
                "Section",
                "Shift",
                "Machine ID",
                "Operator",
                "Production",
                "Target",
                "Efficiency",
                "Unit",
                "Entries",
                "Remarks",
              ],
            ],
            body: detailedData,
            startY: 40,
            theme: "grid",
            styles: {
              fontSize: 7,
              cellPadding: 1.5,
              overflow: "linebreak",
              cellWidth: "wrap",
              textColor: [0, 0, 0],
            },
            headStyles: {
              fillColor: [59, 130, 246],
              textColor: 255,
              fontStyle: "bold",
              fontSize: 8,
            },
            columnStyles: {
              0: { cellWidth: 25, halign: "left" },
              1: { cellWidth: 15, halign: "center" },
              2: { cellWidth: 20, halign: "center" },
              3: { cellWidth: 25, halign: "left" },
              4: { cellWidth: 20, halign: "right" },
              5: { cellWidth: 15, halign: "right" },
              6: { cellWidth: 15, halign: "center" },
              7: { cellWidth: 12, halign: "center" },
              8: { cellWidth: 12, halign: "center" },
              9: { cellWidth: 25, halign: "left" },
            },
            margin: { left: 5, right: 14 },
            pageBreak: "auto",
          });
        }
      }
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 10,
        { align: "right" },
      );
    }

    doc.save(
      `production-report-${date.toISOString().split("T")[0]}-${selectedDepartment.replace(/\s+/g, "-").toLowerCase()}.pdf`,
    );
  }, [
    date,
    selectedDepartment,
    calculateTotals,
    getSelectedDepartmentData,
    allDepartmentsData,
    departments,
    calculateDepartmentTotals,
    getDepartmentInfo,
  ]);

  const handleExportReport = useCallback(() => {
    const totals = calculateTotals();
    const dateStr = date.toISOString().split("T")[0];
    const deptInfo = getDepartmentInfo(selectedDepartment);
    
    const csvContent = [
      ["Daily Production Report", date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })],
      ["Generated by: Admin"],
      [],
      ["SUMMARY"],
      ["Total Production:", totals.totalProduction],
      ["Total Target:", totals.totalTarget],
      ["Average Efficiency:", `${totals.efficiency.toFixed(2)}%`],
      ["Total Records:", totals.records],
      ["Total Machines:", totals.machines],
      ["Total Shifts:", totals.shifts],
      ["Total Operators:", totals.operators],
      [],
      ["PRODUCTION DETAILS"],
      ["Shift", "Section", "Machine ID", "Operator", "Production", "Target", "Efficiency", "Unit", "Remarks"],
    ];

    const data = getSelectedDepartmentData();
    data.forEach((item) => {
      csvContent.push([
        item.shift,
        item.section,
        item.machineId || "N/A",
        item.operator,
        item.production_quantity,
        item.target_quantity,
        `${item.efficiency.toFixed(2)}%`,
        item.quantity_unit,
        item.remarks,
      ]);
    });

    csvContent.push([
      "TOTAL",
      selectedDepartment === "all" ? "All Departments" : selectedDepartment,
      "",
      "",
      totals.totalProduction,
      totals.totalTarget,
      `${totals.efficiency.toFixed(2)}%`,
      "Total",
      "Report Summary",
    ]);

    const blob = new Blob([csvContent.map(row => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `production-report-${dateStr}-${selectedDepartment.replace(/\s+/g, "-").toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [date, selectedDepartment, calculateTotals, getSelectedDepartmentData, getDepartmentInfo]);

  const handleExportExcel = useCallback(() => {
    const data = getSelectedDepartmentData();
    const totals = calculateTotals();

    const worksheetData = data.map((item) => ({
      Department: item.department,
      Section: item.section,
      Shift: item.shift,
      "Machine ID": item.machineId || item.machine,
      Operator: item.operator,
      Production: item.production_quantity,
      Target: item.target_quantity,
      Unit: item.quantity_unit,
      "Efficiency (%)": item.efficiency.toFixed(2),
      Entries: item.entries,
      Remarks: item.remarks,
      Date: item.date,
    }));

    worksheetData.push({
      Department: "TOTAL",
      Section: "",
      Shift: "",
      "Machine ID": "",
      Operator: "",
      Production: totals.totalProduction,
      Target: totals.totalTarget,
      Unit: "Total",
      "Efficiency (%)": totals.efficiency.toFixed(2),
      Entries: totals.records,
      Remarks: "Summary",
      Date: date.toISOString().split("T")[0],
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Production Report");

    const maxWidth = worksheetData.reduce(
      (w, r) => Math.max(w, r.Department.length),
      10,
    );
    worksheet["!cols"] = [{ wch: maxWidth + 2 }];

    XLSX.writeFile(
      workbook,
      `production-report-${date.toISOString().split("T")[0]}.xlsx`,
    );
  }, [getSelectedDepartmentData, calculateTotals, date]);

  const handleRefresh = useCallback(() => {
    fetchActualData();
  }, [fetchActualData]);

  const handleExportPDF = useCallback(() => {
    generatePDF();
  }, [generatePDF]);

  const handleDepartmentChange = useCallback(
    (deptName) => {
      setSelectedDepartment(deptName);
      setShowDepartmentDropdown(false);
      setShowMobileDepartmentDropdown(false);
      setShowMobileFilters(false);
      if (deptName !== "all") {
        const selectedDept = departments.find((d) => d.name === deptName);
        if (selectedDept && allDepartmentsData[deptName]) {
          const formattedData = formatDataForTable(
            allDepartmentsData[deptName],
            selectedDept,
          );
          setProductionData(formattedData);
        }
      }
    },
    [departments, allDepartmentsData, formatDataForTable],
  );

  const scrollTableLeft = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
      setTableScrollPosition(tableContainerRef.current.scrollLeft - 200);
    }
  }, []);

  const scrollTableRight = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
      setTableScrollPosition(tableContainerRef.current.scrollLeft + 200);
    }
  }, []);

  // 🔥 Improved toggleRemarks function for mobile and desktop
  const toggleRemarks = useCallback((itemId, e) => {
    if (e) e.stopPropagation();
    
    // Close any currently open remarks popup
    if (activeRemarksId === itemId) {
      setActiveRemarksId(null);
    } else {
      setActiveRemarksId(itemId);
    }
    
    // Also toggle expandedRemarks for the inline view
    setExpandedRemarks((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, [activeRemarksId]);

  // Close remarks popup when clicking outside
  const closeRemarksPopup = useCallback(() => {
    setActiveRemarksId(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDepartmentDropdown &&
        !event.target.closest(`.${styles.dropdownWrapper}`)
      ) {
        setShowDepartmentDropdown(false);
      }
      if (
        showMobileDepartmentDropdown &&
        !event.target.closest(`.${styles.mobileDepartmentDropdown}`)
      ) {
        setShowMobileDepartmentDropdown(false);
      }
      
      // Close remarks popup when clicking outside
      if (
        activeRemarksId &&
        !event.target.closest(`.${styles.remarksPopupContainer}`) &&
        !event.target.closest(`.${styles.remarksToggle}`)
      ) {
        setActiveRemarksId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showDepartmentDropdown, showMobileDepartmentDropdown, activeRemarksId]);

  useEffect(() => {
    fetchActualData();
  }, [fetchActualData]);

  // 🔥 WhatsApp Modal Component - Fixed version
  const WhatsAppModal = () => {
    if (!showWhatsAppModal) return null;

    const totals = calculateTotals();
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const deptInfo = getDepartmentInfo(selectedDepartment);
    const message = generateWhatsAppMessage();

    const sendReportViaWhatsApp = () => {
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
      setShowWhatsAppModal(false);
    };

    return (
      <div 
        className={styles.whatsappModalOverlay}
        style={{
          backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.5)",
        }}
        onClick={() => setShowWhatsAppModal(false)}
      >
        <div 
          className={styles.whatsappModalContainer}
          style={{
            backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
            color: theme === "dark" ? "#f3f4f6" : "#1f2937",
            borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.whatsappModalHeader}>
            <h3 style={{ 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              color: theme === "dark" ? "#f3f4f6" : "#1f2937",
            }}>
              <FaWhatsapp style={{ color: '#25D366' }} />
              Send Report via WhatsApp
            </h3>
            <button
              onClick={() => setShowWhatsAppModal(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: theme === "dark" ? "#9ca3af" : "#666"
              }}
            >
              ×
            </button>
          </div>

          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: theme === "dark" ? "#111827" : "#f8f9fa",
            borderRadius: '10px',
          }}>
            <FaWhatsapp size={48} style={{ color: '#25D366' }} />
            <h4 style={{ 
              color: theme === "dark" ? "#f3f4f6" : "#1f2937",
              margin: '10px 0 5px 0'
            }}>
              Send to WhatsApp Desktop
            </h4>
            <p style={{ 
              color: theme === "dark" ? "#9ca3af" : "#666",
              margin: 0
            }}>
              Report will open in WhatsApp Desktop.
            </p>
          </div>

          <div className={styles.whatsappOptions}>
            <div className={styles.optionsRow}>
              <button
                onClick={sendReportViaWhatsApp}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                <FaWhatsapp /> WhatsApp Desktop
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(message);
                  setCopiedToClipboard(true);
                  setTimeout(() => setCopiedToClipboard(false), 2000);
                }}
                style={{
                  padding: '12px 20px',
                  backgroundColor: copiedToClipboard ? '#10b981' : (theme === "dark" ? "#3b82f6" : "#2563eb"),
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                <FaCopy /> {copiedToClipboard ? 'Copied!' : 'Copy Message'}
              </button>

              <button
                onClick={() => setShowWhatsAppModal(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: theme === "dark" ? "#4b5563" : "#6b7280",
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                <FaClose /> Close
              </button>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: theme === "dark" ? "#111827" : "#f8f9fa",
            borderRadius: '10px',
            border: `1px solid ${theme === "dark" ? "#374151" : "#ddd"}`,
          }}>
            <h4 style={{ 
              marginBottom: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: theme === "dark" ? "#f3f4f6" : "#1f2937",
            }}>
              <FaEye /> Message Preview
            </h4>
            <div style={{
              maxHeight: '200px',
              overflow: 'auto',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              padding: '10px',
              backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
              borderRadius: '5px',
              border: `1px solid ${theme === "dark" ? "#374151" : "#ddd"}`,
              color: theme === "dark" ? "#f3f4f6" : "#1f2937",
              fontFamily: 'monospace',
            }}>
              {message}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔥 WhatsApp Message Viewer Component
  const WhatsAppMessageViewer = () => {
    if (!showWhatsAppMessage) return null;

    return (
      <div
        className={styles.messageViewerOverlay}
        onClick={closeWhatsAppMessage}
      >
        <div
          className={styles.messageViewerContainer}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: getThemeColor("#ffffff", "#1f2937"),
          }}
        >
          <div
            className={styles.messageViewerHeader}
            style={{
              borderBottomColor: getCardBorder(),
            }}
          >
            <h3
              className={styles.messageViewerTitle}
              style={{ color: getTextColor() }}
            >
              <FaWhatsapp style={{ color: "#25D366" }} />
              WhatsApp Message Preview
            </h3>
            <button
              onClick={closeWhatsAppMessage}
              className={styles.messageViewerClose}
              aria-label="Close message viewer"
              style={{ color: getMutedTextColor() }}
            >
              <FaClose />
            </button>
          </div>
          <div className={styles.messageViewerContent}>
            <div
              className={styles.messageViewerText}
              style={{ color: getTextColor() }}
            >
              {whatsappMessageText.split("\n").map((line, index) => (
                <p
                  key={index}
                  className={styles.messageViewerLine}
                  style={{ color: getTextColor() }}
                >
                  {line}
                </p>
              ))}
            </div>
            <div
              className={styles.messageViewerActions}
              style={{
                borderTopColor: getCardBorder(),
              }}
            >
              <button
                onClick={copyToClipboard}
                className={styles.messageViewerCopyButton}
                style={{
                  backgroundColor: copiedToClipboard ? "#10b981" : "#3b82f6",
                  color: "white",
                }}
              >
                <FaCopy />
                {copiedToClipboard ? "Copied!" : "Copy Message"}
              </button>
              <button
                onClick={openWhatsAppDesktop}
                className={styles.messageViewerWhatsAppButton}
                style={{ backgroundColor: "#25D366", color: "white" }}
              >
                <FaWhatsapp />
                Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔥 Remarks Popup Component
  const RemarksPopup = () => {
    if (!activeRemarksId) return null;

    const activeItem = getSelectedDepartmentData().find(item => item.id === activeRemarksId);
    if (!activeItem) return null;

    return (
      <div 
        className={styles.remarksPopupOverlay}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        onClick={closeRemarksPopup}
      >
        <div 
          className={styles.remarksPopupContainer}
          style={{
            backgroundColor: getThemeColor("#ffffff", "#1f2937"),
            color: getTextColor(),
            borderColor: getCardBorder(),
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            borderRadius: '10px',
            zIndex: 1001,
            width: isMobile ? '90%' : '500px',
            maxWidth: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.remarksPopupHeader} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            paddingBottom: '10px',
            borderBottom: `1px solid ${getCardBorder()}`,
          }}>
            <div>
              <span style={{ 
                color: getTextColor(),
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                Full Remarks
              </span>
              <div style={{ 
                color: getMutedTextColor(),
                fontSize: '14px',
                marginTop: '5px'
              }}>
                {activeItem.section} • {activeItem.machineId} • {activeItem.operator}
              </div>
            </div>
            <button
              onClick={closeRemarksPopup}
              className={styles.remarksPopupClose}
              style={{ 
                color: getMutedTextColor(),
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaClose />
            </button>
          </div>
          <div
            className={styles.remarksPopupContent}
            style={{ 
              color: getTextColor(),
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5',
              fontSize: '14px',
              wordBreak: 'break-word',
              padding: '10px',
              backgroundColor: getThemeColor("#f9fafb", "#111827"),
              borderRadius: '5px',
              border: `1px solid ${getCardBorder()}`,
            }}
          >
            {activeItem.remarks}
          </div>
          <div className={styles.remarksPopupFooter} style={{
            marginTop: '15px',
            paddingTop: '10px',
            borderTop: `1px solid ${getCardBorder()}`,
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={closeRemarksPopup}
              style={{
                padding: '8px 16px',
                backgroundColor: getThemeColor("#e5e7eb", "#374151"),
                color: getTextColor(),
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const deptInfo = getDepartmentInfo(selectedDepartment);
  const isRawMaterial = deptInfo.isRawMaterial;

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
  const efficiencyLabel = getEfficiencyLabel(totals.efficiency);

  const MobileDepartmentDropdown = () => {
    if (!showMobileDepartmentDropdown) return null;

    return (
      <div
        className={styles.mobileDepartmentDropdown}
        style={{
          backgroundColor:
            theme === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
        }}
        onClick={() => setShowMobileDepartmentDropdown(false)}
      >
        <div
          className={styles.mobileDropdownContainer}
          style={{
            backgroundColor: getThemeColor("#ffffff", "#1f2937"),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.mobileDropdownHeader}>
            <h4
              className={styles.mobileDropdownTitle}
              style={{ color: getTextColor() }}
            >
              Select Department
            </h4>
            <button
              onClick={() => setShowMobileDepartmentDropdown(false)}
              className={styles.mobileDropdownClose}
              aria-label="Close dropdown"
              style={{ color: getMutedTextColor() }}
            >
              <FaClose />
            </button>
          </div>
          <div
            className={styles.mobileDropdownOptions}
            style={{
              backgroundColor: getThemeColor("#ffffff", "#1f2937"),
            }}
          >
            <div
              onClick={() => handleDepartmentChange("all")}
              className={`${styles.mobileDropdownOption} ${
                selectedDepartment === "all"
                  ? styles.mobileDropdownOptionSelected
                  : ""
              }`}
              style={{
                backgroundColor:
                  selectedDepartment === "all"
                    ? getThemeColor("#f3f4f6", "#374151")
                    : "transparent",
                borderBottomColor: getCardBorder(),
              }}
            >
              <div className={styles.mobileOptionIcon}>
                <FaSitemap />
              </div>
              <div className={styles.mobileOptionText}>
                <div
                  className={styles.mobileOptionName}
                  style={{ color: getTextColor() }}
                >
                  All Departments
                </div>
                <div
                  className={styles.mobileOptionDetails}
                  style={{ color: getMutedTextColor() }}
                >
                  View all sections
                </div>
              </div>
            </div>
            {departments.map((dept) => (
              <div
                key={dept.id}
                onClick={() => handleDepartmentChange(dept.name)}
                className={`${styles.mobileDropdownOption} ${
                  selectedDepartment === dept.name
                    ? styles.mobileDropdownOptionSelected
                    : ""
                }`}
                style={{
                  backgroundColor:
                    selectedDepartment === dept.name
                      ? getThemeColor("#f3f4f6", "#374151")
                      : "transparent",
                  borderBottomColor: getCardBorder(),
                }}
              >
                <div
                  className={styles.mobileOptionIcon}
                  style={{
                    color: dept.color,
                    backgroundColor: dept.color + "20",
                  }}
                >
                  {dept.icon}
                </div>
                <div className={styles.mobileOptionText}>
                  <div
                    className={styles.mobileOptionName}
                    style={{ color: getTextColor() }}
                  >
                    {dept.shortName}
                  </div>
                  <div
                    className={styles.mobileOptionDetails}
                    style={{ color: getMutedTextColor() }}
                  >
                    {dept.isRawMaterial ? "Material" : "Production"} •{" "}
                    {dept.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: getThemeColor("#f9fafb", "#111827"),
        color: getTextColor(),
      }}
    >
      {/* WhatsApp Modal */}
      <WhatsAppModal />
      
      {/* WhatsApp Message Viewer */}
      <WhatsAppMessageViewer />
      
      {/* Remarks Popup */}
      <RemarksPopup />
      
      {/* Mobile Department Dropdown */}
      <MobileDepartmentDropdown />

      {isMobile && (
        <>
          <div className={styles.mobileHeader}>
            <div className={styles.mobileHeaderTop}>
              <h1
                className={styles.mobileTitle}
                style={{ color: getTextColor() }}
              >
                <FaCalendarAlt />
                {isRawMaterial ? "Weight Report" : "Prod Report"}
              </h1>
              <div
                className={styles.mobileDate}
                style={{ color: getMutedTextColor() }}
              >
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className={styles.mobileControls}>
              <div className={styles.mobileDepartmentButtonContainer}>
                <button
                  onClick={() => setShowMobileDepartmentDropdown(true)}
                  className={styles.mobileDepartmentButton}
                  style={{
                    backgroundColor: getThemeColor("#f3f4f6", "#374151"),
                    borderColor: getThemeColor("#e5e7eb", "#4b5563"),
                    color: getTextColor(),
                  }}
                  aria-label="Select department"
                >
                  <div className={styles.mobileDepartmentButtonContent}>
                    <div
                      className={styles.mobileDepartmentIcon}
                      style={{
                        backgroundColor: selectedDeptDisplay.color + "20",
                        color: selectedDeptDisplay.color,
                      }}
                    >
                      {selectedDeptDisplay.icon}
                    </div>
                    <span
                      className={styles.mobileDepartmentText}
                      style={{ color: getTextColor() }}
                    >
                      {selectedDeptDisplay.mobileName}
                    </span>
                    <FaChevronDown
                      className={styles.mobileDepartmentChevron}
                      style={{ color: getMutedTextColor() }}
                    />
                  </div>
                </button>
              </div>

              <div className={styles.mobileDateControl}>
                <input
                  type="date"
                  value={date.toISOString().split("T")[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className={styles.mobileDateInput}
                  style={{
                    backgroundColor: getThemeColor("#ffffff", "#374151"),
                    borderColor: getThemeColor("#e5e7eb", "#4b5563"),
                    color: getTextColor(),
                  }}
                  aria-label="Select date"
                />
              </div>

              <button
                onClick={handleRefresh}
                className={styles.mobileRefreshButton}
                aria-label="Refresh"
              >
                <FaSyncAlt />
              </button>
            </div>
          </div>
        </>
      )}

      {!isMobile && (
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleText}>
              <h1 className={styles.title} style={{ color: getTextColor() }}>
                <FaCalendarAlt className={styles.titleIcon} />
                {isRawMaterial
                  ? "Daily Material Weight Report"
                  : "Daily Production Report"}
              </h1>
            </div>

            <div className={styles.headerControls}>
              <div className={styles.dateControl}>
                <label
                  className={styles.dateLabel}
                  style={{ color: getTextColor() }}
                >
                  <FaCalendarAlt />
                  Date:
                </label>
                <input
                  type="date"
                  value={date.toISOString().split("T")[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                  className={styles.dateInput}
                  style={{
                    backgroundColor: getThemeColor("#ffffff", "#374151"),
                    borderColor: getThemeColor("#e5e7eb", "#4b5563"),
                    color: getTextColor(),
                  }}
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
        </div>
      )}

      {!isMobile && (
        <div className={styles.filterContainer}>
          <div className={styles.filterLabel} style={{ color: getTextColor() }}>
            <FaBuilding className={styles.filterIcon} />
            Department:
          </div>

          <div className={styles.dropdownWrapper}>
            <button
              onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
              className={styles.dropdownToggle}
              style={{
                backgroundColor: getThemeColor("#ffffff", "#374151"),
                borderColor: getThemeColor("#e5e7eb", "#4b5563"),
                color: getTextColor(),
              }}
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
                <span
                  className={styles.selectedText}
                  style={{ color: getTextColor() }}
                >
                  {selectedDeptDisplay.shortName}
                </span>
              </div>
              <FaChevronDown
                className={styles.chevron}
                style={{
                  transform: showDepartmentDropdown
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  color: getMutedTextColor(),
                }}
              />
            </button>

            {showDepartmentDropdown && (
              <div
                className={styles.dropdownMenu}
                style={{
                  backgroundColor: getThemeColor("#ffffff", "#1f2937"),
                  borderColor: getThemeColor("#e5e7eb", "#4b5563"),
                }}
                role="listbox"
              >
                <div
                  onClick={() => handleDepartmentChange("all")}
                  className={styles.optionItem}
                  style={{
                    backgroundColor:
                      selectedDepartment === "all"
                        ? getThemeColor("#f3f4f6", "#374151")
                        : "transparent",
                  }}
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
                    <div
                      className={styles.optionName}
                      style={{ color: getTextColor() }}
                    >
                      All Departments
                    </div>
                    <div
                      className={styles.optionDetails}
                      style={{ color: getMutedTextColor() }}
                    >
                      View data from all sections
                    </div>
                  </div>
                </div>

                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    onClick={() => handleDepartmentChange(dept.name)}
                    className={styles.optionItem}
                    style={{
                      backgroundColor:
                        selectedDepartment === dept.name
                          ? getThemeColor("#f3f4f6", "#374151")
                          : "transparent",
                    }}
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
                      <div
                        className={styles.optionName}
                        style={{ color: getTextColor() }}
                      >
                        {dept.shortName}
                      </div>
                      <div
                        className={styles.optionDetails}
                        style={{ color: getMutedTextColor() }}
                      >
                        {dept.isRawMaterial ? "Material Weight" : "Production"}{" "}
                        • {dept.unit}
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
      )}

      <div className={styles.summaryGrid}>
        <div
          className={styles.summaryCard}
          style={{
            backgroundColor: getCardBackground(),
            border: `1px solid ${getCardBorder()}`,
            borderLeft: `4px solid ${getEfficiencyColor(totals.efficiency)}`,
            boxShadow:
              theme === "dark"
                ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                : "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className={styles.cardHeader}>
            <div
              className={styles.cardIconWrapper}
              style={{
                backgroundColor: getEfficiencyColor(totals.efficiency) + "20",
                color: getEfficiencyColor(totals.efficiency),
              }}
            >
              {isRawMaterial ? <FaWeightHanging /> : <FaIndustry />}
            </div>
            <div
              className={styles.cardTitle}
              style={{ color: getMutedTextColor() }}
            >
              {isRawMaterial ? "Weight Received" : "Production"}
            </div>
          </div>
          <div
            className={styles.cardValue}
            style={{
              color: getTextColor(),
              fontSize: isMobile ? "1.2rem" : "1.5rem",
            }}
          >
            {totals.totalProduction.toLocaleString()}
            <span
              className={styles.cardUnit}
              style={{ color: getMutedTextColor() }}
            >
              {selectedDepartment === "all" ? "" : deptInfo.unit}
            </span>
          </div>
          <div
            className={styles.cardSubtitle}
            style={{ color: getMutedTextColor() }}
          >
            {filteredData.length} records • {totals.machines} machines
          </div>
        </div>

        <div
          className={styles.summaryCard}
          style={{
            backgroundColor: getCardBackground(),
            border: `1px solid ${getCardBorder()}`,
            borderLeft: `4px solid #10b981`,
            boxShadow:
              theme === "dark"
                ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                : "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className={styles.cardHeader}>
            <div
              className={styles.cardIconWrapper}
              style={{
                backgroundColor: "#10b98120",
                color: "#10b981",
              }}
            >
              <FaBullseye />
            </div>
            <div
              className={styles.cardTitle}
              style={{ color: getMutedTextColor() }}
            >
              {isRawMaterial ? "Target Weight" : "Target"}
            </div>
          </div>
          <div
            className={styles.cardValue}
            style={{
              color: getTextColor(),
              fontSize: isMobile ? "1.2rem" : "1.5rem",
            }}
          >
            {totals.totalTarget.toLocaleString()}
            <span
              className={styles.cardUnit}
              style={{ color: getMutedTextColor() }}
            >
              {selectedDepartment === "all" ? "" : deptInfo.unit}
            </span>
          </div>
          <div
            className={styles.cardSubtitle}
            style={{ color: getMutedTextColor() }}
          >
            Expected {isRawMaterial ? "weight" : "production"} • {totals.shifts}{" "}
            shifts
          </div>
        </div>

        <div
          className={styles.summaryCard}
          style={{
            backgroundColor: getCardBackground(),
            border: `1px solid ${getCardBorder()}`,
            borderLeft: `4px solid ${getEfficiencyColor(totals.efficiency)}`,
            boxShadow:
              theme === "dark"
                ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                : "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className={styles.cardHeader}>
            <div
              className={styles.cardIconWrapper}
              style={{
                backgroundColor: getEfficiencyColor(totals.efficiency) + "20",
                color: getEfficiencyColor(totals.efficiency),
              }}
            >
              <FaChartLine />
            </div>
            <div
              className={styles.cardTitle}
              style={{ color: getMutedTextColor() }}
            >
              Efficiency
            </div>
          </div>
          <div
            className={styles.cardValue}
            style={{
              color: getEfficiencyColor(totals.efficiency),
              fontSize: isMobile ? "1.2rem" : "1.5rem",
            }}
          >
            {getEfficiencyArrow(totals.efficiency)}
          </div>
          <div
            className={styles.cardSubtitle}
            style={{ color: getMutedTextColor() }}
          >
            {efficiencyLabel} •{" "}
            {isRawMaterial ? "Weight vs Target" : "Production vs Target"}
          </div>
        </div>

        <div
          className={styles.summaryCard}
          style={{
            backgroundColor: getCardBackground(),
            border: `1px solid ${getCardBorder()}`,
            borderLeft: `4px solid #8b5cf6`,
            boxShadow:
              theme === "dark"
                ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                : "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className={styles.cardHeader}>
            <div
              className={styles.cardIconWrapper}
              style={{
                backgroundColor: "#8b5cf620",
                color: "#8b5cf6",
              }}
            >
              <FaTachometerAlt />
            </div>
            <div
              className={styles.cardTitle}
              style={{ color: getMutedTextColor() }}
            >
              Avg per Record
            </div>
          </div>
          <div
            className={styles.cardValue}
            style={{
              color: getTextColor(),
              fontSize: isMobile ? "1.2rem" : "1.5rem",
            }}
          >
            {filteredData.length > 0
              ? (totals.totalProduction / filteredData.length).toLocaleString(
                  "en-US",
                  { minimumFractionDigits: 0, maximumFractionDigits: 1 },
                )
              : "0"}
          </div>
          <div
            className={styles.cardSubtitle}
            style={{ color: getMutedTextColor() }}
          >
            Per record • {totals.combinations || 0} combos
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        {isMobile ? (
          <div className={styles.mobileActionButtons}>
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className={`${styles.mobileActionButton} ${styles.whatsappButton}`}
              title="Share via WhatsApp"
            >
              <FaWhatsapp />
            </button>
            <button
              onClick={handlePrintReport}
              className={`${styles.mobileActionButton} ${styles.printButton}`}
              title="Print Report"
            >
              <FaPrint />
            </button>
            <button
              onClick={handleExportPDF}
              className={`${styles.mobileActionButton} ${styles.pdfButton}`}
              title="Export PDF"
            >
              <FaFileDownload />
            </button>
            <button
              onClick={handleExportExcel}
              className={`${styles.mobileActionButton} ${styles.excelButton}`}
              title="Export Excel"
            >
              <FaFileExcel />
            </button>
          </div>
        ) : (
          <div className={styles.actionButtons}>
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className={`${styles.actionButton} ${styles.whatsappButton}`}
            >
              <FaWhatsapp /> <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrintReport}
              className={`${styles.actionButton} ${styles.printButton}`}
            >
              <FaPrint /> <span>Print</span>
            </button>
            <button
              onClick={handleExportPDF}
              className={`${styles.actionButton} ${styles.pdfButton}`}
            >
              <FaFileDownload /> <span>PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className={`${styles.actionButton} ${styles.excelButton}`}
            >
              <FaFileExcel /> <span>Excel</span>
            </button>
          </div>
        )}
      </div>

      <div
        className={styles.detailsContainer}
        style={{
          backgroundColor: getCardBackground(),
          border: `1px solid ${getCardBorder()}`,
        }}
      >
        <div className={styles.tableHeaderSection}>
          <h3 className={styles.tableTitle} style={{ color: getTextColor() }}>
            <FaDatabase />
            {isRawMaterial ? "Material Weight Details" : "Production Details"}
          </h3>

          {!isMobile && (
            <div className={styles.tableStats}>
              <span
                className={styles.tableStat}
                style={{ color: getMutedTextColor() }}
              >
                <FaDatabase /> {filteredData.length} Records
              </span>
              <span
                className={styles.tableStat}
                style={{ color: getMutedTextColor() }}
              >
                <FaIndustry /> {totals.machines} Machines
              </span>
              <span
                className={styles.tableStat}
                style={{ color: getMutedTextColor() }}
              >
                <FaClock /> {Object.keys(shiftGroups).length} Shifts
              </span>
            </div>
          )}
        </div>

        {Object.keys(shiftGroups).length > 0 ? (
          Object.keys(shiftGroups).map((shift) => {
            const shiftItems = shiftGroups[shift];
            const shiftEfficiency = calculateShiftEfficiency(shiftItems);
            const shiftEfficiencyColor = getEfficiencyColor(shiftEfficiency);

            return (
              <div key={shift} className={styles.shiftSection}>
                <h4
                  className={styles.shiftTitle}
                  style={{
                    color: getTextColor(),
                    borderBottomColor: getCardBorder(),
                  }}
                >
                  <span className={styles.shiftIcon}>
                    {getShiftIcon(shift)}
                  </span>
                  {shift} Shift
                </h4>

                {isMobile && filteredData.length > 5 && (
                  <div className={styles.tableScrollControls}>
                    <button
                      onClick={scrollTableLeft}
                      className={styles.scrollButton}
                      aria-label="Scroll table left"
                    >
                      <FaArrowLeft />
                    </button>
                    <div className={styles.scrollIndicator}>
                      Scroll to see more →
                    </div>
                    <button
                      onClick={scrollTableRight}
                      className={styles.scrollButton}
                      aria-label="Scroll table right"
                    >
                      <FaArrowRight />
                    </button>
                  </div>
                )}

                <div className={styles.tableContainer} ref={tableContainerRef}>
                  <table
                    className={styles.productionTable}
                    style={{
                      backgroundColor: getThemeColor("#ffffff", "#1f2937"),
                    }}
                  >
                    <thead>
                      <tr
                        className={styles.tableHeader}
                        style={{
                          backgroundColor: getTableHeaderBg(),
                        }}
                      >
                        {!isMobile && (
                          <th
                            style={{
                              color: getMutedTextColor(),
                              minWidth: "90px",
                            }}
                          >
                            Section
                          </th>
                        )}
                        <th
                          style={{
                            color: getMutedTextColor(),
                            minWidth: "80px",
                          }}
                        >
                          Operator
                        </th>
                        <th
                          style={{
                            color: getMutedTextColor(),
                            minWidth: "60px",
                          }}
                        >
                          M-ID
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            color: getMutedTextColor(),
                            minWidth: "70px",
                          }}
                        >
                          {isRawMaterial ? "Weight" : "Production"}
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            color: getMutedTextColor(),
                            minWidth: "60px",
                          }}
                        >
                          Target
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            color: getMutedTextColor(),
                            minWidth: "50px",
                          }}
                        >
                          Unit
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            color: getMutedTextColor(),
                            minWidth: "60px",
                          }}
                        >
                          Efficiency
                        </th>
                        {!isMobile && (
                          <th
                            style={{
                              textAlign: "center",
                              color: getMutedTextColor(),
                              minWidth: "50px",
                            }}
                          >
                            Entries
                          </th>
                        )}
                        <th
                          style={{
                            textAlign: "center",
                            color: getMutedTextColor(),
                            minWidth: "120px",
                          }}
                        >
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftItems.map((item, index) => {
                        const deptInfo = getDepartmentInfo(item.department);
                        const efficiencyColor = getEfficiencyColor(
                          item.efficiency,
                        );
                        const showExpandButton = isMobile ? item.remarks.length > 20 : item.remarks.length > 30;

                        return (
                          <tr
                            key={item.id}
                            className={styles.tableRow}
                            style={{
                              backgroundColor: getTableRowBg(index),
                              color: getTextColor(),
                            }}
                          >
                            {!isMobile && (
                              <td className={styles.sectionCell}>
                                <div className={styles.sectionInfo}>
                                  <span className={styles.sectionIcon}>
                                    {deptInfo.icon}
                                  </span>
                                  <span style={{ color: getTextColor() }}>
                                    {item.section}
                                  </span>
                                </div>
                              </td>
                            )}

                            <td className={styles.operatorCell}>
                              <div className={styles.operatorInfo}>
                                <FaUser
                                  className={styles.infoIcon}
                                  style={{ color: getMutedTextColor() }}
                                />
                                <span
                                  className={styles.operatorText}
                                  style={{ color: getTextColor() }}
                                >
                                  {item.operator}
                                </span>
                              </div>
                            </td>

                            <td className={styles.machineCell}>
                              <div className={styles.machineInfo}>
                                <FaCogs
                                  className={styles.infoIcon}
                                  style={{ color: getMutedTextColor() }}
                                />
                                <span
                                  className={styles.machineText}
                                  style={{ color: getTextColor() }}
                                >
                                  {item.machineId || "N/A"}
                                </span>
                              </div>
                            </td>

                            <td className={styles.quantityCell}>
                              <div
                                className={styles.quantityValue}
                                style={{ color: getTextColor() }}
                              >
                                {formatQuantity(
                                  item.production_quantity,
                                  item.quantity_unit,
                                )}
                              </div>
                            </td>

                            <td className={styles.quantityCell}>
                              <div
                                className={styles.quantityValue}
                                style={{ color: getTextColor() }}
                              >
                                {formatQuantity(
                                  item.target_quantity,
                                  item.quantity_unit,
                                )}
                              </div>
                            </td>

                            <td className={styles.unitCell}>
                              <span
                                className={styles.unitBadge}
                                style={{
                                  backgroundColor: getThemeColor(
                                    "#e5e7eb",
                                    "#374151",
                                  ),
                                  color: getMutedTextColor(),
                                }}
                              >
                                {item.quantity_unit}
                              </span>
                            </td>

                            <td className={styles.centerCell}>
                              <div
                                className={`${styles.efficiencyBadge} ${getEfficiencyClass(item.efficiency)}`}
                                style={{
                                  backgroundColor: getEfficiencyBgColor(
                                    item.efficiency,
                                  ),
                                  color: efficiencyColor,
                                }}
                              >
                                {getEfficiencyArrow(item.efficiency)}
                              </div>
                            </td>

                            {!isMobile && (
                              <td className={styles.centerCell}>
                                <span
                                  className={styles.entriesBadge}
                                  style={{
                                    backgroundColor: getThemeColor(
                                      "#e5e7eb",
                                      "#374151",
                                    ),
                                    color: getTextColor(),
                                  }}
                                >
                                  {item.entries}
                                </span>
                              </td>
                            )}

                            <td className={styles.remarksCell}>
                              <div className={styles.remarksContent}>
                                <div className={styles.remarksContainer}>
                                  <span
                                    className={styles.remarksText}
                                    style={{ color: getMutedTextColor() }}
                                  >
                                    {isMobile && showExpandButton
                                      ? item.remarks.substring(0, 20) + "..."
                                      : !isMobile && showExpandButton
                                      ? item.remarks.substring(0, 30) + "..."
                                      : item.remarks}
                                  </span>
                                  {showExpandButton && (
                                    <button
                                      className={styles.remarksToggle}
                                      onClick={(e) => toggleRemarks(item.id, e)}
                                      title="View full remarks"
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        marginLeft: '5px',
                                        color: getMutedTextColor(),
                                        fontSize: '12px',
                                      }}
                                    >
                                      <FaExpand />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  className={styles.shiftSummary}
                  style={{
                    backgroundColor: getThemeColor("#f3f4f6", "#111827"),
                    borderColor: getCardBorder(),
                  }}
                >
                  <div className={styles.shiftSummaryContent}>
                    <div
                      className={styles.shiftSummaryTitle}
                      style={{ color: getMutedTextColor() }}
                    >
                      Shift Summary
                    </div>
                    <div className={styles.shiftSummaryStats}>
                      <div className={styles.shiftSummaryStat}>
                        <div
                          className={styles.statLabel}
                          style={{ color: getMutedTextColor() }}
                        >
                          {isRawMaterial ? "Weight:" : "Production:"}
                        </div>
                        <div
                          className={styles.statValue}
                          style={{ color: getTextColor() }}
                        >
                          {shiftItems
                            .reduce(
                              (sum, item) => sum + item.production_quantity,
                              0,
                            )
                            .toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.shiftSummaryStat}>
                        <div
                          className={styles.statLabel}
                          style={{ color: getMutedTextColor() }}
                        >
                          Target:
                        </div>
                        <div
                          className={styles.statValue}
                          style={{ color: getTextColor() }}
                        >
                          {shiftItems
                            .reduce(
                              (sum, item) => sum + item.target_quantity,
                              0,
                            )
                            .toLocaleString()}
                        </div>
                      </div>
                      <div className={styles.shiftSummaryStat}>
                        <div
                          className={styles.statLabel}
                          style={{ color: getMutedTextColor() }}
                        >
                          Efficiency:
                        </div>
                        <div className={styles.statValue}>
                          <span
                            className={styles.shiftEfficiencyBadge}
                            style={{
                              color: shiftEfficiencyColor,
                              backgroundColor:
                                getEfficiencyBgColor(shiftEfficiency),
                            }}
                          >
                            {getEfficiencyArrow(shiftEfficiency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.noDataMessage}>
            <div
              className={styles.noDataIcon}
              style={{ color: getMutedTextColor() }}
            >
              <FaDatabase />
            </div>
            <h3 style={{ color: getTextColor() }}>
              No {isRawMaterial ? "Material Weight" : "Production"} Data Found
            </h3>
            <p style={{ color: getMutedTextColor() }}>
              Select a different department or date to view{" "}
              {isRawMaterial ? "material weight" : "production"} records
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyProductionReport;