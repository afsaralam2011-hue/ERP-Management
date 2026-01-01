// src/components/common/Navigation.jsx
import React, { useState, useEffect, useRef } from 'react';
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
  FiChevronRight,
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
  FiX
} from 'react-icons/fi';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const sidebarRef = useRef(null);
  const headerRef = useRef(null);
  
  // Your provided color scheme with proper contrast
  const COLORS = {
    primary: '#3C467B',    // Dark Blue - Primary color
    secondary: '#50589C',  // Medium Blue - Secondary
    accent: '#636CCB',     // Light Blue - Accent
    highlight: '#6E8CFB',  // Very Light Blue - Highlight
    white: '#FFFFFF',
    lightGray: '#F8FAFC',
    darkGray: '#1E293B',
    black: '#0F172A'
  };
  
  // Auto-detect screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [showMobileHeader, setShowMobileHeader] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
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

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile) {
        setSidebarOpen(false);
        setShowMobileHeader(true);
      } else {
        setSidebarOpen(false);
        setShowMobileHeader(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-expand based on current path
  useEffect(() => {
    const newExpandedSections = { ...expandedSections };
    
    // Check and expand relevant sections based on current path
    Object.keys(newExpandedSections).forEach(key => {
      if (currentPath.includes(key.replace('-', '')) || 
          (key === 'production' && (currentPath.includes('/production') || currentPath.includes('/production-sections')))) {
        newExpandedSections[key] = true;
      }
    });
    
    setExpandedSections(newExpandedSections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  // Set active item based on current path
  useEffect(() => {
    // Find which item is currently active
    const path = currentPath;
    setActiveItem(path);
  }, [currentPath]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen) {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          setSidebarOpen(false);
          setShowMobileHeader(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  // Toggle section
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

  // Handle sidebar hover (desktop only)
  const handleSidebarMouseEnter = () => {
    if (!isMobile) {
      setSidebarOpen(true);
      setShowMobileHeader(false);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!isMobile) {
      setSidebarOpen(false);
      setShowMobileHeader(true);
      setHoveredItem(null);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    const newSidebarState = !sidebarOpen;
    setSidebarOpen(newSidebarState);
    setShowMobileHeader(!newSidebarState);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setSidebarOpen(false);
    setShowMobileHeader(true);
  };

  // Handle item hover
  const handleItemHover = (itemId) => {
    if (!isMobile) {
      setHoveredItem(itemId);
    }
  };

  const handleItemLeave = () => {
    if (!isMobile) {
      setHoveredItem(null);
    }
  };

  // ========== NAVIGATION ITEMS STRUCTURE ==========
  // HOW TO ADD NEW ITEM: Copy this structure and modify
  const navigationItems = {
    dashboard: {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <FiHome />,
      exact: true,
      color: COLORS.primary
    },
    
    production: {
      path: '/dashboard/production',
      label: 'Production Dashboard',
      icon: <FiPackage />,
      color: COLORS.accent,
      isExpanded: expandedSections.production,
      subSections: [
        // Main Production Dashboard
        { path: '/dashboard/production', label: 'Production Department', icon: <FiGrid /> },
        
        // All Sections
        { path: '/production-sections', label: 'All Sections', icon: <FiFolder /> },
        
        // All Daily Production Report
        { path: '/production-reports/daily', label: 'Daily Production Report', icon: <FiActivity /> },
        
        // Raw Material Department (will have nested items)
        { 
          type: 'department',
          key: 'rawMaterial',
          label: 'Raw Material Department', 
          icon: <FiDatabase />,
          color: COLORS.secondary,
          subItems: [
            { path: '/production-sections/raw-material', label: 'Raw Material Section', icon: <FiDatabase /> },
            { path: '/production-sections/raw-material/new', label: 'Raw Material Entry', icon: <FiClipboard /> },
            {
              type: 'nested',
              label: 'Raw Material Inventory Reports',
              icon: <FiArchive />,
              subItems: [
                { path: '/flattening-ledger', label: 'Raw Material Inventory Ledger', icon: <FiDatabase /> }
              ]
            },
            { 
              type: 'nested',
              label: 'Raw Material Daily Report',
              icon: <FiActivity />,
              subItems: [
                { path: '/production-sections/raw-material/material-received', label: 'Material Received', icon: <FiTool /> },
                { path: '/production-sections/raw-material/material-issue', label: 'Material Issue', icon: <FiTool /> }
              ]
            },
            { path: '/production-sections/raw-material/new-log', label: 'New Material Log', icon: <FiClipboard /> }
          ]
        },
        
        // Flattening Department
        { 
          type: 'department',
          key: 'flattening',
          label: 'Flattening Department', 
          icon: <FiBox />,
          color: COLORS.highlight,
          subItems: [
            { path: '/production-sections/flattening/smart-entry', label: 'Flattening Production Entry', icon: <FiClipboard /> },
            { path: '/flattening-inventory', label: 'Flattening Inventory Reports', icon: <FiArchive /> },
            { path: '/flattening-ledger', label: 'Flattening Inventory Ledger', icon: <FiDatabase /> },
            { path: '/production-reports/daily', label: 'Flattening Daily Report', icon: <FiActivity /> },
            { path: '/production-sections/flattening/new', label: 'New Flattening Record', icon: <FiClipboard /> }
          ]
        },
        
        // Spiral Department
        { 
          type: 'department',
          key: 'spiral',
          label: 'Spiral Department', 
          icon: <FiLayers />,
          color: COLORS.accent,
          subItems: [
            { path: '/production-sections/spiral', label: 'Spiral Section', icon: <FiLayers /> },
            { path: '/production-sections/spiral/smart-entry', label: 'Spiral Production Entry', icon: <FiClipboard /> },
            { path: '/production-reports/daily', label: 'Spiral Inventory Reports', icon: <FiArchive /> },
            { path: '/production-sections/spiral/smart-entry', label: 'Spiral Smart Entry', icon: <FiActivity /> },
            { path: '/production-sections/spiral/new', label: 'New Spiral Record', icon: <FiClipboard /> }
          ]
        },
        
        // PVC Coating Department
        { 
          type: 'department',
          key: 'pvc',
          label: 'PVC Coating Department', 
          icon: <FiPackage />,
          color: COLORS.secondary,
          subItems: [
            { path: '/production-sections/pvc-coating', label: 'PVC Coating Section', icon: <FiPackage /> },
            { path: '/production-sections/pvc-coating/smart-form', label: 'PVC Smart Entry', icon: <FiActivity /> },
            { path: '/production-sections/pvc-coating/smart-form', label: 'PVC Production Entry', icon: <FiClipboard /> },
            { path: '/production-reports/daily', label: 'PVC Inventory Reports', icon: <FiArchive /> },
            { path: '/production-sections/pvc-coating/new', label: 'New PVC Record', icon: <FiClipboard /> }
          ]
        },
        
        // Cutting Packing Section
        { 
          type: 'department',
          key: 'cutting',
          label: 'Cutting Packing Section', 
          icon: <FiScissors />,
          color: COLORS.highlight,
          subItems: [
            { path: '/dashboard/production', label: 'Cutting Packing Section', icon: <FiScissors /> },
            { path: '/dashboard/production', label: 'Cutting Packing Entry', icon: <FiClipboard /> },
            { path: '/production-reports/daily', label: 'Packing Inventory Reports', icon: <FiArchive /> }
          ]
        },
        
        // Finished Goods Section
        { 
          type: 'department',
          key: 'finishedGoods',
          label: 'Finished Goods Section', 
          icon: <FiCheckSquare />,
          color: COLORS.primary,
          subItems: [
            { path: '/dashboard/production', label: 'Finished Goods Section', icon: <FiCheckSquare /> },
            { path: '/production-reports/daily', label: 'Finished Goods Inventory Reports', icon: <FiArchive /> }
          ]
        }
      ]
    },
    
    // Other Departments
    hr: {
      path: '/hr',
      label: 'HR Department',
      icon: <FiUsers />,
      color: COLORS.secondary,
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
      color: COLORS.accent,
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
      color: COLORS.highlight,
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
      color: COLORS.secondary,
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
      color: COLORS.primary,
      subSections: [
        { path: '/logistics/inventory', label: 'Inventory', icon: <FiDatabase /> },
        { path: '/logistics/shipping', label: 'Shipping', icon: <FiTruck /> },
        { path: '/logistics/suppliers', label: 'Suppliers', icon: <FiUsers /> },
        { path: '/logistics/tracking', label: 'Tracking', icon: <FiActivity /> }
      ]
    }
  };

  // Calculate sidebar width
  const getSidebarWidth = () => {
    if (isMobile) {
      return sidebarOpen ? '100vw' : '0px';
    }
    return sidebarOpen ? '320px' : '70px';
  };

  // Calculate content margin
  const getContentMargin = () => {
    if (isMobile) {
      return '0px'; // Mobile pe margin nahi chahiye
    }
    return sidebarOpen ? '320px' : '70px';
  };

  // Navigation link styles with HOVER and ACTIVE states
  const getNavLinkStyle = (isActive, itemKey = '') => {
    const isHovered = hoveredItem === itemKey;
    const isClicked = activeItem === itemKey;
    
    let backgroundColor = 'transparent';
    let color = isActive ? COLORS.white : '#cbd5e1';
    let borderLeft = 'none';
    let transform = 'none';
    let boxShadow = 'none';
    
    // HOVER STATE
    if (isHovered && !isActive) {
      backgroundColor = 'rgba(110, 140, 251, 0.1)'; // COLORS.highlight with opacity
      color = COLORS.highlight;
      borderLeft = `3px solid ${COLORS.highlight}`;
    }
    
    // ACTIVE STATE (when clicked/selected)
    if (isActive || isClicked) {
      backgroundColor = COLORS.primary;
      color = COLORS.white;
      borderLeft = `3px solid ${COLORS.highlight}`;
      boxShadow = `0 2px 8px rgba(110, 140, 251, 0.3)`;
    }
    
    return {
      display: 'flex',
      alignItems: 'center',
      padding: sidebarOpen ? '14px 20px' : '14px 10px',
      color: color,
      textDecoration: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      backgroundColor: backgroundColor,
      margin: '2px 0',
      justifyContent: sidebarOpen ? 'flex-start' : 'center',
      gap: sidebarOpen ? '14px' : '0',
      cursor: 'pointer',
      borderRadius: '6px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      border: 'none',
      outline: 'none',
      borderLeft: borderLeft,
      transform: transform,
      boxShadow: boxShadow
    };
  };

  // Sub-section styles with HOVER and ACTIVE states
  const getSubNavStyle = (isActive, color = COLORS.primary, level = 1, itemKey = '') => {
    const isHovered = hoveredItem === itemKey;
    const isClicked = activeItem === itemKey;
    
    let backgroundColor = 'transparent';
    let textColor = isActive ? COLORS.white : '#94a3b8';
    let borderLeft = 'none';
    
    // HOVER STATE
    if (isHovered && !isActive) {
      backgroundColor = 'rgba(110, 140, 251, 0.1)';
      textColor = color;
      borderLeft = `2px solid ${color}`;
    }
    
    // ACTIVE STATE
    if (isActive || isClicked) {
      backgroundColor = color;
      textColor = COLORS.white;
      borderLeft = `2px solid ${COLORS.highlight}`;
    }
    
    return {
      display: 'flex',
      alignItems: 'center',
      padding: sidebarOpen ? `10px 20px 10px ${20 + (level * 20)}px` : '10px 10px',
      color: textColor,
      textDecoration: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: backgroundColor,
      margin: '1px 0',
      gap: '12px',
      fontSize: '13px',
      borderRadius: '6px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      justifyContent: sidebarOpen ? 'flex-start' : 'center',
      border: 'none',
      outline: 'none',
      borderLeft: borderLeft
    };
  };

  // Department header style with HOVER
  const getDepartmentStyle = (isExpanded, color, itemKey = '') => {
    const isHovered = hoveredItem === itemKey;
    
    let backgroundColor = isExpanded ? COLORS.darkGray : 'transparent';
    let borderLeft = 'none';
    
    if (isHovered) {
      backgroundColor = 'rgba(110, 140, 251, 0.1)';
      borderLeft = `2px solid ${color}`;
    }
    
    return {
      display: 'flex',
      alignItems: 'center',
      padding: sidebarOpen ? '12px 20px' : '12px 10px',
      color: '#cbd5e1',
      textDecoration: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: backgroundColor,
      margin: '1px 0',
      gap: '12px',
      fontSize: '13px',
      fontWeight: '600',
      borderRadius: '6px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      justifyContent: sidebarOpen ? 'flex-start' : 'center',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      borderLeft: borderLeft
    };
  };

  // Render nested items recursively
  const renderNestedItems = (items, level = 1, departmentColor = COLORS.primary) => {
    if (!sidebarOpen) return null;
    
    return items.map((item, index) => {
      const itemKey = `${departmentColor}-${level}-${index}`;
      
      if (item.type === 'department') {
        const isDeptExpanded = expandedSections[item.key];
        const hasSubItems = item.subItems && item.subItems.length > 0;
        
        return (
          <div key={index} style={{ margin: '2px 0' }}>
            {/* Department Header */}
            <div
              style={getDepartmentStyle(isDeptExpanded, item.color, itemKey)}
              onClick={(e) => toggleSection(item.key, e)}
              onMouseEnter={() => handleItemHover(itemKey)}
              onMouseLeave={handleItemLeave}
            >
              <span style={{
                fontSize: '16px',
                color: item.color,
                flexShrink: 0
              }}>
                {item.icon}
              </span>
              
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#e2e8f0',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </div>
              </div>
              
              {hasSubItems && (
                <span style={{
                  color: item.color,
                  fontSize: '12px',
                  transition: 'transform 0.3s ease',
                  transform: isDeptExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  flexShrink: 0
                }}>
                  <FiChevronRight />
                </span>
              )}
            </div>

            {/* Department Sub-items */}
            {isDeptExpanded && item.subItems && (
              <div style={{
                marginLeft: '10px',
                paddingLeft: '10px',
                animation: 'slideDown 0.3s ease'
              }}>
                {renderNestedItems(item.subItems, level + 1, item.color)}
              </div>
            )}
          </div>
        );
      }
      
      if (item.type === 'nested') {
        const nestedKey = item.label.replace(/\s+/g, '');
        const isNestedExpanded = expandedSections[nestedKey];
        const hasNestedItems = item.subItems && item.subItems.length > 0;
        
        return (
          <div key={index} style={{ margin: '2px 0' }}>
            {/* Nested Header */}
            <div
              style={getSubNavStyle(false, departmentColor, level, itemKey)}
              onClick={(e) => {
                const key = item.label.replace(/\s+/g, '');
                setExpandedSections(prev => ({
                  ...prev,
                  [key]: !prev[key]
                }));
                e.stopPropagation();
              }}
              onMouseEnter={() => handleItemHover(itemKey)}
              onMouseLeave={handleItemLeave}
            >
              <span style={{
                fontSize: '14px',
                color: departmentColor,
                flexShrink: 0
              }}>
                {item.icon}
              </span>
              
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#cbd5e1',
                  whiteSpace: 'nowrap'
                }}>
                  {item.label}
                </div>
              </div>
              
              {hasNestedItems && (
                <span style={{
                  color: departmentColor,
                  fontSize: '10px',
                  transition: 'transform 0.3s ease',
                  transform: isNestedExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  flexShrink: 0
                }}>
                  <FiChevronRight />
                </span>
              )}
            </div>

            {/* Nested Sub-items */}
            {isNestedExpanded && item.subItems && (
              <div style={{
                marginLeft: '10px',
                paddingLeft: '10px',
                animation: 'slideDown 0.3s ease'
              }}>
                {renderNestedItems(item.subItems, level + 1, departmentColor)}
              </div>
            )}
          </div>
        );
      }
      
      // Regular link item
      const isActive = currentPath === item.path || currentPath.startsWith(item.path);
      
      return (
        <NavLink
          key={item.path || index}
          to={item.path}
          style={({ isActive: navIsActive }) => getSubNavStyle(navIsActive || isActive, departmentColor, level, itemKey)}
          onClick={() => {
            if (isMobile) {
              closeMobileMenu();
            }
          }}
          onMouseEnter={() => handleItemHover(itemKey)}
          onMouseLeave={handleItemLeave}
        >
          <span style={{
            fontSize: '14px',
            color: isActive ? departmentColor : '#64748b',
            flexShrink: 0
          }}>
            {item.icon}
          </span>
          
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '500',
              color: isActive ? COLORS.white : '#cbd5e1',
              whiteSpace: 'nowrap'
            }}>
              {item.label}
            </div>
          </div>
          
          {(isActive || activeItem === item.path) && (
            <span style={{
              color: departmentColor,
              fontSize: '10px',
              flexShrink: 0,
              animation: 'pulse 1.5s infinite'
            }}>
              •
            </span>
          )}
        </NavLink>
      );
    });
  };

  // Mobile Header Component
  const MobileHeader = () => {
    if (!isMobile || !showMobileHeader) return null;
    
    return (
      <div 
        ref={headerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: COLORS.primary, // Using primary color
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 15px',
          zIndex: 998,
          borderBottom: `1px solid ${COLORS.secondary}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}
        onClick={toggleMobileMenu}
      >
        {/* Left: Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: COLORS.white,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '2px',
            flexShrink: 0,
            border: `2px solid ${COLORS.highlight}`
          }}>
            <img 
              src="/images/logoB.png" 
              alt="PWI Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <span style="
                    font-size: 14px; 
                    font-weight: bold; 
                    color: ${COLORS.primary};
                    text-align: center;
                  ">PWI</span>
                `;
              }}
            />
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: COLORS.white,
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}>
              PAKISTAN WIRE
            </div>
            <div style={{
              fontSize: '9px',
              color: COLORS.highlight,
              fontWeight: '500',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              INDUSTRIES LTD
            </div>
          </div>
        </div>

        {/* Right: Menu Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '22px',
          color: COLORS.white,
          transition: 'transform 0.3s ease',
          ':hover': {
            transform: 'scale(1.1)'
          }
        }}>
          ☰
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header - Only shown on mobile when sidebar is closed */}
      <MobileHeader />

      {/* Sidebar Container */}
      <div 
        ref={sidebarRef}
        style={{
          width: getSidebarWidth(),
          height: '100vh',
          background: `linear-gradient(180deg, ${COLORS.black} 0%, ${COLORS.primary} 100%)`,
          color: COLORS.white,
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: isMobile ? '0' : '0',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: isMobile ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          boxShadow: sidebarOpen ? `4px 0 15px ${COLORS.primary}40` : 'none',
          zIndex: isMobile ? 999 : 1000,
          border: 'none',
          borderRight: sidebarOpen ? `1px solid ${COLORS.secondary}` : 'none'
        }}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        
        {/* Logo Section in Sidebar */}
        <div style={{
          padding: sidebarOpen ? '25px 20px' : '25px 10px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: sidebarOpen ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          gap: sidebarOpen ? '15px' : '12px',
          background: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
          minHeight: isMobile ? '60px' : '80px',
          boxSizing: 'border-box',
          border: 'none',
          position: isMobile ? 'relative' : 'static',
          borderBottom: `1px solid ${COLORS.accent}`
        }}>
          {/* Close button for mobile */}
          {isMobile && sidebarOpen && (
            <button
              onClick={closeMobileMenu}
              style={{
                position: 'absolute',
                right: '15px',
                top: '15px',
                width: '36px',
                height: '36px',
                background: COLORS.highlight,
                border: 'none',
                borderRadius: '6px',
                color: COLORS.white,
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001,
                transition: 'all 0.3s ease',
                ':hover': {
                  background: COLORS.accent,
                  transform: 'scale(1.1)'
                }
              }}
            >
              <FiX />
            </button>
          )}
          
          {/* PWI Logo */}
          <div style={{
            width: sidebarOpen ? (isMobile ? '40px' : '50px') : '40px',
            height: sidebarOpen ? (isMobile ? '40px' : '50px') : '40px',
            background: COLORS.white,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '3px',
            flexShrink: 0,
            border: `2px solid ${COLORS.highlight}`,
            boxShadow: `0 2px 8px ${COLORS.highlight}40`
          }}>
            <img 
              src="/images/logoB.png" 
              alt="PWI Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `
                  <span style="
                    font-size: ${sidebarOpen ? (isMobile ? '14px' : '16px') : '14px'}; 
                    font-weight: bold; 
                    color: ${COLORS.primary};
                    text-align: center;
                  ">PWI</span>
                `;
              }}
            />
          </div>
          
          {sidebarOpen && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '2px',
              overflow: 'hidden'
            }}>
              <h1 style={{
                margin: '0',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '700',
                color: COLORS.white,
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}>
                PAKISTAN WIRE
              </h1>
              <p style={{
                margin: '0',
                fontSize: isMobile ? '9px' : '10px',
                color: COLORS.highlight,
                fontWeight: '500',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}>
                INDUSTRIES LTD
              </p>
              
              {/* Gold SPI & CCD Badge */}
              <div style={{
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent}, ${COLORS.highlight})`,
                color: COLORS.white,
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: isMobile ? '8px' : '9px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                boxShadow: `0 0 6px ${COLORS.highlight}80`,
                marginTop: '4px',
                whiteSpace: 'nowrap',
                border: 'none'
              }}>
                SPI & CCD DIVISION
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div style={{
          padding: '15px 10px',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {/* Dashboard */}
          <NavLink
            to={navigationItems.dashboard.path}
            end={navigationItems.dashboard.exact}
            style={({ isActive }) => getNavLinkStyle(isActive, 'dashboard')}
            onClick={() => {
              if (isMobile) {
                closeMobileMenu();
              }
            }}
            onMouseEnter={() => handleItemHover('dashboard')}
            onMouseLeave={handleItemLeave}
          >
            <span style={{
              fontSize: '20px',
              color: navigationItems.dashboard.color,
              minWidth: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {navigationItems.dashboard.icon}
            </span>
            
            {sidebarOpen && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: COLORS.white,
                  whiteSpace: 'nowrap'
                }}>
                  {navigationItems.dashboard.label}
                </div>
              </div>
            )}
          </NavLink>

          {/* Production Dashboard (Main Item) */}
          <div 
            style={{
              transition: 'all 0.3s ease',
              borderRadius: '6px',
              margin: '4px 0'
            }}
          >
            {/* Production Main Header */}
            <div
              style={getNavLinkStyle(currentPath.includes('/production') || currentPath.includes('/production-sections'), 'production')}
              onClick={(e) => toggleSection('production', e)}
              onMouseEnter={() => handleItemHover('production')}
              onMouseLeave={handleItemLeave}
            >
              <span style={{
                fontSize: '20px',
                color: navigationItems.production.color,
                minWidth: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {navigationItems.production.icon}
              </span>
              
              {sidebarOpen && (
                <>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: COLORS.white,
                      whiteSpace: 'nowrap'
                    }}>
                      {navigationItems.production.label}
                    </div>
                  </div>
                  
                  <span style={{
                    color: COLORS.highlight,
                    fontSize: '14px',
                    transition: 'transform 0.3s ease',
                    transform: expandedSections.production ? 'rotate(90deg)' : 'rotate(0deg)',
                    flexShrink: 0
                  }}>
                    <FiChevronRight />
                  </span>
                </>
              )}
            </div>

            {/* Production Sub-items (Nested Structure) */}
            {expandedSections.production && sidebarOpen && (
              <div style={{
                marginLeft: '10px',
                paddingLeft: '10px',
                animation: 'slideDown 0.3s ease',
                borderLeft: `1px solid ${COLORS.secondary}40`
              }}>
                {renderNestedItems(navigationItems.production.subSections, 1, navigationItems.production.color)}
              </div>
            )}
          </div>

          {/* Other Departments */}
          {Object.entries(navigationItems)
            .filter(([key]) => !['dashboard', 'production'].includes(key))
            .map(([key, item]) => {
              const isActive = currentPath.includes(item.path) || 
                (item.subSections && item.subSections.some(sub => sub.path && currentPath.startsWith(sub.path)));
              const isExpanded = expandedSections[key] && sidebarOpen;
              const hasSubSections = item.subSections && item.subSections.length > 0;

              return (
                <div 
                  key={key}
                  style={{
                    transition: 'all 0.3s ease',
                    borderRadius: '6px',
                    margin: '4px 0'
                  }}
                >
                  {/* Main Department Link */}
                  <div
                    style={getNavLinkStyle(isActive, key)}
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
                        if (isMobile) {
                          closeMobileMenu();
                        }
                      }
                    }}
                    onMouseEnter={() => handleItemHover(key)}
                    onMouseLeave={handleItemLeave}
                  >
                    <span style={{
                      fontSize: '20px',
                      color: item.color || COLORS.primary,
                      minWidth: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {item.icon}
                    </span>
                    
                    {sidebarOpen && (
                      <>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isActive ? COLORS.white : '#e2e8f0',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.label}
                          </div>
                        </div>
                        
                        {hasSubSections && sidebarOpen && (
                          <span style={{
                            color: COLORS.highlight,
                            fontSize: '14px',
                            transition: 'transform 0.3s ease',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            flexShrink: 0
                          }}>
                            <FiChevronRight />
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Sub-sections for other departments */}
                  {hasSubSections && isExpanded && sidebarOpen && (
                    <div style={{
                      marginLeft: '10px',
                      paddingLeft: '10px',
                      animation: 'slideDown 0.3s ease',
                      borderLeft: `1px solid ${item.color}40`
                    }}>
                      {item.subSections.map((subItem) => {
                        const subIsActive = currentPath === subItem.path || currentPath.startsWith(subItem.path);
                        const subItemKey = `${key}-${subItem.path}`;
                        
                        return (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            style={({ isActive }) => getSubNavStyle(isActive || subIsActive, item.color, 1, subItemKey)}
                            onClick={() => {
                              if (isMobile) {
                                closeMobileMenu();
                              }
                            }}
                            onMouseEnter={() => handleItemHover(subItemKey)}
                            onMouseLeave={handleItemLeave}
                          >
                            <span style={{
                              fontSize: '16px',
                              color: subIsActive ? item.color : '#64748b',
                              flexShrink: 0
                            }}>
                              {subItem.icon}
                            </span>
                            
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: subIsActive ? COLORS.white : '#cbd5e1',
                                whiteSpace: 'nowrap'
                              }}>
                                {subItem.label}
                              </div>
                            </div>
                            
                            {subIsActive && (
                              <span style={{
                                color: item.color,
                                fontSize: '12px',
                                flexShrink: 0,
                                animation: 'pulse 1.5s infinite'
                              }}>
                                •
                              </span>
                            )}
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
        <div style={{
          padding: '15px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          border: 'none',
          borderTop: `1px solid ${COLORS.secondary}40`
        }}>
          <NavLink
            to="/settings"
            style={({ isActive }) => getNavLinkStyle(isActive, 'settings')}
            onClick={() => {
              if (isMobile) {
                closeMobileMenu();
              }
            }}
            onMouseEnter={() => handleItemHover('settings')}
            onMouseLeave={handleItemLeave}
          >
            <FiSettings style={{ 
              fontSize: '20px', 
              color: COLORS.highlight,
              flexShrink: 0
            }} />
            {sidebarOpen && (
              <span style={{ 
                flex: 1, 
                color: '#cbd5e1',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}>
                Settings
              </span>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: sidebarOpen ? '12px 20px' : '12px 10px',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '6px',
              margin: '2px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: sidebarOpen ? '14px' : '0',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              border: 'none',
              outline: 'none',
              borderLeft: '3px solid transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.color = '#fca5a5';
              e.target.style.borderLeft = '3px solid #f87171';
              e.target.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.color = '#f87171';
              e.target.style.borderLeft = '3px solid transparent';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            <FiLogOut style={{ 
              fontSize: '20px',
              flexShrink: 0
            }} />
            {sidebarOpen && (
              <span style={{ 
                flex: 1, 
                fontWeight: '600',
                fontSize: '14px'
              }}>
                Logout
              </span>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div style={{
          padding: '12px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          background: `linear-gradient(90deg, ${COLORS.primary}80, ${COLORS.secondary}80)`,
          border: 'none',
          borderTop: `1px solid ${COLORS.accent}40`
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.white,
            fontWeight: 'bold',
            fontSize: '14px',
            flexShrink: 0,
            border: `2px solid ${COLORS.highlight}`,
            boxShadow: `0 2px 6px ${COLORS.highlight}40`
          }}>
            AU
          </div>
          
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: COLORS.white,
                marginBottom: '2px',
                whiteSpace: 'nowrap'
              }}>
                Admin User
              </div>
              <div style={{
                fontSize: '11px',
                color: COLORS.highlight,
                whiteSpace: 'nowrap'
              }}>
                System Administrator
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Content Wrapper */}
      <div style={{
        marginLeft: getContentMargin(),
        marginTop: isMobile && showMobileHeader ? '60px' : '0px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        backgroundColor: COLORS.lightGray
      }}>
        {/* Page content goes here */}
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0% {
              opacity: 0.5;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
            100% {
              opacity: 0.5;
              transform: scale(1);
            }
          }

          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 6px;
          }

          ::-webkit-scrollbar-track {
            background: ${COLORS.darkGray};
          }

          ::-webkit-scrollbar-thumb {
            background: ${COLORS.secondary};
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: ${COLORS.accent};
          }
        `}
      </style>
    </>
  );
};

export default Navigation;