// ========================================================
// FILE: FlatteningForm.jsx
// PURPOSE: Production Entry Form for Flattening Section
// VERSION: 6.0 - Using CSS Classes (not inline styles)
// ========================================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSave,
  FiX,
  FiArrowLeft,
  FiTarget,
  FiPackage,
  FiUser,
  FiClipboard,
  FiCheck,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiList,
  FiTrendingUp,
  FiDatabase,
  FiRefreshCw,
  FiInfo,
  FiCalendar,
  FiCheckCircle,
  FiActivity,
  FiCpu,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";
import { supabase } from "../../../supabaseClient";
import "./FlatteningForm.css";

// ==================== CONSTANTS ====================
const SECTION_NAME = "Flattening";
const DEFAULT_UNIT = "Kg";
const REQUIRED_FIELDS = [
  "machine_id",
  "shift_code",
  "operator_name",
  "production_date",
  "targets_id",
];

// ==================== UTILITY FUNCTIONS ====================
const getEfficiencyColor = (efficiency) => {
  if (efficiency >= 90) return "#059669";
  if (efficiency >= 80) return "#10b981";
  if (efficiency >= 70) return "#f59e0b";
  return "#ef4444";
};

const getEfficiencyStatus = (efficiency) => {
  if (efficiency >= 90) return "Excellent";
  if (efficiency >= 80) return "Good";
  if (efficiency >= 70) return "Average";
  if (efficiency > 0) return "Below Target";
  return "No Production";
};

