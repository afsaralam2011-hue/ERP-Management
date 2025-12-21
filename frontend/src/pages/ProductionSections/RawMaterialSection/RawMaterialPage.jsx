// src/pages/ProductionSections/RawMaterialSection/RawMaterialPage.jsx
// COMPLETE FINAL VERSION WITH PROPER ROUTING AND MODAL SIZE

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, 
  FiDownload, FiRefreshCw, FiPackage, FiCalendar, 
  FiUser, FiBarChart2, FiPrinter, FiArrowLeft, 
  FiEye, FiHome, FiClock, FiDatabase, FiCheckCircle,
  FiXCircle, FiGrid, FiX, FiBriefcase, FiBox, 
  FiArchive, FiArrowRight, FiTrendingUp, FiTrendingDown,
  FiTruck, FiShoppingCart, FiTag, FiLayers, FiTool,
  FiCheck, FiAlertCircle, FiDollarSign
} from 'react-icons/fi';
import RawMaterialLogForm from './RawMaterialLogForm';
import './RawMaterialPage.css';

const RawMaterialPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data - Replace with your API
  const mockData = [
    {
      id: 1,
      gate_pass: 'GP-2024-001',
      transaction_type: 'material received',
      wire_size: '1.20mm',
      category: 'B4',
      shape: 'coil form',
      kg_wt: 1250.50,
      remarks: 'Received from ABC Steel Mills',
      reason: 'Monthly stock replenishment',
      department: 'Warehouse',
      reference_no: 'PO-2024-001',
      received_by: 'John Doe',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      gate_pass: 'GP-2024-002',
      transaction_type: 'material issue',
      wire_size: '1.50mm',
      category: 'B6',
      shape: 'bobbins form',
      kg_wt: 500.00,
      remarks: 'Issued to Production Floor',
      reason: 'Production Order #1234',
      department: 'Production',
      reference_no: 'JOB-2024-001',
      issued_by: 'Jane Smith',
      status: 'completed',
      created_at: '2024-01-15T14:45:00Z'
    },
    {
      id: 3,
      gate_pass: 'GP-2024-003',
      transaction_type: 'material received',
      wire_size: '2.00mm',
      category: 'B8',
      shape: 'sheet form',
      kg_wt: 800.75,
      remarks: 'New supplier delivery',
      reason: 'Stock replenishment',
      department: 'Warehouse',
      received_by: 'Robert Brown',
      status: 'active',
      created_at: '2024-01-16T09:15:00Z'
    },
    {
      id: 4,
      gate_pass: 'GP-2024-004',
      transaction_type: 'material issue',
      wire_size: '1.20mm',
      category: 'B4',
      shape: 'coil form',
      kg_wt: 350.25,
      remarks: 'Issued for maintenance',
      reason: 'Machine repair work',
      department: 'Maintenance',
      issued_by: 'Mike Wilson',
      status: 'completed',
      created_at: '2024-01-16T14:20:00Z'
    },
    {
      id: 5,
      gate_pass: 'GP-2024-005',
      transaction_type: 'material received',
      wire_size: '3.00mm',
      category: 'B10',
      shape: 'rod form',
      kg_wt: 1200.00,
      remarks: 'Bulk order received',
      reason: 'Project XYZ requirements',
      department: 'Warehouse',
      received_by: 'Sarah Johnson',
      status: 'active',
      created_at: '2024-01-17T11:45:00Z'
    }
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Using mock data
        setTimeout(() => {
          setRecords(mockData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.gate_pass?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.wire_size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.remarks?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || record.transaction_type === filterType;
    
    const recordDate = new Date(record.created_at).toISOString().split('T')[0];
    const matchesDate = !filterDate || recordDate === filterDate;

    return matchesSearch && matchesType && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Handlers
  const handleAddNew = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert('No records to export');
      return;
    }

    const csvContent = [
      ['Gate Pass', 'Transaction Type', 'Wire Size', 'Category', 'Shape', 'Weight (KG)', 'Department', 'Reference No', 'Status', 'Created Date'],
      ...filteredRecords.map(record => [
        record.gate_pass,
        record.transaction_type,
        record.wire_size,
        record.category,
        record.shape,
        record.kg_wt,
        record.department,
        record.reference_no,
        record.status,
        new Date(record.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw-material-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Stats
  const stats = {
    totalRecords: records.length,
    todayRecords: records.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(r.created_at).toISOString().split('T')[0] === today;
    }).length,
    totalWeight: records.reduce((sum, r) => sum + (r.kg_wt || 0), 0).toFixed(2),
    receivedCount: records.filter(r => r.transaction_type === 'material received').length,
    issuedCount: records.filter(r => r.transaction_type === 'material issue').length,
    activeRecords: records.filter(r => r.status === 'active').length,
    totalValue: (records.reduce((sum, r) => sum + (r.kg_wt || 0), 0) * 150).toFixed(2)
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleFormSubmit = (formData) => {
    if (editingRecord) {
      // Update existing record
      setRecords(prev => prev.map(r => 
        r.id === editingRecord.id ? { ...r, ...formData } : r
      ));
    } else {
      // Add new record
      const newRecord = {
        id: records.length + 1,
        ...formData,
        created_at: new Date().toISOString()
      };
      setRecords(prev => [newRecord, ...prev]);
    }
    setShowForm(false);
    setEditingRecord(null);
  };

  return (
    <div className="raw-material-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft /> Dashboard
          </button>
          <div className="title-section">
            <div className="title-icon">
              <FiPackage size={28} />
            </div>
            <div>
              <h1>Raw Material Log</h1>
              <p className="subtitle">Manage material transactions and inventory</p>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn-primary" onClick={handleAddNew}>
            <FiPlus /> New Material Log
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            <FiDownload /> Export
          </button>
          <button className="btn-secondary" onClick={refreshData}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>
            <FiDatabase />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalRecords}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            <FiCalendar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.todayRecords}</div>
            <div className="stat-label">Today's Entries</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b' }}>
            <FiPackage />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalWeight} KG</div>
            <div className="stat-label">Total Weight</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#8b5cf6' }}>
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.receivedCount}</div>
            <div className="stat-label">Received</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ec4899' }}>
            <FiTrendingDown />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.issuedCount}</div>
            <div className="stat-label">Issued</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#06b6d4' }}>
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">₹{stats.totalValue}</div>
            <div className="stat-label">Total Value</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label><FiSearch /> Search</label>
          <input
            type="text"
            placeholder="Search by gate pass, category, wire size..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label><FiFilter /> Transaction Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="material received">Material Received</option>
            <option value="material issue">Material Issue</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label><FiCalendar /> Date</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <button className="clear-btn" onClick={() => {
          setSearchTerm('');
          setFilterType('');
          setFilterDate('');
          setCurrentPage(1);
        }}>
          <FiX /> Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>Raw Material Log Records</h3>
          <div className="table-info">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-state">
            <FiPackage size={48} />
            <h4>No records found</h4>
            <p>Try adjusting your filters or add a new record</p>
            <button className="btn-primary" onClick={handleAddNew}>
              <FiPlus /> Add First Record
            </button>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gate Pass</th>
                  <th>Type</th>
                  <th>Wire Size</th>
                  <th>Category</th>
                  <th>Shape</th>
                  <th>Weight (KG)</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="gate-pass">
                        <FiTag /> {record.gate_pass}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${record.transaction_type === 'material received' ? 'badge-success' : 'badge-warning'}`}>
                        {record.transaction_type === 'material received' ? 'Received' : 'Issued'}
                      </span>
                    </td>
                    <td>{record.wire_size}</td>
                    <td>
                      <span className="category-badge">{record.category}</span>
                    </td>
                    <td>{record.shape}</td>
                    <td>
                      <div className="weight-cell">
                        <strong>{record.kg_wt}</strong> KG
                      </div>
                    </td>
                    <td>{record.department || '-'}</td>
                    <td>
                      <div className="date-cell">
                        <FiCalendar size={12} />
                        {new Date(record.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-view" onClick={() => handleEdit(record)}>
                          <FiEye />
                        </button>
                        <button className="btn-icon btn-edit" onClick={() => handleEdit(record)}>
                          <FiEdit />
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(record.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <FiArrowLeft /> Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next <FiArrowRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="page-footer">
        <div className="footer-info">
          <div className="database-status">
            <div className="status-dot connected"></div>
            Connected to Database
          </div>
          <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn-outline" onClick={handleAddNew}>
            <FiPlus /> Add New
          </button>
          <button className="btn-outline" onClick={() => navigate('/dashboard')}>
            <FiHome /> Dashboard
          </button>
        </div>
      </div>

      {/* Form Modal - NOW FULL SCREEN */}
      {showForm && (
        <div className="modal-fullscreen">
          <RawMaterialLogForm
            onClose={handleCloseForm}
            editData={editingRecord}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}
    </div>
  );
};

export default RawMaterialPage;