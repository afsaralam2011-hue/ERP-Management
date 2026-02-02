// src/components/Settings/ThemeSettings.jsx - FINAL VERSION

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ColorPicker from './ColorPicker';
import ThemeSettingsBenchmarks from './ThemeSettingsBenchmarks';
import './ThemeSettings.css';

const ThemeSettings = () => {
  // تھیم کونٹیکسٹ سے فنکشنز اور اسٹیٹ حاصل کریں
  const {
    currentTheme,
    mode,
    themes,
    allThemes,
    customThemes,
    isLoading,
    error,
    setTheme,
    setMode,
    createCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    resetTheme,
    toggleMode,
    isDarkMode,
    isLightMode,
    themeStats
  } = useTheme();

  // لوکل اسٹیٹ
  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  
  // CUSTOM COLORS کو INDIGO/NAVY میں تبدیل کریں
  const [customColors, setCustomColors] = useState({
    primary: '#1976D2',
    secondary: '#64B5F6',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    // Text colors ko black se indigo/navy mein badlein
    textPrimary: '#1A237E',        // Deep Indigo/Navy Blue
    textSecondary: '#283593',      // Medium Indigo/Navy Blue
    border: '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  });
  
  const [importingFile, setImportingFile] = useState(null);
  const [activeTab, setActiveTab] = useState('predefined');
  const [themeSearch, setThemeSearch] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    themeSwitchTime: 0,
    modeSwitchTime: 0,
    renderTime: 0
  });

  // === ہیلپر فنکشنز ===

  const showNotification = useCallback((type, message, duration = 3000) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), duration);
  }, []);

  const handleThemeSelect = useCallback((themeId) => {
    const startTime = performance.now();
    
    try {
      const theme = setTheme(themeId);
      if (theme) {
        const endTime = performance.now();
        const switchTime = endTime - startTime;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          themeSwitchTime: switchTime
        }));
        
        showNotification('success', `Theme "${theme.name}" applied successfully`);
      }
    } catch (err) {
      showNotification('error', `Failed to apply theme: ${err.message}`);
    }
  }, [setTheme, showNotification]);

  const handleModeChange = useCallback((newMode) => {
    const startTime = performance.now();
    
    try {
      setMode(newMode);
      
      const endTime = performance.now();
      const switchTime = endTime - startTime;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        modeSwitchTime: switchTime
      }));
      
      showNotification('success', `Switched to ${newMode} mode`);
      
    } catch (err) {
      showNotification('error', `Failed to switch mode: ${err.message}`);
    }
  }, [setMode, showNotification]);

  const handleCreateCustomTheme = useCallback(() => {
    if (!customThemeName.trim()) {
      showNotification('error', 'Please enter a theme name');
      return;
    }

    try {
      const newTheme = createCustomTheme(customThemeName, customColors, mode);
      if (newTheme) {
        setTheme(newTheme.id);
        
        setShowCustomThemeModal(false);
        setCustomThemeName('');
        
        // FIXED: Colors ko proper indigo/navy mein reset karein
        setCustomColors({
          primary: '#1976D2',
          secondary: '#64B5F6',
          background: '#FFFFFF',
          surface: '#F5F5F5',
          textPrimary: '#1A237E',        // Deep Indigo/Navy Blue
          textSecondary: '#283593',      // Medium Indigo/Navy Blue
          border: '#E0E0E0',
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3'
        });
        
        showNotification('success', `Custom theme "${newTheme.name}" created successfully`);
        setActiveTab('custom');
      }
    } catch (err) {
      showNotification('error', `Failed to create theme: ${err.message}`);
    }
  }, [customThemeName, customColors, mode, createCustomTheme, setTheme, showNotification]);

  const handleDeleteCustomTheme = useCallback((themeId, themeName) => {
    if (!showDeleteConfirm || showDeleteConfirm !== themeId) {
      setShowDeleteConfirm(themeId);
      showNotification('warning', `Click again to delete "${themeName}"`, 2000);
      return;
    }

    try {
      const success = deleteCustomTheme(themeId);
      if (success) {
        showNotification('success', `Theme "${themeName}" deleted successfully`);
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      showNotification('error', `Failed to delete theme: ${err.message}`);
      setShowDeleteConfirm(null);
    }
  }, [deleteCustomTheme, showNotification, showDeleteConfirm]);

  const handleExportTheme = useCallback((theme = currentTheme) => {
    try {
      const success = exportTheme(theme.id);
      if (success) {
        showNotification('success', `Theme "${theme.name}" exported successfully`);
      }
    } catch (err) {
      showNotification('error', `Failed to export theme: ${err.message}`);
    }
  }, [exportTheme, currentTheme, showNotification]);

  const handleImportTheme = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportingFile(file.name);

    importTheme(file)
      .then((importedTheme) => {
        showNotification('success', `Theme "${importedTheme.name}" imported successfully`);
        setTheme(importedTheme.id);
        setActiveTab('custom');
        setImportingFile(null);
        e.target.value = '';
      })
      .catch((err) => {
        showNotification('error', `Import failed: ${err.message}`);
        setImportingFile(null);
        e.target.value = '';
      });
  }, [importTheme, setTheme, showNotification]);

  const handleResetTheme = useCallback(() => {
    if (window.confirm('Are you sure you want to reset to default theme?')) {
      try {
        resetTheme();
        showNotification('success', 'Theme reset to default successfully');
        setActiveTab('predefined');
      } catch (err) {
        showNotification('error', `Failed to reset theme: ${err.message}`);
      }
    }
  }, [resetTheme, showNotification]);

  const handleDuplicateTheme = useCallback((theme) => {
    try {
      const duplicatedTheme = createCustomTheme(
        `${theme.name} (Copy)`,
        theme.colors,
        theme.mode
      );
      
      if (duplicatedTheme) {
        showNotification('success', `Theme "${theme.name}" duplicated`);
      }
    } catch (err) {
      showNotification('error', `Failed to duplicate theme: ${err.message}`);
    }
  }, [createCustomTheme, showNotification]);

  const handleColorChange = useCallback((colorType, color) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: color
    }));
  }, []);

  // === فلٹرڈ تھیمز ===

  const predefinedThemes = useMemo(() => {
    const filtered = allThemes.filter(t => !t.isCustom && t.category !== 'custom');
    
    if (themeSearch.trim()) {
      const searchTerm = themeSearch.toLowerCase();
      return filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm) ||
        t.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }, [allThemes, themeSearch]);

  const filteredCustomThemes = useMemo(() => {
    if (themeSearch.trim()) {
      const searchTerm = themeSearch.toLowerCase();
      return customThemes.filter(t => 
        t.name.toLowerCase().includes(searchTerm) ||
        t.description?.toLowerCase().includes(searchTerm)
      );
    }
    return customThemes;
  }, [customThemes, themeSearch]);

  // === ایفیکٹس ===

  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ type: '', message: '' });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime
      }));
    };
  }, [activeTab, showBenchmarks, showCustomThemeModal]);

  // === رینڈرنگ ===

  if (isLoading) {
    return (
      <div className="theme-settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading themes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="theme-settings-error">
        <div className="error-icon">⚠️</div>
        <h3>Theme Error</h3>
        <p className="error-message">{error.message}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="theme-settings">
      {/* نوٹیفکیشن */}
      {notification.message && (
        <div className={`notification notification-${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '✓' : 
             notification.type === 'error' ? '✗' : 
             notification.type === 'warning' ? '⚠' : 'ℹ'}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => setNotification({ type: '', message: '' })}
          >
            ✕
          </button>
        </div>
      )}

      {/* ہیڈر - MODE TOGGLE BUTTON ADDED */}
      <div className="theme-settings-header">
        <div className="header-content">
          <h1 className="header-title">
            <span className="header-icon">🎨</span>
            Theme Settings
          </h1>
          <p className="header-subtitle">
            Customize the appearance of your application
          </p>
          
          {/* MODE TOGGLE BUTTON - Yeh header ke andar add kiya hai */}
          <div className="header-mode-toggle">
            <button
              className="mode-toggle-button"
              onClick={toggleMode}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
            >
              <span className="mode-toggle-icon">
                {isDarkMode ? '☀️' : '🌙'}
              </span>
              <span className="mode-toggle-text">
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </span>
            </button>
          </div>
        </div>
        
        {/* پرفارمنس بینچ مارکس ٹوگل */}
        <div className="header-actions">
          <button
            className={`benchmarks-toggle ${showBenchmarks ? 'active' : ''}`}
            onClick={() => setShowBenchmarks(!showBenchmarks)}
            title="Performance Benchmarks"
          >
            <span className="benchmarks-icon">⚡</span>
            <span className="benchmarks-text">
              {showBenchmarks ? 'Hide Benchmarks' : 'Show Benchmarks'}
            </span>
          </button>
        </div>
      </div>

      {/* پرفارمنس بینچ مارکس */}
      {showBenchmarks && (
        <ThemeSettingsBenchmarks 
          performanceMetrics={performanceMetrics}
          themeStats={themeStats}
          currentTheme={currentTheme}
          isDarkMode={isDarkMode}
          isLightMode={isLightMode}
        />
      )}

      {/* کرنٹ تھیم پریویو */}
      <div className="current-theme-preview">
        <div className="preview-header">
          <h3>Current Theme</h3>
          <div className="theme-badge mode-badge">
            {currentTheme?.mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </div>
        </div>
        <div className="preview-content">
          <div 
            className="theme-color-display"
            style={{ backgroundColor: currentTheme?.colors?.primary }}
          >
            <div className="color-info">
              <span className="color-hex">{currentTheme?.colors?.primary}</span>
              <span className="color-name">Primary</span>
            </div>
          </div>
          <div className="theme-info">
            <h4 className="theme-name">{currentTheme?.name}</h4>
            <p className="theme-description">{currentTheme?.description || 'No description'}</p>
            <div className="theme-meta">
              <span className="meta-item">
                <span className="meta-icon">📊</span>
                {currentTheme?.category || 'predefined'}
              </span>
              {currentTheme?.isCustom && (
                <span className="meta-item">
                  <span className="meta-icon">🕒</span>
                  {new Date(currentTheme.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <button
            className="export-current-button"
            onClick={() => handleExportTheme(currentTheme)}
            title="Export this theme"
          >
            <span className="export-icon">📤</span>
            Export
          </button>
        </div>
      </div>

      {/* ٹیب نیویگیشن */}
      <div className="theme-tabs">
        <button
          className={`theme-tab ${activeTab === 'predefined' ? 'active' : ''}`}
          onClick={() => setActiveTab('predefined')}
        >
          <span className="tab-icon">🎭</span>
          <span className="tab-text">Predefined</span>
          <span className="tab-count">{predefinedThemes.length}</span>
        </button>
        
        <button
          className={`theme-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          <span className="tab-icon">✨</span>
          <span className="tab-text">Custom</span>
          <span className="tab-count">{filteredCustomThemes.length}</span>
        </button>
        
        <button
          className={`theme-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          <span className="tab-icon">⚡</span>
          <span className="tab-text">Actions</span>
        </button>
        
        <button
          className={`theme-tab ${activeTab === 'mode' ? 'active' : ''}`}
          onClick={() => setActiveTab('mode')}
        >
          <span className="tab-icon">🌓</span>
          <span className="tab-text">Mode</span>
        </button>
      </div>

      {/* سرچ بار */}
      <div className="theme-search">
        <input
          type="text"
          placeholder="Search themes by name or description..."
          value={themeSearch}
          onChange={(e) => setThemeSearch(e.target.value)}
          className="search-input"
        />
        {themeSearch && (
          <button 
            className="search-clear"
            onClick={() => setThemeSearch('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* ٹیب کنٹینٹ */}
      <div className="tab-content">
        {/* پری ڈیفائنڈ تھیمز */}
        {activeTab === 'predefined' && (
          <div className="themes-grid">
            {predefinedThemes.length === 0 ? (
              <div className="no-themes-message">
                <div className="no-themes-icon">🔍</div>
                <h4>No themes found</h4>
                <p>Try a different search term or clear the search</p>
              </div>
            ) : (
              predefinedThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-card ${currentTheme?.id === theme.id ? 'active' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  <div className="theme-card-preview">
                    <div className="preview-colors">
                      <div 
                        className="color-dot primary" 
                        style={{ backgroundColor: theme.colors.primary }}
                        title={`Primary: ${theme.colors.primary}`}
                      />
                      <div 
                        className="color-dot secondary" 
                        style={{ backgroundColor: theme.colors.secondary }}
                        title={`Secondary: ${theme.colors.secondary}`}
                      />
                      <div 
                        className="color-dot background" 
                        style={{ backgroundColor: theme.colors.background }}
                        title={`Background: ${theme.colors.background}`}
                      />
                    </div>
                    <div className="theme-mode-indicator">
                      {theme.mode === 'dark' ? '🌙' : '☀️'}
                    </div>
                  </div>
                  <div className="theme-card-content">
                    <h4 className="theme-name">{theme.name}</h4>
                    <p className="theme-description">
                      {theme.description || 'No description available'}
                    </p>
                    <div className="theme-tags">
                      <span className="theme-tag">{theme.category}</span>
                      <span className="theme-tag">{theme.mode}</span>
                    </div>
                  </div>
                  {currentTheme?.id === theme.id && (
                    <div className="theme-active-indicator">
                      <div className="active-dot"></div>
                      <span className="active-text">Active</span>
                    </div>
                  )}
                  <button
                    className="theme-duplicate-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateTheme(theme);
                    }}
                    title="Duplicate this theme"
                  >
                    <span className="duplicate-icon">📋</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* کسٹم تھیمز */}
        {activeTab === 'custom' && (
          <div className="custom-themes-section">
            <div className="section-header">
              <h3>Your Custom Themes</h3>
              <button
                className="create-theme-button"
                onClick={() => setShowCustomThemeModal(true)}
              >
                <span className="create-icon">+</span>
                Create New Theme
              </button>
            </div>
            
            {filteredCustomThemes.length === 0 ? (
              <div className="no-custom-themes">
                <div className="empty-state">
                  <div className="empty-icon">🎨</div>
                  <h4>No custom themes yet</h4>
                  <p>Create your first custom theme to get started</p>
                  <button
                    className="create-first-theme"
                    onClick={() => setShowCustomThemeModal(true)}
                  >
                    Create Your First Theme
                  </button>
                </div>
              </div>
            ) : (
              <div className="themes-grid">
                {filteredCustomThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-card custom ${currentTheme?.id === theme.id ? 'active' : ''}`}
                  >
                    <div 
                      className="theme-card-preview"
                      onClick={() => handleThemeSelect(theme.id)}
                    >
                      <div className="preview-colors">
                        <div 
                          className="color-dot primary" 
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div 
                          className="color-dot secondary" 
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div 
                          className="color-dot background" 
                          style={{ backgroundColor: theme.colors.background }}
                        />
                        <div 
                          className="color-dot text" 
                          style={{ backgroundColor: theme.colors.textPrimary }}
                        />
                      </div>
                      <div className="theme-mode-indicator">
                        {theme.mode === 'dark' ? '🌙' : '☀️'}
                      </div>
                    </div>
                    <div className="theme-card-content">
                      <div className="theme-header">
                        <h4 className="theme-name">{theme.name}</h4>
                        <span className="theme-date">
                          {new Date(theme.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="theme-description">
                        {theme.description || 'Custom user theme'}
                      </p>
                      <div className="theme-actions">
                        <button
                          className="action-button export-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportTheme(theme);
                          }}
                          title="Export theme"
                        >
                          📤
                        </button>
                        <button
                          className={`action-button delete-button ${
                            showDeleteConfirm === theme.id ? 'confirm' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomTheme(theme.id, theme.name);
                          }}
                          title={showDeleteConfirm === theme.id ? 'Click again to confirm' : 'Delete theme'}
                        >
                          {showDeleteConfirm === theme.id ? '✓' : '🗑️'}
                        </button>
                      </div>
                    </div>
                    {currentTheme?.id === theme.id && (
                      <div className="theme-active-indicator">
                        <div className="active-dot"></div>
                        <span className="active-text">Active</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ایکشنز ٹیب */}
        {activeTab === 'actions' && (
          <div className="actions-grid">
            <div 
              className="action-card create"
              onClick={() => setShowCustomThemeModal(true)}
            >
              <div className="action-icon">🎨</div>
              <div className="action-content">
                <h4>Create New Theme</h4>
                <p>Design your own color scheme</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <label className="action-card import">
              <div className="action-icon">📥</div>
              <div className="action-content">
                <h4>Import Theme</h4>
                <p>{importingFile || 'Upload theme JSON file'}</p>
              </div>
              <div className="action-arrow">→</div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportTheme}
                style={{ display: 'none' }}
              />
            </label>

            <div 
              className="action-card export-all"
              onClick={() => {
                if (customThemes.length > 0) {
                  const allThemesData = JSON.stringify(customThemes, null, 2);
                  const blob = new Blob([allThemesData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'all-custom-themes.json';
                  a.click();
                  URL.revokeObjectURL(url);
                  showNotification('success', 'All custom themes exported');
                } else {
                  showNotification('info', 'No custom themes to export');
                }
              }}
            >
              <div className="action-icon">📦</div>
              <div className="action-content">
                <h4>Export All Custom Themes</h4>
                <p>Download all your custom themes</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div 
              className="action-card reset"
              onClick={handleResetTheme}
            >
              <div className="action-icon">🔄</div>
              <div className="action-content">
                <h4>Reset to Default</h4>
                <p>Restore original theme settings</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div 
              className="action-card toggle-mode"
              onClick={toggleMode}
            >
              <div className="action-icon">{isDarkMode ? '☀️' : '🌙'}</div>
              <div className="action-content">
                <h4>Toggle Dark/Light Mode</h4>
                <p>Switch between dark and light themes</p>
              </div>
              <div className="action-arrow">→</div>
            </div>

            <div 
              className="action-card refresh"
              onClick={() => window.location.reload()}
            >
              <div className="action-icon">🔄</div>
              <div className="action-content">
                <h4>Refresh Application</h4>
                <p>Reload the page to apply all changes</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          </div>
        )}

        {/* موڈ ٹیب */}
        {activeTab === 'mode' && (
          <div className="mode-section">
            <div className="mode-cards">
              <div 
                className={`mode-card ${isLightMode ? 'active' : ''}`}
                onClick={() => handleModeChange('light')}
              >
                <div className="mode-icon">☀️</div>
                <div className="mode-content">
                  <h4>Light Mode</h4>
                  <p>Bright interface, ideal for daytime use</p>
                  <ul className="mode-features">
                    <li>✓ Reduced eye strain in bright environments</li>
                    <li>✓ Better color accuracy</li>
                    <li>✓ Traditional reading experience</li>
                  </ul>
                </div>
                {isLightMode && <div className="mode-check">✓ Active</div>}
              </div>

              <div 
                className={`mode-card ${isDarkMode ? 'active' : ''}`}
                onClick={() => handleModeChange('dark')}
              >
                <div className="mode-icon">🌙</div>
                <div className="mode-content">
                  <h4>Dark Mode</h4>
                  <p>Dark interface, reduces eye strain at night</p>
                  <ul className="mode-features">
                    <li>✓ Reduced blue light emission</li>
                    <li>✓ Saves battery on OLED screens</li>
                    <li>✓ Better for low-light environments</li>
                  </ul>
                </div>
                {isDarkMode && <div className="mode-check">✓ Active</div>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* کسٹم تھیم موڈل */}
      {showCustomThemeModal && (
        <div className="modal-overlay" onClick={() => setShowCustomThemeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Custom Theme</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCustomThemeModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Theme Name</label>
                <input
                  type="text"
                  value={customThemeName}
                  onChange={(e) => setCustomThemeName(e.target.value)}
                  placeholder="My Awesome Theme"
                  className="theme-name-input"
                />
              </div>

              <div className="color-pickers-section">
                <h4>Color Scheme</h4>
                <div className="color-pickers-grid">
                  {Object.entries({
                    primary: 'Primary Color',
                    secondary: 'Secondary Color',
                    background: 'Background',
                    surface: 'Surface',
                    textPrimary: 'Text Primary',
                    textSecondary: 'Text Secondary',
                    border: 'Border',
                    success: 'Success',
                    warning: 'Warning',
                    error: 'Error',
                    info: 'Info'
                  }).map(([key, label]) => (
                    <ColorPicker
                      key={key}
                      label={label}
                      color={customColors[key]}
                      onChange={(color) => handleColorChange(key, color)}
                      className="color-picker-item"
                    />
                  ))}
                </div>
              </div>

              <div className="theme-mode-selection">
                <h4>Theme Mode</h4>
                <div className="mode-options">
                  <button
                    className={`mode-option ${mode === 'light' ? 'active' : ''}`}
                    onClick={() => setMode('light')}
                  >
                    <span className="option-icon">☀️</span>
                    Light Mode
                  </button>
                  <button
                    className={`mode-option ${mode === 'dark' ? 'active' : ''}`}
                    onClick={() => setMode('dark')}
                  >
                    <span className="option-icon">🌙</span>
                    Dark Mode
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-button secondary"
                onClick={() => setShowCustomThemeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button primary"
                onClick={handleCreateCustomTheme}
              >
                Create Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSettings;