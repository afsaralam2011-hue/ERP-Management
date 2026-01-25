// src/components/Header/Header.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import NotificationBell from './NotificationBell';
import { useTheme } from "../../contexts/ThemeContext";
import "./Header.css";

const Header = ({
  title = "Flattening Section",
  subtitle = "Wire flattening process management"
}) => {
  const navigate = useNavigate();
  const tickerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, primaryColor } = useTheme(); // Get theme from context
  
  // ✅ Dynamic user data from localStorage or sessionStorage
  const getUserData = () => {
    // Try to get user data from various storage locations
    const displayName = localStorage.getItem('userName') || 
                       sessionStorage.getItem('userName') || 
                       localStorage.getItem('userDisplayName') ||
                       sessionStorage.getItem('userDisplayName') ||
                       localStorage.getItem('display_name') ||
                       sessionStorage.getItem('display_name') ||
                       "Admin User";
    
    const email = localStorage.getItem('userEmail') || 
                  sessionStorage.getItem('userEmail') || 
                  localStorage.getItem('userEmailAddress') ||
                  sessionStorage.getItem('userEmailAddress') ||
                  localStorage.getItem('email') ||
                  sessionStorage.getItem('email') ||
                  "admin@pwi.com";
    
    const initials = localStorage.getItem('userInitials') || 
                     sessionStorage.getItem('userInitials') ||
                     getInitials(displayName);

    return {
      display_name: displayName,
      email: email,
      initials: initials
    };
  };

  const getInitials = (name) => {
    if (!name || name.trim() === "") return "AU";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const [user, setUser] = useState(getUserData());
  const initials = user.initials || getInitials(user.display_name);

  // Update user data when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(getUserData());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically (for same-tab changes)
    const interval = setInterval(() => {
      const newUserData = getUserData();
      if (JSON.stringify(newUserData) !== JSON.stringify(user)) {
        setUser(newUserData);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ticker Animation
  useEffect(() => {
    if (isMobile || !tickerRef.current) return;
    let animationId;
    let position = 0;
    const animate = () => {
      position -= 0.8;
      if (position <= -400) position = 0;
      if (tickerRef.current) tickerRef.current.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isMobile]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  // Function to get gradient based on theme
  const getHeaderGradient = () => {
    switch(theme) {
      case 'dark':
        return `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}80 50%, ${primaryColor}40 100%)`;
      case 'blue':
        return `linear-gradient(135deg, ${primaryColor} 0%, #60A5FA 50%, ${primaryColor} 100%)`;
      case 'green':
        return `linear-gradient(135deg, ${primaryColor} 0%, #34D399 50%, ${primaryColor} 100%)`;
      default: // light
        return `linear-gradient(135deg, ${primaryColor} 0%, #3B82F6 50%, #1D4ED8 100%)`;
    }
  };

  // Function to get ticker gradient
  const getTickerGradient = () => {
    switch(theme) {
      case 'dark':
        return `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}80 50%, ${primaryColor} 100%)`;
      case 'blue':
        return `linear-gradient(90deg, ${primaryColor} 0%, #93C5FD 50%, ${primaryColor} 100%)`;
      case 'green':
        return `linear-gradient(90deg, ${primaryColor} 0%, #6EE7B7 50%, ${primaryColor} 100%)`;
      default: // light
        return `linear-gradient(90deg, ${primaryColor} 0%, #4F46E5 50%, ${primaryColor} 100%)`;
    }
  };

  // Function to get text color based on theme
  const getTextColor = () => {
    switch(theme) {
      case 'dark':
        return '#F9FAFB'; // Light text for dark theme
      case 'blue':
        return '#1E40AF'; // Dark blue text for blue theme
      case 'green':
        return '#065F46'; // Dark green text for green theme
      default: // light
        return '#FFFFFF'; // White text for light theme
    }
  };

  const textColor = getTextColor();
  const headerGradient = getHeaderGradient();
  const tickerGradient = getTickerGradient();

  return (
    <div 
      className="header-container"
      style={{
        width: "100%",
        background: headerGradient,
        borderBottom: `2px solid var(--border, #E2E8F0)`,
        color: textColor,
        margin: "0",
        padding: "0",
      }}
    >
      {/* Ticker Bar */}
      {!isMobile && (
        <div className="ticker-bar" style={{ background: tickerGradient }}>
          <div ref={tickerRef} className="ticker-content">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="ticker-item">
                <img src="/assets/images/logoA.png" alt="Logo" className="ticker-logo" />
                <span className="ticker-text" style={{ color: textColor }}>Pakistan Wire Industries</span>
                <span className="ticker-tag" style={{ 
                  background: `rgba(255, 255, 255, ${theme === 'dark' ? '0.1' : '0.2'})`,
                  color: textColor 
                }}>
                  SPI & CCD
                </span>
                <span className="ticker-separator" style={{ color: textColor, opacity: 0.5 }}>|</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Header Content */}
      <div className="header-main-content">
        <div className="left-section">
          <div className="logo-title-container">
            <img src="/assets/images/logoA.png" alt="Logo" className="main-logo" />
            <div className="title-container">
              <h1 className="main-title" style={{ color: textColor }}>{title}</h1>
              <p className="main-subtitle" style={{ color: `rgba(${theme === 'dark' ? '249, 250, 251' : '255, 255, 255'}, 0.9)` }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="header-icons-row">
            {/* Notification Bell Component */}
            <NotificationBell theme={theme} primaryColor={primaryColor} textColor={textColor} />
            
            {/* Settings Button */}
            <button 
              className="settings-btn" 
              onClick={() => navigate("/settings/theme")}
              style={{
                background: `rgba(255, 255, 255, ${theme === 'dark' ? '0.1' : '0.15'})`,
                color: textColor
              }}
            >
              <FiSettings />
            </button>
            
            {/* USER INFO SECTION */}
            <div 
              className="user-section-compact" 
              onClick={() => navigate("/profile")}
              style={{
                background: `rgba(255, 255, 255, ${theme === 'dark' ? '0.05' : '0.1'})`,
                border: `1px solid rgba(255, 255, 255, ${theme === 'dark' ? '0.1' : '0.2'})`
              }}
            >
              <div 
                className="user-avatar-compact"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}80)`,
                  color: getContrastColor(primaryColor)
                }}
              >
                {initials}
              </div>
              {!isMobile && (
                <div className="user-info-compact">
                  <div className="user-name-compact" style={{ 
                    fontWeight: "bold", 
                    fontSize: "14px",
                    color: textColor
                  }}>
                    {user.display_name}
                  </div>
                  <div className="user-email-compact" style={{ 
                    fontSize: "11px", 
                    color: `rgba(${theme === 'dark' ? '249, 250, 251' : '255, 255, 255'}, 0.8)` 
                  }}>
                    {user.email}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button 
              className="logout-btn-compact" 
              onClick={handleLogout}
              style={{
                background: `rgba(255, 255, 255, ${theme === 'dark' ? '0.1' : '0.15'})`,
                color: textColor
              }}
            >
              <FiLogOut /> {!isMobile && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get contrast color (same as in ThemeSettings)
const getContrastColor = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string') return '#FFFFFF';
  
  const hex = hexColor.replace('#', '');
  
  if (hex.length !== 6) return '#FFFFFF';
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default Header;