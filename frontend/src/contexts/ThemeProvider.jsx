// src/contexts/ThemeProvider.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeContext } from './ThemeContext';
import { predefinedThemes, defaultTheme } from '../styles/themes/theme-config.jsx';
import { lightTheme } from '../styles/themes/light.jsx';
import { darkTheme } from '../styles/themes/dark.jsx';
import {
  getCustomThemes,
  saveCustomTheme as saveCustomThemeToStorage,
  deleteCustomTheme as deleteCustomThemeFromStorage,
  createCustomTheme as createNewCustomTheme,
  exportTheme as exportThemeToFile,
  importTheme as importThemeFromFile,
} from '../styles/themes/custom-themes.jsx';
import { applyThemeToDOM } from '../utils/themeUtils.jsx';

// LocalStorage keys
const THEME_STORAGE_KEY = 'erp_current_theme';
const MODE_STORAGE_KEY = 'erp_theme_mode';

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(null);
  const [mode, setMode] = useState('light');
  const [customThemes, setCustomThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // All available themes (predefined + custom)
  const allThemes = useMemo(() => {
    return [...predefinedThemes, ...customThemes];
  }, [customThemes]);

  // Load saved theme and mode from localStorage
  useEffect(() => {
    try {
      setIsLoading(true);
      
      // Load custom themes
      const loadedCustomThemes = getCustomThemes();
      setCustomThemes(loadedCustomThemes);
      
      // Load saved mode
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
      if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
        setMode(savedMode);
      } else {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setMode(prefersDark ? 'dark' : 'light');
      }
      
      // Load saved theme
      const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedThemeId) {
        const allAvailableThemes = [...predefinedThemes, ...loadedCustomThemes];
        const savedTheme = allAvailableThemes.find(t => t.id === savedThemeId);
        if (savedTheme) {
          setCurrentTheme(savedTheme);
          applyThemeToDOM(savedTheme);
        } else {
          // If saved theme not found, use default
          setCurrentTheme(defaultTheme);
          applyThemeToDOM(defaultTheme);
        }
      } else {
        // No saved theme, use default
        setCurrentTheme(defaultTheme);
        applyThemeToDOM(defaultTheme);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading theme:', err);
      setError('Failed to load theme');
      setCurrentTheme(defaultTheme);
      applyThemeToDOM(defaultTheme);
      setIsLoading(false);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
      if (!savedMode) {
        // Only auto-switch if user hasn't manually set a preference
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme when currentTheme or mode changes
  useEffect(() => {
    if (currentTheme) {
      applyThemeToDOM(currentTheme);
    }
  }, [currentTheme, mode]);

  // Set theme by ID or theme object
  const setTheme = useCallback((themeIdOrObject) => {
    try {
      let theme;
      
      if (typeof themeIdOrObject === 'string') {
        theme = allThemes.find(t => t.id === themeIdOrObject);
        if (!theme) {
          throw new Error(`Theme with id "${themeIdOrObject}" not found`);
        }
      } else if (typeof themeIdOrObject === 'object') {
        theme = themeIdOrObject;
      } else {
        throw new Error('Invalid theme parameter');
      }
      
      setCurrentTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme.id);
      applyThemeToDOM(theme);
      setError(null);
    } catch (err) {
      console.error('Error setting theme:', err);
      setError(err.message);
    }
  }, [allThemes]);

  // Set mode (light/dark)
  const setThemeMode = useCallback((newMode) => {
    if (newMode !== 'light' && newMode !== 'dark') {
      console.error('Invalid mode. Must be "light" or "dark"');
      return;
    }
    
    setMode(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
    
    // Switch to appropriate default theme if current theme doesn't match mode
    if (currentTheme && currentTheme.mode !== newMode) {
      const matchingTheme = allThemes.find(t => 
        t.mode === newMode && t.id.includes('default')
      ) || (newMode === 'light' ? lightTheme : darkTheme);
      
      setTheme(matchingTheme);
    }
  }, [currentTheme, allThemes, setTheme]);

  // Apply theme colors to DOM
  const applyTheme = useCallback((theme) => {
    applyThemeToDOM(theme);
  }, []);

  // Create custom theme
  const createCustomTheme = useCallback((name, colors, themeMode = 'light') => {
    try {
      const newTheme = createNewCustomTheme(name, colors, themeMode);
      
      if (saveCustomThemeToStorage(newTheme)) {
        setCustomThemes(prev => [...prev, newTheme]);
        setError(null);
        return newTheme;
      } else {
        throw new Error('Failed to save custom theme');
      }
    } catch (err) {
      console.error('Error creating custom theme:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Delete custom theme
  const deleteCustomTheme = useCallback((themeId) => {
    try {
      if (deleteCustomThemeFromStorage(themeId)) {
        setCustomThemes(prev => prev.filter(t => t.id !== themeId));
        
        // If deleted theme was active, switch to default
        if (currentTheme && currentTheme.id === themeId) {
          setTheme(defaultTheme);
        }
        
        setError(null);
        return true;
      } else {
        throw new Error('Failed to delete custom theme');
      }
    } catch (err) {
      console.error('Error deleting custom theme:', err);
      setError(err.message);
      return false;
    }
  }, [currentTheme, setTheme]);

  // Export theme
  const exportTheme = useCallback((theme) => {
    try {
      const themeToExport = theme || currentTheme;
      if (!themeToExport) {
        throw new Error('No theme to export');
      }
      
      if (exportThemeToFile(themeToExport)) {
        setError(null);
        return true;
      } else {
        throw new Error('Failed to export theme');
      }
    } catch (err) {
      console.error('Error exporting theme:', err);
      setError(err.message);
      return false;
    }
  }, [currentTheme]);

  // Import theme
  const importTheme = useCallback(async (file) => {
    try {
      const importedTheme = await importThemeFromFile(file);
      
      if (saveCustomThemeToStorage(importedTheme)) {
        setCustomThemes(prev => [...prev, importedTheme]);
        setError(null);
        return importedTheme;
      } else {
        throw new Error('Failed to save imported theme');
      }
    } catch (err) {
      console.error('Error importing theme:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
    setMode('light');
    localStorage.removeItem(THEME_STORAGE_KEY);
    localStorage.removeItem(MODE_STORAGE_KEY);
    setError(null);
  }, [setTheme]);

  // Context value
  const value = useMemo(() => ({
    currentTheme,
    mode,
    themes: allThemes,
    customThemes,
    setTheme,
    setMode: setThemeMode,
    applyTheme,
    createCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    resetTheme,
    isLoading,
    error,
  }), [
    currentTheme,
    mode,
    allThemes,
    customThemes,
    setTheme,
    setThemeMode,
    applyTheme,
    createCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    resetTheme,
    isLoading,
    error,
  ]);

  if (isLoading) {
    return <div>Loading theme...</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;