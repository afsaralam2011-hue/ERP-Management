// src/components/Settings.jsx
import React from 'react';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme, setTheme } = useTheme();

  const Box = ({ active, icon, onClick }) => (
    <button
      onClick={onClick}
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active
          ? 'linear-gradient(135deg,var(--theme-primary),var(--theme-secondary))'
          : 'var(--theme-surface)',
        color: active ? '#fff' : 'var(--theme-text)',
        border: '1px solid var(--theme-border)',
        boxShadow: active
          ? '0 10px 26px rgba(0,0,0,0.35)'
          : '0 6px 18px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(14px)',
        cursor: 'pointer',
        transition: 'all .25s ease'
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {icon}
    </button>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'center',
          color: 'var(--theme-text)',
          marginBottom: 24
        }}
      >
        App Settings
      </h1>

      {/* THEME SETTINGS */}
      <div
        style={{
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-border)',
          borderRadius: 16,
          padding: 24,
          boxShadow: 'var(--theme-shadow)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
          Theme Mode
        </h2>

        <div style={{ display: 'flex', gap: 14 }}>
          <Box
            icon={<FiSun size={22} />}
            active={theme === 'light'}
            onClick={() => setTheme('light')}
          />
          <Box
            icon={<FiMoon size={22} />}
            active={theme === 'dark'}
            onClick={() => setTheme('dark')}
          />
          <Box
            icon={<FiMonitor size={22} />}
            active={theme === 'system'}
            onClick={() =>
              setTheme(
                window.matchMedia('(prefers-color-scheme: dark)').matches
                  ? 'dark'
                  : 'light'
              )
            }
          />
        </div>
      </div>

      {/* MOBILE INFO */}
      <div
        style={{
          marginTop: 24,
          background: 'var(--theme-surface)',
          border: '1px solid var(--theme-border)',
          borderRadius: 16,
          padding: 20,
          boxShadow: 'var(--theme-shadow)',
          color: 'var(--theme-textSecondary)'
        }}
      >
        Mobile optimizations are applied automatically.
      </div>
    </div>
  );
};

export default Settings;
