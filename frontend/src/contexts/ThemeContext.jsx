// src/contexts/ThemeContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  applyThemeToDOM as applyThemeUtils, 
  getCurrentThemeFromDOM, 
  getCurrentThemeMode,
  saveThemeToStorage,
  getThemeFromStorage,
  getAllCustomThemes,
  detectSystemTheme,
  dispatchThemeEvent,
  onThemeChange
} from '../utils/themeUtils';
import { getAllThemes, getThemeById, getThemesByMode as getThemesByModeUtils } from '../styles/themes/theme-config';

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
  
  // تھیم ایونٹ سننے والے
  const [themeListeners, setThemeListeners] = useState([]);

  // === انیشیلائزیشن ===

  // تھیم کی ابتدائی ترتیب
  const initializeTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. تمام تھیمز لوڈ کریں
      const allPredefinedThemes = getAllThemes();
      const allCustomThemes = getAllCustomThemes();
      const combinedThemes = [...allPredefinedThemes, ...allCustomThemes];
      
      setThemes(combinedThemes);
      setCustomThemes(allCustomThemes);

      // 2. سیوڈ تھیم تلاش کریں
      let savedThemeId = null;
      if (persistTheme && typeof localStorage !== 'undefined') {
        savedThemeId = localStorage.getItem('selectedThemeId');
      }

      // 3. سسٹم تھیم کا پتہ لگائیں
      let systemMode = detectSystemTheme();
      if (enableSystemThemeDetection && systemMode !== 'no-preference') {
        if (persistTheme) {
          localStorage.setItem('preferredSystemMode', systemMode);
        }
      }

      // 4. تھیم منتخب کریں (ترجیحی ترتیب)
      let selectedTheme;
      
      // پہلا: سیوڈ تھیم
      if (savedThemeId) {
        selectedTheme = getThemeById(savedThemeId);
      }
      
      // دوسرا: سسٹم موڈ کے مطابق تھیم
      if (!selectedTheme && systemMode !== 'no-preference') {
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
        
        // 6. DOM پر تھیم اپلائی کریں
        const applied = applyThemeUtils(selectedTheme);
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
          source: savedThemeId ? 'saved' : (systemMode !== 'no-preference' ? 'system' : 'default')
        });
      }

    } catch (err) {
      console.error('Theme initialization error:', err);
      setError({
        message: err.message,
        code: 'INIT_ERROR',
        timestamp: new Date().toISOString()
      });
      
      // ڈیفالٹ تھیم اپلائی کریں
      const defaultTheme = getThemeById(defaultThemeId);
      if (defaultTheme) {
        applyThemeUtils(defaultTheme);
        setCurrentTheme(defaultTheme);
        setMode(defaultTheme.mode);
      }
    } finally {
      setIsLoading(false);
    }
  }, [defaultThemeId, enableSystemThemeDetection, persistTheme]);

  // === تھیم ایونٹ ہینڈلرز ===

  // تھیم تبدیلی کا سننے والا
  useEffect(() => {
    const cleanup = onThemeChange((eventDetail) => {
      // تھیم تبدیلی کا نوٹیفکیشن
      if (eventDetail.type === 'themeChanged') {
        // کسی بھی ضروری اپڈیٹس کے لیے
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
          applyThemeUtils(newTheme);
          
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
  }, [enableSystemThemeDetection, persistTheme, currentTheme]);

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

      // تھیم اپلائی کریں
      const applied = applyThemeUtils(themeToApply);
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
  }, [currentTheme, persistTheme]);

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
        const sameNameTheme = themesForMode.find(t => 
          t.name === currentTheme.name.replace('Light', '').replace('Dark', '').trim() ||
          t.name === currentTheme.name.replace('Dark', '').replace('Light', '').trim()
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
        // صرف موڈ تبدیل کریں (تھیم اپلائی نہیں ہوگی)
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

      // تھیم ID بنائیں
      const themeId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
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
          primaryLight: colors.primaryLight || lightenColor(colors.primary, 30),
          primaryDark: colors.primaryDark || darkenColor(colors.primary, 20),
          secondary: colors.secondary || colors.primary,
          
          // بیک گراؤنڈ
          background: colors.background,
          surface: colors.surface || (themeMode === 'dark' ? darkenColor(colors.background, 10) : lightenColor(colors.background, 10)),
          
          // ٹیکسٹ - BLACK سے INDIGO/NAVY میں تبدیل
          textPrimary: colors.textPrimary || (themeMode === 'dark' ? '#7986CB' : '#1A237E'),
          textSecondary: colors.textSecondary || (themeMode === 'dark' ? '#9FA8DA' : '#283593'),
          
          // اضافی رنگ
          border: colors.border || (themeMode === 'dark' ? '#333333' : '#E0E0E0'),
          success: colors.success || '#4CAF50',
          warning: colors.warning || '#FF9800',
          error: colors.error || '#F44336',
          info: colors.info || colors.primary,
          
          // ڈیفالٹ ویلیوز
          hover: colors.hover || (themeMode === 'dark' ? 'rgba(121, 134, 203, 0.04)' : 'rgba(26, 35, 126, 0.04)'),
          focus: colors.focus || `rgba(${hexToRgb(colors.primary).r}, ${hexToRgb(colors.primary).g}, ${hexToRgb(colors.primary).b}, 0.12)`,
        },
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user',
      };

      // localStorage میں سیو کریں
      const saved = saveThemeToStorage(newTheme, 'customThemes');
      if (!saved) {
        throw new Error('Failed to save theme to storage');
      }

      // اسٹیٹ اپڈیٹ کریں
      setThemes(prev => [...prev, newTheme]);
      setCustomThemes(prev => [...prev, newTheme]);

      dispatchThemeEvent('customThemeCreated', {
        theme: newTheme,
        timestamp: new Date().toISOString()
      });

      console.log(`Custom theme "${name}" created successfully`);
      return newTheme;

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

      const dataStr = JSON.stringify(theme, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `theme-${theme.name}-${theme.mode}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const importedTheme = JSON.parse(event.target.result);
          
          // بنیادی تصدیق
          if (!importedTheme.name || !importedTheme.colors || !importedTheme.mode) {
            throw new Error('Invalid theme file format');
          }

          // ID تبدیل کریں
          importedTheme.id = `custom-imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          importedTheme.isCustom = true;
          importedTheme.category = 'custom';
          importedTheme.importedAt = new Date().toISOString();
          importedTheme.updatedAt = new Date().toISOString();

          // localStorage میں سیو کریں
          const saved = saveThemeToStorage(importedTheme, 'customThemes');
          if (!saved) {
            throw new Error('Failed to save imported theme');
          }

          // اسٹیٹ اپڈیٹ کریں
          setThemes(prev => [...prev, importedTheme]);
          setCustomThemes(prev => [...prev, importedTheme]);

          dispatchThemeEvent('themeImported', {
            theme: importedTheme,
            timestamp: new Date().toISOString()
          });

          console.log(`Theme "${importedTheme.name}" imported successfully`);
          resolve(importedTheme);

        } catch (err) {
          console.error('Error importing theme:', err);
          setError({
            message: err.message,
            code: 'IMPORT_THEME_ERROR',
            timestamp: new Date().toISOString()
          });
          reject(err);
        }
      };

      reader.onerror = () => {
        const err = new Error('Failed to read file');
        setError({
          message: err.message,
          code: 'FILE_READ_ERROR',
          timestamp: new Date().toISOString()
        });
        reject(err);
      };

      reader.readAsText(file);
    });
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

  /**
   * ہیلپر فنکشنز (in-memory)
   */
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const lightenColor = (color, percent) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const darkenColor = (color, percent) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
    const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
    const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

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
    updateCustomTheme: createCustomTheme, // ایک ہی فنکشن
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
        color: mode === 'dark' ? '#7986CB' : '#1A237E', // INDIGO/NAVY میں تبدیل
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