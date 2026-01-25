// src/utils/themes.jsx
// ✅ COMPLETE THEME SYSTEM WITH 12 THEMES (6 LIGHT + 6 DARK)

export const themes = {
  // ==================== LIGHT THEMES ====================
  
  indigo: {
    name: 'indigo',
    label: 'Indigo Blue',
    type: 'light',
    colors: {
      primary: '#4F46E5',
      primaryLight: '#6366F1',
      primaryDark: '#4338CA',
      
      background: '#EEF2FF',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#E0E7FF',
      header: '#4F46E5',
      subHeader: '#6366F1',
      
      textPrimary: '#312E81',
      textSecondary: '#4F46E5',
      textDisabled: '#A5B4FC',
      textInverse: '#FFFFFF',
      
      border: '#C7D2FE',
      divider: '#E0E7FF',
      tableBorder: '#A5B4FC',
      lineColor: '#818CF8',
      
      hover: '#C7D2FE',
      selected: '#818CF8',
      focused: '#A5B4FC',
      
      button: {
        background: '#4F46E5',
        text: '#FFFFFF',
        border: '#4F46E5',
        hover: '#4338CA'
      },
      
      input: {
        background: '#FFFFFF',
        border: '#C7D2FE',
        text: '#312E81',
        focus: '#4F46E5'
      },
      
      table: {
        header: '#E0E7FF',
        rowEven: '#F8FAFF',
        rowOdd: '#FFFFFF',
        border: '#A5B4FC',
        line: '#C7D2FE'
      },
      
      badge: {
        background: '#E0E7FF',
        text: '#4F46E5',
        border: '#A5B4FC'
      },
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#4F46E5',
      
      glass: 'rgba(238, 242, 255, 0.9)',
      glassBorder: 'rgba(79, 70, 229, 0.2)',
      glassShadow: 'rgba(79, 70, 229, 0.1)'
    }
  },

  emerald: {
    name: 'emerald',
    label: 'Emerald Green',
    type: 'light',
    colors: {
      primary: '#059669',
      primaryLight: '#10B981',
      primaryDark: '#047857',
      
      background: '#ECFDF5',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#D1FAE5',
      header: '#059669',
      subHeader: '#10B981',
      
      textPrimary: '#064E3B',
      textSecondary: '#059669',
      textDisabled: '#86EFAC',
      textInverse: '#FFFFFF',
      
      border: '#A7F3D0',
      divider: '#D1FAE5',
      tableBorder: '#6EE7B7',
      lineColor: '#34D399',
      
      hover: '#A7F3D0',
      selected: '#34D399',
      focused: '#6EE7B7',
      
      button: {
        background: '#059669',
        text: '#FFFFFF',
        border: '#059669',
        hover: '#047857'
      },
      
      input: {
        background: '#FFFFFF',
        border: '#A7F3D0',
        text: '#064E3B',
        focus: '#059669'
      },
      
      table: {
        header: '#D1FAE5',
        rowEven: '#F0FDF9',
        rowOdd: '#FFFFFF',
        border: '#6EE7B7',
        line: '#A7F3D0'
      },
      
      badge: {
        background: '#D1FAE5',
        text: '#059669',
        border: '#6EE7B7'
      },
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#059669',
      
      glass: 'rgba(236, 253, 245, 0.9)',
      glassBorder: 'rgba(5, 150, 105, 0.2)',
      glassShadow: 'rgba(5, 150, 105, 0.1)'
    }
  },

  amber: {
    name: 'amber',
    label: 'Amber Gold',
    type: 'light',
    colors: {
      primary: '#D97706',
      primaryLight: '#F59E0B',
      primaryDark: '#B45309',
      
      background: '#FFFBEB',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#FEF3C7',
      header: '#D97706',
      subHeader: '#F59E0B',
      
      textPrimary: '#78350F',
      textSecondary: '#D97706',
      textDisabled: '#FCD34D',
      textInverse: '#FFFFFF',
      
      border: '#FDE68A',
      divider: '#FEF3C7',
      tableBorder: '#FBBF24',
      lineColor: '#F59E0B',
      
      hover: '#FDE68A',
      selected: '#FBBF24',
      focused: '#FCD34D',
      
      button: {
        background: '#D97706',
        text: '#FFFFFF',
        border: '#D97706',
        hover: '#B45309'
      },
      
      input: {
        background: '#FFFFFF',
        border: '#FDE68A',
        text: '#78350F',
        focus: '#D97706'
      },
      
      table: {
        header: '#FEF3C7',
        rowEven: '#FFF8E1',
        rowOdd: '#FFFFFF',
        border: '#FBBF24',
        line: '#FDE68A'
      },
      
      badge: {
        background: '#FEF3C7',
        text: '#D97706',
        border: '#FBBF24'
      },
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#D97706',
      
      glass: 'rgba(255, 251, 235, 0.9)',
      glassBorder: 'rgba(217, 119, 6, 0.2)',
      glassShadow: 'rgba(217, 119, 6, 0.1)'
    }
  },

  rose: {
    name: 'rose',
    label: 'Rose Pink',
    type: 'light',
    colors: {
      primary: '#E11D48',
      primaryLight: '#F43F5E',
      primaryDark: '#BE123C',
      
      background: '#FFF1F2',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#FFE4E6',
      header: '#E11D48',
      subHeader: '#F43F5E',
      
      textPrimary: '#881337',
      textSecondary: '#E11D48',
      textDisabled: '#FDA4AF',
      textInverse: '#FFFFFF',
      
      border: '#FECDD3',
      divider: '#FFE4E6',
      tableBorder: '#FB7185',
      lineColor: '#F43F5E',
      
      hover: '#FECDD3',
      selected: '#FB7185',
      focused: '#FDA4AF',
      
      button: {
        background: '#E11D48',
        text: '#FFFFFF',
        border: '#E11D48',
        hover: '#BE123C'
      },
      
      input: {
        background: '#FFFFFF',
        border: '#FECDD3',
        text: '#881337',
        focus: '#E11D48'
      },
      
      table: {
        header: '#FFE4E6',
        rowEven: '#FFF5F7',
        rowOdd: '#FFFFFF',
        border: '#FB7185',
        line: '#FECDD3'
      },
      
      badge: {
        background: '#FFE4E6',
        text: '#E11D48',
        border: '#FB7185'
      },
      
      success: '#059669',
      warning: '#D97706',
      error: '#E11D48',
      info: '#E11D48',
      
      glass: 'rgba(255, 241, 242, 0.9)',
      glassBorder: 'rgba(225, 29, 72, 0.2)',
      glassShadow: 'rgba(225, 29, 72, 0.1)'
    }
  },

  violet: {
    name: 'violet',
    label: 'Violet Purple',
    type: 'light',
    colors: {
      primary: '#7C3AED',
      primaryLight: '#8B5CF6',
      primaryDark: '#6D28D9',
      
      background: '#F5F3FF',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#EDE9FE',
      header: '#7C3AED',
      subHeader: '#8B5CF6',
      
      textPrimary: '#4C1D95',
      textSecondary: '#7C3AED',
      textDisabled: '#C4B5FD',
      textInverse: '#FFFFFF',
      
      border: '#DDD6FE',
      divider: '#EDE9FE',
      tableBorder: '#A78BFA',
      lineColor: '#8B5CF6',
      
      hover: '#DDD6FE',
      selected: '#A78BFA',
      focused: '#C4B5FD',
      
      button: {
        background: '#7C3AED',
        text: '#FFFFFF',
        border: '#7C3AED',
        hover: '#6D28D9'
      },
      
      input: {
        background: '#FFFFFF',
        border: '#DDD6FE',
        text: '#4C1D95',
        focus: '#7C3AED'
      },
      
      table: {
        header: '#EDE9FE',
        rowEven: '#F8F7FF',
        rowOdd: '#FFFFFF',
        border: '#A78BFA',
        line: '#DDD6FE'
      },
      
      badge: {
        background: '#EDE9FE',
        text: '#7C3AED',
        border: '#A78BFA'
      },
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#7C3AED',
      
      glass: 'rgba(245, 243, 255, 0.9)',
      glassBorder: 'rgba(124, 58, 237, 0.2)',
      glassShadow: 'rgba(124, 58, 237, 0.1)'
    }
  },

  slate: {
    name: 'slate',
    label: 'Slate Gray',
    type: 'light',
    colors: {
      primary: '#475569',
      primaryLight: '#64748B',
      primaryDark: '#334155',
      
      background: '#F8FAFC',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#F1F5F9',
      header: '#475569',
      subHeader: '#64748B',
      
      textPrimary: '#1E293B',
      textSecondary: '#475569',
      textDisabled: '#94A3B8',
      textInverse: '#FFFFFF',
      
      border: '#E2E8F0',
      divider: '#F1F5F9',
      tableBorder: '#CBD5E1',
      lineColor: '#64748B',
      
      hover: '#E2E8F0',
      selected: '#CBD5E1',
      focused: '#94A3B8',
      
      button: {
        background: '#475569',
        text: '#FFFFFF',
        border: '#475569',
        hover: '#334155'
      },
      
      input: {
        background: '#FFFFFF',
        border: '#E2E8F0',
        text: '#1E293B',
        focus: '#475569'
      },
      
      table: {
        header: '#F1F5F9',
        rowEven: '#F8FAFC',
        rowOdd: '#FFFFFF',
        border: '#CBD5E1',
        line: '#E2E8F0'
      },
      
      badge: {
        background: '#F1F5F9',
        text: '#475569',
        border: '#CBD5E1'
      },
      
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#475569',
      
      glass: 'rgba(248, 250, 252, 0.9)',
      glassBorder: 'rgba(71, 85, 105, 0.2)',
      glassShadow: 'rgba(71, 85, 105, 0.1)'
    }
  },

  // ==================== DARK THEMES ====================
  
  dark_indigo: {
    name: 'dark_indigo',
    label: 'Dark Indigo',
    type: 'dark',
    colors: {
      primary: '#818CF8',
      primaryLight: '#A5B4FC',
      primaryDark: '#6366F1',
      
      background: '#0F172A',
      surface: '#1E293B',
      card: '#1E293B',
      sidebar: '#0F172A',
      header: '#1E293B',
      subHeader: '#334155',
      
      textPrimary: '#F1F5F9',
      textSecondary: '#CBD5E1',
      textDisabled: '#64748B',
      textInverse: '#0F172A',
      
      border: '#334155',
      divider: '#1E293B',
      tableBorder: '#475569',
      lineColor: '#475569',
      
      hover: '#334155',
      selected: '#475569',
      focused: '#6366F1',
      
      button: {
        background: '#6366F1',
        text: '#FFFFFF',
        border: '#6366F1',
        hover: '#4F46E5'
      },
      
      input: {
        background: '#1E293B',
        border: '#334155',
        text: '#F1F5F9',
        focus: '#818CF8'
      },
      
      table: {
        header: '#1E293B',
        rowEven: '#1E293B',
        rowOdd: '#0F172A',
        border: '#334155',
        line: '#475569'
      },
      
      badge: {
        background: '#1E293B',
        text: '#818CF8',
        border: '#334155'
      },
      
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#818CF8',
      
      glass: 'rgba(30, 41, 59, 0.85)',
      glassBorder: 'rgba(148, 163, 184, 0.15)',
      glassShadow: 'rgba(0, 0, 0, 0.3)'
    }
  },

  dark_emerald: {
    name: 'dark_emerald',
    label: 'Dark Emerald',
    type: 'dark',
    colors: {
      primary: '#34D399',
      primaryLight: '#6EE7B7',
      primaryDark: '#10B981',
      
      background: '#064E3B',
      surface: '#065F46',
      card: '#065F46',
      sidebar: '#064E3B',
      header: '#065F46',
      subHeader: '#047857',
      
      textPrimary: '#D1FAE5',
      textSecondary: '#A7F3D0',
      textDisabled: '#6EE7B7',
      textInverse: '#064E3B',
      
      border: '#047857',
      divider: '#065F46',
      tableBorder: '#059669',
      lineColor: '#059669',
      
      hover: '#047857',
      selected: '#059669',
      focused: '#34D399',
      
      button: {
        background: '#10B981',
        text: '#064E3B',
        border: '#10B981',
        hover: '#059669'
      },
      
      input: {
        background: '#065F46',
        border: '#047857',
        text: '#D1FAE5',
        focus: '#34D399'
      },
      
      table: {
        header: '#065F46',
        rowEven: '#065F46',
        rowOdd: '#064E3B',
        border: '#047857',
        line: '#059669'
      },
      
      badge: {
        background: '#065F46',
        text: '#34D399',
        border: '#047857'
      },
      
      success: '#34D399',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#34D399',
      
      glass: 'rgba(6, 95, 70, 0.85)',
      glassBorder: 'rgba(52, 211, 153, 0.15)',
      glassShadow: 'rgba(0, 0, 0, 0.3)'
    }
  },

  dark_amber: {
    name: 'dark_amber',
    label: 'Dark Amber',
    type: 'dark',
    colors: {
      primary: '#FBBF24',
      primaryLight: '#FCD34D',
      primaryDark: '#F59E0B',
      
      background: '#78350F',
      surface: '#92400E',
      card: '#92400E',
      sidebar: '#78350F',
      header: '#92400E',
      subHeader: '#B45309',
      
      textPrimary: '#FEF3C7',
      textSecondary: '#FDE68A',
      textDisabled: '#FCD34D',
      textInverse: '#78350F',
      
      border: '#B45309',
      divider: '#92400E',
      tableBorder: '#D97706',
      lineColor: '#D97706',
      
      hover: '#B45309',
      selected: '#D97706',
      focused: '#FBBF24',
      
      button: {
        background: '#F59E0B',
        text: '#78350F',
        border: '#F59E0B',
        hover: '#D97706'
      },
      
      input: {
        background: '#92400E',
        border: '#B45309',
        text: '#FEF3C7',
        focus: '#FBBF24'
      },
      
      table: {
        header: '#92400E',
        rowEven: '#92400E',
        rowOdd: '#78350F',
        border: '#B45309',
        line: '#D97706'
      },
      
      badge: {
        background: '#92400E',
        text: '#FBBF24',
        border: '#B45309'
      },
      
      success: '#10B981',
      warning: '#FBBF24',
      error: '#EF4444',
      info: '#FBBF24',
      
      glass: 'rgba(146, 64, 14, 0.85)',
      glassBorder: 'rgba(251, 191, 36, 0.15)',
      glassShadow: 'rgba(0, 0, 0, 0.3)'
    }
  },

  dark_rose: {
    name: 'dark_rose',
    label: 'Dark Rose',
    type: 'dark',
    colors: {
      primary: '#FB7185',
      primaryLight: '#FDA4AF',
      primaryDark: '#F43F5E',
      
      background: '#881337',
      surface: '#9F1239',
      card: '#9F1239',
      sidebar: '#881337',
      header: '#9F1239',
      subHeader: '#BE123C',
      
      textPrimary: '#FFE4E6',
      textSecondary: '#FECDD3',
      textDisabled: '#FDA4AF',
      textInverse: '#881337',
      
      border: '#BE123C',
      divider: '#9F1239',
      tableBorder: '#E11D48',
      lineColor: '#E11D48',
      
      hover: '#BE123C',
      selected: '#E11D48',
      focused: '#FB7185',
      
      button: {
        background: '#F43F5E',
        text: '#881337',
        border: '#F43F5E',
        hover: '#E11D48'
      },
      
      input: {
        background: '#9F1239',
        border: '#BE123C',
        text: '#FFE4E6',
        focus: '#FB7185'
      },
      
      table: {
        header: '#9F1239',
        rowEven: '#9F1239',
        rowOdd: '#881337',
        border: '#BE123C',
        line: '#E11D48'
      },
      
      badge: {
        background: '#9F1239',
        text: '#FB7185',
        border: '#BE123C'
      },
      
      success: '#10B981',
      warning: '#F59E0B',
      error: '#FB7185',
      info: '#FB7185',
      
      glass: 'rgba(159, 18, 57, 0.85)',
      glassBorder: 'rgba(251, 113, 133, 0.15)',
      glassShadow: 'rgba(0, 0, 0, 0.3)'
    }
  },

  dark_violet: {
    name: 'dark_violet',
    label: 'Dark Violet',
    type: 'dark',
    colors: {
      primary: '#A78BFA',
      primaryLight: '#C4B5FD',
      primaryDark: '#8B5CF6',
      
      background: '#4C1D95',
      surface: '#5B21B6',
      card: '#5B21B6',
      sidebar: '#4C1D95',
      header: '#5B21B6',
      subHeader: '#6D28D9',
      
      textPrimary: '#EDE9FE',
      textSecondary: '#DDD6FE',
      textDisabled: '#C4B5FD',
      textInverse: '#4C1D95',
      
      border: '#6D28D9',
      divider: '#5B21B6',
      tableBorder: '#7C3AED',
      lineColor: '#7C3AED',
      
      hover: '#6D28D9',
      selected: '#7C3AED',
      focused: '#A78BFA',
      
      button: {
        background: '#8B5CF6',
        text: '#4C1D95',
        border: '#8B5CF6',
        hover: '#7C3AED'
      },
      
      input: {
        background: '#5B21B6',
        border: '#6D28D9',
        text: '#EDE9FE',
        focus: '#A78BFA'
      },
      
      table: {
        header: '#5B21B6',
        rowEven: '#5B21B6',
        rowOdd: '#4C1D95',
        border: '#6D28D9',
        line: '#7C3AED'
      },
      
      badge: {
        background: '#5B21B6',
        text: '#A78BFA',
        border: '#6D28D9'
      },
      
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#A78BFA',
      
      glass: 'rgba(91, 33, 182, 0.85)',
      glassBorder: 'rgba(167, 139, 250, 0.15)',
      glassShadow: 'rgba(0, 0, 0, 0.3)'
    }
  },

  dark_slate: {
    name: 'dark_slate',
    label: 'Dark Slate',
    type: 'dark',
    colors: {
      primary: '#94A3B8',
      primaryLight: '#CBD5E1',
      primaryDark: '#64748B',
      
      background: '#0F172A',
      surface: '#1E293B',
      card: '#1E293B',
      sidebar: '#0F172A',
      header: '#1E293B',
      subHeader: '#334155',
      
      textPrimary: '#F1F5F9',
      textSecondary: '#CBD5E1',
      textDisabled: '#64748B',
      textInverse: '#0F172A',
      
      border: '#334155',
      divider: '#1E293B',
      tableBorder: '#475569',
      lineColor: '#475569',
      
      hover: '#334155',
      selected: '#475569',
      focused: '#64748B',
      
      button: {
        background: '#64748B',
        text: '#FFFFFF',
        border: '#64748B',
        hover: '#475569'
      },
      
      input: {
        background: '#1E293B',
        border: '#334155',
        text: '#F1F5F9',
        focus: '#94A3B8'
      },
      
      table: {
        header: '#1E293B',
        rowEven: '#1E293B',
        rowOdd: '#0F172A',
        border: '#334155',
        line: '#475569'
      },
      
      badge: {
        background: '#1E293B',
        text: '#94A3B8',
        border: '#334155'
      },
      
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#94A3B8',
      
      glass: 'rgba(30, 41, 59, 0.85)',
      glassBorder: 'rgba(148, 163, 184, 0.15)',
      glassShadow: 'rgba(0, 0, 0, 0.3)'
    }
  }

};

// ===== THEME UTILITIES =====
export const getTheme = (themeName) => {
  return themes[themeName] || themes.indigo;
};

export const getDefaultTheme = () => {
  return themes.indigo;
};

export const getThemeList = () => {
  return Object.values(themes).map(theme => ({
    name: theme.name,
    label: theme.label,
    type: theme.type
  }));
};

export const getLightThemes = () => {
  return Object.values(themes).filter(theme => theme.type === 'light');
};

export const getDarkThemes = () => {
  return Object.values(themes).filter(theme => theme.type === 'dark');
};

// Export for ThemeContext
export default themes;