// src/pages/ProductionReports/DailyProductionReport.jsx
import React, { useState, useEffect } from "react";

const DailyProductionReport = () => {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [productionData, setProductionData] = useState([]);

  // Mock API call to fetch production data
  useEffect(() => {
    fetchProductionData();
  }, [date]);

  const fetchProductionData = () => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // This would come from your actual API
      const mockData = [
        // Raw Material Section Data (kg)
        {
          id: 1,
          department: "Raw Material Section",
          section: "Raw Material",
          shift: "A",
          production_quantity: 12500,
          target_quantity: 12000,
          quantity_unit: "kg",
          date: date.toISOString().split('T')[0],
          operator: "Ali Ahmed",
          machine: "RM-001",
          status: "completed"
        },
        {
          id: 2,
          department: "Raw Material Section",
          section: "Raw Material",
          shift: "B",
          production_quantity: 11000,
          target_quantity: 11500,
          quantity_unit: "kg",
          date: date.toISOString().split('T')[0],
          operator: "Usman Khan",
          machine: "RM-002",
          status: "completed"
        },
        {
          id: 3,
          department: "Raw Material Section",
          section: "Raw Material",
          shift: "C",
          production_quantity: 9800,
          target_quantity: 10000,
          quantity_unit: "kg",
          date: date.toISOString().split('T')[0],
          operator: "Ahmed Raza",
          machine: "RM-003",
          status: "in-progress"
        },
        // Flattening Section Data (kg)
        {
          id: 4,
          department: "Flattening Section",
          section: "Flattening",
          shift: "A",
          production_quantity: 540,
          target_quantity: 600,
          quantity_unit: "kg",
          date: date.toISOString().split('T')[0],
          operator: "Bilal Shah",
          machine: "FLT-001",
          status: "completed"
        },
        {
          id: 5,
          department: "Flattening Section",
          section: "Flattening",
          shift: "B",
          production_quantity: 400,
          target_quantity: 450,
          quantity_unit: "kg",
          date: date.toISOString().split('T')[0],
          operator: "Zain Malik",
          machine: "FLT-002",
          status: "completed"
        },
        {
          id: 6,
          department: "Flattening Section",
          section: "Flattening",
          shift: "C",
          production_quantity: 568.4,
          target_quantity: 550,
          quantity_unit: "kg",
          date: date.toISOString().split('T')[0],
          operator: "Kamran Ali",
          machine: "FLT-003",
          status: "completed"
        },
        // Spiral Section Data (meters)
        {
          id: 7,
          department: "Spiral Section",
          section: "Spiral",
          shift: "Day",
          production_quantity: 14000,
          target_quantity: 15000,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Daniyal Ahmed",
          machine: "SPR-001",
          product_type: "PVC_5mm1P",
          status: "completed"
        },
        {
          id: 8,
          department: "Spiral Section",
          section: "Spiral",
          shift: "Day",
          production_quantity: 0,
          target_quantity: 12000,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Farhan Khan",
          machine: "SPR-002",
          product_type: "PVC_6mm1P",
          status: "maintenance"
        },
        {
          id: 9,
          department: "Spiral Section",
          section: "Spiral",
          shift: "Night",
          production_quantity: 17315,
          target_quantity: 18000,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Hassan Raza",
          machine: "SPR-003",
          product_type: "PVC_7mm1P",
          status: "completed"
        },
        // PVC Coating Section Data (meters)
        {
          id: 10,
          department: "PVC Coating Section",
          section: "PVC Coating",
          shift: "A",
          production_quantity: 7000,
          target_quantity: 7500,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Imran Shah",
          machine: "PVC-001",
          product_type: "PVC_7mm2P",
          status: "completed"
        },
        {
          id: 11,
          department: "PVC Coating Section",
          section: "PVC Coating",
          shift: "B",
          production_quantity: 10250,
          target_quantity: 11000,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Junaid Malik",
          machine: "PVC-002",
          product_type: "PVC_7mmDS",
          status: "completed"
        },
        {
          id: 12,
          department: "PVC Coating Section",
          section: "PVC Coating",
          shift: "C",
          production_quantity: 13750,
          target_quantity: 14000,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Kashif Ali",
          machine: "PVC-003",
          product_type: "General",
          status: "in-progress"
        },
        // Cutting & Packing Section Data (meters)
        {
          id: 13,
          department: "Cutting & Packing",
          section: "Cutting",
          shift: "A",
          production_quantity: 9200,
          target_quantity: 9500,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Liaqat Ahmed",
          machine: "CUT-001",
          product_type: "Finished",
          status: "completed"
        },
        {
          id: 14,
          department: "Cutting & Packing",
          section: "Packing",
          shift: "B",
          production_quantity: 8500,
          target_quantity: 9000,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Mohsin Khan",
          machine: "PKG-001",
          product_type: "Packed",
          status: "completed"
        },
        {
          id: 15,
          department: "Cutting & Packing",
          section: "Packing",
          shift: "C",
          production_quantity: 0,
          target_quantity: 8500,
          quantity_unit: "meters",
          date: date.toISOString().split('T')[0],
          operator: "Noman Raza",
          machine: "PKG-002",
          product_type: "Packed",
          status: "pending"
        }
      ];
      
      setProductionData(mockData);
      setLoading(false);
    }, 1000);
  };

  // Filter data based on selected department
  const filteredData = selectedDepartment === "all" 
    ? productionData 
    : productionData.filter(item => item.department === selectedDepartment);

  // Get unique departments for filter
  const departments = [...new Set(productionData.map(item => item.department))];

  // Calculate totals for filtered data
  const calculateTotals = () => {
    if (filteredData.length === 0) {
      return {
        totalProduction: 0,
        totalTarget: 0,
        efficiency: 0,
        averageProduction: 0,
        averageTarget: 0
      };
    }

    const totalProduction = filteredData.reduce((sum, item) => sum + item.production_quantity, 0);
    const totalTarget = filteredData.reduce((sum, item) => sum + item.target_quantity, 0);
    const efficiency = totalTarget > 0 ? (totalProduction / totalTarget * 100).toFixed(1) : 0;
    const averageProduction = filteredData.length > 0 ? (totalProduction / filteredData.length).toFixed(1) : 0;
    const averageTarget = filteredData.length > 0 ? (totalTarget / filteredData.length).toFixed(1) : 0;

    return {
      totalProduction,
      totalTarget,
      efficiency: parseFloat(efficiency),
      averageProduction: parseFloat(averageProduction),
      averageTarget: parseFloat(averageTarget)
    };
  };

  const totals = calculateTotals();

  // Group data by shift for each department
  const groupByShift = (data) => {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.shift]) {
        grouped[item.shift] = [];
      }
      grouped[item.shift].push(item);
    });
    return grouped;
  };

  const shiftGroups = groupByShift(filteredData);

  // Format quantity with unit
  const formatQuantity = (quantity, unit) => {
    return `${quantity.toLocaleString()} ${unit}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  // Calculate efficiency for individual item
  const calculateItemEfficiency = (production, target) => {
    if (target === 0) return 0;
    return ((production / target) * 100).toFixed(1);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchProductionData();
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Export data
  const handleExport = () => {
    const dataStr = JSON.stringify({
      reportDate: date.toISOString(),
      selectedDepartment,
      data: filteredData,
      totals
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `production-report-${date.toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <h3>Loading Production Data...</h3>
        <p>Please wait while we fetch the latest production records</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{ 
              margin: '0 0 10px 0', 
              color: '#1e293b',
              fontSize: '28px'
            }}>
              Daily Production Report
            </h1>
            <p style={{ 
              margin: '0', 
              color: '#64748b',
              fontSize: '16px'
            }}>
              Real-time production data with department-wise filtering
            </p>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            alignItems: 'center'
          }}>
            <input
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleRefresh}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Department Filter */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ fontWeight: '600', color: '#1e293b' }}>
            Filter by Department:
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedDepartment("all")}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedDepartment === "all" ? '#3b82f6' : '#f3f4f6',
                color: selectedDepartment === "all" ? 'white' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              All Departments
            </button>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedDepartment === dept ? '#10b981' : '#f3f4f6',
                  color: selectedDepartment === dept ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <div style={{ color: '#64748b', marginBottom: '10px', fontSize: '14px' }}>
            Total Production
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '5px'
          }}>
            {totals.totalProduction.toLocaleString()}
          </div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>
            Across {filteredData.length} records
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <div style={{ color: '#64748b', marginBottom: '10px', fontSize: '14px' }}>
            Total Target
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '5px'
          }}>
            {totals.totalTarget.toLocaleString()}
          </div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>
            Expected production
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <div style={{ color: '#64748b', marginBottom: '10px', fontSize: '14px' }}>
            Efficiency
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            color: totals.efficiency >= 100 ? '#10b981' : 
                   totals.efficiency >= 90 ? '#f59e0b' : '#ef4444',
            marginBottom: '5px'
          }}>
            {totals.efficiency}%
          </div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>
            Production vs Target
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #8b5cf6'
        }}>
          <div style={{ color: '#64748b', marginBottom: '10px', fontSize: '14px' }}>
            Average per Record
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '5px'
          }}>
            {totals.averageProduction.toLocaleString()}
          </div>
          <div style={{ color: '#64748b', fontSize: '12px' }}>
            Per production record
          </div>
        </div>
      </div>

      {/* Production Details */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0', color: '#1e293b' }}>
            Production Details {selectedDepartment !== "all" ? `- ${selectedDepartment}` : ''}
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleExport}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              📥 Export
            </button>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {Object.keys(shiftGroups).map(shift => (
          <div key={shift} style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              margin: '0 0 15px 0', 
              color: '#374151',
              paddingBottom: '10px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              Shift: {shift}
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Section
                    </th>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Operator
                    </th>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Machine
                    </th>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Production
                    </th>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Target
                    </th>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Unit
                    </th>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Efficiency
                    </th>
                    <th style={{ 
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shiftGroups[shift].map((item, index) => {
                    const efficiency = calculateItemEfficiency(item.production_quantity, item.target_quantity);
                    return (
                      <tr key={item.id} style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                      }}>
                        <td style={{ padding: '12px' }}>
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                              {item.section}
                            </div>
                            {item.product_type && (
                              <div style={{ 
                                fontSize: '12px', 
                                color: '#6b7280',
                                backgroundColor: '#f3f4f6',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-block'
                              }}>
                                {item.product_type}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {item.operator}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {item.machine}
                        </td>
                        <td style={{ 
                          padding: '12px',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: item.production_quantity > 0 ? '#1e293b' : '#ef4444'
                        }}>
                          {formatQuantity(item.production_quantity, item.quantity_unit)}
                        </td>
                        <td style={{ 
                          padding: '12px',
                          textAlign: 'right'
                        }}>
                          {formatQuantity(item.target_quantity, item.quantity_unit)}
                        </td>
                        <td style={{ 
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: item.quantity_unit === "kg" ? '#dbeafe' : '#ede9fe',
                            color: item.quantity_unit === "kg" ? '#1d4ed8' : '#7c3aed',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {item.quantity_unit}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: efficiency >= 100 ? '#d1fae5' : 
                                         efficiency >= 90 ? '#fef3c7' : '#fee2e2',
                            color: efficiency >= 100 ? '#059669' : 
                                   efficiency >= 90 ? '#d97706' : '#dc2626',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {efficiency}%
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: getStatusColor(item.status) + '20',
                            color: getStatusColor(item.status),
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {getStatusText(item.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Shift Summary */}
            {shiftGroups[shift].length > 0 && (
              <div style={{ 
                marginTop: '15px',
                padding: '15px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #bae6fd'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0369a1', marginBottom: '5px' }}>
                      Shift {shift} Summary
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {shiftGroups[shift].length} records in this shift
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                      Production: {shiftGroups[shift].reduce((sum, item) => sum + item.production_quantity, 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      Target: {shiftGroups[shift].reduce((sum, item) => sum + item.target_quantity, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredData.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
            <h3>No Production Data Found</h3>
            <p>Select a different department or date to view production records</p>
          </div>
        )}
      </div>

      {/* Department Summary */}
      {selectedDepartment === "all" && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#1e293b' }}>
            Department-wise Summary
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Department
                  </th>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Total Production
                  </th>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Total Target
                  </th>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Efficiency
                  </th>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Records
                  </th>
                  <th style={{ 
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Main Unit
                  </th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => {
                  const deptData = productionData.filter(item => item.department === dept);
                  const deptProduction = deptData.reduce((sum, item) => sum + item.production_quantity, 0);
                  const deptTarget = deptData.reduce((sum, item) => sum + item.target_quantity, 0);
                  const deptEfficiency = deptTarget > 0 ? (deptProduction / deptTarget * 100).toFixed(1) : 0;
                  const mainUnit = deptData.length > 0 ? deptData[0].quantity_unit : 'N/A';
                  
                  return (
                    <tr key={dept} style={{ 
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>
                        {dept}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: deptProduction > 0 ? '#1e293b' : '#ef4444'
                      }}>
                        {deptProduction.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'right'
                      }}>
                        {deptTarget.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: deptEfficiency >= 100 ? '#d1fae5' : 
                                       deptEfficiency >= 90 ? '#fef3c7' : '#fee2e2',
                          color: deptEfficiency >= 100 ? '#059669' : 
                                 deptEfficiency >= 90 ? '#d97706' : '#dc2626',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {deptEfficiency}%
                        </span>
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        {deptData.length}
                      </td>
                      <td style={{ 
                        padding: '12px',
                        textAlign: 'center'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: mainUnit === "kg" ? '#dbeafe' : '#ede9fe',
                          color: mainUnit === "kg" ? '#1d4ed8' : '#7c3aed',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {mainUnit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body {
              background-color: white !important;
              color: black !important;
              font-size: 11pt;
            }
            
            button, input, select {
              display: none !important;
            }
            
            div {
              box-shadow: none !important;
              border: 1px solid #ddd !important;
            }
            
            table {
              border: 1px solid #000 !important;
            }
            
            th, td {
              border: 1px solid #ddd !important;
              padding: 6px !important;
            }
            
            @page {
              margin: 0.5in;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DailyProductionReport;