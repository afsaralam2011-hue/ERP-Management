// src/styles/themes/theme-config.jsx

/**
 * تھیم مینجمنٹ سسٹم کی مرکزی کانفیگریشن فائل
 * اس میں تمام پری ڈیفائنڈ تھیمز اور ان کی خصوصیات موجود ہیں
 */

export const themeModes = {
  LIGHT: 'light',
  DARK: 'dark',
};

/**
 * تھیم کے رنگوں کی ساخت (ٹائپ ڈیفینیشن)
 */
export const themeColors = {
  primary: '#2196F3',
  primaryLight: '#BBDEFB',
  primaryDark: '#1976D2',
  secondary: '#90CAF9',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: '#1A237E',        // BLACK سے INDIGO/NAVY میں تبدیل
  textSecondary: '#283593',      // BLACK سے INDIGO/NAVY میں تبدیل
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  accent: '#FF4081',
  disabled: '#9E9E9E',
  hover: 'rgba(26, 35, 126, 0.04)',      // BLACK سے INDIGO/NAVY میں تبدیل
  focus: 'rgba(33, 150, 243, 0.12)',
};

/**
 * تھیم کی بنیادی خصوصیات
 */
export const themeProperties = {
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xlarge: '16px',
    round: '50%',
  },
  spacing: {
    unit: '8px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', Arial, sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      h1: '32px',
      h2: '28px',
      h3: '24px',
      h4: '20px',
      h5: '18px',
      h6: '16px',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 600,
    },
  },
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(26, 35, 126, 0.12), 0 1px 2px rgba(26, 35, 126, 0.24)',    // BLACK سے INDIGO/NAVY میں تبدیل
    md: '0 3px 6px rgba(26, 35, 126, 0.16), 0 3px 6px rgba(26, 35, 126, 0.23)',    // BLACK سے INDIGO/NAVY میں تبدیل
    lg: '0 10px 20px rgba(26, 35, 126, 0.19), 0 6px 6px rgba(26, 35, 126, 0.23)',  // BLACK سے INDIGO/NAVY میں تبدیل
    xl: '0 14px 28px rgba(26, 35, 126, 0.25), 0 10px 10px rgba(26, 35, 126, 0.22)',// BLACK سے INDIGO/NAVY میں تبدیل
  },
  transitions: {
    fast: '150ms ease-in-out',
    medium: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

/**
 * تمام پری ڈیفائنڈ تھیمز
 */
export const predefinedThemes = [
  {
    id: 'light-blue',
    name: 'Light Blue',
    description: 'Bright and clean interface with blue accent',
    mode: themeModes.LIGHT,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#2196F3',
      primaryLight: '#BBDEFB',
      primaryDark: '#1976D2',
      secondary: '#90CAF9',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      textPrimary: '#1A237E',        // INDIGO/NAVY
      textSecondary: '#283593',      // INDIGO/NAVY
      border: '#E0E0E0',
      info: '#2196F3',
      hover: 'rgba(26, 35, 126, 0.04)',  // INDIGO/NAVY hover
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Reduced eye strain with dark blue theme',
    mode: themeModes.DARK,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#1976D2',
      primaryLight: '#42A5F5',
      primaryDark: '#0D47A1',
      secondary: '#64B5F6',
      background: '#121212',
      surface: '#1E1E1E',
      textPrimary: '#7986CB',        // Light INDIGO
      textSecondary: '#9FA8DA',      // Lighter INDIGO
      border: '#333333',
      success: '#66BB6A',
      warning: '#FFA726',
      error: '#EF5350',
      info: '#42A5F5',
      hover: 'rgba(121, 134, 203, 0.04)',  // INDIGO hover
      focus: 'rgba(66, 165, 245, 0.12)',
    },
  },
  {
    id: 'light-teal',
    name: 'Light Teal',
    description: 'Calming teal colors for a peaceful interface',
    mode: themeModes.LIGHT,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#009688',
      primaryLight: '#B2DFDB',
      primaryDark: '#00796B',
      secondary: '#80CBC4',
      info: '#00BCD4',
      textPrimary: '#1A237E',        // INDIGO/NAVY
      textSecondary: '#283593',      // INDIGO/NAVY
      hover: 'rgba(26, 35, 126, 0.04)',  // INDIGO/NAVY hover
    },
  },
  {
    id: 'dark-teal',
    name: 'Dark Teal',
    description: 'Dark theme with teal accents',
    mode: themeModes.DARK,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#00796B',
      primaryLight: '#26A69A',
      primaryDark: '#004D40',
      secondary: '#4DB6AC',
      background: '#121212',
      surface: '#1E1E1E',
      textPrimary: '#7986CB',        // Light INDIGO
      textSecondary: '#9FA8DA',      // Lighter INDIGO
      border: '#333333',
      success: '#66BB6A',
      warning: '#FFA726',
      error: '#EF5350',
      info: '#26C6DA',
      hover: 'rgba(121, 134, 203, 0.04)',  // INDIGO hover
      focus: 'rgba(38, 166, 154, 0.12)',
    },
  },
  {
    id: 'light-green',
    name: 'Light Green',
    description: 'Fresh green theme for a natural look',
    mode: themeModes.LIGHT,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#4CAF50',
      primaryLight: '#C8E6C9',
      primaryDark: '#388E3C',
      secondary: '#81C784',
      success: '#4CAF50',
      textPrimary: '#1A237E',        // INDIGO/NAVY
      textSecondary: '#283593',      // INDIGO/NAVY
      hover: 'rgba(26, 35, 126, 0.04)',  // INDIGO/NAVY hover
    },
  },
  {
    id: 'light-yellow',
    name: 'Light Yellow',
    description: 'Bright yellow theme for energy and positivity',
    mode: themeModes.LIGHT,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#FDD835',
      primaryLight: '#FFF9C4',
      primaryDark: '#F9A825',
      secondary: '#FFF59D',
      warning: '#FF9800',
      textPrimary: '#1A237E',        // INDIGO/NAVY
      textSecondary: '#283593',      // INDIGO/NAVY
      hover: 'rgba(26, 35, 126, 0.04)',  // INDIGO/NAVY hover
    },
  },
  {
    id: 'light-brown',
    name: 'Light Brown',
    description: 'Earthy brown tones for a warm interface',
    mode: themeModes.LIGHT,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#795548',
      primaryLight: '#D7CCC8',
      primaryDark: '#5D4037',
      secondary: '#A1887F',
      textPrimary: '#1A237E',        // INDIGO/NAVY
      textSecondary: '#283593',      // INDIGO/NAVY
      hover: 'rgba(26, 35, 126, 0.04)',  // INDIGO/NAVY hover
    },
  },
  {
    id: 'light-pink',
    name: 'Light Pink',
    description: 'Playful pink theme for a vibrant interface',
    mode: themeModes.LIGHT,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#E91E63',
      primaryLight: '#F8BBD0',
      primaryDark: '#C2185B',
      secondary: '#F48FB1',
      accent: '#E91E63',
      textPrimary: '#1A237E',        // INDIGO/NAVY
      textSecondary: '#283593',      // INDIGO/NAVY
      hover: 'rgba(26, 35, 126, 0.04)',  // INDIGO/NAVY hover
    },
  },
  {
    id: 'light-purple',
    name: 'Light Purple',
    description: 'Royal purple theme for a sophisticated look',
    mode: themeModes.LIGHT,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#9C27B0',
      primaryLight: '#E1BEE7',
      primaryDark: '#7B1FA2',
      secondary: '#CE93D8',
      accent: '#9C27B0',
      textPrimary: '#1A237E',        // INDIGO/NAVY
      textSecondary: '#283593',      // INDIGO/NAVY
      hover: 'rgba(26, 35, 126, 0.04)',  // INDIGO/NAVY hover
    },
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    description: 'Dark theme with deep purple accents',
    mode: themeModes.DARK,
    category: 'predefined',
    colors: {
      ...themeColors,
      primary: '#7B1FA2',
      primaryLight: '#AB47BC',
      primaryDark: '#4A148C',
      secondary: '#BA68C8',
      background: '#121212',
      surface: '#1E1E1E',
      textPrimary: '#7986CB',        // Light INDIGO
      textSecondary: '#9FA8DA',      // Lighter INDIGO
      border: '#333333',
      success: '#66BB6A',
      warning: '#FFA726',
      error: '#EF5350',
      info: '#AB47BC',
      accent: '#AB47BC',
      hover: 'rgba(121, 134, 203, 0.04)',  // INDIGO hover
      focus: 'rgba(171, 71, 188, 0.12)',
    },
  },
];

