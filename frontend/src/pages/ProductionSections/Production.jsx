// src/pages/ProductionSections/Production.jsx
import React from 'react';
import { 
  FiPackage, FiArrowLeft, FiFolder, 
  FiEdit, FiEye, FiFileText,
  FiHome, FiGrid
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Production = () => {
  const navigate = useNavigate();

  const sections = [
    { 
      name: 'Flattening Section', 
      description: 'Wire flattening and processing operations',
      path: '/production-sections/flattening',
      color: '#f59e0b',
      components: ['FlatteningForm.jsx', 'FlatteningPage.jsx', 'FlatteningEditForm.jsx']
    },
    { 
      name: 'Spiral Section', 
      description: 'Spiral binding production and assembly',
      path: '/production-sections/spiral',
      color: '#10b981',
      components: ['SpiralForm.jsx', 'SpiralPage.jsx', 'SpiralEditForm.jsx']
    },
    { 
      name: 'PVC Coating Section', 
      description: 'PVC coating application and finishing',
      path: '/production-sections/pvc-coating',
      color: '#8b5cf6',
      components: ['PVCCoatingForm.jsx', 'PVCCoatingPage.jsx', 'PVCCoatingEditForm.jsx']
    },
    { 
      name: 'Cutting & Packing Section', 
      description: 'Final cutting, packaging and dispatch',
      path: '/production-sections/cutting-packing',
      color: '#3b82f6',
      components: ['CuttingPackingForm.jsx', 'CuttingPackingPage.jsx', 'CuttingPackingEditForm.jsx']
    },
    { 
      name: 'Finished Goods Section', 
      description: 'Finished products inventory and quality control',
      path: '/production-sections/finished-goods',
      color: '#ef4444',
      components: ['FinishedGoodsForm.jsx', 'FinishedGoodsPage.jsx', 'FinishedGoodsEditForm.jsx']
    },
    { 
      name: 'Raw Material Section', 
      description: 'Raw material storage and management',
      path: '/production-sections/raw-material',
      color: '#6366f1',
      components: ['RawMaterialForm.jsx', 'RawMaterialPage.jsx', 'RawMaterialEditForm.jsx']
    },
  ];

  const handleSectionClick = (sectionPath) => {
    navigate(sectionPath);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <button
            onClick={() => navigate('/production')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              marginBottom: '10px'
            }}
          >
            <FiArrowLeft /> Back to Production Dashboard
          </button>
          <h1 style={{
            margin: '0',
            fontSize: '32px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <FiFolder size={28} />
            </div>
            Production Sections
          </h1>
          <p style={{ 
            margin: '10px 0 0 75px', 
            color: '#64748b',
            fontSize: '16px'
          }}>
            Manage all production sections and their components
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => navigate('/production')}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: '600'
            }}
          >
            <FiHome /> Production Dashboard
          </button>
        </div>
      </div>

      {/* Information Card */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        border: '1px solid #ddd6fe'
      }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          color: '#7c3aed',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <FiGrid /> Production Sections Overview
        </h3>
        <p style={{ 
          margin: '0', 
          color: '#57534e', 
          lineHeight: '1.6',
          fontSize: '15px'
        }}>
          This is the main dashboard for all production sections. Each section has three main components:
          <strong> Form.jsx</strong> (Create), <strong>Page.jsx</strong> (View), and <strong>EditForm.jsx</strong> (Update).
          Click on any section to manage its operations.
        </p>
      </div>

      {/* Sections Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '25px'
      }}>
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: `2px solid ${section.color}20`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = section.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = `${section.color}20`;
            }}
            onClick={() => handleSectionClick(section.path)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: `${section.color}15`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: section.color,
                fontSize: '22px'
              }}>
                <FiPackage />
              </div>
              <div>
                <h3 style={{ 
                  margin: '0 0 5px 0', 
                  fontSize: '18px', 
                  color: '#1e293b' 
                }}>
                  {section.name}
                </h3>
                <p style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  color: '#64748b' 
                }}>
                  {section.description}
                </p>
              </div>
            </div>

            {/* Components List */}
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#64748b', 
                marginBottom: '12px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiFileText /> Component Files:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {section.components.map((component, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#475569',
                      fontFamily: 'monospace',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${section.color}10`;
                      e.currentTarget.style.color = section.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: section.color,
                      borderRadius: '50%'
                    }} />
                    {component}
                    {component.includes('Form.jsx') && (
                      <FiEdit style={{ marginLeft: 'auto', color: '#94a3b8' }} />
                    )}
                    {component.includes('Page.jsx') && (
                      <FiEye style={{ marginLeft: 'auto', color: '#94a3b8' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <span style={{
                fontSize: '13px',
                color: '#64748b',
                fontStyle: 'italic'
              }}>
                Click to open section
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: section.color,
                fontWeight: '600',
                fontSize: '14px'
              }}>
                <span>Manage</span>
                <FiArrowLeft style={{ transform: 'rotate(180deg)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
          <strong>Note:</strong> This is the Production Sections dashboard. 
          From here you can navigate to individual production sections for detailed management.
        </p>
        <p style={{ 
          margin: '10px 0 0 0', 
          color: '#475569', 
          fontSize: '13px',
          fontFamily: 'monospace'
        }}>
          File location: src/pages/ProductionSections/Production.jsx
        </p>
      </div>
    </div>
  );
};

export default Production;