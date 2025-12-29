// src/App.jsx - COMPLETE VERSION WITH ALL ROUTES
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Department Dashboards
import HRDashboard from "./pages/departments/HR/HRDashboard";
import FinanceDashboard from "./pages/departments/Finance/FinanceDashboard";
import ProductionDashboard from "./components/departments/Production/ProductionDashboard";
import SalesDashboard from "./pages/departments/Sales/SalesDashboard";
import ITDashboard from "./pages/departments/IT/ITDashboard";
import LogisticsDashboard from "./pages/departments/Logistics/LogisticsDashboard";

// Production Sections
import ProductionSections from "./pages/ProductionSections/Production";

// Flattening Section Pages
import FlatteningPage from "./pages/ProductionSections/FlatteningSection/FlatteningPage";
import FlatteningForm from "./pages/ProductionSections/FlatteningSection/FlatteningForm";
import FlatteningEditForm from "./pages/ProductionSections/FlatteningSection/FlatteningEditForm";
import FlatteningView from "./pages/ProductionSections/FlatteningSection/FlatteningView";
import FlatteningMultiEntryForm from "./pages/ProductionSections/FlatteningSection/FlatteningMultiEntryForm"; 
import FlatteningSmartForm from "./pages/ProductionSections/FlatteningSection/FlatteningSmartForm"; 

// Spiral Section Pages
import SpiralPage from "./pages/ProductionSections/SpiralSection/SpiralPage";
import SpiralForm from "./pages/ProductionSections/SpiralSection/SpiralForm";
import SpiralEditForm from "./pages/ProductionSections/SpiralSection/SpiralEditForm";
import SpiralView from "./pages/ProductionSections/SpiralSection/SpiralView";
import SpiralSmartForm from "./pages/ProductionSections/SpiralSection/SpiralSmartForm";

// Raw Material Section Pages 
import RawMaterialPage from "./pages/ProductionSections/RawMaterialSection/RawMaterialPage";
import RawMaterialLogForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialLogForm"; 
import MaterialReceivedForm from "./pages/ProductionSections/RawMaterialSection/MaterialReceivedForm"; 
import MaterialIssueForm from "./pages/ProductionSections/RawMaterialSection/MaterialIssueForm"; 
import RawMaterialEditForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialEditForm"; 
import RawMaterialForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialForm";

// PVC Coating Section Pages
import PVCCoatingPage from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingPage";
import PVCCoatingForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingForm";
import PVCCoatingEditForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingEditForm";
import PVCCoatingView from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingView";
import PVCCoatingMultiEntryForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingMultiEntryForm";
import PVCSmartForm from "./pages/ProductionSections/PVCCoatingSection/PVCSmartForm";

// Daily Production Report
import DailyProductionReport from "./pages/ProductionReports/DailyProductionReport";

// ✅ **NEW IMPORT: Flattening Inventory Report**
import FlatteningInventoryReport from './components/FlatteningInventoryReport';

