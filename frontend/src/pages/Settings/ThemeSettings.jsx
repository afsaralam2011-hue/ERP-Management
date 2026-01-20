// src/pages/Settings/ThemeSettings.jsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeSettings.css';

const ThemeSettings = () => {
  const { theme, themes, changeTheme } = useTheme();

  const themeOptions = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean corporate theme perfect for business use. Blue accents with light backgrounds.',
      type: 'light',
      colors: {
        primary: '#1E40AF',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#1E293B',
        accent: '#059669'
      }
    },
    {
      id: 'light',
      name: 'Light',
      description: 'Bright and clean interface with modern design. Easy on the eyes for daytime use.',
      type: 'light',
      colors: {
        primary: '#2563EB',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1E293B',
        accent: '#DC2626'
      }
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Dark mode for reduced eye strain. Perfect for low-light environments.',
      type: 'dark',
      colors: {
        primary: '#60A5FA',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F1F5F9',
        accent: '#10B981'
      }
    },
    {
      id: 'midnight',
      name: 'Midnight',
      description: 'Deep dark theme with purple accents. Modern and professional look.',
      type: 'dark',
      colors: {
        primary: '#818CF8',
        background: '#111827',
        surface: '#1F2937',
        text: '#F9FAFB',
        accent: '#F59E0B'
      }
    }
  ];

  const tips = [
    {
      icon: '💡',
      text: 'Themes are automatically saved in your browser'
    },
    {
      icon: '👁️',
      text: 'Dark themes reduce eye strain in low-light environments'
    },
    {
      icon: '🎨',
      text: 'Professional theme is optimized for corporate use'
    },
    {
      icon: '⚡',
      text: 'Changes apply instantly across all pages'
    },
    {
      icon: '📱',
      text: 'Themes are fully responsive on all devices'
    },
    {
      icon: '🔒',
      text: 'Your theme preference is stored locally'
    }
  ];

  return (
    <div className="theme-settings-page">
      {/* Header Section */}
      <div className="settings-header">
        <h1>Theme Settings</h1>
        <p>
          Customize the appearance of your ERP dashboard. Choose from professionally designed themes 
          that instantly transform the look and feel of your application.
        </p>
        <div className="company-badge">
          <div className="badge-content">
            <div className="badge-title">PAKISTAN WIRE INDUSTRIES</div>
            <div className="badge-subtitle">SPI & CCD | ERP SYSTEM</div>
          </div>
        </div>
      </div>

      {/* Current Theme Section */}
      <div className="current-theme-section">
        <h3 className="section-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Current Theme
        </h3>
        
        <div className="current-theme-info">
          <div className="info-item">
            <span className="info-label">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Theme Name
            </span>
            <span className="info-value">
              {theme.label}
              <span className="color-preview" style={{ backgroundColor: theme.colors.primary }}></span>
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Type
            </span>
            <span className="info-value">
              {theme.type === 'light' ? 'Light Theme' : 'Dark Theme'}
              <span className={`theme-type ${theme.type}`}>
                {theme.type === 'light' ? '☀️' : '🌙'}
                {theme.type === 'light' ? 'Light' : 'Dark'}
              </span>
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Primary Color
            </span>
            <span className="info-value">
              {theme.colors.primary}
              <span className="color-preview" style={{ backgroundColor: theme.colors.primary }}></span>
            </span>
          </div>
        </div>

        <div className="preview-container">
          <h4 className="preview-title">Preview</h4>
          <div className="preview-grid">
            <div className="preview-item">
              <div className="preview-sample" style={{ backgroundColor: theme.colors.primary, color: 'white' }}>
                Primary Color
              </div>
              <span style={{ color: theme.colors.textPrimary }}>Text Color</span>
            </div>
            
            <div className="preview-item">
              <div className="preview-sample" style={{ backgroundColor: theme.colors.background }}>
                Background
              </div>
              <span style={{ color: theme.colors.textSecondary }}>Secondary Text</span>
            </div>
            
            <div className="preview-item">
              <div className="preview-sample" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
                Surface
              </div>
              <span style={{ color: theme.colors.success }}>Success Color</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <h3 className="section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 21C4.23858 21 2 18.7614 2 16C2 13.2386 4.23858 11 7 11C9.76142 11 12 13.2386 12 16C12 18.7614 9.76142 21 7 21ZM7 21V3M7 3L10 6M7 3L4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17 21C14.2386 21 12 18.7614 12 16C12 13.2386 14.2386 11 17 11C19.7614 11 22 13.2386 22 16C22 18.7614 19.7614 21 17 21ZM17 21V3M17 3L20 6M17 3L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Available Themes
      </h3>
      
      <div className="themes-grid">
        {themeOptions.map((option) => (
          <div
            key={option.id}
            className={`theme-card ${theme.name === option.id ? 'active' : ''}`}
            onClick={() => changeTheme(option.id)}
            style={{
              '--theme-color-primary': option.colors.primary,
              '--theme-color-accent': option.colors.accent,
            }}
          >
            <div className="theme-card-header">
              <h4>{option.name}</h4>
              {theme.name === option.id && (
                <span className="active-badge">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Active
                </span>
              )}
            </div>
            
            <span className={`theme-type ${option.type}`}>
              {option.type === 'light' ? '☀️' : '🌙'}
              {option.type === 'light' ? 'Light Theme' : 'Dark Theme'}
            </span>
            
            <p className="theme-description">{option.description}</p>
            
            <div className="theme-colors-preview">
              <div 
                className="color-preview-item" 
                style={{ backgroundColor: option.colors.primary }}
                title="Primary Color"
              >
                <span className="color-label">Primary</span>
              </div>
              <div 
                className="color-preview-item" 
                style={{ backgroundColor: option.colors.background }}
                title="Background"
              >
                <span className="color-label">Background</span>
              </div>
              <div 
                className="color-preview-item" 
                style={{ backgroundColor: option.colors.surface }}
                title="Surface"
              >
                <span className="color-label">Surface</span>
              </div>
              <div 
                className="color-preview-item" 
                style={{ backgroundColor: option.colors.accent }}
                title="Accent"
              >
                <span className="color-label">Accent</span>
              </div>
            </div>
            
            <button className="select-theme-btn">
              {theme.name === option.id ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 4L6.5 10.5L3 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Currently Active
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Select Theme
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h4>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Theme Tips & Information
        </h4>
        
        <div className="tips-grid">
          {tips.map((tip, index) => (
            <div key={index} className="tip-item">
              <span className="tip-icon">{tip.icon}</span>
              <div className="tip-content">
                <p>{tip.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;