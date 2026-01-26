// src/utils/themeUtils.jsx

/**
 * Apply theme colors to DOM using CSS variables
 * @param {Object} theme - Theme object containing colors
 */
export const applyThemeToDOM = (theme) => {
  if (!theme || !theme.colors) {
    console.error('Invalid theme object');
    return;
  }

  const root = document.documentElement;
  const { colors } = theme;

  // Apply all color variables to :root
  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case for CSS variables
    const cssVariableName = `--color-${camelToKebab(key)}`;
    root.style.setProperty(cssVariableName, value);
  });

  // Add theme mode class to body
  document.body.classList.remove('light-mode', 'dark-mode');
  document.body.classList.add(`${theme.mode}-mode`);

  // Store theme ID in data attribute
  document.body.setAttribute('data-theme', theme.id);
};

/**
 * Convert camelCase to kebab-case
 * @param {string} str - camelCase string
 * @returns {string} kebab-case string
 */
export const camelToKebab = (str) => {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 * @param {string} str - kebab-case string
 * @returns {string} camelCase string
 */
export const kebabToCamel = (str) => {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};

/**
 * Get current theme from DOM
 * @returns {string} Current theme ID
 */
export const getCurrentThemeFromDOM = () => {
  return document.body.getAttribute('data-theme') || 'light-default';
};

/**
 * Get CSS variable value
 * @param {string} variableName - CSS variable name (with or without --)
 * @returns {string} Variable value
 */
export const getCSSVariable = (variableName) => {
  const root = document.documentElement;
  const name = variableName.startsWith('--') ? variableName : `--${variableName}`;
  return getComputedStyle(root).getPropertyValue(name).trim();
};

/**
 * Set CSS variable value
 * @param {string} variableName - CSS variable name (with or without --)
 * @param {string} value - Variable value
 */
export const setCSSVariable = (variableName, value) => {
  const root = document.documentElement;
  const name = variableName.startsWith('--') ? variableName : `--${variableName}`;
  root.style.setProperty(name, value);
};

/**
 * Check if color is light or dark
 * @param {string} color - Hex color code
 * @returns {string} 'light' or 'dark'
 */
export const getColorBrightness = (color) => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? 'light' : 'dark';
};

/**
 * Generate contrasting text color based on background
 * @param {string} backgroundColor - Background color hex code
 * @returns {string} Text color (black or white)
 */
export const getContrastingTextColor = (backgroundColor) => {
  const brightness = getColorBrightness(backgroundColor);
  return brightness === 'light' ? '#000000' : '#FFFFFF';
};

/**
 * Lighten a color by a percentage
 * @param {string} color - Hex color code
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export const lightenColor = (color, percent) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

/**
 * Darken a color by a percentage
 * @param {string} color - Hex color code
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened hex color
 */
export const darkenColor = (color, percent) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
  const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
  const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

/**
 * Convert hex to RGB
 * @param {string} hex - Hex color code
 * @returns {Object} RGB object {r, g, b}
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Convert RGB to hex
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color code
 */
export const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Generate color palette from base color
 * @param {string} baseColor - Base hex color
 * @returns {Object} Color palette with light and dark variants
 */
export const generateColorPalette = (baseColor) => {
  return {
    main: baseColor,
    light: lightenColor(baseColor, 30),
    lighter: lightenColor(baseColor, 50),
    dark: darkenColor(baseColor, 20),
    darker: darkenColor(baseColor, 40),
  };
};

/**
 * Validate hex color
 * @param {string} color - Color to validate
 * @returns {boolean} Is valid hex color
 */
export const isValidHexColor = (color) => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Get all theme color variables from DOM
 * @returns {Object} Object containing all theme color variables
 */
export const getAllThemeColors = () => {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const colors = {};

  // Get all CSS variables that start with --color-
  Array.from(document.styleSheets).forEach(styleSheet => {
    try {
      Array.from(styleSheet.cssRules).forEach(rule => {
        if (rule.style) {
          Array.from(rule.style).forEach(property => {
            if (property.startsWith('--color-')) {
              colors[property] = styles.getPropertyValue(property).trim();
            }
          });
        }
      });
    } catch (e) {
      // Skip external stylesheets
    }
  });

  return colors;
};

export default {
  applyThemeToDOM,
  camelToKebab,
  kebabToCamel,
  getCurrentThemeFromDOM,
  getCSSVariable,
  setCSSVariable,
  getColorBrightness,
  getContrastingTextColor,
  lightenColor,
  darkenColor,
  hexToRgb,
  rgbToHex,
  generateColorPalette,
  isValidHexColor,
  getAllThemeColors,
};