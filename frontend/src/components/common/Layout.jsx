import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Navigation from "./Navigation";
import { useTheme } from "../../contexts/ThemeContext";
import "./Layout.css";

const SIDEBAR_COLLAPSED = 70;
const SIDEBAR_EXPANDED = 280;
const MOBILE_TOP_GAP = 60;

const Layout = ({
  children,
  title = "Daily Production Report",
  subtitle = "Daily Production Summary",
  showHeader = true,
  showSidebar = true,
}) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sidebarWidth = !showSidebar || isMobile
    ? 0
    : sidebarOpen
    ? SIDEBAR_EXPANDED
    : SIDEBAR_COLLAPSED;

  return (
    <div 
      className="layout-container" 
      style={{ 
        display: "flex", 
        height: "100vh", // پوری اسکرین کی بلندی
        width: "100vw",  // پوری اسکرین کی چوڑائی
        overflow: "hidden", // اسکرین سے باہر کچھ نہیں جائے گا
        background: theme.colors.background 
      }}
    >
      
      {/* سائیڈ بار - یہ اپنی جگہ فکس رہے گا */}
      {showSidebar && (
        <aside
          onMouseEnter={() => !isMobile && setSidebarOpen(true)}
          onMouseLeave={() => !isMobile && setSidebarOpen(false)}
          style={{
            width: isMobile ? (sidebarOpen ? SIDEBAR_EXPANDED : 0) : sidebarWidth,
            flexShrink: 0, // یہ اپنی چوڑائی نہیں چھوڑے گا
            height: "100%",
            transition: "width 0.3s ease",
            background: "#fff",
            zIndex: 1000,
            borderRight: "1px solid #eee",
            overflowX: "hidden"
          }}
        >
          <Navigation isOpen={sidebarOpen || isMobile} />
        </aside>
      )}

      {/* ہیڈر اور مواد کا مین کنٹینر */}
      <div
        className="main-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1, // باقی تمام جگہ یہ لے گا
          width: `calc(100% - ${sidebarWidth}px)`, // چوڑائی کو سائیڈ بار کے حساب سے سیٹ کیا
          height: "100vh",
          overflow: "hidden", // یہ پورے اسٹرکچر کو اسکرین کے اندر رکھے گا
          transition: "width 0.3s ease",
          position: "relative"
        }}
      >
        {/* فکسڈ ہیڈر - اب یہ ہلے گا نہیں */}
        {showHeader && (
          <header 
            style={{ 
              height: "70px", // ہیڈر کی فکسڈ اونچائی
              width: "100%",
              flexShrink: 0,
              zIndex: 900,
              background: "#fff",
              position: isMobile ? "absolute" : "relative",
              top: isMobile ? MOBILE_TOP_GAP : 0,
            }}
          >
            <Header title={title} subtitle={subtitle} />
          </header>
        )}

        {/* اسکرول ہونے والا مواد - پیج کا ڈیٹا یہاں آئے گا */}
        <main 
          className="content-area" 
          style={{ 
            flexGrow: 1, 
            overflowY: "auto", // صرف اوپر نیچے اسکرول ہوگا، دائیں بائیں نہیں
            overflowX: "auto", // اگر ٹیبل بہت بڑا ہے تو صرف اس حصے میں اسکرول بار آئے گا
            padding: "20px",
            boxSizing: "border-box",
            width: "100%"
          }}
        >
          <div style={{ minWidth: "100%", display: "inline-block" }}>
            {children}
          </div>
        </main>
      </div>

      {/* موبائل بیک ڈراپ */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 }}
        />
      )}
    </div>
  );
};

export default Layout;