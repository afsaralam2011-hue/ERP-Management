// src/components/Settings/ThemeSettings.jsx

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ColorPicker from './ColorPicker';
import './ThemeSettings.css';

const ThemeSettings = () => {
  const {
    currentTheme,
    mode,
    themes,
    customThemes,
    setTheme,
    setMode,
    createCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    resetTheme,
  } = useTheme();

  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customColors, setCustomColors] = useState({
    primary: '#1976D2',
    secondary: '#DC004E',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    textPrimary: '#212121',
    textSecondary: '#757575',
  });
  const [showBenchmarks, setShowBenchmarks] = useState(false); // نئی state

  // Handle mode change (Light/Dark/Device)
  const handleModeChange = (newMode) => {
    if (newMode === 'device') {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    } else {
      setMode(newMode);
    }
  };

  // Handle theme selection
  const handleThemeSelect = (themeId) => {
    setTheme(themeId);
  };

  // Create custom theme
  const handleCreateCustomTheme = () => {
    if (!customThemeName.trim()) {
      alert('Please enter a theme name');
      return;
    }

    const newTheme = createCustomTheme(customThemeName, customColors, mode);
    if (newTheme) {
      setTheme(newTheme.id);
      setShowCustomThemeModal(false);
      setCustomThemeName('');
    }
  };

  // Delete custom theme
  const handleDeleteCustomTheme = (themeId) => {
    if (window.confirm('Are you sure you want to delete this custom theme?')) {
      deleteCustomTheme(themeId);
    }
  };

  // Export theme
  const handleExportTheme = () => {
    exportTheme(currentTheme);
  };

  // Import theme
  const handleImportTheme = (e) => {
    const file = e.target.files[0];
    if (file) {
      importTheme(file).then((importedTheme) => {
        if (importedTheme) {
          alert(`Theme "${importedTheme.name}" imported successfully!`);
        }
      });
    }
  };

  // Predefined themes (non-custom)
  const predefinedThemes = themes.filter(t => !t.isCustom);

  // Performance Benchmarks Component (یہ وہی component ہے جو ThemeSettingsBenchmarks.jsx میں تھا)
  const ThemeSettingsBenchmarks = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const benchmarks = [
      {
        category: 'Rendering Performance',
        metrics: [
          {
            name: 'Initial Page Load',
            target: '< 1.5s',
            good: '< 1s',
            acceptable: '1-2s',
            poor: '> 2s',
            description: 'Time from navigation to interactive UI',
            priority: 'Critical'
          },
          {
            name: 'Theme Switch Time',
            target: '< 200ms',
            good: '< 150ms',
            acceptable: '150-300ms',
            poor: '> 300ms',
            description: 'Time to apply new theme across all components',
            priority: 'High'
          },
          {
            name: 'Modal Open/Close',
            target: '< 100ms',
            good: '< 80ms',
            acceptable: '80-150ms',
            poor: '> 150ms',
            description: 'Animation smoothness for custom theme modal',
            priority: 'Medium'
          },
          {
            name: 'Color Picker Response',
            target: '< 50ms',
            good: '< 30ms',
            acceptable: '30-100ms',
            poor: '> 100ms',
            description: 'Delay between color selection and UI update',
            priority: 'High'
          }
        ]
      },
      {
        category: 'Component Performance',
        metrics: [
          {
            name: 'Theme Grid Render (10 items)',
            target: '< 100ms',
            good: '< 80ms',
            acceptable: '80-150ms',
            poor: '> 150ms',
            description: 'Time to render predefined theme grid',
            priority: 'Medium'
          },
          {
            name: 'Custom Theme Creation',
            target: '< 300ms',
            good: '< 200ms',
            acceptable: '200-500ms',
            poor: '> 500ms',
            description: 'End-to-end time to create and apply custom theme',
            priority: 'Medium'
          },
          {
            name: 'Theme Export',
            target: '< 500ms',
            good: '< 300ms',
            acceptable: '300-800ms',
            poor: '> 800ms',
            description: 'Time to generate and download theme JSON',
            priority: 'Low'
          }
        ]
      },
      {
        category: 'Memory & Resources',
        metrics: [
          {
            name: 'Memory Usage (Idle)',
            target: '< 15MB',
            good: '< 10MB',
            acceptable: '10-20MB',
            poor: '> 20MB',
            description: 'Component memory footprint when idle',
            priority: 'Medium'
          },
          {
            name: 'Memory Usage (Active)',
            target: '< 30MB',
            good: '< 25MB',
            acceptable: '25-40MB',
            poor: '> 40MB',
            description: 'Memory during theme switching/creation',
            priority: 'Medium'
          },
          {
            name: 'CSS Variables Applied',
            target: '< 10ms',
            good: '< 5ms',
            acceptable: '5-20ms',
            poor: '> 20ms',
            description: 'Time to update CSS custom properties',
            priority: 'High'
          }
        ]
      },
      {
        category: 'User Interaction',
        metrics: [
          {
            name: 'Click Response Time',
            target: '< 100ms',
            good: '< 50ms',
            acceptable: '50-150ms',
            poor: '> 150ms',
            description: 'Delay from click to visual feedback',
            priority: 'Critical'
          },
          {
            name: 'Hover Effect Latency',
            target: '< 50ms',
            good: '< 30ms',
            acceptable: '30-80ms',
            poor: '> 80ms',
            description: 'Time for hover states to appear',
            priority: 'Medium'
          },
          {
            name: 'Input Field Response',
            target: '< 16ms',
            good: '< 10ms',
            acceptable: '10-30ms',
            poor: '> 30ms',
            description: 'Typing latency in theme name input',
            priority: 'High'
          }
        ]
      },
      {
        category: 'Accessibility',
        metrics: [
          {
            name: 'Keyboard Navigation',
            target: '100%',
            good: '100%',
            acceptable: '90-99%',
            poor: '< 90%',
            description: 'All interactive elements accessible via keyboard',
            priority: 'Critical'
          },
          {
            name: 'Focus Indicator Visibility',
            target: '3:1 contrast',
            good: '4.5:1+',
            acceptable: '3:1-4.5:1',
            poor: '< 3:1',
            description: 'Focus outline contrast ratio',
            priority: 'Critical'
          },
          {
            name: 'Color Contrast (Text)',
            target: '4.5:1',
            good: '7:1+',
            acceptable: '4.5:1-7:1',
            poor: '< 4.5:1',
            description: 'Text readability across themes',
            priority: 'Critical'
          }
        ]
      },
      {
        category: 'Mobile Performance',
        metrics: [
          {
            name: 'Touch Response Time',
            target: '< 100ms',
            good: '< 70ms',
            acceptable: '70-150ms',
            poor: '> 150ms',
            description: 'Delay from touch to action',
            priority: 'High'
          },
          {
            name: 'Scroll Performance (FPS)',
            target: '60 FPS',
            good: '60 FPS',
            acceptable: '45-60 FPS',
            poor: '< 45 FPS',
            description: 'Smoothness when scrolling theme grid',
            priority: 'High'
          },
          {
            name: 'Modal Rendering (Mobile)',
            target: '< 150ms',
            good: '< 100ms',
            acceptable: '100-200ms',
            poor: '> 200ms',
            description: 'Modal appearance on smaller screens',
            priority: 'Medium'
          }
        ]
      }
    ];

    const categories = ['all', ...new Set(benchmarks.map(b => b.category))];
    
    const filteredBenchmarks = selectedCategory === 'all' 
      ? benchmarks 
      : benchmarks.filter(b => b.category === selectedCategory);

    const getPriorityColor = (priority) => {
      switch(priority) {
        case 'Critical': return 'critical-priority';
        case 'High': return 'high-priority';
        case 'Medium': return 'medium-priority';
        case 'Low': return 'low-priority';
        default: return 'low-priority';
      }
    };

    return (
      <div className="benchmarks-container">
        {/* Header */}
        <div className="benchmarks-header">
          <div className="header-content">
            <span className="header-icon">⚡</span>
            <h1 className="header-title">
              Theme Settings Performance Benchmarks
            </h1>
          </div>
          <p className="header-subtitle">
            Comprehensive performance targets for optimal user experience
          </p>
          
          {/* Summary Stats */}
          <div className="summary-grid">
            <div className="summary-card good-range">
              <div className="summary-card-header">
                <span className="summary-icon">✓</span>
                <span className="summary-title">Good Range</span>
              </div>
              <p className="summary-description">Optimal performance targets</p>
            </div>
            <div className="summary-card acceptable-range">
              <div className="summary-card-header">
                <span className="summary-icon">⚠</span>
                <span className="summary-title">Acceptable</span>
              </div>
              <p className="summary-description">Needs monitoring</p>
            </div>
            <div className="summary-card poor-range">
              <div className="summary-card-header">
                <span className="summary-icon">✕</span>
                <span className="summary-title">Poor</span>
              </div>
              <p className="summary-description">Requires optimization</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <div className="filter-buttons">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`filter-button ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Benchmark Sections */}
        {filteredBenchmarks.map((section, idx) => (
          <div key={idx} className="benchmark-section">
            <div className="section-header">
              <span className="section-icon">📊</span>
              <h2 className="section-title">{section.category}</h2>
            </div>

            <div className="metrics-grid">
              {section.metrics.map((metric, metricIdx) => (
                <div 
                  key={metricIdx}
                  className="metric-card"
                >
                  <div className="metric-header">
                    <div className="metric-info">
                      <div className="metric-title-row">
                        <span className="metric-icon">⏱️</span>
                        <h3 className="metric-name">
                          {metric.name}
                        </h3>
                        <span className={`metric-priority ${getPriorityColor(metric.priority)}`}>
                          {metric.priority}
                        </span>
                      </div>
                      <p className="metric-description">{metric.description}</p>
                    </div>
                    <div className="metric-target">
                      <div className="target-value">{metric.target}</div>
                      <div className="target-label">Target</div>
                    </div>
                  </div>

                  <div className="performance-grid">
                    <div className="performance-card good">
                      <div className="performance-header">
                        <span className="performance-icon">✓</span>
                        <span className="performance-label">Good</span>
                      </div>
                      <div className="performance-value">{metric.good}</div>
                    </div>
                    <div className="performance-card acceptable">
                      <div className="performance-header">
                        <span className="performance-icon">⚠</span>
                        <span className="performance-label">Acceptable</span>
                      </div>
                      <div className="performance-value">{metric.acceptable}</div>
                    </div>
                    <div className="performance-card poor">
                      <div className="performance-header">
                        <span className="performance-icon">✕</span>
                        <span className="performance-label">Poor</span>
                      </div>
                      <div className="performance-value">{metric.poor}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Implementation Notes */}
        <div className="implementation-notes">
          <h3 className="notes-title">📊 Measurement Guidelines</h3>
          <ul className="notes-list">
            <li className="note-item">
              <span className="note-bullet">•</span>
              <span>Use Chrome DevTools Performance tab for render timing measurements</span>
            </li>
            <li className="note-item">
              <span className="note-bullet">•</span>
              <span>Test on representative devices: Desktop (high-end), Laptop (mid-range), Mobile (low-end)</span>
            </li>
            <li className="note-item">
              <span className="note-bullet">•</span>
              <span>Measure under typical load conditions (10-20 custom themes, normal network)</span>
            </li>
            <li className="note-item">
              <span className="note-bullet">•</span>
              <span>Run each test 5+ times and report median values to reduce variance</span>
            </li>
            <li className="note-item">
              <span className="note-bullet">•</span>
              <span>Use React DevTools Profiler for component-specific performance data</span>
            </li>
            <li className="note-item">
              <span className="note-bullet">•</span>
              <span>Validate accessibility with automated tools (axe, Lighthouse) + manual keyboard testing</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="theme-settings">
      {/* Performance Benchmarks Toggle Button */}
      <div className="benchmarks-toggle-section">
        <button
          className="benchmarks-toggle-button"
          onClick={() => setShowBenchmarks(!showBenchmarks)}
        >
          <span className="toggle-icon">⚡</span>
          {showBenchmarks ? 'Hide Performance Benchmarks' : 'Show Performance Benchmarks'}
          <span className="toggle-arrow">{showBenchmarks ? '▼' : '▶'}</span>
        </button>
        <p className="benchmarks-description">
          View performance targets for theme switching, rendering, and user interactions
        </p>
      </div>

      {showBenchmarks && <ThemeSettingsBenchmarks />}

      {/* Mode Selection */}
      <div className="theme-mode-section">
        <h3 className="section-title">Theme Mode</h3>
        <div className="mode-buttons">
          <button
            className={`mode-button ${mode === 'light' ? 'active' : ''}`}
            onClick={() => handleModeChange('light')}
          >
            <span className="mode-icon">☀️</span>
            Light
          </button>
          <button
            className={`mode-button ${mode === 'dark' ? 'active' : ''}`}
            onClick={() => handleModeChange('dark')}
          >
            <span className="mode-icon">🌙</span>
            Dark
          </button>
          <button
            className="mode-button"
            onClick={() => handleModeChange('device')}
          >
            <span className="mode-icon">💻</span>
            Device
          </button>
        </div>
      </div>

      {/* Predefined Themes */}
      <div className="theme-selection-section">
        <h3 className="section-title">Predefined Themes</h3>
        <div className="theme-grid">
          {predefinedThemes.map((theme) => (
            <div
              key={theme.id}
              className={`theme-card ${currentTheme?.id === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <div className="theme-preview">
                <div className="theme-color-circle" style={{ backgroundColor: theme.colors.primary }} />
                <div className="theme-color-circle" style={{ backgroundColor: theme.colors.primaryLight }} />
                <div className="theme-color-circle" style={{ backgroundColor: theme.colors.primaryDark }} />
                <div className="theme-color-circle" style={{ backgroundColor: theme.colors.secondary }} />
              </div>
              <div className="theme-card-name">{theme.name}</div>
              {currentTheme?.id === theme.id && (
                <div className="theme-card-check">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Themes */}
      {customThemes.length > 0 && (
        <div className="custom-themes-section">
          <h3 className="section-title">Custom Themes</h3>
          <div className="theme-grid">
            {customThemes.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card custom ${currentTheme?.id === theme.id ? 'active' : ''}`}
              >
                <div className="theme-preview" onClick={() => handleThemeSelect(theme.id)}>
                  <div className="theme-color-circle" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="theme-color-circle" style={{ backgroundColor: theme.colors.secondary }} />
                  <div className="theme-color-circle" style={{ backgroundColor: theme.colors.background }} />
                  <div className="theme-color-circle" style={{ backgroundColor: theme.colors.surface }} />
                </div>
                <div className="theme-card-name">{theme.name}</div>
                {currentTheme?.id === theme.id && (
                  <div className="theme-card-check">✓</div>
                )}
                <button
                  className="delete-theme-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomTheme(theme.id);
                  }}
                  title="Delete theme"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme Actions */}
      <div className="theme-actions-section">
        <h3 className="section-title">Theme Actions</h3>
        <div className="action-buttons-grid">
          <button 
            className="action-button create"
            onClick={() => setShowCustomThemeModal(true)}
          >
            <span className="button-icon">✨</span>
            <div className="button-content">
              <div className="button-title">Create Custom Theme</div>
              <div className="button-subtitle">Design your own colors</div>
            </div>
          </button>
          
          <button 
            className="action-button export"
            onClick={handleExportTheme}
          >
            <span className="button-icon">📤</span>
            <div className="button-content">
              <div className="button-title">Export Current Theme</div>
              <div className="button-subtitle">Save as JSON file</div>
            </div>
          </button>
          
          <label className="action-button import">
            <span className="button-icon">📥</span>
            <div className="button-content">
              <div className="button-title">Import Theme</div>
              <div className="button-subtitle">Load from JSON file</div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportTheme}
              style={{ display: 'none' }}
            />
          </label>
          
          <button 
            className="action-button reset"
            onClick={resetTheme}
          >
            <span className="button-icon">🔄</span>
            <div className="button-content">
              <div className="button-title">Reset to Default</div>
              <div className="button-subtitle">Restore original theme</div>
            </div>
          </button>
        </div>
      </div>

      {/* Custom Theme Modal */}
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
                  placeholder="Enter theme name"
                  className="theme-name-input"
                />
              </div>

              <div className="color-grid">
                <ColorPicker
                  label="Primary Color"
                  color={customColors.primary}
                  onChange={(color) => setCustomColors({ ...customColors, primary: color })}
                />
                <ColorPicker
                  label="Secondary Color"
                  color={customColors.secondary}
                  onChange={(color) => setCustomColors({ ...customColors, secondary: color })}
                />
                <ColorPicker
                  label="Background"
                  color={customColors.background}
                  onChange={(color) => setCustomColors({ ...customColors, background: color })}
                />
                <ColorPicker
                  label="Surface"
                  color={customColors.surface}
                  onChange={(color) => setCustomColors({ ...customColors, surface: color })}
                />
                <ColorPicker
                  label="Text Primary"
                  color={customColors.textPrimary}
                  onChange={(color) => setCustomColors({ ...customColors, textPrimary: color })}
                />
                <ColorPicker
                  label="Text Secondary"
                  color={customColors.textSecondary}
                  onChange={(color) => setCustomColors({ ...customColors, textSecondary: color })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-button cancel"
                onClick={() => setShowCustomThemeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button create"
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