// src/styles/themes/custom-themes.js

// Custom theme storage key
export const CUSTOM_THEMES_KEY = 'erp_custom_themes';

// Get custom themes from localStorage
export const getCustomThemes = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_THEMES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom themes:', error);
    return [];
  }
};

// Save custom theme
export const saveCustomTheme = (theme) => {
  try {
    const customThemes = getCustomThemes();
    const existingIndex = customThemes.findIndex(t => t.id === theme.id);
    
    if (existingIndex !== -1) {
      customThemes[existingIndex] = theme;
    } else {
      customThemes.push(theme);
    }
    
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
    return true;
  } catch (error) {
    console.error('Error saving custom theme:', error);
    return false;
  }
};

// Delete custom theme
export const deleteCustomTheme = (themeId) => {
  try {
    const customThemes = getCustomThemes();
    const filtered = customThemes.filter(t => t.id !== themeId);
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting custom theme:', error);
    return false;
  }
};

// Create a new custom theme
export const createCustomTheme = (name, colors, mode = 'light') => {
  return {
    id: `custom-${Date.now()}`,
    name: name || 'Custom Theme',
    mode: mode,
    colors: colors,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
};

// Validate theme structure
export const isValidTheme = (theme) => {
  if (!theme || typeof theme !== 'object') return false;
  
  const requiredFields = ['id', 'name', 'mode', 'colors'];
  const hasRequiredFields = requiredFields.every(field => field in theme);
  
  if (!hasRequiredFields) return false;
  
  const requiredColors = [
    'primary',
    'background',
    'surface',
    'textPrimary',
    'textSecondary',
  ];
  
  return requiredColors.every(color => color in theme.colors);
};

// Export theme as JSON
export const exportTheme = (theme) => {
  try {
    const themeData = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${theme.name.replace(/\s+/g, '-').toLowerCase()}-theme.json`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error exporting theme:', error);
    return false;
  }
};

// Import theme from JSON
export const importTheme = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target.result);
        if (isValidTheme(theme)) {
          // Assign new ID to avoid conflicts
          theme.id = `custom-${Date.now()}`;
          theme.isCustom = true;
          resolve(theme);
        } else {
          reject(new Error('Invalid theme structure'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};