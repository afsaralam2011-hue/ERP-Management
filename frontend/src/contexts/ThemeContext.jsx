// src/contexts/ThemeContext.jsx
// ✅ COMPLETE PROFESSIONAL THEME CONTEXT

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { themes } from '../utils/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or use professional as default
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        return themes[parsed.name] || themes.professional;
      } catch (error) {
        return themes.professional;
      }
    }
    return themes.professional; // Default: Professional theme
  });

  // Apply theme CSS variables to document root
  const applyTheme = useCallback((themeToApply) => {
    const root = document.documentElement;
    const colors = themeToApply.colors;
    
    // ===== CORE COLORS =====
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    
    // ===== BACKGROUND & SURFACE =====
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-card', colors.card);
    root.style.setProperty('--color-sidebar', colors.sidebar);
    root.style.setProperty('--color-header', colors.header);
    
    // ===== TEXT COLORS =====
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-text-disabled', colors.textDisabled);
    root.style.setProperty('--color-text-inverse', colors.textInverse);
    
    // ===== BORDERS =====
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-divider', colors.divider);
    
    // ===== STATES =====
    root.style.setProperty('--color-hover', colors.hover);
    root.style.setProperty('--color-selected', colors.selected);
    root.style.setProperty('--color-focused', colors.focused);
    
    // ===== BUTTONS =====
    root.style.setProperty('--color-button-bg', colors.button.background);
    root.style.setProperty('--color-button-text', colors.button.text);
    root.style.setProperty('--color-button-border', colors.button.border);
    
    // ===== INPUTS =====
    root.style.setProperty('--color-input-bg', colors.input.background);
    root.style.setProperty('--color-input-border', colors.input.border);
    root.style.setProperty('--color-input-text', colors.input.text);
    
    // ===== TABLES =====
    root.style.setProperty('--color-table-header', colors.table.header);
    root.style.setProperty('--color-table-row-even', colors.table.rowEven);
    root.style.setProperty('--color-table-row-odd', colors.table.rowOdd);
    root.style.setProperty('--color-table-border', colors.table.border);
    
    // ===== BADGES =====
    root.style.setProperty('--color-badge-bg', colors.badge.background);
    root.style.setProperty('--color-badge-text', colors.badge.text);
    root.style.setProperty('--color-badge-border', colors.badge.border);
    
    // ===== SEMANTIC COLORS =====
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-info', colors.info);
    
    // ===== GLASS EFFECTS =====
    root.style.setProperty('--glass-background', colors.glass);
    root.style.setProperty('--glass-border', colors.glassBorder);
    root.style.setProperty('--glass-shadow', colors.glassShadow);
    
    // ===== SHADOWS =====
    root.style.setProperty('--shadow-sm', `0 1px 2px 0 ${colors.glassShadow}`);
    root.style.setProperty('--shadow-md', `0 4px 6px -1px ${colors.glassShadow}`);
    root.style.setProperty('--shadow-lg', `0 10px 15px -3px ${colors.glassShadow}`);
    
    // ===== TRANSITIONS =====
    root.style.setProperty('--transition-fast', '150ms cubic-bezier(0.4, 0, 0.2, 1)');
    root.style.setProperty('--transition-normal', '300ms cubic-bezier(0.4, 0, 0.2, 1)');
    root.style.setProperty('--transition-slow', '500ms cubic-bezier(0.4, 0, 0.2, 1)');
    
    // Set theme class on body for easy targeting
    document.body.className = `theme-${themeToApply.name} theme-type-${themeToApply.type}`;
    
    console.log(`🎨 Theme "${themeToApply.label}" applied`);
  }, []);

  // Change theme function
  const changeTheme = useCallback((themeName) => {
    const newTheme = themes[themeName] || themes.professional;
    setTheme(newTheme);
    
    localStorage.setItem('app-theme', JSON.stringify({
      name: newTheme.name,
      label: newTheme.label,
      type: newTheme.type
    }));
    
    applyTheme(newTheme);
    
    // Dispatch event for other parts of app
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: newTheme.name }
    }));
  }, [applyTheme]);

  // Toggle between light/dark themes
  const toggleTheme = useCallback(() => {
    const currentThemeName = theme.name;
    
    if (theme.type === 'light') {
      // Find a dark theme
      const darkTheme = Object.values(themes).find(t => t.type === 'dark');
      changeTheme(darkTheme?.name || 'dark');
    } else {
      // Find a light theme
      const lightTheme = Object.values(themes).find(t => t.type === 'light');
      changeTheme(lightTheme?.name || 'light');
    }
  }, [theme, changeTheme]);

  // Get all themes
  const getAllThemes = useCallback(() => {
    return Object.values(themes);
  }, []);

  // Get themes by type
  const getThemesByType = useCallback((type) => {
    return Object.values(themes).filter(t => t.type === type);
  }, []);

  // Initialize theme
  useEffect(() => {
    applyTheme(theme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem('app-theme')) {
        changeTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme, applyTheme, changeTheme]);

  const contextValue = useMemo(() => ({
    theme,
    themes: getAllThemes(),
    changeTheme,
    toggleTheme,
    getAllThemes,
    getThemesByType
  }), [theme, changeTheme, toggleTheme, getAllThemes, getThemesByType]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};