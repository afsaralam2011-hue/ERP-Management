// src/styles/themes/custom-themes.jsx

import { themeProperties, themeModes, generateColorPalette } from './theme-config';
import { 
  lightenColor, 
  darkenColor, 
  getContrastingTextColor,
  hexToRgb,
  rgbToHex,
  isValidHexColor,
  calculateColorContrast
} from '../../utils/themeUtils';

/**
 * کسٹم تھیمز مینجمنٹ اور یوٹیلیٹی فنکشنز
 * یہ فائل کسٹم تھیمز کو تخلیق، مینج اور سٹور کرنے کے فنکشنز فراہم کرتی ہے
 */

// === کانسٹنٹس ===
export const CUSTOM_THEMES_KEY = 'erp_custom_themes_v2';
export const CUSTOM_THEMES_VERSION = '2.0.0';
export const MAX_CUSTOM_THEMES = 50;

// === بنیادی تھیم ڈھانچہ ===

/**
 * کسٹم تھیم کی تخلیق کے لیے بنیادی ڈھانچہ
 */
export const createBaseThemeStructure = () => ({
  id: '',
  name: '',
  description: '',
  mode: themeModes.LIGHT,
  category: 'custom',
  version: CUSTOM_THEMES_VERSION,
  isCustom: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user',
  tags: [],
  colors: {},
  properties: {
    ...themeProperties
  }
});

/**
 * تھیم کے لیے درکار بنیادی رنگوں کا سیٹ - BLACK سے INDIGO/NAVY میں تبدیل
 */
export const requiredColors = {
  primary: '#1976D2',
  primaryLight: '#BBDEFB',
  primaryDark: '#0D47A1',
  secondary: '#DC004E',
  secondaryLight: '#F8BBD0',
  secondaryDark: '#C2185B',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: 'rgba(26, 35, 126, 0.87)',        // INDIGO/NAVY
  textSecondary: 'rgba(40, 53, 147, 0.6)',       // INDIGO/NAVY
  textDisabled: 'rgba(40, 53, 147, 0.38)',       // INDIGO/NAVY
  border: 'rgba(26, 35, 126, 0.12)',             // INDIGO/NAVY
  divider: 'rgba(26, 35, 126, 0.12)',            // INDIGO/NAVY
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  hover: 'rgba(26, 35, 126, 0.04)',              // INDIGO/NAVY
  selected: 'rgba(25, 118, 210, 0.08)',
  focus: 'rgba(25, 118, 210, 0.12)'
};

/**
 * ڈارک موڈ کے لیے رنگوں کا ڈیفالٹ سیٹ - WHITE سے INDIGO میں تبدیل
 */
export const darkModeDefaults = {
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: 'rgba(121, 134, 203, 0.87)',      // Light INDIGO
  textSecondary: 'rgba(159, 168, 218, 0.6)',     // Lighter INDIGO
  textDisabled: 'rgba(159, 168, 218, 0.38)',     // Lighter INDIGO
  border: 'rgba(121, 134, 203, 0.12)',           // INDIGO
  divider: 'rgba(121, 134, 203, 0.12)',          // INDIGO
  hover: 'rgba(121, 134, 203, 0.08)',            // INDIGO
  selected: 'rgba(144, 202, 249, 0.16)',
  focus: 'rgba(144, 202, 249, 0.12)'
};

// === کسٹم تھیم مینجمنٹ ===

/**
 * localStorage سے تمام کسٹم تھیمز حاصل کریں
 * @returns {Array} تمام کسٹم تھیمز
 */
export const getCustomThemes = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_THEMES_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Version check and migration if needed
    if (!parsed.version || parsed.version !== CUSTOM_THEMES_VERSION) {
      return migrateThemes(parsed);
    }
    
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading custom themes:', error);
    return [];
  }
};

/**
 localStorage میں تمام کسٹم تھیمز سیو کریں
 * @param {Array} themes - کسٹم تھیمز کی Array
 * @returns {boolean} کامیابی کی صورت میں true
 */
export const saveCustomThemes = (themes) => {
  try {
    // Limit the number of custom themes
    const limitedThemes = themes.slice(0, MAX_CUSTOM_THEMES);
    
    const data = {
      themes: limitedThemes,
      version: CUSTOM_THEMES_VERSION,
      lastUpdated: new Date().toISOString(),
      count: limitedThemes.length
    };
    
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving custom themes:', error);
    return false;
  }
};

/**
 * ایک کسٹم تھیم سیو کریں
 * @param {Object} theme - سیو کرنے کے لیے تھیم
 * @returns {Object|null} سیو شدہ تھیم یا null
 */
