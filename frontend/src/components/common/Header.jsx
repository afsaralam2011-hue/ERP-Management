import React, { useEffect, useRef } from "react";
import { FiBell, FiSettings, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Header = ({ 
  title = "Flattening Section", 
  subtitle = "Wire flattening process management"
}) => {
  const navigate = useNavigate();
  const tickerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const tickerElement = tickerRef.current;
    if (!tickerElement) return;

    let animationId;
    let position = 0;
    const speed = 0.8; // Thoda tez speed
    
    // Pehle hi duplicate content prepare karte hain for seamless loop
    const tickerContent = tickerElement.innerHTML;
    tickerElement.innerHTML = tickerContent + tickerContent + tickerContent + tickerContent;
    
    const tickerWidth = tickerElement.scrollWidth / 4; // Original width
    const animationDuration = tickerWidth / speed;
    
    const animateTicker = () => {
      position -= speed;
      
      // Jab first copy khatam ho, to position reset karen without visible jump
      if (Math.abs(position) >= tickerWidth) {
        position = 0;
        // Ek chota sa offset dein for smooth transition
        position -= speed;
      }
      
      tickerElement.style.transform = `translateX(${position}px)`;
      tickerElement.style.transition = 'transform 0.1s linear'; // Smooth transition
      animationId = requestAnimationFrame(animateTicker);
    };

    // Start animation with slight delay
    setTimeout(() => {
      animationId = requestAnimationFrame(animateTicker);
    }, 100);

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
    <div className="header-container" style={{
      background: "linear-gradient(135deg, #3C467B 0%, #50589C 50%, #636CCB 100%)",
      padding: "12px 24px 50px 25px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      width: "100%",
      boxSizing: "border-box",
      flexWrap: "wrap",
      gap: "16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      minHeight: "80px",
      borderBottom: "3px solid #6E8CFB",
      margin: 0,
      overflow: "hidden"
    }}>
      
      {/* Running Ticker Bar - IMPROVED SMOOTH ANIMATION */}
      <div className="ticker-bar" style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        width: "100%",
        height: "40px",
        background: "linear-gradient(90deg, rgba(99, 108, 203, 0.9) 0%, rgba(94, 124, 226, 0.9) 50%, rgba(99, 108, 203, 0.9) 100%)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        borderTop: "2px solid #6E8CFB",
        backdropFilter: "blur(10px)"
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
          {/* Content multiple times for seamless loop */}
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              color: "white",
              fontWeight: "600",
              fontSize: "18px",
              letterSpacing: "0.3px",
              height: "100%",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              flexShrink: 0
            }}>
              <img 
                src="/images/logoA.png" 
                alt="PWI Logo"
                style={{
                  height: "24px",
                  width: "24px",
                  marginRight: "12px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = document.createElement('span');
                  fallback.textContent = 'PWI';
                  fallback.style.cssText = `
                    font-weight: bold;
                    color: #FFD700;
                    margin-right: 12px;
                    font-size: 14px;
                    flex-shrink: 0;
                  `;
                  e.target.parentNode.insertBefore(fallback, e.target.nextSibling);
                }}
              />
              
              <span style={{ flexShrink: 0 }}>Pakistan Wire Industries</span>
              
              <span style={{
                marginLeft: "15px",
                display: "inline-flex",
                alignItems: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: "700",
                background: "rgba(110, 140, 251, 0.8)",
                padding: "3px 12px",
                borderRadius: "20px",
                border: "2px solid rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(5px)",
                flexShrink: 0
              }}>
                SPI & CCD
              </span>
              
              <span style={{
                marginLeft: "20px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
                flexShrink: 0
              }}>
                |
              </span>
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for smooth edges */}
        <div style={{
          position: "absolute",
          left: "0",
          top: "0",
          height: "100%",
          width: "80px",
          background: "linear-gradient(90deg, #3C467B 0%, transparent 100%)",
          zIndex: 2,
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          right: "0",
          top: "0",
          height: "100%",
          width: "80px",
          background: "linear-gradient(90deg, transparent 0%, #3C467B 100%)",
          zIndex: 2,
          pointerEvents: "none"
        }} />
      </div>
      
      {/* LEFT SIDE - Logo and Title */}
      <div className="left-section" style={{
        flex: "1",
        minWidth: "0",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        overflow: "hidden"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexShrink: 0
        }}>
          <img 
            src="/images/logoB.png" 
            alt="Pakistan Wire Industries Logo"
            style={{
              height: "48px",
              width: "48px",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
              flexShrink: 0
            }}
            onError={(e) => {
              e.target.style.display = "none";
              const fallbackDiv = document.createElement('div');
              fallbackDiv.style.cssText = `
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #6E8CFB 0%, #50589C 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
                flex-shrink: 0;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              `;
              fallbackDiv.textContent = 'PWI';
              e.target.parentNode.insertBefore(fallbackDiv, e.target.nextSibling);
            }}
          />
          
          <div style={{ 
            minWidth: 0,
            overflow: "hidden"
          }}>
            <h1 style={{
              margin: "0 0 4px 0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#FFFFFF",
              lineHeight: "1.2",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)"
            }}>
              {title}
            </h1>
            <p style={{
              margin: 0,
              fontSize: "13px",
              color: "#E0E7FF",
              lineHeight: "1.3",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: "500"
            }}>
              {subtitle}
            </p>
          </div>
        </div>
        
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginLeft: "16px",
          paddingLeft: "16px",
          borderLeft: "1px solid rgba(110, 140, 251, 0.4)",
          flexShrink: 0
        }}>
          <span style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "#FFFFFF",
            background: "rgba(110, 140, 251, 0.3)",
            padding: "4px 12px",
            borderRadius: "20px",
            whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)"
          }}>
            PWI Pvt Ltd
          </span>
        </div>
      </div>
      
      {/* RIGHT SIDE - All Controls */}
      <div className="right-section" style={{
        display: "flex", 
        alignItems: "center", 
        gap: "20px",
        flexShrink: 0,
        justifyContent: "flex-end"
      }}>
        
        <button 
          className="icon-button"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#FFFFFF",
            fontSize: "22px",
            cursor: "pointer",
            position: "relative",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            flexShrink: 0,
            transition: "all 0.2s ease",
            backdropFilter: "blur(10px)"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(110, 140, 251, 0.8)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.transform = "scale(1)";
          }}
          title="Notifications"
        >
          <FiBell />
          <span className="notification-badge" style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            background: "#FF4757",
            color: "white",
            fontSize: "10px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            border: "2px solid #3C467B",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            3
          </span>
        </button>
        
        <button 
          className="icon-button"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "#FFFFFF",
            fontSize: "22px",
            cursor: "pointer",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            flexShrink: 0,
            transition: "all 0.2s ease",
            backdropFilter: "blur(10px)"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(110, 140, 251, 0.8)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.transform = "scale(1)";
          }}
          title="Settings"
        >
          <FiSettings />
        </button>

        <div className="user-section" style={{
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          padding: "8px 16px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          height: "52px",
          flexShrink: 0,
          transition: "all 0.2s ease",
          backdropFilter: "blur(10px)",
          minWidth: "180px"
        }}
        onMouseOver={(e) => {
          e.target.style.background = "rgba(110, 140, 251, 0.2)";
          e.target.style.borderColor = "rgba(255,255,255,0.4)";
        }}
        onMouseOut={(e) => {
          e.target.style.background = "rgba(255,255,255,0.1)";
          e.target.style.borderColor = "rgba(255,255,255,0.2)";
        }}
        >
          <div className="user-avatar" style={{
            width: "36px",
            height: "36px",
            background: "linear-gradient(135deg, #6E8CFB 0%, #50589C 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
            flexShrink: 0,
            boxShadow: "0 3px 8px rgba(0,0,0,0.2)"
          }}>
            AU
          </div>
          <div style={{
            minWidth: 0,
            overflow: "hidden"
          }}>
            <div className="user-name" style={{
              fontSize: "14px",
              color: "#FFFFFF", 
              fontWeight: "600",
              lineHeight: "1.3",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              Admin User
            </div>
            <div className="user-role" style={{
              fontSize: "11px",
              color: "#E0E7FF",
              lineHeight: "1.2",
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
          className="logout-button"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "rgba(216, 7, 7, 0.92)",
            fontSize: "14px",
            cursor: "pointer",
            padding: "10px 18px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "600",
            height: "44px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all 0.2s ease",
            backdropFilter: "blur(10px)"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(255,255,255,0.25)";
            e.target.style.borderColor = "rgba(255,255,255,0.5)";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255,255,255,0.15)";
            e.target.style.borderColor = "rgba(255,255,255,0.3)";
            e.target.style.transform = "translateY(0)";
          }}
          title="Logout"
        >
          <FiLogOut style={{ fontSize: "25px" }} />
          <span>Logout</span>
        </button>
      </div>

      {/* CSS Media Queries with smooth animation fixes */}
      <style>{`
        /* Smooth Ticker Animation */
        .ticker-bar div {
          transition: transform 0.1s linear !important;
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 1024px) {
          .header-container {
            padding: 12px 16px 48px 16px !important;
            gap: 12px !important;
            min-height: 72px !important;
          }
          
          .left-section {
            flex: 1 1 100% !important;
            order: 1;
            margin-bottom: 8px !important;
          }
          
          .right-section {
            flex: 1 1 100% !important;
            order: 2;
            justify-content: space-between !important;
            gap: 12px !important;
          }
          
          .ticker-bar {
            height: 32px !important;
          }
          
          .ticker-bar span {
            font-size: 16px !important;
          }
        }
        
        @media (max-width: 768px) {
          .header-container {
            padding: 10px 12px 44px 12px !important;
            gap: 10px !important;
            min-height: 68px !important;
          }
          
          .left-section {
            gap: 12px !important;
          }
          
          .left-section img {
            height: 40px !important;
            width: 40px !important;
          }
          
          .left-section h1 {
            font-size: 18px !important;
          }
          
          .left-section p {
            font-size: 12px !important;
          }
          
          .right-section {
            gap: 10px !important;
          }
          
          .user-section {
            min-width: 140px !important;
            padding: 6px 12px !important;
            height: 48px !important;
          }
          
          .user-avatar {
            width: 32px !important;
            height: 32px !important;
            font-size: 12px !important;
          }
          
          .user-name {
            font-size: 13px !important;
          }
          
          .user-role {
            font-size: 10px !important;
          }
          
          .logout-button {
            padding: 8px 14px !important;
            height: 40px !important;
            font-size: 13px !important;
          }
          
          .icon-button {
            width: 40px !important;
            height: 40px !important;
            font-size: 20px !important;
          }
          
          .notification-badge {
            top: 5px !important;
            right: 5px !important;
            width: 16px !important;
            height: 16px !important;
            font-size: 9px !important;
          }
          
          .ticker-bar {
            height: 28px !important;
          }
          
          .ticker-bar span {
            font-size: 14px !important;
          }
          
          .ticker-bar span:last-child {
            margin-left: 12px !important;
            padding: 2px 8px !important;
            font-size: 11px !important;
          }
        }
        
        @media (max-width: 480px) {
          .header-container {
            padding: 8px 10px 40px 10px !important;
            gap: 8px !important;
            min-height: 64px !important;
          }
          
          .left-section {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
            margin-bottom: 0 !important;
          }
          
          .left-section > div {
            width: 100% !important;
          }
          
          .left-section img {
            height: 36px !important;
            width: 36px !important;
          }
          
          .left-section h1 {
            font-size: 16px !important;
            margin-bottom: 2px !important;
          }
          
          .left-section p {
            font-size: 11px !important;
          }
          
          .left-section span {
            padding: 3px 10px !important;
            font-size: 11px !important;
          }
          
          .right-section {
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 8px !important;
          }
          
          .user-section {
            order: 1;
            flex: 1 !important;
            min-width: auto !important;
            max-width: 200px !important;
            margin: 0 auto !important;
          }
          
          .icon-button {
            order: 2;
            width: 36px !important;
            height: 36px !important;
            font-size: 18px !important;
          }
          
          .logout-button {
            order: 3;
            flex: 1 !important;
            justify-content: center !important;
            padding: 6px 12px !important;
            height: 36px !important;
            font-size: 12px !important;
          }
          
          .logout-button span {
            display: none !important;
          }
          
          .logout-button svg {
            margin: 0 !important;
          }
          
          .ticker-bar {
            height: 24px !important;
          }
          
          .ticker-bar span {
            font-size: 12px !important;
          }
          
          .ticker-bar span:last-child {
            display: none !important;
          }
          
          .ticker-bar img {
            height: 18px !important;
            width: 18px !important;
            margin-right: 8px !important;
          }
          
          /* Mobile pe animation thora slow karen */
          .ticker-bar div {
            transition: transform 0.15s linear !important;
          }
        }
        
        @media (max-width: 360px) {
          .header-container {
            padding: 6px 8px 36px 8px !important;
          }
          
          .left-section h1 {
            font-size: 15px !important;
          }
          
          .left-section p {
            font-size: 10px !important;
          }
          
          .user-section {
            padding: 4px 8px !important;
            height: 44px !important;
            gap: 8px !important;
          }
          
          .user-avatar {
            width: 28px !important;
            height: 28px !important;
          }
          
          .user-name {
            font-size: 12px !important;
          }
          
          .icon-button {
            width: 32px !important;
            height: 32px !important;
            font-size: 16px !important;
          }
          
          .logout-button {
            height: 32px !important;
            padding: 4px 8px !important;
          }
          
          .ticker-bar {
            height: 22px !important;
          }
          
          .ticker-bar span {
            font-size: 11px !important;
          }
          
          .ticker-bar img {
            height: 16px !important;
            width: 16px !important;
          }
        }
        
        /* Touch improvements */
        button {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        /* Prevent text overflow */
        * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        /* Smooth transitions for everything except ticker */
        .header-container *:not(.ticker-bar *) {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default Header;