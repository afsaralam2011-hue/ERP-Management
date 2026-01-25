// frontend/src/components/common/Layout.jsx

import React, { useState } from "react";
import Header from "../Header/Header";
import Navigation from "./Navigation";
import { FiMenu } from "react-icons/fi";
import "./Layout.css";

const Layout = ({
  children,
  title = "Daily Production Report",
  subtitle = "Daily Production Summary",
  showHeader = true,
  showSidebar = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-theme-background overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      {showSidebar && (
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-[280px] bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="h-full overflow-y-auto">
            <Navigation isOpen={true} />
          </div>
        </aside>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative transition-all duration-300">

        {/* Header */}
        {showHeader && (
          <header className="sticky top-0 z-30 w-full bg-white shadow-sm shrink-0">
            {/* Mobile Header Controls */}
            <div className="lg:hidden flex items-center p-4 border-b border-gray-100 bg-white">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                <FiMenu size={24} />
              </button>
              <span className="ml-3 font-semibold text-gray-800 truncate">{title}</span>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block w-full">
              <Header title={title} subtitle={subtitle} />
            </div>
          </header>
        )}

        {/* Sub Header (now handled within Header or Main Content) */}
        {!showHeader && isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(true)} // Re-open menu if header hidden
            className="absolute top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg lg:hidden"
          >
            <FiMenu size={24} />
          </button>
        )}

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 w-full">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;