export const saveCustomTheme = (theme) => {
  try {
    if (!isValidTheme(theme)) {
      throw new Error('Invalid theme structure');
    }
    
    const customThemes = getCustomThemes();
    const existingIndex = customThemes.findIndex(t => t.id === theme.id);
    
    // تازہ ترین تاریخ سیٹ کریں
    theme.updatedAt = new Date().toISOString();
    
    if (existingIndex !== -1) {
      // Update existing theme
      customThemes[existingIndex] = theme;
    } else {
      // Add new theme
      if (customThemes.length >= MAX_CUSTOM_THEMES) {
        // Remove oldest theme if limit reached
        customThemes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        customThemes.shift();
      }
      
      theme.createdAt = new Date().toISOString();
      customThemes.push(theme);
    }
    
    saveCustomThemes(customThemes);
    return theme;
  } catch (error) {
    console.error('Error saving custom theme:', error);
    return null;
  }
};

/**
 * کسٹم تھیم ڈیلیٹ کریں
 * @param {string} themeId - تھیم ID
 * @returns {boolean} کامیابی کی صورت میں true
 */
export const deleteCustomTheme = (themeId) => {
  try {
    const customThemes = getCustomThemes();
    const filtered = customThemes.filter(t => t.id !== themeId);
    
    if (filtered.length === customThemes.length) {
      // Theme not found
      return false;
    }
    
    saveCustomThemes(filtered);
    return true;
  } catch (error) {
    console.error('Error deleting custom theme:', error);
    return false;
  }
};

/**
 * تھیم ID سے کسٹم تھیم تلاش کریں
 * @param {string} themeId - تھیم ID
 * @returns {Object|null} تھیم یا null
 */
export const getCustomThemeById = (themeId) => {
  const customThemes = getCustomThemes();
  return customThemes.find(t => t.id === themeId) || null;
};

/**
 * تھیم کو ڈیوپلیکیٹ کریں
 * @param {Object} theme - ڈیوپلیکیٹ کرنے کے لیے تھیم
 * @param {string} newName - نیا نام
 * @returns {Object|null} ڈیوپلیکیٹ شدہ تھیم
 */
