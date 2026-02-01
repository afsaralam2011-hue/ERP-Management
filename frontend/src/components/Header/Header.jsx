// src/components/Header/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { FiSettings, FiLogOut, FiUser, FiMail, FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../contexts/ThemeContext';
import "./Header.css";

const Header = ({ title = "Pakistan Wire Industries", subtitle = "SPI & CCD Dashboard" }) => {
  const navigate = useNavigate();
  const tickerRef = useRef(null);
  const animationRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [user, setUser] = useState(null);
  
  // ✅ Theme Context
  const { mode } = useTheme();
  const isDarkMode = mode === 'dark';
  
  // ✅ CSS Variables سے Colors لیں - Optimized version
  const getColor = (varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#000000';
  };
  
  // ایک ہی بار میں تمام colors لے لیں
  const themeColors = {
    background: getColor('--color-background'),
    textPrimary: getColor('--color-text-primary'),
    textSecondary: getColor('--color-text-secondary'),
    surface: getColor('--color-surface'),
    border: getColor('--color-border'),
    primary: getColor('--color-primary')
  };
  
  const backgroundColor = themeColors.background;
  const textColor = themeColors.textPrimary;
  const textSecondaryColor = themeColors.textSecondary;
  const surfaceColor = themeColors.surface;
  const borderColor = themeColors.border;
  const primaryColor = themeColors.primary;
  const logoFilter = isDarkMode ? 'invert(1) brightness(2)' : 'none';
  
  // Logout button colors
  const logoutBgColor = isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
  const logoutBorderColor = '#EF4444';
  const logoutTextColor = '#EF4444';
  
  // User data
  useEffect(() => {
    const loadUserData = () => {
      let userData = localStorage.getItem("user");
      let token = localStorage.getItem("token");
      
      if (!userData || !token) {
        userData = sessionStorage.getItem("user");
        token = sessionStorage.getItem("token");
      }
      
      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData);
          const userName = parsedUser.user_metadata?.full_name || 
                          parsedUser.user_metadata?.name || 
                          parsedUser.email?.split('@')[0] || 
                          "User";
          const userEmail = parsedUser.email || "No email";
          
          setUser({
            display_name: userName,
            email: userEmail,
            initials: userName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
          });
        } catch (error) {
          setUser({
            display_name: "Guest User",
            email: "guest@example.com",
            initials: "GU"
          });
        }
      } else {
        setUser({
          display_name: "Guest User",
          email: "guest@example.com",
          initials: "GU"
        });
      }
    };
    
    loadUserData();
    const interval = setInterval(loadUserData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  // Mobile check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Ticker animation
  useEffect(() => {
    if (isMobile || !tickerRef.current) return;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    let position = 0;
    const animate = () => {
      position -= 0.8;
      if (position <= -400) position = 0;
      if (tickerRef.current) tickerRef.current.style.transform = `translateX(${position}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMobile]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  if (!user) {
    return (
      <div style={{
        width: "100%",
        background: backgroundColor,
        color: textColor,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      width: "100%",
      background: backgroundColor,
      color: textColor,
      borderBottom: `1px solid ${borderColor}`
    }}>
      {/* Ticker Bar */}
      {!isMobile && (
        <div style={{ 
          background: surfaceColor,
          borderBottom: `1px solid ${borderColor}`,
          height: '28px',
          overflow: 'hidden',
          position: 'relative',
          width: '100%'
        }}>
          <div 
            ref={tickerRef} 
            style={{
              display: 'flex',
              position: 'absolute',
              whiteSpace: 'nowrap',
              left: '0',
              top: '0',
              height: '100%',
              alignItems: 'center'
            }}
          >
            {[...Array(8)].map((_, copyIndex) => (
              <div key={copyIndex} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                height: '100%'
              }}>
                <img 
                  src="/assets/images/logoA.png" 
                  alt="Logo" 
                  style={{ 
                    height: '16px',
                    width: 'auto',
                    filter: logoFilter,
                    marginRight: '12px'
                  }}
                />
                <span style={{ 
                  fontSize: '12px',
                  fontWeight: '500',
                  color: textColor,
                  marginRight: '12px'
                }}>
                  Pakistan Wire Industries
                </span>
                <span style={{ 
                  padding: '1px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontWeight: '600',
                  background: primaryColor,
                  color: isDarkMode ? '#000' : '#FFF',
                  marginRight: '15px'
                }}>
                  SPI & CCD
                </span>
                <span style={{ 
                  color: textSecondaryColor,
                  marginRight: '15px'
                }}>
                  |
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '8px 12px' : '8px 20px',
        height: isMobile ? '56px' : '64px',
        width: '100%',
        gap: isMobile ? '8px' : '16px'
      }}>
        {/* Left Side */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '12px',
          flexShrink: 1,
          minWidth: 0,
          overflow: 'hidden'
        }}>
          <img 
            src="/assets/images/logoA.png" 
            alt="Logo" 
            style={{ 
              height: isMobile ? '28px' : '32px',
              width: 'auto',
              filter: logoFilter,
              flexShrink: 0
            }}
          />
          <div style={{ 
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '700',
              color: textColor,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {isMobile ? 'PWI ERP' : 'Pakistan Wire Industries'}
            </div>
            {!isMobile && (
              <div style={{
                fontSize: '11px',
                color: textSecondaryColor,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '4px' : '8px',
          flexShrink: 0
        }}>
          {/* Notification */}
          <div style={{
            position: 'relative',
            cursor: 'pointer',
            padding: isMobile ? '6px' : '8px',
            borderRadius: '6px',
            background: surfaceColor,
            border: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <FiBell size={isMobile ? 16 : 18} style={{ color: textColor }} />
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: '#EF4444',
              color: 'white',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 'bold'
            }}>
              3
            </span>
          </div>

          {/* Settings */}
          <button 
            onClick={() => navigate("/settings/theme")}
            style={{
              background: surfaceColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              padding: isMobile ? '6px' : '8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <FiSettings size={isMobile ? 16 : 18} />
          </button>

          {/* User */}
          {isMobile ? (
            <div 
              onClick={() => navigate("/profile")}
              style={{
                background: surfaceColor,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '6px',
                flexShrink: 0
              }}
            >
              <div style={{
                background: primaryColor,
                color: isDarkMode ? '#000000' : '#FFFFFF',
                fontWeight: 'bold',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {user.initials}
              </div>
            </div>
          ) : (
            <div 
              onClick={() => navigate("/profile")}
              style={{
                background: surfaceColor,
                border: `1px solid ${borderColor}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '8px',
                flexShrink: 0,
                minWidth: 0
              }}
            >
              <div style={{
                background: primaryColor,
                color: isDarkMode ? '#000000' : '#FFFFFF',
                fontWeight: 'bold',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                flexShrink: 0
              }}>
                {user.initials}
              </div>
              <div style={{ 
                minWidth: 0,
                overflow: 'hidden',
                flexShrink: 1
              }}>
                <div style={{ 
                  fontSize: '12px',
                  fontWeight: '600',
                  color: textColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.display_name}
                </div>
                <div style={{ 
                  fontSize: '10px',
                  color: textSecondaryColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <button 
            onClick={handleLogout}
            style={{
              background: logoutBgColor,
              color: logoutTextColor,
              border: `1px solid ${logoutBorderColor}`,
              padding: isMobile ? '6px' : '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '600',
              fontSize: isMobile ? '12px' : '13px',
              flexShrink: 0
            }}
          >
            <FiLogOut size={isMobile ? 14 : 16} />
            {!isMobile && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;