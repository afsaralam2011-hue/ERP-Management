// frontend/src/components/common/Layout.jsx

import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import Navigation from "./Navigation";
import { useTheme } from "../../contexts/ThemeContext";


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
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

      {/* Sidebar - Hidden on mobile, Flex on desktop */}
      <aside
        className={`z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex-shrink-0
          ${isMobile
            ? (sidebarOpen ? "fixed inset-y-0 left-0 w-64 shadow-2xl" : "hidden")
            : (sidebarOpen || "hover:w-64") && "w-64" // Desktop expanded
          }
          ${!isMobile && !sidebarOpen && "w-20"} // Desktop collapsed
        `}
        onMouseEnter={() => !isMobile && setSidebarOpen(true)}
        onMouseLeave={() => !isMobile && setSidebarOpen(false)}
      >
        <Navigation isOpen={sidebarOpen || isMobile} onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative w-full">

        {/* Header */}
        {showHeader && (
          <header className={`h-16 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 z-40
            ${isMobile ? "sticky top-0" : "relative"}
          `}>
            <div className="flex items-center justify-between h-full px-4">
              {/* Mobile Menu Toggle */}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              )}
              <Header title={title} subtitle={subtitle} />
            </div>
          </header>
        )}

        {/* Subtitle / Breadcrumb Bar */}
        <div className="h-10 w-full bg-gray-50 dark:bg-gray-900 flex items-center px-6 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          {subtitle}
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 w-full p-4 md:p-6 pb-20">
          <div className="container mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>

        {/* Mobile Backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
