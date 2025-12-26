// src/components/common/Layout.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';

const Layout = ({ 
  children, 
  title = "ERP Dashboard", 
  subtitle = "Welcome to Pakistan Wire Industries ERP System",
  showHeader = true,
  showSidebar = true 
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      background: '#f1f5f9'
    }}>
      {/* Sidebar */}
      {showSidebar && <Navigation />}

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        background: '#f1f5f9',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        width: '100%',
        height: '100vh'
      }}>
        {/* Header */}
        {showHeader && (
          <div style={{
            flexShrink: 0,
            width: '100%',
            zIndex: 100
          }}>
            <Header title={title} subtitle={subtitle} />
          </div>
        )}
        
        {/* Page Content */}
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '12px' : '20px',
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 140px)',
          boxSizing: 'border-box',
          background: '#f1f5f9'
        }}>
          <div style={{
            maxWidth: '100%',
            margin: '0 auto',
            height: '100%',
            overflow: 'auto'
          }}>
            {children}
          </div>
        </main>

        {/* Footer for Mobile */}
        {isMobile && (
          <div style={{
            background: 'white',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 16px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#64748b',
            flexShrink: 0
          }}>
            Pakistan Wire Industries ERP System © {new Date().getFullYear()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;