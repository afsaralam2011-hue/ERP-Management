// src/components/common/Layout.jsx
import React from 'react';
import Header from './Header';
import Navigation from './Navigation';

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
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      border: 'none',
      margin: 0,
      padding: 0
    }}>
      {/* یہاں Navigation.jsx استعمال ہو رہا ہے */}
      {showSidebar && <Navigation />}

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        background: '#f1f5f9',
        border: 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}>
        {showHeader && (
          <Header title={title} subtitle={subtitle} />
        )}
        
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          position: 'relative',
          border: 'none',
          margin: 0,
          width: '100%',
          height: '100%'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;