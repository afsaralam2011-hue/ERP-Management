// src/styles/themes/theme-config.jsx

/**
 * تھیم مینجمنٹ سسٹم کی مرکزی کانفیگریشن فائل
 * اس میں تمام پری ڈیفائنڈ تھیمز اور ان کی خصوصیات موجود ہیں
 */

export const themeModes = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

/**
 * تھیم کے رنگوں کی بنیادی ڈیفالٹس (ٹائپ ڈیفینیشن)
 */
export const themeColors = {
  // Primary Colors
  primary: '#2196F3',
  primaryLight: '#BBDEFB',
  primaryDark: '#1976D2',
  
  // Secondary Colors
  secondary: '#90CAF9',
  secondaryLight: '#E3F2FD',
  secondaryDark: '#42A5F5',
  
  // Background Colors
  background: '#FFFFFF',
  surface: '#F5F5F5',
  paper: '#FFFFFF',
  
  // Text Colors - سب BLACK سے INDIGO/NAVY میں تبدیل
  textPrimary: '#1A237E',        // Deep Indigo/Navy Blue
  textSecondary: '#283593',      // Medium Indigo/Navy Blue
  textDisabled: '#5C6BC0',       // Light Indigo
  textMuted: '#7986CB',          // Added: Medium-Light Indigo
  
  // Border Colors
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  // Status Colors
  success: '#4CAF50',
  successLight: '#C8E6C9',
  successDark: '#388E3C',
  
  warning: '#FF9800',
  warningLight: '#FFE0B2',
  warningDark: '#F57C00',
  
  error: '#F44336',
  errorLight: '#FFCDD2',
  errorDark: '#D32F2F',
  
  info: '#2196F3',
  infoLight: '#BBDEFB',
  infoDark: '#1976D2',
  
  // Additional Colors
  accent: '#FF4081',
  disabled: '#BDBDBD',
  hover: 'rgba(26, 35, 126, 0.04)',      // INDIGO hover
  focus: 'rgba(33, 150, 243, 0.12)',
  selected: 'rgba(25, 118, 210, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(26, 35, 126, 0.1)',
  
  // Input Colors
  inputBackground: '#FFFFFF',
  inputBorder: '#BDBDBD',
  inputPlaceholder: '#5C6BC0',
  inputText: '#1A237E',
  
  // Button Colors
  buttonPrimary: '#1976D2',
  buttonSecondary: '#DC004E',
  buttonDisabled: '#E0E0E0',
  buttonText: '#FFFFFF',
};

/**
 * تھیم کی بنیادی خصوصیات
 */
export const themeProperties = {
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '24px',
    full: '9999px',
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
    '3xl': '64px',
    '4xl': '96px',
  },
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyMono: "'Roboto Mono', 'SFMono-Regular', Consolas, monospace",
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      xxl: '1.5rem',    // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  },
  shadows: {
    none: 'none',
    xs: '0 1px 1px rgba(26, 35, 126, 0.05)',          // INDIGO shadow
    sm: '0 1px 3px rgba(26, 35, 126, 0.12), 0 1px 2px rgba(26, 35, 126, 0.24)',
    md: '0 3px 6px rgba(26, 35, 126, 0.16), 0 3px 6px rgba(26, 35, 126, 0.23)',
    lg: '0 10px 20px rgba(26, 35, 126, 0.19), 0 6px 6px rgba(26, 35, 126, 0.23)',
    xl: '0 14px 28px rgba(26, 35, 126, 0.25), 0 10px 10px rgba(26, 35, 126, 0.22)',
    inner: 'inset 0 2px 4px 0 rgba(26, 35, 126, 0.06)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    medium: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  zIndex: {
    negative: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  layout: {
    headerHeight: '64px',
    sidebarWidth: '280px',
    sidebarCollapsedWidth: '80px',
    containerPadding: '1rem',
    maxContentWidth: '1200px',
  },
};

/**
 * ڈارک تھیم کے لیے رنگوں کی ڈیفالٹ ویلوز
 */
