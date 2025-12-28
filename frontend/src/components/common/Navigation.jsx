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
  FiMenu
} from 'react-icons/fi';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const sidebarRef = useRef(null);
  
  // Auto-detect screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    production: currentPath.includes('/production'),
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
        // On mobile, sidebar should be closed by default
        setSidebarOpen(false);
        setIsHovered(false);
      } else {
        // On desktop, sidebar should be open in collapsed mode (icons only)
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-expand based on current path
  useEffect(() => {
    const newExpandedSections = { ...expandedSections };
    
    if (currentPath.includes('/production')) {
      newExpandedSections.production = true;
    }
    if (currentPath.includes('/hr')) {
      newExpandedSections.hr = true;
    }
    if (currentPath.includes('/finance')) {
      newExpandedSections.finance = true;
    }
    if (currentPath.includes('/sales')) {
      newExpandedSections.sales = true;
    }
    if (currentPath.includes('/it')) {
      newExpandedSections.it = true;
    }
    if (currentPath.includes('/logistics')) {
      newExpandedSections.logistics = true;
    }
    
    setExpandedSections(newExpandedSections);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

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

  // Handle sidebar hover
  const handleSidebarMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      setSidebarOpen(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
      setSidebarOpen(false);
    }
  };

  // Main navigation items with their sub-sections
  const navigationItems = {
    dashboard: {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <FiHome />,
      exact: true,
      color: '#3b82f6'
    },
    hr: {
      path: '/hr',
      label: 'HR Department',
      icon: <FiUsers />,
      color: '#8b5cf6',
      subSections: [
        { path: '/hr/employees', label: 'Employees', icon: <FiUsers /> },
        { path: '/hr/attendance', label: 'Attendance', icon: <FiClipboard /> },
        { path: '/hr/payroll', label: 'Payroll', icon: <FiDollarSign /> },
        { path: '/hr/leaves', label: 'Leaves', icon: <FiActivity /> },
        { path: '/hr/recruitment', label: 'Recruitment', icon: <FiDatabase /> }
      ]
    },
    finance: {
      path: '/finance',
      label: 'Finance Department',
      icon: <FiDollarSign />,
      color: '#10b981',
      subSections: [
        { path: '/finance/accounts', label: 'Accounts', icon: <FiDollarSign /> },
        { path: '/finance/invoices', label: 'Invoices', icon: <FiClipboard /> },
        { path: '/finance/expenses', label: 'Expenses', icon: <FiActivity /> },
        { path: '/finance/reports', label: 'Reports', icon: <FiDatabase /> }
      ]
    },
    production: {
      path: '/dashboard/production',
      label: 'Production Department',
      icon: <FiPackage />,
      color: '#f59e0b',
      subSections: [
        { path: '/dashboard/production', label: 'Production Dashboard', icon: <FiGrid /> },
        { path: '/production-sections', label: 'All Sections', icon: <FiFolder /> },
        { path: '/production-sections/flattening', label: 'Flattening Section', icon: <FiBox /> },
        { path: '/production-sections/spiral', label: 'Spiral Section', icon: <FiLayers /> },
        { path: '/production-sections/pvc-coating', label: 'PVC Coating', icon: <FiPackage /> },
        { path: '/production-sections/raw-material', label: 'Raw Material', icon: <FiTool /> },
        { path: '/production-reports/daily', label: 'Daily Reports', icon: <FiActivity /> },
        { path: '/production-sections/flattening/smart-entry', label: 'Flattening Entry', icon: <FiClipboard /> }
      ]
    },
    sales: {
      path: '/sales',
      label: 'Sales Department',
      icon: <FiShoppingCart />,
      color: '#ef4444',
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
      color: '#8b5cf6',
      subSections: [
        { path: '/it/support', label: 'IT Support', icon: <FiTool /> },
        { path: '/it/assets', label: 'Assets', icon: <FiDatabase /> },
        { path: '/it/network', label: 'Network', icon: <FiActivity /> }
      ]
    },
    logistics: {
      path: '/logistics',
      label: 'Logistics Department',
      icon: <FiTruck />,
      color: '#06b6d4',
      subSections: [
        { path: '/logistics/inventory', label: 'Inventory', icon: <FiDatabase /> },
        { path: '/logistics/shipping', label: 'Shipping', icon: <FiTruck /> },
        { path: '/logistics/suppliers', label: 'Suppliers', icon: <FiUsers /> }
      ]
    }
  };

  // Calculate sidebar width based on state
  const getSidebarWidth = () => {
    if (isMobile) {
      return sidebarOpen ? '280px' : '0px';
    }
    return sidebarOpen ? '280px' : '70px';
  };

  // Calculate content margin based on sidebar state
  const getContentMargin = () => {
    if (isMobile) {
      return sidebarOpen ? '280px' : '0px';
    }
    return sidebarOpen ? '280px' : '70px';
  };

  // Navigation link styles
  const getNavLinkStyle = (isActive, itemKey) => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      padding: sidebarOpen ? '14px 20px' : '14px 10px',
      color: isActive ? '#ffffff' : '#cbd5e1',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      position: 'relative',
      backgroundColor: isActive ? '#334155' : 'transparent',
      borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
      margin: '2px 0',
      justifyContent: sidebarOpen ? 'flex-start' : 'center',
      gap: sidebarOpen ? '14px' : '0',
      cursor: 'pointer',
      borderRadius: '0 8px 8px 0',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    };

    if (!sidebarOpen && isHovered && document.querySelector(`[data-item="${itemKey}"]`)) {
      baseStyle.backgroundColor = isActive ? '#334155' : '#475569';
    }

    return baseStyle;
  };

  // Sub-section styles
  const getSubNavStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    padding: sidebarOpen ? '10px 20px 10px 40px' : '10px 10px',
    color: isActive ? '#ffffff' : '#94a3b8',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? '#1e293b' : 'transparent',
    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
    margin: '1px 0',
    gap: '12px',
    fontSize: '13px',
    borderRadius: '0 6px 6px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    justifyContent: sidebarOpen ? 'flex-start' : 'center'
  });

  return (
    <>
      {/* Sidebar Container */}
      <div 
        ref={sidebarRef}
        style={{
          width: getSidebarWidth(),
          height: '100vh',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '4px 0 15px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          borderRight: '1px solid #334155'
        }}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        
        {/* Logo Section */}
        <div style={{
          padding: sidebarOpen ? '25px 20px' : '25px 10px',
          borderBottom: '1px solid #334155',
          textAlign: 'center',
          display: 'flex',
          flexDirection: sidebarOpen ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          gap: sidebarOpen ? '15px' : '12px',
          background: 'rgba(30, 41, 59, 0.5)',
          minHeight: '80px',
          boxSizing: 'border-box'
        }}>
          {/* PWI Logo */}
          <div style={{
            width: sidebarOpen ? '50px' : '40px',
            height: sidebarOpen ? '50px' : '40px',
            background: 'white',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #3b82f6',
            overflow: 'hidden',
            padding: '3px',
            flexShrink: 0
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
                    font-size: ${sidebarOpen ? '16px' : '14px'}; 
                    font-weight: bold; 
                    color: #1e40af;
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
                fontSize: '16px',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}>
                PAKISTAN WIRE
              </h1>
              <p style={{
                margin: '0',
                fontSize: '10px',
                color: '#94a3b8',
                fontWeight: '500',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap'
              }}>
                INDUSTRIES LTD
              </p>
              
              {/* Gold SPI & CCD Badge */}
              <div style={{
                background: 'linear-gradient(90deg, #92400e, #d97706, #f59e0b)',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '9px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                border: '1px solid #fbbf24',
                boxShadow: '0 0 6px rgba(251, 191, 36, 0.3)',
                marginTop: '4px',
                whiteSpace: 'nowrap'
              }}>
                SPI & CCD DIVISION
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <div style={{
          padding: '15px 0',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {/* Dashboard */}
          <NavLink
            to={navigationItems.dashboard.path}
            end={navigationItems.dashboard.exact}
            style={({ isActive }) => getNavLinkStyle(isActive, 'dashboard')}
            data-item="dashboard"
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
                  color: '#ffffff',
                  whiteSpace: 'nowrap'
                }}>
                  {navigationItems.dashboard.label}
                </div>
              </div>
            )}
          </NavLink>

          {/* Departments with Sub-sections */}
          {Object.entries(navigationItems)
            .filter(([key]) => key !== 'dashboard')
            .map(([key, item]) => {
              const isActive = currentPath.includes(item.path) || 
                (item.subSections && item.subSections.some(sub => currentPath.startsWith(sub.path)));
              const isExpanded = expandedSections[key] && sidebarOpen;
              const hasSubSections = item.subSections && item.subSections.length > 0;

              return (
                <div 
                  key={key}
                  data-item={key}
                  style={{
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Main Department Link */}
                  <NavLink
                    to={item.path}
                    style={({ isActive: navIsActive }) => 
                      getNavLinkStyle(navIsActive || isActive, key)
                    }
                    onClick={(e) => {
                      if (hasSubSections && sidebarOpen) {
                        toggleSection(key, e);
                      } else if (hasSubSections && !sidebarOpen) {
                        // If sidebar is collapsed, expand it first
                        setSidebarOpen(true);
                        setTimeout(() => {
                          toggleSection(key, e);
                        }, 100);
                      }
                    }}
                  >
                    <span style={{
                      fontSize: '20px',
                      color: item.color || '#3b82f6',
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
                            color: isActive ? '#ffffff' : '#e2e8f0',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.label}
                          </div>
                        </div>
                        
                        {hasSubSections && sidebarOpen && (
                          <span style={{
                            color: '#94a3b8',
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
                  </NavLink>

                  {/* Sub-sections - Only show when sidebar is open */}
                  {hasSubSections && isExpanded && sidebarOpen && (
                    <div style={{
                      marginLeft: '20px',
                      paddingLeft: '20px',
                      borderLeft: '2px solid #334155',
                      animation: 'slideDown 0.3s ease'
                    }}>
                      {item.subSections.map((subItem) => {
                        const subIsActive = currentPath === subItem.path || currentPath.startsWith(subItem.path);
                        
                        return (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            style={({ isActive }) => getSubNavStyle(isActive || subIsActive)}
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
                                color: subIsActive ? '#ffffff' : '#cbd5e1',
                                whiteSpace: 'nowrap'
                              }}>
                                {subItem.label}
                              </div>
                            </div>
                            
                            {subIsActive && (
                              <span style={{
                                color: item.color,
                                fontSize: '12px',
                                flexShrink: 0
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
          borderTop: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <NavLink
            to="/settings"
            style={({ isActive }) => getNavLinkStyle(isActive, 'settings')}
            data-item="settings"
          >
            <FiSettings style={{ 
              fontSize: '20px', 
              color: '#94a3b8',
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
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              margin: '2px 0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: sidebarOpen ? '14px' : '0',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.color = '#fca5a5';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              e.target.style.color = '#f87171';
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
          borderTop: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          background: 'rgba(30, 41, 59, 0.5)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            flexShrink: 0,
          }}>
            AU
          </div>
          
          {sidebarOpen && (
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '2px',
                whiteSpace: 'nowrap'
              }}>
                Admin User
              </div>
              <div style={{
                fontSize: '11px',
                color: '#94a3b8',
                whiteSpace: 'nowrap'
              }}>
                System Administrator
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Content Wrapper - Adjusts margin based on sidebar */}
      <div style={{
        marginLeft: getContentMargin(),
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        {/* Your page content will go here */}
      </div>

      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: '15px',
            left: '15px',
            width: '45px',
            height: '45px',
            background: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <FiMenu />
        </button>
      )}

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

          /* Scrollbar styling */
          ::-webkit-scrollbar {
            width: 4px;
          }

          ::-webkit-scrollbar-track {
            background: #1e293b;
          }

          ::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 2px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }

          /* Responsive adjustments */
          @media (max-width: 1024px) {
            .sidebar-container {
              transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};
              transition: transform 0.3s ease;
            }
          }

          @media (min-width: 1025px) {
            .page-content {
              transition: margin-left 0.3s ease;
            }
          }
        `}
      </style>
    </>
  );
};

export default Navigation;