// src/utils/themes.jsx
// ✅ PROFESSIONAL INTERNATIONAL THEME SYSTEM

export const themes = {
  light: {
    name: 'light',
    label: 'Light',
    type: 'light',
    colors: {
      // ===== PRIMARY COLORS (BRAND COLOR) =====
      primary: '#2563EB',      // Professional Blue
      primaryLight: '#3B82F6', // Lighter Blue
      primaryDark: '#1D4ED8',  // Darker Blue
      
      // ===== NEUTRAL COLORS =====
      background: '#FFFFFF',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#F8FAFC',
      header: '#FFFFFF',
      
      // ===== TEXT COLORS =====
      textPrimary: '#1E293B',    // Slate 800
      textSecondary: '#64748B',  // Slate 600
      textDisabled: '#94A3B8',   // Slate 400
      textInverse: '#FFFFFF',
      
      // ===== BORDER & DIVIDER =====
      border: '#E2E8F0',        // Slate 200
      divider: '#F1F5F9',       // Slate 100
      
      // ===== STATES =====
      hover: '#F8FAFC',         // On hover
      selected: '#EFF6FF',      // When selected
      focused: '#DBEAFE',       // Focus state
      
      // ===== COMPONENTS =====
      button: {
        background: '#2563EB',
        text: '#FFFFFF',
        border: '#2563EB'
      },
      input: {
        background: '#FFFFFF',
        border: '#E2E8F0',
        text: '#1E293B'
      },
      table: {
        header: '#F8FAFC',
        rowEven: '#FFFFFF',
        rowOdd: '#F8FAFC',
        border: '#E2E8F0'
      },
      badge: {
        background: '#EFF6FF',
        text: '#1D4ED8',
        border: '#BFDBFE'
      },
      
      // ===== SEMANTIC COLORS =====
      success: '#10B981',       // Emerald 500
      warning: '#F59E0B',       // Amber 500
      error: '#EF4444',         // Red 500
      info: '#3B82F6',          // Blue 500
      
      // ===== GLASS EFFECT =====
      glass: 'rgba(255, 255, 255, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassShadow: 'rgba(0, 0, 0, 0.1)'
    }
  },
  
  dark: {
    name: 'dark',
    label: 'Dark',
    type: 'dark',
    colors: {
      // ===== PRIMARY COLORS =====
      primary: '#60A5FA',       // Light Blue
      primaryLight: '#93C5FD',  // Lighter Blue
      primaryDark: '#3B82F6',   // Blue 500
      
      // ===== NEUTRAL COLORS =====
      background: '#0F172A',    // Slate 900
      surface: '#1E293B',       // Slate 800
      card: '#1E293B',
      sidebar: '#0F172A',
      header: '#1E293B',
      
      // ===== TEXT COLORS =====
      textPrimary: '#F1F5F9',   // Slate 100
      textSecondary: '#CBD5E1', // Slate 300
      textDisabled: '#64748B',  // Slate 600
      textInverse: '#0F172A',
      
      // ===== BORDER & DIVIDER =====
      border: '#334155',        // Slate 700
      divider: '#1E293B',       // Slate 800
      
      // ===== STATES =====
      hover: '#334155',         // On hover
      selected: '#1E40AF',      // When selected
      focused: '#1E40AF',       // Focus state
      
      // ===== COMPONENTS =====
      button: {
        background: '#3B82F6',
        text: '#FFFFFF',
        border: '#3B82F6'
      },
      input: {
        background: '#1E293B',
        border: '#334155',
        text: '#F1F5F9'
      },
      table: {
        header: '#1E293B',
        rowEven: '#1E293B',
        rowOdd: '#0F172A',
        border: '#334155'
      },
      badge: {
        background: '#1E3A8A',
        text: '#60A5FA',
        border: '#1E40AF'
      },
      
      // ===== SEMANTIC COLORS =====
      success: '#10B981',       // Same for consistency
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      
      // ===== GLASS EFFECT =====
      glass: 'rgba(30, 41, 59, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.3)'
    }
  },
  
  professional: {
    name: 'professional',
    label: 'Professional',
    type: 'light',
    colors: {
      // ===== PRIMARY COLORS (Corporate Blue) =====
      primary: '#1E40AF',       // Deep Professional Blue
      primaryLight: '#3B82F6',
      primaryDark: '#1D4ED8',
      
      // ===== NEUTRAL COLORS (Clean & Modern) =====
      background: '#F8FAFC',    // Very Light Gray
      surface: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#FFFFFF',
      header: '#FFFFFF',
      
      // ===== TEXT COLORS =====
      textPrimary: '#1E293B',    // Professional Dark
      textSecondary: '#475569',  // Medium Gray
      textDisabled: '#94A3B8',
      textInverse: '#FFFFFF',
      
      // ===== BORDER & DIVIDER =====
      border: '#E2E8F0',        // Soft Gray
      divider: '#F1F5F9',
      
      // ===== STATES =====
      hover: '#F1F5F9',
      selected: '#EFF6FF',
      focused: '#DBEAFE',
      
      // ===== COMPONENTS =====
      button: {
        background: '#1E40AF',
        text: '#FFFFFF',
        border: '#1E40AF'
      },
      input: {
        background: '#FFFFFF',
        border: '#CBD5E1',
        text: '#1E293B'
      },
      table: {
        header: '#F1F5F9',
        rowEven: '#FFFFFF',
        rowOdd: '#F8FAFC',
        border: '#E2E8F0'
      },
      badge: {
        background: '#EFF6FF',
        text: '#1E40AF',
        border: '#BFDBFE'
      },
      
      // ===== SEMANTIC COLORS =====
      success: '#059669',       // Professional Green
      warning: '#D97706',       // Professional Amber
      error: '#DC2626',         // Professional Red
      info: '#2563EB',          // Professional Blue
      
      // ===== GLASS EFFECT =====
      glass: 'rgba(255, 255, 255, 0.9)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassShadow: 'rgba(0, 0, 0, 0.08)'
    }
  },
  
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    type: 'dark',
    colors: {
      // ===== PRIMARY COLORS =====
      primary: '#818CF8',       // Indigo 400
      primaryLight: '#A5B4FC',
      primaryDark: '#6366F1',
      
      // ===== NEUTRAL COLORS =====
      background: '#111827',    // Gray 900
      surface: '#1F2937',       // Gray 800
      card: '#1F2937',
      sidebar: '#111827',
      header: '#1F2937',
      
      // ===== TEXT COLORS =====
      textPrimary: '#F9FAFB',   // Gray 50
      textSecondary: '#D1D5DB', // Gray 300
      textDisabled: '#6B7280',
      textInverse: '#111827',
      
      // ===== BORDER & DIVIDER =====
      border: '#374151',        // Gray 700
      divider: '#1F2937',
      
      // ===== STATES =====
      hover: '#374151',
      selected: '#4F46E5',
      focused: '#4F46E5',
      
      // ===== COMPONENTS =====
      button: {
        background: '#4F46E5',
        text: '#FFFFFF',
        border: '#4F46E5'
      },
      input: {
        background: '#1F2937',
        border: '#374151',
        text: '#F9FAFB'
      },
      table: {
        header: '#1F2937',
        rowEven: '#1F2937',
        rowOdd: '#111827',
        border: '#374151'
      },
      badge: {
        background: '#3730A3',
        text: '#818CF8',
        border: '#4F46E5'
      },
      
      // ===== SEMANTIC COLORS =====
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      
      // ===== GLASS EFFECT =====
      glass: 'rgba(31, 41, 55, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      glassShadow: 'rgba(0, 0, 0, 0.25)'
    }
  }
};

export default themes;