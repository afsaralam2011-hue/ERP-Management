import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { themes } from '../../utils/themes';
import './ThemeSettings.css';

const ThemeSettings = () => {
  const { theme, changeTheme } = useTheme();

  return (
    <div className="theme-settings-page">
      <div className="settings-header">
        <h1>Theme Settings</h1>
        <p>Choose a theme for your ERP Dashboard. Changes will apply immediately.</p>
      </div>
      
      <div className="current-theme">
        <h3>Current Theme: <span className="theme-name">{theme.name}</span></h3>
        <div className="theme-preview">
          <div className="preview-box" style={{ backgroundColor: theme.colors.primary }}></div>
          <div className="preview-box" style={{ backgroundColor: theme.colors.secondary }}></div>
          <div className="preview-box" style={{ backgroundColor: theme.colors.accent }}></div>
        </div>
      </div>
      
      <div className="themes-grid">
        {Object.entries(themes).map(([key, themeColors]) => (
          <div 
            key={key}
            className={`theme-card ${theme.name === key ? 'active' : ''}`}
            onClick={() => changeTheme(key, themeColors)}
          >
            <div className="theme-card-header">
              <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
              {theme.name === key && (
                <span className="active-badge">Active</span>
              )}
            </div>
            
            <div className="theme-colors">
              <div 
                className="color-swatch" 
                style={{ backgroundColor: themeColors.primary }}
                title={`Primary: ${themeColors.primary}`}
              >
                <span>Primary</span>
              </div>
              <div 
                className="color-swatch" 
                style={{ backgroundColor: themeColors.secondary }}
                title={`Secondary: ${themeColors.secondary}`}
              >
                <span>Secondary</span>
              </div>
              <div 
                className="color-swatch" 
                style={{ backgroundColor: themeColors.accent }}
                title={`Accent: ${themeColors.accent}`}
              >
                <span>Accent</span>
              </div>
            </div>
            
            <button className="select-theme-btn">
              {theme.name === key ? 'Selected' : 'Select Theme'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSettings;