// src/utils/themeUtils.jsx

/**
 * تھیم مینجمنٹ یوٹیلیٹی فنکشنز
 * یہ فائل تھیم سے متعلق تمام ہیلپر فنکشنز پر مشتمل ہے
 */

/**
 * DOM پر تھیم کے رنگوں کو CSS ویری ایبلز کے ذریعے اپلائی کریں
 * @param {Object} theme - تھیم آبجیکٹ جس میں colors پراپرٹی موجود ہو
 * @returns {boolean} اپلیکیشن کامیاب ہوئی یا نہیں
 */
export const applyThemeToDOM = (theme) => {
  if (!theme || !theme.colors) {
    console.error('Invalid theme object provided:', theme);
    return false;
  }

  try {
    const root = document.documentElement;
    const { colors, id, name, mode } = theme;
    
    console.log(`Applying theme: ${name} (${id}) - Mode: ${mode}`);

    // تمام رنگوں کو CSS ویری ایبلز کے طور پر :root پر اپلائی کریں
    Object.entries(colors).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        // camelCase کو kebab-case میں تبدیل کریں
        const cssVariableName = `--color-${camelToKebab(key)}`;
        root.style.setProperty(cssVariableName, value);
        
        // تھیم موڈ کے مطابق مخصوص ویری ایبلز بھی سیٹ کریں
        const modeVariableName = `--${mode}-${camelToKebab(key)}`;
        root.style.setProperty(modeVariableName, value);
      }
    });

    // تھیم موڈ کلاس body پر اپلائی کریں
    document.body.classList.remove('theme-light', 'theme-dark', 'light-mode', 'dark-mode');
    document.body.classList.add(`theme-${mode}`, `${mode}-mode`);

    // تھیم ID کو data attribute میں محفوظ کریں
    document.body.setAttribute('data-theme', id);
    document.body.setAttribute('data-theme-mode', mode);
    document.body.setAttribute('data-theme-name', name);

    // تھیم کی معلومات کو localStorage میں محفوظ کریں
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentTheme', JSON.stringify({
        id,
        name,
        mode,
        appliedAt: new Date().toISOString(),
        colors: Object.keys(colors).length,
      }));
    }

    // میٹا ٹیگ اپڈیٹ کریں
    updateThemeMetaTags(theme);

    console.log(`Theme ${name} applied successfully`);
    return true;
  } catch (error) {
    console.error('Error applying theme to DOM:', error);
    return false;
  }
};

/**
 * تھیم سے متعلق میٹا ٹیگز کو اپڈیٹ کریں
 * @param {Object} theme - تھیم آبجیکٹ
 */
export const updateThemeMetaTags = (theme) => {
  if (typeof document === 'undefined') return;

  const { colors } = theme;
  
  // theme-color میٹا ٹیگ کو اپڈیٹ کریں
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.name = 'theme-color';
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.content = colors.background || colors.surface || '#ffffff';

  // msapplication-navbutton-color (IE/Edge کے لیے)
  let msThemeColor = document.querySelector('meta[name="msapplication-navbutton-color"]');
  if (!msThemeColor) {
    msThemeColor = document.createElement('meta');
    msThemeColor.name = 'msapplication-navbutton-color';
    document.head.appendChild(msThemeColor);
  }
  msThemeColor.content = colors.background || colors.surface || '#ffffff';

  // apple-mobile-web-app-status-bar-style
  let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!appleStatusBar) {
    appleStatusBar = document.createElement('meta');
    appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
    document.head.appendChild(appleStatusBar);
  }
  appleStatusBar.content = theme.mode === 'dark' ? 'black-translucent' : 'default';
};

/**
 * camelCase کو kebab-case میں تبدیل کریں
 * @param {string} str - camelCase سٹرنگ
 * @returns {string} kebab-case سٹرنگ
 */
