// src/styles/themes/light.jsx

import { themeProperties } from './theme-config';

/**
 * معیاری لائٹ تھیم
 * یہ تھیم تمام لائٹ تھیمز کا بنیادی ڈھانچہ فراہم کرتی ہے
 */

export const lightTheme = {
  id: 'light-default',
  name: 'Light',
  description: 'Default light theme with Material Design colors',
  mode: 'light',
  category: 'base',
  
  colors: {
    // Primary Colors
    primary: '#1976D2',
    primaryLight: '#BBDEFB',
    primaryDark: '#0D47A1',
    primaryAlpha: 'rgba(25, 118, 210, 0.12)',
    
    // Secondary Colors
    secondary: '#DC004E',
    secondaryLight: '#F8BBD0',
    secondaryDark: '#C2185B',
    secondaryAlpha: 'rgba(220, 0, 78, 0.12)',
    
    // Background Colors
    background: '#FFFFFF',
    backgroundPaper: '#FAFAFA',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    cardBackground: '#FFFFFF',
    
    // Text Colors - BLACK سے INDIGO/NAVY میں تبدیل
    textPrimary: 'rgba(26, 35, 126, 0.87)',       // #1A237E with alpha
    textSecondary: 'rgba(40, 53, 147, 0.6)',      // #283593 with alpha
    textDisabled: 'rgba(40, 53, 147, 0.38)',      // #283593 with alpha
    textHint: 'rgba(40, 53, 147, 0.38)',          // #283593 with alpha
    textIcon: 'rgba(40, 53, 147, 0.54)',          // #283593 with alpha
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    textOnBackground: 'rgba(26, 35, 126, 0.87)',  // #1A237E with alpha
    textOnSurface: 'rgba(26, 35, 126, 0.87)',     // #1A237E with alpha
    
    // Border & Divider Colors - BLACK سے INDIGO/NAVY میں تبدیل
    border: 'rgba(26, 35, 126, 0.12)',            // #1A237E with alpha
    borderLight: 'rgba(26, 35, 126, 0.08)',       // #1A237E with alpha
    borderDark: 'rgba(26, 35, 126, 0.24)',        // #1A237E with alpha
    divider: 'rgba(26, 35, 126, 0.12)',           // #1A237E with alpha
    outline: 'rgba(26, 35, 126, 0.23)',           // #1A237E with alpha
    outlineVariant: 'rgba(26, 35, 126, 0.12)',    // #1A237E with alpha
    
    // Status Colors
    success: '#4CAF50',
    successLight: '#C8E6C9',
    successDark: '#388E3C',
    successAlpha: 'rgba(76, 175, 80, 0.12)',
    
    warning: '#FF9800',
    warningLight: '#FFE0B2',
    warningDark: '#F57C00',
    warningAlpha: 'rgba(255, 152, 0, 0.12)',
    
    error: '#F44336',
    errorLight: '#FFCDD2',
    errorDark: '#D32F2F',
    errorAlpha: 'rgba(244, 67, 54, 0.12)',
    
    info: '#2196F3',
    infoLight: '#BBDEFB',
    infoDark: '#1976D2',
    infoAlpha: 'rgba(33, 150, 243, 0.12)',
    
    // Action & State Colors - BLACK سے INDIGO/NAVY میں تبدیل
    actionActive: 'rgba(26, 35, 126, 0.54)',      // #1A237E with alpha
    actionHover: 'rgba(26, 35, 126, 0.04)',       // #1A237E with alpha
    actionSelected: 'rgba(26, 35, 126, 0.08)',    // #1A237E with alpha
    actionDisabled: 'rgba(26, 35, 126, 0.26)',    // #1A237E with alpha
    actionDisabledBackground: 'rgba(26, 35, 126, 0.12)', // #1A237E with alpha
    actionFocus: 'rgba(26, 35, 126, 0.12)',       // #1A237E with alpha
    
    hover: 'rgba(26, 35, 126, 0.04)',             // #1A237E with alpha
    selected: 'rgba(25, 118, 210, 0.08)',
    focus: 'rgba(25, 118, 210, 0.12)',
    pressed: 'rgba(26, 35, 126, 0.1)',            // #1A237E with alpha
    dragged: 'rgba(26, 35, 126, 0.05)',           // #1A237E with alpha
    ripple: 'rgba(26, 35, 126, 0.1)',             // #1A237E with alpha
    
    // Input & Form Colors - BLACK سے INDIGO/NAVY میں تبدیل
    inputBackground: '#FFFFFF',
    inputBorder: 'rgba(26, 35, 126, 0.23)',       // #1A237E with alpha
    inputPlaceholder: 'rgba(40, 53, 147, 0.54)',  // #283593 with alpha
    inputLabel: 'rgba(40, 53, 147, 0.6)',         // #283593 with alpha
    inputText: 'rgba(26, 35, 126, 0.87)',         // #1A237E with alpha
    inputHelperText: 'rgba(40, 53, 147, 0.6)',    // #283593 with alpha
    inputFilledBackground: 'rgba(26, 35, 126, 0.06)', // #1A237E with alpha
    inputOutlinedBorder: 'rgba(26, 35, 126, 0.23)',  // #1A237E with alpha
    inputStandardBorder: 'rgba(26, 35, 126, 0.42)',  // #1A237E with alpha
    
    // Button Colors
    buttonPrimary: '#1976D2',
    buttonSecondary: '#DC004E',
    buttonDisabled: 'rgba(26, 35, 126, 0.12)',    // #1A237E with alpha
    buttonText: '#FFFFFF',
    buttonTextPrimary: '#1976D2',
    buttonTextSecondary: '#DC004E',
    buttonTextDisabled: 'rgba(26, 35, 126, 0.26)', // #1A237E with alpha
    buttonOutlinedBorder: 'rgba(25, 118, 210, 0.5)',
    
    // Chip Colors - BLACK سے INDIGO/NAVY میں تبدیل
    chipBackground: 'rgba(26, 35, 126, 0.08)',    // #1A237E with alpha
    chipColor: 'rgba(26, 35, 126, 0.87)',         // #1A237E with alpha
    chipOutline: 'rgba(26, 35, 126, 0.23)',       // #1A237E with alpha
    chipSelected: 'rgba(25, 118, 210, 0.08)',
    
    // App Bar & Navigation
    appBarBackground: '#1976D2',
    appBarText: '#FFFFFF',
    navigationBackground: '#FFFFFF',
    navigationSelected: 'rgba(25, 118, 210, 0.08)',
    navigationIcon: 'rgba(40, 53, 147, 0.54)',    // #283593 with alpha
    navigationText: 'rgba(26, 35, 126, 0.87)',    // #1A237E with alpha
    
    // Scrollbar
    scrollbarTrack: '#F5F5F5',
    scrollbarThumb: '#BDBDBD',
    scrollbarThumbHover: '#9E9E9E',
    
    // Overlay & Shadow
    backdrop: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(26, 35, 126, 0.1)',             // #1A237E with alpha
    elevation1: '0px 1px 3px rgba(26, 35, 126, 0.12), 0px 1px 2px rgba(26, 35, 126, 0.24)',
    elevation2: '0px 3px 6px rgba(26, 35, 126, 0.16), 0px 3px 6px rgba(26, 35, 126, 0.23)',
    elevation3: '0px 10px 20px rgba(26, 35, 126, 0.19), 0px 6px 6px rgba(26, 35, 126, 0.23)',
    
    // Skeleton & Loading - BLACK سے INDIGO/NAVY میں تبدیل
    skeleton: 'rgba(26, 35, 126, 0.11)',          // #1A237E with alpha
    skeletonHighlight: 'rgba(26, 35, 126, 0.08)', // #1A237E with alpha
    
    // Chart & Data Visualization - BLACK سے INDIGO/NAVY میں تبدیل
    chartGrid: 'rgba(26, 35, 126, 0.12)',         // #1A237E with alpha
    chartAxis: 'rgba(40, 53, 147, 0.54)',         // #283593 with alpha
    chartTooltipBackground: 'rgba(97, 97, 97, 0.9)',
    chartTooltipText: '#FFFFFF',
    
    // Code & Syntax Highlighting - BLACK سے INDIGO/NAVY میں تبدیل
    codeBackground: '#F5F5F5',
    codeText: '#1A237E',                          // Solid #1A237E
    codeComment: '#283593',                       // Solid #283593
    codeKeyword: '#1976D2',
    codeString: '#388E3C',
    codeNumber: '#F57C00',
    codeFunction: '#7B1FA2',
    codeVariable: '#DC004E',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
    gradientSecondary: 'linear-gradient(135deg, #DC004E 0%, #F50057 100%)',
    gradientSuccess: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    gradientWarning: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)',
    gradientError: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
    
    // Special Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  
  // تھیم کی خصوصیات theme-config سے
  properties: {
    ...themeProperties,
    // لائٹ تھیم کے لیے مخصوص ترتیبات
    shadows: {
      ...themeProperties.shadows,
      button: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
      card: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
      dialog: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
    },
  },
  
  // CSS ویری ایبلز
  cssVariables: function() {
    const vars = {};
    
    // تمام رنگوں کو CSS ویری ایبلز میں تبدیل کریں
    Object.entries(this.colors).forEach(([key, value]) => {
      vars[`--light-${key}`] = value;
      vars[`--color-${key}`] = value; // عمومی ویری ایبلز بھی
    });
    
    // خصوصیات کو CSS ویری ایبلز میں تبدیل کریں
    Object.entries(this.properties).forEach(([category, values]) => {
      if (typeof values === 'object') {
        Object.entries(values).forEach(([key, value]) => {
          vars[`--${category}-${key}`] = value;
        });
      }
    });
    
    // تھیم موڈ سیٹ کریں
    vars['--theme-mode'] = 'light';
    vars['--theme-name'] = 'light-default';
    
    return vars;
  },
  
  // تھیم کو CSS اسٹرنگ میں تبدیل کرنے کا فنکشن
  toCssString: function() {
    const vars = this.cssVariables();
    let css = ':root {\n';
    
    Object.entries(vars).forEach(([key, value]) => {
      css += `  ${key}: ${value};\n`;
    });
    
    css += '}\n\n';
    
    // لائٹ تھیم کے لیے مخصوص اسٹائلز
    css += `
      /* Light Theme Specific Styles */
      body {
        color-scheme: light;
        background-color: var(--light-background);
        color: var(--light-textPrimary);
      }
      
      /* Scrollbar Styling for Light Theme */
      ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--light-scrollbarTrack);
      }
      
      ::-webkit-scrollbar-thumb {
        background: var(--light-scrollbarThumb);
        border-radius: 6px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--light-scrollbarThumbHover);
      }
      
      /* Selection Styling */
      ::selection {
        background-color: var(--light-selected);
        color: var(--light-textPrimary);
      }
      
      /* Focus Outline */
      :focus-visible {
        outline: 2px solid var(--light-focus);
        outline-offset: 2px;
      }
      
      /* Disabled State */
      [disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      /* Link Styling */
      a {
        color: var(--light-primary);
        text-decoration: none;
        transition: color ${this.properties.transitions.fast};
      }
      
      a:hover {
        color: var(--light-primaryDark);
        text-decoration: underline;
      }
      
      /* Code Block Styling */
      code, pre {
        font-family: 'Courier New', monospace;
        background-color: var(--light-codeBackground);
        color: var(--light-codeText);
        padding: 2px 4px;
        border-radius: var(--borderRadius-small);
      }
      
      pre {
        padding: var(--spacing-md);
        overflow-x: auto;
        border: 1px solid var(--light-border);
      }
      
      /* Table Styling */
      table {
        border-collapse: collapse;
        width: 100%;
      }
      
      th, td {
        border: 1px solid var(--light-border);
        padding: var(--spacing-sm);
        text-align: left;
      }
      
      th {
        background-color: var(--light-surface);
        font-weight: var(--typography-fontWeight-medium);
      }
      
      tr:hover {
        background-color: var(--light-hover);
      }
    `;
    
    return css;
  },
  
  // تھیم کو ان لائن اسٹائلز میں تبدیل کرنے کا فنکشن
  toInlineStyles: function() {
    const vars = this.cssVariables();
    let styles = '';
    
    Object.entries(vars).forEach(([key, value]) => {
      styles += `${key}: ${value}; `;
    });
    
    return styles.trim();
  },
};

