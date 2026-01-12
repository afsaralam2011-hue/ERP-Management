// src/components/common/Logo.jsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Logo = () => {
  const { currentTheme } = useTheme();
  
  // Logo colors کو theme سے independent رکھیں
  const logoColor = '#646cff';
  const logoHoverColor = '#00B7B5';
  
  return (
    <div className="logo-container">
      <svg 
        className="logo" 
        width="120" 
        height="120" 
        viewBox="0 0 120 120"
        style={{
          filter: `drop-shadow(0 0 2em ${logoColor}aa)`,
          transition: 'filter 300ms'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = `drop-shadow(0 0 2em ${logoHoverColor}aa)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = `drop-shadow(0 0 2em ${logoColor}aa)`;
        }}
      >
        {/* Your logo SVG here */}
        <circle cx="60" cy="60" r="50" fill="#f5f5f5" stroke="#ddd" strokeWidth="2" />
        <text x="60" y="70" textAnchor="middle" fill={currentTheme.primary} fontSize="24" fontWeight="bold">
          ERP
        </text>
      </svg>
    </div>
  );
};

export default Logo;