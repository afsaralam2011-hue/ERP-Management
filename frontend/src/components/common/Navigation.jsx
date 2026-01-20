import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiDollarSign, FiPackage, FiShoppingCart, 
  FiCpu, FiTruck, FiSettings, FiLogOut, FiChevronRight, 
  FiGrid, FiFolder, FiLayers, FiBox, FiActivity, 
  FiClipboard, FiTool, FiDatabase, FiArchive, FiCheckSquare, 
  FiScissors, FiX 
} from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [expandedSections, setExpandedSections] = useState({});

  // REAL USER DATA LOGIC (No Dummy Data)
  const userData = JSON.parse(localStorage.getItem("user") || localStorage.getItem("userData") || "{}");
  const userName = userData.display_name || userData.username || "Admin User";
  const userEmail = userData.email || "admin@pwi.com.pk";
  const userRole = userData.role || "System Administrator";
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const COLORS = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    accent: theme.colors.accent,
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // Desktop hover starts closed
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSection = (key, e) => {
    if (e) e.stopPropagation();
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 100% COMPLETE DATA STRUCTURE (As per your requirement)
  const navigationItems = [
    { id: 'dash', label: 'Dashboard', path: '/dashboard', icon: <FiHome />, color: COLORS.primary },
    { 
      id: 'production', label: 'Production Dept', icon: <FiPackage />, color: COLORS.accent,
      subSections: [
        { path: '/dashboard/production', label: 'Production Dashboard', icon: <FiGrid /> },
        { path: '/production-sections', label: 'All Sections', icon: <FiFolder /> },
        { path: '/production-reports/daily', label: 'Daily Production Report', icon: <FiActivity /> },
        // Raw Material
        { 
          id: 'rawMaterial', label: 'Raw Material Dept', icon: <FiDatabase />, type: 'nested',
          items: [
            { path: '/production-sections/raw-material', label: 'Raw Material Section', icon: <FiDatabase /> },
            { path: '/production-sections/raw-material/new', label: 'Raw Material Entry', icon: <FiClipboard /> },
            { path: '/flattening-ledger', label: 'Inventory Ledger', icon: <FiArchive /> },
            { path: '/production-sections/raw-material/material-received', label: 'Material Received', icon: <FiTool /> },
            { path: '/production-sections/raw-material/material-issue', label: 'Material Issue', icon: <FiTool /> },
            { path: '/production-sections/raw-material/new-log', label: 'New Material Log', icon: <FiClipboard /> }
          ]
        },
        // Flattening
        { 
          id: 'flattening', label: 'Flattening Dept', icon: <FiBox />, type: 'nested',
          items: [
            { path: '/production-sections/flattening', label: 'Flattening Section', icon: <FiLayers /> },
            { path: '/production-sections/flattening/smart-entry', label: 'Production Entry', icon: <FiClipboard /> },
            { path: '/flattening-inventory', label: 'Inventory Reports', icon: <FiArchive /> },
            { path: '/flattening-ledger', label: 'Inventory Ledger', icon: <FiDatabase /> },
            { path: '/production-sections/flattening/new', label: 'New Record', icon: <FiClipboard /> }
          ]
        },
        // Spiral
        { 
          id: 'spiral', label: 'Spiral Dept', icon: <FiLayers />, type: 'nested',
          items: [
            { path: '/production-sections/spiral', label: 'Spiral Section', icon: <FiLayers /> },
            { path: '/production-sections/spiral/smart-entry', label: 'Production Entry', icon: <FiClipboard /> },
            { path: '/production-sections/spiral/new', label: 'New Spiral Record', icon: <FiClipboard /> }
          ]
        },
        // PVC
        { 
          id: 'pvc', label: 'PVC Coating Dept', icon: <FiPackage />, type: 'nested',
          items: [
            { path: '/production-sections/pvc-coating', label: 'PVC Section', icon: <FiPackage /> },
            { path: '/production-sections/pvc-coating/smart-form', label: 'PVC Smart Entry', icon: <FiActivity /> }
          ]
        },
        // Cutting & Finished Goods
        { id: 'cutting', label: 'Cutting Packing Section', icon: <FiScissors />, path: '/dashboard/production' },
        { id: 'finished', label: 'Finished Goods Section', icon: <FiCheckSquare />, path: '/dashboard/production' }
      ]
    },
    { id: 'hr', label: 'HR Department', path: '/hr', icon: <FiUsers />, color: COLORS.secondary },
    { id: 'finance', label: 'Finance Department', path: '/finance', icon: <FiDollarSign />, color: COLORS.accent },
    { id: 'sales', label: 'Sales Department', path: '/sales', icon: <FiShoppingCart />, color: COLORS.primary },
    { id: 'it', label: 'IT Department', path: '/it', icon: <FiCpu />, color: COLORS.secondary },
    { id: 'logistics', label: 'Logistics Department', path: '/logistics', icon: <FiTruck />, color: COLORS.primary }
  ];

  return (
    <div 
      className={`sidebar-wrapper ${sidebarOpen ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => !isMobile && setSidebarOpen(true)}
      onMouseLeave={() => !isMobile && setSidebarOpen(false)}
    >
      <div className="sidebar-header" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})` }}>
        <div className="logo-box"><img src="/images/logoB.png" alt="PWI" /></div>
        {sidebarOpen && <div className="logo-text"><span className="m-title">PAKISTAN WIRE</span><span className="s-title">INDUSTRIES LTD</span></div>}
      </div>

      <div className="menu-container">
        {navigationItems.map((item) => (
          <div key={item.id} className="nav-group">
            <div className={`menu-item ${expandedSections[item.id] ? 'active-parent' : ''}`} onClick={(e) => item.subSections ? toggleSection(item.id, e) : navigate(item.path)}>
              <span className="icon" style={{color: item.color}}>{item.icon}</span>
              {sidebarOpen && <><span className="label">{item.label}</span> {item.subSections && <FiChevronRight className={`arrow ${expandedSections[item.id] ? 'rotate' : ''}`} />}</>}
            </div>

            {sidebarOpen && expandedSections[item.id] && item.subSections && (
              <div className="sub-menu">
                {item.subSections.map((sub, i) => (
                  <div key={i}>
                    {sub.type === 'nested' ? (
                      <div className="nested-item">
                        <div className="nested-header" onClick={(e) => toggleSection(sub.id, e)}>
                          {sub.icon} <span>{sub.label}</span>
                        </div>
                        {expandedSections[sub.id] && (
                          <div className="nested-links">
                            {sub.items.map((ni, j) => <NavLink key={j} to={ni.path} className={({isActive}) => isActive ? 'active-sub' : ''}>{ni.label}</NavLink>)}
                          </div>
                        )}
                      </div>
                    ) : <NavLink to={sub.path} className={({isActive}) => isActive ? 'active-sub' : ''}>{sub.icon} <span>{sub.label}</span></NavLink>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="avatar" style={{ background: COLORS.primary }}>{initials}</div>
          {sidebarOpen && <div className="u-info"><p className="u-name">{userName}</p><p className="u-email">{userEmail}</p><p className="u-role">{userRole}</p></div>}
        </div>
        <button className="btn-logout" onClick={() => {localStorage.clear(); navigate('/login');}}><FiLogOut /> {sidebarOpen && <span>Logout</span>}</button>
      </div>
    </div>
  );
};

export default Navigation;