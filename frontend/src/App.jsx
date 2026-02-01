// src/App.jsx - COMPLETE FILE
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import "./styles/global.css";
import "./output.css";
import Layout from "./components/common/Layout";
import ProtectedRoute from "./pages/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ThemeSettings from "./components/Settings/ThemeSettings";
import Dashboard from "./pages/dashboard/Dashboard";
import HRDashboard from "./pages/departments/HR/HRDashboard";
import FinanceDashboard from "./pages/departments/Finance/FinanceDashboard";
import SalesDashboard from "./pages/departments/Sales/SalesDashboard";
import ITDashboard from "./pages/departments/IT/ITDashboard";
import LogisticsDashboard from "./pages/departments/Logistics/LogisticsDashboard";
import ProductionDashboard from "./components/departments/Production/ProductionDashboard";
import NewProductionDashboard from "./components/departments/Production/NewProductionDashboard";
import ProductionSections from "./pages/ProductionSections/Production";
import FlatteningPage from "./pages/ProductionSections/FlatteningSection/FlatteningPage";
import FlatteningForm from "./pages/ProductionSections/FlatteningSection/FlatteningForm";
import FlatteningEditForm from "./pages/ProductionSections/FlatteningSection/FlatteningEditForm";
import FlatteningView from "./pages/ProductionSections/FlatteningSection/FlatteningView";
import FlatteningSmartForm from "./pages/ProductionSections/FlatteningSection/FlatteningSmartForm";
import FlatteningMultiEntryForm from "./pages/ProductionSections/FlatteningSection/FlatteningMultiEntryForm"; // Added import
import SpiralPage from "./pages/ProductionSections/SpiralSection/SpiralPage";
import SpiralForm from "./pages/ProductionSections/SpiralSection/SpiralForm";
import SpiralEditForm from "./pages/ProductionSections/SpiralSection/SpiralEditForm";
import SpiralView from "./pages/ProductionSections/SpiralSection/SpiralView";
import SpiralSmartForm from "./pages/ProductionSections/SpiralSection/SpiralSmartForm";
import SpiralMultiEntryForm from "./pages/ProductionSections/SpiralSection/SpiralMultiEntryForm";
import RawMaterialPage from "./pages/ProductionSections/RawMaterialSection/RawMaterialPage";
import RawMaterialLogForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialLogForm";
import MaterialReceivedForm from "./pages/ProductionSections/RawMaterialSection/MaterialReceivedForm";
import MaterialIssueForm from "./pages/ProductionSections/RawMaterialSection/MaterialIssueForm";
import RawMaterialEditForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialEditForm";
import RawMaterialForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialForm";
import PVCCoatingPage from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingPage";
import PVCCoatingForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingForm";
import PVCCoatingEditForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingEditForm";
import PVCCoatingView from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingView";
import PVCSmartForm from "./pages/ProductionSections/PVCCoatingSection/PVCSmartForm";
import PVCCoatingMultiEntryForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingMultiEntryForm";
import DailyProductionReport from "./pages/ProductionReports/DailyProductionReport";
import FlatteningInventoryReport from "./components/FlatteningInventoryReport";
import FlatteningInventoryLedger from "./components/FlatteningInventoryLedger";