export const darkThemeColors = {
  // Primary Colors (Dark)
  primary: '#90CAF9',
  primaryLight: '#E3F2FD',
  primaryDark: '#42A5F5',
  
  // Secondary Colors (Dark)
  secondary: '#64B5F6',
  secondaryLight: '#BBDEFB',
  secondaryDark: '#2196F3',
  
  // Background Colors (Dark)
  background: '#121212',
  surface: '#1E1E1E',
  paper: '#242424',
  
  // Text Colors (Dark) - سب لائٹ INDIGO میں
  textPrimary: '#E3F2FD',        // Light Blue/White
  textSecondary: '#BBDEFB',      // Light Blue
  textDisabled: '#78909C',       // Grey-Blue
  textMuted: '#90A4AE',          // Blue-Grey
  
  // Border Colors (Dark)
  border: '#2D2D2D',
  divider: '#37474F',
  
  // Status Colors (Dark)
  success: '#66BB6A',
  successLight: '#A5D6A7',
  successDark: '#388E3C',
  
  warning: '#FFB74D',
  warningLight: '#FFCC80',
  warningDark: '#F57C00',
  
  error: '#EF5350',
  errorLight: '#E57373',
  errorDark: '#D32F2F',
  
  info: '#42A5F5',
  infoLight: '#64B5F6',
  infoDark: '#1976D2',
  
  // Additional Colors (Dark)
  accent: '#F48FB1',
  disabled: '#424242',
  hover: 'rgba(121, 134, 203, 0.04)',     // Light INDIGO hover
  focus: 'rgba(66, 165, 245, 0.12)',
  selected: 'rgba(144, 202, 249, 0.16)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.4)',
  
  // Input Colors (Dark)
  inputBackground: '#2D2D2D',
  inputBorder: '#424242',
  inputPlaceholder: '#90A4AE',
  inputText: '#E3F2FD',
  
  // Button Colors (Dark)
  buttonPrimary: '#1976D2',
  buttonSecondary: '#C2185B',
  buttonDisabled: '#424242',
  buttonText: '#FFFFFF',
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
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#2196F3',
      primaryLight: '#BBDEFB',
      primaryDark: '#1976D2',
      secondary: '#90CAF9',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
      focus: 'rgba(33, 150, 243, 0.12)',
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Reduced eye strain with dark blue theme',
    mode: themeModes.DARK,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...darkThemeColors,
      primary: '#1976D2',
      primaryLight: '#42A5F5',
      primaryDark: '#0D47A1',
      secondary: '#64B5F6',
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      hover: 'rgba(121, 134, 203, 0.04)',
      focus: 'rgba(66, 165, 245, 0.12)',
    },
  },
  {
    id: 'light-teal',
    name: 'Light Teal',
    description: 'Calming teal colors for a peaceful interface',
    mode: themeModes.LIGHT,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#009688',
      primaryLight: '#B2DFDB',
      primaryDark: '#00796B',
      secondary: '#80CBC4',
      info: '#00BCD4',
      accent: '#009688',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
    },
  },
  {
    id: 'dark-teal',
    name: 'Dark Teal',
    description: 'Dark theme with teal accents',
    mode: themeModes.DARK,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...darkThemeColors,
      primary: '#00796B',
      primaryLight: '#26A69A',
      primaryDark: '#004D40',
      secondary: '#4DB6AC',
      info: '#26C6DA',
      accent: '#26A69A',
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      hover: 'rgba(121, 134, 203, 0.04)',
      focus: 'rgba(38, 166, 154, 0.12)',
    },
  },
  {
    id: 'light-green',
    name: 'Light Green',
    description: 'Fresh green theme for a natural look',
    mode: themeModes.LIGHT,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#4CAF50',
      primaryLight: '#C8E6C9',
      primaryDark: '#388E3C',
      secondary: '#81C784',
      success: '#4CAF50',
      accent: '#4CAF50',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
    },
  },
  {
    id: 'dark-green',
    name: 'Dark Green',
    description: 'Dark theme with green accents',
    mode: themeModes.DARK,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...darkThemeColors,
      primary: '#388E3C',
      primaryLight: '#66BB6A',
      primaryDark: '#2E7D32',
      secondary: '#81C784',
      success: '#66BB6A',
      accent: '#66BB6A',
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      hover: 'rgba(121, 134, 203, 0.04)',
    },
  },
  {
    id: 'light-yellow',
    name: 'Light Yellow',
    description: 'Bright yellow theme for energy and positivity',
    mode: themeModes.LIGHT,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#FDD835',
      primaryLight: '#FFF9C4',
      primaryDark: '#F9A825',
      secondary: '#FFF59D',
      warning: '#FF9800',
      accent: '#F9A825',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
    },
  },
  {
    id: 'light-brown',
    name: 'Light Brown',
    description: 'Earthy brown tones for a warm interface',
    mode: themeModes.LIGHT,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#795548',
      primaryLight: '#D7CCC8',
      primaryDark: '#5D4037',
      secondary: '#A1887F',
      accent: '#795548',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
    },
  },
  {
    id: 'light-pink',
    name: 'Light Pink',
    description: 'Playful pink theme for a vibrant interface',
    mode: themeModes.LIGHT,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#E91E63',
      primaryLight: '#F8BBD0',
      primaryDark: '#C2185B',
      secondary: '#F48FB1',
      accent: '#E91E63',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
    },
  },
  {
    id: 'dark-pink',
    name: 'Dark Pink',
    description: 'Dark theme with pink accents',
    mode: themeModes.DARK,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...darkThemeColors,
      primary: '#C2185B',
      primaryLight: '#EC407A',
      primaryDark: '#880E4F',
      secondary: '#F48FB1',
      accent: '#EC407A',
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      hover: 'rgba(121, 134, 203, 0.04)',
    },
  },
  {
    id: 'light-purple',
    name: 'Light Purple',
    description: 'Royal purple theme for a sophisticated look',
    mode: themeModes.LIGHT,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#9C27B0',
      primaryLight: '#E1BEE7',
      primaryDark: '#7B1FA2',
      secondary: '#CE93D8',
      accent: '#9C27B0',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
    },
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    description: 'Dark theme with deep purple accents',
    mode: themeModes.DARK,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...darkThemeColors,
      primary: '#7B1FA2',
      primaryLight: '#AB47BC',
      primaryDark: '#4A148C',
      secondary: '#BA68C8',
      accent: '#AB47BC',
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      hover: 'rgba(121, 134, 203, 0.04)',
      focus: 'rgba(171, 71, 188, 0.12)',
    },
  },
  {
    id: 'light-indigo',
    name: 'Light Indigo',
    description: 'Deep indigo theme with professional look',
    mode: themeModes.LIGHT,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#3F51B5',
      primaryLight: '#C5CAE9',
      primaryDark: '#303F9F',
      secondary: '#7986CB',
      accent: '#3F51B5',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
    },
  },
  {
    id: 'dark-indigo',
    name: 'Dark Indigo',
    description: 'Dark theme with indigo blue accents',
    mode: themeModes.DARK,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...darkThemeColors,
      primary: '#303F9F',
      primaryLight: '#5C6BC0',
      primaryDark: '#283593',
      secondary: '#7986CB',
      accent: '#5C6BC0',
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      hover: 'rgba(121, 134, 203, 0.08)', // Slightly stronger for better visibility
    },
  },
  {
    id: 'light-orange',
    name: 'Light Orange',
    description: 'Warm orange theme for energetic interface',
    mode: themeModes.LIGHT,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...themeColors,
      primary: '#FF9800',
      primaryLight: '#FFE0B2',
      primaryDark: '#F57C00',
      secondary: '#FFB74D',
      warning: '#FF9800',
      accent: '#FF9800',
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      hover: 'rgba(26, 35, 126, 0.04)',
    },
  },
  {
    id: 'dark-orange',
    name: 'Dark Orange',
    description: 'Dark theme with orange accents',
    mode: themeModes.DARK,
    category: 'predefined',
    type: 'colorful',
    colors: {
      ...darkThemeColors,
      primary: '#F57C00',
      primaryLight: '#FFB74D',
      primaryDark: '#E65100',
      secondary: '#FFA726',
      warning: '#FFB74D',
      accent: '#FFB74D',
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      hover: 'rgba(121, 134, 203, 0.04)',
    },
  },
];