export const camelToKebab = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * kebab-case کو camelCase میں تبدیل کریں
 * @param {string} str - kebab-case سٹرنگ
 * @returns {string} camelCase سٹرنگ
 */
export const kebabToCamel = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * DOM سے موجودہ تھیم ID حاصل کریں
 * @returns {string} موجودہ تھیم ID
 */
export const getCurrentThemeFromDOM = () => {
  if (typeof document === 'undefined') return 'light-default';
  return document.body.getAttribute('data-theme') || 'light-default';
};

/**
 * DOM سے موجودہ تھیم موڈ حاصل کریں
 * @returns {string} 'light' یا 'dark'
 */
export const getCurrentThemeMode = () => {
  if (typeof document === 'undefined') return 'light';
  return document.body.getAttribute('data-theme-mode') || 'light';
};

/**
 * CSS ویری ایبل کی ویلیو حاصل کریں
 * @param {string} variableName - CSS ویری ایبل کا نام (-- کے ساتھ یا بغیر)
 * @param {HTMLElement} element - عنصر جس سے ویری ایبل حاصل کرنا ہے (ڈیفالٹ: documentElement)
 * @returns {string} ویری ایبل کی ویلیو
 */
export const getCSSVariable = (variableName, element = document.documentElement) => {
  if (typeof window === 'undefined' || !element) return '';
  const name = variableName.startsWith('--') ? variableName : `--${variableName}`;
  return getComputedStyle(element).getPropertyValue(name).trim();
};

/**
 * CSS ویری ایبل سیٹ کریں
 * @param {string} variableName - CSS ویری ایبل کا نام (-- کے ساتھ یا بغیر)
 * @param {string} value - ویری ایبل کی ویلیو
 * @param {HTMLElement} element - عنصر جس پر ویری ایبل سیٹ کرنا ہے (ڈیفالٹ: documentElement)
 */
export const setCSSVariable = (variableName, value, element = document.documentElement) => {
  if (typeof window === 'undefined' || !element) return;
  const name = variableName.startsWith('--') ? variableName : `--${variableName}`;
  element.style.setProperty(name, value);
};

/**
 * تھیم کا اندازہ لگائیں کہ رنگ ہلکا ہے یا گہرا
 * @param {string} color - ہیکس رنگ کا کوڈ
 * @returns {string} 'light' یا 'dark'
 */
export const getColorBrightness = (color) => {
  if (!color || typeof color !== 'string') return 'light';
  
  try {
    // # ہٹائیں اگر موجود ہو
    const hex = color.replace('#', '');
    
    // اگر مختصر فارمیٹ ہے تو مکمل کریں
    const fullHex = hex.length === 3 
      ? hex.split('').map(c => c + c).join('')
      : hex;
    
    // RGB میں تبدیل کریں
    const r = parseInt(fullHex.substr(0, 2), 16);
    const g = parseInt(fullHex.substr(2, 2), 16);
    const b = parseInt(fullHex.substr(4, 2), 16);
    
    // برائٹنیس کا حساب لگائیں (YIQ فارمولا)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 155 ? 'light' : 'dark';
  } catch (error) {
    console.warn('Error calculating color brightness:', error);
    return 'light';
  }
};

/**
 * بیک گراؤنڈ رنگ کی بنیاد پر کانٹراسٹنگ ٹیکسٹ رنگ پیدا کریں
 * @param {string} backgroundColor - بیک گراؤنڈ کا ہیکس رنگ
 * @returns {string} سفید یا کالا رنگ
 */
export const getContrastingTextColor = (backgroundColor) => {
  const brightness = getColorBrightness(backgroundColor);
  return brightness === 'light' 
    ? 'rgba(0, 0, 0, 0.87)'  // کالا (ہلکے بیک گراؤنڈ کے لیے)
    : 'rgba(255, 255, 255, 0.87)'; // سفید (گہرے بیک گراؤنڈ کے لیے)
};

/**
 * رنگ کو فیصد کے حساب سے ہلکا کریں
 * @param {string} color - ہیکس رنگ کا کوڈ
 * @param {number} percent - فیصد (0-100)
 * @returns {string} ہلکا کیا گیا ہیکس رنگ
 */
export const lightenColor = (color, percent) => {
  if (!color || percent <= 0) return color;
  
  try {
    const hex = color.replace('#', '');
    const fullHex = hex.length === 3 
      ? hex.split('').map(c => c + c).join('')
      : hex;
    
    const r = parseInt(fullHex.substr(0, 2), 16);
    const g = parseInt(fullHex.substr(2, 2), 16);
    const b = parseInt(fullHex.substr(4, 2), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  } catch (error) {
    console.warn('Error lightening color:', error);
    return color;
  }
};

/**
 * رنگ کو فیصد کے حساب سے گہرا کریں
 * @param {string} color - ہیکس رنگ کا کوڈ
 * @param {number} percent - فیصد (0-100)
 * @returns {string} گہرا کیا گیا ہیکس رنگ
 */
export const darkenColor = (color, percent) => {
  if (!color || percent <= 0) return color;
  
  try {
    const hex = color.replace('#', '');
    const fullHex = hex.length === 3 
      ? hex.split('').map(c => c + c).join('')
      : hex;
    
    const r = parseInt(fullHex.substr(0, 2), 16);
    const g = parseInt(fullHex.substr(2, 2), 16);
    const b = parseInt(fullHex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
    const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
    const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  } catch (error) {
    console.warn('Error darkening color:', error);
    return color;
  }
};

/**
 * ہیکس کو RGB میں تبدیل کریں
 * @param {string} hex - ہیکس رنگ کا کوڈ
 * @returns {Object} RGB آبجیکٹ {r, g, b} یا null
 */
export const hexToRgb = (hex) => {
  if (!hex) return null;
  
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result && hex.length === 4) {
      // مختصر ہیکس فارمیٹ کے لیے
      const shortHex = hex.replace('#', '');
      const r = parseInt(shortHex[0] + shortHex[0], 16);
      const g = parseInt(shortHex[1] + shortHex[1], 16);
      const b = parseInt(shortHex[2] + shortHex[2], 16);
      return { r, g, b };
    }
    
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  } catch (error) {
    console.warn('Error converting hex to RGB:', error);
    return null;
  }
};

/**
 * RGB کو ہیکس میں تبدیل کریں
 * @param {number} r - ریڈ ویلیو (0-255)
 * @param {number} g - گرین ویلیو (0-255)
 * @param {number} b - بلیو ویلیو (0-255)
 * @returns {string} ہیکس رنگ کا کوڈ
 */
export const rgbToHex = (r, g, b) => {
  const validR = Math.max(0, Math.min(255, Math.round(r)));
  const validG = Math.max(0, Math.min(255, Math.round(g)));
  const validB = Math.max(0, Math.min(255, Math.round(b)));
  
  return '#' + [validR, validG, validB].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * RGB کو RGBA میں تبدیل کریں
 * @param {string} rgb - RGB سٹرنگ
 * @param {number} alpha - الفا ویلیو (0-1)
 * @returns {string} RGBA سٹرنگ
 */
export const rgbToRgba = (rgb, alpha = 1) => {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
  }
  return rgb;
};

/**
 * بنیادی رنگ سے رنگوں کی پلیٹ تیار کریں
 * @param {string} baseColor - بنیادی ہیکس رنگ
 * @returns {Object} رنگوں کی پلیٹ جس میں ہلکے اور گہرے ورژن شامل ہوں
 */
export const generateColorPalette = (baseColor) => {
  if (!isValidHexColor(baseColor)) {
    return {
      main: baseColor,
      light: baseColor,
      lighter: baseColor,
      dark: baseColor,
      darker: baseColor,
      contrastText: getContrastingTextColor(baseColor),
    };
  }
  
  return {
    main: baseColor,
    light: lightenColor(baseColor, 30),
    lighter: lightenColor(baseColor, 50),
    lightest: lightenColor(baseColor, 70),
    dark: darkenColor(baseColor, 20),
    darker: darkenColor(baseColor, 40),
    darkest: darkenColor(baseColor, 60),
    alpha10: rgbToRgba(`rgb(${hexToRgb(baseColor).r}, ${hexToRgb(baseColor).g}, ${hexToRgb(baseColor).b})`, 0.1),
    alpha20: rgbToRgba(`rgb(${hexToRgb(baseColor).r}, ${hexToRgb(baseColor).g}, ${hexToRgb(baseColor).b})`, 0.2),
    alpha30: rgbToRgba(`rgb(${hexToRgb(baseColor).r}, ${hexToRgb(baseColor).g}, ${hexToRgb(baseColor).b})`, 0.3),
    contrastText: getContrastingTextColor(baseColor),
  };
};

/**
 * ہیکس رنگ کی تصدیق کریں
 * @param {string} color - تصدیق کے لیے رنگ
 * @returns {boolean} ہیکس رنگ درست ہے یا نہیں
 */
export const isValidHexColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(color);
};

/**
 * DOM سے تمام تھیم رنگ ویری ایبلز حاصل کریں
 * @returns {Object} تمام تھیم رنگ ویری ایبلز پر مشتمل آبجیکٹ
 */
export const getAllThemeColors = () => {
  if (typeof window === 'undefined') return {};
  
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const colors = {};

  // تمام CSS پراپرٹیز میں سے --color- سے شروع ہونے والی ویری ایبلز نکالیں
  for (let i = 0; i < styles.length; i++) {
    const property = styles[i];
    if (property.startsWith('--color-') || property.startsWith('--light-') || property.startsWith('--dark-')) {
      colors[property] = styles.getPropertyValue(property).trim();
    }
  }

  return colors;
};

/**
 * تھیم کے لیے رسپانسیو فونٹ سائز کا حساب لگائیں
 * @param {number} baseSize - بنیادی فونٹ سائز
 * @param {number} minSize - کم سے کم سائز
 * @param {number} maxSize - زیادہ سے زیادہ سائز
 * @param {number} minWidth - کم سے کم چوڑائی
 * @param {number} maxWidth - زیادہ سے زیادہ چوڑائی
 * @returns {string} CSS کلپ فنکشن
 */
export const responsiveFontSize = (baseSize = 16, minSize = 14, maxSize = 20, minWidth = 320, maxWidth = 1200) => {
  const minSizePx = minSize;
  const maxSizePx = maxSize;
  const minWidthPx = minWidth;
  const maxWidthPx = maxWidth;
  
  return `clamp(${minSizePx}px, calc(${minSizePx}px + (${maxSizePx} - ${minSizePx}) * ((100vw - ${minWidthPx}px) / (${maxWidthPx} - ${minWidthPx}))), ${maxSizePx}px)`;
};

/**
 * رنگوں کی یکسانیت کا حساب لگائیں
 * @param {string} color1 - پہلا رنگ
 * @param {string} color2 - دوسرا رنگ
 * @returns {number} یکسانیت کا سکور (0-1)
 */
export const calculateColorContrast = (color1, color2) => {
  try {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    // Relative luminance calculation
    const luminance1 = (0.2126 * rgb1.r + 0.7152 * rgb1.g + 0.0722 * rgb1.b) / 255;
    const luminance2 = (0.2126 * rgb2.r + 0.7152 * rgb2.g + 0.0722 * rgb2.b) / 255;
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    const contrast = (lighter + 0.05) / (darker + 0.05);
    
    return Math.min(contrast, 21); // Max contrast is 21:1
  } catch (error) {
    console.warn('Error calculating color contrast:', error);
    return 0;
  }
};

/**
 * تھیم کو localStorage میں محفوظ کریں
 * @param {Object} theme - تھیم آبجیکٹ
 * @param {string} key - محفوظ کرنے کی کلید (ڈیفالٹ: 'customThemes')
 * @returns {boolean} کامیابی کی صورت میں true
 */
export const saveThemeToStorage = (theme, key = 'customThemes') => {
  if (typeof localStorage === 'undefined') return false;
  
  try {
    const existingThemes = JSON.parse(localStorage.getItem(key) || '[]');
    const existingIndex = existingThemes.findIndex(t => t.id === theme.id);
    
    if (existingIndex >= 0) {
      existingThemes[existingIndex] = theme;
    } else {
      existingThemes.push({
        ...theme,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(key, JSON.stringify(existingThemes));
    return true;
  } catch (error) {
    console.error('Error saving theme to storage:', error);
    return false;
  }
};

/**
 * localStorage سے تھیم حاصل کریں
 * @param {string} themeId - تھیم ID
 * @param {string} key - کلید (ڈیفالٹ: 'customThemes')
 * @returns {Object|null} تھیم آبجیکٹ یا null
 */
export const getThemeFromStorage = (themeId, key = 'customThemes') => {
  if (typeof localStorage === 'undefined') return null;
  
  try {
    const themes = JSON.parse(localStorage.getItem(key) || '[]');
    return themes.find(theme => theme.id === themeId) || null;
  } catch (error) {
    console.error('Error getting theme from storage:', error);
    return null;
  }
};

/**
 localStorage سے تمام کسٹم تھیمز حاصل کریں
 * @param {string} key - کلید (ڈیفالٹ: 'customThemes')
 * @returns {Array} تمام کسٹم تھیمز
 */
export const getAllCustomThemes = (key = 'customThemes') => {
  if (typeof localStorage === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    console.error('Error getting custom themes:', error);
    return [];
  }
};

/**
 * سسٹم کی تھیم پریفرنس کا پتہ لگائیں
 * @returns {string} 'light', 'dark', یا 'no-preference'
 */
export const detectSystemTheme = () => {
  if (typeof window === 'undefined') return 'light';
  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  return 'no-preference';
};

/**
 * تھیم میں تبدیلی کا نوٹیفکیشن بھیجیں
 * @param {string} eventName - ایونٹ کا نام
 * @param {Object} detail - ایونٹ کی تفصیلات
 */
export const dispatchThemeEvent = (eventName, detail = {}) => {
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true,
  });
  
  window.dispatchEvent(event);
};

/**
 * تھیم تبدیلی کا سننے والا سیٹ کریں
 * @param {Function} callback - سننے والا فنکشن
 * @returns {Function} سننے والے کو ہٹانے کا فنکشن
 */
export const onThemeChange = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleThemeChange = (event) => {
    if (callback && typeof callback === 'function') {
      callback(event.detail);
    }
  };
  
  window.addEventListener('themeChanged', handleThemeChange);
  
  // سننے والے کو ہٹانے کا فنکشن واپس کریں
  return () => {
    window.removeEventListener('themeChanged', handleThemeChange);
  };
};

export default {
  applyThemeToDOM,
  updateThemeMetaTags,
  camelToKebab,
  kebabToCamel,
  getCurrentThemeFromDOM,
  getCurrentThemeMode,
  getCSSVariable,
  setCSSVariable,
  getColorBrightness,
  getContrastingTextColor,
  lightenColor,
  darkenColor,
  hexToRgb,
  rgbToHex,
  rgbToRgba,
  generateColorPalette,
  isValidHexColor,
  getAllThemeColors,
  responsiveFontSize,
  calculateColorContrast,
  saveThemeToStorage,
  getThemeFromStorage,
  getAllCustomThemes,
  detectSystemTheme,
  dispatchThemeEvent,
  onThemeChange,
};