// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#2563EB');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'light';
    const savedColor = localStorage.getItem('primary-color') || '#2563EB';
    
    setTheme(savedTheme);
    setPrimaryColor(savedColor);
    applyTheme(savedTheme, savedColor);
  }, []);

  const applyTheme = (newTheme, color) => {
    const themes = {
      light: {
        '--bg-primary': '#FFFFFF',
        '--bg-secondary': '#F8FAFC',
        '--bg-card': '#FFFFFF',
        '--text-primary': '#1F2937',
        '--text-secondary': '#4B5563',
        '--text-muted': '#6B7280',
        '--border': '#E5E7EB',
        '--header-bg': '#FFFFFF',
        '--sidebar-bg': '#F9FAFB',
        '--table-header': '#F3F4F6',
        '--table-row-even': '#FFFFFF',
        '--table-row-odd': '#F9FAFB',
        '--success': '#10B981',
        '--warning': '#F59E0B',
        '--error': '#EF4444',
        '--info': '#3B82F6'
      },
      dark: {
        '--bg-primary': '#111827',
        '--bg-secondary': '#1F2937',
        '--bg-card': '#1F2937',
        '--text-primary': '#F9FAFB',
        '--text-secondary': '#D1D5DB',
        '--text-muted': '#9CA3AF',
        '--border': '#374151',
        '--header-bg': '#1F2937',
        '--sidebar-bg': '#111827',
        '--table-header': '#374151',
        '--table-row-even': '#1F2937',
        '--table-row-odd': '#111827',
        '--success': '#10B981',
        '--warning': '#F59E0B',
        '--error': '#EF4444',
        '--info': '#3B82F6'
      },
      blue: {
        '--bg-primary': '#EFF6FF',
        '--bg-secondary': '#DBEAFE',
        '--bg-card': '#FFFFFF',
        '--text-primary': '#1E40AF',
        '--text-secondary': '#3B82F6',
        '--text-muted': '#60A5FA',
        '--border': '#BFDBFE',
        '--header-bg': '#FFFFFF',
        '--sidebar-bg': '#DBEAFE',
        '--table-header': '#BFDBFE',
        '--table-row-even': '#FFFFFF',
        '--table-row-odd': '#EFF6FF',
        '--success': '#10B981',
        '--warning': '#F59E0B',
        '--error': '#EF4444',
        '--info': '#3B82F6'
      },
      green: {
        '--bg-primary': '#F0FDF4',
        '--bg-secondary': '#DCFCE7',
        '--bg-card': '#FFFFFF',
        '--text-primary': '#065F46',
        '--text-secondary': '#059669',
        '--text-muted': '#34D399',
        '--border': '#BBF7D0',
        '--header-bg': '#FFFFFF',
        '--sidebar-bg': '#DCFCE7',
        '--table-header': '#BBF7D0',
        '--table-row-even': '#FFFFFF',
        '--table-row-odd': '#F0FDF4',
        '--success': '#10B981',
        '--warning': '#F59E0B',
        '--error': '#EF4444',
        '--info': '#3B82F6'
      }
    };

    const root = document.documentElement;
    
    // Apply primary color
    root.style.setProperty('--primary-color', color);
    
    // Apply theme colors
    const themeColors = themes[newTheme] || themes.light;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Save
    localStorage.setItem('app-theme', newTheme);
    localStorage.setItem('primary-color', color);
    
    console.log(`Theme applied: ${newTheme}, Primary color: ${color}`);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme, primaryColor);
  };

  const changePrimaryColor = (color) => {
    setPrimaryColor(color);
    applyTheme(theme, color);
  };

  const resetTheme = () => {
    changeTheme('light');
    changePrimaryColor('#2563EB');
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      primaryColor,
      changeTheme,
      changePrimaryColor,
      resetTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};