// src/components/common/Navigation.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiCpu,
  FiTruck,
  FiSettings,
  FiLogOut,
  FiGrid,
  FiFolder,
  FiLayers,
  FiBox,
  FiActivity,
  FiClipboard,
  FiTool,
  FiDatabase,
  FiArchive,
  FiCheckSquare,
  FiScissors,
  FiX,
  FiChevronDown,
  FiMenu,
  FiRefreshCw,
  FiClock,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import './Navigation.css';

const Navigation = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const sidebarRef = useRef(null);
  const { theme, primaryColor } = useTheme();

  // Dynamic user data function
  const getUserData = () => {
    // Try multiple storage locations for user data
    const userName = localStorage.getItem('userName') ||
      sessionStorage.getItem('userName') ||
      localStorage.getItem('display_name') ||
      sessionStorage.getItem('display_name') ||
      localStorage.getItem('userDisplayName') ||
      sessionStorage.getItem('userDisplayName') ||
      "Admin User";

    const userEmail = localStorage.getItem('userEmail') ||
      sessionStorage.getItem('userEmail') ||
      localStorage.getItem('email') ||
      sessionStorage.getItem('email') ||
      localStorage.getItem('userEmailAddress') ||
      sessionStorage.getItem('userEmailAddress') ||
      "admin@pwi.com";

    const username = localStorage.getItem('username') ||
      sessionStorage.getItem('username') ||
      localStorage.getItem('userUsername') ||
      sessionStorage.getItem('userUsername') ||
      userName.toLowerCase().replace(/\s+/g, '.');

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
      role: 'Administrator'
    };
  };

  const [userData, setUserData] = useState(getUserData());
  const [logoMissing, setLogoMissing] = useState(false);
  const [mobileLogoMissing, setMobileLogoMissing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // REMOVED internal sidebarOpen state
  const sidebarOpen = isOpen; // Use prop
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimerRef = useRef(null);
  const leaveTimerRef = useRef(null);

  // Update user data when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setUserData(getUserData());
    };

    window.addEventListener('storage', handleStorageChange);

    // Check periodically for same-tab changes
    const interval = setInterval(() => {
      const newUserData = getUserData();
      if (JSON.stringify(newUserData) !== JSON.stringify(userData)) {
        setUserData(newUserData);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userData]);

  // Theme colors based on current theme
  const themeColors = useMemo(() => {
    const baseColors = {
      primary: primaryColor,
      secondary: '#8B5CF6',
      accent: '#059669',
      highlight: '#F0ABFC',
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
      info: '#3B82F6'
    };

    // Theme-specific colors
    if (theme === 'dark') {
      return {
        ...baseColors,
        bgPrimary: '#111827',
        bgSecondary: '#1F2937',
        bgCard: '#1F2937',
        textPrimary: '#F9FAFB',
        textSecondary: '#D1D5DB',
        textMuted: '#9CA3AF',
        border: '#374151',
        hoverBg: '#374151',
        activeBg: '#4B5563',
        sidebarBg: '#111827',
        headerBg: '#1F2937',
        badgeBackground: '#DC2626',
        badgeText: '#FFFFFF'
      };
    } else if (theme === 'blue') {
      return {
        ...baseColors,
        bgPrimary: '#EFF6FF',
        bgSecondary: '#DBEAFE',
        bgCard: '#FFFFFF',
        textPrimary: '#1E40AF',
        textSecondary: '#3B82F6',
        textMuted: '#60A5FA',
        border: '#BFDBFE',
        hoverBg: '#DBEAFE',
        activeBg: '#BFDBFE',
        sidebarBg: '#EFF6FF',
        headerBg: '#FFFFFF',
        badgeBackground: '#DC2626',
        badgeText: '#FFFFFF'
      };
    } else if (theme === 'green') {
      return {
        ...baseColors,
        bgPrimary: '#F0FDF4',
        bgSecondary: '#DCFCE7',
        bgCard: '#FFFFFF',
        textPrimary: '#065F46',
        textSecondary: '#059669',
        textMuted: '#34D399',
        border: '#BBF7D0',
        hoverBg: '#DCFCE7',
        activeBg: '#BBF7D0',
        sidebarBg: '#F0FDF4',
        headerBg: '#FFFFFF',
        badgeBackground: '#DC2626',
        badgeText: '#FFFFFF'
      };
    } else { // light theme
      return {
        ...baseColors,
        bgPrimary: '#FFFFFF',
        bgSecondary: '#F8FAFC',
        bgCard: '#FFFFFF',
        textPrimary: '#1F2937',
        textSecondary: '#4B5563',
        textMuted: '#6B7280',
        border: '#E5E7EB',
        hoverBg: '#F3F4F6',
        activeBg: '#E5E7EB',
        sidebarBg: '#F9FAFB',
        headerBg: '#FFFFFF',
        badgeBackground: '#DC2626',
        badgeText: '#FFFFFF'
      };
    }
  }, [theme, primaryColor]);

  // Function to get text color based on theme
  const getTextColor = (type = 'primary') => {
    switch (type) {
      case 'primary': return themeColors.textPrimary;
      case 'secondary': return themeColors.textSecondary;
      case 'muted': return themeColors.textMuted;
      case 'badge': return themeColors.badgeText;
      default: return themeColors.textPrimary;
    }
  };

  // Function to get contrast color for badges
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

  // Daily updates count state
  const [dailyUpdates, setDailyUpdates] = useState({
    production: 0,
    finance: 0,
    sales: 0,
    logistics: 0,
    hr: 0,
    it: 0
  });

  useEffect(() => {
    const savedUpdates = localStorage.getItem('daily_updates');
    if (savedUpdates) {
      try {
        setDailyUpdates(JSON.parse(savedUpdates));
      } catch (error) {
        console.error('Error parsing daily updates:', error);
      }
    }
  }, []);

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    dashboard: currentPath === '/dashboard',
    production: currentPath.includes('/production') || currentPath.includes('/production-sections'),
    rawMaterial: currentPath.includes('/raw-material'),
    flattening: currentPath.includes('/flattening'),
    spiral: currentPath.includes('/spiral'),
    pvc: currentPath.includes('/pvc'),
    cutting: currentPath.includes('/cutting'),
    finishedGoods: currentPath.includes('/finished-goods'),
    hr: currentPath.includes('/hr'),
    finance: currentPath.includes('/finance'),
    sales: currentPath.includes('/sales'),
    it: currentPath.includes('/it'),
    logistics: currentPath.includes('/logistics')
  });

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Removed setSidebarOpen logic as it is controlled by props now
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const newExpandedSections = { ...expandedSections };
    Object.keys(newExpandedSections).forEach(key => {
      if (currentPath.includes(key.replace('-', '')) ||
        (key === 'production' && (currentPath.includes('/production') || currentPath.includes('/production-sections')))) {
        newExpandedSections[key] = true;
      }
    });
    setExpandedSections(newExpandedSections);
  }, [currentPath]);

  // Click outside handling is done by Layout mostly, but keeping this for safety if sidebarRef used
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, sidebarOpen, onClose]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  const toggleSection = (section, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleSectionKey = useCallback((section, e) => {
    if (!e) return;
    const key = e.key;
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      toggleSection(section, e);
    }
  }, []);

  const handleSidebarMouseEnter = () => {
    // Managed by Layout via props, but if hover needed:
    /* if (!isMobile && !sidebarOpen) {
      // logic...
    } */
  };

  const handleSidebarMouseLeave = () => {
    // Managed by Layout
  };

  const toggleMobileMenu = () => {
    // if (onClose) onClose(); or toggle via prop? Layout controls this.
  };

  const closeMobileMenu = () => {
    if (onClose) onClose();
  };

  const resetDepartmentUpdates = (department, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDailyUpdates(prev => {
      const newUpdates = { ...prev, [department]: 0 };
      localStorage.setItem('daily_updates', JSON.stringify(newUpdates));
      return newUpdates;
    });
  };

  const UserAvatar = useCallback(({ size = 'default', showTooltip = true }) => {
    const avatarSize = size === 'mobile' ? 36 : 40;

    return (
      <div
        className="user-avatar"
        role="img"
        aria-label={userData.name}
        style={{
          width: `${avatarSize}px`,
          height: `${avatarSize}px`,
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          color: getContrastColor(themeColors.primary),
          fontWeight: 'bold',
          fontSize: size === 'mobile' ? '14px' : '16px',
          position: 'relative',
          border: `2px solid ${themeColors.accent}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
        {userData.initials}

        {!sidebarOpen && showTooltip && !isMobile && (
          <div
            className="user-profile-tooltip"
            role="group"
            aria-hidden={!sidebarOpen}
            style={{
              position: 'absolute',
              left: '50px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: themeColors.bgCard,
              border: `1px solid ${themeColors.border}`,
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 1001,
              minWidth: '200px',
              opacity: 0,
              visibility: 'hidden',
              transition: 'all 0.2s ease',
              pointerEvents: 'none'
            }}
          >
            <div className="tooltip-user-info">
              <div className="tooltip-user-name" style={{
                fontSize: '14px',
                fontWeight: 600,
                color: themeColors.textPrimary
              }}>
                {userData.name}
              </div>
              <div className="tooltip-user-email" style={{
                fontSize: '12px',
                color: themeColors.textSecondary
              }}>
                {userData.email}
              </div>
              <div className="tooltip-user-username" style={{
                fontSize: '11px',
                color: themeColors.accent,
                marginTop: '2px'
              }}>
                @{userData.username}
              </div>
              <div className="tooltip-user-role" style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '10px',
                display: 'inline-block',
                width: 'fit-content',
                marginTop: '4px',
                background: themeColors.primary,
                color: getContrastColor(themeColors.primary),
                fontWeight: 600
              }}>
                {userData.role}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, [userData, sidebarOpen, themeColors, isMobile, getContrastColor]);

  const navigationItems = useMemo(() => ({
    dashboard: {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <FiHome />,
      exact: true,
      color: themeColors.primary,
      badge: null
    },

    production: {
      path: '/dashboard/production',
      label: 'Production Dashboard',
      icon: <FiPackage />,
      color: themeColors.accent,
      badge: dailyUpdates.production > 0 ? dailyUpdates.production.toString() : null,
      isExpanded: expandedSections.production,
      subSections: [
        { path: '/dashboard/production', label: 'Production Department', icon: <FiGrid /> },
        { path: '/production-sections', label: 'All Sections', icon: <FiFolder /> },
        { path: '/production-reports/daily', label: 'Daily Production Report', icon: <FiActivity /> },

        {
          type: 'department',
          key: 'rawMaterial',
          label: 'Raw Material Department',
          icon: <FiDatabase />,
          color: themeColors.secondary,
          subItems: [
            { path: '/production-sections/raw-material', label: 'Raw Material Section', icon: <FiDatabase /> },
            { path: '/production-sections/raw-material/new', label: 'Raw Material Entry', icon: <FiClipboard /> },
            { path: '/flattening-ledger', label: 'Raw Material Inventory Ledger', icon: <FiDatabase /> },
            { path: '/production-sections/raw-material/material-received', label: 'Material Received', icon: <FiTool /> },
            { path: '/production-sections/raw-material/material-issue', label: 'Material Issue', icon: <FiTool /> },
            { path: '/production-sections/raw-material/new-log', label: 'New Material Log', icon: <FiClipboard /> }
          ]
        },

        {
          type: 'department',
          key: 'flattening',
          label: 'Flattening Department',
          icon: <FiBox />,
          color: themeColors.accent,
          subItems: [
            { path: '/production-sections/flattening', label: 'Flattening Section', icon: <FiLayers /> },
            { path: '/production-sections/flattening/smart-entry', label: 'Flattening Production Entry', icon: <FiClipboard /> },
            { path: '/flattening-inventory', label: 'Flattening Inventory Reports', icon: <FiArchive /> },
            { path: '/flattening-ledger', label: 'Flattening Inventory Ledger', icon: <FiDatabase /> },
            { path: '/production-reports/daily', label: 'Flattening Daily Report', icon: <FiActivity /> },
            { path: '/production-sections/flattening/new', label: 'New Flattening Record', icon: <FiClipboard /> }
          ]
        },

        {
          type: 'department',
          key: 'spiral',
          label: 'Spiral Department',
          icon: <FiLayers />,
          color: themeColors.accent,
          subItems: [
            { path: '/production-sections/spiral', label: 'Spiral Section', icon: <FiLayers /> },
            { path: '/production-sections/spiral/smart-entry', label: 'Spiral Production Entry', icon: <FiClipboard /> },
            { path: '/production-reports/daily', label: 'Spiral Inventory Reports', icon: <FiArchive /> },
            { path: '/production-sections/spiral/smart-entry', label: 'Spiral Smart Entry', icon: <FiActivity /> },
            { path: '/production-sections/spiral/new', label: 'New Spiral Record', icon: <FiClipboard /> }
          ]
        },

        {
          type: 'department',
          key: 'pvc',
          label: 'PVC Coating Department',
          icon: <FiPackage />,
          color: themeColors.secondary,
          subItems: [
            { path: '/production-sections/pvc-coating', label: 'PVC Coating Section', icon: <FiPackage /> },
            { path: '/production-sections/pvc-coating/smart-form', label: 'PVC Smart Entry', icon: <FiActivity /> },
            { path: '/production-sections/pvc-coating/smart-form', label: 'PVC Production Entry', icon: <FiClipboard /> },
            { path: '/production-reports/daily', label: 'PVC Inventory Reports', icon: <FiArchive /> },
            { path: '/production-sections/pvc-coating/new', label: 'New PVC Record', icon: <FiClipboard /> }
          ]
        },

        {
          type: 'department',
          key: 'cutting',
          label: 'Cutting Packing Section',
          icon: <FiScissors />,
          color: themeColors.accent,
          subItems: [
            { path: '/dashboard/production', label: 'Cutting Packing Section', icon: <FiScissors /> },
            { path: '/dashboard/production', label: 'Cutting Packing Entry', icon: <FiClipboard /> },
            { path: '/production-reports/daily', label: 'Packing Inventory Reports', icon: <FiArchive /> }
          ]
        },

        {
          type: 'department',
          key: 'finishedGoods',
          label: 'Finished Goods Section',
          icon: <FiCheckSquare />,
          color: themeColors.primary,
          subItems: [
            { path: '/dashboard/production', label: 'Finished Goods Section', icon: <FiCheckSquare /> },
            { path: '/production-reports/daily', label: 'Finished Goods Inventory Reports', icon: <FiArchive /> }
          ]
        }
      ]
    },

    hr: {
      path: '/hr',
      label: 'HR Department',
      icon: <FiUsers />,
      color: themeColors.secondary,
      badge: dailyUpdates.hr > 0 ? dailyUpdates.hr.toString() : null,
      subSections: [
        { path: '/hr/employees', label: 'Employees', icon: <FiUsers /> },
        { path: '/hr/attendance', label: 'Attendance', icon: <FiClipboard /> },
        { path: '/hr/payroll', label: 'Payroll', icon: <FiDollarSign /> },
        { path: '/hr/leaves', label: 'Leaves', icon: <FiActivity /> }
      ]
    },

    finance: {
      path: '/finance',
      label: 'Finance Department',
      icon: <FiDollarSign />,
      color: themeColors.accent,
      badge: dailyUpdates.finance > 0 ? dailyUpdates.finance.toString() : null,
      subSections: [
        { path: '/finance/accounts', label: 'Accounts', icon: <FiDollarSign /> },
        { path: '/finance/invoices', label: 'Invoices', icon: <FiClipboard /> },
        { path: '/finance/expenses', label: 'Expenses', icon: <FiActivity /> },
        { path: '/finance/reports', label: 'Reports', icon: <FiDatabase /> }
      ]
    },

    sales: {
      path: '/sales',
      label: 'Sales Department',
      icon: <FiShoppingCart />,
      color: themeColors.highlight,
      badge: dailyUpdates.sales > 0 ? dailyUpdates.sales.toString() : null,
      subSections: [
        { path: '/sales/orders', label: 'Orders', icon: <FiShoppingCart /> },
        { path: '/sales/customers', label: 'Customers', icon: <FiUsers /> },
        { path: '/sales/invoices', label: 'Invoices', icon: <FiClipboard /> },
        { path: '/sales/reports', label: 'Reports', icon: <FiDatabase /> }
      ]
    },

    it: {
      path: '/it',
      label: 'IT Department',
      icon: <FiCpu />,
      color: themeColors.secondary,
      badge: dailyUpdates.it > 0 ? dailyUpdates.it.toString() : null,
      subSections: [
        { path: '/it/support', label: 'IT Support', icon: <FiTool /> },
        { path: '/it/assets', label: 'Assets', icon: <FiDatabase /> },
        { path: '/it/network', label: 'Network', icon: <FiActivity /> },
        { path: '/it/security', label: 'Security', icon: <FiClipboard /> }
      ]
    },

    logistics: {
      path: '/logistics',
      label: 'Logistics Department',
      icon: <FiTruck />,
      color: themeColors.primary,
      badge: dailyUpdates.logistics > 0 ? dailyUpdates.logistics.toString() : null,
      subSections: [
        { path: '/logistics/inventory', label: 'Inventory', icon: <FiDatabase /> },
        { path: '/logistics/shipping', label: 'Shipping', icon: <FiTruck /> },
        { path: '/logistics/suppliers', label: 'Suppliers', icon: <FiUsers /> },
        { path: '/logistics/tracking', label: 'Tracking', icon: <FiActivity /> }
      ]
    }
  }), [themeColors, expandedSections, dailyUpdates]);

  const renderNestedItems = (items, departmentColor = themeColors.primary) => {
    if (!sidebarOpen) return null;

    return items.map((item, index) => {
      if (item.type === 'department') {
        const isDeptExpanded = expandedSections[item.key];
        const hasSubItems = item.subItems && item.subItems.length > 0;

        return (
          <div key={index} style={{ margin: '2px 0' }}>
            <div
              className={`department-header ${isDeptExpanded ? 'expanded' : ''}`}
              role="button"
              tabIndex={0}
              aria-expanded={!!isDeptExpanded}
              onClick={(e) => toggleSection(item.key, e)}
              onKeyDown={(e) => toggleSectionKey(item.key, e)}
              style={{
                color: isDeptExpanded ? themeColors.textPrimary : themeColors.textSecondary,
                backgroundColor: isDeptExpanded ? themeColors.hoverBg : 'transparent',
                borderLeft: `2px solid ${isDeptExpanded ? item.color : 'transparent'}`,
                margin: '3px 12px',
                padding: '12px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeColors.hoverBg;
                e.currentTarget.style.color = themeColors.textPrimary;
                e.currentTarget.style.borderLeft = `2px solid ${item.color}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDeptExpanded ? themeColors.hoverBg : 'transparent';
                e.currentTarget.style.color = isDeptExpanded ? themeColors.textPrimary : themeColors.textSecondary;
                e.currentTarget.style.borderLeft = `2px solid ${isDeptExpanded ? item.color : 'transparent'}`;
              }}
            >
              <span className="department-icon" style={{
                color: isDeptExpanded ? item.color : themeColors.textSecondary,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}>
                {item.icon}
              </span>

              <div className="department-label" style={{
                flex: 1,
                overflow: 'hidden',
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                transition: 'all 0.2s ease'
              }}>
                {item.label}
              </div>

              {hasSubItems && (
                <span className={`nav-chevron ${isDeptExpanded ? 'chevron-expanded' : ''}`} style={{
                  color: themeColors.accent,
                  fontSize: '14px',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiChevronDown />
                </span>
              )}
            </div>

            {isDeptExpanded && item.subItems && (
              <div className="sub-nav-container" style={{
                marginLeft: '16px',
                paddingLeft: '8px',
                borderLeft: `1px solid ${themeColors.border}`,
                animation: 'slideDown 0.2s ease'
              }}>
                {item.subItems.map((subItem, subIndex) => {
                  const isActive = currentPath === subItem.path || currentPath.startsWith(subItem.path);

                  return (
                    <NavLink
                      key={subItem.path || subIndex}
                      to={subItem.path}
                      className={`sub-nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => isMobile && onClose && onClose()}
                      style={{
                        color: isActive ? item.color : themeColors.textSecondary,
                        borderLeft: `2px solid ${isActive ? item.color : 'transparent'}`,
                        backgroundColor: isActive ? `${item.color}20` : 'transparent',
                        margin: '2px 12px',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '13px',
                        textDecoration: 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: 'none',
                        outline: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = themeColors.hoverBg;
                        e.currentTarget.style.color = themeColors.textPrimary;
                        e.currentTarget.style.borderLeft = `2px solid ${item.color}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isActive ? `${item.color}20` : 'transparent';
                        e.currentTarget.style.color = isActive ? item.color : themeColors.textSecondary;
                        e.currentTarget.style.borderLeft = `2px solid ${isActive ? item.color : 'transparent'}`;
                      }}
                    >
                      <span className="sub-nav-icon" style={{
                        color: isActive ? item.color : themeColors.textMuted,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        flexShrink: 0,
                        transition: 'all 0.2s ease'
                      }}>
                        {subItem.icon}
                      </span>

                      <div className="sub-nav-label" style={{
                        flex: 1,
                        overflow: 'hidden',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.2s ease'
                      }}>
                        {subItem.label}
                      </div>
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
          key={item.path || index}
          to={item.path}
          className={`sub-nav-link ${isActive ? 'active' : ''}`}
          onClick={() => isMobile && closeMobileMenu()}
          style={{
            color: isActive ? departmentColor : themeColors.textSecondary,
            borderLeft: `2px solid ${isActive ? departmentColor : 'transparent'}`,
            backgroundColor: isActive ? `${departmentColor}20` : 'transparent',
            margin: '2px 12px',
            padding: '10px 20px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            textDecoration: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.hoverBg;
            e.currentTarget.style.color = themeColors.textPrimary;
            e.currentTarget.style.borderLeft = `2px solid ${departmentColor}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isActive ? `${departmentColor}20` : 'transparent';
            e.currentTarget.style.color = isActive ? departmentColor : themeColors.textSecondary;
            e.currentTarget.style.borderLeft = `2px solid ${isActive ? departmentColor : 'transparent'}`;
          }}
        >
          <span className="sub-nav-icon" style={{
            color: isActive ? departmentColor : themeColors.textMuted,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            flexShrink: 0,
            transition: 'all 0.2s ease'
          }}>
            {item.icon}
          </span>

          <div className="sub-nav-label" style={{
            flex: 1,
            overflow: 'hidden',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            transition: 'all 0.2s ease'
          }}>
            {item.label}
          </div>
        </NavLink>
      );
    });
  };

  const MobileHeader = () => {
    if (!isMobile) return null;

    return (
      <div className="mobile-header" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 1100,
        background: themeColors.headerBg,
        borderBottom: `1px solid ${themeColors.border}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="mobile-header-left" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={toggleMobileMenu}
            className="mobile-menu-button"
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '24px',
              background: 'none',
              border: 'none',
              color: themeColors.textPrimary,
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = themeColors.hoverBg;
              e.currentTarget.style.color = themeColors.textPrimary;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = themeColors.textPrimary;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FiMenu />
          </button>

          <div className="mobile-logo-container" style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            overflow: 'hidden',
            background: themeColors.bgCard,
            border: `2px solid ${themeColors.accent}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {!mobileLogoMissing ? (
              <img
                src="/assets/images/logoA.png"
                alt="PWI Logo"
                className="mobile-logo"
                onError={() => setMobileLogoMissing(true)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div className="mobile-logo-text" style={{
                fontWeight: 700,
                fontSize: '18px',
                color: themeColors.primary
              }}>
                PWI
              </div>
            )}
          </div>

          <div className="mobile-company-name" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="company-main-name" style={{
              fontSize: '14px',
              fontWeight: 700,
              color: themeColors.textPrimary,
              lineHeight: 1.2
            }}>
              PAKISTAN WIRE
            </div>
            <div className="company-sub-name" style={{
              fontSize: '10px',
              fontWeight: 500,
              color: themeColors.accent,
              lineHeight: 1.2
            }}>
              INDUSTRIES LTD
            </div>
          </div>
        </div>

        <div className="mobile-header-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div className="mobile-user-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div className="mobile-user-name" style={{
              fontSize: '14px',
              fontWeight: 600,
              color: themeColors.textPrimary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px'
            }}>
              {userData.name.split(' ')[0]}
            </div>
            <div className="mobile-user-username" style={{
              fontSize: '11px',
              color: themeColors.textSecondary,
              opacity: 0.8
            }}>
              @{userData.username}
            </div>
          </div>

          <UserAvatar size="mobile" showTooltip={false} />
        </div>
      </div>
    );
  };

  const getSidebarWidth = () => {
    if (isMobile) {
      return sidebarOpen ? '280px' : '0px';
    }
    return sidebarOpen ? '280px' : '70px';
  };

  return (
    <>
      <MobileHeader />

      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeMobileMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {!isMobile && !sidebarOpen && (
        <div
          className="sidebar-hover-trigger"
          onMouseEnter={handleSidebarMouseEnter}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '20px',
            height: '100vh',
            zIndex: 999,
            background: 'transparent'
          }}
        />
      )}

      <div
        ref={sidebarRef}
        className={`sidebar-container ${!sidebarOpen ? 'collapsed' : ''}`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        style={{
          width: getSidebarWidth(),
          height: isMobile ? '100vh' : '100vh',
          top: isMobile ? '0' : '0',
          position: isMobile ? 'fixed' : 'fixed',
          zIndex: isMobile ? (sidebarOpen ? 1000 : -1) : 1000,
          opacity: isMobile ? (sidebarOpen ? 1 : 0) : 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: themeColors.sidebarBg,
          borderRight: `1px solid ${themeColors.border}`,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.1)',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div className="logo-section" style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          gap: '15px',
          minHeight: '96px',
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          textAlign: 'center',
          flexShrink: 0,
          flexDirection: sidebarOpen ? 'row' : 'column'
        }}>
          {isMobile && sidebarOpen && (
            <button
              onClick={closeMobileMenu}
              className="close-button"
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <FiX />
            </button>
          )}

          <div className="logo-container" style={{
            width: sidebarOpen ? '48px' : '40px',
            height: sidebarOpen ? '48px' : '40px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '4px',
            border: `2px solid ${themeColors.accent}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            margin: sidebarOpen ? '0' : '0 auto'
          }}>
            {!logoMissing ? (
              <img
                src="/assets/images/logoA.png"
                alt="PWI Logo"
                className="logo-image"
                onError={() => setLogoMissing(true)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div className="logo-text" style={{
                fontWeight: 700,
                fontSize: '16px',
                color: themeColors.primary,
                borderRadius: '6px'
              }}>
                PWI
              </div>
            )}
          </div>

          {sidebarOpen && (
            <div className="company-info" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              overflow: 'hidden'
            }}>
              <h1 className="company-title" style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.2,
                whiteSpace: 'nowrap'
              }}>
                PAKISTAN WIRE
              </h1>
              <p className="company-subtitle" style={{
                margin: 0,
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}>
                INDUSTRIES LTD
              </p>

              <div className="company-badge" style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '9px',
                fontWeight: 700,
                marginTop: '6px',
                whiteSpace: 'nowrap',
                border: 'none'
              }}>
                SPI & CCD DIVISION
              </div>
            </div>
          )}
        </div>

        <div className="navigation-items" style={{
          padding: '16px 0',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: themeColors.sidebarBg
        }}>
          {/* Dashboard Link */}
          <NavLink
            to={navigationItems.dashboard.path}
            end={navigationItems.dashboard.exact}
            className={`nav-link ${!sidebarOpen ? 'nav-link-collapsed' : ''} ${currentPath === '/dashboard' ? 'active' : ''}`}
            onClick={() => isMobile && closeMobileMenu()}
            style={{
              borderLeft: `3px solid ${currentPath === '/dashboard' ? navigationItems.dashboard.color : 'transparent'}`,
              margin: '3px 12px',
              padding: sidebarOpen ? '14px 20px' : '12px 0',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: sidebarOpen ? '14px' : '0',
              cursor: 'pointer',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              border: 'none',
              outline: 'none',
              fontWeight: 500,
              color: currentPath === '/dashboard' ? themeColors.textPrimary : themeColors.textSecondary,
              background: currentPath === '/dashboard' ? themeColors.hoverBg : 'transparent',
              width: sidebarOpen ? 'auto' : '46px'
            }}
            onMouseEnter={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.background = themeColors.hoverBg;
                e.currentTarget.style.color = themeColors.textPrimary;
                e.currentTarget.style.borderLeft = `3px solid ${navigationItems.dashboard.color}`;
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.background = currentPath === '/dashboard' ? themeColors.hoverBg : 'transparent';
                e.currentTarget.style.color = currentPath === '/dashboard' ? themeColors.textPrimary : themeColors.textSecondary;
                e.currentTarget.style.borderLeft = `3px solid ${currentPath === '/dashboard' ? navigationItems.dashboard.color : 'transparent'}`;
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <span className="nav-icon" style={{
              color: currentPath === '/dashboard' ? navigationItems.dashboard.color : themeColors.textSecondary,
              fontSize: '20px',
              minWidth: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}>
              {navigationItems.dashboard.icon}
            </span>

            {sidebarOpen && (
              <div className="nav-label" style={{
                flex: 1,
                overflow: 'hidden',
                fontSize: '14px',
                fontWeight: currentPath === '/dashboard' ? 600 : 500,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                color: currentPath === '/dashboard' ? themeColors.textPrimary : themeColors.textSecondary,
                transition: 'all 0.2s ease'
              }}>
                {navigationItems.dashboard.label}
              </div>
            )}
          </NavLink>

          {/* Production Section */}
          <div style={{ margin: '8px 0' }}>
            <div
              className={`nav-link ${!sidebarOpen ? 'nav-link-collapsed' : ''} ${currentPath.includes('/production') || currentPath.includes('/production-sections') ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              aria-expanded={!!expandedSections.production}
              onClick={(e) => toggleSection('production', e)}
              onKeyDown={(e) => toggleSectionKey('production', e)}
              style={{
                borderLeft: `3px solid ${currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                  navigationItems.production.color : 'transparent'}`,
                margin: '3px 12px',
                padding: sidebarOpen ? '14px 20px' : '12px 0',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                gap: sidebarOpen ? '14px' : '0',
                cursor: 'pointer',
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                border: 'none',
                outline: 'none',
                fontWeight: 500,
                color: currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                  themeColors.textPrimary : themeColors.textSecondary,
                background: currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                  themeColors.hoverBg : 'transparent',
                width: sidebarOpen ? 'auto' : '46px'
              }}
              onMouseEnter={(e) => {
                if (sidebarOpen) {
                  e.currentTarget.style.background = themeColors.hoverBg;
                  e.currentTarget.style.color = themeColors.textPrimary;
                  e.currentTarget.style.borderLeft = `3px solid ${navigationItems.production.color}`;
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (sidebarOpen) {
                  e.currentTarget.style.background = currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                    themeColors.hoverBg : 'transparent';
                  e.currentTarget.style.color = currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                    themeColors.textPrimary : themeColors.textSecondary;
                  e.currentTarget.style.borderLeft = `3px solid ${currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                    navigationItems.production.color : 'transparent'}`;
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <span className="nav-icon" style={{
                color: currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                  navigationItems.production.color : themeColors.textSecondary,
                fontSize: '20px',
                minWidth: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}>
                {navigationItems.production.icon}
              </span>

              {sidebarOpen && (
                <>
                  <div className="nav-label" style={{
                    flex: 1,
                    overflow: 'hidden',
                    fontSize: '14px',
                    fontWeight: currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                      600 : 500,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    color: currentPath.includes('/production') || currentPath.includes('/production-sections') ?
                      themeColors.textPrimary : themeColors.textSecondary,
                    transition: 'all 0.2s ease'
                  }}>
                    {navigationItems.production.label}
                  </div>

                  <div className="nav-right-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {navigationItems.production.badge && (
                      <div className="badge-with-reset" style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                        <span
                          className="nav-badge"
                          title={`Today's updates: ${dailyUpdates.production}`}
                          style={{
                            background: themeColors.badgeBackground,
                            color: getContrastColor(themeColors.badgeBackground),
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            minWidth: '18px',
                            textAlign: 'center',
                            lineHeight: 1,
                            flexShrink: 0,
                            cursor: 'help',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {navigationItems.production.badge}
                        </span>
                        <button
                          className="reset-badge-btn"
                          onClick={(e) => resetDepartmentUpdates('production', e)}
                          title="Reset daily count"
                          style={{
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: themeColors.error,
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '8px',
                            padding: 0,
                            opacity: 0,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.background = themeColors.error;
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0';
                            e.currentTarget.style.background = themeColors.error;
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <FiRefreshCw size={10} />
                        </button>
                      </div>
                    )}

                    <span className={`nav-chevron ${expandedSections.production ? 'chevron-expanded' : ''}`} style={{
                      color: themeColors.accent,
                      fontSize: '14px',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiChevronDown />
                    </span>
                  </div>
                </>
              )}
            </div>

            {expandedSections.production && sidebarOpen && (
              <div className="sub-nav-container" style={{
                marginLeft: '16px',
                paddingLeft: '8px',
                borderLeft: `1px solid ${themeColors.border}`,
                animation: 'slideDown 0.2s ease'
              }}>
                {renderNestedItems(navigationItems.production.subSections, navigationItems.production.color)}
              </div>
            )}
          </div>

          {/* Other Navigation Items */}
          {Object.entries(navigationItems)
            .filter(([key]) => !['dashboard', 'production'].includes(key))
            .map(([key, item]) => {
              const isActive = currentPath.includes(item.path) ||
                (item.subSections && item.subSections.some(sub => sub.path && currentPath.startsWith(sub.path)));
              const isExpanded = expandedSections[key] && sidebarOpen;
              const hasSubSections = item.subSections && item.subSections.length > 0;

              return (
                <div key={key} style={{ margin: '8px 0' }}>
                  <div
                    className={`nav-link ${!sidebarOpen ? 'nav-link-collapsed' : ''} ${isActive ? 'active' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-expanded={!!expandedSections[key]}
                    onKeyDown={(e) => {
                      if (hasSubSections) {
                        toggleSectionKey(key, e);
                      } else if (e.key === 'Enter') {
                        navigate(item.path);
                        isMobile && closeMobileMenu();
                      }
                    }}
                    onClick={(e) => {
                      if (hasSubSections && sidebarOpen) {
                        toggleSection(key, e);
                      } else if (hasSubSections && !sidebarOpen) {
                        setSidebarOpen(true);
                        setTimeout(() => {
                          toggleSection(key, e);
                        }, 100);
                      } else {
                        navigate(item.path);
                        isMobile && closeMobileMenu();
                      }
                    }}
                    style={{
                      borderLeft: `3px solid ${isActive ? item.color : 'transparent'}`,
                      margin: '3px 12px',
                      padding: sidebarOpen ? '14px 20px' : '12px 0',
                      display: 'flex',
                      alignItems: 'center',
                      textDecoration: 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      gap: sidebarOpen ? '14px' : '0',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      border: 'none',
                      outline: 'none',
                      fontWeight: 500,
                      color: isActive ? themeColors.textPrimary : themeColors.textSecondary,
                      background: isActive ? themeColors.hoverBg : 'transparent',
                      width: sidebarOpen ? 'auto' : '46px'
                    }}
                    onMouseEnter={(e) => {
                      if (sidebarOpen) {
                        e.currentTarget.style.background = themeColors.hoverBg;
                        e.currentTarget.style.color = themeColors.textPrimary;
                        e.currentTarget.style.borderLeft = `3px solid ${item.color}`;
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (sidebarOpen) {
                        e.currentTarget.style.background = isActive ? themeColors.hoverBg : 'transparent';
                        e.currentTarget.style.color = isActive ? themeColors.textPrimary : themeColors.textSecondary;
                        e.currentTarget.style.borderLeft = `3px solid ${isActive ? item.color : 'transparent'}`;
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <span className="nav-icon" style={{
                      color: isActive ? item.color : themeColors.textSecondary,
                      fontSize: '20px',
                      minWidth: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}>
                      {item.icon}
                    </span>

                    {sidebarOpen && (
                      <>
                        <div className="nav-label" style={{
                          flex: 1,
                          overflow: 'hidden',
                          fontSize: '14px',
                          fontWeight: isActive ? 600 : 500,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          color: isActive ? themeColors.textPrimary : themeColors.textSecondary,
                          transition: 'all 0.2s ease'
                        }}>
                          {item.label}
                        </div>

                        <div className="nav-right-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.badge && (
                            <div className="badge-with-reset" style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                              <span
                                className="nav-badge"
                                title={`Today's updates: ${dailyUpdates[key] || 0}`}
                                style={{
                                  background: themeColors.badgeBackground,
                                  color: getContrastColor(themeColors.badgeBackground),
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  padding: '2px 6px',
                                  borderRadius: '10px',
                                  minWidth: '18px',
                                  textAlign: 'center',
                                  lineHeight: 1,
                                  flexShrink: 0,
                                  cursor: 'help',
                                  position: 'relative',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {item.badge}
                              </span>
                              <button
                                className="reset-badge-btn"
                                onClick={(e) => resetDepartmentUpdates(key, e)}
                                title="Reset daily count"
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: themeColors.error,
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  cursor: 'pointer',
                                  fontSize: '8px',
                                  padding: 0,
                                  opacity: 0,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                  e.currentTarget.style.background = themeColors.error;
                                  e.currentTarget.style.transform = 'scale(1.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '0';
                                  e.currentTarget.style.background = themeColors.error;
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <FiRefreshCw size={10} />
                              </button>
                            </div>
                          )}

                          {hasSubSections && sidebarOpen && (
                            <span className={`nav-chevron ${isExpanded ? 'chevron-expanded' : ''}`} style={{
                              color: themeColors.accent,
                              fontSize: '14px',
                              transition: 'transform 0.2s ease',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <FiChevronDown />
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {hasSubSections && isExpanded && sidebarOpen && (
                    <div className="sub-nav-container" style={{
                      marginLeft: '16px',
                      paddingLeft: '8px',
                      borderLeft: `1px solid ${themeColors.border}`,
                      animation: 'slideDown 0.2s ease'
                    }}>
                      {item.subSections.map((subItem) => {
                        const subIsActive = currentPath === subItem.path || currentPath.startsWith(subItem.path);

                        return (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            className={`sub-nav-link ${subIsActive ? 'active' : ''}`}
                            onClick={() => isMobile && closeMobileMenu()}
                            style={{
                              color: subIsActive ? item.color : themeColors.textSecondary,
                              borderLeft: `2px solid ${subIsActive ? item.color : 'transparent'}`,
                              backgroundColor: subIsActive ? `${item.color}20` : 'transparent',
                              margin: '2px 12px',
                              padding: '10px 20px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              fontSize: '13px',
                              textDecoration: 'none',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              border: 'none',
                              outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = themeColors.hoverBg;
                              e.currentTarget.style.color = themeColors.textPrimary;
                              e.currentTarget.style.borderLeft = `2px solid ${item.color}`;
                              e.currentTarget.style.transform = 'translateX(4px)';
                              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = subIsActive ? `${item.color}20` : 'transparent';
                              e.currentTarget.style.color = subIsActive ? item.color : themeColors.textSecondary;
                              e.currentTarget.style.borderLeft = `2px solid ${subIsActive ? item.color : 'transparent'}`;
                              e.currentTarget.style.transform = 'translateX(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <span className="sub-nav-icon" style={{
                              color: subIsActive ? item.color : themeColors.textMuted,
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '18px',
                              flexShrink: 0,
                              transition: 'all 0.2s ease'
                            }}>
                              {subItem.icon}
                            </span>

                            <div className="sub-nav-label" style={{
                              flex: 1,
                              overflow: 'hidden',
                              fontSize: '12px',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              transition: 'all 0.2s ease'
                            }}>
                              {subItem.label}
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Settings and Logout */}
        <div className="settings-logout" style={{
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          borderTop: `1px solid ${themeColors.border}`,
          background: themeColors.sidebarBg,
          flexShrink: 0
        }}>
          <NavLink
            to="/settings/theme"
            className={`nav-link ${!sidebarOpen ? 'nav-link-collapsed' : ''} ${currentPath.includes('/settings') ? 'active' : ''}`}
            onClick={() => isMobile && closeMobileMenu()}
            style={{
              borderLeft: `3px solid ${currentPath.includes('/settings') ? themeColors.accent : 'transparent'}`,
              margin: '3px 12px',
              padding: sidebarOpen ? '14px 20px' : '12px 0',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: sidebarOpen ? '14px' : '0',
              cursor: 'pointer',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              border: 'none',
              outline: 'none',
              fontWeight: 500,
              color: currentPath.includes('/settings') ? themeColors.textPrimary : themeColors.textSecondary,
              background: currentPath.includes('/settings') ? themeColors.hoverBg : 'transparent',
              width: sidebarOpen ? 'auto' : '46px'
            }}
            onMouseEnter={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.background = themeColors.hoverBg;
                e.currentTarget.style.color = themeColors.textPrimary;
                e.currentTarget.style.borderLeft = `3px solid ${themeColors.accent}`;
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.background = currentPath.includes('/settings') ? themeColors.hoverBg : 'transparent';
                e.currentTarget.style.color = currentPath.includes('/settings') ? themeColors.textPrimary : themeColors.textSecondary;
                e.currentTarget.style.borderLeft = `3px solid ${currentPath.includes('/settings') ? themeColors.accent : 'transparent'}`;
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <FiSettings className="nav-icon" style={{
              color: currentPath.includes('/settings') ? themeColors.accent : themeColors.textSecondary,
              fontSize: '20px',
              minWidth: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }} />
            {sidebarOpen && (
              <span className="nav-label" style={{
                flex: 1,
                overflow: 'hidden',
                fontSize: '14px',
                fontWeight: currentPath.includes('/settings') ? 600 : 500,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                color: currentPath.includes('/settings') ? themeColors.textPrimary : themeColors.textSecondary,
                transition: 'all 0.2s ease'
              }}>
                Settings
              </span>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            className="logout-button"
            style={{
              color: themeColors.error,
              backgroundColor: `${themeColors.error}15`,
              margin: '3px 12px',
              padding: sidebarOpen ? '14px 20px' : '12px 0',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: sidebarOpen ? '14px' : '0',
              cursor: 'pointer',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              border: 'none',
              outline: 'none',
              fontWeight: 500,
              borderLeft: `3px solid transparent`,
              width: sidebarOpen ? 'auto' : '46px'
            }}
            onMouseEnter={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.background = themeColors.error;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderLeft = `3px solid ${themeColors.error}`;
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (sidebarOpen) {
                e.currentTarget.style.background = `${themeColors.error}15`;
                e.currentTarget.style.color = themeColors.error;
                e.currentTarget.style.borderLeft = `3px solid transparent`;
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <FiLogOut className="nav-icon" style={{
              color: themeColors.error,
              fontSize: '20px',
              minWidth: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }} />
            {sidebarOpen && (
              <span className="nav-label" style={{
                flex: 1,
                overflow: 'hidden',
                fontSize: '14px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                color: themeColors.error,
                transition: 'all 0.2s ease'
              }}>
                Logout
              </span>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="user-profile" style={{
          padding: '16px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          justifyContent: 'flex-start',
          backgroundColor: themeColors.hoverBg,
          borderTop: `1px solid ${themeColors.border}`,
          flexShrink: 0,
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.activeBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = themeColors.hoverBg;
          }}
        >
          <UserAvatar size={sidebarOpen ? 'default' : 'small'} showTooltip={!sidebarOpen} />
          {sidebarOpen && (
            <div className="user-info" style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden'
            }}>
              <div className="user-name" style={{
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: themeColors.textPrimary
              }}>
                {userData.name}
              </div>
              <div className="user-email" style={{
                fontSize: '12px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 500,
                color: themeColors.accent
              }}>
                {userData.email}
              </div>
              <div className="user-username" style={{
                fontSize: '11px',
                color: themeColors.textSecondary,
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                @{userData.username}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navigation;