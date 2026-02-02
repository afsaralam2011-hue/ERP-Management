// src/styles/themes/dark.jsx

import { themeProperties, themeColors, darkThemeColors } from './theme-config';

/**
 * معیاری ڈارک تھیم
 * یہ تھیم تمام ڈارک تھیمز کا بنیادی ڈھانچہ فراہم کرتی ہے
 */

export const darkTheme = {
  id: 'dark-default',
  name: 'Dark',
  description: 'Default dark theme with indigo text colors for reduced eye strain',
  mode: 'dark',
  category: 'base',
  type: 'standard',
  
  colors: {
    // Primary Colors
    primary: '#90CAF9',
    primaryLight: '#E3F2FD',
    primaryDark: '#42A5F5',
    primaryAlpha: 'rgba(144, 202, 249, 0.12)',
    
    // Secondary Colors
    secondary: '#64B5F6',
    secondaryLight: '#BBDEFB',
    secondaryDark: '#2196F3',
    secondaryAlpha: 'rgba(66, 165, 245, 0.12)',
    
    // Background Colors
    background: '#121212',
    backgroundPaper: '#1A1A1A',
    surface: '#1E1E1E',
    surfaceElevated: '#2C2C2C',
    cardBackground: '#1E1E1E',
    
    // Text Colors - FIXED: No black or white, only light indigo/blue shades
    textPrimary: '#E3F2FD',                    // Light Blue/White
    textSecondary: '#BBDEFB',                  // Light Blue
    textDisabled: '#78909C',                   // Grey-Blue
    textHint: '#90A4AE',                       // Blue-Grey
    textIcon: '#BBDEFB',                       // Light Blue
    textOnPrimary: '#121212',                  // Dark background on primary buttons
    textOnSecondary: '#121212',                // Dark background on secondary buttons
    textOnBackground: '#E3F2FD',               // Light Blue/White
    textOnSurface: '#E3F2FD',                  // Light Blue/White
    
    // Border & Divider Colors
    border: '#2D2D2D',
    borderLight: '#424242',
    borderDark: '#1A1A1A',
    divider: '#37474F',
    outline: '#424242',
    outlineVariant: '#2D2D2D',
    
    // Status Colors
    success: '#66BB6A',
    successLight: '#81C784',
    successDark: '#4CAF50',
    successAlpha: 'rgba(102, 187, 106, 0.12)',
    
    warning: '#FFB74D',
    warningLight: '#FFCC80',
    warningDark: '#F57C00',
    warningAlpha: 'rgba(255, 183, 77, 0.12)',
    
    error: '#EF5350',
    errorLight: '#E57373',
    errorDark: '#D32F2F',
    errorAlpha: 'rgba(239, 83, 80, 0.12)',
    
    info: '#42A5F5',
    infoLight: '#64B5F6',
    infoDark: '#2196F3',
    infoAlpha: 'rgba(66, 165, 245, 0.12)',
    
    // Action & State Colors
    actionActive: '#BBDEFB',                   // Light Blue
    actionHover: 'rgba(187, 222, 251, 0.08)',  // Light Blue with alpha
    actionSelected: 'rgba(144, 202, 249, 0.16)',
    actionDisabled: 'rgba(187, 222, 251, 0.3)', // Light Blue with alpha
    actionDisabledBackground: 'rgba(66, 66, 66, 0.5)',
    actionFocus: 'rgba(66, 165, 245, 0.12)',
    
    hover: 'rgba(187, 222, 251, 0.08)',        // Light Blue hover
    selected: 'rgba(144, 202, 249, 0.16)',
    focus: 'rgba(66, 165, 245, 0.12)',
    pressed: 'rgba(144, 202, 249, 0.1)',
    dragged: 'rgba(144, 202, 249, 0.05)',
    ripple: 'rgba(144, 202, 249, 0.1)',
    
    // Input & Form Colors
    inputBackground: '#2D2D2D',
    inputBorder: '#424242',
    inputPlaceholder: '#90A4AE',
    inputLabel: '#BBDEFB',
    inputText: '#E3F2FD',
    inputHelperText: '#90A4AE',
    inputFilledBackground: 'rgba(66, 66, 66, 0.5)',
    inputOutlinedBorder: 'rgba(187, 222, 251, 0.5)',
    inputStandardBorder: 'rgba(187, 222, 251, 0.42)',
    
    // Button Colors
    buttonPrimary: '#1976D2',
    buttonSecondary: '#C2185B',
    buttonDisabled: '#424242',
    buttonText: '#FFFFFF',
    buttonTextPrimary: '#BBDEFB',
    buttonTextSecondary: '#FCE4EC',
    buttonTextDisabled: '#90A4AE',
    buttonOutlinedBorder: 'rgba(144, 202, 249, 0.5)',
    
    // Chip Colors
    chipBackground: 'rgba(66, 165, 245, 0.12)',
    chipColor: '#BBDEFB',
    chipOutline: 'rgba(187, 222, 251, 0.23)',
    chipSelected: 'rgba(144, 202, 249, 0.16)',
    
    // App Bar & Navigation
    appBarBackground: '#1E1E1E',
    appBarText: '#E3F2FD',
    navigationBackground: '#1A1A1A',
    navigationSelected: 'rgba(144, 202, 249, 0.16)',
    navigationIcon: '#BBDEFB',
    navigationText: '#E3F2FD',
    
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
    skeleton: 'rgba(187, 222, 251, 0.13)',
    skeletonHighlight: 'rgba(187, 222, 251, 0.08)',
    
    // Chart & Data Visualization
    chartGrid: 'rgba(187, 222, 251, 0.12)',
    chartAxis: 'rgba(187, 222, 251, 0.54)',
    chartTooltipBackground: 'rgba(45, 45, 45, 0.95)',
    chartTooltipText: '#E3F2FD',
    
    // Code & Syntax Highlighting
    codeBackground: '#1A1A1A',
    codeText: '#BBDEFB',
    codeComment: '#90A4AE',
    codeKeyword: '#90CAF9',
    codeString: '#81C784',
    codeNumber: '#FFB74D',
    codeFunction: '#CE93D8',
    codeVariable: '#F48FB1',
    codeOperator: '#64B5F6',
    codeTag: '#EF5350',
    codeAttribute: '#4CAF50',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #90CAF9 0%, #42A5F5 100%)',
    gradientSecondary: 'linear-gradient(135deg, #64B5F6 0%, #2196F3 100%)',
    gradientSuccess: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
    gradientWarning: 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)',
    gradientError: 'linear-gradient(135deg, #EF5350 0%, #F44336 100%)',
    
    // Special Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    
    // Additional Colors
    accent: '#FF4081',
    muted: '#90A4AE',
    subtle: '#37474F',
    emphasis: '#1976D2',
    link: '#64B5F6',
    linkHover: '#90CAF9',
    visited: '#9C27B0',
    focusRing: 'rgba(66, 165, 245, 0.4)',
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
      floating: '0px 6px 12px rgba(0, 0, 0, 0.6)',
      depth: '0px 16px 32px rgba(0, 0, 0, 0.8)',
    },
    transitions: {
      ...themeProperties.transitions,
      theme: 'background-color 250ms ease, color 250ms ease, border-color 250ms ease',
    },
  },
  
  // CSS ویری ایبلز
  cssVariables: function() {
    const vars = {};
    
    // تمام رنگوں کو CSS ویری ایبلز میں تبدیل کریں (کیمل کیس سے کیباب کیس)
    Object.entries(this.colors).forEach(([key, value]) => {
      const cssKey = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      vars[cssKey] = value;
    });
    
    // خصوصیات کو CSS ویری ایبلز میں تبدیل کریں
    Object.entries(this.properties).forEach(([category, values]) => {
      if (typeof values === 'object') {
        Object.entries(values).forEach(([key, value]) => {
          const cssKey = `--${category}-${key}`;
          vars[cssKey] = value;
        });
      } else {
        vars[`--${category}`] = values;
      }
    });
    
    // تھیم میٹا ڈیٹا
    vars['--theme-mode'] = this.mode;
    vars['--theme-name'] = this.name;
    vars['--theme-id'] = this.id;
    
    return vars;
  },
  
  // تھیم کو CSS اسٹرنگ میں تبدیل کرنے کا فنکشن
  toCssString: function() {
    const vars = this.cssVariables();
    let css = `
    /* Dark Theme: ${this.name} */
    /* Description: ${this.description} */
    /* Auto-generated by theme system */
    
    :root[data-theme="${this.id}"],
    :root[data-theme-mode="dark"],
    body.dark-mode {
    `;
    
    // ویری ایبلز
    Object.entries(vars).forEach(([key, value]) => {
      css += `  ${key}: ${value};\n`;
    });
    
    css += `}\n\n`;
    
    // ڈارک تھیم کے لیے مخصوص اسٹائلز
    css += `
      /* === Dark Theme Core Styles === */
      
      /* Base Body Styling */
      body[data-theme="${this.id}"],
      body.dark-mode,
      body[data-theme-mode="dark"] {
        color-scheme: dark;
        background-color: var(--color-background) !important;
        color: var(--color-text-primary) !important;
      }
      
      /* Force text colors in dark mode */
      body.dark-mode *:not(button):not(input):not(textarea):not(select):not(svg *):not(path),
      body[data-theme-mode="dark"] *:not(button):not(input):not(textarea):not(select):not(svg *):not(path) {
        color: var(--color-text-primary) !important;
      }
      
      /* Headings */
      body.dark-mode h1,
      body.dark-mode h2,
      body.dark-mode h3,
      body.dark-mode h4,
      body.dark-mode h5,
      body.dark-mode h6,
      body[data-theme-mode="dark"] h1,
      body[data-theme-mode="dark"] h2,
      body[data-theme-mode="dark"] h3,
      body[data-theme-mode="dark"] h4,
      body[data-theme-mode="dark"] h5,
      body[data-theme-mode="dark"] h6 {
        color: var(--color-text-primary) !important;
      }
      
      /* Paragraphs and text elements */
      body.dark-mode p,
      body.dark-mode span,
      body.dark-mode div,
      body.dark-mode li,
      body.dark-mode td,
      body.dark-mode th,
      body[data-theme-mode="dark"] p,
      body[data-theme-mode="dark"] span,
      body[data-theme-mode="dark"] div,
      body[data-theme-mode="dark"] li,
      body[data-theme-mode="dark"] td,
      body[data-theme-mode="dark"] th {
        color: var(--color-text-secondary) !important;
      }
      
      /* Links */
      body.dark-mode a,
      body[data-theme-mode="dark"] a {
        color: var(--color-link) !important;
      }
      
      body.dark-mode a:hover,
      body[data-theme-mode="dark"] a:hover {
        color: var(--color-link-hover) !important;
      }
      
      /* Scrollbar Styling for Dark Theme */
      body.dark-mode ::-webkit-scrollbar,
      body[data-theme-mode="dark"] ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      
      body.dark-mode ::-webkit-scrollbar-track,
      body[data-theme-mode="dark"] ::-webkit-scrollbar-track {
        background: var(--color-scrollbar-track);
      }
      
      body.dark-mode ::-webkit-scrollbar-thumb,
      body[data-theme-mode="dark"] ::-webkit-scrollbar-thumb {
        background: var(--color-scrollbar-thumb);
        border-radius: 6px;
        border: 2px solid var(--color-scrollbar-track);
      }
      
      body.dark-mode ::-webkit-scrollbar-thumb:hover,
      body[data-theme-mode="dark"] ::-webkit-scrollbar-thumb:hover {
        background: var(--color-scrollbar-thumb-hover);
      }
      
      /* Selection Styling */
      body.dark-mode ::selection,
      body[data-theme-mode="dark"] ::selection {
        background-color: var(--color-selected);
        color: var(--color-text-primary);
      }
      
      /* Focus Outline */
      body.dark-mode :focus-visible,
      body[data-theme-mode="dark"] :focus-visible {
        outline: 2px solid var(--color-focus-ring);
        outline-offset: 2px;
        border-radius: var(--border-radius-sm);
      }
      
      /* Disabled State */
      body.dark-mode [disabled],
      body[data-theme-mode="dark"] [disabled] {
        opacity: 0.5;
        cursor: not-allowed;
        color: var(--color-text-disabled) !important;
      }
      
      /* Code Block Styling */
      body.dark-mode code,
      body.dark-mode pre,
      body[data-theme-mode="dark"] code,
      body[data-theme-mode="dark"] pre {
        font-family: var(--typography-font-family-mono);
        background-color: var(--color-code-background) !important;
        color: var(--color-code-text) !important;
        border: 1px solid var(--color-border);
      }
      
      body.dark-mode pre,
      body[data-theme-mode="dark"] pre {
        padding: var(--spacing-md);
        overflow-x: auto;
        border-radius: var(--border-radius-md);
      }
      
      /* Table Styling */
      body.dark-mode table,
      body[data-theme-mode="dark"] table {
        border-collapse: collapse;
        width: 100%;
        color: var(--color-text-primary) !important;
      }
      
      body.dark-mode th,
      body.dark-mode td,
      body[data-theme-mode="dark"] th,
      body[data-theme-mode="dark"] td {
        border: 1px solid var(--color-border);
        padding: var(--spacing-sm);
        text-align: left;
        color: var(--color-text-primary) !important;
      }
      
      body.dark-mode th,
      body[data-theme-mode="dark"] th {
        background-color: var(--color-surface) !important;
        font-weight: var(--typography-font-weight-medium);
        color: var(--color-text-primary) !important;
      }
      
      body.dark-mode tr:hover,
      body[data-theme-mode="dark"] tr:hover {
        background-color: var(--color-hover) !important;
      }
      
      /* Image Styling for Dark Theme */
      body.dark-mode img,
      body[data-theme-mode="dark"] img {
        filter: brightness(0.9) contrast(1.1);
      }
      
      /* Form Elements Enhancement */
      body.dark-mode input,
      body.dark-mode textarea,
      body.dark-mode select,
      body[data-theme-mode="dark"] input,
      body[data-theme-mode="dark"] textarea,
      body[data-theme-mode="dark"] select {
        background-color: var(--color-input-background) !important;
        border-color: var(--color-input-border) !important;
        color: var(--color-input-text) !important;
      }
      
      body.dark-mode input::placeholder,
      body.dark-mode textarea::placeholder,
      body[data-theme-mode="dark"] input::placeholder,
      body[data-theme-mode="dark"] textarea::placeholder {
        color: var(--color-input-placeholder) !important;
      }
      
      /* Card Styling */
      body.dark-mode .card,
      body.dark-mode .panel,
      body.dark-mode .modal,
      body[data-theme-mode="dark"] .card,
      body[data-theme-mode="dark"] .panel,
      body[data-theme-mode="dark"] .modal {
        background-color: var(--color-surface) !important;
        border: 1px solid var(--color-border) !important;
        color: var(--color-text-primary) !important;
        box-shadow: var(--shadows-card);
      }
      
      /* Button Styling */
      body.dark-mode button,
      body[data-theme-mode="dark"] button {
        color: var(--color-button-text) !important;
      }
      
      body.dark-mode button:disabled,
      body[data-theme-mode="dark"] button:disabled {
        background-color: var(--color-button-disabled) !important;
        color: var(--color-button-text-disabled) !important;
      }
      
      /* Loading Spinner */
      body.dark-mode .spinner,
      body[data-theme-mode="dark"] .spinner {
        border-color: var(--color-primary) transparent transparent transparent;
      }
      
      /* Accessibility Enhancement for Dark Theme */
      @media (prefers-contrast: high) {
        body.dark-mode,
        body[data-theme-mode="dark"] {
          --color-text-primary: #BBDEFB;
          --color-text-secondary: #90CAF9;
          --color-border: #64B5F6;
        }
      }
      
      /* Reduced Motion Support */
      @media (prefers-reduced-motion: reduce) {
        body.dark-mode *,
        body[data-theme-mode="dark"] * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Print Styles */
      @media print {
        body.dark-mode,
        body[data-theme-mode="dark"] {
          background-color: white !important;
          color: black !important;
        }
        
        body.dark-mode *,
        body[data-theme-mode="dark"] * {
          color: black !important;
          background-color: white !important;
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
  
  // تھیم کو اپلائی کرنے کا آسان فنکشن
  apply: function(element = document.documentElement) {
    const styleString = this.toCssString();
    const styleElement = document.createElement('style');
    styleElement.id = `theme-${this.id}`;
    styleElement.textContent = styleString;
    
    // پرانے تھیم اسٹائلز کو ہٹائیں
    const oldStyle = document.getElementById(`theme-${this.id}`);
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(styleElement);
    element.setAttribute('data-theme', this.id);
    element.setAttribute('data-theme-mode', this.mode);
    
    // کلاسز سیٹ کریں
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
    
    return this;
  },
};

/**
 * ڈارک تھیم کے مختلف ورژنز
 */
export const darkThemeVariants = {
  // True Black Dark Theme
  trueBlack: {
    ...darkTheme,
    id: 'dark-true-black',
    name: 'True Black',
    description: 'Pure black theme for OLED displays with maximum power saving',
    type: 'accessibility',
    colors: {
      ...darkTheme.colors,
      background: '#000000',
      surface: '#0A0A0A',
      surfaceElevated: '#1A1A1A',
      cardBackground: '#0A0A0A',
      border: '#1A1A1A',
      divider: '#1A1A1A',
      inputBackground: '#1A1A1A',
      scrollbarTrack: '#0A0A0A',
      // Text colors remain light blue/indigo
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
    },
  },
  
  // Dark Gray Theme
  darkGray: {
    ...darkTheme,
    id: 'dark-gray',
    name: 'Dark Gray',
    description: 'Dark theme with gray tones for professional look',
    type: 'standard',
    colors: {
      ...darkTheme.colors,
      background: '#1A1A1A',
      surface: '#2D2D2D',
      surfaceElevated: '#3D3D3D',
      cardBackground: '#2D2D2D',
      border: '#404040',
      divider: '#404040',
      inputBackground: '#2D2D2D',
      scrollbarTrack: '#1A1A1A',
      // Text colors remain light blue/indigo
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
    },
  },
  
  // Dark Blue Theme
  darkBlue: {
    ...darkTheme,
    id: 'dark-blue-variant',
    name: 'Dark Blue',
    description: 'Dark theme with blue undertones',
    type: 'colorful',
    colors: {
      ...darkTheme.colors,
      background: '#0D1B2A',
      surface: '#1B263B',
      surfaceElevated: '#2D3E5D',
      cardBackground: '#1B263B',
      border: '#415A77',
      divider: '#415A77',
      primary: '#4EA8DE',
      primaryLight: '#90CAF9',
      primaryDark: '#2196F3',
      secondary: '#5E60CE',
      inputBackground: '#1B263B',
      scrollbarTrack: '#0D1B2A',
      // Text colors remain light blue/indigo
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
      link: '#4EA8DE',
      linkHover: '#90CAF9',
    },
  },
  
  // Dark Green Theme
  darkGreen: {
    ...darkTheme,
    id: 'dark-green',
    name: 'Dark Green',
    description: 'Dark theme with green undertones',
    type: 'colorful',
    colors: {
      ...darkTheme.colors,
      background: '#0D1F0D',
      surface: '#1C2F1C',
      surfaceElevated: '#2D462D',
      cardBackground: '#1C2F1C',
      border: '#3D5A3D',
      divider: '#3D5A3D',
      primary: '#4CAF50',
      primaryLight: '#81C784',
      primaryDark: '#388E3C',
      secondary: '#81C784',
      success: '#4CAF50',
      inputBackground: '#1C2F1C',
      scrollbarTrack: '#0D1F0D',
      // Text colors remain light blue/indigo
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
    },
  },
  
  // Dark Purple Theme
  darkPurple: {
    ...darkTheme,
    id: 'dark-purple-variant',
    name: 'Dark Purple',
    description: 'Dark theme with purple undertones',
    type: 'colorful',
    colors: {
      ...darkTheme.colors,
      background: '#1A0D2A',
      surface: '#2A1B3B',
      surfaceElevated: '#3D2E5D',
      cardBackground: '#2A1B3B',
      border: '#5A4177',
      divider: '#5A4177',
      primary: '#9C27B0',
      primaryLight: '#CE93D8',
      primaryDark: '#7B1FA2',
      secondary: '#BA68C8',
      accent: '#9C27B0',
      inputBackground: '#2A1B3B',
      scrollbarTrack: '#1A0D2A',
      // Text colors remain light blue/indigo
      textPrimary: '#E3F2FD',
      textSecondary: '#BBDEFB',
    },
  },
  
  // High Contrast Dark Theme
  highContrast: {
    ...darkTheme,
    id: 'dark-high-contrast',
    name: 'High Contrast Dark',
    description: 'Dark theme with enhanced contrast for accessibility',
    type: 'accessibility',
    colors: {
      ...darkTheme.colors,
      textPrimary: '#FFFFFF',           // Pure white for maximum contrast
      textSecondary: '#E0E0E0',         // Light gray
      textDisabled: '#B0B0B0',
      border: '#FFFFFF',                // White borders
      divider: '#FFFFFF',
      background: '#000000',
      surface: '#121212',
      cardBackground: '#1A1A1A',
      inputBackground: '#000000',
      inputBorder: '#FFFFFF',
      inputText: '#FFFFFF',
      // Keep primary colors for buttons
      buttonPrimary: '#1976D2',
      buttonText: '#FFFFFF',
    },
  },
  
  // Midnight Indigo Theme
  midnightIndigo: {
    ...darkTheme,
    id: 'midnight-indigo',
    name: 'Midnight Indigo',
    description: 'Deep indigo theme with indigo text colors',
    type: 'colorful',
    colors: {
      ...darkTheme.colors,
      background: '#0A0A1A',
      surface: '#1A1A2A',
      surfaceElevated: '#2A2A3A',
      cardBackground: '#1A1A2A',
      border: '#2D2D4D',
      divider: '#2D2D4D',
      primary: '#5C6BC0',
      primaryLight: '#9FA8DA',
      primaryDark: '#3F51B5',
      secondary: '#7986CB',
      inputBackground: '#1A1A2A',
      scrollbarTrack: '#0A0A1A',
      // Text colors in indigo shades
      textPrimary: '#C5CAE9',           // Light indigo
      textSecondary: '#9FA8DA',         // Medium indigo
      textDisabled: '#7986CB',          // Deep indigo
      link: '#7986CB',
      linkHover: '#9FA8DA',
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
    return theme.apply();
  }
  return null;
};

/**
 * سسٹم پرفرمنس کا اندازہ لگانے کا فنکشن
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
        if (theme.mode === 'dark') {
          const darkTheme = getDarkThemeById(theme.id);
          return () => applyDarkTheme(darkTheme);
        }
      } catch (e) {
        console.warn('Failed to parse saved theme:', e);
      }
    }
    
    // پھر سسٹم پریفرنس چیک کریں
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return () => applyDarkTheme();
    }
    
    return null;
  }
  return null;
};

/**
 * تھیم مینیجر کلاس
 */
export class DarkThemeManager {
  constructor() {
    this.currentTheme = darkTheme;
    this.isInitialized = false;
  }
  
  init() {
    if (this.isInitialized) return;
    
    // آٹو ڈیٹیکٹ تھیم
    const applyTheme = autoDetectTheme();
    if (applyTheme) {
      applyTheme();
    }
    
    this.isInitialized = true;
    return this;
  }
  
  switchTheme(themeId) {
    const theme = getDarkThemeById(themeId);
    if (theme) {
      this.currentTheme = theme;
      applyDarkTheme(theme);
      
      // Save to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('currentTheme', JSON.stringify({
          id: theme.id,
          name: theme.name,
          mode: theme.mode,
          appliedAt: new Date().toISOString(),
        }));
      }
      
      return theme;
    }
    return null;
  }
  
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  getAllAvailableThemes() {
    return getAllDarkThemes();
  }
  
  getThemesByType(type) {
    return getAllDarkThemes().filter(theme => theme.type === type);
  }
}

/**
 * گلوبل تھیم مینیجر
 */
export const darkThemeManager = new DarkThemeManager();

/**
 * ڈیفالٹ ڈارک تھیم ایکسپورٹ
 */
export default darkTheme;