// src/components/common/Navigation.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  FiFolder,
  FiGrid,
  FiLayers,
  FiBox
} from 'react-icons/fi';

const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Main navigation items
  const mainNavItems = [
    { path: '/', label: 'Dashboard', icon: <FiHome />, exact: true },
    { path: '/departments/hr', label: 'HR Department', icon: <FiUsers /> },
    { path: '/departments/finance', label: 'Finance Department', icon: <FiDollarSign /> },
    { 
      path: '/departments/production', 
      label: 'Production Department', 
      icon: <FiPackage />,
      isActive: currentPath.includes('/production')
    },
    { path: '/departments/sales', label: 'Sales Department', icon: <FiShoppingCart /> },
    { path: '/departments/it', label: 'IT Department', icon: <FiCpu /> },
    { path: '/departments/logistics', label: 'Logistics Department', icon: <FiTruck /> },
  ];

  // Production sub-navigation (only visible when in production section)
  const productionSubNav = [
    { 
      path: '/departments/production', 
      label: 'Production Dashboard', 
      icon: <FiGrid />,
      description: 'Overview and analytics'
    },
    { 
      path: '/production-sections/production', 
      label: 'Production Sections', 
      icon: <FiFolder />,
      description: 'All production sections'
    },
    { 
      path: '/production-sections/flattening', 
      label: 'Flattening Section', 
      icon: <FiBox />,
      description: 'Wire flattening process'
    },
    { 
      path: '/production-sections/spiral', 
      label: 'Spiral Section', 
      icon: <FiLayers />,
      description: 'Spiral binding production'
    },
    { 
      path: '/production-sections/pvc-coating', 
      label: 'PVC Coating', 
      icon: <FiPackage />,
      description: 'PVC coating process'
    },
    { 
      path: '/production-sections/cutting-packing', 
      label: 'Cutting & Packing', 
      icon: <FiPackage />,
      description: 'Final processing'
    },
    { 
      path: '/production-sections/finished-goods', 
      label: 'Finished Goods', 
      icon: <FiBox />,
      description: 'Inventory management'
    },
    { 
      path: '/production-sections/galvanizing', 
      label: 'Galvanizing Section', 
      icon: <FiPackage />,
      description: 'Galvanizing process'
    },
  ];

  // Check if we're in production section
  const isInProductionSection = currentPath.includes('/production');

  return (
    <nav style={styles.navContainer}>
      {/* Logo Section */}
      <div style={styles.logoSection}>
        <div style={styles.logo}>
          <FiPackage size={28} color="#3b82f6" />
        </div>
        <h1 style={styles.logoText}>ERP System</h1>
        <p style={styles.logoSubText}>Production Management</p>
      </div>

      {/* Main Navigation */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>MAIN NAVIGATION</h3>
        <ul style={styles.navList}>
          {mainNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive || (item.isActive && item.isActive) ? styles.activeNavLink : {}),
                })}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
                {(isActive || (item.isActive && item.isActive)) && (
                  <FiChevronRight style={styles.chevron} />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Production Sub Navigation - Only show when in production */}
      {isInProductionSection && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>PRODUCTION SECTIONS</h3>
            <div style={styles.productionBadge}>
              <FiPackage size={14} />
            </div>
          </div>
          <ul style={styles.navList}>
            {productionSubNav.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.activeNavLink : {}),
                  })}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <div style={styles.navContent}>
                    <span style={styles.navLabel}>{item.label}</span>
                    <span style={styles.navDescription}>{item.description}</span>
                  </div>
                  {currentPath === item.path && (
                    <FiChevronRight style={styles.chevron} />
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* User & Settings Section */}
      <div style={styles.bottomSection}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>SETTINGS</h3>
          <ul style={styles.navList}>
            <li>
              <NavLink
                to="/settings"
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.activeNavLink : {}),
                })}
              >
                <span style={styles.navIcon}><FiSettings /></span>
                <span style={styles.navLabel}>Settings</span>
              </NavLink>
            </li>
          </ul>
        </div>

        {/* User Profile */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            <span style={styles.avatarText}>AD</span>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>Admin User</div>
            <div style={styles.userRole}>Production Manager</div>
          </div>
          <button style={styles.logoutButton}>
            <FiLogOut />
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navContainer: {
    width: '280px',
    height: '100vh',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    boxShadow: '4px 0 15px rgba(0, 0, 0, 0.2)',
    overflowY: 'auto',
  },
  logoSection: {
    padding: '25px 20px',
    borderBottom: '1px solid #334155',
    textAlign: 'center',
  },
  logo: {
    width: '60px',
    height: '60px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
    border: '2px solid rgba(59, 130, 246, 0.3)',
  },
  logoText: {
    margin: '0 0 5px 0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#f8fafc',
  },
  logoSubText: {
    margin: '0',
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  section: {
    padding: '20px 0',
    borderBottom: '1px solid #334155',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px 15px',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 20px 15px',
  },
  productionBadge: {
    width: '24px',
    height: '24px',
    background: 'rgba(59, 130, 246, 0.2)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#60a5fa',
  },
  navList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    color: '#cbd5e1',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    position: 'relative',
    borderLeft: '3px solid transparent',
  },
  activeNavLink: {
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#60a5fa',
    borderLeft: '3px solid #3b82f6',
  },
  navIcon: {
    fontSize: '18px',
    marginRight: '12px',
    minWidth: '24px',
    display: 'flex',
    alignItems: 'center',
  },
  navContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  navLabel: {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '2px',
  },
  navDescription: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '400',
  },
  chevron: {
    fontSize: '16px',
    color: '#60a5fa',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingBottom: '20px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    background: 'rgba(30, 41, 59, 0.5)',
    margin: '20px',
    borderRadius: '10px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    fontWeight: '600',
    fontSize: '16px',
  },
  avatarText: {
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: '2px',
  },
  userRole: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  logoutButton: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f87171',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

// Hover effects
Object.assign(styles.navLink, {
  ':hover': {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#93c5fd',
  }
});

Object.assign(styles.logoutButton, {
  ':hover': {
    background: 'rgba(239, 68, 68, 0.2)',
    transform: 'translateY(-1px)',
  }
});

export default Navigation;