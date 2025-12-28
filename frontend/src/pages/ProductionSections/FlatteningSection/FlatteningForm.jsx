// ========================================================
// FILE: FlatteningForm.jsx
// PURPOSE: Production Entry Form for Flattening Section
// FINAL VERSION: Works on Local, Web & Mobile
// ========================================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSave,
  FiX,
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
  FiArrowLeft,
  FiEdit2, // مشین چینج کے بٹن کے لیے واپس لایا
} from "react-icons/fi";
import { supabase } from "../../../supabaseClient";
import "./FlatteningForm.css";

const FlatteningForm = ({ onClose, isModal = true }) => {
  const navigate = useNavigate();

  // States
  const [targetData, setTargetData] = useState({
    targets_id: "",
    machine_id: "",
    machine_no: "",
    shift_code: "",
    shift_name: "",
    target_qty: 0,
    unit: "Kg",
  });

  const [itemsList, setItemsList] = useState([
    {
      id: 1,
      item_code: "",
      item_name: "",
      coil_size: "",
      material_type: "",
      production_quantity: "",
      unit: "Kg",
      efficiency: 0,
    },
  ]);

  const [operatorName, setOperatorName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [totalProduction, setTotalProduction] = useState(0);
  const [overallEfficiency, setOverallEfficiency] = useState(0);

  const [validationErrors, setValidationErrors] = useState({});
  const [fieldStatus, setFieldStatus] = useState({});

  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showMachineChange, setShowMachineChange] = useState(false); // مشین چینج سٹیٹ

  // ==================== CHECK MOBILE ====================
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ==================== DEBUG FUNCTION ====================
  const debugLog = (message, data) => {
    console.log(`🔍 FLATTENING DEBUG - ${message}:`, data);
  };

  // ==================== CALCULATIONS ====================
  const calculateOverallEfficiency = useCallback(() => {
    if (targetData.target_qty > 0 && totalProduction > 0) {
      const overallEff = (totalProduction / targetData.target_qty) * 100;
      setOverallEfficiency(Math.min(100, parseFloat(overallEff.toFixed(2))));
    } else {
      setOverallEfficiency(0);
    }
  }, [targetData.target_qty, totalProduction]);

  // ==================== DATA FETCHING ====================
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      debugLog("Fetching started from environment", window.location.href);

      // Fetch items
      const { data: itemsData } = await supabase
        .from("items")
        .select("*")
        .order("item_name");

      // Fetch targets - تمام فیلڈز ساتھ لائیں
      const { data: targetsData } = await supabase
        .from("targets")
        .select("*")
        .order("id", { ascending: true });

      debugLog("Items fetched", itemsData?.length || 0);
      debugLog("Targets fetched", targetsData?.length || 0);

      // ڈیبگ: پہلے ٹارگٹ کا ڈیٹا دیکھیں
      if (targetsData && targetsData.length > 0) {
        console.log("📋 First target data:", targetsData[0]);
        console.log(
          "🔑 Available keys in target:",
          Object.keys(targetsData[0])
        );

        // مشین نمبر کے ممکنہ فیلڈز چیک کریں
        targetsData.forEach((target, index) => {
          if (index < 3) {
            // صرف پہلے 3 ٹارگٹ دکھائیں
            console.log(`🎯 Target ${index}:`, {
              id: target.id,
              targets_id: target.targets_id,
              machine_id: target.machine_id,
              machine_no: target.machine_no,
              machine_number: target.machine_number,
              machine_code: target.machine_code,
              machine: target.machine,
              machineName: target.machine_name,
              allKeys: Object.keys(target),
            });
          }
        });
      }

      setTargets(targetsData || []);
      setItems(itemsData || []);
    } catch (error) {
      console.error("❌ Data fetching error:", error);
      setError("Data loading failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    calculateOverallEfficiency();
  }, [calculateOverallEfficiency]);

  // ==================== TARGET HANDLING ====================
  const handleTargetChange = (e) => {
    const selectedTargetsId = e.target.value;

    const newStatus = { ...fieldStatus };
    if (selectedTargetsId) {
      newStatus.targets_id = "filled-valid";
    } else {
      newStatus.targets_id = "empty-required";
    }
    setFieldStatus(newStatus);

    if (!selectedTargetsId) {
      setTargetData({
        targets_id: "",
        machine_id: "",
        machine_no: "",
        shift_code: "",
        shift_name: "",
        target_qty: 0,
        unit: "Kg",
      });
      setTotalProduction(0);
      setOverallEfficiency(0);
      return;
    }

    const target = targets.find((t) => {
      return (
        t.targets_id === selectedTargetsId ||
        t.id === selectedTargetsId ||
        t.target_id === selectedTargetsId
      );
    });

    if (target) {
      const newTargetData = {
        targets_id: target.targets_id || target.id || target.target_id || "",
        machine_id: target.machine_id || target.machine || "",

        // مشین نمبر کو ٹھیک سے سیٹ کریں
        machine_no:
          target.machine_no ||
          target.machine_number ||
          target.machine_code ||
          "",

        shift_code: target.shift_code || target.shift || "",
        shift_name: target.shift_name || target.shift_name || "",
        target_qty: parseFloat(
          target.target_qty || target.quantity || target.qty || 0
        ),
        unit: target.uom || target.unit || "Kg",
      };

      console.log("🔍 Target found:", target);
      console.log("📊 Target data:", newTargetData);

      setTargetData(newTargetData);

      const updatedItems = itemsList.map((item) => {
        if (item.production_quantity) {
          const quantityNum = parseFloat(item.production_quantity) || 0;
          const efficiency =
            newTargetData.target_qty > 0
              ? (quantityNum / newTargetData.target_qty) * 100
              : 0;

          return {
            ...item,
            efficiency: Math.min(100, parseFloat(efficiency.toFixed(2))),
          };
        }
        return item;
      });

      setItemsList(updatedItems);
    } else {
      console.log("❌ No target found for ID:", selectedTargetsId);
    }
  };

  // ==================== MACHINE CHANGE HANDLER ====================
  const handleMachineChange = () => {
    setShowMachineChange(true);
  };

  const handleMachineSelect = (machineNo) => {
    setTargetData((prev) => ({
      ...prev,
      machine_no: machineNo,
      machine_id: `MACH-${machineNo}`,
    }));
    setShowMachineChange(false);
  };

  // ==================== ITEM HANDLING ====================
  const handleItemChange = (id, itemCode) => {
    const updatedItems = itemsList.map((item) => {
      if (item.id === id) {
        const selectedItem = items.find((i) => i.item_code === itemCode);

        if (selectedItem) {
          const newStatus = { ...fieldStatus };
          newStatus[`item_${id}`] = "filled-valid";
          setFieldStatus(newStatus);

          return {
            ...item,
            item_code: itemCode,
            item_name: selectedItem.item_name || selectedItem.name || "",
            coil_size: selectedItem.coil_size || selectedItem.size || "",
            material_type:
              selectedItem.material_type || selectedItem.material || "",
            unit: selectedItem.unit || "Kg",
          };
        }
      }
      return item;
    });

    setItemsList(updatedItems);
  };

  const handleQuantityChange = (id, quantity) => {
    const quantityNum = parseFloat(quantity) || 0;

    const updatedItems = itemsList.map((item) => {
      if (item.id === id) {
        const newStatus = { ...fieldStatus };
        if (quantity && quantity.trim() !== "") {
          newStatus[`quantity_${id}`] = "filled-valid";
        } else {
          newStatus[`quantity_${id}`] = "empty-required";
        }
        setFieldStatus(newStatus);

        const efficiency =
          targetData.target_qty > 0
            ? (quantityNum / targetData.target_qty) * 100
            : 0;

        return {
          ...item,
          production_quantity: quantity,
          efficiency: Math.min(100, parseFloat(efficiency.toFixed(2))),
        };
      }
      return item;
    });

    setItemsList(updatedItems);

    const total = updatedItems.reduce((sum, item) => {
      return sum + (parseFloat(item.production_quantity) || 0);
    }, 0);

    setTotalProduction(total);
  };

  // ==================== FORM INPUT HANDLERS ====================
  const handleOperatorChange = (value) => {
    const newStatus = { ...fieldStatus };
    if (value && value.trim() !== "") {
      newStatus.operator_name = "filled-valid";
    } else {
      newStatus.operator_name = "empty-required";
    }
    setFieldStatus(newStatus);
    setOperatorName(value);
  };

  const handleRemarksChange = (value) => {
    const newStatus = { ...fieldStatus };
    if (value && value.trim() !== "") {
      newStatus.remarks = "filled-valid";
    } else {
      newStatus.remarks = "";
    }
    setFieldStatus(newStatus);
    setRemarks(value);
  };

  // ==================== ITEM ROW MANAGEMENT ====================
  const addItemRow = () => {
    const newId =
      itemsList.length > 0 ? Math.max(...itemsList.map((i) => i.id)) + 1 : 1;
    setItemsList([
      ...itemsList,
      {
        id: newId,
        item_code: "",
        item_name: "",
        coil_size: "",
        material_type: "",
        production_quantity: "",
        unit: "Kg",
        efficiency: 0,
      },
    ]);
  };

  const removeItemRow = (id) => {
    if (itemsList.length > 1) {
      const newItemsList = itemsList.filter((item) => item.id !== id);
      setItemsList(newItemsList);

      const total = newItemsList.reduce((sum, item) => {
        return sum + (parseFloat(item.production_quantity) || 0);
      }, 0);

      setTotalProduction(total);
    }
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const errors = {};
    const newFieldStatus = {};

    if (!targetData.targets_id) {
      errors.targets_id = "Target ID is required";
      newFieldStatus.targets_id = "empty-required";
    } else {
      newFieldStatus.targets_id = "filled-valid";
    }

    if (!operatorName.trim()) {
      errors.operator_name = "Operator name is required";
      newFieldStatus.operator_name = "empty-required";
    } else {
      newFieldStatus.operator_name = "filled-valid";
    }

    itemsList.forEach((item, index) => {
      if (!item.item_code) {
        errors[`item_${item.id}`] = `Item ${index + 1} is required`;
        newFieldStatus[`item_${item.id}`] = "empty-required";
      } else {
        newFieldStatus[`item_${item.id}`] = "filled-valid";
      }

      if (
        !item.production_quantity ||
        parseFloat(item.production_quantity) <= 0
      ) {
        errors[`quantity_${item.id}`] = `Valid quantity for item ${
          index + 1
        } is required`;
        newFieldStatus[`quantity_${item.id}`] = "empty-required";
      } else {
        newFieldStatus[`quantity_${item.id}`] = "filled-valid";
      }
    });

    setFieldStatus(newFieldStatus);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fill all required fields");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // آپ کے ڈیٹا بیس میں صرف یہ 15 کالم ہیں
      const records = itemsList.map((item) => ({
        section_name: "Flattening",
        targets_id: targetData.targets_id,
        machine_id: targetData.machine_id,
        machine_no: targetData.machine_no,
        item_code: item.item_code,
        item_name: item.item_name,
        coil_size: item.coil_size,
        material_type: item.material_type,
        operator_name: operatorName.trim(),
        production_quantity: parseFloat(item.production_quantity),
        unit: item.unit,
        efficiency: item.efficiency,
        shift_code: targetData.shift_code,
        target_qty: targetData.target_qty,
        shift_name: targetData.shift_name,
        remarks: remarks?.trim() || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      console.log("📝 Saving records:", records);

      const { error: insertError } = await supabase
        .from("flatteningsection")
        .insert(records);

      if (insertError) {
        console.error("❌ Supabase insert error:", insertError);
        throw insertError;
      }

      setSuccess(`✅ ${records.length} record(s) saved successfully!`);

      setTimeout(() => {
        handleReset();
        setSuccess("");
      }, 2000);
    } catch (error) {
      console.error("❌ Save error:", error);
      setError("❌ Save failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== FORM RESET ====================
  const handleReset = () => {
    setTargetData({
      targets_id: "",
      machine_id: "",
      machine_no: "",
      shift_code: "",
      shift_name: "",
      target_qty: 0,
      unit: "Kg",
    });

    setItemsList([
      {
        id: 1,
        item_code: "",
        item_name: "",
        coil_size: "",
        material_type: "",
        production_quantity: "",
        unit: "Kg",
        efficiency: 0,
      },
    ]);

    setOperatorName("");
    setRemarks("");
    setTotalProduction(0);
    setOverallEfficiency(0);
    setShowMachineChange(false);

    setValidationErrors({});
    setFieldStatus({});
    setError("");
    setSuccess("");
  };

  // ==================== BACK BUTTON HANDLER ====================
  const handleBackClick = () => {
    navigate("/production-sections/flattening");
  };

  // ==================== UI HELPERS ====================
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return "#27ae60";
    if (efficiency >= 80) return "#f39c12";
    if (efficiency >= 70) return "#e67e22";
    return "#e74c3c";
  };

  const getEfficiencyStatus = (efficiency) => {
    if (efficiency >= 90) return "Excellent";
    if (efficiency >= 80) return "Good";
    if (efficiency >= 70) return "Average";
    return "Below Target";
  };

  const getFieldClass = (fieldName, value) => {
    if (!value || value.toString().trim() === "") {
      return "empty-required";
    }
    return "filled-valid";
  };

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate("/production-sections/flattening");
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flattening-modal-overlay" onClick={handleClose}>
        <div
          className="flattening-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading Production Form...</p>
            <div className="loading-details">
              <p>🔄 Fetching data from: {window.location.hostname}</p>
              <p>📊 Checking database connection...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="flattening-modal-overlay" onClick={handleClose}>
      <div
        className="flattening-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER - WHITE TEXT WITH BACK BUTTON */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">
              <FiPackage />
            </div>
            <div className="header-text">
              <h1>FLATTENING PRODUCTION ENTRY</h1>
              <p>
                <FiDatabase /> Data Loaded: {items.length} items,{" "}
                {targets.length} targets
                {isMobile && <span className="mobile-indicator">📱</span>}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button
              className="back-button"
              onClick={handleBackClick}
              title="Back to Flattening Section"
            >
              <FiArrowLeft /> {!isMobile && "BACK TO FLATTENING"}
            </button>
            <button className="close-button" onClick={handleClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        {success && (
          <div className="message success">
            <FiCheck /> {success}
          </div>
        )}

        {error && (
          <div className="message error">
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* TARGET SECTION */}
          <div className="target-section">
            <div className="section-title">
              <FiTarget /> TARGET & MACHINE DETAILS
            </div>

            <div className={`target-grid ${isMobile ? "mobile-grid" : ""}`}>
              {/* Target Selection */}
              <div className="selection-box">
                <label className="selection-label required">
                  <FiTarget /> TARGET ID
                </label>
                <select
                  value={targetData.targets_id}
                  onChange={handleTargetChange}
                  className={`form-select ${
                    fieldStatus.targets_id ||
                    getFieldClass("targets_id", targetData.targets_id)
                  }`}
                >
                  <option value="">
                    -- SELECT TARGET ({targets.length} available) --
                  </option>
                  {targets.map((target) => {
                    const displayId =
                      target.targets_id ||
                      target.id ||
                      target.target_id ||
                      "No ID";
                    const displayName = target.target_name || target.name || "";
                    return (
                      <option key={displayId} value={displayId}>
                        {displayId} {displayName ? `- ${displayName}` : ""}
                      </option>
                    );
                  })}
                </select>
                {validationErrors.targets_id && (
                  <span className="error-text">
                    {validationErrors.targets_id}
                  </span>
                )}
              </div>

              {/* Auto-filled fields */}
              <div className="selection-box">
                <label className="selection-label">MACHINE ID</label>
                <input
                  type="text"
                  value={targetData.machine_id}
                  readOnly
                  className="selection-input readonly"
                />
              </div>

              <div className="selection-box">
                <label className="selection-label">MACHINE NO</label>
                <div className="machine-no-container">
                  <input
                    type="text"
                    value={targetData.machine_no}
                    readOnly
                    className="selection-input readonly"
                  />
                  {/* مشین چینج کا بٹن واپس لایا */}
                  <button
                    type="button"
                    onClick={handleMachineChange}
                    className="machine-change-btn"
                    title="Change Machine"
                  >
                    <FiEdit2 />
                  </button>
                </div>
              </div>

              <div className="selection-box">
                <label className="selection-label">SHIFT CODE</label>
                <input
                  type="text"
                  value={targetData.shift_code}
                  readOnly
                  className="selection-input readonly"
                />
              </div>

              <div className="selection-box target-qty-box">
                <label className="selection-label">TARGET QTY</label>
                <div className="target-qty-value">
                  {targetData.target_qty.toFixed(2)} {targetData.unit}
                </div>
              </div>

              <div className="selection-box efficiency-box">
                <label className="selection-label">
                  <FiTrendingUp /> EFFICIENCY
                </label>
                <div
                  className="efficiency-value"
                  style={{ color: getEfficiencyColor(overallEfficiency) }}
                >
                  {overallEfficiency.toFixed(1)}%
                </div>
                <div className="efficiency-label">
                  {getEfficiencyStatus(overallEfficiency)}
                </div>
              </div>
            </div>

            {/* مشین چینج کا پاپ اپ */}
            {showMachineChange && (
              <div className="machine-change-popup">
                <div className="popup-header">
                  <h3>Select Machine</h3>
                  <button
                    className="close-popup"
                    onClick={() => setShowMachineChange(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <div className="machine-options">
                  <button
                    className="machine-option"
                    onClick={() => handleMachineSelect("1")}
                  >
                    Machine 1
                  </button>
                  <button
                    className="machine-option"
                    onClick={() => handleMachineSelect("2")}
                  >
                    Machine 2
                  </button>
                  <button
                    className="machine-option"
                    onClick={() => handleMachineSelect("3")}
                  >
                    Machine 3
                  </button>
                  <button
                    className="machine-option"
                    onClick={() => handleMachineSelect("4")}
                  >
                    Machine 4
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ITEMS SECTION */}
          <div className="items-section">
            <div className="items-header">
              <div className="section-title-secondary">
                <FiList /> ITEMS PRODUCTION
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="add-item-btn"
              >
                <FiPlus /> {!isMobile && "ADD ITEM"}
              </button>
            </div>

            <div
              className={`table-container ${isMobile ? "mobile-table" : ""}`}
            >
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
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <select
                          value={item.item_code}
                          onChange={(e) =>
                            handleItemChange(item.id, e.target.value)
                          }
                          className={`item-select ${
                            fieldStatus[`item_${item.id}`] ||
                            getFieldClass("item_code", item.item_code)
                          }`}
                        >
                          <option value="">-- SELECT ITEM --</option>
                          {items.map((itm) => (
                            <option key={itm.item_code} value={itm.item_code}>
                              {itm.item_code}{" "}
                              {!isMobile && `- ${itm.item_name || itm.name}`}
                            </option>
                          ))}
                        </select>
                        {validationErrors[`item_${item.id}`] && (
                          <div className="error-text">
                            {validationErrors[`item_${item.id}`]}
                          </div>
                        )}
                      </td>

                      <td>
                        <input
                          type="text"
                          value={item.item_name}
                          readOnly
                          className="item-input readonly"
                          placeholder={isMobile ? "Item name" : ""}
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
                        <input
                          type="number"
                          value={item.production_quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          step="0.01"
                          min="0"
                          className={`item-input quantity-input ${
                            fieldStatus[`quantity_${item.id}`] ||
                            getFieldClass("quantity", item.production_quantity)
                          }`}
                          placeholder="0.00"
                        />
                        {validationErrors[`quantity_${item.id}`] && (
                          <div className="error-text">
                            {validationErrors[`quantity_${item.id}`]}
                          </div>
                        )}
                      </td>

                      <td className="unit-cell">{item.unit}</td>

                      <td
                        className="efficiency-cell"
                        style={{
                          color: getEfficiencyColor(item.efficiency),
                          backgroundColor:
                            getEfficiencyColor(item.efficiency) + "20",
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* OPERATOR & REMARKS */}
          <div className="bottom-section">
            <div
              className={`operator-row ${isMobile ? "mobile-operator" : ""}`}
            >
              <div className="form-group">
                <label className="form-label required">
                  <FiUser /> OPERATOR NAME
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => handleOperatorChange(e.target.value)}
                  className={`item-input ${
                    fieldStatus.operator_name ||
                    getFieldClass("operator_name", operatorName)
                  }`}
                  placeholder="Enter operator name"
                />
                {validationErrors.operator_name && (
                  <span className="error-text">
                    {validationErrors.operator_name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiClipboard /> REMARKS
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => handleRemarksChange(e.target.value)}
                  className="form-textarea"
                  placeholder="Enter any additional notes or remarks..."
                  rows={isMobile ? "2" : "3"}
                />
              </div>
            </div>
          </div>

          {/* FORM ACTIONS WITH BACK BUTTON */}
          <div className="actions-section">
            <div className="total-info">
              <FiTrendingUp /> TOTAL:
              <span>
                {" "}
                {totalProduction.toFixed(2)} {targetData.unit}
              </span>
            </div>

            <div
              className={`action-buttons ${isMobile ? "mobile-buttons" : ""}`}
            >
              {/* BACK BUTTON ADDED HERE */}
              <button
                type="button"
                onClick={handleBackClick}
                className="btn btn-back"
              >
                <FiArrowLeft /> {!isMobile && "BACK"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="btn btn-reset"
              >
                <FiRefreshCw /> {!isMobile && "RESET"}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="btn btn-cancel"
              >
                <FiX /> {!isMobile && "CANCEL"}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn btn-submit"
              >
                {saving ? (
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
        </form>

        {/* DEBUG INFO */}
        <div className="database-info debug-info">
          <div className="info-header">
            <FiInfo /> SYSTEM INFORMATION
          </div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-title">ENVIRONMENT</div>
              <div className="info-value">
                {window.location.href.includes("localhost") ? "LOCAL" : "WEB"}
                {isMobile && " | MOBILE"}
              </div>
              <div className="info-desc">Host: {window.location.hostname}</div>
            </div>
            <div className="info-item">
              <div className="info-title">ITEMS</div>
              <div className="info-value">{items.length} items</div>
              <div className="info-desc">Available for selection</div>
            </div>
            <div className="info-item">
              <div className="info-title">TARGETS</div>
              <div className="info-value">{targets.length} targets</div>
              <div className="info-desc">Loaded from database</div>
            </div>
            <div className="info-item">
              <div className="info-title">CONNECTION</div>
              <div className="info-value">
                <span
                  style={{ color: items.length > 0 ? "#27ae60" : "#e74c3c" }}
                >
                  {items.length > 0 ? "● CONNECTED" : "● ERROR"}
                </span>
              </div>
              <div className="info-desc">Supabase Database</div>
            </div>
          </div>
        </div>

        {/* MOBILE FLOATING BACK BUTTON */}
        {isMobile && (
          <div className="mobile-floating-back">
            <button className="floating-back-btn" onClick={handleBackClick}>
              <FiArrowLeft /> Back to Flattening
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlatteningForm;