export const duplicateCustomTheme = (theme, newName = `${theme.name} (Copy)`) => {
  try {
    const newTheme = {
      ...theme,
      id: generateThemeId(),
      name: newName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return saveCustomTheme(newTheme);
  } catch (error) {
    console.error('Error duplicating theme:', error);
    return null;
  }
};

// === تھیم تخلیق ===

/**
 * نئی کسٹم تھیم تخلیق کریں
 * @param {string} name - تھیم کا نام
 * @param {Object} colors - تھیم کے رنگ
 * @param {string} mode - تھیم موڈ ('light' یا 'dark')
 * @param {string} description - تھیم کی تفصیل
 * @returns {Object} تخلیق شدہ تھیم
 */
export const createCustomTheme = (name, colors, mode = themeModes.LIGHT, description = '') => {
  const baseTheme = createBaseThemeStructure();
  
  // Validate mode
  const validMode = mode === themeModes.DARK ? themeModes.DARK : themeModes.LIGHT;
  
  // Generate theme ID
  const themeId = generateThemeId();
  
  // Process colors
  const processedColors = processThemeColors(colors, validMode);
  
  // Calculate contrast ratios
  const contrastRatios = calculateThemeContrast(processedColors);
  
  // Create theme object
  const theme = {
    ...baseTheme,
    id: themeId,
    name: name.trim() || `Custom ${validMode} Theme`,
    description: description.trim(),
    mode: validMode,
    colors: processedColors,
    metadata: {
      contrastRatios,
      accessibilityScore: calculateAccessibilityScore(contrastRatios),
      colorHarmony: checkColorHarmony(processedColors),
      brightness: getThemeBrightness(processedColors, validMode)
    }
  };
  
  return theme;
};

/**
 * تھیم کے رنگوں کو پروسیس کریں
 * @param {Object} colors - ان پٹ رنگ
 * @param {string} mode - تھیم موڈ
 * @returns {Object} پروسیسڈ رنگ
 */
const processThemeColors = (colors, mode) => {
  const baseColors = mode === themeModes.DARK 
    ? { ...requiredColors, ...darkModeDefaults }
    : requiredColors;
  
  const processed = { ...baseColors };
  
  // Apply user colors
  Object.keys(colors).forEach(key => {
    if (colors[key] && isValidHexColor(colors[key])) {
      processed[key] = colors[key];
    }
  });
  
  // Generate derived colors
  if (processed.primary && !processed.primaryLight) {
    processed.primaryLight = lightenColor(processed.primary, 30);
  }
  
  if (processed.primary && !processed.primaryDark) {
    processed.primaryDark = darkenColor(processed.primary, 20);
  }
  
  if (processed.secondary && !processed.secondaryLight) {
    processed.secondaryLight = lightenColor(processed.secondary, 30);
  }
  
  if (processed.secondary && !processed.secondaryDark) {
    processed.secondaryDark = darkenColor(processed.secondary, 20);
  }
  
  // Ensure text colors have proper contrast
  if (processed.background && !processed.textPrimary) {
    processed.textPrimary = getContrastingTextColor(processed.background);
  }
  
  if (processed.background && !processed.textSecondary) {
    const brightness = getColorBrightness(processed.background);
    // INDIGO/NAVY based text colors
    processed.textSecondary = brightness === 'light' 
      ? 'rgba(40, 53, 147, 0.6)'     // INDIGO/NAVY for light mode
      : 'rgba(159, 168, 218, 0.6)';  // Lighter INDIGO for dark mode
  }
  
  return processed;
};

// === تھیم تصدیق ===

/**
 * تھیم کی ساخت کی تصدیق کریں
 * @param {Object} theme - تصدیق کے لیے تھیم
 * @returns {boolean} درست ہونے پر true
 */
export const isValidTheme = (theme) => {
  if (!theme || typeof theme !== 'object') {
    console.warn('Theme is not an object');
    return false;
  }
  
  // Check required fields
  const requiredFields = ['id', 'name', 'mode', 'colors', 'isCustom'];
  for (const field of requiredFields) {
    if (!(field in theme)) {
      console.warn(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Check mode
  if (theme.mode !== themeModes.LIGHT && theme.mode !== themeModes.DARK) {
    console.warn(`Invalid mode: ${theme.mode}`);
    return false;
  }
  
  // Check colors
  if (!theme.colors || typeof theme.colors !== 'object') {
    console.warn('Colors field is invalid');
    return false;
  }
  
  const requiredColors = ['primary', 'background', 'textPrimary'];
  for (const color of requiredColors) {
    if (!theme.colors[color] || !isValidHexColor(theme.colors[color])) {
      console.warn(`Missing or invalid color: ${color}`);
      return false;
    }
  }
  
  return true;
};

/**
 * تھیم کا کنٹراسٹ ریٹیو حساب کریں
 * @param {Object} colors - تھیم کے رنگ
 * @returns {Object} کنٹراسٹ ریٹیوز
 */
const calculateThemeContrast = (colors) => {
  const ratios = {};
  
  // Primary text contrast
  if (colors.primary && colors.textPrimary) {
    ratios.primaryText = calculateColorContrast(colors.primary, colors.textPrimary);
  }
  
  // Background text contrast
  if (colors.background && colors.textPrimary) {
    ratios.backgroundText = calculateColorContrast(colors.background, colors.textPrimary);
  }
  
  // Success contrast
  if (colors.success && colors.textPrimary) {
    ratios.successText = calculateColorContrast(colors.success, colors.textPrimary);
  }
  
  // Error contrast
  if (colors.error && colors.textPrimary) {
    ratios.errorText = calculateColorContrast(colors.error, colors.textPrimary);
  }
  
  // Warning contrast
  if (colors.warning && colors.textPrimary) {
    ratios.warningText = calculateColorContrast(colors.warning, colors.textPrimary);
  }
  
  return ratios;
};

/**
 * تھیم کی رسائی کا سکور حساب کریں
 * @param {Object} contrastRatios - کنٹراسٹ ریٹیوز
 * @returns {number} رسائی کا سکور (0-100)
 */
const calculateAccessibilityScore = (contrastRatios) => {
  if (!contrastRatios || Object.keys(contrastRatios).length === 0) {
    return 0;
  }
  
  let score = 0;
  let total = 0;
  
  Object.values(contrastRatios).forEach(ratio => {
    total++;
    
    if (ratio >= 7) {
      score += 100; // AAA
    } else if (ratio >= 4.5) {
      score += 80; // AA
    } else if (ratio >= 3) {
      score += 50; // AA Large
    } else {
      score += 20; // Fail
    }
  });
  
  return Math.round(score / total);
};

/**
 * رنگوں کی ہارمونی چیک کریں
 * @param {Object} colors - تھیم کے رنگ
 * @returns {string} ہارمونی کی کیفیت
 */
const checkColorHarmony = (colors) => {
  if (!colors.primary || !colors.secondary) {
    return 'unknown';
  }
  
  const primaryHSL = hexToHSL(colors.primary);
  const secondaryHSL = hexToHSL(colors.secondary);
  
  // Check hue difference
  const hueDiff = Math.abs(primaryHSL.h - secondaryHSL.h);
  
  if (hueDiff < 30) {
    return 'monochromatic';
  } else if (hueDiff < 90) {
    return 'analogous';
  } else if (hueDiff < 150) {
    return 'complementary';
  } else {
    return 'contrasting';
  }
};

/**
 * تھیم کی برائٹنیس کا تعین کریں
 * @param {Object} colors - تھیم کے رنگ
 * @param {string} mode - تھیم موڈ
 * @returns {string} 'light', 'dark', یا 'balanced'
 */
const getThemeBrightness = (colors, mode) => {
  if (mode === themeModes.DARK) {
    return 'dark';
  }
  
  const bgBrightness = getColorBrightness(colors.background);
  const primaryBrightness = getColorBrightness(colors.primary);
  
  if (bgBrightness === 'light' && primaryBrightness === 'light') {
    return 'light';
  } else if (bgBrightness === 'dark' && primaryBrightness === 'dark') {
    return 'dark';
  } else {
    return 'balanced';
  }
};

// === یوٹیلیٹی فنکشنز ===

/**
 * تھیم ID جنریٹ کریں
 * @returns {string} منفرد تھیم ID
 */
export const generateThemeId = () => {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * رنگ کی برائٹنیس کا تعین کریں
 * @param {string} color - ہیکس رنگ
 * @returns {string} 'light' یا 'dark'
 */
const getColorBrightness = (color) => {
  try {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate brightness using YIQ formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 155 ? 'light' : 'dark';
  } catch (error) {
    console.warn('Error calculating color brightness:', error);
    return 'light';
  }
};

/**
 * ہیکس کو HSL میں تبدیل کریں
 * @param {string} hex - ہیکس رنگ
 * @returns {Object} HSL ویلیوز {h, s, l}
 */
const hexToHSL = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

/**
 * پرانے ورژن کے تھیمز کو نئے فارمیٹ میں تبدیل کریں
 * @param {Array|Object} oldThemes - پرانے تھیمز
 * @returns {Array} مائگریٹ شدہ تھیمز
 */
const migrateThemes = (oldThemes) => {
  try {
    let themesArray = [];
    
    if (Array.isArray(oldThemes)) {
      themesArray = oldThemes;
    } else if (oldThemes.themes && Array.isArray(oldThemes.themes)) {
      themesArray = oldThemes.themes;
    } else if (typeof oldThemes === 'object') {
      themesArray = [oldThemes];
    }
    
    const migratedThemes = themesArray.map(theme => {
      // Add missing fields for old themes
      const migrated = {
        ...theme,
        version: CUSTOM_THEMES_VERSION,
        category: theme.category || 'custom',
        description: theme.description || '',
        updatedAt: theme.updatedAt || new Date().toISOString(),
        createdBy: theme.createdBy || 'user',
        tags: theme.tags || [],
        metadata: theme.metadata || {
          contrastRatios: {},
          accessibilityScore: 0,
          colorHarmony: 'unknown',
          brightness: 'balanced'
        }
      };
      
      // Ensure colors object exists
      if (!migrated.colors || typeof migrated.colors !== 'object') {
        migrated.colors = { ...requiredColors };
      }
      
      return migrated;
    }).filter(isValidTheme);
    
    // Save migrated themes
    saveCustomThemes(migratedThemes);
    
    return migratedThemes;
  } catch (error) {
    console.error('Error migrating themes:', error);
    return [];
  }
};

// === تھیم ایکسپورٹ/امپورٹ ===

/**
 * تھیم کو JSON فائل کے طور پر ایکسپورٹ کریں
 * @param {Object} theme - ایکسپورٹ کرنے کے لیے تھیم
 * @param {string} fileName - فائل کا نام
 * @returns {boolean} کامیابی کی صورت میں true
 */
export const exportTheme = (theme, fileName = null) => {
  try {
    if (!isValidTheme(theme)) {
      throw new Error('Cannot export invalid theme');
    }
    
    const themeData = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `${theme.name.replace(/\s+/g, '-').toLowerCase()}-theme.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting theme:', error);
    return false;
  }
};

/**
 * تمام کسٹم تھیمز ایکسپورٹ کریں
 * @returns {boolean} کامیابی کی صورت میں true
 */
export const exportAllThemes = () => {
  try {
    const customThemes = getCustomThemes();
    
    if (customThemes.length === 0) {
      alert('No custom themes to export');
      return false;
    }
    
    const exportData = {
      themes: customThemes,
      version: CUSTOM_THEMES_VERSION,
      exportedAt: new Date().toISOString(),
      count: customThemes.length
    };
    
    const themeData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom-themes-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting all themes:', error);
    return false;
  }
};

/**
 * تھیم کو JSON فائل سے امپورٹ کریں
 * @param {File} file - امپورٹ کرنے کے لیے JSON فائل
 * @returns {Promise<Object|Array>} امپورٹ شدہ تھیم/تھیمز
 */
export const importTheme = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Check if it's a single theme or a collection
        if (data.themes && Array.isArray(data.themes)) {
          // It's a collection
          const importedThemes = data.themes.filter(isValidTheme).map(theme => {
            // Generate new ID for each theme to avoid conflicts
            return {
              ...theme,
              id: generateThemeId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          });
          
          // Save all imported themes
          const existingThemes = getCustomThemes();
          const allThemes = [...existingThemes, ...importedThemes];
          saveCustomThemes(allThemes);
          
          resolve({
            type: 'collection',
            themes: importedThemes,
            count: importedThemes.length
          });
        } else if (isValidTheme(data)) {
          // It's a single theme
          const importedTheme = {
            ...data,
            id: generateThemeId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Save the imported theme
          saveCustomTheme(importedTheme);
          
          resolve({
            type: 'single',
            theme: importedTheme
          });
        } else {
          reject(new Error('Invalid theme file format'));
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

/**
 * تھیم کو اپڈیٹ کریں
 * @param {string} themeId - تھیم ID
 * @param {Object} updates - اپڈیٹس
 * @returns {Object|null} اپڈیٹ شدہ تھیم
 */
export const updateCustomTheme = (themeId, updates) => {
  try {
    const theme = getCustomThemeById(themeId);
    if (!theme) return null;
    
    const updatedTheme = {
      ...theme,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return saveCustomTheme(updatedTheme);
  } catch (error) {
    console.error('Error updating theme:', error);
    return null;
  }
};

/**
 * کسٹم تھیمز کی تعداد حاصل کریں
 * @returns {Object} تھیمز کی تعداد کے اعداد و شمار
 */
export const getCustomThemesStats = () => {
  const customThemes = getCustomThemes();
  
  return {
    total: customThemes.length,
    light: customThemes.filter(t => t.mode === themeModes.LIGHT).length,
    dark: customThemes.filter(t => t.mode === themeModes.DARK).length,
    lastUpdated: customThemes.length > 0 
      ? new Date(Math.max(...customThemes.map(t => new Date(t.updatedAt))))
      : null
  };
};

/**
 * کسٹم تھیمز کو فلٹر کریں
 * @param {Object} filters - فلٹرز
 * @returns {Array} فلٹرڈ تھیمز
 */
export const filterCustomThemes = (filters = {}) => {
  const customThemes = getCustomThemes();
  
  return customThemes.filter(theme => {
    // Mode filter
    if (filters.mode && theme.mode !== filters.mode) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const nameMatch = theme.name.toLowerCase().includes(searchTerm);
      const descMatch = theme.description?.toLowerCase().includes(searchTerm);
      const tagMatch = theme.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
      
      if (!nameMatch && !descMatch && !tagMatch) {
        return false;
      }
    }
    
    // Category filter
    if (filters.category && theme.category !== filters.category) {
      return false;
    }
    
    // Date range filter
    if (filters.startDate || filters.endDate) {
      const themeDate = new Date(theme.createdAt);
      
      if (filters.startDate && themeDate < new Date(filters.startDate)) {
        return false;
      }
      
      if (filters.endDate && themeDate > new Date(filters.endDate)) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * ڈیفالٹ ایکسپورٹ
 */
export default {
  // Constants
  CUSTOM_THEMES_KEY,
  CUSTOM_THEMES_VERSION,
  MAX_CUSTOM_THEMES,
  
  // Theme management
  getCustomThemes,
  saveCustomThemes,
  saveCustomTheme,
  deleteCustomTheme,
  getCustomThemeById,
  duplicateCustomTheme,
  updateCustomTheme,
  
  // Theme creation
  createCustomTheme,
  createBaseThemeStructure,
  
  // Validation
  isValidTheme,
  
  // Import/Export
  exportTheme,
  exportAllThemes,
  importTheme,
  
  // Utilities
  generateThemeId,
  getCustomThemesStats,
  filterCustomThemes,
  
  // Constants exports
  requiredColors,
  darkModeDefaults,
  themeModes
};