/**
 * بنیادی تھیمز - لائٹ اور ڈارک
 */
export const baseThemes = [
  {
    id: 'light',
    name: 'Light',
    description: 'Standard light theme',
    mode: themeModes.LIGHT,
    category: 'base',
    colors: {
      ...themeColors,
      textPrimary: '#1A237E',        // INDIGO/NAVY
      textSecondary: '#283593',      // INDIGO/NAVY
      hover: 'rgba(26, 35, 126, 0.04)',  // INDIGO/NAVY hover
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Standard dark theme for reduced eye strain',
    mode: themeModes.DARK,
    category: 'base',
    colors: {
      ...themeColors,
      background: '#121212',
      surface: '#1E1E1E',
      textPrimary: '#7986CB',        // Light INDIGO
      textSecondary: '#9FA8DA',      // Lighter INDIGO
      border: '#333333',
      success: '#66BB6A',
      warning: '#FFA726',
      error: '#EF5350',
      hover: 'rgba(121, 134, 203, 0.04)',  // INDIGO hover
      focus: 'rgba(33, 150, 243, 0.12)',
    },
  },
];

/**
 * ڈیفالٹ تھیم
 */
export const defaultTheme = predefinedThemes[0]; // Light Blue

/**
 * تمام تھیمز کو ایک ساتھ ملانے کا فنکشن
 */
export const getAllThemes = () => {
  return [...baseThemes, ...predefinedThemes];
};

/**
 * تھیم ID سے تھیم تلاش کرنے کا فنکشن
 */
export const getThemeById = (id) => {
  const allThemes = getAllThemes();
  return allThemes.find(theme => theme.id === id) || defaultTheme;
};

/**
 * تھیم موڈ کے لحاظ سے تھیمز فلٹر کرنے کا فنکشن
 */
export const getThemesByMode = (mode) => {
  return getAllThemes().filter(theme => theme.mode === mode);
};

/**
 * تھیم کیٹیگری کے لحاظ سے تھیمز فلٹر کرنے کا فنکشن
 */
export const getThemesByCategory = (category) => {
  return getAllThemes().filter(theme => theme.category === category);
};

/**
 * تھیم کو CSS ویری ایبلز میں تبدیل کرنے کا فنکشن
 */
export const themeToCssVariables = (theme) => {
  const cssVars = {};
  
  // رنگوں کو CSS ویری ایبلز میں تبدیل کریں
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars[`--color-${key}`] = value;
  });
  
  // تھیم خصوصیات کو CSS ویری ایبلز میں تبدیل کریں
  Object.entries(themeProperties).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        cssVars[`--${category}-${key}`] = value;
      });
    }
  });
  
  // تھیم موڈ کو سیٹ کریں
  cssVars['--theme-mode'] = theme.mode;
  
  return cssVars;
};

export default {
  themeModes,
  themeColors,
  themeProperties,
  predefinedThemes,
  baseThemes,
  defaultTheme,
  getAllThemes,
  getThemeById,
  getThemesByMode,
  getThemesByCategory,
  themeToCssVariables,
};