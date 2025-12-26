import React, { useEffect, useRef } from "react";
import { FiSearch, FiBell, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function Header({ 
  title = "ERP Dashboard", 
  subtitle = "Welcome to Pakistan Wire Industries ERP System"
}) {
  const navigate = useNavigate();
  const tickerRef = useRef(null);

  useEffect(() => {
    const tickerElement = tickerRef.current;
    if (!tickerElement) return;

    let animationId;
    let position = 0;
    const speed = 0.5;

    const animateTicker = () => {
      position -= speed;
      
      const tickerWidth = tickerElement.scrollWidth / 4;
      if (Math.abs(position) >= tickerWidth) {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{
      background: "white",
      padding: "20px 24px 40px 24px", // Reduced padding
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      width: "100%",
      boxSizing: "border-box",
      flexWrap: "nowrap",
      gap: "16px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      minHeight: "110px", // Reduced height
      border: "none",
      margin: 0,
      overflow: "hidden"
    }}>
      
      {/* Running Ticker Bar */}
      <div style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        width: "100%",
        height: "28px",
        background: "linear-gradient(90deg, #1e3a8a 0%, #1e40af 25%, #1e40af 75%, #1e3a8a 100%)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        borderTop: "1px solid #3b82f6"
      }}>
        <div 
          ref={tickerRef}
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            willChange: "transform"
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              color: "white",
              fontWeight: "500",
              fontSize: "12px",
              letterSpacing: "0.3px",
              height: "100%"
            }}>
              <img 
                src="/images/logoB.png" 
                alt="PWI Logo"
                style={{
                  height: "18px",
                  width: "18px",
                  marginRight: "10px",
                  objectFit: "contain"
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = document.createElement('span');
                  fallback.textContent = 'PWI';
                  fallback.style.cssText = `
                    font-weight: bold;
                    color: #fbbf24;
                    margin-right: 10px;
                    font-size: 12px;
                  `;
                  e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
                }}
              />
              
              <span>Pakistan Wire Industries</span>
              
              <span style={{
                marginLeft: "12px",
                display: "inline-flex",
                alignItems: "center",
                color: "#fbbf24",
                fontSize: "12px",
                fontWeight: "700",
                background: "rgba(0,0,0,0.3)",
                padding: "2px 10px",
                borderRadius: "12px",
                border: "1px solid #fbbf24",
                textShadow: "0 1px 2px rgba(0,0,0,0.5)"
              }}>
                SPI & CCD
              </span>
              
              <span style={{
                marginLeft: "20px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px"
              }}>
                |
              </span>
            </div>
          ))}
        </div>
        
        <div style={{
          position: "absolute",
          left: "0",
          top: "0",
          height: "100%",
          width: "50px",
          background: "linear-gradient(90deg, #1e3a8a 40%, transparent)"
        }} />
        <div style={{
          position: "absolute",
          right: "0",
          top: "0",
          height: "100%",
          width: "50px",
          background: "linear-gradient(90deg, transparent, #1e3a8a 60%)"
        }} />
      </div>
      
      {/* LEFT SIDE - Title */}
      <div style={{
        minWidth: "0", // Changed from 280px
        flex: "1 1 30%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: "14px",
        overflow: "hidden"
      }}>
        <img 
          src="/images/logoB.png" 
          alt="Pakistan Wire Industries Logo"
          style={{
            height: "42px",
            width: "42px",
            objectFit: "contain",
            flexShrink: 0
          }}
          onError={(e) => {
            e.target.style.display = "none";
            const fallbackDiv = document.createElement('div');
            fallbackDiv.style.cssText = `
              width: 42px;
              height: 42px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
              flex-shrink: 0;
            `;
            fallbackDiv.textContent = 'PWI';
            e.target.parentNode.insertBefore(fallbackDiv, e.target.nextSibling);
          }}
        />
        
        <div style={{ 
          flex: 1, 
          minWidth: 0,
          overflow: "hidden" 
        }}>
          <h1 style={{
            margin: "0 0 6px 0",
            fontSize: "22px",
            fontWeight: "700",
            color: "#1e293b",
            lineHeight: "1.2",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            <span style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {title}
            </span>
            <span style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1e40af",
              background: "#eff6ff",
              padding: "6px 12px",
              borderRadius: "12px",
              whiteSpace: "nowrap",
              border: "1px solid #bfdbfe",
              flexShrink: 0
            }}>
              PWI Pvt Ltd
            </span>
          </h1>
          <p style={{
            margin: "4px 0 0 0",
            fontSize: "14px",
            color: "#64748b",
            lineHeight: "1.4",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* CENTER - Search Bar */}
      <div style={{
        flex: "1 1 40%",
        minWidth: "0",
        maxWidth: "none"
      }}>
        <div style={{ position: "relative" }}>
          <FiSearch style={{
            position: "absolute", 
            left: "14px",
            top: "50%", 
            transform: "translateY(-50%)", 
            color: "#94a3b8",
            fontSize: "18px"
          }} />
          <input
            type="text"
            placeholder="Search..."
            style={{
              padding: "12px 20px 12px 44px",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "14px",
              width: "100%",
              background: "#f8fafc",
              outline: "none",
              transition: "all 0.3s",
              height: "44px",
              boxSizing: "border-box"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.15)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>
      
      {/* RIGHT SIDE - All Controls */}
      <div style={{
        display: "flex", 
        alignItems: "center", 
        gap: "12px",
        marginLeft: "auto",
        flexShrink: 0,
        flex: "1 1 30%",
        justifyContent: "flex-end",
        minWidth: "0"
      }}>
        
        <button 
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            fontSize: "20px",
            cursor: "pointer",
            position: "relative",
            padding: "10px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            flexShrink: 0
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#f1f5f9";
            e.target.style.color = "#3b82f6";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#64748b";
          }}
          title="Notifications"
        >
          <FiBell />
          <span style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "#ef4444",
            color: "white",
            fontSize: "10px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold"
          }}>
            3
          </span>
        </button>
        
        <button 
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            fontSize: "20px",
            cursor: "pointer",
            padding: "10px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            flexShrink: 0
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#f1f5f9";
            e.target.style.color = "#3b82f6";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#64748b";
          }}
          title="Settings"
        >
          <FiSettings />
        </button>

        <div style={{
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          padding: "10px 16px",
          borderRadius: "10px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          margin: "0 5px",
          minWidth: "160px",
          height: "60px",
          flexShrink: 0
        }}>
          <div style={{
            width: "36px",
            height: "36px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            flexShrink: 0
          }}>
            AU
          </div>
          <div style={{
            minWidth: 0,
            overflow: "hidden"
          }}>
            <div style={{
              fontSize: "14px",
              color: "#1e293b", 
              fontWeight: "600",
              lineHeight: "1.3",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              Admin User
            </div>
            <div style={{
              fontSize: "12px",
              color: "#64748b",
              lineHeight: "1.3",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              Administrator
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            border: "none",
            color: "white",
            fontSize: "14px",
            cursor: "pointer",
            padding: "10px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "600",
            height: "44px",
            whiteSpace: "nowrap",
            minWidth: "auto",
            flexShrink: 0
          }}
          title="Logout"
        >
          <FiLogOut style={{ fontSize: "18px" }} />
          <span>Logout</span>
        </button>
      </div>

      {/* CSS Media Queries */}
      <style>
        {`
          @media (max-width: 1400px) {
            .header-container {
              padding: 16px 20px 36px 20px !important;
              min-height: 100px !important;
              gap: 12px !important;
            }
            
            .title-section h1 {
              font-size: 20px !important;
              gap: 10px !important;
            }
            
            .title-section p {
              font-size: 13px !important;
            }
            
            .logo-img {
              height: 38px !important;
              width: 38px !important;
            }
            
            .search-input {
              height: 40px !important;
              font-size: 13px !important;
              padding: 10px 16px 10px 38px !important;
            }
            
            .user-section {
              min-width: 140px !important;
              height: 52px !important;
              padding: 8px 12px !important;
            }
            
            .user-avatar {
              width: 32px !important;
              height: 32px !important;
              font-size: 12px !important;
            }
          }
          
          @media (max-width: 1200px) {
            .header-container {
              flex-wrap: wrap !important;
            }
            
            .left-section {
              flex: 1 1 100% !important;
              order: 1;
            }
            
            .center-section {
              flex: 1 1 60% !important;
              order: 2;
              margin-top: 12px;
            }
            
            .right-section {
              flex: 1 1 40% !important;
              order: 3;
              margin-top: 12px;
              justify-content: flex-end !important;
            }
            
            .ticker-bar {
              height: 24px !important;
            }
            
            .ticker-text {
              font-size: 11px !important;
            }
          }
          
          @media (max-width: 768px) {
            .header-container {
              padding: 12px 16px 32px 16px !important;
              gap: 10px !important;
              min-height: auto !important;
            }
            
            .left-section {
              flex-direction: row !important;
              align-items: center !important;
            }
            
            .title-section h1 {
              font-size: 18px !important;
              flex-direction: column !important;
              align-items: flex-start !important;
              gap: 6px !important;
            }
            
            .pwi-badge {
              align-self: flex-start !important;
              margin-top: 4px !important;
            }
            
            .center-section, .right-section {
              flex: 1 1 100% !important;
              margin-top: 10px !important;
            }
            
            .search-input {
              font-size: 12px !important;
              height: 38px !important;
            }
            
            .user-section {
              min-width: 120px !important;
              height: 48px !important;
            }
            
            .user-name {
              font-size: 12px !important;
            }
            
            .user-role {
              font-size: 11px !important;
            }
            
            .logout-button span {
              display: none !important;
            }
            
            .logout-button {
              padding: 10px !important;
              min-width: auto !important;
              width: 44px !important;
            }
            
            .icon-button {
              width: 38px !important;
              height: 38px !important;
              font-size: 18px !important;
            }
            
            .notification-badge {
              top: 6px !important;
              right: 6px !important;
              width: 16px !important;
              height: 16px !important;
              font-size: 9px !important;
            }
            
            .ticker-bar {
              height: 22px !important;
              display: none !important; /* Hide ticker on small screens */
            }
          }
          
          @media (max-width: 480px) {
            .header-container {
              padding: 10px 12px 28px 12px !important;
            }
            
            .logo-img {
              height: 32px !important;
              width: 32px !important;
            }
            
            .title-section h1 {
              font-size: 16px !important;
            }
            
            .title-section p {
              font-size: 12px !important;
            }
            
            .user-section {
              min-width: 100px !important;
              padding: 6px 10px !important;
            }
            
            .right-section {
              gap: 8px !important;
            }
            
            .search-input::placeholder {
              font-size: 11px !important;
            }
          }
          
          /* Fix for 100% zoom */
          @media screen and (max-resolution: 1dppx) {
            .header-container {
              transform-origin: top left;
            }
          }
        `}
      </style>
    </div>
  );
}