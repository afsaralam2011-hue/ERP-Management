import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ========== THEME CONTEXT & STYLES ========== */
import { ThemeProvider } from "./contexts/ThemeContext";
import './output.css';
/* ========== COMMON COMPONENTS ========== */
// Header کو یہاں سے remove کریں - Layout میں ہے
import Layout from "./components/common/Layout";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

/* ========== AUTH PAGES ========== */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

/* ========== SETTINGS PAGES ========== */
import ThemeSettings from "./pages/Settings/ThemeSettings";

/* ========== DASHBOARDS ========== */
import Dashboard from "./pages/dashboard/Dashboard";
import HRDashboard from "./pages/departments/HR/HRDashboard";
import FinanceDashboard from "./pages/departments/Finance/FinanceDashboard";
import SalesDashboard from "./pages/departments/Sales/SalesDashboard";
import ITDashboard from "./pages/departments/IT/ITDashboard";
import LogisticsDashboard from "./pages/departments/Logistics/LogisticsDashboard";
import ProductionDashboard from "./components/departments/Production/ProductionDashboard";

/* ========== PRODUCTION SECTIONS ========== */
import ProductionSections from "./pages/ProductionSections/Production";

/* ========== FLATTENING ========== */
import FlatteningPage from "./pages/ProductionSections/FlatteningSection/FlatteningPage";
import FlatteningForm from "./pages/ProductionSections/FlatteningSection/FlatteningForm";
import FlatteningEditForm from "./pages/ProductionSections/FlatteningSection/FlatteningEditForm";
import FlatteningView from "./pages/ProductionSections/FlatteningSection/FlatteningView";
import FlatteningSmartForm from "./pages/ProductionSections/FlatteningSection/FlatteningSmartForm";

/* ========== SPIRAL ========== */
import SpiralPage from "./pages/ProductionSections/SpiralSection/SpiralPage";
import SpiralForm from "./pages/ProductionSections/SpiralSection/SpiralForm";
import SpiralEditForm from "./pages/ProductionSections/SpiralSection/SpiralEditForm";
import SpiralView from "./pages/ProductionSections/SpiralSection/SpiralView";
import SpiralSmartForm from "./pages/ProductionSections/SpiralSection/SpiralSmartForm";
import SpiralMultiEntryForm from "./pages/ProductionSections/SpiralSection/SpiralMultiEntryForm";

/* ========== RAW MATERIAL ========== */
import RawMaterialPage from "./pages/ProductionSections/RawMaterialSection/RawMaterialPage";
import RawMaterialLogForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialLogForm";
import MaterialReceivedForm from "./pages/ProductionSections/RawMaterialSection/MaterialReceivedForm";
import MaterialIssueForm from "./pages/ProductionSections/RawMaterialSection/MaterialIssueForm";
import RawMaterialEditForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialEditForm";
import RawMaterialForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialForm";

/* ========== PVC COATING ========== */
import PVCCoatingPage from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingPage";
import PVCCoatingForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingForm";
import PVCCoatingEditForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingEditForm";
import PVCCoatingView from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingView";
import PVCSmartForm from "./pages/ProductionSections/PVCCoatingSection/PVCSmartForm";
import PVCCoatingMultiEntryForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingMultiEntryForm";

