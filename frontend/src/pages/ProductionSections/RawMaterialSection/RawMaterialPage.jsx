// src/pages/ProductionSections/RawMaterialSection/RawMaterialPage.jsx
// FINAL CORRECTED VERSION

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiEdit, FiTrash2, FiRefreshCw, 
  FiPackage, FiCalendar, FiArrowLeft, FiEye, FiHome, 
  FiDatabase, FiTag, FiSearch, FiFilter, FiX, FiArrowRight, 
  FiPrinter, FiFileText, FiChevronDown,
  FiArrowUp, FiArrowDown, FiRepeat
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import RawMaterialLogForm from './RawMaterialLogForm';
import './RawMaterialPage.css';

// آپ کے موجودہ supabase client کا راستہ
import { supabase } from '../../../supabaseClient';

const RawMaterialPage = () => {
  const navigate = useNavigate();
  const tableRef = useRef();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showGeneratorMenu, setShowGeneratorMenu] = useState(false);
  const itemsPerPage = 10;

  // Fetch data from database
  const fetchDataFromDatabase = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('raw_material_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return;
      }

      setRecords(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromDatabase();
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

  // Today's date for reports
  const today = new Date().toISOString().split('T')[0];
  
  // Atom-wise data for reports
  const todayReceived = records.filter(r => 
    r.transaction_type === 'material received' &&
    new Date(r.created_at).toISOString().split('T')[0] === today
  );
  
  const todayIssued = records.filter(r => 
    r.transaction_type === 'material issue' &&
    new Date(r.created_at).toISOString().split('T')[0] === today
  );
  
  const todayReturned = records.filter(r => 
    r.status === 'returned' &&
    new Date(r.created_at).toISOString().split('T')[0] === today
  );

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await supabase
          .from('raw_material_log')
          .delete()
          .eq('id', id);
        
        setRecords(prev => prev.filter(record => record.id !== id));
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  // 📊 Generator Functions - PDF کے بغیر صرف پرنٹ
  const handlePrint = () => {
    window.print();
    setShowGeneratorMenu(false);
  };

  const handleExportPDF = () => {
    // PDF کے بجائے پرنٹ کریں
    handlePrint();
  };

  const handleShareWhatsApp = () => {
    if (filteredRecords.length === 0) {
      alert('No records to share');
      return;
    }

    const message = `*Raw Material Log Report*\n\n` +
      `📊 *Summary:*\n` +
      `• Total Records: ${filteredRecords.length}\n` +
      `• Today's Entries: ${records.filter(r => 
        new Date(r.created_at).toISOString().split('T')[0] === today
      ).length}\n` +
      `• Total Weight: ${records.reduce((sum, r) => sum + (r.weight || r.kg_wt || 0), 0).toFixed(2)} KG\n` +
      `• Generated: ${new Date().toLocaleString()}\n\n` +
      `View full report in the application.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setShowGeneratorMenu(false);
  };

  // Atom-wise Report Functions - صرف پرنٹ
  const generateReceiveReport = () => {
    if (todayReceived.length === 0) {
      alert('No received records found for today');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Today's Received Material Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .report-info { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #10b981; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              table { font-size: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>Today's Received Material Report</h1>
          <div class="report-info">
            <p><strong>Date:</strong> ${today} | <strong>Total Items:</strong> ${todayReceived.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Gate Pass</th>
                <th>Wire Size</th>
                <th>Category</th>
                <th>Shape</th>
                <th>Weight (KG)</th>
                <th>Received By</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${todayReceived.map(record => `
                <tr>
                  <td>${record.gate_pass}</td>
                  <td>${record.wire_size}</td>
                  <td>${record.category}</td>
                  <td>${record.shape}</td>
                  <td>${record.weight || record.kg_wt || '0'}</td>
                  <td>${record.received_by || '-'}</td>
                  <td>${record.remarks || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const generateIssueReport = () => {
    if (todayIssued.length === 0) {
      alert('No issued records found for today');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Today's Issued Material Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .report-info { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f59e0b; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              table { font-size: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>Today's Issued Material Report</h1>
          <div class="report-info">
            <p><strong>Date:</strong> ${today} | <strong>Total Items:</strong> ${todayIssued.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Gate Pass</th>
                <th>Wire Size</th>
                <th>Category</th>
                <th>Shape</th>
                <th>Weight (KG)</th>
                <th>Issued By</th>
                <th>Department</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${todayIssued.map(record => `
                <tr>
                  <td>${record.gate_pass}</td>
                  <td>${record.wire_size}</td>
                  <td>${record.category}</td>
                  <td>${record.shape}</td>
                  <td>${record.weight || record.kg_wt || '0'}</td>
                  <td>${record.issued_by || '-'}</td>
                  <td>${record.department || '-'}</td>
                  <td>${record.remarks || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const generateReturnReport = () => {
    if (todayReturned.length === 0) {
      alert('No returned records found for today');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Today's Returned Material Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            .report-info { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              table { font-size: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>Today's Returned Material Report</h1>
          <div class="report-info">
            <p><strong>Date:</strong> ${today} | <strong>Total Items:</strong> ${todayReturned.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Gate Pass</th>
                <th>Wire Size</th>
                <th>Category</th>
                <th>Shape</th>
                <th>Weight (KG)</th>
                <th>Returned By</th>
                <th>Reason</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${todayReturned.map(record => `
                <tr>
                  <td>${record.gate_pass}</td>
                  <td>${record.wire_size}</td>
                  <td>${record.category}</td>
                  <td>${record.shape}</td>
                  <td>${record.weight || record.kg_wt || '0'}</td>
                  <td>${record.returned_by || '-'}</td>
                  <td>${record.reason || '-'}</td>
                  <td>${record.remarks || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const refreshData = () => {
    fetchDataFromDatabase();
  };

  // Stats
  const stats = [
    {
      id: 1,
      title: 'TOTAL RECORDS',
      value: records.length,
      subText: 'All time entries',
      icon: <FiDatabase />,
      color: '#3b82f6',
      textColor: '#1e40af'
    },
    {
      id: 2,
      title: "TODAY'S ENTRIES",
      value: todayReceived.length + todayIssued.length + todayReturned.length,
      subText: 'New entries today',
      icon: <FiCalendar />,
      color: '#10b981',
      textColor: '#047857'
    },
    {
      id: 3,
      title: 'TOTAL WEIGHT',
      value: `${records.reduce((sum, r) => sum + (r.weight || r.kg_wt || 0), 0).toFixed(2)} KG`,
      subText: 'Cumulative weight',
      icon: <FiPackage />,
      color: '#f59e0b',
      textColor: '#b45309'
    },
    {
      id: 4,
      title: 'RECEIVED',
      value: todayReceived.length,
      subText: 'Today received',
      icon: <FiArrowDown />,
      color: '#8b5cf6',
      textColor: '#6d28d9'
    },
    {
      id: 5,
      title: 'ISSUED',
      value: todayIssued.length,
      subText: 'Today issued',
      icon: <FiArrowUp />,
      color: '#ec4899',
      textColor: '#be185d'
    },
    {
      id: 6,
      title: 'RETURNED',
      value: todayReturned.length,
      subText: 'Today returned',
      icon: <FiRepeat />,
      color: '#06b6d4',
      textColor: '#0e7490'
    }
  ];

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleFormSubmit = (formData) => {
    if (editingRecord) {
      setRecords(prev => prev.map(r => 
        r.id === editingRecord.id ? { ...r, ...formData } : r
      ));
    } else {
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

  // Close generator menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showGeneratorMenu && !event.target.closest('.generator-container')) {
        setShowGeneratorMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGeneratorMenu]);

  return (
    <div className="raw-material-container">
      {/* Header - اب بیک بٹن ہیڈر کے اندر ہوگا */}
      <div className="page-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate('/production-dashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
          
          <div className="header-title">
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
          
          <button className="btn-secondary" onClick={refreshData}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - اب صحیح ترتیب میں */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-icon-wrapper" style={{ background: `${stat.color}20` }}>
              <div className="stat-icon" style={{ color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ color: stat.textColor }}>
                {stat.value}
              </div>
              <div className="stat-title" style={{ color: '#374151' }}>
                {stat.title}
              </div>
              <div className="stat-subtext" style={{ color: '#6b7280' }}>
                {stat.subText}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Line with Generator Button - اب صحیح ترتیب میں */}
      <div className="filters-container">
        <div className="filters-section">
          {/* Search */}
          <div className="filter-group">
            <div className="filter-label">
              <FiSearch /> Search
            </div>
            <input
              type="text"
              placeholder="Search by gate pass, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Transaction Type */}
          <div className="filter-group">
            <div className="filter-label">
              <FiFilter /> Transaction Type
            </div>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="material received">Material Received</option>
              <option value="material issue">Material Issue</option>
            </select>
          </div>
          
          {/* Date */}
          <div className="filter-group">
            <div className="filter-label">
              <FiCalendar /> Date
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="filter-date"
            />
          </div>
          
          {/* Clear Button */}
          <button 
            className="clear-filters-btn" 
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterDate('');
              setCurrentPage(1);
            }}
          >
            <FiX /> Clear Filters
          </button>
          
          {/* Generator Button */}
          <div className="generator-wrapper">
            <div className="generator-container">
              <button 
                className="generator-btn"
                onClick={() => setShowGeneratorMenu(!showGeneratorMenu)}
              >
                <FiFileText /> Generator <FiChevronDown />
              </button>
              
              {showGeneratorMenu && (
                <div className="generator-dropdown">
                  <button onClick={handlePrint} className="dropdown-item">
                    <FiPrinter /> Print Report
                  </button>
                  <button onClick={handleExportPDF} className="dropdown-item">
                    <FiFileText /> PDF Report
                  </button>
                  <button onClick={handleShareWhatsApp} className="dropdown-item">
                    <FaWhatsapp style={{ color: '#25D366' }} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Atom-wise Report Buttons - اب الگ لائن میں */}
        <div className="atom-reports-section">
          <button 
            onClick={generateReceiveReport}
            className="atom-report-btn receive-btn"
          >
            <FiArrowDown /> Receive Wise
          </button>
          <button 
            onClick={generateIssueReport}
            className="atom-report-btn issue-btn"
          >
            <FiArrowUp /> Issue Wise
          </button>
          <button 
            onClick={generateReturnReport}
            className="atom-report-btn return-btn"
          >
            <FiRepeat /> Return Wise
          </button>
        </div>
      </div>

      {/* باقی کوڈ وہی رہے گا */}
      {/* Table Section */}
      <div className="table-section" ref={tableRef}>
        <div className="table-header">
          <h3>Raw Material Log Records</h3>
          <div className="table-info">
            Showing {filteredRecords.length} of {records.length} records
            {filteredRecords.length > 0 && ` (Page ${currentPage} of ${totalPages})`}
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
            <div className="table-responsive">
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
                          <strong>{record.weight || record.kg_wt || '0'}</strong> KG
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
                          <button className="btn-icon btn-view" onClick={() => handleEdit(record)} title="View">
                            <FiEye />
                          </button>
                          <button className="btn-icon btn-edit" onClick={() => handleEdit(record)} title="Edit">
                            <FiEdit />
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDelete(record.id)} title="Delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
            Database Connected • {filteredRecords.length} records available
          </div>
          <div className="last-updated">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="footer-actions">
          <button className="btn-outline" onClick={handleAddNew}>
            <FiPlus /> Add New
          </button>
          <button className="btn-outline" onClick={() => navigate('/production-dashboard')}>
            <FiHome /> Dashboard
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-fullscreen">
          <div className="modal-content-wrapper">
            <RawMaterialLogForm
              onClose={handleCloseForm}
              editData={editingRecord}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RawMaterialPage;