/**
 * لائٹ تھیم کا ڈیفالٹ ایکسپورٹ
 */
export default lightTheme;

/**
 * لائٹ تھیم کے مختلف ورژنز
 */
export const lightThemeVariants = {
  // High Contrast Light Theme - INDIGO/NAVY میں تبدیل
  highContrast: {
    ...lightTheme,
    id: 'light-high-contrast',
    name: 'High Contrast Light',
    description: 'Light theme with enhanced contrast for better accessibility',
    colors: {
      ...lightTheme.colors,
      textPrimary: '#1A237E',        // Solid INDIGO/NAVY
      textSecondary: '#283593',      // Solid INDIGO/NAVY
      border: '#1A237E',             // Solid INDIGO/NAVY
      divider: '#1A237E',            // Solid INDIGO/NAVY
      background: '#FFFFFF',
      surface: '#F8F8F8',
    },
  },
  
  // Warm Light Theme - INDIGO/NAVY میں تبدیل
  warm: {
    ...lightTheme,
    id: 'light-warm',
    name: 'Warm Light',
    description: 'Light theme with warm, yellowish tones',
    colors: {
      ...lightTheme.colors,
      background: '#FFFBF0',
      surface: '#F5F1E6',
      textPrimary: '#1A237E',        // INDIGO/NAVY text
      border: '#D8D2C3',
    },
  },
  
  // Cool Light Theme - پہلے سے INDIGO/NAVY میں ہے
  cool: {
    ...lightTheme,
    id: 'light-cool',
    name: 'Cool Light',
    description: 'Light theme with cool, bluish tones',
    colors: {
      ...lightTheme.colors,
      background: '#F8FAFF',
      surface: '#F0F4FF',
      textPrimary: '#1A237E',        // INDIGO/NAVY text
      border: '#C5CAE9',             // Light INDIGO
    },
  },
  
  // Sepia Light Theme - INDIGO/NAVY میں تبدیل
  sepia: {
    ...lightTheme,
    id: 'light-sepia',
    name: 'Sepia Light',
    description: 'Light theme with sepia tones for reading comfort',
    colors: {
      ...lightTheme.colors,
      background: '#F8F0E3',
      surface: '#F0E6D6',
      textPrimary: '#1A237E',        // INDIGO/NAVY text
      textSecondary: '#283593',      // INDIGO/NAVY secondary
      border: '#D7CCC8',
    },
  },
};

