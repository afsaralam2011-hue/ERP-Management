// Header.jsx - COMPLETE FINAL VERSION


import React, { useEffect, useRef } from "react";
import { FiBell, FiSettings, FiLogOut, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import "./Header.css";

const Header = ({
  title = "Flattening Section",
  subtitle = "Wire flattening process management"
}) => {
  const navigate = useNavigate();
  const tickerRef = useRef(null);
  
  // USE THEME HOOK
  const { theme } = useTheme();

  // Get user info
  const storedUser = localStorage.getItem("user");
  const user = storedUser
    ? JSON.parse(storedUser)
    : { display_name: "Admin User", email: "admin@example.com", role: "Administrator" };

  const getInitials = (user) => {
    if (!user) return "AU";
    if (user.display_name) {
      const parts = user.display_name.trim().split(" ");
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return "AU";
  };

  const initials = getInitials(user);

  // Ticker animation
  useEffect(() => {
    const tickerElement = tickerRef.current;
    if (!tickerElement) return;

    let animationId;
    let position = 0;
    const speed = 0.8;

    const animateTicker = () => {
      position -= speed;
      if (position <= -400) {
        position = 0;
      }
      tickerElement.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animateTicker);
    };

    animationId = requestAnimationFrame(animateTicker);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const handleSettingsClick = () => {
    navigate("/settings/theme");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.clear();
    navigate("/login");
  };

  // Function to invert logo color based on theme
  const getLogoFilter = () => {
    if (theme.name === 'dark') {
      return 'invert(1) brightness(2)';
    } else if (theme.name === 'blue') {
      return 'invert(0.8) sepia(1) saturate(5) hue-rotate(175deg)';
    }
    return 'invert(0)';
  };

  return (
    <div 
      className="header-container"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`,
        borderBottom: `3px solid ${theme.colors.primary}`,
        color: theme.colors.textPrimary
      }}
    >
      {/* Ticker Bar */}
      <div 
        className="ticker-bar"
        style={{
          background: `linear-gradient(90deg, ${theme.colors.primary}99 0%, ${theme.colors.secondary}99 50%, ${theme.colors.primary}99 100%)`,
          borderTop: `2px solid ${theme.colors.primary}`,
        }}
      >
        <div ref={tickerRef} className="ticker-content">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="ticker-item">
              {/* Logo with theme-based color */}
              <img
                src="/images/logoA.png"
                alt="PWI Logo"
                className="ticker-logo"
                style={{
                  filter: getLogoFilter(),
                  transition: 'filter 0.3s ease'
                }}
              />
              <span className="ticker-text" style={{ color: theme.colors.textPrimary }}>
                Pakistan Wire Industries
              </span>
              <span 
                className="ticker-tag"
                style={{
                  background: `${theme.colors.secondary}CC`,
                  color: theme.colors.textPrimary,
                  border: `2px solid ${theme.colors.accent}`
                }}
              >
                SPI & CCD
              </span>
              <span className="ticker-separator">|</span>
            </div>
          ))}
        </div>
        <div 
          className="ticker-fade-left"
          style={{
            background: `linear-gradient(90deg, ${theme.colors.primary} 0%, transparent 100%)`
          }}
        />
        <div 
          className="ticker-fade-right"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${theme.colors.primary} 100%)`
          }}
        />
      </div>

      {/* Left Section */}
      <div className="left-section">
        <div className="logo-title-container">
          {/* Main Logo with theme-based color */}
          <img
            src="/images/logoB.png"
            alt="Pakistan Wire Industries Logo"
            className="main-logo"
            style={{
              filter: getLogoFilter(),
              transition: 'filter 0.3s ease'
            }}
          />
          <div className="title-container">
            <h1 
              className="main-title"
              style={{ color: theme.colors.textPrimary }}
            >
              {title}
            </h1>
            <p 
              className="main-subtitle"
              style={{ color: theme.colors.textSecondary }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <div className="company-tag">
          <span 
            className="company-text"
            style={{
              background: `${theme.colors.primary}33`,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            PWI Pvt Ltd
          </span>
        </div>
      </div>

      {/* Right Section - IMPROVED LAYOUT */}
      <div className="right-section">
        {/* Notification Button */}
        <button 
          className="notification-btn"
          style={{
            background: `${theme.colors.primary}1A`,
            color: theme.colors.textPrimary
          }}
          title="Notifications"
        >
          <FiBell />
          <span 
            className="notification-badge"
            style={{
              background: theme.colors.accent,
              border: `2px solid ${theme.colors.primary}`
            }}
          >
            3
          </span>
        </button>

        {/* Settings Button */}
        <button 
          className="settings-btn" 
          onClick={handleSettingsClick}
          style={{
            background: `${theme.colors.primary}1A`,
            color: theme.colors.textPrimary
          }}
          title="Theme Settings"
        >
          <FiSettings />
        </button>

        {/* Profile Button */}
        <button 
          className="profile-btn"
          onClick={handleProfileClick}
          style={{
            background: `${theme.colors.primary}1A`,
            color: theme.colors.textPrimary
          }}
          title="User Profile"
        >
          <FiUser />
        </button>

        {/* User Section */}
        <div 
          className="user-section"
          style={{
            background: `${theme.colors.primary}1A`,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary
          }}
          onClick={handleProfileClick}
          title="Click to view profile"
        >
          <div 
            className="user-avatar"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
            }}
          >
            {initials}
          </div>
          <div className="user-info">
            <div 
              className="user-name" 
              title={user.display_name}
              style={{ color: theme.colors.textPrimary }}
            >
              {user.display_name}
            </div>
            <div 
              className="user-email" 
              title={user.email}
              style={{ color: theme.colors.textSecondary }}
            >
              {user.email}
            </div>
            {user.role && (
              <div 
                className="user-role"
                style={{ color: theme.colors.accent }}
              >
                {user.role}
              </div>
            )}
          </div>
        </div>

        {/* Logout Button - FIXED COLOR */}
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          style={{
            background: `${theme.colors.primary}1A`,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary, // Changed to theme text color
            fontWeight: '600'
          }}
          title="Logout from system"
        >
          <FiLogOut className="logout-icon" />
          <span className="logout-text">Logout</span>
        </button>

        {/* Mobile Logout Button - Only shows on mobile */}
        <button 
          className="mobile-logout-btn"
          onClick={handleLogout}
          style={{
            background: `${theme.colors.primary}1A`,
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.textPrimary
          }}
          title="Logout"
        >
          <FiLogOut />
        </button>
      </div>
    </div>
  );
};

export default Header;