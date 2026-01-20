// src/contexts/ThemeToggle.jsx
import React, { useState } from 'react';
import { FiSun, FiMoon, FiPalette, FiCheck } from 'react-icons/fi';
import { useTheme } from './ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme, changeTheme, themes } = useTheme();
  const [showPalette, setShowPalette] = useState(false);
  
  return (
    <div className="theme-toggle">
      {/* Light/Dark Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="theme-toggle-btn"
        title={`Switch to ${theme.name === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme.name === 'dark' ? <FiSun /> : <FiMoon />}
      </button>
      
      {/* Theme Palette Dropdown */}
      <div className="theme-dropdown">
        <button 
          className="theme-presets-btn"
          onClick={() => setShowPalette(!showPalette)}
          title="Change theme palette"
        >
          <FiPalette />
        </button>
        
        {showPalette && (
          <div className="theme-presets">
            {themes.map((themeObj) => (
              <button
                key={themeObj.name}
                onClick={() => {
                  changeTheme(themeObj.name);
                  setShowPalette(false);
                }}
                className={`theme-preset ${theme.name === themeObj.name ? 'active' : ''}`}
                title={themeObj.name.charAt(0).toUpperCase() + themeObj.name.slice(1)}
              >
                <div className="theme-preset-preview">
                  <div style={{ backgroundColor: themeObj.colors.primary }}></div>
                  <div style={{ backgroundColor: themeObj.colors.secondary }}></div>
                  <div style={{ backgroundColor: themeObj.colors.background }}></div>
                </div>
                <span>{themeObj.name}</span>
                {theme.name === themeObj.name && <FiCheck className="theme-check-icon" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};