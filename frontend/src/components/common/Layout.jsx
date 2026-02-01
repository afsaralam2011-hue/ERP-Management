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
  const { theme, isDarkMode, mode } = useTheme();
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

  // Theme-based styles
  const layoutStyles = {
    container: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      background: theme?.colors?.background || (isDarkMode ? "#121212" : "#f5f5f5"),
      color: theme?.colors?.text || (isDarkMode ? "#ffffff" : "#333333")
    },
    sidebar: {
      width: isMobile ? (sidebarOpen ? SIDEBAR_EXPANDED : 0) : sidebarWidth,
      flexShrink: 0,
      height: "100%",
      transition: "width 0.3s ease",
      background: theme?.colors?.sidebar?.background || (isDarkMode ? "#1e1e1e" : "#ffffff"),
      borderRight: `1px solid ${theme?.colors?.border || (isDarkMode ? "#333" : "#eee")}`,
      zIndex: 1000,
      overflowX: "hidden"
    },
    header: {
      height: "60px",
      width: "100%",
      flexShrink: 0,
      zIndex: 900,
      background: theme?.colors?.header?.background || (isDarkMode ? "#1a1a1a" : "#ffffff"),
      borderBottom: `1px solid ${theme?.colors?.border || (isDarkMode ? "#333" : "#eee")}`,
      position: "relative", /* ✅ Changed from absolute to relative */
      top: 0, /* ✅ Always 0 */
    },
    subHeader: {
      height: "50px",
      width: "100%",
      flexShrink: 0,
      background: theme?.colors?.subHeader?.background || (isDarkMode ? "#2a2a2a" : "#f9f9f9"),
      color: theme?.colors?.subHeader?.text || (isDarkMode ? "#cccccc" : "#666666"),
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      boxSizing: "border-box",
      borderBottom: `1px solid ${theme?.colors?.border || (isDarkMode ? "#333" : "#eee")}`
    },
    content: {
      flexGrow: 1,
      overflowY: "auto",
      overflowX: "auto",
      padding: "20px", /* ✅ Keep this as is */
      boxSizing: "border-box",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      background: theme?.colors?.content?.background || "transparent"
    }
  };

  return (
    <div className={`layout-container ${mode}-mode`} style={layoutStyles.container}>

      {/* Sidebar */}
      {showSidebar && (
        <aside
          onMouseEnter={() => !isMobile && setSidebarOpen(true)}
          onMouseLeave={() => !isMobile && setSidebarOpen(false)}
          style={layoutStyles.sidebar}
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
          <header style={layoutStyles.header}>
            <Header title={title} subtitle={subtitle} />
          </header>
        )}

        {/* Sub Header */}
        <div style={layoutStyles.subHeader}>
          {subtitle}
        </div>

        {/* Scrollable Content */}
        <main
          className="content-area"
          style={layoutStyles.content}
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
          style={{ 
            position: "fixed", 
            inset: 0, 
            background: "rgba(0,0,0,0.5)", 
            zIndex: 999 
          }}
        />
      )}
    </div>
  );
};

export default Layout;