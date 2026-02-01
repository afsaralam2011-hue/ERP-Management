// src/layouts/EnhancedLayout.jsx
import React from 'react';

const EnhancedLayout = ({ 
  children, 
  title, 
  subtitle, 
  showThemeToggle = true 
}) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '20px 30px',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '28px', 
          color: '#1e293b' 
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ 
            margin: '0', 
            color: '#64748b', 
            fontSize: '16px' 
          }}>
            {subtitle}
          </p>
        )}
        
        {showThemeToggle && (
          <div style={{ marginTop: '15px' }}>
            {/* Theme Toggle Button */}
            <button style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              🌙 Toggle Theme
            </button>
          </div>
        )}
      </div>
      
      {/* Main Content - یہاں ڈیش بورڈ رینڈر ہوگا */}
      <div style={{ padding: '20px' }}>
        {children}
      </div>
      
      {/* Footer */}
      <div style={{
        background: 'white',
        padding: '20px 30px',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()} Production Management System
      </div>
    </div>
  );
};

export default EnhancedLayout;