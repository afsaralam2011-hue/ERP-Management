import React, { useState, useEffect } from "react";
import Header from "../Header/Header";
import Navigation from "./Navigation";
import "./Layout.css";

const Layout = ({
  children,
  title = "ERP Dashboard",
  subtitle = "Welcome to Pakistan Wire Industries ERP System",
  showHeader = true,
  showSidebar = true,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="layout-root">
      {/* ========== SIDEBAR ========== */}
      {showSidebar && <Navigation />}

      {/* ========== MAIN ========== */}
      <div className="layout-main">
        {/* HEADER - title aur subtitle props pass karein */}
        {showHeader && (
          <div className="layout-header">
            <Header title={title} subtitle={subtitle} />
          </div>
        )}

        {/* CONTENT */}
        <main
          className={`layout-content ${
            isMobile ? "layout-content-mobile" : ""
          }`}
        >
          <div className="layout-inner">{children}</div>
        </main>

        {/* MOBILE FOOTER */}
        {isMobile && (
          <footer className="layout-footer">
            Pakistan Wire Industries ERP System ©{" "}
            {new Date().getFullYear()}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;