/* ========== REPORTS ========== */
import DailyProductionReport from "./pages/ProductionReports/DailyProductionReport";
import FlatteningInventoryReport from "./components/FlatteningInventoryReport";
import FlatteningInventoryLedger from "./components/FlatteningInventoryLedger";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          
          <main>
            <Routes>
              {/* ========== AUTH ROUTES (No Layout) ========== */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* ========== PROTECTED ROUTES ========== */}
              <Route element={<ProtectedRoute />}>
                {/* Main Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <Layout title="ERP Dashboard" subtitle="Welcome to Pakistan Wire Industries">
                      <Dashboard />
                    </Layout>
                  }
                />
                
                {/* ========== SETTINGS ROUTES ========== */}

                <Route 
                  path="/settings/theme" 
                  element={
                    <Layout title="Theme Settings" subtitle="Customize Your Dashboard">
                      <ThemeSettings />
                    </Layout>
                  } 
                />

                {/* Department Dashboards */}
                <Route 
                  path="/hr" 
                  element={
                    <Layout title="HR Department" subtitle="Human Resources Management">
                      <HRDashboard />
                    </Layout>
                  } 
                />
                <Route 
                  path="/finance" 
                  element={
                    <Layout title="Finance Department" subtitle="Financial Management System">
                      <FinanceDashboard />
                    </Layout>
                  } 
                />
                <Route 
                  path="/sales" 
                  element={
                    <Layout title="Sales Department" subtitle="Sales & Customer Management">
                      <SalesDashboard />
                    </Layout>
                  } 
                />
                <Route 
                  path="/it" 
                  element={
                    <Layout title="IT Department" subtitle="Information Technology">
                      <ITDashboard />
                    </Layout>
                  } 
                />
                <Route 
                  path="/logistics" 
                  element={
                    <Layout title="Logistics Department" subtitle="Supply Chain Management">
                      <LogisticsDashboard />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production" 
                  element={
                    <Layout title="Production Department" subtitle="Manufacturing Operations">
                      <ProductionDashboard />
                    </Layout>
                  } 
                />

                {/* Production Sections */}
                <Route 
                  path="/production-sections" 
                  element={
                    <Layout title="Production Sections" subtitle="Manage Production Processes">
                      <ProductionSections />
                    </Layout>
                  } 
                />

                {/* Flattening */}
                <Route 
                  path="/production-sections/flattening" 
                  element={
                    <Layout title="Flattening Section" subtitle="Wire Flattening Operations">
                      <FlatteningPage />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/flattening/new" 
                  element={
                    <Layout title="New Flattening Entry" subtitle="Add New Flattening Record">
                      <FlatteningForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/flattening/edit/:id" 
                  element={
                    <Layout title="Edit Flattening" subtitle="Update Flattening Record">
                      <FlatteningEditForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/flattening/view/:id" 
                  element={
                    <Layout title="View Flattening" subtitle="Flattening Record Details">
                      <FlatteningView />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/flattening/smart-entry" 
                  element={
                    <Layout title="Smart Entry" subtitle="Quick Flattening Entry">
                      <FlatteningSmartForm />
                    </Layout>
                  } 
                />

                {/* Spiral */}
                <Route 
                  path="/production-sections/spiral" 
                  element={
                    <Layout title="Spiral Section" subtitle="Wire Spiral Operations">
                      <SpiralPage />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/spiral/new" 
                  element={
                    <Layout title="New Spiral Entry" subtitle="Add New Spiral Record">
                      <SpiralForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/spiral/edit/:id" 
                  element={
                    <Layout title="Edit Spiral" subtitle="Update Spiral Record">
                      <SpiralEditForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/spiral/view/:id" 
                  element={
                    <Layout title="View Spiral" subtitle="Spiral Record Details">
                      <SpiralView />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/spiral/smart-entry" 
                  element={
                    <Layout title="Smart Spiral Entry" subtitle="Quick Spiral Entry">
                      <SpiralSmartForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/spiral/multi-entry" 
                  element={
                    <Layout title="Multi Entry" subtitle="Batch Spiral Entry">
                      <SpiralMultiEntryForm />
                    </Layout>
                  } 
                />

                {/* Raw Material */}
                <Route 
                  path="/production-sections/raw-material" 
                  element={
                    <Layout title="Raw Material" subtitle="Material Inventory Management">
                      <RawMaterialPage />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/raw-material/new" 
                  element={
                    <Layout title="New Material Entry" subtitle="Add New Material">
                      <RawMaterialForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/raw-material/edit/:id" 
                  element={
                    <Layout title="Edit Material" subtitle="Update Material Record">
                      <RawMaterialEditForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/raw-material/new-log" 
                  element={
                    <Layout title="Material Log" subtitle="Material Transaction Log">
                      <RawMaterialLogForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/raw-material/material-received" 
                  element={
                    <Layout title="Material Received" subtitle="Record Received Materials">
                      <MaterialReceivedForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/raw-material/material-issue" 
                  element={
                    <Layout title="Material Issue" subtitle="Issue Materials to Production">
                      <MaterialIssueForm />
                    </Layout>
                  } 
                />

                {/* PVC */}
                <Route 
                  path="/production-sections/pvc-coating" 
                  element={
                    <Layout title="PVC Coating" subtitle="PVC Coating Operations">
                      <PVCCoatingPage />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/pvc-coating/new" 
                  element={
                    <Layout title="New PVC Entry" subtitle="Add New PVC Coating Record">
                      <PVCCoatingForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/pvc-coating/edit/:id" 
                  element={
                    <Layout title="Edit PVC" subtitle="Update PVC Coating Record">
                      <PVCCoatingEditForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/pvc-coating/view/:id" 
                  element={
                    <Layout title="View PVC" subtitle="PVC Coating Record Details">
                      <PVCCoatingView />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/pvc-coating/smart-form" 
                  element={
                    <Layout title="Smart PVC Entry" subtitle="Quick PVC Coating Entry">
                      <PVCSmartForm />
                    </Layout>
                  } 
                />
                <Route 
                  path="/production-sections/pvc-coating/multi-entry" 
                  element={
                    <Layout title="Multi Entry" subtitle="Batch PVC Coating Entry">
                      <PVCCoatingMultiEntryForm />
                    </Layout>
                  } 
                />
                
                {/* Reports */}
                <Route 
                  path="/production-reports/daily" 
                  element={
                    <Layout title="Daily Production Report" subtitle="Daily Production Summary">
                      <DailyProductionReport />
                    </Layout>
                  } 
                />
                <Route 
                  path="/flattening-inventory" 
                  element={
                    <Layout title="Inventory Report" subtitle="Flattening Inventory Status">
                      <FlatteningInventoryReport />
                    </Layout>
                  } 
                />
                <Route 
                  path="/flattening-ledger" 
                  element={
                    <Layout title="Inventory Ledger" subtitle="Flattening Inventory Transactions">
                      <FlatteningInventoryLedger />
                    </Layout>
                  } 
                />
              </Route>

              {/* ========== DEFAULT ROUTES ========== */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;