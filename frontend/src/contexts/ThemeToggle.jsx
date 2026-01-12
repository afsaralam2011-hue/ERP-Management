import React from 'react';
import { FiSun, FiMoon, FiSettings, FiPalette } from 'react-icons/fi';
import { useTheme } from './ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme, changeTheme, themes } = useTheme();
  
  return (
    <div className="theme-toggle">
      <button 
        onClick={toggleTheme}
        className="theme-toggle-btn"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <FiMoon /> : <FiSun />}
      </button>
      
      <div className="theme-dropdown">
        <button className="theme-presets-btn">
          <FiPalette />
        </button>
        <div className="theme-presets">
          {Object.entries(themes).map(([key, themeObj]) => (
            <button
              key={key}
              onClick={() => changeTheme(key)}
              className={`theme-preset ${theme === key ? 'active' : ''}`}
              style={{ '--theme-primary': themeObj.primary }}
              title={themeObj.name.charAt(0).toUpperCase() + themeObj.name.slice(1)}
            >
              <div className="theme-preset-preview">
                <div style={{ backgroundColor: themeObj.primary }}></div>
                <div style={{ backgroundColor: themeObj.secondary }}></div>
                <div style={{ backgroundColor: themeObj.background }}></div>
              </div>
              <span>{themeObj.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};