// src/pages/ProductionSections/SpiralSection/SpiralPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiEdit, FiTrash2, FiSearch, 
  FiFilter, FiDownload, FiRefreshCw,
  FiPackage, FiCalendar, FiUser, FiTarget,
  FiBarChart2, FiPrinter, FiCalendar as FiCal,
  FiArrowLeft, FiEye, FiHome, FiTrendingUp,
  FiClock, FiLayers, FiActivity, FiArrowUpRight,
  FiAlertCircle, FiChevronLeft, FiChevronRight,
  FiDatabase, FiCheckCircle, FiXCircle,
  FiGrid, FiSettings, FiX, FiScissors,
  FiCheckSquare, FiCrop, FiDivide, FiTool,
  FiBriefcase, FiBox, FiArchive, FiColumns,
  FiArrowRight, FiBarChart, FiHash, FiTag,
  FiDollarSign, FiPercent, FiGrid as FiGridIcon,
  FiTrendingDown, FiTrendingUp as FiTrendingUpIcon,
  FiDatabase as FiDatabaseIcon, FiTruck,
  FiShoppingCart, FiDroplet, FiFeather,
  FiClipboard, FiList, FiCpu, FiTrendingUp as FiTrendingUp2,
  FiTool as FiMachine, FiHash as FiCode, FiFeather as FiWeight,
  FiZap, FiBox as FiProduct
} from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './SpiralPage.css';

const SpiralPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showReport, setShowReport] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Report data
  const [reportData, setReportData] = useState({
    date: '',
    formattedDate: '',
    itemWise: {},
    wireWise: {},
    finishedProductWise: {},
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    recordCount: 0
  });

  // Stats states - Updated according to your structure
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalProduction: 0,
    totalWeight: 0,
    avgEfficiency: 0,
    toDayProduction: 0,
    lastDayWeight: 0,
    lastDayEfficiency: 0,
    todayRecords: 0,
    todayProduction: 0,
    todayWeight: 0,
    todayAvgEfficiency: 0,
    itemWiseToday: {},
    machineWiseToday: {},
    finishedProductWiseToday: {}
  });

  // Material types
  const materialTypes = [
    'GI Pipe', 'MS Pipe', 'Stainless Steel Pipe',
    'Aluminum Pipe', 'Copper Pipe', 'Other'
  ];

  // Wire sizes
  const wireSizes = [
    '1.0 mm', '1.5 mm', '2.0 mm', '2.5 mm', 
    '3.0 mm', '3.5 mm', '4.0 mm', 'Other'
  ];

  // Shift names
  const shiftNames = [
    'Morning Shift', 'Afternoon Shift', 'Night Shift',
    'General Shift', 'Other'
  ];

  // Check if supabase is connected
  const isSupabaseConnected = supabase && process.env.REACT_APP_SUPABASE_URL;

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if supabase is available
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // Fetch records from spiralsection table
      const { data: recordsData, error: recordsError } = await supabase
        .from('spiralsection')
        .select('*')
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      setRecords(recordsData || []);
      calculateStats(recordsData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate stats - Updated according to your structure
  const calculateStats = (recordsData) => {
    if (!recordsData || recordsData.length === 0) {
      setStats({
        totalRecords: 0,
        totalProduction: 0,
        totalWeight: 0,
        avgEfficiency: 0,
        toDayProduction: 0,
        lastDayWeight: 0,
        lastDayEfficiency: 0,
        todayRecords: 0,
        todayProduction: 0,
        todayWeight: 0,
        todayAvgEfficiency: 0,
        itemWiseToday: {},
        machineWiseToday: {},
        finishedProductWiseToday: {}
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayRecords = recordsData.filter(record => {
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      return recordDate === today;
    });

    const yesterdayRecords = recordsData.filter(record => {
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      return recordDate === yesterdayStr;
    });

    const totalProduction = recordsData.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0
    );

    const totalWeight = recordsData.reduce((sum, record) => 
      sum + (parseFloat(record.weight) || 0), 0
    );

    const totalEfficiency = recordsData.reduce((sum, record) => 
      sum + (parseFloat(record.efficiency) || 0), 0
    );

    const avgEfficiency = recordsData.length > 0 ? totalEfficiency / recordsData.length : 0;

    const toDayProduction = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0
    );

    const lastDayWeight = yesterdayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.weight) || 0), 0
    );

    const lastDayEfficiencySum = yesterdayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.efficiency) || 0), 0
    );

    const lastDayEfficiency = yesterdayRecords.length > 0 ? lastDayEfficiencySum / yesterdayRecords.length : 0;

    // Today's stats
    const todayProduction = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.production_quantity) || 0), 0
    );

    const todayWeight = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.weight) || 0), 0
    );

    const todayEfficiencySum = todayRecords.reduce((sum, record) => 
      sum + (parseFloat(record.efficiency) || 0), 0
    );

    const todayAvgEfficiency = todayRecords.length > 0 ? todayEfficiencySum / todayRecords.length : 0;

    // Item-wise today
    const itemWiseToday = {};
    const machineWiseToday = {};
    const finishedProductWiseToday = {};
    
    todayRecords.forEach(record => {
      // Item data
      const item = record.item_name || 'Unknown';
      if (!itemWiseToday[item]) {
        itemWiseToday[item] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0
        };
      }
      itemWiseToday[item].production += parseFloat(record.production_quantity) || 0;
      itemWiseToday[item].weight += parseFloat(record.weight) || 0;
      itemWiseToday[item].efficiency += parseFloat(record.efficiency) || 0;
      itemWiseToday[item].count += 1;

      // Machine data
      const machine = record.machine_no || 'Unknown';
      if (!machineWiseToday[machine]) {
        machineWiseToday[machine] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0
        };
      }
      machineWiseToday[machine].production += parseFloat(record.production_quantity) || 0;
      machineWiseToday[machine].weight += parseFloat(record.weight) || 0;
      machineWiseToday[machine].efficiency += parseFloat(record.efficiency) || 0;
      machineWiseToday[machine].count += 1;

      // Finished Product data
      const product = record.finishedproductname || 'Unknown';
      if (!finishedProductWiseToday[product]) {
        finishedProductWiseToday[product] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0
        };
      }
      finishedProductWiseToday[product].production += parseFloat(record.production_quantity) || 0;
      finishedProductWiseToday[product].weight += parseFloat(record.weight) || 0;
      finishedProductWiseToday[product].efficiency += parseFloat(record.efficiency) || 0;
      finishedProductWiseToday[product].count += 1;
    });

    setStats({
      totalRecords: recordsData.length,
      totalProduction,
      totalWeight,
      avgEfficiency,
      toDayProduction,
      lastDayWeight,
      lastDayEfficiency,
      todayRecords: todayRecords.length,
      todayProduction,
      todayWeight,
      todayAvgEfficiency,
      itemWiseToday,
      machineWiseToday,
      finishedProductWiseToday
    });
  };

  // Filter records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      (record.item_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.wire_size?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.finishedproductname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.material_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.users_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.raw_material_flatsize?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.machine_no?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (record.operator_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesType = !filterType || record.material_type === filterType;
    
    const recordDate = new Date(record.created_at).toISOString().split('T')[0];
    const matchesDate = !filterDate || recordDate === filterDate;

    return matchesSearch && matchesType && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  // Generate report
  const generateReport = (selectedDate) => {
    const dateRecords = records.filter(record => {
      const recordDate = new Date(record.created_at).toISOString().split('T')[0];
      return recordDate === selectedDate;
    });

    if (dateRecords.length === 0) {
      setReportData({
        date: selectedDate,
        formattedDate: new Date(selectedDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        itemWise: {},
        wireWise: {},
        finishedProductWise: {},
        totalProduction: 0,
        totalWeight: 0,
        avgEfficiency: 0,
        recordCount: 0
      });
      return;
    }

    const itemWise = {};
    const wireWise = {};
    const finishedProductWise = {};
    let totalProduction = 0;
    let totalWeight = 0;
    let totalEfficiency = 0;

    dateRecords.forEach(record => {
      const item = record.item_name || 'Unknown';
      const wire = record.wire_size || 'Unknown';
      const product = record.finishedproductname || 'Unknown';
      const production = parseFloat(record.production_quantity) || 0;
      const weight = parseFloat(record.weight) || 0;
      const efficiency = parseFloat(record.efficiency) || 0;
      
      // Item wise
      if (!itemWise[item]) {
        itemWise[item] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0
        };
      }
      itemWise[item].production += production;
      itemWise[item].weight += weight;
      itemWise[item].efficiency += efficiency;
      itemWise[item].count += 1;
      
      // Wire wise
      if (!wireWise[wire]) {
        wireWise[wire] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0
        };
      }
      wireWise[wire].production += production;
      wireWise[wire].weight += weight;
      wireWise[wire].efficiency += efficiency;
      wireWise[wire].count += 1;
      
      // Finished Product wise
      if (!finishedProductWise[product]) {
        finishedProductWise[product] = {
          production: 0,
          weight: 0,
          efficiency: 0,
          count: 0
        };
      }
      finishedProductWise[product].production += production;
      finishedProductWise[product].weight += weight;
      finishedProductWise[product].efficiency += efficiency;
      finishedProductWise[product].count += 1;

      totalProduction += production;
      totalWeight += weight;
      totalEfficiency += efficiency;
    });

    const avgEfficiency = dateRecords.length > 0 ? totalEfficiency / dateRecords.length : 0;

    setReportData({
      date: selectedDate,
      formattedDate: new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      itemWise,
      wireWise,
      finishedProductWise,
      totalProduction,
      totalWeight,
      avgEfficiency,
      recordCount: dateRecords.length
    });
  };

  // Handle report generation when date changes
  useEffect(() => {
    if (filterDate) {
      generateReport(filterDate);
    }
  }, [filterDate, records]);

  // Handlers
  const handleEdit = (id) => {
    navigate(`/production-sections/spiral/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/production-sections/spiral/view/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from('spiralsection')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('Record deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record: ' + error.message);
    }
  };

  // Export all records
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert('No records to export');
      return;
    }

    const csvContent = [
      ['ID', 'Item Name', 'Raw Material Size', 'Material Type', 'Wire Size', 'Finished Product', 'Machine ID', 'Machine No', 'Production', 'Unit', 'Weight', 'Per Meter WT', 'Efficiency %', 'Operator', 'User Name', 'Shift Code', 'Shift Name', 'Remarks', 'Item Code', 'Created At'],
      ...filteredRecords.map(record => [
        record.id,
        `"${record.item_name || ''}"`,
        `"${record.raw_material_flatsize || ''}"`,
        `"${record.material_type || ''}"`,
        `"${record.wire_size || ''}"`,
        `"${record.finishedproductname || ''}"`,
        `"${record.machine_id || ''}"`,
        `"${record.machine_no || ''}"`,
        parseFloat(record.production_quantity) || 0,
        `"${record.unit || 'Meter'}"`,
        parseFloat(record.weight) || 0,
        parseFloat(record.per_meter_wt) || 0,
        parseFloat(record.efficiency) || 0,
        `"${record.operator_name || ''}"`,
        `"${record.users_name || ''}"`,
        `"${record.shift_code || ''}"`,
        `"${record.shift_name || ''}"`,
        `"${record.remarks || ''}"`,
        `"${record.item_code || ''}"`,
        `"${new Date(record.created_at).toLocaleString()}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spiral-production-records-${new Date().toISOString().split('T')[0]}-Afsar.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print report
  const handlePrintReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert('No report data to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Spiral Section Production Report - ${reportData.formattedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 10px; }
          .header .date { color: #666; font-size: 18px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          .table th { background-color: #f8f9fa; }
          .summary { 
            background-color: #f8f9fa; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
          }
          .summary h3 { margin-top: 0; }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Spiral Section Production Report</h1>
          <div class="date">${reportData.formattedDate}</div>
          <div class="date">Report Generated by: Afsar</div>
        </div>
        
        <h3>Item-wise Summary:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Production (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.itemWise).map(([item, data]) => `
              <tr>
                <td>${item}</td>
                <td>${data.production.toFixed(2)}</td>
                <td>${data.weight.toFixed(2)}</td>
                <td>${(data.count > 0 ? data.efficiency / data.count : 0).toFixed(2)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h3>Wire-wise Summary:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Wire Size</th>
              <th>Production (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.wireWise).map(([wire, data]) => `
              <tr>
                <td>${wire}</td>
                <td>${data.production.toFixed(2)}</td>
                <td>${data.weight.toFixed(2)}</td>
                <td>${(data.count > 0 ? data.efficiency / data.count : 0).toFixed(2)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h3>Finished Product-wise Summary:</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Finished Product</th>
              <th>Production (Meter)</th>
              <th>Weight (KG)</th>
              <th>Avg Efficiency</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.finishedProductWise).map(([product, data]) => `
              <tr>
                <td>${product}</td>
                <td>${data.production.toFixed(2)}</td>
                <td>${data.weight.toFixed(2)}</td>
                <td>${(data.count > 0 ? data.efficiency / data.count : 0).toFixed(2)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="summary">
          <h3>Summary:</h3>
          <p><strong>Total Production:</strong> ${reportData.totalProduction.toFixed(2)} Meter</p>
          <p><strong>Total Weight:</strong> ${reportData.totalWeight.toFixed(2)} KG</p>
          <p><strong>Average Efficiency:</strong> ${reportData.avgEfficiency.toFixed(2)}%</p>
          <p><strong>Total Records:</strong> ${reportData.recordCount}</p>
        </div>
        
        <div class="footer">
          Generated on ${new Date().toLocaleString()} by Afsar<br/>
          Spiral Section - Production Management System
        </div>
        
        <div class="no-print" style="margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export report
  const handleExportReport = () => {
    if (!reportData || reportData.recordCount === 0) {
      alert('No report data to export');
      return;
    }

    const csvContent = [
      ['Spiral Section Production Report', reportData.formattedDate],
      ['Generated by: Afsar'],
      [],
      ['Item-wise Summary'],
      ['Item Name', 'Production (Meter)', 'Weight (KG)', 'Avg Efficiency'],
      ...Object.entries(reportData.itemWise).map(([item, data]) => [
        item,
        data.production.toFixed(2),
        data.weight.toFixed(2),
        (data.count > 0 ? data.efficiency / data.count : 0).toFixed(2) + '%'
      ]),
      [],
      ['Wire-wise Summary'],
      ['Wire Size', 'Production (Meter)', 'Weight (KG)', 'Avg Efficiency'],
      ...Object.entries(reportData.wireWise).map(([wire, data]) => [
        wire,
        data.production.toFixed(2),
        data.weight.toFixed(2),
        (data.count > 0 ? data.efficiency / data.count : 0).toFixed(2) + '%'
      ]),
      [],
      ['Finished Product-wise Summary'],
      ['Finished Product', 'Production (Meter)', 'Weight (KG)', 'Avg Efficiency'],
      ...Object.entries(reportData.finishedProductWise).map(([product, data]) => [
        product,
        data.production.toFixed(2),
        data.weight.toFixed(2),
        (data.count > 0 ? data.efficiency / data.count : 0).toFixed(2) + '%'
      ]),
      [],
      ['SUMMARY'],
      ['Total Production (Meter):', reportData.totalProduction.toFixed(2)],
      ['Total Weight (KG):', reportData.totalWeight.toFixed(2)],
      ['Average Efficiency:', reportData.avgEfficiency.toFixed(2) + '%'],
      ['Total Records:', reportData.recordCount],
      [],
      ['Generated by: Afsar'],
      ['Generated on:', new Date().toLocaleString()]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spiral-section-report-${filterDate}-Afsar.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Get unique values for filters
  const uniqueWireSizes = [...new Set(
    records.map(record => record.wire_size).filter(Boolean)
  )].sort();

  const uniqueFinishedProducts = [...new Set(
    records.map(record => record.finishedproductname).filter(Boolean)
  )].sort();

  const uniqueItems = [...new Set(
    records.map(record => record.item_name).filter(Boolean)
  )].sort();

  const uniqueDates = [...new Set(
    records.map(record => new Date(record.created_at).toISOString().split('T')[0])
  )].sort().reverse();

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Production Sections for switcher
  const productionSections = [
    { id: 'raw-material', name: 'Raw Material Section', icon: FiArchive, path: '/production-sections/raw-material', color: '#06b6d4' },
    { id: 'flattening', name: 'Flattening Section', icon: FiPackage, path: '/production-sections/flattening', color: '#10b981' },
    { id: 'spiral', name: 'Spiral Section', icon: FiColumns, path: '/production-sections/spiral', color: '#3b82f6' },
    { id: 'pvc-coating', name: 'PVC Coating Section', icon: FiLayers, path: '/production-sections/pvc-coating', color: '#8b5cf6' },
    { id: 'cutting-packing', name: 'Cutting & Packing Section', icon: FiScissors, path: '/production-sections/cutting-packing', color: '#f59e0b' },
    { id: 'finished-goods', name: 'Finished Goods Section', icon: FiCheckSquare, path: '/production-sections/finished-goods', color: '#ec4899' }
  ];

  // Stats cards - Updated according to your stats structure
  const statCards = [
    {
      id: 'total-records',
      title: 'Total Records',
      value: stats.totalRecords,
      icon: FiDatabaseIcon,
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      description: 'All production records',
      gradientColors: ['#3b82f6', '#1d4ed8'],
      iconBg: '#3b82f6'
    },
    {
      id: 'total-production',
      title: 'Total Production',
      value: `${stats.totalProduction.toLocaleString()} M`,
      icon: FiColumns,
      color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      description: 'Total production in meters',
      gradientColors: ['#3b82f6', '#2563eb'],
      iconBg: '#3b82f6'
    },
    {
      id: 'total-weight',
      title: 'Total Weight',
      value: `${stats.totalWeight.toLocaleString()} KG`,
      icon: FiWeight,
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      description: 'Total weight in kilograms',
      gradientColors: ['#8b5cf6', '#7c3aed'],
      iconBg: '#8b5cf6'
    },
    {
      id: 'avg-efficiency',
      title: 'Avg Efficiency',
      value: `${stats.avgEfficiency.toFixed(2)}%`,
      icon: FiTrendingUp2,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: 'Average efficiency percentage',
      gradientColors: ['#10b981', '#059669'],
      iconBg: '#10b981'
    },
    {
      id: 'today-records',
      title: "Today's Records",
      value: stats.todayRecords,
      icon: FiClock,
      color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      description: 'Records added today',
      gradientColors: ['#3b82f6', '#2563eb'],
      iconBg: '#3b82f6'
    },
    {
      id: 'today-production',
      title: "Today's Production",
      value: `${stats.todayProduction.toLocaleString()} M`,
      icon: FiPackage,
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      description: "Today's production",
      gradientColors: ['#3b82f6', '#1d4ed8'],
      iconBg: '#3b82f6'
    },
    {
      id: 'today-weight',
      title: "Today's Weight",
      value: `${stats.todayWeight.toLocaleString()} KG`,
      icon: FiWeight,
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      description: "Today's weight",
      gradientColors: ['#8b5cf6', '#7c3aed'],
      iconBg: '#8b5cf6'
    },
    {
      id: 'today-avg-efficiency',
      title: "Today's Avg Efficiency",
      value: `${stats.todayAvgEfficiency.toFixed(2)}%`,
      icon: FiActivity,
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: "Today's average efficiency",
      gradientColors: ['#10b981', '#059669'],
      iconBg: '#10b981'
    }
  ];

  // Render loading state
  if (loading && records.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <h3>Loading Spiral Section Data...</h3>
        <p className="loading-subtext">Fetching records from database</p>
      </div>
    );
  }

  return (
    <div className="spiral-container">
      {/* Database Status Banner */}
      {!isSupabaseConnected && (
        <div className="database-alert">
          <FiAlertCircle size={20} />
          <div>
            <strong>Supabase Connection Issue</strong>
            <div className="alert-subtext">
              Check your .env file for REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="header-section">
        <div>
          <div className="breadcrumb-nav">
            <button
              onClick={() => navigate('/dashboard')}
              className="breadcrumb-btn"
            >
              <FiHome size={16} /> Dashboard
            </button>
            <button
              onClick={() => navigate('/production')}
              className="breadcrumb-btn secondary"
            >
              <FiGrid size={16} /> Production Sections
            </button>
          </div>
          <div className="title-section">
            <div className="title-icon">
              <FiColumns size={28} />
            </div>
            <div>
              <h1 className="page-title">
                Spiral Section
                <div className={`connection-badge ${isSupabaseConnected ? 'connected' : 'offline'}`}>
                  {isSupabaseConnected ? (
                    <>
                      <FiCheckCircle size={10} /> Connected
                    </>
                  ) : (
                    <>
                      <FiXCircle size={10} /> Offline
                    </>
                  )}
                </div>
              </h1>
              <p className="page-subtitle">
                <FiDatabase size={14} />
                Data from: spiralsection table • Total Records: {stats.totalRecords} • By: Afsar
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            onClick={() => navigate('/production-sections/spiral/new')}
            className="primary-btn"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <FiPlus size={20} /> New Production Entry
          </button>

          <button
            onClick={handleExport}
            disabled={records.length === 0}
            className="export-btn"
          >
            <FiDownload /> Export CSV
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? (
              <>
                <div className="mini-spinner" />
                Loading...
              </>
            ) : (
              <>
                <FiRefreshCw /> Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Production Section Switcher */}
      <div className="section-switcher-card">
        <div className="bg-pattern" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)' }} />
        
        <div className="switcher-header">
          <div className="switcher-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <FiGrid size={18} />
          </div>
          <div>
            Switch Production Section
            <div className="switcher-subtitle">
              Click any section to switch instantly
            </div>
          </div>
        </div>
        
        <div className="sections-grid">
          {productionSections.map((section) => (
            <div
              key={section.id}
              className="section-card-wrapper"
              onClick={() => navigate(section.path)}
            >
              <div className={`section-card ${section.id === 'spiral' ? 'active' : ''}`}>
                <div className="section-card-highlight" />
                <div className="section-glow-right" />
                <div className="section-glow-left" />
                <div className="section-icon-container">
                  <section.icon size={22} />
                  <div className="icon-glow" />
                </div>
                <div className="section-text-content">
                  <div className="section-name">
                    {section.name}
                  </div>
                  <div className="section-hint">
                    <span>📊</span>
                    <span>Click to open section</span>
                  </div>
                </div>
                <div className="section-hover-overlay" />
              </div>
              {section.id !== 'spiral' && (
                <div className="section-bottom-shadow" />
              )}
            </div>
          ))}
        </div>
        
        <div className="switcher-footer">
          <span>
            <FiArrowUpRight size={10} /> Click any card above to navigate to that production section
          </span>
        </div>
      </div>

      {/* Today's Production Dashboard */}
      <div className="today-production-dashboard">
        <div className="section-header">
          <div className="header-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <FiCpu size={20} />
          </div>
          <div>
            <h3>Today's Production Dashboard</h3>
            <p className="section-subtitle">Spiral production overview for today • Managed by: Afsar</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Item-wise Today */}
          <div className="dashboard-section">
            <h4 className="dashboard-title">
              <FiPackage style={{ marginRight: '8px' }} />
              Item-wise Production Today
            </h4>
            <div className="dashboard-cards">
              {Object.entries(stats.itemWiseToday).length > 0 ? (
                Object.entries(stats.itemWiseToday).map(([item, data]) => (
                  <div key={item} className="dashboard-card item-card">
                    <div className="card-header">
                      <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                        <FiPackage size={14} />
                      </div>
                      <div className="card-name">{item}</div>
                    </div>
                    <div className="card-stats">
                      <div className="card-production">
                        {data.production.toFixed(0)} <span className="unit">M</span>
                      </div>
                      <div className="card-weight">
                        {data.weight.toFixed(0)} <span className="unit">KG</span>
                      </div>
                      <div className="card-efficiency">
                        {(data.count > 0 ? data.efficiency / data.count : 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <FiPackage size={24} />
                  <div>No item production today</div>
                </div>
              )}
            </div>
          </div>

          {/* Machine-wise Today */}
          <div className="dashboard-section">
            <h4 className="dashboard-title">
              <FiMachine style={{ marginRight: '8px' }} />
              Machine-wise Production Today
            </h4>
            <div className="dashboard-cards">
              {Object.entries(stats.machineWiseToday).length > 0 ? (
                Object.entries(stats.machineWiseToday).map(([machine, data]) => (
                  <div key={machine} className="dashboard-card machine-card">
                    <div className="card-header">
                      <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                        <FiMachine size={14} />
                      </div>
                      <div className="card-name">Machine {machine}</div>
                    </div>
                    <div className="card-stats">
                      <div className="card-production">
                        {data.production.toFixed(0)} <span className="unit">M</span>
                      </div>
                      <div className="card-weight">
                        {data.weight.toFixed(0)} <span className="unit">KG</span>
                      </div>
                      <div className="card-efficiency">
                        {(data.count > 0 ? data.efficiency / data.count : 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <FiMachine size={24} />
                  <div>No machine production today</div>
                </div>
              )}
            </div>
          </div>

          {/* Finished Product-wise Today */}
          <div className="dashboard-section">
            <h4 className="dashboard-title">
              <FiProduct style={{ marginRight: '8px' }} />
              Finished Product-wise Today
            </h4>
            <div className="dashboard-cards">
              {Object.entries(stats.finishedProductWiseToday).length > 0 ? (
                Object.entries(stats.finishedProductWiseToday).map(([product, data]) => (
                  <div key={product} className="dashboard-card product-card">
                    <div className="card-header">
                      <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <FiProduct size={14} />
                      </div>
                      <div className="card-name">{product}</div>
                    </div>
                    <div className="card-stats">
                      <div className="card-production">
                        {data.production.toFixed(0)} <span className="unit">M</span>
                      </div>
                      <div className="card-weight">
                        {data.weight.toFixed(0)} <span className="unit">KG</span>
                      </div>
                      <div className="card-efficiency">
                        {(data.count > 0 ? data.efficiency / data.count : 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <FiProduct size={24} />
                  <div>No finished product today</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div
            key={card.id}
            className="stat-card"
            style={{ 
              cursor: 'default',
              background: `linear-gradient(135deg, ${card.gradientColors[0]}15 0%, ${card.gradientColors[1]}05 100%)`,
              border: `1px solid ${card.gradientColors[0]}30`,
              boxShadow: `0 10px 25px ${card.gradientColors[0]}10, 0 5px 15px ${card.gradientColors[1]}05`
            }}
          >
            {/* Top Glow Effect */}
            <div 
              className="stat-card-glow"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${card.gradientColors[0]}30 50%, transparent 100%)`
              }}
            />
            
            <div className="stat-card-content">
              <div>
                <div className="stat-title">{card.title}</div>
                <div 
                  className="stat-value"
                  style={{ 
                    color: card.colorValue ? card.valueColor : card.gradientColors[0],
                    textShadow: `0 2px 4px ${card.gradientColors[0]}20`
                  }}
                >
                  {card.value}
                </div>
              </div>
              <div 
                className="stat-icon"
                style={{ 
                  background: card.color,
                  boxShadow: `0 4px 10px ${card.iconBg}40`
                }}
              >
                <card.icon size={24} />
              </div>
            </div>
            <div className="stat-description">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-header" style={{ background: '#3b82f6' }}>
          <FiFilter size={10} /> FILTERS
        </div>
        
        <div className="filter-input-group">
          <label className="filter-label">
            <FiSearch style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Search Records
          </label>
          <input
            type="text"
            placeholder="Search by item, wire, finished product, or material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-select-group">
          <label className="filter-label">
            <FiFilter style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Filter by Wire Size
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Wire Sizes</option>
            {wireSizes.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-date-group">
          <label className="filter-label">
            <FiCal style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setShowReport(!!e.target.value);
              setCurrentPage(1);
            }}
            max={new Date().toISOString().split('T')[0]}
            className="filter-date"
          />
        </div>

        <div className="filter-buttons">
          <button
            onClick={() => {
              if (!filterDate) {
                alert('Please select a date first to generate report');
                return;
              }
              setShowReport(true);
            }}
            className="report-btn"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            <FiBarChart2 /> Generate Report
          </button>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterDate('');
              setShowReport(false);
              setCurrentPage(1);
            }}
            className="clear-btn"
          >
            <FiX /> Clear Filters
          </button>
        </div>
      </div>

      {/* Report Section */}
      {showReport && reportData && (
        <div className="report-section">
          <div className="report-bg-pattern" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)' }} />
          
          <div className="report-header">
            <div>
              <h2>Spiral Section Production Report</h2>
              <div className="report-date">
                {reportData.formattedDate}
                <div style={{ fontSize: '14px', color: '#3b82f6', marginTop: '5px' }}>
                  Report Generated by: <strong>Afsar</strong>
                </div>
              </div>
            </div>
            <div className="report-actions">
              <button
                onClick={handlePrintReport}
                className="print-btn"
                style={{ background: '#3b82f6' }}
              >
                <FiPrinter /> Print Report
              </button>
              <button
                onClick={handleExportReport}
                className="export-report-btn"
                style={{ background: '#3b82f6' }}
              >
                <FiDownload /> Export Report
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="close-report-btn"
              >
                Close
              </button>
            </div>
          </div>

          {/* Item-wise Summary */}
          {Object.keys(reportData.itemWise).length > 0 && (
            <div className="item-report-section">
              <h3>Item-wise Summary</h3>
              <div className="item-report-grid">
                {Object.entries(reportData.itemWise).map(([item, data]) => (
                  <div key={item} className="item-report-card">
                    <div className="item-report-header">
                      <div className="item-report-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                        <FiPackage size={16} />
                      </div>
                      <div className="item-report-name">{item}</div>
                    </div>
                    <div className="item-report-stats">
                      <div className="item-report-production">
                        {data.production.toFixed(2)} M
                      </div>
                      <div className="item-report-weight">
                        {data.weight.toFixed(2)} KG
                      </div>
                      <div className="item-report-efficiency">
                        {(data.count > 0 ? data.efficiency / data.count : 0).toFixed(2)}% Efficiency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wire-wise Summary */}
          {Object.keys(reportData.wireWise).length > 0 && (
            <div className="wire-report-section">
              <h3>Wire-wise Summary</h3>
              <div className="wire-report-grid">
                {Object.entries(reportData.wireWise).map(([wire, data]) => (
                  <div key={wire} className="wire-report-card">
                    <div className="wire-report-header">
                      <div className="wire-report-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <FiZap size={16} />
                      </div>
                      <div className="wire-report-name">{wire}</div>
                    </div>
                    <div className="wire-report-stats">
                      <div className="wire-report-production">
                        {data.production.toFixed(2)} M
                      </div>
                      <div className="wire-report-weight">
                        {data.weight.toFixed(2)} KG
                      </div>
                      <div className="wire-report-efficiency">
                        {(data.count > 0 ? data.efficiency / data.count : 0).toFixed(2)}% Efficiency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finished Product-wise Summary */}
          {Object.keys(reportData.finishedProductWise).length > 0 && (
            <div className="finished-product-report-section">
              <h3>Finished Product-wise Summary</h3>
              <div className="finished-product-report-grid">
                {Object.entries(reportData.finishedProductWise).map(([product, data]) => (
                  <div key={product} className="finished-product-report-card">
                    <div className="finished-product-report-header">
                      <div className="finished-product-report-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <FiProduct size={16} />
                      </div>
                      <div className="finished-product-report-name">{product}</div>
                    </div>
                    <div className="finished-product-report-stats">
                      <div className="finished-product-report-production">
                        {data.production.toFixed(2)} M
                      </div>
                      <div className="finished-product-report-weight">
                        {data.weight.toFixed(2)} KG
                      </div>
                      <div className="finished-product-report-efficiency">
                        {(data.count > 0 ? data.efficiency / data.count : 0).toFixed(2)}% Efficiency
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="report-summary">
            <h3>Summary</h3>
            
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-label">Total Production</div>
                <div className="summary-value production-value">
                  {reportData.totalProduction.toFixed(2)} M
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Total Weight</div>
                <div className="summary-value weight-value">
                  {reportData.totalWeight.toFixed(2)} KG
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Average Efficiency</div>
                <div className="summary-value efficiency-value">
                  {reportData.avgEfficiency.toFixed(2)}%
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Total Records</div>
                <div className="summary-value records-value">
                  {reportData.recordCount}
                </div>
              </div>
            </div>
          </div>

          <div className="report-footer">
            Report generated on {new Date().toLocaleString()} by <strong>Afsar</strong> • Data source: spiralsection table
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="records-table-section">
        <div className="table-header-section" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
          <div>
            <h3>Spiral Production Records</h3>
            <div className="table-stats">
              Total: {records.length} records • Showing: {filteredRecords.length} filtered • Page: {currentPage}/{totalPages}
              <div style={{ fontSize: '12px', marginTop: '3px' }}>Managed by: Afsar</div>
            </div>
          </div>
          <div className="database-status">
            <div className={`status-indicator ${isSupabaseConnected ? 'connected' : 'offline'}`} />
            {isSupabaseConnected ? 'Database Connected' : 'Database Offline'}
          </div>
        </div>

        {loading ? (
          <div className="loading-records">
            <div className="table-spinner" />
            Loading records from spiralsection...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="empty-records">
            <FiColumns size={48} />
            <div className="empty-title">No records found</div>
            <div className="empty-message">
              {searchTerm || filterDate || filterType 
                ? 'No records match your search criteria. Try adjusting your filters.'
                : 'No spiral production records available. Create your first record to get started.'}
            </div>
            <button
              onClick={() => navigate('/production-sections/spiral/new')}
              className="create-first-btn"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
            >
              <FiPlus /> Create First Record
            </button>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="production-table">
                <thead>
                  <tr className="table-header-row">
                    <th className="table-header-cell">ID</th>
                    <th className="table-header-cell">Item Details</th>
                    <th className="table-header-cell">Material & Wire</th>
                    <th className="table-header-cell">Finished Product</th>
                    <th className="table-header-cell">Machine</th>
                    <th className="table-header-cell">Production</th>
                    <th className="table-header-cell">Weight</th>
                    <th className="table-header-cell">Efficiency</th>
                    <th className="table-header-cell">Operator & User</th>
                    <th className="table-header-cell">Shift</th>
                    <th className="table-header-cell">Date & Time</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <tr 
                      key={record.id}
                      className={`table-row ${index % 2 === 0 ? 'even' : 'odd'}`}
                    >
                      <td className="table-cell id-cell">
                        <div>#{record.id}</div>
                        {record.item_code && (
                          <div className="item-code">Code: {record.item_code}</div>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="item-info">
                          <div className="item-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                            <FiPackage size={16} />
                          </div>
                          <div>
                            <div className="item-name">
                              {record.item_name || 'N/A'}
                            </div>
                            <div className="item-details">
                              Size: {record.raw_material_flatsize || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="material-wire-badge">
                          <div className="material-type">
                            {record.material_type || 'N/A'}
                          </div>
                          <div className="wire-size">
                            <FiZap size={10} style={{ marginRight: '4px' }} />
                            {record.wire_size || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="finished-product-badge">
                          {record.finishedproductname || 'N/A'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="machine-badge">
                          <div className="machine-info">
                            <FiMachine size={12} style={{ marginRight: '4px' }} />
                            {record.machine_no || 'N/A'}
                          </div>
                          {record.machine_id && (
                            <div className="machine-id">
                              ID: {record.machine_id}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell production-cell">
                        <div className="production-badge">
                          <div className="production-value">
                            {parseFloat(record.production_quantity).toLocaleString()}
                          </div>
                          <div className="production-unit">
                            {record.unit || 'Meter'}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell weight-cell">
                        <div className="weight-badge">
                          <div className="weight-value">
                            {parseFloat(record.weight || 0).toLocaleString()}
                          </div>
                          <div className="weight-unit">
                            KG
                          </div>
                          {record.per_meter_wt && (
                            <div className="per-meter-wt">
                              {parseFloat(record.per_meter_wt).toFixed(2)} KG/M
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="efficiency-badge">
                          <div className="efficiency-value">
                            {parseFloat(record.efficiency || 0).toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="operator-user-info">
                          <div className="operator-avatar" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                            {record.operator_name?.charAt(0) || 'O'}
                          </div>
                          <div>
                            <div className="operator-name">
                              {record.operator_name || 'Unknown'}
                            </div>
                            <div className="user-name">
                              User: {record.users_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="shift-badge">
                          <div className="shift-info">
                            {record.shift_name || 'N/A'} 
                            {record.shift_code && (
                              <div className="shift-code">
                                Code: {record.shift_code}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="datetime-badge">
                          <div className="date-part">
                            <FiCalendar size={12} />
                            {new Date(record.created_at).toLocaleDateString('en-GB')}
                          </div>
                          <div className="time-part">
                            <FiClock size={10} />
                            {new Date(record.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell actions-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleView(record.id)}
                            className="view-btn"
                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                          >
                            <FiEye size={12} /> View
                          </button>
                          <button
                            onClick={() => handleEdit(record.id)}
                            className="edit-btn"
                          >
                            <FiEdit size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="delete-btn"
                          >
                            <FiTrash2 size={12} /> Delete
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
              <div className="pagination-section">
                <div className="pagination-info">
                  Page {currentPage} of {totalPages} • Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRecords.length)} of {filteredRecords.length} records
                </div>
                <div className="pagination-controls">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`pagination-btn prev ${currentPage === 1 ? 'disabled' : ''}`}
                  >
                    <FiChevronLeft /> Previous
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
                          style={currentPage === pageNum ? { background: '#3b82f6', borderColor: '#2563eb' } : {}}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`pagination-btn next ${currentPage === totalPages ? 'disabled' : ''}`}
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="page-footer">
        <div className="footer-content">
          <div>
            <div className="footer-title">
              Spiral Section • Production Management System
            </div>
            <div className="footer-subtitle">
              Database: spiralsection table • Last updated: {new Date().toLocaleTimeString()} • Managed by: Afsar
            </div>
          </div>
          <div className="footer-status">
            <div className={`database-connection ${isSupabaseConnected ? 'connected' : 'offline'}`}>
              <div className={`connection-dot ${isSupabaseConnected ? 'connected' : 'offline'}`} />
              {isSupabaseConnected ? 'Supabase Database Connected' : 'Database Connection Issue'}
            </div>
            <div className="footer-stats">
              {stats.totalRecords} records • {stats.totalProduction} M • {stats.totalWeight} KG • {stats.avgEfficiency.toFixed(1)}% efficiency
            </div>
          </div>
        </div>
        
        <div className="footer-actions">
          <button
            onClick={() => navigate('/production-sections/spiral/new')}
            className="footer-btn add-btn"
            style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
          >
            <FiPlus size={12} /> Add New Record
          </button>
          <button
            onClick={fetchData}
            className="footer-btn refresh-footer-btn"
          >
            <FiRefreshCw size={12} /> Refresh Data
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="footer-btn dashboard-btn"
          >
            <FiTrendingUp size={12} /> View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpiralPage;