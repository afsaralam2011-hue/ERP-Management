// src/components/Header/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { FiSettings, FiLogOut, FiUser, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../contexts/ThemeContext';
import "./Header.css";

const Header = ({ title = "Pakistan Wire Industries", subtitle = "SPI & CCD Dashboard" }) => {
  const navigate = useNavigate();
  const tickerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  
  // Theme Context سے mode لے رہے ہیں
  const themeContext = useTheme();
  
  // 🔴 سادہ طریقہ: بس mode چیک کریں
  let mode = 'light';
  
  // سب possibilities چیک کریں
  if (themeContext.mode) {
    mode = themeContext.mode; // اگر direct mode ہے
  } else if (themeContext.theme && themeContext.theme.mode) {
    mode = themeContext.theme.mode; // اگر theme object میں mode ہے
  } else if (themeContext.currentTheme && themeContext.currentTheme.mode) {
    mode = themeContext.currentTheme.mode; // اگر currentTheme میں mode ہے
  }
  
  // بس colors طے کریں
  const isDarkMode = mode === 'dark';
  const backgroundColor = isDarkMode ? '#000000' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const logoFilter = isDarkMode ? 'invert(1) brightness(2)' : 'none';
  
  // Logout button colors - آپ کی requirement کے مطابق
  const logoutBgColor = isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'; // Light red
  const logoutBorderColor = '#EF4444'; // Red border
  const logoutTextColor = '#EF4444'; // Red text and icon
  
  // localStorage/sessionStorage سے REAL user data لائیں
  useEffect(() => {
    const loadUserData = () => {
      // پہلے localStorage چیک کریں (Remember me case)
      let userData = localStorage.getItem("user");
      let token = localStorage.getItem("token");
      
      // اگر localStorage میں نہیں تو sessionStorage چیک کریں (Not Remember me case)
      if (!userData || !token) {
        userData = sessionStorage.getItem("user");
        token = sessionStorage.getItem("token");
      }
      
      if (userData && token) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("Header میں User Data:", parsedUser); // Debugging کے لیے
          
          // اصل Supabase user object سے data نکالیں
          const userName = parsedUser.user_metadata?.full_name || 
                          parsedUser.user_metadata?.name || 
                          parsedUser.email?.split('@')[0] || 
                          "User";
          
          const userEmail = parsedUser.email || "No email";
          
          setUser({
            display_name: userName,
            email: userEmail,
            initials: getInitials(userName),
            // مکمل user object بھی save کریں اگر ضرورت ہو
            full_user: parsedUser
          });
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Fallback data
          setUser({
            display_name: "Guest User",
            email: "guest@example.com",
            initials: "GU"
          });
        }
      } else {
        // اگر کوئی user data نہیں ہے تو login پر redirect کریں
        console.warn("No user data found in storage, redirecting to login");
        navigate("/login");
      }
    };
    
    loadUserData();
    
    // storage میں تبدیلیوں کو listen کریں
    const handleStorageChange = (e) => {
      if (e.key === "user" || e.key === "token") {
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // ہر بار component mount ہونے پر بھی check کریں
    const interval = setInterval(loadUserData, 5000); // ہر 5 سیکنڈ بعد چیک کریں
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [navigate]);
  
  // Initials نکالنے کے لیے function
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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

  // اگر user data نہیں ہے تو loading دکھائیں
  if (!user) {
    return (
      <div style={{
        width: "100%",
        background: backgroundColor,
        color: textColor,
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading user data...
      </div>
    );
  }

  // Header کا مکمل JSX
  return (
    <div style={{
      width: "100%",
      background: backgroundColor,
      color: textColor,
      borderBottom: `1px solid ${textColor}20`
    }}>
      {/* Ticker Bar (Desktop Only) */}
      {!isMobile && (
        <div style={{ 
          background: backgroundColor,
          borderTop: `1px solid ${textColor}20`,
          height: '30px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div ref={tickerRef} style={{
            display: 'flex',
            position: 'absolute',
            whiteSpace: 'nowrap'
          }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '0 20px'
              }}>
                <img 
                  src="/assets/images/logoA.png" 
                  alt="Logo" 
                  style={{ 
                    height: '18px',
                    width: 'auto',
                    filter: logoFilter 
                  }}
                />
                <span style={{ 
                  fontSize: '13px',
                  fontWeight: '500',
                  color: textColor 
                }}>
                  Pakistan Wire Industries
                </span>
                <span style={{ 
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  background: `${textColor}20`,
                  color: textColor
                }}>
                  SPI & CCD
                </span>
                <span style={{ 
                  marginLeft: '15px',
                  fontWeight: '300',
                  color: textColor
                }}>
                  |
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Header Content */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        minHeight: '70px'
      }}>
        {/* Left: Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src="/assets/images/logoA.png" 
              alt="Logo" 
              style={{ 
                height: '40px',
                width: 'auto',
                filter: logoFilter 
              }}
            />
            <div>
              <h1 style={{ 
                fontSize: '22px',
                fontWeight: '700',
                margin: 0,
                color: textColor
              }}>
                {title}
              </h1>
              <p style={{ 
                fontSize: '13px',
                fontWeight: '400',
                margin: '4px 0 0 0',
                color: textColor,
                opacity: 0.9
              }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Icons + User */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notification */}
            <div style={{
              position: 'relative',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              background: `${textColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🔔
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#EF4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold'
              }}>
                3
              </span>
            </div>

            {/* Settings */}
            <button 
              onClick={() => navigate("/settings/theme")}
              style={{
                background: `${textColor}15`,
                color: textColor,
                border: `1px solid ${textColor}30`,
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiSettings />
            </button>

            {/* User */}
            <div 
              onClick={() => navigate("/profile")}
              style={{
                background: `${textColor}10`,
                border: `1px solid ${textColor}20`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                borderRadius: '12px',
                minWidth: isMobile ? 'auto' : '250px'
              }}
            >
              {/* یہاں کلر کو تھیک کیا ہے - Contrast کے لیے */}
              <div style={{
                background: isDarkMode ? '#6AECE1' : '#2563EB', // خوبصورت رنگ
                color: isDarkMode ? '#000000' : '#FFFFFF',      // Contrast والا رنگ
                fontWeight: 'bold',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                border: `2px solid ${textColor}30`
              }}>
                {user.initials}
              </div>
              
              {!isMobile && (
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <FiUser size={12} />
                    {user.display_name}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: textColor,
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <FiMail size={12} />
                    {user.email}
                  </div>
                </div>
              )}
            </div>

            {/* Logout - آپ کی requirement کے مطابق */}
            <button 
              onClick={handleLogout}
              style={{
                background: logoutBgColor, // Light red background
                color: logoutTextColor, // Red text
                border: `1px solid ${logoutBorderColor}`, // Red border
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode 
                  ? 'rgba(239, 68, 68, 0.25)' 
                  : 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = logoutBgColor;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FiLogOut style={{ color: logoutTextColor }} /> {/* Red icon */}
              {!isMobile && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;