/**
 * بنیادی تھیمز - لائٹ اور ڈارک (مین تھیمز)
 */
export const baseThemes = [
  {
    id: 'light',
    name: 'Light',
    description: 'Standard light theme with indigo text',
    mode: themeModes.LIGHT,
    category: 'base',
    type: 'standard',
    colors: {
      ...themeColors,
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      textDisabled: '#5C6BC0',
      hover: 'rgba(26, 35, 126, 0.04)',
      focus: 'rgba(33, 150, 243, 0.12)',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Standard dark theme for reduced eye strain',
    mode: themeModes.DARK,
    category: 'base',
    type: 'standard',
    colors: {
      ...darkThemeColors,
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      textDisabled: '#78909C',
      hover: 'rgba(121, 134, 203, 0.04)',
      focus: 'rgba(66, 165, 245, 0.12)',
    },
  },
];

/**
 * ڈیفالٹ تھیم
 */
export const defaultTheme = baseThemes[0]; // Light Theme

/**
 * ہائی کنٹراسٹ تھیمز (ایسسسبلٹی)
 */
export const highContrastThemes = [
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    description: 'High contrast light theme for better visibility',
    mode: themeModes.LIGHT,
    category: 'accessibility',
    type: 'high-contrast',
    colors: {
      ...themeColors,
      primary: '#000000',
      textPrimary: '#000000',
      textSecondary: '#1A237E',
      background: '#FFFFFF',
      surface: '#F0F0F0',
      border: '#000000',
      hover: 'rgba(0, 0, 0, 0.1)',
    },
  },
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    description: 'High contrast dark theme for better visibility',
    mode: themeModes.DARK,
    category: 'accessibility',
    type: 'high-contrast',
    colors: {
      ...darkThemeColors,
      textPrimary: '#FFFFFF',
      textSecondary: '#E0E0E0',
      background: '#000000',
      surface: '#1A1A1A',
      border: '#FFFFFF',
      hover: 'rgba(255, 255, 255, 0.1)',
    },
  },
];

