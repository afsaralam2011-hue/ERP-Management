// src/contexts/ThemeContext.jsx

import { createContext, useContext } from 'react';

// Create Theme Context
export const ThemeContext = createContext({
  // Current theme
  currentTheme: null,
  
  // Theme mode (light/dark)
  mode: 'light',
  
  // All available themes
  themes: [],
  
  // Custom themes
  customThemes: [],
  
  // Functions
  setTheme: () => {},
  setMode: () => {},
  applyTheme: () => {},
  createCustomTheme: () => {},
  deleteCustomTheme: () => {},
  exportTheme: () => {},
  importTheme: () => {},
  resetTheme: () => {},
  
  // State
  isLoading: false,
  error: null,
});

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  return context;
};

// Re-export ThemeProvider for convenience
export { ThemeProvider } from './ThemeProvider';

export default ThemeContext;