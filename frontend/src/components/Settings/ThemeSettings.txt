// src/pages/Settings/ThemeSettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiSun, FiMoon, FiCheck, FiBox, FiFileText, FiGrid, 
  FiSettings, FiBell, FiUser, FiSearch, FiHome,
  FiBarChart2, FiDatabase, FiUsers, FiDollarSign,
  FiShoppingCart, FiPackage, FiTruck, FiClipboard,
  FiEdit, FiTrash2, FiEye, FiDownload, FiFilter,
  FiChevronDown, FiChevronRight, FiAlertCircle,
  FiCalendar, FiClock, FiTag, FiPercent,
  FiTrendingUp, FiTrendingDown
} from 'react-icons/fi';

const ThemeSettings = () => {
  const { theme, primaryColor, changeTheme, changePrimaryColor, resetTheme } = useTheme();
  const [customColor, setCustomColor] = useState(primaryColor);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Select category');
  const dropdownRef = useRef(null);

  // Theme definitions
  const themes = {
    light: {
      id: 'light',
      name: 'Light',
      icon: <FiSun />,
      bgPrimary: '#FFFFFF',
      bgSecondary: '#F8FAFC',
      bgCard: '#FFFFFF',
      textPrimary: '#1F2937',
      textSecondary: '#4B5563',
      textMuted: '#6B7280',
      border: '#E5E7EB',
      headerBg: '#FFFFFF',
      sidebarBg: '#F9FAFB',
      tableHeader: '#F3F4F6',
      tableRowEven: '#FFFFFF',
      tableRowOdd: '#F9FAFB',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      cardHover: '#F9FAFB'
    },
    dark: {
      id: 'dark',
      name: 'Dark',
      icon: <FiMoon />,
      bgPrimary: '#111827',
      bgSecondary: '#1F2937',
      bgCard: '#1F2937',
      textPrimary: '#F9FAFB',
      textSecondary: '#D1D5DB',
      textMuted: '#9CA3AF',
      border: '#374151',
      headerBg: '#1F2937',
      sidebarBg: '#111827',
      tableHeader: '#374151',
      tableRowEven: '#1F2937',
      tableRowOdd: '#111827',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      cardHover: '#374151'
    },
    blue: {
      id: 'blue',
      name: 'Blue',
      icon: '🌊',
      bgPrimary: '#EFF6FF',
      bgSecondary: '#DBEAFE',
      bgCard: '#FFFFFF',
      textPrimary: '#1E40AF',
      textSecondary: '#3B82F6',
      textMuted: '#60A5FA',
      border: '#BFDBFE',
      headerBg: '#FFFFFF',
      sidebarBg: '#DBEAFE',
      tableHeader: '#BFDBFE',
      tableRowEven: '#FFFFFF',
      tableRowOdd: '#EFF6FF',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      cardHover: '#E0F2FE'
    },
    green: {
      id: 'green',
      name: 'Green',
      icon: '🌿',
      bgPrimary: '#F0FDF4',
      bgSecondary: '#DCFCE7',
      bgCard: '#FFFFFF',
      textPrimary: '#065F46',
      textSecondary: '#059669',
      textMuted: '#34D399',
      border: '#BBF7D0',
      headerBg: '#FFFFFF',
      sidebarBg: '#DCFCE7',
      tableHeader: '#BBF7D0',
      tableRowEven: '#FFFFFF',
      tableRowOdd: '#F0FDF4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      cardHover: '#D1FAE5'
    }
  };

  const colorOptions = [
    '#2563EB', '#7C3AED', '#DC2626', '#EA580C', '#059669', '#9333EA',
    '#0D9488', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6', '#84CC16'
  ];

  const currentTheme = themes[theme] || themes.light;

  // Function to get contrasting text color
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

  // Get contrast colors
  const primaryButtonTextColor = getContrastColor(primaryColor);
  const successTextColor = getContrastColor(currentTheme.success);
  const errorTextColor = getContrastColor(currentTheme.error);

  // Handle theme change
  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
  };

  // Handle color change
  const handleColorChange = (color) => {
    changePrimaryColor(color);
  };

  // Apply custom color
  const handleCustomColorApply = () => {
    if (/^#[0-9A-F]{6}$/i.test(customColor)) {
      changePrimaryColor(customColor);
      alert('✅ Custom color applied!');
    } else {
      alert('❌ Please enter valid hex color');
    }
  };

  // Handle dropdown click
  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ERP Components Preview Data
  const tableData = [
    { id: 'P001', product: 'Wire Coil', category: 'Raw Material', quantity: 500, status: 'In Stock', price: '$1250' },
    { id: 'P002', product: 'PVC Coated Wire', category: 'Finished', quantity: 1200, status: 'Low Stock', price: '$2450' },
    { id: 'P003', product: 'Flattened Wire', category: 'Semi-Finished', quantity: 750, status: 'In Stock', price: '$1850' },
    { id: 'P004', product: 'Spiral Wire', category: 'Finished', quantity: 300, status: 'Out of Stock', price: '$3200' }
  ];

  const statusColors = {
    'In Stock': currentTheme.success,
    'Low Stock': currentTheme.warning,
    'Out of Stock': currentTheme.error
  };

  const dropdownOptions = ['Raw Material', 'Semi-Finished', 'Finished Goods'];

  // Card data with proper colors and icons
  const cardData = [
    { 
      title: 'Total Orders', 
      value: '1,234', 
      icon: <FiShoppingCart />, 
      change: '+12%',
      isPositive: true,
      iconPosition: 'left'
    },
    { 
      title: 'Revenue', 
      value: '$45,678', 
      icon: <FiDollarSign />, 
      change: '+8%',
      isPositive: true,
      iconPosition: 'left'
    },
    { 
      title: 'Production', 
      value: '5,678', 
      icon: <FiPackage />, 
      change: '+15%',
      isPositive: true,
      iconPosition: 'left'
    },
    { 
      title: 'Inventory', 
      value: '2,345', 
      icon: <FiBox />, 
      change: '-3%',
      isPositive: false,
      iconPosition: 'left'
    }
  ];

  // Sidebar menu items
  const sidebarMenuItems = [
    { icon: <FiBarChart2 />, text: 'Analytics', count: '', isActive: false },
    { icon: <FiDatabase />, text: 'Production', count: '3', isActive: true },
    { icon: <FiUsers />, text: 'HR', count: '', isActive: false },
    { icon: <FiDollarSign />, text: 'Finance', count: '', isActive: false },
    { icon: <FiShoppingCart />, text: 'Sales', count: '5', isActive: false }
  ];

  return (
    <div style={{ 
      backgroundColor: currentTheme.bgPrimary,
      minHeight: '100vh',
      color: currentTheme.textPrimary,
      padding: '20px',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Theme Settings</h1>
          <p style={{ color: currentTheme.textSecondary, fontSize: '16px' }}>
            Preview how each theme will look across all ERP components
          </p>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* Left Column - Theme Controls */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            
            {/* Theme Selection */}
            <div style={{
              backgroundColor: currentTheme.bgCard,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Select Theme</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {Object.values(themes).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    style={{
                      backgroundColor: t.bgPrimary,
                      color: t.textPrimary,
                      border: `2px solid ${theme === t.id ? primaryColor : t.border}`,
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: theme === t.id ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{t.icon}</div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>{t.name}</div>
                    {theme === t.id && (
                      <div style={{ color: primaryColor, fontWeight: '600', fontSize: '14px' }}>✓ Selected</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div style={{
              backgroundColor: currentTheme.bgCard,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Primary Color</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    style={{
                      backgroundColor: color,
                      border: `2px solid ${primaryColor === color ? getContrastColor(color) : currentTheme.border}`,
                      borderRadius: '8px',
                      height: '40px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: primaryColor === color ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {primaryColor === color && (
                      <FiCheck style={{ color: getContrastColor(color), fontSize: '18px' }} />
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Color */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px' }}>Custom Color</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{
                      width: '50px',
                      height: '50px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      border: `1px solid ${currentTheme.border}`
                    }}
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#2563EB"
                    style={{
                      backgroundColor: currentTheme.bgSecondary,
                      color: currentTheme.textPrimary,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '8px',
                      padding: '12px 16px',
                      width: '150px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    onClick={handleCustomColorApply}
                    style={{
                      backgroundColor: primaryColor,
                      color: primaryButtonTextColor,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Apply Color
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => alert('✅ Theme applied to entire ERP system!')}
                style={{
                  backgroundColor: primaryColor,
                  color: primaryButtonTextColor,
                  border: 'none',
                  borderRadius: '8px',
                  padding: '14px 28px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  flex: '1'
                }}
              >
                Apply Theme
              </button>
              <button
                onClick={resetTheme}
                style={{
                  backgroundColor: currentTheme.bgSecondary,
                  color: currentTheme.textPrimary,
                  border: `1px solid ${currentTheme.border}`,
                  borderRadius: '8px',
                  padding: '14px 28px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            </div>

          </div>

          {/* Right Column - ERP Components Preview */}
          <div style={{ flex: '2', minWidth: '600px' }}>
            
            {/* Header Preview */}
            <div style={{
              backgroundColor: currentTheme.headerBg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '12px 12px 0 0',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  backgroundColor: primaryColor,
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: primaryButtonTextColor,
                  fontWeight: 'bold'
                }}>
                  PW
                </div>
                <span style={{ fontWeight: '600', fontSize: '18px' }}>Pakistan Wire Industries</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <FiSearch style={{ color: currentTheme.textSecondary, fontSize: '20px', cursor: 'pointer' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <FiBell style={{ color: currentTheme.textSecondary, fontSize: '20px', cursor: 'pointer' }} />
                  <div style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: currentTheme.error,
                    color: errorTextColor,
                    fontSize: '10px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    3
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{
                    backgroundColor: primaryColor + '20',
                    color: primaryColor,
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '500'
                  }}>
                    <FiUser />
                  </div>
                  <span style={{ fontWeight: '500' }}>Admin</span>
                  <FiChevronDown style={{ color: currentTheme.textSecondary }} />
                </div>
              </div>
            </div>

            {/* Main Content Preview */}
            <div style={{ display: 'flex', border: `1px solid ${currentTheme.border}`, borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
              
              {/* Sidebar Preview - FIXED HOVER ISSUE */}
              <div style={{ 
                backgroundColor: currentTheme.sidebarBg,
                width: '220px',
                padding: '20px',
                borderRight: `1px solid ${currentTheme.border}`
              }}>
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: primaryColor + '15',
                    color: primaryColor,
                    borderRadius: '8px',
                    fontWeight: '500'
                  }}>
                    <FiHome /> Dashboard
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    color: currentTheme.textSecondary,
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    letterSpacing: '0.5px'
                  }}>
                    Main Menu
                  </div>
                  
                  {sidebarMenuItems.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        marginBottom: '4px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: currentTheme.textPrimary,
                        backgroundColor: item.isActive ? primaryColor + '10' : 'transparent',
                        borderLeft: item.isActive ? `3px solid ${primaryColor}` : 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        // ✅ FIXED: Hover background uses theme color, not white
                        e.currentTarget.style.backgroundColor = primaryColor + '15';
                        e.currentTarget.style.color = currentTheme.textPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = item.isActive ? primaryColor + '10' : 'transparent';
                        e.currentTarget.style.color = currentTheme.textPrimary;
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          color: item.isActive ? primaryColor : currentTheme.textSecondary,
                          transition: 'color 0.2s'
                        }}>
                          {item.icon}
                        </div>
                        <span>{item.text}</span>
                      </div>
                      {item.count && (
                        <div style={{
                          backgroundColor: primaryColor,
                          color: primaryButtonTextColor,
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontWeight: '500',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          {item.count}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Area Preview */}
              <div style={{ flex: '1', padding: '24px', backgroundColor: currentTheme.bgPrimary }}>
                
                {/* Cards Preview - FIXED ICON POSITION AND COLORS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {cardData.map((card, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        backgroundColor: currentTheme.bgCard,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '10px',
                        padding: '20px',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.cardHover;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.bgCard;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        {/* Icon on LEFT side */}
                        <div style={{
                          backgroundColor: primaryColor + '15',
                          color: primaryColor,
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {card.icon}
                        </div>
                        
                        <div style={{ flex: '1' }}>
                          <div style={{ 
                            color: currentTheme.textSecondary, 
                            fontSize: '14px', 
                            marginBottom: '8px',
                            fontWeight: '500'
                          }}>
                            {card.title}
                          </div>
                          <div style={{ 
                            fontSize: '24px', 
                            fontWeight: '600', 
                            marginBottom: '4px',
                            color: currentTheme.textPrimary
                          }}>
                            {card.value}
                          </div>
                          <div style={{ 
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: card.isPositive ? currentTheme.success : currentTheme.error
                          }}>
                            {card.isPositive ? (
                              <>
                                <FiTrendingUp size={14} />
                                <span style={{ color: currentTheme.success }}>
                                  {card.change}
                                </span>
                                <span style={{ 
                                  color: currentTheme.textSecondary,
                                  fontSize: '12px',
                                  marginLeft: '4px'
                                }}>
                                  from last month
                                </span>
                              </>
                            ) : (
                              <>
                                <FiTrendingDown size={14} />
                                <span style={{ color: currentTheme.error }}>
                                  {card.change}
                                </span>
                                <span style={{ 
                                  color: currentTheme.textSecondary,
                                  fontSize: '12px',
                                  marginLeft: '4px'
                                }}>
                                  from last month
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Button Examples */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: currentTheme.textPrimary }}>
                    Button Examples
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <button style={{
                      backgroundColor: primaryColor,
                      color: primaryButtonTextColor,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontWeight: '500',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <FiEdit /> Primary Button
                    </button>
                    <button style={{
                      backgroundColor: currentTheme.bgSecondary,
                      color: currentTheme.textPrimary,
                      border: `1px solid ${currentTheme.border}`,
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontWeight: '500',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <FiFileText /> Secondary
                    </button>
                    <button style={{
                      backgroundColor: currentTheme.success,
                      color: successTextColor,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontWeight: '500',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <FiCheck /> Success
                    </button>
                    <button style={{
                      backgroundColor: currentTheme.error,
                      color: errorTextColor,
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontWeight: '500',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <FiTrash2 /> Danger
                    </button>
                    <button style={{
                      backgroundColor: 'transparent',
                      color: currentTheme.textPrimary,
                      border: `1px dashed ${currentTheme.border}`,
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontWeight: '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      Outline
                    </button>
                  </div>
                </div>

                {/* Table Preview */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: currentTheme.textPrimary }}>
                      Inventory Table
                    </h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{
                        backgroundColor: currentTheme.bgSecondary,
                        color: currentTheme.textPrimary,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        <FiFilter /> Filter
                      </button>
                      <button style={{
                        backgroundColor: primaryColor,
                        color: primaryButtonTextColor,
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        <FiDownload /> Export
                      </button>
                    </div>
                  </div>
                  
                  <div style={{
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ 
                          backgroundColor: currentTheme.tableHeader,
                          borderBottom: `1px solid ${currentTheme.border}`
                        }}>
                          {['ID', 'Product', 'Category', 'Quantity', 'Status', 'Price', 'Actions'].map((header, idx) => (
                            <th 
                              key={idx} 
                              style={{
                                padding: '14px 16px',
                                textAlign: 'left',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: currentTheme.textPrimary,
                                borderRight: idx < 6 ? `1px solid ${currentTheme.border}` : 'none',
                                backgroundColor: currentTheme.tableHeader
                              }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, rowIndex) => (
                          <tr key={row.id} style={{ 
                            backgroundColor: rowIndex % 2 === 0 ? currentTheme.tableRowEven : currentTheme.tableRowOdd,
                            borderBottom: rowIndex < tableData.length - 1 ? `1px solid ${currentTheme.border}` : 'none',
                            transition: 'background-color 0.2s'
                          }}>
                            <td style={{ 
                              padding: '14px 16px',
                              color: currentTheme.textSecondary,
                              borderRight: `1px solid ${currentTheme.border}`
                            }}>
                              {row.id}
                            </td>
                            <td style={{ 
                              padding: '14px 16px',
                              color: currentTheme.textPrimary,
                              borderRight: `1px solid ${currentTheme.border}`
                            }}>
                              {row.product}
                            </td>
                            <td style={{ 
                              padding: '14px 16px',
                              color: currentTheme.textSecondary,
                              borderRight: `1px solid ${currentTheme.border}`
                            }}>
                              {row.category}
                            </td>
                            <td style={{ 
                              padding: '14px 16px',
                              color: currentTheme.textPrimary,
                              borderRight: `1px solid ${currentTheme.border}`
                            }}>
                              {row.quantity}
                            </td>
                            <td style={{ 
                              padding: '14px 16px',
                              borderRight: `1px solid ${currentTheme.border}`
                            }}>
                              <span style={{
                                backgroundColor: statusColors[row.status] + '20',
                                color: statusColors[row.status],
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '500',
                                display: 'inline-block'
                              }}>
                                {row.status}
                              </span>
                            </td>
                            <td style={{ 
                              padding: '14px 16px',
                              color: currentTheme.textPrimary,
                              borderRight: `1px solid ${currentTheme.border}`
                            }}>
                              {row.price}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{
                                  backgroundColor: primaryColor + '15',
                                  color: primaryColor,
                                  border: 'none',
                                  borderRadius: '4px',
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}>
                                  <FiEye size={14} />
                                </button>
                                <button style={{
                                  backgroundColor: currentTheme.success + '15',
                                  color: currentTheme.success,
                                  border: 'none',
                                  borderRadius: '4px',
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}>
                                  <FiEdit size={14} />
                                </button>
                                <button style={{
                                  backgroundColor: currentTheme.error + '15',
                                  color: currentTheme.error,
                                  border: 'none',
                                  borderRadius: '4px',
                                  width: '32px',
                                  height: '32px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}>
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form Elements Preview */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: currentTheme.textPrimary }}>
                    Form Elements
                  </h3>
                  <div style={{ 
                    backgroundColor: currentTheme.bgCard,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: currentTheme.textPrimary
                      }}>
                        Text Input
                      </label>
                      <input
                        type="text"
                        placeholder="Enter product name"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          backgroundColor: currentTheme.bgSecondary,
                          color: currentTheme.textPrimary,
                          border: `1px solid ${currentTheme.border}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          transition: 'all 0.2s'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: currentTheme.textPrimary
                      }}>
                        Select Dropdown
                      </label>
                      <div ref={dropdownRef} style={{ position: 'relative' }}>
                        {/* Custom Dropdown Button */}
                        <div
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            backgroundColor: currentTheme.bgSecondary,
                            color: currentTheme.textPrimary,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            minHeight: '42px',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>{selectedOption}</span>
                          <FiChevronDown 
                            style={{ 
                              color: currentTheme.textSecondary,
                              transition: 'transform 0.2s',
                              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }} 
                          />
                        </div>
                        
                        {/* Custom Dropdown Options */}
                        {dropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: currentTheme.bgCard,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '6px',
                            marginTop: '4px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {dropdownOptions.map((option, index) => (
                              <div
                                key={index}
                                onClick={() => handleSelectOption(option)}
                                style={{
                                  padding: '10px 12px',
                                  color: currentTheme.textPrimary,
                                  backgroundColor: selectedOption === option ? primaryColor + '15' : 'transparent',
                                  cursor: 'pointer',
                                  borderBottom: index < dropdownOptions.length - 1 ? `1px solid ${currentTheme.border}` : 'none',
                                  transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = primaryColor + '10';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = selectedOption === option ? primaryColor + '15' : 'transparent';
                                }}
                              >
                                {option}
                                {selectedOption === option && (
                                  <FiCheck style={{ float: 'right', color: primaryColor }} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: currentTheme.textPrimary
                      }}>
                        Date Picker
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Select date"
                          style={{
                            width: '100%',
                            padding: '10px 40px 10px 12px',
                            backgroundColor: currentTheme.bgSecondary,
                            color: currentTheme.textPrimary,
                            border: `1px solid ${currentTheme.border}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: currentTheme.textSecondary,
                          pointerEvents: 'none'
                        }}>
                          <FiCalendar />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ 
                        display: 'block',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: currentTheme.textPrimary
                      }}>
                        Checkbox Group
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['Production', 'Sales', 'Finance', 'HR'].map((item, idx) => (
                          <label key={idx} style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                          }}>
                            <input 
                              type="checkbox" 
                              style={{ 
                                accentColor: primaryColor,
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer'
                              }} 
                            />
                            <span style={{ color: currentTheme.textPrimary, fontSize: '14px' }}>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeSettings;