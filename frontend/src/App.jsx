// src/App.jsx – COMPLETELY FIXED & STABLE VERSION
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ========== AUTH PAGES ========== */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

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

/* ========== REPORTS ========== */
import DailyProductionReport from "./pages/ProductionReports/DailyProductionReport";
import FlatteningInventoryReport from "./components/FlatteningInventoryReport";
import FlatteningInventoryLedger from "./components/FlatteningInventoryLedger";

/* ========== COMMON ========== */
import Layout from "./components/common/Layout";
import ProtectedRoute from "./pages/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* ========== AUTH ROUTES ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />


        {/* ========== PROTECTED ROUTES ========== */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <Layout title="ERP Dashboard">
                <Dashboard />
              </Layout>
            }
          />

          <Route path="/hr" element={<Layout title="HR"><HRDashboard /></Layout>} />
          <Route path="/finance" element={<Layout title="Finance"><FinanceDashboard /></Layout>} />
          <Route path="/sales" element={<Layout title="Sales"><SalesDashboard /></Layout>} />
          <Route path="/it" element={<Layout title="IT"><ITDashboard /></Layout>} />
          <Route path="/logistics" element={<Layout title="Logistics"><LogisticsDashboard /></Layout>} />

          <Route path="/production" element={<Layout title="Production"><ProductionDashboard /></Layout>} />
          <Route path="/production-sections" element={<Layout title="Production Sections"><ProductionSections /></Layout>} />

          {/* Flattening */}
          <Route path="/production-sections/flattening" element={<Layout title="Flattening"><FlatteningPage /></Layout>} />
          <Route path="/production-sections/flattening/new" element={<Layout title="New Flattening"><FlatteningForm /></Layout>} />
          <Route path="/production-sections/flattening/edit/:id" element={<Layout title="Edit Flattening"><FlatteningEditForm /></Layout>} />
          <Route path="/production-sections/flattening/view/:id" element={<Layout title="View Flattening"><FlatteningView /></Layout>} />
          <Route path="/production-sections/flattening/smart-entry" element={<Layout title="Smart Entry"><FlatteningSmartForm /></Layout>} />

          {/* Spiral */}
          <Route path="/production-sections/spiral" element={<Layout title="Spiral"><SpiralPage /></Layout>} />
          <Route path="/production-sections/spiral/new" element={<Layout title="New Spiral"><SpiralForm /></Layout>} />
          <Route path="/production-sections/spiral/edit/:id" element={<Layout title="Edit Spiral"><SpiralEditForm /></Layout>} />
          <Route path="/production-sections/spiral/view/:id" element={<Layout title="View Spiral"><SpiralView /></Layout>} />
          <Route path="/production-sections/spiral/smart-entry" element={<Layout title="Smart Spiral"><SpiralSmartForm /></Layout>} />
          <Route path="/production-sections/spiral/multi-entry" element={<Layout title="Multi Entry"><SpiralMultiEntryForm /></Layout>} />

          {/* Raw Material */}
          <Route path="/production-sections/raw-material" element={<Layout title="Raw Material"><RawMaterialPage /></Layout>} />
          <Route path="/production-sections/raw-material/new" element={<Layout title="New Material"><RawMaterialForm /></Layout>} />
          <Route path="/production-sections/raw-material/edit/:id" element={<Layout title="Edit Material"><RawMaterialEditForm /></Layout>} />
          <Route path="/production-sections/raw-material/new-log" element={<Layout title="Material Log"><RawMaterialLogForm /></Layout>} />
          <Route path="/production-sections/raw-material/material-received" element={<Layout title="Material Received"><MaterialReceivedForm /></Layout>} />
          <Route path="/production-sections/raw-material/material-issue" element={<Layout title="Material Issue"><MaterialIssueForm /></Layout>} />

          {/* PVC */}
          <Route path="/production-sections/pvc-coating" element={<Layout title="PVC Coating"><PVCCoatingPage /></Layout>} />
          <Route path="/production-sections/pvc-coating/new" element={<Layout title="New PVC"><PVCCoatingForm /></Layout>} />
          <Route path="/production-sections/pvc-coating/edit/:id" element={<Layout title="Edit PVC"><PVCCoatingEditForm /></Layout>} />
          <Route path="/production-sections/pvc-coating/view/:id" element={<Layout title="View PVC"><PVCCoatingView /></Layout>} />
          <Route path="/production-sections/pvc-coating/smart-form" element={<Layout title="Smart PVC"><PVCSmartForm /></Layout>} />

          {/* Reports */}
          <Route path="/production-reports/daily" element={<Layout title="Daily Production"><DailyProductionReport /></Layout>} />
          <Route path="/flattening-inventory" element={<Layout title="Inventory Report"><FlatteningInventoryReport /></Layout>} />
          <Route path="/flattening-ledger" element={<Layout title="Inventory Ledger"><FlatteningInventoryLedger /></Layout>} />
        </Route>

        {/* ========== DEFAULT ========== */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
