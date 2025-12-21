// src/components/common/Layout.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ 
  children, 
  title = "ERP Dashboard", 
  subtitle = "Welcome to Pakistan Wire Industries ERP System",
  showHeader = true,
  showSidebar = true 
}) => {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      width: '100vw',
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif"
    }}>
      {/* Sidebar - صرف دکھائیں اگر showSidebar true ہو */}
      {showSidebar && <Sidebar />}

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        background: '#f1f5f9'
      }}>
        {/* Header - صرف دکھائیں اگر showHeader true ہو */}
        {showHeader && (
          <Header title={title} subtitle={subtitle} />
        )}
        
        {/* Page content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px',
          position: 'relative'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;