// تھیم انیشیلائزیشن کمپوننٹ
const ThemeInitializer = ({ children }) => {
  const { currentTheme, mode, isDarkMode } = useTheme();

  useEffect(() => {
    // تھیم کلاسز کو body پر اپلائی کریں
    document.body.classList.remove(
      "theme-light",
      "theme-dark",
      "light-mode",
      "dark-mode",
    );
    document.body.classList.add(`theme-${mode}`, `${mode}-mode`);

    if (currentTheme) {
      document.body.setAttribute("data-theme", currentTheme.id);
      document.body.setAttribute("data-theme-mode", mode);
    }

    console.log(`Theme initialized: ${currentTheme?.name} (${mode})`);
  }, [currentTheme, mode]);

  return (
    <div className={`app-wrapper ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {children}
    </div>
  );
};

// Layout کمپوننٹ میں تھیم ٹوگل شامل کریں
const EnhancedLayout = ({
  title,
  subtitle,
  children,
  showThemeToggle = true,
}) => {
  const { toggleMode, isDarkMode, mode } = useTheme();

  return (
    <Layout title={title} subtitle={subtitle}>
      {showThemeToggle && (
        <div
          className="theme-toggle-container"
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <button
            onClick={toggleMode}
            className="theme-toggle-button"
            style={{
              background: "var(--color-primary)",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: 500,
            }}
            title={`Switch to ${isDarkMode ? "Light" : "Dark"} Mode`}
          >
            <span>{isDarkMode ? "☀️" : "🌙"}</span>
            <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>
      )}
      {children}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemeInitializer>
          <Router>
            <div className="App">
              <main>
                <Routes>
                  {/* Public Routes - Authentication */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    {/* Main Dashboard */}
                    <Route
                      path="/dashboard"
                      element={
                        <EnhancedLayout
                          title="ERP Dashboard"
                          subtitle="Welcome to Pakistan Wire Industries"
                          showThemeToggle={true}
                        >
                          <Dashboard />
                        </EnhancedLayout>
                      }
                    />

                    {/* Theme Settings Route */}
                    <Route
                      path="/settings/theme"
                      element={
                        <EnhancedLayout
                          title="Theme Settings"
                          subtitle="Customize Your Dashboard Appearance"
                          showThemeToggle={true}
                        >
                          <ThemeSettings />
                        </EnhancedLayout>
                      }
                    />

                    {/* باقی routes وہی رہیں گے */}
                    {/* Department Dashboards */}
                    <Route
                      path="/hr"
                      element={
                        <EnhancedLayout
                          title="HR Department"
                          subtitle="Human Resources Management"
                          showThemeToggle={true}
                        >
                          <HRDashboard />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/finance"
                      element={
                        <EnhancedLayout
                          title="Finance Department"
                          subtitle="Financial Management System"
                          showThemeToggle={true}
                        >
                          <FinanceDashboard />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/sales"
                      element={
                        <EnhancedLayout
                          title="Sales Department"
                          subtitle="Sales & Customer Management"
                          showThemeToggle={true}
                        >
                          <SalesDashboard />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/it"
                      element={
                        <EnhancedLayout
                          title="IT Department"
                          subtitle="Information Technology"
                          showThemeToggle={true}
                        >
                          <ITDashboard />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/logistics"
                      element={
                        <EnhancedLayout
                          title="Logistics Department"
                          subtitle="Supply Chain Management"
                          showThemeToggle={true}
                        >
                          <LogisticsDashboard />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production"
                      element={
                        <EnhancedLayout
                          title="Production Department"
                          subtitle="Manufacturing Operations"
                          showThemeToggle={true}
                        >
                          <ProductionDashboard />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production/new"
                      element={
                        <EnhancedLayout
                          title="Production Department"
                          subtitle="Manufacturing Operations"
                          showThemeToggle={true}
                        >
                          <NewProductionDashboard />
                        </EnhancedLayout>
                      }
                    />

                    {/* Production Sections */}
                    <Route
                      path="/production-sections"
                      element={
                        <EnhancedLayout
                          title="Production Sections"
                          subtitle="Manage Production Processes"
                          showThemeToggle={true}
                        >
                          <ProductionSections />
                        </EnhancedLayout>
                      }
                    />

                    {/* Flattening Section Routes */}
                    <Route
                      path="/production-sections/flattening"
                      element={
                        <EnhancedLayout
                          title="Flattening Section"
                          subtitle="Wire Flattening Operations"
                          showThemeToggle={true}
                        >
                          <FlatteningPage />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/flattening/new"
                      element={
                        <EnhancedLayout
                          title="New Flattening Entry"
                          subtitle="Add New Flattening Record"
                          showThemeToggle={true}
                        >
                          <FlatteningForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/flattening/edit/:id"
                      element={
                        <EnhancedLayout
                          title="Edit Flattening"
                          subtitle="Update Flattening Record"
                          showThemeToggle={true}
                        >
                          <FlatteningEditForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/flattening/view/:id"
                      element={
                        <EnhancedLayout
                          title="View Flattening"
                          subtitle="Flattening Record Details"
                          showThemeToggle={true}
                        >
                          <FlatteningView />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/flattening/smart-entry"
                      element={
                        <EnhancedLayout
                          title="Smart Entry"
                          subtitle="Quick Flattening Entry"
                          showThemeToggle={true}
                        >
                          <FlatteningSmartForm />
                        </EnhancedLayout>
                      }
                    />
                    {/* New Flattening Multi Entry Route */}
                    <Route
                      path="/production-sections/flattening/multi-entry"
                      element={
                        <EnhancedLayout
                          title="Multi Entry"
                          subtitle="Batch Flattening Entry"
                          showThemeToggle={true}
                        >
                          <FlatteningMultiEntryForm />
                        </EnhancedLayout>
                      }
                    />

                    {/* Spiral Section Routes */}
                    <Route
                      path="/production-sections/spiral"
                      element={
                        <EnhancedLayout
                          title="Spiral Section"
                          subtitle="Wire Spiral Operations"
                          showThemeToggle={true}
                        >
                          <SpiralPage />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/spiral/new"
                      element={
                        <EnhancedLayout
                          title="New Spiral Entry"
                          subtitle="Add New Spiral Record"
                          showThemeToggle={true}
                        >
                          <SpiralForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/spiral/edit/:id"
                      element={
                        <EnhancedLayout
                          title="Edit Spiral"
                          subtitle="Update Spiral Record"
                          showThemeToggle={true}
                        >
                          <SpiralEditForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/spiral/view/:id"
                      element={
                        <EnhancedLayout
                          title="View Spiral"
                          subtitle="Spiral Record Details"
                          showThemeToggle={true}
                        >
                          <SpiralView />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/spiral/smart-entry"
                      element={
                        <EnhancedLayout
                          title="Smart Spiral Entry"
                          subtitle="Quick Spiral Entry"
                          showThemeToggle={true}
                        >
                          <SpiralSmartForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/spiral/multi-entry"
                      element={
                        <EnhancedLayout
                          title="Multi Entry"
                          subtitle="Batch Spiral Entry"
                          showThemeToggle={true}
                        >
                          <SpiralMultiEntryForm />
                        </EnhancedLayout>
                      }
                    />

                    {/* Raw Material Section Routes */}
                    <Route
                      path="/production-sections/raw-material"
                      element={
                        <EnhancedLayout
                          title="Raw Material"
                          subtitle="Material Inventory Management"
                          showThemeToggle={true}
                        >
                          <RawMaterialPage />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/raw-material/new"
                      element={
                        <EnhancedLayout
                          title="New Material Entry"
                          subtitle="Add New Material"
                          showThemeToggle={true}
                        >
                          <RawMaterialForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/raw-material/edit/:id"
                      element={
                        <EnhancedLayout
                          title="Edit Material"
                          subtitle="Update Material Record"
                          showThemeToggle={true}
                        >
                          <RawMaterialEditForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/raw-material/new-log"
                      element={
                        <EnhancedLayout
                          title="Material Log"
                          subtitle="Material Transaction Log"
                          showThemeToggle={true}
                        >
                          <RawMaterialLogForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/raw-material/material-received"
                      element={
                        <EnhancedLayout
                          title="Material Received"
                          subtitle="Record Received Materials"
                          showThemeToggle={true}
                        >
                          <MaterialReceivedForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/raw-material/material-issue"
                      element={
                        <EnhancedLayout
                          title="Material Issue"
                          subtitle="Issue Materials to Production"
                          showThemeToggle={true}
                        >
                          <MaterialIssueForm />
                        </EnhancedLayout>
                      }
                    />

                    {/* PVC Coating Section Routes */}
                    <Route
                      path="/production-sections/pvc-coating"
                      element={
                        <EnhancedLayout
                          title="PVC Coating"
                          subtitle="PVC Coating Operations"
                          showThemeToggle={true}
                        >
                          <PVCCoatingPage />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/pvc-coating/new"
                      element={
                        <EnhancedLayout
                          title="New PVC Entry"
                          subtitle="Add New PVC Coating Record"
                          showThemeToggle={true}
                        >
                          <PVCCoatingForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/pvc-coating/edit/:id"
                      element={
                        <EnhancedLayout
                          title="Edit PVC"
                          subtitle="Update PVC Coating Record"
                          showThemeToggle={true}
                        >
                          <PVCCoatingEditForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/pvc-coating/view/:id"
                      element={
                        <EnhancedLayout
                          title="View PVC"
                          subtitle="PVC Coating Record Details"
                          showThemeToggle={true}
                        >
                          <PVCCoatingView />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/pvc-coating/smart-form"
                      element={
                        <EnhancedLayout
                          title="Smart PVC Entry"
                          subtitle="Quick PVC Coating Entry"
                          showThemeToggle={true}
                        >
                          <PVCSmartForm />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/production-sections/pvc-coating/multi-entry"
                      element={
                        <EnhancedLayout
                          title="Multi Entry"
                          subtitle="Batch PVC Coating Entry"
                          showThemeToggle={true}
                        >
                          <PVCCoatingMultiEntryForm />
                        </EnhancedLayout>
                      }
                    />

                    {/* Production Reports */}
                    <Route
                      path="/production-reports/daily"
                      element={
                        <EnhancedLayout
                          title="Daily Production Report"
                          subtitle="Daily Production Summary"
                          showThemeToggle={true}
                        >
                          <DailyProductionReport />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/flattening-inventory"
                      element={
                        <EnhancedLayout
                          title="Inventory Report"
                          subtitle="Flattening Inventory Status"
                          showThemeToggle={true}
                        >
                          <FlatteningInventoryReport />
                        </EnhancedLayout>
                      }
                    />
                    <Route
                      path="/flattening-ledger"
                      element={
                        <EnhancedLayout
                          title="Inventory Ledger"
                          subtitle="Flattening Inventory Transactions"
                          showThemeToggle={true}
                        >
                          <FlatteningInventoryLedger />
                        </EnhancedLayout>
                      }
                    />
                  </Route>

                  {/* Default & Fallback Routes */}
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </main>
            </div>
          </Router>
        </ThemeInitializer>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
