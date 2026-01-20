import React, { useEffect, useRef, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // --- USER DATA LOGIC ---
  // ہم نے اسے مزید مضبوط بنا دیا ہے تاکہ نام لازمی آئے
  const getStoredUser = () => {
    const rawData = localStorage.getItem("user") || localStorage.getItem("userData");
    if (!rawData) return { display_name: "Admin User", email: "admin@pwi.com" };
    
    try {
      const parsed = JSON.parse(rawData);
      // اگر display_name نہیں ہے تو دوسرے ممکنہ نام چیک کریں
      return {
        ...parsed,
        display_name: parsed.display_name || parsed.username || parsed.name || "Admin User"
      };
    } catch (e) {
      return { display_name: "Admin User", email: "admin@pwi.com" };
    }
  };

  const user = getStoredUser();

  const getInitials = (userData) => {
    const name = userData.display_name;
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user);

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

  return (
    <div 
      className="header-container"
      style={{
        width: "100%",
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 50%, ${theme.colors.primaryDark} 100%)`,
        borderBottom: `2px solid ${theme.colors.border}`,
        color: theme.colors.textPrimary,
        margin: "0",
        padding: "0",
      }}
    >
      {/* Ticker Bar */}
      {!isMobile && (
        <div className="ticker-bar" style={{ background: `linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.primary} 100%)` }}>
          <div ref={tickerRef} className="ticker-content">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="ticker-item">
                <img src="/images/logoA.png" alt="Logo" className="ticker-logo" style={{ filter: theme.type === 'dark' ? 'invert(1)' : 'none' }} />
                <span className="ticker-text">Pakistan Wire Industries</span>
                <span className="ticker-tag">SPI & CCD</span>
                <span className="ticker-separator">|</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Header Content */}
      <div className="header-main-content">
        <div className="left-section">
          <div className="logo-title-container">
            <img src="/images/logoB.png" alt="Logo" className="main-logo" style={{ filter: theme.type === 'dark' ? 'invert(1)' : 'none' }} />
            <div className="title-container">
              <h1 className="main-title">{title}</h1>
              <p className="main-subtitle">{subtitle}</p>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="header-icons-row">
            <button className="notification-btn"><FiBell /><span className="notification-badge">3</span></button>
            <button className="settings-btn" onClick={() => navigate("/settings/theme")}><FiSettings /></button>
            
            {/* USER INFO SECTION - اب یہاں نام لازمی آئے گا */}
            <div className="user-section-compact" onClick={() => navigate("/profile")}>
              <div className="user-avatar-compact">{initials}</div>
              {!isMobile && (
                <div className="user-info-compact">
                  <div className="user-name-compact" style={{ fontWeight: "bold", fontSize: "14px" }}>
                    {user.display_name}
                  </div>
                  <div className="user-email-compact" style={{ fontSize: "11px", opacity: 0.8 }}>
                    {user.email}
                  </div>
                </div>
              )}
            </div>

            <button className="logout-btn-compact" onClick={handleLogout}>
              <FiLogOut /> {!isMobile && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;