const getEfficiencyIcon = (efficiency) => {
  if (efficiency >= 80) return "🏆";
  if (efficiency >= 70) return "📊";
  if (efficiency > 0) return "📉";
  return "⏳";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ==================== MAIN COMPONENT ====================
const FlatteningForm = ({ onClose, isModal = true }) => {
  const navigate = useNavigate();

  // ==================== STATE MANAGEMENT ====================
  const [formData, setFormData] = useState({
    section_name: SECTION_NAME,
    targets_id: "",
    machine_id: "",
    machine_no: "",
    shift_code: "",
    shift_name: "",
    target_qty: 0,
    unit: DEFAULT_UNIT,
    operator_name: "",
    remarks: "",
    production_date: new Date().toISOString().split("T")[0],
    users_name: "",
  });

  const [itemsList, setItemsList] = useState([
    {
      id: 1,
      item_code: "",
      item_name: "",
      coil_size: "",
      material_type: "",
      production_quantity: "",
      unit: DEFAULT_UNIT,
      efficiency: 0,
    },
  ]);

  const [errors, setErrors] = useState({});
  const [itemErrors, setItemErrors] = useState([{}]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [duplicateError, setDuplicateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [filledFields, setFilledFields] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Machine completion tracking
  const [machineCompletion, setMachineCompletion] = useState({
    totalMachines: 0,
    completedMachines: 0,
    completionPercentage: 0,
    entriesForDate: [],
    shiftMachines: [],
  });

  // Dynamic data from Supabase
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [operators, setOperators] = useState([]);
  const [currentUser, setCurrentUser] = useState("");

  // Filtered targets based on selected shift
  const [filteredTargets, setFilteredTargets] = useState([]);

  // Current target for selected shift and machine
  const [currentTarget, setCurrentTarget] = useState(null);

  // Calculated fields
  const [totalProduction, setTotalProduction] = useState(0);
  const [overallEfficiency, setOverallEfficiency] = useState(0);

  // ==================== MOBILE DETECTION ====================
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ==================== AUTHENTICATION ====================
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const userName = user?.email || "System";
        setCurrentUser(userName);
        setFormData((prev) => ({ ...prev, users_name: userName }));
        setFilledFields((prev) => ({ ...prev, users_name: true }));
      } catch (error) {
        console.error("Error fetching current user:", error);
        setCurrentUser("System");
        setFormData((prev) => ({ ...prev, users_name: "System" }));
        setFilledFields((prev) => ({ ...prev, users_name: true }));
      }
    };
    fetchCurrentUser();
  }, []);

  // ==================== DATA FETCHING ====================
  const fetchEntriesForDate = useCallback(async (date, shiftCode = null) => {
    try {
      let query = supabase
        .from("flatteningsection")
        .select("machine_id, shift_code, production_date")
        .eq("production_date", date);

      if (shiftCode) query = query.eq("shift_code", shiftCode);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching entries:", error);
      return [];
    }
  }, []);

  const calculateMachineCompletion = useCallback(
    (entriesForDate, shiftCode, targets) => {
      const shiftTargets = shiftCode
        ? targets.filter((t) => t.shift_code === shiftCode)
        : targets;

      const uniqueMachines = [
        ...new Set(shiftTargets.map((t) => t.machine_id)),
      ];
      const enteredMachines = [
        ...new Set(entriesForDate.map((e) => e.machine_id)),
      ];
      const completedMachines = enteredMachines.filter((id) =>
        uniqueMachines.includes(id)
      ).length;

      return {
        totalMachines: uniqueMachines.length,
        completedMachines,
        completionPercentage: Math.round(
          uniqueMachines.length > 0
            ? (completedMachines / uniqueMachines.length) * 100
            : 0
        ),
        entriesForDate: enteredMachines,
        shiftMachines: uniqueMachines,
      };
    },
    []
  );

  useEffect(() => {
    const updateMachineCompletion = async () => {
      if (targets.length && formData.production_date) {
        const entries = await fetchEntriesForDate(
          formData.production_date,
          formData.shift_code
        );
        setMachineCompletion(
          calculateMachineCompletion(entries, formData.shift_code, targets)
        );
      }
    };
    updateMachineCompletion();
  }, [
    formData.production_date,
    formData.shift_code,
    targets,
    fetchEntriesForDate,
    calculateMachineCompletion,
  ]);

  const fetchConfigurationData = useCallback(async () => {
    try {
      setLoading(true);
      setSubmitError("");

      // Parallel data fetching
      const [itemsRes, targetsRes, operatorsRes] = await Promise.all([
        supabase.from("items").select("*").order("item_name"),
        supabase
          .from("targets")
          .select("*")
          .eq("section_name", SECTION_NAME)
          .eq("is_active", true)
          .order("machine_id"),
        supabase.from("flatteningsection").select("operator_name").order("operator_name"),
      ]);

      setItems(itemsRes.data || []);
      setTargets(targetsRes.data || []);
      
      const uniqueOperators = [
        ...new Set(
          (operatorsRes.data || [])
            .map((item) => item.operator_name)
            .filter(Boolean)
        ),
      ];
      setOperators(uniqueOperators);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSubmitError("Failed to load data.");
      // Fallback data
      setItems([
        { id: 1, item_code: "FL-001", item_name: "Flat Steel Coil HD", coil_size: "100mm", material_type: "High Carbon Steel", unit: "Kg" },
        { id: 2, item_code: "FL-002", item_name: "Flat Steel Coil MD", coil_size: "150mm", material_type: "Mild Steel", unit: "Kg" },
      ]);
      setTargets([
        { id: 1, section_name: "Flattening", machine_id: "FL # 01", machine_no: "01", shift_code: "D", shift_name: "Day", target_qty: 5000, uom: "Kg", is_active: true },
        { id: 2, section_name: "Flattening", machine_id: "FL # 02", machine_no: "02", shift_code: "D", shift_name: "Day", target_qty: 4500, uom: "Kg", is_active: true },
      ]);
      setOperators(["Ahmed", "Muhammad", "Usman"]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigurationData();
  }, [fetchConfigurationData]);

  // ==================== FORM LOGIC ====================
  useEffect(() => {
    if (formData.shift_code && targets.length) {
      const targetsForShift = targets.filter(
        (t) => t.shift_code === formData.shift_code && t.section_name === SECTION_NAME
      );
      const unique = targetsForShift.filter(
        (t, i, self) =>
          i === self.findIndex((s) => s.machine_id === t.machine_id && s.machine_no === t.machine_no)
      );
      setFilteredTargets(unique);

      if (formData.machine_id && !unique.find((t) => t.machine_id === formData.machine_id)) {
        setFormData((prev) => ({
          ...prev,
          machine_id: "",
          machine_no: "",
          target_qty: 0,
          targets_id: "",
        }));
        setFilledFields((prev) => ({
          ...prev,
          machine_id: false,
          machine_no: false,
          target_qty: false,
          targets_id: false,
        }));
      }
    } else {
      setFilteredTargets([]);
    }
  }, [formData.shift_code, formData.machine_id, targets]);

  useEffect(() => {
    if (formData.shift_code && formData.machine_id && targets.length) {
      const target = targets.find(
        (t) =>
          t.section_name === SECTION_NAME &&
          t.machine_id === formData.machine_id &&
          t.shift_code === formData.shift_code
      );
      setCurrentTarget(target || null);

      if (target) {
        setFormData((prev) => ({
          ...prev,
          machine_no: target.machine_no,
          target_qty: target.target_qty || 0,
          targets_id: target.id || target.targets_id || "",
        }));
        setFilledFields((prev) => ({
          ...prev,
          machine_no: true,
          target_qty: !!target.target_qty,
          targets_id: true,
        }));
      }
    } else {
      setCurrentTarget(null);
    }
  }, [formData.shift_code, formData.machine_id, targets]);

  useEffect(() => {
    if (formData.target_qty > 0 && totalProduction > 0) {
      setOverallEfficiency(parseFloat(((totalProduction / formData.target_qty) * 100).toFixed(2)));
    } else {
      setOverallEfficiency(0);
    }
  }, [totalProduction, formData.target_qty]);

  const calculateItemEfficiency = useCallback(
    (quantity) => {
      if (formData.target_qty > 0 && quantity > 0) {
        return parseFloat(((quantity / formData.target_qty) * 100).toFixed(2));
      }
      return 0;
    },
    [formData.target_qty]
  );

  const addItemRow = () => {
    const newId = itemsList.length ? Math.max(...itemsList.map((i) => i.id)) + 1 : 1;
    setItemsList((prev) => [
      ...prev,
      {
        id: newId,
        item_code: "",
        item_name: "",
        coil_size: "",
        material_type: "",
        production_quantity: "",
        unit: DEFAULT_UNIT,
        efficiency: 0,
      },
    ]);
    setItemErrors((prev) => [...prev, {}]);
  };

  const removeItemRow = (id) => {
    if (itemsList.length <= 1) {
      alert("At least one item is required");
      return;
    }
    setItemsList((prev) => prev.filter((item) => item.id !== id));
    setItemErrors((prev) => prev.filter((_, i) => i !== itemsList.findIndex((item) => item.id === id)));
    
    const newTotal = itemsList
      .filter((item) => item.id !== id)
      .reduce((sum, item) => sum + (parseFloat(item.production_quantity) || 0), 0);
    setTotalProduction(newTotal);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDuplicateError("");
    setSuccessMessage("");
    setSubmitError("");

    if (value?.trim()) {
      setFilledFields((prev) => ({ ...prev, [name]: true }));
    } else {
      setFilledFields((prev) => ({ ...prev, [name]: false }));
    }

    switch (name) {
      case "production_date":
        setFormData((prev) => ({ ...prev, production_date: value }));
        break;

      case "shift_code": {
        const selectedShift = targets.find((t) => t.shift_code === value);
        setFormData((prev) => ({
          ...prev,
          shift_code: value,
          shift_name: selectedShift?.shift_name || "",
          machine_id: "",
          machine_no: "",
          target_qty: 0,
          targets_id: "",
        }));
        if (value) setFilledFields((prev) => ({ ...prev, shift_name: true }));
        break;
      }

      case "machine_id": {
        const selectedMachine = filteredTargets.find((t) => t.machine_id === value);
        if (selectedMachine) {
          setFormData((prev) => ({
            ...prev,
            machine_id: value,
            machine_no: selectedMachine.machine_no,
            target_qty: selectedMachine.target_qty || 0,
            targets_id: selectedMachine.id || selectedMachine.targets_id || "",
          }));
          setFilledFields((prev) => ({
            ...prev,
            machine_no: true,
            target_qty: !!selectedMachine.target_qty,
            targets_id: true,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            machine_id: value,
            machine_no: "",
            target_qty: 0,
            targets_id: "",
          }));
        }
        break;
      }

      case "operator_name":
        setFormData((prev) => ({ ...prev, operator_name: value }));
        if (value && !operators.includes(value)) {
          setOperators((prev) => [...prev, value].sort());
        }
        break;

      default:
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItemsList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };

          if (field === "item_code") {
            const selected = items.find((i) => i.item_code === value);
            if (selected) {
              updated.item_name = selected.item_name || "";
              updated.coil_size = selected.coil_size || "";
              updated.material_type = selected.material_type || "";
              updated.unit = selected.unit || DEFAULT_UNIT;
            }
          }

          if (field === "production_quantity") {
            const qty = parseFloat(value) || 0;
            updated.efficiency = calculateItemEfficiency(qty);
            const newTotal = prev
              .map((i) => (i.id === id ? updated : i))
              .reduce((sum, i) => sum + (parseFloat(i.production_quantity) || 0), 0);
            setTotalProduction(newTotal);
          }

          return updated;
        }
        return item;
      })
    );

    const idx = itemsList.findIndex((item) => item.id === id);
    if (idx >= 0 && itemErrors[idx]?.[field]) {
      setItemErrors((prev) => {
        const newErrors = [...prev];
        newErrors[idx] = { ...newErrors[idx], [field]: "" };
        return newErrors;
      });
    }
  };

  const getFieldStatus = (fieldName, value) => ({
    isFilled: filledFields[fieldName] || (value && value.toString().trim() !== ""),
    hasError: !!errors[fieldName],
    isRequired: REQUIRED_FIELDS.includes(fieldName),
  });

  const getFieldClass = (fieldName, value) => {
    const status = getFieldStatus(fieldName, value);
    if (status.hasError) return "form-input form-input-error";
    if (status.isFilled) return "form-input form-input-filled";
    return "form-input";
  };

  const getSelectClass = (fieldName, value) => {
    const status = getFieldStatus(fieldName, value);
    if (status.hasError) return "form-select form-select-error";
    if (status.isFilled) return "form-select form-select-filled";
    return "form-select";
  };

  const getDisplayClass = (fieldName, value) => {
    const status = getFieldStatus(fieldName, value);
    return status.isFilled ? "display-field display-field-filled" : "display-field";
  };

  const validateForm = () => {
    const newErrors = {};
    const newItemErrors = itemsList.map(() => ({}));
    let isValid = true;

    if (!formData.machine_id) {
      newErrors.machine_id = "Machine ID is required";
      isValid = false;
    }
    if (!formData.machine_no) {
      newErrors.machine_no = "Machine number is required";
      isValid = false;
    }
    if (!formData.shift_code) {
      newErrors.shift_code = "Shift is required";
      isValid = false;
    }
    if (!formData.production_date) {
      newErrors.production_date = "Production date is required";
      isValid = false;
    }
    if (!formData.operator_name?.trim()) {
      newErrors.operator_name = "Operator name is required";
      isValid = false;
    }
    if (!formData.targets_id) {
      newErrors.targets_id = "Target selection is required";
      isValid = false;
    }

    itemsList.forEach((item, i) => {
      if (!item.item_code) {
        newItemErrors[i].item_code = "Item code is required";
        isValid = false;
      }
      if (!item.production_quantity) {
        newItemErrors[i].production_quantity = "Production quantity is required";
        isValid = false;
      } else if (parseFloat(item.production_quantity) <= 0) {
        newItemErrors[i].production_quantity = "Enter a valid positive number";
        isValid = false;
      }
    });

    setErrors(newErrors);
    setItemErrors(newItemErrors);
    return isValid;
  };

  const checkDuplicateEntry = async () => {
    if (!formData.machine_id || !formData.shift_code || !formData.production_date) return false;
    try {
      const { data } = await supabase
        .from("flatteningsection")
        .select("id")
        .eq("machine_id", formData.machine_id)
        .eq("shift_code", formData.shift_code)
        .eq("production_date", formData.production_date);
      return data && data.length > 0;
    } catch (error) {
      console.error("Duplicate check error:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (await checkDuplicateEntry()) {
      setDuplicateError(
        `Machine ${formData.machine_id} already has an entry for ${formData.shift_name} shift on ${formData.production_date}.`
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const records = itemsList.map((item) => ({
        section_name: formData.section_name,
        targets_id: formData.targets_id,
        machine_id: formData.machine_id,
        machine_no: formData.machine_no,
        item_code: item.item_code,
        item_name: item.item_name,
        coil_size: item.coil_size,
        material_type: item.material_type,
        operator_name: formData.operator_name,
        production_quantity: parseFloat(item.production_quantity),
        unit: item.unit,
        efficiency: item.efficiency,
        shift_code: formData.shift_code,
        shift_name: formData.shift_name,
        target_qty: formData.target_qty,
        production_date: formData.production_date,
        remarks: formData.remarks,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("flatteningsection").insert(records);
      if (error) throw error;

      const entries = await fetchEntriesForDate(formData.production_date, formData.shift_code);
      setMachineCompletion(calculateMachineCompletion(entries, formData.shift_code, targets));

      setSuccessMessage(`✅ ${records.length} record(s) saved successfully!`);
      setTimeout(() => {
        clearForm();
        setSuccessMessage("");
      }, 1500);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("Failed to save: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      section_name: SECTION_NAME,
      targets_id: "",
      machine_id: "",
      machine_no: "",
      shift_code: "",
      shift_name: "",
      target_qty: 0,
      unit: DEFAULT_UNIT,
      operator_name: "",
      remarks: "",
      production_date: new Date().toISOString().split("T")[0],
      users_name: currentUser,
    });
    setItemsList([{
      id: 1,
      item_code: "",
      item_name: "",
      coil_size: "",
      material_type: "",
      production_quantity: "",
      unit: DEFAULT_UNIT,
      efficiency: 0,
    }]);
    setFilledFields({ section_name: true, users_name: true, production_date: true });
    setErrors({});
    setItemErrors([{}]);
    setDuplicateError("");
    setSubmitError("");
    setTotalProduction(0);
    setOverallEfficiency(0);
    setCurrentTarget(null);
  };

  // ==================== NAVIGATION HANDLERS ====================
  const handleBackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/production-sections/flattening");
  };

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate("/production-sections/flattening");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Cancel? All unsaved changes will be lost.")) {
      handleClose();
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all fields?")) {
      clearForm();
    }
  };

  // ==================== MEMOIZED VALUES ====================
  const availableShifts = useMemo(
    () =>
      [...new Set(targets.filter((t) => t.section_name === SECTION_NAME).map((t) => t.shift_code))].map(
        (code) => ({
          shift_code: code,
          shift_name: targets.find((t) => t.shift_code === code)?.shift_name || code,
        })
      ),
    [targets]
  );

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flattening-modal-overlay" onClick={handleClose}>
        <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading configuration data...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== RENDER ====================
  return (
    <div className="flattening-modal-overlay" onClick={handleClose}>
      <div className="flattening-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* ========== HEADER ========== */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <FiPackage />
            </div>
            <div className="header-text">
              <h1>FLATTENING PRODUCTION ENTRY</h1>
              <p>
                <FiDatabase /> Items: {items.length} • Targets: {targets.length}
              </p>
            </div>
          </div>
          <div className="header-actions">
            {/* BACK BUTTON */}
            <button
              type="button"
              className="back-button"
              onClick={handleBackClick}
              title="Back to Flattening Section"
            >
              <FiArrowLeft /> <span>{!isMobile && "BACK TO FLATTENING"}</span>
            </button>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              className="close-button"
              onClick={handleClose}
              title="Close"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* ========== FORM ========== */}
        <form onSubmit={handleSubmit}>
          {/* Messages */}
          {successMessage && (
            <div className="message success">
              <FiCheckCircle /> {successMessage}
            </div>
          )}
          {submitError && (
            <div className="message error">
              <FiAlertCircle /> {submitError}
            </div>
          )}
          {duplicateError && (
            <div className="message error">
              <div className="error-icon">!</div>
              <div>
                <strong>Duplicate Entry!</strong>
                <div>{duplicateError}</div>
              </div>
            </div>
          )}

          {/* Machine Completion Tracker */}
          {formData.shift_code && formData.production_date && (
            <div className="completion-tracker">
              <div className="tracker-header">
                <div className="tracker-title">
                  <FiTarget className="tracker-icon" />
                  <div className="tracker-text">
                    <div className="tracker-main-title">
                      {formData.shift_name} Shift Machine Completion
                    </div>
                    <div className="tracker-subtitle">
                      {formData.production_date === new Date().toISOString().split("T")[0]
                        ? "Today's progress"
                        : `Progress for ${formatDate(formData.production_date)}`}
                    </div>
                  </div>
                </div>
                <div
                  className={`completion-badge ${
                    machineCompletion.completionPercentage === 100 ? "completion-badge-full" : ""
                  }`}
                >
                  {machineCompletion.completedMachines} / {machineCompletion.totalMachines} Machines
                  <span className="completion-percentage">({machineCompletion.completionPercentage}%)</span>
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className={`progress-fill ${
                    machineCompletion.completionPercentage === 100 ? "progress-fill-complete" : ""
                  }`}
                  style={{ width: `${machineCompletion.completionPercentage}%` }}
                />
                <div className="machine-markers">
                  {machineCompletion.totalMachines > 0 &&
                    Array.from({ length: machineCompletion.totalMachines }).map((_, i) => {
                      const pos = ((i + 0.5) / machineCompletion.totalMachines) * 100;
                      const completed = i < machineCompletion.completedMachines;
                      return (
                        <div
                          key={i}
                          className={`machine-marker ${completed ? "machine-marker-completed" : ""}`}
                          style={{ left: `${pos}%` }}
                        >
                          {completed && <div className="marker-check">✓</div>}
                        </div>
                      );
                    })}
                </div>
              </div>

              {machineCompletion.shiftMachines.length > 0 && (
                <div className="machine-list-container">
                  <div className="machine-list-header">
                    <span className="machine-list-title">Machine Status:</span>
                    <div className="machine-list-counts">
                      <span className="completed-count">{machineCompletion.completedMachines} Completed</span>
                      <span className="count-separator">•</span>
                      <span className="pending-count">
                        {machineCompletion.totalMachines - machineCompletion.completedMachines} Pending
                      </span>
                    </div>
                  </div>
                  <div className="machine-grid">
                    {machineCompletion.shiftMachines.map((machineId) => {
                      const completed = machineCompletion.entriesForDate.includes(machineId);
                      const current = machineId === formData.machine_id;
                      return (
                        <div
                          key={machineId}
                          className={`machine-status ${
                            current ? "machine-status-current" : completed ? "machine-status-completed" : ""
                          }`}
                        >
                          {completed ? (
                            <FiCheckCircle className="machine-icon-completed" />
                          ) : (
                            <div className="machine-icon-pending" />
                          )}
                          <span className="machine-name">{machineId}</span>
                          {current && <div className="current-machine-indicator" />}
                        </div>
                      );
                    })}
                  </div>
                  {machineCompletion.completionPercentage === 100 && (
                    <div className="all-completed-message">
                      <FiCheckCircle className="all-completed-icon" />
                      <span>
                        All machines completed for {formData.shift_name} shift on {formData.production_date}! 🎉
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Target Section */}
          <div className="target-section">
            <h3 className="section-title">
              <FiTarget /> TARGET & MACHINE DETAILS
            </h3>
            <div className={`target-grid ${isMobile ? "mobile-grid" : ""}`}>
              {/* Production Date */}
              <div className="form-field">
                <label className="form-label required">
                  Production Date
                  {getFieldStatus("production_date", formData.production_date).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus("production_date", formData.production_date).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="input-with-icon">
                  <input
                    type="date"
                    name="production_date"
                    value={formData.production_date}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={getFieldClass("production_date", formData.production_date)}
                  />
                  <FiCalendar className="date-icon" />
                </div>
                {errors.production_date && <div className="error-text">{errors.production_date}</div>}
              </div>

              {/* Section Name */}
              <div className="form-field">
                <label className="form-label">
                  Section Name
                  {getFieldStatus("section_name", formData.section_name).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayClass("section_name", formData.section_name)}>
                  {formData.section_name}
                </div>
              </div>

              {/* Shift Code */}
              <div className="form-field">
                <label className="form-label required">
                  Shift
                  {getFieldStatus("shift_code", formData.shift_code).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus("shift_code", formData.shift_code).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="select-with-indicator">
                  <select
                    name="shift_code"
                    value={formData.shift_code}
                    onChange={handleChange}
                    className={getSelectClass("shift_code", formData.shift_code)}
                  >
                    <option value="">Select shift</option>
                    {availableShifts.map((shift) => (
                      <option key={shift.shift_code} value={shift.shift_code}>
                        {shift.shift_name} ({shift.shift_code})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.shift_code && <div className="error-text">{errors.shift_code}</div>}
              </div>

              {/* Shift Name */}
              <div className="form-field">
                <label className="form-label">
                  Shift Name
                  {getFieldStatus("shift_name", formData.shift_name).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayClass("shift_name", formData.shift_name)}>
                  {formData.shift_name || "Select Shift first"}
                </div>
              </div>

              {/* Machine ID */}
              <div className="form-field">
                <label className="form-label required">
                  Machine ID
                  {getFieldStatus("machine_id", formData.machine_id).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus("machine_id", formData.machine_id).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="select-with-indicator">
                  <select
                    name="machine_id"
                    value={formData.machine_id}
                    onChange={handleChange}
                    disabled={!formData.shift_code}
                    className={getSelectClass("machine_id", formData.machine_id)}
                  >
                    <option value="">
                      {formData.shift_code ? "Select machine" : "Select Shift first"}
                    </option>
                    {filteredTargets.map((target) => (
                      <option key={`${target.machine_id}-${target.machine_no}`} value={target.machine_id}>
                        {target.machine_id} (No: {target.machine_no})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.machine_id && <div className="error-text">{errors.machine_id}</div>}
              </div>

              {/* Machine Number */}
              <div className="form-field">
                <label className="form-label">
                  Machine Number
                  {getFieldStatus("machine_no", formData.machine_no).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayClass("machine_no", formData.machine_no)}>
                  {formData.machine_no || "Select Machine ID first"}
                </div>
              </div>

              {/* Target Quantity */}
              <div className="form-field">
                <label className="form-label required">
                  Target Quantity
                  {getFieldStatus("target_qty", formData.target_qty).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus("target_qty", formData.target_qty).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    name="target_qty"
                    value={formData.target_qty}
                    onChange={handleChange}
                    placeholder="Auto-filled"
                    min="0.01"
                    step="0.01"
                    disabled={!formData.machine_id}
                    className={getFieldClass("target_qty", formData.target_qty)}
                  />
                  <div className="input-unit">{formData.unit}</div>
                </div>
                {errors.target_qty && <div className="error-text">{errors.target_qty}</div>}
              </div>

              {/* Target ID */}
              <div className="form-field">
                <label className="form-label">
                  Target ID
                  {getFieldStatus("targets_id", formData.targets_id).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <div className={getDisplayClass("targets_id", formData.targets_id)}>
                  {formData.targets_id || "Auto-filled"}
                </div>
              </div>

              {/* Efficiency Box */}
              <div className="efficiency-box">
                <label className="form-label">
                  <FiActivity /> EFFICIENCY
                </label>
                <div
                  className="efficiency-value"
                  style={{ color: overallEfficiency > 0 ? getEfficiencyColor(overallEfficiency) : "#6b7280" }}
                >
                  {overallEfficiency.toFixed(1)}%
                </div>
                <div className="efficiency-label">
                  {getEfficiencyStatus(overallEfficiency)} {getEfficiencyIcon(overallEfficiency)}
                </div>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="items-section">
            <div className="items-header">
              <h3 className="section-title-secondary">
                <FiList /> PRODUCTION ITEMS ({itemsList.length})
              </h3>
              <button type="button" onClick={addItemRow} className="add-item-btn">
                <FiPlus /> {!isMobile && "ADD ITEM"}
              </button>
            </div>

            <div className={`table-container ${isMobile ? "mobile-table" : ""}`}>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>ITEM CODE</th>
                    <th>ITEM NAME</th>
                    {!isMobile && <th>COIL SIZE</th>}
                    {!isMobile && <th>MATERIAL TYPE</th>}
                    <th>QUANTITY</th>
                    <th>UNIT</th>
                    <th>EFFICIENCY</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {itemsList.map((item, index) => {
                    const itemError = itemErrors[index] || {};
                    return (
                      <tr key={item.id}>
                        <td>
                          <select
                            value={item.item_code}
                            onChange={(e) => handleItemChange(item.id, "item_code", e.target.value)}
                            className={`item-select ${itemError.item_code ? "error" : ""}`}
                          >
                            <option value="">Select item</option>
                            {items.map((itm) => (
                              <option key={itm.item_code} value={itm.item_code}>
                                {itm.item_code} {!isMobile && `- ${itm.item_name}`}
                              </option>
                            ))}
                          </select>
                          {itemError.item_code && <div className="error-text">{itemError.item_code}</div>}
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.item_name}
                            readOnly
                            className="item-input readonly"
                            placeholder={isMobile ? "Name" : ""}
                          />
                        </td>
                        {!isMobile && (
                          <td>
                            <input
                              type="text"
                              value={item.coil_size}
                              readOnly
                              className="item-input readonly"
                            />
                          </td>
                        )}
                        {!isMobile && (
                          <td>
                            <input
                              type="text"
                              value={item.material_type}
                              readOnly
                              className="item-input readonly"
                            />
                          </td>
                        )}
                        <td>
                          <div className="input-with-unit">
                            <input
                              type="number"
                              value={item.production_quantity}
                              onChange={(e) => handleItemChange(item.id, "production_quantity", e.target.value)}
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className={`item-input ${itemError.production_quantity ? "error" : ""}`}
                            />
                            <div className="input-unit">{item.unit}</div>
                          </div>
                          {itemError.production_quantity && (
                            <div className="error-text">{itemError.production_quantity}</div>
                          )}
                        </td>
                        <td className="unit-cell">{item.unit}</td>
                        <td
                          className="efficiency-cell"
                          style={{
                            color: item.efficiency > 0 ? getEfficiencyColor(item.efficiency) : "#6b7280",
                          }}
                        >
                          {item.efficiency.toFixed(1)}%
                        </td>
                        <td className="action-cell">
                          {itemsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemRow(item.id)}
                              className="remove-item-btn"
                              title="Remove Item"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Operator & Remarks */}
          <div className="bottom-section">
            <div className={`operator-row ${isMobile ? "mobile-operator" : ""}`}>
              <div className="form-group">
                <label className="form-label required">
                  <FiUser /> OPERATOR NAME
                  {getFieldStatus("operator_name", formData.operator_name).hasError && (
                    <FiAlertCircle className="error-indicator" />
                  )}
                  {getFieldStatus("operator_name", formData.operator_name).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <input
                  type="text"
                  value={formData.operator_name}
                  onChange={(e) => handleChange({ target: { name: "operator_name", value: e.target.value } })}
                  placeholder="Enter operator name"
                  list="operatorSuggestions"
                  className={getFieldClass("operator_name", formData.operator_name)}
                />
                <datalist id="operatorSuggestions">
                  {operators.map((op, idx) => (
                    <option key={idx} value={op} />
                  ))}
                </datalist>
                {errors.operator_name && <div className="error-text">{errors.operator_name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiFileText /> REMARKS
                  {getFieldStatus("remarks", formData.remarks).isFilled && (
                    <FiCheck className="success-indicator" />
                  )}
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Enter any additional notes..."
                  rows={isMobile ? "2" : "3"}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>

          {/* Overall Calculations */}
          <div className="overall-calculations">
            <h3 className="section-title-secondary">
              <FiBarChart2 /> OVERALL CALCULATIONS
            </h3>
            <div className={`calculation-box ${totalProduction > 0 || overallEfficiency > 0 ? "active" : ""}`}>
              <div className={`calculation-grid ${isMobile ? "mobile-grid" : ""}`}>
                <div className={`calculation-item ${totalProduction > 0 ? "active" : ""}`}>
                  <div className="calculation-label">
                    <FiPackage /> Total Production
                  </div>
                  <div className="calculation-value">
                    {totalProduction.toFixed(2)} <span className="calculation-unit">{formData.unit}</span>
                  </div>
                </div>
                <div className={`calculation-item ${overallEfficiency > 0 ? "active" : ""}`}>
                  <div className="calculation-label">
                    <FiActivity /> Overall Efficiency
                  </div>
                  <div className="calculation-value">{overallEfficiency.toFixed(2)}%</div>
                </div>
                <div className="calculation-item">
                  <div className="calculation-label">
                    <FiCpu /> Status
                  </div>
                  <div
                    className="calculation-value"
                    style={{
                      color: overallEfficiency > 0 ? getEfficiencyColor(overallEfficiency) : "#374151",
                      fontWeight: "700",
                    }}
                  >
                    {getEfficiencyStatus(overallEfficiency)} {getEfficiencyIcon(overallEfficiency)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="actions-section">
            <div className="total-info">
              <FiTrendingUp /> TOTAL: <span>{totalProduction.toFixed(2)} {formData.unit}</span>
            </div>
            <div className={`action-buttons ${isMobile ? "mobile-buttons" : ""}`}>
              <button type="button" onClick={handleReset} className="btn btn-reset">
                <FiRefreshCw /> {!isMobile && "RESET"}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-cancel">
                <FiX /> {!isMobile && "CANCEL"}
              </button>
              <button type="submit" disabled={isSubmitting} className="btn btn-submit">
                {isSubmitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    {!isMobile && "SAVING..."}
                  </>
                ) : (
                  <>
                    <FiSave /> {!isMobile && "SAVE"} ({itemsList.length})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* System Info */}
          <div className="database-info debug-info">
            <div className="info-header">
              <FiInfo /> SYSTEM INFORMATION
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-title">ITEMS</div>
                <div className="info-value">{items.length}</div>
                <div className="info-desc">Available items</div>
              </div>
              <div className="info-item">
                <div className="info-title">TARGETS</div>
                <div className="info-value">{targets.length}</div>
                <div className="info-desc">Active targets</div>
              </div>
              <div className="info-item">
                <div className="info-title">CONNECTION</div>
                <div
                  className="info-value"
                  style={{ color: items.length > 0 ? "#4ade80" : "#f87171" }}
                >
                  {items.length > 0 ? "● ONLINE" : "● OFFLINE"}
                </div>
                <div className="info-desc">Supabase</div>
              </div>
            </div>
          </div>
        </form>

        {/* Mobile Floating Back Button */}
        {isMobile && (
          <div className="mobile-floating-back">
            <button type="button" className="floating-back-btn" onClick={handleBackClick}>
              <FiArrowLeft /> Back to Flattening
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlatteningForm;