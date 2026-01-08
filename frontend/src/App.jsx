// src/App.jsx - COMPLETE UPDATED VERSION WITH FORGOT PASSWORD & RESET PASSWORD
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

// ========== AUTH PAGES ==========
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword"; // نیا ایمپورٹ

// ========== MAIN DASHBOARD ==========
import Dashboard from "./pages/dashboard/Dashboard";

// ========== DEPARTMENT DASHBOARDS ==========
import HRDashboard from "./pages/departments/HR/HRDashboard";
import FinanceDashboard from "./pages/departments/Finance/FinanceDashboard";
import SalesDashboard from "./pages/departments/Sales/SalesDashboard";
import ITDashboard from "./pages/departments/IT/ITDashboard";
import LogisticsDashboard from "./pages/departments/Logistics/LogisticsDashboard";

// ========== PRODUCTION DEPARTMENT ==========
import ProductionDashboard from "./components/departments/Production/ProductionDashboard";

// ========== PRODUCTION SECTIONS ==========
import ProductionSections from "./pages/ProductionSections/Production";

// ========== FLATTENING SECTION ==========
import FlatteningPage from "./pages/ProductionSections/FlatteningSection/FlatteningPage";
import FlatteningForm from "./pages/ProductionSections/FlatteningSection/FlatteningForm";
import FlatteningEditForm from "./pages/ProductionSections/FlatteningSection/FlatteningEditForm";
import FlatteningView from "./pages/ProductionSections/FlatteningSection/FlatteningView";
import FlatteningSmartForm from "./pages/ProductionSections/FlatteningSection/FlatteningSmartForm";

// ========== SPIRAL SECTION ==========
import SpiralPage from "./pages/ProductionSections/SpiralSection/SpiralPage";
import SpiralForm from "./pages/ProductionSections/SpiralSection/SpiralForm";
import SpiralEditForm from "./pages/ProductionSections/SpiralSection/SpiralEditForm";
import SpiralView from "./pages/ProductionSections/SpiralSection/SpiralView";
import SpiralSmartForm from "./pages/ProductionSections/SpiralSection/SpiralSmartForm";
import SpiralMultiEntryForm from "./pages/ProductionSections/SpiralSection/SpiralMultiEntryForm.jsx";

// ========== RAW MATERIAL SECTION ==========
import RawMaterialPage from "./pages/ProductionSections/RawMaterialSection/RawMaterialPage";
import RawMaterialLogForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialLogForm";
import MaterialReceivedForm from "./pages/ProductionSections/RawMaterialSection/MaterialReceivedForm";
import MaterialIssueForm from "./pages/ProductionSections/RawMaterialSection/MaterialIssueForm";
import RawMaterialEditForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialEditForm";
import RawMaterialForm from "./pages/ProductionSections/RawMaterialSection/RawMaterialForm";

// ========== PVC COATING SECTION ==========
import PVCCoatingPage from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingPage";
import PVCCoatingForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingForm";
import PVCCoatingEditForm from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingEditForm";
import PVCCoatingView from "./pages/ProductionSections/PVCCoatingSection/PVCCoatingView";
import PVCSmartForm from "./pages/ProductionSections/PVCCoatingSection/PVCSmartForm";

// ========== DAILY PRODUCTION REPORT ==========
import DailyProductionReport from "./pages/ProductionReports/DailyProductionReport";

// ========== INVENTORY REPORTS ==========
import FlatteningInventoryReport from "./components/FlatteningInventoryReport";
import FlatteningInventoryLedger from "./components/FlatteningInventoryLedger";

// ========== LAYOUT ==========
import Layout from "./components/common/Layout";

function AppWrapper() {
  const [isAppReady, setIsAppReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("AppWrapper mounted, current path:", location.pathname);

    const markAppLoaded = () => {
      if (window.reactAppLoaded) {
        window.reactAppLoaded();
        console.log("Marked React app as loaded");
      }
    };

    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken") || 
                   sessionStorage.getItem("authToken") ||
                   localStorage.getItem("userToken");
      
      const userData = localStorage.getItem("user") || 
                      sessionStorage.getItem("user");

      console.log("Auth check - Token exists:", !!token, "User data exists:", !!userData);

      return {
        isAuthenticated: !!token || !!userData,
        token,
        userData: userData ? JSON.parse(userData) : null
      };
    };

    const handleAppReady = (event) => {
      console.log("App-ready event received:", event.detail);
      
      const auth = checkAuthStatus();
      const currentPath = location.pathname;

      console.log("Current path:", currentPath, "Is authenticated:", auth.isAuthenticated);

      if (auth.isAuthenticated) {
        if (currentPath === "/" || currentPath === "/login" || currentPath === "/register" || currentPath === "/forgot-password" || currentPath === "/reset-password") {
          console.log("User is authenticated, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        }
      } else {
        if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/forgot-password" && currentPath !== "/reset-password") {
          console.log("User not authenticated, redirecting to login");
          navigate("/login", { replace: true });
        }
      }

      setIsAppReady(true);
    };

    const initializeApp = () => {
      console.log("Initializing React app...");

      markAppLoaded();

      const welcomeScreenSkipped = localStorage.getItem("pwi_welcome_skipped") === "true";
      const lastWelcomeDate = localStorage.getItem("pwi_last_welcome_date");
      const today = new Date().toDateString();

      console.log("Welcome screen skipped:", welcomeScreenSkipped, "Last welcome date:", lastWelcomeDate);

      if (welcomeScreenSkipped || lastWelcomeDate === today) {
        const auth = checkAuthStatus();
        const currentPath = location.pathname;

        if (auth.isAuthenticated) {
          if (currentPath === "/" || currentPath === "/login" || currentPath === "/register" || currentPath === "/forgot-password" || currentPath === "/reset-password") {
            navigate("/dashboard", { replace: true });
          }
        } else {
          if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/forgot-password" && currentPath !== "/reset-password") {
            navigate("/login", { replace: true });
          }
        }
      }

      window.addEventListener("app-ready", handleAppReady);

      window.triggerReactNavigation = () => {
        console.log("Manual trigger from welcome screen");
        handleAppReady({ detail: { source: "manual" } });
      };

      return () => {
        window.removeEventListener("app-ready", handleAppReady);
        delete window.triggerReactNavigation;
      };
    };

    const initTimer = setTimeout(initializeApp, 100);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener("app-ready", handleAppReady);
      delete window.triggerReactNavigation;
    };
  }, [navigate, location]);

  if (!isAppReady && (location.pathname === "/" || location.pathname === "")) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading Pakistan Wire Industries ERP
          </h2>
          <p className="text-gray-500">
            Please wait while we prepare your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return <AppContent />;
}

function AppContent() {
  return (
    <Routes>
      {/* ========== AUTH ROUTES ========== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} /> {/* نیا route */}
      
      {/* ========== MAIN DASHBOARD ROUTE ========== */}
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
      {/* HR Department */}
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
      
      {/* Finance Department */}
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
      
      {/* Sales Department */}
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
      
      {/* IT Department */}
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
      
      {/* Logistics Department */}
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
      
      {/* ========== PRODUCTION DEPARTMENT ROUTES ========== */}
      {/* Main Production Dashboard */}
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
      
      {/* ========== PRODUCTION SUB-DEPARTMENT ROUTES ========== */}
      {/* Flattening Department */}
      <Route
        path="/production/flattening"
        element={
          <Layout
            title="Flattening Department"
            subtitle="Wire flattening process management"
          >
            <FlatteningPage />
          </Layout>
        }
      />
      
      {/* Plating Department */}
      <Route
        path="/production/plating"
        element={
          <Layout
            title="Plating Department"
            subtitle="Electroplating process management"
          >
            <ProductionDashboard />
          </Layout>
        }
      />
      
      {/* PVC Department */}
      <Route
        path="/production/pvc"
        element={
          <Layout
            title="PVC Coating Department"
            subtitle="PVC coating process management"
          >
            <PVCCoatingPage />
          </Layout>
        }
      />
      
      {/* Cutting Department */}
      <Route
        path="/production/cutting"
        element={
          <Layout
            title="Cutting Department"
            subtitle="Wire cutting process management"
          >
            <ProductionDashboard />
          </Layout>
        }
      />
      
      {/* Raw Material Department */}
      <Route
        path="/production/raw-material"
        element={
          <Layout
            title="Raw Material Department"
            subtitle="Raw material stock, usage, and inventory management"
          >
            <RawMaterialPage />
          </Layout>
        }
      />
      
      {/* ========== PRODUCTION SECTIONS ROUTES ========== */}
      {/* Production Sections Overview */}
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
      
      {/* Flattening Section Pages */}
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
      
      {/* Flattening Smart Entry */}
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
      
      {/* Spiral Section Pages */}
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
      
      {/* Spiral Smart Entry */}
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
      
      {/* Raw Material Section Pages */}
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
      
      {/* Material Received Form */}
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
      
      {/* Material Issue Form */}
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
      
      {/* Raw Material Log Form */}
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
      
      {/* PVC Coating Section Pages */}
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
      
      {/* PVC Smart Entry */}
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
      
      {/* ========== DAILY PRODUCTION REPORT ========== */}
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
      
      {/* ========== INVENTORY REPORTS ========== */}
      {/* Flattening Inventory Report */}
      <Route
        path="/flattening-inventory"
        element={
          <Layout
            title="Flattening Inventory Report"
            subtitle="Complete inventory analysis for flattening section"
          >
            <FlatteningInventoryReport />
          </Layout>
        }
      />
      
      {/* Flattening Inventory Ledger */}
      <Route
        path="/flattening-ledger"
        element={
          <Layout
            title="Flattening Inventory Ledger"
            subtitle="Complete inventory tracking for flattening section"
          >
            <FlatteningInventoryLedger />
          </Layout>
        }
      />
      
      {/* Spiral Multi-Entry Form */}
      <Route
        path="/production-sections/spiral/multi-entry"
        element={
          <Layout
            title="Multi-Item Spiral Production"
            subtitle="Add multiple items for the same machine in one entry"
          >
            <SpiralMultiEntryForm />
          </Layout>
        }
      />

      {/* ========== DEFAULT ROUTES ========== */}
      {/* Root path - will be handled by AppWrapper based on auth status */}
      <Route path="/" element={<div />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;