// Layout
import Layout from './components/common/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* ========== AUTH ROUTES ========== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ========== DASHBOARD ROUTE ========== */}
        <Route
          path="/dashboard"
          element={
            <Layout
              title="ERP Dashboard"
              subtitle="Welcome to Pakistan Wire Industries ERP System"
            >
              <Dashboard />
            </Layout>
          }
        />
        
        {/* ========== DEPARTMENT ROUTES ========== */}
        <Route
          path="/hr"
          element={
            <Layout
              title="HR Department"
              subtitle="Manage employees, recruitment, payroll, and HR operations"
            >
              <HRDashboard />
            </Layout>
          }
        />
        
        <Route
          path="/finance"
          element={
            <Layout
              title="Finance Department"
              subtitle="Financial planning, accounting, budgeting, and reporting"
            >
              <FinanceDashboard />
            </Layout>
          }
        />
        
        {/* Production Department Routes */}
        <Route
          path="/dashboard/production"
          element={
            <Layout
              title="Production Department"
              subtitle="Manufacturing operations, production planning, and quality control"
            >
              <ProductionDashboard />
            </Layout>
          }
        />
        
        {/* Legacy Production Route */}
        <Route
          path="/production"
          element={
            <Layout
              title="Production Department"
              subtitle="Manufacturing operations, production planning, and quality control"
            >
              <ProductionDashboard />
            </Layout>
          }
        />
        
        <Route
          path="/sales"
          element={
            <Layout
              title="Sales Department"
              subtitle="Sales strategies, customer relations, and revenue generation"
            >
              <SalesDashboard />
            </Layout>
          }
        />
        
        <Route
          path="/it"
          element={
            <Layout
              title="IT Department"
              subtitle="IT infrastructure, software development, and technical support"
            >
              <ITDashboard />
            </Layout>
          }
        />
        
        <Route
          path="/logistics"
          element={
            <Layout
              title="Logistics Department"
              subtitle="Supply chain management, transportation, and distribution"
            >
              <LogisticsDashboard />
            </Layout>
          }
        />
        
        {/* ========== PRODUCTION SECTIONS ROUTES ========== */}
        <Route
          path="/production-sections"
          element={
            <Layout
              title="Production Sections"
              subtitle="All production sections management"
            >
              <ProductionSections />
            </Layout>
          }
        />
        
        {/* Flattening Section Routes */}
        <Route
          path="/production-sections/flattening"
          element={
            <Layout
              title="Flattening Section"
              subtitle="Wire flattening process management"
            >
              <FlatteningPage />
            </Layout>
          }
        />
        
        {/* ✅ **NEW: Flattening Inventory Report Route** */}
        <Route path="/flattening-inventory" element={<FlatteningInventoryReport />} />
        
        {/* Flattening Smart Entry Route */}
        <Route
          path="/production-sections/flattening/smart-entry"
          element={
            <Layout
              title="Smart Production Entry"
              subtitle="Shift-based production entry for all machines"
            >
              <FlatteningSmartForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/flattening/new"
          element={
            <Layout
              title="New Flattening Record"
              subtitle="Create new flattening section record"
            >
              <FlatteningForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/flattening/edit/:id"
          element={
            <Layout
              title="Edit Flattening Record"
              subtitle="Edit existing flattening section record"
            >
              <FlatteningEditForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/flattening/view/:id"
          element={
            <Layout
              title="View Flattening Record"
              subtitle="View detailed flattening section record"
            >
              <FlatteningView />
            </Layout>
          }
        />
        
        {/* FLATTENING MULTI-ENTRY FORM ROUTE */}
        <Route
          path="/production-sections/flattening/multi-entry"
          element={
            <Layout
              title="Flattening Multi-Machine Entry"
              subtitle="Add multiple machine records in one go"
            >
              <FlatteningMultiEntryForm />
            </Layout>
          }
        />
        
        {/* ========== SPIRAL SECTION ROUTES ========== */}
        <Route
          path="/production-sections/spiral"
          element={
            <Layout
              title="Spiral Section"
              subtitle="Spiral binding production management"
            >
              <SpiralPage />
            </Layout>
          }
        />
        
        {/* Spiral Smart Entry Route */}
        <Route
          path="/production-sections/spiral/smart-entry"
          element={
            <Layout
              title="Smart Production Entry - Spiral"
              subtitle="Shift-based production entry for spiral machines"
            >
              <SpiralSmartForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/spiral/new"
          element={
            <Layout
              title="New Spiral Record"
              subtitle="Create new spiral section record"
            >
              <SpiralForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/spiral/edit/:id"
          element={
            <Layout
              title="Edit Spiral Record"
              subtitle="Edit existing spiral section record"
            >
              <SpiralEditForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/spiral/view/:id"
          element={
            <Layout
              title="View Spiral Record"
              subtitle="View detailed spiral section record"
            >
              <SpiralView />
            </Layout>
          }
        />
        
        {/* ========== RAW MATERIAL SECTION ROUTES ========== */}
        <Route
          path="/production-sections/raw-material"
          element={
            <Layout
              title="Raw Material Section"
              subtitle="Raw material stock, usage, and management"
            >
              <RawMaterialPage />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/raw-material/material-received"
          element={
            <Layout
              title="Material Received"
              subtitle="Record incoming material from suppliers"
            >
              <MaterialReceivedForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/raw-material/material-issue"
          element={
            <Layout
              title="Material Issue"
              subtitle="Record material issued to production"
            >
              <MaterialIssueForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/raw-material/new-log"
          element={
            <Layout
              title="New Raw Material Log"
              subtitle="Create new material transaction record"
            >
              <RawMaterialLogForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/raw-material/new"
          element={
            <Layout
              title="New Raw Material"
              subtitle="Add new raw material stock"
            >
              <RawMaterialForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/raw-material/edit/:id"
          element={
            <Layout
              title="Edit Raw Material"
              subtitle="Edit existing raw material record"
            >
              <RawMaterialEditForm />
            </Layout>
          }
        />
        
        {/* ========== PVC COATING SECTION ROUTES ========== */}
        <Route
          path="/production-sections/pvc-coating"
          element={
            <Layout
              title="PVC Coating Section"
              subtitle="PVC coating process and production management"
            >
              <PVCCoatingPage />
            </Layout>
          }
        />
        
        {/* ✅ PVC COATING SMART FORM ROUTE - ADDED */}
        <Route
          path="/production-sections/pvc-coating/smart-form"
          element={
            <Layout
              title="Smart Production Entry - PVC"
              subtitle="Shift-based production entry for PVC coating"
            >
              <PVCSmartForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/pvc-coating/new"
          element={
            <Layout
              title="New PVC Coating Record"
              subtitle="Create new PVC coating section record"
            >
              <PVCCoatingForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/pvc-coating/edit/:id"
          element={
            <Layout
              title="Edit PVC Coating Record"
              subtitle="Edit existing PVC coating section record"
            >
              <PVCCoatingEditForm />
            </Layout>
          }
        />
        
        <Route
          path="/production-sections/pvc-coating/view/:id"
          element={
            <Layout
              title="View PVC Coating Record"
              subtitle="View detailed PVC coating section record"
            >
              <PVCCoatingView />
            </Layout>
          }
        />
        
        {/* PVC COATING MULTI-ENTRY FORM ROUTE */}
        <Route
          path="/production-sections/pvc-coating/multi-entry"
          element={
            <Layout
              title="PVC Coating Multi-Entry Form"
              subtitle="Add multiple PVC coating records in one go"
            >
              <PVCCoatingMultiEntryForm />
            </Layout>
          }
        />
        
        {/* ========== DAILY PRODUCTION REPORT ROUTE ========== */}
        <Route
          path="/production-reports/daily"
          element={
            <Layout
              title="Daily Production Report"
              subtitle="Daily production summary and analysis"
            >
              <DailyProductionReport />
            </Layout>
          }
        />
        
        {/* ========== DEFAULT ROUTES ========== */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;