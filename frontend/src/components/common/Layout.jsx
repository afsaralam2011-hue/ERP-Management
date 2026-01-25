// frontend/src/components/common/Layout.jsx

import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Navigation from "./Navigation";
import { useTheme } from "../../contexts/ThemeContext";
import "./Layout.css";

const SIDEBAR_COLLAPSED = 60;
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
        height: "100vh", 
        width: "100vw", 
        overflow: "hidden",
        // background: theme.colors.background
      }}
    >
      
      {/* Sidebar */}
      {showSidebar && (
        <aside
          onMouseEnter={() => !isMobile && setSidebarOpen(true)}
          onMouseLeave={() => !isMobile && setSidebarOpen(false)}
          style={{
            width: isMobile ? (sidebarOpen ? SIDEBAR_EXPANDED : 0) : sidebarWidth,
            flexShrink: 0,
            height: "100%",
            transition: "width 0.3s ease",
            background: "#fff",
            zIndex: 1000,
            // borderRight: "1px solid #eee", // بارڈر ہٹا دیا
            overflowX: "hidden"
          }}
        >
          <Navigation isOpen={sidebarOpen || isMobile} />
        </aside>
      )}

      {/* Main Wrapper */}
      <div
        className="main-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          width: `calc(100% - ${sidebarWidth}px)`,
          height: "100vh",
          overflow: "hidden",
          transition: "width 0.3s ease",
          position: "relative"
        }}
      >
        {/* Header */}
        {showHeader && (
          <header 
            style={{ 
              height: "60px",
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

        {/* Sub Header */}
        <div
          style={{
            height: "50px",
            width: "100%",
            flexShrink: 0,
            background: "#f9f9f9",
            display: "flex",
            alignItems: "center",
            padding: "0 0px",
            boxSizing: "border-box",
          }}
        >
          {subtitle}
        </div>

        {/* Scrollable Content */}
        <main 
          className="content-area" 
          style={{ 
            flexGrow: 1, 
            overflowY: "auto", 
            overflowX: "auto", 
            padding: "0px", // سائیڈوں کا گیپ ختم کیا
            boxSizing: "border-box",
            width: "100%",
            display: "flex",
            justifyContent: "center", // افقی سینٹر
            alignItems: "flex-start" // اوپر سے شروع کریں
          }}
        >
          <div style={{ 
            width: "100%",
            maxWidth: "100%",
            padding: "0px",
            boxSizing: "border-box"
          }}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Backdrop */}
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