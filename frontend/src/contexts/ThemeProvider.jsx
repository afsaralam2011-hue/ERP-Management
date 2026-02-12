// src/contexts/ThemeProvider.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  defaultTheme, 
  predefinedThemes, 
  baseThemes,
  themeToCssVariables,
  cssVariablesToStyle,
  applyTheme as applyThemeUtil
} from "../styles/themes/theme-config";
import { 
  lightTheme, 
  lightThemeVariants,
  getAllLightThemes,
  getLightThemeById 
} from "../styles/themes/light";
import { 
  darkTheme, 
  darkThemeVariants,
  getAllDarkThemes, 
  getDarkThemeById 
} from "../styles/themes/dark";
import { isValidHexColor, validateTheme } from "../utils/themeUtils";

// ============================================================
// ✅ FIXED: Create ThemeContext with proper displayName
// ============================================================
export const ThemeContext = React.createContext(null);
ThemeContext.displayName = 'ThemeContext';

// ============================================================
// ✅ FIXED: useTheme hook - NOW AVAILABLE AS NAMED EXPORT
// ============================================================
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  // State
  const [currentTheme, setCurrentTheme] = useState(null);
  const [mode, setMode] = useState("light");
  const [themes, setThemes] = useState([]);
  const [customThemes, setCustomThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ============================================================
  // ✅ FIXED: Clean theme application - NO FORCED COLORS, NO !IMPORTANT
  // ============================================================
  const applyThemeToDocument = useCallback((theme, themeMode) => {
    try {
      const root = document.documentElement;
      const body = document.body;
      
      // 1. Clear previous theme classes and attributes
      body.classList.remove('dark-theme', 'light-theme', 'theme-dark', 'theme-light', 'dark-mode', 'light-mode');
      root.removeAttribute('data-theme');
      root.removeAttribute('data-theme-mode');
      body.removeAttribute('data-theme');
      body.removeAttribute('data-theme-mode');
      
      // 2. Reset inline styles - IMPORTANT: No forced colors!
      root.style.cssText = '';
      body.style.cssText = '';
      
      // 3. Determine actual mode
      const actualMode = themeMode || theme?.mode || 'light';
      const isDarkMode = actualMode === 'dark';
      
      // 4. Apply theme CSS variables
      if (typeof applyThemeUtil === 'function') {
        applyThemeUtil(theme);
      } else {
        // Fallback: Manual CSS variables application
        const cssVars = themeToCssVariables(theme);
        Object.entries(cssVars).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      }
      
      // 5. Set theme attributes and classes
      root.setAttribute('data-theme', theme.id);
      root.setAttribute('data-theme-mode', actualMode);
      body.setAttribute('data-theme', theme.id);
      body.setAttribute('data-theme-mode', actualMode);
      
      if (isDarkMode) {
        body.classList.add('dark-theme', 'theme-dark', 'dark-mode');
        // ✅ FIXED: No forced colors - CSS variables handle everything
      } else {
        body.classList.add('light-theme', 'theme-light', 'light-mode');
        // ✅ FIXED: No forced colors - CSS variables handle everything
      }
      
      // 6. Update meta theme color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      const metaContent = isDarkMode ? 
        (theme.colors?.background || '#0b1f3a') : 
        (theme.colors?.background || '#ffffff');
      
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', metaContent);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = metaContent;
        document.head.appendChild(meta);
      }
      
      console.log(`✅ Theme applied: ${theme.name} (${actualMode})`);
      return true;
    } catch (err) {
      console.error('❌ Error applying theme to document:', err);
      return false;
    }
  }, []);

  // Helper function to get all available themes
  const getAllAvailableThemes = useCallback(() => {
    try {
      // Get all predefined themes
      const allPredefined = [...predefinedThemes];
      
      // Get all light themes
      const allLightThemes = getAllLightThemes();
      
      // Get all dark themes
      const allDarkThemes = getAllDarkThemes();
      
      // Get custom themes from localStorage
      const savedCustomThemes = JSON.parse(
        localStorage.getItem("customThemes") || "[]"
      ).filter(theme => validateTheme(theme));
      
      // Combine all, removing duplicates by ID
      const allThemes = [
        ...allPredefined,
        ...allLightThemes,
        ...allDarkThemes,
        ...savedCustomThemes
      ];
      
      // Remove duplicates by ID
      const uniqueThemes = [];
      const seenIds = new Set();
      
      allThemes.forEach(theme => {
        if (!seenIds.has(theme.id)) {
          seenIds.add(theme.id);
          uniqueThemes.push(theme);
        }
      });
      
      return uniqueThemes;
    } catch (err) {
      console.error("Error getting all themes:", err);
      return [defaultTheme];
    }
  }, []);

  // Helper function to get theme by ID
  const getThemeById = useCallback((themeId) => {
    const allThemes = getAllAvailableThemes();
    return allThemes.find((theme) => theme.id === themeId) || null;
  }, [getAllAvailableThemes]);

  // Helper function to create new theme
  const createNewTheme = useCallback((name, colors, themeMode) => {
    const themeId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure proper text colors based on mode - INDIGO/NAVY ONLY, NO BLACK
    const isDark = themeMode === 'dark';
    const defaultTextColors = isDark ? {
      textPrimary: '#E3F2FD', // Light Blue/White
      textSecondary: '#BBDEFB', // Light Blue
      textDisabled: '#90A4AE' // Grey-Blue
    } : {
      textPrimary: '#1A237E', // Deep Indigo/Navy Blue
      textSecondary: '#283593', // Medium Indigo
      textDisabled: '#5C6BC0' // Light Indigo
    };
    
    return {
      id: themeId,
      name: name,
      description: `Custom ${themeMode} theme created by user`,
      mode: themeMode || 'light',
      category: 'custom',
      type: 'custom',
      colors: {
        // Primary colors
        primary: colors.primary || (isDark ? '#60A5FA' : '#1E40AF'),
        primaryLight: colors.primaryLight || (isDark ? '#93C5FD' : '#2563EB'),
        primaryDark: colors.primaryDark || (isDark ? '#3B82F6' : '#1E3A8A'),
        
        // Secondary colors
        secondary: colors.secondary || (isDark ? '#818CF8' : '#4F46E5'),
        secondaryLight: colors.secondaryLight || (isDark ? '#A5B4FC' : '#6366F1'),
        secondaryDark: colors.secondaryDark || (isDark ? '#6366F1' : '#4338CA'),
        
        // Background colors
        background: colors.background || (isDark ? '#0B1F3A' : '#F8FAFC'),
        surface: colors.surface || (isDark ? '#132B4A' : '#FFFFFF'),
        cardBackground: colors.cardBackground || (isDark ? '#1E3A5F' : '#FFFFFF'),
        
        // Text colors - INDIGO/NAVY ONLY, NO BLACK
        textPrimary: defaultTextColors.textPrimary,
        textSecondary: defaultTextColors.textSecondary,
        textDisabled: defaultTextColors.textDisabled,
        textHint: isDark ? '#94A3B8' : '#64748B',
        textIcon: isDark ? '#BBDEFB' : '#283593',
        
        // Border colors
        border: colors.border || (isDark ? '#1E3A5F' : '#E2E8F0'),
        divider: colors.divider || (isDark ? '#2D4A6E' : '#E2E8F0'),
        
        // Status colors
        success: colors.success || (isDark ? '#34D399' : '#059669'),
        warning: colors.warning || (isDark ? '#FBBF24' : '#D97706'),
        error: colors.error || (isDark ? '#F87171' : '#DC2626'),
        info: colors.info || (isDark ? '#60A5FA' : '#2563EB'),
        
        // Action colors
        hover: colors.hover || (isDark ? 'rgba(96, 165, 250, 0.08)' : 'rgba(30, 64, 175, 0.04)'),
        selected: colors.selected || (isDark ? 'rgba(96, 165, 250, 0.16)' : 'rgba(30, 64, 175, 0.08)'),
        focus: colors.focus || (isDark ? 'rgba(96, 165, 250, 0.12)' : 'rgba(30, 64, 175, 0.12)'),
      },
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
  }, []);

  // Helper function to delete theme by ID
  const deleteThemeById = useCallback((themeId) => {
    try {
      const savedCustomThemes = JSON.parse(
        localStorage.getItem("customThemes") || "[]"
      );
      const updatedThemes = savedCustomThemes.filter(
        (theme) => theme.id !== themeId
      );
      localStorage.setItem("customThemes", JSON.stringify(updatedThemes));
      return true;
    } catch (err) {
      console.error("Error deleting theme:", err);
      return false;
    }
  }, []);

  // Helper function to export theme to file
  const exportThemeToFile = useCallback((theme) => {
    try {
      const themeData = JSON.stringify(theme, null, 2);
      const blob = new Blob([themeData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `theme-${theme.name.toLowerCase().replace(/\s+/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error("Error exporting theme:", err);
      return false;
    }
  }, []);

  // Helper function to import theme from file
  const importThemeFromFile = useCallback(async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target.result);

          // Validate theme data
          if (!themeData.name || !themeData.colors) {
            throw new Error("Invalid theme file format");
          }

          // Ensure required properties
          const validatedTheme = validateTheme(themeData);
          if (!validatedTheme) {
            throw new Error("Theme validation failed");
          }

          // Generate new ID for imported theme
          validatedTheme.id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          validatedTheme.isCustom = true;
          validatedTheme.createdAt = new Date().toISOString();

          resolve(validatedTheme);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsText(file);
    });
  }, []);

  // Helper function to reset to default theme
  const resetToDefaultTheme = useCallback(() => {
    // Clear theme-related localStorage items
    localStorage.removeItem("selectedThemeId");
    localStorage.setItem("themeMode", "light");

    // Reset DOM
    const root = document.documentElement;
    const body = document.body;
    
    root.removeAttribute("data-theme");
    root.removeAttribute("data-theme-mode");
    body.removeAttribute("data-theme");
    body.removeAttribute("data-theme-mode");
    
    body.classList.remove(
      "dark-theme",
      "light-theme",
      "theme-dark",
      "theme-light",
      "dark-mode",
      "light-mode"
    );
    
    // Reset inline styles
    root.style.cssText = "";
    body.style.cssText = "";
    
    // Reset to default light theme
    applyThemeToDocument(defaultTheme, "light");
  }, [applyThemeToDocument]);

  // Generate theme ID
  const generateThemeId = useCallback(() => {
    return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Initialize themes on component mount
  useEffect(() => {
    if (isInitialized) return;
    
    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const allThemes = getAllAvailableThemes();
        setThemes(allThemes);

        // Separate custom themes
        const custom = allThemes.filter((theme) => theme.isCustom);
        setCustomThemes(custom);

        // Get saved preferences
        const savedThemeId = localStorage.getItem("selectedThemeId");
        const savedMode = localStorage.getItem("themeMode") || "light";
        const savedModeValid = ["light", "dark", "device"].includes(savedMode) ? savedMode : "light";
        
        let targetTheme = null;
        let targetMode = savedModeValid;

        // Handle device mode
        if (targetMode === "device") {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          targetMode = prefersDark ? "dark" : "light";
        }

        // Find the theme
        if (savedThemeId) {
          targetTheme = getThemeById(savedThemeId);
        }
        
        // If no saved theme or not found, use appropriate default
        if (!targetTheme) {
          targetTheme = targetMode === "dark" ? 
            getDarkThemeById("dark-default") || darkTheme : 
            getLightThemeById("light-default") || lightTheme;
        }

        // Apply the theme
        setCurrentTheme(targetTheme);
        setMode(targetMode);
        applyThemeToDocument(targetTheme, targetMode);
        
        // Save current state
        localStorage.setItem("selectedThemeId", targetTheme.id);
        localStorage.setItem("themeMode", targetMode);
        
        setIsInitialized(true);
        console.log("✅ Theme system initialized successfully");
      } catch (err) {
        setError(err.message);
        console.error("❌ Theme initialization error:", err);
        
        // Fallback to default light theme
        setCurrentTheme(defaultTheme);
        setMode("light");
        applyThemeToDocument(defaultTheme, "light");
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [isInitialized, getAllAvailableThemes, getThemeById, applyThemeToDocument]);

  // Handle system preference changes for device mode
  useEffect(() => {
    if (mode !== "device" || !isInitialized) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      const newMode = e.matches ? "dark" : "light";
      console.log("🖥️ System theme changed to:", newMode);
      
      if (currentTheme) {
        // Keep the same theme but apply with new mode
        applyThemeToDocument(currentTheme, newMode);
        setMode("device"); // Keep mode as device
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode, currentTheme, isInitialized, applyThemeToDocument]);

  // Set current theme
  const setTheme = useCallback((themeId) => {
    try {
      const theme = getThemeById(themeId);
      if (!theme) {
        throw new Error(`Theme with ID ${themeId} not found`);
      }

      // Determine mode
      const themeMode = theme.mode || mode;
      const finalMode = themeMode === "device" ? 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : 
        themeMode;

      setCurrentTheme(theme);
      setMode(finalMode);
      applyThemeToDocument(theme, finalMode);

      // Save to localStorage
      localStorage.setItem("selectedThemeId", themeId);
      localStorage.setItem("themeMode", finalMode);

      return theme;
    } catch (err) {
      setError(err.message);
      console.error("❌ Error setting theme:", err);
      return null;
    }
  }, [mode, getThemeById, applyThemeToDocument]);

  // Set theme mode
  const setModeHandler = useCallback((newMode) => {
    console.log("🎨 Setting mode to:", newMode);
    
    // Validate mode
    const validModes = ["light", "dark", "device"];
    if (!validModes.includes(newMode)) {
      console.warn("Invalid theme mode:", newMode);
      newMode = "light";
    }

    // Determine actual mode for application
    let actualMode = newMode;
    if (newMode === "device") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      actualMode = prefersDark ? "dark" : "light";
    }

    setMode(newMode);
    localStorage.setItem("themeMode", newMode);

    if (currentTheme) {
      // Apply current theme with new mode
      applyThemeToDocument(currentTheme, actualMode);
    } else {
      // Apply default theme with new mode
      const defaultThemeForMode = actualMode === "dark" ? 
        getDarkThemeById("dark-default") || darkTheme : 
        getLightThemeById("light-default") || lightTheme;
      
      setCurrentTheme(defaultThemeForMode);
      applyThemeToDocument(defaultThemeForMode, actualMode);
      localStorage.setItem("selectedThemeId", defaultThemeForMode.id);
    }
  }, [currentTheme, applyThemeToDocument]);

  // Apply theme
  const applyTheme = useCallback((theme, themeMode = mode) => {
    try {
      // Determine actual mode
      let actualMode = themeMode;
      if (themeMode === "device") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        actualMode = prefersDark ? "dark" : "light";
      }

      setCurrentTheme(theme);
      setMode(themeMode);
      applyThemeToDocument(theme, actualMode);

      // Save to localStorage
      localStorage.setItem("selectedThemeId", theme.id);
      localStorage.setItem("themeMode", themeMode);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error applying theme:", err);
    }
  }, [mode, applyThemeToDocument]);

  // Create custom theme
  const createCustomTheme = useCallback((name, colors, themeMode = mode) => {
    try {
      // Validate inputs
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new Error("Theme name is required");
      }

      if (!colors || typeof colors !== 'object') {
        throw new Error("Theme colors are required");
      }

      // Validate colors
      const colorKeys = [
        "primary",
        "secondary",
        "background",
        "surface",
        "textPrimary",
        "textSecondary"
      ];
      
      for (const key of colorKeys) {
        if (!colors[key]) {
          throw new Error(`Color value for ${key} is required`);
        }
        if (!isValidHexColor(colors[key])) {
          throw new Error(`Invalid color value for ${key}: ${colors[key]}. Must be a valid hex color.`);
        }
      }

      const newTheme = createNewTheme(name, colors, themeMode);

      // Update state
      setThemes(prev => {
        const updated = [...prev, newTheme];
        return updated.filter((theme, index, self) => 
          index === self.findIndex(t => t.id === theme.id)
        );
      });
      
      setCustomThemes(prev => {
        const updated = [...prev, newTheme];
        return updated.filter((theme, index, self) => 
          index === self.findIndex(t => t.id === theme.id)
        );
      });

      // Save to localStorage
      const savedCustomThemes = JSON.parse(
        localStorage.getItem("customThemes") || "[]"
      );
      
      // Remove duplicate by ID
      const filteredThemes = savedCustomThemes.filter(t => t.id !== newTheme.id);
      filteredThemes.push(newTheme);
      
      localStorage.setItem("customThemes", JSON.stringify(filteredThemes));

      console.log("✅ Custom theme created:", newTheme);
      return newTheme;
    } catch (err) {
      setError(err.message);
      console.error("❌ Error creating custom theme:", err);
      return null;
    }
  }, [mode, createNewTheme]);

  // Delete custom theme
  const deleteCustomTheme = useCallback((themeId) => {
    try {
      const success = deleteThemeById(themeId);
      if (!success) {
        throw new Error(`Failed to delete theme with ID ${themeId}`);
      }

      // Update state
      setThemes(prev => prev.filter(theme => theme.id !== themeId));
      setCustomThemes(prev => prev.filter(theme => theme.id !== themeId));

      // If current theme is being deleted, switch to default
      if (currentTheme?.id === themeId) {
        const defaultThemeForMode = mode === "dark" ? 
          getDarkThemeById("dark-default") || darkTheme : 
          getLightThemeById("light-default") || lightTheme;
        
        setCurrentTheme(defaultThemeForMode);
        applyThemeToDocument(defaultThemeForMode, mode);
        localStorage.setItem("selectedThemeId", defaultThemeForMode.id);
      }

      return success;
    } catch (err) {
      setError(err.message);
      console.error("❌ Error deleting custom theme:", err);
      return false;
    }
  }, [currentTheme, mode, deleteThemeById, applyThemeToDocument]);

  // Export theme
  const exportTheme = useCallback((theme = currentTheme) => {
    try {
      if (!theme) {
        throw new Error("No theme to export");
      }

      return exportThemeToFile(theme);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error exporting theme:", err);
      return false;
    }
  }, [currentTheme, exportThemeToFile]);

  // Import theme
  const importTheme = useCallback(async (file) => {
    try {
      setIsLoading(true);
      const importedTheme = await importThemeFromFile(file);

      if (!importedTheme) {
        throw new Error("Failed to import theme from file");
      }

      // Update state
      setThemes(prev => {
        const updated = [...prev, importedTheme];
        return updated.filter((theme, index, self) => 
          index === self.findIndex(t => t.id === theme.id)
        );
      });
      
      setCustomThemes(prev => {
        const updated = [...prev, importedTheme];
        return updated.filter((theme, index, self) => 
          index === self.findIndex(t => t.id === theme.id)
        );
      });

      // Save to localStorage
      const savedCustomThemes = JSON.parse(
        localStorage.getItem("customThemes") || "[]"
      );
      
      // Remove duplicate by ID
      const filteredThemes = savedCustomThemes.filter(t => t.id !== importedTheme.id);
      filteredThemes.push(importedTheme);
      
      localStorage.setItem("customThemes", JSON.stringify(filteredThemes));

      return importedTheme;
    } catch (err) {
      setError(err.message);
      console.error("❌ Error importing theme:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [importThemeFromFile]);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    try {
      resetToDefaultTheme();

      // Reset state
      setCurrentTheme(defaultTheme);
      setMode("light");

      // Save to localStorage
      localStorage.setItem("selectedThemeId", defaultTheme.id);
      localStorage.setItem("themeMode", "light");

      console.log("✅ Theme reset to default");
      return true;
    } catch (err) {
      setError(err.message);
      console.error("❌ Error resetting theme:", err);
      return false;
    }
  }, [resetToDefaultTheme]);

  // Context value
  const contextValue = useMemo(
    () => ({
      // State
      currentTheme,
      mode,
      themes,
      customThemes,
      isLoading,
      error,
      isInitialized,
      
      // Derived state
      isDarkMode: mode === 'dark',
      isLightMode: mode === 'light',
      isDeviceMode: mode === 'device',

      // Functions
      setTheme,
      setMode: setModeHandler,
      applyTheme,
      createCustomTheme,
      deleteCustomTheme,
      exportTheme,
      importTheme,
      resetTheme,
      
      // Utilities
      toggleMode: () => setModeHandler(mode === 'light' ? 'dark' : 'light'),
      getThemeById,
      getAllAvailableThemes,
    }),
    [
      currentTheme,
      mode,
      themes,
      customThemes,
      isLoading,
      error,
      isInitialized,
      setTheme,
      setModeHandler,
      applyTheme,
      createCustomTheme,
      deleteCustomTheme,
      exportTheme,
      importTheme,
      resetTheme,
      getThemeById,
      getAllAvailableThemes,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// ============================================================
// ✅ FIXED: Default export and named export both available
// ============================================================
export default ThemeProvider;