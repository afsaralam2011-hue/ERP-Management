// src/styles/themes/dark.jsx

import { themeProperties } from './theme-config';

/**
 * معیاری ڈارک تھیم
 * یہ تھیم تمام ڈارک تھیمز کا بنیادی ڈھانچہ فراہم کرتی ہے
 */

export const darkTheme = {
  id: 'dark-default',
  name: 'Dark',
  description: 'Default dark theme with Material Design colors for reduced eye strain',
  mode: 'dark',
  category: 'base',
  
  colors: {
    // Primary Colors
    primary: '#90CAF9',
    primaryLight: '#BBDEFB',
    primaryDark: '#42A5F5',
    primaryAlpha: 'rgba(144, 202, 249, 0.12)',
    
    // Secondary Colors
    secondary: '#F48FB1',
    secondaryLight: '#FCE4EC',
    secondaryDark: '#F06292',
    secondaryAlpha: 'rgba(244, 143, 177, 0.12)',
    
    // Background Colors
    background: '#121212',
    backgroundPaper: '#1A1A1A',
    surface: '#1E1E1E',
    surfaceElevated: '#2C2C2C',
    cardBackground: '#1E1E1E',
    
    // Text Colors - WHITE سے INDIGO/NAVY میں تبدیل
    textPrimary: 'rgba(121, 134, 203, 0.87)',      // #7986CB with alpha
    textSecondary: 'rgba(159, 168, 218, 0.6)',     // #9FA8DA with alpha
    textDisabled: 'rgba(159, 168, 218, 0.38)',     // #9FA8DA with alpha
    textHint: 'rgba(159, 168, 218, 0.38)',         // #9FA8DA with alpha
    textIcon: 'rgba(159, 168, 218, 0.54)',         // #9FA8DA with alpha
    textOnPrimary: 'rgba(0, 0, 0, 0.87)',          // یہ black رہے گا primary پر text کے لیے
    textOnSecondary: 'rgba(0, 0, 0, 0.87)',        // یہ black رہے گا secondary پر text کے لیے
    textOnBackground: 'rgba(121, 134, 203, 0.87)', // #7986CB with alpha
    textOnSurface: 'rgba(121, 134, 203, 0.87)',    // #7986CB with alpha
    
    // Border & Divider Colors
    border: 'rgba(121, 134, 203, 0.12)',           // INDIGO border
    borderLight: 'rgba(121, 134, 203, 0.08)',      // INDIGO light border
    borderDark: 'rgba(121, 134, 203, 0.24)',       // INDIGO dark border
    divider: 'rgba(121, 134, 203, 0.12)',          // INDIGO divider
    outline: 'rgba(121, 134, 203, 0.23)',          // INDIGO outline
    outlineVariant: 'rgba(121, 134, 203, 0.12)',   // INDIGO outline variant
    
    // Status Colors
    success: '#66BB6A',
    successLight: '#81C784',
    successDark: '#4CAF50',
    successAlpha: 'rgba(102, 187, 106, 0.12)',
    
    warning: '#FFA726',
    warningLight: '#FFB74D',
    warningDark: '#FF9800',
    warningAlpha: 'rgba(255, 167, 38, 0.12)',
    
    error: '#EF5350',
    errorLight: '#E57373',
    errorDark: '#F44336',
    errorAlpha: 'rgba(239, 83, 80, 0.12)',
    
    info: '#42A5F5',
    infoLight: '#64B5F6',
    infoDark: '#2196F3',
    infoAlpha: 'rgba(66, 165, 245, 0.12)',
    
    // Action & State Colors - WHITE سے INDIGO میں تبدیل
    actionActive: 'rgba(121, 134, 203, 0.56)',     // INDIGO active
    actionHover: 'rgba(121, 134, 203, 0.08)',      // INDIGO hover
    actionSelected: 'rgba(121, 134, 203, 0.16)',   // INDIGO selected
    actionDisabled: 'rgba(121, 134, 203, 0.3)',    // INDIGO disabled
    actionDisabledBackground: 'rgba(121, 134, 203, 0.12)', // INDIGO disabled background
    actionFocus: 'rgba(121, 134, 203, 0.12)',      // INDIGO focus
    
    hover: 'rgba(121, 134, 203, 0.08)',            // INDIGO hover
    selected: 'rgba(144, 202, 249, 0.16)',
    focus: 'rgba(144, 202, 249, 0.12)',
    pressed: 'rgba(121, 134, 203, 0.1)',           // INDIGO pressed
    dragged: 'rgba(121, 134, 203, 0.05)',          // INDIGO dragged
    ripple: 'rgba(121, 134, 203, 0.1)',            // INDIGO ripple
    
    // Input & Form Colors - WHITE سے INDIGO میں تبدیل
    inputBackground: '#2C2C2C',
    inputBorder: 'rgba(121, 134, 203, 0.23)',      // INDIGO border
    inputPlaceholder: 'rgba(159, 168, 218, 0.5)',  // Lighter INDIGO placeholder
    inputLabel: 'rgba(159, 168, 218, 0.6)',        // Lighter INDIGO label
    inputText: 'rgba(121, 134, 203, 0.87)',        // INDIGO text
    inputHelperText: 'rgba(159, 168, 218, 0.6)',   // Lighter INDIGO helper text
    inputFilledBackground: 'rgba(121, 134, 203, 0.09)', // INDIGO filled background
    inputOutlinedBorder: 'rgba(121, 134, 203, 0.5)',   // INDIGO outlined border
    inputStandardBorder: 'rgba(121, 134, 203, 0.42)',  // INDIGO standard border
    
    // Button Colors
    buttonPrimary: '#90CAF9',
    buttonSecondary: '#F48FB1',
    buttonDisabled: 'rgba(121, 134, 203, 0.12)',   // INDIGO disabled
    buttonText: 'rgba(0, 0, 0, 0.87)',
    buttonTextPrimary: '#90CAF9',
    buttonTextSecondary: '#F48FB1',
    buttonTextDisabled: 'rgba(121, 134, 203, 0.3)', // INDIGO disabled text
    buttonOutlinedBorder: 'rgba(144, 202, 249, 0.5)',
    
    // Chip Colors - WHITE سے INDIGO میں تبدیل
    chipBackground: 'rgba(121, 134, 203, 0.12)',   // INDIGO background
    chipColor: 'rgba(121, 134, 203, 0.87)',        // INDIGO color
    chipOutline: 'rgba(121, 134, 203, 0.23)',      // INDIGO outline
    chipSelected: 'rgba(144, 202, 249, 0.16)',
    
    // App Bar & Navigation - WHITE سے INDIGO میں تبدیل
    appBarBackground: '#1E1E1E',
    appBarText: 'rgba(121, 134, 203, 0.87)',       // INDIGO text
    navigationBackground: '#1A1A1A',
    navigationSelected: 'rgba(144, 202, 249, 0.16)',
    navigationIcon: 'rgba(159, 168, 218, 0.54)',   // Lighter INDIGO icon
    navigationText: 'rgba(121, 134, 203, 0.87)',   // INDIGO text
    
    // Scrollbar
    scrollbarTrack: '#1E1E1E',
    scrollbarThumb: '#424242',
    scrollbarThumbHover: '#616161',
    
    // Overlay & Shadow
    backdrop: 'rgba(0, 0, 0, 0.7)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    elevation1: '0px 2px 4px rgba(0, 0, 0, 0.5)',
    elevation2: '0px 4px 8px rgba(0, 0, 0, 0.5)',
    elevation3: '0px 8px 16px rgba(0, 0, 0, 0.5)',
    
    // Skeleton & Loading
    skeleton: 'rgba(121, 134, 203, 0.13)',         // INDIGO skeleton
    skeletonHighlight: 'rgba(121, 134, 203, 0.08)', // INDIGO highlight
    
    // Chart & Data Visualization
    chartGrid: 'rgba(121, 134, 203, 0.12)',        // INDIGO grid
    chartAxis: 'rgba(121, 134, 203, 0.54)',        // INDIGO axis
    chartTooltipBackground: 'rgba(66, 66, 66, 0.9)',
    chartTooltipText: 'rgba(121, 134, 203, 0.87)', // INDIGO tooltip text
    
    // Code & Syntax Highlighting - WHITE سے INDIGO میں تبدیل
    codeBackground: '#1A1A1A',
    codeText: '#C5CAE9',                           // Light INDIGO text
    codeComment: '#9FA8DA',                        // Lighter INDIGO comment
    codeKeyword: '#90CAF9',
    codeString: '#81C784',
    codeNumber: '#FFB74D',
    codeFunction: '#CE93D8',
    codeVariable: '#F48FB1',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #90CAF9 0%, #42A5F5 100%)',
    gradientSecondary: 'linear-gradient(135deg, #F48FB1 0%, #F06292 100%)',
    gradientSuccess: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
    gradientWarning: 'linear-gradient(135deg, #FFA726 0%, #FF9800 100%)',
    gradientError: 'linear-gradient(135deg, #EF5350 0%, #F44336 100%)',
    
    // Special Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  
  // تھیم کی خصوصیات theme-config سے
  properties: {
    ...themeProperties,
    // ڈارک تھیم کے لیے مخصوص ترتیبات
    shadows: {
      ...themeProperties.shadows,
      button: '0px 3px 5px rgba(0, 0, 0, 0.5)',
      card: '0px 4px 8px rgba(0, 0, 0, 0.5)',
      dialog: '0px 12px 24px rgba(0, 0, 0, 0.7)',
    },
  },
  
  // CSS ویری ایبلز
  cssVariables: function() {
    const vars = {};
    
    // تمام رنگوں کو CSS ویری ایبلز میں تبدیل کریں
    Object.entries(this.colors).forEach(([key, value]) => {
      vars[`--dark-${key}`] = value;
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
    vars['--theme-mode'] = 'dark';
    vars['--theme-name'] = 'dark-default';
    
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
    
    // ڈارک تھیم کے لیے مخصوص اسٹائلز
    css += `
      /* Dark Theme Specific Styles */
      body {
        color-scheme: dark;
        background-color: var(--dark-background);
        color: var(--dark-textPrimary);
      }
      
      /* Scrollbar Styling for Dark Theme */
      ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      
      ::-webkit-scrollbar-track {
        background: var(--dark-scrollbarTrack);
      }
      
      ::-webkit-scrollbar-thumb {
        background: var(--dark-scrollbarThumb);
        border-radius: 6px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: var(--dark-scrollbarThumbHover);
      }
      
      /* Selection Styling */
      ::selection {
        background-color: var(--dark-selected);
        color: var(--dark-textPrimary);
      }
      
      /* Focus Outline */
      :focus-visible {
        outline: 2px solid var(--dark-focus);
        outline-offset: 2px;
      }
      
      /* Disabled State */
      [disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      /* Link Styling */
      a {
        color: var(--dark-primary);
        text-decoration: none;
        transition: color ${this.properties.transitions.fast};
      }
      
      a:hover {
        color: var(--dark-primaryLight);
        text-decoration: underline;
      }
      
      /* Code Block Styling */
      code, pre {
        font-family: 'Courier New', monospace;
        background-color: var(--dark-codeBackground);
        color: var(--dark-codeText);
        padding: 2px 4px;
        border-radius: var(--borderRadius-small);
      }
      
      pre {
        padding: var(--spacing-md);
        overflow-x: auto;
        border: 1px solid var(--dark-border);
      }
      
      /* Table Styling */
      table {
        border-collapse: collapse;
        width: 100%;
      }
      
      th, td {
        border: 1px solid var(--dark-border);
        padding: var(--spacing-sm);
        text-align: left;
      }
      
      th {
        background-color: var(--dark-surface);
        font-weight: var(--typography-fontWeight-medium);
      }
      
      tr:hover {
        background-color: var(--dark-hover);
      }
      
      /* Image Styling for Dark Theme */
      img {
        filter: brightness(0.9) contrast(1.1);
      }
      
      /* Video & Media Styling */
      video, iframe {
        border: 1px solid var(--dark-border);
        border-radius: var(--borderRadius-medium);
      }
      
      /* Form Elements Enhancement */
      input, textarea, select {
        background-color: var(--dark-inputBackground);
        border-color: var(--dark-inputBorder);
        color: var(--dark-inputText);
      }
      
      input::placeholder, textarea::placeholder {
        color: var(--dark-inputPlaceholder);
      }
      
      /* Card Styling */
      .card, .panel, .modal {
        background-color: var(--dark-surface);
        border: 1px solid var(--dark-border);
        box-shadow: var(--dark-elevation1);
      }
      
      /* Tooltip Styling */
      .tooltip {
        background-color: var(--dark-surface);
        color: var(--dark-textPrimary);
        border: 1px solid var(--dark-border);
        box-shadow: var(--dark-elevation2);
      }
      
      /* Notification & Alert Styling */
      .notification, .alert {
        background-color: var(--dark-surface);
        border-left: 4px solid var(--dark-primary);
        box-shadow: var(--dark-elevation1);
      }
      
      .notification.success {
        border-left-color: var(--dark-success);
      }
      
      .notification.warning {
        border-left-color: var(--dark-warning);
      }
      
      .notification.error {
        border-left-color: var(--dark-error);
      }
      
      /* Loading Spinner */
      .spinner {
        border-color: var(--dark-primary) transparent transparent transparent;
      }
      
      /* Progress Bar */
      .progress-bar {
        background-color: var(--dark-surface);
      }
      
      .progress-bar-fill {
        background: var(--dark-gradientPrimary);
      }
      
      /* Toggle Switch */
      .toggle-switch {
        background-color: var(--dark-border);
      }
      
      .toggle-switch.active {
        background-color: var(--dark-primary);
      }
      
      /* Range Slider */
      input[type="range"] {
        background: var(--dark-surface);
      }
      
      input[type="range"]::-webkit-slider-thumb {
        background: var(--dark-primary);
      }
      
      /* Accessibility Enhancement for Dark Theme */
      @media (prefers-contrast: high) {
        :root {
          --dark-textPrimary: #7986CB;
          --dark-textSecondary: #9FA8DA;
          --dark-border: #7986CB;
        }
      }
      
      /* Reduced Motion Support */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
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
 * ڈارک تھیم کا ڈیفالٹ ایکسپورٹ
 */
export default darkTheme;

/**
 * ڈارک تھیم کے مختلف ورژنز
 */
export const darkThemeVariants = {
  // True Black Dark Theme - INDIGO میں تبدیل
  trueBlack: {
    ...darkTheme,
    id: 'dark-true-black',
    name: 'True Black',
    description: 'Pure black theme for OLED displays with maximum power saving',
    colors: {
      ...darkTheme.colors,
      background: '#000000',
      surface: '#0A0A0A',
      surfaceElevated: '#1A1A1A',
      border: '#1A1A1A',
      divider: '#1A1A1A',
      // Text colors کو indigo میں رکھیں
      textPrimary: 'rgba(121, 134, 203, 0.87)',
      textSecondary: 'rgba(159, 168, 218, 0.6)',
    },
  },
  
  // Dark Gray Theme - INDIGO میں تبدیل
  darkGray: {
    ...darkTheme,
    id: 'dark-gray',
    name: 'Dark Gray',
    description: 'Dark theme with gray tones for professional look',
    colors: {
      ...darkTheme.colors,
      background: '#1A1A1A',
      surface: '#2D2D2D',
      surfaceElevated: '#3D3D3D',
      border: '#404040',
      divider: '#404040',
      // Text colors کو indigo میں رکھیں
      textPrimary: 'rgba(121, 134, 203, 0.87)',
      textSecondary: 'rgba(159, 168, 218, 0.6)',
    },
  },
  
  // Dark Blue Theme - INDIGO میں تبدیل
  darkBlue: {
    ...darkTheme,
    id: 'dark-blue-variant',
    name: 'Dark Blue',
    description: 'Dark theme with blue undertones',
    colors: {
      ...darkTheme.colors,
      background: '#0D1B2A',
      surface: '#1B263B',
      surfaceElevated: '#2D3E5D',
      border: '#415A77',
      primary: '#4EA8DE',
      secondary: '#5E60CE',
      // Text colors کو indigo میں رکھیں
      textPrimary: 'rgba(121, 134, 203, 0.87)',
      textSecondary: 'rgba(159, 168, 218, 0.6)',
    },
  },
  
  // Dark Green Theme - INDIGO میں تبدیل
  darkGreen: {
    ...darkTheme,
    id: 'dark-green',
    name: 'Dark Green',
    description: 'Dark theme with green undertones',
    colors: {
      ...darkTheme.colors,
      background: '#0D1F0D',
      surface: '#1C2F1C',
      surfaceElevated: '#2D462D',
      border: '#3D5A3D',
      primary: '#4CAF50',
      secondary: '#81C784',
      // Text colors کو indigo میں رکھیں
      textPrimary: 'rgba(121, 134, 203, 0.87)',
      textSecondary: 'rgba(159, 168, 218, 0.6)',
    },
  },
  
  // Dark Purple Theme - INDIGO میں تبدیل
  darkPurple: {
    ...darkTheme,
    id: 'dark-purple-variant',
    name: 'Dark Purple',
    description: 'Dark theme with purple undertones',
    colors: {
      ...darkTheme.colors,
      background: '#1A0D2A',
      surface: '#2A1B3B',
      surfaceElevated: '#3D2E5D',
      border: '#5A4177',
      primary: '#9C27B0',
      secondary: '#BA68C8',
      // Text colors کو indigo میں رکھیں
      textPrimary: 'rgba(121, 134, 203, 0.87)',
      textSecondary: 'rgba(159, 168, 218, 0.6)',
    },
  },
  
  // High Contrast Dark Theme - INDIGO میں تبدیل
  highContrast: {
    ...darkTheme,
    id: 'dark-high-contrast',
    name: 'High Contrast Dark',
    description: 'Dark theme with enhanced contrast for accessibility',
    colors: {
      ...darkTheme.colors,
      textPrimary: '#7986CB',       // Solid INDIGO (no alpha for high contrast)
      textSecondary: '#9FA8DA',     // Solid lighter INDIGO
      border: '#7986CB',            // Solid INDIGO
      divider: '#7986CB',           // Solid INDIGO
      background: '#000000',
      surface: '#1A1A1A',
    },
  },
};

/**
 * تمام ڈارک تھیمز کو ایک ساتھ لانے کا فنکشن
 */
export const getAllDarkThemes = () => {
  return [darkTheme, ...Object.values(darkThemeVariants)];
};

/**
 * ڈارک تھیم ID سے تلاش کرنے کا فنکشن
 */
export const getDarkThemeById = (id) => {
  const allThemes = getAllDarkThemes();
  return allThemes.find(theme => theme.id === id) || darkTheme;
};

/**
 * ڈارک تھیم کو اپلائی کرنے کا ہیلپر فنکشن
 */
export const applyDarkTheme = (theme = darkTheme) => {
  if (typeof document !== 'undefined') {
    const styleElement = document.getElementById('dark-theme-styles');
    if (styleElement) {
      styleElement.textContent = theme.toCssString();
    } else {
      const newStyleElement = document.createElement('style');
      newStyleElement.id = 'dark-theme-styles';
      newStyleElement.textContent = theme.toCssString();
      document.head.appendChild(newStyleElement);
    }
    
    // body پر کلاسیں اپڈیٹ کریں
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add('theme-dark');
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
    
    // ڈارک تھیم کے لیے مخصوص میٹا ٹیگ
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme.colors.background);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = theme.colors.background;
      document.head.appendChild(newMeta);
    }
  }
};

/**
 * سسٹم پرفرمنس کا اندازہ لگانے کا فنکشن
 * یہ ڈارک تھیم کی کارکردگی کے بارے میں معلومات فراہم کرتا ہے
 */
export const getDarkThemePerformance = () => {
  const performanceInfo = {
    batterySaving: 'Dark themes can save up to 30-50% battery on OLED displays',
    eyeStrain: 'Reduces blue light emission by approximately 60%',
    accessibility: 'High contrast variants available for visually impaired users',
    performance: 'Typically 5-15% faster rendering due to fewer bright pixels',
    recommendations: [
      'Use True Black theme for OLED displays',
      'Use High Contrast for better readability',
      'Enable dark theme at system level for consistent experience',
    ],
  };
  
  return performanceInfo;
};

/**
 * آٹو میٹک تھیم سوئچنگ کے لیے ہیلپر فنکشن
 */
export const autoDetectTheme = () => {
  if (typeof window !== 'undefined') {
    // پہلے localStorage میں محفوظ تھیم چیک کریں
    const savedTheme = localStorage.getItem('currentTheme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        return theme.mode === 'dark' ? applyDarkTheme : null;
      } catch (e) {
        console.warn('Failed to parse saved theme:', e);
      }
    }
    
    // پھر سسٹم پریفرنس چیک کریں
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return applyDarkTheme;
    }
    
    return null;
  }
  return null;
};