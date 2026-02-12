// src/components/charts/ProductionPieChart.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { useTheme } from "../../contexts/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProductionPieChart = ({
  title = "Production Overview",
  labels = [],
  currentData = [],
  previousData = [],
  unit = "kg",
  height = 420
}) => {
  const { isDarkMode } = useTheme();
  const chartRef = useRef();

  /* -------------------- Time Filter -------------------- */
  const [range, setRange] = useState("Monthly");

  /* -------------------- Utilities -------------------- */

  const format = (n) =>
    Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 });

  const defaultLabels = ["Wire A", "Wire B", "Wire C", "Wire D"];
  const defaultCurrent = [40, 25, 20, 15];
  const defaultPrevious = [30, 20, 25, 10];

  const resolvedLabels = labels.length ? labels : defaultLabels;
  const resolvedCurrent = currentData.length
    ? currentData
    : defaultCurrent;
  const resolvedPrevious = previousData.length
    ? previousData
    : defaultPrevious;

  const totalCurrent = useMemo(
    () => resolvedCurrent.reduce((a, b) => a + b, 0),
    [resolvedCurrent]
  );

  const totalPrevious = useMemo(
    () => resolvedPrevious.reduce((a, b) => a + b, 0),
    [resolvedPrevious]
  );

  const growth =
    totalPrevious > 0
      ? (((totalCurrent - totalPrevious) / totalPrevious) * 100).toFixed(1)
      : 0;

  /* -------------------- Animated Counter -------------------- */

  const [animatedTotal, setAnimatedTotal] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 700;
    const step = totalCurrent / (duration / 16);

    const counter = setInterval(() => {
      start += step;
      if (start >= totalCurrent) {
        setAnimatedTotal(totalCurrent);
        clearInterval(counter);
      } else {
        setAnimatedTotal(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [totalCurrent]);

  /* -------------------- Professional Palette -------------------- */

  const palette = isDarkMode
    ? ["#4FC3F7", "#29B6F6", "#03A9F4", "#0288D1"]
    : ["#1A237E", "#283593", "#303F9F", "#3949AB"];

  /* -------------------- Multi Ring Dataset -------------------- */

  const chartData = useMemo(
    () => ({
      labels: resolvedLabels,
      datasets: [
        {
          label: "Current",
          data: resolvedCurrent,
          backgroundColor: palette,
          borderWidth: 2,
          borderColor: isDarkMode ? "#111" : "#fff",
          weight: 2
        },
        {
          label: "Previous",
          data: resolvedPrevious,
          backgroundColor: palette.map((c) =>
            c + "55"
          ),
          borderWidth: 0,
          weight: 1
        }
      ]
    }),
    [resolvedLabels, resolvedCurrent, resolvedPrevious, palette, isDarkMode]
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "55%",
    animation: {
      duration: 1000,
      easing: "easeOutQuart"
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            const dataset = ctx.dataset.label;
            return `${dataset}: ${format(value)} ${unit}`;
          }
        }
      }
    }
  };

  /* -------------------- Export PNG -------------------- */

  const exportPNG = () => {
    const chart = chartRef.current;
    if (!chart) return;
    const url = chart.toBase64Image();
    const link = document.createElement("a");
    link.download = "production-chart.png";
    link.href = url;
    link.click();
  };

  /* -------------------- UI -------------------- */

  return (
    <div
      style={{
        height,
        background: isDarkMode ? "#181825" : "#fff",
        borderRadius: 22,
        padding: 30,
        boxShadow: isDarkMode
          ? "0 12px 40px rgba(0,0,0,0.5)"
          : "0 12px 40px rgba(0,0,0,0.08)"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 28
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <div style={{ fontSize: 13, opacity: 0.6 }}>
            {range} Production Analysis
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {/* Time Filter */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 8
            }}
          >
            <option>Today</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>

          {/* Export */}
          <button
            onClick={exportPNG}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Export
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "80%" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Pie ref={chartRef} data={chartData} options={options} />

          {/* Center Info */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 700 }}>
              {format(animatedTotal)} {unit}
            </div>

            <div
              style={{
                fontSize: 14,
                marginTop: 4,
                color:
                  growth >= 0
                    ? "#4CAF50"
                    : "#F44336"
              }}
            >
              {growth >= 0 ? "▲" : "▼"} {Math.abs(growth)}%
            </div>
          </div>
        </div>

        {/* Side Summary */}
        <div style={{ width: 260, marginLeft: 30 }}>
          {resolvedLabels.map((label, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14
              }}
            >
              <span>{label}</span>
              <strong>
                {format(resolvedCurrent[i])} {unit}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductionPieChart;