/**
 * تمام تھیمز کو ایک ساتھ ملانے کا فنکشن
 */
export const getAllThemes = () => {
  return [...baseThemes, ...predefinedThemes, ...highContrastThemes];
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
 * تھیم ٹائپ کے لحاظ سے تھیمز فلٹر کرنے کا فنکشن
 */
export const getThemesByType = (type) => {
  return getAllThemes().filter(theme => theme.type === type);
};

/**
 * تھیم کو CSS ویری ایبلز میں تبدیل کرنے کا فنکشن
 */
export const themeToCssVariables = (theme) => {
  const cssVars = {};
  
  // رنگوں کو CSS ویری ایبلز میں تبدیل کریں (camelCase to kebab-case)
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    cssVars[cssKey] = value;
  });
  
  // تھیم خصوصیات کو CSS ویری ایبلز میں تبدیل کریں
  Object.entries(themeProperties).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        const cssKey = `--${category}-${key}`;
        cssVars[cssKey] = value;
      });
    } else {
      cssVars[`--${category}`] = values;
    }
  });
  
  // تھیم موڈ کو سیٹ کریں
  cssVars['--theme-mode'] = theme.mode;
  cssVars['--theme-name'] = theme.name;
  
  return cssVars;
};

/**
 * CSS ویری ایبلز کو سٹائل ایٹری بیوٹ میں تبدیل کرنے کا فنکشن
 */
export const cssVariablesToStyle = (cssVars) => {
  return Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
};

/**
 * تھیم سیٹ کرنے کا کامل فنکشن
 */
export const applyTheme = (theme, element = document.documentElement) => {
  const cssVars = themeToCssVariables(theme);
  const styleString = cssVariablesToStyle(cssVars);
  
  element.setAttribute('data-theme', theme.id);
  element.setAttribute('data-theme-mode', theme.mode);
  element.style.cssText = styleString;
  
  // کلاس بھی سیٹ کریں
  if (theme.mode === themeModes.DARK) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
};

/**
 * تھیم کی معلومات کا مجموعہ
 */
export default {
  themeModes,
  themeColors,
  darkThemeColors,
  themeProperties,
  predefinedThemes,
  baseThemes,
  highContrastThemes,
  defaultTheme,
  getAllThemes,
  getThemeById,
  getThemesByMode,
  getThemesByCategory,
  getThemesByType,
  themeToCssVariables,
  cssVariablesToStyle,
  applyTheme,
};