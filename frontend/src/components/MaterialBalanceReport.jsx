// components/MaterialBalanceReport.jsx
import React, { useState, useEffect } from 'react';
import { 
  FiPackage, FiTrendingUp, FiTrendingDown, 
  FiCheckCircle, FiAlertCircle, FiInfo,
  FiDownload, FiFilter, FiSearch
} from 'react-icons/fi';
import InventoryService from '../services/inventoryService';
import './MaterialBalanceReport.css';

const MaterialBalanceReport = ({ dateRange, materialType }) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'item_code', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReportData();
  }, [dateRange, materialType]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const filters = { ...dateRange };
      if (materialType) filters.material_type = materialType;
      
      const data = await InventoryService.getMaterialBalanceReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error loading balance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...reportData];
    
    // سرچ فلٹر
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sortableData = sortableData.filter(item => 
        item.item_code.toLowerCase().includes(term) ||
        item.item_name.toLowerCase().includes(term) ||
        item.material_type.toLowerCase().includes(term)
      );
    }
    
    // سورٹنگ
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableData;
  }, [reportData, sortConfig, searchTerm]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'NORMAL':
        return <FiCheckCircle className="status-icon normal" />;
      case 'LOW':
        return <FiAlertCircle className="status-icon low" />;
      case 'CRITICAL':
        return <FiAlertCircle className="status-icon critical" />;
      case 'OUT_OF_STOCK':
        return <FiAlertCircle className="status-icon out-of-stock" />;
      default:
        return <FiInfo className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NORMAL': return '#2ecc71';
      case 'LOW': return '#f39c12';
      case 'CRITICAL': return '#e74c3c';
      case 'OUT_OF_STOCK': return '#c0392b';
      default: return '#95a5a6';
    }
  };

  const exportToCSV = () => {
    const headers = ['Item Code', 'Item Name', 'Material Type', 'Production (Kg)', 'Consumption (Kg)', 'Balance (Kg)', 'Efficiency %', 'Status'];
    const csvData = sortedData.map(item => [
      item.item_code,
      item.item_name,
      item.material_type,
      item.production_kg.toFixed(2),
      item.consumption_kg.toFixed(2),
      item.balance_kg.toFixed(2),
      item.efficiency_percent,
      item.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const calculateTotals = () => {
    return {
      production: sortedData.reduce((sum, item) => sum + item.production_kg, 0),
      consumption: sortedData.reduce((sum, item) => sum + item.consumption_kg, 0),
      balance: sortedData.reduce((sum, item) => sum + item.balance_kg, 0),
      items: sortedData.length
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading balance report...</p>
      </div>
    );
  }

  return (
    <div className="balance-report">
      {/* ہیڈر */}
      <div className="report-header">
        <div className="header-left">
          <h2><FiPackage /> Material Balance Report</h2>
          <p className="date-range">
            {dateRange.start === dateRange.end 
              ? `Date: ${dateRange.start}`
              : `Date Range: ${dateRange.start} to ${dateRange.end}`
            }
          </p>
        </div>
        
        <div className="header-right">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-export" onClick={exportToCSV}>
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* ٹوٹل سمری */}
      <div className="totals-summary">
        <div className="total-item">
          <div className="total-label">Total Items</div>
          <div className="total-value">{totals.items}</div>
        </div>
        <div className="total-item">
          <div className="total-label">Total Production</div>
          <div className="total-value production">
            {totals.production.toFixed(2)} <span>Kg</span>
          </div>
        </div>
        <div className="total-item">
          <div className="total-label">Total Consumption</div>
          <div className="total-value consumption">
            {totals.consumption.toFixed(2)} <span>Kg</span>
          </div>
        </div>
        <div className="total-item">
          <div className="total-label">Net Balance</div>
          <div className="total-value balance" style={{
            color: totals.balance >= 0 ? '#2ecc71' : '#e74c3c'
          }}>
            {totals.balance.toFixed(2)} <span>Kg</span>
          </div>
        </div>
      </div>

      {/* ٹیبل */}
      <div className="table-container">
        <table className="balance-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('item_code')}>
                Item Code {sortConfig.key === 'item_code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('item_name')}>
                Item Name {sortConfig.key === 'item_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('material_type')}>
                Material {sortConfig.key === 'material_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('production_kg')}>
                Production (Kg) {sortConfig.key === 'production_kg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('consumption_kg')}>
                Consumption (Kg) {sortConfig.key === 'consumption_kg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('balance_kg')}>
                Balance (Kg) {sortConfig.key === 'balance_kg' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('efficiency_percent')}>
                Efficiency % {sortConfig.key === 'efficiency_percent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                  <td className="item-code">
                    <strong>{item.item_code}</strong>
                  </td>
                  <td className="item-name">{item.item_name}</td>
                  <td className="material-type">
                    <span className="material-badge">{item.material_type}</span>
                  </td>
                  <td className="production">
                    <div className="value-with-icon">
                      <FiTrendingUp className="icon-up" />
                      {item.production_kg.toFixed(2)}
                    </div>
                  </td>
                  <td className="consumption">
                    <div className="value-with-icon">
                      <FiTrendingDown className="icon-down" />
                      {item.consumption_kg.toFixed(2)}
                    </div>
                  </td>
                  <td className="balance">
                    <div className={`balance-value ${item.balance_kg >= 0 ? 'positive' : 'negative'}`}>
                      {item.balance_kg.toFixed(2)}
                    </div>
                  </td>
                  <td className="efficiency">
                    <div className="efficiency-bar">
                      <div 
                        className="efficiency-fill"
                        style={{
                          width: `${Math.min(item.efficiency_percent, 100)}%`,
                          backgroundColor: item.efficiency_percent >= 80 ? '#2ecc71' : 
                                         item.efficiency_percent >= 60 ? '#f39c12' : '#e74c3c'
                        }}
                      />
                      <span className="efficiency-text">{item.efficiency_percent}%</span>
                    </div>
                  </td>
                  <td className="status">
                    <div className="status-badge" style={{ backgroundColor: getStatusColor(item.status) + '20', color: getStatusColor(item.status) }}>
                      {getStatusIcon(item.status)}
                      {item.status.replace('_', ' ')}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  <div className="empty-state">
                    <FiPackage size={48} />
                    <h3>No Data Found</h3>
                    <p>No inventory data available for the selected filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* فٹر سمری */}
      <div className="filter-summary">
        <div className="summary-item">
          <span className="summary-label">Showing:</span>
          <span className="summary-value">{sortedData.length} of {reportData.length} items</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Last Updated:</span>
          <span className="summary-value">{new Date().toLocaleTimeString()}</span>
        </div>
        {materialType && (
          <div className="summary-item">
            <span className="summary-label">Filter:</span>
            <span className="summary-value">{materialType} materials only</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialBalanceReport;