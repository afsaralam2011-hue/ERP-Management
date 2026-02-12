// src/contexts/ThemeContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  applyThemeToDOM, 
  getCurrentThemeFromDOM, 
  getCurrentThemeMode,
  saveThemeToStorage,
  getThemeFromStorage,
  getAllCustomThemes,
  detectSystemTheme,
  dispatchThemeEvent,
  onThemeChange,
  validateTheme,
  isValidHexColor,
  hexToRgb,
  lightenColor as lightenColorUtil,
  darkenColor as darkenColorUtil,
  exportThemeToFile,
  importThemeFromFile
} from '../utils/themeUtils';
import { 
  getAllThemes, 
  getThemeById, 
  getThemesByMode as getThemesByModeUtils,
  themeToCssVariables,
  cssVariablesToStyle
} from '../styles/themes/theme-config';

/**
 * تھیم کونٹیکسٹ
 * یہ پورے ایپلیکیشن میں تھیم مینجمنٹ کے لیے مرکزی کنٹیکسٹ فراہم کرتا ہے
 */

// تھیم کونٹیکسٹ کی تخلیق
export const ThemeContext = createContext();

/**
 * تھیم پرووائڈر کمپوننٹ
 * تمام تھیم ریلیٹڈ اسٹیٹ اور فنکشنز کو مینج کرتا ہے
 */
export const ThemeProvider = ({ 
  children, 
  defaultThemeId = 'light-blue',
  enableSystemThemeDetection = true,
  persistTheme = true,
  enableColorScheme = true
}) => {
  // === اسٹیٹ ڈیکلیریشن ===
  
  // موجودہ تھیم
  const [currentTheme, setCurrentTheme] = useState(null);
  
  // تھیم موڈ (light/dark)
  const [mode, setMode] = useState('light');
  
  // تمام تھیمز (پری ڈیفائنڈ + کسٹم)
  const [themes, setThemes] = useState([]);
  
  // صرف کسٹم تھیمز
  const [customThemes, setCustomThemes] = useState([]);
  
  // لوڈنگ اسٹیٹ
  const [isLoading, setIsLoading] = useState(true);
  
  // ایرر ہینڈلنگ
  const [error, setError] = useState(null);
  
  // تھیم لوڈ ہونے کا اسٹیٹ
  const [isThemeApplied, setIsThemeApplied] = useState(false);
  
  // === انیشیلائزیشن ===

  // تھیم کی ابتدائی ترتیب
  const initializeTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. تمام تھیمز لوڈ کریں
      const allPredefinedThemes = getAllThemes();
      const allCustomThemes = getAllCustomThemes();
      
      // Validate custom themes
      const validatedCustomThemes = allCustomThemes.filter(theme => validateTheme(theme));
      
      const combinedThemes = [...allPredefinedThemes, ...validatedCustomThemes];
      
      setThemes(combinedThemes);
      setCustomThemes(validatedCustomThemes);

      // 2. سیوڈ تھیم تلاش کریں
      let savedThemeId = null;
      if (persistTheme && typeof localStorage !== 'undefined') {
        savedThemeId = localStorage.getItem('selectedThemeId');
      }

      // 3. سسٹم تھیم کا پتہ لگائیں
      let systemMode = 'light';
      if (enableSystemThemeDetection) {
        systemMode = detectSystemTheme();
        if (systemMode === 'no-preference') {
          systemMode = 'light';
        }
        
        if (persistTheme) {
          localStorage.setItem('preferredSystemMode', systemMode);
        }
      }

      // 4. تھیم منتخب کریں (ترجیحی ترتیب)
      let selectedTheme = null;
      
      // پہلا: سیوڈ تھیم
      if (savedThemeId) {
        selectedTheme = getThemeById(savedThemeId);
      }
      
      // دوسرا: سسٹم موڈ کے مطابق تھیم
      if (!selectedTheme && enableSystemThemeDetection) {
        const themesForSystemMode = getThemesByModeUtils(systemMode);
        if (themesForSystemMode.length > 0) {
          selectedTheme = themesForSystemMode[0];
        }
      }
      
      // تیسرا: ڈیفالٹ تھیم
      if (!selectedTheme) {
        selectedTheme = getThemeById(defaultThemeId);
      }
      
      // چوتھا: پہلی دستیاب تھیم
      if (!selectedTheme && combinedThemes.length > 0) {
        selectedTheme = combinedThemes[0];
      }

      // 5. اسٹیٹ سیٹ کریں
      if (selectedTheme) {
        setCurrentTheme(selectedTheme);
        setMode(selectedTheme.mode);
        
        // 6. DOM پر تھیم اپلائی کریں (فکسڈ: indigo/navy text colors)
        const applied = applyThemeWithForcedColors(selectedTheme);
        setIsThemeApplied(applied);
        
        // 7. localStorage میں سیو کریں
        if (persistTheme) {
          localStorage.setItem('selectedThemeId', selectedTheme.id);
          localStorage.setItem('themeMode', selectedTheme.mode);
        }

        // 8. ایونٹ ڈسپیچ کریں
        dispatchThemeEvent('themeInitialized', {
          theme: selectedTheme,
          mode: selectedTheme.mode,
          source: savedThemeId ? 'saved' : (enableSystemThemeDetection ? 'system' : 'default')
        });
      }

    } catch (err) {
      console.error('Theme initialization error:', err);
      setError({
        message: err.message || 'Failed to initialize theme',
        code: 'INIT_ERROR',
        timestamp: new Date().toISOString()
      });
      
      // ڈیفالٹ تھیم اپلائی کریں
      const defaultTheme = getThemeById(defaultThemeId);
      if (defaultTheme) {
        applyThemeWithForcedColors(defaultTheme);
        setCurrentTheme(defaultTheme);
        setMode(defaultTheme.mode);
      }
    } finally {
      setIsLoading(false);
    }
  }, [defaultThemeId, enableSystemThemeDetection, persistTheme]);

  // === تھیم اپلائی فنکشن - فکسڈ ===

  /**
   * تھیم اپلائی کریں فورسڈ ٹیکسٹ کالرز کے ساتھ
   * @param {Object} theme - تھیم آبجیکٹ
   * @returns {boolean} کامیابی کی صورت میں true
   */
  const applyThemeWithForcedColors = useCallback((theme) => {
    if (!theme || !theme.colors) {
      console.error('Invalid theme object');
      return false;
    }

    try {
      const root = document.documentElement;
      const body = document.body;
      
      // 1. کلین اپ
      body.classList.remove(
        'theme-light', 'theme-dark',
        'light-mode', 'dark-mode',
        'light-theme', 'dark-theme'
      );
      
      root.removeAttribute('data-theme');
      root.removeAttribute('data-theme-mode');
      body.removeAttribute('data-theme');
      body.removeAttribute('data-theme-mode');
      
      // 2. فورس کالرز سیٹ کریں
      const isDarkMode = theme.mode === 'dark';
      
      if (isDarkMode) {
        // FIX: Dark mode میں بلیک ٹیکسٹ کے بجائے indigo/blue
        body.style.color = '#E3F2FD'; // Light Blue/White
        body.style.backgroundColor = '#121212'; // Dark background
        body.classList.add('dark-mode', 'theme-dark', 'dark-theme');
      } else {
        // FIX: Light mode میں indigo/navy blue text
        body.style.color = '#1A237E'; // Deep Indigo/Navy Blue
        body.style.backgroundColor = '#FFFFFF'; // Light background
        body.classList.add('light-mode', 'theme-light', 'light-theme');
      }
      
      // 3. تھیم اپلائی کریں
      const applied = applyThemeToDOM(theme);
      
      // 4. اضافی فورس کالرز
      const forceTextColors = () => {
        const textSelectors = [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'span', 'div', 'a', 'li', 'td', 'th',
          '.text', '.title', '.subtitle', '.label',
          '.card', '.panel', '.modal', '.dialog',
          '.sidebar', '.header', '.navbar',
          'aside', 'nav', 'header', 'footer', 'section'
        ];
        
        textSelectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(element => {
              if (element.tagName === 'BUTTON' || 
                  element.tagName === 'INPUT' || 
                  element.tagName === 'TEXTAREA' || 
                  element.tagName === 'SELECT') {
                return;
              }
              
              if (isDarkMode) {
                element.style.color = '#E3F2FD';
                element.style.setProperty('color', '#E3F2FD', 'important');
              } else {
                element.style.color = '#1A237E';
                element.style.setProperty('color', '#1A237E', 'important');
              }
            });
          } catch (e) {
            // Silent fail
          }
        });
      };
      
      // 5. فورس کالرز اپلائی کریں
      setTimeout(forceTextColors, 100);
      setTimeout(forceTextColors, 500);
      
      return applied;
    } catch (err) {
      console.error('Error applying theme with forced colors:', err);
      return false;
    }
  }, []);

  // === تھیم ایونٹ ہینڈلرز ===

  // تھیم تبدیلی کا سننے والا
  useEffect(() => {
    const cleanup = onThemeChange((eventDetail) => {
      if (eventDetail.type === 'themeChanged') {
        console.log('Theme change event received:', eventDetail);
      }
    });

    return cleanup;
  }, []);

  // سسٹم تھیم میں تبدیلی کا سننے والا
  useEffect(() => {
    if (!enableSystemThemeDetection || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      const systemMode = e.matches ? 'dark' : 'light';
      
      if (persistTheme) {
        localStorage.setItem('preferredSystemMode', systemMode);
      }
      
      // اگر سیوڈ تھیم نہیں ہے تو سسٹم تھیم اپلائی کریں
      const savedThemeId = localStorage.getItem('selectedThemeId');
      if (!savedThemeId && currentTheme?.mode !== systemMode) {
        const themesForSystemMode = getThemesByModeUtils(systemMode);
        if (themesForSystemMode.length > 0) {
          const newTheme = themesForSystemMode[0];
          setCurrentTheme(newTheme);
          setMode(systemMode);
          applyThemeWithForcedColors(newTheme);
          
          if (persistTheme) {
            localStorage.setItem('selectedThemeId', newTheme.id);
            localStorage.setItem('themeMode', systemMode);
          }
        }
      }
      
      dispatchThemeEvent('systemThemeChanged', { mode: systemMode });
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [enableSystemThemeDetection, persistTheme, currentTheme, applyThemeWithForcedColors]);

  // === تھیم مینجمنٹ فنکشنز ===

  /**
   * تھیم منتخب کریں اور اپلائی کریں
   * @param {string} themeId - تھیم ID
   * @returns {Object|null} اپلائی کردہ تھیم یا null
   */
  const setTheme = useCallback((themeId) => {
    try {
      if (!themeId || typeof themeId !== 'string') {
        throw new Error('Invalid theme ID');
      }

      // تھیم تلاش کریں
      const themeToApply = getThemeById(themeId);
      if (!themeToApply) {
        throw new Error(`Theme "${themeId}" not found`);
      }

      // تھیم اپلائی کریں (فورسڈ کالرز کے ساتھ)
      const applied = applyThemeWithForcedColors(themeToApply);
      if (!applied) {
        throw new Error('Failed to apply theme');
      }

      // اسٹیٹ اپڈیٹ کریں
      setCurrentTheme(themeToApply);
      setMode(themeToApply.mode);
      setIsThemeApplied(true);

      // persistence
      if (persistTheme) {
        localStorage.setItem('selectedThemeId', themeId);
        localStorage.setItem('themeMode', themeToApply.mode);
      }

      // ایونٹ ڈسپیچ کریں
      dispatchThemeEvent('themeChanged', {
        theme: themeToApply,
        previousTheme: currentTheme,
        mode: themeToApply.mode,
        timestamp: new Date().toISOString()
      });

      console.log(`Theme "${themeToApply.name}" applied successfully`);
      return themeToApply;

    } catch (err) {
      console.error('Error setting theme:', err);
      setError({
        message: err.message,
        code: 'SET_THEME_ERROR',
        themeId,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }, [currentTheme, persistTheme, applyThemeWithForcedColors]);

  /**
   * تھیم موڈ تبدیل کریں
   * @param {string} newMode - نیا موڈ ('light' یا 'dark')
   */
  const setModeHandler = useCallback((newMode) => {
    if (newMode !== 'light' && newMode !== 'dark') {
      console.warn(`Invalid theme mode: ${newMode}. Must be 'light' or 'dark'`);
      return;
    }

    try {
      // موجودہ تھیم کے موڈ میں تبدیلی
      let newTheme;
      
      // اگر موجودہ تھیم اسی موڈ میں ہے تو صرف موڈ تبدیل کریں
      if (currentTheme && currentTheme.mode === newMode) {
        setMode(newMode);
        if (persistTheme) {
          localStorage.setItem('themeMode', newMode);
        }
        return;
      }

      // نئے موڈ کے لیے مناسب تھیم تلاش کریں
      const themesForMode = getThemesByModeUtils(newMode);
      
      // پہلے اسی نام کی تھیم تلاش کریں (اگر موجود ہو)
      if (currentTheme) {
        const themeNameBase = currentTheme.name.replace('Light', '').replace('Dark', '').trim();
        const sameNameTheme = themesForMode.find(t => 
          t.name === themeNameBase ||
          t.name.replace('Light', '').replace('Dark', '').trim() === themeNameBase
        );
        
        if (sameNameTheme) {
          newTheme = sameNameTheme;
        }
      }

      // ورنہ پہلی دستیاب تھیم منتخب کریں
      if (!newTheme && themesForMode.length > 0) {
        newTheme = themesForMode[0];
      }

      // اگر کوئی مناسب تھیم مل گئی تو اپلائی کریں
      if (newTheme) {
        setTheme(newTheme.id);
      } else {
        // صرف موڈ تبدیل کریں
        setMode(newMode);
        if (persistTheme) {
          localStorage.setItem('themeMode', newMode);
        }
        
        dispatchThemeEvent('modeChanged', {
          mode: newMode,
          theme: currentTheme,
          timestamp: new Date().toISOString()
        });
      }

    } catch (err) {
      console.error('Error changing theme mode:', err);
      setError({
        message: err.message,
        code: 'SET_MODE_ERROR',
        mode: newMode,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentTheme, setTheme, persistTheme]);

  /**
   * کسٹم تھیم تخلیق کریں
   * @param {string} name - تھیم کا نام
   * @param {Object} colors - تھیم کے رنگ
   * @param {string} themeMode - تھیم موڈ ('light' یا 'dark')
   * @returns {Object|null} تخلیق شدہ تھیم یا null
   */
  const createCustomTheme = useCallback((name, colors, themeMode = 'light') => {
    try {
      // تصدیق
      if (!name || !colors || !colors.primary || !colors.background) {
        throw new Error('Name and primary colors are required');
      }

      if (!isValidHexColor(colors.primary)) {
        throw new Error('Invalid primary color format');
      }

      if (!isValidHexColor(colors.background)) {
        throw new Error('Invalid background color format');
      }

      // تھیم ID بنائیں
      const themeId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // رنگوں کو indigo/navy blue میں تبدیل کریں
      const textColors = themeMode === 'dark' ? {
        textPrimary: '#E3F2FD',    // Light Blue/White
        textSecondary: '#BBDEFB',  // Light Blue
        textDisabled: '#78909C'    // Grey-Blue
      } : {
        textPrimary: '#1A237E',    // Deep Indigo/Navy Blue
        textSecondary: '#283593',  // Medium Indigo/Navy Blue
        textDisabled: '#5C6BC0'    // Light Indigo
      };
      
      // نیا تھیم آبجیکٹ
      const newTheme = {
        id: themeId,
        name,
        mode: themeMode,
        description: `Custom ${themeMode} theme created by user`,
        category: 'custom',
        colors: {
          // بنیادی رنگ
          primary: colors.primary,
          primaryLight: colors.primaryLight || lightenColorUtil(colors.primary, 30),
          primaryDark: colors.primaryDark || darkenColorUtil(colors.primary, 20),
          secondary: colors.secondary || colors.primary,
          secondaryLight: colors.secondaryLight || lightenColorUtil(colors.secondary || colors.primary, 30),
          secondaryDark: colors.secondaryDark || darkenColorUtil(colors.secondary || colors.primary, 20),
          
          // بیک گراؤنڈ
          background: colors.background,
          surface: colors.surface || (themeMode === 'dark' ? darkenColorUtil(colors.background, 10) : lightenColorUtil(colors.background, 10)),
          paper: colors.paper || (themeMode === 'dark' ? darkenColorUtil(colors.background, 5) : lightenColorUtil(colors.background, 5)),
          
          // ٹیکسٹ - BLACK سے INDIGO/NAVY میں تبدیل
          textPrimary: colors.textPrimary || textColors.textPrimary,
          textSecondary: colors.textSecondary || textColors.textSecondary,
          textDisabled: colors.textDisabled || textColors.textDisabled,
          textHint: colors.textHint || (themeMode === 'dark' ? '#90A4AE' : '#7986CB'),
          
          // اضافی رنگ
          border: colors.border || (themeMode === 'dark' ? '#2D2D2D' : '#E0E0E0'),
          divider: colors.divider || (themeMode === 'dark' ? '#37474F' : '#EEEEEE'),
          success: colors.success || (themeMode === 'dark' ? '#66BB6A' : '#4CAF50'),
          warning: colors.warning || (themeMode === 'dark' ? '#FFB74D' : '#FF9800'),
          error: colors.error || (themeMode === 'dark' ? '#EF5350' : '#F44336'),
          info: colors.info || colors.primary,
          
          // ایکشن رنگ
          hover: colors.hover || (themeMode === 'dark' ? 'rgba(187, 222, 251, 0.08)' : 'rgba(26, 35, 126, 0.04)'),
          selected: colors.selected || (themeMode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)'),
          focus: colors.focus || (themeMode === 'dark' ? 'rgba(66, 165, 245, 0.12)' : 'rgba(25, 118, 210, 0.12)'),
        },
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Validate the theme
      const validatedTheme = validateTheme(newTheme);
      if (!validatedTheme) {
        throw new Error('Theme validation failed');
      }

      // localStorage میں سیو کریں
      const saved = saveThemeToStorage(validatedTheme, 'customThemes');
      if (!saved) {
        throw new Error('Failed to save theme to storage');
      }

      // اسٹیٹ اپڈیٹ کریں
      setThemes(prev => [...prev, validatedTheme]);
      setCustomThemes(prev => [...prev, validatedTheme]);

      dispatchThemeEvent('customThemeCreated', {
        theme: validatedTheme,
        timestamp: new Date().toISOString()
      });

      console.log(`Custom theme "${name}" created successfully`);
      return validatedTheme;

    } catch (err) {
      console.error('Error creating custom theme:', err);
      setError({
        message: err.message,
        code: 'CREATE_THEME_ERROR',
        name,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }, []);

  /**
   * کسٹم تھیم ڈیلیٹ کریں
   * @param {string} themeId - تھیم ID
   * @returns {boolean} کامیابی کی صورت میں true
   */
  const deleteCustomTheme = useCallback((themeId) => {
    try {
      if (!themeId.startsWith('custom-')) {
        throw new Error('Only custom themes can be deleted');
      }

      // localStorage سے ڈیلیٹ کریں
      const allCustomThemes = getAllCustomThemes();
      const updatedThemes = allCustomThemes.filter(t => t.id !== themeId);
      
      localStorage.setItem('customThemes', JSON.stringify(updatedThemes));

      // اگر موجودہ تھیم ڈیلیٹ ہو رہی ہے تو ڈیفالٹ پر سوئچ کریں
      if (currentTheme?.id === themeId) {
        const defaultTheme = getThemeById(defaultThemeId);
        if (defaultTheme) {
          setTheme(defaultTheme.id);
        }
      }

      // اسٹیٹ اپڈیٹ کریں
      setThemes(prev => prev.filter(t => t.id !== themeId));
      setCustomThemes(updatedThemes);

      dispatchThemeEvent('customThemeDeleted', {
        themeId,
        timestamp: new Date().toISOString()
      });

      console.log(`Custom theme "${themeId}" deleted successfully`);
      return true;

    } catch (err) {
      console.error('Error deleting custom theme:', err);
      setError({
        message: err.message,
        code: 'DELETE_THEME_ERROR',
        themeId,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }, [currentTheme, defaultThemeId, setTheme]);

  /**
   * تھیم ایکسپورٹ کریں
   * @param {string} themeId - تھیم ID (اختیاری، ڈیفالٹ: موجودہ تھیم)
   */
  const exportTheme = useCallback((themeId = currentTheme?.id) => {
    try {
      const theme = themeId ? getThemeById(themeId) : currentTheme;
      if (!theme) {
        throw new Error('No theme to export');
      }

      const success = exportThemeToFile(theme);
      if (!success) {
        throw new Error('Failed to export theme');
      }

      dispatchThemeEvent('themeExported', {
        theme,
        timestamp: new Date().toISOString()
      });

      return true;

    } catch (err) {
      console.error('Error exporting theme:', err);
      setError({
        message: err.message,
        code: 'EXPORT_THEME_ERROR',
        themeId,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }, [currentTheme]);

  /**
   * تھیم امپورٹ کریں
   * @param {File} file - تھیم JSON فائل
   * @returns {Promise<Object>} امپورٹ شدہ تھیم
   */
  const importTheme = useCallback(async (file) => {
    try {
      const importedTheme = await importThemeFromFile(file);
      
      if (!importedTheme) {
        throw new Error('Failed to import theme from file');
      }

      // Validate the imported theme
      const validatedTheme = validateTheme(importedTheme);
      if (!validatedTheme) {
        throw new Error('Imported theme validation failed');
      }

      // Ensure it's marked as custom
      validatedTheme.isCustom = true;
      validatedTheme.category = 'custom';
      validatedTheme.importedAt = new Date().toISOString();

      // localStorage میں سیو کریں
      const saved = saveThemeToStorage(validatedTheme, 'customThemes');
      if (!saved) {
        throw new Error('Failed to save imported theme');
      }

      // اسٹیٹ اپڈیٹ کریں
      setThemes(prev => [...prev, validatedTheme]);
      setCustomThemes(prev => [...prev, validatedTheme]);

      dispatchThemeEvent('themeImported', {
        theme: validatedTheme,
        timestamp: new Date().toISOString()
      });

      console.log(`Theme "${validatedTheme.name}" imported successfully`);
      return validatedTheme;

    } catch (err) {
      console.error('Error importing theme:', err);
      setError({
        message: err.message,
        code: 'IMPORT_THEME_ERROR',
        timestamp: new Date().toISOString()
      });
      throw err;
    }
  }, []);

  /**
   * تھیم ری سیٹ کریں (ڈیفالٹ پر)
   */
  const resetTheme = useCallback(() => {
    try {
      // ڈیفالٹ تھیم اپلائی کریں
      const defaultTheme = getThemeById(defaultThemeId);
      if (!defaultTheme) {
        throw new Error('Default theme not found');
      }

      setTheme(defaultTheme.id);

      // persistence ری سیٹ کریں
      if (persistTheme) {
        localStorage.setItem('selectedThemeId', defaultThemeId);
        localStorage.setItem('themeMode', defaultTheme.mode);
      }

      dispatchThemeEvent('themeReset', {
        theme: defaultTheme,
        timestamp: new Date().toISOString()
      });

      return true;

    } catch (err) {
      console.error('Error resetting theme:', err);
      setError({
        message: err.message,
        code: 'RESET_THEME_ERROR',
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }, [defaultThemeId, setTheme, persistTheme]);

  /**
   * موجودہ موڈ کے مطابق تھیمز فلٹر کریں
   * @param {string} themeMode - تھیم موڈ (اختیاری، ڈیفالٹ: موجودہ موڈ)
   * @returns {Array} فلٹرڈ تھیمز
   */
  const getThemesByMode = useCallback((themeMode = mode) => {
    return themes.filter(theme => theme.mode === themeMode);
  }, [themes, mode]);

  // === ایکشنز ===

  // کمپوننٹ ماؤنٹ پر تھیم انیشیلائز کریں
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // === کونٹیکسٹ ویلیو ===

  const contextValue = useMemo(() => ({
    // === اسٹیٹ ===
    currentTheme,
    mode,
    themes: getThemesByMode(),
    allThemes: themes,
    customThemes,
    isLoading,
    error,
    isThemeApplied,
    
    // === فنکشنز ===
    setTheme,
    setMode: setModeHandler,
    createCustomTheme,
    updateCustomTheme: createCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    resetTheme,
    
    // === ہیلپرز ===
    getThemesByMode,
    getCurrentThemeId: () => currentTheme?.id,
    getCurrentThemeName: () => currentTheme?.name,
    isDarkMode: mode === 'dark',
    isLightMode: mode === 'light',
    
    // === یوٹیلیٹیز ===
    toggleMode: () => setModeHandler(mode === 'light' ? 'dark' : 'light'),
    refreshThemes: initializeTheme,
    clearError: () => setError(null),
    
    // === تھیم انفارمیشن ===
    themeStats: {
      totalThemes: themes.length,
      customThemes: customThemes.length,
      lightThemes: themes.filter(t => t.mode === 'light').length,
      darkThemes: themes.filter(t => t.mode === 'dark').length,
      lastUpdated: currentTheme?.updatedAt || currentTheme?.createdAt,
    }
    
  }), [
    currentTheme,
    mode,
    themes,
    customThemes,
    isLoading,
    error,
    isThemeApplied,
    setTheme,
    setModeHandler,
    createCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme,
    resetTheme,
    getThemesByMode,
    initializeTheme
  ]);

  // === رینڈر ===

  // لوڈنگ اسٹیٹ
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: mode === 'dark' ? '#121212' : '#FFFFFF',
        color: mode === 'dark' ? '#E3F2FD' : '#1A237E', // FIXED: indigo/navy colors
        transition: 'all 0.3s ease'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${mode === 'dark' ? '#333' : '#EEE'}`,
            borderTop: `3px solid ${currentTheme?.colors?.primary || '#1976D2'}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.7 }}>
            Loading theme...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ایرر اسٹیٹ
  if (error && !currentTheme) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div>
          <h3 style={{ marginBottom: '10px' }}>Theme Error</h3>
          <p style={{ marginBottom: '20px' }}>{error.message}</p>
          <button
            onClick={initializeTheme}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * تھیم کونٹیکسٹ استعمال کرنے کا کسٹم ہک
 * @returns {Object} تھیم کونٹیکسٹ ویلیو
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * تھیم ہوک کے ساتھ ہائی آرڈر کمپوننٹ
 * @param {React.Component} Component - رپورٹ کرنے والا کمپوننٹ
 * @returns {React.Component} تھیم پروپس کے ساتھ رپیڈ کمپوننٹ
 */
export const withTheme = (Component) => {
  return function WithThemeComponent(props) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
};

/**
 * تھیم کے ساتھ کلاس کمپوننٹ کے لیے ہوک
 * @returns {Object} تھیم کونٹیکسٹ
 */
export const useThemeContext = () => {
  return useContext(ThemeContext);
};

export default ThemeContext;