// src/components/charts/ProductionAnalyticsWidget.jsx
import React, { useMemo, useState, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale
} from "chart.js";
import { Pie, PolarArea } from "react-chartjs-2";
import { useTheme } from "../../contexts/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale);

const ProductionAnalyticsWidget = ({
  title = "Production Intelligence",
  labels = [],
  currentData = [],
  previousData = [],
  unit = "kg",
  height = 460
}) => {
  const { isDarkMode } = useTheme();
  const chartRef = useRef();

  const [chartType, setChartType] = useState("doughnut");
  const [activeIndex, setActiveIndex] = useState(null);

  /* -------------------- Defaults -------------------- */

  const defaultLabels = ["Wire A", "Wire B", "Wire C", "Wire D"];
  const defaultCurrent = [50, 30, 15, 5];
  const defaultPrevious = [40, 28, 20, 12];

  const resolvedLabels = labels.length ? labels : defaultLabels;
  const resolvedCurrent = currentData.length ? currentData : defaultCurrent;
  const resolvedPrevious = previousData.length ? previousData : defaultPrevious;

  const totalCurrent = resolvedCurrent.reduce((a, b) => a + b, 0);
  const totalPrevious = resolvedPrevious.reduce((a, b) => a + b, 0);

  const growth =
    totalPrevious > 0
      ? (((totalCurrent - totalPrevious) / totalPrevious) * 100).toFixed(1)
      : 0;

  /* -------------------- Anomaly Detection -------------------- */

  const anomaly = growth > 25 || growth < -20;

  /* -------------------- Palette -------------------- */

  const palette = isDarkMode
    ? ["#4FC3F7", "#29B6F6", "#03A9F4", "#0288D1"]
    : ["#1A237E", "#283593", "#303F9F", "#3949AB"];

  const chartData = {
    labels: resolvedLabels,
    datasets: [
      {
        data: resolvedCurrent,
        backgroundColor: palette,
        borderColor: isDarkMode ? "#111" : "#fff",
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: chartType !== "polar" ? "60%" : undefined,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${ctx.raw.toLocaleString()} ${unit}`
        }
      }
    },
    onClick: (_, elements) => {
      if (elements.length > 0) {
        setActiveIndex(elements[0].index);
      }
    }
  };

  /* -------------------- Export -------------------- */

  const exportPNG = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const link = document.createElement("a");
    link.download = "production-analytics.png";
    link.href = chart.toBase64Image();
    link.click();
  };

  const exportCSV = () => {
    const rows = resolvedLabels.map(
      (label, i) =>
        `${label},${resolvedCurrent[i]},${resolvedPrevious[i]}`
    );
    const csv = `Label,Current,Previous\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "production-data.csv";
    link.click();
  };

  /* -------------------- Render -------------------- */

  const ChartComponent =
    chartType === "polar" ? PolarArea : Pie;

  return (
    <div
      style={{
        height,
        background: isDarkMode ? "#181825" : "#fff",
        borderRadius: 24,
        padding: 32,
        boxShadow: isDarkMode
          ? "0 15px 45px rgba(0,0,0,0.6)"
          : "0 15px 45px rgba(0,0,0,0.08)"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ fontSize: 13, opacity: 0.6 }}>
            Growth:{" "}
            <span
              style={{
                color: growth >= 0 ? "#4CAF50" : "#F44336",
                fontWeight: 600
              }}
            >
              {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
            </span>
            {anomaly && (
              <span
                style={{
                  marginLeft: 10,
                  background: "#FF9800",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "#fff"
                }}
              >
                Anomaly Detected
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="doughnut">Doughnut</option>
            <option value="pie">Pie</option>
            <option value="polar">Polar</option>
          </select>

          <button onClick={exportPNG}>PNG</button>
          <button onClick={exportCSV}>CSV</button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: "75%", marginTop: 30 }}>
        <ChartComponent
          ref={chartRef}
          data={chartData}
          options={options}
        />
      </div>

      {/* Drill Down Panel */}
      {activeIndex !== null && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            background: isDarkMode
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.04)"
          }}
        >
          <strong>{resolvedLabels[activeIndex]}</strong>
          <div style={{ marginTop: 6 }}>
            Current: {resolvedCurrent[activeIndex]} {unit}
          </div>
          <div>
            Previous: {resolvedPrevious[activeIndex]} {unit}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionAnalyticsWidget;
