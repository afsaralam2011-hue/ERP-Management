// src/contexts/ThemeProvider.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ThemeContext } from "./ThemeContext";
import { defaultTheme, predefinedThemes } from "../styles/themes/theme-config";
import { isValidHexColor } from "../utils/themeUtils";

const ThemeProvider = ({ children }) => {
  // State
  const [currentTheme, setCurrentTheme] = useState(null);
  const [mode, setMode] = useState("light");
  const [themes, setThemes] = useState([]);
  const [customThemes, setCustomThemes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get all themes
  const getAllThemes = () => {
    try {
      // Get predefined themes from theme config
      const predefined = predefinedThemes || [];

      // Get custom themes from localStorage
      const savedCustomThemes = JSON.parse(
        localStorage.getItem("customThemes") || "[]",
      );

      // Combine both
      return [...predefined, ...savedCustomThemes];
    } catch (err) {
      console.error("Error getting all themes:", err);
      return [];
    }
  };

  // Helper function to get theme by ID
  const getThemeById = (themeId) => {
    const allThemes = getAllThemes();
    return allThemes.find((theme) => theme.id === themeId) || null;
  };

  // تمام عناصر کو تھیم اپلائی کرنے کا نیا فنکشن
  const applyThemeToAllElements = (theme, themeMode) => {
    try {
      const root = document.documentElement;
      const colors = theme.colors || {};

      // 1. Clear previous theme attributes
      root.removeAttribute("data-theme");
      document.body.removeAttribute("data-theme");

      // 2. Set theme mode
      const isDarkMode = themeMode === "dark";

      if (isDarkMode) {
        // Dark theme کے لیے
        root.setAttribute("data-theme", "dark");
        document.body.setAttribute("data-theme", "dark");
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");

        // تمام عام کلاسیں
        document.body.classList.add("theme-dark");
        document.body.classList.remove("theme-light");
      } else {
        // Light theme کے لیے
        root.setAttribute("data-theme", "light");
        document.body.setAttribute("data-theme", "light");
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");

        // تمام عام کلاسیں
        document.body.classList.add("theme-light");
        document.body.classList.remove("theme-dark");
      }

      // 3. Apply CSS variables to all common elements
      const applyToAllSelectors = () => {
        // Backgrounds
        const backgroundSelectors = [
          ".sidebar",
          ".side-nav",
          ".nav-menu",
          ".navigation",
          ".card",
          ".panel",
          ".modal",
          ".dialog",
          ".header",
          ".navbar",
          ".app-bar",
          ".container",
          ".section",
          ".content",
          "aside",
          "nav",
          "header",
          "footer",
        ];

        // Texts
        const textSelectors = [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          "span",
          "div",
          "a",
          "li",
          "td",
          "th",
          ".text",
          ".title",
          ".subtitle",
          ".label",
          "button",
          "input",
          "textarea",
          "select",
        ];

        // Apply to all
        backgroundSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => {
            if (isDarkMode) {
              el.style.backgroundColor = "#1E1E1E";
              el.style.color = "#FFFFFF";
            } else {
              el.style.backgroundColor = "#FFFFFF";
              el.style.color = "#212121";
            }
          });
        });

        textSelectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((el) => {
            if (isDarkMode) {
              el.style.color = "#FFFFFF";
            } else {
              el.style.color = "#212121";
            }
          });
        });
      };

      // 4. Set global CSS variables
      if (isDarkMode) {
        // Dark mode CSS variables
        root.style.setProperty("--color-background", "#121212");
        root.style.setProperty("--color-surface", "#1E1E1E");
        root.style.setProperty("--color-text-primary", "#FFFFFF");
        root.style.setProperty("--color-text-secondary", "#B0B0B0");
        root.style.setProperty("--color-border", "#333333");
        root.style.setProperty("--theme-mode", "dark");

        // Force dark background and text
        document.body.style.backgroundColor = "#121212";
        document.body.style.color = "#FFFFFF";
      } else {
        // Light mode CSS variables
        root.style.setProperty("--color-background", "#FFFFFF");
        root.style.setProperty("--color-surface", "#F5F5F5");
        root.style.setProperty("--color-text-primary", "#212121");
        root.style.setProperty("--color-text-secondary", "#757575");
        root.style.setProperty("--color-border", "#E0E0E0");
        root.style.setProperty("--theme-mode", "light");

        // Force light background and text
        document.body.style.backgroundColor = "#FFFFFF";
        document.body.style.color = "#212121";
      }

      // 5. Apply theme-specific colors
      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
        root.style.setProperty(`--theme-${key}`, value);
      });

      // 6. Apply to all elements after a short delay
      setTimeout(() => {
        applyToAllSelectors();

        // Apply to React root if exists
        const rootElement = document.getElementById("root");
        if (rootElement) {
          if (isDarkMode) {
            rootElement.style.backgroundColor = "#121212";
            rootElement.style.color = "#FFFFFF";
          } else {
            rootElement.style.backgroundColor = "#FFFFFF";
            rootElement.style.color = "#212121";
          }
        }
      }, 100);
    } catch (err) {
      console.error("Error applying theme to all elements:", err);
    }
  };

  // Helper function to create new theme
  const createNewTheme = (name, colors, themeMode) => {
    const themeId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: themeId,
      name: name,
      colors: {
        primary: colors.primary || "#1976D2",
        secondary: colors.secondary || "#DC004E",
        background: colors.background || "#FFFFFF",
        surface: colors.surface || "#F5F5F5",
        textPrimary:
          colors.textPrimary || (themeMode === "dark" ? "#7986CB" : "#1A237E"),
        textSecondary:
          colors.textSecondary ||
          (themeMode === "dark" ? "#9FA8DA" : "#283593"),
        primaryLight: "#64b5f6",
        primaryDark: "#1565c0",
      },
      mode: themeMode || "light",
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
  };

  // Helper function to delete theme by ID
  const deleteThemeById = (themeId) => {
    try {
      const savedCustomThemes = JSON.parse(
        localStorage.getItem("customThemes") || "[]",
      );
      const updatedThemes = savedCustomThemes.filter(
        (theme) => theme.id !== themeId,
      );
      localStorage.setItem("customThemes", JSON.stringify(updatedThemes));
      return true;
    } catch (err) {
      console.error("Error deleting theme:", err);
      return false;
    }
  };

  // Helper function to export theme to file
  const exportThemeToFile = (theme) => {
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
  };

  // Helper function to import theme from file
  const importThemeFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target.result);

          // Validate theme data
          if (
            !themeData.name ||
            !themeData.colors ||
            !themeData.colors.primary
          ) {
            throw new Error("Invalid theme file format");
          }

          // Generate new ID for imported theme
          themeData.id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          themeData.isCustom = true;
          themeData.createdAt = new Date().toISOString();

          resolve(themeData);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      reader.readAsText(file);
    });
  };

  // Helper function to reset to default theme
  const resetToDefaultTheme = () => {
    // Clear theme-related localStorage items
    localStorage.removeItem("selectedThemeId");
    localStorage.removeItem("themeMode");

    // Reset DOM
    const root = document.documentElement;
    root.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");
    document.body.classList.remove(
      "dark-theme",
      "light-theme",
      "theme-dark",
      "theme-light",
    );
    document.body.style.color = "";
    document.body.style.backgroundColor = "";

    // Reset CSS variables to default
    root.style.cssText = "";
  };

  // Generate theme ID
  const generateThemeId = () => {
    return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize themes on component mount
  useEffect(() => {
    try {
      setIsLoading(true);
      const allThemes = getAllThemes();
      setThemes(allThemes);

      // Separate custom themes
      const custom = allThemes.filter((theme) => theme.isCustom);
      setCustomThemes(custom);

      // Get saved theme from localStorage or use default
      const savedThemeId = localStorage.getItem("selectedThemeId");
      const savedMode = localStorage.getItem("themeMode") || "light";

      if (savedThemeId) {
        const theme = getThemeById(savedThemeId);
        if (theme) {
          setCurrentTheme(theme);
          setMode(savedMode);
          applyThemeToAllElements(theme, savedMode);
        } else {
          // If saved theme not found, use default
          setCurrentTheme(defaultTheme);
          setMode(savedMode);
          applyThemeToAllElements(defaultTheme, savedMode);
        }
      } else {
        // Use default theme
        setCurrentTheme(defaultTheme);
        setMode(savedMode);
        applyThemeToAllElements(defaultTheme, savedMode);
      }
    } catch (err) {
      setError(err.message);
      console.error("Theme initialization error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle system preference changes
  useEffect(() => {
    if (mode === "device") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e) => {
        const newMode = e.matches ? "dark" : "light";
        if (currentTheme) {
          applyThemeToAllElements(currentTheme, newMode);
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [mode, currentTheme]);

  // Set current theme
  const setTheme = useCallback(
    (themeId) => {
      try {
        const theme = getThemeById(themeId);
        if (!theme) {
          throw new Error(`Theme with ID ${themeId} not found`);
        }

        setCurrentTheme(theme);
        applyThemeToAllElements(theme, mode);

        // Save to localStorage
        localStorage.setItem("selectedThemeId", themeId);

        return theme;
      } catch (err) {
        setError(err.message);
        console.error("Error setting theme:", err);
        return null;
      }
    },
    [mode],
  );

  // Set theme mode
  const setModeHandler = useCallback(
    (newMode) => {
      console.log("Setting mode to:", newMode);
      setMode(newMode);
      localStorage.setItem("themeMode", newMode);

      if (currentTheme) {
        applyThemeToAllElements(currentTheme, newMode);
      } else {
        // If no current theme, apply default theme with new mode
        applyThemeToAllElements(defaultTheme, newMode);
      }
    },
    [currentTheme],
  );

  // Apply theme
  const applyTheme = useCallback(
    (theme, themeMode = mode) => {
      try {
        applyThemeToAllElements(theme, themeMode);
        setCurrentTheme(theme);
        localStorage.setItem("selectedThemeId", theme.id);
      } catch (err) {
        setError(err.message);
        console.error("Error applying theme:", err);
      }
    },
    [mode],
  );

  // Create custom theme
  const createCustomTheme = useCallback(
    (name, colors, themeMode = mode) => {
      try {
        // Validate colors
        const colorKeys = [
          "primary",
          "secondary",
          "background",
          "surface",
          "textPrimary",
          "textSecondary",
        ];
        for (const key of colorKeys) {
          if (!colors[key] || !isValidHexColor(colors[key])) {
            throw new Error(`Invalid color value for ${key}: ${colors[key]}`);
          }
        }

        const newTheme = createNewTheme(name, colors, themeMode);

        // Update state
        setThemes((prev) => [...prev, newTheme]);
        setCustomThemes((prev) => [...prev, newTheme]);

        // Save to localStorage
        const savedCustomThemes = JSON.parse(
          localStorage.getItem("customThemes") || "[]",
        );
        savedCustomThemes.push(newTheme);
        localStorage.setItem("customThemes", JSON.stringify(savedCustomThemes));

        return newTheme;
      } catch (err) {
        setError(err.message);
        console.error("Error creating custom theme:", err);
        return null;
      }
    },
    [mode],
  );

  // Delete custom theme
  const deleteCustomTheme = useCallback(
    (themeId) => {
      try {
        const success = deleteThemeById(themeId);
        if (!success) {
          throw new Error(`Failed to delete theme with ID ${themeId}`);
        }

        // Update state
        setThemes((prev) => prev.filter((theme) => theme.id !== themeId));
        setCustomThemes((prev) => prev.filter((theme) => theme.id !== themeId));

        // If current theme is being deleted, switch to default
        if (currentTheme?.id === themeId) {
          setCurrentTheme(defaultTheme);
          applyThemeToAllElements(defaultTheme, mode);
          localStorage.setItem("selectedThemeId", defaultTheme.id);
        }

        return success;
      } catch (err) {
        setError(err.message);
        console.error("Error deleting custom theme:", err);
        return false;
      }
    },
    [currentTheme, mode],
  );

  // Export theme
  const exportTheme = useCallback(
    (theme = currentTheme) => {
      try {
        if (!theme) {
          throw new Error("No theme to export");
        }

        return exportThemeToFile(theme);
      } catch (err) {
        setError(err.message);
        console.error("Error exporting theme:", err);
        return false;
      }
    },
    [currentTheme],
  );

  // Import theme
  const importTheme = useCallback(async (file) => {
    try {
      setIsLoading(true);
      const importedTheme = await importThemeFromFile(file);

      if (!importedTheme) {
        throw new Error("Failed to import theme from file");
      }

      // Check if theme with same ID already exists
      const existingTheme = getThemeById(importedTheme.id);
      if (existingTheme) {
        // Generate new ID for imported theme
        importedTheme.id = generateThemeId();
        importedTheme.name = `${importedTheme.name} (Imported)`;
      }

      // Add to custom themes
      importedTheme.isCustom = true;
      importedTheme.createdAt = new Date().toISOString();

      // Update state
      setThemes((prev) => [...prev, importedTheme]);
      setCustomThemes((prev) => [...prev, importedTheme]);

      // Save to localStorage
      const savedCustomThemes = JSON.parse(
        localStorage.getItem("customThemes") || "[]",
      );
      savedCustomThemes.push(importedTheme);
      localStorage.setItem("customThemes", JSON.stringify(savedCustomThemes));

      return importedTheme;
    } catch (err) {
      setError(err.message);
      console.error("Error importing theme:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    try {
      resetToDefaultTheme();

      // Reset state
      setCurrentTheme(defaultTheme);
      setMode("light");

      // Clear localStorage
      localStorage.removeItem("selectedThemeId");
      localStorage.setItem("themeMode", "light");

      // Apply default theme
      applyThemeToAllElements(defaultTheme, "light");

      return true;
    } catch (err) {
      setError(err.message);
      console.error("Error resetting theme:", err);
      return false;
    }
  }, []);

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

      // Functions
      setTheme,
      setMode: setModeHandler,
      applyTheme,
      createCustomTheme,
      deleteCustomTheme,
      exportTheme,
      importTheme,
      resetTheme,
    }),
    [
      currentTheme,
      mode,
      themes,
      customThemes,
      isLoading,
      error,
      setTheme,
      setModeHandler,
      applyTheme,
      createCustomTheme,
      deleteCustomTheme,
      exportTheme,
      importTheme,
      resetTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
