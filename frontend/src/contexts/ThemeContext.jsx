import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('erp-theme');
    return savedTheme ? JSON.parse(savedTheme) : {
      name: 'default',
      colors: {
        primary: '#1e40af',
        secondary: '#f3f4f6',
        accent: '#dc2626',
        textPrimary: '#1e40af',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        background: '#ffffff'
      }
    };
  });

  const applyTheme = useCallback((themeToApply) => {
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', themeToApply.colors.primary);
    root.style.setProperty('--secondary-color', themeToApply.colors.secondary);
    root.style.setProperty('--accent-color', themeToApply.colors.accent);
    root.style.setProperty('--text-primary', themeToApply.colors.textPrimary);
    root.style.setProperty('--text-secondary', themeToApply.colors.textSecondary);
    root.style.setProperty('--border-color', themeToApply.colors.border);
    root.style.setProperty('--bg-white', themeToApply.colors.background);
  }, []);

  const changeTheme = useCallback((themeName, themeColors) => {
    const newTheme = {
      name: themeName,
      colors: themeColors
    };
    
    setTheme(newTheme);
    localStorage.setItem('erp-theme', JSON.stringify(newTheme));
    applyTheme(newTheme);
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const contextValue = useMemo(() => ({
    theme,
    changeTheme
  }), [theme, changeTheme]);

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