// frontend/src/components/common/Navigation.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome, FiUsers, FiDollarSign, FiPackage, FiShoppingCart,
  FiCpu, FiTruck, FiSettings, FiLogOut, FiGrid, FiFolder,
  FiLayers, FiBox, FiActivity, FiClipboard, FiTool, FiDatabase,
  FiArchive, FiCheckSquare, FiScissors, FiX, FiChevronDown,
  FiMenu, FiRefreshCw, FiEdit, FiFileText, FiBarChart2,
  FiShoppingBag, FiCalendar, FiTrendingUp, FiMessageSquare,
  FiBell, FiUser, FiCreditCard, FiGlobe, FiMapPin, FiTarget,
  FiStar, FiAward, FiTrendingUp as FiTrendUp
} from "react-icons/fi";
import { useTheme } from '../../contexts/ThemeContext';
import "./Navigation.css";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const sidebarRef = useRef(null);
  const { theme, primaryColor, mode, isDarkMode } = useTheme();

  // Dynamic user data function
  const getUserData = () => {
    let userData = null;
    let userEmail = "admin@pwi.com";
    let userName = "Admin User";

    const localUser = localStorage.getItem("user");
    const sessionUser = sessionStorage.getItem("user");

    if (localUser) {
      try {
        userData = JSON.parse(localUser);
      } catch (error) {
        console.error("Error parsing localStorage user:", error);
      }
    } else if (sessionUser) {
      try {
        userData = JSON.parse(sessionUser);
      } catch (error) {
        console.error("Error parsing sessionStorage user:", error);
      }
    }

    if (userData) {
      if (userData.user_metadata?.full_name) {
        userName = userData.user_metadata.full_name;
      } else if (userData.user_metadata?.name) {
        userName = userData.user_metadata.name;
      } else if (userData.email) {
        const emailParts = userData.email.split("@")[0];
        userName = emailParts
          .split(".")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
      }

      if (userData.email) {
        userEmail = userData.email;
      }
    }

    const username = userName.toLowerCase().replace(/\s+/g, ".");

    const getInitials = (name) => {
      if (!name || name.trim() === "") return "AU";
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    };

    return {
      name: userName,
      email: userEmail,
      username: username,
      initials: getInitials(userName),
      role: userData?.role || "Administrator",
      department: userData?.department || "Management",
      originalData: userData,
    };
  };

  const [userData, setUserData] = useState(getUserData());
  const [logoMissing, setLogoMissing] = useState(false);
  const [mobileLogoMissing, setMobileLogoMissing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const hoverTimerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  // Enhanced Theme colors with vibrant colors
  const themeColors = useMemo(() => {
    const baseColors = {
      primary: primaryColor || "#3B82F6",
      secondary: "#8B5CF6",
      accent: "#10B981",
      highlight: "#F0ABFC",
      error: "#EF4444",
      success: "#10B981",
      warning: "#F59E0B",
      info: "#3B82F6",
      purple: "#A855F7",
      pink: "#EC4899",
      orange: "#F97316",
      cyan: "#06B6D4",
      lime: "#84CC16",
    };

    if (mode === "dark") {
      return {
        ...baseColors,
        bgPrimary: "#0F172A",
        bgSecondary: "#1E293B",
        bgCard: "#1E293B",
        textPrimary: "#F8FAFC",
        textSecondary: "#CBD5E1",
        textMuted: "#94A3B8",
        border: "#334155",
        hoverBg: "rgba(255, 255, 255, 0.1)",
        activeBg: "rgba(59, 130, 246, 0.25)",
        sidebarBg: "#0F172A",
        headerBg: "#1E293B",
        badgeBackground: "#DC2626",
        badgeText: "#FFFFFF",
        gradientPrimary: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
        gradientSecondary: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
        shadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
        shadowLight: "0 4px 12px rgba(0, 0, 0, 0.3)",
        highlightGlow: "0 0 20px rgba(59, 130, 246, 0.3)",
      };
    } else if (mode === "blue") {
      return {
        ...baseColors,
        bgPrimary: "#EFF6FF",
        bgSecondary: "#DBEAFE",
        bgCard: "#FFFFFF",
        textPrimary: "#1E40AF",
        textSecondary: "#3B82F6",
        textMuted: "#60A5FA",
        border: "#BFDBFE",
        hoverBg: "rgba(59, 130, 246, 0.15)",
        activeBg: "rgba(59, 130, 246, 0.2)",
        sidebarBg: "#EFF6FF",
        headerBg: "#FFFFFF",
        badgeBackground: "#DC2626",
        badgeText: "#FFFFFF",
        gradientPrimary: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
        gradientSecondary: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
        shadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
        shadowLight: "0 4px 12px rgba(59, 130, 246, 0.15)",
        highlightGlow: "0 0 20px rgba(59, 130, 246, 0.2)",
      };
    } else if (mode === "green") {
      return {
        ...baseColors,
        bgPrimary: "#F0FDF4",
        bgSecondary: "#DCFCE7",
        bgCard: "#FFFFFF",
        textPrimary: "#065F46",
        textSecondary: "#059669",
        textMuted: "#34D399",
        border: "#BBF7D0",
        hoverBg: "rgba(16, 185, 129, 0.15)",
        activeBg: "rgba(16, 185, 129, 0.2)",
        sidebarBg: "#F0FDF4",
        headerBg: "#FFFFFF",
        badgeBackground: "#DC2626",
        badgeText: "#FFFFFF",
        gradientPrimary: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
        gradientSecondary: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
        shadow: "0 10px 25px rgba(16, 185, 129, 0.2)",
        shadowLight: "0 4px 12px rgba(16, 185, 129, 0.15)",
        highlightGlow: "0 0 20px rgba(16, 185, 129, 0.2)",
      };
    } else {
      return {
        ...baseColors,
        bgPrimary: "#FFFFFF",
        bgSecondary: "#F8FAFC",
        bgCard: "#FFFFFF",
        textPrimary: "#1F2937",
        textSecondary: "#4B5563",
        textMuted: "#6B7280",
        border: "#E5E7EB",
        hoverBg: "#F3F4F6",
        activeBg: "rgba(59, 130, 246, 0.1)",
        sidebarBg: "#F9FAFB",
        headerBg: "#FFFFFF",
        badgeBackground: "#DC2626",
        badgeText: "#FFFFFF",
        gradientPrimary: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
        gradientSecondary: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
        shadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        shadowLight: "0 4px 12px rgba(0, 0, 0, 0.08)",
        highlightGlow: "0 0 20px rgba(59, 130, 246, 0.15)",
      };
    }
  }, [mode, primaryColor]);

  const getContrastColor = useCallback((hexColor) => {
    if (!hexColor || typeof hexColor !== "string") return "#FFFFFF";
    const hex = hexColor.replace("#", "");
    if (hex.length !== 6) return "#FFFFFF";
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }, []);

  const [dailyUpdates] = useState({
    production: 12,
    finance: 5,
    sales: 8,
    logistics: 3,
    hr: 7,
    it: 2,
  });

  const [expandedSections, setExpandedSections] = useState(() => {
    const sections = {
      dashboard: currentPath === "/dashboard",
      production: currentPath.includes("/production") || currentPath.includes("/production-sections"),
      rawMaterial: currentPath.includes("/raw-material"),
      flattening: currentPath.includes("/flattening"),
      spiral: currentPath.includes("/spiral"),
      pvc: currentPath.includes("/pvc"),
      cutting: currentPath.includes("/cutting"),
      finishedGoods: currentPath.includes("/finished-goods"),
      hr: currentPath.includes("/hr"),
      finance: currentPath.includes("/finance"),
      sales: currentPath.includes("/sales"),
      it: currentPath.includes("/it"),
      logistics: currentPath.includes("/logistics"),
    };
    
    return sections;
  });

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update expanded sections
  useEffect(() => {
    const newExpandedSections = { ...expandedSections };
    
    Object.keys(newExpandedSections).forEach((key) => {
      if (key === "production") {
        if (currentPath.includes("/production") || currentPath.includes("/production-sections")) {
          newExpandedSections[key] = true;
        }
      } else if (key === "dashboard") {
        newExpandedSections[key] = currentPath === "/dashboard";
      } else {
        newExpandedSections[key] = currentPath.includes(key.replace("finishedGoods", "finished-goods"));
      }
    });
    
    setExpandedSections(newExpandedSections);
  }, [currentPath]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('.mobile-menu-button')
      ) {
        closeMobileMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  // Hover Effect - Mouse enter/leave handlers
  useEffect(() => {
    if (isMobile) return;

    const handleMouseEnter = () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      
      hoverTimerRef.current = setTimeout(() => {
        if (!sidebarOpen) {
          setSidebarOpen(true);
        }
      }, 150);
    };

    const handleMouseLeave = () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      
      leaveTimerRef.current = setTimeout(() => {
        if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }, 300);
    };

    const sidebarElement = sidebarRef.current;
    if (sidebarElement) {
      sidebarElement.addEventListener('mouseenter', handleMouseEnter);
      sidebarElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (sidebarElement) {
        sidebarElement.removeEventListener('mouseenter', handleMouseEnter);
        sidebarElement.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, [isMobile, sidebarOpen]);

  // User data sync
  useEffect(() => {
    const loadAndUpdateUserData = () => {
      const newUserData = getUserData();
      setUserData(newUserData);
    };

    loadAndUpdateUserData();
    window.addEventListener("authChange", loadAndUpdateUserData);
    return () => window.removeEventListener("authChange", loadAndUpdateUserData);
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  };

  const toggleSection = useCallback((section, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const toggleMobileMenu = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setSidebarOpen(false);
  };

  // User Avatar Component
  const UserAvatar = useCallback(
    ({ size = "default" }) => {
      const avatarSize = size === "mobile" ? 36 : 40;

      return (
        <div
          className="user-avatar"
          role="img"
          aria-label={userData.name}
          style={{
            width: `${avatarSize}px`,
            height: `${avatarSize}px`,
            background: themeColors.gradientPrimary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            color: getContrastColor(themeColors.primary),
            fontWeight: "bold",
            fontSize: size === "mobile" ? "14px" : "16px",
            border: `3px solid ${themeColors.accent}`,
            boxShadow: themeColors.shadowLight,
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          {userData.initials}
        </div>
      );
    },
    [userData, themeColors, getContrastColor],
  );

  // Navigation items with vibrant colors and icons
  const navigationItems = useMemo(
    () => ({
      dashboard: {
        path: "/dashboard",
        label: "Dashboard",
        icon: <FiHome />,
        exact: true,
        color: themeColors.primary,
        iconColor: themeColors.primary,
        badge: null,
      },
      production: {
        path: "/production/new",
        label: "Production",
        icon: <FiPackage />,
        color: themeColors.accent,
        iconColor: themeColors.accent,
        badge: dailyUpdates.production > 0 ? dailyUpdates.production.toString() : null,
        subSections: [
          { 
            path: "/production/new", 
            label: "New Production", 
            icon: <FiGrid />,
            iconColor: themeColors.accent
          },
          { 
            path: "/production", 
            label: "Production Dashboard", 
            icon: <FiBarChart2 />,
            iconColor: themeColors.primary
          },
          { 
            path: "/production-sections", 
            label: "All Sections", 
            icon: <FiFolder />,
            iconColor: themeColors.secondary
          },
          { 
            path: "/production-reports/daily", 
            label: "Daily Reports", 
            icon: <FiActivity />,
            iconColor: themeColors.success
          },
          {
            type: "department", 
            key: "rawMaterial", 
            label: "Raw Material", 
            icon: <FiDatabase />, 
            color: themeColors.secondary,
            iconColor: themeColors.secondary,
            subItems: [
              { 
                path: "/production-sections/raw-material", 
                label: "Raw Material Section", 
                icon: <FiDatabase />,
                iconColor: themeColors.secondary
              },
              { 
                path: "/production-sections/raw-material/new", 
                label: "New Entry", 
                icon: <FiClipboard />,
                iconColor: themeColors.accent
              },
              { 
                path: "/flattening-ledger", 
                label: "Inventory Ledger", 
                icon: <FiTool />,
                iconColor: themeColors.warning
              },
            ],
          },
          {
            type: "department", 
            key: "flattening", 
            label: "Flattening", 
            icon: <FiBox />, 
            color: themeColors.accent,
            iconColor: themeColors.accent,
            subItems: [
              { 
                path: "/production-sections/flattening", 
                label: "Flattening Section", 
                icon: <FiLayers />,
                iconColor: themeColors.accent
              },
              { 
                path: "/production-sections/flattening/smart-entry", 
                label: "Smart Entry", 
                icon: <FiEdit />,
                iconColor: themeColors.primary
              },
              { 
                path: "/production-sections/flattening/multi-entry", 
                label: "Multi Entry", 
                icon: <FiEdit />,
                iconColor: themeColors.info
              },
            ],
          },
        ],
      },
      hr: {
        path: "/hr",
        label: "HR Department",
        icon: <FiUsers />,
        color: themeColors.purple,
        iconColor: themeColors.purple,
        badge: dailyUpdates.hr > 0 ? dailyUpdates.hr.toString() : null,
        subSections: [
          { 
            path: "/hr/employees", 
            label: "Employees", 
            icon: <FiUser />,
            iconColor: themeColors.purple
          },
          { 
            path: "/hr/attendance", 
            label: "Attendance", 
            icon: <FiClipboard />,
            iconColor: themeColors.accent
          },
        ],
      },
      finance: {
        path: "/finance",
        label: "Finance",
        icon: <FiDollarSign />,
        color: themeColors.success,
        iconColor: themeColors.success,
        badge: dailyUpdates.finance > 0 ? dailyUpdates.finance.toString() : null,
        subSections: [
          { 
            path: "/finance/accounts", 
            label: "Accounts", 
            icon: <FiCreditCard />,
            iconColor: themeColors.success
          },
          { 
            path: "/finance/invoices", 
            label: "Invoices", 
            icon: <FiFileText />,
            iconColor: themeColors.info
          },
        ],
      },
      sales: {
        path: "/sales",
        label: "Sales",
        icon: <FiShoppingCart />,
        color: themeColors.orange,
        iconColor: themeColors.orange,
        badge: dailyUpdates.sales > 0 ? dailyUpdates.sales.toString() : null,
        subSections: [
          { 
            path: "/sales/orders", 
            label: "Orders", 
            icon: <FiShoppingBag />,
            iconColor: themeColors.orange
          },
          { 
            path: "/sales/customers", 
            label: "Customers", 
            icon: <FiUsers />,
            iconColor: themeColors.purple
          },
        ],
      },
      it: {
        path: "/it",
        label: "IT Department",
        icon: <FiCpu />,
        color: themeColors.cyan,
        iconColor: themeColors.cyan,
        badge: dailyUpdates.it > 0 ? dailyUpdates.it.toString() : null,
        subSections: [
          { 
            path: "/it/support", 
            label: "IT Support", 
            icon: <FiTool />,
            iconColor: themeColors.warning
          },
          { 
            path: "/it/assets", 
            label: "Assets", 
            icon: <FiDatabase />,
            iconColor: themeColors.secondary
          },
        ],
      },
      logistics: {
        path: "/logistics",
        label: "Logistics",
        icon: <FiTruck />,
        color: themeColors.lime,
        iconColor: themeColors.lime,
        badge: dailyUpdates.logistics > 0 ? dailyUpdates.logistics.toString() : null,
        subSections: [
          { 
            path: "/logistics/inventory", 
            label: "Inventory", 
            icon: <FiDatabase />,
            iconColor: themeColors.secondary
          },
          { 
            path: "/logistics/shipping", 
            label: "Shipping", 
            icon: <FiTruck />,
            iconColor: themeColors.lime
          },
        ],
      },
    }),
    [themeColors, dailyUpdates],
  );

  const renderNestedItems = useCallback((items, departmentColor = themeColors.primary, iconColor = themeColors.primary) => {
    if (!sidebarOpen) return null;

    return items.map((item, index) => {
      if (item.type === "department") {
        const isDeptExpanded = expandedSections[item.key];
        const isActive = item.subItems?.some(subItem => 
          currentPath === subItem.path || currentPath.startsWith(subItem.path)
        );

        return (
          <div key={`${item.key}-${index}`}>
            <div
              className="department-header"
              role="button"
              tabIndex={0}
              onClick={(e) => toggleSection(item.key, e)}
              style={{
                color: isActive || isDeptExpanded ? item.color : themeColors.textSecondary,
                backgroundColor: isActive ? `${item.color}20` : isDeptExpanded ? `${item.color}15` : "transparent",
                borderLeft: `3px solid ${isActive ? item.color : isDeptExpanded ? `${item.color}80` : "transparent"}`,
                margin: "6px 12px",
                padding: "14px 18px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                fontSize: "14px",
                fontWeight: isActive ? 700 : 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: isActive ? themeColors.highlightGlow : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${item.color}20`;
                e.currentTarget.style.color = item.color;
                e.currentTarget.style.borderLeft = `3px solid ${item.color}`;
                e.currentTarget.style.transform = "translateX(5px)";
                e.currentTarget.style.boxShadow = themeColors.shadowLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isActive ? `${item.color}20` : isDeptExpanded ? `${item.color}15` : "transparent";
                e.currentTarget.style.color = isActive || isDeptExpanded ? item.color : themeColors.textSecondary;
                e.currentTarget.style.borderLeft = `3px solid ${isActive ? item.color : isDeptExpanded ? `${item.color}80` : "transparent"}`;
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.boxShadow = isActive ? themeColors.highlightGlow : "none";
              }}
            >
              <span style={{ 
                color: isActive ? item.color : isDeptExpanded ? item.iconColor : themeColors.textMuted,
                fontSize: "18px",
                transition: "all 0.3s ease"
              }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <FiChevronDown style={{ 
                color: item.color,
                transform: isDeptExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease"
              }} />
            </div>

            {isDeptExpanded && item.subItems && (
              <div style={{ 
                marginLeft: "24px", 
                paddingLeft: "16px", 
                borderLeft: `2px dashed ${item.color}40`,
                animation: "slideDown 0.3s ease"
              }}>
                {item.subItems.map((subItem, subIndex) => {
                  const isActive = currentPath === subItem.path || currentPath.startsWith(subItem.path);

                  return (
                    <NavLink
                      key={`${subItem.path}-${subIndex}`}
                      to={subItem.path}
                      style={{
                        color: isActive ? item.color : themeColors.textSecondary,
                        borderLeft: `2px solid ${isActive ? item.color : "transparent"}`,
                        backgroundColor: isActive ? `${item.color}20` : "transparent",
                        margin: "5px 12px",
                        padding: "12px 18px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        fontSize: "13px",
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: "none",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${item.color}15`;
                        e.currentTarget.style.color = item.color;
                        e.currentTarget.style.borderLeft = `2px solid ${item.color}`;
                        e.currentTarget.style.transform = "translateX(5px)";
                        e.currentTarget.style.boxShadow = themeColors.shadowLight;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isActive ? `${item.color}20` : "transparent";
                        e.currentTarget.style.color = isActive ? item.color : themeColors.textSecondary;
                        e.currentTarget.style.borderLeft = `2px solid ${isActive ? item.color : "transparent"}`;
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <span style={{ 
                        color: isActive ? subItem.iconColor || item.color : themeColors.textMuted,
                        fontSize: "16px",
                        transition: "all 0.3s ease"
                      }}>
                        {subItem.icon}
                      </span>
                      <span>{subItem.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      const isActive = currentPath === item.path || currentPath.startsWith(item.path);

      return (
        <NavLink
          key={`${item.path}-${index}`}
          to={item.path}
          style={{
            color: isActive ? departmentColor : themeColors.textSecondary,
            borderLeft: `2px solid ${isActive ? departmentColor : "transparent"}`,
            backgroundColor: isActive ? `${departmentColor}20` : "transparent",
            margin: "5px 12px",
            padding: "12px 18px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "13px",
            fontWeight: isActive ? 600 : 500,
            textDecoration: "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${departmentColor}15`;
            e.currentTarget.style.color = departmentColor;
            e.currentTarget.style.borderLeft = `2px solid ${departmentColor}`;
            e.currentTarget.style.transform = "translateX(5px)";
            e.currentTarget.style.boxShadow = themeColors.shadowLight;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isActive ? `${departmentColor}20` : "transparent";
            e.currentTarget.style.color = isActive ? departmentColor : themeColors.textSecondary;
            e.currentTarget.style.borderLeft = `2px solid ${isActive ? departmentColor : "transparent"}`;
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span style={{ 
            color: isActive ? iconColor : themeColors.textMuted,
            fontSize: "16px",
            transition: "all 0.3s ease"
          }}>
            {item.icon}
          </span>
          <span>{item.label}</span>
        </NavLink>
      );
    });
  }, [sidebarOpen, expandedSections, currentPath, themeColors, toggleSection]);

  const MobileHeader = () => {
    if (!isMobile) return null;

    return (
      <div
        className="mobile-header"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 1100,
          background: themeColors.headerBg,
          borderBottom: `1px solid ${themeColors.border}`,
          boxShadow: themeColors.shadowLight,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={toggleMobileMenu}
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "24px",
              background: "none",
              border: "none",
              color: themeColors.textPrimary,
              borderRadius: "8px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.hoverBg;
              e.currentTarget.style.color = themeColors.primary;
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = themeColors.textPrimary;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <FiMenu />
          </button>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: themeColors.textPrimary }}>
              PAKISTAN WIRE
            </div>
            <div style={{ fontSize: "10px", fontWeight: 500, color: themeColors.accent }}>
              INDUSTRIES LTD
            </div>
          </div>
        </div>
        <UserAvatar size="mobile" />
      </div>
    );
  };

  const getSidebarWidth = () => {
    if (isMobile) {
      return sidebarOpen ? "280px" : "0px";
    }
    return sidebarOpen ? "280px" : "70px";
  };

  const isActivePath = (path, exact = false) => {
    if (exact) return currentPath === path;
    return currentPath.startsWith(path);
  };

  return (
    <>
      <MobileHeader />

      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileMenu}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Hover trigger area for desktop */}
      {!isMobile && !sidebarOpen && (
        <div
          className="sidebar-hover-trigger"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "20px",
            height: "100vh",
            zIndex: 998,
            background: "transparent",
          }}
        />
      )}

      <div
        ref={sidebarRef}
        className="sidebar-container"
        style={{
          width: getSidebarWidth(),
          height: isMobile ? "100vh" : "100vh",
          top: isMobile ? "0" : "0",
          position: isMobile ? "fixed" : "fixed",
          zIndex: isMobile ? (sidebarOpen ? 1000 : -1) : 1000,
          opacity: isMobile ? (sidebarOpen ? 1 : 0) : 1,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          background: themeColors.sidebarBg,
          borderRight: `1px solid ${themeColors.border}`,
          display: "flex",
          flexDirection: "column",
          boxShadow: themeColors.shadow,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            padding: "24px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "flex-start" : "center",
            gap: "15px",
            minHeight: "96px",
            background: themeColors.gradientPrimary,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            flexDirection: sidebarOpen ? "row" : "column",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {isMobile && sidebarOpen && (
            <button
              onClick={closeMobileMenu}
              style={{
                position: "absolute",
                right: "16px",
                top: "16px",
                width: "32px",
                height: "32px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <FiX />
            </button>
          )}

          <div
            style={{
              width: sidebarOpen ? "48px" : "40px",
              height: sidebarOpen ? "48px" : "40px",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              padding: "4px",
              border: `3px solid ${themeColors.accent}`,
              boxShadow: themeColors.shadowLight,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = themeColors.shadowLight;
              }
            }}
          >
            {!logoMissing ? (
              <img
                src="/assets/images/logoA.png"
                alt="PWI Logo"
                onError={() => setLogoMissing(true)}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ fontWeight: 700, fontSize: "16px", color: themeColors.primary }}>
                PWI
              </div>
            )}
          </div>

          {sidebarOpen && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
              <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "white" }}>
                PAKISTAN WIRE
              </h1>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(255, 255, 255, 0.9)" }}>
                INDUSTRIES LTD
              </p>
              <div style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "9px",
                fontWeight: 700,
                marginTop: "6px",
                backdropFilter: "blur(4px)",
              }}>
                SPI & CCD DIVISION
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div style={{ 
          padding: "20px 0", 
          flex: 1, 
          overflowY: "auto",
          overflowX: "hidden",
        }}>
          {/* Dashboard Link */}
          <NavLink
            to="/dashboard"
            end
            style={{
              borderLeft: `4px solid ${isActivePath("/dashboard", true) ? navigationItems.dashboard.color : "transparent"}`,
              margin: "10px 12px",
              padding: sidebarOpen ? "16px 20px" : "12px 0",
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              transition: "all 0.3s ease",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: sidebarOpen ? "16px" : "0",
              borderRadius: "10px",
              color: isActivePath("/dashboard", true) ? themeColors.textPrimary : themeColors.textSecondary,
              backgroundColor: isActivePath("/dashboard", true) ? `${navigationItems.dashboard.color}20` : "transparent",
              fontWeight: isActivePath("/dashboard", true) ? 700 : 600,
            }}
            onMouseEnter={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.backgroundColor = `${navigationItems.dashboard.color}15`;
                e.currentTarget.style.color = navigationItems.dashboard.color;
                e.currentTarget.style.borderLeft = `4px solid ${navigationItems.dashboard.color}`;
                e.currentTarget.style.transform = "translateX(5px)";
                e.currentTarget.style.boxShadow = themeColors.shadowLight;
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.backgroundColor = isActivePath("/dashboard", true) ? `${navigationItems.dashboard.color}20` : "transparent";
                e.currentTarget.style.color = isActivePath("/dashboard", true) ? themeColors.textPrimary : themeColors.textSecondary;
                e.currentTarget.style.borderLeft = `4px solid ${isActivePath("/dashboard", true) ? navigationItems.dashboard.color : "transparent"}`;
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <FiHome style={{ 
              fontSize: "22px", 
              color: isActivePath("/dashboard", true) ? navigationItems.dashboard.iconColor : themeColors.textSecondary,
              transition: "all 0.3s ease"
            }} />
            {sidebarOpen && <span style={{ fontSize: "15px" }}>Dashboard</span>}
          </NavLink>

          {/* Other Navigation Items */}
          {Object.entries(navigationItems)
            .filter(([key]) => key !== "dashboard")
            .map(([key, item]) => {
              const isActive = isActivePath(item.path);
              const isExpanded = expandedSections[key] && sidebarOpen;
              const hasSubSections = item.subSections && item.subSections.length > 0;

              return (
                <div key={key}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      if (hasSubSections && sidebarOpen) {
                        toggleSection(key, e);
                      } else if (hasSubSections && !sidebarOpen) {
                        setSidebarOpen(true);
                        setTimeout(() => toggleSection(key, e), 100);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    style={{
                      borderLeft: `4px solid ${isActive ? item.color : "transparent"}`,
                      margin: "10px 12px",
                      padding: sidebarOpen ? "16px 20px" : "12px 0",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 0.3s ease",
                      justifyContent: sidebarOpen ? "flex-start" : "center",
                      gap: sidebarOpen ? "16px" : "0",
                      borderRadius: "10px",
                      cursor: "pointer",
                      color: isActive ? themeColors.textPrimary : themeColors.textSecondary,
                      backgroundColor: isActive ? `${item.color}20` : "transparent",
                      fontWeight: isActive ? 700 : 600,
                    }}
                    onMouseEnter={(e) => {
                      if (sidebarOpen) {
                        e.currentTarget.style.backgroundColor = `${item.color}15`;
                        e.currentTarget.style.color = item.color;
                        e.currentTarget.style.borderLeft = `4px solid ${item.color}`;
                        e.currentTarget.style.transform = "translateX(5px)";
                        e.currentTarget.style.boxShadow = themeColors.shadowLight;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (sidebarOpen) {
                        e.currentTarget.style.backgroundColor = isActive ? `${item.color}20` : "transparent";
                        e.currentTarget.style.color = isActive ? themeColors.textPrimary : themeColors.textSecondary;
                        e.currentTarget.style.borderLeft = `4px solid ${isActive ? item.color : "transparent"}`;
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    <span style={{ 
                      fontSize: "22px", 
                      color: isActive ? item.iconColor : themeColors.textSecondary,
                      transition: "all 0.3s ease"
                    }}>
                      {item.icon}
                    </span>
                    {sidebarOpen && (
                      <>
                        <span style={{ flex: 1, fontSize: "15px" }}>{item.label}</span>
                        {hasSubSections && (
                          <FiChevronDown style={{ 
                            color: item.color,
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease"
                          }} />
                        )}
                      </>
                    )}
                  </div>

                  {hasSubSections && isExpanded && sidebarOpen && (
                    <div style={{ 
                      marginLeft: "20px", 
                      paddingLeft: "12px", 
                      borderLeft: `2px dashed ${item.color}40`,
                    }}>
                      {renderNestedItems(item.subSections, item.color, item.iconColor)}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Settings and Logout */}
        <div style={{ 
          padding: "20px 12px", 
          borderTop: `1px solid ${themeColors.border}`,
          background: themeColors.sidebarBg,
        }}>
          <NavLink
            to="/settings/theme"
            style={{
              borderLeft: `4px solid ${isActivePath("/settings") ? themeColors.accent : "transparent"}`,
              margin: "8px 12px",
              padding: sidebarOpen ? "16px 20px" : "12px 0",
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              transition: "all 0.3s ease",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: sidebarOpen ? "16px" : "0",
              borderRadius: "10px",
              color: isActivePath("/settings") ? themeColors.textPrimary : themeColors.textSecondary,
              backgroundColor: isActivePath("/settings") ? `${themeColors.accent}20` : "transparent",
              fontWeight: isActivePath("/settings") ? 700 : 600,
            }}
            onMouseEnter={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.backgroundColor = `${themeColors.accent}15`;
                e.currentTarget.style.color = themeColors.accent;
                e.currentTarget.style.borderLeft = `4px solid ${themeColors.accent}`;
                e.currentTarget.style.transform = "translateX(5px)";
                e.currentTarget.style.boxShadow = themeColors.shadowLight;
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.backgroundColor = isActivePath("/settings") ? `${themeColors.accent}20` : "transparent";
                e.currentTarget.style.color = isActivePath("/settings") ? themeColors.textPrimary : themeColors.textSecondary;
                e.currentTarget.style.borderLeft = `4px solid ${isActivePath("/settings") ? themeColors.accent : "transparent"}`;
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <FiSettings style={{ 
              fontSize: "22px", 
              color: isActivePath("/settings") ? themeColors.accent : themeColors.textSecondary,
              transition: "all 0.3s ease"
            }} />
            {sidebarOpen && <span style={{ fontSize: "15px" }}>Settings</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            style={{
              color: themeColors.error,
              background: "transparent",
              margin: "8px 12px",
              padding: sidebarOpen ? "16px 20px" : "12px 0",
              display: "flex",
              alignItems: "center",
              border: "none",
              transition: "all 0.3s ease",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              gap: sidebarOpen ? "16px" : "0",
              borderRadius: "10px",
              cursor: "pointer",
              width: "100%",
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.backgroundColor = `${themeColors.error}15`;
                e.currentTarget.style.color = themeColors.error;
                e.currentTarget.style.borderLeft = `4px solid ${themeColors.error}`;
                e.currentTarget.style.transform = "translateX(5px)";
                e.currentTarget.style.boxShadow = themeColors.shadowLight;
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = themeColors.error;
                e.currentTarget.style.borderLeft = `4px solid transparent`;
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <FiLogOut style={{ 
              fontSize: "22px", 
              color: themeColors.error,
              transition: "all 0.3s ease"
            }} />
            {sidebarOpen && <span style={{ fontSize: "15px" }}>Logout</span>}
          </button>
        </div>

        {/* User Profile */}
        {sidebarOpen && (
          <div
            style={{
              padding: "20px 16px",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              backgroundColor: themeColors.hoverBg,
              borderTop: `1px solid ${themeColors.border}`,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.activeBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.hoverBg;
            }}
          >
            <UserAvatar />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: "15px", 
                fontWeight: 700, 
                color: themeColors.textPrimary,
                marginBottom: "4px"
              }}>
                {userData.name}
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: themeColors.accent,
                fontWeight: 600,
                marginBottom: "2px"
              }}>
                {userData.email}
              </div>
              <div style={{ 
                fontSize: "11px", 
                color: themeColors.textSecondary,
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{
                  background: `${themeColors.primary}20`,
                  color: themeColors.primary,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontWeight: 700
                }}>
                  {userData.role}
                </span>
                <span>•</span>
                <span>{userData.department}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Navigation;