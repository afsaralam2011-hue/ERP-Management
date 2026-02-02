// src/styles/themes/light.jsx

import { themeProperties, themeColors } from './theme-config';

/**
 * معیاری لائٹ تھیم
 * یہ تھیم تمام لائٹ تھیمز کا بنیادی ڈھانچہ فراہم کرتی ہے
 */

export const lightTheme = {
  id: 'light-default',
  name: 'Light',
  description: 'Default light theme with indigo/navy blue text colors',
  mode: 'light',
  category: 'base',
  type: 'standard',
  
  colors: {
    // Primary Colors
    primary: '#1976D2',
    primaryLight: '#BBDEFB',
    primaryDark: '#0D47A1',
    primaryAlpha: 'rgba(25, 118, 210, 0.12)',
    
    // Secondary Colors
    secondary: '#64B5F6',
    secondaryLight: '#E3F2FD',
    secondaryDark: '#2196F3',
    secondaryAlpha: 'rgba(100, 181, 246, 0.12)',
    
    // Background Colors
    background: '#FFFFFF',
    backgroundPaper: '#FAFAFA',
    surface: '#F5F5F5',
    surfaceElevated: '#FFFFFF',
    cardBackground: '#FFFFFF',
    
    // Text Colors - All in indigo/navy blue shades
    textPrimary: '#1A237E',                    // Deep Indigo/Navy Blue
    textSecondary: '#283593',                  // Medium Indigo/Navy Blue
    textDisabled: '#5C6BC0',                   // Light Indigo
    textHint: '#7986CB',                       // Medium-Light Indigo
    textIcon: '#283593',                       // Medium Indigo/Navy Blue
    textOnPrimary: '#FFFFFF',                  // White text on primary buttons
    textOnSecondary: '#FFFFFF',                // White text on secondary buttons
    textOnBackground: '#1A237E',               // Deep Indigo/Navy Blue
    textOnSurface: '#1A237E',                  // Deep Indigo/Navy Blue
    
    // Border & Divider Colors
    border: '#E0E0E0',
    borderLight: '#EEEEEE',
    borderDark: '#BDBDBD',
    divider: '#EEEEEE',
    outline: '#BDBDBD',
    outlineVariant: '#E0E0E0',
    
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
    
    // Action & State Colors
    actionActive: '#1A237E',                   // Deep Indigo
    actionHover: 'rgba(26, 35, 126, 0.04)',    // Indigo hover
    actionSelected: 'rgba(25, 118, 210, 0.08)',
    actionDisabled: 'rgba(26, 35, 126, 0.26)', // Indigo disabled
    actionDisabledBackground: 'rgba(26, 35, 126, 0.12)',
    actionFocus: 'rgba(25, 118, 210, 0.12)',
    
    hover: 'rgba(26, 35, 126, 0.04)',          // Indigo hover
    selected: 'rgba(25, 118, 210, 0.08)',
    focus: 'rgba(25, 118, 210, 0.12)',
    pressed: 'rgba(26, 35, 126, 0.1)',         // Indigo pressed
    dragged: 'rgba(26, 35, 126, 0.05)',        // Indigo dragged
    ripple: 'rgba(26, 35, 126, 0.1)',          // Indigo ripple
    
    // Input & Form Colors
    inputBackground: '#FFFFFF',
    inputBorder: '#BDBDBD',
    inputPlaceholder: '#5C6BC0',               // Light Indigo
    inputLabel: '#283593',                     // Medium Indigo/Navy Blue
    inputText: '#1A237E',                      // Deep Indigo/Navy Blue
    inputHelperText: '#283593',                // Medium Indigo/Navy Blue
    inputFilledBackground: 'rgba(26, 35, 126, 0.04)',
    inputOutlinedBorder: '#BDBDBD',
    inputStandardBorder: '#9E9E9E',
    
    // Button Colors
    buttonPrimary: '#1976D2',
    buttonSecondary: '#64B5F6',
    buttonDisabled: '#E0E0E0',
    buttonText: '#FFFFFF',
    buttonTextPrimary: '#1976D2',
    buttonTextSecondary: '#64B5F6',
    buttonTextDisabled: '#9E9E9E',
    buttonOutlinedBorder: 'rgba(25, 118, 210, 0.5)',
    
    // Chip Colors
    chipBackground: 'rgba(26, 35, 126, 0.08)',
    chipColor: '#1A237E',
    chipOutline: '#BDBDBD',
    chipSelected: 'rgba(25, 118, 210, 0.08)',
    
    // App Bar & Navigation
    appBarBackground: '#1976D2',
    appBarText: '#FFFFFF',
    navigationBackground: '#FFFFFF',
    navigationSelected: 'rgba(25, 118, 210, 0.08)',
    navigationIcon: '#283593',
    navigationText: '#1A237E',
    
    // Scrollbar
    scrollbarTrack: '#F5F5F5',
    scrollbarThumb: '#BDBDBD',
    scrollbarThumbHover: '#9E9E9E',
    
    // Overlay & Shadow
    backdrop: 'rgba(0, 0, 0, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(26, 35, 126, 0.1)',          // Indigo shadow
    elevation1: '0px 1px 3px rgba(26, 35, 126, 0.12), 0px 1px 2px rgba(26, 35, 126, 0.24)',
    elevation2: '0px 3px 6px rgba(26, 35, 126, 0.16), 0px 3px 6px rgba(26, 35, 126, 0.23)',
    elevation3: '0px 10px 20px rgba(26, 35, 126, 0.19), 0px 6px 6px rgba(26, 35, 126, 0.23)',
    elevation4: '0px 14px 28px rgba(26, 35, 126, 0.25), 0px 10px 10px rgba(26, 35, 126, 0.22)',
    
    // Skeleton & Loading
    skeleton: 'rgba(26, 35, 126, 0.11)',
    skeletonHighlight: 'rgba(26, 35, 126, 0.08)',
    
    // Chart & Data Visualization
    chartGrid: 'rgba(26, 35, 126, 0.12)',
    chartAxis: '#283593',
    chartTooltipBackground: 'rgba(97, 97, 97, 0.9)',
    chartTooltipText: '#FFFFFF',
    
    // Code & Syntax Highlighting
    codeBackground: '#F5F5F5',
    codeText: '#1A237E',
    codeComment: '#283593',
    codeKeyword: '#1976D2',
    codeString: '#388E3C',
    codeNumber: '#F57C00',
    codeFunction: '#7B1FA2',
    codeVariable: '#D32F2F',
    codeOperator: '#2196F3',
    codeTag: '#F44336',
    codeAttribute: '#4CAF50',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
    gradientSecondary: 'linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%)',
    gradientSuccess: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
    gradientWarning: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)',
    gradientError: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
    gradientIndigo: 'linear-gradient(135deg, #1A237E 0%, #283593 100%)',
    
    // Special Colors
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    
    // Additional Colors
    accent: '#FF4081',
    muted: '#5C6BC0',
    subtle: '#E8EAF6',
    emphasis: '#1976D2',
    link: '#1976D2',
    linkHover: '#0D47A1',
    visited: '#7B1FA2',
    focusRing: 'rgba(25, 118, 210, 0.4)',
  },
  
  // تھیم کی خصوصیات theme-config سے
  properties: {
    ...themeProperties,
    // لائٹ تھیم کے لیے مخصوص ترتیبات
    shadows: {
      ...themeProperties.shadows,
      button: '0px 3px 1px -2px rgba(26, 35, 126, 0.2), 0px 2px 2px 0px rgba(26, 35, 126, 0.14), 0px 1px 5px 0px rgba(26, 35, 126, 0.12)',
      card: '0px 2px 1px -1px rgba(26, 35, 126, 0.2), 0px 1px 1px 0px rgba(26, 35, 126, 0.14), 0px 1px 3px 0px rgba(26, 35, 126, 0.12)',
      dialog: '0px 11px 15px -7px rgba(26, 35, 126, 0.2), 0px 24px 38px 3px rgba(26, 35, 126, 0.14), 0px 9px 46px 8px rgba(26, 35, 126, 0.12)',
      floating: '0px 6px 12px rgba(26, 35, 126, 0.15)',
      depth: '0px 16px 32px rgba(26, 35, 126, 0.2)',
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
    /* Light Theme: ${this.name} */
    /* Description: ${this.description} */
    /* Auto-generated by theme system */
    
    :root[data-theme="${this.id}"],
    :root[data-theme-mode="light"],
    body.light-mode {
    `;
    
    // ویری ایبلز
    Object.entries(vars).forEach(([key, value]) => {
      css += `  ${key}: ${value};\n`;
    });
    
    css += `}\n\n`;
    
    // لائٹ تھیم کے لیے مخصوص اسٹائلز
    css += `
      /* === Light Theme Core Styles === */
      
      /* Base Body Styling */
      body[data-theme="${this.id}"],
      body.light-mode,
      body[data-theme-mode="light"] {
        color-scheme: light;
        background-color: var(--color-background) !important;
        color: var(--color-text-primary) !important;
      }
      
      /* Force indigo text colors in light mode */
      body.light-mode *:not(button):not(input):not(textarea):not(select):not(svg *):not(path),
      body[data-theme-mode="light"] *:not(button):not(input):not(textarea):not(select):not(svg *):not(path) {
        color: var(--color-text-primary) !important;
      }
      
      /* Headings */
      body.light-mode h1,
      body.light-mode h2,
      body.light-mode h3,
      body.light-mode h4,
      body.light-mode h5,
      body.light-mode h6,
      body[data-theme-mode="light"] h1,
      body[data-theme-mode="light"] h2,
      body[data-theme-mode="light"] h3,
      body[data-theme-mode="light"] h4,
      body[data-theme-mode="light"] h5,
      body[data-theme-mode="light"] h6 {
        color: var(--color-text-primary) !important;
      }
      
      /* Paragraphs and text elements */
      body.light-mode p,
      body.light-mode span,
      body.light-mode div,
      body.light-mode li,
      body.light-mode td,
      body.light-mode th,
      body[data-theme-mode="light"] p,
      body[data-theme-mode="light"] span,
      body[data-theme-mode="light"] div,
      body[data-theme-mode="light"] li,
      body[data-theme-mode="light"] td,
      body[data-theme-mode="light"] th {
        color: var(--color-text-secondary) !important;
      }
      
      /* Links */
      body.light-mode a,
      body[data-theme-mode="light"] a {
        color: var(--color-link) !important;
      }
      
      body.light-mode a:hover,
      body[data-theme-mode="light"] a:hover {
        color: var(--color-link-hover) !important;
      }
      
      /* Scrollbar Styling for Light Theme */
      body.light-mode ::-webkit-scrollbar,
      body[data-theme-mode="light"] ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      
      body.light-mode ::-webkit-scrollbar-track,
      body[data-theme-mode="light"] ::-webkit-scrollbar-track {
        background: var(--color-scrollbar-track);
      }
      
      body.light-mode ::-webkit-scrollbar-thumb,
      body[data-theme-mode="light"] ::-webkit-scrollbar-thumb {
        background: var(--color-scrollbar-thumb);
        border-radius: 6px;
        border: 2px solid var(--color-scrollbar-track);
      }
      
      body.light-mode ::-webkit-scrollbar-thumb:hover,
      body[data-theme-mode="light"] ::-webkit-scrollbar-thumb:hover {
        background: var(--color-scrollbar-thumb-hover);
      }
      
      /* Selection Styling */
      body.light-mode ::selection,
      body[data-theme-mode="light"] ::selection {
        background-color: var(--color-selected);
        color: var(--color-text-primary);
      }
      
      /* Focus Outline */
      body.light-mode :focus-visible,
      body[data-theme-mode="light"] :focus-visible {
        outline: 2px solid var(--color-focus-ring);
        outline-offset: 2px;
        border-radius: var(--border-radius-sm);
      }
      
      /* Disabled State */
      body.light-mode [disabled],
      body[data-theme-mode="light"] [disabled] {
        opacity: 0.6;
        cursor: not-allowed;
        color: var(--color-text-disabled) !important;
      }
      
      /* Code Block Styling */
      body.light-mode code,
      body.light-mode pre,
      body[data-theme-mode="light"] code,
      body[data-theme-mode="light"] pre {
        font-family: var(--typography-font-family-mono);
        background-color: var(--color-code-background) !important;
        color: var(--color-code-text) !important;
        border: 1px solid var(--color-border);
      }
      
      body.light-mode pre,
      body[data-theme-mode="light"] pre {
        padding: var(--spacing-md);
        overflow-x: auto;
        border-radius: var(--border-radius-md);
      }
      
      /* Table Styling */
      body.light-mode table,
      body[data-theme-mode="light"] table {
        border-collapse: collapse;
        width: 100%;
        color: var(--color-text-primary) !important;
      }
      
      body.light-mode th,
      body.light-mode td,
      body[data-theme-mode="light"] th,
      body[data-theme-mode="light"] td {
        border: 1px solid var(--color-border);
        padding: var(--spacing-sm);
        text-align: left;
        color: var(--color-text-primary) !important;
      }
      
      body.light-mode th,
      body[data-theme-mode="light"] th {
        background-color: var(--color-surface) !important;
        font-weight: var(--typography-font-weight-medium);
        color: var(--color-text-primary) !important;
      }
      
      body.light-mode tr:hover,
      body[data-theme-mode="light"] tr:hover {
        background-color: var(--color-hover) !important;
      }
      
      /* Form Elements Enhancement */
      body.light-mode input,
      body.light-mode textarea,
      body.light-mode select,
      body[data-theme-mode="light"] input,
      body[data-theme-mode="light"] textarea,
      body[data-theme-mode="light"] select {
        background-color: var(--color-input-background) !important;
        border-color: var(--color-input-border) !important;
        color: var(--color-input-text) !important;
      }
      
      body.light-mode input::placeholder,
      body.light-mode textarea::placeholder,
      body[data-theme-mode="light"] input::placeholder,
      body[data-theme-mode="light"] textarea::placeholder {
        color: var(--color-input-placeholder) !important;
      }
      
      /* Card Styling */
      body.light-mode .card,
      body.light-mode .panel,
      body.light-mode .modal,
      body[data-theme-mode="light"] .card,
      body[data-theme-mode="light"] .panel,
      body[data-theme-mode="light"] .modal {
        background-color: var(--color-surface) !important;
        border: 1px solid var(--color-border) !important;
        color: var(--color-text-primary) !important;
        box-shadow: var(--shadows-card);
      }
      
      /* Button Styling */
      body.light-mode button,
      body[data-theme-mode="light"] button {
        color: var(--color-button-text) !important;
      }
      
      body.light-mode button:disabled,
      body[data-theme-mode="light"] button:disabled {
        background-color: var(--color-button-disabled) !important;
        color: var(--color-button-text-disabled) !important;
      }
      
      /* Loading Spinner */
      body.light-mode .spinner,
      body[data-theme-mode="light"] .spinner {
        border-color: var(--color-primary) transparent transparent transparent;
      }
      
      /* Accessibility Enhancement for Light Theme */
      @media (prefers-contrast: high) {
        body.light-mode,
        body[data-theme-mode="light"] {
          --color-text-primary: #1A237E;
          --color-text-secondary: #283593;
          --color-border: #1A237E;
          --color-divider: #1A237E;
        }
      }
      
      /* Reduced Motion Support */
      @media (prefers-reduced-motion: reduce) {
        body.light-mode *,
        body[data-theme-mode="light"] * {
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
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
    
    return this;
  },
};

/**
 * لائٹ تھیم کے مختلف ورژنز
 */
export const lightThemeVariants = {
  // High Contrast Light Theme
  highContrast: {
    ...lightTheme,
    id: 'light-high-contrast',
    name: 'High Contrast Light',
    description: 'Light theme with enhanced contrast for better accessibility',
    type: 'accessibility',
    colors: {
      ...lightTheme.colors,
      textPrimary: '#1A237E',          // Solid Deep Indigo
      textSecondary: '#283593',        // Solid Medium Indigo
      border: '#1A237E',               // Solid Deep Indigo
      divider: '#1A237E',              // Solid Deep Indigo
      background: '#FFFFFF',
      surface: '#F8F8F8',
      inputBorder: '#1A237E',
      focusRing: '#1A237E',
    },
  },
  
  // Warm Light Theme
  warm: {
    ...lightTheme,
    id: 'light-warm',
    name: 'Warm Light',
    description: 'Light theme with warm, yellowish tones',
    type: 'colorful',
    colors: {
      ...lightTheme.colors,
      background: '#FFFBF0',
      surface: '#F5F1E6',
      cardBackground: '#FFFFFF',
      border: '#D8D2C3',
      divider: '#E8E4D9',
      scrollbarTrack: '#F5F1E6',
      // Text colors remain indigo/navy blue
      textPrimary: '#1A237E',
      textSecondary: '#283593',
    },
  },
  
  // Cool Light Theme
  cool: {
    ...lightTheme,
    id: 'light-cool',
    name: 'Cool Light',
    description: 'Light theme with cool, bluish tones',
    type: 'colorful',
    colors: {
      ...lightTheme.colors,
      background: '#F8FAFF',
      surface: '#F0F4FF',
      cardBackground: '#FFFFFF',
      border: '#C5CAE9',
      divider: '#E8EAF6',
      scrollbarTrack: '#F0F4FF',
      // Text colors remain indigo/navy blue
      textPrimary: '#1A237E',
      textSecondary: '#283593',
    },
  },
  
  // Sepia Light Theme
  sepia: {
    ...lightTheme,
    id: 'light-sepia',
    name: 'Sepia Light',
    description: 'Light theme with sepia tones for reading comfort',
    type: 'colorful',
    colors: {
      ...lightTheme.colors,
      background: '#F8F0E3',
      surface: '#F0E6D6',
      cardBackground: '#FFFFFF',
      border: '#D7CCC8',
      divider: '#E8E0D0',
      scrollbarTrack: '#F0E6D6',
      // Text colors remain indigo/navy blue
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      inputBackground: '#FFFFFF',
      codeBackground: '#F0E6D6',
    },
  },
  
  // Indigo Light Theme
  indigo: {
    ...lightTheme,
    id: 'light-indigo',
    name: 'Indigo Light',
    description: 'Light theme with indigo accent colors throughout',
    type: 'colorful',
    colors: {
      ...lightTheme.colors,
      primary: '#3F51B5',
      primaryLight: '#C5CAE9',
      primaryDark: '#303F9F',
      secondary: '#7986CB',
      secondaryLight: '#E8EAF6',
      secondaryDark: '#5C6BC0',
      background: '#F8F9FF',
      surface: '#F0F2FF',
      border: '#C5CAE9',
      divider: '#E8EAF6',
      // Text colors in various indigo shades
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      textHint: '#5C6BC0',
      textIcon: '#3F51B5',
      link: '#3F51B5',
      linkHover: '#303F9F',
    },
  },
  
  // Blue Light Theme
  blue: {
    ...lightTheme,
    id: 'light-blue-variant',
    name: 'Blue Light',
    description: 'Light theme with blue accent colors',
    type: 'colorful',
    colors: {
      ...lightTheme.colors,
      primary: '#2196F3',
      primaryLight: '#BBDEFB',
      primaryDark: '#1976D2',
      secondary: '#64B5F6',
      background: '#F5FBFF',
      surface: '#E8F4FF',
      border: '#BBDEFB',
      divider: '#E3F2FD',
      // Text colors remain indigo/navy blue
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      link: '#2196F3',
      linkHover: '#1976D2',
    },
  },
  
  // Green Light Theme
  green: {
    ...lightTheme,
    id: 'light-green-variant',
    name: 'Green Light',
    description: 'Light theme with green accent colors',
    type: 'colorful',
    colors: {
      ...lightTheme.colors,
      primary: '#4CAF50',
      primaryLight: '#C8E6C9',
      primaryDark: '#388E3C',
      secondary: '#81C784',
      success: '#4CAF50',
      background: '#F8FFF8',
      surface: '#F1F8F1',
      border: '#C8E6C9',
      divider: '#E8F5E9',
      // Text colors remain indigo/navy blue
      textPrimary: '#1A237E',
      textSecondary: '#283593',
      link: '#4CAF50',
      linkHover: '#388E3C',
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
    return theme.apply();
  }
  return null;
};

/**
 * لائٹ تھیم مینیجر کلاس
 */
export class LightThemeManager {
  constructor() {
    this.currentTheme = lightTheme;
    this.isInitialized = false;
  }
  
  init() {
    if (this.isInitialized) return;
    
    // آٹو ڈیٹیکٹ تھیم
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (!prefersDark && (prefersLight || !prefersDark)) {
        // Check localStorage for saved theme
        const savedTheme = localStorage.getItem('currentTheme');
        if (savedTheme) {
          try {
            const theme = JSON.parse(savedTheme);
            if (theme.mode === 'light') {
              const lightTheme = getLightThemeById(theme.id);
              this.switchTheme(lightTheme.id);
            }
          } catch (e) {
            console.warn('Failed to parse saved theme:', e);
            applyLightTheme();
          }
        } else {
          applyLightTheme();
        }
      }
    }
    
    this.isInitialized = true;
    return this;
  }
  
  switchTheme(themeId) {
    const theme = getLightThemeById(themeId);
    if (theme) {
      this.currentTheme = theme;
      applyLightTheme(theme);
      
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
    return getAllLightThemes();
  }
  
  getThemesByType(type) {
    return getAllLightThemes().filter(theme => theme.type === type);
  }
}

/**
 * گلوبل تھیم مینیجر
 */
export const lightThemeManager = new LightThemeManager();

/**
 * ڈیفالٹ لائٹ تھیم ایکسپورٹ
 */
export default lightTheme;