/**
 * تمام لائٹ تھیمز کو ایک ساتھ لانے کا فنکشن
 */
export const getAllLightThemes = () => {
  return [lightTheme, ...Object.values(lightThemeVariants)];
};

/**
 * لائٹ تھیم ID سے تلاش کرنے کا فنکشن
 */
export const getLightThemeById = (id) => {
  const allThemes = getAllLightThemes();
  return allThemes.find(theme => theme.id === id) || lightTheme;
};

/**
 * لائٹ تھیم کو اپلائی کرنے کا ہیلپر فنکشن
 */
export const applyLightTheme = (theme = lightTheme) => {
  if (typeof document !== 'undefined') {
    const styleElement = document.getElementById('light-theme-styles');
    if (styleElement) {
      styleElement.textContent = theme.toCssString();
    } else {
      const newStyleElement = document.createElement('style');
      newStyleElement.id = 'light-theme-styles';
      newStyleElement.textContent = theme.toCssString();
      document.head.appendChild(newStyleElement);
    }
    
    // body پر کلاسیں اپڈیٹ کریں
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add('theme-light');
    document.body.setAttribute('data-theme', theme.id);
    
    // تھیم کو localStorage میں محفوظ کریں
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentTheme', JSON.stringify({
        id: theme.id,
        name: theme.name,
        mode: theme.mode,
        appliedAt: new Date().toISOString(),
      }));
    }
  }
};